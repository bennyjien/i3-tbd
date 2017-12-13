/* This file extends the limit of style.css
 * Style related scripts including polyfill should be written here
 */
/* global window document history MouseEvent getParameterByName hasChild Stickyfill ScrollMagic TweenMax svg4everybody */

(function() {
	'use strict';

	const $body = document.querySelector('body');

	let windowWidth = document.documentElement.clientWidth;

	// svg polyfill
	svg4everybody();

	// sticky polyfill
	const stickyElements = document.getElementsByClassName('js-sticky');

	for (let i = stickyElements.length - 1; i >= 0; i--) {
		Stickyfill.add(stickyElements[i]);
	}

	// scroll to targeted id
	function scrollTo(event, element) {
		const scrollTarget = element.dataset.scrollTarget || element.hash || '',
			$scrollTarget = document.querySelector(`[id='${scrollTarget.substring(1)}']`),
			scrollDuration = element.dataset.scrollDuration || 0.4,
			$offset = document.querySelector(element.dataset.scrollOffset) || '',
			offset = $offset.offsetHeight || 0;

		if ($scrollTarget) {
			TweenMax.to(window, scrollDuration, {
				scrollTo: {
					y: scrollTarget,
					offsetY: offset
				}
			});
			event.preventDefault();
		}
	}

	// unwrapper function: fixing calculation bug because of scrollbar
	var unwrapperFunction = function(event) {
		var $unwrapper = document.querySelectorAll('.js-unwrapper'),
			math = `calc(50% - ${windowWidth}px/2)`;

		function unwrapperApply() {
			windowWidth = document.documentElement.clientWidth;

			if (windowWidth >= 1152) {
				math = `calc(50% - ${windowWidth}px/2)`;

				$unwrapper.forEach(element => {
					element.style.marginLeft = math;
					element.style.marginRight = math;
				});
			} else {
				$unwrapper.forEach(element => {
					element.style.marginLeft = null;
					element.style.marginRight = null;
				});
			}
		}

		unwrapperApply();
		window.addEventListener('resize', unwrapperApply);
	}();

	// init ScrollMagic
	const sceneController = new ScrollMagic.Controller(),
		$scenes = document.querySelectorAll('.js-scene');

	$scenes.forEach(scene => {
		var sceneElement = new ScrollMagic.Scene({ triggerElement: scene, reverse: false })
			.setClassToggle(scene, 'in-viewport')
			.addIndicators()
			.addTo(sceneController);
	});

	// scroller function
	/* data-scroll-target="[selector]" -> scroll to target
	   data-scroll-offset="[selector]" -> offset of selector height
	   data-scroll-duration="[duration]" -> how long is scrolling animation
	*/
	var scrollFunction = function(event) {
		const $scrolls = document.querySelectorAll('.js-scroll');

		$scrolls.forEach(scroll => scroll.addEventListener('click', function(event) { scrollTo(event, this); }));
	}();

	// tab function, can use scroll to function
	/* data-tab-type="normal|collapse" -> collapse tab can be closed individually
	   data-tab-group="[name]" -> tab grouping
	   data-tab-duration="[second]" -> how long is tab animation if tab method is auto
	*/
	var tabFunction = function() {
		const $tabs = document.querySelectorAll('.js-tab');

		function tabInit() {
			var $tabTargets = document.querySelectorAll('.js-tab-target'),
				$firstTabs = document.querySelectorAll('[data-tab-group]:first-child'),
				$firstTabTargets = document.querySelectorAll('[data-tab-group].js-tab-target:first-child'),
				queryString = getParameterByName('tab'),
				$this = document.querySelector(`a[href="#${queryString}"]`),
				$tabTarget = $this && document.querySelector($this.hash);

			$tabTargets.forEach(element => element.style.display = 'none');
			$firstTabTargets.forEach(element => element.style.display = 'block');
			$firstTabs.forEach(element => element.classList.add('is-tabbed'));

			if (queryString && $tabTarget) {
				var $tabGroup = document.querySelectorAll(`[data-tab-group="${$tabTarget.dataset.tabGroup}"]`),
					$tabTargetGroup = document.querySelectorAll(`[data-tab-group="${$tabTarget.dataset.tabGroup}"].js-tab-target`);

				$tabTargetGroup.forEach(element => element.style.display = 'none');
				$tabGroup.forEach(element => element.classList.remove('is-tabbed'));
				$this.classList.add('is-tabbed');
				$tabTarget.style.display = 'block';
				$tabTarget.classList.add('is-tabbed');
			}
		}

		function tabSwitch(event, $this) {
			var $tabTarget = document.querySelector($this.hash);

			if ($tabTarget) {
				var $tabGroup =  document.querySelectorAll(`[data-tab-group="${$tabTarget.dataset.tabGroup}"]`),
					$tabTargetGroup = document.querySelectorAll(`.js-tab-target[data-tab-group="${$tabTarget.dataset.tabGroup}"]`),
					tabType = $this.dataset.tabType || 'tab',
					tabTarget = $this.hash.substring(1),
					tabDuration = $this.dataset.tabDuration || 0.2,
					tabScrollTarget = $this.dataset.scrollTarget;

				if (!$tabTarget.classList.contains('is-tabbed')) {
					var closeDuration = 0;

					$tabTargetGroup.forEach(element => {
						if (element.classList.contains('is-tabbed')) {
							closeDuration = tabDuration/2;
						}
					});

					TweenMax.to($tabTargetGroup, closeDuration, {
						display: 'none',
						height: 0,
						overflow: 'hidden',
						autoAlpha: 0,
						onComplete: function() {
							TweenMax.set($tabTarget, {
								display: 'block',
								height: 'auto',
								overflow: 'visible',
								autoAlpha: 1
							});
							TweenMax.from($tabTarget, tabDuration, {
								height: 0,
								overflow: 'hidden',
								autoAlpha: 0
							});
						}
					});

					$tabGroup.forEach(element => element.classList.remove('is-tabbed'));
					$this.classList.add('is-tabbed');
					$tabTarget.classList.add('is-tabbed');

					if (tabScrollTarget) {
						scrollTo(event, $this);
					}

					if (window.history && history.pushState) {
						history.replaceState('', '', '?tab' + '=' + tabTarget);
					}
				} else {
					if (tabType === 'collapse') {
						TweenMax.to($tabTargetGroup, tabDuration/2, {
							display: 'none',
							height: 0,
							overflow: 'hidden',
							autoAlpha: 0
						});

						$this.classList.remove('is-tabbed');
						$tabTarget.classList.remove('is-tabbed');

						if (window.history && history.pushState) {
							history.replaceState('', '', '?');
						}
					}
				}

				event.preventDefault();
			}
		}

		tabInit();
		$tabs.forEach(tab => tab.addEventListener('click', function(event) { tabSwitch(event, this); }));
	}();

	// toggle function, can use scroll to function
	/* data-toggle-trigger="click|hover" -> how will toggle be triggered
	   data-toggle-target="[selector]" -> toggle target
	   data-toggle-area="[selector]" -> toggle will end outside this area
	   data-toggle-method="auto|manual" -> how toggle is handled, default is auto
	   data-toggle-duration="[second]" -> how long is toggle animation
	   data-toggle-focus="[selector]" -> toggle will focus on targeted form
	   data-toggle-state="undefined|toggled" -> toggle state on page load
	*/
	var toggleFunction = function() {
		const $toggles = document.querySelectorAll('.js-toggle');

		function toggleSlideUp(target, duration) {
			TweenMax.to(target, duration, {
				display: 'none',
				height: 0,
				overflow: 'hidden',
				autoAlpha: 0
			});
		}

		function toggleSlideDown(target, duration, delay) {
			TweenMax.set(target, {
				display: 'block',
				height: 'auto',
				overflow: 'visible',
				autoAlpha: 1
			});
			TweenMax.from(target, duration, {
				height: 0,
				overflow: 'hidden',
				autoAlpha: 0,
				delay: delay
			});
		}

		function toggleInit($this) {
			var eventClick = new MouseEvent('click'),
				eventMouse = new MouseEvent('mouseenter');

			if ($this.dataset.toggleState === 'toggled') {
				toggleOpen(eventClick, $this);
				toggleOpen(eventMouse, $this);
			}
		}

		function toggleOpen(event, $this) {
			var toggleTrigger = $this.dataset.toggleTrigger || 'click',
				toggleTarget = $this.dataset.toggleTarget || $this.hash,
				$toggleTarget = document.querySelector(toggleTarget),
				$toggleArea = document.querySelector($this.dataset.toggleArea) || $toggleTarget,
				$toggleFocus = document.querySelector($this.dataset.toggleFocus),
				toggleMethod = $this.dataset.toggleMethod || 'auto',
				toggleDuration = $this.dataset.toggleDuration || 0.25,
				toggleScrollTarget = $this.dataset.scrollTarget,
				bodyClass = toggleTarget.substring(1),
				preventDefault = $this.dataset.toggleTarget ? false : true;

			if (!$toggleTarget) return false;

			if (event.type === 'mouseenter' || event.type === 'touchstart') {
				if (toggleTrigger === 'hover') {
					var $toggleLinkToggled = $toggleArea.querySelectorAll('.js-toggle.is-toggled');

					$toggleLinkToggled.forEach(toggle => {
						if (toggle !== $this) {
							toggle.classList.remove('is-toggled');
						}
					});

					var $toggleAllToggled = $toggleArea.querySelectorAll('.is-toggled'),
						$toggleCurrentToggled = [];

					$toggleAllToggled.forEach(toggle => {
						if (toggle !== $this && toggle !== $toggleTarget) {
							$toggleCurrentToggled.push(toggle);
						}
					});

					if (toggleMethod === 'auto') {
						toggleSlideUp($toggleCurrentToggled, toggleDuration/2);
					}

					$toggleCurrentToggled.forEach(toggle => toggle.classList.remove('is-toggled'));

					if ($this.classList.contains('is-toggled') === false) {
						$this.classList.add('is-toggled');
						$toggleTarget.classList.add('is-toggled');
						if (toggleMethod === 'auto') {
							toggleSlideDown($toggleTarget, toggleDuration, toggleDuration/2);
						}
					}

					$toggleArea.addEventListener('mouseleave', function(event) { toggleClose(event, $this, toggleTrigger, $toggleTarget, $toggleArea, toggleMethod, toggleDuration, bodyClass); });
					$body.addEventListener('click', function(event) { toggleClose(event, $this, toggleTrigger, $toggleTarget, $toggleArea, toggleMethod, toggleDuration, bodyClass); });
					$body.addEventListener('touchend', function(event) { toggleClose(event, $this, toggleTrigger, $toggleTarget, $toggleArea, toggleMethod, toggleDuration, bodyClass); });
				}
			} else if (event.type === 'click') {
				if (toggleTrigger === 'click') {
					if ($this.classList.contains('is-toggled') || $toggleTarget.classList.contains('is-toggled')) {
						if (!hasChild($this, $toggleArea)) {
							$this.classList.remove('is-toggled');
							$this.classList.add('is-untoggling');
							$toggleTarget.classList.remove('is-toggled');
							$toggleTarget.classList.add('is-untoggling');
							$body.classList.add(bodyClass+'-is-untoggling');
							setTimeout(function() {
								$this.classList.remove('is-untoggling');
								$toggleTarget.classList.remove('is-untoggling');
								$body.classList.remove(bodyClass+'-is-toggled', bodyClass+'-is-untoggling');
							}, toggleDuration*1000);
							if (toggleMethod === 'auto') {
								toggleSlideUp($toggleTarget, toggleDuration/2);
							}
						}
					} else {
						$this.classList.add('is-toggling');
						$toggleTarget.classList.add('is-toggling');
						$body.classList.add(bodyClass+'-is-toggling');
						setTimeout(function() {
							$this.classList.remove('is-toggling');
							$this.classList.add('is-toggled');
							$toggleTarget.classList.remove('is-toggling');
							$toggleTarget.classList.add('is-toggled');
							$body.classList.remove(bodyClass+'-is-toggling');
							$body.classList.add(bodyClass+'-is-toggled');
						}, toggleMethod === 'manual' ? 1 : toggleDuration*1000);
						if (toggleScrollTarget) {
							scrollTo(event, $this);
						}
						if (toggleMethod === 'auto') {
							toggleSlideDown($toggleTarget, toggleDuration, 0);
						}
						if ($toggleFocus) {
							$toggleFocus.focus();
						}
						$body.addEventListener('click', function(event) { toggleClose(event, $this, toggleTrigger, $toggleTarget, $toggleArea, toggleMethod, toggleDuration, bodyClass); });
						$body.addEventListener('touchend', function(event) { toggleClose(event, $this, toggleTrigger, $toggleTarget, $toggleArea, toggleMethod, toggleDuration, bodyClass); });
					}

					if (preventDefault === true) {
						event.preventDefault();
					}
				}
			}
		}

		function toggleClose(event, $this, toggleTrigger, $toggleTarget, $toggleArea, toggleMethod, toggleDuration, bodyClass) {
			if ($this.classList.contains('is-toggled') || $toggleTarget.classList.contains('is-toggled')) {
				if (toggleTrigger === 'hover' && event.type !== 'click') {
					$this.classList.remove('is-toggled');
					$this.classList.add('is-untoggling');
					$toggleTarget.classList.remove('is-toggled');
					$toggleTarget.classList.add('is-untoggling');
					setTimeout(function() {
						$this.classList.remove('is-untoggling');
						$toggleTarget.classList.remove('is-untoggling');
					}, toggleDuration*1000);
					if (toggleMethod === 'auto') {
						toggleSlideUp($toggleTarget, toggleDuration/2);
					}
				} else {
					if ($this !== event.target && !hasChild($this, event.target) && $toggleArea !== event.target && !hasChild($toggleArea, event.target)) {
						$this.classList.remove('is-toggled');
						$this.classList.add('is-untoggling');
						$toggleTarget.classList.remove('is-toggled');
						$toggleTarget.classList.add('is-untoggling');
						$body.classList.add(bodyClass+'-is-untoggling');
						setTimeout(function() {
							$this.classList.remove('is-untoggling');
							$toggleTarget.classList.remove('is-untoggling');
							$body.classList.remove(bodyClass+'-is-toggled', bodyClass+'-is-untoggling');
						}, toggleDuration*1000);
						if (toggleMethod === 'auto') {
							toggleSlideUp($toggleTarget, toggleDuration/2);
						}
					}
				}
			}
		}

		$toggles.forEach(toggle => {
			toggleInit(toggle);
			toggle.addEventListener('click', function(event) { toggleOpen(event, this); });
			toggle.addEventListener('mouseenter', function(event) { toggleOpen(event, this); });
			toggle.addEventListener('touchstart', function(event) { toggleOpen(event, this); });
		});
	}();

	// mover function (will move elements depending of breakpoints)
	/* data-mover-breakpoint="[width]" -> mover breakpoint width
	   data-mover-target="[selector]" -> mover will append selected element to this selector
	*/
	var moverFunction = function() {
		const $movers = document.querySelectorAll('.js-mover');

		function moverStart(element) {
			var $this = element;

			$this.insertAdjacentHTML('beforebegin', '<div class="js-mover-source"></div>');

			var $moverSource = $this.previousElementSibling,
				$moverTarget = document.querySelector($this.dataset.moverTarget),
				moverBreakpoint = $this.dataset.moverBreakpoint,
				windowWidth = document.documentElement.clientWidth;

			if (windowWidth >= moverBreakpoint) {
				$moverTarget.appendChild($this);
			}

			window.addEventListener('resize', function() {
				windowWidth = document.documentElement.clientWidth;

				if (windowWidth >= moverBreakpoint) {
					if ($this.parentNode !== $moverTarget) {
						$moverTarget.appendChild($this);
					}
				} else {
					if ($this.parentNode !== $moverSource) {
						$moverSource.appendChild($this);
					}
				}
			});
		}

		$movers.forEach(mover => moverStart(mover));
	}();

	// form file function
	/* EXAMPLE
	 	<div class="form-file js-form-file">
			<label class="label">File</label>
			<div class="input">
				<input type="file" id="checkout-attachment" class="form-file-input" name="checkout-attachment" data-multiple-placeholder="{count} files selected" multiple>
				<label for="checkout-attachment" class="form-file-label"><span class="button">Browse files</span> <span class="placeholder">No file selected&hellip;</span></label>
			</div>
		</div>
	*/
	var formFileFunction = function() {
		var $formFile = document.querySelectorAll('.js-form-file');

		$formFile.forEach(element => {
			var $input = element.querySelector('.form-file-input'),
				$label = element.querySelector('.form-file-label'),
				labelDefault = $label.innerHTML;

			$input.addEventListener('change', function(event) {
				var fileName = '';

				if (this.files && this.files.length > 1) {
					fileName = (this.getAttribute('data-multiple-placeholder') || '').replace('{count}', this.files.length);
				}
				else if (event.target.value) {
					fileName = event.target.value.split('\\').pop();
				}

				if (fileName) {
					var $labelCaption = $label.querySelector('.placeholder');
					$labelCaption.innerHTML = fileName;
					$labelCaption.classList.add('has-placeholder');
				}
				else {
					$label.innerHTML = labelDefault;
				}
			});
		});
	}();

	// equalling heights function
	/* EXAMPLE
	   equalheight('.floaters .floater');
	*/
	var equalheight = function(elements) {
		var $this,
			currentHighest = 0,
			currentRowStart = 0,
			currentDiv,
			rowDivs = [],
			topPosition = 0;

		function calculateHeight(elements) {
			var $elements = document.querySelectorAll(elements);
			$elements.forEach(element => {
				$this = element;
				$this.style.minHeight = 0;
				topPosition = $this.offsetTop;

				if (currentRowStart !== topPosition) {
					for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
						rowDivs[currentDiv].style.minHeight = currentHighest + 'px';
					}
					rowDivs.length = 0;
					currentRowStart = topPosition;
					currentHighest = $this.offsetHeight;
					rowDivs.push($this);
				} else {
					rowDivs.push($this);
					currentHighest = (currentHighest < $this.offsetHeight) ? $this.offsetHeight : currentHighest;
				}

				for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
					rowDivs[currentDiv].style.minHeight = currentHighest + 'px';
				}
			});
		}

		calculateHeight(elements);
		window.addEventListener('resize', function() {
			calculateHeight(elements);
		});
	};

})();
