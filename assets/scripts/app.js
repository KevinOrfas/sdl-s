$(document).ready(function(){
	// $('.grid').masonry({
	//   // options
	//   itemSelector: '.grid-item',
	//   columnWidth: 40

	// });
	$('.trigger__about').on('click', function(){
		$('body').toggleClass('about--active');
		$('.header').toggleClass('is-active');
	});

	$('.trigger__regions').on('click', function(){
		$('body').toggleClass('regions--active');
		$('.header').toggleClass('nav-active');
	});
});
