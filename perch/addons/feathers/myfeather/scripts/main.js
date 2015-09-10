jQuery(document).ready(function($){
	//if you change this breakpoint in the style.css file (or _layout.scss if you use SASS), don't forget to update this value as well
	// var MQL = 1170;

	//primary navigation slide-in effect
	// if($(window).width() > MQL) {
		var headerHeight = $('.cd-header').height();
		$(window).on('scroll',
		{
	        previousTop: 0
	    },
	    function () {
		    var currentTop = $(window).scrollTop();
		    // //check if user is scrolling up
		    // if (currentTop < this.previousTop ) {
		    // 	//if scrolling up...
		    // 	if (currentTop > 0 && $('.cd-header').hasClass('is-fixed')) {
		    // 		$('.cd-header').addClass('is-visible');
		    // 	} else {
		    // 		$('.cd-header').removeClass('is-visible is-fixed');
		    // 	}
		    // } else {
		    	//if scrolling down...
		    	// $('.cd-header').removeClass('is-visible');
		    	// if( currentTop > headerHeight && !$('.cd-header').hasClass('is-fixed')) $('.cd-header').addClass('is-fixed');
		    // }
		    this.previousTop = currentTop;
		});
	// }

	var scrollObject = {};
	window.onscroll = getScrollPosition;

	function getScrollPosition() {
    	scrollObject = {
       		x: window.pageXOffset,
       		y: window.pageYOffset
    	};
    	// If you want to check distance
    	// if(scrollObject.y > 700) {
     //    	$('.header').addClass('is-sticky');
    	// } else {
     //    	$('.header').removeClass('is-sticky');
    	// }
	}

	//open/close primary navigation
	// $('.cd-primary-nav-trigger, .tt').on('click', function(){
	// 	$('.cd-menu-icon').toggleClass('is-clicked');
	// 	$('.cd-header').toggleClass('menu-is-open');

	// 	//in firefox transitions break when parent overflow is changed, so we need to wait for the end of the trasition to give the body an overflow hidden
	// 	if( $('.cd-primary-nav').hasClass('is-visible') ) {
	// 		$('.cd-primary-nav').removeClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',function(){
	// 			$('body').removeClass('overflow-hidden');
	// 		});
	// 	} else {
	// 		$('.cd-primary-nav').addClass('is-visible').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',function(){
	// 			$('body').addClass('overflow-hidden');
	// 		});
	// 	}
	// });

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
			columnWidth: 80,
			itemSelector: '.masonry-item',
			gutterWidth: 80,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImpRdWVyeShkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oJCl7XG5cdC8vaWYgeW91IGNoYW5nZSB0aGlzIGJyZWFrcG9pbnQgaW4gdGhlIHN0eWxlLmNzcyBmaWxlIChvciBfbGF5b3V0LnNjc3MgaWYgeW91IHVzZSBTQVNTKSwgZG9uJ3QgZm9yZ2V0IHRvIHVwZGF0ZSB0aGlzIHZhbHVlIGFzIHdlbGxcblx0Ly8gdmFyIE1RTCA9IDExNzA7XG5cblx0Ly9wcmltYXJ5IG5hdmlnYXRpb24gc2xpZGUtaW4gZWZmZWN0XG5cdC8vIGlmKCQod2luZG93KS53aWR0aCgpID4gTVFMKSB7XG5cdFx0dmFyIGhlYWRlckhlaWdodCA9ICQoJy5jZC1oZWFkZXInKS5oZWlnaHQoKTtcblx0XHQkKHdpbmRvdykub24oJ3Njcm9sbCcsXG5cdFx0e1xuXHQgICAgICAgIHByZXZpb3VzVG9wOiAwXG5cdCAgICB9LFxuXHQgICAgZnVuY3Rpb24gKCkge1xuXHRcdCAgICB2YXIgY3VycmVudFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblx0XHQgICAgLy8gLy9jaGVjayBpZiB1c2VyIGlzIHNjcm9sbGluZyB1cFxuXHRcdCAgICAvLyBpZiAoY3VycmVudFRvcCA8IHRoaXMucHJldmlvdXNUb3AgKSB7XG5cdFx0ICAgIC8vIFx0Ly9pZiBzY3JvbGxpbmcgdXAuLi5cblx0XHQgICAgLy8gXHRpZiAoY3VycmVudFRvcCA+IDAgJiYgJCgnLmNkLWhlYWRlcicpLmhhc0NsYXNzKCdpcy1maXhlZCcpKSB7XG5cdFx0ICAgIC8vIFx0XHQkKCcuY2QtaGVhZGVyJykuYWRkQ2xhc3MoJ2lzLXZpc2libGUnKTtcblx0XHQgICAgLy8gXHR9IGVsc2Uge1xuXHRcdCAgICAvLyBcdFx0JCgnLmNkLWhlYWRlcicpLnJlbW92ZUNsYXNzKCdpcy12aXNpYmxlIGlzLWZpeGVkJyk7XG5cdFx0ICAgIC8vIFx0fVxuXHRcdCAgICAvLyB9IGVsc2Uge1xuXHRcdCAgICBcdC8vaWYgc2Nyb2xsaW5nIGRvd24uLi5cblx0XHQgICAgXHQvLyAkKCcuY2QtaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2lzLXZpc2libGUnKTtcblx0XHQgICAgXHQvLyBpZiggY3VycmVudFRvcCA+IGhlYWRlckhlaWdodCAmJiAhJCgnLmNkLWhlYWRlcicpLmhhc0NsYXNzKCdpcy1maXhlZCcpKSAkKCcuY2QtaGVhZGVyJykuYWRkQ2xhc3MoJ2lzLWZpeGVkJyk7XG5cdFx0ICAgIC8vIH1cblx0XHQgICAgdGhpcy5wcmV2aW91c1RvcCA9IGN1cnJlbnRUb3A7XG5cdFx0fSk7XG5cdC8vIH1cblxuXHR2YXIgc2Nyb2xsT2JqZWN0ID0ge307XG5cdHdpbmRvdy5vbnNjcm9sbCA9IGdldFNjcm9sbFBvc2l0aW9uO1xuXG5cdGZ1bmN0aW9uIGdldFNjcm9sbFBvc2l0aW9uKCkge1xuICAgIFx0c2Nyb2xsT2JqZWN0ID0ge1xuICAgICAgIFx0XHR4OiB3aW5kb3cucGFnZVhPZmZzZXQsXG4gICAgICAgXHRcdHk6IHdpbmRvdy5wYWdlWU9mZnNldFxuICAgIFx0fTtcbiAgICBcdC8vIElmIHlvdSB3YW50IHRvIGNoZWNrIGRpc3RhbmNlXG4gICAgXHQvLyBpZihzY3JvbGxPYmplY3QueSA+IDcwMCkge1xuICAgICAvLyAgICBcdCQoJy5oZWFkZXInKS5hZGRDbGFzcygnaXMtc3RpY2t5Jyk7XG4gICAgXHQvLyB9IGVsc2Uge1xuICAgICAvLyAgICBcdCQoJy5oZWFkZXInKS5yZW1vdmVDbGFzcygnaXMtc3RpY2t5Jyk7XG4gICAgXHQvLyB9XG5cdH1cblxuXHQvL29wZW4vY2xvc2UgcHJpbWFyeSBuYXZpZ2F0aW9uXG5cdC8vICQoJy5jZC1wcmltYXJ5LW5hdi10cmlnZ2VyLCAudHQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuXHQvLyBcdCQoJy5jZC1tZW51LWljb24nKS50b2dnbGVDbGFzcygnaXMtY2xpY2tlZCcpO1xuXHQvLyBcdCQoJy5jZC1oZWFkZXInKS50b2dnbGVDbGFzcygnbWVudS1pcy1vcGVuJyk7XG5cblx0Ly8gXHQvL2luIGZpcmVmb3ggdHJhbnNpdGlvbnMgYnJlYWsgd2hlbiBwYXJlbnQgb3ZlcmZsb3cgaXMgY2hhbmdlZCwgc28gd2UgbmVlZCB0byB3YWl0IGZvciB0aGUgZW5kIG9mIHRoZSB0cmFzaXRpb24gdG8gZ2l2ZSB0aGUgYm9keSBhbiBvdmVyZmxvdyBoaWRkZW5cblx0Ly8gXHRpZiggJCgnLmNkLXByaW1hcnktbmF2JykuaGFzQ2xhc3MoJ2lzLXZpc2libGUnKSApIHtcblx0Ly8gXHRcdCQoJy5jZC1wcmltYXJ5LW5hdicpLnJlbW92ZUNsYXNzKCdpcy12aXNpYmxlJykub25lKCd3ZWJraXRUcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kIG9UcmFuc2l0aW9uRW5kIG1zVHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kJyxmdW5jdGlvbigpe1xuXHQvLyBcdFx0XHQkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ292ZXJmbG93LWhpZGRlbicpO1xuXHQvLyBcdFx0fSk7XG5cdC8vIFx0fSBlbHNlIHtcblx0Ly8gXHRcdCQoJy5jZC1wcmltYXJ5LW5hdicpLmFkZENsYXNzKCdpcy12aXNpYmxlJykub25lKCd3ZWJraXRUcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kIG9UcmFuc2l0aW9uRW5kIG1zVHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kJyxmdW5jdGlvbigpe1xuXHQvLyBcdFx0XHQkKCdib2R5JykuYWRkQ2xhc3MoJ292ZXJmbG93LWhpZGRlbicpO1xuXHQvLyBcdFx0fSk7XG5cdC8vIFx0fVxuXHQvLyB9KTtcblxuXHQvKlxuXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdFx0TWFzb25yeSBTY3JpcHRzXG5cdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ki9cblxuXHR2YXIgJHdhbGwgPSAkKCcuY29udGFpbmVyJyk7XG5cdCAgICAkd2FsbC5tYXNvbnJ5KHtcblx0ICAgIFx0aXNJbml0TGF5b3V0OiBmYWxzZVxuXHQgICAgfSk7XG5cdCAgICAkd2FsbC5pbWFnZXNMb2FkZWQoIGZ1bmN0aW9uKCl7XG5cdFx0ICAkd2FsbC5tYXNvbnJ5KHtcblx0XHRcdGNvbHVtbldpZHRoOiA4MCxcblx0XHRcdGl0ZW1TZWxlY3RvcjogJy5tYXNvbnJ5LWl0ZW0nLFxuXHRcdFx0Z3V0dGVyV2lkdGg6IDgwLFxuXHRcdFx0aXNGaXRXaWR0aDogdHJ1ZSxcblx0XHRcdHRyYW5zaXRpb25EdXJhdGlvbjogMCxcblx0ICAgICAgICBhbmltYXRpb25PcHRpb25zOiB7XG5cdCAgICAgICAgICBkdXJhdGlvbjogNzAwMCxcblx0ICAgICAgICAgIGVhc2luZzogJ2xpbmVhcicsXG5cdCAgICAgICAgICBxdWV1ZTogZmFsc2Vcblx0ICAgICAgICB9XG5cdFx0fSk7XG5cblx0XHQvLyBpbmZpbml0ZXNjcm9sbCgpIGlzIGNhbGxlZCBvbiB0aGUgZWxlbWVudCB0aGF0IHN1cnJvdW5kc1xuXHRcdC8vIHRoZSBpdGVtcyB5b3Ugd2lsbCBiZSBsb2FkaW5nIG1vcmUgb2Zcblx0XHQkd2FsbC5pbmZpbml0ZXNjcm9sbCh7XG5cdFx0XHRuYXZTZWxlY3RvciA6ICcucGFnZV9uYXYnLFxuXHRcdFx0Ly8gc2VsZWN0b3IgZm9yIHRoZSBwYWdlZCBuYXZpZ2F0aW9uXG5cdFx0XHRuZXh0U2VsZWN0b3IgOiAnLnBhZ2VfbmF2IGEnLFxuXHRcdFx0Ly8gc2VsZWN0b3IgZm9yIHRoZSBORVhUIGxpbmsgKHRvIHBhZ2UgMilcblx0XHRcdGl0ZW1TZWxlY3RvciA6ICcuaXRlbScsXG5cdFx0XHQvLyBzZWxlY3RvciBmb3IgYWxsIGl0ZW1zIHlvdSdsbCByZXRyaWV2ZVxuXHRcdFx0bG9hZGluZzoge1xuXHRcdFx0XHRmaW5pc2hlZE1zZzogJ05vIG1vcmUgc3RvcmllcycsXG5cdFx0XHRcdG1zZ1RleHQ6IFwiTG9hZGluZyBzdG9yaWVzLi4uXCIsXG5cdFx0XHRcdHNwZWVkOiAnc2xvdydcblx0XHRcdCAgICB9LFxuXHRcdH0sXG5cblx0XHQvLyB0cmlnZ2VyIE1hc29ucnkgYXMgYSBjYWxsYmFja1xuXHRcdGZ1bmN0aW9uKG5ld0VsZW1lbnRzKSB7XG5cdFx0Ly8gaGlkZSBuZXcgaXRlbXMgd2hpbGUgdGhleSBhcmUgbG9hZGluZ1xuXHRcdHZhciAkbmV3RWxlbXMgPSAkKCBuZXdFbGVtZW50cyApLmNzcyh7IG9wYWNpdHk6IDAgfSk7XG5cdFx0Ly8gZW5zdXJlIHRoYXQgaW1hZ2VzIGxvYWQgYmVmb3JlIGFkZGluZyB0byBNYXNvbnJ5IGxheW91dFxuXHRcdCRuZXdFbGVtcy5pbWFnZXNMb2FkZWQoZnVuY3Rpb24oKSB7XG5cdFx0Ly8gc2hvdyBlbGVtcyBub3cgdGhleSdyZSByZWFkeVxuXHRcdFx0JG5ld0VsZW1zLmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sIDUwMCk7XG5cdFx0XHQkd2FsbC5tYXNvbnJ5KCAnYXBwZW5kZWQnLCAkbmV3RWxlbXMgKTtcblx0XHQgICAgfSk7XG5cdFx0ICB9XG5cdFx0KTtcbiAgICAgfSk7XG5cblx0Ly9TTU9PVEggU0NST0xJTkcgRlVOQ1RJT05cbiAgICAkKGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCduYXYgYVtocmVmKj0jXTpub3QoW2hyZWY9I10pJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCcnKSA9PT0gdGhpcy5wYXRobmFtZS5yZXBsYWNlKC9eXFwvLywnJykgJiYgbG9jYXRpb24uaG9zdG5hbWUgPT09IHRoaXMuaG9zdG5hbWUpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKHRoaXMuaGFzaCk7XG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQubGVuZ3RoID8gdGFyZ2V0IDogJCgnW25hbWU9JyArIHRoaXMuaGFzaC5zbGljZSgxKSArJ10nKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogdGFyZ2V0Lm9mZnNldCgpLnRvcFxuICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn0pOyJdLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9