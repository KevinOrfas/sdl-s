
  <script src="../assets/scripts/vendor/jquery.min.js"></script>
  <script src="../assets/scripts/vendor/jquery-migrate.min.js"></script>
  <!-- Boostrap -->
  <script type="text/javascript" src="../assets/scripts/vendor/bootstrap.js"></script>
  <script type="text/javascript" src="../assets/scripts/vendor/jquery.magnific-popup.js"></script>
  <script>
  $(function () {
    $('[data-toggle="popover"]').popover();
  });
  $('.carousel').carousel({
    interval: false
  })

      $(document).ready(function() {
      $('.popup-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        tLoading: 'Loading image #%curr%...',
        mainClass: 'mfp-img-mobile',
        gallery: {
          enabled: true,
          navigateByImgClick: true,
          preload: [0,1] // Will preload 0 - before current, and 1 after the current image
        },
        image: {
          tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
          titleSrc: function(item) {
            return item.el.attr('title');
          }
        }
      });
    });
  </script>
  <!-- Plug-ins -->
  <script src="../assets/scripts/vendor/masonry.pkgd.js"></script>
  <script src="../assets/scripts/vendor/imagesloaded.js"></script>
  <script src="../assets/scripts/vendor/jquery.infinitescroll.js"></script>
  <!-- Custom Scripts-->
  <script src="../assets/scripts/main.js"></script>
  </body>

</html>