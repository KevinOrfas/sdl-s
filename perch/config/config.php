<?php
    define('PERCH_LICENSE_KEY', 'P21507-FML881-RHY572-FNQ088-ZLD011');

    define("PERCH_DB_USERNAME", 'soiedelu_kevin');
    define("PERCH_DB_PASSWORD", 'fymynu9i');
    define("PERCH_DB_SERVER", "localhost");
    define("PERCH_DB_DATABASE", "soiedelu_perch");
    define("PERCH_DB_PREFIX", "perch2_");

    define('PERCH_TZ', 'Europe/London');

    define('PERCH_EMAIL_FROM', 'm.fernandes@thelastblackcat.com');
    define('PERCH_EMAIL_FROM_NAME', 'Malcolm Fernandes');

    define('PERCH_LOGINPATH', '/perch');
    define('PERCH_PATH', str_replace(DIRECTORY_SEPARATOR.'config', '', __DIR__));
    define('PERCH_CORE', PERCH_PATH.DIRECTORY_SEPARATOR.'core');

    define('PERCH_RESFILEPATH', PERCH_PATH . DIRECTORY_SEPARATOR . 'resources');
    define('PERCH_RESPATH', PERCH_LOGINPATH . '/resources');

    define('PERCH_HTML5', true);
