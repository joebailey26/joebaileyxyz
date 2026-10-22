<?php
/** Import a complete WXR-derived migration bundle through WordPress APIs. */
function joebailey_cms_import($path) {
    $data = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
    if (!isset($data['version']) || $data['version'] !== 1 || !isset($data['posts']) || !is_array($data['posts'])) {
        throw new RuntimeException('Unsupported migration bundle');
    }
    if (!empty($data['acf'])) {
        if (!function_exists('acf_import_field_group')) {
            // Files have just been copied but the active plugin list is still from the new install.
            $acf_file = WP_PLUGIN_DIR . '/advanced-custom-fields/acf.php';
            if (!file_exists($acf_file)) {
                $acf_file = WP_PLUGIN_DIR . '/advanced-custom-fields-pro/acf.php';
            }
            if (file_exists($acf_file)) {
                require_once $acf_file;
            }
        }
        if (!function_exists('acf_import_field_group')) {
            throw new RuntimeException('ACF definitions were supplied but the ACF plugin is missing from the migration files');
        }
        foreach ($data['acf'] as $group) {
            acf_import_field_group($group);
        }
        $relative = strpos($acf_file ?? '', 'advanced-custom-fields-pro') !== false ? 'advanced-custom-fields-pro/acf.php' : 'advanced-custom-fields/acf.php';
        $active = (array) get_option('active_plugins', array());
        if (!in_array($relative, $active, true)) {
            $active[] = $relative;
            update_option('active_plugins', $active);
        }
    }
    $users = array();
    foreach ($data['authors'] as $author) {
        $login = sanitize_user($author['login'], true);
        if (!$login) {
            continue;
        }
        $user = get_user_by('login', $login);
        if (!$user) {
            $id = wp_insert_user(array('user_login' => $login, 'user_pass' => wp_generate_password(48), 'display_name' => $author['displayName'], 'role' => 'author'));
            if (is_wp_error($id)) {
                throw new RuntimeException($id->get_error_message());
            }
            $users[$login] = $id;
        } else {
            $users[$login] = $user->ID;
        }
    }
    $terms = array_merge($data['categories'], $data['tags']);
    foreach ($terms as $term) {
        if (!term_exists($term['slug'], $term['taxonomy'])) {
            $created = wp_insert_term($term['name'], $term['taxonomy'], array('slug' => $term['slug']));
            if (is_wp_error($created)) {
                throw new RuntimeException($created->get_error_message());
            }
        }
    }
    foreach ($terms as $term) {
        if (!empty($term['parent'])) {
            $child = get_term_by('slug', $term['slug'], $term['taxonomy']);
            $parent = get_term_by('slug', $term['parent'], $term['taxonomy']);
            if ($child && $parent) {
                wp_update_term($child->term_id, $term['taxonomy'], array('parent' => $parent->term_id));
            }
        }
    }
    $ids = array();
    $urls = array();
    foreach ($data['posts'] as $source) {
        $existing = get_posts(array('post_type' => 'any', 'post_status' => 'any', 'meta_key' => '_joebailey_source_id', 'meta_value' => (string) $source['id'], 'posts_per_page' => 1, 'fields' => 'ids'));
        if (!post_type_exists($source['type'])) {
            register_post_type($source['type'], array('public' => false, 'show_ui' => true, 'supports' => array('title', 'editor', 'custom-fields')));
        }
        $post = array(
            'post_type' => $source['type'], 'post_status' => $source['status'], 'post_name' => $source['slug'],
            'post_title' => $source['title'], 'post_content' => $source['content'], 'post_excerpt' => $source['excerpt'],
            'post_date' => $source['date'], 'post_date_gmt' => $source['dateGmt'],
            'post_author' => $users[$source['author']] ?? 1
        );
        if ($existing) {
            $post['ID'] = $existing[0];
        }
        $id = wp_insert_post(wp_slash($post), true);
        if (is_wp_error($id)) {
            throw new RuntimeException($id->get_error_message());
        }
        $ids[$source['id']] = $id;
        update_post_meta($id, '_joebailey_source_id', (string) $source['id']);
        $cleared = array();
        foreach ($source['meta'] as $meta) {
            if (!in_array($meta['key'], array('_edit_lock', '_edit_last', '_thumbnail_id', '_joebailey_source_id'), true)) {
                // WXR carries serialized custom fields; WordPress APIs handle serialization once.
                if (!isset($cleared[$meta['key']])) {
                    delete_post_meta($id, $meta['key']);
                    $cleared[$meta['key']] = true;
                }
                add_post_meta($id, $meta['key'], wp_slash(maybe_unserialize($meta['raw'])));
            }
        }
        foreach (array('category', 'post_tag') as $taxonomy) {
            $assigned = array();
            foreach ($source['categories'] as $term) {
                if ($term['taxonomy'] !== $taxonomy) {
                    continue;
                }
                $local = get_term_by('slug', $term['slug'], $taxonomy);
                if (!$local) {
                    $created = wp_insert_term($term['name'], $taxonomy, array('slug' => $term['slug']));
                    if (is_wp_error($created)) {
                        throw new RuntimeException($created->get_error_message());
                    }
                    $assigned[] = $created['term_id'];
                } else {
                    $assigned[] = $local->term_id;
                }
            }
            wp_set_object_terms($id, array_map('intval', $assigned), $taxonomy);
        }
        if ($source['type'] === 'attachment') {
            $attached = get_post_meta($id, '_wp_attached_file', true);
            $uploads = wp_upload_dir();
            $file = $uploads['basedir'] . '/' . $attached;
            if (!$attached || !file_exists($file)) {
                throw new RuntimeException('Missing attachment file: ' . $attached);
            }
            // Older backups can omit generated sizes. Never advertise nonexistent srcset files.
            $metadata = wp_get_attachment_metadata($id);
            if (is_array($metadata)) {
                foreach ($metadata['sizes'] ?? array() as $size => $details) {
                    if (empty($details['file']) || !is_file(dirname($file) . '/' . $details['file'])) {
                        unset($metadata['sizes'][$size]);
                    }
                }
                if (!empty($metadata['original_image']) && !is_file(dirname($file) . '/' . $metadata['original_image'])) {
                    unset($metadata['original_image']);
                }
                wp_update_attachment_metadata($id, $metadata);
            }
            $mime = wp_check_filetype($file);
            wp_update_post(array('ID' => $id, 'post_mime_type' => $mime['type'], 'guid' => $uploads['baseurl'] . '/' . $attached));
            $urls[$source['attachmentUrl']] = $uploads['baseurl'] . '/' . $attached;
        } elseif (!empty($source['url'])) {
            $urls[$source['url']] = get_permalink($id);
        }
    }
    // Replace upload base URLs too, covering thumbnail variants and Gutenberg JSON attributes.
    $uploads = wp_upload_dir();
    foreach ($data['uploadBases'] ?? array() as $base) {
        $urls[$base] = $uploads['baseurl'] . '/';
    }
    foreach ($data['posts'] as $source) {
        if ($source['type'] === 'attachment' && strpos($source['attachmentUrl'], '/wp-content/uploads/') !== false) {
            $urls[explode('/wp-content/uploads/', $source['attachmentUrl'])[0] . '/wp-content/uploads/'] = $uploads['baseurl'] . '/';
        }
    }
    uksort($urls, function ($a, $b) { return strlen($b) - strlen($a); });
    foreach ($data['posts'] as $source) {
        $id = $ids[$source['id']];
        $thumbnail = null;
        foreach ($source['meta'] as $meta) {
            if ($meta['key'] === '_thumbnail_id') {
                $thumbnail = $ids[(int) $meta['raw']] ?? null;
            }
        }
        if ($thumbnail) {
            update_post_meta($id, '_thumbnail_id', $thumbnail);
        }
        $content = strtr($source['content'], $urls);
        $content = preg_replace_callback('/\bwp-image-(\d+)\b/', function ($match) use ($ids) { return 'wp-image-' . ($ids[(int) $match[1]] ?? $match[1]); }, $content);
        $blocks = parse_blocks($content);
        $rewrite_blocks = function (&$blocks) use (&$rewrite_blocks, $ids) {
            foreach ($blocks as &$block) {
                if (in_array($block['blockName'], array('core/image', 'core/gallery', 'core/media-text', 'core/video', 'core/audio', 'core/cover', 'core/file'), true)) {
                    foreach (array('id', 'mediaId') as $key) {
                        if (isset($block['attrs'][$key], $ids[$block['attrs'][$key]])) {
                            $block['attrs'][$key] = $ids[$block['attrs'][$key]];
                        }
                    }
                    if (isset($block['attrs']['ids']) && is_array($block['attrs']['ids'])) {
                        $block['attrs']['ids'] = array_map(function ($id) use ($ids) { return $ids[$id] ?? $id; }, $block['attrs']['ids']);
                    }
                }
                $rewrite_blocks($block['innerBlocks']);
            }
        };
        $rewrite_blocks($blocks);
        wp_update_post(wp_slash(array('ID' => $id, 'post_parent' => $ids[$source['parent']] ?? 0, 'post_content' => serialize_blocks($blocks), 'post_excerpt' => strtr($source['excerpt'], $urls))));
    }
    return array('posts' => count($data['posts']), 'media' => count(array_filter($data['posts'], function ($post) { return $post['type'] === 'attachment'; })));
}
