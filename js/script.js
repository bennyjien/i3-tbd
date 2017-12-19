/* This file contains main script for website
 * Style related scripts is located in style.js
 */
/* global document jQuery imagesLoaded equalheight */

// initialize when document is ready
jQuery(document).ready(function($) {

	var $window = $(window),
		windowWidth = $window.width();

	// equalheight
	$('.js-vendor-overviews').imagesLoaded(function() {
		equalheight('.js-vendor-overviews .vendor-overview a');
	});

	// initialize Flickity
	$('.js-slider-hero').find('.slider-hero-slides').flickity({
		autoPlay: 4000,
		dragThreshold: 8,
		imagesLoaded: true,
		prevNextButtons: false
	});

	$('.js-article-overviews-carousel').flickity({
		contain: true,
		groupCells: true,
		imagesLoaded: true,
		pageDots: false,
		arrowShape: 'M98 50.25c0 2.761-2.239 5-5 5h-72.951l22.657 22.719c1.95 1.956 1.946 5.121-.009 7.071-.976.974-2.254 1.46-3.531 1.46-1.281 0-2.564-.49-3.54-1.469l-31.166-31.25c-1.946-1.952-1.946-5.11 0-7.062l31.166-31.25c1.95-1.955 5.115-1.959 7.071-.009 1.955 1.95 1.959 5.115.009 7.071l-22.657 22.719h72.951c2.761 0 5 2.239 5 5'
	});

	$('.js-slider-gallery').find('.slider-gallery-slide').flickity({
		imagesLoaded: true,
		pageDots: false,
		prevNextButtons: false,
		setGallerySize: false,
		selectedAttraction: 0.05,
		friction: 0.5
	});

	$('.js-slider-gallery').find('.slider-gallery-nav').flickity({
		asNavFor: '.js-slider-gallery .slider-gallery-slide',
		cellAlign: 'left',
		imagesLoaded: true,
		groupCells: true,
		pageDots: false,
		arrowShape: {
			x0: 30,
			x1: 50, y1: 20,
			x2: 50, y2: 10,
			x3: 40
		}
	});

	var $instagramHighlightGrid = $('.js-slider-instagram').find('.slider-instagram-slides').flickity({
		cellAlign: 'left',
		contain: true,
		freeScroll: true,
		imagesLoaded: true,
		pageDots: false,
		prevNextButtons: false,
		resize: false,
		wrapAround: true,
		selectedAttraction: 0.001,
		friction: 1
	});

	function instagramHighlightGridAnimation() {
		var flick = $instagramHighlightGrid.data('flickity'),
			previousDate;

		function step() {
			if (typeof previousDate == 'undefined') {
				return;
			}

			var date = new Date();
			var diff = Math.floor((date - previousDate) / 12);
			previousDate = date;

			flick.x -= diff;
			flick.positionSlider();

			requestAnimationFrame(step);
		}

		function play() {
			if (typeof previousDate == 'undefined') {
				previousDate = new Date();
			}

			requestAnimationFrame(step);
		}

		function pause() {
			previousDate = undefined;
		}

		play();
	}

	if ($instagramHighlightGrid.length) {
		instagramHighlightGridAnimation();
	}

	$window.on('resize', function() {
		if ($window.width() !== windowWidth) {
			windowWidth = $window.width();
			$instagramHighlightGrid.flickity('resize');
		}
	});

	// initialize Fine Uploader
	var $uploader = document.getElementById('uploader');

	if ($uploader) {
		var uploader = new qq.FineUploader({
			element: $uploader
		});
	}

	// initialize magnificPopup
	$('.js-popup-link').magnificPopup({
		type: 'inline',
		mainClass: 'mfp-animation',
		removalDelay: 200
	});

});
