/**
 * This file contains all globally scoped content that is accessed by JS
 * scripts and components. This file should be used rarely to avoid polluting
 * the global scope.
 * 
 * NOTE: This file should always be imported before JS files to prevent
 * undefined variable errors.
 */

CONNECTION_API = '/api/connections';

$TAB_MENU = document.querySelector('tab-menu');
$SIDE_MENU = document.querySelector('side-menu');
$HOME_TAB = document.querySelector('home-tab');