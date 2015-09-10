<?php include('perch/runtime.php'); ?>
<!DOCTYPE html>
<html>
  <head>
    <title>Soie de Lune</title>
    <meta charset='utf-8'>
    <!-- CSS -->
    <link href='http://fonts.googleapis.com/css?family=Lato:400,100,300,700' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Libre+Baskerville:400,700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="assets/styles/app.css">

    <!-- Favicon -->
    <link href="/images/favicon.ico" rel='shortcut icon' type='image/x-icon'>
    <link href="/image/favicon.ico" rel='icon' type='image/x-icon'>


    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=0, minimal-ui">

    <!-- Normal Meta -->
    <meta name="description" content="Bespoke fabric for interior design world">
    <meta name="keywords" content="fabric, soie de lune, hand-wooven, interior desingn, soft furnishing">
    <meta name="robots" content="index,follow">

    <!-- Facebook Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Soie de Lune - Bespoke fabric for the interior design world">
    <meta property="og:image" content="">
    <meta property="og:description" content="Luxurious silks">
    <meta property="og:url" content="http://www.soiedelune.com">
    <meta property="og:site_name" content="soiedelune">

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
            <a class="navbar-brand" href="#">
              <div class="logo">
                <img src="assets/images/S-logo2.png" alt="Soie de lune logo">
              </div>
            </a>
          </div>
          <!-- social media icons -->
          <div class="collapse navbar-collapse" id="navbar">
            <ul class="nav navbar-nav navbar-right">
               <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Fabrics <span class="caret"></span></a>
                <ul class="dropdown-menu">
                  <li><a href="#">Hand–woven Bespoke</a></li>
                  <li><a href="#">Plain Fabric</a></li>
                  <li><a href="#">Rice paper silk &ndash; Sheers</a></li>

                  <li><a href="#">It’s covered &ndash; Fabric in use</a></li>

                  <li><a href="#">Mood boards &amp; bespoke panels</a></li>
                  <li><a href="#">Buy me now &ndash; Stocked Fabrics</a></li>
                </ul>
              </li>
              <li><a href="#story">Our story</a></li>
              <li><a href="#weaving">Weaving</a></li>
              <li><a href="#lexicon">Lexicon</a></li>
              <li><a href="#touch">Get in touch</a></li>
              <li><a href="#"><i class="fa fa-facebook"></i></a></li>
              <li><a href="#"><i class="fa fa-flickr"></i></a></li>
              <li><a href="#"><i class="fa fa-instagram"></i></a></li>
            </ul>
          </div>

        </div><!-- /.container-fluid -->
      </nav>
    </header>

    <div id="myCarousel" class="carousel slide" data-ride="carousel" data-interval="5000">
      <!-- Wrapper for slides -->
      <div class="carousel-inner" role="listbox">
        <div class="item active carousel-background--one"></div>
        <div class="item carousel-background--two"></div>
        <div class="item carousel-background--three"></div>
        <h2 class="carousel-caption">
          <?php perch_content('Intro'); ?>

        </h2>
      </div>

      <!-- Controls -->
      <a class="left carousel-control" href="#myCarousel" role="button" data-slide="prev">
        <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
        <span class="sr-only">Previous</span>
      </a>
      <a class="right carousel-control" href="#myCarousel" role="button" data-slide="next">
        <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
        <span class="sr-only">Next</span>
      </a>
    </div>



    <section class="section section--fabric" id="fabric">
      <div class="container-boot">
        <div class="row">
          <div class="col-md-12">
            <h1 class="section__heading">Fabric</h1>
            <p class="section__blurb">With a meticulous approach our skilled hand-weavers work to your specifcation to create works of art from fabric. Soie de Lune based in London hand-weaves silk &amp; linen at our workshop in Vientiane, Laos. We use only the fnest threads creating fabric with designs based on the traditional geometric patterns of the area. Furthermore we collaborate with respected European yarn manufacturers and contract weavers to recreate our designs in diferent textures by harnessing their expertise.</p>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4">
            <div class="cont-img">
              <img src="assets/images/L_5149.jpg" alt="Hand woven silks">
            </div>
            <h4 class="fabric-link">Hand&ndash;woven Bespoke</h4>
          </div>
          <div class="col-md-4">
            <div class="cont-img">
              <img src="assets/images/plain-fabric.jpg" alt="Plain fabric">
            </div>
            <h4 class="fabric-link">Plain Fabric</h4>
          </div>
          <div class="col-md-4">
            <div class="cont-img">
              <img src="assets/images/L_5061.jpg" alt="Rice paper silk – Sheers">
            </div>
            <h4 class="fabric-link">Rice paper silk &ndash; Sheers</h4>
          </div>
          <div class="col-md-4">
            <div class="cont-img">
              <img src="assets/images/Orchid_detail.jpg" alt="It’s covered – Fabric in use">
            </div>
            <h4 class="fabric-link">It’s covered &ndash; Fabric in use</h4>
          </div>
          <div class="col-md-4">
            <div class="cont-img">
              <img src="assets/images/L_2578.jpg" alt="Mood boards &amp; bespoke panels">
            </div>
            <h4 class="fabric-link">Mood boards &amp; bespoke panels</h4>
          </div>
          <div class="col-md-4">
            <div class="cont-img">
              <img src="assets/images/L_0536.jpg" alt="Buy me now – Stocked Fabrics">
            </div>
            <h4 class="fabric-link">Buy me now &ndash; Stocked Fabrics</h4>
          </div>
        </div>
      </div>
    </section>


    <section class="section section--story"  id="story">
      <div class="container-boot">
        <div class="row">
          <div class="col-md-12">
            <h1 class="section__heading section__heading--rev">Our Story</h1>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 col-xs-12 col-sm-6">
            <a href=""><h4 class="story-link">The Company</h4></a>
            <p class="section__blurb section__blurb--rev">
              Soie de Lune is a London-based company that was founded in 2004. It has its own workshop in Vientiane, Laos, a country in South East Asia famous for its hand weaving skills. <a class="read-more" href="">Read more</a>
            </p>
          </div>
          <div class="col-md-6 col-xs-12 col-sm-6">
            <a href="" style=" "><h4 class="story-link">Our Customers</h4></a>
            <p class="section__blurb section__blurb--rev">
              We count amongst our customers the world’s most renowned and creative interior designers. Each piece of woven fabric is meticulously created and is akin to a work of art. <a class="read-more" href="">Read more</a>
            </p>
          </div>
          <div class="col-md-6 col-xs-12 col-sm-6">
            <a href=""><h4 class="story-link">The tradition of hand weaving in Lao PDR (Laos)</h4></a>
            <p class="section__blurb section__blurb--rev">
              Traditional woven textiles, through the woven motifs and quality of yarn, express the beliefs and cultures of a particular society in addition to their decorative nature, color and beauty. <a class="read-more" href="">Read more</a>
            </p>

          </div>
          <div class="col-md-6 col-xs-12 col-sm-6">
            <a href=""><h4 class="story-link" >Lauren Hwang New York </h4></a>
            <p class="section__blurb section__blurb--rev">
              Our dedicate designer based in New York. <a class="read-more" href="">Visit her site</a>
            </p>
          </div>
      </div>
    </section>
    <section class="section section-weaving" id="weaving">
      <div class="container-boot">
        <div class="row">
          <div class="col-md-12">
            <h1 class="section__heading">The weaving of silk</h1>
            <!-- 16:9 aspect ratio -->
            <div class="embed-responsive embed-responsive-16by9">
              <iframe type="text/html"
                width="1150"
                height="600"
                src="http://www.youtube.com/embed/CB3l9f7ODE0"
                frameborder="0">
              </iframe>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--lexicon"  id="lexicon">
      <div class="container-boot">
        <div class="row">
          <div class="col-md-12">
              <h1 class="section__heading">Lexicon of Fabric</h1>
              <p class="section__blurb">For Soie de Lune making fabric is not only a business. An important part of our work is to reestablish the meaning of the motifs that are woven into the fabric and that we tend to see only as pretty embellishments to the cloth. Everything that we do in our own workshop and also with our esteemed weaving partners, bring together skills once common throughout world that are now disappearing because of today’s mass-market culture.</p>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3 col-xs-6">
            <div class="cont-img" data-toggle="modal" data-target="#silks">
              <img src="assets/images/lexicon/ML_5171.jpg" alt="Hand woven silks">
            </div>
            <h4 class="fabric-link" data-toggle="modal" data-target="#silks">Hand&ndash;woven Silks</h4>
          </div>
          <div class="col-md-3 col-xs-6">
              <div class="cont-img" data-toggle="modal" data-target="#sheers">
                <img src="assets/images/lexicon/monson.jpg" alt="Hand-woven Silk Sheers">
              </div>
              <h4 class="fabric-link" data-toggle="modal" data-target="#sheers">Hand&ndash;woven Silk Sheers</h4>
          </div>
          <div class="col-md-3 col-xs-6">
            <div class="cont-img" data-toggle="modal" data-target="#linen">
              <img src="assets/images/lexicon/Jasmine.jpg" alt="Hand-woven Linen">
            </div>
             <h4 class="fabric-link" data-toggle="modal" data-target="#linen">Hand&ndash;woven Linen</h4>
          </div>
          <div class="col-md-3 col-xs-6">
            <div class="cont-img" data-toggle="modal" data-target="#italian">
              <img src="assets/images/lexicon/Italian_SIlks_IMG_0425.jpg" alt="Hand-woven Italian Silk">
            </div>
            <h4 class="fabric-link" data-toggle="modal" data-target="#italian">Hand&ndash;woven Italian Silk</h4>
          </div>
          <div class="col-md-3 col-xs-6">
            <div class="cont-img" data-toggle="modal" data-target="#stocked">
              <img src="assets/images/lexicon/L_5960.jpg" alt="Stocked Hand Weaves">
            </div>
            <h4 class="fabric-link" data-toggle="modal" data-target="#stocked">Stocked Hand Weaves</h4>
          </div>
          <div class="col-md-3 col-xs-6">

            <div class="cont-img" data-toggle="modal" data-target="#linens">
                <img src="assets/images/lexicon/IMG_0922.jpg" alt="Linens &amp; Cottons">
            </div>
            <h4 class="fabric-link" data-toggle="modal" data-target="#linens">Linens &amp; Cottons</h4>
          </div>
          <div class="col-md-3 col-xs-6">

            <div class="cont-img" data-toggle="modal" data-target="#mohair">
                <img src="assets/images/lexicon/Mohair_Velvet_IMG_0981.jpg" alt="Hand woven silks">
            </div>
             <h4 class="fabric-link" data-toggle="modal" data-target="#mohair">Mohair Velvet</h4>
          </div>
          <div class="col-md-3 col-xs-6">
            <div class="cont-img" data-toggle="modal" data-target="#wool">
                <img src="assets/images/lexicon/IMG_0947.jpg" alt="Hand woven silks">
            </div>
            <h4 class="fabric-link" data-toggle="modal" data-target="#wool">Wool</h4>
          </div>
       </div>
      </div>
    </section>

    <section class="section section--where" id="touch">
      <div class="container-boot">
        <div class="row">
          <div class="col-md-12">
            <h1 class="section__heading section__heading--rev">Get In Touch</h1>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3 col-sm-6 col-xs-6">
            <address class="address">
              <h2 class="address__city">London</h2>
              <h3 class="address__company-name">Soie de Lune </h3>
              <span class="address__details">
                <strong><i class="glyphicon glyphicon-map-marker"></i></strong>
                67A Camden High Street
              </span>
              <span class="address__details">London NW1 7JL</span>
              <span class="address__details">United Kingdom</span>
              <span class="address__details">
              <strong><i class="glyphicon glyphicon-earphone"></i></strong>
                +44 7423 392 050
              </span>
              <strong><i class="glyphicon glyphicon-envelope"></i></strong>
              <a href="mailto:info@soiedelune.com">info@soiedelune.com</a><br>
              <a href="">www.soiedelune.com </a>
            </address>
          </div>

          <div class="col-md-3 col-sm-6 col-xs-6">
            <address>
              <h2 class="address__city">Paris</h2>
              <h3 class="address__company-name">Jules et Jim </h3>
              <span class="address__details">
                <strong>
                  <i class="glyphicon glyphicon-map-marker"></i>
                </strong>
                1 Rue Thérèse
              </span>
              <span class="address__details">75001 Paris </span>
              <span class="address__details">France </span>
              <span class="address__details">
                <strong> <i class="glyphicon glyphicon-earphone"></i> </strong>
                +33 1 43 14 02 10
              </span>
              <strong><i class="glyphicon glyphicon-envelope"></i></strong>
              <a href="">info@julesetjim.fr</a> <br>
              <a href="">www.julesetjim.fr </a><br>
            </address>
          </div>

          <div class="col-md-3 col-sm-6 col-xs-6">
            <address>
              <h2 class="address__city">New York</h2>
              <h3 class="address__company-name">Lauren Hwang Bespoke </h3>
              <span class="address__details">
                <strong><i class="glyphicon glyphicon-map-marker"></i></strong>
                360 Furman Street
              </span>
              <span class="address__details">Brooklyn, NY 11201 </span>
              <span class="address__details">USA</span>
              <span class="address__details">
                <strong><i class="glyphicon glyphicon-earphone"></i></strong>
                917-545-9602
              </span>
              <strong><i class="glyphicon glyphicon-envelope"></i></strong>
              <a href="">hwang.lauren@gmail.com </a><br>
              <a href="">http://laurenhwangbespoke.com/ </a>
            </address>
          </div>

          <div class="col-md-3 col-sm-6 col-xs-6">
            <address>
              <h2 class="address__city">Los Angeles  &amp; San Francisco</h2>
              <h3 class="address__company-name">Vince Jelineo </h3>
              <span class="address__details">
                <strong><i class="glyphicon glyphicon-map-marker"></i></strong>
                8811 Alden Drive Suite 6
              </span>
              <span class="address__details">Los Angeles, CA 90048</span>
              <span class="address__details">USA</span>
              <span class="address__details">
                <strong><i class="glyphicon glyphicon-earphone"></i></strong>
                310-435-7464
              </span>
              <strong><i class="glyphicon glyphicon-envelope"></i></strong>
              <a href="">vince@vincejelineo.com </a> <br>
              <a href="">www.vincejelineo.com</a>
            </address>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="share-widget">
              <ul class="share-widget__icons">
                <li><a class="share-widget__links" href="#"><i class="fa fa-lg fa-facebook"></i></a></li>
                <li><a class="share-widget__links" href="#"><i class="fa fa-lg fa-flickr"></i></a></li>
                <li><a class="share-widget__links" href="#"><i class="fa fa-lg fa-instagram"></i></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="section footer">
      <div class="container-boot">
        <div class="row">
          <div class="col-md-12">
            <p class="footer-copyright">&copy; 2015 Soie de Lune is a company registered in the UK No. 3110998</p>
          </div>
        </div>
      </div>
    </footer>
