jQuery(document).ready(function($){
	//if you change this breakpoint in the style.css file (or _layout.scss if you use SASS), don't forget to update this value as well
	var MQL = 1170;

	//primary navigation slide-in effect
	if($(window).width() > MQL) {
		var headerHeight = $('.cd-header').height();
		$(window).on('scroll',
		{
	        previousTop: 0
	    },
	    function () {
		    var currentTop = $(window).scrollTop();
		    //check if user is scrolling up
		    if (currentTop < this.previousTop ) {
		    	//if scrolling up...
		    	if (currentTop > 0 && $('.cd-header').hasClass('is-fixed')) {
		    		$('.cd-header').addClass('is-visible');
		    	} else {
		    		$('.cd-header').removeClass('is-visible is-fixed');
		    	}
		    } else {
		    	//if scrolling down...
		    	$('.cd-header').removeClass('is-visible');
		    	if( currentTop > headerHeight && !$('.cd-header').hasClass('is-fixed')) $('.cd-header').addClass('is-fixed');
		    }
		    this.previousTop = currentTop;
		});
	}

	var scrollObject = {};
	window.onscroll = getScrollPosition;

	function getScrollPosition() {
    	scrollObject = {
       		x: window.pageXOffset,
       		y: window.pageYOffset
    	};
    	// If you want to check distance
    	if(scrollObject.y > 700) {
        	$('.header').addClass('is-sticky');
    	} else {
        	$('.header').removeClass('is-sticky');
    	}
	}

	//open/close primary navigation
	$('.cd-primary-nav-trigger, .tt').on('click', function(){
		$('.cd-menu-icon').toggleClass('is-clicked');
		$('.cd-header').toggleClass('menu-is-open');

		//in firefox transitions break when parent overflow is changed, so we need to wait for the end of the trasition to give the body an overflow hidden
		if( $('.cd-primary-nav').hasClass('is-visible') ) {
			$('.cd-primary-nav').removeClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',function(){
				$('body').removeClass('overflow-hidden');
			});
		} else {
			$('.cd-primary-nav').addClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',function(){
				$('body').addClass('overflow-hidden');
			});
		}
	});

	/*  
	----------------------
		Masonry Scripts
	----------------------
	*/

	var $wall = $('.container');
	    $wall.masonry({
	    	isInitLayout: false
	    });
	    $wall.imagesLoaded( function(){
		  $wall.masonry({
			columnWidth: 10,
			itemSelector: '.item',
			gutter: 5,
			gutterWidth: 150,
			isFitWidth: true,
			transitionDuration: 0,
	        animationOptions: {
	          duration: 7000,
	          easing: 'linear',
	          queue: false
	        }
		});

		// infinitescroll() is called on the element that surrounds
		// the items you will be loading more of 
		$wall.infinitescroll({ 
			navSelector : '.page_nav',
			// selector for the paged navigation 
			nextSelector : '.page_nav a',
			// selector for the NEXT link (to page 2)
			itemSelector : '.item',
			// selector for all items you'll retrieve 
			loading: {
				finishedMsg: 'No more stories',
				msgText: "Loading stories...",
				speed: 'slow'
			    },
		},

		// trigger Masonry as a callback 
		function(newElements) {
		// hide new items while they are loading 
		var $newElems = $( newElements ).css({ opacity: 0 }); 
		// ensure that images load before adding to Masonry layout 
		$newElems.imagesLoaded(function() { 
		// show elems now they're ready
			$newElems.animate({ opacity: 1 }, 500);
			$wall.masonry( 'appended', $newElems ); 
		    }); 
		  } 
		);  
     });
	
	//SMOOTH SCROLING FUNCTION
    $(function() {
        $('nav a[href*=#]:not([href=#])').click(function() {
          if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
              $('html,body').animate({
                scrollTop: target.offset().top
              }, 1000);
              return false;
            }
          }
        });
    });

});