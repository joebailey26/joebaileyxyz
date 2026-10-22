<?php
/**
 * Plugin Name: Joe Bailey browser CMS
 * Description: Checkpoint notifications, headless project fields and database export.
 */

if (!defined('ABSPATH')) {
    exit;
}

if (file_exists('/tmp/joebailey-cms-lock') && !defined('JOEBAILEY_CMS_CHECKPOINT')) {
    http_response_code(503);
    header('Retry-After: 3');
    exit('Saving a consistent checkpoint. Retry this request in a moment.');
}

add_action('init', function () {
    if (!isset($_GET['joebailey_cms_login'])) {
        return;
    }
    $path = '/tmp/joebailey-cms-login';
    if (!file_exists($path) || !hash_equals(file_get_contents($path), (string) $_GET['joebailey_cms_login'])) {
        status_header(403);
        exit('Invalid local login token');
    }
    unlink($path);
    $users = get_users(array('role' => 'administrator', 'number' => 1));
    if (!$users) {
        status_header(403);
        exit('No WordPress administrator in backup');
    }
    wp_set_auth_cookie($users[0]->ID, true);
    echo 'Logged in';
    exit;
});

// A token outside wp-content survives PHP request boundaries, without being backed up.
add_filter('query', function ($query) {
    if (!defined('JOEBAILEY_CMS_CHECKPOINT') && preg_match('/^\s*(INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP)\b/i', $query)) {
        file_put_contents('/tmp/joebailey-cms-dirty', bin2hex(random_bytes(12)));
    }
    return $query;
});

// Preserve source ACF fields. Also offer a small native editor when ACF is absent.
add_action('add_meta_boxes', function () {
    if (function_exists('acf_add_local_field_group')) {
        return;
    }
    add_meta_box('joebailey-project', 'Project details', function ($post) {
        wp_nonce_field('joebailey_project', 'joebailey_project_nonce');
        foreach (array('project_url' => 'Project URL', 'github' => 'Repository URL') as $key => $label) {
            echo '<p><label>' . esc_html($label) . '<br><input style="width:100%" type="url" name="joebailey_' . esc_attr($key) . '" value="' . esc_attr(get_post_meta($post->ID, $key, true)) . '"></label></p>';
        }
        $selected = (array) get_post_meta($post->ID, 'icons', true);
        echo '<p>Technology icons</p>';
        foreach (array('Firebase', 'PHP', 'Vue', 'React', 'WordPress', 'Figma', 'Netlify', 'XD', 'InDesign', 'Custom') as $icon) {
            echo '<label style="display:inline-block;margin-right:12px"><input type="checkbox" name="joebailey_icons[]" value="' . esc_attr($icon) . '" ' . checked(in_array($icon, $selected, true), true, false) . '>' . esc_html($icon) . '</label>';
        }
    }, 'post');
});

