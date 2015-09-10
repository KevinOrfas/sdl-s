<?php
    define('PERCH_LICENSE_KEY', 'P21507-FML881-RHY572-FNQ088-ZLD011');

    define("PERCH_DB_USERNAME", 'root');
    define("PERCH_DB_PASSWORD", 'root');
    define("PERCH_DB_SERVER", "localhost");
    define("PERCH_DB_DATABASE", "soiedelun_perch");
    define("PERCH_DB_PREFIX", "perch2_");

    define('PERCH_TZ', 'Europe/London');

    define('PERCH_EMAIL_FROM', 'anastasios.orfanidis@gmail.com');
    define('PERCH_EMAIL_FROM_NAME', 'Anastasios Orfanidis');

    define('PERCH_LOGINPATH', '/perch');
    define('PERCH_PATH', str_replace(DIRECTORY_SEPARATOR.'config', '', __DIR__));
    define('PERCH_CORE', PERCH_PATH.DIRECTORY_SEPARATOR.'core');

    define('PERCH_RESFILEPATH', PERCH_PATH . DIRECTORY_SEPARATOR . 'resources');
    define('PERCH_RESPATH', PERCH_LOGINPATH . '/resources');

    define('PERCH_HTML5', true);
