;(function($, window, document, undefined) {

	/**
	 * Private variables
	 */
	var _instance;
	
 	var enableScroll = true;
	var scrollTop = 0;
	var currentScrollTop = 0;
	var ease = 0.1;
	var section = document.getElementById('transcroller-body');
	var sectionHeight = section.getBoundingClientRect().height;
	var debounceTime = 10; // events will fire max one time every 10ms
	var events = [];
	var compatible = false;

	var helpers = {
		wHeight : window.innerHeight,
		dHeight : (function(){
			if(compatible){
				return document.body.clientHeight;
			}else{
				return sectionHeight;
			}
		})()
	}

	/**
	 *	Underscore helpers
	 */
	var _now = Date.now || function() {
			return new Date().getTime();
	};
	var _debounce = function(func, wait, immediate) {
			var timeout, args, context, timestamp, result;

			var later = function() {
				var last = _now() - timestamp;

				if (last < wait && last > 0) {
					timeout = setTimeout(later, wait - last);
				} else {
					timeout = null;
					if (!immediate) {
						result = func.apply(context, args);
						if (!timeout) context = args = null;
					}
				}
			};

			return function() {
				context = this;
				args = arguments;
				timestamp = _now();
				var callNow = immediate && !timeout;
				if (!timeout) timeout = setTimeout(later, wait);
				if (callNow) {
					result = func.apply(context, args);
					context = args = null;
				}

				return result;
			};
	};

	var run = function(){
		var t;
		var s = section.style;

		requestAnimationFrame(run);
		
		currentScrollTop += Math.round((scrollTop - currentScrollTop) * ease*100)/100;

		t = 'translateY(' + currentScrollTop + 'px) translateZ(0)';
		s["transform"] = t;
		s["webkitTransform"] = t;
		s["mozTransform"] = t;
		s["msTransform"] = t;
	};

	var init = function() {
		if(compatible){
			initVirtual();
		}else{
			initNative();
		}
	};

	var initVirtual = function(){
		$('body').css('overflow', 'hidden');
		VirtualScroll.on(function(e) {
			var direction = e.deltaY ? e.deltaY < 0 ? -1 : 1 : 0;

			if(transcroller.enableScroll){
				scrollTop += e.deltaY;
				scrollTop = Math.max( (transcroller.sectionHeight - window.innerHeight) * -1, scrollTop);
				scrollTop = Math.min(0, scrollTop);
			}

			action(-scrollTop, direction);
		});

		run();	
	};

	var initNative = function(){
		$(window).on('scroll', function(e){
			var scrollTop = $(window).scrollTop();
			if(transcroller.enableScroll){
				action(scrollTop, -1);
			}else{
				e.preventDefault();
				e.stopPropagation();
			}
		});
	};

	var refresh = function(){
		sectionHeight = section.getBoundingClientRect().height;

		if(enableScroll){
			scrollTop = Math.max( (transcroller.sectionHeight - transcroller.helpers.wHeight) * -1, scrollTop);
			scrollTop = Math.min(0, scrollTop);
		}

		helpers.wHeight = $(window).height();
	};

	var checkCompatibility = function(){
		compatible = true;
	};

	var scrollTopValue = function(){
		return currentScrollTop;
	};

	var enable = function(){
		enableScroll = true;
		if(!compatible){
			$('body').disablescroll('undo');
		}
	};

	var disable = function(){
		enableScroll = false;
		if(!compatible){
			$('body').disablescroll();
		}
	};

	var scrollTo = function(scrollTopVal){
		if(compatible){
			scrollTop = -scrollTopVal;
			setTimeout(function(){
				action(scrollTopVal, -1);
			}, 600);
		}else{
			animateScrollTo(scrollTopVal);
		}
	};

	var addEvent = function(func){
		events.push(func);
	};

	var action = _debounce(function(scrollTop, direction){
		$.each(events, function(){
			this(scrollTop, direction);
		});
	}, debounceTime, true);

	checkCompatibility();

	/**
	 * Global transcroller API
	 */
	var api = {
		init : init,
		addEvent : addEvent,
		scrollTo: scrollTo,
		enableScroll: enableScroll,
		enable: enable,
		disable: disable,
		refresh: refresh,
		helpers: helpers,
		sectionHeight: sectionHeight,
		scrollTop: scrollTopValue,
	};

	/**
	 * Transcroller class
	 */
	var transcroller = (function(){
		return api;
	})();


	// Expose transcroller as a global or requre.js module
	if(typeof define === 'function' && define.amd) {
		define([], function () {
			return transcroller;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = transcroller;
	} else {
		window.transcroller = transcroller;
	}

})(jQuery, window, document);