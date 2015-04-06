;(function(window, document, undefined) {

	/**
	 * Private variables
	 */
	var _ease = 0.1;
	var _debounceTime = 10; // events will fire max one time every 10ms

	var _scrollTop = 0;
	var _currentScrollTop = 0;
 	var _enableScroll = true;
	var _compatible = false;

	var _body = document.getElementById('transcroller-body');
	var _bodyHeight;
	var _events = [];

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
		var transform;

		requestAnimationFrame(run);
		
		_currentScrollTop -= Math.round((_scrollTop + _currentScrollTop) * _ease*100)/100;

		transform = 'translateY(' + (-_currentScrollTop) + 'px) translateZ(0)';
		_body.style["transform"] 		= transform;
		_body.style["webkitTransform"] 	= transform;
		_body.style["mozTransform"] 	= transform;
		_body.style["msTransform"] 		= transform;
	};

	var init = function() {
		_bodyHeight = _body.getBoundingClientRect().height;

		if(_compatible){
			initVirtual();
		}else{
			initNative();
		}
	};

	var initVirtual = function(){
		document.body.style.overflow = 'hidden';

		VirtualScroll.on(function(e) {
			var direction = e.deltaY ? e.deltaY < 0 ? -1 : 1 : 0;

			if(_enableScroll){
				_scrollTop += e.deltaY;
				_scrollTop = Math.max( (_bodyHeight - window.innerHeight) * -1, _scrollTop);
				_scrollTop = Math.min(0, _scrollTop);
			}

			fireEvents(-_scrollTop, direction);
		});

		run();	
	};

	var initNative = function(){
		window.addEventListener('scroll', function(e){
			_scrollTop = _currentScrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
			if(_enableScroll){
				fireEvents(_scrollTop, -1);
			}else{
				e.preventDefault();
				e.stopPropagation();
			}
		});
	};

	var refresh = function(){
		_bodyHeight = _body.getBoundingClientRect().height;

		if(_enableScroll){
			_scrollTop = Math.max( (_bodyHeight - window.innerHeight) * -1, _scrollTop);
			_scrollTop = Math.min(0, _scrollTop);
		}

	};

	var checkCompatibility = function(){
		// TODO: check env and set _compatible to appropriate value
		_compatible = true;
	};

	var scrollTopValue = function(){
		return _currentScrollTop;
	};

	var enable = function(){
		_enableScroll = true;
		if(!_compatible){
			// $('body').disablescroll('undo');
		}
	};

	var disable = function(){
		_enableScroll = false;
		if(!_compatible){
			// $('body').disablescroll();
		}
	};

	var scrollTo = function(scrollTopVal){
		if(_compatible){
			_scrollTop = -scrollTopVal;
			setTimeout(function(){
				fireEvents(scrollTopVal, -1);
			}, 600);
		}else{
			animateScrollTo(scrollTopVal);
		}
	};

	var addEvent = function(func){
		_events.push(func);
	};

	var fireEvents = _debounce(function(scrollTop, direction){
		var index = 0, length = _events.length ;
		for( ; index < length; index++ ) {
			_events[index](scrollTop, direction);
		}
	}, _debounceTime, true);

	checkCompatibility();

	/**
	 * Global transcroller API
	 */
	var api = {
		init : init,
		addEvent : addEvent,
		enable: enable,
		disable: disable,
		refresh: refresh,
		scrollTo: scrollTo,
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

})(window, document);