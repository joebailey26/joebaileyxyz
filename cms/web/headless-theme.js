import stylesheet from '../wordpress/themes/joebailey-headless/style.css';
import functions from '../wordpress/themes/joebailey-headless/functions.php';
import index from '../wordpress/themes/joebailey-headless/index.php';

export const HEADLESS_THEME = 'joebailey-headless';
export const headlessThemeFiles = { 'style.css': stylesheet, 'functions.php': functions, 'index.php': index };
export const isRetiredThemeFile = path => path.startsWith('themes/twentytwentyfive/');
