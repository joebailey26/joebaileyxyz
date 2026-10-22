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

// Saved uploads are not copied into the browser on startup. The editor lists them in a map outside wp-content
// (path => hash/size) and they remain in R2. The map never reaches a snapshot, but the manifest keeps its entries.
define('JOEBAILEY_CMS_VIRTUAL', '/tmp/joebailey-cms-virtual.json');
define('JOEBAILEY_CMS_WANTED', '/tmp/joebailey-cms-wanted');

function joebailey_cms_virtual() {
    $data = file_exists(JOEBAILEY_CMS_VIRTUAL) ? json_decode(file_get_contents(JOEBAILEY_CMS_VIRTUAL), true) : null;
    return is_array($data) && is_array($data['files'] ?? null) ? array('origin' => (string) ($data['origin'] ?? ''), 'files' => $data['files']) : array('origin' => '', 'files' => array());
}

function joebailey_cms_media_url($origin, $hash, $name) {
    return $origin . '/media/' . $hash . '/' . substr($hash, 0, 16) . '-' . rawurlencode($name);
}

// A missing upload falls through the static-file server into WordPress. Send the browser to the public,
// content-addressed R2 endpoint, so editor screens, post content and srcset values need no URL rewriting.
if (in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', array('GET', 'HEAD'), true) && !defined('JOEBAILEY_CMS_CHECKPOINT')) {
    $joebailey_path = (string) parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    $joebailey_marker = strpos($joebailey_path, '/wp-content/uploads/');
    if ($joebailey_marker !== false) {
        $joebailey_relative = rawurldecode(substr($joebailey_path, $joebailey_marker + strlen('/wp-content/uploads/')));
        $joebailey_virtual = joebailey_cms_virtual();
        $joebailey_item = $joebailey_virtual['files']['uploads/' . $joebailey_relative] ?? null;
        if ($joebailey_item && $joebailey_virtual['origin'] !== '' && preg_match('/^[a-f0-9]{64}$/', (string) ($joebailey_item['hash'] ?? '')) && !file_exists(WP_CONTENT_DIR . '/uploads/' . $joebailey_relative)) {
            header('Location: ' . joebailey_cms_media_url($joebailey_virtual['origin'], $joebailey_item['hash'], basename($joebailey_relative)), true, 302);
            exit;
        }
    }
}

// Deleted attachments must leave the manifest. Unlinking a virtual file is a no-op, so drop its map entry here.
add_filter('wp_delete_file', function ($file) {
    $uploads = trailingslashit(wp_get_upload_dir()['basedir']);
    if (strpos($file, $uploads) === 0) {
        $virtual = joebailey_cms_virtual();
        $key = 'uploads/' . substr($file, strlen($uploads));
        if (isset($virtual['files'][$key])) {
            unset($virtual['files'][$key]);
            file_put_contents(JOEBAILEY_CMS_VIRTUAL, json_encode($virtual));
        }
    }
    return $file;
});

// Every upload file that belongs to an attachment, relative to wp-content.
function joebailey_cms_attachment_paths($id) {
    $uploads = trailingslashit(wp_get_upload_dir()['basedir']);
    $relative = array();
    foreach (array(get_attached_file($id, true), function_exists('wp_get_original_image_path') ? wp_get_original_image_path($id, true) : '') as $path) {
        if ($path && strpos($path, $uploads) === 0) {
            $relative[] = substr($path, strlen($uploads));
        }
    }
    $meta = wp_get_attachment_metadata($id, true);
    $directory = !empty($meta['file']) ? dirname($meta['file']) : '';
    $names = array();
    foreach ((array) ($meta['sizes'] ?? array()) as $size) {
        $names[] = $size['file'] ?? '';
    }
    foreach ((array) get_post_meta($id, '_wp_attachment_backup_sizes', true) as $size) {
        $names[] = is_array($size) ? ($size['file'] ?? '') : '';
    }
    $names[] = $meta['original_image'] ?? '';
    foreach ($names as $name) {
        if ($name !== '') {
            $relative[] = ($directory !== '' && $directory !== '.' ? $directory . '/' : '') . $name;
        }
    }
    return array_values(array_unique($relative));
}

// Image editing needs original pixels in the browser. PHP cannot fetch them, so request them from the editor,
// which downloads the checksum-verified files and asks the user to retry.
function joebailey_cms_require_media($id) {
    $virtual = joebailey_cms_virtual();
    $needed = array();
    foreach (joebailey_cms_attachment_paths($id) as $relative) {
        if (isset($virtual['files']['uploads/' . $relative])) {
            $needed[] = 'uploads/' . $relative;
        }
    }
    if (!$needed) {
        return true;
    }
    file_put_contents(JOEBAILEY_CMS_WANTED, json_encode($needed));
    return false;
}

const JOEBAILEY_CMS_DOWNLOADING = 'The original image is being downloaded from storage. Close the editor and open it again in a few seconds.';

add_action('admin_init', function () {
    if (!wp_doing_ajax()) {
        return;
    }
    $action = $_REQUEST['action'] ?? '';
    $id = (int) ($_REQUEST['postid'] ?? ($action === 'crop-image' ? ($_REQUEST['id'] ?? 0) : 0));
    if ($id && in_array($action, array('image-editor', 'imgedit-preview', 'crop-image'), true) && !joebailey_cms_require_media($id)) {
        wp_die(esc_html(JOEBAILEY_CMS_DOWNLOADING));
    }
});

add_filter('rest_request_before_callbacks', function ($response, $handler, $request) {
    if (preg_match('#^/wp/v2/media/(\d+)/edit$#', $request->get_route(), $match) && !joebailey_cms_require_media((int) $match[1])) {
        return new WP_Error('joebailey_media_downloading', JOEBAILEY_CMS_DOWNLOADING, array('status' => 409));
    }
    return $response;
}, 10, 3);

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
        'virtual' => joebailey_cms_virtual()['files'],
        'links' => $links,
        'dirtyToken' => file_exists('/tmp/joebailey-cms-dirty') ? file_get_contents('/tmp/joebailey-cms-dirty') : ''
    );
}

// Site Health: drop checks that cannot apply to WordPress running in a browser tab with no web server,
// outbound networking, WP-Cron, page cache or updater. Core and plugin updates are managed by pinned runtime upgrades.
add_filter('site_status_tests', function ($tests) {
    foreach (array('background_updates', 'loopback_requests', 'https_status', 'dotorg_communication', 'authorization_header', 'scheduled_events', 'persistent_object_cache', 'page_cache', 'available_updates_disk_space') as $test) {
        unset($tests['direct'][$test], $tests['async'][$test]);
    }
    return $tests;
});
