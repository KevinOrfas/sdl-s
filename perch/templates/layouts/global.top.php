<!DOCTYPE html>
<html>
  <head>
    <title>Soie de Lune</title>
    <meta charset='utf-8'>
    <!-- CSS -->
    <link href='http://fonts.googleapis.com/css?family=Lato:400,100,300,700' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Libre+Baskerville:400,700' rel='stylesheet' type='text/css'>
    <?php perch_get_css(); ?>
    <!-- Favicon -->
    <link href="/images/favicon.ico" rel='shortcut icon' type='image/x-icon'>
    <link href="/image/favicon.ico" rel='icon' type='image/x-icon'>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=0, minimal-ui">

  </head>
  <body data-spy="scroll">
   <header class="cd-header">
    <nav class="navbar navbar-default" role="navigation">
      <div class="container-boot">
        <!-- Brand and toggle get grouped for better mobile display -->
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="">
            <div class="logo">
              <img src="/perch/resources/s-logo2.png" alt="Soie de lune logo">
            </div>
          </a>
        </div>
        <div class="collapse navbar-collapse" id="navbar"> 
          <?php perch_pages_navigation(array(
          'from-path'            => '*',
          'levels'               => 0,
          // 'hide-extensions'      => true,
          // 'hide-default-doc'     => true,
          // 'flat'                 => false,
          'template'             => 'nav.html',
          'include-parent'       => true,
          // 'skip-template'        => false,
          // 'siblings'             => false,
          // 'only-expand-selected' => false,
          // 'add-trailing-slash'   => true,
          // 'navgroup'             => false,
          // 'include-hidden'       => false,
              ));
          ?>
        </div>
      </div><!-- /.container-fluid -->
    </nav>
  </header>