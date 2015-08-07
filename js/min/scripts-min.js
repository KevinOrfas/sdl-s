// Cache global vars
var windowWidth;

var windowBreak = 1024;

$.fn.sizeSections = function() {
  var
    winHeight = $(window).outerHeight();
  if (windowWidth >= windowBreak) {
    $(this).css('height', winHeight);
  }
  else {
    $(this).removeAttr('style');
  }

  windowWidth = $(window).width();
};

var onePageScrollOptions = {
  easing: "cubic-bezier(0.645,  0.045, 0.355, 1.000)",
  animationTime: 1000,
  pagination: true,
  updateURL: false,
  beforeMove: function(index) {},
  afterMove: function(index) {},
  loop: false,
  keyboard: true,
  responsiveFallback: (windowBreak - 1),
  direction: "vertical"
};

function loadCover() {
  var
    $cover = $('#cover'),
    $tocWrap = $cover.find('.toc'),
    $coverBands = $cover.find('.cover-contents');

  $coverBands.find('.contents-inner').velocity({width: '100%'}, {duration: 800, easing: "easeInOutCubic"});

  $tocWrap.velocity('slideDown', {duration: 800, easing: "easeInOutCubic", complete:
    function() {
      $cover.addClass('cover-loaded');
    }
  });
}

function showPagination() {
  var
    $cover = $('#cover');
    
  $(window).on('afterMove', function() {
    var $pagination = $('body').find('.onepage-pagination');
    if (!$('body').hasClass('viewing-page-1')) {
      if (!$pagination.hasClass('show-pagination')) {
        $pagination.velocity('fadeIn', {duration: 200, easing: "easeInOutCubic", complete:
          function() {
            $pagination.addClass('show-pagination');
          }
        });
      }
    }
    else {
      $pagination.velocity('fadeOut', {duration: 500, easing: "easeInOutCubic", begin:
        function() {
          $pagination.removeClass('show-pagination');
        }
      });
    }
  });
}

$.fn.accordionHovers = function() {

  if (windowWidth >= windowBreak) {
    var
      $this = $(this),
      totalColumns = 12,
      totalBands = $this.siblings().length,
      hoverColumns = 6,
      hoverWidth = ((hoverColumns/totalColumns) * 100).toFixed(4) + "%",
      siblingWidth = ((((totalColumns - hoverColumns)/(totalBands - 1))/totalColumns) * 100).toFixed(4) + "%",
      normalWidth = (((totalColumns/totalBands)/totalColumns) * 100).toFixed(4) + "%";

    $this.each(function() {
      $(this).on({
        mouseenter: function() {
          $(this).velocity('stop').velocity({width: hoverWidth}, {duration: 250, easing: "easeInOutCubic"});
          $(this).siblings().velocity('stop').velocity({width: siblingWidth}, {duration: 250, easing: "easeInOutCubic"});
        },
        mouseleave: function() {
          $(this).velocity('stop').velocity({width: normalWidth}, {duration: 250, easing: "easeInOutCubic"});
          $(this).siblings().velocity('stop').velocity({width: normalWidth}, {duration: 250, easing: "easeInOutCubic"});
        }
      });
    });
  }
};

$.fn.sectionClicks = function() {
  var
    $this = $(this),
    $coverBands = $('.contents-inner'),
    $tocNav = $('.toc-nav'),
    $contentWrap = $('.js-all-content'),
    href = $this.attr('href');

  if ($this.hasClass('content-band')) {
   var $navItem = $tocNav.find('a[href^="'+href+'"]');

   $this.on({
    mouseenter: function() {
      $tocNav.addClass('nav-hovered');
      $navItem.addClass('hover');
    },
    mouseleave: function() {
      $tocNav.removeClass('nav-hovered');
      $navItem.removeClass('hover');
    }
   });
   
  }

  $this.click(function(event) {
    event.preventDefault();
    var href = $this.attr('href');   
    var hrefIndex = $contentWrap.find(href).attr('data-index');
    if (windowWidth >= windowBreak) {
      $contentWrap.moveTo(hrefIndex);
    }
    else {
      $(href).velocity('scroll', {duration: 400, easing: "easeInOutCubic"});
    }
  });
};


$(document).ready(function() {
  windowWidth = $(window).width();
  var
    $html = $('html'),
    $body = $('body'),
    $cover = $body.find('#cover'),
    $contentWrap = $('.js-all-content'),
    $section = $('section'),
    $coverBands = $cover.find('.contents-inner'),
    $contentBand = $body.find('.content-band'),
    $tocNav = $body.find('.toc-nav');

  $('section').each(function(index) {
    var
      total = $('section').length;
    $(this).sizeSections();
  });

  setTimeout(function() {
    loadCover();
  }, 1000);
  

  showPagination();

  if (windowWidth >= windowBreak) {
    $contentWrap.onepage_scroll(onePageScrollOptions);
  }

  $contentBand.accordionHovers();

  $contentBand.each(function() {
    $(this).sectionClicks();
  });

  $tocNav.find('a').each(function() {
    $(this).sectionClicks();
  });

  $(window).resize(function() {
    $('section').each(function() {
      $(this).sizeSections();
    });

    if (windowWidth >= windowBreak) {
      $contentWrap.onepage_scroll(onePageScrollOptions);
    }
  });

});

$(window).load(function() {
  console.log('loaded');
});