<!-- </div> -->
<!-- Modal -->
<div class="modal fade" id="silks" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content" style="background-image:url('assets/images/lexicon/L_5061.jpg')">
      <div class="modal-body">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
        <h4 class="modal-title">Hand-woven Silks</h4>
        <p>This is the bedrock of our business. Whether it’s for a bespoke panel or a cushion cover, all weaving follows the traditional process from dying through spinning and on to weaving. We weave 3PLY silk for very fine usage, 6PLY silk for curtains and cushions and 9PLY silk for window dressing and upholstery. </p>

        <p>Our turn-around times are surprisingly fast as we are able to split the weaving amongst a number of weavers. This is quite unusual with hand-weave since each weaver has a different rhythm. However, we train our team to weave in coordinated teamwork to maintain consistency across an order.  We often weave upwards of 50 meters, even taking on projects of over 100 meters.</p>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="sheers" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content" style="background-image:url('assets/images/lexicon/L_5860.jpg')">
      <div class="modal-body">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
        <h4 class="modal-title">Hand-woven Silk Sheers</h4>
        <p>100% raw silk, we weave a yarn where the silk fiber’s natural resin, normally washed out, has been left intact. It produces a fabric we call Rice Paper Silk. Translucent and light to the touch, this 1PLY weave is incredibly beautiful. It is also extremely hardwearing and has passed sunlight resistance tests and is therefore perfectly adapted for widow dressing.</p>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="linen" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content" style="background-image:url('assets/images/lexicon/Italian_SIlks_IMG_0425.jpg')">
      <div class="modal-body">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
        <h4 class="modal-title">Hand-woven Linen</h4>
        <p>Combining silk warps with a linen ground we hand weave panels for all kinds of window dressing, weaving a fabric with a gossamer feel. Our linen range is mostly woven in collaboration with a designer’s requirements, adapting one of our designs to their special needs.</p>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="italian" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content" style="background-image:url('assets/images/lexicon/Italian_SIlks_IMG_0425.jpg')">
      <div class="modal-body">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
        <h4 class="modal-title">Hand-woven Italian Silk</h4>
        <p>A bouclé called Riccio and a ribbon silk called Fettuccia, woven by hand in our workshop in 16 colors. The yarn is heavy, 2Nm and the result is incredibly sophisticated, transforming a plain silk into a textured fabric resembling macarons or bonbons.</p>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="stocked" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content" style="background-image:url('assets/images/lexicon/Stocked_Handweaves_L_5925.jpg')">
      <div class="modal-body">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
        <h4 class="modal-title">Stocked Hand Weaves</h4>
        <p>We stock a range of hand-woven silks we call Buy Me Now. Interior designers often want cushion fabric at the end of a project and they are happy to have lengths as small as one meter available to them with immediate delivery.</p>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="linens" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content" style="background-image:url('assets/images/lexicon/IMG_0922.jpg')">
      <div class="modal-body">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
        <h4 class="modal-title">Linens &amp; Cottons</h4>
        <p>Woven in the United Kingdom by our local weaving partners, this range of fabric can be use for window dressing, upholstery or soft furnishings. It is a weave down of our hand woven designs and contains some silk to bring out the color in the figure designs and to soften the texture of the fabric.</p>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="mohair" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content" style="background-image:url('assets/images/lexicon/Mohair_Velvet_IMG_0981.jpg')">
      <div class="modal-body">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
        <h4 class="modal-title">Mohair velvet</h4>
        <p>This is a plain piece-dyed fabric with a design etched into the weave, suitable for upholstery. The mohair velvet is woven with the best quality mohair one can find on the market. It is woven in Belgium by experts and available as a stocked fabric item.</p>
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="wool" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog" role="document">
    <div class="modal-content" style="background-image:url('assets/images/lexicon/IMG_0947.jpg')">
      <div class="modal-body">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">&times;</button>
        <h4 class="modal-title">Wool</h4>
        <p>When we think of wool we think of Scotland and that is where our jacquard woven fabric of the finest quality wool is made. Suitable for both upholstery and window</p>
      </div>
    </div>
  </div>
</div>
 <!-- jQuery -->
  <script src="assets/scripts/vendor/jquery.min.js"></script>
  <script src="assets/scripts/vendor/jquery-migrate.min.js"></script>
  <!-- Boostrap -->
  <script type="text/javascript" src="assets/scripts/vendor/bootstrap.js"></script>
  <script>
  $(function () {
    $('[data-toggle="popover"]').popover();
  });
  $('.carousel').carousel({
    interval: false
  })
  </script>
  <!-- Plug-ins -->
  <script src="assets/scripts/vendor/masonry.pkgd.js"></script>
  <script src="assets/scripts/vendor/imagesloaded.js"></script>
  <script src="assets/scripts/vendor/jquery.infinitescroll.js"></script>
  <!-- Custom Scripts-->
  <script src="assets/scripts/main.js"></script>
  </body>

</html>