add_action('save_post_post', function ($post_id) {
    if (!isset($_POST['joebailey_project_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['joebailey_project_nonce'])), 'joebailey_project') || !current_user_can('edit_post', $post_id) || wp_is_post_revision($post_id)) {
        return;
    }
    foreach (array('project_url', 'github') as $key) {
        if (isset($_POST['joebailey_' . $key])) {
            update_post_meta($post_id, $key, esc_url_raw(wp_unslash($_POST['joebailey_' . $key])));
        }
    }
    $icons = isset($_POST['joebailey_icons']) ? array_map('sanitize_text_field', (array) wp_unslash($_POST['joebailey_icons'])) : array();
    update_post_meta($post_id, 'icons', $icons);
});

function joebailey_cms_database_path() {
    global $wpdb;
    if (method_exists($wpdb, 'get_driver')) {
        $driver = $wpdb->get_driver();
        if (method_exists($driver, 'get_sqlite_pdo')) {
            $rows = $driver->get_sqlite_pdo()->query('PRAGMA database_list')->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as $row) {
                if ($row['name'] === 'main') {
                    return $row['file'];
                }
            }
        }
    }
    if (defined('FQDB')) {
        return FQDB;
    }
    if (defined('DB_DIR') && defined('DB_FILE')) {
        return rtrim(DB_DIR, '/') . '/' . DB_FILE;
    }
    throw new RuntimeException('Cannot locate the Playground SQLite database');
}

function joebailey_cms_capture($config) {
    global $wp_version;
    $records = array();
    $links = array();
    foreach (array('blog' => $config['blogCategory'], 'projects' => $config['projectsCategory']) as $section => $slug) {
        $term = get_term_by('slug', $slug, 'category');
        if (!$term) {
            throw new RuntimeException('Missing category: ' . $slug . '. Configure category slugs before syncing.');
        }
        $posts = get_posts(array('post_type' => 'post', 'post_status' => 'publish', 'posts_per_page' => -1, 'cat' => $term->term_id, 'orderby' => 'date', 'order' => 'DESC'));
        foreach ($posts as $post) {
            $links[get_permalink($post)] = 'https://joebailey.xyz/' . $section . '/' . $post->post_name . '/';
            $links[site_url('/?p=' . $post->ID)] = 'https://joebailey.xyz/' . $section . '/' . $post->post_name . '/';
            $GLOBALS['post'] = $post;
            setup_postdata($post);
            $fields = function_exists('get_fields') ? (get_fields($post->ID) ?: array()) : array();
            foreach (array('icons', 'project_url', 'github') as $key) {
                if (!isset($fields[$key])) {
                    $fields[$key] = get_post_meta($post->ID, $key, true);
                }
            }
            $fields = array_intersect_key($fields, array_flip(array('icons', 'project_url', 'github')));
            $records[] = array(
                'id' => $post->ID, 'section' => $section, 'status' => 'publish',
                'slug' => $post->post_name, 'date' => $post->post_date,
                'title' => array('rendered' => get_the_title($post)),
                'excerpt' => array('rendered' => apply_filters('the_excerpt', get_the_excerpt($post))),
                'content' => array('rendered' => apply_filters('the_content', $post->post_content)),
                'acf' => $fields,
                'featured_media_url' => get_the_post_thumbnail_url($post, 'full') ?: null
            );
        }
        wp_reset_postdata();
    }
    // WP REST dates contain T. Keep the source's local publication date/time.
    foreach ($records as &$record) {
        $record['date'] = str_replace(' ', 'T', $record['date']);
    }
    unset($record);
    $inventory = array();
    $root = WP_CONTENT_DIR;
    foreach (array('uploads', 'plugins', 'themes', 'mu-plugins', 'languages') as $directory) {
        if (!is_dir($root . '/' . $directory)) {
            continue;
        }
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/' . $directory, FilesystemIterator::SKIP_DOTS));
        foreach ($iterator as $file) {
            if ($file->isFile() && !$file->isLink()) {
                $relative = substr($file->getPathname(), strlen($root) + 1);
                if (strpos($relative, 'mu-plugins/joebailey-cms') === 0 || preg_match('#^mu-plugins/(0-playground\.php|sqlite-database-integration)(/|$)#', $relative)) {
                    continue;
                }
                $inventory[] = array('path' => $relative, 'size' => $file->getSize());
            }
        }
    }
    $path = joebailey_cms_database_path();
    $target = '/tmp/joebailey-cms.sqlite';
    if (file_exists($target)) {
        unlink($target);
    }
    // VACUUM INTO is a consistent database backup, including committed WAL contents.
    $pdo = new PDO('sqlite:' . $path);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("VACUUM INTO '" . str_replace("'", "''", $target) . "'");
    $uploads = wp_upload_dir();
    return array(
        'wordpress' => $wp_version,
        'databasePath' => $path,
        'files' => $inventory,
        'records' => $records,
        'uploadBase' => $uploads['baseurl'],
        'siteUrl' => site_url(),
        'links' => $links,
        'dirtyToken' => file_exists('/tmp/joebailey-cms-dirty') ? file_get_contents('/tmp/joebailey-cms-dirty') : ''
    );
}
