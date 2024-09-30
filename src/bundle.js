(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn) {
	  var module = { exports: {} };
		return fn(module, module.exports), module.exports;
	}

	/* @preserve
	 * Leaflet 1.7.1, a JS library for interactive maps. http://leafletjs.com
	 * (c) 2010-2019 Vladimir Agafonkin, (c) 2010-2011 CloudMade
	 */

	var leafletSrc = createCommonjsModule(function (module, exports) {
	(function (global, factory) {
	   factory(exports) ;
	}(commonjsGlobal, (function (exports) {
	  var version = "1.7.1";

	  /*
	   * @namespace Util
	   *
	   * Various utility functions, used by Leaflet internally.
	   */

	  // @function extend(dest: Object, src?: Object): Object
	  // Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
	  function extend(dest) {
	  	var i, j, len, src;

	  	for (j = 1, len = arguments.length; j < len; j++) {
	  		src = arguments[j];
	  		for (i in src) {
	  			dest[i] = src[i];
	  		}
	  	}
	  	return dest;
	  }

	  // @function create(proto: Object, properties?: Object): Object
	  // Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
	  var create = Object.create || (function () {
	  	function F() {}
	  	return function (proto) {
	  		F.prototype = proto;
	  		return new F();
	  	};
	  })();

	  // @function bind(fn: Function, …): Function
	  // Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
	  // Has a `L.bind()` shortcut.
	  function bind(fn, obj) {
	  	var slice = Array.prototype.slice;

	  	if (fn.bind) {
	  		return fn.bind.apply(fn, slice.call(arguments, 1));
	  	}

	  	var args = slice.call(arguments, 2);

	  	return function () {
	  		return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
	  	};
	  }

	  // @property lastId: Number
	  // Last unique ID used by [`stamp()`](#util-stamp)
	  var lastId = 0;

	  // @function stamp(obj: Object): Number
	  // Returns the unique ID of an object, assigning it one if it doesn't have it.
	  function stamp(obj) {
	  	/*eslint-disable */
	  	obj._leaflet_id = obj._leaflet_id || ++lastId;
	  	return obj._leaflet_id;
	  	/* eslint-enable */
	  }

	  // @function throttle(fn: Function, time: Number, context: Object): Function
	  // Returns a function which executes function `fn` with the given scope `context`
	  // (so that the `this` keyword refers to `context` inside `fn`'s code). The function
	  // `fn` will be called no more than one time per given amount of `time`. The arguments
	  // received by the bound function will be any arguments passed when binding the
	  // function, followed by any arguments passed when invoking the bound function.
	  // Has an `L.throttle` shortcut.
	  function throttle(fn, time, context) {
	  	var lock, args, wrapperFn, later;

	  	later = function () {
	  		// reset lock and call if queued
	  		lock = false;
	  		if (args) {
	  			wrapperFn.apply(context, args);
	  			args = false;
	  		}
	  	};

	  	wrapperFn = function () {
	  		if (lock) {
	  			// called too soon, queue to call later
	  			args = arguments;

	  		} else {
	  			// call and lock until later
	  			fn.apply(context, arguments);
	  			setTimeout(later, time);
	  			lock = true;
	  		}
	  	};

	  	return wrapperFn;
	  }

	  // @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
	  // Returns the number `num` modulo `range` in such a way so it lies within
	  // `range[0]` and `range[1]`. The returned value will be always smaller than
	  // `range[1]` unless `includeMax` is set to `true`.
	  function wrapNum(x, range, includeMax) {
	  	var max = range[1],
	  	    min = range[0],
	  	    d = max - min;
	  	return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
	  }

	  // @function falseFn(): Function
	  // Returns a function which always returns `false`.
	  function falseFn() { return false; }

	  // @function formatNum(num: Number, digits?: Number): Number
	  // Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
	  function formatNum(num, digits) {
	  	var pow = Math.pow(10, (digits === undefined ? 6 : digits));
	  	return Math.round(num * pow) / pow;
	  }

	  // @function trim(str: String): String
	  // Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
	  function trim(str) {
	  	return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	  }

	  // @function splitWords(str: String): String[]
	  // Trims and splits the string on whitespace and returns the array of parts.
	  function splitWords(str) {
	  	return trim(str).split(/\s+/);
	  }

	  // @function setOptions(obj: Object, options: Object): Object
	  // Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
	  function setOptions(obj, options) {
	  	if (!Object.prototype.hasOwnProperty.call(obj, 'options')) {
	  		obj.options = obj.options ? create(obj.options) : {};
	  	}
	  	for (var i in options) {
	  		obj.options[i] = options[i];
	  	}
	  	return obj.options;
	  }

	  // @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
	  // Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
	  // translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
	  // be appended at the end. If `uppercase` is `true`, the parameter names will
	  // be uppercased (e.g. `'?A=foo&B=bar'`)
	  function getParamString(obj, existingUrl, uppercase) {
	  	var params = [];
	  	for (var i in obj) {
	  		params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
	  	}
	  	return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
	  }

	  var templateRe = /\{ *([\w_-]+) *\}/g;

	  // @function template(str: String, data: Object): String
	  // Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
	  // and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
	  // `('Hello foo, bar')`. You can also specify functions instead of strings for
	  // data values — they will be evaluated passing `data` as an argument.
	  function template(str, data) {
	  	return str.replace(templateRe, function (str, key) {
	  		var value = data[key];

	  		if (value === undefined) {
	  			throw new Error('No value provided for variable ' + str);

	  		} else if (typeof value === 'function') {
	  			value = value(data);
	  		}
	  		return value;
	  	});
	  }

	  // @function isArray(obj): Boolean
	  // Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
	  var isArray = Array.isArray || function (obj) {
	  	return (Object.prototype.toString.call(obj) === '[object Array]');
	  };

	  // @function indexOf(array: Array, el: Object): Number
	  // Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
	  function indexOf(array, el) {
	  	for (var i = 0; i < array.length; i++) {
	  		if (array[i] === el) { return i; }
	  	}
	  	return -1;
	  }

	  // @property emptyImageUrl: String
	  // Data URI string containing a base64-encoded empty GIF image.
	  // Used as a hack to free memory from unused images on WebKit-powered
	  // mobile devices (by setting image `src` to this string).
	  var emptyImageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

	  // inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

	  function getPrefixed(name) {
	  	return window['webkit' + name] || window['moz' + name] || window['ms' + name];
	  }

	  var lastTime = 0;

	  // fallback for IE 7-8
	  function timeoutDefer(fn) {
	  	var time = +new Date(),
	  	    timeToCall = Math.max(0, 16 - (time - lastTime));

	  	lastTime = time + timeToCall;
	  	return window.setTimeout(fn, timeToCall);
	  }

	  var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer;
	  var cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') ||
	  		getPrefixed('CancelRequestAnimationFrame') || function (id) { window.clearTimeout(id); };

	  // @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
	  // Schedules `fn` to be executed when the browser repaints. `fn` is bound to
	  // `context` if given. When `immediate` is set, `fn` is called immediately if
	  // the browser doesn't have native support for
	  // [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
	  // otherwise it's delayed. Returns a request ID that can be used to cancel the request.
	  function requestAnimFrame(fn, context, immediate) {
	  	if (immediate && requestFn === timeoutDefer) {
	  		fn.call(context);
	  	} else {
	  		return requestFn.call(window, bind(fn, context));
	  	}
	  }

	  // @function cancelAnimFrame(id: Number): undefined
	  // Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
	  function cancelAnimFrame(id) {
	  	if (id) {
	  		cancelFn.call(window, id);
	  	}
	  }

	  var Util = ({
	    extend: extend,
	    create: create,
	    bind: bind,
	    lastId: lastId,
	    stamp: stamp,
	    throttle: throttle,
	    wrapNum: wrapNum,
	    falseFn: falseFn,
	    formatNum: formatNum,
	    trim: trim,
	    splitWords: splitWords,
	    setOptions: setOptions,
	    getParamString: getParamString,
	    template: template,
	    isArray: isArray,
	    indexOf: indexOf,
	    emptyImageUrl: emptyImageUrl,
	    requestFn: requestFn,
	    cancelFn: cancelFn,
	    requestAnimFrame: requestAnimFrame,
	    cancelAnimFrame: cancelAnimFrame
	  });

	  // @class Class
	  // @aka L.Class

	  // @section
	  // @uninheritable

	  // Thanks to John Resig and Dean Edwards for inspiration!

	  function Class() {}

	  Class.extend = function (props) {

	  	// @function extend(props: Object): Function
	  	// [Extends the current class](#class-inheritance) given the properties to be included.
	  	// Returns a Javascript function that is a class constructor (to be called with `new`).
	  	var NewClass = function () {

	  		// call the constructor
	  		if (this.initialize) {
	  			this.initialize.apply(this, arguments);
	  		}

	  		// call all constructor hooks
	  		this.callInitHooks();
	  	};

	  	var parentProto = NewClass.__super__ = this.prototype;

	  	var proto = create(parentProto);
	  	proto.constructor = NewClass;

	  	NewClass.prototype = proto;

	  	// inherit parent's statics
	  	for (var i in this) {
	  		if (Object.prototype.hasOwnProperty.call(this, i) && i !== 'prototype' && i !== '__super__') {
	  			NewClass[i] = this[i];
	  		}
	  	}

	  	// mix static properties into the class
	  	if (props.statics) {
	  		extend(NewClass, props.statics);
	  		delete props.statics;
	  	}

	  	// mix includes into the prototype
	  	if (props.includes) {
	  		checkDeprecatedMixinEvents(props.includes);
	  		extend.apply(null, [proto].concat(props.includes));
	  		delete props.includes;
	  	}

	  	// merge options
	  	if (proto.options) {
	  		props.options = extend(create(proto.options), props.options);
	  	}

	  	// mix given properties into the prototype
	  	extend(proto, props);

	  	proto._initHooks = [];

	  	// add method for calling all hooks
	  	proto.callInitHooks = function () {

	  		if (this._initHooksCalled) { return; }

	  		if (parentProto.callInitHooks) {
	  			parentProto.callInitHooks.call(this);
	  		}

	  		this._initHooksCalled = true;

	  		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
	  			proto._initHooks[i].call(this);
	  		}
	  	};

	  	return NewClass;
	  };


	  // @function include(properties: Object): this
	  // [Includes a mixin](#class-includes) into the current class.
	  Class.include = function (props) {
	  	extend(this.prototype, props);
	  	return this;
	  };

	  // @function mergeOptions(options: Object): this
	  // [Merges `options`](#class-options) into the defaults of the class.
	  Class.mergeOptions = function (options) {
	  	extend(this.prototype.options, options);
	  	return this;
	  };

	  // @function addInitHook(fn: Function): this
	  // Adds a [constructor hook](#class-constructor-hooks) to the class.
	  Class.addInitHook = function (fn) { // (Function) || (String, args...)
	  	var args = Array.prototype.slice.call(arguments, 1);

	  	var init = typeof fn === 'function' ? fn : function () {
	  		this[fn].apply(this, args);
	  	};

	  	this.prototype._initHooks = this.prototype._initHooks || [];
	  	this.prototype._initHooks.push(init);
	  	return this;
	  };

	  function checkDeprecatedMixinEvents(includes) {
	  	if (typeof L === 'undefined' || !L || !L.Mixin) { return; }

	  	includes = isArray(includes) ? includes : [includes];

	  	for (var i = 0; i < includes.length; i++) {
	  		if (includes[i] === L.Mixin.Events) {
	  			console.warn('Deprecated include of L.Mixin.Events: ' +
	  				'this property will be removed in future releases, ' +
	  				'please inherit from L.Evented instead.', new Error().stack);
	  		}
	  	}
	  }

	  /*
	   * @class Evented
	   * @aka L.Evented
	   * @inherits Class
	   *
	   * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
	   *
	   * @example
	   *
	   * ```js
	   * map.on('click', function(e) {
	   * 	alert(e.latlng);
	   * } );
	   * ```
	   *
	   * Leaflet deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
	   *
	   * ```js
	   * function onClick(e) { ... }
	   *
	   * map.on('click', onClick);
	   * map.off('click', onClick);
	   * ```
	   */

	  var Events = {
	  	/* @method on(type: String, fn: Function, context?: Object): this
	  	 * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
	  	 *
	  	 * @alternative
	  	 * @method on(eventMap: Object): this
	  	 * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
	  	 */
	  	on: function (types, fn, context) {

	  		// types can be a map of types/handlers
	  		if (typeof types === 'object') {
	  			for (var type in types) {
	  				// we don't process space-separated events here for performance;
	  				// it's a hot path since Layer uses the on(obj) syntax
	  				this._on(type, types[type], fn);
	  			}

	  		} else {
	  			// types can be a string of space-separated words
	  			types = splitWords(types);

	  			for (var i = 0, len = types.length; i < len; i++) {
	  				this._on(types[i], fn, context);
	  			}
	  		}

	  		return this;
	  	},

	  	/* @method off(type: String, fn?: Function, context?: Object): this
	  	 * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
	  	 *
	  	 * @alternative
	  	 * @method off(eventMap: Object): this
	  	 * Removes a set of type/listener pairs.
	  	 *
	  	 * @alternative
	  	 * @method off: this
	  	 * Removes all listeners to all events on the object. This includes implicitly attached events.
	  	 */
	  	off: function (types, fn, context) {

	  		if (!types) {
	  			// clear all listeners if called without arguments
	  			delete this._events;

	  		} else if (typeof types === 'object') {
	  			for (var type in types) {
	  				this._off(type, types[type], fn);
	  			}

	  		} else {
	  			types = splitWords(types);

	  			for (var i = 0, len = types.length; i < len; i++) {
	  				this._off(types[i], fn, context);
	  			}
	  		}

	  		return this;
	  	},

	  	// attach listener (without syntactic sugar now)
	  	_on: function (type, fn, context) {
	  		this._events = this._events || {};

	  		/* get/init listeners for type */
	  		var typeListeners = this._events[type];
	  		if (!typeListeners) {
	  			typeListeners = [];
	  			this._events[type] = typeListeners;
	  		}

	  		if (context === this) {
	  			// Less memory footprint.
	  			context = undefined;
	  		}
	  		var newListener = {fn: fn, ctx: context},
	  		    listeners = typeListeners;

	  		// check if fn already there
	  		for (var i = 0, len = listeners.length; i < len; i++) {
	  			if (listeners[i].fn === fn && listeners[i].ctx === context) {
	  				return;
	  			}
	  		}

	  		listeners.push(newListener);
	  	},

	  	_off: function (type, fn, context) {
	  		var listeners,
	  		    i,
	  		    len;

	  		if (!this._events) { return; }

	  		listeners = this._events[type];

	  		if (!listeners) {
	  			return;
	  		}

	  		if (!fn) {
	  			// Set all removed listeners to noop so they are not called if remove happens in fire
	  			for (i = 0, len = listeners.length; i < len; i++) {
	  				listeners[i].fn = falseFn;
	  			}
	  			// clear all listeners for a type if function isn't specified
	  			delete this._events[type];
	  			return;
	  		}

	  		if (context === this) {
	  			context = undefined;
	  		}

	  		if (listeners) {

	  			// find fn and remove it
	  			for (i = 0, len = listeners.length; i < len; i++) {
	  				var l = listeners[i];
	  				if (l.ctx !== context) { continue; }
	  				if (l.fn === fn) {

	  					// set the removed listener to noop so that's not called if remove happens in fire
	  					l.fn = falseFn;

	  					if (this._firingCount) {
	  						/* copy array in case events are being fired */
	  						this._events[type] = listeners = listeners.slice();
	  					}
	  					listeners.splice(i, 1);

	  					return;
	  				}
	  			}
	  		}
	  	},

	  	// @method fire(type: String, data?: Object, propagate?: Boolean): this
	  	// Fires an event of the specified type. You can optionally provide an data
	  	// object — the first argument of the listener function will contain its
	  	// properties. The event can optionally be propagated to event parents.
	  	fire: function (type, data, propagate) {
	  		if (!this.listens(type, propagate)) { return this; }

	  		var event = extend({}, data, {
	  			type: type,
	  			target: this,
	  			sourceTarget: data && data.sourceTarget || this
	  		});

	  		if (this._events) {
	  			var listeners = this._events[type];

	  			if (listeners) {
	  				this._firingCount = (this._firingCount + 1) || 1;
	  				for (var i = 0, len = listeners.length; i < len; i++) {
	  					var l = listeners[i];
	  					l.fn.call(l.ctx || this, event);
	  				}

	  				this._firingCount--;
	  			}
	  		}

	  		if (propagate) {
	  			// propagate the event to parents (set with addEventParent)
	  			this._propagateEvent(event);
	  		}

	  		return this;
	  	},

	  	// @method listens(type: String): Boolean
	  	// Returns `true` if a particular event type has any listeners attached to it.
	  	listens: function (type, propagate) {
	  		var listeners = this._events && this._events[type];
	  		if (listeners && listeners.length) { return true; }

	  		if (propagate) {
	  			// also check parents for listeners if event propagates
	  			for (var id in this._eventParents) {
	  				if (this._eventParents[id].listens(type, propagate)) { return true; }
	  			}
	  		}
	  		return false;
	  	},

	  	// @method once(…): this
	  	// Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
	  	once: function (types, fn, context) {

	  		if (typeof types === 'object') {
	  			for (var type in types) {
	  				this.once(type, types[type], fn);
	  			}
	  			return this;
	  		}

	  		var handler = bind(function () {
	  			this
	  			    .off(types, fn, context)
	  			    .off(types, handler, context);
	  		}, this);

	  		// add a listener that's executed once and removed after that
	  		return this
	  		    .on(types, fn, context)
	  		    .on(types, handler, context);
	  	},

	  	// @method addEventParent(obj: Evented): this
	  	// Adds an event parent - an `Evented` that will receive propagated events
	  	addEventParent: function (obj) {
	  		this._eventParents = this._eventParents || {};
	  		this._eventParents[stamp(obj)] = obj;
	  		return this;
	  	},

	  	// @method removeEventParent(obj: Evented): this
	  	// Removes an event parent, so it will stop receiving propagated events
	  	removeEventParent: function (obj) {
	  		if (this._eventParents) {
	  			delete this._eventParents[stamp(obj)];
	  		}
	  		return this;
	  	},

	  	_propagateEvent: function (e) {
	  		for (var id in this._eventParents) {
	  			this._eventParents[id].fire(e.type, extend({
	  				layer: e.target,
	  				propagatedFrom: e.target
	  			}, e), true);
	  		}
	  	}
	  };

	  // aliases; we should ditch those eventually

	  // @method addEventListener(…): this
	  // Alias to [`on(…)`](#evented-on)
	  Events.addEventListener = Events.on;

	  // @method removeEventListener(…): this
	  // Alias to [`off(…)`](#evented-off)

	  // @method clearAllEventListeners(…): this
	  // Alias to [`off()`](#evented-off)
	  Events.removeEventListener = Events.clearAllEventListeners = Events.off;

	  // @method addOneTimeEventListener(…): this
	  // Alias to [`once(…)`](#evented-once)
	  Events.addOneTimeEventListener = Events.once;

	  // @method fireEvent(…): this
	  // Alias to [`fire(…)`](#evented-fire)
	  Events.fireEvent = Events.fire;

	  // @method hasEventListeners(…): Boolean
	  // Alias to [`listens(…)`](#evented-listens)
	  Events.hasEventListeners = Events.listens;

	  var Evented = Class.extend(Events);

	  /*
	   * @class Point
	   * @aka L.Point
	   *
	   * Represents a point with `x` and `y` coordinates in pixels.
	   *
	   * @example
	   *
	   * ```js
	   * var point = L.point(200, 300);
	   * ```
	   *
	   * All Leaflet methods and options that accept `Point` objects also accept them in a simple Array form (unless noted otherwise), so these lines are equivalent:
	   *
	   * ```js
	   * map.panBy([200, 300]);
	   * map.panBy(L.point(200, 300));
	   * ```
	   *
	   * Note that `Point` does not inherit from Leaflet's `Class` object,
	   * which means new classes can't inherit from it, and new methods
	   * can't be added to it with the `include` function.
	   */

	  function Point(x, y, round) {
	  	// @property x: Number; The `x` coordinate of the point
	  	this.x = (round ? Math.round(x) : x);
	  	// @property y: Number; The `y` coordinate of the point
	  	this.y = (round ? Math.round(y) : y);
	  }

	  var trunc = Math.trunc || function (v) {
	  	return v > 0 ? Math.floor(v) : Math.ceil(v);
	  };

	  Point.prototype = {

	  	// @method clone(): Point
	  	// Returns a copy of the current point.
	  	clone: function () {
	  		return new Point(this.x, this.y);
	  	},

	  	// @method add(otherPoint: Point): Point
	  	// Returns the result of addition of the current and the given points.
	  	add: function (point) {
	  		// non-destructive, returns a new point
	  		return this.clone()._add(toPoint(point));
	  	},

	  	_add: function (point) {
	  		// destructive, used directly for performance in situations where it's safe to modify existing point
	  		this.x += point.x;
	  		this.y += point.y;
	  		return this;
	  	},

	  	// @method subtract(otherPoint: Point): Point
	  	// Returns the result of subtraction of the given point from the current.
	  	subtract: function (point) {
	  		return this.clone()._subtract(toPoint(point));
	  	},

	  	_subtract: function (point) {
	  		this.x -= point.x;
	  		this.y -= point.y;
	  		return this;
	  	},

	  	// @method divideBy(num: Number): Point
	  	// Returns the result of division of the current point by the given number.
	  	divideBy: function (num) {
	  		return this.clone()._divideBy(num);
	  	},

	  	_divideBy: function (num) {
	  		this.x /= num;
	  		this.y /= num;
	  		return this;
	  	},

	  	// @method multiplyBy(num: Number): Point
	  	// Returns the result of multiplication of the current point by the given number.
	  	multiplyBy: function (num) {
	  		return this.clone()._multiplyBy(num);
	  	},

	  	_multiplyBy: function (num) {
	  		this.x *= num;
	  		this.y *= num;
	  		return this;
	  	},

	  	// @method scaleBy(scale: Point): Point
	  	// Multiply each coordinate of the current point by each coordinate of
	  	// `scale`. In linear algebra terms, multiply the point by the
	  	// [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
	  	// defined by `scale`.
	  	scaleBy: function (point) {
	  		return new Point(this.x * point.x, this.y * point.y);
	  	},

	  	// @method unscaleBy(scale: Point): Point
	  	// Inverse of `scaleBy`. Divide each coordinate of the current point by
	  	// each coordinate of `scale`.
	  	unscaleBy: function (point) {
	  		return new Point(this.x / point.x, this.y / point.y);
	  	},

	  	// @method round(): Point
	  	// Returns a copy of the current point with rounded coordinates.
	  	round: function () {
	  		return this.clone()._round();
	  	},

	  	_round: function () {
	  		this.x = Math.round(this.x);
	  		this.y = Math.round(this.y);
	  		return this;
	  	},

	  	// @method floor(): Point
	  	// Returns a copy of the current point with floored coordinates (rounded down).
	  	floor: function () {
	  		return this.clone()._floor();
	  	},

	  	_floor: function () {
	  		this.x = Math.floor(this.x);
	  		this.y = Math.floor(this.y);
	  		return this;
	  	},

	  	// @method ceil(): Point
	  	// Returns a copy of the current point with ceiled coordinates (rounded up).
	  	ceil: function () {
	  		return this.clone()._ceil();
	  	},

	  	_ceil: function () {
	  		this.x = Math.ceil(this.x);
	  		this.y = Math.ceil(this.y);
	  		return this;
	  	},

	  	// @method trunc(): Point
	  	// Returns a copy of the current point with truncated coordinates (rounded towards zero).
	  	trunc: function () {
	  		return this.clone()._trunc();
	  	},

	  	_trunc: function () {
	  		this.x = trunc(this.x);
	  		this.y = trunc(this.y);
	  		return this;
	  	},

	  	// @method distanceTo(otherPoint: Point): Number
	  	// Returns the cartesian distance between the current and the given points.
	  	distanceTo: function (point) {
	  		point = toPoint(point);

	  		var x = point.x - this.x,
	  		    y = point.y - this.y;

	  		return Math.sqrt(x * x + y * y);
	  	},

	  	// @method equals(otherPoint: Point): Boolean
	  	// Returns `true` if the given point has the same coordinates.
	  	equals: function (point) {
	  		point = toPoint(point);

	  		return point.x === this.x &&
	  		       point.y === this.y;
	  	},

	  	// @method contains(otherPoint: Point): Boolean
	  	// Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
	  	contains: function (point) {
	  		point = toPoint(point);

	  		return Math.abs(point.x) <= Math.abs(this.x) &&
	  		       Math.abs(point.y) <= Math.abs(this.y);
	  	},

	  	// @method toString(): String
	  	// Returns a string representation of the point for debugging purposes.
	  	toString: function () {
	  		return 'Point(' +
	  		        formatNum(this.x) + ', ' +
	  		        formatNum(this.y) + ')';
	  	}
	  };

	  // @factory L.point(x: Number, y: Number, round?: Boolean)
	  // Creates a Point object with the given `x` and `y` coordinates. If optional `round` is set to true, rounds the `x` and `y` values.

	  // @alternative
	  // @factory L.point(coords: Number[])
	  // Expects an array of the form `[x, y]` instead.

	  // @alternative
	  // @factory L.point(coords: Object)
	  // Expects a plain object of the form `{x: Number, y: Number}` instead.
	  function toPoint(x, y, round) {
	  	if (x instanceof Point) {
	  		return x;
	  	}
	  	if (isArray(x)) {
	  		return new Point(x[0], x[1]);
	  	}
	  	if (x === undefined || x === null) {
	  		return x;
	  	}
	  	if (typeof x === 'object' && 'x' in x && 'y' in x) {
	  		return new Point(x.x, x.y);
	  	}
	  	return new Point(x, y, round);
	  }

	  /*
	   * @class Bounds
	   * @aka L.Bounds
	   *
	   * Represents a rectangular area in pixel coordinates.
	   *
	   * @example
	   *
	   * ```js
	   * var p1 = L.point(10, 10),
	   * p2 = L.point(40, 60),
	   * bounds = L.bounds(p1, p2);
	   * ```
	   *
	   * All Leaflet methods that accept `Bounds` objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
	   *
	   * ```js
	   * otherBounds.intersects([[10, 10], [40, 60]]);
	   * ```
	   *
	   * Note that `Bounds` does not inherit from Leaflet's `Class` object,
	   * which means new classes can't inherit from it, and new methods
	   * can't be added to it with the `include` function.
	   */

	  function Bounds(a, b) {
	  	if (!a) { return; }

	  	var points = b ? [a, b] : a;

	  	for (var i = 0, len = points.length; i < len; i++) {
	  		this.extend(points[i]);
	  	}
	  }

	  Bounds.prototype = {
	  	// @method extend(point: Point): this
	  	// Extends the bounds to contain the given point.
	  	extend: function (point) { // (Point)
	  		point = toPoint(point);

	  		// @property min: Point
	  		// The top left corner of the rectangle.
	  		// @property max: Point
	  		// The bottom right corner of the rectangle.
	  		if (!this.min && !this.max) {
	  			this.min = point.clone();
	  			this.max = point.clone();
	  		} else {
	  			this.min.x = Math.min(point.x, this.min.x);
	  			this.max.x = Math.max(point.x, this.max.x);
	  			this.min.y = Math.min(point.y, this.min.y);
	  			this.max.y = Math.max(point.y, this.max.y);
	  		}
	  		return this;
	  	},

	  	// @method getCenter(round?: Boolean): Point
	  	// Returns the center point of the bounds.
	  	getCenter: function (round) {
	  		return new Point(
	  		        (this.min.x + this.max.x) / 2,
	  		        (this.min.y + this.max.y) / 2, round);
	  	},

	  	// @method getBottomLeft(): Point
	  	// Returns the bottom-left point of the bounds.
	  	getBottomLeft: function () {
	  		return new Point(this.min.x, this.max.y);
	  	},

	  	// @method getTopRight(): Point
	  	// Returns the top-right point of the bounds.
	  	getTopRight: function () { // -> Point
	  		return new Point(this.max.x, this.min.y);
	  	},

	  	// @method getTopLeft(): Point
	  	// Returns the top-left point of the bounds (i.e. [`this.min`](#bounds-min)).
	  	getTopLeft: function () {
	  		return this.min; // left, top
	  	},

	  	// @method getBottomRight(): Point
	  	// Returns the bottom-right point of the bounds (i.e. [`this.max`](#bounds-max)).
	  	getBottomRight: function () {
	  		return this.max; // right, bottom
	  	},

	  	// @method getSize(): Point
	  	// Returns the size of the given bounds
	  	getSize: function () {
	  		return this.max.subtract(this.min);
	  	},

	  	// @method contains(otherBounds: Bounds): Boolean
	  	// Returns `true` if the rectangle contains the given one.
	  	// @alternative
	  	// @method contains(point: Point): Boolean
	  	// Returns `true` if the rectangle contains the given point.
	  	contains: function (obj) {
	  		var min, max;

	  		if (typeof obj[0] === 'number' || obj instanceof Point) {
	  			obj = toPoint(obj);
	  		} else {
	  			obj = toBounds(obj);
	  		}

	  		if (obj instanceof Bounds) {
	  			min = obj.min;
	  			max = obj.max;
	  		} else {
	  			min = max = obj;
	  		}

	  		return (min.x >= this.min.x) &&
	  		       (max.x <= this.max.x) &&
	  		       (min.y >= this.min.y) &&
	  		       (max.y <= this.max.y);
	  	},

	  	// @method intersects(otherBounds: Bounds): Boolean
	  	// Returns `true` if the rectangle intersects the given bounds. Two bounds
	  	// intersect if they have at least one point in common.
	  	intersects: function (bounds) { // (Bounds) -> Boolean
	  		bounds = toBounds(bounds);

	  		var min = this.min,
	  		    max = this.max,
	  		    min2 = bounds.min,
	  		    max2 = bounds.max,
	  		    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
	  		    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

	  		return xIntersects && yIntersects;
	  	},

	  	// @method overlaps(otherBounds: Bounds): Boolean
	  	// Returns `true` if the rectangle overlaps the given bounds. Two bounds
	  	// overlap if their intersection is an area.
	  	overlaps: function (bounds) { // (Bounds) -> Boolean
	  		bounds = toBounds(bounds);

	  		var min = this.min,
	  		    max = this.max,
	  		    min2 = bounds.min,
	  		    max2 = bounds.max,
	  		    xOverlaps = (max2.x > min.x) && (min2.x < max.x),
	  		    yOverlaps = (max2.y > min.y) && (min2.y < max.y);

	  		return xOverlaps && yOverlaps;
	  	},

	  	isValid: function () {
	  		return !!(this.min && this.max);
	  	}
	  };


	  // @factory L.bounds(corner1: Point, corner2: Point)
	  // Creates a Bounds object from two corners coordinate pairs.
	  // @alternative
	  // @factory L.bounds(points: Point[])
	  // Creates a Bounds object from the given array of points.
	  function toBounds(a, b) {
	  	if (!a || a instanceof Bounds) {
	  		return a;
	  	}
	  	return new Bounds(a, b);
	  }

	  /*
	   * @class LatLngBounds
	   * @aka L.LatLngBounds
	   *
	   * Represents a rectangular geographical area on a map.
	   *
	   * @example
	   *
	   * ```js
	   * var corner1 = L.latLng(40.712, -74.227),
	   * corner2 = L.latLng(40.774, -74.125),
	   * bounds = L.latLngBounds(corner1, corner2);
	   * ```
	   *
	   * All Leaflet methods that accept LatLngBounds objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
	   *
	   * ```js
	   * map.fitBounds([
	   * 	[40.712, -74.227],
	   * 	[40.774, -74.125]
	   * ]);
	   * ```
	   *
	   * Caution: if the area crosses the antimeridian (often confused with the International Date Line), you must specify corners _outside_ the [-180, 180] degrees longitude range.
	   *
	   * Note that `LatLngBounds` does not inherit from Leaflet's `Class` object,
	   * which means new classes can't inherit from it, and new methods
	   * can't be added to it with the `include` function.
	   */

	  function LatLngBounds(corner1, corner2) { // (LatLng, LatLng) or (LatLng[])
	  	if (!corner1) { return; }

	  	var latlngs = corner2 ? [corner1, corner2] : corner1;

	  	for (var i = 0, len = latlngs.length; i < len; i++) {
	  		this.extend(latlngs[i]);
	  	}
	  }

	  LatLngBounds.prototype = {

	  	// @method extend(latlng: LatLng): this
	  	// Extend the bounds to contain the given point

	  	// @alternative
	  	// @method extend(otherBounds: LatLngBounds): this
	  	// Extend the bounds to contain the given bounds
	  	extend: function (obj) {
	  		var sw = this._southWest,
	  		    ne = this._northEast,
	  		    sw2, ne2;

	  		if (obj instanceof LatLng) {
	  			sw2 = obj;
	  			ne2 = obj;

	  		} else if (obj instanceof LatLngBounds) {
	  			sw2 = obj._southWest;
	  			ne2 = obj._northEast;

	  			if (!sw2 || !ne2) { return this; }

	  		} else {
	  			return obj ? this.extend(toLatLng(obj) || toLatLngBounds(obj)) : this;
	  		}

	  		if (!sw && !ne) {
	  			this._southWest = new LatLng(sw2.lat, sw2.lng);
	  			this._northEast = new LatLng(ne2.lat, ne2.lng);
	  		} else {
	  			sw.lat = Math.min(sw2.lat, sw.lat);
	  			sw.lng = Math.min(sw2.lng, sw.lng);
	  			ne.lat = Math.max(ne2.lat, ne.lat);
	  			ne.lng = Math.max(ne2.lng, ne.lng);
	  		}

	  		return this;
	  	},

	  	// @method pad(bufferRatio: Number): LatLngBounds
	  	// Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
	  	// For example, a ratio of 0.5 extends the bounds by 50% in each direction.
	  	// Negative values will retract the bounds.
	  	pad: function (bufferRatio) {
	  		var sw = this._southWest,
	  		    ne = this._northEast,
	  		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
	  		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

	  		return new LatLngBounds(
	  		        new LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
	  		        new LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
	  	},

	  	// @method getCenter(): LatLng
	  	// Returns the center point of the bounds.
	  	getCenter: function () {
	  		return new LatLng(
	  		        (this._southWest.lat + this._northEast.lat) / 2,
	  		        (this._southWest.lng + this._northEast.lng) / 2);
	  	},

	  	// @method getSouthWest(): LatLng
	  	// Returns the south-west point of the bounds.
	  	getSouthWest: function () {
	  		return this._southWest;
	  	},

	  	// @method getNorthEast(): LatLng
	  	// Returns the north-east point of the bounds.
	  	getNorthEast: function () {
	  		return this._northEast;
	  	},

	  	// @method getNorthWest(): LatLng
	  	// Returns the north-west point of the bounds.
	  	getNorthWest: function () {
	  		return new LatLng(this.getNorth(), this.getWest());
	  	},

	  	// @method getSouthEast(): LatLng
	  	// Returns the south-east point of the bounds.
	  	getSouthEast: function () {
	  		return new LatLng(this.getSouth(), this.getEast());
	  	},

	  	// @method getWest(): Number
	  	// Returns the west longitude of the bounds
	  	getWest: function () {
	  		return this._southWest.lng;
	  	},

	  	// @method getSouth(): Number
	  	// Returns the south latitude of the bounds
	  	getSouth: function () {
	  		return this._southWest.lat;
	  	},

	  	// @method getEast(): Number
	  	// Returns the east longitude of the bounds
	  	getEast: function () {
	  		return this._northEast.lng;
	  	},

	  	// @method getNorth(): Number
	  	// Returns the north latitude of the bounds
	  	getNorth: function () {
	  		return this._northEast.lat;
	  	},

	  	// @method contains(otherBounds: LatLngBounds): Boolean
	  	// Returns `true` if the rectangle contains the given one.

	  	// @alternative
	  	// @method contains (latlng: LatLng): Boolean
	  	// Returns `true` if the rectangle contains the given point.
	  	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
	  		if (typeof obj[0] === 'number' || obj instanceof LatLng || 'lat' in obj) {
	  			obj = toLatLng(obj);
	  		} else {
	  			obj = toLatLngBounds(obj);
	  		}

	  		var sw = this._southWest,
	  		    ne = this._northEast,
	  		    sw2, ne2;

	  		if (obj instanceof LatLngBounds) {
	  			sw2 = obj.getSouthWest();
	  			ne2 = obj.getNorthEast();
	  		} else {
	  			sw2 = ne2 = obj;
	  		}

	  		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
	  		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
	  	},

	  	// @method intersects(otherBounds: LatLngBounds): Boolean
	  	// Returns `true` if the rectangle intersects the given bounds. Two bounds intersect if they have at least one point in common.
	  	intersects: function (bounds) {
	  		bounds = toLatLngBounds(bounds);

	  		var sw = this._southWest,
	  		    ne = this._northEast,
	  		    sw2 = bounds.getSouthWest(),
	  		    ne2 = bounds.getNorthEast(),

	  		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
	  		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

	  		return latIntersects && lngIntersects;
	  	},

	  	// @method overlaps(otherBounds: LatLngBounds): Boolean
	  	// Returns `true` if the rectangle overlaps the given bounds. Two bounds overlap if their intersection is an area.
	  	overlaps: function (bounds) {
	  		bounds = toLatLngBounds(bounds);

	  		var sw = this._southWest,
	  		    ne = this._northEast,
	  		    sw2 = bounds.getSouthWest(),
	  		    ne2 = bounds.getNorthEast(),

	  		    latOverlaps = (ne2.lat > sw.lat) && (sw2.lat < ne.lat),
	  		    lngOverlaps = (ne2.lng > sw.lng) && (sw2.lng < ne.lng);

	  		return latOverlaps && lngOverlaps;
	  	},

	  	// @method toBBoxString(): String
	  	// Returns a string with bounding box coordinates in a 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. Useful for sending requests to web services that return geo data.
	  	toBBoxString: function () {
	  		return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
	  	},

	  	// @method equals(otherBounds: LatLngBounds, maxMargin?: Number): Boolean
	  	// Returns `true` if the rectangle is equivalent (within a small margin of error) to the given bounds. The margin of error can be overridden by setting `maxMargin` to a small number.
	  	equals: function (bounds, maxMargin) {
	  		if (!bounds) { return false; }

	  		bounds = toLatLngBounds(bounds);

	  		return this._southWest.equals(bounds.getSouthWest(), maxMargin) &&
	  		       this._northEast.equals(bounds.getNorthEast(), maxMargin);
	  	},

	  	// @method isValid(): Boolean
	  	// Returns `true` if the bounds are properly initialized.
	  	isValid: function () {
	  		return !!(this._southWest && this._northEast);
	  	}
	  };

	  // TODO International date line?

	  // @factory L.latLngBounds(corner1: LatLng, corner2: LatLng)
	  // Creates a `LatLngBounds` object by defining two diagonally opposite corners of the rectangle.

	  // @alternative
	  // @factory L.latLngBounds(latlngs: LatLng[])
	  // Creates a `LatLngBounds` object defined by the geographical points it contains. Very useful for zooming the map to fit a particular set of locations with [`fitBounds`](#map-fitbounds).
	  function toLatLngBounds(a, b) {
	  	if (a instanceof LatLngBounds) {
	  		return a;
	  	}
	  	return new LatLngBounds(a, b);
	  }

	  /* @class LatLng
	   * @aka L.LatLng
	   *
	   * Represents a geographical point with a certain latitude and longitude.
	   *
	   * @example
	   *
	   * ```
	   * var latlng = L.latLng(50.5, 30.5);
	   * ```
	   *
	   * All Leaflet methods that accept LatLng objects also accept them in a simple Array form and simple object form (unless noted otherwise), so these lines are equivalent:
	   *
	   * ```
	   * map.panTo([50, 30]);
	   * map.panTo({lon: 30, lat: 50});
	   * map.panTo({lat: 50, lng: 30});
	   * map.panTo(L.latLng(50, 30));
	   * ```
	   *
	   * Note that `LatLng` does not inherit from Leaflet's `Class` object,
	   * which means new classes can't inherit from it, and new methods
	   * can't be added to it with the `include` function.
	   */

	  function LatLng(lat, lng, alt) {
	  	if (isNaN(lat) || isNaN(lng)) {
	  		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
	  	}

	  	// @property lat: Number
	  	// Latitude in degrees
	  	this.lat = +lat;

	  	// @property lng: Number
	  	// Longitude in degrees
	  	this.lng = +lng;

	  	// @property alt: Number
	  	// Altitude in meters (optional)
	  	if (alt !== undefined) {
	  		this.alt = +alt;
	  	}
	  }

	  LatLng.prototype = {
	  	// @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
	  	// Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overridden by setting `maxMargin` to a small number.
	  	equals: function (obj, maxMargin) {
	  		if (!obj) { return false; }

	  		obj = toLatLng(obj);

	  		var margin = Math.max(
	  		        Math.abs(this.lat - obj.lat),
	  		        Math.abs(this.lng - obj.lng));

	  		return margin <= (maxMargin === undefined ? 1.0E-9 : maxMargin);
	  	},

	  	// @method toString(): String
	  	// Returns a string representation of the point (for debugging purposes).
	  	toString: function (precision) {
	  		return 'LatLng(' +
	  		        formatNum(this.lat, precision) + ', ' +
	  		        formatNum(this.lng, precision) + ')';
	  	},

	  	// @method distanceTo(otherLatLng: LatLng): Number
	  	// Returns the distance (in meters) to the given `LatLng` calculated using the [Spherical Law of Cosines](https://en.wikipedia.org/wiki/Spherical_law_of_cosines).
	  	distanceTo: function (other) {
	  		return Earth.distance(this, toLatLng(other));
	  	},

	  	// @method wrap(): LatLng
	  	// Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
	  	wrap: function () {
	  		return Earth.wrapLatLng(this);
	  	},

	  	// @method toBounds(sizeInMeters: Number): LatLngBounds
	  	// Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters/2` meters apart from the `LatLng`.
	  	toBounds: function (sizeInMeters) {
	  		var latAccuracy = 180 * sizeInMeters / 40075017,
	  		    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * this.lat);

	  		return toLatLngBounds(
	  		        [this.lat - latAccuracy, this.lng - lngAccuracy],
	  		        [this.lat + latAccuracy, this.lng + lngAccuracy]);
	  	},

	  	clone: function () {
	  		return new LatLng(this.lat, this.lng, this.alt);
	  	}
	  };



	  // @factory L.latLng(latitude: Number, longitude: Number, altitude?: Number): LatLng
	  // Creates an object representing a geographical point with the given latitude and longitude (and optionally altitude).

	  // @alternative
	  // @factory L.latLng(coords: Array): LatLng
	  // Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.

	  // @alternative
	  // @factory L.latLng(coords: Object): LatLng
	  // Expects an plain object of the form `{lat: Number, lng: Number}` or `{lat: Number, lng: Number, alt: Number}` instead.

	  function toLatLng(a, b, c) {
	  	if (a instanceof LatLng) {
	  		return a;
	  	}
	  	if (isArray(a) && typeof a[0] !== 'object') {
	  		if (a.length === 3) {
	  			return new LatLng(a[0], a[1], a[2]);
	  		}
	  		if (a.length === 2) {
	  			return new LatLng(a[0], a[1]);
	  		}
	  		return null;
	  	}
	  	if (a === undefined || a === null) {
	  		return a;
	  	}
	  	if (typeof a === 'object' && 'lat' in a) {
	  		return new LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
	  	}
	  	if (b === undefined) {
	  		return null;
	  	}
	  	return new LatLng(a, b, c);
	  }

	  /*
	   * @namespace CRS
	   * @crs L.CRS.Base
	   * Object that defines coordinate reference systems for projecting
	   * geographical points into pixel (screen) coordinates and back (and to
	   * coordinates in other units for [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services). See
	   * [spatial reference system](http://en.wikipedia.org/wiki/Coordinate_reference_system).
	   *
	   * Leaflet defines the most usual CRSs by default. If you want to use a
	   * CRS not defined by default, take a look at the
	   * [Proj4Leaflet](https://github.com/kartena/Proj4Leaflet) plugin.
	   *
	   * Note that the CRS instances do not inherit from Leaflet's `Class` object,
	   * and can't be instantiated. Also, new classes can't inherit from them,
	   * and methods can't be added to them with the `include` function.
	   */

	  var CRS = {
	  	// @method latLngToPoint(latlng: LatLng, zoom: Number): Point
	  	// Projects geographical coordinates into pixel coordinates for a given zoom.
	  	latLngToPoint: function (latlng, zoom) {
	  		var projectedPoint = this.projection.project(latlng),
	  		    scale = this.scale(zoom);

	  		return this.transformation._transform(projectedPoint, scale);
	  	},

	  	// @method pointToLatLng(point: Point, zoom: Number): LatLng
	  	// The inverse of `latLngToPoint`. Projects pixel coordinates on a given
	  	// zoom into geographical coordinates.
	  	pointToLatLng: function (point, zoom) {
	  		var scale = this.scale(zoom),
	  		    untransformedPoint = this.transformation.untransform(point, scale);

	  		return this.projection.unproject(untransformedPoint);
	  	},

	  	// @method project(latlng: LatLng): Point
	  	// Projects geographical coordinates into coordinates in units accepted for
	  	// this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
	  	project: function (latlng) {
	  		return this.projection.project(latlng);
	  	},

	  	// @method unproject(point: Point): LatLng
	  	// Given a projected coordinate returns the corresponding LatLng.
	  	// The inverse of `project`.
	  	unproject: function (point) {
	  		return this.projection.unproject(point);
	  	},

	  	// @method scale(zoom: Number): Number
	  	// Returns the scale used when transforming projected coordinates into
	  	// pixel coordinates for a particular zoom. For example, it returns
	  	// `256 * 2^zoom` for Mercator-based CRS.
	  	scale: function (zoom) {
	  		return 256 * Math.pow(2, zoom);
	  	},

	  	// @method zoom(scale: Number): Number
	  	// Inverse of `scale()`, returns the zoom level corresponding to a scale
	  	// factor of `scale`.
	  	zoom: function (scale) {
	  		return Math.log(scale / 256) / Math.LN2;
	  	},

	  	// @method getProjectedBounds(zoom: Number): Bounds
	  	// Returns the projection's bounds scaled and transformed for the provided `zoom`.
	  	getProjectedBounds: function (zoom) {
	  		if (this.infinite) { return null; }

	  		var b = this.projection.bounds,
	  		    s = this.scale(zoom),
	  		    min = this.transformation.transform(b.min, s),
	  		    max = this.transformation.transform(b.max, s);

	  		return new Bounds(min, max);
	  	},

	  	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
	  	// Returns the distance between two geographical coordinates.

	  	// @property code: String
	  	// Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
	  	//
	  	// @property wrapLng: Number[]
	  	// An array of two numbers defining whether the longitude (horizontal) coordinate
	  	// axis wraps around a given range and how. Defaults to `[-180, 180]` in most
	  	// geographical CRSs. If `undefined`, the longitude axis does not wrap around.
	  	//
	  	// @property wrapLat: Number[]
	  	// Like `wrapLng`, but for the latitude (vertical) axis.

	  	// wrapLng: [min, max],
	  	// wrapLat: [min, max],

	  	// @property infinite: Boolean
	  	// If true, the coordinate space will be unbounded (infinite in both axes)
	  	infinite: false,

	  	// @method wrapLatLng(latlng: LatLng): LatLng
	  	// Returns a `LatLng` where lat and lng has been wrapped according to the
	  	// CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
	  	wrapLatLng: function (latlng) {
	  		var lng = this.wrapLng ? wrapNum(latlng.lng, this.wrapLng, true) : latlng.lng,
	  		    lat = this.wrapLat ? wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat,
	  		    alt = latlng.alt;

	  		return new LatLng(lat, lng, alt);
	  	},

	  	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
	  	// Returns a `LatLngBounds` with the same size as the given one, ensuring
	  	// that its center is within the CRS's bounds.
	  	// Only accepts actual `L.LatLngBounds` instances, not arrays.
	  	wrapLatLngBounds: function (bounds) {
	  		var center = bounds.getCenter(),
	  		    newCenter = this.wrapLatLng(center),
	  		    latShift = center.lat - newCenter.lat,
	  		    lngShift = center.lng - newCenter.lng;

	  		if (latShift === 0 && lngShift === 0) {
	  			return bounds;
	  		}

	  		var sw = bounds.getSouthWest(),
	  		    ne = bounds.getNorthEast(),
	  		    newSw = new LatLng(sw.lat - latShift, sw.lng - lngShift),
	  		    newNe = new LatLng(ne.lat - latShift, ne.lng - lngShift);

	  		return new LatLngBounds(newSw, newNe);
	  	}
	  };

	  /*
	   * @namespace CRS
	   * @crs L.CRS.Earth
	   *
	   * Serves as the base for CRS that are global such that they cover the earth.
	   * Can only be used as the base for other CRS and cannot be used directly,
	   * since it does not have a `code`, `projection` or `transformation`. `distance()` returns
	   * meters.
	   */

	  var Earth = extend({}, CRS, {
	  	wrapLng: [-180, 180],

	  	// Mean Earth Radius, as recommended for use by
	  	// the International Union of Geodesy and Geophysics,
	  	// see http://rosettacode.org/wiki/Haversine_formula
	  	R: 6371000,

	  	// distance between two geographical points using spherical law of cosines approximation
	  	distance: function (latlng1, latlng2) {
	  		var rad = Math.PI / 180,
	  		    lat1 = latlng1.lat * rad,
	  		    lat2 = latlng2.lat * rad,
	  		    sinDLat = Math.sin((latlng2.lat - latlng1.lat) * rad / 2),
	  		    sinDLon = Math.sin((latlng2.lng - latlng1.lng) * rad / 2),
	  		    a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon,
	  		    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	  		return this.R * c;
	  	}
	  });

	  /*
	   * @namespace Projection
	   * @projection L.Projection.SphericalMercator
	   *
	   * Spherical Mercator projection — the most common projection for online maps,
	   * used by almost all free and commercial tile providers. Assumes that Earth is
	   * a sphere. Used by the `EPSG:3857` CRS.
	   */

	  var earthRadius = 6378137;

	  var SphericalMercator = {

	  	R: earthRadius,
	  	MAX_LATITUDE: 85.0511287798,

	  	project: function (latlng) {
	  		var d = Math.PI / 180,
	  		    max = this.MAX_LATITUDE,
	  		    lat = Math.max(Math.min(max, latlng.lat), -max),
	  		    sin = Math.sin(lat * d);

	  		return new Point(
	  			this.R * latlng.lng * d,
	  			this.R * Math.log((1 + sin) / (1 - sin)) / 2);
	  	},

	  	unproject: function (point) {
	  		var d = 180 / Math.PI;

	  		return new LatLng(
	  			(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
	  			point.x * d / this.R);
	  	},

	  	bounds: (function () {
	  		var d = earthRadius * Math.PI;
	  		return new Bounds([-d, -d], [d, d]);
	  	})()
	  };

	  /*
	   * @class Transformation
	   * @aka L.Transformation
	   *
	   * Represents an affine transformation: a set of coefficients `a`, `b`, `c`, `d`
	   * for transforming a point of a form `(x, y)` into `(a*x + b, c*y + d)` and doing
	   * the reverse. Used by Leaflet in its projections code.
	   *
	   * @example
	   *
	   * ```js
	   * var transformation = L.transformation(2, 5, -1, 10),
	   * 	p = L.point(1, 2),
	   * 	p2 = transformation.transform(p), //  L.point(7, 8)
	   * 	p3 = transformation.untransform(p2); //  L.point(1, 2)
	   * ```
	   */


	  // factory new L.Transformation(a: Number, b: Number, c: Number, d: Number)
	  // Creates a `Transformation` object with the given coefficients.
	  function Transformation(a, b, c, d) {
	  	if (isArray(a)) {
	  		// use array properties
	  		this._a = a[0];
	  		this._b = a[1];
	  		this._c = a[2];
	  		this._d = a[3];
	  		return;
	  	}
	  	this._a = a;
	  	this._b = b;
	  	this._c = c;
	  	this._d = d;
	  }

	  Transformation.prototype = {
	  	// @method transform(point: Point, scale?: Number): Point
	  	// Returns a transformed point, optionally multiplied by the given scale.
	  	// Only accepts actual `L.Point` instances, not arrays.
	  	transform: function (point, scale) { // (Point, Number) -> Point
	  		return this._transform(point.clone(), scale);
	  	},

	  	// destructive transform (faster)
	  	_transform: function (point, scale) {
	  		scale = scale || 1;
	  		point.x = scale * (this._a * point.x + this._b);
	  		point.y = scale * (this._c * point.y + this._d);
	  		return point;
	  	},

	  	// @method untransform(point: Point, scale?: Number): Point
	  	// Returns the reverse transformation of the given point, optionally divided
	  	// by the given scale. Only accepts actual `L.Point` instances, not arrays.
	  	untransform: function (point, scale) {
	  		scale = scale || 1;
	  		return new Point(
	  		        (point.x / scale - this._b) / this._a,
	  		        (point.y / scale - this._d) / this._c);
	  	}
	  };

	  // factory L.transformation(a: Number, b: Number, c: Number, d: Number)

	  // @factory L.transformation(a: Number, b: Number, c: Number, d: Number)
	  // Instantiates a Transformation object with the given coefficients.

	  // @alternative
	  // @factory L.transformation(coefficients: Array): Transformation
	  // Expects an coefficients array of the form
	  // `[a: Number, b: Number, c: Number, d: Number]`.

	  function toTransformation(a, b, c, d) {
	  	return new Transformation(a, b, c, d);
	  }

	  /*
	   * @namespace CRS
	   * @crs L.CRS.EPSG3857
	   *
	   * The most common CRS for online maps, used by almost all free and commercial
	   * tile providers. Uses Spherical Mercator projection. Set in by default in
	   * Map's `crs` option.
	   */

	  var EPSG3857 = extend({}, Earth, {
	  	code: 'EPSG:3857',
	  	projection: SphericalMercator,

	  	transformation: (function () {
	  		var scale = 0.5 / (Math.PI * SphericalMercator.R);
	  		return toTransformation(scale, 0.5, -scale, 0.5);
	  	}())
	  });

	  var EPSG900913 = extend({}, EPSG3857, {
	  	code: 'EPSG:900913'
	  });

	  // @namespace SVG; @section
	  // There are several static functions which can be called without instantiating L.SVG:

	  // @function create(name: String): SVGElement
	  // Returns a instance of [SVGElement](https://developer.mozilla.org/docs/Web/API/SVGElement),
	  // corresponding to the class name passed. For example, using 'line' will return
	  // an instance of [SVGLineElement](https://developer.mozilla.org/docs/Web/API/SVGLineElement).
	  function svgCreate(name) {
	  	return document.createElementNS('http://www.w3.org/2000/svg', name);
	  }

	  // @function pointsToPath(rings: Point[], closed: Boolean): String
	  // Generates a SVG path string for multiple rings, with each ring turning
	  // into "M..L..L.." instructions
	  function pointsToPath(rings, closed) {
	  	var str = '',
	  	i, j, len, len2, points, p;

	  	for (i = 0, len = rings.length; i < len; i++) {
	  		points = rings[i];

	  		for (j = 0, len2 = points.length; j < len2; j++) {
	  			p = points[j];
	  			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
	  		}

	  		// closes the ring for polygons; "x" is VML syntax
	  		str += closed ? (svg ? 'z' : 'x') : '';
	  	}

	  	// SVG complains about empty path strings
	  	return str || 'M0 0';
	  }

	  /*
	   * @namespace Browser
	   * @aka L.Browser
	   *
	   * A namespace with static properties for browser/feature detection used by Leaflet internally.
	   *
	   * @example
	   *
	   * ```js
	   * if (L.Browser.ielt9) {
	   *   alert('Upgrade your browser, dude!');
	   * }
	   * ```
	   */

	  var style$1 = document.documentElement.style;

	  // @property ie: Boolean; `true` for all Internet Explorer versions (not Edge).
	  var ie = 'ActiveXObject' in window;

	  // @property ielt9: Boolean; `true` for Internet Explorer versions less than 9.
	  var ielt9 = ie && !document.addEventListener;

	  // @property edge: Boolean; `true` for the Edge web browser.
	  var edge = 'msLaunchUri' in navigator && !('documentMode' in document);

	  // @property webkit: Boolean;
	  // `true` for webkit-based browsers like Chrome and Safari (including mobile versions).
	  var webkit = userAgentContains('webkit');

	  // @property android: Boolean
	  // `true` for any browser running on an Android platform.
	  var android = userAgentContains('android');

	  // @property android23: Boolean; `true` for browsers running on Android 2 or Android 3.
	  var android23 = userAgentContains('android 2') || userAgentContains('android 3');

	  /* See https://stackoverflow.com/a/17961266 for details on detecting stock Android */
	  var webkitVer = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10); // also matches AppleWebKit
	  // @property androidStock: Boolean; `true` for the Android stock browser (i.e. not Chrome)
	  var androidStock = android && userAgentContains('Google') && webkitVer < 537 && !('AudioNode' in window);

	  // @property opera: Boolean; `true` for the Opera browser
	  var opera = !!window.opera;

	  // @property chrome: Boolean; `true` for the Chrome browser.
	  var chrome = !edge && userAgentContains('chrome');

	  // @property gecko: Boolean; `true` for gecko-based browsers like Firefox.
	  var gecko = userAgentContains('gecko') && !webkit && !opera && !ie;

	  // @property safari: Boolean; `true` for the Safari browser.
	  var safari = !chrome && userAgentContains('safari');

	  var phantom = userAgentContains('phantom');

	  // @property opera12: Boolean
	  // `true` for the Opera browser supporting CSS transforms (version 12 or later).
	  var opera12 = 'OTransition' in style$1;

	  // @property win: Boolean; `true` when the browser is running in a Windows platform
	  var win = navigator.platform.indexOf('Win') === 0;

	  // @property ie3d: Boolean; `true` for all Internet Explorer versions supporting CSS transforms.
	  var ie3d = ie && ('transition' in style$1);

	  // @property webkit3d: Boolean; `true` for webkit-based browsers supporting CSS transforms.
	  var webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23;

	  // @property gecko3d: Boolean; `true` for gecko-based browsers supporting CSS transforms.
	  var gecko3d = 'MozPerspective' in style$1;

	  // @property any3d: Boolean
	  // `true` for all browsers supporting CSS transforms.
	  var any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantom;

	  // @property mobile: Boolean; `true` for all browsers running in a mobile device.
	  var mobile = typeof orientation !== 'undefined' || userAgentContains('mobile');

	  // @property mobileWebkit: Boolean; `true` for all webkit-based browsers in a mobile device.
	  var mobileWebkit = mobile && webkit;

	  // @property mobileWebkit3d: Boolean
	  // `true` for all webkit-based browsers in a mobile device supporting CSS transforms.
	  var mobileWebkit3d = mobile && webkit3d;

	  // @property msPointer: Boolean
	  // `true` for browsers implementing the Microsoft touch events model (notably IE10).
	  var msPointer = !window.PointerEvent && window.MSPointerEvent;

	  // @property pointer: Boolean
	  // `true` for all browsers supporting [pointer events](https://msdn.microsoft.com/en-us/library/dn433244%28v=vs.85%29.aspx).
	  var pointer = !!(window.PointerEvent || msPointer);

	  // @property touch: Boolean
	  // `true` for all browsers supporting [touch events](https://developer.mozilla.org/docs/Web/API/Touch_events).
	  // This does not necessarily mean that the browser is running in a computer with
	  // a touchscreen, it only means that the browser is capable of understanding
	  // touch events.
	  var touch = !window.L_NO_TOUCH && (pointer || 'ontouchstart' in window ||
	  		(window.DocumentTouch && document instanceof window.DocumentTouch));

	  // @property mobileOpera: Boolean; `true` for the Opera browser in a mobile device.
	  var mobileOpera = mobile && opera;

	  // @property mobileGecko: Boolean
	  // `true` for gecko-based browsers running in a mobile device.
	  var mobileGecko = mobile && gecko;

	  // @property retina: Boolean
	  // `true` for browsers on a high-resolution "retina" screen or on any screen when browser's display zoom is more than 100%.
	  var retina = (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1;

	  // @property passiveEvents: Boolean
	  // `true` for browsers that support passive events.
	  var passiveEvents = (function () {
	  	var supportsPassiveOption = false;
	  	try {
	  		var opts = Object.defineProperty({}, 'passive', {
	  			get: function () { // eslint-disable-line getter-return
	  				supportsPassiveOption = true;
	  			}
	  		});
	  		window.addEventListener('testPassiveEventSupport', falseFn, opts);
	  		window.removeEventListener('testPassiveEventSupport', falseFn, opts);
	  	} catch (e) {
	  		// Errors can safely be ignored since this is only a browser support test.
	  	}
	  	return supportsPassiveOption;
	  }());

	  // @property canvas: Boolean
	  // `true` when the browser supports [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
	  var canvas = (function () {
	  	return !!document.createElement('canvas').getContext;
	  }());

	  // @property svg: Boolean
	  // `true` when the browser supports [SVG](https://developer.mozilla.org/docs/Web/SVG).
	  var svg = !!(document.createElementNS && svgCreate('svg').createSVGRect);

	  // @property vml: Boolean
	  // `true` if the browser supports [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language).
	  var vml = !svg && (function () {
	  	try {
	  		var div = document.createElement('div');
	  		div.innerHTML = '<v:shape adj="1"/>';

	  		var shape = div.firstChild;
	  		shape.style.behavior = 'url(#default#VML)';

	  		return shape && (typeof shape.adj === 'object');

	  	} catch (e) {
	  		return false;
	  	}
	  }());


	  function userAgentContains(str) {
	  	return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
	  }

	  var Browser = ({
	    ie: ie,
	    ielt9: ielt9,
	    edge: edge,
	    webkit: webkit,
	    android: android,
	    android23: android23,
	    androidStock: androidStock,
	    opera: opera,
	    chrome: chrome,
	    gecko: gecko,
	    safari: safari,
	    phantom: phantom,
	    opera12: opera12,
	    win: win,
	    ie3d: ie3d,
	    webkit3d: webkit3d,
	    gecko3d: gecko3d,
	    any3d: any3d,
	    mobile: mobile,
	    mobileWebkit: mobileWebkit,
	    mobileWebkit3d: mobileWebkit3d,
	    msPointer: msPointer,
	    pointer: pointer,
	    touch: touch,
	    mobileOpera: mobileOpera,
	    mobileGecko: mobileGecko,
	    retina: retina,
	    passiveEvents: passiveEvents,
	    canvas: canvas,
	    svg: svg,
	    vml: vml
	  });

	  /*
	   * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
	   */


	  var POINTER_DOWN =   msPointer ? 'MSPointerDown'   : 'pointerdown';
	  var POINTER_MOVE =   msPointer ? 'MSPointerMove'   : 'pointermove';
	  var POINTER_UP =     msPointer ? 'MSPointerUp'     : 'pointerup';
	  var POINTER_CANCEL = msPointer ? 'MSPointerCancel' : 'pointercancel';

	  var _pointers = {};
	  var _pointerDocListener = false;

	  // Provides a touch events wrapper for (ms)pointer events.
	  // ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

	  function addPointerListener(obj, type, handler, id) {
	  	if (type === 'touchstart') {
	  		_addPointerStart(obj, handler, id);

	  	} else if (type === 'touchmove') {
	  		_addPointerMove(obj, handler, id);

	  	} else if (type === 'touchend') {
	  		_addPointerEnd(obj, handler, id);
	  	}

	  	return this;
	  }

	  function removePointerListener(obj, type, id) {
	  	var handler = obj['_leaflet_' + type + id];

	  	if (type === 'touchstart') {
	  		obj.removeEventListener(POINTER_DOWN, handler, false);

	  	} else if (type === 'touchmove') {
	  		obj.removeEventListener(POINTER_MOVE, handler, false);

	  	} else if (type === 'touchend') {
	  		obj.removeEventListener(POINTER_UP, handler, false);
	  		obj.removeEventListener(POINTER_CANCEL, handler, false);
	  	}

	  	return this;
	  }

	  function _addPointerStart(obj, handler, id) {
	  	var onDown = bind(function (e) {
	  		// IE10 specific: MsTouch needs preventDefault. See #2000
	  		if (e.MSPOINTER_TYPE_TOUCH && e.pointerType === e.MSPOINTER_TYPE_TOUCH) {
	  			preventDefault(e);
	  		}

	  		_handlePointer(e, handler);
	  	});

	  	obj['_leaflet_touchstart' + id] = onDown;
	  	obj.addEventListener(POINTER_DOWN, onDown, false);

	  	// need to keep track of what pointers and how many are active to provide e.touches emulation
	  	if (!_pointerDocListener) {
	  		// we listen document as any drags that end by moving the touch off the screen get fired there
	  		document.addEventListener(POINTER_DOWN, _globalPointerDown, true);
	  		document.addEventListener(POINTER_MOVE, _globalPointerMove, true);
	  		document.addEventListener(POINTER_UP, _globalPointerUp, true);
	  		document.addEventListener(POINTER_CANCEL, _globalPointerUp, true);

	  		_pointerDocListener = true;
	  	}
	  }

	  function _globalPointerDown(e) {
	  	_pointers[e.pointerId] = e;
	  }

	  function _globalPointerMove(e) {
	  	if (_pointers[e.pointerId]) {
	  		_pointers[e.pointerId] = e;
	  	}
	  }

	  function _globalPointerUp(e) {
	  	delete _pointers[e.pointerId];
	  }

	  function _handlePointer(e, handler) {
	  	e.touches = [];
	  	for (var i in _pointers) {
	  		e.touches.push(_pointers[i]);
	  	}
	  	e.changedTouches = [e];

	  	handler(e);
	  }

	  function _addPointerMove(obj, handler, id) {
	  	var onMove = function (e) {
	  		// don't fire touch moves when mouse isn't down
	  		if ((e.pointerType === (e.MSPOINTER_TYPE_MOUSE || 'mouse')) && e.buttons === 0) {
	  			return;
	  		}

	  		_handlePointer(e, handler);
	  	};

	  	obj['_leaflet_touchmove' + id] = onMove;
	  	obj.addEventListener(POINTER_MOVE, onMove, false);
	  }

	  function _addPointerEnd(obj, handler, id) {
	  	var onUp = function (e) {
	  		_handlePointer(e, handler);
	  	};

	  	obj['_leaflet_touchend' + id] = onUp;
	  	obj.addEventListener(POINTER_UP, onUp, false);
	  	obj.addEventListener(POINTER_CANCEL, onUp, false);
	  }

	  /*
	   * Extends the event handling code with double tap support for mobile browsers.
	   */

	  var _touchstart = msPointer ? 'MSPointerDown' : pointer ? 'pointerdown' : 'touchstart';
	  var _touchend = msPointer ? 'MSPointerUp' : pointer ? 'pointerup' : 'touchend';
	  var _pre = '_leaflet_';

	  // inspired by Zepto touch code by Thomas Fuchs
	  function addDoubleTapListener(obj, handler, id) {
	  	var last, touch$$1,
	  	    doubleTap = false,
	  	    delay = 250;

	  	function onTouchStart(e) {

	  		if (pointer) {
	  			if (!e.isPrimary) { return; }
	  			if (e.pointerType === 'mouse') { return; } // mouse fires native dblclick
	  		} else if (e.touches.length > 1) {
	  			return;
	  		}

	  		var now = Date.now(),
	  		    delta = now - (last || now);

	  		touch$$1 = e.touches ? e.touches[0] : e;
	  		doubleTap = (delta > 0 && delta <= delay);
	  		last = now;
	  	}

	  	function onTouchEnd(e) {
	  		if (doubleTap && !touch$$1.cancelBubble) {
	  			if (pointer) {
	  				if (e.pointerType === 'mouse') { return; }
	  				// work around .type being readonly with MSPointer* events
	  				var newTouch = {},
	  				    prop, i;

	  				for (i in touch$$1) {
	  					prop = touch$$1[i];
	  					newTouch[i] = prop && prop.bind ? prop.bind(touch$$1) : prop;
	  				}
	  				touch$$1 = newTouch;
	  			}
	  			touch$$1.type = 'dblclick';
	  			touch$$1.button = 0;
	  			handler(touch$$1);
	  			last = null;
	  		}
	  	}

	  	obj[_pre + _touchstart + id] = onTouchStart;
	  	obj[_pre + _touchend + id] = onTouchEnd;
	  	obj[_pre + 'dblclick' + id] = handler;

	  	obj.addEventListener(_touchstart, onTouchStart, passiveEvents ? {passive: false} : false);
	  	obj.addEventListener(_touchend, onTouchEnd, passiveEvents ? {passive: false} : false);

	  	// On some platforms (notably, chrome<55 on win10 + touchscreen + mouse),
	  	// the browser doesn't fire touchend/pointerup events but does fire
	  	// native dblclicks. See #4127.
	  	// Edge 14 also fires native dblclicks, but only for pointerType mouse, see #5180.
	  	obj.addEventListener('dblclick', handler, false);

	  	return this;
	  }

	  function removeDoubleTapListener(obj, id) {
	  	var touchstart = obj[_pre + _touchstart + id],
	  	    touchend = obj[_pre + _touchend + id],
	  	    dblclick = obj[_pre + 'dblclick' + id];

	  	obj.removeEventListener(_touchstart, touchstart, passiveEvents ? {passive: false} : false);
	  	obj.removeEventListener(_touchend, touchend, passiveEvents ? {passive: false} : false);
	  	obj.removeEventListener('dblclick', dblclick, false);

	  	return this;
	  }

	  /*
	   * @namespace DomUtil
	   *
	   * Utility functions to work with the [DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model)
	   * tree, used by Leaflet internally.
	   *
	   * Most functions expecting or returning a `HTMLElement` also work for
	   * SVG elements. The only difference is that classes refer to CSS classes
	   * in HTML and SVG classes in SVG.
	   */


	  // @property TRANSFORM: String
	  // Vendor-prefixed transform style name (e.g. `'webkitTransform'` for WebKit).
	  var TRANSFORM = testProp(
	  	['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

	  // webkitTransition comes first because some browser versions that drop vendor prefix don't do
	  // the same for the transitionend event, in particular the Android 4.1 stock browser

	  // @property TRANSITION: String
	  // Vendor-prefixed transition style name.
	  var TRANSITION = testProp(
	  	['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

	  // @property TRANSITION_END: String
	  // Vendor-prefixed transitionend event name.
	  var TRANSITION_END =
	  	TRANSITION === 'webkitTransition' || TRANSITION === 'OTransition' ? TRANSITION + 'End' : 'transitionend';


	  // @function get(id: String|HTMLElement): HTMLElement
	  // Returns an element given its DOM id, or returns the element itself
	  // if it was passed directly.
	  function get(id) {
	  	return typeof id === 'string' ? document.getElementById(id) : id;
	  }

	  // @function getStyle(el: HTMLElement, styleAttrib: String): String
	  // Returns the value for a certain style attribute on an element,
	  // including computed values or values set through CSS.
	  function getStyle(el, style) {
	  	var value = el.style[style] || (el.currentStyle && el.currentStyle[style]);

	  	if ((!value || value === 'auto') && document.defaultView) {
	  		var css = document.defaultView.getComputedStyle(el, null);
	  		value = css ? css[style] : null;
	  	}
	  	return value === 'auto' ? null : value;
	  }

	  // @function create(tagName: String, className?: String, container?: HTMLElement): HTMLElement
	  // Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
	  function create$1(tagName, className, container) {
	  	var el = document.createElement(tagName);
	  	el.className = className || '';

	  	if (container) {
	  		container.appendChild(el);
	  	}
	  	return el;
	  }

	  // @function remove(el: HTMLElement)
	  // Removes `el` from its parent element
	  function remove(el) {
	  	var parent = el.parentNode;
	  	if (parent) {
	  		parent.removeChild(el);
	  	}
	  }

	  // @function empty(el: HTMLElement)
	  // Removes all of `el`'s children elements from `el`
	  function empty(el) {
	  	while (el.firstChild) {
	  		el.removeChild(el.firstChild);
	  	}
	  }

	  // @function toFront(el: HTMLElement)
	  // Makes `el` the last child of its parent, so it renders in front of the other children.
	  function toFront(el) {
	  	var parent = el.parentNode;
	  	if (parent && parent.lastChild !== el) {
	  		parent.appendChild(el);
	  	}
	  }

	  // @function toBack(el: HTMLElement)
	  // Makes `el` the first child of its parent, so it renders behind the other children.
	  function toBack(el) {
	  	var parent = el.parentNode;
	  	if (parent && parent.firstChild !== el) {
	  		parent.insertBefore(el, parent.firstChild);
	  	}
	  }

	  // @function hasClass(el: HTMLElement, name: String): Boolean
	  // Returns `true` if the element's class attribute contains `name`.
	  function hasClass(el, name) {
	  	if (el.classList !== undefined) {
	  		return el.classList.contains(name);
	  	}
	  	var className = getClass(el);
	  	return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
	  }

	  // @function addClass(el: HTMLElement, name: String)
	  // Adds `name` to the element's class attribute.
	  function addClass(el, name) {
	  	if (el.classList !== undefined) {
	  		var classes = splitWords(name);
	  		for (var i = 0, len = classes.length; i < len; i++) {
	  			el.classList.add(classes[i]);
	  		}
	  	} else if (!hasClass(el, name)) {
	  		var className = getClass(el);
	  		setClass(el, (className ? className + ' ' : '') + name);
	  	}
	  }

	  // @function removeClass(el: HTMLElement, name: String)
	  // Removes `name` from the element's class attribute.
	  function removeClass(el, name) {
	  	if (el.classList !== undefined) {
	  		el.classList.remove(name);
	  	} else {
	  		setClass(el, trim((' ' + getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
	  	}
	  }

	  // @function setClass(el: HTMLElement, name: String)
	  // Sets the element's class.
	  function setClass(el, name) {
	  	if (el.className.baseVal === undefined) {
	  		el.className = name;
	  	} else {
	  		// in case of SVG element
	  		el.className.baseVal = name;
	  	}
	  }

	  // @function getClass(el: HTMLElement): String
	  // Returns the element's class.
	  function getClass(el) {
	  	// Check if the element is an SVGElementInstance and use the correspondingElement instead
	  	// (Required for linked SVG elements in IE11.)
	  	if (el.correspondingElement) {
	  		el = el.correspondingElement;
	  	}
	  	return el.className.baseVal === undefined ? el.className : el.className.baseVal;
	  }

	  // @function setOpacity(el: HTMLElement, opacity: Number)
	  // Set the opacity of an element (including old IE support).
	  // `opacity` must be a number from `0` to `1`.
	  function setOpacity(el, value) {
	  	if ('opacity' in el.style) {
	  		el.style.opacity = value;
	  	} else if ('filter' in el.style) {
	  		_setOpacityIE(el, value);
	  	}
	  }

	  function _setOpacityIE(el, value) {
	  	var filter = false,
	  	    filterName = 'DXImageTransform.Microsoft.Alpha';

	  	// filters collection throws an error if we try to retrieve a filter that doesn't exist
	  	try {
	  		filter = el.filters.item(filterName);
	  	} catch (e) {
	  		// don't set opacity to 1 if we haven't already set an opacity,
	  		// it isn't needed and breaks transparent pngs.
	  		if (value === 1) { return; }
	  	}

	  	value = Math.round(value * 100);

	  	if (filter) {
	  		filter.Enabled = (value !== 100);
	  		filter.Opacity = value;
	  	} else {
	  		el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
	  	}
	  }

	  // @function testProp(props: String[]): String|false
	  // Goes through the array of style names and returns the first name
	  // that is a valid style name for an element. If no such name is found,
	  // it returns false. Useful for vendor-prefixed styles like `transform`.
	  function testProp(props) {
	  	var style = document.documentElement.style;

	  	for (var i = 0; i < props.length; i++) {
	  		if (props[i] in style) {
	  			return props[i];
	  		}
	  	}
	  	return false;
	  }

	  // @function setTransform(el: HTMLElement, offset: Point, scale?: Number)
	  // Resets the 3D CSS transform of `el` so it is translated by `offset` pixels
	  // and optionally scaled by `scale`. Does not have an effect if the
	  // browser doesn't support 3D CSS transforms.
	  function setTransform(el, offset, scale) {
	  	var pos = offset || new Point(0, 0);

	  	el.style[TRANSFORM] =
	  		(ie3d ?
	  			'translate(' + pos.x + 'px,' + pos.y + 'px)' :
	  			'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
	  		(scale ? ' scale(' + scale + ')' : '');
	  }

	  // @function setPosition(el: HTMLElement, position: Point)
	  // Sets the position of `el` to coordinates specified by `position`,
	  // using CSS translate or top/left positioning depending on the browser
	  // (used by Leaflet internally to position its layers).
	  function setPosition(el, point) {

	  	/*eslint-disable */
	  	el._leaflet_pos = point;
	  	/* eslint-enable */

	  	if (any3d) {
	  		setTransform(el, point);
	  	} else {
	  		el.style.left = point.x + 'px';
	  		el.style.top = point.y + 'px';
	  	}
	  }

	  // @function getPosition(el: HTMLElement): Point
	  // Returns the coordinates of an element previously positioned with setPosition.
	  function getPosition(el) {
	  	// this method is only used for elements previously positioned using setPosition,
	  	// so it's safe to cache the position for performance

	  	return el._leaflet_pos || new Point(0, 0);
	  }

	  // @function disableTextSelection()
	  // Prevents the user from generating `selectstart` DOM events, usually generated
	  // when the user drags the mouse through a page with text. Used internally
	  // by Leaflet to override the behaviour of any click-and-drag interaction on
	  // the map. Affects drag interactions on the whole document.

	  // @function enableTextSelection()
	  // Cancels the effects of a previous [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection).
	  var disableTextSelection;
	  var enableTextSelection;
	  var _userSelect;
	  if ('onselectstart' in document) {
	  	disableTextSelection = function () {
	  		on(window, 'selectstart', preventDefault);
	  	};
	  	enableTextSelection = function () {
	  		off(window, 'selectstart', preventDefault);
	  	};
	  } else {
	  	var userSelectProperty = testProp(
	  		['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

	  	disableTextSelection = function () {
	  		if (userSelectProperty) {
	  			var style = document.documentElement.style;
	  			_userSelect = style[userSelectProperty];
	  			style[userSelectProperty] = 'none';
	  		}
	  	};
	  	enableTextSelection = function () {
	  		if (userSelectProperty) {
	  			document.documentElement.style[userSelectProperty] = _userSelect;
	  			_userSelect = undefined;
	  		}
	  	};
	  }

	  // @function disableImageDrag()
	  // As [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection), but
	  // for `dragstart` DOM events, usually generated when the user drags an image.
	  function disableImageDrag() {
	  	on(window, 'dragstart', preventDefault);
	  }

	  // @function enableImageDrag()
	  // Cancels the effects of a previous [`L.DomUtil.disableImageDrag`](#domutil-disabletextselection).
	  function enableImageDrag() {
	  	off(window, 'dragstart', preventDefault);
	  }

	  var _outlineElement, _outlineStyle;
	  // @function preventOutline(el: HTMLElement)
	  // Makes the [outline](https://developer.mozilla.org/docs/Web/CSS/outline)
	  // of the element `el` invisible. Used internally by Leaflet to prevent
	  // focusable elements from displaying an outline when the user performs a
	  // drag interaction on them.
	  function preventOutline(element) {
	  	while (element.tabIndex === -1) {
	  		element = element.parentNode;
	  	}
	  	if (!element.style) { return; }
	  	restoreOutline();
	  	_outlineElement = element;
	  	_outlineStyle = element.style.outline;
	  	element.style.outline = 'none';
	  	on(window, 'keydown', restoreOutline);
	  }

	  // @function restoreOutline()
	  // Cancels the effects of a previous [`L.DomUtil.preventOutline`]().
	  function restoreOutline() {
	  	if (!_outlineElement) { return; }
	  	_outlineElement.style.outline = _outlineStyle;
	  	_outlineElement = undefined;
	  	_outlineStyle = undefined;
	  	off(window, 'keydown', restoreOutline);
	  }

	  // @function getSizedParentNode(el: HTMLElement): HTMLElement
	  // Finds the closest parent node which size (width and height) is not null.
	  function getSizedParentNode(element) {
	  	do {
	  		element = element.parentNode;
	  	} while ((!element.offsetWidth || !element.offsetHeight) && element !== document.body);
	  	return element;
	  }

	  // @function getScale(el: HTMLElement): Object
	  // Computes the CSS scale currently applied on the element.
	  // Returns an object with `x` and `y` members as horizontal and vertical scales respectively,
	  // and `boundingClientRect` as the result of [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
	  function getScale(element) {
	  	var rect = element.getBoundingClientRect(); // Read-only in old browsers.

	  	return {
	  		x: rect.width / element.offsetWidth || 1,
	  		y: rect.height / element.offsetHeight || 1,
	  		boundingClientRect: rect
	  	};
	  }

	  var DomUtil = ({
	    TRANSFORM: TRANSFORM,
	    TRANSITION: TRANSITION,
	    TRANSITION_END: TRANSITION_END,
	    get: get,
	    getStyle: getStyle,
	    create: create$1,
	    remove: remove,
	    empty: empty,
	    toFront: toFront,
	    toBack: toBack,
	    hasClass: hasClass,
	    addClass: addClass,
	    removeClass: removeClass,
	    setClass: setClass,
	    getClass: getClass,
	    setOpacity: setOpacity,
	    testProp: testProp,
	    setTransform: setTransform,
	    setPosition: setPosition,
	    getPosition: getPosition,
	    disableTextSelection: disableTextSelection,
	    enableTextSelection: enableTextSelection,
	    disableImageDrag: disableImageDrag,
	    enableImageDrag: enableImageDrag,
	    preventOutline: preventOutline,
	    restoreOutline: restoreOutline,
	    getSizedParentNode: getSizedParentNode,
	    getScale: getScale
	  });

	  /*
	   * @namespace DomEvent
	   * Utility functions to work with the [DOM events](https://developer.mozilla.org/docs/Web/API/Event), used by Leaflet internally.
	   */

	  // Inspired by John Resig, Dean Edwards and YUI addEvent implementations.

	  // @function on(el: HTMLElement, types: String, fn: Function, context?: Object): this
	  // Adds a listener function (`fn`) to a particular DOM event type of the
	  // element `el`. You can optionally specify the context of the listener
	  // (object the `this` keyword will point to). You can also pass several
	  // space-separated types (e.g. `'click dblclick'`).

	  // @alternative
	  // @function on(el: HTMLElement, eventMap: Object, context?: Object): this
	  // Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
	  function on(obj, types, fn, context) {

	  	if (typeof types === 'object') {
	  		for (var type in types) {
	  			addOne(obj, type, types[type], fn);
	  		}
	  	} else {
	  		types = splitWords(types);

	  		for (var i = 0, len = types.length; i < len; i++) {
	  			addOne(obj, types[i], fn, context);
	  		}
	  	}

	  	return this;
	  }

	  var eventsKey = '_leaflet_events';

	  // @function off(el: HTMLElement, types: String, fn: Function, context?: Object): this
	  // Removes a previously added listener function.
	  // Note that if you passed a custom context to on, you must pass the same
	  // context to `off` in order to remove the listener.

	  // @alternative
	  // @function off(el: HTMLElement, eventMap: Object, context?: Object): this
	  // Removes a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
	  function off(obj, types, fn, context) {

	  	if (typeof types === 'object') {
	  		for (var type in types) {
	  			removeOne(obj, type, types[type], fn);
	  		}
	  	} else if (types) {
	  		types = splitWords(types);

	  		for (var i = 0, len = types.length; i < len; i++) {
	  			removeOne(obj, types[i], fn, context);
	  		}
	  	} else {
	  		for (var j in obj[eventsKey]) {
	  			removeOne(obj, j, obj[eventsKey][j]);
	  		}
	  		delete obj[eventsKey];
	  	}

	  	return this;
	  }

	  function browserFiresNativeDblClick() {
	  	// See https://github.com/w3c/pointerevents/issues/171
	  	if (pointer) {
	  		return !(edge || safari);
	  	}
	  }

	  var mouseSubst = {
	  	mouseenter: 'mouseover',
	  	mouseleave: 'mouseout',
	  	wheel: !('onwheel' in window) && 'mousewheel'
	  };

	  function addOne(obj, type, fn, context) {
	  	var id = type + stamp(fn) + (context ? '_' + stamp(context) : '');

	  	if (obj[eventsKey] && obj[eventsKey][id]) { return this; }

	  	var handler = function (e) {
	  		return fn.call(context || obj, e || window.event);
	  	};

	  	var originalHandler = handler;

	  	if (pointer && type.indexOf('touch') === 0) {
	  		// Needs DomEvent.Pointer.js
	  		addPointerListener(obj, type, handler, id);

	  	} else if (touch && (type === 'dblclick') && !browserFiresNativeDblClick()) {
	  		addDoubleTapListener(obj, handler, id);

	  	} else if ('addEventListener' in obj) {

	  		if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' ||  type === 'mousewheel') {
	  			obj.addEventListener(mouseSubst[type] || type, handler, passiveEvents ? {passive: false} : false);

	  		} else if (type === 'mouseenter' || type === 'mouseleave') {
	  			handler = function (e) {
	  				e = e || window.event;
	  				if (isExternalTarget(obj, e)) {
	  					originalHandler(e);
	  				}
	  			};
	  			obj.addEventListener(mouseSubst[type], handler, false);

	  		} else {
	  			obj.addEventListener(type, originalHandler, false);
	  		}

	  	} else if ('attachEvent' in obj) {
	  		obj.attachEvent('on' + type, handler);
	  	}

	  	obj[eventsKey] = obj[eventsKey] || {};
	  	obj[eventsKey][id] = handler;
	  }

	  function removeOne(obj, type, fn, context) {

	  	var id = type + stamp(fn) + (context ? '_' + stamp(context) : ''),
	  	    handler = obj[eventsKey] && obj[eventsKey][id];

	  	if (!handler) { return this; }

	  	if (pointer && type.indexOf('touch') === 0) {
	  		removePointerListener(obj, type, id);

	  	} else if (touch && (type === 'dblclick') && !browserFiresNativeDblClick()) {
	  		removeDoubleTapListener(obj, id);

	  	} else if ('removeEventListener' in obj) {

	  		obj.removeEventListener(mouseSubst[type] || type, handler, false);

	  	} else if ('detachEvent' in obj) {
	  		obj.detachEvent('on' + type, handler);
	  	}

	  	obj[eventsKey][id] = null;
	  }

	  // @function stopPropagation(ev: DOMEvent): this
	  // Stop the given event from propagation to parent elements. Used inside the listener functions:
	  // ```js
	  // L.DomEvent.on(div, 'click', function (ev) {
	  // 	L.DomEvent.stopPropagation(ev);
	  // });
	  // ```
	  function stopPropagation(e) {

	  	if (e.stopPropagation) {
	  		e.stopPropagation();
	  	} else if (e.originalEvent) {  // In case of Leaflet event.
	  		e.originalEvent._stopped = true;
	  	} else {
	  		e.cancelBubble = true;
	  	}
	  	skipped(e);

	  	return this;
	  }

	  // @function disableScrollPropagation(el: HTMLElement): this
	  // Adds `stopPropagation` to the element's `'wheel'` events (plus browser variants).
	  function disableScrollPropagation(el) {
	  	addOne(el, 'wheel', stopPropagation);
	  	return this;
	  }

	  // @function disableClickPropagation(el: HTMLElement): this
	  // Adds `stopPropagation` to the element's `'click'`, `'doubleclick'`,
	  // `'mousedown'` and `'touchstart'` events (plus browser variants).
	  function disableClickPropagation(el) {
	  	on(el, 'mousedown touchstart dblclick', stopPropagation);
	  	addOne(el, 'click', fakeStop);
	  	return this;
	  }

	  // @function preventDefault(ev: DOMEvent): this
	  // Prevents the default action of the DOM Event `ev` from happening (such as
	  // following a link in the href of the a element, or doing a POST request
	  // with page reload when a `<form>` is submitted).
	  // Use it inside listener functions.
	  function preventDefault(e) {
	  	if (e.preventDefault) {
	  		e.preventDefault();
	  	} else {
	  		e.returnValue = false;
	  	}
	  	return this;
	  }

	  // @function stop(ev: DOMEvent): this
	  // Does `stopPropagation` and `preventDefault` at the same time.
	  function stop(e) {
	  	preventDefault(e);
	  	stopPropagation(e);
	  	return this;
	  }

	  // @function getMousePosition(ev: DOMEvent, container?: HTMLElement): Point
	  // Gets normalized mouse position from a DOM event relative to the
	  // `container` (border excluded) or to the whole page if not specified.
	  function getMousePosition(e, container) {
	  	if (!container) {
	  		return new Point(e.clientX, e.clientY);
	  	}

	  	var scale = getScale(container),
	  	    offset = scale.boundingClientRect; // left and top  values are in page scale (like the event clientX/Y)

	  	return new Point(
	  		// offset.left/top values are in page scale (like clientX/Y),
	  		// whereas clientLeft/Top (border width) values are the original values (before CSS scale applies).
	  		(e.clientX - offset.left) / scale.x - container.clientLeft,
	  		(e.clientY - offset.top) / scale.y - container.clientTop
	  	);
	  }

	  // Chrome on Win scrolls double the pixels as in other platforms (see #4538),
	  // and Firefox scrolls device pixels, not CSS pixels
	  var wheelPxFactor =
	  	(win && chrome) ? 2 * window.devicePixelRatio :
	  	gecko ? window.devicePixelRatio : 1;

	  // @function getWheelDelta(ev: DOMEvent): Number
	  // Gets normalized wheel delta from a wheel DOM event, in vertical
	  // pixels scrolled (negative if scrolling down).
	  // Events from pointing devices without precise scrolling are mapped to
	  // a best guess of 60 pixels.
	  function getWheelDelta(e) {
	  	return (edge) ? e.wheelDeltaY / 2 : // Don't trust window-geometry-based delta
	  	       (e.deltaY && e.deltaMode === 0) ? -e.deltaY / wheelPxFactor : // Pixels
	  	       (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 20 : // Lines
	  	       (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 60 : // Pages
	  	       (e.deltaX || e.deltaZ) ? 0 :	// Skip horizontal/depth wheel events
	  	       e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
	  	       (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 20 : // Legacy Moz lines
	  	       e.detail ? e.detail / -32765 * 60 : // Legacy Moz pages
	  	       0;
	  }

	  var skipEvents = {};

	  function fakeStop(e) {
	  	// fakes stopPropagation by setting a special event flag, checked/reset with skipped(e)
	  	skipEvents[e.type] = true;
	  }

	  function skipped(e) {
	  	var events = skipEvents[e.type];
	  	// reset when checking, as it's only used in map container and propagates outside of the map
	  	skipEvents[e.type] = false;
	  	return events;
	  }

	  // check if element really left/entered the event target (for mouseenter/mouseleave)
	  function isExternalTarget(el, e) {

	  	var related = e.relatedTarget;

	  	if (!related) { return true; }

	  	try {
	  		while (related && (related !== el)) {
	  			related = related.parentNode;
	  		}
	  	} catch (err) {
	  		return false;
	  	}
	  	return (related !== el);
	  }

	  var DomEvent = ({
	    on: on,
	    off: off,
	    stopPropagation: stopPropagation,
	    disableScrollPropagation: disableScrollPropagation,
	    disableClickPropagation: disableClickPropagation,
	    preventDefault: preventDefault,
	    stop: stop,
	    getMousePosition: getMousePosition,
	    getWheelDelta: getWheelDelta,
	    fakeStop: fakeStop,
	    skipped: skipped,
	    isExternalTarget: isExternalTarget,
	    addListener: on,
	    removeListener: off
	  });

	  /*
	   * @class PosAnimation
	   * @aka L.PosAnimation
	   * @inherits Evented
	   * Used internally for panning animations, utilizing CSS3 Transitions for modern browsers and a timer fallback for IE6-9.
	   *
	   * @example
	   * ```js
	   * var fx = new L.PosAnimation();
	   * fx.run(el, [300, 500], 0.5);
	   * ```
	   *
	   * @constructor L.PosAnimation()
	   * Creates a `PosAnimation` object.
	   *
	   */

	  var PosAnimation = Evented.extend({

	  	// @method run(el: HTMLElement, newPos: Point, duration?: Number, easeLinearity?: Number)
	  	// Run an animation of a given element to a new position, optionally setting
	  	// duration in seconds (`0.25` by default) and easing linearity factor (3rd
	  	// argument of the [cubic bezier curve](http://cubic-bezier.com/#0,0,.5,1),
	  	// `0.5` by default).
	  	run: function (el, newPos, duration, easeLinearity) {
	  		this.stop();

	  		this._el = el;
	  		this._inProgress = true;
	  		this._duration = duration || 0.25;
	  		this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

	  		this._startPos = getPosition(el);
	  		this._offset = newPos.subtract(this._startPos);
	  		this._startTime = +new Date();

	  		// @event start: Event
	  		// Fired when the animation starts
	  		this.fire('start');

	  		this._animate();
	  	},

	  	// @method stop()
	  	// Stops the animation (if currently running).
	  	stop: function () {
	  		if (!this._inProgress) { return; }

	  		this._step(true);
	  		this._complete();
	  	},

	  	_animate: function () {
	  		// animation loop
	  		this._animId = requestAnimFrame(this._animate, this);
	  		this._step();
	  	},

	  	_step: function (round) {
	  		var elapsed = (+new Date()) - this._startTime,
	  		    duration = this._duration * 1000;

	  		if (elapsed < duration) {
	  			this._runFrame(this._easeOut(elapsed / duration), round);
	  		} else {
	  			this._runFrame(1);
	  			this._complete();
	  		}
	  	},

	  	_runFrame: function (progress, round) {
	  		var pos = this._startPos.add(this._offset.multiplyBy(progress));
	  		if (round) {
	  			pos._round();
	  		}
	  		setPosition(this._el, pos);

	  		// @event step: Event
	  		// Fired continuously during the animation.
	  		this.fire('step');
	  	},

	  	_complete: function () {
	  		cancelAnimFrame(this._animId);

	  		this._inProgress = false;
	  		// @event end: Event
	  		// Fired when the animation ends.
	  		this.fire('end');
	  	},

	  	_easeOut: function (t) {
	  		return 1 - Math.pow(1 - t, this._easeOutPower);
	  	}
	  });

	  /*
	   * @class Map
	   * @aka L.Map
	   * @inherits Evented
	   *
	   * The central class of the API — it is used to create a map on a page and manipulate it.
	   *
	   * @example
	   *
	   * ```js
	   * // initialize the map on the "map" div with a given center and zoom
	   * var map = L.map('map', {
	   * 	center: [51.505, -0.09],
	   * 	zoom: 13
	   * });
	   * ```
	   *
	   */

	  var Map = Evented.extend({

	  	options: {
	  		// @section Map State Options
	  		// @option crs: CRS = L.CRS.EPSG3857
	  		// The [Coordinate Reference System](#crs) to use. Don't change this if you're not
	  		// sure what it means.
	  		crs: EPSG3857,

	  		// @option center: LatLng = undefined
	  		// Initial geographic center of the map
	  		center: undefined,

	  		// @option zoom: Number = undefined
	  		// Initial map zoom level
	  		zoom: undefined,

	  		// @option minZoom: Number = *
	  		// Minimum zoom level of the map.
	  		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
	  		// the lowest of their `minZoom` options will be used instead.
	  		minZoom: undefined,

	  		// @option maxZoom: Number = *
	  		// Maximum zoom level of the map.
	  		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
	  		// the highest of their `maxZoom` options will be used instead.
	  		maxZoom: undefined,

	  		// @option layers: Layer[] = []
	  		// Array of layers that will be added to the map initially
	  		layers: [],

	  		// @option maxBounds: LatLngBounds = null
	  		// When this option is set, the map restricts the view to the given
	  		// geographical bounds, bouncing the user back if the user tries to pan
	  		// outside the view. To set the restriction dynamically, use
	  		// [`setMaxBounds`](#map-setmaxbounds) method.
	  		maxBounds: undefined,

	  		// @option renderer: Renderer = *
	  		// The default method for drawing vector layers on the map. `L.SVG`
	  		// or `L.Canvas` by default depending on browser support.
	  		renderer: undefined,


	  		// @section Animation Options
	  		// @option zoomAnimation: Boolean = true
	  		// Whether the map zoom animation is enabled. By default it's enabled
	  		// in all browsers that support CSS3 Transitions except Android.
	  		zoomAnimation: true,

	  		// @option zoomAnimationThreshold: Number = 4
	  		// Won't animate zoom if the zoom difference exceeds this value.
	  		zoomAnimationThreshold: 4,

	  		// @option fadeAnimation: Boolean = true
	  		// Whether the tile fade animation is enabled. By default it's enabled
	  		// in all browsers that support CSS3 Transitions except Android.
	  		fadeAnimation: true,

	  		// @option markerZoomAnimation: Boolean = true
	  		// Whether markers animate their zoom with the zoom animation, if disabled
	  		// they will disappear for the length of the animation. By default it's
	  		// enabled in all browsers that support CSS3 Transitions except Android.
	  		markerZoomAnimation: true,

	  		// @option transform3DLimit: Number = 2^23
	  		// Defines the maximum size of a CSS translation transform. The default
	  		// value should not be changed unless a web browser positions layers in
	  		// the wrong place after doing a large `panBy`.
	  		transform3DLimit: 8388608, // Precision limit of a 32-bit float

	  		// @section Interaction Options
	  		// @option zoomSnap: Number = 1
	  		// Forces the map's zoom level to always be a multiple of this, particularly
	  		// right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
	  		// By default, the zoom level snaps to the nearest integer; lower values
	  		// (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
	  		// means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
	  		zoomSnap: 1,

	  		// @option zoomDelta: Number = 1
	  		// Controls how much the map's zoom level will change after a
	  		// [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
	  		// or `-` on the keyboard, or using the [zoom controls](#control-zoom).
	  		// Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
	  		zoomDelta: 1,

	  		// @option trackResize: Boolean = true
	  		// Whether the map automatically handles browser window resize to update itself.
	  		trackResize: true
	  	},

	  	initialize: function (id, options) { // (HTMLElement or String, Object)
	  		options = setOptions(this, options);

	  		// Make sure to assign internal flags at the beginning,
	  		// to avoid inconsistent state in some edge cases.
	  		this._handlers = [];
	  		this._layers = {};
	  		this._zoomBoundLayers = {};
	  		this._sizeChanged = true;

	  		this._initContainer(id);
	  		this._initLayout();

	  		// hack for https://github.com/Leaflet/Leaflet/issues/1980
	  		this._onResize = bind(this._onResize, this);

	  		this._initEvents();

	  		if (options.maxBounds) {
	  			this.setMaxBounds(options.maxBounds);
	  		}

	  		if (options.zoom !== undefined) {
	  			this._zoom = this._limitZoom(options.zoom);
	  		}

	  		if (options.center && options.zoom !== undefined) {
	  			this.setView(toLatLng(options.center), options.zoom, {reset: true});
	  		}

	  		this.callInitHooks();

	  		// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
	  		this._zoomAnimated = TRANSITION && any3d && !mobileOpera &&
	  				this.options.zoomAnimation;

	  		// zoom transitions run with the same duration for all layers, so if one of transitionend events
	  		// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
	  		if (this._zoomAnimated) {
	  			this._createAnimProxy();
	  			on(this._proxy, TRANSITION_END, this._catchTransitionEnd, this);
	  		}

	  		this._addLayers(this.options.layers);
	  	},


	  	// @section Methods for modifying map state

	  	// @method setView(center: LatLng, zoom: Number, options?: Zoom/pan options): this
	  	// Sets the view of the map (geographical center and zoom) with the given
	  	// animation options.
	  	setView: function (center, zoom, options) {

	  		zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
	  		center = this._limitCenter(toLatLng(center), zoom, this.options.maxBounds);
	  		options = options || {};

	  		this._stop();

	  		if (this._loaded && !options.reset && options !== true) {

	  			if (options.animate !== undefined) {
	  				options.zoom = extend({animate: options.animate}, options.zoom);
	  				options.pan = extend({animate: options.animate, duration: options.duration}, options.pan);
	  			}

	  			// try animating pan or zoom
	  			var moved = (this._zoom !== zoom) ?
	  				this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
	  				this._tryAnimatedPan(center, options.pan);

	  			if (moved) {
	  				// prevent resize handler call, the view will refresh after animation anyway
	  				clearTimeout(this._sizeTimer);
	  				return this;
	  			}
	  		}

	  		// animation didn't start, just reset the map view
	  		this._resetView(center, zoom);

	  		return this;
	  	},

	  	// @method setZoom(zoom: Number, options?: Zoom/pan options): this
	  	// Sets the zoom of the map.
	  	setZoom: function (zoom, options) {
	  		if (!this._loaded) {
	  			this._zoom = zoom;
	  			return this;
	  		}
	  		return this.setView(this.getCenter(), zoom, {zoom: options});
	  	},

	  	// @method zoomIn(delta?: Number, options?: Zoom options): this
	  	// Increases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
	  	zoomIn: function (delta, options) {
	  		delta = delta || (any3d ? this.options.zoomDelta : 1);
	  		return this.setZoom(this._zoom + delta, options);
	  	},

	  	// @method zoomOut(delta?: Number, options?: Zoom options): this
	  	// Decreases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
	  	zoomOut: function (delta, options) {
	  		delta = delta || (any3d ? this.options.zoomDelta : 1);
	  		return this.setZoom(this._zoom - delta, options);
	  	},

	  	// @method setZoomAround(latlng: LatLng, zoom: Number, options: Zoom options): this
	  	// Zooms the map while keeping a specified geographical point on the map
	  	// stationary (e.g. used internally for scroll zoom and double-click zoom).
	  	// @alternative
	  	// @method setZoomAround(offset: Point, zoom: Number, options: Zoom options): this
	  	// Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
	  	setZoomAround: function (latlng, zoom, options) {
	  		var scale = this.getZoomScale(zoom),
	  		    viewHalf = this.getSize().divideBy(2),
	  		    containerPoint = latlng instanceof Point ? latlng : this.latLngToContainerPoint(latlng),

	  		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
	  		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

	  		return this.setView(newCenter, zoom, {zoom: options});
	  	},

	  	_getBoundsCenterZoom: function (bounds, options) {

	  		options = options || {};
	  		bounds = bounds.getBounds ? bounds.getBounds() : toLatLngBounds(bounds);

	  		var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
	  		    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),

	  		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));

	  		zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;

	  		if (zoom === Infinity) {
	  			return {
	  				center: bounds.getCenter(),
	  				zoom: zoom
	  			};
	  		}

	  		var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

	  		    swPoint = this.project(bounds.getSouthWest(), zoom),
	  		    nePoint = this.project(bounds.getNorthEast(), zoom),
	  		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

	  		return {
	  			center: center,
	  			zoom: zoom
	  		};
	  	},

	  	// @method fitBounds(bounds: LatLngBounds, options?: fitBounds options): this
	  	// Sets a map view that contains the given geographical bounds with the
	  	// maximum zoom level possible.
	  	fitBounds: function (bounds, options) {

	  		bounds = toLatLngBounds(bounds);

	  		if (!bounds.isValid()) {
	  			throw new Error('Bounds are not valid.');
	  		}

	  		var target = this._getBoundsCenterZoom(bounds, options);
	  		return this.setView(target.center, target.zoom, options);
	  	},

	  	// @method fitWorld(options?: fitBounds options): this
	  	// Sets a map view that mostly contains the whole world with the maximum
	  	// zoom level possible.
	  	fitWorld: function (options) {
	  		return this.fitBounds([[-90, -180], [90, 180]], options);
	  	},

	  	// @method panTo(latlng: LatLng, options?: Pan options): this
	  	// Pans the map to a given center.
	  	panTo: function (center, options) { // (LatLng)
	  		return this.setView(center, this._zoom, {pan: options});
	  	},

	  	// @method panBy(offset: Point, options?: Pan options): this
	  	// Pans the map by a given number of pixels (animated).
	  	panBy: function (offset, options) {
	  		offset = toPoint(offset).round();
	  		options = options || {};

	  		if (!offset.x && !offset.y) {
	  			return this.fire('moveend');
	  		}
	  		// If we pan too far, Chrome gets issues with tiles
	  		// and makes them disappear or appear in the wrong place (slightly offset) #2602
	  		if (options.animate !== true && !this.getSize().contains(offset)) {
	  			this._resetView(this.unproject(this.project(this.getCenter()).add(offset)), this.getZoom());
	  			return this;
	  		}

	  		if (!this._panAnim) {
	  			this._panAnim = new PosAnimation();

	  			this._panAnim.on({
	  				'step': this._onPanTransitionStep,
	  				'end': this._onPanTransitionEnd
	  			}, this);
	  		}

	  		// don't fire movestart if animating inertia
	  		if (!options.noMoveStart) {
	  			this.fire('movestart');
	  		}

	  		// animate pan unless animate: false specified
	  		if (options.animate !== false) {
	  			addClass(this._mapPane, 'leaflet-pan-anim');

	  			var newPos = this._getMapPanePos().subtract(offset).round();
	  			this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
	  		} else {
	  			this._rawPanBy(offset);
	  			this.fire('move').fire('moveend');
	  		}

	  		return this;
	  	},

	  	// @method flyTo(latlng: LatLng, zoom?: Number, options?: Zoom/pan options): this
	  	// Sets the view of the map (geographical center and zoom) performing a smooth
	  	// pan-zoom animation.
	  	flyTo: function (targetCenter, targetZoom, options) {

	  		options = options || {};
	  		if (options.animate === false || !any3d) {
	  			return this.setView(targetCenter, targetZoom, options);
	  		}

	  		this._stop();

	  		var from = this.project(this.getCenter()),
	  		    to = this.project(targetCenter),
	  		    size = this.getSize(),
	  		    startZoom = this._zoom;

	  		targetCenter = toLatLng(targetCenter);
	  		targetZoom = targetZoom === undefined ? startZoom : targetZoom;

	  		var w0 = Math.max(size.x, size.y),
	  		    w1 = w0 * this.getZoomScale(startZoom, targetZoom),
	  		    u1 = (to.distanceTo(from)) || 1,
	  		    rho = 1.42,
	  		    rho2 = rho * rho;

	  		function r(i) {
	  			var s1 = i ? -1 : 1,
	  			    s2 = i ? w1 : w0,
	  			    t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1,
	  			    b1 = 2 * s2 * rho2 * u1,
	  			    b = t1 / b1,
	  			    sq = Math.sqrt(b * b + 1) - b;

	  			    // workaround for floating point precision bug when sq = 0, log = -Infinite,
	  			    // thus triggering an infinite loop in flyTo
	  			    var log = sq < 0.000000001 ? -18 : Math.log(sq);

	  			return log;
	  		}

	  		function sinh(n) { return (Math.exp(n) - Math.exp(-n)) / 2; }
	  		function cosh(n) { return (Math.exp(n) + Math.exp(-n)) / 2; }
	  		function tanh(n) { return sinh(n) / cosh(n); }

	  		var r0 = r(0);

	  		function w(s) { return w0 * (cosh(r0) / cosh(r0 + rho * s)); }
	  		function u(s) { return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2; }

	  		function easeOut(t) { return 1 - Math.pow(1 - t, 1.5); }

	  		var start = Date.now(),
	  		    S = (r(1) - r0) / rho,
	  		    duration = options.duration ? 1000 * options.duration : 1000 * S * 0.8;

	  		function frame() {
	  			var t = (Date.now() - start) / duration,
	  			    s = easeOut(t) * S;

	  			if (t <= 1) {
	  				this._flyToFrame = requestAnimFrame(frame, this);

	  				this._move(
	  					this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
	  					this.getScaleZoom(w0 / w(s), startZoom),
	  					{flyTo: true});

	  			} else {
	  				this
	  					._move(targetCenter, targetZoom)
	  					._moveEnd(true);
	  			}
	  		}

	  		this._moveStart(true, options.noMoveStart);

	  		frame.call(this);
	  		return this;
	  	},

	  	// @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
	  	// Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
	  	// but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
	  	flyToBounds: function (bounds, options) {
	  		var target = this._getBoundsCenterZoom(bounds, options);
	  		return this.flyTo(target.center, target.zoom, options);
	  	},

	  	// @method setMaxBounds(bounds: LatLngBounds): this
	  	// Restricts the map view to the given bounds (see the [maxBounds](#map-maxbounds) option).
	  	setMaxBounds: function (bounds) {
	  		bounds = toLatLngBounds(bounds);

	  		if (!bounds.isValid()) {
	  			this.options.maxBounds = null;
	  			return this.off('moveend', this._panInsideMaxBounds);
	  		} else if (this.options.maxBounds) {
	  			this.off('moveend', this._panInsideMaxBounds);
	  		}

	  		this.options.maxBounds = bounds;

	  		if (this._loaded) {
	  			this._panInsideMaxBounds();
	  		}

	  		return this.on('moveend', this._panInsideMaxBounds);
	  	},

	  	// @method setMinZoom(zoom: Number): this
	  	// Sets the lower limit for the available zoom levels (see the [minZoom](#map-minzoom) option).
	  	setMinZoom: function (zoom) {
	  		var oldZoom = this.options.minZoom;
	  		this.options.minZoom = zoom;

	  		if (this._loaded && oldZoom !== zoom) {
	  			this.fire('zoomlevelschange');

	  			if (this.getZoom() < this.options.minZoom) {
	  				return this.setZoom(zoom);
	  			}
	  		}

	  		return this;
	  	},

	  	// @method setMaxZoom(zoom: Number): this
	  	// Sets the upper limit for the available zoom levels (see the [maxZoom](#map-maxzoom) option).
	  	setMaxZoom: function (zoom) {
	  		var oldZoom = this.options.maxZoom;
	  		this.options.maxZoom = zoom;

	  		if (this._loaded && oldZoom !== zoom) {
	  			this.fire('zoomlevelschange');

	  			if (this.getZoom() > this.options.maxZoom) {
	  				return this.setZoom(zoom);
	  			}
	  		}

	  		return this;
	  	},

	  	// @method panInsideBounds(bounds: LatLngBounds, options?: Pan options): this
	  	// Pans the map to the closest view that would lie inside the given bounds (if it's not already), controlling the animation using the options specific, if any.
	  	panInsideBounds: function (bounds, options) {
	  		this._enforcingBounds = true;
	  		var center = this.getCenter(),
	  		    newCenter = this._limitCenter(center, this._zoom, toLatLngBounds(bounds));

	  		if (!center.equals(newCenter)) {
	  			this.panTo(newCenter, options);
	  		}

	  		this._enforcingBounds = false;
	  		return this;
	  	},

	  	// @method panInside(latlng: LatLng, options?: options): this
	  	// Pans the map the minimum amount to make the `latlng` visible. Use
	  	// `padding`, `paddingTopLeft` and `paddingTopRight` options to fit
	  	// the display to more restricted bounds, like [`fitBounds`](#map-fitbounds).
	  	// If `latlng` is already within the (optionally padded) display bounds,
	  	// the map will not be panned.
	  	panInside: function (latlng, options) {
	  		options = options || {};

	  		var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
	  		    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),
	  		    center = this.getCenter(),
	  		    pixelCenter = this.project(center),
	  		    pixelPoint = this.project(latlng),
	  		    pixelBounds = this.getPixelBounds(),
	  		    halfPixelBounds = pixelBounds.getSize().divideBy(2),
	  		    paddedBounds = toBounds([pixelBounds.min.add(paddingTL), pixelBounds.max.subtract(paddingBR)]);

	  		if (!paddedBounds.contains(pixelPoint)) {
	  			this._enforcingBounds = true;
	  			var diff = pixelCenter.subtract(pixelPoint),
	  			    newCenter = toPoint(pixelPoint.x + diff.x, pixelPoint.y + diff.y);

	  			if (pixelPoint.x < paddedBounds.min.x || pixelPoint.x > paddedBounds.max.x) {
	  				newCenter.x = pixelCenter.x - diff.x;
	  				if (diff.x > 0) {
	  					newCenter.x += halfPixelBounds.x - paddingTL.x;
	  				} else {
	  					newCenter.x -= halfPixelBounds.x - paddingBR.x;
	  				}
	  			}
	  			if (pixelPoint.y < paddedBounds.min.y || pixelPoint.y > paddedBounds.max.y) {
	  				newCenter.y = pixelCenter.y - diff.y;
	  				if (diff.y > 0) {
	  					newCenter.y += halfPixelBounds.y - paddingTL.y;
	  				} else {
	  					newCenter.y -= halfPixelBounds.y - paddingBR.y;
	  				}
	  			}
	  			this.panTo(this.unproject(newCenter), options);
	  			this._enforcingBounds = false;
	  		}
	  		return this;
	  	},

	  	// @method invalidateSize(options: Zoom/pan options): this
	  	// Checks if the map container size changed and updates the map if so —
	  	// call it after you've changed the map size dynamically, also animating
	  	// pan by default. If `options.pan` is `false`, panning will not occur.
	  	// If `options.debounceMoveend` is `true`, it will delay `moveend` event so
	  	// that it doesn't happen often even if the method is called many
	  	// times in a row.

	  	// @alternative
	  	// @method invalidateSize(animate: Boolean): this
	  	// Checks if the map container size changed and updates the map if so —
	  	// call it after you've changed the map size dynamically, also animating
	  	// pan by default.
	  	invalidateSize: function (options) {
	  		if (!this._loaded) { return this; }

	  		options = extend({
	  			animate: false,
	  			pan: true
	  		}, options === true ? {animate: true} : options);

	  		var oldSize = this.getSize();
	  		this._sizeChanged = true;
	  		this._lastCenter = null;

	  		var newSize = this.getSize(),
	  		    oldCenter = oldSize.divideBy(2).round(),
	  		    newCenter = newSize.divideBy(2).round(),
	  		    offset = oldCenter.subtract(newCenter);

	  		if (!offset.x && !offset.y) { return this; }

	  		if (options.animate && options.pan) {
	  			this.panBy(offset);

	  		} else {
	  			if (options.pan) {
	  				this._rawPanBy(offset);
	  			}

	  			this.fire('move');

	  			if (options.debounceMoveend) {
	  				clearTimeout(this._sizeTimer);
	  				this._sizeTimer = setTimeout(bind(this.fire, this, 'moveend'), 200);
	  			} else {
	  				this.fire('moveend');
	  			}
	  		}

	  		// @section Map state change events
	  		// @event resize: ResizeEvent
	  		// Fired when the map is resized.
	  		return this.fire('resize', {
	  			oldSize: oldSize,
	  			newSize: newSize
	  		});
	  	},

	  	// @section Methods for modifying map state
	  	// @method stop(): this
	  	// Stops the currently running `panTo` or `flyTo` animation, if any.
	  	stop: function () {
	  		this.setZoom(this._limitZoom(this._zoom));
	  		if (!this.options.zoomSnap) {
	  			this.fire('viewreset');
	  		}
	  		return this._stop();
	  	},

	  	// @section Geolocation methods
	  	// @method locate(options?: Locate options): this
	  	// Tries to locate the user using the Geolocation API, firing a [`locationfound`](#map-locationfound)
	  	// event with location data on success or a [`locationerror`](#map-locationerror) event on failure,
	  	// and optionally sets the map view to the user's location with respect to
	  	// detection accuracy (or to the world view if geolocation failed).
	  	// Note that, if your page doesn't use HTTPS, this method will fail in
	  	// modern browsers ([Chrome 50 and newer](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins))
	  	// See `Locate options` for more details.
	  	locate: function (options) {

	  		options = this._locateOptions = extend({
	  			timeout: 10000,
	  			watch: false
	  			// setView: false
	  			// maxZoom: <Number>
	  			// maximumAge: 0
	  			// enableHighAccuracy: false
	  		}, options);

	  		if (!('geolocation' in navigator)) {
	  			this._handleGeolocationError({
	  				code: 0,
	  				message: 'Geolocation not supported.'
	  			});
	  			return this;
	  		}

	  		var onResponse = bind(this._handleGeolocationResponse, this),
	  		    onError = bind(this._handleGeolocationError, this);

	  		if (options.watch) {
	  			this._locationWatchId =
	  			        navigator.geolocation.watchPosition(onResponse, onError, options);
	  		} else {
	  			navigator.geolocation.getCurrentPosition(onResponse, onError, options);
	  		}
	  		return this;
	  	},

	  	// @method stopLocate(): this
	  	// Stops watching location previously initiated by `map.locate({watch: true})`
	  	// and aborts resetting the map view if map.locate was called with
	  	// `{setView: true}`.
	  	stopLocate: function () {
	  		if (navigator.geolocation && navigator.geolocation.clearWatch) {
	  			navigator.geolocation.clearWatch(this._locationWatchId);
	  		}
	  		if (this._locateOptions) {
	  			this._locateOptions.setView = false;
	  		}
	  		return this;
	  	},

	  	_handleGeolocationError: function (error) {
	  		var c = error.code,
	  		    message = error.message ||
	  		            (c === 1 ? 'permission denied' :
	  		            (c === 2 ? 'position unavailable' : 'timeout'));

	  		if (this._locateOptions.setView && !this._loaded) {
	  			this.fitWorld();
	  		}

	  		// @section Location events
	  		// @event locationerror: ErrorEvent
	  		// Fired when geolocation (using the [`locate`](#map-locate) method) failed.
	  		this.fire('locationerror', {
	  			code: c,
	  			message: 'Geolocation error: ' + message + '.'
	  		});
	  	},

	  	_handleGeolocationResponse: function (pos) {
	  		var lat = pos.coords.latitude,
	  		    lng = pos.coords.longitude,
	  		    latlng = new LatLng(lat, lng),
	  		    bounds = latlng.toBounds(pos.coords.accuracy * 2),
	  		    options = this._locateOptions;

	  		if (options.setView) {
	  			var zoom = this.getBoundsZoom(bounds);
	  			this.setView(latlng, options.maxZoom ? Math.min(zoom, options.maxZoom) : zoom);
	  		}

	  		var data = {
	  			latlng: latlng,
	  			bounds: bounds,
	  			timestamp: pos.timestamp
	  		};

	  		for (var i in pos.coords) {
	  			if (typeof pos.coords[i] === 'number') {
	  				data[i] = pos.coords[i];
	  			}
	  		}

	  		// @event locationfound: LocationEvent
	  		// Fired when geolocation (using the [`locate`](#map-locate) method)
	  		// went successfully.
	  		this.fire('locationfound', data);
	  	},

	  	// TODO Appropriate docs section?
	  	// @section Other Methods
	  	// @method addHandler(name: String, HandlerClass: Function): this
	  	// Adds a new `Handler` to the map, given its name and constructor function.
	  	addHandler: function (name, HandlerClass) {
	  		if (!HandlerClass) { return this; }

	  		var handler = this[name] = new HandlerClass(this);

	  		this._handlers.push(handler);

	  		if (this.options[name]) {
	  			handler.enable();
	  		}

	  		return this;
	  	},

	  	// @method remove(): this
	  	// Destroys the map and clears all related event listeners.
	  	remove: function () {

	  		this._initEvents(true);
	  		this.off('moveend', this._panInsideMaxBounds);

	  		if (this._containerId !== this._container._leaflet_id) {
	  			throw new Error('Map container is being reused by another instance');
	  		}

	  		try {
	  			// throws error in IE6-8
	  			delete this._container._leaflet_id;
	  			delete this._containerId;
	  		} catch (e) {
	  			/*eslint-disable */
	  			this._container._leaflet_id = undefined;
	  			/* eslint-enable */
	  			this._containerId = undefined;
	  		}

	  		if (this._locationWatchId !== undefined) {
	  			this.stopLocate();
	  		}

	  		this._stop();

	  		remove(this._mapPane);

	  		if (this._clearControlPos) {
	  			this._clearControlPos();
	  		}
	  		if (this._resizeRequest) {
	  			cancelAnimFrame(this._resizeRequest);
	  			this._resizeRequest = null;
	  		}

	  		this._clearHandlers();

	  		if (this._loaded) {
	  			// @section Map state change events
	  			// @event unload: Event
	  			// Fired when the map is destroyed with [remove](#map-remove) method.
	  			this.fire('unload');
	  		}

	  		var i;
	  		for (i in this._layers) {
	  			this._layers[i].remove();
	  		}
	  		for (i in this._panes) {
	  			remove(this._panes[i]);
	  		}

	  		this._layers = [];
	  		this._panes = [];
	  		delete this._mapPane;
	  		delete this._renderer;

	  		return this;
	  	},

	  	// @section Other Methods
	  	// @method createPane(name: String, container?: HTMLElement): HTMLElement
	  	// Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
	  	// then returns it. The pane is created as a child of `container`, or
	  	// as a child of the main map pane if not set.
	  	createPane: function (name, container) {
	  		var className = 'leaflet-pane' + (name ? ' leaflet-' + name.replace('Pane', '') + '-pane' : ''),
	  		    pane = create$1('div', className, container || this._mapPane);

	  		if (name) {
	  			this._panes[name] = pane;
	  		}
	  		return pane;
	  	},

	  	// @section Methods for Getting Map State

	  	// @method getCenter(): LatLng
	  	// Returns the geographical center of the map view
	  	getCenter: function () {
	  		this._checkIfLoaded();

	  		if (this._lastCenter && !this._moved()) {
	  			return this._lastCenter;
	  		}
	  		return this.layerPointToLatLng(this._getCenterLayerPoint());
	  	},

	  	// @method getZoom(): Number
	  	// Returns the current zoom level of the map view
	  	getZoom: function () {
	  		return this._zoom;
	  	},

	  	// @method getBounds(): LatLngBounds
	  	// Returns the geographical bounds visible in the current map view
	  	getBounds: function () {
	  		var bounds = this.getPixelBounds(),
	  		    sw = this.unproject(bounds.getBottomLeft()),
	  		    ne = this.unproject(bounds.getTopRight());

	  		return new LatLngBounds(sw, ne);
	  	},

	  	// @method getMinZoom(): Number
	  	// Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
	  	getMinZoom: function () {
	  		return this.options.minZoom === undefined ? this._layersMinZoom || 0 : this.options.minZoom;
	  	},

	  	// @method getMaxZoom(): Number
	  	// Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
	  	getMaxZoom: function () {
	  		return this.options.maxZoom === undefined ?
	  			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
	  			this.options.maxZoom;
	  	},

	  	// @method getBoundsZoom(bounds: LatLngBounds, inside?: Boolean, padding?: Point): Number
	  	// Returns the maximum zoom level on which the given bounds fit to the map
	  	// view in its entirety. If `inside` (optional) is set to `true`, the method
	  	// instead returns the minimum zoom level on which the map view fits into
	  	// the given bounds in its entirety.
	  	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
	  		bounds = toLatLngBounds(bounds);
	  		padding = toPoint(padding || [0, 0]);

	  		var zoom = this.getZoom() || 0,
	  		    min = this.getMinZoom(),
	  		    max = this.getMaxZoom(),
	  		    nw = bounds.getNorthWest(),
	  		    se = bounds.getSouthEast(),
	  		    size = this.getSize().subtract(padding),
	  		    boundsSize = toBounds(this.project(se, zoom), this.project(nw, zoom)).getSize(),
	  		    snap = any3d ? this.options.zoomSnap : 1,
	  		    scalex = size.x / boundsSize.x,
	  		    scaley = size.y / boundsSize.y,
	  		    scale = inside ? Math.max(scalex, scaley) : Math.min(scalex, scaley);

	  		zoom = this.getScaleZoom(scale, zoom);

	  		if (snap) {
	  			zoom = Math.round(zoom / (snap / 100)) * (snap / 100); // don't jump if within 1% of a snap level
	  			zoom = inside ? Math.ceil(zoom / snap) * snap : Math.floor(zoom / snap) * snap;
	  		}

	  		return Math.max(min, Math.min(max, zoom));
	  	},

	  	// @method getSize(): Point
	  	// Returns the current size of the map container (in pixels).
	  	getSize: function () {
	  		if (!this._size || this._sizeChanged) {
	  			this._size = new Point(
	  				this._container.clientWidth || 0,
	  				this._container.clientHeight || 0);

	  			this._sizeChanged = false;
	  		}
	  		return this._size.clone();
	  	},

	  	// @method getPixelBounds(): Bounds
	  	// Returns the bounds of the current map view in projected pixel
	  	// coordinates (sometimes useful in layer and overlay implementations).
	  	getPixelBounds: function (center, zoom) {
	  		var topLeftPoint = this._getTopLeftPoint(center, zoom);
	  		return new Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
	  	},

	  	// TODO: Check semantics - isn't the pixel origin the 0,0 coord relative to
	  	// the map pane? "left point of the map layer" can be confusing, specially
	  	// since there can be negative offsets.
	  	// @method getPixelOrigin(): Point
	  	// Returns the projected pixel coordinates of the top left point of
	  	// the map layer (useful in custom layer and overlay implementations).
	  	getPixelOrigin: function () {
	  		this._checkIfLoaded();
	  		return this._pixelOrigin;
	  	},

	  	// @method getPixelWorldBounds(zoom?: Number): Bounds
	  	// Returns the world's bounds in pixel coordinates for zoom level `zoom`.
	  	// If `zoom` is omitted, the map's current zoom level is used.
	  	getPixelWorldBounds: function (zoom) {
	  		return this.options.crs.getProjectedBounds(zoom === undefined ? this.getZoom() : zoom);
	  	},

	  	// @section Other Methods

	  	// @method getPane(pane: String|HTMLElement): HTMLElement
	  	// Returns a [map pane](#map-pane), given its name or its HTML element (its identity).
	  	getPane: function (pane) {
	  		return typeof pane === 'string' ? this._panes[pane] : pane;
	  	},

	  	// @method getPanes(): Object
	  	// Returns a plain object containing the names of all [panes](#map-pane) as keys and
	  	// the panes as values.
	  	getPanes: function () {
	  		return this._panes;
	  	},

	  	// @method getContainer: HTMLElement
	  	// Returns the HTML element that contains the map.
	  	getContainer: function () {
	  		return this._container;
	  	},


	  	// @section Conversion Methods

	  	// @method getZoomScale(toZoom: Number, fromZoom: Number): Number
	  	// Returns the scale factor to be applied to a map transition from zoom level
	  	// `fromZoom` to `toZoom`. Used internally to help with zoom animations.
	  	getZoomScale: function (toZoom, fromZoom) {
	  		// TODO replace with universal implementation after refactoring projections
	  		var crs = this.options.crs;
	  		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
	  		return crs.scale(toZoom) / crs.scale(fromZoom);
	  	},

	  	// @method getScaleZoom(scale: Number, fromZoom: Number): Number
	  	// Returns the zoom level that the map would end up at, if it is at `fromZoom`
	  	// level and everything is scaled by a factor of `scale`. Inverse of
	  	// [`getZoomScale`](#map-getZoomScale).
	  	getScaleZoom: function (scale, fromZoom) {
	  		var crs = this.options.crs;
	  		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
	  		var zoom = crs.zoom(scale * crs.scale(fromZoom));
	  		return isNaN(zoom) ? Infinity : zoom;
	  	},

	  	// @method project(latlng: LatLng, zoom: Number): Point
	  	// Projects a geographical coordinate `LatLng` according to the projection
	  	// of the map's CRS, then scales it according to `zoom` and the CRS's
	  	// `Transformation`. The result is pixel coordinate relative to
	  	// the CRS origin.
	  	project: function (latlng, zoom) {
	  		zoom = zoom === undefined ? this._zoom : zoom;
	  		return this.options.crs.latLngToPoint(toLatLng(latlng), zoom);
	  	},

	  	// @method unproject(point: Point, zoom: Number): LatLng
	  	// Inverse of [`project`](#map-project).
	  	unproject: function (point, zoom) {
	  		zoom = zoom === undefined ? this._zoom : zoom;
	  		return this.options.crs.pointToLatLng(toPoint(point), zoom);
	  	},

	  	// @method layerPointToLatLng(point: Point): LatLng
	  	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
	  	// returns the corresponding geographical coordinate (for the current zoom level).
	  	layerPointToLatLng: function (point) {
	  		var projectedPoint = toPoint(point).add(this.getPixelOrigin());
	  		return this.unproject(projectedPoint);
	  	},

	  	// @method latLngToLayerPoint(latlng: LatLng): Point
	  	// Given a geographical coordinate, returns the corresponding pixel coordinate
	  	// relative to the [origin pixel](#map-getpixelorigin).
	  	latLngToLayerPoint: function (latlng) {
	  		var projectedPoint = this.project(toLatLng(latlng))._round();
	  		return projectedPoint._subtract(this.getPixelOrigin());
	  	},

	  	// @method wrapLatLng(latlng: LatLng): LatLng
	  	// Returns a `LatLng` where `lat` and `lng` has been wrapped according to the
	  	// map's CRS's `wrapLat` and `wrapLng` properties, if they are outside the
	  	// CRS's bounds.
	  	// By default this means longitude is wrapped around the dateline so its
	  	// value is between -180 and +180 degrees.
	  	wrapLatLng: function (latlng) {
	  		return this.options.crs.wrapLatLng(toLatLng(latlng));
	  	},

	  	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
	  	// Returns a `LatLngBounds` with the same size as the given one, ensuring that
	  	// its center is within the CRS's bounds.
	  	// By default this means the center longitude is wrapped around the dateline so its
	  	// value is between -180 and +180 degrees, and the majority of the bounds
	  	// overlaps the CRS's bounds.
	  	wrapLatLngBounds: function (latlng) {
	  		return this.options.crs.wrapLatLngBounds(toLatLngBounds(latlng));
	  	},

	  	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
	  	// Returns the distance between two geographical coordinates according to
	  	// the map's CRS. By default this measures distance in meters.
	  	distance: function (latlng1, latlng2) {
	  		return this.options.crs.distance(toLatLng(latlng1), toLatLng(latlng2));
	  	},

	  	// @method containerPointToLayerPoint(point: Point): Point
	  	// Given a pixel coordinate relative to the map container, returns the corresponding
	  	// pixel coordinate relative to the [origin pixel](#map-getpixelorigin).
	  	containerPointToLayerPoint: function (point) { // (Point)
	  		return toPoint(point).subtract(this._getMapPanePos());
	  	},

	  	// @method layerPointToContainerPoint(point: Point): Point
	  	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
	  	// returns the corresponding pixel coordinate relative to the map container.
	  	layerPointToContainerPoint: function (point) { // (Point)
	  		return toPoint(point).add(this._getMapPanePos());
	  	},

	  	// @method containerPointToLatLng(point: Point): LatLng
	  	// Given a pixel coordinate relative to the map container, returns
	  	// the corresponding geographical coordinate (for the current zoom level).
	  	containerPointToLatLng: function (point) {
	  		var layerPoint = this.containerPointToLayerPoint(toPoint(point));
	  		return this.layerPointToLatLng(layerPoint);
	  	},

	  	// @method latLngToContainerPoint(latlng: LatLng): Point
	  	// Given a geographical coordinate, returns the corresponding pixel coordinate
	  	// relative to the map container.
	  	latLngToContainerPoint: function (latlng) {
	  		return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
	  	},

	  	// @method mouseEventToContainerPoint(ev: MouseEvent): Point
	  	// Given a MouseEvent object, returns the pixel coordinate relative to the
	  	// map container where the event took place.
	  	mouseEventToContainerPoint: function (e) {
	  		return getMousePosition(e, this._container);
	  	},

	  	// @method mouseEventToLayerPoint(ev: MouseEvent): Point
	  	// Given a MouseEvent object, returns the pixel coordinate relative to
	  	// the [origin pixel](#map-getpixelorigin) where the event took place.
	  	mouseEventToLayerPoint: function (e) {
	  		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
	  	},

	  	// @method mouseEventToLatLng(ev: MouseEvent): LatLng
	  	// Given a MouseEvent object, returns geographical coordinate where the
	  	// event took place.
	  	mouseEventToLatLng: function (e) { // (MouseEvent)
	  		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
	  	},


	  	// map initialization methods

	  	_initContainer: function (id) {
	  		var container = this._container = get(id);

	  		if (!container) {
	  			throw new Error('Map container not found.');
	  		} else if (container._leaflet_id) {
	  			throw new Error('Map container is already initialized.');
	  		}

	  		on(container, 'scroll', this._onScroll, this);
	  		this._containerId = stamp(container);
	  	},

	  	_initLayout: function () {
	  		var container = this._container;

	  		this._fadeAnimated = this.options.fadeAnimation && any3d;

	  		addClass(container, 'leaflet-container' +
	  			(touch ? ' leaflet-touch' : '') +
	  			(retina ? ' leaflet-retina' : '') +
	  			(ielt9 ? ' leaflet-oldie' : '') +
	  			(safari ? ' leaflet-safari' : '') +
	  			(this._fadeAnimated ? ' leaflet-fade-anim' : ''));

	  		var position = getStyle(container, 'position');

	  		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
	  			container.style.position = 'relative';
	  		}

	  		this._initPanes();

	  		if (this._initControlPos) {
	  			this._initControlPos();
	  		}
	  	},

	  	_initPanes: function () {
	  		var panes = this._panes = {};
	  		this._paneRenderers = {};

	  		// @section
	  		//
	  		// Panes are DOM elements used to control the ordering of layers on the map. You
	  		// can access panes with [`map.getPane`](#map-getpane) or
	  		// [`map.getPanes`](#map-getpanes) methods. New panes can be created with the
	  		// [`map.createPane`](#map-createpane) method.
	  		//
	  		// Every map has the following default panes that differ only in zIndex.
	  		//
	  		// @pane mapPane: HTMLElement = 'auto'
	  		// Pane that contains all other map panes

	  		this._mapPane = this.createPane('mapPane', this._container);
	  		setPosition(this._mapPane, new Point(0, 0));

	  		// @pane tilePane: HTMLElement = 200
	  		// Pane for `GridLayer`s and `TileLayer`s
	  		this.createPane('tilePane');
	  		// @pane overlayPane: HTMLElement = 400
	  		// Pane for overlay shadows (e.g. `Marker` shadows)
	  		this.createPane('shadowPane');
	  		// @pane shadowPane: HTMLElement = 500
	  		// Pane for vectors (`Path`s, like `Polyline`s and `Polygon`s), `ImageOverlay`s and `VideoOverlay`s
	  		this.createPane('overlayPane');
	  		// @pane markerPane: HTMLElement = 600
	  		// Pane for `Icon`s of `Marker`s
	  		this.createPane('markerPane');
	  		// @pane tooltipPane: HTMLElement = 650
	  		// Pane for `Tooltip`s.
	  		this.createPane('tooltipPane');
	  		// @pane popupPane: HTMLElement = 700
	  		// Pane for `Popup`s.
	  		this.createPane('popupPane');

	  		if (!this.options.markerZoomAnimation) {
	  			addClass(panes.markerPane, 'leaflet-zoom-hide');
	  			addClass(panes.shadowPane, 'leaflet-zoom-hide');
	  		}
	  	},


	  	// private methods that modify map state

	  	// @section Map state change events
	  	_resetView: function (center, zoom) {
	  		setPosition(this._mapPane, new Point(0, 0));

	  		var loading = !this._loaded;
	  		this._loaded = true;
	  		zoom = this._limitZoom(zoom);

	  		this.fire('viewprereset');

	  		var zoomChanged = this._zoom !== zoom;
	  		this
	  			._moveStart(zoomChanged, false)
	  			._move(center, zoom)
	  			._moveEnd(zoomChanged);

	  		// @event viewreset: Event
	  		// Fired when the map needs to redraw its content (this usually happens
	  		// on map zoom or load). Very useful for creating custom overlays.
	  		this.fire('viewreset');

	  		// @event load: Event
	  		// Fired when the map is initialized (when its center and zoom are set
	  		// for the first time).
	  		if (loading) {
	  			this.fire('load');
	  		}
	  	},

	  	_moveStart: function (zoomChanged, noMoveStart) {
	  		// @event zoomstart: Event
	  		// Fired when the map zoom is about to change (e.g. before zoom animation).
	  		// @event movestart: Event
	  		// Fired when the view of the map starts changing (e.g. user starts dragging the map).
	  		if (zoomChanged) {
	  			this.fire('zoomstart');
	  		}
	  		if (!noMoveStart) {
	  			this.fire('movestart');
	  		}
	  		return this;
	  	},

	  	_move: function (center, zoom, data) {
	  		if (zoom === undefined) {
	  			zoom = this._zoom;
	  		}
	  		var zoomChanged = this._zoom !== zoom;

	  		this._zoom = zoom;
	  		this._lastCenter = center;
	  		this._pixelOrigin = this._getNewPixelOrigin(center);

	  		// @event zoom: Event
	  		// Fired repeatedly during any change in zoom level, including zoom
	  		// and fly animations.
	  		if (zoomChanged || (data && data.pinch)) {	// Always fire 'zoom' if pinching because #3530
	  			this.fire('zoom', data);
	  		}

	  		// @event move: Event
	  		// Fired repeatedly during any movement of the map, including pan and
	  		// fly animations.
	  		return this.fire('move', data);
	  	},

	  	_moveEnd: function (zoomChanged) {
	  		// @event zoomend: Event
	  		// Fired when the map has changed, after any animations.
	  		if (zoomChanged) {
	  			this.fire('zoomend');
	  		}

	  		// @event moveend: Event
	  		// Fired when the center of the map stops changing (e.g. user stopped
	  		// dragging the map).
	  		return this.fire('moveend');
	  	},

	  	_stop: function () {
	  		cancelAnimFrame(this._flyToFrame);
	  		if (this._panAnim) {
	  			this._panAnim.stop();
	  		}
	  		return this;
	  	},

	  	_rawPanBy: function (offset) {
	  		setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
	  	},

	  	_getZoomSpan: function () {
	  		return this.getMaxZoom() - this.getMinZoom();
	  	},

	  	_panInsideMaxBounds: function () {
	  		if (!this._enforcingBounds) {
	  			this.panInsideBounds(this.options.maxBounds);
	  		}
	  	},

	  	_checkIfLoaded: function () {
	  		if (!this._loaded) {
	  			throw new Error('Set map center and zoom first.');
	  		}
	  	},

	  	// DOM event handling

	  	// @section Interaction events
	  	_initEvents: function (remove$$1) {
	  		this._targets = {};
	  		this._targets[stamp(this._container)] = this;

	  		var onOff = remove$$1 ? off : on;

	  		// @event click: MouseEvent
	  		// Fired when the user clicks (or taps) the map.
	  		// @event dblclick: MouseEvent
	  		// Fired when the user double-clicks (or double-taps) the map.
	  		// @event mousedown: MouseEvent
	  		// Fired when the user pushes the mouse button on the map.
	  		// @event mouseup: MouseEvent
	  		// Fired when the user releases the mouse button on the map.
	  		// @event mouseover: MouseEvent
	  		// Fired when the mouse enters the map.
	  		// @event mouseout: MouseEvent
	  		// Fired when the mouse leaves the map.
	  		// @event mousemove: MouseEvent
	  		// Fired while the mouse moves over the map.
	  		// @event contextmenu: MouseEvent
	  		// Fired when the user pushes the right mouse button on the map, prevents
	  		// default browser context menu from showing if there are listeners on
	  		// this event. Also fired on mobile when the user holds a single touch
	  		// for a second (also called long press).
	  		// @event keypress: KeyboardEvent
	  		// Fired when the user presses a key from the keyboard that produces a character value while the map is focused.
	  		// @event keydown: KeyboardEvent
	  		// Fired when the user presses a key from the keyboard while the map is focused. Unlike the `keypress` event,
	  		// the `keydown` event is fired for keys that produce a character value and for keys
	  		// that do not produce a character value.
	  		// @event keyup: KeyboardEvent
	  		// Fired when the user releases a key from the keyboard while the map is focused.
	  		onOff(this._container, 'click dblclick mousedown mouseup ' +
	  			'mouseover mouseout mousemove contextmenu keypress keydown keyup', this._handleDOMEvent, this);

	  		if (this.options.trackResize) {
	  			onOff(window, 'resize', this._onResize, this);
	  		}

	  		if (any3d && this.options.transform3DLimit) {
	  			(remove$$1 ? this.off : this.on).call(this, 'moveend', this._onMoveEnd);
	  		}
	  	},

	  	_onResize: function () {
	  		cancelAnimFrame(this._resizeRequest);
	  		this._resizeRequest = requestAnimFrame(
	  		        function () { this.invalidateSize({debounceMoveend: true}); }, this);
	  	},

	  	_onScroll: function () {
	  		this._container.scrollTop  = 0;
	  		this._container.scrollLeft = 0;
	  	},

	  	_onMoveEnd: function () {
	  		var pos = this._getMapPanePos();
	  		if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
	  			// https://bugzilla.mozilla.org/show_bug.cgi?id=1203873 but Webkit also have
	  			// a pixel offset on very high values, see: http://jsfiddle.net/dg6r5hhb/
	  			this._resetView(this.getCenter(), this.getZoom());
	  		}
	  	},

	  	_findEventTargets: function (e, type) {
	  		var targets = [],
	  		    target,
	  		    isHover = type === 'mouseout' || type === 'mouseover',
	  		    src = e.target || e.srcElement,
	  		    dragging = false;

	  		while (src) {
	  			target = this._targets[stamp(src)];
	  			if (target && (type === 'click' || type === 'preclick') && !e._simulated && this._draggableMoved(target)) {
	  				// Prevent firing click after you just dragged an object.
	  				dragging = true;
	  				break;
	  			}
	  			if (target && target.listens(type, true)) {
	  				if (isHover && !isExternalTarget(src, e)) { break; }
	  				targets.push(target);
	  				if (isHover) { break; }
	  			}
	  			if (src === this._container) { break; }
	  			src = src.parentNode;
	  		}
	  		if (!targets.length && !dragging && !isHover && isExternalTarget(src, e)) {
	  			targets = [this];
	  		}
	  		return targets;
	  	},

	  	_handleDOMEvent: function (e) {
	  		if (!this._loaded || skipped(e)) { return; }

	  		var type = e.type;

	  		if (type === 'mousedown' || type === 'keypress' || type === 'keyup' || type === 'keydown') {
	  			// prevents outline when clicking on keyboard-focusable element
	  			preventOutline(e.target || e.srcElement);
	  		}

	  		this._fireDOMEvent(e, type);
	  	},

	  	_mouseEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],

	  	_fireDOMEvent: function (e, type, targets) {

	  		if (e.type === 'click') {
	  			// Fire a synthetic 'preclick' event which propagates up (mainly for closing popups).
	  			// @event preclick: MouseEvent
	  			// Fired before mouse click on the map (sometimes useful when you
	  			// want something to happen on click before any existing click
	  			// handlers start running).
	  			var synth = extend({}, e);
	  			synth.type = 'preclick';
	  			this._fireDOMEvent(synth, synth.type, targets);
	  		}

	  		if (e._stopped) { return; }

	  		// Find the layer the event is propagating from and its parents.
	  		targets = (targets || []).concat(this._findEventTargets(e, type));

	  		if (!targets.length) { return; }

	  		var target = targets[0];
	  		if (type === 'contextmenu' && target.listens(type, true)) {
	  			preventDefault(e);
	  		}

	  		var data = {
	  			originalEvent: e
	  		};

	  		if (e.type !== 'keypress' && e.type !== 'keydown' && e.type !== 'keyup') {
	  			var isMarker = target.getLatLng && (!target._radius || target._radius <= 10);
	  			data.containerPoint = isMarker ?
	  				this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
	  			data.layerPoint = this.containerPointToLayerPoint(data.containerPoint);
	  			data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint);
	  		}

	  		for (var i = 0; i < targets.length; i++) {
	  			targets[i].fire(type, data, true);
	  			if (data.originalEvent._stopped ||
	  				(targets[i].options.bubblingMouseEvents === false && indexOf(this._mouseEvents, type) !== -1)) { return; }
	  		}
	  	},

	  	_draggableMoved: function (obj) {
	  		obj = obj.dragging && obj.dragging.enabled() ? obj : this;
	  		return (obj.dragging && obj.dragging.moved()) || (this.boxZoom && this.boxZoom.moved());
	  	},

	  	_clearHandlers: function () {
	  		for (var i = 0, len = this._handlers.length; i < len; i++) {
	  			this._handlers[i].disable();
	  		}
	  	},

	  	// @section Other Methods

	  	// @method whenReady(fn: Function, context?: Object): this
	  	// Runs the given function `fn` when the map gets initialized with
	  	// a view (center and zoom) and at least one layer, or immediately
	  	// if it's already initialized, optionally passing a function context.
	  	whenReady: function (callback, context) {
	  		if (this._loaded) {
	  			callback.call(context || this, {target: this});
	  		} else {
	  			this.on('load', callback, context);
	  		}
	  		return this;
	  	},


	  	// private methods for getting map state

	  	_getMapPanePos: function () {
	  		return getPosition(this._mapPane) || new Point(0, 0);
	  	},

	  	_moved: function () {
	  		var pos = this._getMapPanePos();
	  		return pos && !pos.equals([0, 0]);
	  	},

	  	_getTopLeftPoint: function (center, zoom) {
	  		var pixelOrigin = center && zoom !== undefined ?
	  			this._getNewPixelOrigin(center, zoom) :
	  			this.getPixelOrigin();
	  		return pixelOrigin.subtract(this._getMapPanePos());
	  	},

	  	_getNewPixelOrigin: function (center, zoom) {
	  		var viewHalf = this.getSize()._divideBy(2);
	  		return this.project(center, zoom)._subtract(viewHalf)._add(this._getMapPanePos())._round();
	  	},

	  	_latLngToNewLayerPoint: function (latlng, zoom, center) {
	  		var topLeft = this._getNewPixelOrigin(center, zoom);
	  		return this.project(latlng, zoom)._subtract(topLeft);
	  	},

	  	_latLngBoundsToNewLayerBounds: function (latLngBounds, zoom, center) {
	  		var topLeft = this._getNewPixelOrigin(center, zoom);
	  		return toBounds([
	  			this.project(latLngBounds.getSouthWest(), zoom)._subtract(topLeft),
	  			this.project(latLngBounds.getNorthWest(), zoom)._subtract(topLeft),
	  			this.project(latLngBounds.getSouthEast(), zoom)._subtract(topLeft),
	  			this.project(latLngBounds.getNorthEast(), zoom)._subtract(topLeft)
	  		]);
	  	},

	  	// layer point of the current center
	  	_getCenterLayerPoint: function () {
	  		return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
	  	},

	  	// offset of the specified place to the current center in pixels
	  	_getCenterOffset: function (latlng) {
	  		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
	  	},

	  	// adjust center for view to get inside bounds
	  	_limitCenter: function (center, zoom, bounds) {

	  		if (!bounds) { return center; }

	  		var centerPoint = this.project(center, zoom),
	  		    viewHalf = this.getSize().divideBy(2),
	  		    viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
	  		    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

	  		// If offset is less than a pixel, ignore.
	  		// This prevents unstable projections from getting into
	  		// an infinite loop of tiny offsets.
	  		if (offset.round().equals([0, 0])) {
	  			return center;
	  		}

	  		return this.unproject(centerPoint.add(offset), zoom);
	  	},

	  	// adjust offset for view to get inside bounds
	  	_limitOffset: function (offset, bounds) {
	  		if (!bounds) { return offset; }

	  		var viewBounds = this.getPixelBounds(),
	  		    newBounds = new Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

	  		return offset.add(this._getBoundsOffset(newBounds, bounds));
	  	},

	  	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
	  	_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
	  		var projectedMaxBounds = toBounds(
	  		        this.project(maxBounds.getNorthEast(), zoom),
	  		        this.project(maxBounds.getSouthWest(), zoom)
	  		    ),
	  		    minOffset = projectedMaxBounds.min.subtract(pxBounds.min),
	  		    maxOffset = projectedMaxBounds.max.subtract(pxBounds.max),

	  		    dx = this._rebound(minOffset.x, -maxOffset.x),
	  		    dy = this._rebound(minOffset.y, -maxOffset.y);

	  		return new Point(dx, dy);
	  	},

	  	_rebound: function (left, right) {
	  		return left + right > 0 ?
	  			Math.round(left - right) / 2 :
	  			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
	  	},

	  	_limitZoom: function (zoom) {
	  		var min = this.getMinZoom(),
	  		    max = this.getMaxZoom(),
	  		    snap = any3d ? this.options.zoomSnap : 1;
	  		if (snap) {
	  			zoom = Math.round(zoom / snap) * snap;
	  		}
	  		return Math.max(min, Math.min(max, zoom));
	  	},

	  	_onPanTransitionStep: function () {
	  		this.fire('move');
	  	},

	  	_onPanTransitionEnd: function () {
	  		removeClass(this._mapPane, 'leaflet-pan-anim');
	  		this.fire('moveend');
	  	},

	  	_tryAnimatedPan: function (center, options) {
	  		// difference between the new and current centers in pixels
	  		var offset = this._getCenterOffset(center)._trunc();

	  		// don't animate too far unless animate: true specified in options
	  		if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

	  		this.panBy(offset, options);

	  		return true;
	  	},

	  	_createAnimProxy: function () {

	  		var proxy = this._proxy = create$1('div', 'leaflet-proxy leaflet-zoom-animated');
	  		this._panes.mapPane.appendChild(proxy);

	  		this.on('zoomanim', function (e) {
	  			var prop = TRANSFORM,
	  			    transform = this._proxy.style[prop];

	  			setTransform(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1));

	  			// workaround for case when transform is the same and so transitionend event is not fired
	  			if (transform === this._proxy.style[prop] && this._animatingZoom) {
	  				this._onZoomTransitionEnd();
	  			}
	  		}, this);

	  		this.on('load moveend', this._animMoveEnd, this);

	  		this._on('unload', this._destroyAnimProxy, this);
	  	},

	  	_destroyAnimProxy: function () {
	  		remove(this._proxy);
	  		this.off('load moveend', this._animMoveEnd, this);
	  		delete this._proxy;
	  	},

	  	_animMoveEnd: function () {
	  		var c = this.getCenter(),
	  		    z = this.getZoom();
	  		setTransform(this._proxy, this.project(c, z), this.getZoomScale(z, 1));
	  	},

	  	_catchTransitionEnd: function (e) {
	  		if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
	  			this._onZoomTransitionEnd();
	  		}
	  	},

	  	_nothingToAnimate: function () {
	  		return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
	  	},

	  	_tryAnimatedZoom: function (center, zoom, options) {

	  		if (this._animatingZoom) { return true; }

	  		options = options || {};

	  		// don't animate if disabled, not supported or zoom difference is too large
	  		if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
	  		        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

	  		// offset is the pixel coords of the zoom origin relative to the current center
	  		var scale = this.getZoomScale(zoom),
	  		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale);

	  		// don't animate if the zoom origin isn't within one screen from the current center, unless forced
	  		if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

	  		requestAnimFrame(function () {
	  			this
	  			    ._moveStart(true, false)
	  			    ._animateZoom(center, zoom, true);
	  		}, this);

	  		return true;
	  	},

	  	_animateZoom: function (center, zoom, startAnim, noUpdate) {
	  		if (!this._mapPane) { return; }

	  		if (startAnim) {
	  			this._animatingZoom = true;

	  			// remember what center/zoom to set after animation
	  			this._animateToCenter = center;
	  			this._animateToZoom = zoom;

	  			addClass(this._mapPane, 'leaflet-zoom-anim');
	  		}

	  		// @section Other Events
	  		// @event zoomanim: ZoomAnimEvent
	  		// Fired at least once per zoom animation. For continuous zoom, like pinch zooming, fired once per frame during zoom.
	  		this.fire('zoomanim', {
	  			center: center,
	  			zoom: zoom,
	  			noUpdate: noUpdate
	  		});

	  		// Work around webkit not firing 'transitionend', see https://github.com/Leaflet/Leaflet/issues/3689, 2693
	  		setTimeout(bind(this._onZoomTransitionEnd, this), 250);
	  	},

	  	_onZoomTransitionEnd: function () {
	  		if (!this._animatingZoom) { return; }

	  		if (this._mapPane) {
	  			removeClass(this._mapPane, 'leaflet-zoom-anim');
	  		}

	  		this._animatingZoom = false;

	  		this._move(this._animateToCenter, this._animateToZoom);

	  		// This anim frame should prevent an obscure iOS webkit tile loading race condition.
	  		requestAnimFrame(function () {
	  			this._moveEnd(true);
	  		}, this);
	  	}
	  });

	  // @section

	  // @factory L.map(id: String, options?: Map options)
	  // Instantiates a map object given the DOM ID of a `<div>` element
	  // and optionally an object literal with `Map options`.
	  //
	  // @alternative
	  // @factory L.map(el: HTMLElement, options?: Map options)
	  // Instantiates a map object given an instance of a `<div>` HTML element
	  // and optionally an object literal with `Map options`.
	  function createMap(id, options) {
	  	return new Map(id, options);
	  }

	  /*
	   * @class Control
	   * @aka L.Control
	   * @inherits Class
	   *
	   * L.Control is a base class for implementing map controls. Handles positioning.
	   * All other controls extend from this class.
	   */

	  var Control = Class.extend({
	  	// @section
	  	// @aka Control options
	  	options: {
	  		// @option position: String = 'topright'
	  		// The position of the control (one of the map corners). Possible values are `'topleft'`,
	  		// `'topright'`, `'bottomleft'` or `'bottomright'`
	  		position: 'topright'
	  	},

	  	initialize: function (options) {
	  		setOptions(this, options);
	  	},

	  	/* @section
	  	 * Classes extending L.Control will inherit the following methods:
	  	 *
	  	 * @method getPosition: string
	  	 * Returns the position of the control.
	  	 */
	  	getPosition: function () {
	  		return this.options.position;
	  	},

	  	// @method setPosition(position: string): this
	  	// Sets the position of the control.
	  	setPosition: function (position) {
	  		var map = this._map;

	  		if (map) {
	  			map.removeControl(this);
	  		}

	  		this.options.position = position;

	  		if (map) {
	  			map.addControl(this);
	  		}

	  		return this;
	  	},

	  	// @method getContainer: HTMLElement
	  	// Returns the HTMLElement that contains the control.
	  	getContainer: function () {
	  		return this._container;
	  	},

	  	// @method addTo(map: Map): this
	  	// Adds the control to the given map.
	  	addTo: function (map) {
	  		this.remove();
	  		this._map = map;

	  		var container = this._container = this.onAdd(map),
	  		    pos = this.getPosition(),
	  		    corner = map._controlCorners[pos];

	  		addClass(container, 'leaflet-control');

	  		if (pos.indexOf('bottom') !== -1) {
	  			corner.insertBefore(container, corner.firstChild);
	  		} else {
	  			corner.appendChild(container);
	  		}

	  		this._map.on('unload', this.remove, this);

	  		return this;
	  	},

	  	// @method remove: this
	  	// Removes the control from the map it is currently active on.
	  	remove: function () {
	  		if (!this._map) {
	  			return this;
	  		}

	  		remove(this._container);

	  		if (this.onRemove) {
	  			this.onRemove(this._map);
	  		}

	  		this._map.off('unload', this.remove, this);
	  		this._map = null;

	  		return this;
	  	},

	  	_refocusOnMap: function (e) {
	  		// if map exists and event is not a keyboard event
	  		if (this._map && e && e.screenX > 0 && e.screenY > 0) {
	  			this._map.getContainer().focus();
	  		}
	  	}
	  });

	  var control = function (options) {
	  	return new Control(options);
	  };

	  /* @section Extension methods
	   * @uninheritable
	   *
	   * Every control should extend from `L.Control` and (re-)implement the following methods.
	   *
	   * @method onAdd(map: Map): HTMLElement
	   * Should return the container DOM element for the control and add listeners on relevant map events. Called on [`control.addTo(map)`](#control-addTo).
	   *
	   * @method onRemove(map: Map)
	   * Optional method. Should contain all clean up code that removes the listeners previously added in [`onAdd`](#control-onadd). Called on [`control.remove()`](#control-remove).
	   */

	  /* @namespace Map
	   * @section Methods for Layers and Controls
	   */
	  Map.include({
	  	// @method addControl(control: Control): this
	  	// Adds the given control to the map
	  	addControl: function (control) {
	  		control.addTo(this);
	  		return this;
	  	},

	  	// @method removeControl(control: Control): this
	  	// Removes the given control from the map
	  	removeControl: function (control) {
	  		control.remove();
	  		return this;
	  	},

	  	_initControlPos: function () {
	  		var corners = this._controlCorners = {},
	  		    l = 'leaflet-',
	  		    container = this._controlContainer =
	  		            create$1('div', l + 'control-container', this._container);

	  		function createCorner(vSide, hSide) {
	  			var className = l + vSide + ' ' + l + hSide;

	  			corners[vSide + hSide] = create$1('div', className, container);
	  		}

	  		createCorner('top', 'left');
	  		createCorner('top', 'right');
	  		createCorner('bottom', 'left');
	  		createCorner('bottom', 'right');
	  	},

	  	_clearControlPos: function () {
	  		for (var i in this._controlCorners) {
	  			remove(this._controlCorners[i]);
	  		}
	  		remove(this._controlContainer);
	  		delete this._controlCorners;
	  		delete this._controlContainer;
	  	}
	  });

	  /*
	   * @class Control.Layers
	   * @aka L.Control.Layers
	   * @inherits Control
	   *
	   * The layers control gives users the ability to switch between different base layers and switch overlays on/off (check out the [detailed example](http://leafletjs.com/examples/layers-control/)). Extends `Control`.
	   *
	   * @example
	   *
	   * ```js
	   * var baseLayers = {
	   * 	"Mapbox": mapbox,
	   * 	"OpenStreetMap": osm
	   * };
	   *
	   * var overlays = {
	   * 	"Marker": marker,
	   * 	"Roads": roadsLayer
	   * };
	   *
	   * L.control.layers(baseLayers, overlays).addTo(map);
	   * ```
	   *
	   * The `baseLayers` and `overlays` parameters are object literals with layer names as keys and `Layer` objects as values:
	   *
	   * ```js
	   * {
	   *     "<someName1>": layer1,
	   *     "<someName2>": layer2
	   * }
	   * ```
	   *
	   * The layer names can contain HTML, which allows you to add additional styling to the items:
	   *
	   * ```js
	   * {"<img src='my-layer-icon' /> <span class='my-layer-item'>My Layer</span>": myLayer}
	   * ```
	   */

	  var Layers = Control.extend({
	  	// @section
	  	// @aka Control.Layers options
	  	options: {
	  		// @option collapsed: Boolean = true
	  		// If `true`, the control will be collapsed into an icon and expanded on mouse hover or touch.
	  		collapsed: true,
	  		position: 'topright',

	  		// @option autoZIndex: Boolean = true
	  		// If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
	  		autoZIndex: true,

	  		// @option hideSingleBase: Boolean = false
	  		// If `true`, the base layers in the control will be hidden when there is only one.
	  		hideSingleBase: false,

	  		// @option sortLayers: Boolean = false
	  		// Whether to sort the layers. When `false`, layers will keep the order
	  		// in which they were added to the control.
	  		sortLayers: false,

	  		// @option sortFunction: Function = *
	  		// A [compare function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
	  		// that will be used for sorting the layers, when `sortLayers` is `true`.
	  		// The function receives both the `L.Layer` instances and their names, as in
	  		// `sortFunction(layerA, layerB, nameA, nameB)`.
	  		// By default, it sorts layers alphabetically by their name.
	  		sortFunction: function (layerA, layerB, nameA, nameB) {
	  			return nameA < nameB ? -1 : (nameB < nameA ? 1 : 0);
	  		}
	  	},

	  	initialize: function (baseLayers, overlays, options) {
	  		setOptions(this, options);

	  		this._layerControlInputs = [];
	  		this._layers = [];
	  		this._lastZIndex = 0;
	  		this._handlingClick = false;

	  		for (var i in baseLayers) {
	  			this._addLayer(baseLayers[i], i);
	  		}

	  		for (i in overlays) {
	  			this._addLayer(overlays[i], i, true);
	  		}
	  	},

	  	onAdd: function (map) {
	  		this._initLayout();
	  		this._update();

	  		this._map = map;
	  		map.on('zoomend', this._checkDisabledLayers, this);

	  		for (var i = 0; i < this._layers.length; i++) {
	  			this._layers[i].layer.on('add remove', this._onLayerChange, this);
	  		}

	  		return this._container;
	  	},

	  	addTo: function (map) {
	  		Control.prototype.addTo.call(this, map);
	  		// Trigger expand after Layers Control has been inserted into DOM so that is now has an actual height.
	  		return this._expandIfNotCollapsed();
	  	},

	  	onRemove: function () {
	  		this._map.off('zoomend', this._checkDisabledLayers, this);

	  		for (var i = 0; i < this._layers.length; i++) {
	  			this._layers[i].layer.off('add remove', this._onLayerChange, this);
	  		}
	  	},

	  	// @method addBaseLayer(layer: Layer, name: String): this
	  	// Adds a base layer (radio button entry) with the given name to the control.
	  	addBaseLayer: function (layer, name) {
	  		this._addLayer(layer, name);
	  		return (this._map) ? this._update() : this;
	  	},

	  	// @method addOverlay(layer: Layer, name: String): this
	  	// Adds an overlay (checkbox entry) with the given name to the control.
	  	addOverlay: function (layer, name) {
	  		this._addLayer(layer, name, true);
	  		return (this._map) ? this._update() : this;
	  	},

	  	// @method removeLayer(layer: Layer): this
	  	// Remove the given layer from the control.
	  	removeLayer: function (layer) {
	  		layer.off('add remove', this._onLayerChange, this);

	  		var obj = this._getLayer(stamp(layer));
	  		if (obj) {
	  			this._layers.splice(this._layers.indexOf(obj), 1);
	  		}
	  		return (this._map) ? this._update() : this;
	  	},

	  	// @method expand(): this
	  	// Expand the control container if collapsed.
	  	expand: function () {
	  		addClass(this._container, 'leaflet-control-layers-expanded');
	  		this._section.style.height = null;
	  		var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
	  		if (acceptableHeight < this._section.clientHeight) {
	  			addClass(this._section, 'leaflet-control-layers-scrollbar');
	  			this._section.style.height = acceptableHeight + 'px';
	  		} else {
	  			removeClass(this._section, 'leaflet-control-layers-scrollbar');
	  		}
	  		this._checkDisabledLayers();
	  		return this;
	  	},

	  	// @method collapse(): this
	  	// Collapse the control container if expanded.
	  	collapse: function () {
	  		removeClass(this._container, 'leaflet-control-layers-expanded');
	  		return this;
	  	},

	  	_initLayout: function () {
	  		var className = 'leaflet-control-layers',
	  		    container = this._container = create$1('div', className),
	  		    collapsed = this.options.collapsed;

	  		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
	  		container.setAttribute('aria-haspopup', true);

	  		disableClickPropagation(container);
	  		disableScrollPropagation(container);

	  		var section = this._section = create$1('section', className + '-list');

	  		if (collapsed) {
	  			this._map.on('click', this.collapse, this);

	  			if (!android) {
	  				on(container, {
	  					mouseenter: this.expand,
	  					mouseleave: this.collapse
	  				}, this);
	  			}
	  		}

	  		var link = this._layersLink = create$1('a', className + '-toggle', container);
	  		link.href = '#';
	  		link.title = 'Layers';

	  		if (touch) {
	  			on(link, 'click', stop);
	  			on(link, 'click', this.expand, this);
	  		} else {
	  			on(link, 'focus', this.expand, this);
	  		}

	  		if (!collapsed) {
	  			this.expand();
	  		}

	  		this._baseLayersList = create$1('div', className + '-base', section);
	  		this._separator = create$1('div', className + '-separator', section);
	  		this._overlaysList = create$1('div', className + '-overlays', section);

	  		container.appendChild(section);
	  	},

	  	_getLayer: function (id) {
	  		for (var i = 0; i < this._layers.length; i++) {

	  			if (this._layers[i] && stamp(this._layers[i].layer) === id) {
	  				return this._layers[i];
	  			}
	  		}
	  	},

	  	_addLayer: function (layer, name, overlay) {
	  		if (this._map) {
	  			layer.on('add remove', this._onLayerChange, this);
	  		}

	  		this._layers.push({
	  			layer: layer,
	  			name: name,
	  			overlay: overlay
	  		});

	  		if (this.options.sortLayers) {
	  			this._layers.sort(bind(function (a, b) {
	  				return this.options.sortFunction(a.layer, b.layer, a.name, b.name);
	  			}, this));
	  		}

	  		if (this.options.autoZIndex && layer.setZIndex) {
	  			this._lastZIndex++;
	  			layer.setZIndex(this._lastZIndex);
	  		}

	  		this._expandIfNotCollapsed();
	  	},

	  	_update: function () {
	  		if (!this._container) { return this; }

	  		empty(this._baseLayersList);
	  		empty(this._overlaysList);

	  		this._layerControlInputs = [];
	  		var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;

	  		for (i = 0; i < this._layers.length; i++) {
	  			obj = this._layers[i];
	  			this._addItem(obj);
	  			overlaysPresent = overlaysPresent || obj.overlay;
	  			baseLayersPresent = baseLayersPresent || !obj.overlay;
	  			baseLayersCount += !obj.overlay ? 1 : 0;
	  		}

	  		// Hide base layers section if there's only one layer.
	  		if (this.options.hideSingleBase) {
	  			baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
	  			this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
	  		}

	  		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';

	  		return this;
	  	},

	  	_onLayerChange: function (e) {
	  		if (!this._handlingClick) {
	  			this._update();
	  		}

	  		var obj = this._getLayer(stamp(e.target));

	  		// @namespace Map
	  		// @section Layer events
	  		// @event baselayerchange: LayersControlEvent
	  		// Fired when the base layer is changed through the [layers control](#control-layers).
	  		// @event overlayadd: LayersControlEvent
	  		// Fired when an overlay is selected through the [layers control](#control-layers).
	  		// @event overlayremove: LayersControlEvent
	  		// Fired when an overlay is deselected through the [layers control](#control-layers).
	  		// @namespace Control.Layers
	  		var type = obj.overlay ?
	  			(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
	  			(e.type === 'add' ? 'baselayerchange' : null);

	  		if (type) {
	  			this._map.fire(type, obj);
	  		}
	  	},

	  	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	  	_createRadioElement: function (name, checked) {

	  		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
	  				name + '"' + (checked ? ' checked="checked"' : '') + '/>';

	  		var radioFragment = document.createElement('div');
	  		radioFragment.innerHTML = radioHtml;

	  		return radioFragment.firstChild;
	  	},

	  	_addItem: function (obj) {
	  		var label = document.createElement('label'),
	  		    checked = this._map.hasLayer(obj.layer),
	  		    input;

	  		if (obj.overlay) {
	  			input = document.createElement('input');
	  			input.type = 'checkbox';
	  			input.className = 'leaflet-control-layers-selector';
	  			input.defaultChecked = checked;
	  		} else {
	  			input = this._createRadioElement('leaflet-base-layers_' + stamp(this), checked);
	  		}

	  		this._layerControlInputs.push(input);
	  		input.layerId = stamp(obj.layer);

	  		on(input, 'click', this._onInputClick, this);

	  		var name = document.createElement('span');
	  		name.innerHTML = ' ' + obj.name;

	  		// Helps from preventing layer control flicker when checkboxes are disabled
	  		// https://github.com/Leaflet/Leaflet/issues/2771
	  		var holder = document.createElement('div');

	  		label.appendChild(holder);
	  		holder.appendChild(input);
	  		holder.appendChild(name);

	  		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
	  		container.appendChild(label);

	  		this._checkDisabledLayers();
	  		return label;
	  	},

	  	_onInputClick: function () {
	  		var inputs = this._layerControlInputs,
	  		    input, layer;
	  		var addedLayers = [],
	  		    removedLayers = [];

	  		this._handlingClick = true;

	  		for (var i = inputs.length - 1; i >= 0; i--) {
	  			input = inputs[i];
	  			layer = this._getLayer(input.layerId).layer;

	  			if (input.checked) {
	  				addedLayers.push(layer);
	  			} else if (!input.checked) {
	  				removedLayers.push(layer);
	  			}
	  		}

	  		// Bugfix issue 2318: Should remove all old layers before readding new ones
	  		for (i = 0; i < removedLayers.length; i++) {
	  			if (this._map.hasLayer(removedLayers[i])) {
	  				this._map.removeLayer(removedLayers[i]);
	  			}
	  		}
	  		for (i = 0; i < addedLayers.length; i++) {
	  			if (!this._map.hasLayer(addedLayers[i])) {
	  				this._map.addLayer(addedLayers[i]);
	  			}
	  		}

	  		this._handlingClick = false;

	  		this._refocusOnMap();
	  	},

	  	_checkDisabledLayers: function () {
	  		var inputs = this._layerControlInputs,
	  		    input,
	  		    layer,
	  		    zoom = this._map.getZoom();

	  		for (var i = inputs.length - 1; i >= 0; i--) {
	  			input = inputs[i];
	  			layer = this._getLayer(input.layerId).layer;
	  			input.disabled = (layer.options.minZoom !== undefined && zoom < layer.options.minZoom) ||
	  			                 (layer.options.maxZoom !== undefined && zoom > layer.options.maxZoom);

	  		}
	  	},

	  	_expandIfNotCollapsed: function () {
	  		if (this._map && !this.options.collapsed) {
	  			this.expand();
	  		}
	  		return this;
	  	},

	  	_expand: function () {
	  		// Backward compatibility, remove me in 1.1.
	  		return this.expand();
	  	},

	  	_collapse: function () {
	  		// Backward compatibility, remove me in 1.1.
	  		return this.collapse();
	  	}

	  });


	  // @factory L.control.layers(baselayers?: Object, overlays?: Object, options?: Control.Layers options)
	  // Creates a layers control with the given layers. Base layers will be switched with radio buttons, while overlays will be switched with checkboxes. Note that all base layers should be passed in the base layers object, but only one should be added to the map during map instantiation.
	  var layers = function (baseLayers, overlays, options) {
	  	return new Layers(baseLayers, overlays, options);
	  };

	  /*
	   * @class Control.Zoom
	   * @aka L.Control.Zoom
	   * @inherits Control
	   *
	   * A basic zoom control with two buttons (zoom in and zoom out). It is put on the map by default unless you set its [`zoomControl` option](#map-zoomcontrol) to `false`. Extends `Control`.
	   */

	  var Zoom = Control.extend({
	  	// @section
	  	// @aka Control.Zoom options
	  	options: {
	  		position: 'topleft',

	  		// @option zoomInText: String = '+'
	  		// The text set on the 'zoom in' button.
	  		zoomInText: '+',

	  		// @option zoomInTitle: String = 'Zoom in'
	  		// The title set on the 'zoom in' button.
	  		zoomInTitle: 'Zoom in',

	  		// @option zoomOutText: String = '&#x2212;'
	  		// The text set on the 'zoom out' button.
	  		zoomOutText: '&#x2212;',

	  		// @option zoomOutTitle: String = 'Zoom out'
	  		// The title set on the 'zoom out' button.
	  		zoomOutTitle: 'Zoom out'
	  	},

	  	onAdd: function (map) {
	  		var zoomName = 'leaflet-control-zoom',
	  		    container = create$1('div', zoomName + ' leaflet-bar'),
	  		    options = this.options;

	  		this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
	  		        zoomName + '-in',  container, this._zoomIn);
	  		this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
	  		        zoomName + '-out', container, this._zoomOut);

	  		this._updateDisabled();
	  		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

	  		return container;
	  	},

	  	onRemove: function (map) {
	  		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
	  	},

	  	disable: function () {
	  		this._disabled = true;
	  		this._updateDisabled();
	  		return this;
	  	},

	  	enable: function () {
	  		this._disabled = false;
	  		this._updateDisabled();
	  		return this;
	  	},

	  	_zoomIn: function (e) {
	  		if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
	  			this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
	  		}
	  	},

	  	_zoomOut: function (e) {
	  		if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
	  			this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
	  		}
	  	},

	  	_createButton: function (html, title, className, container, fn) {
	  		var link = create$1('a', className, container);
	  		link.innerHTML = html;
	  		link.href = '#';
	  		link.title = title;

	  		/*
	  		 * Will force screen readers like VoiceOver to read this as "Zoom in - button"
	  		 */
	  		link.setAttribute('role', 'button');
	  		link.setAttribute('aria-label', title);

	  		disableClickPropagation(link);
	  		on(link, 'click', stop);
	  		on(link, 'click', fn, this);
	  		on(link, 'click', this._refocusOnMap, this);

	  		return link;
	  	},

	  	_updateDisabled: function () {
	  		var map = this._map,
	  		    className = 'leaflet-disabled';

	  		removeClass(this._zoomInButton, className);
	  		removeClass(this._zoomOutButton, className);

	  		if (this._disabled || map._zoom === map.getMinZoom()) {
	  			addClass(this._zoomOutButton, className);
	  		}
	  		if (this._disabled || map._zoom === map.getMaxZoom()) {
	  			addClass(this._zoomInButton, className);
	  		}
	  	}
	  });

	  // @namespace Map
	  // @section Control options
	  // @option zoomControl: Boolean = true
	  // Whether a [zoom control](#control-zoom) is added to the map by default.
	  Map.mergeOptions({
	  	zoomControl: true
	  });

	  Map.addInitHook(function () {
	  	if (this.options.zoomControl) {
	  		// @section Controls
	  		// @property zoomControl: Control.Zoom
	  		// The default zoom control (only available if the
	  		// [`zoomControl` option](#map-zoomcontrol) was `true` when creating the map).
	  		this.zoomControl = new Zoom();
	  		this.addControl(this.zoomControl);
	  	}
	  });

	  // @namespace Control.Zoom
	  // @factory L.control.zoom(options: Control.Zoom options)
	  // Creates a zoom control
	  var zoom = function (options) {
	  	return new Zoom(options);
	  };

	  /*
	   * @class Control.Scale
	   * @aka L.Control.Scale
	   * @inherits Control
	   *
	   * A simple scale control that shows the scale of the current center of screen in metric (m/km) and imperial (mi/ft) systems. Extends `Control`.
	   *
	   * @example
	   *
	   * ```js
	   * L.control.scale().addTo(map);
	   * ```
	   */

	  var Scale = Control.extend({
	  	// @section
	  	// @aka Control.Scale options
	  	options: {
	  		position: 'bottomleft',

	  		// @option maxWidth: Number = 100
	  		// Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
	  		maxWidth: 100,

	  		// @option metric: Boolean = True
	  		// Whether to show the metric scale line (m/km).
	  		metric: true,

	  		// @option imperial: Boolean = True
	  		// Whether to show the imperial scale line (mi/ft).
	  		imperial: true

	  		// @option updateWhenIdle: Boolean = false
	  		// If `true`, the control is updated on [`moveend`](#map-moveend), otherwise it's always up-to-date (updated on [`move`](#map-move)).
	  	},

	  	onAdd: function (map) {
	  		var className = 'leaflet-control-scale',
	  		    container = create$1('div', className),
	  		    options = this.options;

	  		this._addScales(options, className + '-line', container);

	  		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
	  		map.whenReady(this._update, this);

	  		return container;
	  	},

	  	onRemove: function (map) {
	  		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
	  	},

	  	_addScales: function (options, className, container) {
	  		if (options.metric) {
	  			this._mScale = create$1('div', className, container);
	  		}
	  		if (options.imperial) {
	  			this._iScale = create$1('div', className, container);
	  		}
	  	},

	  	_update: function () {
	  		var map = this._map,
	  		    y = map.getSize().y / 2;

	  		var maxMeters = map.distance(
	  			map.containerPointToLatLng([0, y]),
	  			map.containerPointToLatLng([this.options.maxWidth, y]));

	  		this._updateScales(maxMeters);
	  	},

	  	_updateScales: function (maxMeters) {
	  		if (this.options.metric && maxMeters) {
	  			this._updateMetric(maxMeters);
	  		}
	  		if (this.options.imperial && maxMeters) {
	  			this._updateImperial(maxMeters);
	  		}
	  	},

	  	_updateMetric: function (maxMeters) {
	  		var meters = this._getRoundNum(maxMeters),
	  		    label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';

	  		this._updateScale(this._mScale, label, meters / maxMeters);
	  	},

	  	_updateImperial: function (maxMeters) {
	  		var maxFeet = maxMeters * 3.2808399,
	  		    maxMiles, miles, feet;

	  		if (maxFeet > 5280) {
	  			maxMiles = maxFeet / 5280;
	  			miles = this._getRoundNum(maxMiles);
	  			this._updateScale(this._iScale, miles + ' mi', miles / maxMiles);

	  		} else {
	  			feet = this._getRoundNum(maxFeet);
	  			this._updateScale(this._iScale, feet + ' ft', feet / maxFeet);
	  		}
	  	},

	  	_updateScale: function (scale, text, ratio) {
	  		scale.style.width = Math.round(this.options.maxWidth * ratio) + 'px';
	  		scale.innerHTML = text;
	  	},

	  	_getRoundNum: function (num) {
	  		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
	  		    d = num / pow10;

	  		d = d >= 10 ? 10 :
	  		    d >= 5 ? 5 :
	  		    d >= 3 ? 3 :
	  		    d >= 2 ? 2 : 1;

	  		return pow10 * d;
	  	}
	  });


	  // @factory L.control.scale(options?: Control.Scale options)
	  // Creates an scale control with the given options.
	  var scale = function (options) {
	  	return new Scale(options);
	  };

	  /*
	   * @class Control.Attribution
	   * @aka L.Control.Attribution
	   * @inherits Control
	   *
	   * The attribution control allows you to display attribution data in a small text box on a map. It is put on the map by default unless you set its [`attributionControl` option](#map-attributioncontrol) to `false`, and it fetches attribution texts from layers with the [`getAttribution` method](#layer-getattribution) automatically. Extends Control.
	   */

	  var Attribution = Control.extend({
	  	// @section
	  	// @aka Control.Attribution options
	  	options: {
	  		position: 'bottomright',

	  		// @option prefix: String = 'Leaflet'
	  		// The HTML text shown before the attributions. Pass `false` to disable.
	  		prefix: '<a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
	  	},

	  	initialize: function (options) {
	  		setOptions(this, options);

	  		this._attributions = {};
	  	},

	  	onAdd: function (map) {
	  		map.attributionControl = this;
	  		this._container = create$1('div', 'leaflet-control-attribution');
	  		disableClickPropagation(this._container);

	  		// TODO ugly, refactor
	  		for (var i in map._layers) {
	  			if (map._layers[i].getAttribution) {
	  				this.addAttribution(map._layers[i].getAttribution());
	  			}
	  		}

	  		this._update();

	  		return this._container;
	  	},

	  	// @method setPrefix(prefix: String): this
	  	// Sets the text before the attributions.
	  	setPrefix: function (prefix) {
	  		this.options.prefix = prefix;
	  		this._update();
	  		return this;
	  	},

	  	// @method addAttribution(text: String): this
	  	// Adds an attribution text (e.g. `'Vector data &copy; Mapbox'`).
	  	addAttribution: function (text) {
	  		if (!text) { return this; }

	  		if (!this._attributions[text]) {
	  			this._attributions[text] = 0;
	  		}
	  		this._attributions[text]++;

	  		this._update();

	  		return this;
	  	},

	  	// @method removeAttribution(text: String): this
	  	// Removes an attribution text.
	  	removeAttribution: function (text) {
	  		if (!text) { return this; }

	  		if (this._attributions[text]) {
	  			this._attributions[text]--;
	  			this._update();
	  		}

	  		return this;
	  	},

	  	_update: function () {
	  		if (!this._map) { return; }

	  		var attribs = [];

	  		for (var i in this._attributions) {
	  			if (this._attributions[i]) {
	  				attribs.push(i);
	  			}
	  		}

	  		var prefixAndAttribs = [];

	  		if (this.options.prefix) {
	  			prefixAndAttribs.push(this.options.prefix);
	  		}
	  		if (attribs.length) {
	  			prefixAndAttribs.push(attribs.join(', '));
	  		}

	  		this._container.innerHTML = prefixAndAttribs.join(' | ');
	  	}
	  });

	  // @namespace Map
	  // @section Control options
	  // @option attributionControl: Boolean = true
	  // Whether a [attribution control](#control-attribution) is added to the map by default.
	  Map.mergeOptions({
	  	attributionControl: true
	  });

	  Map.addInitHook(function () {
	  	if (this.options.attributionControl) {
	  		new Attribution().addTo(this);
	  	}
	  });

	  // @namespace Control.Attribution
	  // @factory L.control.attribution(options: Control.Attribution options)
	  // Creates an attribution control.
	  var attribution = function (options) {
	  	return new Attribution(options);
	  };

	  Control.Layers = Layers;
	  Control.Zoom = Zoom;
	  Control.Scale = Scale;
	  Control.Attribution = Attribution;

	  control.layers = layers;
	  control.zoom = zoom;
	  control.scale = scale;
	  control.attribution = attribution;

	  /*
	  	L.Handler is a base class for handler classes that are used internally to inject
	  	interaction features like dragging to classes like Map and Marker.
	  */

	  // @class Handler
	  // @aka L.Handler
	  // Abstract class for map interaction handlers

	  var Handler = Class.extend({
	  	initialize: function (map) {
	  		this._map = map;
	  	},

	  	// @method enable(): this
	  	// Enables the handler
	  	enable: function () {
	  		if (this._enabled) { return this; }

	  		this._enabled = true;
	  		this.addHooks();
	  		return this;
	  	},

	  	// @method disable(): this
	  	// Disables the handler
	  	disable: function () {
	  		if (!this._enabled) { return this; }

	  		this._enabled = false;
	  		this.removeHooks();
	  		return this;
	  	},

	  	// @method enabled(): Boolean
	  	// Returns `true` if the handler is enabled
	  	enabled: function () {
	  		return !!this._enabled;
	  	}

	  	// @section Extension methods
	  	// Classes inheriting from `Handler` must implement the two following methods:
	  	// @method addHooks()
	  	// Called when the handler is enabled, should add event hooks.
	  	// @method removeHooks()
	  	// Called when the handler is disabled, should remove the event hooks added previously.
	  });

	  // @section There is static function which can be called without instantiating L.Handler:
	  // @function addTo(map: Map, name: String): this
	  // Adds a new Handler to the given map with the given name.
	  Handler.addTo = function (map, name) {
	  	map.addHandler(name, this);
	  	return this;
	  };

	  var Mixin = {Events: Events};

	  /*
	   * @class Draggable
	   * @aka L.Draggable
	   * @inherits Evented
	   *
	   * A class for making DOM elements draggable (including touch support).
	   * Used internally for map and marker dragging. Only works for elements
	   * that were positioned with [`L.DomUtil.setPosition`](#domutil-setposition).
	   *
	   * @example
	   * ```js
	   * var draggable = new L.Draggable(elementToDrag);
	   * draggable.enable();
	   * ```
	   */

	  var START = touch ? 'touchstart mousedown' : 'mousedown';
	  var END = {
	  	mousedown: 'mouseup',
	  	touchstart: 'touchend',
	  	pointerdown: 'touchend',
	  	MSPointerDown: 'touchend'
	  };
	  var MOVE = {
	  	mousedown: 'mousemove',
	  	touchstart: 'touchmove',
	  	pointerdown: 'touchmove',
	  	MSPointerDown: 'touchmove'
	  };


	  var Draggable = Evented.extend({

	  	options: {
	  		// @section
	  		// @aka Draggable options
	  		// @option clickTolerance: Number = 3
	  		// The max number of pixels a user can shift the mouse pointer during a click
	  		// for it to be considered a valid click (as opposed to a mouse drag).
	  		clickTolerance: 3
	  	},

	  	// @constructor L.Draggable(el: HTMLElement, dragHandle?: HTMLElement, preventOutline?: Boolean, options?: Draggable options)
	  	// Creates a `Draggable` object for moving `el` when you start dragging the `dragHandle` element (equals `el` itself by default).
	  	initialize: function (element, dragStartTarget, preventOutline$$1, options) {
	  		setOptions(this, options);

	  		this._element = element;
	  		this._dragStartTarget = dragStartTarget || element;
	  		this._preventOutline = preventOutline$$1;
	  	},

	  	// @method enable()
	  	// Enables the dragging ability
	  	enable: function () {
	  		if (this._enabled) { return; }

	  		on(this._dragStartTarget, START, this._onDown, this);

	  		this._enabled = true;
	  	},

	  	// @method disable()
	  	// Disables the dragging ability
	  	disable: function () {
	  		if (!this._enabled) { return; }

	  		// If we're currently dragging this draggable,
	  		// disabling it counts as first ending the drag.
	  		if (Draggable._dragging === this) {
	  			this.finishDrag();
	  		}

	  		off(this._dragStartTarget, START, this._onDown, this);

	  		this._enabled = false;
	  		this._moved = false;
	  	},

	  	_onDown: function (e) {
	  		// Ignore simulated events, since we handle both touch and
	  		// mouse explicitly; otherwise we risk getting duplicates of
	  		// touch events, see #4315.
	  		// Also ignore the event if disabled; this happens in IE11
	  		// under some circumstances, see #3666.
	  		if (e._simulated || !this._enabled) { return; }

	  		this._moved = false;

	  		if (hasClass(this._element, 'leaflet-zoom-anim')) { return; }

	  		if (Draggable._dragging || e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }
	  		Draggable._dragging = this;  // Prevent dragging multiple objects at once.

	  		if (this._preventOutline) {
	  			preventOutline(this._element);
	  		}

	  		disableImageDrag();
	  		disableTextSelection();

	  		if (this._moving) { return; }

	  		// @event down: Event
	  		// Fired when a drag is about to start.
	  		this.fire('down');

	  		var first = e.touches ? e.touches[0] : e,
	  		    sizedParent = getSizedParentNode(this._element);

	  		this._startPoint = new Point(first.clientX, first.clientY);

	  		// Cache the scale, so that we can continuously compensate for it during drag (_onMove).
	  		this._parentScale = getScale(sizedParent);

	  		on(document, MOVE[e.type], this._onMove, this);
	  		on(document, END[e.type], this._onUp, this);
	  	},

	  	_onMove: function (e) {
	  		// Ignore simulated events, since we handle both touch and
	  		// mouse explicitly; otherwise we risk getting duplicates of
	  		// touch events, see #4315.
	  		// Also ignore the event if disabled; this happens in IE11
	  		// under some circumstances, see #3666.
	  		if (e._simulated || !this._enabled) { return; }

	  		if (e.touches && e.touches.length > 1) {
	  			this._moved = true;
	  			return;
	  		}

	  		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
	  		    offset = new Point(first.clientX, first.clientY)._subtract(this._startPoint);

	  		if (!offset.x && !offset.y) { return; }
	  		if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) { return; }

	  		// We assume that the parent container's position, border and scale do not change for the duration of the drag.
	  		// Therefore there is no need to account for the position and border (they are eliminated by the subtraction)
	  		// and we can use the cached value for the scale.
	  		offset.x /= this._parentScale.x;
	  		offset.y /= this._parentScale.y;

	  		preventDefault(e);

	  		if (!this._moved) {
	  			// @event dragstart: Event
	  			// Fired when a drag starts
	  			this.fire('dragstart');

	  			this._moved = true;
	  			this._startPos = getPosition(this._element).subtract(offset);

	  			addClass(document.body, 'leaflet-dragging');

	  			this._lastTarget = e.target || e.srcElement;
	  			// IE and Edge do not give the <use> element, so fetch it
	  			// if necessary
	  			if (window.SVGElementInstance && this._lastTarget instanceof window.SVGElementInstance) {
	  				this._lastTarget = this._lastTarget.correspondingUseElement;
	  			}
	  			addClass(this._lastTarget, 'leaflet-drag-target');
	  		}

	  		this._newPos = this._startPos.add(offset);
	  		this._moving = true;

	  		cancelAnimFrame(this._animRequest);
	  		this._lastEvent = e;
	  		this._animRequest = requestAnimFrame(this._updatePosition, this, true);
	  	},

	  	_updatePosition: function () {
	  		var e = {originalEvent: this._lastEvent};

	  		// @event predrag: Event
	  		// Fired continuously during dragging *before* each corresponding
	  		// update of the element's position.
	  		this.fire('predrag', e);
	  		setPosition(this._element, this._newPos);

	  		// @event drag: Event
	  		// Fired continuously during dragging.
	  		this.fire('drag', e);
	  	},

	  	_onUp: function (e) {
	  		// Ignore simulated events, since we handle both touch and
	  		// mouse explicitly; otherwise we risk getting duplicates of
	  		// touch events, see #4315.
	  		// Also ignore the event if disabled; this happens in IE11
	  		// under some circumstances, see #3666.
	  		if (e._simulated || !this._enabled) { return; }
	  		this.finishDrag();
	  	},

	  	finishDrag: function () {
	  		removeClass(document.body, 'leaflet-dragging');

	  		if (this._lastTarget) {
	  			removeClass(this._lastTarget, 'leaflet-drag-target');
	  			this._lastTarget = null;
	  		}

	  		for (var i in MOVE) {
	  			off(document, MOVE[i], this._onMove, this);
	  			off(document, END[i], this._onUp, this);
	  		}

	  		enableImageDrag();
	  		enableTextSelection();

	  		if (this._moved && this._moving) {
	  			// ensure drag is not fired after dragend
	  			cancelAnimFrame(this._animRequest);

	  			// @event dragend: DragEndEvent
	  			// Fired when the drag ends.
	  			this.fire('dragend', {
	  				distance: this._newPos.distanceTo(this._startPos)
	  			});
	  		}

	  		this._moving = false;
	  		Draggable._dragging = false;
	  	}

	  });

	  /*
	   * @namespace LineUtil
	   *
	   * Various utility functions for polyline points processing, used by Leaflet internally to make polylines lightning-fast.
	   */

	  // Simplify polyline with vertex reduction and Douglas-Peucker simplification.
	  // Improves rendering performance dramatically by lessening the number of points to draw.

	  // @function simplify(points: Point[], tolerance: Number): Point[]
	  // Dramatically reduces the number of points in a polyline while retaining
	  // its shape and returns a new array of simplified points, using the
	  // [Douglas-Peucker algorithm](http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm).
	  // Used for a huge performance boost when processing/displaying Leaflet polylines for
	  // each zoom level and also reducing visual noise. tolerance affects the amount of
	  // simplification (lesser value means higher quality but slower and with more points).
	  // Also released as a separated micro-library [Simplify.js](http://mourner.github.com/simplify-js/).
	  function simplify(points, tolerance) {
	  	if (!tolerance || !points.length) {
	  		return points.slice();
	  	}

	  	var sqTolerance = tolerance * tolerance;

	  	    // stage 1: vertex reduction
	  	    points = _reducePoints(points, sqTolerance);

	  	    // stage 2: Douglas-Peucker simplification
	  	    points = _simplifyDP(points, sqTolerance);

	  	return points;
	  }

	  // @function pointToSegmentDistance(p: Point, p1: Point, p2: Point): Number
	  // Returns the distance between point `p` and segment `p1` to `p2`.
	  function pointToSegmentDistance(p, p1, p2) {
	  	return Math.sqrt(_sqClosestPointOnSegment(p, p1, p2, true));
	  }

	  // @function closestPointOnSegment(p: Point, p1: Point, p2: Point): Number
	  // Returns the closest point from a point `p` on a segment `p1` to `p2`.
	  function closestPointOnSegment(p, p1, p2) {
	  	return _sqClosestPointOnSegment(p, p1, p2);
	  }

	  // Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
	  function _simplifyDP(points, sqTolerance) {

	  	var len = points.length,
	  	    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
	  	    markers = new ArrayConstructor(len);

	  	    markers[0] = markers[len - 1] = 1;

	  	_simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

	  	var i,
	  	    newPoints = [];

	  	for (i = 0; i < len; i++) {
	  		if (markers[i]) {
	  			newPoints.push(points[i]);
	  		}
	  	}

	  	return newPoints;
	  }

	  function _simplifyDPStep(points, markers, sqTolerance, first, last) {

	  	var maxSqDist = 0,
	  	index, i, sqDist;

	  	for (i = first + 1; i <= last - 1; i++) {
	  		sqDist = _sqClosestPointOnSegment(points[i], points[first], points[last], true);

	  		if (sqDist > maxSqDist) {
	  			index = i;
	  			maxSqDist = sqDist;
	  		}
	  	}

	  	if (maxSqDist > sqTolerance) {
	  		markers[index] = 1;

	  		_simplifyDPStep(points, markers, sqTolerance, first, index);
	  		_simplifyDPStep(points, markers, sqTolerance, index, last);
	  	}
	  }

	  // reduce points that are too close to each other to a single point
	  function _reducePoints(points, sqTolerance) {
	  	var reducedPoints = [points[0]];

	  	for (var i = 1, prev = 0, len = points.length; i < len; i++) {
	  		if (_sqDist(points[i], points[prev]) > sqTolerance) {
	  			reducedPoints.push(points[i]);
	  			prev = i;
	  		}
	  	}
	  	if (prev < len - 1) {
	  		reducedPoints.push(points[len - 1]);
	  	}
	  	return reducedPoints;
	  }

	  var _lastCode;

	  // @function clipSegment(a: Point, b: Point, bounds: Bounds, useLastCode?: Boolean, round?: Boolean): Point[]|Boolean
	  // Clips the segment a to b by rectangular bounds with the
	  // [Cohen-Sutherland algorithm](https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm)
	  // (modifying the segment points directly!). Used by Leaflet to only show polyline
	  // points that are on the screen or near, increasing performance.
	  function clipSegment(a, b, bounds, useLastCode, round) {
	  	var codeA = useLastCode ? _lastCode : _getBitCode(a, bounds),
	  	    codeB = _getBitCode(b, bounds),

	  	    codeOut, p, newCode;

	  	    // save 2nd code to avoid calculating it on the next segment
	  	    _lastCode = codeB;

	  	while (true) {
	  		// if a,b is inside the clip window (trivial accept)
	  		if (!(codeA | codeB)) {
	  			return [a, b];
	  		}

	  		// if a,b is outside the clip window (trivial reject)
	  		if (codeA & codeB) {
	  			return false;
	  		}

	  		// other cases
	  		codeOut = codeA || codeB;
	  		p = _getEdgeIntersection(a, b, codeOut, bounds, round);
	  		newCode = _getBitCode(p, bounds);

	  		if (codeOut === codeA) {
	  			a = p;
	  			codeA = newCode;
	  		} else {
	  			b = p;
	  			codeB = newCode;
	  		}
	  	}
	  }

	  function _getEdgeIntersection(a, b, code, bounds, round) {
	  	var dx = b.x - a.x,
	  	    dy = b.y - a.y,
	  	    min = bounds.min,
	  	    max = bounds.max,
	  	    x, y;

	  	if (code & 8) { // top
	  		x = a.x + dx * (max.y - a.y) / dy;
	  		y = max.y;

	  	} else if (code & 4) { // bottom
	  		x = a.x + dx * (min.y - a.y) / dy;
	  		y = min.y;

	  	} else if (code & 2) { // right
	  		x = max.x;
	  		y = a.y + dy * (max.x - a.x) / dx;

	  	} else if (code & 1) { // left
	  		x = min.x;
	  		y = a.y + dy * (min.x - a.x) / dx;
	  	}

	  	return new Point(x, y, round);
	  }

	  function _getBitCode(p, bounds) {
	  	var code = 0;

	  	if (p.x < bounds.min.x) { // left
	  		code |= 1;
	  	} else if (p.x > bounds.max.x) { // right
	  		code |= 2;
	  	}

	  	if (p.y < bounds.min.y) { // bottom
	  		code |= 4;
	  	} else if (p.y > bounds.max.y) { // top
	  		code |= 8;
	  	}

	  	return code;
	  }

	  // square distance (to avoid unnecessary Math.sqrt calls)
	  function _sqDist(p1, p2) {
	  	var dx = p2.x - p1.x,
	  	    dy = p2.y - p1.y;
	  	return dx * dx + dy * dy;
	  }

	  // return closest point on segment or distance to that point
	  function _sqClosestPointOnSegment(p, p1, p2, sqDist) {
	  	var x = p1.x,
	  	    y = p1.y,
	  	    dx = p2.x - x,
	  	    dy = p2.y - y,
	  	    dot = dx * dx + dy * dy,
	  	    t;

	  	if (dot > 0) {
	  		t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

	  		if (t > 1) {
	  			x = p2.x;
	  			y = p2.y;
	  		} else if (t > 0) {
	  			x += dx * t;
	  			y += dy * t;
	  		}
	  	}

	  	dx = p.x - x;
	  	dy = p.y - y;

	  	return sqDist ? dx * dx + dy * dy : new Point(x, y);
	  }


	  // @function isFlat(latlngs: LatLng[]): Boolean
	  // Returns true if `latlngs` is a flat array, false is nested.
	  function isFlat(latlngs) {
	  	return !isArray(latlngs[0]) || (typeof latlngs[0][0] !== 'object' && typeof latlngs[0][0] !== 'undefined');
	  }

	  function _flat(latlngs) {
	  	console.warn('Deprecated use of _flat, please use L.LineUtil.isFlat instead.');
	  	return isFlat(latlngs);
	  }

	  var LineUtil = ({
	    simplify: simplify,
	    pointToSegmentDistance: pointToSegmentDistance,
	    closestPointOnSegment: closestPointOnSegment,
	    clipSegment: clipSegment,
	    _getEdgeIntersection: _getEdgeIntersection,
	    _getBitCode: _getBitCode,
	    _sqClosestPointOnSegment: _sqClosestPointOnSegment,
	    isFlat: isFlat,
	    _flat: _flat
	  });

	  /*
	   * @namespace PolyUtil
	   * Various utility functions for polygon geometries.
	   */

	  /* @function clipPolygon(points: Point[], bounds: Bounds, round?: Boolean): Point[]
	   * Clips the polygon geometry defined by the given `points` by the given bounds (using the [Sutherland-Hodgman algorithm](https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm)).
	   * Used by Leaflet to only show polygon points that are on the screen or near, increasing
	   * performance. Note that polygon points needs different algorithm for clipping
	   * than polyline, so there's a separate method for it.
	   */
	  function clipPolygon(points, bounds, round) {
	  	var clippedPoints,
	  	    edges = [1, 4, 2, 8],
	  	    i, j, k,
	  	    a, b,
	  	    len, edge, p;

	  	for (i = 0, len = points.length; i < len; i++) {
	  		points[i]._code = _getBitCode(points[i], bounds);
	  	}

	  	// for each edge (left, bottom, right, top)
	  	for (k = 0; k < 4; k++) {
	  		edge = edges[k];
	  		clippedPoints = [];

	  		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
	  			a = points[i];
	  			b = points[j];

	  			// if a is inside the clip window
	  			if (!(a._code & edge)) {
	  				// if b is outside the clip window (a->b goes out of screen)
	  				if (b._code & edge) {
	  					p = _getEdgeIntersection(b, a, edge, bounds, round);
	  					p._code = _getBitCode(p, bounds);
	  					clippedPoints.push(p);
	  				}
	  				clippedPoints.push(a);

	  			// else if b is inside the clip window (a->b enters the screen)
	  			} else if (!(b._code & edge)) {
	  				p = _getEdgeIntersection(b, a, edge, bounds, round);
	  				p._code = _getBitCode(p, bounds);
	  				clippedPoints.push(p);
	  			}
	  		}
	  		points = clippedPoints;
	  	}

	  	return points;
	  }

	  var PolyUtil = ({
	    clipPolygon: clipPolygon
	  });

	  /*
	   * @namespace Projection
	   * @section
	   * Leaflet comes with a set of already defined Projections out of the box:
	   *
	   * @projection L.Projection.LonLat
	   *
	   * Equirectangular, or Plate Carree projection — the most simple projection,
	   * mostly used by GIS enthusiasts. Directly maps `x` as longitude, and `y` as
	   * latitude. Also suitable for flat worlds, e.g. game maps. Used by the
	   * `EPSG:4326` and `Simple` CRS.
	   */

	  var LonLat = {
	  	project: function (latlng) {
	  		return new Point(latlng.lng, latlng.lat);
	  	},

	  	unproject: function (point) {
	  		return new LatLng(point.y, point.x);
	  	},

	  	bounds: new Bounds([-180, -90], [180, 90])
	  };

	  /*
	   * @namespace Projection
	   * @projection L.Projection.Mercator
	   *
	   * Elliptical Mercator projection — more complex than Spherical Mercator. Assumes that Earth is an ellipsoid. Used by the EPSG:3395 CRS.
	   */

	  var Mercator = {
	  	R: 6378137,
	  	R_MINOR: 6356752.314245179,

	  	bounds: new Bounds([-20037508.34279, -15496570.73972], [20037508.34279, 18764656.23138]),

	  	project: function (latlng) {
	  		var d = Math.PI / 180,
	  		    r = this.R,
	  		    y = latlng.lat * d,
	  		    tmp = this.R_MINOR / r,
	  		    e = Math.sqrt(1 - tmp * tmp),
	  		    con = e * Math.sin(y);

	  		var ts = Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
	  		y = -r * Math.log(Math.max(ts, 1E-10));

	  		return new Point(latlng.lng * d * r, y);
	  	},

	  	unproject: function (point) {
	  		var d = 180 / Math.PI,
	  		    r = this.R,
	  		    tmp = this.R_MINOR / r,
	  		    e = Math.sqrt(1 - tmp * tmp),
	  		    ts = Math.exp(-point.y / r),
	  		    phi = Math.PI / 2 - 2 * Math.atan(ts);

	  		for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
	  			con = e * Math.sin(phi);
	  			con = Math.pow((1 - con) / (1 + con), e / 2);
	  			dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
	  			phi += dphi;
	  		}

	  		return new LatLng(phi * d, point.x * d / r);
	  	}
	  };

	  /*
	   * @class Projection

	   * An object with methods for projecting geographical coordinates of the world onto
	   * a flat surface (and back). See [Map projection](http://en.wikipedia.org/wiki/Map_projection).

	   * @property bounds: Bounds
	   * The bounds (specified in CRS units) where the projection is valid

	   * @method project(latlng: LatLng): Point
	   * Projects geographical coordinates into a 2D point.
	   * Only accepts actual `L.LatLng` instances, not arrays.

	   * @method unproject(point: Point): LatLng
	   * The inverse of `project`. Projects a 2D point into a geographical location.
	   * Only accepts actual `L.Point` instances, not arrays.

	   * Note that the projection instances do not inherit from Leaflet's `Class` object,
	   * and can't be instantiated. Also, new classes can't inherit from them,
	   * and methods can't be added to them with the `include` function.

	   */

	  var index = ({
	    LonLat: LonLat,
	    Mercator: Mercator,
	    SphericalMercator: SphericalMercator
	  });

	  /*
	   * @namespace CRS
	   * @crs L.CRS.EPSG3395
	   *
	   * Rarely used by some commercial tile providers. Uses Elliptical Mercator projection.
	   */
	  var EPSG3395 = extend({}, Earth, {
	  	code: 'EPSG:3395',
	  	projection: Mercator,

	  	transformation: (function () {
	  		var scale = 0.5 / (Math.PI * Mercator.R);
	  		return toTransformation(scale, 0.5, -scale, 0.5);
	  	}())
	  });

	  /*
	   * @namespace CRS
	   * @crs L.CRS.EPSG4326
	   *
	   * A common CRS among GIS enthusiasts. Uses simple Equirectangular projection.
	   *
	   * Leaflet 1.0.x complies with the [TMS coordinate scheme for EPSG:4326](https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification#global-geodetic),
	   * which is a breaking change from 0.7.x behaviour.  If you are using a `TileLayer`
	   * with this CRS, ensure that there are two 256x256 pixel tiles covering the
	   * whole earth at zoom level zero, and that the tile coordinate origin is (-180,+90),
	   * or (-180,-90) for `TileLayer`s with [the `tms` option](#tilelayer-tms) set.
	   */

	  var EPSG4326 = extend({}, Earth, {
	  	code: 'EPSG:4326',
	  	projection: LonLat,
	  	transformation: toTransformation(1 / 180, 1, -1 / 180, 0.5)
	  });

	  /*
	   * @namespace CRS
	   * @crs L.CRS.Simple
	   *
	   * A simple CRS that maps longitude and latitude into `x` and `y` directly.
	   * May be used for maps of flat surfaces (e.g. game maps). Note that the `y`
	   * axis should still be inverted (going from bottom to top). `distance()` returns
	   * simple euclidean distance.
	   */

	  var Simple = extend({}, CRS, {
	  	projection: LonLat,
	  	transformation: toTransformation(1, 0, -1, 0),

	  	scale: function (zoom) {
	  		return Math.pow(2, zoom);
	  	},

	  	zoom: function (scale) {
	  		return Math.log(scale) / Math.LN2;
	  	},

	  	distance: function (latlng1, latlng2) {
	  		var dx = latlng2.lng - latlng1.lng,
	  		    dy = latlng2.lat - latlng1.lat;

	  		return Math.sqrt(dx * dx + dy * dy);
	  	},

	  	infinite: true
	  });

	  CRS.Earth = Earth;
	  CRS.EPSG3395 = EPSG3395;
	  CRS.EPSG3857 = EPSG3857;
	  CRS.EPSG900913 = EPSG900913;
	  CRS.EPSG4326 = EPSG4326;
	  CRS.Simple = Simple;

	  /*
	   * @class Layer
	   * @inherits Evented
	   * @aka L.Layer
	   * @aka ILayer
	   *
	   * A set of methods from the Layer base class that all Leaflet layers use.
	   * Inherits all methods, options and events from `L.Evented`.
	   *
	   * @example
	   *
	   * ```js
	   * var layer = L.marker(latlng).addTo(map);
	   * layer.addTo(map);
	   * layer.remove();
	   * ```
	   *
	   * @event add: Event
	   * Fired after the layer is added to a map
	   *
	   * @event remove: Event
	   * Fired after the layer is removed from a map
	   */


	  var Layer = Evented.extend({

	  	// Classes extending `L.Layer` will inherit the following options:
	  	options: {
	  		// @option pane: String = 'overlayPane'
	  		// By default the layer will be added to the map's [overlay pane](#map-overlaypane). Overriding this option will cause the layer to be placed on another pane by default.
	  		pane: 'overlayPane',

	  		// @option attribution: String = null
	  		// String to be shown in the attribution control, e.g. "© OpenStreetMap contributors". It describes the layer data and is often a legal obligation towards copyright holders and tile providers.
	  		attribution: null,

	  		bubblingMouseEvents: true
	  	},

	  	/* @section
	  	 * Classes extending `L.Layer` will inherit the following methods:
	  	 *
	  	 * @method addTo(map: Map|LayerGroup): this
	  	 * Adds the layer to the given map or layer group.
	  	 */
	  	addTo: function (map) {
	  		map.addLayer(this);
	  		return this;
	  	},

	  	// @method remove: this
	  	// Removes the layer from the map it is currently active on.
	  	remove: function () {
	  		return this.removeFrom(this._map || this._mapToAdd);
	  	},

	  	// @method removeFrom(map: Map): this
	  	// Removes the layer from the given map
	  	//
	  	// @alternative
	  	// @method removeFrom(group: LayerGroup): this
	  	// Removes the layer from the given `LayerGroup`
	  	removeFrom: function (obj) {
	  		if (obj) {
	  			obj.removeLayer(this);
	  		}
	  		return this;
	  	},

	  	// @method getPane(name? : String): HTMLElement
	  	// Returns the `HTMLElement` representing the named pane on the map. If `name` is omitted, returns the pane for this layer.
	  	getPane: function (name) {
	  		return this._map.getPane(name ? (this.options[name] || name) : this.options.pane);
	  	},

	  	addInteractiveTarget: function (targetEl) {
	  		this._map._targets[stamp(targetEl)] = this;
	  		return this;
	  	},

	  	removeInteractiveTarget: function (targetEl) {
	  		delete this._map._targets[stamp(targetEl)];
	  		return this;
	  	},

	  	// @method getAttribution: String
	  	// Used by the `attribution control`, returns the [attribution option](#gridlayer-attribution).
	  	getAttribution: function () {
	  		return this.options.attribution;
	  	},

	  	_layerAdd: function (e) {
	  		var map = e.target;

	  		// check in case layer gets added and then removed before the map is ready
	  		if (!map.hasLayer(this)) { return; }

	  		this._map = map;
	  		this._zoomAnimated = map._zoomAnimated;

	  		if (this.getEvents) {
	  			var events = this.getEvents();
	  			map.on(events, this);
	  			this.once('remove', function () {
	  				map.off(events, this);
	  			}, this);
	  		}

	  		this.onAdd(map);

	  		if (this.getAttribution && map.attributionControl) {
	  			map.attributionControl.addAttribution(this.getAttribution());
	  		}

	  		this.fire('add');
	  		map.fire('layeradd', {layer: this});
	  	}
	  });

	  /* @section Extension methods
	   * @uninheritable
	   *
	   * Every layer should extend from `L.Layer` and (re-)implement the following methods.
	   *
	   * @method onAdd(map: Map): this
	   * Should contain code that creates DOM elements for the layer, adds them to `map panes` where they should belong and puts listeners on relevant map events. Called on [`map.addLayer(layer)`](#map-addlayer).
	   *
	   * @method onRemove(map: Map): this
	   * Should contain all clean up code that removes the layer's elements from the DOM and removes listeners previously added in [`onAdd`](#layer-onadd). Called on [`map.removeLayer(layer)`](#map-removelayer).
	   *
	   * @method getEvents(): Object
	   * This optional method should return an object like `{ viewreset: this._reset }` for [`addEventListener`](#evented-addeventlistener). The event handlers in this object will be automatically added and removed from the map with your layer.
	   *
	   * @method getAttribution(): String
	   * This optional method should return a string containing HTML to be shown on the `Attribution control` whenever the layer is visible.
	   *
	   * @method beforeAdd(map: Map): this
	   * Optional method. Called on [`map.addLayer(layer)`](#map-addlayer), before the layer is added to the map, before events are initialized, without waiting until the map is in a usable state. Use for early initialization only.
	   */


	  /* @namespace Map
	   * @section Layer events
	   *
	   * @event layeradd: LayerEvent
	   * Fired when a new layer is added to the map.
	   *
	   * @event layerremove: LayerEvent
	   * Fired when some layer is removed from the map
	   *
	   * @section Methods for Layers and Controls
	   */
	  Map.include({
	  	// @method addLayer(layer: Layer): this
	  	// Adds the given layer to the map
	  	addLayer: function (layer) {
	  		if (!layer._layerAdd) {
	  			throw new Error('The provided object is not a Layer.');
	  		}

	  		var id = stamp(layer);
	  		if (this._layers[id]) { return this; }
	  		this._layers[id] = layer;

	  		layer._mapToAdd = this;

	  		if (layer.beforeAdd) {
	  			layer.beforeAdd(this);
	  		}

	  		this.whenReady(layer._layerAdd, layer);

	  		return this;
	  	},

	  	// @method removeLayer(layer: Layer): this
	  	// Removes the given layer from the map.
	  	removeLayer: function (layer) {
	  		var id = stamp(layer);

	  		if (!this._layers[id]) { return this; }

	  		if (this._loaded) {
	  			layer.onRemove(this);
	  		}

	  		if (layer.getAttribution && this.attributionControl) {
	  			this.attributionControl.removeAttribution(layer.getAttribution());
	  		}

	  		delete this._layers[id];

	  		if (this._loaded) {
	  			this.fire('layerremove', {layer: layer});
	  			layer.fire('remove');
	  		}

	  		layer._map = layer._mapToAdd = null;

	  		return this;
	  	},

	  	// @method hasLayer(layer: Layer): Boolean
	  	// Returns `true` if the given layer is currently added to the map
	  	hasLayer: function (layer) {
	  		return !!layer && (stamp(layer) in this._layers);
	  	},

	  	/* @method eachLayer(fn: Function, context?: Object): this
	  	 * Iterates over the layers of the map, optionally specifying context of the iterator function.
	  	 * ```
	  	 * map.eachLayer(function(layer){
	  	 *     layer.bindPopup('Hello');
	  	 * });
	  	 * ```
	  	 */
	  	eachLayer: function (method, context) {
	  		for (var i in this._layers) {
	  			method.call(context, this._layers[i]);
	  		}
	  		return this;
	  	},

	  	_addLayers: function (layers) {
	  		layers = layers ? (isArray(layers) ? layers : [layers]) : [];

	  		for (var i = 0, len = layers.length; i < len; i++) {
	  			this.addLayer(layers[i]);
	  		}
	  	},

	  	_addZoomLimit: function (layer) {
	  		if (isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
	  			this._zoomBoundLayers[stamp(layer)] = layer;
	  			this._updateZoomLevels();
	  		}
	  	},

	  	_removeZoomLimit: function (layer) {
	  		var id = stamp(layer);

	  		if (this._zoomBoundLayers[id]) {
	  			delete this._zoomBoundLayers[id];
	  			this._updateZoomLevels();
	  		}
	  	},

	  	_updateZoomLevels: function () {
	  		var minZoom = Infinity,
	  		    maxZoom = -Infinity,
	  		    oldZoomSpan = this._getZoomSpan();

	  		for (var i in this._zoomBoundLayers) {
	  			var options = this._zoomBoundLayers[i].options;

	  			minZoom = options.minZoom === undefined ? minZoom : Math.min(minZoom, options.minZoom);
	  			maxZoom = options.maxZoom === undefined ? maxZoom : Math.max(maxZoom, options.maxZoom);
	  		}

	  		this._layersMaxZoom = maxZoom === -Infinity ? undefined : maxZoom;
	  		this._layersMinZoom = minZoom === Infinity ? undefined : minZoom;

	  		// @section Map state change events
	  		// @event zoomlevelschange: Event
	  		// Fired when the number of zoomlevels on the map is changed due
	  		// to adding or removing a layer.
	  		if (oldZoomSpan !== this._getZoomSpan()) {
	  			this.fire('zoomlevelschange');
	  		}

	  		if (this.options.maxZoom === undefined && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom) {
	  			this.setZoom(this._layersMaxZoom);
	  		}
	  		if (this.options.minZoom === undefined && this._layersMinZoom && this.getZoom() < this._layersMinZoom) {
	  			this.setZoom(this._layersMinZoom);
	  		}
	  	}
	  });

	  /*
	   * @class LayerGroup
	   * @aka L.LayerGroup
	   * @inherits Layer
	   *
	   * Used to group several layers and handle them as one. If you add it to the map,
	   * any layers added or removed from the group will be added/removed on the map as
	   * well. Extends `Layer`.
	   *
	   * @example
	   *
	   * ```js
	   * L.layerGroup([marker1, marker2])
	   * 	.addLayer(polyline)
	   * 	.addTo(map);
	   * ```
	   */

	  var LayerGroup = Layer.extend({

	  	initialize: function (layers, options) {
	  		setOptions(this, options);

	  		this._layers = {};

	  		var i, len;

	  		if (layers) {
	  			for (i = 0, len = layers.length; i < len; i++) {
	  				this.addLayer(layers[i]);
	  			}
	  		}
	  	},

	  	// @method addLayer(layer: Layer): this
	  	// Adds the given layer to the group.
	  	addLayer: function (layer) {
	  		var id = this.getLayerId(layer);

	  		this._layers[id] = layer;

	  		if (this._map) {
	  			this._map.addLayer(layer);
	  		}

	  		return this;
	  	},

	  	// @method removeLayer(layer: Layer): this
	  	// Removes the given layer from the group.
	  	// @alternative
	  	// @method removeLayer(id: Number): this
	  	// Removes the layer with the given internal ID from the group.
	  	removeLayer: function (layer) {
	  		var id = layer in this._layers ? layer : this.getLayerId(layer);

	  		if (this._map && this._layers[id]) {
	  			this._map.removeLayer(this._layers[id]);
	  		}

	  		delete this._layers[id];

	  		return this;
	  	},

	  	// @method hasLayer(layer: Layer): Boolean
	  	// Returns `true` if the given layer is currently added to the group.
	  	// @alternative
	  	// @method hasLayer(id: Number): Boolean
	  	// Returns `true` if the given internal ID is currently added to the group.
	  	hasLayer: function (layer) {
	  		if (!layer) { return false; }
	  		var layerId = typeof layer === 'number' ? layer : this.getLayerId(layer);
	  		return layerId in this._layers;
	  	},

	  	// @method clearLayers(): this
	  	// Removes all the layers from the group.
	  	clearLayers: function () {
	  		return this.eachLayer(this.removeLayer, this);
	  	},

	  	// @method invoke(methodName: String, …): this
	  	// Calls `methodName` on every layer contained in this group, passing any
	  	// additional parameters. Has no effect if the layers contained do not
	  	// implement `methodName`.
	  	invoke: function (methodName) {
	  		var args = Array.prototype.slice.call(arguments, 1),
	  		    i, layer;

	  		for (i in this._layers) {
	  			layer = this._layers[i];

	  			if (layer[methodName]) {
	  				layer[methodName].apply(layer, args);
	  			}
	  		}

	  		return this;
	  	},

	  	onAdd: function (map) {
	  		this.eachLayer(map.addLayer, map);
	  	},

	  	onRemove: function (map) {
	  		this.eachLayer(map.removeLayer, map);
	  	},

	  	// @method eachLayer(fn: Function, context?: Object): this
	  	// Iterates over the layers of the group, optionally specifying context of the iterator function.
	  	// ```js
	  	// group.eachLayer(function (layer) {
	  	// 	layer.bindPopup('Hello');
	  	// });
	  	// ```
	  	eachLayer: function (method, context) {
	  		for (var i in this._layers) {
	  			method.call(context, this._layers[i]);
	  		}
	  		return this;
	  	},

	  	// @method getLayer(id: Number): Layer
	  	// Returns the layer with the given internal ID.
	  	getLayer: function (id) {
	  		return this._layers[id];
	  	},

	  	// @method getLayers(): Layer[]
	  	// Returns an array of all the layers added to the group.
	  	getLayers: function () {
	  		var layers = [];
	  		this.eachLayer(layers.push, layers);
	  		return layers;
	  	},

	  	// @method setZIndex(zIndex: Number): this
	  	// Calls `setZIndex` on every layer contained in this group, passing the z-index.
	  	setZIndex: function (zIndex) {
	  		return this.invoke('setZIndex', zIndex);
	  	},

	  	// @method getLayerId(layer: Layer): Number
	  	// Returns the internal ID for a layer
	  	getLayerId: function (layer) {
	  		return stamp(layer);
	  	}
	  });


	  // @factory L.layerGroup(layers?: Layer[], options?: Object)
	  // Create a layer group, optionally given an initial set of layers and an `options` object.
	  var layerGroup = function (layers, options) {
	  	return new LayerGroup(layers, options);
	  };

	  /*
	   * @class FeatureGroup
	   * @aka L.FeatureGroup
	   * @inherits LayerGroup
	   *
	   * Extended `LayerGroup` that makes it easier to do the same thing to all its member layers:
	   *  * [`bindPopup`](#layer-bindpopup) binds a popup to all of the layers at once (likewise with [`bindTooltip`](#layer-bindtooltip))
	   *  * Events are propagated to the `FeatureGroup`, so if the group has an event
	   * handler, it will handle events from any of the layers. This includes mouse events
	   * and custom events.
	   *  * Has `layeradd` and `layerremove` events
	   *
	   * @example
	   *
	   * ```js
	   * L.featureGroup([marker1, marker2, polyline])
	   * 	.bindPopup('Hello world!')
	   * 	.on('click', function() { alert('Clicked on a member of the group!'); })
	   * 	.addTo(map);
	   * ```
	   */

	  var FeatureGroup = LayerGroup.extend({

	  	addLayer: function (layer) {
	  		if (this.hasLayer(layer)) {
	  			return this;
	  		}

	  		layer.addEventParent(this);

	  		LayerGroup.prototype.addLayer.call(this, layer);

	  		// @event layeradd: LayerEvent
	  		// Fired when a layer is added to this `FeatureGroup`
	  		return this.fire('layeradd', {layer: layer});
	  	},

	  	removeLayer: function (layer) {
	  		if (!this.hasLayer(layer)) {
	  			return this;
	  		}
	  		if (layer in this._layers) {
	  			layer = this._layers[layer];
	  		}

	  		layer.removeEventParent(this);

	  		LayerGroup.prototype.removeLayer.call(this, layer);

	  		// @event layerremove: LayerEvent
	  		// Fired when a layer is removed from this `FeatureGroup`
	  		return this.fire('layerremove', {layer: layer});
	  	},

	  	// @method setStyle(style: Path options): this
	  	// Sets the given path options to each layer of the group that has a `setStyle` method.
	  	setStyle: function (style) {
	  		return this.invoke('setStyle', style);
	  	},

	  	// @method bringToFront(): this
	  	// Brings the layer group to the top of all other layers
	  	bringToFront: function () {
	  		return this.invoke('bringToFront');
	  	},

	  	// @method bringToBack(): this
	  	// Brings the layer group to the back of all other layers
	  	bringToBack: function () {
	  		return this.invoke('bringToBack');
	  	},

	  	// @method getBounds(): LatLngBounds
	  	// Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).
	  	getBounds: function () {
	  		var bounds = new LatLngBounds();

	  		for (var id in this._layers) {
	  			var layer = this._layers[id];
	  			bounds.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng());
	  		}
	  		return bounds;
	  	}
	  });

	  // @factory L.featureGroup(layers?: Layer[], options?: Object)
	  // Create a feature group, optionally given an initial set of layers and an `options` object.
	  var featureGroup = function (layers, options) {
	  	return new FeatureGroup(layers, options);
	  };

	  /*
	   * @class Icon
	   * @aka L.Icon
	   *
	   * Represents an icon to provide when creating a marker.
	   *
	   * @example
	   *
	   * ```js
	   * var myIcon = L.icon({
	   *     iconUrl: 'my-icon.png',
	   *     iconRetinaUrl: 'my-icon@2x.png',
	   *     iconSize: [38, 95],
	   *     iconAnchor: [22, 94],
	   *     popupAnchor: [-3, -76],
	   *     shadowUrl: 'my-icon-shadow.png',
	   *     shadowRetinaUrl: 'my-icon-shadow@2x.png',
	   *     shadowSize: [68, 95],
	   *     shadowAnchor: [22, 94]
	   * });
	   *
	   * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
	   * ```
	   *
	   * `L.Icon.Default` extends `L.Icon` and is the blue icon Leaflet uses for markers by default.
	   *
	   */

	  var Icon = Class.extend({

	  	/* @section
	  	 * @aka Icon options
	  	 *
	  	 * @option iconUrl: String = null
	  	 * **(required)** The URL to the icon image (absolute or relative to your script path).
	  	 *
	  	 * @option iconRetinaUrl: String = null
	  	 * The URL to a retina sized version of the icon image (absolute or relative to your
	  	 * script path). Used for Retina screen devices.
	  	 *
	  	 * @option iconSize: Point = null
	  	 * Size of the icon image in pixels.
	  	 *
	  	 * @option iconAnchor: Point = null
	  	 * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
	  	 * will be aligned so that this point is at the marker's geographical location. Centered
	  	 * by default if size is specified, also can be set in CSS with negative margins.
	  	 *
	  	 * @option popupAnchor: Point = [0, 0]
	  	 * The coordinates of the point from which popups will "open", relative to the icon anchor.
	  	 *
	  	 * @option tooltipAnchor: Point = [0, 0]
	  	 * The coordinates of the point from which tooltips will "open", relative to the icon anchor.
	  	 *
	  	 * @option shadowUrl: String = null
	  	 * The URL to the icon shadow image. If not specified, no shadow image will be created.
	  	 *
	  	 * @option shadowRetinaUrl: String = null
	  	 *
	  	 * @option shadowSize: Point = null
	  	 * Size of the shadow image in pixels.
	  	 *
	  	 * @option shadowAnchor: Point = null
	  	 * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
	  	 * as iconAnchor if not specified).
	  	 *
	  	 * @option className: String = ''
	  	 * A custom class name to assign to both icon and shadow images. Empty by default.
	  	 */

	  	options: {
	  		popupAnchor: [0, 0],
	  		tooltipAnchor: [0, 0]
	  	},

	  	initialize: function (options) {
	  		setOptions(this, options);
	  	},

	  	// @method createIcon(oldIcon?: HTMLElement): HTMLElement
	  	// Called internally when the icon has to be shown, returns a `<img>` HTML element
	  	// styled according to the options.
	  	createIcon: function (oldIcon) {
	  		return this._createIcon('icon', oldIcon);
	  	},

	  	// @method createShadow(oldIcon?: HTMLElement): HTMLElement
	  	// As `createIcon`, but for the shadow beneath it.
	  	createShadow: function (oldIcon) {
	  		return this._createIcon('shadow', oldIcon);
	  	},

	  	_createIcon: function (name, oldIcon) {
	  		var src = this._getIconUrl(name);

	  		if (!src) {
	  			if (name === 'icon') {
	  				throw new Error('iconUrl not set in Icon options (see the docs).');
	  			}
	  			return null;
	  		}

	  		var img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
	  		this._setIconStyles(img, name);

	  		return img;
	  	},

	  	_setIconStyles: function (img, name) {
	  		var options = this.options;
	  		var sizeOption = options[name + 'Size'];

	  		if (typeof sizeOption === 'number') {
	  			sizeOption = [sizeOption, sizeOption];
	  		}

	  		var size = toPoint(sizeOption),
	  		    anchor = toPoint(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
	  		            size && size.divideBy(2, true));

	  		img.className = 'leaflet-marker-' + name + ' ' + (options.className || '');

	  		if (anchor) {
	  			img.style.marginLeft = (-anchor.x) + 'px';
	  			img.style.marginTop  = (-anchor.y) + 'px';
	  		}

	  		if (size) {
	  			img.style.width  = size.x + 'px';
	  			img.style.height = size.y + 'px';
	  		}
	  	},

	  	_createImg: function (src, el) {
	  		el = el || document.createElement('img');
	  		el.src = src;
	  		return el;
	  	},

	  	_getIconUrl: function (name) {
	  		return retina && this.options[name + 'RetinaUrl'] || this.options[name + 'Url'];
	  	}
	  });


	  // @factory L.icon(options: Icon options)
	  // Creates an icon instance with the given options.
	  function icon(options) {
	  	return new Icon(options);
	  }

	  /*
	   * @miniclass Icon.Default (Icon)
	   * @aka L.Icon.Default
	   * @section
	   *
	   * A trivial subclass of `Icon`, represents the icon to use in `Marker`s when
	   * no icon is specified. Points to the blue marker image distributed with Leaflet
	   * releases.
	   *
	   * In order to customize the default icon, just change the properties of `L.Icon.Default.prototype.options`
	   * (which is a set of `Icon options`).
	   *
	   * If you want to _completely_ replace the default icon, override the
	   * `L.Marker.prototype.options.icon` with your own icon instead.
	   */

	  var IconDefault = Icon.extend({

	  	options: {
	  		iconUrl:       'marker-icon.png',
	  		iconRetinaUrl: 'marker-icon-2x.png',
	  		shadowUrl:     'marker-shadow.png',
	  		iconSize:    [25, 41],
	  		iconAnchor:  [12, 41],
	  		popupAnchor: [1, -34],
	  		tooltipAnchor: [16, -28],
	  		shadowSize:  [41, 41]
	  	},

	  	_getIconUrl: function (name) {
	  		if (!IconDefault.imagePath) {	// Deprecated, backwards-compatibility only
	  			IconDefault.imagePath = this._detectIconPath();
	  		}

	  		// @option imagePath: String
	  		// `Icon.Default` will try to auto-detect the location of the
	  		// blue icon images. If you are placing these images in a non-standard
	  		// way, set this option to point to the right path.
	  		return (this.options.imagePath || IconDefault.imagePath) + Icon.prototype._getIconUrl.call(this, name);
	  	},

	  	_detectIconPath: function () {
	  		var el = create$1('div',  'leaflet-default-icon-path', document.body);
	  		var path = getStyle(el, 'background-image') ||
	  		           getStyle(el, 'backgroundImage');	// IE8

	  		document.body.removeChild(el);

	  		if (path === null || path.indexOf('url') !== 0) {
	  			path = '';
	  		} else {
	  			path = path.replace(/^url\(["']?/, '').replace(/marker-icon\.png["']?\)$/, '');
	  		}

	  		return path;
	  	}
	  });

	  /*
	   * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
	   */


	  /* @namespace Marker
	   * @section Interaction handlers
	   *
	   * Interaction handlers are properties of a marker instance that allow you to control interaction behavior in runtime, enabling or disabling certain features such as dragging (see `Handler` methods). Example:
	   *
	   * ```js
	   * marker.dragging.disable();
	   * ```
	   *
	   * @property dragging: Handler
	   * Marker dragging handler (by both mouse and touch). Only valid when the marker is on the map (Otherwise set [`marker.options.draggable`](#marker-draggable)).
	   */

	  var MarkerDrag = Handler.extend({
	  	initialize: function (marker) {
	  		this._marker = marker;
	  	},

	  	addHooks: function () {
	  		var icon = this._marker._icon;

	  		if (!this._draggable) {
	  			this._draggable = new Draggable(icon, icon, true);
	  		}

	  		this._draggable.on({
	  			dragstart: this._onDragStart,
	  			predrag: this._onPreDrag,
	  			drag: this._onDrag,
	  			dragend: this._onDragEnd
	  		}, this).enable();

	  		addClass(icon, 'leaflet-marker-draggable');
	  	},

	  	removeHooks: function () {
	  		this._draggable.off({
	  			dragstart: this._onDragStart,
	  			predrag: this._onPreDrag,
	  			drag: this._onDrag,
	  			dragend: this._onDragEnd
	  		}, this).disable();

	  		if (this._marker._icon) {
	  			removeClass(this._marker._icon, 'leaflet-marker-draggable');
	  		}
	  	},

	  	moved: function () {
	  		return this._draggable && this._draggable._moved;
	  	},

	  	_adjustPan: function (e) {
	  		var marker = this._marker,
	  		    map = marker._map,
	  		    speed = this._marker.options.autoPanSpeed,
	  		    padding = this._marker.options.autoPanPadding,
	  		    iconPos = getPosition(marker._icon),
	  		    bounds = map.getPixelBounds(),
	  		    origin = map.getPixelOrigin();

	  		var panBounds = toBounds(
	  			bounds.min._subtract(origin).add(padding),
	  			bounds.max._subtract(origin).subtract(padding)
	  		);

	  		if (!panBounds.contains(iconPos)) {
	  			// Compute incremental movement
	  			var movement = toPoint(
	  				(Math.max(panBounds.max.x, iconPos.x) - panBounds.max.x) / (bounds.max.x - panBounds.max.x) -
	  				(Math.min(panBounds.min.x, iconPos.x) - panBounds.min.x) / (bounds.min.x - panBounds.min.x),

	  				(Math.max(panBounds.max.y, iconPos.y) - panBounds.max.y) / (bounds.max.y - panBounds.max.y) -
	  				(Math.min(panBounds.min.y, iconPos.y) - panBounds.min.y) / (bounds.min.y - panBounds.min.y)
	  			).multiplyBy(speed);

	  			map.panBy(movement, {animate: false});

	  			this._draggable._newPos._add(movement);
	  			this._draggable._startPos._add(movement);

	  			setPosition(marker._icon, this._draggable._newPos);
	  			this._onDrag(e);

	  			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
	  		}
	  	},

	  	_onDragStart: function () {
	  		// @section Dragging events
	  		// @event dragstart: Event
	  		// Fired when the user starts dragging the marker.

	  		// @event movestart: Event
	  		// Fired when the marker starts moving (because of dragging).

	  		this._oldLatLng = this._marker.getLatLng();

	  		// When using ES6 imports it could not be set when `Popup` was not imported as well
	  		this._marker.closePopup && this._marker.closePopup();

	  		this._marker
	  			.fire('movestart')
	  			.fire('dragstart');
	  	},

	  	_onPreDrag: function (e) {
	  		if (this._marker.options.autoPan) {
	  			cancelAnimFrame(this._panRequest);
	  			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
	  		}
	  	},

	  	_onDrag: function (e) {
	  		var marker = this._marker,
	  		    shadow = marker._shadow,
	  		    iconPos = getPosition(marker._icon),
	  		    latlng = marker._map.layerPointToLatLng(iconPos);

	  		// update shadow position
	  		if (shadow) {
	  			setPosition(shadow, iconPos);
	  		}

	  		marker._latlng = latlng;
	  		e.latlng = latlng;
	  		e.oldLatLng = this._oldLatLng;

	  		// @event drag: Event
	  		// Fired repeatedly while the user drags the marker.
	  		marker
	  		    .fire('move', e)
	  		    .fire('drag', e);
	  	},

	  	_onDragEnd: function (e) {
	  		// @event dragend: DragEndEvent
	  		// Fired when the user stops dragging the marker.

	  		 cancelAnimFrame(this._panRequest);

	  		// @event moveend: Event
	  		// Fired when the marker stops moving (because of dragging).
	  		delete this._oldLatLng;
	  		this._marker
	  		    .fire('moveend')
	  		    .fire('dragend', e);
	  	}
	  });

	  /*
	   * @class Marker
	   * @inherits Interactive layer
	   * @aka L.Marker
	   * L.Marker is used to display clickable/draggable icons on the map. Extends `Layer`.
	   *
	   * @example
	   *
	   * ```js
	   * L.marker([50.5, 30.5]).addTo(map);
	   * ```
	   */

	  var Marker = Layer.extend({

	  	// @section
	  	// @aka Marker options
	  	options: {
	  		// @option icon: Icon = *
	  		// Icon instance to use for rendering the marker.
	  		// See [Icon documentation](#L.Icon) for details on how to customize the marker icon.
	  		// If not specified, a common instance of `L.Icon.Default` is used.
	  		icon: new IconDefault(),

	  		// Option inherited from "Interactive layer" abstract class
	  		interactive: true,

	  		// @option keyboard: Boolean = true
	  		// Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
	  		keyboard: true,

	  		// @option title: String = ''
	  		// Text for the browser tooltip that appear on marker hover (no tooltip by default).
	  		title: '',

	  		// @option alt: String = ''
	  		// Text for the `alt` attribute of the icon image (useful for accessibility).
	  		alt: '',

	  		// @option zIndexOffset: Number = 0
	  		// By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like `1000` (or high negative value, respectively).
	  		zIndexOffset: 0,

	  		// @option opacity: Number = 1.0
	  		// The opacity of the marker.
	  		opacity: 1,

	  		// @option riseOnHover: Boolean = false
	  		// If `true`, the marker will get on top of others when you hover the mouse over it.
	  		riseOnHover: false,

	  		// @option riseOffset: Number = 250
	  		// The z-index offset used for the `riseOnHover` feature.
	  		riseOffset: 250,

	  		// @option pane: String = 'markerPane'
	  		// `Map pane` where the markers icon will be added.
	  		pane: 'markerPane',

	  		// @option shadowPane: String = 'shadowPane'
	  		// `Map pane` where the markers shadow will be added.
	  		shadowPane: 'shadowPane',

	  		// @option bubblingMouseEvents: Boolean = false
	  		// When `true`, a mouse event on this marker will trigger the same event on the map
	  		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
	  		bubblingMouseEvents: false,

	  		// @section Draggable marker options
	  		// @option draggable: Boolean = false
	  		// Whether the marker is draggable with mouse/touch or not.
	  		draggable: false,

	  		// @option autoPan: Boolean = false
	  		// Whether to pan the map when dragging this marker near its edge or not.
	  		autoPan: false,

	  		// @option autoPanPadding: Point = Point(50, 50)
	  		// Distance (in pixels to the left/right and to the top/bottom) of the
	  		// map edge to start panning the map.
	  		autoPanPadding: [50, 50],

	  		// @option autoPanSpeed: Number = 10
	  		// Number of pixels the map should pan by.
	  		autoPanSpeed: 10
	  	},

	  	/* @section
	  	 *
	  	 * In addition to [shared layer methods](#Layer) like `addTo()` and `remove()` and [popup methods](#Popup) like bindPopup() you can also use the following methods:
	  	 */

	  	initialize: function (latlng, options) {
	  		setOptions(this, options);
	  		this._latlng = toLatLng(latlng);
	  	},

	  	onAdd: function (map) {
	  		this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

	  		if (this._zoomAnimated) {
	  			map.on('zoomanim', this._animateZoom, this);
	  		}

	  		this._initIcon();
	  		this.update();
	  	},

	  	onRemove: function (map) {
	  		if (this.dragging && this.dragging.enabled()) {
	  			this.options.draggable = true;
	  			this.dragging.removeHooks();
	  		}
	  		delete this.dragging;

	  		if (this._zoomAnimated) {
	  			map.off('zoomanim', this._animateZoom, this);
	  		}

	  		this._removeIcon();
	  		this._removeShadow();
	  	},

	  	getEvents: function () {
	  		return {
	  			zoom: this.update,
	  			viewreset: this.update
	  		};
	  	},

	  	// @method getLatLng: LatLng
	  	// Returns the current geographical position of the marker.
	  	getLatLng: function () {
	  		return this._latlng;
	  	},

	  	// @method setLatLng(latlng: LatLng): this
	  	// Changes the marker position to the given point.
	  	setLatLng: function (latlng) {
	  		var oldLatLng = this._latlng;
	  		this._latlng = toLatLng(latlng);
	  		this.update();

	  		// @event move: Event
	  		// Fired when the marker is moved via [`setLatLng`](#marker-setlatlng) or by [dragging](#marker-dragging). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
	  		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
	  	},

	  	// @method setZIndexOffset(offset: Number): this
	  	// Changes the [zIndex offset](#marker-zindexoffset) of the marker.
	  	setZIndexOffset: function (offset) {
	  		this.options.zIndexOffset = offset;
	  		return this.update();
	  	},

	  	// @method getIcon: Icon
	  	// Returns the current icon used by the marker
	  	getIcon: function () {
	  		return this.options.icon;
	  	},

	  	// @method setIcon(icon: Icon): this
	  	// Changes the marker icon.
	  	setIcon: function (icon) {

	  		this.options.icon = icon;

	  		if (this._map) {
	  			this._initIcon();
	  			this.update();
	  		}

	  		if (this._popup) {
	  			this.bindPopup(this._popup, this._popup.options);
	  		}

	  		return this;
	  	},

	  	getElement: function () {
	  		return this._icon;
	  	},

	  	update: function () {

	  		if (this._icon && this._map) {
	  			var pos = this._map.latLngToLayerPoint(this._latlng).round();
	  			this._setPos(pos);
	  		}

	  		return this;
	  	},

	  	_initIcon: function () {
	  		var options = this.options,
	  		    classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

	  		var icon = options.icon.createIcon(this._icon),
	  		    addIcon = false;

	  		// if we're not reusing the icon, remove the old one and init new one
	  		if (icon !== this._icon) {
	  			if (this._icon) {
	  				this._removeIcon();
	  			}
	  			addIcon = true;

	  			if (options.title) {
	  				icon.title = options.title;
	  			}

	  			if (icon.tagName === 'IMG') {
	  				icon.alt = options.alt || '';
	  			}
	  		}

	  		addClass(icon, classToAdd);

	  		if (options.keyboard) {
	  			icon.tabIndex = '0';
	  		}

	  		this._icon = icon;

	  		if (options.riseOnHover) {
	  			this.on({
	  				mouseover: this._bringToFront,
	  				mouseout: this._resetZIndex
	  			});
	  		}

	  		var newShadow = options.icon.createShadow(this._shadow),
	  		    addShadow = false;

	  		if (newShadow !== this._shadow) {
	  			this._removeShadow();
	  			addShadow = true;
	  		}

	  		if (newShadow) {
	  			addClass(newShadow, classToAdd);
	  			newShadow.alt = '';
	  		}
	  		this._shadow = newShadow;


	  		if (options.opacity < 1) {
	  			this._updateOpacity();
	  		}


	  		if (addIcon) {
	  			this.getPane().appendChild(this._icon);
	  		}
	  		this._initInteraction();
	  		if (newShadow && addShadow) {
	  			this.getPane(options.shadowPane).appendChild(this._shadow);
	  		}
	  	},

	  	_removeIcon: function () {
	  		if (this.options.riseOnHover) {
	  			this.off({
	  				mouseover: this._bringToFront,
	  				mouseout: this._resetZIndex
	  			});
	  		}

	  		remove(this._icon);
	  		this.removeInteractiveTarget(this._icon);

	  		this._icon = null;
	  	},

	  	_removeShadow: function () {
	  		if (this._shadow) {
	  			remove(this._shadow);
	  		}
	  		this._shadow = null;
	  	},

	  	_setPos: function (pos) {

	  		if (this._icon) {
	  			setPosition(this._icon, pos);
	  		}

	  		if (this._shadow) {
	  			setPosition(this._shadow, pos);
	  		}

	  		this._zIndex = pos.y + this.options.zIndexOffset;

	  		this._resetZIndex();
	  	},

	  	_updateZIndex: function (offset) {
	  		if (this._icon) {
	  			this._icon.style.zIndex = this._zIndex + offset;
	  		}
	  	},

	  	_animateZoom: function (opt) {
	  		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

	  		this._setPos(pos);
	  	},

	  	_initInteraction: function () {

	  		if (!this.options.interactive) { return; }

	  		addClass(this._icon, 'leaflet-interactive');

	  		this.addInteractiveTarget(this._icon);

	  		if (MarkerDrag) {
	  			var draggable = this.options.draggable;
	  			if (this.dragging) {
	  				draggable = this.dragging.enabled();
	  				this.dragging.disable();
	  			}

	  			this.dragging = new MarkerDrag(this);

	  			if (draggable) {
	  				this.dragging.enable();
	  			}
	  		}
	  	},

	  	// @method setOpacity(opacity: Number): this
	  	// Changes the opacity of the marker.
	  	setOpacity: function (opacity) {
	  		this.options.opacity = opacity;
	  		if (this._map) {
	  			this._updateOpacity();
	  		}

	  		return this;
	  	},

	  	_updateOpacity: function () {
	  		var opacity = this.options.opacity;

	  		if (this._icon) {
	  			setOpacity(this._icon, opacity);
	  		}

	  		if (this._shadow) {
	  			setOpacity(this._shadow, opacity);
	  		}
	  	},

	  	_bringToFront: function () {
	  		this._updateZIndex(this.options.riseOffset);
	  	},

	  	_resetZIndex: function () {
	  		this._updateZIndex(0);
	  	},

	  	_getPopupAnchor: function () {
	  		return this.options.icon.options.popupAnchor;
	  	},

	  	_getTooltipAnchor: function () {
	  		return this.options.icon.options.tooltipAnchor;
	  	}
	  });


	  // factory L.marker(latlng: LatLng, options? : Marker options)

	  // @factory L.marker(latlng: LatLng, options? : Marker options)
	  // Instantiates a Marker object given a geographical point and optionally an options object.
	  function marker(latlng, options) {
	  	return new Marker(latlng, options);
	  }

	  /*
	   * @class Path
	   * @aka L.Path
	   * @inherits Interactive layer
	   *
	   * An abstract class that contains options and constants shared between vector
	   * overlays (Polygon, Polyline, Circle). Do not use it directly. Extends `Layer`.
	   */

	  var Path = Layer.extend({

	  	// @section
	  	// @aka Path options
	  	options: {
	  		// @option stroke: Boolean = true
	  		// Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
	  		stroke: true,

	  		// @option color: String = '#3388ff'
	  		// Stroke color
	  		color: '#3388ff',

	  		// @option weight: Number = 3
	  		// Stroke width in pixels
	  		weight: 3,

	  		// @option opacity: Number = 1.0
	  		// Stroke opacity
	  		opacity: 1,

	  		// @option lineCap: String= 'round'
	  		// A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
	  		lineCap: 'round',

	  		// @option lineJoin: String = 'round'
	  		// A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
	  		lineJoin: 'round',

	  		// @option dashArray: String = null
	  		// A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
	  		dashArray: null,

	  		// @option dashOffset: String = null
	  		// A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
	  		dashOffset: null,

	  		// @option fill: Boolean = depends
	  		// Whether to fill the path with color. Set it to `false` to disable filling on polygons or circles.
	  		fill: false,

	  		// @option fillColor: String = *
	  		// Fill color. Defaults to the value of the [`color`](#path-color) option
	  		fillColor: null,

	  		// @option fillOpacity: Number = 0.2
	  		// Fill opacity.
	  		fillOpacity: 0.2,

	  		// @option fillRule: String = 'evenodd'
	  		// A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
	  		fillRule: 'evenodd',

	  		// className: '',

	  		// Option inherited from "Interactive layer" abstract class
	  		interactive: true,

	  		// @option bubblingMouseEvents: Boolean = true
	  		// When `true`, a mouse event on this path will trigger the same event on the map
	  		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
	  		bubblingMouseEvents: true
	  	},

	  	beforeAdd: function (map) {
	  		// Renderer is set here because we need to call renderer.getEvents
	  		// before this.getEvents.
	  		this._renderer = map.getRenderer(this);
	  	},

	  	onAdd: function () {
	  		this._renderer._initPath(this);
	  		this._reset();
	  		this._renderer._addPath(this);
	  	},

	  	onRemove: function () {
	  		this._renderer._removePath(this);
	  	},

	  	// @method redraw(): this
	  	// Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
	  	redraw: function () {
	  		if (this._map) {
	  			this._renderer._updatePath(this);
	  		}
	  		return this;
	  	},

	  	// @method setStyle(style: Path options): this
	  	// Changes the appearance of a Path based on the options in the `Path options` object.
	  	setStyle: function (style) {
	  		setOptions(this, style);
	  		if (this._renderer) {
	  			this._renderer._updateStyle(this);
	  			if (this.options.stroke && style && Object.prototype.hasOwnProperty.call(style, 'weight')) {
	  				this._updateBounds();
	  			}
	  		}
	  		return this;
	  	},

	  	// @method bringToFront(): this
	  	// Brings the layer to the top of all path layers.
	  	bringToFront: function () {
	  		if (this._renderer) {
	  			this._renderer._bringToFront(this);
	  		}
	  		return this;
	  	},

	  	// @method bringToBack(): this
	  	// Brings the layer to the bottom of all path layers.
	  	bringToBack: function () {
	  		if (this._renderer) {
	  			this._renderer._bringToBack(this);
	  		}
	  		return this;
	  	},

	  	getElement: function () {
	  		return this._path;
	  	},

	  	_reset: function () {
	  		// defined in child classes
	  		this._project();
	  		this._update();
	  	},

	  	_clickTolerance: function () {
	  		// used when doing hit detection for Canvas layers
	  		return (this.options.stroke ? this.options.weight / 2 : 0) + this._renderer.options.tolerance;
	  	}
	  });

	  /*
	   * @class CircleMarker
	   * @aka L.CircleMarker
	   * @inherits Path
	   *
	   * A circle of a fixed size with radius specified in pixels. Extends `Path`.
	   */

	  var CircleMarker = Path.extend({

	  	// @section
	  	// @aka CircleMarker options
	  	options: {
	  		fill: true,

	  		// @option radius: Number = 10
	  		// Radius of the circle marker, in pixels
	  		radius: 10
	  	},

	  	initialize: function (latlng, options) {
	  		setOptions(this, options);
	  		this._latlng = toLatLng(latlng);
	  		this._radius = this.options.radius;
	  	},

	  	// @method setLatLng(latLng: LatLng): this
	  	// Sets the position of a circle marker to a new location.
	  	setLatLng: function (latlng) {
	  		var oldLatLng = this._latlng;
	  		this._latlng = toLatLng(latlng);
	  		this.redraw();

	  		// @event move: Event
	  		// Fired when the marker is moved via [`setLatLng`](#circlemarker-setlatlng). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
	  		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
	  	},

	  	// @method getLatLng(): LatLng
	  	// Returns the current geographical position of the circle marker
	  	getLatLng: function () {
	  		return this._latlng;
	  	},

	  	// @method setRadius(radius: Number): this
	  	// Sets the radius of a circle marker. Units are in pixels.
	  	setRadius: function (radius) {
	  		this.options.radius = this._radius = radius;
	  		return this.redraw();
	  	},

	  	// @method getRadius(): Number
	  	// Returns the current radius of the circle
	  	getRadius: function () {
	  		return this._radius;
	  	},

	  	setStyle : function (options) {
	  		var radius = options && options.radius || this._radius;
	  		Path.prototype.setStyle.call(this, options);
	  		this.setRadius(radius);
	  		return this;
	  	},

	  	_project: function () {
	  		this._point = this._map.latLngToLayerPoint(this._latlng);
	  		this._updateBounds();
	  	},

	  	_updateBounds: function () {
	  		var r = this._radius,
	  		    r2 = this._radiusY || r,
	  		    w = this._clickTolerance(),
	  		    p = [r + w, r2 + w];
	  		this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
	  	},

	  	_update: function () {
	  		if (this._map) {
	  			this._updatePath();
	  		}
	  	},

	  	_updatePath: function () {
	  		this._renderer._updateCircle(this);
	  	},

	  	_empty: function () {
	  		return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
	  	},

	  	// Needed by the `Canvas` renderer for interactivity
	  	_containsPoint: function (p) {
	  		return p.distanceTo(this._point) <= this._radius + this._clickTolerance();
	  	}
	  });


	  // @factory L.circleMarker(latlng: LatLng, options?: CircleMarker options)
	  // Instantiates a circle marker object given a geographical point, and an optional options object.
	  function circleMarker(latlng, options) {
	  	return new CircleMarker(latlng, options);
	  }

	  /*
	   * @class Circle
	   * @aka L.Circle
	   * @inherits CircleMarker
	   *
	   * A class for drawing circle overlays on a map. Extends `CircleMarker`.
	   *
	   * It's an approximation and starts to diverge from a real circle closer to poles (due to projection distortion).
	   *
	   * @example
	   *
	   * ```js
	   * L.circle([50.5, 30.5], {radius: 200}).addTo(map);
	   * ```
	   */

	  var Circle = CircleMarker.extend({

	  	initialize: function (latlng, options, legacyOptions) {
	  		if (typeof options === 'number') {
	  			// Backwards compatibility with 0.7.x factory (latlng, radius, options?)
	  			options = extend({}, legacyOptions, {radius: options});
	  		}
	  		setOptions(this, options);
	  		this._latlng = toLatLng(latlng);

	  		if (isNaN(this.options.radius)) { throw new Error('Circle radius cannot be NaN'); }

	  		// @section
	  		// @aka Circle options
	  		// @option radius: Number; Radius of the circle, in meters.
	  		this._mRadius = this.options.radius;
	  	},

	  	// @method setRadius(radius: Number): this
	  	// Sets the radius of a circle. Units are in meters.
	  	setRadius: function (radius) {
	  		this._mRadius = radius;
	  		return this.redraw();
	  	},

	  	// @method getRadius(): Number
	  	// Returns the current radius of a circle. Units are in meters.
	  	getRadius: function () {
	  		return this._mRadius;
	  	},

	  	// @method getBounds(): LatLngBounds
	  	// Returns the `LatLngBounds` of the path.
	  	getBounds: function () {
	  		var half = [this._radius, this._radiusY || this._radius];

	  		return new LatLngBounds(
	  			this._map.layerPointToLatLng(this._point.subtract(half)),
	  			this._map.layerPointToLatLng(this._point.add(half)));
	  	},

	  	setStyle: Path.prototype.setStyle,

	  	_project: function () {

	  		var lng = this._latlng.lng,
	  		    lat = this._latlng.lat,
	  		    map = this._map,
	  		    crs = map.options.crs;

	  		if (crs.distance === Earth.distance) {
	  			var d = Math.PI / 180,
	  			    latR = (this._mRadius / Earth.R) / d,
	  			    top = map.project([lat + latR, lng]),
	  			    bottom = map.project([lat - latR, lng]),
	  			    p = top.add(bottom).divideBy(2),
	  			    lat2 = map.unproject(p).lat,
	  			    lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
	  			            (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

	  			if (isNaN(lngR) || lngR === 0) {
	  				lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
	  			}

	  			this._point = p.subtract(map.getPixelOrigin());
	  			this._radius = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
	  			this._radiusY = p.y - top.y;

	  		} else {
	  			var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));

	  			this._point = map.latLngToLayerPoint(this._latlng);
	  			this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
	  		}

	  		this._updateBounds();
	  	}
	  });

	  // @factory L.circle(latlng: LatLng, options?: Circle options)
	  // Instantiates a circle object given a geographical point, and an options object
	  // which contains the circle radius.
	  // @alternative
	  // @factory L.circle(latlng: LatLng, radius: Number, options?: Circle options)
	  // Obsolete way of instantiating a circle, for compatibility with 0.7.x code.
	  // Do not use in new applications or plugins.
	  function circle(latlng, options, legacyOptions) {
	  	return new Circle(latlng, options, legacyOptions);
	  }

	  /*
	   * @class Polyline
	   * @aka L.Polyline
	   * @inherits Path
	   *
	   * A class for drawing polyline overlays on a map. Extends `Path`.
	   *
	   * @example
	   *
	   * ```js
	   * // create a red polyline from an array of LatLng points
	   * var latlngs = [
	   * 	[45.51, -122.68],
	   * 	[37.77, -122.43],
	   * 	[34.04, -118.2]
	   * ];
	   *
	   * var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
	   *
	   * // zoom the map to the polyline
	   * map.fitBounds(polyline.getBounds());
	   * ```
	   *
	   * You can also pass a multi-dimensional array to represent a `MultiPolyline` shape:
	   *
	   * ```js
	   * // create a red polyline from an array of arrays of LatLng points
	   * var latlngs = [
	   * 	[[45.51, -122.68],
	   * 	 [37.77, -122.43],
	   * 	 [34.04, -118.2]],
	   * 	[[40.78, -73.91],
	   * 	 [41.83, -87.62],
	   * 	 [32.76, -96.72]]
	   * ];
	   * ```
	   */


	  var Polyline = Path.extend({

	  	// @section
	  	// @aka Polyline options
	  	options: {
	  		// @option smoothFactor: Number = 1.0
	  		// How much to simplify the polyline on each zoom level. More means
	  		// better performance and smoother look, and less means more accurate representation.
	  		smoothFactor: 1.0,

	  		// @option noClip: Boolean = false
	  		// Disable polyline clipping.
	  		noClip: false
	  	},

	  	initialize: function (latlngs, options) {
	  		setOptions(this, options);
	  		this._setLatLngs(latlngs);
	  	},

	  	// @method getLatLngs(): LatLng[]
	  	// Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
	  	getLatLngs: function () {
	  		return this._latlngs;
	  	},

	  	// @method setLatLngs(latlngs: LatLng[]): this
	  	// Replaces all the points in the polyline with the given array of geographical points.
	  	setLatLngs: function (latlngs) {
	  		this._setLatLngs(latlngs);
	  		return this.redraw();
	  	},

	  	// @method isEmpty(): Boolean
	  	// Returns `true` if the Polyline has no LatLngs.
	  	isEmpty: function () {
	  		return !this._latlngs.length;
	  	},

	  	// @method closestLayerPoint(p: Point): Point
	  	// Returns the point closest to `p` on the Polyline.
	  	closestLayerPoint: function (p) {
	  		var minDistance = Infinity,
	  		    minPoint = null,
	  		    closest = _sqClosestPointOnSegment,
	  		    p1, p2;

	  		for (var j = 0, jLen = this._parts.length; j < jLen; j++) {
	  			var points = this._parts[j];

	  			for (var i = 1, len = points.length; i < len; i++) {
	  				p1 = points[i - 1];
	  				p2 = points[i];

	  				var sqDist = closest(p, p1, p2, true);

	  				if (sqDist < minDistance) {
	  					minDistance = sqDist;
	  					minPoint = closest(p, p1, p2);
	  				}
	  			}
	  		}
	  		if (minPoint) {
	  			minPoint.distance = Math.sqrt(minDistance);
	  		}
	  		return minPoint;
	  	},

	  	// @method getCenter(): LatLng
	  	// Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the polyline.
	  	getCenter: function () {
	  		// throws error when not yet added to map as this center calculation requires projected coordinates
	  		if (!this._map) {
	  			throw new Error('Must add layer to map before using getCenter()');
	  		}

	  		var i, halfDist, segDist, dist, p1, p2, ratio,
	  		    points = this._rings[0],
	  		    len = points.length;

	  		if (!len) { return null; }

	  		// polyline centroid algorithm; only uses the first ring if there are multiple

	  		for (i = 0, halfDist = 0; i < len - 1; i++) {
	  			halfDist += points[i].distanceTo(points[i + 1]) / 2;
	  		}

	  		// The line is so small in the current view that all points are on the same pixel.
	  		if (halfDist === 0) {
	  			return this._map.layerPointToLatLng(points[0]);
	  		}

	  		for (i = 0, dist = 0; i < len - 1; i++) {
	  			p1 = points[i];
	  			p2 = points[i + 1];
	  			segDist = p1.distanceTo(p2);
	  			dist += segDist;

	  			if (dist > halfDist) {
	  				ratio = (dist - halfDist) / segDist;
	  				return this._map.layerPointToLatLng([
	  					p2.x - ratio * (p2.x - p1.x),
	  					p2.y - ratio * (p2.y - p1.y)
	  				]);
	  			}
	  		}
	  	},

	  	// @method getBounds(): LatLngBounds
	  	// Returns the `LatLngBounds` of the path.
	  	getBounds: function () {
	  		return this._bounds;
	  	},

	  	// @method addLatLng(latlng: LatLng, latlngs?: LatLng[]): this
	  	// Adds a given point to the polyline. By default, adds to the first ring of
	  	// the polyline in case of a multi-polyline, but can be overridden by passing
	  	// a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
	  	addLatLng: function (latlng, latlngs) {
	  		latlngs = latlngs || this._defaultShape();
	  		latlng = toLatLng(latlng);
	  		latlngs.push(latlng);
	  		this._bounds.extend(latlng);
	  		return this.redraw();
	  	},

	  	_setLatLngs: function (latlngs) {
	  		this._bounds = new LatLngBounds();
	  		this._latlngs = this._convertLatLngs(latlngs);
	  	},

	  	_defaultShape: function () {
	  		return isFlat(this._latlngs) ? this._latlngs : this._latlngs[0];
	  	},

	  	// recursively convert latlngs input into actual LatLng instances; calculate bounds along the way
	  	_convertLatLngs: function (latlngs) {
	  		var result = [],
	  		    flat = isFlat(latlngs);

	  		for (var i = 0, len = latlngs.length; i < len; i++) {
	  			if (flat) {
	  				result[i] = toLatLng(latlngs[i]);
	  				this._bounds.extend(result[i]);
	  			} else {
	  				result[i] = this._convertLatLngs(latlngs[i]);
	  			}
	  		}

	  		return result;
	  	},

	  	_project: function () {
	  		var pxBounds = new Bounds();
	  		this._rings = [];
	  		this._projectLatlngs(this._latlngs, this._rings, pxBounds);

	  		if (this._bounds.isValid() && pxBounds.isValid()) {
	  			this._rawPxBounds = pxBounds;
	  			this._updateBounds();
	  		}
	  	},

	  	_updateBounds: function () {
	  		var w = this._clickTolerance(),
	  		    p = new Point(w, w);
	  		this._pxBounds = new Bounds([
	  			this._rawPxBounds.min.subtract(p),
	  			this._rawPxBounds.max.add(p)
	  		]);
	  	},

	  	// recursively turns latlngs into a set of rings with projected coordinates
	  	_projectLatlngs: function (latlngs, result, projectedBounds) {
	  		var flat = latlngs[0] instanceof LatLng,
	  		    len = latlngs.length,
	  		    i, ring;

	  		if (flat) {
	  			ring = [];
	  			for (i = 0; i < len; i++) {
	  				ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
	  				projectedBounds.extend(ring[i]);
	  			}
	  			result.push(ring);
	  		} else {
	  			for (i = 0; i < len; i++) {
	  				this._projectLatlngs(latlngs[i], result, projectedBounds);
	  			}
	  		}
	  	},

	  	// clip polyline by renderer bounds so that we have less to render for performance
	  	_clipPoints: function () {
	  		var bounds = this._renderer._bounds;

	  		this._parts = [];
	  		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
	  			return;
	  		}

	  		if (this.options.noClip) {
	  			this._parts = this._rings;
	  			return;
	  		}

	  		var parts = this._parts,
	  		    i, j, k, len, len2, segment, points;

	  		for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
	  			points = this._rings[i];

	  			for (j = 0, len2 = points.length; j < len2 - 1; j++) {
	  				segment = clipSegment(points[j], points[j + 1], bounds, j, true);

	  				if (!segment) { continue; }

	  				parts[k] = parts[k] || [];
	  				parts[k].push(segment[0]);

	  				// if segment goes out of screen, or it's the last one, it's the end of the line part
	  				if ((segment[1] !== points[j + 1]) || (j === len2 - 2)) {
	  					parts[k].push(segment[1]);
	  					k++;
	  				}
	  			}
	  		}
	  	},

	  	// simplify each clipped part of the polyline for performance
	  	_simplifyPoints: function () {
	  		var parts = this._parts,
	  		    tolerance = this.options.smoothFactor;

	  		for (var i = 0, len = parts.length; i < len; i++) {
	  			parts[i] = simplify(parts[i], tolerance);
	  		}
	  	},

	  	_update: function () {
	  		if (!this._map) { return; }

	  		this._clipPoints();
	  		this._simplifyPoints();
	  		this._updatePath();
	  	},

	  	_updatePath: function () {
	  		this._renderer._updatePoly(this);
	  	},

	  	// Needed by the `Canvas` renderer for interactivity
	  	_containsPoint: function (p, closed) {
	  		var i, j, k, len, len2, part,
	  		    w = this._clickTolerance();

	  		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

	  		// hit detection for polylines
	  		for (i = 0, len = this._parts.length; i < len; i++) {
	  			part = this._parts[i];

	  			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
	  				if (!closed && (j === 0)) { continue; }

	  				if (pointToSegmentDistance(p, part[k], part[j]) <= w) {
	  					return true;
	  				}
	  			}
	  		}
	  		return false;
	  	}
	  });

	  // @factory L.polyline(latlngs: LatLng[], options?: Polyline options)
	  // Instantiates a polyline object given an array of geographical points and
	  // optionally an options object. You can create a `Polyline` object with
	  // multiple separate lines (`MultiPolyline`) by passing an array of arrays
	  // of geographic points.
	  function polyline(latlngs, options) {
	  	return new Polyline(latlngs, options);
	  }

	  // Retrocompat. Allow plugins to support Leaflet versions before and after 1.1.
	  Polyline._flat = _flat;

	  /*
	   * @class Polygon
	   * @aka L.Polygon
	   * @inherits Polyline
	   *
	   * A class for drawing polygon overlays on a map. Extends `Polyline`.
	   *
	   * Note that points you pass when creating a polygon shouldn't have an additional last point equal to the first one — it's better to filter out such points.
	   *
	   *
	   * @example
	   *
	   * ```js
	   * // create a red polygon from an array of LatLng points
	   * var latlngs = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];
	   *
	   * var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);
	   *
	   * // zoom the map to the polygon
	   * map.fitBounds(polygon.getBounds());
	   * ```
	   *
	   * You can also pass an array of arrays of latlngs, with the first array representing the outer shape and the other arrays representing holes in the outer shape:
	   *
	   * ```js
	   * var latlngs = [
	   *   [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
	   *   [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
	   * ];
	   * ```
	   *
	   * Additionally, you can pass a multi-dimensional array to represent a MultiPolygon shape.
	   *
	   * ```js
	   * var latlngs = [
	   *   [ // first polygon
	   *     [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
	   *     [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
	   *   ],
	   *   [ // second polygon
	   *     [[41, -111.03],[45, -111.04],[45, -104.05],[41, -104.05]]
	   *   ]
	   * ];
	   * ```
	   */

	  var Polygon = Polyline.extend({

	  	options: {
	  		fill: true
	  	},

	  	isEmpty: function () {
	  		return !this._latlngs.length || !this._latlngs[0].length;
	  	},

	  	getCenter: function () {
	  		// throws error when not yet added to map as this center calculation requires projected coordinates
	  		if (!this._map) {
	  			throw new Error('Must add layer to map before using getCenter()');
	  		}

	  		var i, j, p1, p2, f, area, x, y, center,
	  		    points = this._rings[0],
	  		    len = points.length;

	  		if (!len) { return null; }

	  		// polygon centroid algorithm; only uses the first ring if there are multiple

	  		area = x = y = 0;

	  		for (i = 0, j = len - 1; i < len; j = i++) {
	  			p1 = points[i];
	  			p2 = points[j];

	  			f = p1.y * p2.x - p2.y * p1.x;
	  			x += (p1.x + p2.x) * f;
	  			y += (p1.y + p2.y) * f;
	  			area += f * 3;
	  		}

	  		if (area === 0) {
	  			// Polygon is so small that all points are on same pixel.
	  			center = points[0];
	  		} else {
	  			center = [x / area, y / area];
	  		}
	  		return this._map.layerPointToLatLng(center);
	  	},

	  	_convertLatLngs: function (latlngs) {
	  		var result = Polyline.prototype._convertLatLngs.call(this, latlngs),
	  		    len = result.length;

	  		// remove last point if it equals first one
	  		if (len >= 2 && result[0] instanceof LatLng && result[0].equals(result[len - 1])) {
	  			result.pop();
	  		}
	  		return result;
	  	},

	  	_setLatLngs: function (latlngs) {
	  		Polyline.prototype._setLatLngs.call(this, latlngs);
	  		if (isFlat(this._latlngs)) {
	  			this._latlngs = [this._latlngs];
	  		}
	  	},

	  	_defaultShape: function () {
	  		return isFlat(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
	  	},

	  	_clipPoints: function () {
	  		// polygons need a different clipping algorithm so we redefine that

	  		var bounds = this._renderer._bounds,
	  		    w = this.options.weight,
	  		    p = new Point(w, w);

	  		// increase clip padding by stroke width to avoid stroke on clip edges
	  		bounds = new Bounds(bounds.min.subtract(p), bounds.max.add(p));

	  		this._parts = [];
	  		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
	  			return;
	  		}

	  		if (this.options.noClip) {
	  			this._parts = this._rings;
	  			return;
	  		}

	  		for (var i = 0, len = this._rings.length, clipped; i < len; i++) {
	  			clipped = clipPolygon(this._rings[i], bounds, true);
	  			if (clipped.length) {
	  				this._parts.push(clipped);
	  			}
	  		}
	  	},

	  	_updatePath: function () {
	  		this._renderer._updatePoly(this, true);
	  	},

	  	// Needed by the `Canvas` renderer for interactivity
	  	_containsPoint: function (p) {
	  		var inside = false,
	  		    part, p1, p2, i, j, k, len, len2;

	  		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

	  		// ray casting algorithm for detecting if point is in polygon
	  		for (i = 0, len = this._parts.length; i < len; i++) {
	  			part = this._parts[i];

	  			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
	  				p1 = part[j];
	  				p2 = part[k];

	  				if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
	  					inside = !inside;
	  				}
	  			}
	  		}

	  		// also check if it's on polygon stroke
	  		return inside || Polyline.prototype._containsPoint.call(this, p, true);
	  	}

	  });


	  // @factory L.polygon(latlngs: LatLng[], options?: Polyline options)
	  function polygon(latlngs, options) {
	  	return new Polygon(latlngs, options);
	  }

	  /*
	   * @class GeoJSON
	   * @aka L.GeoJSON
	   * @inherits FeatureGroup
	   *
	   * Represents a GeoJSON object or an array of GeoJSON objects. Allows you to parse
	   * GeoJSON data and display it on the map. Extends `FeatureGroup`.
	   *
	   * @example
	   *
	   * ```js
	   * L.geoJSON(data, {
	   * 	style: function (feature) {
	   * 		return {color: feature.properties.color};
	   * 	}
	   * }).bindPopup(function (layer) {
	   * 	return layer.feature.properties.description;
	   * }).addTo(map);
	   * ```
	   */

	  var GeoJSON = FeatureGroup.extend({

	  	/* @section
	  	 * @aka GeoJSON options
	  	 *
	  	 * @option pointToLayer: Function = *
	  	 * A `Function` defining how GeoJSON points spawn Leaflet layers. It is internally
	  	 * called when data is added, passing the GeoJSON point feature and its `LatLng`.
	  	 * The default is to spawn a default `Marker`:
	  	 * ```js
	  	 * function(geoJsonPoint, latlng) {
	  	 * 	return L.marker(latlng);
	  	 * }
	  	 * ```
	  	 *
	  	 * @option style: Function = *
	  	 * A `Function` defining the `Path options` for styling GeoJSON lines and polygons,
	  	 * called internally when data is added.
	  	 * The default value is to not override any defaults:
	  	 * ```js
	  	 * function (geoJsonFeature) {
	  	 * 	return {}
	  	 * }
	  	 * ```
	  	 *
	  	 * @option onEachFeature: Function = *
	  	 * A `Function` that will be called once for each created `Feature`, after it has
	  	 * been created and styled. Useful for attaching events and popups to features.
	  	 * The default is to do nothing with the newly created layers:
	  	 * ```js
	  	 * function (feature, layer) {}
	  	 * ```
	  	 *
	  	 * @option filter: Function = *
	  	 * A `Function` that will be used to decide whether to include a feature or not.
	  	 * The default is to include all features:
	  	 * ```js
	  	 * function (geoJsonFeature) {
	  	 * 	return true;
	  	 * }
	  	 * ```
	  	 * Note: dynamically changing the `filter` option will have effect only on newly
	  	 * added data. It will _not_ re-evaluate already included features.
	  	 *
	  	 * @option coordsToLatLng: Function = *
	  	 * A `Function` that will be used for converting GeoJSON coordinates to `LatLng`s.
	  	 * The default is the `coordsToLatLng` static method.
	  	 *
	  	 * @option markersInheritOptions: Boolean = false
	  	 * Whether default Markers for "Point" type Features inherit from group options.
	  	 */

	  	initialize: function (geojson, options) {
	  		setOptions(this, options);

	  		this._layers = {};

	  		if (geojson) {
	  			this.addData(geojson);
	  		}
	  	},

	  	// @method addData( <GeoJSON> data ): this
	  	// Adds a GeoJSON object to the layer.
	  	addData: function (geojson) {
	  		var features = isArray(geojson) ? geojson : geojson.features,
	  		    i, len, feature;

	  		if (features) {
	  			for (i = 0, len = features.length; i < len; i++) {
	  				// only add this if geometry or geometries are set and not null
	  				feature = features[i];
	  				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
	  					this.addData(feature);
	  				}
	  			}
	  			return this;
	  		}

	  		var options = this.options;

	  		if (options.filter && !options.filter(geojson)) { return this; }

	  		var layer = geometryToLayer(geojson, options);
	  		if (!layer) {
	  			return this;
	  		}
	  		layer.feature = asFeature(geojson);

	  		layer.defaultOptions = layer.options;
	  		this.resetStyle(layer);

	  		if (options.onEachFeature) {
	  			options.onEachFeature(geojson, layer);
	  		}

	  		return this.addLayer(layer);
	  	},

	  	// @method resetStyle( <Path> layer? ): this
	  	// Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
	  	// If `layer` is omitted, the style of all features in the current layer is reset.
	  	resetStyle: function (layer) {
	  		if (layer === undefined) {
	  			return this.eachLayer(this.resetStyle, this);
	  		}
	  		// reset any custom styles
	  		layer.options = extend({}, layer.defaultOptions);
	  		this._setLayerStyle(layer, this.options.style);
	  		return this;
	  	},

	  	// @method setStyle( <Function> style ): this
	  	// Changes styles of GeoJSON vector layers with the given style function.
	  	setStyle: function (style) {
	  		return this.eachLayer(function (layer) {
	  			this._setLayerStyle(layer, style);
	  		}, this);
	  	},

	  	_setLayerStyle: function (layer, style) {
	  		if (layer.setStyle) {
	  			if (typeof style === 'function') {
	  				style = style(layer.feature);
	  			}
	  			layer.setStyle(style);
	  		}
	  	}
	  });

	  // @section
	  // There are several static functions which can be called without instantiating L.GeoJSON:

	  // @function geometryToLayer(featureData: Object, options?: GeoJSON options): Layer
	  // Creates a `Layer` from a given GeoJSON feature. Can use a custom
	  // [`pointToLayer`](#geojson-pointtolayer) and/or [`coordsToLatLng`](#geojson-coordstolatlng)
	  // functions if provided as options.
	  function geometryToLayer(geojson, options) {

	  	var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
	  	    coords = geometry ? geometry.coordinates : null,
	  	    layers = [],
	  	    pointToLayer = options && options.pointToLayer,
	  	    _coordsToLatLng = options && options.coordsToLatLng || coordsToLatLng,
	  	    latlng, latlngs, i, len;

	  	if (!coords && !geometry) {
	  		return null;
	  	}

	  	switch (geometry.type) {
	  	case 'Point':
	  		latlng = _coordsToLatLng(coords);
	  		return _pointToLayer(pointToLayer, geojson, latlng, options);

	  	case 'MultiPoint':
	  		for (i = 0, len = coords.length; i < len; i++) {
	  			latlng = _coordsToLatLng(coords[i]);
	  			layers.push(_pointToLayer(pointToLayer, geojson, latlng, options));
	  		}
	  		return new FeatureGroup(layers);

	  	case 'LineString':
	  	case 'MultiLineString':
	  		latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, _coordsToLatLng);
	  		return new Polyline(latlngs, options);

	  	case 'Polygon':
	  	case 'MultiPolygon':
	  		latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, _coordsToLatLng);
	  		return new Polygon(latlngs, options);

	  	case 'GeometryCollection':
	  		for (i = 0, len = geometry.geometries.length; i < len; i++) {
	  			var layer = geometryToLayer({
	  				geometry: geometry.geometries[i],
	  				type: 'Feature',
	  				properties: geojson.properties
	  			}, options);

	  			if (layer) {
	  				layers.push(layer);
	  			}
	  		}
	  		return new FeatureGroup(layers);

	  	default:
	  		throw new Error('Invalid GeoJSON object.');
	  	}
	  }

	  function _pointToLayer(pointToLayerFn, geojson, latlng, options) {
	  	return pointToLayerFn ?
	  		pointToLayerFn(geojson, latlng) :
	  		new Marker(latlng, options && options.markersInheritOptions && options);
	  }

	  // @function coordsToLatLng(coords: Array): LatLng
	  // Creates a `LatLng` object from an array of 2 numbers (longitude, latitude)
	  // or 3 numbers (longitude, latitude, altitude) used in GeoJSON for points.
	  function coordsToLatLng(coords) {
	  	return new LatLng(coords[1], coords[0], coords[2]);
	  }

	  // @function coordsToLatLngs(coords: Array, levelsDeep?: Number, coordsToLatLng?: Function): Array
	  // Creates a multidimensional array of `LatLng`s from a GeoJSON coordinates array.
	  // `levelsDeep` specifies the nesting level (0 is for an array of points, 1 for an array of arrays of points, etc., 0 by default).
	  // Can use a custom [`coordsToLatLng`](#geojson-coordstolatlng) function.
	  function coordsToLatLngs(coords, levelsDeep, _coordsToLatLng) {
	  	var latlngs = [];

	  	for (var i = 0, len = coords.length, latlng; i < len; i++) {
	  		latlng = levelsDeep ?
	  			coordsToLatLngs(coords[i], levelsDeep - 1, _coordsToLatLng) :
	  			(_coordsToLatLng || coordsToLatLng)(coords[i]);

	  		latlngs.push(latlng);
	  	}

	  	return latlngs;
	  }

	  // @function latLngToCoords(latlng: LatLng, precision?: Number): Array
	  // Reverse of [`coordsToLatLng`](#geojson-coordstolatlng)
	  function latLngToCoords(latlng, precision) {
	  	precision = typeof precision === 'number' ? precision : 6;
	  	return latlng.alt !== undefined ?
	  		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision), formatNum(latlng.alt, precision)] :
	  		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision)];
	  }

	  // @function latLngsToCoords(latlngs: Array, levelsDeep?: Number, closed?: Boolean): Array
	  // Reverse of [`coordsToLatLngs`](#geojson-coordstolatlngs)
	  // `closed` determines whether the first point should be appended to the end of the array to close the feature, only used when `levelsDeep` is 0. False by default.
	  function latLngsToCoords(latlngs, levelsDeep, closed, precision) {
	  	var coords = [];

	  	for (var i = 0, len = latlngs.length; i < len; i++) {
	  		coords.push(levelsDeep ?
	  			latLngsToCoords(latlngs[i], levelsDeep - 1, closed, precision) :
	  			latLngToCoords(latlngs[i], precision));
	  	}

	  	if (!levelsDeep && closed) {
	  		coords.push(coords[0]);
	  	}

	  	return coords;
	  }

	  function getFeature(layer, newGeometry) {
	  	return layer.feature ?
	  		extend({}, layer.feature, {geometry: newGeometry}) :
	  		asFeature(newGeometry);
	  }

	  // @function asFeature(geojson: Object): Object
	  // Normalize GeoJSON geometries/features into GeoJSON features.
	  function asFeature(geojson) {
	  	if (geojson.type === 'Feature' || geojson.type === 'FeatureCollection') {
	  		return geojson;
	  	}

	  	return {
	  		type: 'Feature',
	  		properties: {},
	  		geometry: geojson
	  	};
	  }

	  var PointToGeoJSON = {
	  	toGeoJSON: function (precision) {
	  		return getFeature(this, {
	  			type: 'Point',
	  			coordinates: latLngToCoords(this.getLatLng(), precision)
	  		});
	  	}
	  };

	  // @namespace Marker
	  // @section Other methods
	  // @method toGeoJSON(precision?: Number): Object
	  // `precision` is the number of decimal places for coordinates.
	  // The default value is 6 places.
	  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the marker (as a GeoJSON `Point` Feature).
	  Marker.include(PointToGeoJSON);

	  // @namespace CircleMarker
	  // @method toGeoJSON(precision?: Number): Object
	  // `precision` is the number of decimal places for coordinates.
	  // The default value is 6 places.
	  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the circle marker (as a GeoJSON `Point` Feature).
	  Circle.include(PointToGeoJSON);
	  CircleMarker.include(PointToGeoJSON);


	  // @namespace Polyline
	  // @method toGeoJSON(precision?: Number): Object
	  // `precision` is the number of decimal places for coordinates.
	  // The default value is 6 places.
	  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polyline (as a GeoJSON `LineString` or `MultiLineString` Feature).
	  Polyline.include({
	  	toGeoJSON: function (precision) {
	  		var multi = !isFlat(this._latlngs);

	  		var coords = latLngsToCoords(this._latlngs, multi ? 1 : 0, false, precision);

	  		return getFeature(this, {
	  			type: (multi ? 'Multi' : '') + 'LineString',
	  			coordinates: coords
	  		});
	  	}
	  });

	  // @namespace Polygon
	  // @method toGeoJSON(precision?: Number): Object
	  // `precision` is the number of decimal places for coordinates.
	  // The default value is 6 places.
	  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polygon (as a GeoJSON `Polygon` or `MultiPolygon` Feature).
	  Polygon.include({
	  	toGeoJSON: function (precision) {
	  		var holes = !isFlat(this._latlngs),
	  		    multi = holes && !isFlat(this._latlngs[0]);

	  		var coords = latLngsToCoords(this._latlngs, multi ? 2 : holes ? 1 : 0, true, precision);

	  		if (!holes) {
	  			coords = [coords];
	  		}

	  		return getFeature(this, {
	  			type: (multi ? 'Multi' : '') + 'Polygon',
	  			coordinates: coords
	  		});
	  	}
	  });


	  // @namespace LayerGroup
	  LayerGroup.include({
	  	toMultiPoint: function (precision) {
	  		var coords = [];

	  		this.eachLayer(function (layer) {
	  			coords.push(layer.toGeoJSON(precision).geometry.coordinates);
	  		});

	  		return getFeature(this, {
	  			type: 'MultiPoint',
	  			coordinates: coords
	  		});
	  	},

	  	// @method toGeoJSON(precision?: Number): Object
	  	// `precision` is the number of decimal places for coordinates.
	  	// The default value is 6 places.
	  	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the layer group (as a GeoJSON `FeatureCollection`, `GeometryCollection`, or `MultiPoint`).
	  	toGeoJSON: function (precision) {

	  		var type = this.feature && this.feature.geometry && this.feature.geometry.type;

	  		if (type === 'MultiPoint') {
	  			return this.toMultiPoint(precision);
	  		}

	  		var isGeometryCollection = type === 'GeometryCollection',
	  		    jsons = [];

	  		this.eachLayer(function (layer) {
	  			if (layer.toGeoJSON) {
	  				var json = layer.toGeoJSON(precision);
	  				if (isGeometryCollection) {
	  					jsons.push(json.geometry);
	  				} else {
	  					var feature = asFeature(json);
	  					// Squash nested feature collections
	  					if (feature.type === 'FeatureCollection') {
	  						jsons.push.apply(jsons, feature.features);
	  					} else {
	  						jsons.push(feature);
	  					}
	  				}
	  			}
	  		});

	  		if (isGeometryCollection) {
	  			return getFeature(this, {
	  				geometries: jsons,
	  				type: 'GeometryCollection'
	  			});
	  		}

	  		return {
	  			type: 'FeatureCollection',
	  			features: jsons
	  		};
	  	}
	  });

	  // @namespace GeoJSON
	  // @factory L.geoJSON(geojson?: Object, options?: GeoJSON options)
	  // Creates a GeoJSON layer. Optionally accepts an object in
	  // [GeoJSON format](https://tools.ietf.org/html/rfc7946) to display on the map
	  // (you can alternatively add it later with `addData` method) and an `options` object.
	  function geoJSON(geojson, options) {
	  	return new GeoJSON(geojson, options);
	  }

	  // Backward compatibility.
	  var geoJson = geoJSON;

	  /*
	   * @class ImageOverlay
	   * @aka L.ImageOverlay
	   * @inherits Interactive layer
	   *
	   * Used to load and display a single image over specific bounds of the map. Extends `Layer`.
	   *
	   * @example
	   *
	   * ```js
	   * var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
	   * 	imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
	   * L.imageOverlay(imageUrl, imageBounds).addTo(map);
	   * ```
	   */

	  var ImageOverlay = Layer.extend({

	  	// @section
	  	// @aka ImageOverlay options
	  	options: {
	  		// @option opacity: Number = 1.0
	  		// The opacity of the image overlay.
	  		opacity: 1,

	  		// @option alt: String = ''
	  		// Text for the `alt` attribute of the image (useful for accessibility).
	  		alt: '',

	  		// @option interactive: Boolean = false
	  		// If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
	  		interactive: false,

	  		// @option crossOrigin: Boolean|String = false
	  		// Whether the crossOrigin attribute will be added to the image.
	  		// If a String is provided, the image will have its crossOrigin attribute set to the String provided. This is needed if you want to access image pixel data.
	  		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
	  		crossOrigin: false,

	  		// @option errorOverlayUrl: String = ''
	  		// URL to the overlay image to show in place of the overlay that failed to load.
	  		errorOverlayUrl: '',

	  		// @option zIndex: Number = 1
	  		// The explicit [zIndex](https://developer.mozilla.org/docs/Web/CSS/CSS_Positioning/Understanding_z_index) of the overlay layer.
	  		zIndex: 1,

	  		// @option className: String = ''
	  		// A custom class name to assign to the image. Empty by default.
	  		className: ''
	  	},

	  	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
	  		this._url = url;
	  		this._bounds = toLatLngBounds(bounds);

	  		setOptions(this, options);
	  	},

	  	onAdd: function () {
	  		if (!this._image) {
	  			this._initImage();

	  			if (this.options.opacity < 1) {
	  				this._updateOpacity();
	  			}
	  		}

	  		if (this.options.interactive) {
	  			addClass(this._image, 'leaflet-interactive');
	  			this.addInteractiveTarget(this._image);
	  		}

	  		this.getPane().appendChild(this._image);
	  		this._reset();
	  	},

	  	onRemove: function () {
	  		remove(this._image);
	  		if (this.options.interactive) {
	  			this.removeInteractiveTarget(this._image);
	  		}
	  	},

	  	// @method setOpacity(opacity: Number): this
	  	// Sets the opacity of the overlay.
	  	setOpacity: function (opacity) {
	  		this.options.opacity = opacity;

	  		if (this._image) {
	  			this._updateOpacity();
	  		}
	  		return this;
	  	},

	  	setStyle: function (styleOpts) {
	  		if (styleOpts.opacity) {
	  			this.setOpacity(styleOpts.opacity);
	  		}
	  		return this;
	  	},

	  	// @method bringToFront(): this
	  	// Brings the layer to the top of all overlays.
	  	bringToFront: function () {
	  		if (this._map) {
	  			toFront(this._image);
	  		}
	  		return this;
	  	},

	  	// @method bringToBack(): this
	  	// Brings the layer to the bottom of all overlays.
	  	bringToBack: function () {
	  		if (this._map) {
	  			toBack(this._image);
	  		}
	  		return this;
	  	},

	  	// @method setUrl(url: String): this
	  	// Changes the URL of the image.
	  	setUrl: function (url) {
	  		this._url = url;

	  		if (this._image) {
	  			this._image.src = url;
	  		}
	  		return this;
	  	},

	  	// @method setBounds(bounds: LatLngBounds): this
	  	// Update the bounds that this ImageOverlay covers
	  	setBounds: function (bounds) {
	  		this._bounds = toLatLngBounds(bounds);

	  		if (this._map) {
	  			this._reset();
	  		}
	  		return this;
	  	},

	  	getEvents: function () {
	  		var events = {
	  			zoom: this._reset,
	  			viewreset: this._reset
	  		};

	  		if (this._zoomAnimated) {
	  			events.zoomanim = this._animateZoom;
	  		}

	  		return events;
	  	},

	  	// @method setZIndex(value: Number): this
	  	// Changes the [zIndex](#imageoverlay-zindex) of the image overlay.
	  	setZIndex: function (value) {
	  		this.options.zIndex = value;
	  		this._updateZIndex();
	  		return this;
	  	},

	  	// @method getBounds(): LatLngBounds
	  	// Get the bounds that this ImageOverlay covers
	  	getBounds: function () {
	  		return this._bounds;
	  	},

	  	// @method getElement(): HTMLElement
	  	// Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
	  	// used by this overlay.
	  	getElement: function () {
	  		return this._image;
	  	},

	  	_initImage: function () {
	  		var wasElementSupplied = this._url.tagName === 'IMG';
	  		var img = this._image = wasElementSupplied ? this._url : create$1('img');

	  		addClass(img, 'leaflet-image-layer');
	  		if (this._zoomAnimated) { addClass(img, 'leaflet-zoom-animated'); }
	  		if (this.options.className) { addClass(img, this.options.className); }

	  		img.onselectstart = falseFn;
	  		img.onmousemove = falseFn;

	  		// @event load: Event
	  		// Fired when the ImageOverlay layer has loaded its image
	  		img.onload = bind(this.fire, this, 'load');
	  		img.onerror = bind(this._overlayOnError, this, 'error');

	  		if (this.options.crossOrigin || this.options.crossOrigin === '') {
	  			img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
	  		}

	  		if (this.options.zIndex) {
	  			this._updateZIndex();
	  		}

	  		if (wasElementSupplied) {
	  			this._url = img.src;
	  			return;
	  		}

	  		img.src = this._url;
	  		img.alt = this.options.alt;
	  	},

	  	_animateZoom: function (e) {
	  		var scale = this._map.getZoomScale(e.zoom),
	  		    offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

	  		setTransform(this._image, offset, scale);
	  	},

	  	_reset: function () {
	  		var image = this._image,
	  		    bounds = new Bounds(
	  		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
	  		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
	  		    size = bounds.getSize();

	  		setPosition(image, bounds.min);

	  		image.style.width  = size.x + 'px';
	  		image.style.height = size.y + 'px';
	  	},

	  	_updateOpacity: function () {
	  		setOpacity(this._image, this.options.opacity);
	  	},

	  	_updateZIndex: function () {
	  		if (this._image && this.options.zIndex !== undefined && this.options.zIndex !== null) {
	  			this._image.style.zIndex = this.options.zIndex;
	  		}
	  	},

	  	_overlayOnError: function () {
	  		// @event error: Event
	  		// Fired when the ImageOverlay layer fails to load its image
	  		this.fire('error');

	  		var errorUrl = this.options.errorOverlayUrl;
	  		if (errorUrl && this._url !== errorUrl) {
	  			this._url = errorUrl;
	  			this._image.src = errorUrl;
	  		}
	  	}
	  });

	  // @factory L.imageOverlay(imageUrl: String, bounds: LatLngBounds, options?: ImageOverlay options)
	  // Instantiates an image overlay object given the URL of the image and the
	  // geographical bounds it is tied to.
	  var imageOverlay = function (url, bounds, options) {
	  	return new ImageOverlay(url, bounds, options);
	  };

	  /*
	   * @class VideoOverlay
	   * @aka L.VideoOverlay
	   * @inherits ImageOverlay
	   *
	   * Used to load and display a video player over specific bounds of the map. Extends `ImageOverlay`.
	   *
	   * A video overlay uses the [`<video>`](https://developer.mozilla.org/docs/Web/HTML/Element/video)
	   * HTML5 element.
	   *
	   * @example
	   *
	   * ```js
	   * var videoUrl = 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
	   * 	videoBounds = [[ 32, -130], [ 13, -100]];
	   * L.videoOverlay(videoUrl, videoBounds ).addTo(map);
	   * ```
	   */

	  var VideoOverlay = ImageOverlay.extend({

	  	// @section
	  	// @aka VideoOverlay options
	  	options: {
	  		// @option autoplay: Boolean = true
	  		// Whether the video starts playing automatically when loaded.
	  		autoplay: true,

	  		// @option loop: Boolean = true
	  		// Whether the video will loop back to the beginning when played.
	  		loop: true,

	  		// @option keepAspectRatio: Boolean = true
	  		// Whether the video will save aspect ratio after the projection.
	  		// Relevant for supported browsers. Browser compatibility- https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
	  		keepAspectRatio: true,

	  		// @option muted: Boolean = false
	  		// Whether the video starts on mute when loaded.
	  		muted: false
	  	},

	  	_initImage: function () {
	  		var wasElementSupplied = this._url.tagName === 'VIDEO';
	  		var vid = this._image = wasElementSupplied ? this._url : create$1('video');

	  		addClass(vid, 'leaflet-image-layer');
	  		if (this._zoomAnimated) { addClass(vid, 'leaflet-zoom-animated'); }
	  		if (this.options.className) { addClass(vid, this.options.className); }

	  		vid.onselectstart = falseFn;
	  		vid.onmousemove = falseFn;

	  		// @event load: Event
	  		// Fired when the video has finished loading the first frame
	  		vid.onloadeddata = bind(this.fire, this, 'load');

	  		if (wasElementSupplied) {
	  			var sourceElements = vid.getElementsByTagName('source');
	  			var sources = [];
	  			for (var j = 0; j < sourceElements.length; j++) {
	  				sources.push(sourceElements[j].src);
	  			}

	  			this._url = (sourceElements.length > 0) ? sources : [vid.src];
	  			return;
	  		}

	  		if (!isArray(this._url)) { this._url = [this._url]; }

	  		if (!this.options.keepAspectRatio && Object.prototype.hasOwnProperty.call(vid.style, 'objectFit')) {
	  			vid.style['objectFit'] = 'fill';
	  		}
	  		vid.autoplay = !!this.options.autoplay;
	  		vid.loop = !!this.options.loop;
	  		vid.muted = !!this.options.muted;
	  		for (var i = 0; i < this._url.length; i++) {
	  			var source = create$1('source');
	  			source.src = this._url[i];
	  			vid.appendChild(source);
	  		}
	  	}

	  	// @method getElement(): HTMLVideoElement
	  	// Returns the instance of [`HTMLVideoElement`](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement)
	  	// used by this overlay.
	  });


	  // @factory L.videoOverlay(video: String|Array|HTMLVideoElement, bounds: LatLngBounds, options?: VideoOverlay options)
	  // Instantiates an image overlay object given the URL of the video (or array of URLs, or even a video element) and the
	  // geographical bounds it is tied to.

	  function videoOverlay(video, bounds, options) {
	  	return new VideoOverlay(video, bounds, options);
	  }

	  /*
	   * @class SVGOverlay
	   * @aka L.SVGOverlay
	   * @inherits ImageOverlay
	   *
	   * Used to load, display and provide DOM access to an SVG file over specific bounds of the map. Extends `ImageOverlay`.
	   *
	   * An SVG overlay uses the [`<svg>`](https://developer.mozilla.org/docs/Web/SVG/Element/svg) element.
	   *
	   * @example
	   *
	   * ```js
	   * var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	   * svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
	   * svgElement.setAttribute('viewBox', "0 0 200 200");
	   * svgElement.innerHTML = '<rect width="200" height="200"/><rect x="75" y="23" width="50" height="50" style="fill:red"/><rect x="75" y="123" width="50" height="50" style="fill:#0013ff"/>';
	   * var svgElementBounds = [ [ 32, -130 ], [ 13, -100 ] ];
	   * L.svgOverlay(svgElement, svgElementBounds).addTo(map);
	   * ```
	   */

	  var SVGOverlay = ImageOverlay.extend({
	  	_initImage: function () {
	  		var el = this._image = this._url;

	  		addClass(el, 'leaflet-image-layer');
	  		if (this._zoomAnimated) { addClass(el, 'leaflet-zoom-animated'); }
	  		if (this.options.className) { addClass(el, this.options.className); }

	  		el.onselectstart = falseFn;
	  		el.onmousemove = falseFn;
	  	}

	  	// @method getElement(): SVGElement
	  	// Returns the instance of [`SVGElement`](https://developer.mozilla.org/docs/Web/API/SVGElement)
	  	// used by this overlay.
	  });


	  // @factory L.svgOverlay(svg: String|SVGElement, bounds: LatLngBounds, options?: SVGOverlay options)
	  // Instantiates an image overlay object given an SVG element and the geographical bounds it is tied to.
	  // A viewBox attribute is required on the SVG element to zoom in and out properly.

	  function svgOverlay(el, bounds, options) {
	  	return new SVGOverlay(el, bounds, options);
	  }

	  /*
	   * @class DivOverlay
	   * @inherits Layer
	   * @aka L.DivOverlay
	   * Base model for L.Popup and L.Tooltip. Inherit from it for custom popup like plugins.
	   */

	  // @namespace DivOverlay
	  var DivOverlay = Layer.extend({

	  	// @section
	  	// @aka DivOverlay options
	  	options: {
	  		// @option offset: Point = Point(0, 7)
	  		// The offset of the popup position. Useful to control the anchor
	  		// of the popup when opening it on some overlays.
	  		offset: [0, 7],

	  		// @option className: String = ''
	  		// A custom CSS class name to assign to the popup.
	  		className: '',

	  		// @option pane: String = 'popupPane'
	  		// `Map pane` where the popup will be added.
	  		pane: 'popupPane'
	  	},

	  	initialize: function (options, source) {
	  		setOptions(this, options);

	  		this._source = source;
	  	},

	  	onAdd: function (map) {
	  		this._zoomAnimated = map._zoomAnimated;

	  		if (!this._container) {
	  			this._initLayout();
	  		}

	  		if (map._fadeAnimated) {
	  			setOpacity(this._container, 0);
	  		}

	  		clearTimeout(this._removeTimeout);
	  		this.getPane().appendChild(this._container);
	  		this.update();

	  		if (map._fadeAnimated) {
	  			setOpacity(this._container, 1);
	  		}

	  		this.bringToFront();
	  	},

	  	onRemove: function (map) {
	  		if (map._fadeAnimated) {
	  			setOpacity(this._container, 0);
	  			this._removeTimeout = setTimeout(bind(remove, undefined, this._container), 200);
	  		} else {
	  			remove(this._container);
	  		}
	  	},

	  	// @namespace Popup
	  	// @method getLatLng: LatLng
	  	// Returns the geographical point of popup.
	  	getLatLng: function () {
	  		return this._latlng;
	  	},

	  	// @method setLatLng(latlng: LatLng): this
	  	// Sets the geographical point where the popup will open.
	  	setLatLng: function (latlng) {
	  		this._latlng = toLatLng(latlng);
	  		if (this._map) {
	  			this._updatePosition();
	  			this._adjustPan();
	  		}
	  		return this;
	  	},

	  	// @method getContent: String|HTMLElement
	  	// Returns the content of the popup.
	  	getContent: function () {
	  		return this._content;
	  	},

	  	// @method setContent(htmlContent: String|HTMLElement|Function): this
	  	// Sets the HTML content of the popup. If a function is passed the source layer will be passed to the function. The function should return a `String` or `HTMLElement` to be used in the popup.
	  	setContent: function (content) {
	  		this._content = content;
	  		this.update();
	  		return this;
	  	},

	  	// @method getElement: String|HTMLElement
	  	// Returns the HTML container of the popup.
	  	getElement: function () {
	  		return this._container;
	  	},

	  	// @method update: null
	  	// Updates the popup content, layout and position. Useful for updating the popup after something inside changed, e.g. image loaded.
	  	update: function () {
	  		if (!this._map) { return; }

	  		this._container.style.visibility = 'hidden';

	  		this._updateContent();
	  		this._updateLayout();
	  		this._updatePosition();

	  		this._container.style.visibility = '';

	  		this._adjustPan();
	  	},

	  	getEvents: function () {
	  		var events = {
	  			zoom: this._updatePosition,
	  			viewreset: this._updatePosition
	  		};

	  		if (this._zoomAnimated) {
	  			events.zoomanim = this._animateZoom;
	  		}
	  		return events;
	  	},

	  	// @method isOpen: Boolean
	  	// Returns `true` when the popup is visible on the map.
	  	isOpen: function () {
	  		return !!this._map && this._map.hasLayer(this);
	  	},

	  	// @method bringToFront: this
	  	// Brings this popup in front of other popups (in the same map pane).
	  	bringToFront: function () {
	  		if (this._map) {
	  			toFront(this._container);
	  		}
	  		return this;
	  	},

	  	// @method bringToBack: this
	  	// Brings this popup to the back of other popups (in the same map pane).
	  	bringToBack: function () {
	  		if (this._map) {
	  			toBack(this._container);
	  		}
	  		return this;
	  	},

	  	_prepareOpen: function (parent, layer, latlng) {
	  		if (!(layer instanceof Layer)) {
	  			latlng = layer;
	  			layer = parent;
	  		}

	  		if (layer instanceof FeatureGroup) {
	  			for (var id in parent._layers) {
	  				layer = parent._layers[id];
	  				break;
	  			}
	  		}

	  		if (!latlng) {
	  			if (layer.getCenter) {
	  				latlng = layer.getCenter();
	  			} else if (layer.getLatLng) {
	  				latlng = layer.getLatLng();
	  			} else {
	  				throw new Error('Unable to get source layer LatLng.');
	  			}
	  		}

	  		// set overlay source to this layer
	  		this._source = layer;

	  		// update the overlay (content, layout, ect...)
	  		this.update();

	  		return latlng;
	  	},

	  	_updateContent: function () {
	  		if (!this._content) { return; }

	  		var node = this._contentNode;
	  		var content = (typeof this._content === 'function') ? this._content(this._source || this) : this._content;

	  		if (typeof content === 'string') {
	  			node.innerHTML = content;
	  		} else {
	  			while (node.hasChildNodes()) {
	  				node.removeChild(node.firstChild);
	  			}
	  			node.appendChild(content);
	  		}
	  		this.fire('contentupdate');
	  	},

	  	_updatePosition: function () {
	  		if (!this._map) { return; }

	  		var pos = this._map.latLngToLayerPoint(this._latlng),
	  		    offset = toPoint(this.options.offset),
	  		    anchor = this._getAnchor();

	  		if (this._zoomAnimated) {
	  			setPosition(this._container, pos.add(anchor));
	  		} else {
	  			offset = offset.add(pos).add(anchor);
	  		}

	  		var bottom = this._containerBottom = -offset.y,
	  		    left = this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x;

	  		// bottom position the popup in case the height of the popup changes (images loading etc)
	  		this._container.style.bottom = bottom + 'px';
	  		this._container.style.left = left + 'px';
	  	},

	  	_getAnchor: function () {
	  		return [0, 0];
	  	}

	  });

	  /*
	   * @class Popup
	   * @inherits DivOverlay
	   * @aka L.Popup
	   * Used to open popups in certain places of the map. Use [Map.openPopup](#map-openpopup) to
	   * open popups while making sure that only one popup is open at one time
	   * (recommended for usability), or use [Map.addLayer](#map-addlayer) to open as many as you want.
	   *
	   * @example
	   *
	   * If you want to just bind a popup to marker click and then open it, it's really easy:
	   *
	   * ```js
	   * marker.bindPopup(popupContent).openPopup();
	   * ```
	   * Path overlays like polylines also have a `bindPopup` method.
	   * Here's a more complicated way to open a popup on a map:
	   *
	   * ```js
	   * var popup = L.popup()
	   * 	.setLatLng(latlng)
	   * 	.setContent('<p>Hello world!<br />This is a nice popup.</p>')
	   * 	.openOn(map);
	   * ```
	   */


	  // @namespace Popup
	  var Popup = DivOverlay.extend({

	  	// @section
	  	// @aka Popup options
	  	options: {
	  		// @option maxWidth: Number = 300
	  		// Max width of the popup, in pixels.
	  		maxWidth: 300,

	  		// @option minWidth: Number = 50
	  		// Min width of the popup, in pixels.
	  		minWidth: 50,

	  		// @option maxHeight: Number = null
	  		// If set, creates a scrollable container of the given height
	  		// inside a popup if its content exceeds it.
	  		maxHeight: null,

	  		// @option autoPan: Boolean = true
	  		// Set it to `false` if you don't want the map to do panning animation
	  		// to fit the opened popup.
	  		autoPan: true,

	  		// @option autoPanPaddingTopLeft: Point = null
	  		// The margin between the popup and the top left corner of the map
	  		// view after autopanning was performed.
	  		autoPanPaddingTopLeft: null,

	  		// @option autoPanPaddingBottomRight: Point = null
	  		// The margin between the popup and the bottom right corner of the map
	  		// view after autopanning was performed.
	  		autoPanPaddingBottomRight: null,

	  		// @option autoPanPadding: Point = Point(5, 5)
	  		// Equivalent of setting both top left and bottom right autopan padding to the same value.
	  		autoPanPadding: [5, 5],

	  		// @option keepInView: Boolean = false
	  		// Set it to `true` if you want to prevent users from panning the popup
	  		// off of the screen while it is open.
	  		keepInView: false,

	  		// @option closeButton: Boolean = true
	  		// Controls the presence of a close button in the popup.
	  		closeButton: true,

	  		// @option autoClose: Boolean = true
	  		// Set it to `false` if you want to override the default behavior of
	  		// the popup closing when another popup is opened.
	  		autoClose: true,

	  		// @option closeOnEscapeKey: Boolean = true
	  		// Set it to `false` if you want to override the default behavior of
	  		// the ESC key for closing of the popup.
	  		closeOnEscapeKey: true,

	  		// @option closeOnClick: Boolean = *
	  		// Set it if you want to override the default behavior of the popup closing when user clicks
	  		// on the map. Defaults to the map's [`closePopupOnClick`](#map-closepopuponclick) option.

	  		// @option className: String = ''
	  		// A custom CSS class name to assign to the popup.
	  		className: ''
	  	},

	  	// @namespace Popup
	  	// @method openOn(map: Map): this
	  	// Adds the popup to the map and closes the previous one. The same as `map.openPopup(popup)`.
	  	openOn: function (map) {
	  		map.openPopup(this);
	  		return this;
	  	},

	  	onAdd: function (map) {
	  		DivOverlay.prototype.onAdd.call(this, map);

	  		// @namespace Map
	  		// @section Popup events
	  		// @event popupopen: PopupEvent
	  		// Fired when a popup is opened in the map
	  		map.fire('popupopen', {popup: this});

	  		if (this._source) {
	  			// @namespace Layer
	  			// @section Popup events
	  			// @event popupopen: PopupEvent
	  			// Fired when a popup bound to this layer is opened
	  			this._source.fire('popupopen', {popup: this}, true);
	  			// For non-path layers, we toggle the popup when clicking
	  			// again the layer, so prevent the map to reopen it.
	  			if (!(this._source instanceof Path)) {
	  				this._source.on('preclick', stopPropagation);
	  			}
	  		}
	  	},

	  	onRemove: function (map) {
	  		DivOverlay.prototype.onRemove.call(this, map);

	  		// @namespace Map
	  		// @section Popup events
	  		// @event popupclose: PopupEvent
	  		// Fired when a popup in the map is closed
	  		map.fire('popupclose', {popup: this});

	  		if (this._source) {
	  			// @namespace Layer
	  			// @section Popup events
	  			// @event popupclose: PopupEvent
	  			// Fired when a popup bound to this layer is closed
	  			this._source.fire('popupclose', {popup: this}, true);
	  			if (!(this._source instanceof Path)) {
	  				this._source.off('preclick', stopPropagation);
	  			}
	  		}
	  	},

	  	getEvents: function () {
	  		var events = DivOverlay.prototype.getEvents.call(this);

	  		if (this.options.closeOnClick !== undefined ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
	  			events.preclick = this._close;
	  		}

	  		if (this.options.keepInView) {
	  			events.moveend = this._adjustPan;
	  		}

	  		return events;
	  	},

	  	_close: function () {
	  		if (this._map) {
	  			this._map.closePopup(this);
	  		}
	  	},

	  	_initLayout: function () {
	  		var prefix = 'leaflet-popup',
	  		    container = this._container = create$1('div',
	  			prefix + ' ' + (this.options.className || '') +
	  			' leaflet-zoom-animated');

	  		var wrapper = this._wrapper = create$1('div', prefix + '-content-wrapper', container);
	  		this._contentNode = create$1('div', prefix + '-content', wrapper);

	  		disableClickPropagation(container);
	  		disableScrollPropagation(this._contentNode);
	  		on(container, 'contextmenu', stopPropagation);

	  		this._tipContainer = create$1('div', prefix + '-tip-container', container);
	  		this._tip = create$1('div', prefix + '-tip', this._tipContainer);

	  		if (this.options.closeButton) {
	  			var closeButton = this._closeButton = create$1('a', prefix + '-close-button', container);
	  			closeButton.href = '#close';
	  			closeButton.innerHTML = '&#215;';

	  			on(closeButton, 'click', this._onCloseButtonClick, this);
	  		}
	  	},

	  	_updateLayout: function () {
	  		var container = this._contentNode,
	  		    style = container.style;

	  		style.width = '';
	  		style.whiteSpace = 'nowrap';

	  		var width = container.offsetWidth;
	  		width = Math.min(width, this.options.maxWidth);
	  		width = Math.max(width, this.options.minWidth);

	  		style.width = (width + 1) + 'px';
	  		style.whiteSpace = '';

	  		style.height = '';

	  		var height = container.offsetHeight,
	  		    maxHeight = this.options.maxHeight,
	  		    scrolledClass = 'leaflet-popup-scrolled';

	  		if (maxHeight && height > maxHeight) {
	  			style.height = maxHeight + 'px';
	  			addClass(container, scrolledClass);
	  		} else {
	  			removeClass(container, scrolledClass);
	  		}

	  		this._containerWidth = this._container.offsetWidth;
	  	},

	  	_animateZoom: function (e) {
	  		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center),
	  		    anchor = this._getAnchor();
	  		setPosition(this._container, pos.add(anchor));
	  	},

	  	_adjustPan: function () {
	  		if (!this.options.autoPan) { return; }
	  		if (this._map._panAnim) { this._map._panAnim.stop(); }

	  		var map = this._map,
	  		    marginBottom = parseInt(getStyle(this._container, 'marginBottom'), 10) || 0,
	  		    containerHeight = this._container.offsetHeight + marginBottom,
	  		    containerWidth = this._containerWidth,
	  		    layerPos = new Point(this._containerLeft, -containerHeight - this._containerBottom);

	  		layerPos._add(getPosition(this._container));

	  		var containerPos = map.layerPointToContainerPoint(layerPos),
	  		    padding = toPoint(this.options.autoPanPadding),
	  		    paddingTL = toPoint(this.options.autoPanPaddingTopLeft || padding),
	  		    paddingBR = toPoint(this.options.autoPanPaddingBottomRight || padding),
	  		    size = map.getSize(),
	  		    dx = 0,
	  		    dy = 0;

	  		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
	  			dx = containerPos.x + containerWidth - size.x + paddingBR.x;
	  		}
	  		if (containerPos.x - dx - paddingTL.x < 0) { // left
	  			dx = containerPos.x - paddingTL.x;
	  		}
	  		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
	  			dy = containerPos.y + containerHeight - size.y + paddingBR.y;
	  		}
	  		if (containerPos.y - dy - paddingTL.y < 0) { // top
	  			dy = containerPos.y - paddingTL.y;
	  		}

	  		// @namespace Map
	  		// @section Popup events
	  		// @event autopanstart: Event
	  		// Fired when the map starts autopanning when opening a popup.
	  		if (dx || dy) {
	  			map
	  			    .fire('autopanstart')
	  			    .panBy([dx, dy]);
	  		}
	  	},

	  	_onCloseButtonClick: function (e) {
	  		this._close();
	  		stop(e);
	  	},

	  	_getAnchor: function () {
	  		// Where should we anchor the popup on the source layer?
	  		return toPoint(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
	  	}

	  });

	  // @namespace Popup
	  // @factory L.popup(options?: Popup options, source?: Layer)
	  // Instantiates a `Popup` object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the popup with a reference to the Layer to which it refers.
	  var popup = function (options, source) {
	  	return new Popup(options, source);
	  };


	  /* @namespace Map
	   * @section Interaction Options
	   * @option closePopupOnClick: Boolean = true
	   * Set it to `false` if you don't want popups to close when user clicks the map.
	   */
	  Map.mergeOptions({
	  	closePopupOnClick: true
	  });


	  // @namespace Map
	  // @section Methods for Layers and Controls
	  Map.include({
	  	// @method openPopup(popup: Popup): this
	  	// Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
	  	// @alternative
	  	// @method openPopup(content: String|HTMLElement, latlng: LatLng, options?: Popup options): this
	  	// Creates a popup with the specified content and options and opens it in the given point on a map.
	  	openPopup: function (popup, latlng, options) {
	  		if (!(popup instanceof Popup)) {
	  			popup = new Popup(options).setContent(popup);
	  		}

	  		if (latlng) {
	  			popup.setLatLng(latlng);
	  		}

	  		if (this.hasLayer(popup)) {
	  			return this;
	  		}

	  		if (this._popup && this._popup.options.autoClose) {
	  			this.closePopup();
	  		}

	  		this._popup = popup;
	  		return this.addLayer(popup);
	  	},

	  	// @method closePopup(popup?: Popup): this
	  	// Closes the popup previously opened with [openPopup](#map-openpopup) (or the given one).
	  	closePopup: function (popup) {
	  		if (!popup || popup === this._popup) {
	  			popup = this._popup;
	  			this._popup = null;
	  		}
	  		if (popup) {
	  			this.removeLayer(popup);
	  		}
	  		return this;
	  	}
	  });

	  /*
	   * @namespace Layer
	   * @section Popup methods example
	   *
	   * All layers share a set of methods convenient for binding popups to it.
	   *
	   * ```js
	   * var layer = L.Polygon(latlngs).bindPopup('Hi There!').addTo(map);
	   * layer.openPopup();
	   * layer.closePopup();
	   * ```
	   *
	   * Popups will also be automatically opened when the layer is clicked on and closed when the layer is removed from the map or another popup is opened.
	   */

	  // @section Popup methods
	  Layer.include({

	  	// @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
	  	// Binds a popup to the layer with the passed `content` and sets up the
	  	// necessary event listeners. If a `Function` is passed it will receive
	  	// the layer as the first argument and should return a `String` or `HTMLElement`.
	  	bindPopup: function (content, options) {

	  		if (content instanceof Popup) {
	  			setOptions(content, options);
	  			this._popup = content;
	  			content._source = this;
	  		} else {
	  			if (!this._popup || options) {
	  				this._popup = new Popup(options, this);
	  			}
	  			this._popup.setContent(content);
	  		}

	  		if (!this._popupHandlersAdded) {
	  			this.on({
	  				click: this._openPopup,
	  				keypress: this._onKeyPress,
	  				remove: this.closePopup,
	  				move: this._movePopup
	  			});
	  			this._popupHandlersAdded = true;
	  		}

	  		return this;
	  	},

	  	// @method unbindPopup(): this
	  	// Removes the popup previously bound with `bindPopup`.
	  	unbindPopup: function () {
	  		if (this._popup) {
	  			this.off({
	  				click: this._openPopup,
	  				keypress: this._onKeyPress,
	  				remove: this.closePopup,
	  				move: this._movePopup
	  			});
	  			this._popupHandlersAdded = false;
	  			this._popup = null;
	  		}
	  		return this;
	  	},

	  	// @method openPopup(latlng?: LatLng): this
	  	// Opens the bound popup at the specified `latlng` or at the default popup anchor if no `latlng` is passed.
	  	openPopup: function (layer, latlng) {
	  		if (this._popup && this._map) {
	  			latlng = this._popup._prepareOpen(this, layer, latlng);

	  			// open the popup on the map
	  			this._map.openPopup(this._popup, latlng);
	  		}

	  		return this;
	  	},

	  	// @method closePopup(): this
	  	// Closes the popup bound to this layer if it is open.
	  	closePopup: function () {
	  		if (this._popup) {
	  			this._popup._close();
	  		}
	  		return this;
	  	},

	  	// @method togglePopup(): this
	  	// Opens or closes the popup bound to this layer depending on its current state.
	  	togglePopup: function (target) {
	  		if (this._popup) {
	  			if (this._popup._map) {
	  				this.closePopup();
	  			} else {
	  				this.openPopup(target);
	  			}
	  		}
	  		return this;
	  	},

	  	// @method isPopupOpen(): boolean
	  	// Returns `true` if the popup bound to this layer is currently open.
	  	isPopupOpen: function () {
	  		return (this._popup ? this._popup.isOpen() : false);
	  	},

	  	// @method setPopupContent(content: String|HTMLElement|Popup): this
	  	// Sets the content of the popup bound to this layer.
	  	setPopupContent: function (content) {
	  		if (this._popup) {
	  			this._popup.setContent(content);
	  		}
	  		return this;
	  	},

	  	// @method getPopup(): Popup
	  	// Returns the popup bound to this layer.
	  	getPopup: function () {
	  		return this._popup;
	  	},

	  	_openPopup: function (e) {
	  		var layer = e.layer || e.target;

	  		if (!this._popup) {
	  			return;
	  		}

	  		if (!this._map) {
	  			return;
	  		}

	  		// prevent map click
	  		stop(e);

	  		// if this inherits from Path its a vector and we can just
	  		// open the popup at the new location
	  		if (layer instanceof Path) {
	  			this.openPopup(e.layer || e.target, e.latlng);
	  			return;
	  		}

	  		// otherwise treat it like a marker and figure out
	  		// if we should toggle it open/closed
	  		if (this._map.hasLayer(this._popup) && this._popup._source === layer) {
	  			this.closePopup();
	  		} else {
	  			this.openPopup(layer, e.latlng);
	  		}
	  	},

	  	_movePopup: function (e) {
	  		this._popup.setLatLng(e.latlng);
	  	},

	  	_onKeyPress: function (e) {
	  		if (e.originalEvent.keyCode === 13) {
	  			this._openPopup(e);
	  		}
	  	}
	  });

	  /*
	   * @class Tooltip
	   * @inherits DivOverlay
	   * @aka L.Tooltip
	   * Used to display small texts on top of map layers.
	   *
	   * @example
	   *
	   * ```js
	   * marker.bindTooltip("my tooltip text").openTooltip();
	   * ```
	   * Note about tooltip offset. Leaflet takes two options in consideration
	   * for computing tooltip offsetting:
	   * - the `offset` Tooltip option: it defaults to [0, 0], and it's specific to one tooltip.
	   *   Add a positive x offset to move the tooltip to the right, and a positive y offset to
	   *   move it to the bottom. Negatives will move to the left and top.
	   * - the `tooltipAnchor` Icon option: this will only be considered for Marker. You
	   *   should adapt this value if you use a custom icon.
	   */


	  // @namespace Tooltip
	  var Tooltip = DivOverlay.extend({

	  	// @section
	  	// @aka Tooltip options
	  	options: {
	  		// @option pane: String = 'tooltipPane'
	  		// `Map pane` where the tooltip will be added.
	  		pane: 'tooltipPane',

	  		// @option offset: Point = Point(0, 0)
	  		// Optional offset of the tooltip position.
	  		offset: [0, 0],

	  		// @option direction: String = 'auto'
	  		// Direction where to open the tooltip. Possible values are: `right`, `left`,
	  		// `top`, `bottom`, `center`, `auto`.
	  		// `auto` will dynamically switch between `right` and `left` according to the tooltip
	  		// position on the map.
	  		direction: 'auto',

	  		// @option permanent: Boolean = false
	  		// Whether to open the tooltip permanently or only on mouseover.
	  		permanent: false,

	  		// @option sticky: Boolean = false
	  		// If true, the tooltip will follow the mouse instead of being fixed at the feature center.
	  		sticky: false,

	  		// @option interactive: Boolean = false
	  		// If true, the tooltip will listen to the feature events.
	  		interactive: false,

	  		// @option opacity: Number = 0.9
	  		// Tooltip container opacity.
	  		opacity: 0.9
	  	},

	  	onAdd: function (map) {
	  		DivOverlay.prototype.onAdd.call(this, map);
	  		this.setOpacity(this.options.opacity);

	  		// @namespace Map
	  		// @section Tooltip events
	  		// @event tooltipopen: TooltipEvent
	  		// Fired when a tooltip is opened in the map.
	  		map.fire('tooltipopen', {tooltip: this});

	  		if (this._source) {
	  			// @namespace Layer
	  			// @section Tooltip events
	  			// @event tooltipopen: TooltipEvent
	  			// Fired when a tooltip bound to this layer is opened.
	  			this._source.fire('tooltipopen', {tooltip: this}, true);
	  		}
	  	},

	  	onRemove: function (map) {
	  		DivOverlay.prototype.onRemove.call(this, map);

	  		// @namespace Map
	  		// @section Tooltip events
	  		// @event tooltipclose: TooltipEvent
	  		// Fired when a tooltip in the map is closed.
	  		map.fire('tooltipclose', {tooltip: this});

	  		if (this._source) {
	  			// @namespace Layer
	  			// @section Tooltip events
	  			// @event tooltipclose: TooltipEvent
	  			// Fired when a tooltip bound to this layer is closed.
	  			this._source.fire('tooltipclose', {tooltip: this}, true);
	  		}
	  	},

	  	getEvents: function () {
	  		var events = DivOverlay.prototype.getEvents.call(this);

	  		if (touch && !this.options.permanent) {
	  			events.preclick = this._close;
	  		}

	  		return events;
	  	},

	  	_close: function () {
	  		if (this._map) {
	  			this._map.closeTooltip(this);
	  		}
	  	},

	  	_initLayout: function () {
	  		var prefix = 'leaflet-tooltip',
	  		    className = prefix + ' ' + (this.options.className || '') + ' leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

	  		this._contentNode = this._container = create$1('div', className);
	  	},

	  	_updateLayout: function () {},

	  	_adjustPan: function () {},

	  	_setPosition: function (pos) {
	  		var subX, subY,
	  		    map = this._map,
	  		    container = this._container,
	  		    centerPoint = map.latLngToContainerPoint(map.getCenter()),
	  		    tooltipPoint = map.layerPointToContainerPoint(pos),
	  		    direction = this.options.direction,
	  		    tooltipWidth = container.offsetWidth,
	  		    tooltipHeight = container.offsetHeight,
	  		    offset = toPoint(this.options.offset),
	  		    anchor = this._getAnchor();

	  		if (direction === 'top') {
	  			subX = tooltipWidth / 2;
	  			subY = tooltipHeight;
	  		} else if (direction === 'bottom') {
	  			subX = tooltipWidth / 2;
	  			subY = 0;
	  		} else if (direction === 'center') {
	  			subX = tooltipWidth / 2;
	  			subY = tooltipHeight / 2;
	  		} else if (direction === 'right') {
	  			subX = 0;
	  			subY = tooltipHeight / 2;
	  		} else if (direction === 'left') {
	  			subX = tooltipWidth;
	  			subY = tooltipHeight / 2;
	  		} else if (tooltipPoint.x < centerPoint.x) {
	  			direction = 'right';
	  			subX = 0;
	  			subY = tooltipHeight / 2;
	  		} else {
	  			direction = 'left';
	  			subX = tooltipWidth + (offset.x + anchor.x) * 2;
	  			subY = tooltipHeight / 2;
	  		}

	  		pos = pos.subtract(toPoint(subX, subY, true)).add(offset).add(anchor);

	  		removeClass(container, 'leaflet-tooltip-right');
	  		removeClass(container, 'leaflet-tooltip-left');
	  		removeClass(container, 'leaflet-tooltip-top');
	  		removeClass(container, 'leaflet-tooltip-bottom');
	  		addClass(container, 'leaflet-tooltip-' + direction);
	  		setPosition(container, pos);
	  	},

	  	_updatePosition: function () {
	  		var pos = this._map.latLngToLayerPoint(this._latlng);
	  		this._setPosition(pos);
	  	},

	  	setOpacity: function (opacity) {
	  		this.options.opacity = opacity;

	  		if (this._container) {
	  			setOpacity(this._container, opacity);
	  		}
	  	},

	  	_animateZoom: function (e) {
	  		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
	  		this._setPosition(pos);
	  	},

	  	_getAnchor: function () {
	  		// Where should we anchor the tooltip on the source layer?
	  		return toPoint(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
	  	}

	  });

	  // @namespace Tooltip
	  // @factory L.tooltip(options?: Tooltip options, source?: Layer)
	  // Instantiates a Tooltip object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the tooltip with a reference to the Layer to which it refers.
	  var tooltip = function (options, source) {
	  	return new Tooltip(options, source);
	  };

	  // @namespace Map
	  // @section Methods for Layers and Controls
	  Map.include({

	  	// @method openTooltip(tooltip: Tooltip): this
	  	// Opens the specified tooltip.
	  	// @alternative
	  	// @method openTooltip(content: String|HTMLElement, latlng: LatLng, options?: Tooltip options): this
	  	// Creates a tooltip with the specified content and options and open it.
	  	openTooltip: function (tooltip, latlng, options) {
	  		if (!(tooltip instanceof Tooltip)) {
	  			tooltip = new Tooltip(options).setContent(tooltip);
	  		}

	  		if (latlng) {
	  			tooltip.setLatLng(latlng);
	  		}

	  		if (this.hasLayer(tooltip)) {
	  			return this;
	  		}

	  		return this.addLayer(tooltip);
	  	},

	  	// @method closeTooltip(tooltip?: Tooltip): this
	  	// Closes the tooltip given as parameter.
	  	closeTooltip: function (tooltip) {
	  		if (tooltip) {
	  			this.removeLayer(tooltip);
	  		}
	  		return this;
	  	}

	  });

	  /*
	   * @namespace Layer
	   * @section Tooltip methods example
	   *
	   * All layers share a set of methods convenient for binding tooltips to it.
	   *
	   * ```js
	   * var layer = L.Polygon(latlngs).bindTooltip('Hi There!').addTo(map);
	   * layer.openTooltip();
	   * layer.closeTooltip();
	   * ```
	   */

	  // @section Tooltip methods
	  Layer.include({

	  	// @method bindTooltip(content: String|HTMLElement|Function|Tooltip, options?: Tooltip options): this
	  	// Binds a tooltip to the layer with the passed `content` and sets up the
	  	// necessary event listeners. If a `Function` is passed it will receive
	  	// the layer as the first argument and should return a `String` or `HTMLElement`.
	  	bindTooltip: function (content, options) {

	  		if (content instanceof Tooltip) {
	  			setOptions(content, options);
	  			this._tooltip = content;
	  			content._source = this;
	  		} else {
	  			if (!this._tooltip || options) {
	  				this._tooltip = new Tooltip(options, this);
	  			}
	  			this._tooltip.setContent(content);

	  		}

	  		this._initTooltipInteractions();

	  		if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
	  			this.openTooltip();
	  		}

	  		return this;
	  	},

	  	// @method unbindTooltip(): this
	  	// Removes the tooltip previously bound with `bindTooltip`.
	  	unbindTooltip: function () {
	  		if (this._tooltip) {
	  			this._initTooltipInteractions(true);
	  			this.closeTooltip();
	  			this._tooltip = null;
	  		}
	  		return this;
	  	},

	  	_initTooltipInteractions: function (remove$$1) {
	  		if (!remove$$1 && this._tooltipHandlersAdded) { return; }
	  		var onOff = remove$$1 ? 'off' : 'on',
	  		    events = {
	  			remove: this.closeTooltip,
	  			move: this._moveTooltip
	  		    };
	  		if (!this._tooltip.options.permanent) {
	  			events.mouseover = this._openTooltip;
	  			events.mouseout = this.closeTooltip;
	  			if (this._tooltip.options.sticky) {
	  				events.mousemove = this._moveTooltip;
	  			}
	  			if (touch) {
	  				events.click = this._openTooltip;
	  			}
	  		} else {
	  			events.add = this._openTooltip;
	  		}
	  		this[onOff](events);
	  		this._tooltipHandlersAdded = !remove$$1;
	  	},

	  	// @method openTooltip(latlng?: LatLng): this
	  	// Opens the bound tooltip at the specified `latlng` or at the default tooltip anchor if no `latlng` is passed.
	  	openTooltip: function (layer, latlng) {
	  		if (this._tooltip && this._map) {
	  			latlng = this._tooltip._prepareOpen(this, layer, latlng);

	  			// open the tooltip on the map
	  			this._map.openTooltip(this._tooltip, latlng);

	  			// Tooltip container may not be defined if not permanent and never
	  			// opened.
	  			if (this._tooltip.options.interactive && this._tooltip._container) {
	  				addClass(this._tooltip._container, 'leaflet-clickable');
	  				this.addInteractiveTarget(this._tooltip._container);
	  			}
	  		}

	  		return this;
	  	},

	  	// @method closeTooltip(): this
	  	// Closes the tooltip bound to this layer if it is open.
	  	closeTooltip: function () {
	  		if (this._tooltip) {
	  			this._tooltip._close();
	  			if (this._tooltip.options.interactive && this._tooltip._container) {
	  				removeClass(this._tooltip._container, 'leaflet-clickable');
	  				this.removeInteractiveTarget(this._tooltip._container);
	  			}
	  		}
	  		return this;
	  	},

	  	// @method toggleTooltip(): this
	  	// Opens or closes the tooltip bound to this layer depending on its current state.
	  	toggleTooltip: function (target) {
	  		if (this._tooltip) {
	  			if (this._tooltip._map) {
	  				this.closeTooltip();
	  			} else {
	  				this.openTooltip(target);
	  			}
	  		}
	  		return this;
	  	},

	  	// @method isTooltipOpen(): boolean
	  	// Returns `true` if the tooltip bound to this layer is currently open.
	  	isTooltipOpen: function () {
	  		return this._tooltip.isOpen();
	  	},

	  	// @method setTooltipContent(content: String|HTMLElement|Tooltip): this
	  	// Sets the content of the tooltip bound to this layer.
	  	setTooltipContent: function (content) {
	  		if (this._tooltip) {
	  			this._tooltip.setContent(content);
	  		}
	  		return this;
	  	},

	  	// @method getTooltip(): Tooltip
	  	// Returns the tooltip bound to this layer.
	  	getTooltip: function () {
	  		return this._tooltip;
	  	},

	  	_openTooltip: function (e) {
	  		var layer = e.layer || e.target;

	  		if (!this._tooltip || !this._map) {
	  			return;
	  		}
	  		this.openTooltip(layer, this._tooltip.options.sticky ? e.latlng : undefined);
	  	},

	  	_moveTooltip: function (e) {
	  		var latlng = e.latlng, containerPoint, layerPoint;
	  		if (this._tooltip.options.sticky && e.originalEvent) {
	  			containerPoint = this._map.mouseEventToContainerPoint(e.originalEvent);
	  			layerPoint = this._map.containerPointToLayerPoint(containerPoint);
	  			latlng = this._map.layerPointToLatLng(layerPoint);
	  		}
	  		this._tooltip.setLatLng(latlng);
	  	}
	  });

	  /*
	   * @class DivIcon
	   * @aka L.DivIcon
	   * @inherits Icon
	   *
	   * Represents a lightweight icon for markers that uses a simple `<div>`
	   * element instead of an image. Inherits from `Icon` but ignores the `iconUrl` and shadow options.
	   *
	   * @example
	   * ```js
	   * var myIcon = L.divIcon({className: 'my-div-icon'});
	   * // you can set .my-div-icon styles in CSS
	   *
	   * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
	   * ```
	   *
	   * By default, it has a 'leaflet-div-icon' CSS class and is styled as a little white square with a shadow.
	   */

	  var DivIcon = Icon.extend({
	  	options: {
	  		// @section
	  		// @aka DivIcon options
	  		iconSize: [12, 12], // also can be set through CSS

	  		// iconAnchor: (Point),
	  		// popupAnchor: (Point),

	  		// @option html: String|HTMLElement = ''
	  		// Custom HTML code to put inside the div element, empty by default. Alternatively,
	  		// an instance of `HTMLElement`.
	  		html: false,

	  		// @option bgPos: Point = [0, 0]
	  		// Optional relative position of the background, in pixels
	  		bgPos: null,

	  		className: 'leaflet-div-icon'
	  	},

	  	createIcon: function (oldIcon) {
	  		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
	  		    options = this.options;

	  		if (options.html instanceof Element) {
	  			empty(div);
	  			div.appendChild(options.html);
	  		} else {
	  			div.innerHTML = options.html !== false ? options.html : '';
	  		}

	  		if (options.bgPos) {
	  			var bgPos = toPoint(options.bgPos);
	  			div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px';
	  		}
	  		this._setIconStyles(div, 'icon');

	  		return div;
	  	},

	  	createShadow: function () {
	  		return null;
	  	}
	  });

	  // @factory L.divIcon(options: DivIcon options)
	  // Creates a `DivIcon` instance with the given options.
	  function divIcon(options) {
	  	return new DivIcon(options);
	  }

	  Icon.Default = IconDefault;

	  /*
	   * @class GridLayer
	   * @inherits Layer
	   * @aka L.GridLayer
	   *
	   * Generic class for handling a tiled grid of HTML elements. This is the base class for all tile layers and replaces `TileLayer.Canvas`.
	   * GridLayer can be extended to create a tiled grid of HTML elements like `<canvas>`, `<img>` or `<div>`. GridLayer will handle creating and animating these DOM elements for you.
	   *
	   *
	   * @section Synchronous usage
	   * @example
	   *
	   * To create a custom layer, extend GridLayer and implement the `createTile()` method, which will be passed a `Point` object with the `x`, `y`, and `z` (zoom level) coordinates to draw your tile.
	   *
	   * ```js
	   * var CanvasLayer = L.GridLayer.extend({
	   *     createTile: function(coords){
	   *         // create a <canvas> element for drawing
	   *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
	   *
	   *         // setup tile width and height according to the options
	   *         var size = this.getTileSize();
	   *         tile.width = size.x;
	   *         tile.height = size.y;
	   *
	   *         // get a canvas context and draw something on it using coords.x, coords.y and coords.z
	   *         var ctx = tile.getContext('2d');
	   *
	   *         // return the tile so it can be rendered on screen
	   *         return tile;
	   *     }
	   * });
	   * ```
	   *
	   * @section Asynchronous usage
	   * @example
	   *
	   * Tile creation can also be asynchronous, this is useful when using a third-party drawing library. Once the tile is finished drawing it can be passed to the `done()` callback.
	   *
	   * ```js
	   * var CanvasLayer = L.GridLayer.extend({
	   *     createTile: function(coords, done){
	   *         var error;
	   *
	   *         // create a <canvas> element for drawing
	   *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
	   *
	   *         // setup tile width and height according to the options
	   *         var size = this.getTileSize();
	   *         tile.width = size.x;
	   *         tile.height = size.y;
	   *
	   *         // draw something asynchronously and pass the tile to the done() callback
	   *         setTimeout(function() {
	   *             done(error, tile);
	   *         }, 1000);
	   *
	   *         return tile;
	   *     }
	   * });
	   * ```
	   *
	   * @section
	   */


	  var GridLayer = Layer.extend({

	  	// @section
	  	// @aka GridLayer options
	  	options: {
	  		// @option tileSize: Number|Point = 256
	  		// Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
	  		tileSize: 256,

	  		// @option opacity: Number = 1.0
	  		// Opacity of the tiles. Can be used in the `createTile()` function.
	  		opacity: 1,

	  		// @option updateWhenIdle: Boolean = (depends)
	  		// Load new tiles only when panning ends.
	  		// `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
	  		// `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
	  		// [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
	  		updateWhenIdle: mobile,

	  		// @option updateWhenZooming: Boolean = true
	  		// By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
	  		updateWhenZooming: true,

	  		// @option updateInterval: Number = 200
	  		// Tiles will not update more than once every `updateInterval` milliseconds when panning.
	  		updateInterval: 200,

	  		// @option zIndex: Number = 1
	  		// The explicit zIndex of the tile layer.
	  		zIndex: 1,

	  		// @option bounds: LatLngBounds = undefined
	  		// If set, tiles will only be loaded inside the set `LatLngBounds`.
	  		bounds: null,

	  		// @option minZoom: Number = 0
	  		// The minimum zoom level down to which this layer will be displayed (inclusive).
	  		minZoom: 0,

	  		// @option maxZoom: Number = undefined
	  		// The maximum zoom level up to which this layer will be displayed (inclusive).
	  		maxZoom: undefined,

	  		// @option maxNativeZoom: Number = undefined
	  		// Maximum zoom number the tile source has available. If it is specified,
	  		// the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
	  		// from `maxNativeZoom` level and auto-scaled.
	  		maxNativeZoom: undefined,

	  		// @option minNativeZoom: Number = undefined
	  		// Minimum zoom number the tile source has available. If it is specified,
	  		// the tiles on all zoom levels lower than `minNativeZoom` will be loaded
	  		// from `minNativeZoom` level and auto-scaled.
	  		minNativeZoom: undefined,

	  		// @option noWrap: Boolean = false
	  		// Whether the layer is wrapped around the antimeridian. If `true`, the
	  		// GridLayer will only be displayed once at low zoom levels. Has no
	  		// effect when the [map CRS](#map-crs) doesn't wrap around. Can be used
	  		// in combination with [`bounds`](#gridlayer-bounds) to prevent requesting
	  		// tiles outside the CRS limits.
	  		noWrap: false,

	  		// @option pane: String = 'tilePane'
	  		// `Map pane` where the grid layer will be added.
	  		pane: 'tilePane',

	  		// @option className: String = ''
	  		// A custom class name to assign to the tile layer. Empty by default.
	  		className: '',

	  		// @option keepBuffer: Number = 2
	  		// When panning the map, keep this many rows and columns of tiles before unloading them.
	  		keepBuffer: 2
	  	},

	  	initialize: function (options) {
	  		setOptions(this, options);
	  	},

	  	onAdd: function () {
	  		this._initContainer();

	  		this._levels = {};
	  		this._tiles = {};

	  		this._resetView();
	  		this._update();
	  	},

	  	beforeAdd: function (map) {
	  		map._addZoomLimit(this);
	  	},

	  	onRemove: function (map) {
	  		this._removeAllTiles();
	  		remove(this._container);
	  		map._removeZoomLimit(this);
	  		this._container = null;
	  		this._tileZoom = undefined;
	  	},

	  	// @method bringToFront: this
	  	// Brings the tile layer to the top of all tile layers.
	  	bringToFront: function () {
	  		if (this._map) {
	  			toFront(this._container);
	  			this._setAutoZIndex(Math.max);
	  		}
	  		return this;
	  	},

	  	// @method bringToBack: this
	  	// Brings the tile layer to the bottom of all tile layers.
	  	bringToBack: function () {
	  		if (this._map) {
	  			toBack(this._container);
	  			this._setAutoZIndex(Math.min);
	  		}
	  		return this;
	  	},

	  	// @method getContainer: HTMLElement
	  	// Returns the HTML element that contains the tiles for this layer.
	  	getContainer: function () {
	  		return this._container;
	  	},

	  	// @method setOpacity(opacity: Number): this
	  	// Changes the [opacity](#gridlayer-opacity) of the grid layer.
	  	setOpacity: function (opacity) {
	  		this.options.opacity = opacity;
	  		this._updateOpacity();
	  		return this;
	  	},

	  	// @method setZIndex(zIndex: Number): this
	  	// Changes the [zIndex](#gridlayer-zindex) of the grid layer.
	  	setZIndex: function (zIndex) {
	  		this.options.zIndex = zIndex;
	  		this._updateZIndex();

	  		return this;
	  	},

	  	// @method isLoading: Boolean
	  	// Returns `true` if any tile in the grid layer has not finished loading.
	  	isLoading: function () {
	  		return this._loading;
	  	},

	  	// @method redraw: this
	  	// Causes the layer to clear all the tiles and request them again.
	  	redraw: function () {
	  		if (this._map) {
	  			this._removeAllTiles();
	  			this._update();
	  		}
	  		return this;
	  	},

	  	getEvents: function () {
	  		var events = {
	  			viewprereset: this._invalidateAll,
	  			viewreset: this._resetView,
	  			zoom: this._resetView,
	  			moveend: this._onMoveEnd
	  		};

	  		if (!this.options.updateWhenIdle) {
	  			// update tiles on move, but not more often than once per given interval
	  			if (!this._onMove) {
	  				this._onMove = throttle(this._onMoveEnd, this.options.updateInterval, this);
	  			}

	  			events.move = this._onMove;
	  		}

	  		if (this._zoomAnimated) {
	  			events.zoomanim = this._animateZoom;
	  		}

	  		return events;
	  	},

	  	// @section Extension methods
	  	// Layers extending `GridLayer` shall reimplement the following method.
	  	// @method createTile(coords: Object, done?: Function): HTMLElement
	  	// Called only internally, must be overridden by classes extending `GridLayer`.
	  	// Returns the `HTMLElement` corresponding to the given `coords`. If the `done` callback
	  	// is specified, it must be called when the tile has finished loading and drawing.
	  	createTile: function () {
	  		return document.createElement('div');
	  	},

	  	// @section
	  	// @method getTileSize: Point
	  	// Normalizes the [tileSize option](#gridlayer-tilesize) into a point. Used by the `createTile()` method.
	  	getTileSize: function () {
	  		var s = this.options.tileSize;
	  		return s instanceof Point ? s : new Point(s, s);
	  	},

	  	_updateZIndex: function () {
	  		if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
	  			this._container.style.zIndex = this.options.zIndex;
	  		}
	  	},

	  	_setAutoZIndex: function (compare) {
	  		// go through all other layers of the same pane, set zIndex to max + 1 (front) or min - 1 (back)

	  		var layers = this.getPane().children,
	  		    edgeZIndex = -compare(-Infinity, Infinity); // -Infinity for max, Infinity for min

	  		for (var i = 0, len = layers.length, zIndex; i < len; i++) {

	  			zIndex = layers[i].style.zIndex;

	  			if (layers[i] !== this._container && zIndex) {
	  				edgeZIndex = compare(edgeZIndex, +zIndex);
	  			}
	  		}

	  		if (isFinite(edgeZIndex)) {
	  			this.options.zIndex = edgeZIndex + compare(-1, 1);
	  			this._updateZIndex();
	  		}
	  	},

	  	_updateOpacity: function () {
	  		if (!this._map) { return; }

	  		// IE doesn't inherit filter opacity properly, so we're forced to set it on tiles
	  		if (ielt9) { return; }

	  		setOpacity(this._container, this.options.opacity);

	  		var now = +new Date(),
	  		    nextFrame = false,
	  		    willPrune = false;

	  		for (var key in this._tiles) {
	  			var tile = this._tiles[key];
	  			if (!tile.current || !tile.loaded) { continue; }

	  			var fade = Math.min(1, (now - tile.loaded) / 200);

	  			setOpacity(tile.el, fade);
	  			if (fade < 1) {
	  				nextFrame = true;
	  			} else {
	  				if (tile.active) {
	  					willPrune = true;
	  				} else {
	  					this._onOpaqueTile(tile);
	  				}
	  				tile.active = true;
	  			}
	  		}

	  		if (willPrune && !this._noPrune) { this._pruneTiles(); }

	  		if (nextFrame) {
	  			cancelAnimFrame(this._fadeFrame);
	  			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
	  		}
	  	},

	  	_onOpaqueTile: falseFn,

	  	_initContainer: function () {
	  		if (this._container) { return; }

	  		this._container = create$1('div', 'leaflet-layer ' + (this.options.className || ''));
	  		this._updateZIndex();

	  		if (this.options.opacity < 1) {
	  			this._updateOpacity();
	  		}

	  		this.getPane().appendChild(this._container);
	  	},

	  	_updateLevels: function () {

	  		var zoom = this._tileZoom,
	  		    maxZoom = this.options.maxZoom;

	  		if (zoom === undefined) { return undefined; }

	  		for (var z in this._levels) {
	  			z = Number(z);
	  			if (this._levels[z].el.children.length || z === zoom) {
	  				this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom - z);
	  				this._onUpdateLevel(z);
	  			} else {
	  				remove(this._levels[z].el);
	  				this._removeTilesAtZoom(z);
	  				this._onRemoveLevel(z);
	  				delete this._levels[z];
	  			}
	  		}

	  		var level = this._levels[zoom],
	  		    map = this._map;

	  		if (!level) {
	  			level = this._levels[zoom] = {};

	  			level.el = create$1('div', 'leaflet-tile-container leaflet-zoom-animated', this._container);
	  			level.el.style.zIndex = maxZoom;

	  			level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom).round();
	  			level.zoom = zoom;

	  			this._setZoomTransform(level, map.getCenter(), map.getZoom());

	  			// force the browser to consider the newly added element for transition
	  			falseFn(level.el.offsetWidth);

	  			this._onCreateLevel(level);
	  		}

	  		this._level = level;

	  		return level;
	  	},

	  	_onUpdateLevel: falseFn,

	  	_onRemoveLevel: falseFn,

	  	_onCreateLevel: falseFn,

	  	_pruneTiles: function () {
	  		if (!this._map) {
	  			return;
	  		}

	  		var key, tile;

	  		var zoom = this._map.getZoom();
	  		if (zoom > this.options.maxZoom ||
	  			zoom < this.options.minZoom) {
	  			this._removeAllTiles();
	  			return;
	  		}

	  		for (key in this._tiles) {
	  			tile = this._tiles[key];
	  			tile.retain = tile.current;
	  		}

	  		for (key in this._tiles) {
	  			tile = this._tiles[key];
	  			if (tile.current && !tile.active) {
	  				var coords = tile.coords;
	  				if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
	  					this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
	  				}
	  			}
	  		}

	  		for (key in this._tiles) {
	  			if (!this._tiles[key].retain) {
	  				this._removeTile(key);
	  			}
	  		}
	  	},

	  	_removeTilesAtZoom: function (zoom) {
	  		for (var key in this._tiles) {
	  			if (this._tiles[key].coords.z !== zoom) {
	  				continue;
	  			}
	  			this._removeTile(key);
	  		}
	  	},

	  	_removeAllTiles: function () {
	  		for (var key in this._tiles) {
	  			this._removeTile(key);
	  		}
	  	},

	  	_invalidateAll: function () {
	  		for (var z in this._levels) {
	  			remove(this._levels[z].el);
	  			this._onRemoveLevel(Number(z));
	  			delete this._levels[z];
	  		}
	  		this._removeAllTiles();

	  		this._tileZoom = undefined;
	  	},

	  	_retainParent: function (x, y, z, minZoom) {
	  		var x2 = Math.floor(x / 2),
	  		    y2 = Math.floor(y / 2),
	  		    z2 = z - 1,
	  		    coords2 = new Point(+x2, +y2);
	  		coords2.z = +z2;

	  		var key = this._tileCoordsToKey(coords2),
	  		    tile = this._tiles[key];

	  		if (tile && tile.active) {
	  			tile.retain = true;
	  			return true;

	  		} else if (tile && tile.loaded) {
	  			tile.retain = true;
	  		}

	  		if (z2 > minZoom) {
	  			return this._retainParent(x2, y2, z2, minZoom);
	  		}

	  		return false;
	  	},

	  	_retainChildren: function (x, y, z, maxZoom) {

	  		for (var i = 2 * x; i < 2 * x + 2; i++) {
	  			for (var j = 2 * y; j < 2 * y + 2; j++) {

	  				var coords = new Point(i, j);
	  				coords.z = z + 1;

	  				var key = this._tileCoordsToKey(coords),
	  				    tile = this._tiles[key];

	  				if (tile && tile.active) {
	  					tile.retain = true;
	  					continue;

	  				} else if (tile && tile.loaded) {
	  					tile.retain = true;
	  				}

	  				if (z + 1 < maxZoom) {
	  					this._retainChildren(i, j, z + 1, maxZoom);
	  				}
	  			}
	  		}
	  	},

	  	_resetView: function (e) {
	  		var animating = e && (e.pinch || e.flyTo);
	  		this._setView(this._map.getCenter(), this._map.getZoom(), animating, animating);
	  	},

	  	_animateZoom: function (e) {
	  		this._setView(e.center, e.zoom, true, e.noUpdate);
	  	},

	  	_clampZoom: function (zoom) {
	  		var options = this.options;

	  		if (undefined !== options.minNativeZoom && zoom < options.minNativeZoom) {
	  			return options.minNativeZoom;
	  		}

	  		if (undefined !== options.maxNativeZoom && options.maxNativeZoom < zoom) {
	  			return options.maxNativeZoom;
	  		}

	  		return zoom;
	  	},

	  	_setView: function (center, zoom, noPrune, noUpdate) {
	  		var tileZoom = Math.round(zoom);
	  		if ((this.options.maxZoom !== undefined && tileZoom > this.options.maxZoom) ||
	  		    (this.options.minZoom !== undefined && tileZoom < this.options.minZoom)) {
	  			tileZoom = undefined;
	  		} else {
	  			tileZoom = this._clampZoom(tileZoom);
	  		}

	  		var tileZoomChanged = this.options.updateWhenZooming && (tileZoom !== this._tileZoom);

	  		if (!noUpdate || tileZoomChanged) {

	  			this._tileZoom = tileZoom;

	  			if (this._abortLoading) {
	  				this._abortLoading();
	  			}

	  			this._updateLevels();
	  			this._resetGrid();

	  			if (tileZoom !== undefined) {
	  				this._update(center);
	  			}

	  			if (!noPrune) {
	  				this._pruneTiles();
	  			}

	  			// Flag to prevent _updateOpacity from pruning tiles during
	  			// a zoom anim or a pinch gesture
	  			this._noPrune = !!noPrune;
	  		}

	  		this._setZoomTransforms(center, zoom);
	  	},

	  	_setZoomTransforms: function (center, zoom) {
	  		for (var i in this._levels) {
	  			this._setZoomTransform(this._levels[i], center, zoom);
	  		}
	  	},

	  	_setZoomTransform: function (level, center, zoom) {
	  		var scale = this._map.getZoomScale(zoom, level.zoom),
	  		    translate = level.origin.multiplyBy(scale)
	  		        .subtract(this._map._getNewPixelOrigin(center, zoom)).round();

	  		if (any3d) {
	  			setTransform(level.el, translate, scale);
	  		} else {
	  			setPosition(level.el, translate);
	  		}
	  	},

	  	_resetGrid: function () {
	  		var map = this._map,
	  		    crs = map.options.crs,
	  		    tileSize = this._tileSize = this.getTileSize(),
	  		    tileZoom = this._tileZoom;

	  		var bounds = this._map.getPixelWorldBounds(this._tileZoom);
	  		if (bounds) {
	  			this._globalTileRange = this._pxBoundsToTileRange(bounds);
	  		}

	  		this._wrapX = crs.wrapLng && !this.options.noWrap && [
	  			Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
	  			Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
	  		];
	  		this._wrapY = crs.wrapLat && !this.options.noWrap && [
	  			Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
	  			Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
	  		];
	  	},

	  	_onMoveEnd: function () {
	  		if (!this._map || this._map._animatingZoom) { return; }

	  		this._update();
	  	},

	  	_getTiledPixelBounds: function (center) {
	  		var map = this._map,
	  		    mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
	  		    scale = map.getZoomScale(mapZoom, this._tileZoom),
	  		    pixelCenter = map.project(center, this._tileZoom).floor(),
	  		    halfSize = map.getSize().divideBy(scale * 2);

	  		return new Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
	  	},

	  	// Private method to load tiles in the grid's active zoom level according to map bounds
	  	_update: function (center) {
	  		var map = this._map;
	  		if (!map) { return; }
	  		var zoom = this._clampZoom(map.getZoom());

	  		if (center === undefined) { center = map.getCenter(); }
	  		if (this._tileZoom === undefined) { return; }	// if out of minzoom/maxzoom

	  		var pixelBounds = this._getTiledPixelBounds(center),
	  		    tileRange = this._pxBoundsToTileRange(pixelBounds),
	  		    tileCenter = tileRange.getCenter(),
	  		    queue = [],
	  		    margin = this.options.keepBuffer,
	  		    noPruneRange = new Bounds(tileRange.getBottomLeft().subtract([margin, -margin]),
	  		                              tileRange.getTopRight().add([margin, -margin]));

	  		// Sanity check: panic if the tile range contains Infinity somewhere.
	  		if (!(isFinite(tileRange.min.x) &&
	  		      isFinite(tileRange.min.y) &&
	  		      isFinite(tileRange.max.x) &&
	  		      isFinite(tileRange.max.y))) { throw new Error('Attempted to load an infinite number of tiles'); }

	  		for (var key in this._tiles) {
	  			var c = this._tiles[key].coords;
	  			if (c.z !== this._tileZoom || !noPruneRange.contains(new Point(c.x, c.y))) {
	  				this._tiles[key].current = false;
	  			}
	  		}

	  		// _update just loads more tiles. If the tile zoom level differs too much
	  		// from the map's, let _setView reset levels and prune old tiles.
	  		if (Math.abs(zoom - this._tileZoom) > 1) { this._setView(center, zoom); return; }

	  		// create a queue of coordinates to load tiles from
	  		for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
	  			for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
	  				var coords = new Point(i, j);
	  				coords.z = this._tileZoom;

	  				if (!this._isValidTile(coords)) { continue; }

	  				var tile = this._tiles[this._tileCoordsToKey(coords)];
	  				if (tile) {
	  					tile.current = true;
	  				} else {
	  					queue.push(coords);
	  				}
	  			}
	  		}

	  		// sort tile queue to load tiles in order of their distance to center
	  		queue.sort(function (a, b) {
	  			return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
	  		});

	  		if (queue.length !== 0) {
	  			// if it's the first batch of tiles to load
	  			if (!this._loading) {
	  				this._loading = true;
	  				// @event loading: Event
	  				// Fired when the grid layer starts loading tiles.
	  				this.fire('loading');
	  			}

	  			// create DOM fragment to append tiles in one batch
	  			var fragment = document.createDocumentFragment();

	  			for (i = 0; i < queue.length; i++) {
	  				this._addTile(queue[i], fragment);
	  			}

	  			this._level.el.appendChild(fragment);
	  		}
	  	},

	  	_isValidTile: function (coords) {
	  		var crs = this._map.options.crs;

	  		if (!crs.infinite) {
	  			// don't load tile if it's out of bounds and not wrapped
	  			var bounds = this._globalTileRange;
	  			if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
	  			    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
	  		}

	  		if (!this.options.bounds) { return true; }

	  		// don't load tile if it doesn't intersect the bounds in options
	  		var tileBounds = this._tileCoordsToBounds(coords);
	  		return toLatLngBounds(this.options.bounds).overlaps(tileBounds);
	  	},

	  	_keyToBounds: function (key) {
	  		return this._tileCoordsToBounds(this._keyToTileCoords(key));
	  	},

	  	_tileCoordsToNwSe: function (coords) {
	  		var map = this._map,
	  		    tileSize = this.getTileSize(),
	  		    nwPoint = coords.scaleBy(tileSize),
	  		    sePoint = nwPoint.add(tileSize),
	  		    nw = map.unproject(nwPoint, coords.z),
	  		    se = map.unproject(sePoint, coords.z);
	  		return [nw, se];
	  	},

	  	// converts tile coordinates to its geographical bounds
	  	_tileCoordsToBounds: function (coords) {
	  		var bp = this._tileCoordsToNwSe(coords),
	  		    bounds = new LatLngBounds(bp[0], bp[1]);

	  		if (!this.options.noWrap) {
	  			bounds = this._map.wrapLatLngBounds(bounds);
	  		}
	  		return bounds;
	  	},
	  	// converts tile coordinates to key for the tile cache
	  	_tileCoordsToKey: function (coords) {
	  		return coords.x + ':' + coords.y + ':' + coords.z;
	  	},

	  	// converts tile cache key to coordinates
	  	_keyToTileCoords: function (key) {
	  		var k = key.split(':'),
	  		    coords = new Point(+k[0], +k[1]);
	  		coords.z = +k[2];
	  		return coords;
	  	},

	  	_removeTile: function (key) {
	  		var tile = this._tiles[key];
	  		if (!tile) { return; }

	  		remove(tile.el);

	  		delete this._tiles[key];

	  		// @event tileunload: TileEvent
	  		// Fired when a tile is removed (e.g. when a tile goes off the screen).
	  		this.fire('tileunload', {
	  			tile: tile.el,
	  			coords: this._keyToTileCoords(key)
	  		});
	  	},

	  	_initTile: function (tile) {
	  		addClass(tile, 'leaflet-tile');

	  		var tileSize = this.getTileSize();
	  		tile.style.width = tileSize.x + 'px';
	  		tile.style.height = tileSize.y + 'px';

	  		tile.onselectstart = falseFn;
	  		tile.onmousemove = falseFn;

	  		// update opacity on tiles in IE7-8 because of filter inheritance problems
	  		if (ielt9 && this.options.opacity < 1) {
	  			setOpacity(tile, this.options.opacity);
	  		}

	  		// without this hack, tiles disappear after zoom on Chrome for Android
	  		// https://github.com/Leaflet/Leaflet/issues/2078
	  		if (android && !android23) {
	  			tile.style.WebkitBackfaceVisibility = 'hidden';
	  		}
	  	},

	  	_addTile: function (coords, container) {
	  		var tilePos = this._getTilePos(coords),
	  		    key = this._tileCoordsToKey(coords);

	  		var tile = this.createTile(this._wrapCoords(coords), bind(this._tileReady, this, coords));

	  		this._initTile(tile);

	  		// if createTile is defined with a second argument ("done" callback),
	  		// we know that tile is async and will be ready later; otherwise
	  		if (this.createTile.length < 2) {
	  			// mark tile as ready, but delay one frame for opacity animation to happen
	  			requestAnimFrame(bind(this._tileReady, this, coords, null, tile));
	  		}

	  		setPosition(tile, tilePos);

	  		// save tile in cache
	  		this._tiles[key] = {
	  			el: tile,
	  			coords: coords,
	  			current: true
	  		};

	  		container.appendChild(tile);
	  		// @event tileloadstart: TileEvent
	  		// Fired when a tile is requested and starts loading.
	  		this.fire('tileloadstart', {
	  			tile: tile,
	  			coords: coords
	  		});
	  	},

	  	_tileReady: function (coords, err, tile) {
	  		if (err) {
	  			// @event tileerror: TileErrorEvent
	  			// Fired when there is an error loading a tile.
	  			this.fire('tileerror', {
	  				error: err,
	  				tile: tile,
	  				coords: coords
	  			});
	  		}

	  		var key = this._tileCoordsToKey(coords);

	  		tile = this._tiles[key];
	  		if (!tile) { return; }

	  		tile.loaded = +new Date();
	  		if (this._map._fadeAnimated) {
	  			setOpacity(tile.el, 0);
	  			cancelAnimFrame(this._fadeFrame);
	  			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
	  		} else {
	  			tile.active = true;
	  			this._pruneTiles();
	  		}

	  		if (!err) {
	  			addClass(tile.el, 'leaflet-tile-loaded');

	  			// @event tileload: TileEvent
	  			// Fired when a tile loads.
	  			this.fire('tileload', {
	  				tile: tile.el,
	  				coords: coords
	  			});
	  		}

	  		if (this._noTilesToLoad()) {
	  			this._loading = false;
	  			// @event load: Event
	  			// Fired when the grid layer loaded all visible tiles.
	  			this.fire('load');

	  			if (ielt9 || !this._map._fadeAnimated) {
	  				requestAnimFrame(this._pruneTiles, this);
	  			} else {
	  				// Wait a bit more than 0.2 secs (the duration of the tile fade-in)
	  				// to trigger a pruning.
	  				setTimeout(bind(this._pruneTiles, this), 250);
	  			}
	  		}
	  	},

	  	_getTilePos: function (coords) {
	  		return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
	  	},

	  	_wrapCoords: function (coords) {
	  		var newCoords = new Point(
	  			this._wrapX ? wrapNum(coords.x, this._wrapX) : coords.x,
	  			this._wrapY ? wrapNum(coords.y, this._wrapY) : coords.y);
	  		newCoords.z = coords.z;
	  		return newCoords;
	  	},

	  	_pxBoundsToTileRange: function (bounds) {
	  		var tileSize = this.getTileSize();
	  		return new Bounds(
	  			bounds.min.unscaleBy(tileSize).floor(),
	  			bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
	  	},

	  	_noTilesToLoad: function () {
	  		for (var key in this._tiles) {
	  			if (!this._tiles[key].loaded) { return false; }
	  		}
	  		return true;
	  	}
	  });

	  // @factory L.gridLayer(options?: GridLayer options)
	  // Creates a new instance of GridLayer with the supplied options.
	  function gridLayer(options) {
	  	return new GridLayer(options);
	  }

	  /*
	   * @class TileLayer
	   * @inherits GridLayer
	   * @aka L.TileLayer
	   * Used to load and display tile layers on the map. Note that most tile servers require attribution, which you can set under `Layer`. Extends `GridLayer`.
	   *
	   * @example
	   *
	   * ```js
	   * L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}).addTo(map);
	   * ```
	   *
	   * @section URL template
	   * @example
	   *
	   * A string of the following form:
	   *
	   * ```
	   * 'http://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png'
	   * ```
	   *
	   * `{s}` means one of the available subdomains (used sequentially to help with browser parallel requests per domain limitation; subdomain values are specified in options; `a`, `b` or `c` by default, can be omitted), `{z}` — zoom level, `{x}` and `{y}` — tile coordinates. `{r}` can be used to add "&commat;2x" to the URL to load retina tiles.
	   *
	   * You can use custom keys in the template, which will be [evaluated](#util-template) from TileLayer options, like this:
	   *
	   * ```
	   * L.tileLayer('http://{s}.somedomain.com/{foo}/{z}/{x}/{y}.png', {foo: 'bar'});
	   * ```
	   */


	  var TileLayer = GridLayer.extend({

	  	// @section
	  	// @aka TileLayer options
	  	options: {
	  		// @option minZoom: Number = 0
	  		// The minimum zoom level down to which this layer will be displayed (inclusive).
	  		minZoom: 0,

	  		// @option maxZoom: Number = 18
	  		// The maximum zoom level up to which this layer will be displayed (inclusive).
	  		maxZoom: 18,

	  		// @option subdomains: String|String[] = 'abc'
	  		// Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
	  		subdomains: 'abc',

	  		// @option errorTileUrl: String = ''
	  		// URL to the tile image to show in place of the tile that failed to load.
	  		errorTileUrl: '',

	  		// @option zoomOffset: Number = 0
	  		// The zoom number used in tile URLs will be offset with this value.
	  		zoomOffset: 0,

	  		// @option tms: Boolean = false
	  		// If `true`, inverses Y axis numbering for tiles (turn this on for [TMS](https://en.wikipedia.org/wiki/Tile_Map_Service) services).
	  		tms: false,

	  		// @option zoomReverse: Boolean = false
	  		// If set to true, the zoom number used in tile URLs will be reversed (`maxZoom - zoom` instead of `zoom`)
	  		zoomReverse: false,

	  		// @option detectRetina: Boolean = false
	  		// If `true` and user is on a retina display, it will request four tiles of half the specified size and a bigger zoom level in place of one to utilize the high resolution.
	  		detectRetina: false,

	  		// @option crossOrigin: Boolean|String = false
	  		// Whether the crossOrigin attribute will be added to the tiles.
	  		// If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
	  		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
	  		crossOrigin: false
	  	},

	  	initialize: function (url, options) {

	  		this._url = url;

	  		options = setOptions(this, options);

	  		// detecting retina displays, adjusting tileSize and zoom levels
	  		if (options.detectRetina && retina && options.maxZoom > 0) {

	  			options.tileSize = Math.floor(options.tileSize / 2);

	  			if (!options.zoomReverse) {
	  				options.zoomOffset++;
	  				options.maxZoom--;
	  			} else {
	  				options.zoomOffset--;
	  				options.minZoom++;
	  			}

	  			options.minZoom = Math.max(0, options.minZoom);
	  		}

	  		if (typeof options.subdomains === 'string') {
	  			options.subdomains = options.subdomains.split('');
	  		}

	  		// for https://github.com/Leaflet/Leaflet/issues/137
	  		if (!android) {
	  			this.on('tileunload', this._onTileRemove);
	  		}
	  	},

	  	// @method setUrl(url: String, noRedraw?: Boolean): this
	  	// Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
	  	// If the URL does not change, the layer will not be redrawn unless
	  	// the noRedraw parameter is set to false.
	  	setUrl: function (url, noRedraw) {
	  		if (this._url === url && noRedraw === undefined) {
	  			noRedraw = true;
	  		}

	  		this._url = url;

	  		if (!noRedraw) {
	  			this.redraw();
	  		}
	  		return this;
	  	},

	  	// @method createTile(coords: Object, done?: Function): HTMLElement
	  	// Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
	  	// to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
	  	// callback is called when the tile has been loaded.
	  	createTile: function (coords, done) {
	  		var tile = document.createElement('img');

	  		on(tile, 'load', bind(this._tileOnLoad, this, done, tile));
	  		on(tile, 'error', bind(this._tileOnError, this, done, tile));

	  		if (this.options.crossOrigin || this.options.crossOrigin === '') {
	  			tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
	  		}

	  		/*
	  		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
	  		 http://www.w3.org/TR/WCAG20-TECHS/H67
	  		*/
	  		tile.alt = '';

	  		/*
	  		 Set role="presentation" to force screen readers to ignore this
	  		 https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
	  		*/
	  		tile.setAttribute('role', 'presentation');

	  		tile.src = this.getTileUrl(coords);

	  		return tile;
	  	},

	  	// @section Extension methods
	  	// @uninheritable
	  	// Layers extending `TileLayer` might reimplement the following method.
	  	// @method getTileUrl(coords: Object): String
	  	// Called only internally, returns the URL for a tile given its coordinates.
	  	// Classes extending `TileLayer` can override this function to provide custom tile URL naming schemes.
	  	getTileUrl: function (coords) {
	  		var data = {
	  			r: retina ? '@2x' : '',
	  			s: this._getSubdomain(coords),
	  			x: coords.x,
	  			y: coords.y,
	  			z: this._getZoomForUrl()
	  		};
	  		if (this._map && !this._map.options.crs.infinite) {
	  			var invertedY = this._globalTileRange.max.y - coords.y;
	  			if (this.options.tms) {
	  				data['y'] = invertedY;
	  			}
	  			data['-y'] = invertedY;
	  		}

	  		return template(this._url, extend(data, this.options));
	  	},

	  	_tileOnLoad: function (done, tile) {
	  		// For https://github.com/Leaflet/Leaflet/issues/3332
	  		if (ielt9) {
	  			setTimeout(bind(done, this, null, tile), 0);
	  		} else {
	  			done(null, tile);
	  		}
	  	},

	  	_tileOnError: function (done, tile, e) {
	  		var errorUrl = this.options.errorTileUrl;
	  		if (errorUrl && tile.getAttribute('src') !== errorUrl) {
	  			tile.src = errorUrl;
	  		}
	  		done(e, tile);
	  	},

	  	_onTileRemove: function (e) {
	  		e.tile.onload = null;
	  	},

	  	_getZoomForUrl: function () {
	  		var zoom = this._tileZoom,
	  		maxZoom = this.options.maxZoom,
	  		zoomReverse = this.options.zoomReverse,
	  		zoomOffset = this.options.zoomOffset;

	  		if (zoomReverse) {
	  			zoom = maxZoom - zoom;
	  		}

	  		return zoom + zoomOffset;
	  	},

	  	_getSubdomain: function (tilePoint) {
	  		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
	  		return this.options.subdomains[index];
	  	},

	  	// stops loading all tiles in the background layer
	  	_abortLoading: function () {
	  		var i, tile;
	  		for (i in this._tiles) {
	  			if (this._tiles[i].coords.z !== this._tileZoom) {
	  				tile = this._tiles[i].el;

	  				tile.onload = falseFn;
	  				tile.onerror = falseFn;

	  				if (!tile.complete) {
	  					tile.src = emptyImageUrl;
	  					remove(tile);
	  					delete this._tiles[i];
	  				}
	  			}
	  		}
	  	},

	  	_removeTile: function (key) {
	  		var tile = this._tiles[key];
	  		if (!tile) { return; }

	  		// Cancels any pending http requests associated with the tile
	  		// unless we're on Android's stock browser,
	  		// see https://github.com/Leaflet/Leaflet/issues/137
	  		if (!androidStock) {
	  			tile.el.setAttribute('src', emptyImageUrl);
	  		}

	  		return GridLayer.prototype._removeTile.call(this, key);
	  	},

	  	_tileReady: function (coords, err, tile) {
	  		if (!this._map || (tile && tile.getAttribute('src') === emptyImageUrl)) {
	  			return;
	  		}

	  		return GridLayer.prototype._tileReady.call(this, coords, err, tile);
	  	}
	  });


	  // @factory L.tilelayer(urlTemplate: String, options?: TileLayer options)
	  // Instantiates a tile layer object given a `URL template` and optionally an options object.

	  function tileLayer(url, options) {
	  	return new TileLayer(url, options);
	  }

	  /*
	   * @class TileLayer.WMS
	   * @inherits TileLayer
	   * @aka L.TileLayer.WMS
	   * Used to display [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services as tile layers on the map. Extends `TileLayer`.
	   *
	   * @example
	   *
	   * ```js
	   * var nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
	   * 	layers: 'nexrad-n0r-900913',
	   * 	format: 'image/png',
	   * 	transparent: true,
	   * 	attribution: "Weather data © 2012 IEM Nexrad"
	   * });
	   * ```
	   */

	  var TileLayerWMS = TileLayer.extend({

	  	// @section
	  	// @aka TileLayer.WMS options
	  	// If any custom options not documented here are used, they will be sent to the
	  	// WMS server as extra parameters in each request URL. This can be useful for
	  	// [non-standard vendor WMS parameters](http://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
	  	defaultWmsParams: {
	  		service: 'WMS',
	  		request: 'GetMap',

	  		// @option layers: String = ''
	  		// **(required)** Comma-separated list of WMS layers to show.
	  		layers: '',

	  		// @option styles: String = ''
	  		// Comma-separated list of WMS styles.
	  		styles: '',

	  		// @option format: String = 'image/jpeg'
	  		// WMS image format (use `'image/png'` for layers with transparency).
	  		format: 'image/jpeg',

	  		// @option transparent: Boolean = false
	  		// If `true`, the WMS service will return images with transparency.
	  		transparent: false,

	  		// @option version: String = '1.1.1'
	  		// Version of the WMS service to use
	  		version: '1.1.1'
	  	},

	  	options: {
	  		// @option crs: CRS = null
	  		// Coordinate Reference System to use for the WMS requests, defaults to
	  		// map CRS. Don't change this if you're not sure what it means.
	  		crs: null,

	  		// @option uppercase: Boolean = false
	  		// If `true`, WMS request parameter keys will be uppercase.
	  		uppercase: false
	  	},

	  	initialize: function (url, options) {

	  		this._url = url;

	  		var wmsParams = extend({}, this.defaultWmsParams);

	  		// all keys that are not TileLayer options go to WMS params
	  		for (var i in options) {
	  			if (!(i in this.options)) {
	  				wmsParams[i] = options[i];
	  			}
	  		}

	  		options = setOptions(this, options);

	  		var realRetina = options.detectRetina && retina ? 2 : 1;
	  		var tileSize = this.getTileSize();
	  		wmsParams.width = tileSize.x * realRetina;
	  		wmsParams.height = tileSize.y * realRetina;

	  		this.wmsParams = wmsParams;
	  	},

	  	onAdd: function (map) {

	  		this._crs = this.options.crs || map.options.crs;
	  		this._wmsVersion = parseFloat(this.wmsParams.version);

	  		var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
	  		this.wmsParams[projectionKey] = this._crs.code;

	  		TileLayer.prototype.onAdd.call(this, map);
	  	},

	  	getTileUrl: function (coords) {

	  		var tileBounds = this._tileCoordsToNwSe(coords),
	  		    crs = this._crs,
	  		    bounds = toBounds(crs.project(tileBounds[0]), crs.project(tileBounds[1])),
	  		    min = bounds.min,
	  		    max = bounds.max,
	  		    bbox = (this._wmsVersion >= 1.3 && this._crs === EPSG4326 ?
	  		    [min.y, min.x, max.y, max.x] :
	  		    [min.x, min.y, max.x, max.y]).join(','),
	  		    url = TileLayer.prototype.getTileUrl.call(this, coords);
	  		return url +
	  			getParamString(this.wmsParams, url, this.options.uppercase) +
	  			(this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
	  	},

	  	// @method setParams(params: Object, noRedraw?: Boolean): this
	  	// Merges an object with the new parameters and re-requests tiles on the current screen (unless `noRedraw` was set to true).
	  	setParams: function (params, noRedraw) {

	  		extend(this.wmsParams, params);

	  		if (!noRedraw) {
	  			this.redraw();
	  		}

	  		return this;
	  	}
	  });


	  // @factory L.tileLayer.wms(baseUrl: String, options: TileLayer.WMS options)
	  // Instantiates a WMS tile layer object given a base URL of the WMS service and a WMS parameters/options object.
	  function tileLayerWMS(url, options) {
	  	return new TileLayerWMS(url, options);
	  }

	  TileLayer.WMS = TileLayerWMS;
	  tileLayer.wms = tileLayerWMS;

	  /*
	   * @class Renderer
	   * @inherits Layer
	   * @aka L.Renderer
	   *
	   * Base class for vector renderer implementations (`SVG`, `Canvas`). Handles the
	   * DOM container of the renderer, its bounds, and its zoom animation.
	   *
	   * A `Renderer` works as an implicit layer group for all `Path`s - the renderer
	   * itself can be added or removed to the map. All paths use a renderer, which can
	   * be implicit (the map will decide the type of renderer and use it automatically)
	   * or explicit (using the [`renderer`](#path-renderer) option of the path).
	   *
	   * Do not use this class directly, use `SVG` and `Canvas` instead.
	   *
	   * @event update: Event
	   * Fired when the renderer updates its bounds, center and zoom, for example when
	   * its map has moved
	   */

	  var Renderer = Layer.extend({

	  	// @section
	  	// @aka Renderer options
	  	options: {
	  		// @option padding: Number = 0.1
	  		// How much to extend the clip area around the map view (relative to its size)
	  		// e.g. 0.1 would be 10% of map view in each direction
	  		padding: 0.1,

	  		// @option tolerance: Number = 0
	  		// How much to extend click tolerance round a path/object on the map
	  		tolerance : 0
	  	},

	  	initialize: function (options) {
	  		setOptions(this, options);
	  		stamp(this);
	  		this._layers = this._layers || {};
	  	},

	  	onAdd: function () {
	  		if (!this._container) {
	  			this._initContainer(); // defined by renderer implementations

	  			if (this._zoomAnimated) {
	  				addClass(this._container, 'leaflet-zoom-animated');
	  			}
	  		}

	  		this.getPane().appendChild(this._container);
	  		this._update();
	  		this.on('update', this._updatePaths, this);
	  	},

	  	onRemove: function () {
	  		this.off('update', this._updatePaths, this);
	  		this._destroyContainer();
	  	},

	  	getEvents: function () {
	  		var events = {
	  			viewreset: this._reset,
	  			zoom: this._onZoom,
	  			moveend: this._update,
	  			zoomend: this._onZoomEnd
	  		};
	  		if (this._zoomAnimated) {
	  			events.zoomanim = this._onAnimZoom;
	  		}
	  		return events;
	  	},

	  	_onAnimZoom: function (ev) {
	  		this._updateTransform(ev.center, ev.zoom);
	  	},

	  	_onZoom: function () {
	  		this._updateTransform(this._map.getCenter(), this._map.getZoom());
	  	},

	  	_updateTransform: function (center, zoom) {
	  		var scale = this._map.getZoomScale(zoom, this._zoom),
	  		    position = getPosition(this._container),
	  		    viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
	  		    currentCenterPoint = this._map.project(this._center, zoom),
	  		    destCenterPoint = this._map.project(center, zoom),
	  		    centerOffset = destCenterPoint.subtract(currentCenterPoint),

	  		    topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset);

	  		if (any3d) {
	  			setTransform(this._container, topLeftOffset, scale);
	  		} else {
	  			setPosition(this._container, topLeftOffset);
	  		}
	  	},

	  	_reset: function () {
	  		this._update();
	  		this._updateTransform(this._center, this._zoom);

	  		for (var id in this._layers) {
	  			this._layers[id]._reset();
	  		}
	  	},

	  	_onZoomEnd: function () {
	  		for (var id in this._layers) {
	  			this._layers[id]._project();
	  		}
	  	},

	  	_updatePaths: function () {
	  		for (var id in this._layers) {
	  			this._layers[id]._update();
	  		}
	  	},

	  	_update: function () {
	  		// Update pixel bounds of renderer container (for positioning/sizing/clipping later)
	  		// Subclasses are responsible of firing the 'update' event.
	  		var p = this.options.padding,
	  		    size = this._map.getSize(),
	  		    min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();

	  		this._bounds = new Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());

	  		this._center = this._map.getCenter();
	  		this._zoom = this._map.getZoom();
	  	}
	  });

	  /*
	   * @class Canvas
	   * @inherits Renderer
	   * @aka L.Canvas
	   *
	   * Allows vector layers to be displayed with [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
	   * Inherits `Renderer`.
	   *
	   * Due to [technical limitations](http://caniuse.com/#search=canvas), Canvas is not
	   * available in all web browsers, notably IE8, and overlapping geometries might
	   * not display properly in some edge cases.
	   *
	   * @example
	   *
	   * Use Canvas by default for all paths in the map:
	   *
	   * ```js
	   * var map = L.map('map', {
	   * 	renderer: L.canvas()
	   * });
	   * ```
	   *
	   * Use a Canvas renderer with extra padding for specific vector geometries:
	   *
	   * ```js
	   * var map = L.map('map');
	   * var myRenderer = L.canvas({ padding: 0.5 });
	   * var line = L.polyline( coordinates, { renderer: myRenderer } );
	   * var circle = L.circle( center, { renderer: myRenderer } );
	   * ```
	   */

	  var Canvas = Renderer.extend({
	  	getEvents: function () {
	  		var events = Renderer.prototype.getEvents.call(this);
	  		events.viewprereset = this._onViewPreReset;
	  		return events;
	  	},

	  	_onViewPreReset: function () {
	  		// Set a flag so that a viewprereset+moveend+viewreset only updates&redraws once
	  		this._postponeUpdatePaths = true;
	  	},

	  	onAdd: function () {
	  		Renderer.prototype.onAdd.call(this);

	  		// Redraw vectors since canvas is cleared upon removal,
	  		// in case of removing the renderer itself from the map.
	  		this._draw();
	  	},

	  	_initContainer: function () {
	  		var container = this._container = document.createElement('canvas');

	  		on(container, 'mousemove', this._onMouseMove, this);
	  		on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this);
	  		on(container, 'mouseout', this._handleMouseOut, this);

	  		this._ctx = container.getContext('2d');
	  	},

	  	_destroyContainer: function () {
	  		cancelAnimFrame(this._redrawRequest);
	  		delete this._ctx;
	  		remove(this._container);
	  		off(this._container);
	  		delete this._container;
	  	},

	  	_updatePaths: function () {
	  		if (this._postponeUpdatePaths) { return; }

	  		var layer;
	  		this._redrawBounds = null;
	  		for (var id in this._layers) {
	  			layer = this._layers[id];
	  			layer._update();
	  		}
	  		this._redraw();
	  	},

	  	_update: function () {
	  		if (this._map._animatingZoom && this._bounds) { return; }

	  		Renderer.prototype._update.call(this);

	  		var b = this._bounds,
	  		    container = this._container,
	  		    size = b.getSize(),
	  		    m = retina ? 2 : 1;

	  		setPosition(container, b.min);

	  		// set canvas size (also clearing it); use double size on retina
	  		container.width = m * size.x;
	  		container.height = m * size.y;
	  		container.style.width = size.x + 'px';
	  		container.style.height = size.y + 'px';

	  		if (retina) {
	  			this._ctx.scale(2, 2);
	  		}

	  		// translate so we use the same path coordinates after canvas element moves
	  		this._ctx.translate(-b.min.x, -b.min.y);

	  		// Tell paths to redraw themselves
	  		this.fire('update');
	  	},

	  	_reset: function () {
	  		Renderer.prototype._reset.call(this);

	  		if (this._postponeUpdatePaths) {
	  			this._postponeUpdatePaths = false;
	  			this._updatePaths();
	  		}
	  	},

	  	_initPath: function (layer) {
	  		this._updateDashArray(layer);
	  		this._layers[stamp(layer)] = layer;

	  		var order = layer._order = {
	  			layer: layer,
	  			prev: this._drawLast,
	  			next: null
	  		};
	  		if (this._drawLast) { this._drawLast.next = order; }
	  		this._drawLast = order;
	  		this._drawFirst = this._drawFirst || this._drawLast;
	  	},

	  	_addPath: function (layer) {
	  		this._requestRedraw(layer);
	  	},

	  	_removePath: function (layer) {
	  		var order = layer._order;
	  		var next = order.next;
	  		var prev = order.prev;

	  		if (next) {
	  			next.prev = prev;
	  		} else {
	  			this._drawLast = prev;
	  		}
	  		if (prev) {
	  			prev.next = next;
	  		} else {
	  			this._drawFirst = next;
	  		}

	  		delete layer._order;

	  		delete this._layers[stamp(layer)];

	  		this._requestRedraw(layer);
	  	},

	  	_updatePath: function (layer) {
	  		// Redraw the union of the layer's old pixel
	  		// bounds and the new pixel bounds.
	  		this._extendRedrawBounds(layer);
	  		layer._project();
	  		layer._update();
	  		// The redraw will extend the redraw bounds
	  		// with the new pixel bounds.
	  		this._requestRedraw(layer);
	  	},

	  	_updateStyle: function (layer) {
	  		this._updateDashArray(layer);
	  		this._requestRedraw(layer);
	  	},

	  	_updateDashArray: function (layer) {
	  		if (typeof layer.options.dashArray === 'string') {
	  			var parts = layer.options.dashArray.split(/[, ]+/),
	  			    dashArray = [],
	  			    dashValue,
	  			    i;
	  			for (i = 0; i < parts.length; i++) {
	  				dashValue = Number(parts[i]);
	  				// Ignore dash array containing invalid lengths
	  				if (isNaN(dashValue)) { return; }
	  				dashArray.push(dashValue);
	  			}
	  			layer.options._dashArray = dashArray;
	  		} else {
	  			layer.options._dashArray = layer.options.dashArray;
	  		}
	  	},

	  	_requestRedraw: function (layer) {
	  		if (!this._map) { return; }

	  		this._extendRedrawBounds(layer);
	  		this._redrawRequest = this._redrawRequest || requestAnimFrame(this._redraw, this);
	  	},

	  	_extendRedrawBounds: function (layer) {
	  		if (layer._pxBounds) {
	  			var padding = (layer.options.weight || 0) + 1;
	  			this._redrawBounds = this._redrawBounds || new Bounds();
	  			this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
	  			this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
	  		}
	  	},

	  	_redraw: function () {
	  		this._redrawRequest = null;

	  		if (this._redrawBounds) {
	  			this._redrawBounds.min._floor();
	  			this._redrawBounds.max._ceil();
	  		}

	  		this._clear(); // clear layers in redraw bounds
	  		this._draw(); // draw layers

	  		this._redrawBounds = null;
	  	},

	  	_clear: function () {
	  		var bounds = this._redrawBounds;
	  		if (bounds) {
	  			var size = bounds.getSize();
	  			this._ctx.clearRect(bounds.min.x, bounds.min.y, size.x, size.y);
	  		} else {
	  			this._ctx.save();
	  			this._ctx.setTransform(1, 0, 0, 1, 0, 0);
	  			this._ctx.clearRect(0, 0, this._container.width, this._container.height);
	  			this._ctx.restore();
	  		}
	  	},

	  	_draw: function () {
	  		var layer, bounds = this._redrawBounds;
	  		this._ctx.save();
	  		if (bounds) {
	  			var size = bounds.getSize();
	  			this._ctx.beginPath();
	  			this._ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
	  			this._ctx.clip();
	  		}

	  		this._drawing = true;

	  		for (var order = this._drawFirst; order; order = order.next) {
	  			layer = order.layer;
	  			if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) {
	  				layer._updatePath();
	  			}
	  		}

	  		this._drawing = false;

	  		this._ctx.restore();  // Restore state before clipping.
	  	},

	  	_updatePoly: function (layer, closed) {
	  		if (!this._drawing) { return; }

	  		var i, j, len2, p,
	  		    parts = layer._parts,
	  		    len = parts.length,
	  		    ctx = this._ctx;

	  		if (!len) { return; }

	  		ctx.beginPath();

	  		for (i = 0; i < len; i++) {
	  			for (j = 0, len2 = parts[i].length; j < len2; j++) {
	  				p = parts[i][j];
	  				ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
	  			}
	  			if (closed) {
	  				ctx.closePath();
	  			}
	  		}

	  		this._fillStroke(ctx, layer);

	  		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
	  	},

	  	_updateCircle: function (layer) {

	  		if (!this._drawing || layer._empty()) { return; }

	  		var p = layer._point,
	  		    ctx = this._ctx,
	  		    r = Math.max(Math.round(layer._radius), 1),
	  		    s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

	  		if (s !== 1) {
	  			ctx.save();
	  			ctx.scale(1, s);
	  		}

	  		ctx.beginPath();
	  		ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

	  		if (s !== 1) {
	  			ctx.restore();
	  		}

	  		this._fillStroke(ctx, layer);
	  	},

	  	_fillStroke: function (ctx, layer) {
	  		var options = layer.options;

	  		if (options.fill) {
	  			ctx.globalAlpha = options.fillOpacity;
	  			ctx.fillStyle = options.fillColor || options.color;
	  			ctx.fill(options.fillRule || 'evenodd');
	  		}

	  		if (options.stroke && options.weight !== 0) {
	  			if (ctx.setLineDash) {
	  				ctx.setLineDash(layer.options && layer.options._dashArray || []);
	  			}
	  			ctx.globalAlpha = options.opacity;
	  			ctx.lineWidth = options.weight;
	  			ctx.strokeStyle = options.color;
	  			ctx.lineCap = options.lineCap;
	  			ctx.lineJoin = options.lineJoin;
	  			ctx.stroke();
	  		}
	  	},

	  	// Canvas obviously doesn't have mouse events for individual drawn objects,
	  	// so we emulate that by calculating what's under the mouse on mousemove/click manually

	  	_onClick: function (e) {
	  		var point = this._map.mouseEventToLayerPoint(e), layer, clickedLayer;

	  		for (var order = this._drawFirst; order; order = order.next) {
	  			layer = order.layer;
	  			if (layer.options.interactive && layer._containsPoint(point)) {
	  				if (!(e.type === 'click' || e.type !== 'preclick') || !this._map._draggableMoved(layer)) {
	  					clickedLayer = layer;
	  				}
	  			}
	  		}
	  		if (clickedLayer)  {
	  			fakeStop(e);
	  			this._fireEvent([clickedLayer], e);
	  		}
	  	},

	  	_onMouseMove: function (e) {
	  		if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) { return; }

	  		var point = this._map.mouseEventToLayerPoint(e);
	  		this._handleMouseHover(e, point);
	  	},


	  	_handleMouseOut: function (e) {
	  		var layer = this._hoveredLayer;
	  		if (layer) {
	  			// if we're leaving the layer, fire mouseout
	  			removeClass(this._container, 'leaflet-interactive');
	  			this._fireEvent([layer], e, 'mouseout');
	  			this._hoveredLayer = null;
	  			this._mouseHoverThrottled = false;
	  		}
	  	},

	  	_handleMouseHover: function (e, point) {
	  		if (this._mouseHoverThrottled) {
	  			return;
	  		}

	  		var layer, candidateHoveredLayer;

	  		for (var order = this._drawFirst; order; order = order.next) {
	  			layer = order.layer;
	  			if (layer.options.interactive && layer._containsPoint(point)) {
	  				candidateHoveredLayer = layer;
	  			}
	  		}

	  		if (candidateHoveredLayer !== this._hoveredLayer) {
	  			this._handleMouseOut(e);

	  			if (candidateHoveredLayer) {
	  				addClass(this._container, 'leaflet-interactive'); // change cursor
	  				this._fireEvent([candidateHoveredLayer], e, 'mouseover');
	  				this._hoveredLayer = candidateHoveredLayer;
	  			}
	  		}

	  		if (this._hoveredLayer) {
	  			this._fireEvent([this._hoveredLayer], e);
	  		}

	  		this._mouseHoverThrottled = true;
	  		setTimeout(bind(function () {
	  			this._mouseHoverThrottled = false;
	  		}, this), 32);
	  	},

	  	_fireEvent: function (layers, e, type) {
	  		this._map._fireDOMEvent(e, type || e.type, layers);
	  	},

	  	_bringToFront: function (layer) {
	  		var order = layer._order;

	  		if (!order) { return; }

	  		var next = order.next;
	  		var prev = order.prev;

	  		if (next) {
	  			next.prev = prev;
	  		} else {
	  			// Already last
	  			return;
	  		}
	  		if (prev) {
	  			prev.next = next;
	  		} else if (next) {
	  			// Update first entry unless this is the
	  			// single entry
	  			this._drawFirst = next;
	  		}

	  		order.prev = this._drawLast;
	  		this._drawLast.next = order;

	  		order.next = null;
	  		this._drawLast = order;

	  		this._requestRedraw(layer);
	  	},

	  	_bringToBack: function (layer) {
	  		var order = layer._order;

	  		if (!order) { return; }

	  		var next = order.next;
	  		var prev = order.prev;

	  		if (prev) {
	  			prev.next = next;
	  		} else {
	  			// Already first
	  			return;
	  		}
	  		if (next) {
	  			next.prev = prev;
	  		} else if (prev) {
	  			// Update last entry unless this is the
	  			// single entry
	  			this._drawLast = prev;
	  		}

	  		order.prev = null;

	  		order.next = this._drawFirst;
	  		this._drawFirst.prev = order;
	  		this._drawFirst = order;

	  		this._requestRedraw(layer);
	  	}
	  });

	  // @factory L.canvas(options?: Renderer options)
	  // Creates a Canvas renderer with the given options.
	  function canvas$1(options) {
	  	return canvas ? new Canvas(options) : null;
	  }

	  /*
	   * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
	   */


	  var vmlCreate = (function () {
	  	try {
	  		document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
	  		return function (name) {
	  			return document.createElement('<lvml:' + name + ' class="lvml">');
	  		};
	  	} catch (e) {
	  		return function (name) {
	  			return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
	  		};
	  	}
	  })();


	  /*
	   * @class SVG
	   *
	   *
	   * VML was deprecated in 2012, which means VML functionality exists only for backwards compatibility
	   * with old versions of Internet Explorer.
	   */

	  // mixin to redefine some SVG methods to handle VML syntax which is similar but with some differences
	  var vmlMixin = {

	  	_initContainer: function () {
	  		this._container = create$1('div', 'leaflet-vml-container');
	  	},

	  	_update: function () {
	  		if (this._map._animatingZoom) { return; }
	  		Renderer.prototype._update.call(this);
	  		this.fire('update');
	  	},

	  	_initPath: function (layer) {
	  		var container = layer._container = vmlCreate('shape');

	  		addClass(container, 'leaflet-vml-shape ' + (this.options.className || ''));

	  		container.coordsize = '1 1';

	  		layer._path = vmlCreate('path');
	  		container.appendChild(layer._path);

	  		this._updateStyle(layer);
	  		this._layers[stamp(layer)] = layer;
	  	},

	  	_addPath: function (layer) {
	  		var container = layer._container;
	  		this._container.appendChild(container);

	  		if (layer.options.interactive) {
	  			layer.addInteractiveTarget(container);
	  		}
	  	},

	  	_removePath: function (layer) {
	  		var container = layer._container;
	  		remove(container);
	  		layer.removeInteractiveTarget(container);
	  		delete this._layers[stamp(layer)];
	  	},

	  	_updateStyle: function (layer) {
	  		var stroke = layer._stroke,
	  		    fill = layer._fill,
	  		    options = layer.options,
	  		    container = layer._container;

	  		container.stroked = !!options.stroke;
	  		container.filled = !!options.fill;

	  		if (options.stroke) {
	  			if (!stroke) {
	  				stroke = layer._stroke = vmlCreate('stroke');
	  			}
	  			container.appendChild(stroke);
	  			stroke.weight = options.weight + 'px';
	  			stroke.color = options.color;
	  			stroke.opacity = options.opacity;

	  			if (options.dashArray) {
	  				stroke.dashStyle = isArray(options.dashArray) ?
	  				    options.dashArray.join(' ') :
	  				    options.dashArray.replace(/( *, *)/g, ' ');
	  			} else {
	  				stroke.dashStyle = '';
	  			}
	  			stroke.endcap = options.lineCap.replace('butt', 'flat');
	  			stroke.joinstyle = options.lineJoin;

	  		} else if (stroke) {
	  			container.removeChild(stroke);
	  			layer._stroke = null;
	  		}

	  		if (options.fill) {
	  			if (!fill) {
	  				fill = layer._fill = vmlCreate('fill');
	  			}
	  			container.appendChild(fill);
	  			fill.color = options.fillColor || options.color;
	  			fill.opacity = options.fillOpacity;

	  		} else if (fill) {
	  			container.removeChild(fill);
	  			layer._fill = null;
	  		}
	  	},

	  	_updateCircle: function (layer) {
	  		var p = layer._point.round(),
	  		    r = Math.round(layer._radius),
	  		    r2 = Math.round(layer._radiusY || r);

	  		this._setPath(layer, layer._empty() ? 'M0 0' :
	  			'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r2 + ' 0,' + (65535 * 360));
	  	},

	  	_setPath: function (layer, path) {
	  		layer._path.v = path;
	  	},

	  	_bringToFront: function (layer) {
	  		toFront(layer._container);
	  	},

	  	_bringToBack: function (layer) {
	  		toBack(layer._container);
	  	}
	  };

	  var create$2 = vml ? vmlCreate : svgCreate;

	  /*
	   * @class SVG
	   * @inherits Renderer
	   * @aka L.SVG
	   *
	   * Allows vector layers to be displayed with [SVG](https://developer.mozilla.org/docs/Web/SVG).
	   * Inherits `Renderer`.
	   *
	   * Due to [technical limitations](http://caniuse.com/#search=svg), SVG is not
	   * available in all web browsers, notably Android 2.x and 3.x.
	   *
	   * Although SVG is not available on IE7 and IE8, these browsers support
	   * [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language)
	   * (a now deprecated technology), and the SVG renderer will fall back to VML in
	   * this case.
	   *
	   * @example
	   *
	   * Use SVG by default for all paths in the map:
	   *
	   * ```js
	   * var map = L.map('map', {
	   * 	renderer: L.svg()
	   * });
	   * ```
	   *
	   * Use a SVG renderer with extra padding for specific vector geometries:
	   *
	   * ```js
	   * var map = L.map('map');
	   * var myRenderer = L.svg({ padding: 0.5 });
	   * var line = L.polyline( coordinates, { renderer: myRenderer } );
	   * var circle = L.circle( center, { renderer: myRenderer } );
	   * ```
	   */

	  var SVG = Renderer.extend({

	  	getEvents: function () {
	  		var events = Renderer.prototype.getEvents.call(this);
	  		events.zoomstart = this._onZoomStart;
	  		return events;
	  	},

	  	_initContainer: function () {
	  		this._container = create$2('svg');

	  		// makes it possible to click through svg root; we'll reset it back in individual paths
	  		this._container.setAttribute('pointer-events', 'none');

	  		this._rootGroup = create$2('g');
	  		this._container.appendChild(this._rootGroup);
	  	},

	  	_destroyContainer: function () {
	  		remove(this._container);
	  		off(this._container);
	  		delete this._container;
	  		delete this._rootGroup;
	  		delete this._svgSize;
	  	},

	  	_onZoomStart: function () {
	  		// Drag-then-pinch interactions might mess up the center and zoom.
	  		// In this case, the easiest way to prevent this is re-do the renderer
	  		//   bounds and padding when the zooming starts.
	  		this._update();
	  	},

	  	_update: function () {
	  		if (this._map._animatingZoom && this._bounds) { return; }

	  		Renderer.prototype._update.call(this);

	  		var b = this._bounds,
	  		    size = b.getSize(),
	  		    container = this._container;

	  		// set size of svg-container if changed
	  		if (!this._svgSize || !this._svgSize.equals(size)) {
	  			this._svgSize = size;
	  			container.setAttribute('width', size.x);
	  			container.setAttribute('height', size.y);
	  		}

	  		// movement: update container viewBox so that we don't have to change coordinates of individual layers
	  		setPosition(container, b.min);
	  		container.setAttribute('viewBox', [b.min.x, b.min.y, size.x, size.y].join(' '));

	  		this.fire('update');
	  	},

	  	// methods below are called by vector layers implementations

	  	_initPath: function (layer) {
	  		var path = layer._path = create$2('path');

	  		// @namespace Path
	  		// @option className: String = null
	  		// Custom class name set on an element. Only for SVG renderer.
	  		if (layer.options.className) {
	  			addClass(path, layer.options.className);
	  		}

	  		if (layer.options.interactive) {
	  			addClass(path, 'leaflet-interactive');
	  		}

	  		this._updateStyle(layer);
	  		this._layers[stamp(layer)] = layer;
	  	},

	  	_addPath: function (layer) {
	  		if (!this._rootGroup) { this._initContainer(); }
	  		this._rootGroup.appendChild(layer._path);
	  		layer.addInteractiveTarget(layer._path);
	  	},

	  	_removePath: function (layer) {
	  		remove(layer._path);
	  		layer.removeInteractiveTarget(layer._path);
	  		delete this._layers[stamp(layer)];
	  	},

	  	_updatePath: function (layer) {
	  		layer._project();
	  		layer._update();
	  	},

	  	_updateStyle: function (layer) {
	  		var path = layer._path,
	  		    options = layer.options;

	  		if (!path) { return; }

	  		if (options.stroke) {
	  			path.setAttribute('stroke', options.color);
	  			path.setAttribute('stroke-opacity', options.opacity);
	  			path.setAttribute('stroke-width', options.weight);
	  			path.setAttribute('stroke-linecap', options.lineCap);
	  			path.setAttribute('stroke-linejoin', options.lineJoin);

	  			if (options.dashArray) {
	  				path.setAttribute('stroke-dasharray', options.dashArray);
	  			} else {
	  				path.removeAttribute('stroke-dasharray');
	  			}

	  			if (options.dashOffset) {
	  				path.setAttribute('stroke-dashoffset', options.dashOffset);
	  			} else {
	  				path.removeAttribute('stroke-dashoffset');
	  			}
	  		} else {
	  			path.setAttribute('stroke', 'none');
	  		}

	  		if (options.fill) {
	  			path.setAttribute('fill', options.fillColor || options.color);
	  			path.setAttribute('fill-opacity', options.fillOpacity);
	  			path.setAttribute('fill-rule', options.fillRule || 'evenodd');
	  		} else {
	  			path.setAttribute('fill', 'none');
	  		}
	  	},

	  	_updatePoly: function (layer, closed) {
	  		this._setPath(layer, pointsToPath(layer._parts, closed));
	  	},

	  	_updateCircle: function (layer) {
	  		var p = layer._point,
	  		    r = Math.max(Math.round(layer._radius), 1),
	  		    r2 = Math.max(Math.round(layer._radiusY), 1) || r,
	  		    arc = 'a' + r + ',' + r2 + ' 0 1,0 ';

	  		// drawing a circle with two half-arcs
	  		var d = layer._empty() ? 'M0 0' :
	  			'M' + (p.x - r) + ',' + p.y +
	  			arc + (r * 2) + ',0 ' +
	  			arc + (-r * 2) + ',0 ';

	  		this._setPath(layer, d);
	  	},

	  	_setPath: function (layer, path) {
	  		layer._path.setAttribute('d', path);
	  	},

	  	// SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
	  	_bringToFront: function (layer) {
	  		toFront(layer._path);
	  	},

	  	_bringToBack: function (layer) {
	  		toBack(layer._path);
	  	}
	  });

	  if (vml) {
	  	SVG.include(vmlMixin);
	  }

	  // @namespace SVG
	  // @factory L.svg(options?: Renderer options)
	  // Creates a SVG renderer with the given options.
	  function svg$1(options) {
	  	return svg || vml ? new SVG(options) : null;
	  }

	  Map.include({
	  	// @namespace Map; @method getRenderer(layer: Path): Renderer
	  	// Returns the instance of `Renderer` that should be used to render the given
	  	// `Path`. It will ensure that the `renderer` options of the map and paths
	  	// are respected, and that the renderers do exist on the map.
	  	getRenderer: function (layer) {
	  		// @namespace Path; @option renderer: Renderer
	  		// Use this specific instance of `Renderer` for this path. Takes
	  		// precedence over the map's [default renderer](#map-renderer).
	  		var renderer = layer.options.renderer || this._getPaneRenderer(layer.options.pane) || this.options.renderer || this._renderer;

	  		if (!renderer) {
	  			renderer = this._renderer = this._createRenderer();
	  		}

	  		if (!this.hasLayer(renderer)) {
	  			this.addLayer(renderer);
	  		}
	  		return renderer;
	  	},

	  	_getPaneRenderer: function (name) {
	  		if (name === 'overlayPane' || name === undefined) {
	  			return false;
	  		}

	  		var renderer = this._paneRenderers[name];
	  		if (renderer === undefined) {
	  			renderer = this._createRenderer({pane: name});
	  			this._paneRenderers[name] = renderer;
	  		}
	  		return renderer;
	  	},

	  	_createRenderer: function (options) {
	  		// @namespace Map; @option preferCanvas: Boolean = false
	  		// Whether `Path`s should be rendered on a `Canvas` renderer.
	  		// By default, all `Path`s are rendered in a `SVG` renderer.
	  		return (this.options.preferCanvas && canvas$1(options)) || svg$1(options);
	  	}
	  });

	  /*
	   * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
	   */

	  /*
	   * @class Rectangle
	   * @aka L.Rectangle
	   * @inherits Polygon
	   *
	   * A class for drawing rectangle overlays on a map. Extends `Polygon`.
	   *
	   * @example
	   *
	   * ```js
	   * // define rectangle geographical bounds
	   * var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
	   *
	   * // create an orange rectangle
	   * L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
	   *
	   * // zoom the map to the rectangle bounds
	   * map.fitBounds(bounds);
	   * ```
	   *
	   */


	  var Rectangle = Polygon.extend({
	  	initialize: function (latLngBounds, options) {
	  		Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
	  	},

	  	// @method setBounds(latLngBounds: LatLngBounds): this
	  	// Redraws the rectangle with the passed bounds.
	  	setBounds: function (latLngBounds) {
	  		return this.setLatLngs(this._boundsToLatLngs(latLngBounds));
	  	},

	  	_boundsToLatLngs: function (latLngBounds) {
	  		latLngBounds = toLatLngBounds(latLngBounds);
	  		return [
	  			latLngBounds.getSouthWest(),
	  			latLngBounds.getNorthWest(),
	  			latLngBounds.getNorthEast(),
	  			latLngBounds.getSouthEast()
	  		];
	  	}
	  });


	  // @factory L.rectangle(latLngBounds: LatLngBounds, options?: Polyline options)
	  function rectangle(latLngBounds, options) {
	  	return new Rectangle(latLngBounds, options);
	  }

	  SVG.create = create$2;
	  SVG.pointsToPath = pointsToPath;

	  GeoJSON.geometryToLayer = geometryToLayer;
	  GeoJSON.coordsToLatLng = coordsToLatLng;
	  GeoJSON.coordsToLatLngs = coordsToLatLngs;
	  GeoJSON.latLngToCoords = latLngToCoords;
	  GeoJSON.latLngsToCoords = latLngsToCoords;
	  GeoJSON.getFeature = getFeature;
	  GeoJSON.asFeature = asFeature;

	  /*
	   * L.Handler.BoxZoom is used to add shift-drag zoom interaction to the map
	   * (zoom to a selected bounding box), enabled by default.
	   */

	  // @namespace Map
	  // @section Interaction Options
	  Map.mergeOptions({
	  	// @option boxZoom: Boolean = true
	  	// Whether the map can be zoomed to a rectangular area specified by
	  	// dragging the mouse while pressing the shift key.
	  	boxZoom: true
	  });

	  var BoxZoom = Handler.extend({
	  	initialize: function (map) {
	  		this._map = map;
	  		this._container = map._container;
	  		this._pane = map._panes.overlayPane;
	  		this._resetStateTimeout = 0;
	  		map.on('unload', this._destroy, this);
	  	},

	  	addHooks: function () {
	  		on(this._container, 'mousedown', this._onMouseDown, this);
	  	},

	  	removeHooks: function () {
	  		off(this._container, 'mousedown', this._onMouseDown, this);
	  	},

	  	moved: function () {
	  		return this._moved;
	  	},

	  	_destroy: function () {
	  		remove(this._pane);
	  		delete this._pane;
	  	},

	  	_resetState: function () {
	  		this._resetStateTimeout = 0;
	  		this._moved = false;
	  	},

	  	_clearDeferredResetState: function () {
	  		if (this._resetStateTimeout !== 0) {
	  			clearTimeout(this._resetStateTimeout);
	  			this._resetStateTimeout = 0;
	  		}
	  	},

	  	_onMouseDown: function (e) {
	  		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

	  		// Clear the deferred resetState if it hasn't executed yet, otherwise it
	  		// will interrupt the interaction and orphan a box element in the container.
	  		this._clearDeferredResetState();
	  		this._resetState();

	  		disableTextSelection();
	  		disableImageDrag();

	  		this._startPoint = this._map.mouseEventToContainerPoint(e);

	  		on(document, {
	  			contextmenu: stop,
	  			mousemove: this._onMouseMove,
	  			mouseup: this._onMouseUp,
	  			keydown: this._onKeyDown
	  		}, this);
	  	},

	  	_onMouseMove: function (e) {
	  		if (!this._moved) {
	  			this._moved = true;

	  			this._box = create$1('div', 'leaflet-zoom-box', this._container);
	  			addClass(this._container, 'leaflet-crosshair');

	  			this._map.fire('boxzoomstart');
	  		}

	  		this._point = this._map.mouseEventToContainerPoint(e);

	  		var bounds = new Bounds(this._point, this._startPoint),
	  		    size = bounds.getSize();

	  		setPosition(this._box, bounds.min);

	  		this._box.style.width  = size.x + 'px';
	  		this._box.style.height = size.y + 'px';
	  	},

	  	_finish: function () {
	  		if (this._moved) {
	  			remove(this._box);
	  			removeClass(this._container, 'leaflet-crosshair');
	  		}

	  		enableTextSelection();
	  		enableImageDrag();

	  		off(document, {
	  			contextmenu: stop,
	  			mousemove: this._onMouseMove,
	  			mouseup: this._onMouseUp,
	  			keydown: this._onKeyDown
	  		}, this);
	  	},

	  	_onMouseUp: function (e) {
	  		if ((e.which !== 1) && (e.button !== 1)) { return; }

	  		this._finish();

	  		if (!this._moved) { return; }
	  		// Postpone to next JS tick so internal click event handling
	  		// still see it as "moved".
	  		this._clearDeferredResetState();
	  		this._resetStateTimeout = setTimeout(bind(this._resetState, this), 0);

	  		var bounds = new LatLngBounds(
	  		        this._map.containerPointToLatLng(this._startPoint),
	  		        this._map.containerPointToLatLng(this._point));

	  		this._map
	  			.fitBounds(bounds)
	  			.fire('boxzoomend', {boxZoomBounds: bounds});
	  	},

	  	_onKeyDown: function (e) {
	  		if (e.keyCode === 27) {
	  			this._finish();
	  		}
	  	}
	  });

	  // @section Handlers
	  // @property boxZoom: Handler
	  // Box (shift-drag with mouse) zoom handler.
	  Map.addInitHook('addHandler', 'boxZoom', BoxZoom);

	  /*
	   * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
	   */

	  // @namespace Map
	  // @section Interaction Options

	  Map.mergeOptions({
	  	// @option doubleClickZoom: Boolean|String = true
	  	// Whether the map can be zoomed in by double clicking on it and
	  	// zoomed out by double clicking while holding shift. If passed
	  	// `'center'`, double-click zoom will zoom to the center of the
	  	//  view regardless of where the mouse was.
	  	doubleClickZoom: true
	  });

	  var DoubleClickZoom = Handler.extend({
	  	addHooks: function () {
	  		this._map.on('dblclick', this._onDoubleClick, this);
	  	},

	  	removeHooks: function () {
	  		this._map.off('dblclick', this._onDoubleClick, this);
	  	},

	  	_onDoubleClick: function (e) {
	  		var map = this._map,
	  		    oldZoom = map.getZoom(),
	  		    delta = map.options.zoomDelta,
	  		    zoom = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;

	  		if (map.options.doubleClickZoom === 'center') {
	  			map.setZoom(zoom);
	  		} else {
	  			map.setZoomAround(e.containerPoint, zoom);
	  		}
	  	}
	  });

	  // @section Handlers
	  //
	  // Map properties include interaction handlers that allow you to control
	  // interaction behavior in runtime, enabling or disabling certain features such
	  // as dragging or touch zoom (see `Handler` methods). For example:
	  //
	  // ```js
	  // map.doubleClickZoom.disable();
	  // ```
	  //
	  // @property doubleClickZoom: Handler
	  // Double click zoom handler.
	  Map.addInitHook('addHandler', 'doubleClickZoom', DoubleClickZoom);

	  /*
	   * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
	   */

	  // @namespace Map
	  // @section Interaction Options
	  Map.mergeOptions({
	  	// @option dragging: Boolean = true
	  	// Whether the map be draggable with mouse/touch or not.
	  	dragging: true,

	  	// @section Panning Inertia Options
	  	// @option inertia: Boolean = *
	  	// If enabled, panning of the map will have an inertia effect where
	  	// the map builds momentum while dragging and continues moving in
	  	// the same direction for some time. Feels especially nice on touch
	  	// devices. Enabled by default unless running on old Android devices.
	  	inertia: !android23,

	  	// @option inertiaDeceleration: Number = 3000
	  	// The rate with which the inertial movement slows down, in pixels/second².
	  	inertiaDeceleration: 3400, // px/s^2

	  	// @option inertiaMaxSpeed: Number = Infinity
	  	// Max speed of the inertial movement, in pixels/second.
	  	inertiaMaxSpeed: Infinity, // px/s

	  	// @option easeLinearity: Number = 0.2
	  	easeLinearity: 0.2,

	  	// TODO refactor, move to CRS
	  	// @option worldCopyJump: Boolean = false
	  	// With this option enabled, the map tracks when you pan to another "copy"
	  	// of the world and seamlessly jumps to the original one so that all overlays
	  	// like markers and vector layers are still visible.
	  	worldCopyJump: false,

	  	// @option maxBoundsViscosity: Number = 0.0
	  	// If `maxBounds` is set, this option will control how solid the bounds
	  	// are when dragging the map around. The default value of `0.0` allows the
	  	// user to drag outside the bounds at normal speed, higher values will
	  	// slow down map dragging outside bounds, and `1.0` makes the bounds fully
	  	// solid, preventing the user from dragging outside the bounds.
	  	maxBoundsViscosity: 0.0
	  });

	  var Drag = Handler.extend({
	  	addHooks: function () {
	  		if (!this._draggable) {
	  			var map = this._map;

	  			this._draggable = new Draggable(map._mapPane, map._container);

	  			this._draggable.on({
	  				dragstart: this._onDragStart,
	  				drag: this._onDrag,
	  				dragend: this._onDragEnd
	  			}, this);

	  			this._draggable.on('predrag', this._onPreDragLimit, this);
	  			if (map.options.worldCopyJump) {
	  				this._draggable.on('predrag', this._onPreDragWrap, this);
	  				map.on('zoomend', this._onZoomEnd, this);

	  				map.whenReady(this._onZoomEnd, this);
	  			}
	  		}
	  		addClass(this._map._container, 'leaflet-grab leaflet-touch-drag');
	  		this._draggable.enable();
	  		this._positions = [];
	  		this._times = [];
	  	},

	  	removeHooks: function () {
	  		removeClass(this._map._container, 'leaflet-grab');
	  		removeClass(this._map._container, 'leaflet-touch-drag');
	  		this._draggable.disable();
	  	},

	  	moved: function () {
	  		return this._draggable && this._draggable._moved;
	  	},

	  	moving: function () {
	  		return this._draggable && this._draggable._moving;
	  	},

	  	_onDragStart: function () {
	  		var map = this._map;

	  		map._stop();
	  		if (this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
	  			var bounds = toLatLngBounds(this._map.options.maxBounds);

	  			this._offsetLimit = toBounds(
	  				this._map.latLngToContainerPoint(bounds.getNorthWest()).multiplyBy(-1),
	  				this._map.latLngToContainerPoint(bounds.getSouthEast()).multiplyBy(-1)
	  					.add(this._map.getSize()));

	  			this._viscosity = Math.min(1.0, Math.max(0.0, this._map.options.maxBoundsViscosity));
	  		} else {
	  			this._offsetLimit = null;
	  		}

	  		map
	  		    .fire('movestart')
	  		    .fire('dragstart');

	  		if (map.options.inertia) {
	  			this._positions = [];
	  			this._times = [];
	  		}
	  	},

	  	_onDrag: function (e) {
	  		if (this._map.options.inertia) {
	  			var time = this._lastTime = +new Date(),
	  			    pos = this._lastPos = this._draggable._absPos || this._draggable._newPos;

	  			this._positions.push(pos);
	  			this._times.push(time);

	  			this._prunePositions(time);
	  		}

	  		this._map
	  		    .fire('move', e)
	  		    .fire('drag', e);
	  	},

	  	_prunePositions: function (time) {
	  		while (this._positions.length > 1 && time - this._times[0] > 50) {
	  			this._positions.shift();
	  			this._times.shift();
	  		}
	  	},

	  	_onZoomEnd: function () {
	  		var pxCenter = this._map.getSize().divideBy(2),
	  		    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

	  		this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
	  		this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
	  	},

	  	_viscousLimit: function (value, threshold) {
	  		return value - (value - threshold) * this._viscosity;
	  	},

	  	_onPreDragLimit: function () {
	  		if (!this._viscosity || !this._offsetLimit) { return; }

	  		var offset = this._draggable._newPos.subtract(this._draggable._startPos);

	  		var limit = this._offsetLimit;
	  		if (offset.x < limit.min.x) { offset.x = this._viscousLimit(offset.x, limit.min.x); }
	  		if (offset.y < limit.min.y) { offset.y = this._viscousLimit(offset.y, limit.min.y); }
	  		if (offset.x > limit.max.x) { offset.x = this._viscousLimit(offset.x, limit.max.x); }
	  		if (offset.y > limit.max.y) { offset.y = this._viscousLimit(offset.y, limit.max.y); }

	  		this._draggable._newPos = this._draggable._startPos.add(offset);
	  	},

	  	_onPreDragWrap: function () {
	  		// TODO refactor to be able to adjust map pane position after zoom
	  		var worldWidth = this._worldWidth,
	  		    halfWidth = Math.round(worldWidth / 2),
	  		    dx = this._initialWorldOffset,
	  		    x = this._draggable._newPos.x,
	  		    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
	  		    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
	  		    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

	  		this._draggable._absPos = this._draggable._newPos.clone();
	  		this._draggable._newPos.x = newX;
	  	},

	  	_onDragEnd: function (e) {
	  		var map = this._map,
	  		    options = map.options,

	  		    noInertia = !options.inertia || this._times.length < 2;

	  		map.fire('dragend', e);

	  		if (noInertia) {
	  			map.fire('moveend');

	  		} else {
	  			this._prunePositions(+new Date());

	  			var direction = this._lastPos.subtract(this._positions[0]),
	  			    duration = (this._lastTime - this._times[0]) / 1000,
	  			    ease = options.easeLinearity,

	  			    speedVector = direction.multiplyBy(ease / duration),
	  			    speed = speedVector.distanceTo([0, 0]),

	  			    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
	  			    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

	  			    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
	  			    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

	  			if (!offset.x && !offset.y) {
	  				map.fire('moveend');

	  			} else {
	  				offset = map._limitOffset(offset, map.options.maxBounds);

	  				requestAnimFrame(function () {
	  					map.panBy(offset, {
	  						duration: decelerationDuration,
	  						easeLinearity: ease,
	  						noMoveStart: true,
	  						animate: true
	  					});
	  				});
	  			}
	  		}
	  	}
	  });

	  // @section Handlers
	  // @property dragging: Handler
	  // Map dragging handler (by both mouse and touch).
	  Map.addInitHook('addHandler', 'dragging', Drag);

	  /*
	   * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
	   */

	  // @namespace Map
	  // @section Keyboard Navigation Options
	  Map.mergeOptions({
	  	// @option keyboard: Boolean = true
	  	// Makes the map focusable and allows users to navigate the map with keyboard
	  	// arrows and `+`/`-` keys.
	  	keyboard: true,

	  	// @option keyboardPanDelta: Number = 80
	  	// Amount of pixels to pan when pressing an arrow key.
	  	keyboardPanDelta: 80
	  });

	  var Keyboard = Handler.extend({

	  	keyCodes: {
	  		left:    [37],
	  		right:   [39],
	  		down:    [40],
	  		up:      [38],
	  		zoomIn:  [187, 107, 61, 171],
	  		zoomOut: [189, 109, 54, 173]
	  	},

	  	initialize: function (map) {
	  		this._map = map;

	  		this._setPanDelta(map.options.keyboardPanDelta);
	  		this._setZoomDelta(map.options.zoomDelta);
	  	},

	  	addHooks: function () {
	  		var container = this._map._container;

	  		// make the container focusable by tabbing
	  		if (container.tabIndex <= 0) {
	  			container.tabIndex = '0';
	  		}

	  		on(container, {
	  			focus: this._onFocus,
	  			blur: this._onBlur,
	  			mousedown: this._onMouseDown
	  		}, this);

	  		this._map.on({
	  			focus: this._addHooks,
	  			blur: this._removeHooks
	  		}, this);
	  	},

	  	removeHooks: function () {
	  		this._removeHooks();

	  		off(this._map._container, {
	  			focus: this._onFocus,
	  			blur: this._onBlur,
	  			mousedown: this._onMouseDown
	  		}, this);

	  		this._map.off({
	  			focus: this._addHooks,
	  			blur: this._removeHooks
	  		}, this);
	  	},

	  	_onMouseDown: function () {
	  		if (this._focused) { return; }

	  		var body = document.body,
	  		    docEl = document.documentElement,
	  		    top = body.scrollTop || docEl.scrollTop,
	  		    left = body.scrollLeft || docEl.scrollLeft;

	  		this._map._container.focus();

	  		window.scrollTo(left, top);
	  	},

	  	_onFocus: function () {
	  		this._focused = true;
	  		this._map.fire('focus');
	  	},

	  	_onBlur: function () {
	  		this._focused = false;
	  		this._map.fire('blur');
	  	},

	  	_setPanDelta: function (panDelta) {
	  		var keys = this._panKeys = {},
	  		    codes = this.keyCodes,
	  		    i, len;

	  		for (i = 0, len = codes.left.length; i < len; i++) {
	  			keys[codes.left[i]] = [-1 * panDelta, 0];
	  		}
	  		for (i = 0, len = codes.right.length; i < len; i++) {
	  			keys[codes.right[i]] = [panDelta, 0];
	  		}
	  		for (i = 0, len = codes.down.length; i < len; i++) {
	  			keys[codes.down[i]] = [0, panDelta];
	  		}
	  		for (i = 0, len = codes.up.length; i < len; i++) {
	  			keys[codes.up[i]] = [0, -1 * panDelta];
	  		}
	  	},

	  	_setZoomDelta: function (zoomDelta) {
	  		var keys = this._zoomKeys = {},
	  		    codes = this.keyCodes,
	  		    i, len;

	  		for (i = 0, len = codes.zoomIn.length; i < len; i++) {
	  			keys[codes.zoomIn[i]] = zoomDelta;
	  		}
	  		for (i = 0, len = codes.zoomOut.length; i < len; i++) {
	  			keys[codes.zoomOut[i]] = -zoomDelta;
	  		}
	  	},

	  	_addHooks: function () {
	  		on(document, 'keydown', this._onKeyDown, this);
	  	},

	  	_removeHooks: function () {
	  		off(document, 'keydown', this._onKeyDown, this);
	  	},

	  	_onKeyDown: function (e) {
	  		if (e.altKey || e.ctrlKey || e.metaKey) { return; }

	  		var key = e.keyCode,
	  		    map = this._map,
	  		    offset;

	  		if (key in this._panKeys) {
	  			if (!map._panAnim || !map._panAnim._inProgress) {
	  				offset = this._panKeys[key];
	  				if (e.shiftKey) {
	  					offset = toPoint(offset).multiplyBy(3);
	  				}

	  				map.panBy(offset);

	  				if (map.options.maxBounds) {
	  					map.panInsideBounds(map.options.maxBounds);
	  				}
	  			}
	  		} else if (key in this._zoomKeys) {
	  			map.setZoom(map.getZoom() + (e.shiftKey ? 3 : 1) * this._zoomKeys[key]);

	  		} else if (key === 27 && map._popup && map._popup.options.closeOnEscapeKey) {
	  			map.closePopup();

	  		} else {
	  			return;
	  		}

	  		stop(e);
	  	}
	  });

	  // @section Handlers
	  // @section Handlers
	  // @property keyboard: Handler
	  // Keyboard navigation handler.
	  Map.addInitHook('addHandler', 'keyboard', Keyboard);

	  /*
	   * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
	   */

	  // @namespace Map
	  // @section Interaction Options
	  Map.mergeOptions({
	  	// @section Mouse wheel options
	  	// @option scrollWheelZoom: Boolean|String = true
	  	// Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
	  	// it will zoom to the center of the view regardless of where the mouse was.
	  	scrollWheelZoom: true,

	  	// @option wheelDebounceTime: Number = 40
	  	// Limits the rate at which a wheel can fire (in milliseconds). By default
	  	// user can't zoom via wheel more often than once per 40 ms.
	  	wheelDebounceTime: 40,

	  	// @option wheelPxPerZoomLevel: Number = 60
	  	// How many scroll pixels (as reported by [L.DomEvent.getWheelDelta](#domevent-getwheeldelta))
	  	// mean a change of one full zoom level. Smaller values will make wheel-zooming
	  	// faster (and vice versa).
	  	wheelPxPerZoomLevel: 60
	  });

	  var ScrollWheelZoom = Handler.extend({
	  	addHooks: function () {
	  		on(this._map._container, 'wheel', this._onWheelScroll, this);

	  		this._delta = 0;
	  	},

	  	removeHooks: function () {
	  		off(this._map._container, 'wheel', this._onWheelScroll, this);
	  	},

	  	_onWheelScroll: function (e) {
	  		var delta = getWheelDelta(e);

	  		var debounce = this._map.options.wheelDebounceTime;

	  		this._delta += delta;
	  		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

	  		if (!this._startTime) {
	  			this._startTime = +new Date();
	  		}

	  		var left = Math.max(debounce - (+new Date() - this._startTime), 0);

	  		clearTimeout(this._timer);
	  		this._timer = setTimeout(bind(this._performZoom, this), left);

	  		stop(e);
	  	},

	  	_performZoom: function () {
	  		var map = this._map,
	  		    zoom = map.getZoom(),
	  		    snap = this._map.options.zoomSnap || 0;

	  		map._stop(); // stop panning and fly animations if any

	  		// map the delta with a sigmoid function to -4..4 range leaning on -1..1
	  		var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4),
	  		    d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
	  		    d4 = snap ? Math.ceil(d3 / snap) * snap : d3,
	  		    delta = map._limitZoom(zoom + (this._delta > 0 ? d4 : -d4)) - zoom;

	  		this._delta = 0;
	  		this._startTime = null;

	  		if (!delta) { return; }

	  		if (map.options.scrollWheelZoom === 'center') {
	  			map.setZoom(zoom + delta);
	  		} else {
	  			map.setZoomAround(this._lastMousePos, zoom + delta);
	  		}
	  	}
	  });

	  // @section Handlers
	  // @property scrollWheelZoom: Handler
	  // Scroll wheel zoom handler.
	  Map.addInitHook('addHandler', 'scrollWheelZoom', ScrollWheelZoom);

	  /*
	   * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
	   */

	  // @namespace Map
	  // @section Interaction Options
	  Map.mergeOptions({
	  	// @section Touch interaction options
	  	// @option tap: Boolean = true
	  	// Enables mobile hacks for supporting instant taps (fixing 200ms click
	  	// delay on iOS/Android) and touch holds (fired as `contextmenu` events).
	  	tap: true,

	  	// @option tapTolerance: Number = 15
	  	// The max number of pixels a user can shift his finger during touch
	  	// for it to be considered a valid tap.
	  	tapTolerance: 15
	  });

	  var Tap = Handler.extend({
	  	addHooks: function () {
	  		on(this._map._container, 'touchstart', this._onDown, this);
	  	},

	  	removeHooks: function () {
	  		off(this._map._container, 'touchstart', this._onDown, this);
	  	},

	  	_onDown: function (e) {
	  		if (!e.touches) { return; }

	  		preventDefault(e);

	  		this._fireClick = true;

	  		// don't simulate click or track longpress if more than 1 touch
	  		if (e.touches.length > 1) {
	  			this._fireClick = false;
	  			clearTimeout(this._holdTimeout);
	  			return;
	  		}

	  		var first = e.touches[0],
	  		    el = first.target;

	  		this._startPos = this._newPos = new Point(first.clientX, first.clientY);

	  		// if touching a link, highlight it
	  		if (el.tagName && el.tagName.toLowerCase() === 'a') {
	  			addClass(el, 'leaflet-active');
	  		}

	  		// simulate long hold but setting a timeout
	  		this._holdTimeout = setTimeout(bind(function () {
	  			if (this._isTapValid()) {
	  				this._fireClick = false;
	  				this._onUp();
	  				this._simulateEvent('contextmenu', first);
	  			}
	  		}, this), 1000);

	  		this._simulateEvent('mousedown', first);

	  		on(document, {
	  			touchmove: this._onMove,
	  			touchend: this._onUp
	  		}, this);
	  	},

	  	_onUp: function (e) {
	  		clearTimeout(this._holdTimeout);

	  		off(document, {
	  			touchmove: this._onMove,
	  			touchend: this._onUp
	  		}, this);

	  		if (this._fireClick && e && e.changedTouches) {

	  			var first = e.changedTouches[0],
	  			    el = first.target;

	  			if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
	  				removeClass(el, 'leaflet-active');
	  			}

	  			this._simulateEvent('mouseup', first);

	  			// simulate click if the touch didn't move too much
	  			if (this._isTapValid()) {
	  				this._simulateEvent('click', first);
	  			}
	  		}
	  	},

	  	_isTapValid: function () {
	  		return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
	  	},

	  	_onMove: function (e) {
	  		var first = e.touches[0];
	  		this._newPos = new Point(first.clientX, first.clientY);
	  		this._simulateEvent('mousemove', first);
	  	},

	  	_simulateEvent: function (type, e) {
	  		var simulatedEvent = document.createEvent('MouseEvents');

	  		simulatedEvent._simulated = true;
	  		e.target._simulatedClick = true;

	  		simulatedEvent.initMouseEvent(
	  		        type, true, true, window, 1,
	  		        e.screenX, e.screenY,
	  		        e.clientX, e.clientY,
	  		        false, false, false, false, 0, null);

	  		e.target.dispatchEvent(simulatedEvent);
	  	}
	  });

	  // @section Handlers
	  // @property tap: Handler
	  // Mobile touch hacks (quick tap and touch hold) handler.
	  if (touch && (!pointer || safari)) {
	  	Map.addInitHook('addHandler', 'tap', Tap);
	  }

	  /*
	   * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
	   */

	  // @namespace Map
	  // @section Interaction Options
	  Map.mergeOptions({
	  	// @section Touch interaction options
	  	// @option touchZoom: Boolean|String = *
	  	// Whether the map can be zoomed by touch-dragging with two fingers. If
	  	// passed `'center'`, it will zoom to the center of the view regardless of
	  	// where the touch events (fingers) were. Enabled for touch-capable web
	  	// browsers except for old Androids.
	  	touchZoom: touch && !android23,

	  	// @option bounceAtZoomLimits: Boolean = true
	  	// Set it to false if you don't want the map to zoom beyond min/max zoom
	  	// and then bounce back when pinch-zooming.
	  	bounceAtZoomLimits: true
	  });

	  var TouchZoom = Handler.extend({
	  	addHooks: function () {
	  		addClass(this._map._container, 'leaflet-touch-zoom');
	  		on(this._map._container, 'touchstart', this._onTouchStart, this);
	  	},

	  	removeHooks: function () {
	  		removeClass(this._map._container, 'leaflet-touch-zoom');
	  		off(this._map._container, 'touchstart', this._onTouchStart, this);
	  	},

	  	_onTouchStart: function (e) {
	  		var map = this._map;
	  		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

	  		var p1 = map.mouseEventToContainerPoint(e.touches[0]),
	  		    p2 = map.mouseEventToContainerPoint(e.touches[1]);

	  		this._centerPoint = map.getSize()._divideBy(2);
	  		this._startLatLng = map.containerPointToLatLng(this._centerPoint);
	  		if (map.options.touchZoom !== 'center') {
	  			this._pinchStartLatLng = map.containerPointToLatLng(p1.add(p2)._divideBy(2));
	  		}

	  		this._startDist = p1.distanceTo(p2);
	  		this._startZoom = map.getZoom();

	  		this._moved = false;
	  		this._zooming = true;

	  		map._stop();

	  		on(document, 'touchmove', this._onTouchMove, this);
	  		on(document, 'touchend', this._onTouchEnd, this);

	  		preventDefault(e);
	  	},

	  	_onTouchMove: function (e) {
	  		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

	  		var map = this._map,
	  		    p1 = map.mouseEventToContainerPoint(e.touches[0]),
	  		    p2 = map.mouseEventToContainerPoint(e.touches[1]),
	  		    scale = p1.distanceTo(p2) / this._startDist;

	  		this._zoom = map.getScaleZoom(scale, this._startZoom);

	  		if (!map.options.bounceAtZoomLimits && (
	  			(this._zoom < map.getMinZoom() && scale < 1) ||
	  			(this._zoom > map.getMaxZoom() && scale > 1))) {
	  			this._zoom = map._limitZoom(this._zoom);
	  		}

	  		if (map.options.touchZoom === 'center') {
	  			this._center = this._startLatLng;
	  			if (scale === 1) { return; }
	  		} else {
	  			// Get delta from pinch to center, so centerLatLng is delta applied to initial pinchLatLng
	  			var delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
	  			if (scale === 1 && delta.x === 0 && delta.y === 0) { return; }
	  			this._center = map.unproject(map.project(this._pinchStartLatLng, this._zoom).subtract(delta), this._zoom);
	  		}

	  		if (!this._moved) {
	  			map._moveStart(true, false);
	  			this._moved = true;
	  		}

	  		cancelAnimFrame(this._animRequest);

	  		var moveFn = bind(map._move, map, this._center, this._zoom, {pinch: true, round: false});
	  		this._animRequest = requestAnimFrame(moveFn, this, true);

	  		preventDefault(e);
	  	},

	  	_onTouchEnd: function () {
	  		if (!this._moved || !this._zooming) {
	  			this._zooming = false;
	  			return;
	  		}

	  		this._zooming = false;
	  		cancelAnimFrame(this._animRequest);

	  		off(document, 'touchmove', this._onTouchMove, this);
	  		off(document, 'touchend', this._onTouchEnd, this);

	  		// Pinch updates GridLayers' levels only when zoomSnap is off, so zoomSnap becomes noUpdate.
	  		if (this._map.options.zoomAnimation) {
	  			this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
	  		} else {
	  			this._map._resetView(this._center, this._map._limitZoom(this._zoom));
	  		}
	  	}
	  });

	  // @section Handlers
	  // @property touchZoom: Handler
	  // Touch zoom handler.
	  Map.addInitHook('addHandler', 'touchZoom', TouchZoom);

	  Map.BoxZoom = BoxZoom;
	  Map.DoubleClickZoom = DoubleClickZoom;
	  Map.Drag = Drag;
	  Map.Keyboard = Keyboard;
	  Map.ScrollWheelZoom = ScrollWheelZoom;
	  Map.Tap = Tap;
	  Map.TouchZoom = TouchZoom;

	  exports.version = version;
	  exports.Control = Control;
	  exports.control = control;
	  exports.Browser = Browser;
	  exports.Evented = Evented;
	  exports.Mixin = Mixin;
	  exports.Util = Util;
	  exports.Class = Class;
	  exports.Handler = Handler;
	  exports.extend = extend;
	  exports.bind = bind;
	  exports.stamp = stamp;
	  exports.setOptions = setOptions;
	  exports.DomEvent = DomEvent;
	  exports.DomUtil = DomUtil;
	  exports.PosAnimation = PosAnimation;
	  exports.Draggable = Draggable;
	  exports.LineUtil = LineUtil;
	  exports.PolyUtil = PolyUtil;
	  exports.Point = Point;
	  exports.point = toPoint;
	  exports.Bounds = Bounds;
	  exports.bounds = toBounds;
	  exports.Transformation = Transformation;
	  exports.transformation = toTransformation;
	  exports.Projection = index;
	  exports.LatLng = LatLng;
	  exports.latLng = toLatLng;
	  exports.LatLngBounds = LatLngBounds;
	  exports.latLngBounds = toLatLngBounds;
	  exports.CRS = CRS;
	  exports.GeoJSON = GeoJSON;
	  exports.geoJSON = geoJSON;
	  exports.geoJson = geoJson;
	  exports.Layer = Layer;
	  exports.LayerGroup = LayerGroup;
	  exports.layerGroup = layerGroup;
	  exports.FeatureGroup = FeatureGroup;
	  exports.featureGroup = featureGroup;
	  exports.ImageOverlay = ImageOverlay;
	  exports.imageOverlay = imageOverlay;
	  exports.VideoOverlay = VideoOverlay;
	  exports.videoOverlay = videoOverlay;
	  exports.SVGOverlay = SVGOverlay;
	  exports.svgOverlay = svgOverlay;
	  exports.DivOverlay = DivOverlay;
	  exports.Popup = Popup;
	  exports.popup = popup;
	  exports.Tooltip = Tooltip;
	  exports.tooltip = tooltip;
	  exports.Icon = Icon;
	  exports.icon = icon;
	  exports.DivIcon = DivIcon;
	  exports.divIcon = divIcon;
	  exports.Marker = Marker;
	  exports.marker = marker;
	  exports.TileLayer = TileLayer;
	  exports.tileLayer = tileLayer;
	  exports.GridLayer = GridLayer;
	  exports.gridLayer = gridLayer;
	  exports.SVG = SVG;
	  exports.svg = svg$1;
	  exports.Renderer = Renderer;
	  exports.Canvas = Canvas;
	  exports.canvas = canvas$1;
	  exports.Path = Path;
	  exports.CircleMarker = CircleMarker;
	  exports.circleMarker = circleMarker;
	  exports.Circle = Circle;
	  exports.circle = circle;
	  exports.Polyline = Polyline;
	  exports.polyline = polyline;
	  exports.Polygon = Polygon;
	  exports.polygon = polygon;
	  exports.Rectangle = Rectangle;
	  exports.rectangle = rectangle;
	  exports.Map = Map;
	  exports.map = createMap;

	  var oldL = window.L;
	  exports.noConflict = function() {
	  	window.L = oldL;
	  	return this;
	  };

	  // Always export us to window global (see #2364)
	  window.L = exports;

	})));

	});

	// @ts-nocheck
	/**
	 * @name Sidebar
	 * @class L.Control.Sidebar
	 * @extends L.Control
	 * @param {string} id - The id of the sidebar element (without the # character)
	 * @param {Object} [options] - Optional options object
	 * @param {string} [options.autopan=false] - whether to move the map when opening the sidebar to make maintain the visible center point
	 * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
	 * @param {string} [options.id] - ID of a predefined sidebar container that should be used
	 * @param {boolean} [data.close=true] Whether to add a close button to the pane header
	 * @see L.control.sidebar
	 */
	L.Control.Sidebar = L.Control.extend(/** @lends L.Control.Sidebar.prototype */ {
	    includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,

	    options: {
	        autopan: false,
	        closeButton: true,
	        container: null,
	        position: 'left'
	    },

	    /**
	     * Create a new sidebar on this object.
	     *
	     * @constructor
	     * @param {Object} [options] - Optional options object
	     * @param {string} [options.autopan=false] - whether to move the map when opening the sidebar to make maintain the visible center point
	     * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
	     * @param {string} [options.container] - ID of a predefined sidebar container that should be used
	     * @param {bool} [data.close=true] Whether to add a close button to the pane header
	     */
	    initialize: function(options, deprecatedOptions) {
	        if (typeof options === 'string') {
	            console.warn('this syntax is deprecated. please use L.control.sidebar({ container }) now');
	            options = { container: options };
	        }

	        if (typeof options === 'object' && options.id) {
	            console.warn('this syntax is deprecated. please use L.control.sidebar({ container }) now');
	            options.container = options.id;
	        }

	        this._tabitems = [];
	        this._panes = [];
	        this._closeButtons = [];

	        L.setOptions(this, options);
	        L.setOptions(this, deprecatedOptions);
	        return this;
	    },

	    /**
	     * Add this sidebar to the specified map.
	     *
	     * @param {L.Map} map
	     * @returns {Sidebar}
	     */
	    onAdd: function(map) {
	        var i, child, tabContainers, newContainer, container;

	        // use container from previous onAdd()
	        container = this._container;

	        // use the container given via options.
	        if (!container) {
	            container = this._container || typeof this.options.container === 'string'
	            ? L.DomUtil.get(this.options.container)
	            : this.options.container;
	        }

	        // if no container was specified or not found, create it and apply an ID
	        if (!container) {
	            container = L.DomUtil.create('div', 'leaflet-sidebar collapsed');
	            if (typeof this.options.container === 'string')
	                container.id = this.options.container;
	        }

	        // Find paneContainer in DOM & store reference
	        this._paneContainer = container.querySelector('div.leaflet-sidebar-content');

	        // If none is found, create it
	        if (this._paneContainer === null)
	            this._paneContainer = L.DomUtil.create('div', 'leaflet-sidebar-content', container);

	        // Find tabContainerTop & tabContainerBottom in DOM & store reference
	        tabContainers = container.querySelectorAll('ul.leaflet-sidebar-tabs, div.leaflet-sidebar-tabs > ul');
	        this._tabContainerTop    = tabContainers[0] || null;
	        this._tabContainerBottom = tabContainers[1] || null;

	        // If no container was found, create it
	        if (this._tabContainerTop === null) {
	            newContainer = L.DomUtil.create('div', 'leaflet-sidebar-tabs', container);
	            newContainer.setAttribute('role', 'tablist');
	            this._tabContainerTop = L.DomUtil.create('ul', '', newContainer);
	        }
	        if (this._tabContainerBottom === null) {
	            newContainer = this._tabContainerTop.parentNode;
	            this._tabContainerBottom = L.DomUtil.create('ul', '', newContainer);
	        }

	        // Store Tabs in Collection for easier iteration
	        for (i = 0; i < this._tabContainerTop.children.length; i++) {
	            child = this._tabContainerTop.children[i];
	            child._sidebar = this;
	            child._id = child.querySelector('a').hash.slice(1); // FIXME: this could break for links!
	            this._tabitems.push(child);
	        }
	        for (i = 0; i < this._tabContainerBottom.children.length; i++) {
	            child = this._tabContainerBottom.children[i];
	            child._sidebar = this;
	            child._id = child.querySelector('a').hash.slice(1); // FIXME: this could break for links!
	            this._tabitems.push(child);
	        }

	        // Store Panes in Collection for easier iteration
	        for (i = 0; i < this._paneContainer.children.length; i++) {
	            child = this._paneContainer.children[i];
	            if (child.tagName === 'DIV' &&
	                L.DomUtil.hasClass(child, 'leaflet-sidebar-pane')) {
	                this._panes.push(child);

	                // Save references to close buttons
	                var closeButtons = child.querySelectorAll('.leaflet-sidebar-close');
	                if (closeButtons.length) {
	                    this._closeButtons.push(closeButtons[closeButtons.length - 1]);
	                    this._closeClick(closeButtons[closeButtons.length - 1], 'on');
	                }
	            }
	        }

	        // set click listeners for tab & close buttons
	        for (i = 0; i < this._tabitems.length; i++) {
	            this._tabClick(this._tabitems[i], 'on');
	        }

	        // leaflet moves the returned container to the right place in the DOM
	        return container;
	    },

	    /**
	     * Remove this sidebar from the map.
	     *
	     * @param {L.Map} map
	     * @returns {Sidebar}
	     */
	    onRemove: function (map) {
	        // Remove click listeners for tab & close buttons
	        for (var i = 0; i < this._tabitems.length; i++)
	            this._tabClick(this._tabitems[i], 'off');
	        for (var i = 0; i < this._closeButtons.length; i++)
	            this._closeClick(this._closeButtons[i], 'off');

	        this._tabitems = [];
	        this._panes = [];
	        this._closeButtons = [];

	        return this;
	    },

	    /**
	     * @method addTo(map: Map): this
	     * Adds the control to the given map. Overrides the implementation of L.Control,
	     * changing the DOM mount target from map._controlContainer.topleft to map._container
	     */
	    addTo: function (map) {
	        this.onRemove();
	        this._map = map;

	        this._container = this.onAdd(map);

	        L.DomUtil.addClass(this._container, 'leaflet-control');
	        L.DomUtil.addClass(this._container, 'leaflet-sidebar-' + this.getPosition());
	        if (L.Browser.touch)
	            L.DomUtil.addClass(this._container, 'leaflet-touch');

	        // when adding to the map container, we should stop event propagation
	        L.DomEvent.disableScrollPropagation(this._container);
	        L.DomEvent.disableClickPropagation(this._container);
	        L.DomEvent.on(this._container, 'contextmenu', L.DomEvent.stopPropagation);

	        // insert as first child of map container (important for css)
	        map._container.insertBefore(this._container, map._container.firstChild);

	        return this;
	    },

	    /**
	     * @deprecated - Please use remove() instead of removeFrom(), as of Leaflet 0.8-dev, the removeFrom() has been replaced with remove()
	     * Removes this sidebar from the map.
	     * @param {L.Map} map
	     * @returns {Sidebar}
	     */
	    removeFrom: function(map) {
	        console.warn('removeFrom() has been deprecated, please use remove() instead as support for this function will be ending soon.');
	        this._map._container.removeChild(this._container);
	        this.onRemove(map);

	        return this;
	    },

	   /**
	     * Open sidebar (if it's closed) and show the specified tab.
	     *
	     * @param {string} id - The ID of the tab to show (without the # character)
	     * @returns {L.Control.Sidebar}
	     */
	    open: function(id) {
	        var i, child, tab;

	        // If panel is disabled, stop right here
	        tab = this._getTab(id);
	        if (L.DomUtil.hasClass(tab, 'disabled'))
	            return this;

	        // Hide old active contents and show new content
	        for (i = 0; i < this._panes.length; i++) {
	            child = this._panes[i];
	            if (child.id === id)
	                L.DomUtil.addClass(child, 'active');
	            else if (L.DomUtil.hasClass(child, 'active'))
	                L.DomUtil.removeClass(child, 'active');
	        }

	        // Remove old active highlights and set new highlight
	        for (i = 0; i < this._tabitems.length; i++) {
	            child = this._tabitems[i];
	            if (child.querySelector('a').hash === '#' + id)
	                L.DomUtil.addClass(child, 'active');
	            else if (L.DomUtil.hasClass(child, 'active'))
	                L.DomUtil.removeClass(child, 'active');
	        }

	        this.fire('content', { id: id });

	        // Open sidebar if it's closed
	        if (L.DomUtil.hasClass(this._container, 'collapsed')) {
	            this.fire('opening');
	            L.DomUtil.removeClass(this._container, 'collapsed');
	            if (this.options.autopan) this._panMap('open');
	        }

	        return this;
	    },

	    /**
	     * Close the sidebar (if it's open).
	     *
	     * @returns {L.Control.Sidebar}
	     */
	    close: function() {
	        var i;

	        // Remove old active highlights
	        for (i = 0; i < this._tabitems.length; i++) {
	            var child = this._tabitems[i];
	            if (L.DomUtil.hasClass(child, 'active'))
	                L.DomUtil.removeClass(child, 'active');
	        }

	        // close sidebar, if it's opened
	        if (!L.DomUtil.hasClass(this._container, 'collapsed')) {
	            this.fire('closing');
	            L.DomUtil.addClass(this._container, 'collapsed');
	            if (this.options.autopan) this._panMap('close');
	        }

	        return this;
	    },

	    /**
	     * Add a panel to the sidebar
	     *
	     * @example
	     * sidebar.addPanel({
	     *     id: 'userinfo',
	     *     tab: '<i class="fa fa-gear"></i>',
	     *     pane: someDomNode.innerHTML,
	     *     position: 'bottom'
	     * });
	     *
	     * @param {Object} [data] contains the data for the new Panel:
	     * @param {String} [data.id] the ID for the new Panel, must be unique for the whole page
	     * @param {String} [data.position='top'] where the tab will appear:
	     *                                       on the top or the bottom of the sidebar. 'top' or 'bottom'
	     * @param {HTMLString} {DOMnode} [data.tab]  content of the tab item, as HTMLstring or DOM node
	     * @param {HTMLString} {DOMnode} [data.pane] content of the panel, as HTMLstring or DOM node
	     * @param {String} [data.link] URL to an (external) link that will be opened instead of a panel
	     * @param {String} [data.title] Title for the pane header
	     * @param {String} {Function} [data.button] URL to an (external) link or a click listener function that will be opened instead of a panel
	     * @param {bool} [data.disabled] If the tab should be disabled by default
	     *
	     * @returns {L.Control.Sidebar}
	     */
	    addPanel: function(data) {
	        var pane, tab, tabHref, closeButtons, content;

	        // Create tab node
	        tab = L.DomUtil.create('li', data.disabled ? 'disabled' : '');
	        tabHref = L.DomUtil.create('a', '', tab);
	        tabHref.href = '#' + data.id;
	        tabHref.setAttribute('role', 'tab');
	        tabHref.innerHTML = data.tab;
	        tab._sidebar = this;
	        tab._id = data.id;
	        tab._button = data.button; // to allow links to be disabled, the href cannot be used
	        if (data.title && data.title[0] !== '<') tab.title = data.title;

	        // append it to the DOM and store JS references
	        if (data.position === 'bottom')
	            this._tabContainerBottom.appendChild(tab);
	        else
	            this._tabContainerTop.appendChild(tab);

	        this._tabitems.push(tab);

	        // Create pane node
	        if (data.pane) {
	            if (typeof data.pane === 'string') {
	                // pane is given as HTML string
	                pane = L.DomUtil.create('DIV', 'leaflet-sidebar-pane', this._paneContainer);
	                content = '';
	                if (data.title)
	                    content += '<h1 class="leaflet-sidebar-header">' + data.title;
	                if (this.options.closeButton)
	                    content += '<span class="leaflet-sidebar-close"><i class="fa fa-caret-' + this.options.position + '"></i></span>';
	                if (data.title)
	                    content += '</h1>';
	                pane.innerHTML = content + data.pane;
	            } else {
	                // pane is given as DOM object
	                pane = data.pane;
	                this._paneContainer.appendChild(pane);
	            }
	            pane.id = data.id;

	            this._panes.push(pane);

	            // Save references to close button & register click listener
	            closeButtons = pane.querySelectorAll('.leaflet-sidebar-close');
	            if (closeButtons.length) {
	                // select last button, because thats rendered on top
	                this._closeButtons.push(closeButtons[closeButtons.length - 1]);
	                this._closeClick(closeButtons[closeButtons.length - 1], 'on');
	            }
	        }

	        // Register click listeners, if the sidebar is on the map
	        this._tabClick(tab, 'on');

	        return this;
	    },

	    /**
	     * Removes a panel from the sidebar
	     *
	     * @example
	     * sidebar.remove('userinfo');
	     *
	     * @param {String} [id] the ID of the panel that is to be removed
	     * @returns {L.Control.Sidebar}
	     */
	    removePanel: function(id) {
	        var i, j, tab, pane, closeButtons;

	        // find the tab & panel by ID, remove them, and clean up
	        for (i = 0; i < this._tabitems.length; i++) {
	            if (this._tabitems[i]._id === id) {
	                tab = this._tabitems[i];

	                // Remove click listeners
	                this._tabClick(tab, 'off');

	                tab.remove();
	                this._tabitems.splice(i, 1);
	                break;
	            }
	        }

	        for (i = 0; i < this._panes.length; i++) {
	            if (this._panes[i].id === id) {
	                pane = this._panes[i];
	                closeButtons = pane.querySelectorAll('.leaflet-sidebar-close');
	                for (j = 0; j < closeButtons.length; j++) {
	                    this._closeClick(closeButtons[j], 'off');
	                }

	                pane.remove();
	                this._panes.splice(i, 1);

	                break;
	            }
	        }

	        return this;
	    },

	    /**
	     * enables a disabled tab/panel
	     *
	     * @param {String} [id] ID of the panel to enable
	     * @returns {L.Control.Sidebar}
	     */
	    enablePanel: function(id) {
	        var tab = this._getTab(id);
	        L.DomUtil.removeClass(tab, 'disabled');

	        return this;
	    },

	    /**
	     * disables an enabled tab/panel
	     *
	     * @param {String} [id] ID of the panel to disable
	     * @returns {L.Control.Sidebar}
	     */
	    disablePanel: function(id) {
	        var tab = this._getTab(id);
	        L.DomUtil.addClass(tab, 'disabled');

	        return this;
	    },

	    onTabClick: function(e) {
	        // `this` points to the tab DOM element!
	        if (L.DomUtil.hasClass(this, 'active')) {
	            this._sidebar.close();
	        } else if (!L.DomUtil.hasClass(this, 'disabled')) {
	            if (typeof this._button === 'string') // an url
	                window.location.href = this._button;
	            else if (typeof this._button === 'function') // a clickhandler
	                this._button(e);
	            else // a normal pane
	                this._sidebar.open(this.querySelector('a').hash.slice(1));
	        }
	    },

	    /**
	     * (un)registers the onclick event for the given tab,
	     * depending on the second argument.
	     * @private
	     *
	     * @param {DOMelement} [tab]
	     * @param {String} [on] 'on' or 'off'
	     */
	    _tabClick: function(tab, on) {
	        var link = tab.querySelector('a');
	        if (!link.hasAttribute('href') || link.getAttribute('href')[0] !== '#')
	            return;

	        if (on === 'on') {
	            L.DomEvent
	                .on(tab.querySelector('a'), 'click', L.DomEvent.preventDefault, tab)
	                .on(tab.querySelector('a'), 'click', this.onTabClick, tab);
	        } else {
	            L.DomEvent.off(tab.querySelector('a'), 'click', this.onTabClick, tab);
	        }
	    },

	    onCloseClick: function() {
	        this.close();
	    },

	    /**
	     * (un)registers the onclick event for the given close button
	     * depending on the second argument
	     * @private
	     *
	     * @param {DOMelement} [closeButton]
	     * @param {String} [on] 'on' or 'off'
	     */
	    _closeClick: function(closeButton, on) {
	        if (on === 'on') {
	            L.DomEvent.on(closeButton, 'click', this.onCloseClick, this);
	        } else {
	            L.DomEvent.off(closeButton, 'click', this.onCloseClick);
	        }
	    },

	    /**
	     * Finds & returns the DOMelement of a tab
	     *
	     * @param {String} [id] the id of the tab
	     * @returns {DOMelement} the tab specified by id, null if not found
	     */
	    _getTab: function(id) {
	        for (var i = 0; i < this._tabitems.length; i++) {
	            if (this._tabitems[i]._id === id)
	                return this._tabitems[i];
	        }

	        throw Error('tab "' + id + '" not found');
	    },

	    /**
	     * Helper for autopan: Pans the map for open/close events
	     *
	     * @param {String} [openClose] The behaviour to enact ('open' | 'close')
	     */
	   _panMap: function(openClose) {
	        var panWidth = Number.parseInt(L.DomUtil.getStyle(this._container, 'max-width')) / 2;
	        if (
	            openClose === 'open' && this.options.position === 'left' ||
	            openClose === 'close' && this.options.position === 'right'
	        ) panWidth *= -1;
	        this._map.panBy([panWidth, 0], { duration: 0.5 });
	   }
	});

	/**
	 * Create a new sidebar.
	 *
	 * @example
	 * var sidebar = L.control.sidebar({ container: 'sidebar' }).addTo(map);
	 *
	 * @param {Object} [options] - Optional options object
	 * @param {string} [options.autopan=false] - whether to move the map when opening the sidebar to make maintain the visible center point
	 * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
	 * @param {string} [options.container] - ID of a predefined sidebar container that should be used
	 * @param {boolean} [data.close=true] Whether to add a close button to the pane header
	 * @returns {Sidebar} A new sidebar instance
	 */
	L.control.sidebar = function(options, deprecated) {
	    return new L.Control.Sidebar(options, deprecated);
	};

	var INJECTOR_TOKEN = '$injector';
	var TARGET_TOKEN = '$target';


	var InjectionToken = /*#__PURE__*/Object.defineProperty({
		INJECTOR_TOKEN: INJECTOR_TOKEN,
		TARGET_TOKEN: TARGET_TOKEN
	}, '__esModule', {value: true});

	var Scope_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	(function (Scope) {
	    Scope["Transient"] = "transient";
	    Scope["Singleton"] = "singleton";
	})(exports.Scope || (exports.Scope = {}));

	});

	/*

	                    ┏━━━━━━━━━━━━━━━━━━┓
	                    ┃ TypedInjectError ┃
	                    ┗━━━━━━━━━━━━━━━━━━┛
	                              ▲
	                              ┃
	               ┏━━━━━━━━━━━━━━┻━━━━━━━━━━━━━┓
	               ┃                            ┃
	 ┏━━━━━━━━━━━━━┻━━━━━━━━━━┓        ┏━━━━━━━━┻━━━━━━━┓
	 ┃ InjectorDisposedError  ┃        ┃ InjectionError ┃
	 ┗━━━━━━━━━━━━━━━━━━━━━━━━┛        ┗━━━━━━━━━━━━━━━━┛
	*/
	class TypedInjectError extends Error {
	}
	var TypedInjectError_1 = TypedInjectError;
	function describeInjectAction(target) {
	    if (typeof target === 'function') {
	        return 'inject';
	    }
	    else {
	        return 'resolve';
	    }
	}
	function name(target) {
	    if (typeof target === 'function') {
	        if (target.toString().startsWith('class')) {
	            return `[class ${target.name || '<anonymous>'}]`;
	        }
	        else {
	            return `[function ${target.name || '<anonymous>'}]`;
	        }
	    }
	    else {
	        return `[token "${String(target)}"]`;
	    }
	}
	class InjectorDisposedError extends TypedInjectError {
	    constructor(target) {
	        super(`Injector is already disposed. Please don't use it anymore. Tried to ${describeInjectAction(target)} ${name(target)}.`);
	    }
	}
	var InjectorDisposedError_1 = InjectorDisposedError;
	class InjectionError extends TypedInjectError {
	    constructor(path, cause) {
	        super(`Could not ${describeInjectAction(path[0])} ${path.map(name).join(' -> ')}. Cause: ${cause.message}`);
	        this.path = path;
	        this.cause = cause;
	    }
	    static create(target, error) {
	        if (error instanceof InjectionError) {
	            return new InjectionError([target, ...error.path], error.cause);
	        }
	        else {
	            return new InjectionError([target], error);
	        }
	    }
	}
	var InjectionError_1 = InjectionError;


	var errors = /*#__PURE__*/Object.defineProperty({
		TypedInjectError: TypedInjectError_1,
		InjectorDisposedError: InjectorDisposedError_1,
		InjectionError: InjectionError_1
	}, '__esModule', {value: true});

	var option = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromMap = exports.isNone = exports.isSome = exports.none_constructor = exports.some_constructor = exports.None = exports.Some = exports.OptionType = void 0;
	exports.OptionType = {
	    Some: Symbol(":some"),
	    None: Symbol(":none"),
	};
	function Some(val) {
	    return typeof val === "undefined"
	        ? none_constructor()
	        : some_constructor(val);
	}
	exports.Some = Some;
	exports.None = none_constructor();
	function some_constructor(val) {
	    if (typeof val === "undefined") {
	        throw new TypeError("Some has to contain a value. Constructor received undefined.");
	    }
	    return {
	        type: exports.OptionType.Some,
	        isSome() {
	            return true;
	        },
	        isNone() {
	            return false;
	        },
	        match(fn) {
	            return fn.some(val);
	        },
	        ifSome(fn) {
	            fn(val);
	        },
	        map(fn) {
	            return some_constructor(fn(val));
	        },
	        andThen(fn) {
	            return fn(val);
	        },
	        or(_optb) {
	            return this;
	        },
	        and(optb) {
	            return optb;
	        },
	        unwrapOr(_def) {
	            return val;
	        },
	        unwrapOrElse(_f) {
	            return val;
	        },
	        unwrap() {
	            return val;
	        },
	    };
	}
	exports.some_constructor = some_constructor;
	function none_constructor() {
	    return {
	        type: exports.OptionType.None,
	        isSome() {
	            return false;
	        },
	        isNone() {
	            return true;
	        },
	        match(matchObject) {
	            const { none } = matchObject;
	            if (typeof none === "function") {
	                return none();
	            }
	            return none;
	        },
	        ifSome(_fn) { },
	        map(_fn) {
	            return none_constructor();
	        },
	        andThen(_fn) {
	            return none_constructor();
	        },
	        or(optb) {
	            return optb;
	        },
	        and(_optb) {
	            return none_constructor();
	        },
	        unwrapOr(def) {
	            if (def == null) {
	                throw new Error("Cannot call unwrapOr with a missing value.");
	            }
	            return def;
	        },
	        unwrapOrElse(f) {
	            return f();
	        },
	        unwrap() {
	            throw new ReferenceError("Trying to unwrap None.");
	        },
	    };
	}
	exports.none_constructor = none_constructor;
	function isSome(val) {
	    return val.isSome();
	}
	exports.isSome = isSome;
	function isNone(val) {
	    return val.isNone();
	}
	exports.isNone = isNone;
	/**
	 * Retrieves value `V` and converts it to `Option<V>` if key leads to this value, otherwise returns `None`. It is highly
	 * recommended to cast the return type to `Option<V>` explicitly, as seen in examples below.
	 *
	 * #### Examples
	 *
	 * ```typescript
	 *
	 * const getDriverName = (map: Map<string, string>): Option<string> => fromMap(map, "car")
	 *
	 * const noCarDriver = new Map()
	 * console.log(getDriverName(noCarDriver)) // None
	 *
	 * const hasCarDriver = new Map()
	 * hasCar.set("car", "John");
	 * console.log(getDriverName(hasCarDriver)) // Some("John")
	 *
	 * ```
	 */
	function fromMap(map, key) {
	    const value = map.get(key);
	    if (value !== undefined) {
	        return Some(value);
	    }
	    else {
	        return exports.None;
	    }
	}
	exports.fromMap = fromMap;

	});

	var either = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isRight = exports.isLeft = exports.Right = exports.Left = exports.EitherType = void 0;

	exports.EitherType = {
	    Left: Symbol(":left"),
	    Right: Symbol(":right"),
	};
	function Left(val) {
	    return {
	        type: exports.EitherType.Left,
	        isLeft() {
	            return true;
	        },
	        isRight() {
	            return false;
	        },
	        left() {
	            return option.Some(val);
	        },
	        leftAndThen(fn) {
	            return fn(val);
	        },
	        right() {
	            return option.None;
	        },
	        rightAndThen(_fn) {
	            return Left(val);
	        },
	        unwrap() {
	            return val;
	        },
	        unwrapLeft() {
	            return val;
	        },
	        unwrapLeftOr(_other) {
	            return val;
	        },
	        unwrapLeftOrElse(_fn) {
	            return val;
	        },
	        unwrapRight() {
	            throw new ReferenceError("Cannot unwrap Right value of Either.Left");
	        },
	        unwrapRightOr(other) {
	            return other;
	        },
	        unwrapRightOrElse(fn) {
	            return fn(val);
	        },
	        match(matchObject) {
	            return matchObject.left(val);
	        },
	        map(fn) {
	            return Left(fn(val));
	        },
	        mapLeft(fn) {
	            return Left(fn(val));
	        },
	        mapRight(_fn) {
	            return Left(val);
	        },
	    };
	}
	exports.Left = Left;
	function Right(val) {
	    return {
	        type: exports.EitherType.Right,
	        isLeft() {
	            return false;
	        },
	        isRight() {
	            return true;
	        },
	        left() {
	            return option.None;
	        },
	        leftAndThen(_fn) {
	            return Right(val);
	        },
	        right() {
	            return option.Some(val);
	        },
	        rightAndThen(fn) {
	            return fn(val);
	        },
	        unwrap() {
	            return val;
	        },
	        unwrapLeft() {
	            throw new ReferenceError("Cannot unwrap Left value of Either.Right");
	        },
	        unwrapLeftOr(other) {
	            return other;
	        },
	        unwrapLeftOrElse(fn) {
	            return fn(val);
	        },
	        unwrapRight() {
	            return val;
	        },
	        unwrapRightOr(_other) {
	            return val;
	        },
	        unwrapRightOrElse(_fn) {
	            return val;
	        },
	        match(matchObject) {
	            return matchObject.right(val);
	        },
	        map(fn) {
	            return Right(fn(val));
	        },
	        mapLeft(_fn) {
	            return Right(val);
	        },
	        mapRight(fn) {
	            return Right(fn(val));
	        },
	    };
	}
	exports.Right = Right;
	function isLeft(val) {
	    return val.isLeft();
	}
	exports.isLeft = isLeft;
	function isRight(val) {
	    return val.isRight();
	}
	exports.isRight = isRight;

	});

	var result = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isErr = exports.isOk = exports.Err = exports.Ok = exports.ResultType = void 0;

	exports.ResultType = {
	    Ok: Symbol(":ok"),
	    Err: Symbol(":err"),
	};
	function Ok(val) {
	    return {
	        type: exports.ResultType.Ok,
	        isOk() {
	            return true;
	        },
	        isErr() {
	            return false;
	        },
	        ok() {
	            return option.Some(val);
	        },
	        err() {
	            return option.None;
	        },
	        unwrap() {
	            return val;
	        },
	        unwrapOr(_optb) {
	            return val;
	        },
	        unwrapOrElse(_fn) {
	            return val;
	        },
	        unwrapErr() {
	            throw new ReferenceError("Cannot unwrap Err value of Result.Ok");
	        },
	        match(matchObject) {
	            return matchObject.ok(val);
	        },
	        map(fn) {
	            return Ok(fn(val));
	        },
	        mapErr(_fn) {
	            return Ok(val);
	        },
	        andThen(fn) {
	            return fn(val);
	        },
	        orElse(_fn) {
	            return Ok(val);
	        },
	    };
	}
	exports.Ok = Ok;
	function Err(err) {
	    return {
	        type: exports.ResultType.Err,
	        isOk() {
	            return false;
	        },
	        isErr() {
	            return true;
	        },
	        ok() {
	            return option.None;
	        },
	        err() {
	            return option.Some(err);
	        },
	        unwrap() {
	            throw new ReferenceError("Cannot unwrap Ok value of Result.Err");
	        },
	        unwrapOr(optb) {
	            return optb;
	        },
	        unwrapOrElse(fn) {
	            return fn(err);
	        },
	        unwrapErr() {
	            return err;
	        },
	        match(matchObject) {
	            return matchObject.err(err);
	        },
	        map(_fn) {
	            return Err(err);
	        },
	        mapErr(fn) {
	            return Err(fn(err));
	        },
	        andThen(_fn) {
	            return Err(err);
	        },
	        orElse(fn) {
	            return fn(err);
	        },
	    };
	}
	exports.Err = Err;
	function isOk(val) {
	    return val.isOk();
	}
	exports.isOk = isOk;
	function isErr(val) {
	    return val.isErr();
	}
	exports.isErr = isErr;

	});

	var lib = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	Object.defineProperty(exports, "Left", { enumerable: true, get: function () { return either.Left; } });
	Object.defineProperty(exports, "Right", { enumerable: true, get: function () { return either.Right; } });
	Object.defineProperty(exports, "isLeft", { enumerable: true, get: function () { return either.isLeft; } });
	Object.defineProperty(exports, "isRight", { enumerable: true, get: function () { return either.isRight; } });

	Object.defineProperty(exports, "Some", { enumerable: true, get: function () { return option.Some; } });
	Object.defineProperty(exports, "None", { enumerable: true, get: function () { return option.None; } });
	Object.defineProperty(exports, "isSome", { enumerable: true, get: function () { return option.isSome; } });
	Object.defineProperty(exports, "isNone", { enumerable: true, get: function () { return option.isNone; } });
	Object.defineProperty(exports, "fromMap", { enumerable: true, get: function () { return option.fromMap; } });

	Object.defineProperty(exports, "Ok", { enumerable: true, get: function () { return result.Ok; } });
	Object.defineProperty(exports, "Err", { enumerable: true, get: function () { return result.Err; } });
	Object.defineProperty(exports, "isOk", { enumerable: true, get: function () { return result.isOk; } });
	Object.defineProperty(exports, "isErr", { enumerable: true, get: function () { return result.isErr; } });

	});

	function isDisposable(maybeDisposable) {
	    const asDisposable = maybeDisposable;
	    return asDisposable && asDisposable.dispose && typeof asDisposable.dispose === 'function';
	}
	var isDisposable_1 = isDisposable;


	var utils = /*#__PURE__*/Object.defineProperty({
		isDisposable: isDisposable_1
	}, '__esModule', {value: true});

	/* eslint-disable @typescript-eslint/no-unsafe-member-access */
	/* eslint-disable @typescript-eslint/no-unsafe-assignment */
	/* eslint-disable @typescript-eslint/no-unsafe-return */




	/*

	# Composite design pattern:

	         ┏━━━━━━━━━━━━━━━━━━┓
	         ┃ AbstractInjector ┃
	         ┗━━━━━━━━━━━━━━━━━━┛
	                   ▲
	                   ┃
	          ┏━━━━━━━━┻━━━━━━━━┓
	          ┃                 ┃
	 ┏━━━━━━━━┻━━━━━┓   ┏━━━━━━━┻━━━━━━━┓
	 ┃ RootInjector ┃   ┃ ChildInjector ┃
	 ┗━━━━━━━━━━━━━━┛   ┗━━━━━━━━━━━━━━━┛
	                            ▲
	                            ┃
	          ┏━━━━━━━━━━━━━━━━━┻━┳━━━━━━━━━━━━━━━━┓
	 ┏━━━━━━━━┻━━━━━━━━┓ ┏━━━━━━━━┻━━━━━━┓ ┏━━━━━━━┻━━━━━━━┓
	 ┃ FactoryInjector ┃ ┃ ClassInjector ┃ ┃ ValueInjector ┃
	 ┗━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━┛
	*/
	class AbstractInjector {
	    constructor() {
	        this.childInjectors = [];
	        this.isDisposed = false;
	    }
	    injectClass(Class, providedIn) {
	        this.throwIfDisposed(Class);
	        try {
	            const args = this.resolveParametersToInject(Class, providedIn);
	            return new Class(...args);
	        }
	        catch (error) {
	            throw errors.InjectionError.create(Class, error);
	        }
	    }
	    injectFunction(fn, providedIn) {
	        this.throwIfDisposed(fn);
	        try {
	            const args = this.resolveParametersToInject(fn, providedIn);
	            return fn(...args);
	        }
	        catch (error) {
	            throw errors.InjectionError.create(fn, error);
	        }
	    }
	    resolveParametersToInject(injectable, target) {
	        const tokens = injectable.inject || [];
	        return tokens.map((key) => {
	            switch (key) {
	                case InjectionToken.TARGET_TOKEN:
	                    return target;
	                case InjectionToken.INJECTOR_TOKEN:
	                    return this;
	                default:
	                    return this.resolveInternal(key, injectable);
	            }
	        });
	    }
	    resolve(token, target) {
	        this.throwIfDisposed(token);
	        return this.resolveInternal(token, target);
	    }
	    throwIfDisposed(injectableOrToken) {
	        if (this.isDisposed) {
	            throw new errors.InjectorDisposedError(injectableOrToken);
	        }
	    }
	    async dispose() {
	        if (!this.isDisposed) {
	            this.isDisposed = true; // be sure new disposables aren't added while we're disposing
	            await Promise.all(this.childInjectors.map((child) => child.dispose()));
	            while (this.childInjectors.pop())
	                ; // Don't keep the references, might cause a memory leak
	            await this.disposeInjectedValues();
	        }
	    }
	}
	var AbstractInjector_1 = AbstractInjector;
	class RootInjector extends AbstractInjector {
	    resolveInternal(token) {
	        throw new Error(`No provider found for "${token}"!.`);
	    }
	    disposeInjectedValues() {
	        return Promise.resolve();
	    }
	}
	var RootInjector_1 = RootInjector;
	class ChildInjector extends AbstractInjector {
	    constructor(parent, token, scope) {
	        super();
	        this.parent = parent;
	        this.token = token;
	        this.scope = scope;
	        this.disposables = new Set();
	    }
	    async disposeInjectedValues() {
	        const promisesToAwait = [...this.disposables.values(), this.parent].map((disposable) => disposable.dispose());
	        await Promise.all(promisesToAwait);
	    }
	    resolveInternal(token, target) {
	        if (token === this.token) {
	            if (this.cached) {
	                return this.cached.value;
	            }
	            else {
	                try {
	                    const value = this.result(target);
	                    this.addToCacheIfNeeded(value);
	                    return value;
	                }
	                catch (error) {
	                    throw errors.InjectionError.create(token, error);
	                }
	            }
	        }
	        else {
	            return this.parent.resolve(token, target);
	        }
	    }
	    addToCacheIfNeeded(value) {
	        if (this.scope === Scope_1.Scope.Singleton) {
	            this.cached = { value };
	        }
	    }
	    registerProvidedValue(value) {
	        if (utils.isDisposable(value)) {
	            this.disposables.add(value);
	        }
	        return value;
	    }
	}
	var ChildInjector_1 = ChildInjector;
	class ValueProvider extends ChildInjector {
	    constructor(parent, token, value) {
	        super(parent, token, Scope_1.Scope.Transient);
	        this.value = value;
	    }
	    result() {
	        return this.value;
	    }
	}
	var ValueProvider_1 = ValueProvider;
	class FactoryProvider extends ChildInjector {
	    constructor(parent, token, scope, injectable) {
	        super(parent, token, scope);
	        this.injectable = injectable;
	    }
	    result(target) {
	        return this.registerProvidedValue(this.parent.injectFunction(this.injectable, target));
	    }
	}
	var FactoryProvider_1 = FactoryProvider;
	class ClassProvider extends ChildInjector {
	    constructor(parent, token, scope, injectable) {
	        super(parent, token, scope);
	        this.injectable = injectable;
	    }
	    result(target) {
	        return this.registerProvidedValue(this.parent.injectClass(this.injectable, target));
	    }
	}
	var ClassProvider_1 = ClassProvider;


	var InjectorImpl = /*#__PURE__*/Object.defineProperty({
		AbstractInjector: AbstractInjector_1,
		RootInjector: RootInjector_1,
		ChildInjector: ChildInjector_1,
		ValueProvider: ValueProvider_1,
		FactoryProvider: FactoryProvider_1,
		ClassProvider: ClassProvider_1
	}, '__esModule', {value: true});

	/* eslint-disable @typescript-eslint/no-unsafe-member-access */
	/* eslint-disable @typescript-eslint/no-unsafe-assignment */
	/* eslint-disable @typescript-eslint/no-unsafe-return */





	const DEFAULT_SCOPE = Scope_1.Scope.Singleton;
	/*

	# Composite design pattern:

	         ┏━━━━━━━━━━━━━━━━━━┓
	         ┃ AbstractInjector ┃
	         ┗━━━━━━━━━━━━━━━━━━┛
	                   ▲
	                   ┃
	          ┏━━━━━━━━┻━━━━━━━━┓
	          ┃                 ┃
	 ┏━━━━━━━━┻━━━━━┓   ┏━━━━━━━┻━━━━━━━┓
	 ┃ RootInjector ┃   ┃ ChildInjector ┃
	 ┗━━━━━━━━━━━━━━┛   ┗━━━━━━━━━━━━━━━┛
	                            ▲
	                            ┃
	          ┏━━━━━━━━━━━━━━━━━┻━┳━━━━━━━━━━━━━━━━┓
	 ┏━━━━━━━━┻━━━━━━━━┓ ┏━━━━━━━━┻━━━━━━┓ ┏━━━━━━━┻━━━━━━━┓
	 ┃ FactoryInjector ┃ ┃ ClassInjector ┃ ┃ ValueInjector ┃
	 ┗━━━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━━━┛
	*/
	class AbstractInjectorFactory {
	    constructor() {
	        this.childInjectors = [];
	    }
	    injectClass(Class, providedIn) {
	        try {
	            const args = this.resolveParametersToInject(Class, providedIn);
	            return new Class(...args);
	        }
	        catch (error) {
	            throw errors.InjectionError.create(Class, error);
	        }
	    }
	    injectFunction(fn, providedIn) {
	        try {
	            const args = this.resolveParametersToInject(fn, providedIn);
	            return fn(...args);
	        }
	        catch (error) {
	            throw errors.InjectionError.create(fn, error);
	        }
	    }
	    resolveParametersToInject(injectable, target) {
	        const tokens = injectable.inject || [];
	        return tokens.map((key) => {
	            switch (key) {
	                case InjectionToken.TARGET_TOKEN:
	                    return target;
	                case InjectionToken.INJECTOR_TOKEN:
	                    return this;
	                default:
	                    return this.resolveInternal(key, injectable);
	            }
	        });
	    }
	    provideValue(token, value) {
	        const provider = new ValueProviderFactory(this, token, value);
	        this.childInjectors.push(provider);
	        return provider;
	    }
	    provideClass(token, Class, scope = DEFAULT_SCOPE) {
	        const provider = new ClassProviderFactory(this, token, scope, Class);
	        this.childInjectors.push(provider);
	        return provider;
	    }
	    provideFactory(token, factory, scope = DEFAULT_SCOPE) {
	        const provider = new FactoryProviderFactory(this, token, scope, factory);
	        this.childInjectors.push(provider);
	        return provider;
	    }
	    provideResultFactory(token, factory) {
	        const result = this.injectFunction(factory);
	        const provider = result.match({
	            ok: (value) => new ValueProviderFactory(this, token, value),
	            err: (error) => new FailedInjectorFactory(this, token, error),
	        });
	        this.childInjectors.push(provider);
	        return provider;
	    }
	    resolve(token, target) {
	        return this.resolveInternal(token, target);
	    }
	}
	class RootInjectorFactory extends AbstractInjectorFactory {
	    resolveInternal(token) {
	        throw new Error(`No provider found for "${token}"!.`);
	    }
	    build() {
	        return lib.Ok(new InjectorImpl.RootInjector());
	    }
	}
	class ChildInjectorFactory extends AbstractInjectorFactory {
	    constructor(parent, token, scope) {
	        super();
	        this.parent = parent;
	        this.token = token;
	        this.scope = scope;
	    }
	    resolveInternal(token, target) {
	        if (token === this.token) {
	            if (this.cached) {
	                return this.cached.value;
	            }
	            else {
	                try {
	                    const value = this.result(target);
	                    this.addToCacheIfNeeded(value);
	                    return value;
	                }
	                catch (error) {
	                    throw errors.InjectionError.create(token, error);
	                }
	            }
	        }
	        else {
	            return this.parent.resolve(token, target);
	        }
	    }
	    addToCacheIfNeeded(value) {
	        if (this.scope === Scope_1.Scope.Singleton) {
	            this.cached = { value };
	        }
	    }
	}
	class FailedInjectorFactory extends ChildInjectorFactory {
	    constructor(parent, token, errorMessage) {
	        super(parent, token, Scope_1.Scope.Singleton);
	        this.errorMessage = errorMessage;
	    }
	    result() {
	        throw 'Cannot get result from failed injector';
	    }
	    build() {
	        return lib.Err(`Injector failed with error: ${this.errorMessage}`);
	    }
	    provideValue() {
	        return this;
	    }
	    provideClass() {
	        return this;
	    }
	    provideFactory() {
	        return this;
	    }
	    provideResultFactory() {
	        return this;
	    }
	}
	class ValueProviderFactory extends ChildInjectorFactory {
	    constructor(parent, token, value) {
	        super(parent, token, Scope_1.Scope.Transient);
	        this.value = value;
	    }
	    result() {
	        return this.value;
	    }
	    build() {
	        return this.parent.build().andThen((parent) => lib.Ok(new InjectorImpl.ValueProvider(parent, this.token, this.value)));
	    }
	}
	class FactoryProviderFactory extends ChildInjectorFactory {
	    constructor(parent, token, scope, injectable) {
	        super(parent, token, scope);
	        this.injectable = injectable;
	    }
	    result(target) {
	        return this.parent.injectFunction(this.injectable, target);
	    }
	    build() {
	        return this.parent.build().andThen((parent) => lib.Ok(new InjectorImpl.FactoryProvider(parent, this.token, this.scope, this.injectable)));
	    }
	}
	class ClassProviderFactory extends ChildInjectorFactory {
	    constructor(parent, token, scope, injectable) {
	        super(parent, token, scope);
	        this.injectable = injectable;
	    }
	    result(target) {
	        return this.parent.injectClass(this.injectable, target);
	    }
	    build() {
	        return this.parent.build().andThen((parent) => lib.Ok(new InjectorImpl.ClassProvider(parent, this.token, this.scope, this.injectable)));
	    }
	}
	function createInjector() {
	    return new RootInjectorFactory();
	}
	var createInjector_1 = createInjector;


	var InjectorFactoryImpl = /*#__PURE__*/Object.defineProperty({
		createInjector: createInjector_1
	}, '__esModule', {value: true});

	/**
	 * Helper method to create string literal tuple type.
	 * @example
	 * ```ts
	 * const inject = tokens('foo', 'bar');
	 * const inject2: ['foo', 'bar'] = ['foo', 'bar'];
	 * ```
	 * @param tokens The tokens as args
	 */
	function tokens(...tokens) {
	    return tokens;
	}
	var tokens_2 = tokens;


	var tokens_1 = /*#__PURE__*/Object.defineProperty({
		tokens: tokens_2
	}, '__esModule', {value: true});

	var src = createCommonjsModule(function (module, exports) {
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	__export(InjectionToken);
	__export(Scope_1);
	__export(InjectorFactoryImpl);
	__export(errors);
	__export(tokens_1);

	});

	const floors = [
		{
			number: "1",
			image: "./assets/map/1st_floor.svg",
			offsets: [
				5.8,
				750.7
			]
		},
		{
			number: "2",
			image: "./assets/map/2nd_floor.svg",
			offsets: [
				5.8,
				815
			]
		}
	];
	const vertices = {
		"R100B:0": {
			floor: "1",
			location: [
				475.25,
				123.25
			]
		},
		"H8:9": {
			floor: "1",
			location: [
				409.25,
				187.5
			]
		},
		"H8:24": {
			floor: "1",
			location: [
				474.5,
				176.25
			],
			tags: [
				"stairs"
			]
		},
		"H7:13": {
			floor: "1",
			location: [
				534.75,
				294.5
			]
		},
		"R127C:0": {
			floor: "1",
			location: [
				158.5,
				28
			]
		},
		"R114:0": {
			floor: "1",
			location: [
				396,
				60
			]
		},
		"H8:21": {
			floor: "1",
			location: [
				260,
				222
			]
		},
		"R138A:1": {
			floor: "1",
			location: [
				380,
				103.5
			]
		},
		"R144:12": {
			floor: "1",
			location: [
				514.25,
				90
			]
		},
		"H7:37": {
			floor: "1",
			location: [
				542,
				347
			]
		},
		"H2:15": {
			floor: "1",
			location: [
				558,
				279.375
			]
		},
		"H9:22": {
			floor: "1",
			location: [
				193.75,
				37.125
			]
		},
		"I3:8:0": {
			floor: "1",
			location: [
				494.25,
				187.5
			]
		},
		"H9:24": {
			floor: "1",
			location: [
				193.75,
				43.25
			]
		},
		"R130A:1": {
			floor: "1",
			location: [
				265.75,
				194.5
			]
		},
		"R128B.4:1": {
			floor: "1",
			location: [
				193,
				194.5
			]
		},
		"R128C:0": {
			floor: "1",
			location: [
				199.75,
				194.5
			]
		},
		"R130Y:0": {
			floor: "1",
			location: [
				238.375,
				146.125
			]
		},
		"R146:0": {
			floor: "1",
			location: [
				564,
				213.75
			]
		},
		"R146:1": {
			floor: "1",
			location: [
				569.25,
				213.75
			]
		},
		"H5:2": {
			floor: "1",
			location: [
				21.25,
				62.25
			]
		},
		"H8:0": {
			floor: "1",
			location: [
				142.75,
				197.75
			]
		},
		"H4:4": {
			floor: "1",
			location: [
				162.25,
				119.25
			]
		},
		"R147Z:1": {
			floor: "1",
			location: [
				466.125,
				223.625
			]
		},
		"R112:0": {
			floor: "1",
			location: [
				417.75,
				60
			]
		},
		"R169A:0": {
			floor: "1",
			location: [
				176.25,
				291.375
			]
		},
		"H9:11": {
			floor: "1",
			location: [
				247.75,
				55
			]
		},
		"R128B.2:0": {
			floor: "1",
			location: [
				189.25,
				168.125
			]
		},
		"I11:15:1": {
			floor: "2",
			location: [
				375.75,
				305.5
			]
		},
		"R161Z:0": {
			floor: "1",
			location: [
				416,
				228.25
			]
		},
		"I13:16:2": {
			floor: "2",
			location: [
				495.25,
				68
			]
		},
		"H6:1": {
			floor: "1",
			location: [
				58.25,
				142.5
			]
		},
		"H13:13": {
			floor: "2",
			location: [
				350.25,
				43.75
			],
			tags: [
				"up",
				"stairs"
			]
		},
		"R155:0": {
			floor: "1",
			location: [
				468.25,
				275.25
			]
		},
		"H14:8": {
			floor: "2",
			location: [
				207,
				84.625
			]
		},
		"R128A:1": {
			floor: "1",
			location: [
				169.5,
				160.625
			]
		},
		"H12:2": {
			floor: "2",
			location: [
				253.25,
				170.25
			]
		},
		"H2:7": {
			floor: "1",
			location: [
				558,
				198.25
			]
		},
		"R241:0": {
			floor: "2",
			location: [
				285.25,
				174.125
			]
		},
		"REC13:0": {
			floor: "2",
			location: [
				205.125,
				47
			]
		},
		"R107:10": {
			floor: "1",
			location: [
				433,
				37
			]
		},
		"R169:4": {
			floor: "1",
			location: [
				153.25,
				277
			]
		},
		"R245A:0": {
			floor: "2",
			location: [
				412.3125,
				201.5
			]
		},
		"R262B:0": {
			floor: "2",
			location: [
				394,
				334.5
			]
		},
		"R137:1": {
			floor: "1",
			location: [
				116.25,
				262.5
			]
		},
		"R119:0": {
			floor: "1",
			location: [
				315,
				50
			]
		},
		"R128:0": {
			floor: "1",
			location: [
				174,
				145.5
			]
		},
		"H12:11": {
			floor: "2",
			location: [
				319.375,
				170.25
			]
		},
		"H12:19": {
			floor: "2",
			location: [
				445,
				180.75
			]
		},
		"R244A:0": {
			floor: "2",
			location: [
				524.6875,
				171.125
			]
		},
		"R245:0": {
			floor: "2",
			location: [
				445,
				189.375
			]
		},
		"R245C:0": {
			floor: "2",
			location: [
				433.75,
				277.25
			]
		},
		"R266:0": {
			floor: "2",
			location: [
				304.75,
				304.75
			]
		},
		"H2:3": {
			floor: "1",
			location: [
				558,
				242.5
			]
		},
		"H14:5": {
			floor: "2",
			location: [
				214.75,
				158.5
			]
		},
		"H5:1": {
			floor: "1",
			location: [
				21.25,
				78
			]
		},
		"RBSC3:0": {
			floor: "1",
			location: [
				429.25,
				209.625
			]
		},
		"H15:4": {
			floor: "2",
			location: [
				365.75,
				66.75
			]
		},
		"H16:5": {
			floor: "2",
			location: [
				558.375,
				198.125
			]
		},
		"H7:0": {
			floor: "1",
			location: [
				293,
				300
			]
		},
		"R147Z:0": {
			floor: "1",
			location: [
				480.125,
				223.625
			]
		},
		"R163B:0": {
			floor: "1",
			location: [
				364.5,
				293.75
			]
		},
		"RSBM201:0": {
			floor: "2",
			location: [
				422.25,
				176
			]
		},
		"R168:0": {
			floor: "1",
			location: [
				220.35,
				305
			]
		},
		"RBC200:0": {
			floor: "2",
			location: [
				481.125,
				50.75
			]
		},
		"R230:0": {
			floor: "2",
			location: [
				282.375,
				164.5
			]
		},
		"Rx100:1": {
			floor: "1",
			location: [
				567.5,
				186.75
			]
		},
		"H8:12": {
			floor: "1",
			location: [
				432,
				187.5
			]
		},
		"H1:12": {
			floor: "1",
			location: [
				378.5,
				66.5
			]
		},
		"R120:0": {
			floor: "1",
			location: [
				291.75,
				60
			]
		},
		"R138C:0": {
			floor: "1",
			location: [
				405.25,
				119.75
			]
		},
		"R261:1": {
			floor: "2",
			location: [
				392,
				294.125
			]
		},
		"R107F:0": {
			floor: "1",
			location: [
				433,
				33.75
			]
		},
		"R137C:0": {
			floor: "1",
			location: [
				128.75,
				247.5
			]
		},
		"R143:2": {
			floor: "1",
			location: [
				251.125,
				268
			]
		},
		"H7:42": {
			floor: "1",
			location: [
				457,
				300
			]
		},
		"H9:9": {
			floor: "1",
			location: [
				291.75,
				55
			]
		},
		"H2:13": {
			floor: "1",
			location: [
				562.875,
				162.375
			]
		},
		"RBW103:0": {
			floor: "1",
			location: [
				437.75,
				207
			]
		},
		"R261:3": {
			floor: "2",
			location: [
				392,
				287.25
			]
		},
		"H3:2": {
			floor: "1",
			location: [
				494.25,
				112.75
			]
		},
		"H8:7": {
			floor: "1",
			location: [
				265.75,
				197.75
			]
		},
		"R138B:0": {
			floor: "1",
			location: [
				399.75,
				103.5
			]
		},
		"H13:10": {
			floor: "2",
			location: [
				442.125,
				55.5
			]
		},
		"H14:2": {
			floor: "2",
			location: [
				227.5,
				216.375
			]
		},
		"H7:8": {
			floor: "1",
			location: [
				190.5,
				300
			]
		},
		"I1:7:4": {
			floor: "1",
			location: [
				434.875,
				288
			],
			tags: [
				"stairs",
				"down"
			]
		},
		"R128A:0": {
			floor: "1",
			location: [
				169.5,
				156.75
			]
		},
		"H11:21": {
			floor: "2",
			location: [
				534.5,
				295.25
			]
		},
		"H14:13": {
			floor: "2",
			location: [
				227.5,
				289.125
			]
		},
		"R115B:0": {
			floor: "1",
			location: [
				402.25,
				33.75
			]
		},
		"R143:4": {
			floor: "1",
			location: [
				245.8125,
				271
			],
			tags: [
				"stairs"
			]
		},
		"R107:2": {
			floor: "1",
			location: [
				478.25,
				37
			]
		},
		"H12:22": {
			floor: "2",
			location: [
				516.25,
				191.5
			]
		},
		"RBSC12:0": {
			floor: "2",
			location: [
				499.125,
				150.5
			]
		},
		"H12:17": {
			floor: "2",
			location: [
				414,
				180.75
			]
		},
		"RHS110:1": {
			floor: "1",
			location: [
				264.75,
				240
			]
		},
		"R127A:0": {
			floor: "1",
			location: [
				167.5,
				43.5
			]
		},
		"H12:5": {
			floor: "2",
			location: [
				294.625,
				170.25
			]
		},
		"R115:0": {
			floor: "1",
			location: [
				405.75,
				50
			]
		},
		"H13:8": {
			floor: "2",
			location: [
				411.875,
				55.5
			]
		},
		"R202:0": {
			floor: "2",
			location: [
				490.75,
				112.25
			]
		},
		"R137:3": {
			floor: "1",
			location: [
				116.25,
				218
			]
		},
		"R144:11": {
			floor: "1",
			location: [
				514.25,
				94.5
			]
		},
		"R107:9": {
			floor: "1",
			location: [
				444.75,
				37
			]
		},
		"H12:20": {
			floor: "2",
			location: [
				473.375,
				180.75
			]
		},
		"R258:0": {
			floor: "2",
			location: [
				438.5,
				310.125
			]
		},
		"H10:0": {
			floor: "1",
			location: [
				147.75,
				32.75
			]
		},
		"H7:29": {
			floor: "1",
			location: [
				175.5,
				308.25
			],
			tags: [
				"elevator"
			]
		},
		"H1:17": {
			floor: "1",
			location: [
				377.5,
				233.625
			]
		},
		"R128A:3": {
			floor: "1",
			location: [
				167,
				174.75
			]
		},
		"R128B.1:0": {
			floor: "1",
			location: [
				189.25,
				160.375
			]
		},
		"R138A:0": {
			floor: "1",
			location: [
				375.5,
				99.75
			]
		},
		"R153Z:0": {
			floor: "1",
			location: [
				527.5,
				264.625
			]
		},
		"H16:13": {
			floor: "2",
			location: [
				495.25,
				86.875
			]
		},
		"RBC205:0": {
			floor: "2",
			location: [
				329.625,
				307.125
			]
		},
		"H8:3": {
			floor: "1",
			location: [
				234.25,
				207.5
			],
			tags: [
				"stairs",
				"down"
			]
		},
		"R216:0": {
			floor: "2",
			location: [
				321,
				60
			]
		},
		"R247:0": {
			floor: "2",
			location: [
				516.25,
				196.875
			]
		},
		"R270:0": {
			floor: "2",
			location: [
				264.625,
				304.75
			]
		},
		"H8:11": {
			floor: "1",
			location: [
				429.25,
				187.5
			]
		},
		"REC12ERU6:0": {
			floor: "2",
			location: [
				464.25,
				60
			]
		},
		"R261:0": {
			floor: "2",
			location: [
				392,
				298
			]
		},
		"R238S:0": {
			floor: "2",
			location: [
				381.375,
				126.5
			]
		},
		"H7:46": {
			floor: "1",
			location: [
				251.25,
				300
			]
		},
		"R153Y:0": {
			floor: "1",
			location: [
				537,
				253.25
			]
		},
		"H11:8": {
			floor: "2",
			location: [
				392,
				305.5
			]
		},
		"R203B:0": {
			floor: "2",
			location: [
				508.125,
				74
			]
		},
		"H7:32": {
			floor: "1",
			location: [
				244.5,
				284
			]
		},
		"H2:14": {
			floor: "1",
			location: [
				558,
				206.125
			]
		},
		"R226:0": {
			floor: "2",
			location: [
				244.75,
				164.5
			]
		},
		"R238C:0": {
			floor: "2",
			location: [
				404.625,
				126.5
			]
		},
		"R128A.6:0": {
			floor: "1",
			location: [
				149.875,
				185.875
			]
		},
		"H14:14": {
			floor: "2",
			location: [
				233.25,
				289.125
			],
			tags: [
				"stairs",
				"up"
			]
		},
		"R107B:0": {
			floor: "1",
			location: [
				468.5,
				33.75
			]
		},
		"R128A:5": {
			floor: "1",
			location: [
				158.625,
				182.375
			]
		},
		"R166D:0": {
			floor: "1",
			location: [
				255.5,
				321.75
			]
		},
		"H16:9": {
			floor: "2",
			location: [
				495.25,
				142.875
			]
		},
		"R134:0": {
			floor: "1",
			location: [
				356,
				117.75
			]
		},
		"R230:1": {
			floor: "2",
			location: [
				309,
				164.5
			]
		},
		"RBM214:0": {
			floor: "2",
			location: [
				339.75,
				164.5
			]
		},
		"H4:11": {
			floor: "1",
			location: [
				186.5,
				79.25
			]
		},
		"REC1:0": {
			floor: "1",
			location: [
				465,
				60
			]
		},
		"R128A.2:0": {
			floor: "1",
			location: [
				177.75,
				167.875
			]
		},
		"R128B.3:0": {
			floor: "1",
			location: [
				189.25,
				181.75
			]
		},
		"H9:5": {
			floor: "1",
			location: [
				405.75,
				55
			]
		},
		"H8:28": {
			floor: "1",
			location: [
				463.25,
				187.5
			]
		},
		"R107:4": {
			floor: "1",
			location: [
				468.5,
				37
			]
		},
		"R152:0": {
			floor: "1",
			location: [
				522.25,
				300
			]
		},
		"H13:12": {
			floor: "2",
			location: [
				220.75,
				47
			],
			tags: [
				"stairs",
				"up"
			]
		},
		"R131:0": {
			floor: "1",
			location: [
				58.25,
				146.75
			]
		},
		"H13:0": {
			floor: "2",
			location: [
				220.75,
				55.5
			]
		},
		"H12:8": {
			floor: "2",
			location: [
				306.625,
				170.25
			]
		},
		"R159Z:1": {
			floor: "1",
			location: [
				416,
				246.75
			]
		},
		"R127E:0": {
			floor: "1",
			location: [
				158.5,
				55.5
			]
		},
		"H4:8": {
			floor: "1",
			location: [
				159.75,
				39.25
			]
		},
		"I4:9:0": {
			floor: "1",
			location: [
				174,
				55
			]
		},
		"RHS100:0": {
			floor: "1",
			location: [
				430.875,
				306
			]
		},
		"R169B:0": {
			floor: "1",
			location: [
				153.25,
				273.5
			]
		},
		"H11:20": {
			floor: "2",
			location: [
				525.625,
				295.25
			]
		},
		"H7:22": {
			floor: "1",
			location: [
				488,
				294.5
			]
		},
		"H13:5": {
			floor: "2",
			location: [
				321,
				55.5
			]
		},
		"H13:15": {
			floor: "2",
			location: [
				368.625,
				55.5
			]
		},
		"H16:11": {
			floor: "2",
			location: [
				495.25,
				112.25
			]
		},
		"H7:5": {
			floor: "1",
			location: [
				262.5,
				300
			]
		},
		"R128B:4": {
			floor: "1",
			location: [
				193,
				168.125
			]
		},
		"R217:0": {
			floor: "2",
			location: [
				321,
				49.625
			]
		},
		"R228:0": {
			floor: "2",
			location: [
				253.25,
				164.5
			]
		},
		"H6:3": {
			floor: "1",
			location: [
				98,
				142.5
			]
		},
		"H9:12": {
			floor: "1",
			location: [
				222.5,
				55
			]
		},
		"R238A:0": {
			floor: "2",
			location: [
				380.5,
				106.375
			]
		},
		"H2:9": {
			floor: "1",
			location: [
				571.5,
				198.25
			],
			tags: [
				"stairs",
				"up"
			]
		},
		"R242Z:0": {
			floor: "2",
			location: [
				490.375,
				152.5
			]
		},
		"H11:29": {
			floor: "2",
			location: [
				217.25,
				298.25
			]
		},
		"R159Z:0": {
			floor: "1",
			location: [
				420.875,
				250.375
			]
		},
		"H7:48": {
			floor: "1",
			location: [
				364.5,
				300
			]
		},
		"H7:34": {
			floor: "1",
			location: [
				262.5,
				287.5
			]
		},
		"H9:4": {
			floor: "1",
			location: [
				417.75,
				55
			]
		},
		"H3:7": {
			floor: "1",
			location: [
				494.25,
				155.875
			]
		},
		"H0:1": {
			floor: "1",
			location: [
				124,
				255.5
			]
		},
		"RAED100:0": {
			floor: "1",
			location: [
				481.25,
				160
			]
		},
		"I5:6:0": {
			floor: "1",
			location: [
				21.25,
				142.5
			]
		},
		"R128A.1:0": {
			floor: "1",
			location: [
				177.75,
				160.625
			]
		},
		"R107:5": {
			floor: "1",
			location: [
				463.75,
				37
			]
		},
		"H6:2": {
			floor: "1",
			location: [
				90.5,
				142.5
			]
		},
		"R166E:0": {
			floor: "1",
			location: [
				255.5,
				309.25
			]
		},
		"H2:1": {
			floor: "1",
			location: [
				558,
				271.5
			]
		},
		"H7:1": {
			floor: "1",
			location: [
				278,
				300
			]
		},
		"R143Z:0": {
			floor: "2",
			location: [
				246.0625,
				270.3125
			],
			tags: [
				"stairs"
			]
		},
		"R157Z:0": {
			floor: "1",
			location: [
				430.625,
				250.375
			]
		},
		"H12:29": {
			floor: "2",
			location: [
				240.75,
				191.375
			]
		},
		"H2:10": {
			floor: "1",
			location: [
				564.75,
				170.25
			]
		},
		"H7:35": {
			floor: "1",
			location: [
				589,
				294.5
			]
		},
		"H11:9": {
			floor: "2",
			location: [
				405,
				305.5
			]
		},
		"H15:6": {
			floor: "2",
			location: [
				379.625,
				66.75
			]
		},
		"H15:7": {
			floor: "2",
			location: [
				375.75,
				337.25
			],
			tags: [
				"up",
				"stairs"
			]
		},
		"RBM200:0": {
			floor: "2",
			location: [
				352,
				72.8125
			]
		},
		"R151:0": {
			floor: "1",
			location: [
				551.25,
				245.5
			]
		},
		"R201:0": {
			floor: "2",
			location: [
				499.125,
				142.875
			]
		},
		"R235D:0": {
			floor: "2",
			location: [
				214,
				147.75
			]
		},
		"R272:0": {
			floor: "2",
			location: [
				243.625,
				304.75
			]
		},
		"R100Z:0": {
			floor: "1",
			location: [
				479.25,
				121.25
			]
		},
		"I1:7:3": {
			floor: "1",
			location: [
				435,
				270.75
			]
		},
		"I13:14:0": {
			floor: "2",
			location: [
				207,
				55.5
			]
		},
		"RHS110:0": {
			floor: "1",
			location: [
				264.75,
				238
			]
		},
		"R206:0": {
			floor: "2",
			location: [
				485.625,
				64.5
			]
		},
		"H9:16": {
			floor: "1",
			location: [
				351.5,
				55
			]
		},
		"R256A:0": {
			floor: "2",
			location: [
				446,
				299.5
			]
		},
		"RAHU101:0": {
			floor: "1",
			location: [
				147.75,
				139.625
			]
		},
		"R201A:0": {
			floor: "2",
			location: [
				534,
				158.625
			]
		},
		"R132A:0": {
			floor: "1",
			location: [
				344.5,
				142
			]
		},
		"H9:2": {
			floor: "1",
			location: [
				441.75,
				55
			]
		},
		"H7:36": {
			floor: "1",
			location: [
				589,
				347
			]
		},
		"H1:7": {
			floor: "1",
			location: [
				366.75,
				110.5
			]
		},
		"H4:3": {
			floor: "1",
			location: [
				174,
				133.5
			]
		},
		"H7:19": {
			floor: "1",
			location: [
				430.875,
				300
			]
		},
		"H7:33": {
			floor: "1",
			location: [
				227.25,
				291
			]
		},
		"R1312:0": {
			floor: "1",
			location: [
				562,
				409
			]
		},
		"R137A:1": {
			floor: "1",
			location: [
				135.75,
				213.5
			]
		},
		"R138:0": {
			floor: "1",
			location: [
				375.5,
				106.25
			]
		},
		"R128B:1": {
			floor: "1",
			location: [
				193,
				181.75
			]
		},
		"H11:3": {
			floor: "2",
			location: [
				235.125,
				298.25
			],
			tags: [
				"stairs"
			]
		},
		"H11:10": {
			floor: "2",
			location: [
				413.625,
				305.5
			]
		},
		"H11:24": {
			floor: "2",
			location: [
				434.875,
				280.75
			],
			tags: [
				"down",
				"stairs"
			]
		},
		"RHS108:0": {
			floor: "1",
			location: [
				155,
				144.875
			]
		},
		"R132:0": {
			floor: "1",
			location: [
				344.5,
				189
			]
		},
		"H14:9": {
			floor: "2",
			location: [
				207,
				79.125
			]
		},
		"H15:2": {
			floor: "2",
			location: [
				365.75,
				118.75
			]
		},
		"R163W:0": {
			floor: "1",
			location: [
				364.25,
				219.75
			]
		},
		"H16:18": {
			floor: "2",
			location: [
				568.25,
				198.125
			],
			tags: [
				"stairs",
				"up"
			]
		},
		"Rx200:0": {
			floor: "2",
			location: [
				567,
				297.625
			]
		},
		"R130B:0": {
			floor: "1",
			location: [
				245.25,
				166.5
			]
		},
		"RWF200:0": {
			floor: "2",
			location: [
				419.25,
				177.125
			]
		},
		"H13:16": {
			floor: "2",
			location: [
				362.375,
				55.5
			]
		},
		"R201:1": {
			floor: "2",
			location: [
				499.125,
				106
			]
		},
		"REC5:0": {
			floor: "1",
			location: [
				178.75,
				331.25
			]
		},
		"I1:7:2": {
			floor: "1",
			location: [
				405,
				283.75
			]
		},
		"R221:0": {
			floor: "2",
			location: [
				275.25,
				49.625
			]
		},
		"R251:0": {
			floor: "2",
			location: [
				551.25,
				258.125
			]
		},
		"RWF103:0": {
			floor: "1",
			location: [
				144.75,
				296.75
			]
		},
		"RBW214:0": {
			floor: "2",
			location: [
				334.375,
				164.5
			]
		},
		"Rx201:0": {
			floor: "2",
			location: [
				472.75,
				290.625
			]
		},
		"R153Y:1": {
			floor: "1",
			location: [
				537,
				253.25
			]
		},
		"RCY3:0": {
			floor: "1",
			location: [
				474.5,
				271.875
			]
		},
		"H7:28": {
			floor: "1",
			location: [
				170,
				308.25
			],
			tags: [
				"stairs"
			]
		},
		"R144K:0": {
			floor: "1",
			location: [
				504.5,
				144.25
			]
		},
		"I12:16:2": {
			floor: "2",
			location: [
				558.375,
				191.5
			]
		},
		"RBW200:0": {
			floor: "2",
			location: [
				379.625,
				72.8125
			]
		},
		"R100:0": {
			floor: "1",
			location: [
				473,
				145.75
			]
		},
		"Rx203:0": {
			floor: "2",
			location: [
				215.25,
				156.875
			]
		},
		"RBC203:0": {
			floor: "2",
			location: [
				357.25,
				163.75
			]
		},
		"R205:0": {
			floor: "2",
			location: [
				490.125,
				55.75
			]
		},
		"H3:4": {
			floor: "1",
			location: [
				494.25,
				149.5
			]
		},
		"R153:0": {
			floor: "1",
			location: [
				524,
				289.75
			]
		},
		"R235A:0": {
			floor: "2",
			location: [
				195.625,
				158.75
			]
		},
		"R240:1": {
			floor: "2",
			location: [
				375.625,
				151.125
			]
		},
		"R274S:0": {
			floor: "2",
			location: [
				208.125,
				284.625
			]
		},
		"REC17:0": {
			floor: "2",
			location: [
				214,
				152.875
			]
		},
		"R137:2": {
			floor: "1",
			location: [
				116.25,
				282.25
			],
			tags: [
				"stairs"
			]
		},
		"RIDF103:0": {
			floor: "1",
			location: [
				254.25,
				213.25
			]
		},
		"H8:22": {
			floor: "1",
			location: [
				262.5,
				226.75
			]
		},
		"RBC102:0": {
			floor: "1",
			location: [
				251.25,
				295.75
			]
		},
		"I1:8:1": {
			floor: "1",
			location: [
				366.75,
				177
			]
		},
		"H2:6": {
			floor: "1",
			location: [
				558,
				201.5
			]
		},
		"Rx100:0": {
			floor: "1",
			location: [
				576.875,
				178.75
			]
		},
		"R1310:0": {
			floor: "1",
			location: [
				509.5,
				409.375
			]
		},
		"H12:4": {
			floor: "2",
			location: [
				285.25,
				170.25
			]
		},
		"R139:4": {
			floor: "1",
			location: [
				153.25,
				224
			]
		},
		"R225:0": {
			floor: "2",
			location: [
				246.625,
				49.625
			]
		},
		"R124:0": {
			floor: "1",
			location: [
				247.75,
				60
			]
		},
		"R256:0": {
			floor: "2",
			location: [
				465.875,
				299.5
			]
		},
		"H2:2": {
			floor: "1",
			location: [
				558,
				245.5
			]
		},
		"R142B:0": {
			floor: "1",
			location: [
				428.5,
				150.5
			]
		},
		"RAED101:0": {
			floor: "1",
			location: [
				255.875,
				295.75
			]
		},
		"I1:8:7": {
			floor: "1",
			location: [
				348,
				167.25
			]
		},
		"H14:3": {
			floor: "2",
			location: [
				226,
				210.125
			]
		},
		"RCY1:0": {
			floor: "1",
			location: [
				461.5,
				145.75
			]
		},
		"R236:0": {
			floor: "2",
			location: [
				356,
				110.125
			]
		},
		"H16:17": {
			floor: "2",
			location: [
				568.25,
				279.75
			],
			tags: [
				"down",
				"stairs"
			]
		},
		"H8:6": {
			floor: "1",
			location: [
				242.5,
				197.75
			]
		},
		"H0:2": {
			floor: "1",
			location: [
				124,
				247.5
			]
		},
		"H1:5": {
			floor: "1",
			location: [
				366.75,
				140.25
			]
		},
		"Rx101:0": {
			floor: "1",
			location: [
				231.5,
				216.625
			]
		},
		"R128B:3": {
			floor: "1",
			location: [
				193,
				160.375
			]
		},
		"H13:4": {
			floor: "2",
			location: [
				314.625,
				55.5
			]
		},
		"R176:0": {
			floor: "1",
			location: [
				166.25,
				315
			]
		},
		"H15:3": {
			floor: "2",
			location: [
				365.75,
				110.125
			]
		},
		"R246:0": {
			floor: "2",
			location: [
				563.875,
				212.5
			]
		},
		"R156:1": {
			floor: "1",
			location: [
				481,
				306.75
			]
		},
		"H12:28": {
			floor: "2",
			location: [
				240.75,
				170.25
			]
		},
		"R142:0": {
			floor: "1",
			location: [
				432,
				176.25
			]
		},
		"R248:0": {
			floor: "2",
			location: [
				563.875,
				241.125
			]
		},
		"H2:4": {
			floor: "1",
			location: [
				558,
				236
			]
		},
		"I3:9:0": {
			floor: "1",
			location: [
				491.25,
				63.25
			]
		},
		"H2:5": {
			floor: "1",
			location: [
				558,
				213.75
			]
		},
		"R162:1": {
			floor: "1",
			location: [
				293,
				308.125
			]
		},
		"R240A:1": {
			floor: "2",
			location: [
				408.125,
				151.25
			]
		},
		"R143:1": {
			floor: "1",
			location: [
				262.5,
				270
			]
		},
		"H5:3": {
			floor: "1",
			location: [
				21.25,
				55
			]
		},
		"R152Z:0": {
			floor: "1",
			location: [
				514.9375,
				313.3125
			]
		},
		"RBM105:0": {
			floor: "1",
			location: [
				188.875,
				79.25
			]
		},
		"R262C:0": {
			floor: "2",
			location: [
				397.75,
				333.25
			]
		},
		"H15:10": {
			floor: "2",
			location: [
				375.75,
				320.375
			]
		},
		"I1:8:4": {
			floor: "1",
			location: [
				354.5,
				161.5
			],
			tags: [
				"up",
				"stairs"
			]
		},
		"H8:27": {
			floor: "1",
			location: [
				193,
				197.75
			]
		},
		"R121:0": {
			floor: "1",
			location: [
				291.75,
				50
			]
		},
		"R139:1": {
			floor: "1",
			location: [
				128.75,
				218.25
			]
		},
		"RBC206:0": {
			floor: "2",
			location: [
				558.375,
				299
			]
		},
		"I11:16:0": {
			floor: "2",
			location: [
				558.375,
				295.25
			]
		},
		"H16:8": {
			floor: "2",
			location: [
				495.25,
				150.5
			]
		},
		"H8:20": {
			floor: "1",
			location: [
				260,
				197.75
			]
		},
		"H12:14": {
			floor: "2",
			location: [
				339.75,
				170.25
			]
		},
		"R163:3": {
			floor: "1",
			location: [
				364.25,
				239.75
			]
		},
		"R130A:3": {
			floor: "1",
			location: [
				242.5,
				173.25
			]
		},
		"H7:10": {
			floor: "1",
			location: [
				244.5,
				277
			]
		},
		"RBC101:0": {
			floor: "1",
			location: [
				481.25,
				155.875
			]
		},
		"I12:15:1": {
			floor: "2",
			location: [
				365.75,
				180.75
			]
		},
		"H11:5": {
			floor: "2",
			location: [
				310.375,
				298.25
			]
		},
		"H12:25": {
			floor: "2",
			location: [
				472.875,
				176
			],
			tags: [
				"stairs"
			]
		},
		"H14:1": {
			floor: "2",
			location: [
				227.5,
				216.375
			]
		},
		"H4:10": {
			floor: "1",
			location: [
				174,
				113.875
			]
		},
		"RBSC13:0": {
			floor: "2",
			location: [
				348,
				69.25
			]
		},
		"R210:0": {
			floor: "2",
			location: [
				442.125,
				60
			]
		},
		"H7:9": {
			floor: "1",
			location: [
				262.5,
				277
			]
		},
		"R261Z:0": {
			floor: "2",
			location: [
				395.6875,
				294.125
			]
		},
		"R107:3": {
			floor: "1",
			location: [
				471,
				37
			]
		},
		"R143:0": {
			floor: "1",
			location: [
				262.5,
				230
			]
		},
		"H3:8": {
			floor: "1",
			location: [
				494.25,
				160
			]
		},
		"R155A:0": {
			floor: "1",
			location: [
				461.75,
				277.75
			]
		},
		"R163:0": {
			floor: "1",
			location: [
				369.5,
				239.75
			]
		},
		"H11:2": {
			floor: "2",
			location: [
				270.5,
				298.25
			]
		},
		"H12:12": {
			floor: "2",
			location: [
				323.75,
				170.25
			]
		},
		"H13:2": {
			floor: "2",
			location: [
				269.5,
				55.5
			]
		},
		"R162:0": {
			floor: "1",
			location: [
				293,
				305
			]
		},
		"R146:2": {
			floor: "1",
			location: [
				569.25,
				211
			]
		},
		"R262A:0": {
			floor: "2",
			location: [
				397.75,
				329.75
			]
		},
		E0: {
			floor: "1",
			location: [
				572.25,
				162.5
			]
		},
		"REC15:0": {
			floor: "2",
			location: [
				356,
				139.5
			]
		},
		"H9:18": {
			floor: "1",
			location: [
				380.5,
				43.75
			],
			tags: [
				"stairs",
				"down"
			]
		},
		"H11:16": {
			floor: "2",
			location: [
				465.875,
				295.25
			]
		},
		"R154C:0": {
			floor: "1",
			location: [
				495,
				300
			]
		},
		"H1:10": {
			floor: "1",
			location: [
				366.75,
				66.5
			]
		},
		"RAHU10:0": {
			floor: "2",
			location: [
				252.125,
				204.5
			]
		},
		"R169:5": {
			floor: "1",
			location: [
				180.375,
				291.375
			]
		},
		"H13:1": {
			floor: "2",
			location: [
				246.625,
				55.5
			]
		},
		"R130E:0": {
			floor: "1",
			location: [
				238.375,
				187.125
			]
		},
		"R140:0": {
			floor: "1",
			location: [
				409.25,
				176.25
			]
		},
		"R215:0": {
			floor: "2",
			location: [
				411.875,
				49.625
			]
		},
		"H14:16": {
			floor: "2",
			location: [
				226,
				202.625
			]
		},
		"RSBM200:0": {
			floor: "2",
			location: [
				348,
				63.5
			]
		},
		"R243:0": {
			floor: "2",
			location: [
				357.875,
				178.375
			]
		},
		"RBC202:0": {
			floor: "2",
			location: [
				213.125,
				64.375
			]
		},
		"R222:0": {
			floor: "2",
			location: [
				269.5,
				60
			]
		},
		"R126:0": {
			floor: "1",
			location: [
				184,
				97.5
			]
		},
		"RHS106:0": {
			floor: "1",
			location: [
				361.25,
				57.75
			]
		},
		"R241B:0": {
			floor: "2",
			location: [
				306.625,
				174.125
			]
		},
		"H9:15": {
			floor: "1",
			location: [
				217.5,
				44.125
			],
			tags: [
				"up",
				"stairs"
			]
		},
		"H8:15": {
			floor: "1",
			location: [
				517,
				187.5
			]
		},
		"I12:14:0": {
			floor: "2",
			location: [
				226,
				170.25
			]
		},
		"REC6:0": {
			floor: "1",
			location: [
				132.375,
				191.75
			]
		},
		"H7:27": {
			floor: "1",
			location: [
				140.5,
				300
			]
		},
		"H7:31": {
			floor: "1",
			location: [
				237.5,
				291
			],
			tags: [
				"stairs",
				"up"
			]
		},
		"R163:5": {
			floor: "1",
			location: [
				350.875,
				266.125
			]
		},
		"I0:7:0": {
			floor: "1",
			location: [
				124,
				300
			]
		},
		"H9:1": {
			floor: "1",
			location: [
				469.75,
				55
			]
		},
		"R218:0": {
			floor: "2",
			location: [
				314.625,
				60
			]
		},
		"H3:3": {
			floor: "1",
			location: [
				494.25,
				124.75
			]
		},
		"R166S:0": {
			floor: "1",
			location: [
				241.75,
				309.25
			]
		},
		"R118:0": {
			floor: "1",
			location: [
				315,
				60
			]
		},
		"H0:0": {
			floor: "1",
			location: [
				124,
				279.5
			]
		},
		"R224:0": {
			floor: "2",
			location: [
				246.625,
				60
			]
		},
		"RBSC5:0": {
			floor: "1",
			location: [
				188.875,
				71.375
			]
		},
		"RAHU3:0": {
			floor: "1",
			location: [
				205.25,
				37.125
			]
		},
		"R238:0": {
			floor: "2",
			location: [
				375.625,
				110.125
			]
		},
		"R110:0": {
			floor: "1",
			location: [
				441.75,
				60
			]
		},
		"R127G:0": {
			floor: "1",
			location: [
				157,
				123.5
			]
		},
		"H13:7": {
			floor: "2",
			location: [
				379.375,
				55.5
			]
		},
		"H1:4": {
			floor: "1",
			location: [
				377.5,
				228.25
			]
		},
		"R128A:6": {
			floor: "1",
			location: [
				149.875,
				182.375
			]
		},
		"R148:1": {
			floor: "1",
			location: [
				564,
				271.5
			]
		},
		"H11:4": {
			floor: "2",
			location: [
				304.75,
				298.25
			]
		},
		"R128A:7": {
			floor: "1",
			location: [
				169.5,
				174.75
			]
		},
		"R255:0": {
			floor: "2",
			location: [
				465.875,
				290.625
			]
		},
		"I12:16:1": {
			floor: "2",
			location: [
				495.25,
				191.5
			]
		},
		"R200:0": {
			floor: "2",
			location: [
				490.75,
				118.625
			]
		},
		"H7:47": {
			floor: "1",
			location: [
				175.5,
				331.25
			]
		},
		"R127:0": {
			floor: "1",
			location: [
				164,
				86.25
			]
		},
		"R142S:0": {
			floor: "1",
			location: [
				447.25,
				171
			]
		},
		"R144J:0": {
			floor: "1",
			location: [
				512.25,
				125.25
			]
		},
		"H11:12": {
			floor: "2",
			location: [
				425.125,
				295.25
			]
		},
		"H16:4": {
			floor: "2",
			location: [
				558.375,
				212.5
			]
		},
		"R107A:0": {
			floor: "1",
			location: [
				478.25,
				33.75
			]
		},
		"R111:0": {
			floor: "1",
			location: [
				438.5,
				50
			]
		},
		"R115Z:0": {
			floor: "1",
			location: [
				401.25,
				44.5
			]
		},
		"R137A:0": {
			floor: "1",
			location: [
				142.75,
				203.75
			]
		},
		"R139B:0": {
			floor: "1",
			location: [
				153.25,
				226.25
			]
		},
		"R161A:0": {
			floor: "1",
			location: [
				400.75,
				219.75
			]
		},
		"H0:4": {
			floor: "1",
			location: [
				124,
				262.5
			]
		},
		"H6:4": {
			floor: "1",
			location: [
				147.75,
				142.5
			]
		},
		"RERU15:0": {
			floor: "2",
			location: [
				383.875,
				69.25
			]
		},
		"R139:2": {
			floor: "1",
			location: [
				180.375,
				224
			]
		},
		"R174:0": {
			floor: "1",
			location: [
				178.75,
				347
			]
		},
		"R124:1": {
			floor: "1",
			location: [
				247.75,
				63.125
			]
		},
		"H9:0": {
			floor: "1",
			location: [
				485.5,
				57
			]
		},
		"R100Y:0": {
			floor: "1",
			location: [
				486.75,
				121.25
			]
		},
		"I11:15:0": {
			floor: "2",
			location: [
				361.5,
				298.25
			]
		},
		"H12:18": {
			floor: "2",
			location: [
				422.25,
				180.75
			]
		},
		"R203A:0": {
			floor: "2",
			location: [
				501.875,
				75.125
			]
		},
		E1: {
			floor: "1",
			location: [
				583.75,
				294.5
			]
		},
		"R254:0": {
			floor: "2",
			location: [
				511.375,
				299.5
			]
		},
		"I1:8:6": {
			floor: "1",
			location: [
				354.5,
				167.25
			]
		},
		"H9:6": {
			floor: "1",
			location: [
				396,
				55
			]
		},
		"H9:8": {
			floor: "1",
			location: [
				315,
				55
			]
		},
		"H9:21": {
			floor: "1",
			location: [
				193.75,
				55
			]
		},
		"R107:8": {
			floor: "1",
			location: [
				450.25,
				37
			]
		},
		"R107:11": {
			floor: "1",
			location: [
				427.25,
				37
			]
		},
		"R144:6": {
			floor: "1",
			location: [
				514.25,
				128.75
			]
		},
		"R107C:0": {
			floor: "1",
			location: [
				463.75,
				33.75
			]
		},
		"R100:1": {
			floor: "1",
			location: [
				482,
				127
			]
		},
		"R144:10": {
			floor: "1",
			location: [
				514.25,
				99.5
			]
		},
		"I1:8:3": {
			floor: "1",
			location: [
				354.5,
				187.5
			]
		},
		"RBC100:0": {
			floor: "1",
			location: [
				457,
				306
			]
		},
		"R154Y:0": {
			floor: "1",
			location: [
				514.9375,
				324.5
			]
		},
		"H11:1": {
			floor: "2",
			location: [
				264.625,
				298.25
			]
		},
		"H12:0": {
			floor: "2",
			location: [
				212.875,
				170.25
			]
		},
		"H15:8": {
			floor: "2",
			location: [
				365.75,
				163.75
			]
		},
		"R244Z:0": {
			floor: "2",
			location: [
				524.5,
				162.75
			]
		},
		"H11:28": {
			floor: "2",
			location: [
				541.125,
				295.25
			]
		},
		"R262:0": {
			floor: "2",
			location: [
				384.25,
				312.625
			]
		},
		"RWF100:0": {
			floor: "1",
			location: [
				433.875,
				275.5
			]
		},
		"H11:15": {
			floor: "2",
			location: [
				438.5,
				295.25
			]
		},
		"H16:6": {
			floor: "2",
			location: [
				495.25,
				161
			]
		},
		"R240A:0": {
			floor: "2",
			location: [
				428.25,
				151.5
			]
		},
		"H8:8": {
			floor: "1",
			location: [
				278.5,
				197.75
			]
		},
		"R127F:0": {
			floor: "1",
			location: [
				158.5,
				118.25
			]
		},
		"R105:0": {
			floor: "1",
			location: [
				495,
				60.25
			]
		},
		"H11:0": {
			floor: "2",
			location: [
				243.625,
				298.25
			]
		},
		"H7:23": {
			floor: "1",
			location: [
				474.5,
				275.25
			]
		},
		"R107I:0": {
			floor: "1",
			location: [
				462.25,
				39.5
			]
		},
		"R128B:0": {
			floor: "1",
			location: [
				189.25,
				152
			]
		},
		"H12:1": {
			floor: "2",
			location: [
				244.75,
				170.25
			]
		},
		"Rx102:0": {
			floor: "1",
			location: [
				569.625,
				279.375
			]
		},
		"H1:6": {
			floor: "1",
			location: [
				366.75,
				117.75
			]
		},
		"H7:41": {
			floor: "1",
			location: [
				437.875,
				300
			]
		},
		"I13:15:0": {
			floor: "2",
			location: [
				365.75,
				55.5
			]
		},
		"H12:27": {
			floor: "2",
			location: [
				419.25,
				180.75
			]
		},
		"R245:2": {
			floor: "2",
			location: [
				412.3125,
				206.25
			]
		},
		"R144H:0": {
			floor: "1",
			location: [
				512.25,
				99.5
			]
		},
		"R144:4": {
			floor: "1",
			location: [
				514.25,
				148.75
			]
		},
		"RHS104:0": {
			floor: "1",
			location: [
				561.625,
				163.75
			]
		},
		"H11:11": {
			floor: "2",
			location: [
				425.125,
				305.5
			]
		},
		"RHS109:0": {
			floor: "1",
			location: [
				115,
				262.5
			]
		},
		"I11:14:0": {
			floor: "2",
			location: [
				227.5,
				298.25
			]
		},
		"H16:15": {
			floor: "2",
			location: [
				495.25,
				71.5
			]
		},
		"R147:1": {
			floor: "1",
			location: [
				517,
				197
			]
		},
		"H4:12": {
			floor: "1",
			location: [
				186.5,
				89.375
			]
		},
		"R158:0": {
			floor: "1",
			location: [
				405,
				301.5
			]
		},
		"R169:0": {
			floor: "1",
			location: [
				223,
				277
			]
		},
		"R124Z:0": {
			floor: "1",
			location: [
				236.875,
				63.125
			]
		},
		"H6:0": {
			floor: "1",
			location: [
				51,
				142.5
			]
		},
		"R163:4": {
			floor: "1",
			location: [
				350.875,
				239.75
			]
		},
		"I1:7:1": {
			floor: "1",
			location: [
				416.75,
				283.75
			]
		},
		"R169:2": {
			floor: "1",
			location: [
				180.375,
				277
			]
		},
		"H11:26": {
			floor: "2",
			location: [
				338,
				307.125
			]
		},
		"H9:14": {
			floor: "1",
			location: [
				206.75,
				55
			],
			tags: [
				"up",
				"stairs"
			]
		},
		"R107:1": {
			floor: "1",
			location: [
				485.75,
				37
			]
		},
		"R201A:1": {
			floor: "2",
			location: [
				526.75,
				159.5625
			]
		},
		"R128B:2": {
			floor: "1",
			location: [
				193,
				152
			]
		},
		"R144D:0": {
			floor: "1",
			location: [
				516.25,
				90
			]
		},
		"H1:3": {
			floor: "1",
			location: [
				377.5,
				239.75
			]
		},
		"H12:3": {
			floor: "2",
			location: [
				282.375,
				170.25
			]
		},
		"R102:0": {
			floor: "1",
			location: [
				490.75,
				112.75
			]
		},
		"R223:0": {
			floor: "2",
			location: [
				269.5,
				49.625
			]
		},
		"H2:8": {
			floor: "1",
			location: [
				569.375,
				286.5
			],
			tags: [
				"down",
				"stairs"
			]
		},
		"H9:13": {
			floor: "1",
			location: [
				217.5,
				55
			]
		},
		"R249:0": {
			floor: "2",
			location: [
				546.25,
				196.875
			]
		},
		"H16:10": {
			floor: "2",
			location: [
				495.25,
				118.625
			]
		},
		"R261Z:1": {
			floor: "2",
			location: [
				420.75,
				294.125
			]
		},
		"R128A.3:0": {
			floor: "1",
			location: [
				174.25,
				174.75
			]
		},
		"R232:0": {
			floor: "2",
			location: [
				319.375,
				164.5
			]
		},
		"R220:0": {
			floor: "2",
			location: [
				275.25,
				60
			]
		},
		"H7:30": {
			floor: "1",
			location: [
				175.5,
				347
			]
		},
		"R107E:0": {
			floor: "1",
			location: [
				444.75,
				33.75
			]
		},
		"I5:10:0": {
			floor: "1",
			location: [
				21.25,
				32.75
			]
		},
		"H9:20": {
			floor: "1",
			location: [
				361.25,
				55
			]
		},
		"RHS111:0": {
			floor: "1",
			location: [
				373.25,
				233.625
			]
		},
		"RHS101:0": {
			floor: "1",
			location: [
				437.875,
				306
			]
		},
		"R276:0": {
			floor: "2",
			location: [
				223.375,
				274.75
			]
		},
		"R127B:0": {
			floor: "1",
			location: [
				164.5,
				37.75
			]
		},
		"R107:6": {
			floor: "1",
			location: [
				462.25,
				37
			]
		},
		"R241A:0": {
			floor: "2",
			location: [
				294.625,
				174.125
			]
		},
		"R261:4": {
			floor: "2",
			location: [
				394.0625,
				278.5
			]
		},
		"R144:14": {
			floor: "1",
			location: [
				514.25,
				75.75
			]
		},
		"R128A:4": {
			floor: "1",
			location: [
				158.625,
				174.75
			]
		},
		"H1:19": {
			floor: "1",
			location: [
				366.75,
				142
			]
		},
		"H7:45": {
			floor: "1",
			location: [
				255.875,
				300
			]
		},
		"R163:2": {
			floor: "1",
			location: [
				266.25,
				226.75
			]
		},
		"R139Z:0": {
			floor: "1",
			location: [
				163,
				226.25
			]
		},
		"RHS105:0": {
			floor: "1",
			location: [
				380.5,
				57.75
			]
		},
		"R201:2": {
			floor: "2",
			location: [
				527.625,
				146.3125
			]
		},
		"R145:0": {
			floor: "1",
			location: [
				437.5,
				255.5
			]
		},
		"R169:1": {
			floor: "1",
			location: [
				128.75,
				279.5
			]
		},
		"H14:0": {
			floor: "2",
			location: [
				227.5,
				274.75
			]
		},
		"R234:0": {
			floor: "2",
			location: [
				356,
				118.75
			]
		},
		"H8:5": {
			floor: "1",
			location: [
				225.75,
				222
			]
		},
		"H1:9": {
			floor: "1",
			location: [
				366.75,
				99.75
			]
		},
		"RBM103:0": {
			floor: "1",
			location: [
				420.75,
				207
			]
		},
		"R150:0": {
			floor: "1",
			location: [
				549,
				300
			]
		},
		"R144:8": {
			floor: "1",
			location: [
				514.25,
				105
			]
		},
		"H11:19": {
			floor: "2",
			location: [
				518.25,
				295.25
			]
		},
		"H3:6": {
			floor: "1",
			location: [
				461.5,
				149.5
			]
		},
		"R130B:1": {
			floor: "1",
			location: [
				245.25,
				162.625
			]
		},
		"RAHU102:0": {
			floor: "1",
			location: [
				147.75,
				35.875
			]
		},
		"R144Z:0": {
			floor: "1",
			location: [
				499.375,
				107.75
			]
		},
		"H11:18": {
			floor: "2",
			location: [
				511.375,
				295.25
			]
		},
		"H1:8": {
			floor: "1",
			location: [
				366.75,
				106.25
			]
		},
		"H16:0": {
			floor: "2",
			location: [
				558.375,
				279.75
			]
		},
		"R203C:0": {
			floor: "2",
			location: [
				508.125,
				70.125
			]
		},
		"H4:0": {
			floor: "1",
			location: [
				174,
				79.25
			]
		},
		"R166A:0": {
			floor: "1",
			location: [
				241.75,
				321.75
			]
		},
		"R144:7": {
			floor: "1",
			location: [
				514.25,
				125.25
			]
		},
		"H11:27": {
			floor: "2",
			location: [
				433.75,
				280.75
			]
		},
		"RBW104:0": {
			floor: "1",
			location: [
				378.5,
				72.875
			]
		},
		"R139:0": {
			floor: "1",
			location: [
				220,
				222
			]
		},
		"R141:0": {
			floor: "1",
			location: [
				225.75,
				226
			]
		},
		"R149:1": {
			floor: "1",
			location: [
				551.25,
				236
			]
		},
		"H11:23": {
			floor: "2",
			location: [
				554.875,
				295.25
			]
		},
		"H8:23": {
			floor: "1",
			location: [
				474.5,
				187.5
			]
		},
		"H9:7": {
			floor: "1",
			location: [
				336.75,
				55
			]
		},
		"H12:26": {
			floor: "2",
			location: [
				352.625,
				156.625
			],
			tags: [
				"stairs",
				"up"
			]
		},
		"R207:0": {
			floor: "2",
			location: [
				485.75,
				51.625
			]
		},
		"H7:43": {
			floor: "1",
			location: [
				570.625,
				294.5
			]
		},
		"R166B:0": {
			floor: "1",
			location: [
				245,
				328.25
			]
		},
		"R145:1": {
			floor: "1",
			location: [
				461.25,
				197
			]
		},
		"H11:14": {
			floor: "2",
			location: [
				438.5,
				305.5
			]
		},
		"RBW105:0": {
			floor: "1",
			location: [
				188.875,
				89.375
			]
		},
		"RWF101:0": {
			floor: "1",
			location: [
				383.125,
				66.5
			]
		},
		"RWF102:0": {
			floor: "1",
			location: [
				147.25,
				202.75
			]
		},
		"RCP2:0": {
			floor: "1",
			location: [
				436.375,
				280.625
			]
		},
		"H11:6": {
			floor: "2",
			location: [
				338,
				298.25
			]
		},
		"R154Z:0": {
			floor: "1",
			location: [
				502.875,
				308.9375
			]
		},
		"H15:1": {
			floor: "2",
			location: [
				365.75,
				151.125
			]
		},
		"R211:0": {
			floor: "2",
			location: [
				442.125,
				49.625
			]
		},
		"R107:7": {
			floor: "1",
			location: [
				452.5,
				37
			]
		},
		"I1:8:5": {
			floor: "1",
			location: [
				377.5,
				197.75
			]
		},
		"H11:17": {
			floor: "2",
			location: [
				472.75,
				295.25
			]
		},
		"RBM104:0": {
			floor: "1",
			location: [
				353,
				72.875
			]
		},
		"H15:11": {
			floor: "2",
			location: [
				365.75,
				139.5
			]
		},
		"R144:0": {
			floor: "1",
			location: [
				526,
				172
			]
		},
		"R156:0": {
			floor: "1",
			location: [
				433.75,
				306.75
			]
		},
		"H7:26": {
			floor: "1",
			location: [
				237.5,
				284
			],
			tags: [
				"elevator"
			]
		},
		"R235:0": {
			floor: "2",
			location: [
				200.5,
				154.875
			]
		},
		"R244:0": {
			floor: "2",
			location: [
				541.625,
				186
			]
		},
		"H8:4": {
			floor: "1",
			location: [
				225.75,
				197.75
			]
		},
		"I4:6:1": {
			floor: "1",
			location: [
				155,
				142.5
			]
		},
		"R1311:0": {
			floor: "1",
			location: [
				534.375,
				421.875
			]
		},
		"H1:16": {
			floor: "1",
			location: [
				373.25,
				239.75
			]
		},
		"R142A:1": {
			floor: "1",
			location: [
				428.5,
				170.75
			]
		},
		"I0:8:0": {
			floor: "1",
			location: [
				124,
				197.75
			]
		},
		"R139:3": {
			floor: "1",
			location: [
				163,
				224
			]
		},
		"RIDF104:0": {
			floor: "1",
			location: [
				18.5,
				62.25
			]
		},
		"R161:0": {
			floor: "1",
			location: [
				400.75,
				228.25
			]
		},
		"H5:0": {
			floor: "1",
			location: [
				21.25,
				130.75
			]
		},
		"R252:0": {
			floor: "2",
			location: [
				518.25,
				299.5
			]
		},
		"R260:0": {
			floor: "2",
			location: [
				413.625,
				310.125
			]
		},
		"R261A:0": {
			floor: "2",
			location: [
				388.375,
				291.5
			]
		},
		"R139:5": {
			floor: "1",
			location: [
				180.375,
				217.75
			]
		},
		"H14:4": {
			floor: "2",
			location: [
				226,
				193.375
			],
			tags: [
				"stairs"
			]
		},
		"RHS102:0": {
			floor: "1",
			location: [
				379.75,
				306
			]
		},
		"H4:1": {
			floor: "1",
			location: [
				174,
				86.25
			]
		},
		"R138D:0": {
			floor: "1",
			location: [
				375.5,
				140.25
			]
		},
		"H12:6": {
			floor: "2",
			location: [
				306.5,
				170.25
			]
		},
		"R164:0": {
			floor: "1",
			location: [
				278,
				305
			]
		},
		"R137:0": {
			floor: "1",
			location: [
				118.75,
				262.5
			]
		},
		"R172:0": {
			floor: "1",
			location: [
				190.5,
				305
			]
		},
		"RBC104:0": {
			floor: "1",
			location: [
				183.5,
				113.875
			]
		},
		"R107:0": {
			floor: "1",
			location: [
				485.75,
				51.5
			]
		},
		"H8:1": {
			floor: "1",
			location: [
				199.75,
				197.75
			]
		},
		"H13:14": {
			floor: "2",
			location: [
				379.375,
				43.75
			],
			tags: [
				"down",
				"stairs"
			]
		},
		"R163:1": {
			floor: "1",
			location: [
				266.25,
				273.5
			]
		},
		"H16:1": {
			floor: "2",
			location: [
				558.375,
				241.125
			]
		},
		"R227:0": {
			floor: "2",
			location: [
				200.5,
				48.5
			]
		},
		"R245:1": {
			floor: "2",
			location: [
				430.6875,
				206.25
			]
		},
		"R107H:0": {
			floor: "1",
			location: [
				452.5,
				39.5
			]
		},
		"I1:8:2": {
			floor: "1",
			location: [
				354.5,
				197.75
			]
		},
		"H11:7": {
			floor: "2",
			location: [
				338,
				312.875
			]
		},
		"H14:11": {
			floor: "2",
			location: [
				207,
				154.875
			]
		},
		"H14:12": {
			floor: "2",
			location: [
				229,
				202.25
			],
			tags: [
				"down",
				"stairs"
			]
		},
		"R242A:0": {
			floor: "2",
			location: [
				490.375,
				159.875
			]
		},
		"R139A:0": {
			floor: "1",
			location: [
				176.25,
				217.75
			]
		},
		"R137E:0": {
			floor: "1",
			location: [
				135.75,
				283.4
			]
		},
		"H14:10": {
			floor: "2",
			location: [
				207,
				73.375
			]
		},
		"H11:22": {
			floor: "2",
			location: [
				548,
				295.25
			]
		},
		"H1:1": {
			floor: "1",
			location: [
				377.5,
				351
			]
		},
		"H12:7": {
			floor: "2",
			location: [
				294.625,
				170.25
			]
		},
		"R249:1": {
			floor: "2",
			location: [
				551.25,
				234.625
			]
		},
		"R115A:0": {
			floor: "1",
			location: [
				407,
				33.75
			]
		},
		"R274:0": {
			floor: "2",
			location: [
				207.75,
				298.25
			]
		},
		"RBM210:0": {
			floor: "2",
			location: [
				334,
				312.875
			]
		},
		"R262D:0": {
			floor: "2",
			location: [
				368.125,
				320.125
			]
		},
		"H7:16": {
			floor: "1",
			location: [
				549,
				294.5
			]
		},
		"R163Y:0": {
			floor: "1",
			location: [
				358.125,
				266.125
			]
		},
		"RHS103:0": {
			floor: "1",
			location: [
				570.625,
				291.875
			]
		},
		"R169Z:0": {
			floor: "1",
			location: [
				163,
				273.5
			]
		},
		"RERU7:0": {
			floor: "2",
			location: [
				499.125,
				161
			]
		},
		"R143Z:1": {
			floor: "2",
			location: [
				246.0625,
				268.3125
			],
			tags: [
				"stairs"
			]
		},
		"I1:9:0": {
			floor: "1",
			location: [
				366.75,
				55
			]
		},
		"R144G:0": {
			floor: "1",
			location: [
				512.25,
				75.75
			]
		},
		"H1:14": {
			floor: "1",
			location: [
				377.5,
				219.75
			]
		},
		"R212:0": {
			floor: "2",
			location: [
				418.625,
				60
			]
		},
		"R138S:0": {
			floor: "1",
			location: [
				380,
				119.75
			]
		},
		"RERU4:0": {
			floor: "2",
			location: [
				214,
				86.875
			]
		},
		"R130Z:0": {
			floor: "1",
			location: [
				238.375,
				162.625
			]
		},
		"R150A:0": {
			floor: "1",
			location: [
				565.57,
				323.25
			]
		},
		"RBSC2EC3:0": {
			floor: "1",
			location: [
				541.75,
				289.75
			]
		},
		"H14:15": {
			floor: "2",
			location: [
				207,
				64.375
			]
		},
		"H15:5": {
			floor: "2",
			location: [
				352,
				66.75
			]
		},
		"RBSC14:0": {
			floor: "2",
			location: [
				216.5,
				158.75
			]
		},
		"H0:3": {
			floor: "1",
			location: [
				124,
				218.25
			]
		},
		"H7:14": {
			floor: "1",
			location: [
				237.5,
				277
			],
			tags: [
				"stairs",
				"up"
			]
		},
		"H8:10": {
			floor: "1",
			location: [
				422,
				187.5
			]
		},
		"H7:3": {
			floor: "1",
			location: [
				244.5,
				300
			]
		},
		"R128A.3:1": {
			floor: "1",
			location: [
				189.25,
				174.75
			]
		},
		"R129:0": {
			floor: "1",
			location: [
				51,
				146.75
			]
		},
		"H7:15": {
			floor: "1",
			location: [
				227.25,
				277
			]
		},
		"H9:10": {
			floor: "1",
			location: [
				269.25,
				55
			]
		},
		"H16:19": {
			floor: "2",
			location: [
				558.375,
				258.125
			]
		},
		"RBSC10:0": {
			floor: "2",
			location: [
				338,
				315.75
			]
		},
		"R147:0": {
			floor: "1",
			location: [
				485.5,
				197
			]
		},
		"H4:13": {
			floor: "1",
			location: [
				186.5,
				71.375
			]
		},
		"R240Z:0": {
			floor: "2",
			location: [
				424.25,
				161.125
			]
		},
		"I12:14:1": {
			floor: "2",
			location: [
				207,
				162.5
			]
		},
		"R219:0": {
			floor: "2",
			location: [
				314.625,
				49.625
			]
		},
		"H7:17": {
			floor: "1",
			location: [
				175.5,
				300
			]
		},
		"RCY2:0": {
			floor: "1",
			location: [
				222.5,
				92
			]
		},
		"RAHU104:0": {
			floor: "1",
			location: [
				491.125,
				80.875
			]
		},
		"R130C:0": {
			floor: "1",
			location: [
				278.5,
				194.5
			]
		},
		"H9:23": {
			floor: "1",
			location: [
				465,
				55
			]
		},
		"H13:9": {
			floor: "2",
			location: [
				418.625,
				55.5
			]
		},
		"R136:0": {
			floor: "1",
			location: [
				356,
				110.5
			]
		},
		"R144:13": {
			floor: "1",
			location: [
				514.25,
				84.5
			]
		},
		"H7:11": {
			floor: "1",
			location: [
				210.25,
				300
			]
		},
		"REC9:0": {
			floor: "1",
			location: [
				205.25,
				43.25
			]
		},
		"H4:9": {
			floor: "1",
			location: [
				174,
				62
			]
		},
		"R144:15": {
			floor: "1",
			location: [
				514.25,
				73
			]
		},
		"R238B:0": {
			floor: "2",
			location: [
				398.625,
				106.375
			]
		},
		"RHS107:0": {
			floor: "1",
			location: [
				175.125,
				37.125
			]
		},
		"H3:1": {
			floor: "1",
			location: [
				494.25,
				70.5
			]
		},
		"R107J:0": {
			floor: "1",
			location: [
				471,
				39.5
			]
		},
		"I4:10:0": {
			floor: "1",
			location: [
				155.25,
				32.75
			]
		},
		"H1:2": {
			floor: "1",
			location: [
				377.5,
				246.75
			]
		},
		"H1:15": {
			floor: "1",
			location: [
				377.5,
				306
			]
		},
		"R123:0": {
			floor: "1",
			location: [
				269.25,
				50
			]
		},
		"R165:0": {
			floor: "1",
			location: [
				257.75,
				287.5
			]
		},
		"H13:6": {
			floor: "2",
			location: [
				350.25,
				55.5
			]
		},
		"H14:7": {
			floor: "2",
			location: [
				207,
				86.875
			]
		},
		"R278:0": {
			floor: "2",
			location: [
				223.375,
				216.375
			]
		},
		"H7:40": {
			floor: "1",
			location: [
				433.75,
				300
			]
		},
		"H7:25": {
			floor: "1",
			location: [
				523.25,
				294.5
			]
		},
		"I1:7:0": {
			floor: "1",
			location: [
				377.5,
				300
			]
		},
		"H11:31": {
			floor: "1",
			location: [
				220,
				340
			],
			tags: [
				"stairs"
			]
		},
		"I4:6:0": {
			floor: "1",
			location: [
				174,
				142.5
			]
		},
		"H1:18": {
			floor: "1",
			location: [
				377.5,
				318.625
			]
		},
		"R117:0": {
			floor: "1",
			location: [
				336.75,
				50
			]
		},
		"H8:30": {
			floor: "1",
			location: [
				225.75,
				216.625
			]
		},
		"H8:29": {
			floor: "1",
			location: [
				260,
				213.25
			]
		},
		"RBW202:0": {
			floor: "2",
			location: [
				548,
				282.125
			]
		},
		"H8:18": {
			floor: "1",
			location: [
				242.5,
				216
			],
			tags: [
				"elevator"
			]
		},
		"I13:16:0": {
			floor: "2",
			location: [
				482.125,
				55.5
			]
		},
		"RHS201:0": {
			floor: "2",
			location: [
				383.625,
				320.375
			]
		},
		"R116:0": {
			floor: "1",
			location: [
				336.75,
				60
			]
		},
		"H4:2": {
			floor: "1",
			location: [
				174,
				97.5
			]
		},
		"H7:20": {
			floor: "1",
			location: [
				474.5,
				300
			]
		},
		"R229A:0": {
			floor: "2",
			location: [
				200.5,
				79.125
			]
		},
		"H8:16": {
			floor: "1",
			location: [
				529.25,
				187.5
			]
		},
		"RBM102:0": {
			floor: "1",
			location: [
				534.75,
				282
			]
		},
		"R242:0": {
			floor: "2",
			location: [
				450.875,
				176
			]
		},
		"R253:0": {
			floor: "2",
			location: [
				525.625,
				290.625
			]
		},
		"R166C:0": {
			floor: "1",
			location: [
				252.125,
				328.25
			]
		},
		"RBW210:0": {
			floor: "2",
			location: [
				343.25,
				312.875
			]
		},
		"R128A.5:0": {
			floor: "1",
			location: [
				158.625,
				185.875
			]
		},
		"RBSC11:0": {
			floor: "2",
			location: [
				541.125,
				290.625
			]
		},
		"RSBM100:0": {
			floor: "1",
			location: [
				348,
				63.75
			]
		},
		"H3:9": {
			floor: "1",
			location: [
				494.25,
				80.875
			]
		},
		"H12:9": {
			floor: "2",
			location: [
				309,
				170.25
			]
		},
		"H11:25": {
			floor: "2",
			location: [
				446,
				295.25
			]
		},
		"R155Z:0": {
			floor: "1",
			location: [
				441.375,
				276
			]
		},
		"H1:11": {
			floor: "1",
			location: [
				353,
				66.5
			]
		},
		"H16:7": {
			floor: "2",
			location: [
				495.25,
				152.5
			]
		},
		"H12:15": {
			floor: "2",
			location: [
				352.625,
				170.25
			]
		},
		"R144C:0": {
			floor: "1",
			location: [
				516.25,
				100.75
			]
		},
		"R128A.4:0": {
			floor: "1",
			location: [
				167,
				178
			]
		},
		"R143:3": {
			floor: "1",
			location: [
				251.125,
				266
			]
		},
		"H4:5": {
			floor: "1",
			location: [
				161,
				124
			]
		},
		"H7:2": {
			floor: "1",
			location: [
				248.5,
				300
			]
		},
		"R147Z:2": {
			floor: "1",
			location: [
				480.125,
				223.625
			]
		},
		"R154C:1": {
			floor: "1",
			location: [
				500.8125,
				321.375
			]
		},
		"H8:25": {
			floor: "1",
			location: [
				429.25,
				207
			]
		},
		"H3:0": {
			floor: "1",
			location: [
				494.25,
				66.75
			]
		},
		"H8:14": {
			floor: "1",
			location: [
				485.5,
				187.5
			]
		},
		"Rx103:0": {
			floor: "1",
			location: [
				567.375,
				206.125
			]
		},
		"R107D:0": {
			floor: "1",
			location: [
				450.25,
				33.75
			]
		},
		"H13:3": {
			floor: "2",
			location: [
				275.25,
				55.5
			]
		},
		"RHS200:0": {
			floor: "2",
			location: [
				362.375,
				45.125
			]
		},
		"I2:7:0": {
			floor: "1",
			location: [
				558,
				294.5
			]
		},
		"H7:21": {
			floor: "1",
			location: [
				481,
				300
			]
		},
		"H2:12": {
			floor: "1",
			location: [
				559.125,
				159
			]
		},
		"H7:6": {
			floor: "1",
			location: [
				227.25,
				300
			]
		},
		"R128B:5": {
			floor: "1",
			location: [
				193,
				174.75
			]
		},
		"R127D:0": {
			floor: "1",
			location: [
				157.25,
				51
			]
		},
		"R162Z:0": {
			floor: "1",
			location: [
				316.375,
				308.125
			]
		},
		"R157:0": {
			floor: "1",
			location: [
				419.5,
				269
			]
		},
		"H12:30": {
			floor: "2",
			location: [
				240.75,
				204.5
			]
		},
		"H7:7": {
			floor: "1",
			location: [
				220.25,
				300
			]
		},
		"H8:26": {
			floor: "1",
			location: [
				147.25,
				197.75
			]
		},
		"RBSC4:0": {
			floor: "1",
			location: [
				348,
				69.625
			]
		},
		"R146S:0": {
			floor: "1",
			location: [
				567.25,
				211
			]
		},
		"H12:13": {
			floor: "2",
			location: [
				334.375,
				170.25
			]
		},
		"R235B:0": {
			floor: "2",
			location: [
				179.5,
				158.75
			]
		},
		"H11:30": {
			floor: "2",
			location: [
				217.25,
				329
			],
			tags: [
				"stairs"
			]
		},
		"H12:24": {
			floor: "2",
			location: [
				546.25,
				191.5
			]
		},
		"R153:1": {
			floor: "1",
			location: [
				488,
				289.75
			]
		},
		"R122:0": {
			floor: "1",
			location: [
				269.25,
				60
			]
		},
		"R133:0": {
			floor: "1",
			location: [
				90.5,
				146.75
			]
		},
		"R137D:0": {
			floor: "1",
			location: [
				128.75,
				255.5
			]
		},
		"R144I:0": {
			floor: "1",
			location: [
				512.25,
				105
			]
		},
		"R166:0": {
			floor: "1",
			location: [
				248.5,
				305
			]
		},
		"H4:6": {
			floor: "1",
			location: [
				166.5,
				53
			]
		},
		"H9:17": {
			floor: "1",
			location: [
				380.5,
				55
			]
		},
		"R149:0": {
			floor: "1",
			location: [
				551.25,
				201.5
			]
		},
		"H13:11": {
			floor: "2",
			location: [
				464.25,
				55.5
			]
		},
		"H15:0": {
			floor: "2",
			location: [
				361.5,
				213.375
			]
		},
		"R213:0": {
			floor: "2",
			location: [
				418.625,
				49.625
			]
		},
		"H8:13": {
			floor: "1",
			location: [
				461.25,
				187.5
			]
		},
		"R128B.4:0": {
			floor: "1",
			location: [
				193,
				190.125
			]
		},
		"Rx202:0": {
			floor: "2",
			location: [
				253.25,
				174.125
			]
		},
		"R235C:0": {
			floor: "2",
			location: [
				179.5,
				135.875
			]
		},
		"R251A:0": {
			floor: "2",
			location: [
				527.25,
				250.75
			]
		},
		"R264:0": {
			floor: "2",
			location: [
				310.375,
				304.75
			]
		},
		"R204:0": {
			floor: "2",
			location: [
				490.75,
				86.875
			]
		},
		"REC2:0": {
			floor: "1",
			location: [
				463.25,
				176.25
			]
		},
		"RBC103:0": {
			floor: "1",
			location: [
				142.75,
				195.75
			]
		},
		"R159:0": {
			floor: "1",
			location: [
				400.75,
				246.75
			]
		},
		"RIDF102:0": {
			floor: "1",
			location: [
				384,
				70.25
			]
		},
		"R130A:0": {
			floor: "1",
			location: [
				242.5,
				194.5
			]
		},
		"H15:9": {
			floor: "2",
			location: [
				375.75,
				312.625
			]
		},
		"RSBW200:0": {
			floor: "2",
			location: [
				383.875,
				63.5
			]
		},
		"R209:0": {
			floor: "2",
			location: [
				464.25,
				49.625
			]
		},
		"H7:39": {
			floor: "1",
			location: [
				541.75,
				294.5
			]
		},
		"R106:0": {
			floor: "1",
			location: [
				469.75,
				60
			]
		},
		"H12:10": {
			floor: "2",
			location: [
				319.375,
				170.25
			]
		},
		"R239:0": {
			floor: "2",
			location: [
				246.5,
				191.375
			]
		},
		"R144:16": {
			floor: "1",
			location: [
				534.5,
				159
			]
		},
		"R130D:0": {
			floor: "1",
			location: [
				238.375,
				173.25
			]
		},
		"H9:3": {
			floor: "1",
			location: [
				438.5,
				55
			]
		},
		"R1313:0": {
			floor: "1",
			location: [
				571,
				382.5
			]
		},
		"R147Z:3": {
			floor: "1",
			location: [
				466.125,
				223.625
			]
		},
		"R144F:0": {
			floor: "1",
			location: [
				516.25,
				73
			]
		},
		"H7:38": {
			floor: "1",
			location: [
				542,
				395.25
			]
		},
		"H7:12": {
			floor: "1",
			location: [
				227.25,
				284
			]
		},
		"H9:19": {
			floor: "1",
			location: [
				351.5,
				43.75
			],
			tags: [
				"stairs",
				"up"
			]
		},
		"R135:0": {
			floor: "1",
			location: [
				98,
				146.75
			]
		},
		"R164B:0": {
			floor: "1",
			location: [
				278,
				330.5
			]
		},
		"R170:0": {
			floor: "1",
			location: [
				210.25,
				305
			]
		},
		"R160:0": {
			floor: "1",
			location: [
				373,
				318.625
			]
		},
		"R163X:0": {
			floor: "1",
			location: [
				364.25,
				255.625
			]
		},
		"H12:23": {
			floor: "2",
			location: [
				541.625,
				191.5
			]
		},
		"H15:12": {
			floor: "2",
			location: [
				361.5,
				248.75
			]
		},
		"R214:0": {
			floor: "2",
			location: [
				411.875,
				60
			]
		},
		"R229:0": {
			floor: "2",
			location: [
				200.5,
				73.375
			]
		},
		"R233:0": {
			floor: "2",
			location: [
				179.5,
				121.5
			]
		},
		"R235S:0": {
			floor: "2",
			location: [
				196.5,
				135.875
			]
		},
		"R251S:0": {
			floor: "2",
			location: [
				544.875,
				250.75
			]
		},
		"R262:1": {
			floor: "2",
			location: [
				395,
				331.125
			]
		},
		"R156Z:0": {
			floor: "1",
			location: [
				417.625,
				301.5
			]
		},
		"R142A:0": {
			floor: "1",
			location: [
				422,
				176.25
			]
		},
		"R153Z:1": {
			floor: "1",
			location: [
				527.5,
				264.625
			]
		},
		"RBC204:0": {
			floor: "2",
			location: [
				222.375,
				202.625
			]
		},
		"R107G:0": {
			floor: "1",
			location: [
				427.25,
				33.75
			]
		},
		"R240:0": {
			floor: "2",
			location: [
				404.125,
				176
			]
		},
		"I2:8:0": {
			floor: "1",
			location: [
				558,
				187.5
			]
		},
		"I12:16:0": {
			floor: "2",
			location: [
				495.25,
				180.75
			]
		},
		"R156A:0": {
			floor: "1",
			location: [
				490,
				365.5
			]
		},
		"R144:5": {
			floor: "1",
			location: [
				514.25,
				135.5
			]
		},
		"H16:14": {
			floor: "2",
			location: [
				495.25,
				71.5
			]
		},
		"H4:7": {
			floor: "1",
			location: [
				163,
				48
			]
		},
		"R125:0": {
			floor: "1",
			location: [
				247.75,
				50
			]
		},
		"H11:13": {
			floor: "2",
			location: [
				425.125,
				280.75
			]
		},
		"H16:16": {
			floor: "2",
			location: [
				501.875,
				71.5
			]
		},
		"I1:8:0": {
			floor: "1",
			location: [
				377.5,
				187.5
			]
		},
		"R167:0": {
			floor: "1",
			location: [
				227.25,
				272.5
			]
		},
		"R144E:0": {
			floor: "1",
			location: [
				516.25,
				84.5
			]
		},
		"R203D:0": {
			floor: "2",
			location: [
				501.875,
				67.625
			]
		},
		"RSBW100:0": {
			floor: "1",
			location: [
				384,
				63.75
			]
		},
		"I13:16:1": {
			floor: "2",
			location: [
				488.875,
				62
			]
		},
		"H16:12": {
			floor: "2",
			location: [
				495.25,
				106
			]
		},
		"R142C:0": {
			floor: "1",
			location: [
				447.25,
				166
			]
		},
		"R144B:0": {
			floor: "1",
			location: [
				516.25,
				128.75
			]
		},
		"R128A:2": {
			floor: "1",
			location: [
				169.5,
				167.875
			]
		},
		"H14:6": {
			floor: "2",
			location: [
				207,
				147.75
			]
		},
		"R143:5": {
			floor: "1",
			location: [
				245.8125,
				269
			],
			tags: [
				"stairs"
			]
		},
		"R148:0": {
			floor: "1",
			location: [
				564,
				242.5
			]
		},
		"H12:16": {
			floor: "2",
			location: [
				404.125,
				180.75
			]
		},
		"H8:2": {
			floor: "1",
			location: [
				234.25,
				197.75
			],
			tags: [
				"up",
				"stairs"
			]
		},
		"R144G:1": {
			floor: "1",
			location: [
				512.25,
				94.5
			]
		},
		"H1:13": {
			floor: "1",
			location: [
				373,
				335.75
			],
			tags: [
				"stairs",
				"up"
			]
		},
		"H2:11": {
			floor: "1",
			location: [
				567.875,
				167
			]
		},
		"H12:21": {
			floor: "2",
			location: [
				485.375,
				180.75
			]
		},
		"H16:2": {
			floor: "2",
			location: [
				558.375,
				234.625
			]
		},
		"RBM202:0": {
			floor: "2",
			location: [
				534.5,
				282.125
			]
		},
		"R268:0": {
			floor: "2",
			location: [
				270.5,
				304.75
			]
		},
		"RBW102:0": {
			floor: "1",
			location: [
				548.375,
				282
			]
		},
		"REC10:0": {
			floor: "1",
			location: [
				348,
				161.5
			]
		},
		"RBC201:0": {
			floor: "2",
			location: [
				368.625,
				45.125
			]
		},
		"I0:6:0": {
			floor: "1",
			location: [
				124,
				142.5
			]
		},
		"H1:0": {
			floor: "1",
			location: [
				377.5,
				335.75
			]
		},
		"H2:0": {
			floor: "1",
			location: [
				558,
				286.5
			]
		},
		"R144:9": {
			floor: "1",
			location: [
				514.25,
				100.75
			]
		},
		"R130B:2": {
			floor: "1",
			location: [
				245.25,
				146.125
			]
		},
		"R144A:0": {
			floor: "1",
			location: [
				516.25,
				135.5
			]
		},
		"I12:15:0": {
			floor: "2",
			location: [
				365.75,
				170.25
			]
		},
		"H3:5": {
			floor: "1",
			location: [
				473,
				149.5
			]
		},
		"H8:19": {
			floor: "1",
			location: [
				250.25,
				222
			],
			tags: [
				"up",
				"stairs"
			]
		},
		"RSBW201:0": {
			floor: "2",
			location: [
				414,
				176
			]
		},
		"R235A:1": {
			floor: "2",
			location: [
				200.5,
				162.5
			]
		},
		"R169:3": {
			floor: "1",
			location: [
				163,
				277
			]
		},
		"H8:17": {
			floor: "1",
			location: [
				242.5,
				207.5
			]
		},
		"R144Y:0": {
			floor: "1",
			location: [
				498.125,
				70.5
			]
		},
		"R237:0": {
			floor: "2",
			location: [
				200.875,
				174.125
			]
		},
		"R250:0": {
			floor: "2",
			location: [
				554.875,
				299.5
			]
		},
		"H7:44": {
			floor: "1",
			location: [
				144.75,
				300
			]
		},
		"R261B:0": {
			floor: "2",
			location: [
				395.6875,
				278.5
			]
		},
		"H7:24": {
			floor: "1",
			location: [
				495,
				294.5
			]
		},
		"R231:0": {
			floor: "2",
			location: [
				200.5,
				84.625
			]
		},
		"R126A:0": {
			floor: "1",
			location: [
				184,
				133.5
			]
		},
		"R276:1": {
			floor: "2",
			location: [
				205.3125,
				278
			]
		},
		"R261:2": {
			floor: "2",
			location: [
				392,
				291.5
			]
		},
		"RAHU9:0": {
			floor: "2",
			location: [
				473.375,
				196.875
			]
		},
		"H16:3": {
			floor: "2",
			location: [
				558.375,
				233.25
			]
		},
		"H7:4": {
			floor: "1",
			location: [
				237.5,
				300
			],
			tags: [
				"stairs",
				"down"
			]
		},
		"H7:18": {
			floor: "1",
			location: [
				170,
				300
			]
		},
		"R130A:2": {
			floor: "1",
			location: [
				242.5,
				187.125
			]
		}
	};
	const edges = [
		[
			"I0:7:0",
			"H0:0"
		],
		[
			"H0:0",
			"H0:4"
		],
		[
			"H0:4",
			"R137:0"
		],
		[
			"R137:0",
			"R137:1"
		],
		[
			"R137:1",
			"R137:2"
		],
		[
			"R137:2",
			"R137:3"
		],
		[
			"H0:4",
			"H0:1"
		],
		[
			"H0:1",
			"R137D:0"
		],
		[
			"H0:1",
			"H0:2"
		],
		[
			"H0:2",
			"R137C:0"
		],
		[
			"H0:2",
			"H0:3"
		],
		[
			"H0:0",
			"R169:1"
		],
		[
			"R169:1",
			"R137E:0"
		],
		[
			"H0:3",
			"R139:1"
		],
		[
			"H0:3",
			"I0:8:0"
		],
		[
			"I0:8:0",
			"I0:6:0"
		],
		[
			"H1:1",
			"H1:0"
		],
		[
			"I1:7:0",
			"H1:2"
		],
		[
			"I1:7:0",
			"I1:7:2"
		],
		[
			"I1:7:2",
			"H1:2"
		],
		[
			"H1:2",
			"R159:0"
		],
		[
			"H1:2",
			"H1:3"
		],
		[
			"H1:4",
			"R161:0"
		],
		[
			"I1:8:5",
			"I1:8:2"
		],
		[
			"I1:8:5",
			"I1:8:0"
		],
		[
			"I1:8:0",
			"I1:8:1"
		],
		[
			"H1:5",
			"R138D:0"
		],
		[
			"H1:5",
			"H1:6"
		],
		[
			"H1:6",
			"R134:0"
		],
		[
			"H1:6",
			"H1:7"
		],
		[
			"H1:7",
			"R136:0"
		],
		[
			"H1:7",
			"H1:8"
		],
		[
			"H1:8",
			"R138:0"
		],
		[
			"R138:0",
			"R138A:1"
		],
		[
			"R138:0",
			"R138B:0"
		],
		[
			"R138:0",
			"R138C:0"
		],
		[
			"R138:0",
			"R138S:0"
		],
		[
			"H1:8",
			"H1:9"
		],
		[
			"H1:9",
			"R138A:0"
		],
		[
			"H1:9",
			"H1:10"
		],
		[
			"H1:10",
			"H1:11"
		],
		[
			"H1:10",
			"H1:12"
		],
		[
			"H1:10",
			"I1:9:0"
		],
		[
			"H2:0",
			"I2:7:0"
		],
		[
			"H2:1",
			"R148:1"
		],
		[
			"H2:1",
			"H2:2"
		],
		[
			"H2:2",
			"R151:0"
		],
		[
			"H2:2",
			"H2:3"
		],
		[
			"H2:3",
			"R148:0"
		],
		[
			"H2:3",
			"H2:4"
		],
		[
			"H2:4",
			"R149:1"
		],
		[
			"H2:4",
			"H2:5"
		],
		[
			"H2:5",
			"R146:0"
		],
		[
			"H2:6",
			"R149:0"
		],
		[
			"H2:6",
			"H2:7"
		],
		[
			"H2:7",
			"I2:8:0"
		],
		[
			"I3:8:0",
			"H3:8"
		],
		[
			"H3:8",
			"H3:7"
		],
		[
			"H3:7",
			"H3:4"
		],
		[
			"H3:4",
			"H3:5"
		],
		[
			"H3:5",
			"R100:0"
		],
		[
			"H3:5",
			"H3:6"
		],
		[
			"H3:4",
			"H3:3"
		],
		[
			"R100:0",
			"R100:1"
		],
		[
			"R100:1",
			"R100B:0"
		],
		[
			"R100:1",
			"R100Y:0"
		],
		[
			"R100:1",
			"R100Z:0"
		],
		[
			"H3:3",
			"H3:2"
		],
		[
			"H3:2",
			"R102:0"
		],
		[
			"H3:1",
			"H3:0"
		],
		[
			"H3:0",
			"I3:9:0"
		],
		[
			"I3:9:0",
			"R105:0"
		],
		[
			"I4:6:0",
			"R128:0"
		],
		[
			"R128:0",
			"R128A:0"
		],
		[
			"R128:0",
			"R128B:0"
		],
		[
			"R128B:1",
			"R128B.3:0"
		],
		[
			"I4:6:0",
			"H4:3"
		],
		[
			"H4:3",
			"R126A:0"
		],
		[
			"H4:3",
			"H4:5"
		],
		[
			"H4:5",
			"R127G:0"
		],
		[
			"H4:3",
			"H4:4"
		],
		[
			"H4:4",
			"R127F:0"
		],
		[
			"H4:2",
			"H4:4"
		],
		[
			"H4:2",
			"R126:0"
		],
		[
			"H4:2",
			"H4:1"
		],
		[
			"H4:1",
			"R127:0"
		],
		[
			"H4:1",
			"H4:0"
		],
		[
			"H4:0",
			"H4:9"
		],
		[
			"H4:9",
			"I4:9:0"
		],
		[
			"H4:9",
			"H4:6"
		],
		[
			"H4:6",
			"R127E:0"
		],
		[
			"H4:6",
			"H4:7"
		],
		[
			"H4:7",
			"R127D:0"
		],
		[
			"H4:7",
			"R127A:0"
		],
		[
			"H4:7",
			"H4:8"
		],
		[
			"H4:8",
			"R127B:0"
		],
		[
			"H4:8",
			"I4:10:0"
		],
		[
			"I4:10:0",
			"R127C:0"
		],
		[
			"I5:6:0",
			"H5:0"
		],
		[
			"H5:0",
			"H5:1"
		],
		[
			"H5:1",
			"H5:2"
		],
		[
			"H5:2",
			"H5:3"
		],
		[
			"H5:3",
			"I5:10:0"
		],
		[
			"I5:6:0",
			"H6:0"
		],
		[
			"H6:0",
			"R129:0"
		],
		[
			"H6:0",
			"H6:1"
		],
		[
			"H6:1",
			"R131:0"
		],
		[
			"H6:1",
			"H6:2"
		],
		[
			"H6:2",
			"R133:0"
		],
		[
			"H6:2",
			"H6:3"
		],
		[
			"H6:3",
			"R135:0"
		],
		[
			"H6:3",
			"I0:6:0"
		],
		[
			"I0:6:0",
			"H6:4"
		],
		[
			"H6:4",
			"I4:6:1"
		],
		[
			"I4:6:1",
			"I4:6:0"
		],
		[
			"I4:6:1",
			"H4:3"
		],
		[
			"I0:7:0",
			"H7:27"
		],
		[
			"H7:18",
			"H7:17"
		],
		[
			"H7:18",
			"H7:28"
		],
		[
			"H7:17",
			"H7:29"
		],
		[
			"H7:28",
			"R176:0"
		],
		[
			"H7:29",
			"R176:0"
		],
		[
			"H7:30",
			"R174:0"
		],
		[
			"H7:17",
			"H7:8"
		],
		[
			"H7:8",
			"R172:0"
		],
		[
			"H7:8",
			"H7:11"
		],
		[
			"H7:11",
			"R170:0"
		],
		[
			"H7:11",
			"H7:7"
		],
		[
			"H7:7",
			"R168:0"
		],
		[
			"H7:7",
			"H7:6"
		],
		[
			"H7:6",
			"H7:33"
		],
		[
			"H7:33",
			"H7:12"
		],
		[
			"H7:12",
			"H7:15"
		],
		[
			"H7:15",
			"R169:0"
		],
		[
			"H7:15",
			"R167:0"
		],
		[
			"H7:15",
			"H7:14"
		],
		[
			"H7:14",
			"H7:10",
			true
		],
		[
			"H7:12",
			"H7:26"
		],
		[
			"H7:26",
			"H7:32"
		],
		[
			"H7:33",
			"H7:31"
		],
		[
			"H7:4",
			"H7:6",
			true
		],
		[
			"H7:4",
			"H7:3"
		],
		[
			"H7:3",
			"H7:2"
		],
		[
			"H7:3",
			"H7:32"
		],
		[
			"H7:32",
			"H7:10"
		],
		[
			"H7:10",
			"H7:9"
		],
		[
			"H7:9",
			"R143:1"
		],
		[
			"H7:9",
			"R163:1"
		],
		[
			"H7:9",
			"H7:34"
		],
		[
			"H7:34",
			"R165:0"
		],
		[
			"H7:34",
			"H7:5"
		],
		[
			"H7:2",
			"R166:0"
		],
		[
			"R166:0",
			"R166A:0"
		],
		[
			"R166:0",
			"R166B:0"
		],
		[
			"R166:0",
			"R166C:0"
		],
		[
			"R166:0",
			"R166D:0"
		],
		[
			"R166:0",
			"R166E:0"
		],
		[
			"R166:0",
			"R166S:0"
		],
		[
			"H7:5",
			"H7:1"
		],
		[
			"H7:1",
			"R164:0"
		],
		[
			"R164:0",
			"R164B:0"
		],
		[
			"H7:1",
			"H7:0"
		],
		[
			"H7:0",
			"R162:0"
		],
		[
			"I1:7:2",
			"R158:0"
		],
		[
			"I1:7:2",
			"I1:7:1"
		],
		[
			"I1:7:1",
			"R157:0"
		],
		[
			"I1:7:1",
			"I1:7:3"
		],
		[
			"I1:7:3",
			"R145:0"
		],
		[
			"I1:7:1",
			"H7:19"
		],
		[
			"H7:20",
			"H7:23"
		],
		[
			"H7:23",
			"R155:0"
		],
		[
			"R155:0",
			"R155A:0"
		],
		[
			"H7:20",
			"H7:21"
		],
		[
			"H7:21",
			"R156:1"
		],
		[
			"R156:0",
			"R156A:0"
		],
		[
			"R156:1",
			"R156A:0"
		],
		[
			"H7:21",
			"H7:22"
		],
		[
			"H7:22",
			"R153:1"
		],
		[
			"H7:22",
			"H7:24"
		],
		[
			"H7:24",
			"R154C:0"
		],
		[
			"H7:24",
			"H7:25"
		],
		[
			"H7:25",
			"R153:0"
		],
		[
			"H7:25",
			"R152:0"
		],
		[
			"H7:25",
			"H7:13"
		],
		[
			"H7:16",
			"R150:0"
		],
		[
			"R150:0",
			"R150A:0"
		],
		[
			"H7:16",
			"I2:7:0"
		],
		[
			"I0:8:0",
			"H8:0"
		],
		[
			"H8:0",
			"R137A:0"
		],
		[
			"H8:0",
			"H8:26"
		],
		[
			"H8:27",
			"H8:1"
		],
		[
			"H8:26",
			"RWF102:0"
		],
		[
			"H8:1",
			"R128C:0"
		],
		[
			"H8:1",
			"H8:4"
		],
		[
			"H8:5",
			"R139:0"
		],
		[
			"H8:5",
			"R141:0"
		],
		[
			"H8:4",
			"H8:2"
		],
		[
			"H8:2",
			"H8:6",
			true
		],
		[
			"H8:6",
			"H8:17"
		],
		[
			"H8:17",
			"H8:3"
		],
		[
			"H8:17",
			"H8:18"
		],
		[
			"H8:5",
			"H8:19"
		],
		[
			"H8:19",
			"H8:21",
			true
		],
		[
			"H8:21",
			"H8:22"
		],
		[
			"H8:22",
			"R163:2"
		],
		[
			"H8:22",
			"R143:0"
		],
		[
			"H8:6",
			"R130A:0"
		],
		[
			"H8:6",
			"H8:20"
		],
		[
			"H8:20",
			"H8:7"
		],
		[
			"H8:7",
			"R130A:1"
		],
		[
			"R130A:0",
			"R130B:0"
		],
		[
			"R130A:1",
			"R130B:0"
		],
		[
			"H8:7",
			"H8:8"
		],
		[
			"H8:8",
			"R130C:0"
		],
		[
			"H8:8",
			"I1:8:2"
		],
		[
			"I1:8:2",
			"I1:8:3"
		],
		[
			"I1:8:3",
			"R132:0"
		],
		[
			"I1:8:3",
			"I1:8:1"
		],
		[
			"I1:8:3",
			"I1:8:0"
		],
		[
			"I1:8:2",
			"I1:8:0"
		],
		[
			"I1:8:2",
			"I1:8:1"
		],
		[
			"I1:8:0",
			"H8:9"
		],
		[
			"H8:9",
			"R140:0"
		],
		[
			"H8:9",
			"H8:10"
		],
		[
			"H8:10",
			"R142A:0"
		],
		[
			"H8:10",
			"H8:11"
		],
		[
			"H8:11",
			"H8:12"
		],
		[
			"H8:12",
			"R142:0"
		],
		[
			"R142:0",
			"R142A:1"
		],
		[
			"R142:0",
			"R142B:0"
		],
		[
			"R142:0",
			"R142C:0"
		],
		[
			"R142:0",
			"R142S:0"
		],
		[
			"H8:12",
			"H8:13"
		],
		[
			"H8:13",
			"R145:1"
		],
		[
			"H8:14",
			"R147:0"
		],
		[
			"H8:14",
			"I3:8:0"
		],
		[
			"I3:8:0",
			"H8:15"
		],
		[
			"H8:15",
			"R147:1"
		],
		[
			"H8:15",
			"R144:0"
		],
		[
			"H8:15",
			"H8:16"
		],
		[
			"H8:16",
			"R144:0"
		],
		[
			"H8:16",
			"I2:8:0"
		],
		[
			"R144:0",
			"R144K:0"
		],
		[
			"R144:0",
			"R144:4"
		],
		[
			"R144:4",
			"R144:5"
		],
		[
			"R144:5",
			"R144A:0"
		],
		[
			"R144:5",
			"R144:6"
		],
		[
			"R144:6",
			"R144B:0"
		],
		[
			"R144:6",
			"R144:7"
		],
		[
			"R144:7",
			"R144J:0"
		],
		[
			"R144:7",
			"R144:8"
		],
		[
			"R144:8",
			"R144I:0"
		],
		[
			"R144:8",
			"R144:9"
		],
		[
			"R144:9",
			"R144C:0"
		],
		[
			"R144:9",
			"R144:10"
		],
		[
			"R144:10",
			"R144H:0"
		],
		[
			"R144:10",
			"R144:11"
		],
		[
			"R144:11",
			"R144G:1"
		],
		[
			"R144:11",
			"R144:12"
		],
		[
			"R144:12",
			"R144D:0"
		],
		[
			"R144:12",
			"R144:13"
		],
		[
			"R144:13",
			"R144E:0"
		],
		[
			"R144:13",
			"R144:14"
		],
		[
			"R144:14",
			"R144G:0"
		],
		[
			"R144:14",
			"R144:15"
		],
		[
			"R144:15",
			"R144F:0"
		],
		[
			"I4:9:0",
			"H4:6"
		],
		[
			"H9:14",
			"H9:13",
			true
		],
		[
			"H9:13",
			"H9:12"
		],
		[
			"H9:12",
			"H9:11"
		],
		[
			"H9:11",
			"R125:0"
		],
		[
			"H9:11",
			"R124:0"
		],
		[
			"H9:11",
			"H9:10"
		],
		[
			"H9:10",
			"R123:0"
		],
		[
			"H9:10",
			"R122:0"
		],
		[
			"H9:10",
			"H9:9"
		],
		[
			"H9:9",
			"R121:0"
		],
		[
			"H9:9",
			"R120:0"
		],
		[
			"H9:9",
			"H9:8"
		],
		[
			"H9:8",
			"R119:0"
		],
		[
			"H9:8",
			"R118:0"
		],
		[
			"H9:8",
			"H9:7"
		],
		[
			"H9:7",
			"R117:0"
		],
		[
			"H9:7",
			"R116:0"
		],
		[
			"H9:6",
			"R114:0"
		],
		[
			"H9:6",
			"H9:5"
		],
		[
			"H9:5",
			"R115:0"
		],
		[
			"R115:0",
			"R115A:0"
		],
		[
			"R115:0",
			"R115B:0"
		],
		[
			"R115:0",
			"R115Z:0"
		],
		[
			"H9:5",
			"H9:4"
		],
		[
			"H9:4",
			"R112:0"
		],
		[
			"H9:4",
			"H9:3"
		],
		[
			"H9:3",
			"R111:0"
		],
		[
			"H9:3",
			"H9:2"
		],
		[
			"H9:2",
			"R110:0"
		],
		[
			"H9:1",
			"R106:0"
		],
		[
			"H9:1",
			"H9:0"
		],
		[
			"H9:0",
			"R107:0"
		],
		[
			"H9:0",
			"I3:9:0"
		],
		[
			"R107:0",
			"R107:1"
		],
		[
			"R107:1",
			"R107:2"
		],
		[
			"R107:2",
			"R107A:0"
		],
		[
			"R107:2",
			"R107:3"
		],
		[
			"R107:3",
			"R107J:0"
		],
		[
			"R107:3",
			"R107:4"
		],
		[
			"R107:4",
			"R107B:0"
		],
		[
			"R107:4",
			"R107:5"
		],
		[
			"R107:5",
			"R107C:0"
		],
		[
			"R107:5",
			"R107:6"
		],
		[
			"R107:6",
			"R107I:0"
		],
		[
			"R107:6",
			"R107:7"
		],
		[
			"R107:7",
			"R107H:0"
		],
		[
			"R107:7",
			"R107:8"
		],
		[
			"R107:8",
			"R107D:0"
		],
		[
			"R107:8",
			"R107:9"
		],
		[
			"R107:9",
			"R107E:0"
		],
		[
			"R107:9",
			"R107:10"
		],
		[
			"R107:10",
			"R107F:0"
		],
		[
			"R107:10",
			"R107:11"
		],
		[
			"R107:11",
			"R107G:0"
		],
		[
			"I11:14:0",
			"H11:3"
		],
		[
			"H11:3",
			"H11:0"
		],
		[
			"H11:0",
			"H11:1"
		],
		[
			"H11:1",
			"H11:2"
		],
		[
			"H11:2",
			"H11:4"
		],
		[
			"H11:4",
			"H11:5"
		],
		[
			"H11:5",
			"H11:6"
		],
		[
			"H11:6",
			"I11:15:0"
		],
		[
			"I11:15:0",
			"I11:15:1"
		],
		[
			"I11:15:1",
			"H11:8"
		],
		[
			"H11:8",
			"H11:9"
		],
		[
			"H11:9",
			"H11:10"
		],
		[
			"H11:10",
			"H11:11"
		],
		[
			"H11:11",
			"H11:12"
		],
		[
			"H11:12",
			"H11:13"
		],
		[
			"H11:11",
			"H11:14"
		],
		[
			"H11:14",
			"H11:15"
		],
		[
			"H11:11",
			"H11:15"
		],
		[
			"H11:12",
			"H11:15"
		],
		[
			"H11:16",
			"H11:17"
		],
		[
			"H11:17",
			"H11:18"
		],
		[
			"H11:18",
			"H11:19"
		],
		[
			"H11:19",
			"H11:20"
		],
		[
			"H11:20",
			"H11:21"
		],
		[
			"H11:22",
			"H11:23"
		],
		[
			"H11:23",
			"I11:16:0"
		],
		[
			"I12:14:1",
			"H12:0"
		],
		[
			"H12:0",
			"I12:14:0"
		],
		[
			"H12:1",
			"H12:2"
		],
		[
			"H12:2",
			"H12:3"
		],
		[
			"H12:3",
			"H12:4"
		],
		[
			"H12:4",
			"H12:7"
		],
		[
			"H12:7",
			"H12:8"
		],
		[
			"H12:8",
			"H12:9"
		],
		[
			"H12:9",
			"H12:11"
		],
		[
			"H12:11",
			"H12:12"
		],
		[
			"H12:12",
			"H12:13"
		],
		[
			"H12:13",
			"H12:14"
		],
		[
			"H12:14",
			"H12:15"
		],
		[
			"H12:15",
			"I12:15:0"
		],
		[
			"I12:15:0",
			"I12:15:1"
		],
		[
			"I12:15:1",
			"H12:16"
		],
		[
			"H12:16",
			"H12:17"
		],
		[
			"H12:18",
			"H12:19"
		],
		[
			"H12:19",
			"H12:20"
		],
		[
			"H12:20",
			"H12:21"
		],
		[
			"H12:21",
			"I12:16:0"
		],
		[
			"I12:16:0",
			"I12:16:1"
		],
		[
			"I12:16:1",
			"H12:22"
		],
		[
			"H12:22",
			"H12:23"
		],
		[
			"H12:23",
			"H12:24"
		],
		[
			"H12:24",
			"I12:16:2"
		],
		[
			"I13:14:0",
			"H13:0"
		],
		[
			"H13:0",
			"H13:1"
		],
		[
			"H13:1",
			"H13:2"
		],
		[
			"H13:2",
			"H13:3"
		],
		[
			"H13:3",
			"H13:4"
		],
		[
			"H13:4",
			"H13:5"
		],
		[
			"H13:5",
			"H13:6"
		],
		[
			"H13:7",
			"H13:8"
		],
		[
			"H13:8",
			"H13:9"
		],
		[
			"H13:9",
			"H13:10"
		],
		[
			"H13:10",
			"H13:11"
		],
		[
			"H13:11",
			"I13:16:0"
		],
		[
			"I13:16:0",
			"I13:16:1"
		],
		[
			"I13:16:1",
			"I13:16:2"
		],
		[
			"I11:14:0",
			"H14:13"
		],
		[
			"H14:13",
			"H14:0"
		],
		[
			"H14:0",
			"H14:2"
		],
		[
			"H14:13",
			"H14:14"
		],
		[
			"H7:31",
			"H14:14",
			true
		],
		[
			"H14:2",
			"H14:3"
		],
		[
			"H14:4",
			"I12:14:0"
		],
		[
			"I12:14:1",
			"H14:5"
		],
		[
			"H14:6",
			"H14:11"
		],
		[
			"I12:14:1",
			"H14:11"
		],
		[
			"H14:11",
			"H14:5"
		],
		[
			"H14:6",
			"H14:7"
		],
		[
			"H14:7",
			"H14:8"
		],
		[
			"H14:8",
			"H14:9"
		],
		[
			"H14:9",
			"H14:10"
		],
		[
			"H15:0",
			"I12:15:1"
		],
		[
			"H15:2",
			"H15:3"
		],
		[
			"H15:3",
			"H15:4"
		],
		[
			"H15:4",
			"H15:5"
		],
		[
			"H15:4",
			"H15:6"
		],
		[
			"H15:4",
			"I13:15:0"
		],
		[
			"I11:16:0",
			"H16:0"
		],
		[
			"H16:1",
			"H16:2"
		],
		[
			"H16:2",
			"H16:3"
		],
		[
			"H16:3",
			"H16:4"
		],
		[
			"H16:4",
			"H16:5"
		],
		[
			"H16:5",
			"I12:16:2"
		],
		[
			"I12:16:0",
			"H16:6"
		],
		[
			"H16:6",
			"H16:7"
		],
		[
			"H16:7",
			"H16:8"
		],
		[
			"H16:8",
			"H16:9"
		],
		[
			"H16:9",
			"H16:10"
		],
		[
			"H16:10",
			"H16:11"
		],
		[
			"H16:11",
			"H16:12"
		],
		[
			"H16:12",
			"H16:13"
		],
		[
			"H16:13",
			"H16:15"
		],
		[
			"H16:15",
			"H16:16"
		],
		[
			"H16:15",
			"I13:16:2"
		],
		[
			"H11:13",
			"H11:27"
		],
		[
			"H11:27",
			"H11:24"
		],
		[
			"I1:7:1",
			"I1:7:4"
		],
		[
			"H11:24",
			"I1:7:4",
			true
		],
		[
			"H16:10",
			"R200:0"
		],
		[
			"H16:11",
			"R202:0"
		],
		[
			"H16:12",
			"R201:1"
		],
		[
			"H16:9",
			"R201:0"
		],
		[
			"H16:13",
			"R204:0"
		],
		[
			"H16:16",
			"R203A:0"
		],
		[
			"H16:16",
			"R203B:0"
		],
		[
			"H16:16",
			"R203C:0"
		],
		[
			"H16:16",
			"R203D:0"
		],
		[
			"I13:16:1",
			"R206:0"
		],
		[
			"I13:16:1",
			"R205:0"
		],
		[
			"I13:16:0",
			"R207:0"
		],
		[
			"H13:11",
			"R209:0"
		],
		[
			"H13:10",
			"R211:0"
		],
		[
			"H13:10",
			"R210:0"
		],
		[
			"H13:9",
			"R213:0"
		],
		[
			"H13:9",
			"R212:0"
		],
		[
			"H13:8",
			"R215:0"
		],
		[
			"H13:8",
			"R214:0"
		],
		[
			"H13:5",
			"R217:0"
		],
		[
			"H13:5",
			"R216:0"
		],
		[
			"H13:4",
			"R219:0"
		],
		[
			"H13:4",
			"R218:0"
		],
		[
			"H13:3",
			"R221:0"
		],
		[
			"H13:3",
			"R220:0"
		],
		[
			"H13:2",
			"R223:0"
		],
		[
			"H13:2",
			"R222:0"
		],
		[
			"H13:1",
			"R225:0"
		],
		[
			"H13:1",
			"R224:0"
		],
		[
			"I13:14:0",
			"R227:0"
		],
		[
			"H14:10",
			"R229:0"
		],
		[
			"H14:9",
			"R229A:0"
		],
		[
			"H14:8",
			"R231:0"
		],
		[
			"I12:14:1",
			"R235A:1"
		],
		[
			"H14:11",
			"R235:0"
		],
		[
			"R235:0",
			"R235A:0"
		],
		[
			"R235:0",
			"R235B:0"
		],
		[
			"R235:0",
			"R235S:0"
		],
		[
			"R235:0",
			"R235C:0"
		],
		[
			"R235C:0",
			"R233:0"
		],
		[
			"H12:0",
			"R237:0"
		],
		[
			"H14:2",
			"R278:0"
		],
		[
			"H14:0",
			"R276:0"
		],
		[
			"H11:0",
			"R272:0"
		],
		[
			"H11:1",
			"R270:0"
		],
		[
			"R268:0",
			"H11:2"
		],
		[
			"R266:0",
			"H11:4"
		],
		[
			"R264:0",
			"H11:5"
		],
		[
			"R262:0",
			"R262:1"
		],
		[
			"R262:1",
			"R262C:0"
		],
		[
			"H11:10",
			"R260:0"
		],
		[
			"R258:0",
			"H11:14"
		],
		[
			"H11:8",
			"R261:0"
		],
		[
			"R261:0",
			"R261:1"
		],
		[
			"R261:1",
			"R261:2"
		],
		[
			"R261:2",
			"R261:3"
		],
		[
			"R261:2",
			"R261A:0"
		],
		[
			"R256:0",
			"H11:16"
		],
		[
			"R254:0",
			"H11:18"
		],
		[
			"R252:0",
			"H11:19"
		],
		[
			"H11:20",
			"R253:0"
		],
		[
			"H11:23",
			"R250:0"
		],
		[
			"R251:0",
			"R251A:0"
		],
		[
			"R251:0",
			"R251S:0"
		],
		[
			"H16:1",
			"R248:0"
		],
		[
			"H16:2",
			"R249:1"
		],
		[
			"H16:4",
			"R246:0"
		],
		[
			"H12:24",
			"R249:0"
		],
		[
			"H12:23",
			"R244:0"
		],
		[
			"R247:0",
			"H12:22"
		],
		[
			"H12:19",
			"R242:0"
		],
		[
			"H12:19",
			"R245:0"
		],
		[
			"H12:16",
			"R240:0"
		],
		[
			"I12:15:1",
			"R243:0"
		],
		[
			"H12:11",
			"R232:0"
		],
		[
			"H12:9",
			"R230:1"
		],
		[
			"R241B:0",
			"H12:8"
		],
		[
			"H12:7",
			"R241A:0"
		],
		[
			"H12:3",
			"R230:0"
		],
		[
			"H12:2",
			"R228:0"
		],
		[
			"H12:1",
			"R226:0"
		],
		[
			"H15:1",
			"R240:1"
		],
		[
			"H15:2",
			"R234:0"
		],
		[
			"H15:3",
			"R236:0"
		],
		[
			"H15:3",
			"R238:0"
		],
		[
			"R238:0",
			"R238A:0"
		],
		[
			"R238:0",
			"R238S:0"
		],
		[
			"R238:0",
			"R238C:0"
		],
		[
			"R238:0",
			"R238B:0"
		],
		[
			"H16:17",
			"H16:0"
		],
		[
			"H2:8",
			"H2:0"
		],
		[
			"H16:17",
			"H2:8",
			true
		],
		[
			"H2:7",
			"H2:9"
		],
		[
			"H2:9",
			"H16:18",
			true
		],
		[
			"H16:18",
			"H16:5"
		],
		[
			"H8:13",
			"H8:28"
		],
		[
			"H8:28",
			"H8:23"
		],
		[
			"H8:23",
			"H8:14"
		],
		[
			"H8:23",
			"H8:24"
		],
		[
			"H8:24",
			"H12:25"
		],
		[
			"H12:25",
			"H12:20"
		],
		[
			"I1:8:3",
			"I1:8:6"
		],
		[
			"I1:8:6",
			"I1:8:4"
		],
		[
			"I1:8:4",
			"H12:26",
			true
		],
		[
			"H12:26",
			"H12:15"
		],
		[
			"H9:13",
			"H9:15"
		],
		[
			"H9:15",
			"H13:12",
			true
		],
		[
			"H13:12",
			"H13:0"
		],
		[
			"H14:4",
			"H14:12"
		],
		[
			"H14:12",
			"H14:3"
		],
		[
			"H14:12",
			"H8:3",
			true
		],
		[
			"H1:0",
			"H1:13"
		],
		[
			"H1:13",
			"H15:7",
			true
		],
		[
			"H9:7",
			"H9:16"
		],
		[
			"I1:9:0",
			"H9:17"
		],
		[
			"H9:17",
			"H9:6"
		],
		[
			"H9:16",
			"H9:19"
		],
		[
			"H9:19",
			"H13:13",
			true
		],
		[
			"H13:13",
			"H13:6"
		],
		[
			"H13:7",
			"H13:14"
		],
		[
			"H13:14",
			"H9:18",
			true
		],
		[
			"H9:18",
			"H9:17"
		],
		[
			"R201:2",
			"R201A:1"
		],
		[
			"R201A:0",
			"R201A:1"
		],
		[
			"R201A:1",
			"R244Z:0"
		],
		[
			"R244Z:0",
			"R244A:0"
		],
		[
			"R240A:1",
			"R240Z:0"
		],
		[
			"R240Z:0",
			"R240A:0"
		],
		[
			"R242A:0",
			"H16:6"
		],
		[
			"R242Z:0",
			"H16:7"
		],
		[
			"H11:15",
			"H11:25"
		],
		[
			"H11:25",
			"R256A:0"
		],
		[
			"H11:25",
			"H11:16"
		],
		[
			"R261:3",
			"R261:4"
		],
		[
			"R261:4",
			"R261B:0"
		],
		[
			"R245:0",
			"R245:1"
		],
		[
			"R245:1",
			"R245:2"
		],
		[
			"R245:2",
			"R245A:0"
		],
		[
			"R154Z:0",
			"R154C:0"
		],
		[
			"R152Z:0",
			"R152:0"
		],
		[
			"R154C:0",
			"R154C:1"
		],
		[
			"R154C:1",
			"R154Y:0"
		],
		[
			"E1",
			"H7:35"
		],
		[
			"H7:35",
			"H7:36"
		],
		[
			"H7:36",
			"H7:37"
		],
		[
			"H7:37",
			"H7:38"
		],
		[
			"H7:38",
			"R1310:0"
		],
		[
			"H7:38",
			"R1311:0"
		],
		[
			"H7:38",
			"R1312:0"
		],
		[
			"H7:38",
			"R1313:0"
		],
		[
			"R1310:0",
			"R1312:0"
		],
		[
			"R1310:0",
			"R1313:0"
		],
		[
			"R1311:0",
			"R1312:0"
		],
		[
			"R1311:0",
			"R1313:0"
		],
		[
			"R1313:0",
			"H7:37"
		],
		[
			"E0",
			"H2:11"
		],
		[
			"H2:11",
			"Rx100:0"
		],
		[
			"H2:11",
			"H2:10"
		],
		[
			"H2:11",
			"H2:13"
		],
		[
			"H2:13",
			"H2:12"
		],
		[
			"H2:12",
			"R144:16"
		],
		[
			"Rx100:1",
			"I2:8:0"
		],
		[
			"H2:10",
			"I2:8:0"
		],
		[
			"Rx200:0",
			"I11:16:0"
		],
		[
			"R163:3",
			"R163:0"
		],
		[
			"R163:3",
			"R163W:0"
		],
		[
			"R163:3",
			"R163X:0"
		],
		[
			"R163:3",
			"R163:4"
		],
		[
			"R163:4",
			"R163:5"
		],
		[
			"R163:5",
			"R163Y:0"
		],
		[
			"R241:0",
			"H12:4"
		],
		[
			"R143:1",
			"R143:2"
		],
		[
			"R143:2",
			"R143:4"
		],
		[
			"R143:4",
			"R143Z:0"
		],
		[
			"R143:0",
			"R143:3"
		],
		[
			"R143:3",
			"R143:5"
		],
		[
			"R143:5",
			"R143Z:1"
		],
		[
			"RBW104:0",
			"H1:12"
		],
		[
			"RBM104:0",
			"H1:11"
		],
		[
			"RBM102:0",
			"H7:13"
		],
		[
			"RBW102:0",
			"H7:16"
		],
		[
			"RBW200:0",
			"H15:6"
		],
		[
			"RBM200:0",
			"H15:5"
		],
		[
			"H11:22",
			"RBW202:0"
		],
		[
			"H11:21",
			"RBM202:0"
		],
		[
			"H3:6",
			"RCY1:0"
		],
		[
			"H9:12",
			"RCY2:0"
		],
		[
			"H7:23",
			"RCY3:0"
		],
		[
			"H8:25",
			"H8:11"
		],
		[
			"H8:25",
			"RBM103:0"
		],
		[
			"H8:25",
			"RBW103:0"
		],
		[
			"H8:25",
			"RBSC3:0"
		],
		[
			"H1:14",
			"H1:4"
		],
		[
			"H1:14",
			"I1:8:5"
		],
		[
			"H1:14",
			"R161A:0"
		],
		[
			"R161:0",
			"R161Z:0"
		],
		[
			"R159:0",
			"R159Z:1"
		],
		[
			"R157:0",
			"R159Z:0"
		],
		[
			"R157:0",
			"R157Z:0"
		],
		[
			"R155Z:0",
			"R155:0"
		],
		[
			"H7:39",
			"H7:13"
		],
		[
			"H7:39",
			"RBSC2EC3:0"
		],
		[
			"H7:39",
			"H7:16"
		],
		[
			"R153Z:0",
			"R153:0"
		],
		[
			"R153Z:0",
			"R153Y:0"
		],
		[
			"R153Z:1",
			"R153:1"
		],
		[
			"R153Z:1",
			"R153Y:1"
		],
		[
			"R147Z:0",
			"R147:0"
		],
		[
			"R147Z:1",
			"R145:1"
		],
		[
			"R147Z:2",
			"R147:1"
		],
		[
			"R147Z:3",
			"R145:0"
		],
		[
			"R146:0",
			"R146:1"
		],
		[
			"R146:1",
			"R146:2"
		],
		[
			"R146:2",
			"R146S:0"
		],
		[
			"RWF100:0",
			"I1:7:1"
		],
		[
			"I1:7:1",
			"R156Z:0"
		],
		[
			"H7:19",
			"RHS100:0"
		],
		[
			"H7:19",
			"H7:40"
		],
		[
			"H7:40",
			"R156:0"
		],
		[
			"H7:40",
			"H7:41"
		],
		[
			"H7:41",
			"RHS101:0"
		],
		[
			"H7:41",
			"H7:42"
		],
		[
			"H7:42",
			"RBC100:0"
		],
		[
			"H7:42",
			"H7:20"
		],
		[
			"H1:15",
			"H1:18"
		],
		[
			"H1:18",
			"H1:0"
		],
		[
			"H1:15",
			"I1:7:0"
		],
		[
			"H1:15",
			"RHS102:0"
		],
		[
			"I2:7:0",
			"H7:43"
		],
		[
			"H7:43",
			"RHS103:0"
		],
		[
			"H7:43",
			"E1"
		],
		[
			"RHS104:0",
			"H2:13"
		],
		[
			"I4:10:0",
			"H10:0"
		],
		[
			"H10:0",
			"RAHU102:0"
		],
		[
			"H10:0",
			"I5:10:0"
		],
		[
			"H6:4",
			"RAHU101:0"
		],
		[
			"RIDF104:0",
			"H5:2"
		],
		[
			"R144Z:0",
			"R144J:0"
		],
		[
			"H3:8",
			"RAED100:0"
		],
		[
			"H3:7",
			"RBC101:0"
		],
		[
			"H3:1",
			"R144Y:0"
		],
		[
			"H3:9",
			"H3:1"
		],
		[
			"H3:9",
			"RAHU104:0"
		],
		[
			"H3:9",
			"H3:2"
		],
		[
			"H7:27",
			"H7:44"
		],
		[
			"H7:44",
			"RWF103:0"
		],
		[
			"H7:44",
			"H7:18"
		],
		[
			"H1:12",
			"RWF101:0"
		],
		[
			"RHS105:0",
			"H9:17"
		],
		[
			"H9:20",
			"I1:9:0"
		],
		[
			"H9:20",
			"RHS106:0"
		],
		[
			"H9:20",
			"H9:16"
		],
		[
			"H9:21",
			"H9:14"
		],
		[
			"H9:21",
			"I4:9:0"
		],
		[
			"H9:22",
			"RHS107:0"
		],
		[
			"I4:6:1",
			"RHS108:0"
		],
		[
			"R137:1",
			"RHS109:0"
		],
		[
			"R143:0",
			"RHS110:0"
		],
		[
			"R143:1",
			"RHS110:1"
		],
		[
			"H1:4",
			"H1:17"
		],
		[
			"H1:17",
			"RHS111:0"
		],
		[
			"H1:17",
			"H1:3"
		],
		[
			"H1:3",
			"H1:16"
		],
		[
			"H1:16",
			"RHS111:0"
		],
		[
			"H1:16",
			"R163:0"
		],
		[
			"H7:2",
			"H7:46"
		],
		[
			"H7:46",
			"RBC102:0"
		],
		[
			"H7:46",
			"H7:45"
		],
		[
			"H7:45",
			"RAED101:0"
		],
		[
			"H7:45",
			"H7:5"
		],
		[
			"H8:0",
			"RBC103:0"
		],
		[
			"H4:2",
			"H4:10"
		],
		[
			"H4:10",
			"RBC104:0"
		],
		[
			"H4:10",
			"H4:3"
		],
		[
			"H9:23",
			"H9:1"
		],
		[
			"H9:23",
			"REC1:0"
		],
		[
			"H9:23",
			"H9:2"
		],
		[
			"REC6:0",
			"I0:8:0"
		],
		[
			"H7:47",
			"H7:28"
		],
		[
			"H7:47",
			"H7:29"
		],
		[
			"H7:47",
			"R176:0"
		],
		[
			"H7:47",
			"REC5:0"
		],
		[
			"H7:47",
			"H7:30"
		],
		[
			"R262:1",
			"R262A:0"
		],
		[
			"R262:1",
			"R262B:0"
		],
		[
			"H15:9",
			"I11:15:1"
		],
		[
			"H15:9",
			"R262:0"
		],
		[
			"H15:9",
			"H15:10"
		],
		[
			"H15:10",
			"RHS201:0"
		],
		[
			"H15:10",
			"R262D:0"
		],
		[
			"H15:10",
			"H15:7"
		],
		[
			"H11:26",
			"H11:6"
		],
		[
			"H11:26",
			"RBC205:0"
		],
		[
			"H11:26",
			"H11:7"
		],
		[
			"I11:16:0",
			"RBC206:0"
		],
		[
			"H12:27",
			"H12:17"
		],
		[
			"H12:27",
			"H12:18"
		],
		[
			"H12:27",
			"RWF200:0"
		],
		[
			"H15:8",
			"H15:1"
		],
		[
			"H15:8",
			"I12:15:0"
		],
		[
			"H15:8",
			"RBC203:0"
		],
		[
			"H14:16",
			"H14:3"
		],
		[
			"H14:16",
			"RBC204:0"
		],
		[
			"H14:16",
			"H14:4"
		],
		[
			"I13:16:0",
			"RBC200:0"
		],
		[
			"H13:15",
			"H13:7"
		],
		[
			"H13:15",
			"I13:15:0"
		],
		[
			"H13:15",
			"RBC201:0"
		],
		[
			"H13:16",
			"I13:15:0"
		],
		[
			"H13:16",
			"RHS200:0"
		],
		[
			"H13:16",
			"H13:6"
		],
		[
			"H14:15",
			"H14:10"
		],
		[
			"H14:15",
			"RBC202:0"
		],
		[
			"H14:15",
			"I13:14:0"
		],
		[
			"I1:8:6",
			"I1:8:7"
		],
		[
			"I1:8:7",
			"REC10:0"
		],
		[
			"H1:18",
			"R160:0"
		],
		[
			"R162:0",
			"R162:1"
		],
		[
			"R162:1",
			"R162Z:0"
		],
		[
			"H13:11",
			"REC12ERU6:0"
		],
		[
			"H16:8",
			"RBSC12:0"
		],
		[
			"H16:6",
			"RERU7:0"
		],
		[
			"H12:20",
			"RAHU9:0"
		],
		[
			"H11:17",
			"Rx201:0"
		],
		[
			"H11:16",
			"R255:0"
		],
		[
			"H1:12",
			"RIDF102:0"
		],
		[
			"R139:1",
			"R137A:1"
		],
		[
			"R139:0",
			"R139:2"
		],
		[
			"R139:2",
			"R139:5"
		],
		[
			"R139:5",
			"R139A:0"
		],
		[
			"R139:2",
			"R139:3"
		],
		[
			"R139:3",
			"R139Z:0"
		],
		[
			"R139:3",
			"R139:4"
		],
		[
			"R139:4",
			"R139B:0"
		],
		[
			"R169:0",
			"R169:2"
		],
		[
			"R169:2",
			"R169:5"
		],
		[
			"R169:5",
			"R169A:0"
		],
		[
			"R169:2",
			"R169:3"
		],
		[
			"R169:3",
			"R169Z:0"
		],
		[
			"R169:3",
			"R169:4"
		],
		[
			"R169:4",
			"R169B:0"
		],
		[
			"H8:28",
			"REC2:0"
		],
		[
			"R124:0",
			"R124:1"
		],
		[
			"R124:1",
			"R124Z:0"
		],
		[
			"H1:11",
			"RBSC4:0"
		],
		[
			"H11:27",
			"R245C:0"
		],
		[
			"R261:1",
			"R261Z:0"
		],
		[
			"H11:12",
			"R261Z:1"
		],
		[
			"Rx202:0",
			"H12:2"
		],
		[
			"I13:14:0",
			"REC13:0"
		],
		[
			"H14:6",
			"R235D:0"
		],
		[
			"H14:11",
			"REC17:0"
		],
		[
			"Rx203:0",
			"H14:5"
		],
		[
			"H14:5",
			"RBSC14:0"
		],
		[
			"H16:19",
			"H16:0"
		],
		[
			"H16:19",
			"R251:0"
		],
		[
			"H16:19",
			"H16:1"
		],
		[
			"H4:11",
			"RBM105:0"
		],
		[
			"H4:11",
			"H4:0"
		],
		[
			"H4:11",
			"H4:12"
		],
		[
			"H4:12",
			"RBW105:0"
		],
		[
			"H4:11",
			"H4:13"
		],
		[
			"H4:13",
			"RBSC5:0"
		],
		[
			"H8:29",
			"H8:21"
		],
		[
			"H8:29",
			"H8:20"
		],
		[
			"H8:29",
			"RIDF103:0"
		],
		[
			"R128A:1",
			"R128A:0"
		],
		[
			"R128A:1",
			"R128A.1:0"
		],
		[
			"R128A:1",
			"R128A:2"
		],
		[
			"R128A:2",
			"R128A.2:0"
		],
		[
			"R128A:2",
			"R128A:7"
		],
		[
			"R128A:2",
			"R128A:3"
		],
		[
			"R128A:7",
			"R128A.3:0"
		],
		[
			"R128A:7",
			"R128A:3"
		],
		[
			"R128A:3",
			"R128A.4:0"
		],
		[
			"R128A:3",
			"R128A:4"
		],
		[
			"R128A:4",
			"R128A:5"
		],
		[
			"R128A:5",
			"R128A.5:0"
		],
		[
			"R128A:5",
			"R128A:6"
		],
		[
			"R128A:6",
			"R128A.6:0"
		],
		[
			"H8:27",
			"R128B.4:1"
		],
		[
			"H8:27",
			"H8:26"
		],
		[
			"R128B:0",
			"R128A:0"
		],
		[
			"R128B:0",
			"R128B:2"
		],
		[
			"R128B:3",
			"R128B:2"
		],
		[
			"R128B:3",
			"R128B.1:0"
		],
		[
			"R128B:3",
			"R128B:4"
		],
		[
			"R128B:4",
			"R128B.2:0"
		],
		[
			"R128B:4",
			"R128B:5"
		],
		[
			"R128B:5",
			"R128A.3:1"
		],
		[
			"R128B:5",
			"R128B:1"
		],
		[
			"R128B:1",
			"R128B.4:0"
		],
		[
			"R132A:0",
			"H1:19"
		],
		[
			"H1:19",
			"H1:5"
		],
		[
			"H1:19",
			"I1:8:1"
		],
		[
			"R130A:0",
			"R130A:2"
		],
		[
			"R130A:2",
			"R130E:0"
		],
		[
			"R130A:2",
			"R130A:3"
		],
		[
			"R130A:3",
			"R130D:0"
		],
		[
			"R130A:3",
			"R130B:0"
		],
		[
			"R130B:0",
			"R130B:1"
		],
		[
			"R130B:1",
			"R130Z:0"
		],
		[
			"R130B:1",
			"R130B:2"
		],
		[
			"R130B:2",
			"R130Y:0"
		],
		[
			"R130A:3",
			"R130A:0"
		],
		[
			"R130A:3",
			"R130A:1"
		],
		[
			"R130A:2",
			"R130B:0"
		],
		[
			"R130A:2",
			"R130A:1"
		],
		[
			"H7:48",
			"H7:0"
		],
		[
			"H7:48",
			"I1:7:0"
		],
		[
			"H7:48",
			"R163B:0"
		],
		[
			"RERU4:0",
			"H14:7"
		],
		[
			"R274S:0",
			"R276:1"
		],
		[
			"R276:1",
			"R276:0"
		],
		[
			"H12:28",
			"H12:1"
		],
		[
			"H12:28",
			"I12:14:0"
		],
		[
			"H12:28",
			"H12:29"
		],
		[
			"H12:29",
			"R239:0"
		],
		[
			"H12:29",
			"H12:30"
		],
		[
			"H12:30",
			"RAHU10:0"
		],
		[
			"H11:7",
			"RBM210:0"
		],
		[
			"H11:7",
			"RBSC10:0"
		],
		[
			"H11:7",
			"RBW210:0"
		],
		[
			"H15:11",
			"H15:1"
		],
		[
			"H15:11",
			"REC15:0"
		],
		[
			"H15:11",
			"H15:2"
		],
		[
			"H15:5",
			"RBSC13:0"
		],
		[
			"H15:5",
			"RSBM200:0"
		],
		[
			"H15:6",
			"RERU15:0"
		],
		[
			"H15:6",
			"RSBW200:0"
		],
		[
			"H15:12",
			"I11:15:0"
		],
		[
			"H15:12",
			"H15:0"
		],
		[
			"H11:28",
			"H11:21"
		],
		[
			"H11:28",
			"H11:22"
		],
		[
			"H11:28",
			"RBSC11:0"
		],
		[
			"RSBW201:0",
			"H12:17"
		],
		[
			"RSBM201:0",
			"H12:18"
		],
		[
			"H11:29",
			"H11:30"
		],
		[
			"H11:29",
			"I11:14:0"
		],
		[
			"H11:29",
			"R274:0"
		],
		[
			"H11:31",
			"H11:30"
		],
		[
			"H2:15",
			"H2:0"
		],
		[
			"H2:15",
			"Rx102:0"
		],
		[
			"H2:15",
			"H2:1"
		],
		[
			"H2:14",
			"H2:5"
		],
		[
			"H2:14",
			"Rx103:0"
		],
		[
			"H2:14",
			"H2:6"
		],
		[
			"H1:11",
			"RSBM100:0"
		],
		[
			"H1:12",
			"RSBW100:0"
		],
		[
			"H8:30",
			"H8:5"
		],
		[
			"H8:30",
			"Rx101:0"
		],
		[
			"H8:30",
			"H8:4"
		],
		[
			"RCP2:0",
			"I1:7:1"
		],
		[
			"H9:24",
			"H9:21"
		],
		[
			"H9:24",
			"REC9:0"
		],
		[
			"H9:24",
			"H9:22"
		],
		[
			"H9:22",
			"RAHU3:0"
		]
	];
	const rooms = {
		"100": {
			vertices: [
				"R100:0"
			],
			names: [
				"Health Room",
				"Nurse's Office"
			],
			center: [
				478.85602,
				130.71211
			],
			outline: [
				[
					466.95,
					145.91998
				],
				[
					466.95,
					115.50397
				],
				[
					490.76202,
					115.50397
				],
				[
					490.76202,
					145.91998
				]
			],
			area: 724.2656
		},
		"102": {
			vertices: [
				"R102:0"
			],
			names: [
				"Security",
				"Security Office"
			],
			center: [
				478.85428,
				108.402596
			],
			outline: [
				[
					466.95,
					115.5
				],
				[
					466.95,
					101.30597
				],
				[
					490.76202,
					101.30597
				],
				[
					490.76202,
					115.5
				]
			],
			area: 337.9922
		},
		"105": {
			vertices: [
				"R105:0"
			],
			names: [
				"College and Career Center",
				"College Career Center",
				"College Office",
				"Career Office",
				"College Center",
				"Career Center"
			],
			center: [
				509.04404,
				51.58526
			],
			outline: [
				[
					487.54,
					53.29004
				],
				[
					498.01,
					63.13153
				],
				[
					526.157,
					63.13153
				],
				[
					526.157,
					49.55255
				],
				[
					509.94598,
					33.341553
				]
			],
			area: 744.0005
		},
		"106": {
			vertices: [
				"R106:0"
			],
			names: [
				"Business Admin"
			],
			center: [
				476.63522,
				68.13937
			],
			outline: [
				[
					466.77002,
					75.380005
				],
				[
					487.80402,
					75.380005
				],
				[
					487.80402,
					67.14508
				],
				[
					481.1867,
					60.068176
				],
				[
					466.7697,
					60.068176
				]
			],
			area: 298.65625
		},
		"107": {
			vertices: [
				"R107:0"
			],
			names: [
				"Counseling",
				"Guidance",
				"Guidance Office",
				"Counselors",
				"Counseling Office"
			],
			center: [
				489.9375,
				36.9375
			],
			outline: [
				[
					484.19,
					17.950012
				],
				[
					484.19,
					23.320007
				],
				[
					499.93,
					23.320007
				],
				[
					509.95197,
					33.34198
				],
				[
					487.54596,
					53.290955
				],
				[
					484.19016,
					49.819275
				],
				[
					429.55817,
					49.819275
				],
				[
					429.55817,
					39.56726
				],
				[
					420.03656,
					39.56726
				],
				[
					420.03656,
					24.343262
				],
				[
					414.11765,
					24.343262
				],
				[
					414.11765,
					17.950684
				]
			],
			area: 2477.2986
		},
		"110": {
			vertices: [
				"R110:0"
			],
			center: [
				450.9346,
				75.95906
			],
			outline: [
				[
					439.29,
					91.85004
				],
				[
					439.29,
					60.068054
				],
				[
					462.579,
					60.068054
				],
				[
					462.579,
					91.85004
				]
			],
			area: 740.1699
		},
		"111": {
			vertices: [
				"R111:0"
			],
			names: [
				"Registrar"
			],
			center: [
				438.55695,
				44.693497
			],
			outline: [
				[
					429.55002,
					49.820007
				],
				[
					429.55002,
					39.567017
				],
				[
					447.56403,
					39.567017
				],
				[
					447.56403,
					49.820007
				]
			],
			area: 184.69727
		},
		"112": {
			vertices: [
				"R112:0"
			],
			center: [
				427.26096,
				75.95911
			],
			outline: [
				[
					415.23,
					91.85004
				],
				[
					415.23,
					60.068054
				],
				[
					439.29102,
					60.068054
				],
				[
					439.29102,
					91.85004
				]
			],
			area: 764.7051
		},
		"114": {
			vertices: [
				"R114:0"
			],
			center: [
				403.7158,
				75.95902
			],
			outline: [
				[
					392.2,
					91.85004
				],
				[
					392.2,
					60.068054
				],
				[
					415.23203,
					60.068054
				],
				[
					415.23203,
					91.85004
				]
			],
			area: 732.0039
		},
		"115": {
			vertices: [
				"R115:0"
			],
			center: [
				404.1494,
				33.010185
			],
			outline: [
				[
					410.25,
					49.820007
				],
				[
					410.25,
					39.567017
				],
				[
					420.029,
					39.567383
				],
				[
					420.029,
					24.343384
				],
				[
					414.11008,
					24.343384
				],
				[
					414.11008,
					17.950806
				],
				[
					391.2071,
					17.950806
				],
				[
					391.2071,
					33.864807
				],
				[
					395.0594,
					33.864807
				],
				[
					395.0594,
					39.56732
				],
				[
					391.2071,
					39.56732
				],
				[
					391.2071,
					49.820312
				]
			],
			area: 758.4678
		},
		"116": {
			vertices: [
				"R116:0"
			],
			center: [
				329.00876,
				75.95911
			],
			outline: [
				[
					318.59003,
					91.85004
				],
				[
					318.59003,
					60.068054
				],
				[
					339.42703,
					60.068054
				],
				[
					339.42703,
					91.85004
				]
			],
			area: 662.24023
		},
		"117": {
			vertices: [
				"R117:0"
			],
			center: [
				329.18912,
				33.88501
			],
			outline: [
				[
					318.13,
					49.820007
				],
				[
					318.13,
					17.950012
				],
				[
					340.24802,
					17.950012
				],
				[
					340.24802,
					49.820007
				]
			],
			area: 704.9004
		},
		"118": {
			vertices: [
				"R118:0"
			],
			center: [
				307.39462,
				75.95907
			],
			outline: [
				[
					296.2,
					91.85004
				],
				[
					296.2,
					60.068054
				],
				[
					318.58902,
					60.068054
				],
				[
					318.58902,
					91.85004
				]
			],
			area: 711.5664
		},
		"119": {
			vertices: [
				"R119:0"
			],
			center: [
				306.54044,
				33.885014
			],
			outline: [
				[
					294.96002,
					49.820007
				],
				[
					294.96002,
					17.950012
				],
				[
					318.12103,
					17.950012
				],
				[
					318.12103,
					49.820007
				]
			],
			area: 738.1416
		},
		"120": {
			vertices: [
				"R120:0"
			],
			center: [
				284.88306,
				75.95907
			],
			outline: [
				[
					273.56,
					91.85004
				],
				[
					273.56,
					60.068054
				],
				[
					296.206,
					60.068054
				],
				[
					296.206,
					91.85004
				]
			],
			area: 719.7344
		},
		"121": {
			vertices: [
				"R121:0"
			],
			center: [
				283.64304,
				33.88501
			],
			outline: [
				[
					272.32,
					49.820007
				],
				[
					272.32,
					17.950012
				],
				[
					294.966,
					17.950012
				],
				[
					294.966,
					49.820007
				]
			],
			area: 721.72754
		},
		"122": {
			vertices: [
				"R122:0"
			],
			center: [
				261.71765,
				75.95908
			],
			outline: [
				[
					249.87999,
					91.85004
				],
				[
					249.87999,
					60.068054
				],
				[
					273.555,
					60.068054
				],
				[
					273.555,
					91.85004
				]
			],
			area: 752.4375
		},
		"123": {
			vertices: [
				"R123:0"
			],
			center: [
				261.377,
				33.885017
			],
			outline: [
				[
					250.43999,
					49.820007
				],
				[
					250.43999,
					17.950012
				],
				[
					272.314,
					17.950012
				],
				[
					272.314,
					49.820007
				]
			],
			area: 697.125
		},
		"124": {
			vertices: [
				"R124:0"
			],
			center: [
				237.53262,
				75.95908
			],
			outline: [
				[
					225.18,
					91.85004
				],
				[
					225.18,
					60.068054
				],
				[
					249.885,
					60.068054
				],
				[
					249.885,
					91.85004
				]
			],
			area: 785.17285
		},
		"125": {
			vertices: [
				"R125:0"
			],
			center: [
				237.38007,
				33.885017
			],
			outline: [
				[
					224.31999,
					49.820007
				],
				[
					224.31999,
					17.950012
				],
				[
					250.43999,
					17.950012
				],
				[
					250.43999,
					49.820007
				]
			],
			area: 832.4436
		},
		"126": {
			vertices: [
				"R126:0"
			],
			center: [
				198.79707,
				102.92001
			],
			outline: [
				[
					184,
					113.98999
				],
				[
					184,
					91.849976
				],
				[
					213.594,
					91.849976
				],
				[
					213.594,
					113.98999
				]
			],
			area: 655.21094
		},
		"127": {
			vertices: [
				"R127:0"
			],
			names: [
				"Auditorium",
				"Theater"
			],
			center: [
				92.235306,
				87.66436
			],
			outline: [
				[
					24.66,
					139.52002
				],
				[
					152.81999,
					139.52002
				],
				[
					164.01799,
					97.72803
				],
				[
					164.01799,
					75.699036
				],
				[
					153.35599,
					35.906067
				],
				[
					24.665989,
					35.906067
				]
			],
			area: 13992.992
		},
		"128": {
			vertices: [
				"R128:0"
			],
			center: [
				176.66867,
				151.07762
			],
			outline: [
				[
					163.93,
					156.60999
				],
				[
					163.93,
					145.54498
				],
				[
					189.407,
					145.54498
				],
				[
					189.407,
					156.60999
				]
			],
			area: 281.90234
		},
		"129": {
			vertices: [
				"R129:0"
			],
			center: [
				34.60151,
				162.71053
			],
			outline: [
				[
					14.703,
					178.31
				],
				[
					14.703,
					147.11102
				],
				[
					54.500004,
					147.11102
				],
				[
					54.500004,
					178.31
				]
			],
			area: 1241.6255
		},
		"131": {
			vertices: [
				"R131:0"
			],
			center: [
				61.19601,
				162.69307
			],
			outline: [
				[
					54.501,
					178.27002
				],
				[
					54.501,
					147.11603
				],
				[
					67.891,
					147.11603
				],
				[
					67.891,
					178.27002
				]
			],
			area: 417.15137
		},
		"132": {
			vertices: [
				"R132:0"
			],
			center: [
				314.31796,
				177.84453
			],
			outline: [
				[
					284.08002,
					194.70001
				],
				[
					284.08002,
					160.98901
				],
				[
					344.55603,
					160.98901
				],
				[
					344.55603,
					194.70001
				]
			],
			area: 2038.707
		},
		"133": {
			vertices: [
				"R133:0"
			],
			center: [
				81.157974,
				162.63449
			],
			outline: [
				[
					67.89,
					178.15002
				],
				[
					67.89,
					147.11902
				],
				[
					94.425995,
					147.11902
				],
				[
					94.425995,
					178.15002
				]
			],
			area: 823.43945
		},
		"134": {
			vertices: [
				"R134:0"
			],
			center: [
				341.60764,
				125.989525
			],
			outline: [
				[
					327.05002,
					137.57
				],
				[
					327.05002,
					114.409
				],
				[
					356.165,
					114.409
				],
				[
					356.165,
					137.57
				]
			],
			area: 674.33203
		},
		"135": {
			vertices: [
				"R135:0"
			],
			center: [
				106.65145,
				162.63443
			],
			outline: [
				[
					94.43,
					178.15002
				],
				[
					94.43,
					147.11902
				],
				[
					118.873,
					147.11902
				],
				[
					118.873,
					178.15002
				]
			],
			area: 758.4922
		},
		"136": {
			vertices: [
				"R136:0"
			],
			center: [
				341.6075,
				103.12804
			],
			outline: [
				[
					327.05002,
					114.410034
				],
				[
					327.05002,
					91.84601
				],
				[
					356.165,
					91.84601
				],
				[
					356.165,
					114.410034
				]
			],
			area: 656.9512
		},
		"137": {
			vertices: [
				"R137:0"
			],
			names: [
				"Side Gym",
				"Aux Gym",
				"Auxiliary Gym"
			],
			center: [
				88.02199,
				250.71901
			],
			outline: [
				[
					57.174,
					296.21002
				],
				[
					57.174,
					205.22803
				],
				[
					118.869995,
					205.22803
				],
				[
					118.869995,
					296.21002
				]
			],
			area: 5613.2246
		},
		"138": {
			vertices: [
				"R138:0"
			],
			names: [
				"Math Office",
				"Mathematics Office"
			],
			center: [
				392.05304,
				112.87898
			],
			outline: [
				[
					375.73,
					133.91003
				],
				[
					375.73,
					91.84802
				],
				[
					408.376,
					91.84802
				],
				[
					408.376,
					133.91003
				]
			],
			area: 1373.1562
		},
		"139": {
			vertices: [
				"R139:0"
			],
			names: [
				"Girls' Locker Room",
				"Girls Locker Room"
			],
			center: [
				193.875,
				223.75
			],
			outline: [
				[
					156.42,
					251.11002
				],
				[
					135.881,
					251.11005
				],
				[
					135.881,
					203.59106
				],
				[
					220.25,
					203.59088
				],
				[
					220.25,
					225.85388
				],
				[
					212.4332,
					225.85388
				],
				[
					212.4332,
					245.81387
				],
				[
					176.1792,
					245.81345
				],
				[
					176.17911,
					251.11053
				]
			],
			area: 3619.7012
		},
		"140": {
			vertices: [
				"R140:0"
			],
			center: [
				395.87503,
				161.0177
			],
			outline: [
				[
					375.73,
					176.12
				],
				[
					375.73,
					145.91498
				],
				[
					416.019,
					145.91498
				],
				[
					416.019,
					176.12
				]
			],
			area: 1216.9258
		},
		"141": {
			vertices: [
				"R141:0"
			],
			names: [
				"Girls' PE Office",
				"Girls' Gym Office",
				"Women's PE Office",
				"Women's Gym Office"
			],
			center: [
				224.25223,
				232.9573
			],
			outline: [
				[
					212.44,
					240.06
				],
				[
					212.44,
					225.854
				],
				[
					236.06401,
					225.854
				],
				[
					236.06401,
					240.06
				]
			],
			area: 335.60156
		},
		"142": {
			vertices: [
				"R142:0"
			],
			names: [
				"Science Office"
			],
			center: [
				436.6731,
				161.01729
			],
			outline: [
				[
					416.02002,
					176.12
				],
				[
					416.02002,
					145.91498
				],
				[
					457.32703,
					145.91498
				],
				[
					457.32703,
					176.12
				]
			],
			area: 1247.6836
		},
		"143": {
			vertices: [
				"R143:0",
				"R143:1"
			],
			names: [
				"Fitness Center",
				"Weight Room",
				"Exercise Room"
			],
			center: [
				250.87622,
				249.45927
			],
			outline: [
				[
					236.06,
					272.76
				],
				[
					236.06,
					225.85901
				],
				[
					259.341,
					225.85901
				],
				[
					259.341,
					230.13452
				],
				[
					266.5589,
					230.13452
				],
				[
					266.5589,
					269.91953
				],
				[
					259.341,
					269.91953
				],
				[
					259.341,
					272.7603
				]
			],
			area: 1379.0645
		},
		"144": {
			vertices: [
				"R144:16",
				"R144:0"
			],
			names: [
				"Main Office",
				"Office"
			],
			center: [
				515.875,
				158.125
			],
			outline: [
				[
					498.01,
					169.21002
				],
				[
					506.2605,
					172.33673
				],
				[
					516.3495,
					173.5708
				],
				[
					525.0677,
					172.41882
				],
				[
					534.2953,
					169.21002
				],
				[
					534.2953,
					63.140015
				],
				[
					498.00928,
					63.140015
				]
			],
			area: 3947.289
		},
		"145": {
			vertices: [
				"R145:1",
				"R145:0"
			],
			center: [
				449.8221,
				234.88376
			],
			outline: [
				[
					434.05002,
					214.29004
				],
				[
					457.05203,
					214.29004
				],
				[
					457.05203,
					196.97302
				],
				[
					465.69824,
					196.97302
				],
				[
					465.69824,
					255.57501
				],
				[
					441.24924,
					255.57501
				],
				[
					441.2492,
					273.59802
				],
				[
					431.3174,
					273.59802
				],
				[
					431.3174,
					268.9468
				],
				[
					434.0501,
					268.9468
				],
				[
					434.05014,
					214.2898
				]
			],
			area: 1598.7852
		},
		"146": {
			vertices: [
				"R146:0"
			],
			center: [
				579.25586,
				222.92041
			],
			outline: [
				[
					564.09,
					236.87
				],
				[
					564.09,
					208.97101
				],
				[
					594.42206,
					208.97101
				],
				[
					594.42206,
					236.87
				]
			],
			area: 846.2344
		},
		"147": {
			vertices: [
				"R147:0",
				"R147:1"
			],
			center: [
				501.6506,
				211.598
			],
			outline: [
				[
					480.01,
					226.22003
				],
				[
					480.01,
					196.97601
				],
				[
					523.291,
					196.97601
				],
				[
					523.291,
					226.22003
				]
			],
			area: 1265.7109
		},
		"148": {
			vertices: [
				"R148:0",
				"R148:1"
			],
			center: [
				579.2563,
				256.7631
			],
			outline: [
				[
					564.09,
					276.66
				],
				[
					564.09,
					236.86603
				],
				[
					594.42206,
					236.86603
				],
				[
					594.42206,
					276.66
				]
			],
			area: 1207.0312
		},
		"149": {
			vertices: [
				"R149:0",
				"R149:1"
			],
			center: [
				537.3374,
				219.0172
			],
			outline: [
				[
					523.29004,
					241.06
				],
				[
					523.29004,
					196.97498
				],
				[
					551.38605,
					196.97498
				],
				[
					551.38605,
					241.06
				]
			],
			area: 1238.6172
		},
		"150": {
			vertices: [
				"R150:0"
			],
			center: [
				547.13196,
				313.60852
			],
			outline: [
				[
					528.31,
					327.56
				],
				[
					528.31,
					299.66
				],
				[
					565.959,
					299.66
				],
				[
					565.959,
					327.56
				]
			],
			area: 1050.4219
		},
		"151": {
			vertices: [
				"R151:0"
			],
			center: [
				537.3421,
				245.4245
			],
			outline: [
				[
					523.29004,
					249.79001
				],
				[
					523.29004,
					241.05551
				],
				[
					551.38605,
					241.05551
				],
				[
					551.38605,
					249.79001
				]
			],
			area: 245.39844
		},
		"152": {
			vertices: [
				"R152:0"
			],
			center: [
				521.7981,
				310.35062
			],
			outline: [
				[
					515.28,
					321.04
				],
				[
					515.28,
					299.661
				],
				[
					528.317,
					299.661
				],
				[
					528.317,
					321.04
				]
			],
			area: 278.71875
		},
		"153": {
			vertices: [
				"R153:0",
				"R153:1"
			],
			center: [
				506.63535,
				277.21356
			],
			outline: [
				[
					481.46002,
					289.87003
				],
				[
					481.46002,
					264.558
				],
				[
					531.812,
					264.558
				],
				[
					531.812,
					289.87003
				]
			],
			area: 1274.5156
		},
		"155": {
			vertices: [
				"R155:0"
			],
			center: [
				455.12366,
				271.41345
			],
			outline: [
				[
					435.08002,
					277.80002
				],
				[
					435.0797,
					273.59982
				],
				[
					441.24982,
					273.59982
				],
				[
					441.24985,
					255.57681
				],
				[
					465.69885,
					255.57681
				],
				[
					465.69885,
					271.54883
				],
				[
					468.33896,
					271.54883
				],
				[
					468.339,
					290.90384
				],
				[
					454.17297,
					290.90384
				],
				[
					454.17297,
					277.79984
				]
			],
			area: 771.375
		},
		"156": {
			vertices: [
				"R156:0",
				"R156:1"
			],
			names: [
				"Cafeteria",
				"Lunch Room"
			],
			center: [
				456.58167,
				351.4709
			],
			outline: [
				[
					422.88,
					393.24002
				],
				[
					434.868,
					393.24002
				],
				[
					449.052,
					398.17642
				],
				[
					462.631,
					399.2318
				],
				[
					476.25803,
					396.88562
				],
				[
					490.045,
					391.94632
				],
				[
					490.045,
					306.79932
				],
				[
					422.88,
					306.79932
				]
			],
			area: 5996.883
		},
		"157": {
			vertices: [
				"R157:0"
			],
			names: [
				"School Store"
			],
			center: [
				424.98853,
				259.77045
			],
			outline: [
				[
					415.92,
					268.95
				],
				[
					434.053,
					268.95
				],
				[
					434.05298,
					250.58801
				],
				[
					415.91998,
					250.58801
				]
			],
			area: 332.95312
		},
		"158": {
			vertices: [
				"R158:0"
			],
			names: [
				"Kitchen"
			],
			center: [
				397.51248,
				347.29938
			],
			outline: [
				[
					382.09003,
					393.24002
				],
				[
					382.09003,
					301.359
				],
				[
					412.93503,
					301.359
				],
				[
					412.93503,
					393.24002
				]
			],
			area: 2834.0703
		},
		"159": {
			vertices: [
				"R159:0"
			],
			names: [
				"Athletic Specialist"
			],
			center: [
				408.4314,
				250.72908
			],
			outline: [
				[
					400.95,
					258.19
				],
				[
					400.95,
					243.272
				],
				[
					415.919,
					243.272
				],
				[
					415.919,
					258.19
				]
			],
			area: 223.3125
		},
		"160": {
			vertices: [
				"R160:0"
			],
			center: [
				367.60715,
				314.84528
			],
			outline: [
				[
					362.34003,
					324.72
				],
				[
					362.34003,
					304.97202
				],
				[
					372.877,
					304.97202
				],
				[
					372.877,
					324.72
				]
			],
			area: 208.08594
		},
		"161": {
			vertices: [
				"R161:0"
			],
			names: [
				"Business Office"
			],
			center: [
				408.43414,
				233.95627
			],
			outline: [
				[
					400.95,
					243.27002
				],
				[
					415.919,
					243.27002
				],
				[
					415.919,
					224.643
				],
				[
					400.95,
					224.64307
				]
			],
			area: 278.82812
		},
		"162": {
			vertices: [
				"R162:0"
			],
			center: [
				302.52072,
				322.65378
			],
			outline: [
				[
					286.05002,
					339.78
				],
				[
					286.05002,
					304.973
				],
				[
					315.98303,
					304.97278
				],
				[
					315.98303,
					311.14838
				],
				[
					319.57022,
					311.14838
				],
				[
					319.57022,
					339.78036
				],
				[
					292.6722,
					339.78024
				]
			],
			area: 1144.5938
		},
		"163": {
			vertices: [
				"R163:2",
				"R163:0",
				"R163:1"
			],
			names: [
				"Gym",
				"Main Gym"
			],
			center: [
				318.11993,
				247.40045
			],
			outline: [
				[
					266.56,
					293.78
				],
				[
					266.56,
					201.021
				],
				[
					369.68,
					201.021
				],
				[
					369.68,
					293.78
				]
			],
			area: 9565.3125
		},
		"164": {
			vertices: [
				"R164:0"
			],
			names: [
				"Building Services"
			],
			center: [
				278.62515,
				317.74216
			],
			outline: [
				[
					271.2,
					330.52002
				],
				[
					271.2,
					304.966
				],
				[
					286.052,
					304.966
				],
				[
					286.052,
					330.52002
				]
			],
			area: 379.53125
		},
		"165": {
			vertices: [
				"R165:0"
			],
			center: [
				253.09619,
				287.76035
			],
			outline: [
				[
					248.47,
					294.91
				],
				[
					248.47,
					280.615
				],
				[
					257.72513,
					280.615
				],
				[
					257.72513,
					294.91
				]
			],
			area: 132.30469
		},
		"166": {
			vertices: [
				"R166:0"
			],
			center: [
				248.50595,
				323.79395
			],
			outline: [
				[
					225.81,
					342.62003
				],
				[
					225.81,
					304.96802
				],
				[
					271.20203,
					304.96802
				],
				[
					271.20203,
					342.62003
				]
			],
			area: 1709.1016
		},
		"167": {
			vertices: [
				"R167:0"
			],
			names: [
				"Boys' PE Office",
				"Boys' Gym Office",
				"Men's PE Office",
				"Men's Gym Office"
			],
			center: [
				224.2522,
				266.24582
			],
			outline: [
				[
					212.44,
					272.76
				],
				[
					212.44,
					259.73
				],
				[
					236.063,
					259.73
				],
				[
					236.063,
					272.76
				]
			],
			area: 307.8047
		},
		"168": {
			vertices: [
				"R168:0"
			],
			center: [
				220.25603,
				318.91394
			],
			outline: [
				[
					214.7,
					332.85
				],
				[
					214.7,
					304.975
				],
				[
					225.81,
					304.975
				],
				[
					225.81,
					332.85
				]
			],
			area: 309.6875
		},
		"169": {
			vertices: [
				"R169:0"
			],
			names: [
				"Boys' Locker Room"
			],
			center: [
				193.875,
				276.5
			],
			outline: [
				[
					135.87999,
					295.63
				],
				[
					135.88025,
					251.111
				],
				[
					176.17825,
					251.11096
				],
				[
					176.17834,
					254.40405
				],
				[
					212.43234,
					254.40402
				],
				[
					212.43234,
					272.75702
				],
				[
					222.97934,
					272.75702
				],
				[
					222.97934,
					295.63
				]
			],
			area: 3529.8887
		},
		"170": {
			vertices: [
				"R170:0"
			],
			center: [
				204.94215,
				315.88437
			],
			outline: [
				[
					195.19,
					326.80002
				],
				[
					195.19,
					304.97003
				],
				[
					214.695,
					304.97003
				],
				[
					214.695,
					326.80002
				]
			],
			area: 425.79688
		},
		"172": {
			vertices: [
				"R172:0"
			],
			center: [
				186.92079,
				315.8845
			],
			outline: [
				[
					178.65,
					326.80002
				],
				[
					178.65,
					304.97003
				],
				[
					195.192,
					304.97003
				],
				[
					195.192,
					326.80002
				]
			],
			area: 361.11328
		},
		"174": {
			vertices: [
				"R174:0"
			],
			names: [
				"Dance Studio"
			],
			center: [
				196.6732,
				355.94394
			],
			outline: [
				[
					178.65,
					375.46002
				],
				[
					178.65,
					336.42902
				],
				[
					214.69699,
					336.42902
				],
				[
					214.69699,
					375.46002
				]
			],
			area: 1406.957
		},
		"176": {
			vertices: [
				"R176:0"
			],
			names: [
				"Wrestling Room"
			],
			center: [
				148.034,
				321.2645
			],
			outline: [
				[
					129.64,
					337.56
				],
				[
					129.64,
					304.969
				],
				[
					166.428,
					304.969
				],
				[
					166.428,
					337.56
				]
			],
			area: 1198.957
		},
		"200": {
			vertices: [
				"R200:0"
			],
			center: [
				478.85614,
				130.88208
			],
			outline: [
				[
					466.95,
					146.09003
				],
				[
					466.95,
					115.67401
				],
				[
					490.76202,
					115.67401
				],
				[
					490.76202,
					146.09003
				]
			],
			area: 724.2656
		},
		"201": {
			vertices: [
				"R201:1",
				"R201:0"
			],
			center: [
				518.17816,
				128.49454
			],
			outline: [
				[
					499.30002,
					146.09003
				],
				[
					521.403,
					146.09003
				],
				[
					521.403,
					162.53302
				],
				[
					534.302,
					162.53302
				],
				[
					534.302,
					103.545044
				],
				[
					499.3,
					103.545044
				]
			],
			area: 1701.2637
		},
		"202": {
			vertices: [
				"R202:0"
			],
			center: [
				478.85614,
				103.85199
			],
			outline: [
				[
					466.95,
					115.67999
				],
				[
					466.95,
					92.02399
				],
				[
					490.76202,
					92.02399
				],
				[
					490.76202,
					115.67999
				]
			],
			area: 563.2969
		},
		"204": {
			vertices: [
				"R204:0"
			],
			center: [
				482.5425,
				81.11628
			],
			outline: [
				[
					474.32,
					92.02002
				],
				[
					474.32,
					70.212036
				],
				[
					490.763,
					70.212036
				],
				[
					490.763,
					92.02002
				]
			],
			area: 358.58594
		},
		"205": {
			vertices: [
				"R205:0"
			],
			center: [
				509.04413,
				51.755264
			],
			outline: [
				[
					487.54,
					53.460022
				],
				[
					498.01,
					63.301514
				],
				[
					526.157,
					63.301514
				],
				[
					526.157,
					49.722534
				],
				[
					509.94598,
					33.511536
				]
			],
			area: 744
		},
		"206": {
			vertices: [
				"R206:0"
			],
			center: [
				479.94864,
				65.682175
			],
			outline: [
				[
					486.99002,
					70.21002
				],
				[
					486.99002,
					66.49194
				],
				[
					481.47812,
					60.236145
				],
				[
					474.32123,
					60.236145
				],
				[
					474.32123,
					70.21002
				]
			],
			area: 109.11328
		},
		"207": {
			vertices: [
				"R207:0"
			],
			center: [
				493.7816,
				35.717136
			],
			outline: [
				[
					484.19,
					23.48999
				],
				[
					499.93,
					23.48999
				],
				[
					509.95197,
					33.511963
				],
				[
					487.54596,
					53.460938
				],
				[
					484.18985,
					49.989258
				]
			],
			area: 492.57812
		},
		"209": {
			vertices: [
				"R209:0"
			],
			center: [
				472.7247,
				34.05497
			],
			outline: [
				[
					461.26,
					49.98999
				],
				[
					461.26,
					18.119995
				],
				[
					484.19,
					18.119995
				],
				[
					484.19,
					49.98999
				]
			],
			area: 730.7803
		},
		"210": {
			vertices: [
				"R210:0"
			],
			center: [
				450.9344,
				76.12903
			],
			outline: [
				[
					439.29,
					92.02002
				],
				[
					439.29,
					60.238037
				],
				[
					462.579,
					60.238037
				],
				[
					462.579,
					92.02002
				]
			],
			area: 740.1719
		},
		"211": {
			vertices: [
				"R211:0"
			],
			center: [
				449.93094,
				34.05499
			],
			outline: [
				[
					438.61002,
					49.98999
				],
				[
					438.61002,
					18.119995
				],
				[
					461.252,
					18.119995
				],
				[
					461.252,
					49.98999
				]
			],
			area: 721.6006
		},
		"212": {
			vertices: [
				"R212:0"
			],
			center: [
				427.26096,
				76.12906
			],
			outline: [
				[
					415.23,
					92.02002
				],
				[
					415.23,
					60.238037
				],
				[
					439.29102,
					60.238037
				],
				[
					439.29102,
					92.02002
				]
			],
			area: 764.7051
		},
		"213": {
			vertices: [
				"R213:0"
			],
			center: [
				427.02057,
				34.054985
			],
			outline: [
				[
					415.43002,
					49.98999
				],
				[
					415.43002,
					18.119995
				],
				[
					438.61102,
					18.119995
				],
				[
					438.61102,
					49.98999
				]
			],
			area: 738.77734
		},
		"214": {
			vertices: [
				"R214:0"
			],
			center: [
				403.71585,
				76.129
			],
			outline: [
				[
					392.2,
					92.02002
				],
				[
					392.2,
					60.238037
				],
				[
					415.23203,
					60.238037
				],
				[
					415.23203,
					92.02002
				]
			],
			area: 732.0039
		},
		"215": {
			vertices: [
				"R215:0"
			],
			center: [
				403.97617,
				34.055
			],
			outline: [
				[
					392.52002,
					49.98999
				],
				[
					392.52002,
					18.119995
				],
				[
					415.432,
					18.119995
				],
				[
					415.432,
					49.98999
				]
			],
			area: 730.2041
		},
		"216": {
			vertices: [
				"R216:0"
			],
			center: [
				329.00836,
				76.129
			],
			outline: [
				[
					318.59003,
					92.02002
				],
				[
					318.59003,
					60.238037
				],
				[
					339.42703,
					60.238037
				],
				[
					339.42703,
					92.02002
				]
			],
			area: 662.2422
		},
		"217": {
			vertices: [
				"R217:0"
			],
			center: [
				329.1891,
				34.055
			],
			outline: [
				[
					318.13,
					49.98999
				],
				[
					318.13,
					18.119995
				],
				[
					340.24802,
					18.119995
				],
				[
					340.24802,
					49.98999
				]
			],
			area: 704.9004
		},
		"218": {
			vertices: [
				"R218:0"
			],
			center: [
				307.39435,
				76.12898
			],
			outline: [
				[
					296.2,
					92.02002
				],
				[
					296.2,
					60.238037
				],
				[
					318.58902,
					60.238037
				],
				[
					318.58902,
					92.02002
				]
			],
			area: 711.56836
		},
		"219": {
			vertices: [
				"R219:0"
			],
			center: [
				306.54074,
				34.055
			],
			outline: [
				[
					294.96002,
					49.98999
				],
				[
					294.96002,
					18.119995
				],
				[
					318.12103,
					18.119995
				],
				[
					318.12103,
					49.98999
				]
			],
			area: 738.1406
		},
		"220": {
			vertices: [
				"R220:0"
			],
			center: [
				284.88303,
				76.129005
			],
			outline: [
				[
					273.56,
					92.02002
				],
				[
					273.56,
					60.238037
				],
				[
					296.206,
					60.238037
				],
				[
					296.206,
					92.02002
				]
			],
			area: 719.7344
		},
		"221": {
			vertices: [
				"R221:0"
			],
			center: [
				283.64307,
				34.055008
			],
			outline: [
				[
					272.32,
					49.98999
				],
				[
					272.32,
					18.119995
				],
				[
					294.966,
					18.119995
				],
				[
					294.966,
					49.98999
				]
			],
			area: 721.72705
		},
		"222": {
			vertices: [
				"R222:0"
			],
			center: [
				261.71753,
				76.129005
			],
			outline: [
				[
					249.87999,
					92.02002
				],
				[
					249.87999,
					60.238037
				],
				[
					273.555,
					60.238037
				],
				[
					273.555,
					92.02002
				]
			],
			area: 752.4385
		},
		"223": {
			vertices: [
				"R223:0"
			],
			center: [
				261.37708,
				34.054996
			],
			outline: [
				[
					250.43999,
					49.98999
				],
				[
					250.43999,
					18.119995
				],
				[
					272.314,
					18.119995
				],
				[
					272.314,
					49.98999
				]
			],
			area: 697.1245
		},
		"224": {
			vertices: [
				"R224:0"
			],
			center: [
				237.5325,
				76.12907
			],
			outline: [
				[
					225.18,
					92.02002
				],
				[
					225.18,
					60.238037
				],
				[
					249.885,
					60.238037
				],
				[
					249.885,
					92.02002
				]
			],
			area: 785.1738
		},
		"225": {
			vertices: [
				"R225:0"
			],
			center: [
				237.37994,
				34.054985
			],
			outline: [
				[
					224.31999,
					49.98999
				],
				[
					224.31999,
					18.119995
				],
				[
					250.43999,
					18.119995
				],
				[
					250.43999,
					49.98999
				]
			],
			area: 832.44434
		},
		"226": {
			vertices: [
				"R226:0"
			],
			center: [
				235.1581,
				151.25969
			],
			outline: [
				[
					221.34,
					164.78003
				],
				[
					221.34,
					137.74005
				],
				[
					248.97699,
					137.74005
				],
				[
					248.97699,
					164.78003
				]
			],
			area: 747.3086
		},
		"227": {
			vertices: [
				"R227:0"
			],
			center: [
				187.2896,
				39.48701
			],
			outline: [
				[
					174.08,
					49.98999
				],
				[
					174.08,
					28.984009
				],
				[
					200.49901,
					28.984009
				],
				[
					200.49901,
					49.98999
				]
			],
			area: 554.95654
		},
		"228": {
			vertices: [
				"R228:0"
			],
			center: [
				263.45557,
				151.2601
			],
			outline: [
				[
					248.97,
					164.78003
				],
				[
					248.97,
					137.74005
				],
				[
					277.941,
					137.74005
				],
				[
					277.941,
					164.78003
				]
			],
			area: 783.375
		},
		"229": {
			vertices: [
				"R229:0"
			],
			center: [
				187.28949,
				63.243523
			],
			outline: [
				[
					174.08,
					76.48999
				],
				[
					174.08,
					49.99701
				],
				[
					200.49901,
					49.99701
				],
				[
					200.49901,
					76.48999
				]
			],
			area: 699.91797
		},
		"230": {
			vertices: [
				"R230:1",
				"R230:0"
			],
			center: [
				296.82248,
				151.26006
			],
			outline: [
				[
					277.95,
					164.78003
				],
				[
					277.95,
					137.74005
				],
				[
					315.695,
					137.74005
				],
				[
					315.695,
					164.78003
				]
			],
			area: 1020.625
		},
		"231": {
			vertices: [
				"R231:0"
			],
			center: [
				187.28946,
				92.212456
			],
			outline: [
				[
					174.08,
					102.599976
				],
				[
					174.08,
					81.82495
				],
				[
					200.49901,
					81.82495
				],
				[
					200.49901,
					102.599976
				]
			],
			area: 548.85547
		},
		"232": {
			vertices: [
				"R232:0"
			],
			center: [
				329,
				143.625
			],
			outline: [
				[
					315.69,
					164.78003
				],
				[
					331.694,
					164.78003
				],
				[
					331.694,
					149.854
				],
				[
					342.735,
					149.854
				],
				[
					342.73434,
					137.73999
				],
				[
					315.68933,
					137.73999
				]
			],
			area: 566.5039
		},
		"233": {
			vertices: [
				"R233:0"
			],
			center: [
				187.2897,
				112.22462
			],
			outline: [
				[
					174.08,
					121.849976
				],
				[
					174.08,
					102.599
				],
				[
					200.49901,
					102.599
				],
				[
					200.49901,
					121.849976
				]
			],
			area: 508.58984
		},
		"234": {
			vertices: [
				"R234:0"
			],
			center: [
				341.6044,
				126.15232
			],
			outline: [
				[
					327.05002,
					137.73999
				],
				[
					356.16602,
					137.71198
				],
				[
					356.1652,
					114.57898
				],
				[
					327.0502,
					114.57898
				]
			],
			area: 673.93945
		},
		"235": {
			vertices: [
				"R235:0"
			],
			names: [
				"English Office"
			],
			center: [
				187.28952,
				145.48555
			],
			outline: [
				[
					174.08,
					169.12
				],
				[
					174.08,
					121.85101
				],
				[
					200.49901,
					121.85101
				],
				[
					200.49901,
					169.12
				]
			],
			area: 1248.7988
		},
		"236": {
			vertices: [
				"R236:0"
			],
			center: [
				341.60727,
				103.29789
			],
			outline: [
				[
					327.05002,
					114.58002
				],
				[
					327.05002,
					92.01599
				],
				[
					356.165,
					92.01599
				],
				[
					356.165,
					114.58002
				]
			],
			area: 656.9531
		},
		"237": {
			vertices: [
				"R237:0"
			],
			center: [
				187.125,
				192.625
			],
			outline: [
				[
					175.98999,
					212.96002
				],
				[
					221.08699,
					212.96002
				],
				[
					221.08699,
					178.46002
				],
				[
					200.502,
					178.46014
				],
				[
					200.502,
					169.12122
				],
				[
					175.99,
					169.12122
				]
			],
			area: 1784.7617
		},
		"238": {
			vertices: [
				"R238:0"
			],
			names: [
				"Social Studies Office"
			],
			center: [
				392.0532,
				119.05401
			],
			outline: [
				[
					375.73,
					146.09003
				],
				[
					375.73,
					92.018005
				],
				[
					408.376,
					92.018005
				],
				[
					408.376,
					146.09003
				]
			],
			area: 1765.2344
		},
		"239": {
			vertices: [
				"R239:0"
			],
			names: [
				"Art Office"
			],
			center: [
				256.45615,
				194.05301
			],
			outline: [
				[
					246.34999,
					201.20001
				],
				[
					246.34999,
					186.90503
				],
				[
					266.561,
					186.90503
				],
				[
					266.561,
					201.20001
				]
			],
			area: 288.91406
		},
		"240": {
			vertices: [
				"R240A:1",
				"R240:1",
				"R240:0"
			],
			center: [
				392.05228,
				161.19719
			],
			outline: [
				[
					375.73,
					176.29999
				],
				[
					375.73,
					146.09497
				],
				[
					408.376,
					146.09497
				],
				[
					408.376,
					176.29999
				]
			],
			area: 986.0781
		},
		"241": {
			vertices: [
				"R241:0"
			],
			center: [
				278.0753,
				187.80309
			],
			outline: [
				[
					266.56,
					201.20001
				],
				[
					266.56,
					174.40698
				],
				[
					289.592,
					174.40698
				],
				[
					289.592,
					201.20001
				]
			],
			area: 617.10156
		},
		"242": {
			vertices: [
				"R242:0",
				"R240A:0"
			],
			center: [
				443.00067,
				161.19716
			],
			outline: [
				[
					428.68002,
					176.29999
				],
				[
					428.68002,
					146.09497
				],
				[
					457.32303,
					146.09497
				],
				[
					457.32303,
					176.29999
				]
			],
			area: 865.16797
		},
		"243": {
			vertices: [
				"R243:0"
			],
			center: [
				343.69672,
				187.80331
			],
			outline: [
				[
					329.36002,
					201.20001
				],
				[
					329.36002,
					174.40698
				],
				[
					358.03403,
					174.40698
				],
				[
					358.03403,
					201.20001
				]
			],
			area: 768.2656
		},
		"244": {
			vertices: [
				"R244:0",
				"R201A:0"
			],
			center: [
				550.67645,
				172.12135
			],
			outline: [
				[
					521.4,
					186.25
				],
				[
					582.083,
					186.25037
				],
				[
					582.083,
					172.4314
				],
				[
					562.058,
					154.27838
				],
				[
					534.299,
					154.27838
				],
				[
					534.299,
					162.53015
				],
				[
					521.4,
					162.53015
				]
			],
			area: 1651.9531
		},
		"245": {
			vertices: [
				"R245:0"
			],
			names: [
				"Library",
				"Media Center"
			],
			center: [
				424.45312,
				226.5153
			],
			outline: [
				[
					376.77002,
					250.70001
				],
				[
					420.217,
					250.70001
				],
				[
					420.217,
					269.48602
				],
				[
					431.77402,
					269.48602
				],
				[
					431.77402,
					277.65485
				],
				[
					465.70102,
					277.65515
				],
				[
					465.70087,
					189.60217
				],
				[
					416.66388,
					189.60217
				],
				[
					416.66388,
					185.02838
				],
				[
					376.77087,
					185.02838
				]
			],
			area: 6747.535
		},
		"246": {
			vertices: [
				"R246:0"
			],
			center: [
				579.25586,
				223.09027
			],
			outline: [
				[
					564.09,
					237.03998
				],
				[
					564.09,
					209.14099
				],
				[
					594.42206,
					209.14099
				],
				[
					594.42206,
					237.03998
				]
			],
			area: 846.2344
		},
		"247": {
			vertices: [
				"R247:0"
			],
			center: [
				501.6506,
				211.76794
			],
			outline: [
				[
					480.01,
					226.39001
				],
				[
					480.01,
					197.146
				],
				[
					523.291,
					197.146
				],
				[
					523.291,
					226.39001
				]
			],
			area: 1265.7109
		},
		"248": {
			vertices: [
				"R248:0"
			],
			center: [
				579.25354,
				256.93216
			],
			outline: [
				[
					564.09,
					276.83002
				],
				[
					564.09,
					237.03601
				],
				[
					594.42206,
					237.03601
				],
				[
					594.42206,
					276.83002
				]
			],
			area: 1207.0469
		},
		"249": {
			vertices: [
				"R249:0",
				"R249:1"
			],
			center: [
				537.3374,
				219.18726
			],
			outline: [
				[
					523.29004,
					241.22998
				],
				[
					523.29004,
					197.14496
				],
				[
					551.38605,
					197.14496
				],
				[
					551.38605,
					241.22998
				]
			],
			area: 1238.6172
		},
		"250": {
			vertices: [
				"R250:0"
			],
			center: [
				566.6663,
				313.7907
			],
			outline: [
				[
					549.52,
					327.74
				],
				[
					549.52,
					299.83997
				],
				[
					583.809,
					299.83997
				],
				[
					583.809,
					327.74
				]
			],
			area: 956.65625
		},
		"251": {
			vertices: [
				"R251:0"
			],
			names: [
				"Tech Office",
				"Technology Office",
				"Computer Science Office",
				"CS Office"
			],
			center: [
				537.375,
				256.875
			],
			outline: [
				[
					523.29004,
					264.72998
				],
				[
					523.29004,
					241.237
				],
				[
					551.38605,
					241.237
				],
				[
					551.38605,
					264.72998
				]
			],
			area: 660.0625
		},
		"252": {
			vertices: [
				"R252:0"
			],
			center: [
				532.27374,
				313.79163
			],
			outline: [
				[
					515.02,
					327.74
				],
				[
					515.02,
					299.83997
				],
				[
					549.52203,
					299.83997
				],
				[
					549.52203,
					327.74
				]
			],
			area: 962.59375
		},
		"253": {
			vertices: [
				"R253:0"
			],
			center: [
				514.7342,
				277.90347
			],
			outline: [
				[
					497.66,
					291.08002
				],
				[
					497.66,
					264.72803
				],
				[
					531.811,
					264.72803
				],
				[
					531.811,
					291.08002
				]
			],
			area: 899.9531
		},
		"254": {
			vertices: [
				"R254:0"
			],
			center: [
				500.4676,
				313.79105
			],
			outline: [
				[
					485.91,
					327.74
				],
				[
					485.91,
					299.83997
				],
				[
					515.021,
					299.83997
				],
				[
					515.021,
					327.74
				]
			],
			area: 812.1875
		},
		"255": {
			vertices: [
				"R255:0"
			],
			center: [
				460.8445,
				284.36755
			],
			outline: [
				[
					452.49002,
					291.08002
				],
				[
					452.49002,
					277.656
				],
				[
					469.20203,
					277.656
				],
				[
					469.20203,
					291.08002
				]
			],
			area: 224.34375
		},
		"256": {
			vertices: [
				"R256:0"
			],
			center: [
				474.19028,
				313.78146
			],
			outline: [
				[
					462.47,
					327.73
				],
				[
					462.47,
					299.831
				],
				[
					485.908,
					299.831
				],
				[
					485.908,
					327.73
				]
			],
			area: 653.8906
		},
		"258": {
			vertices: [
				"R258:0"
			],
			center: [
				449.39426,
				326.5027
			],
			outline: [
				[
					436.32,
					342.8
				],
				[
					436.32,
					310.20398
				],
				[
					462.466,
					310.20398
				],
				[
					462.466,
					342.8
				]
			],
			area: 852.25
		},
		"260": {
			vertices: [
				"R260:0"
			],
			center: [
				423.2525,
				326.50165
			],
			outline: [
				[
					410.18002,
					342.8
				],
				[
					410.18002,
					310.20398
				],
				[
					436.32602,
					310.20398
				],
				[
					436.32602,
					342.8
				]
			],
			area: 852.2578
		},
		"261": {
			vertices: [
				"R261:0"
			],
			center: [
				392,
				287.25
			],
			outline: [
				[
					376.77002,
					298.40002
				],
				[
					376.77002,
					250.703
				],
				[
					420.217,
					250.703
				],
				[
					420.217,
					298.40002
				]
			],
			area: 2072.2969
		},
		"262": {
			vertices: [
				"R262:0"
			],
			names: [
				"World Language Office",
				"Foreign Language Office",
				"Spanish Office",
				"French Office",
				"Chinese Office",
				"Sign Language Office",
				"American Sign Language Office",
				"ASL Office"
			],
			center: [
				397.1479,
				326.5026
			],
			outline: [
				[
					384.12003,
					342.8
				],
				[
					384.12003,
					310.20398
				],
				[
					410.174,
					310.20398
				],
				[
					410.174,
					342.8
				]
			],
			area: 849.25
		},
		"264": {
			vertices: [
				"R264:0"
			],
			center: [
				318.11575,
				323.97372
			],
			outline: [
				[
					307.86002,
					342.8
				],
				[
					307.86002,
					305.14798
				],
				[
					328.372,
					305.14798
				],
				[
					328.372,
					342.8
				]
			],
			area: 772.3203
		},
		"266": {
			vertices: [
				"R266:0"
			],
			center: [
				297.7481,
				323.97424
			],
			outline: [
				[
					287.64,
					342.8
				],
				[
					287.64,
					305.14798
				],
				[
					307.85602,
					305.14798
				],
				[
					307.85602,
					342.8
				]
			],
			area: 761.1719
		},
		"268": {
			vertices: [
				"R268:0"
			],
			center: [
				277.66315,
				323.97357
			],
			outline: [
				[
					267.69,
					342.8
				],
				[
					267.69,
					305.14798
				],
				[
					287.637,
					305.14798
				],
				[
					287.637,
					342.8
				]
			],
			area: 751.0469
		},
		"270": {
			vertices: [
				"R270:0"
			],
			center: [
				257.58823,
				323.97412
			],
			outline: [
				[
					247.48,
					342.8
				],
				[
					247.48,
					305.14798
				],
				[
					267.696,
					305.14798
				],
				[
					267.696,
					342.8
				]
			],
			area: 761.1719
		},
		"272": {
			vertices: [
				"R272:0"
			],
			center: [
				236.6363,
				323.97418
			],
			outline: [
				[
					225.8,
					342.8
				],
				[
					225.8,
					305.14798
				],
				[
					247.472,
					305.14798
				],
				[
					247.472,
					342.8
				]
			],
			area: 815.9922
		},
		"274": {
			vertices: [
				"R274:0"
			],
			center: [
				189.89507,
				300.9706
			],
			outline: [
				[
					171.97,
					323.68
				],
				[
					171.97,
					278.261
				],
				[
					207.81999,
					278.261
				],
				[
					207.81999,
					323.68
				]
			],
			area: 1628.2695
		},
		"276": {
			vertices: [
				"R276:0"
			],
			center: [
				206.02661,
				259.99823
			],
			outline: [
				[
					188.68,
					278.26
				],
				[
					188.68,
					241.73602
				],
				[
					223.373,
					241.73602
				],
				[
					223.373,
					278.26
				]
			],
			area: 1267.125
		},
		"278": {
			vertices: [
				"R278:0"
			],
			center: [
				206.02641,
				227.34953
			],
			outline: [
				[
					188.68,
					241.73999
				],
				[
					188.68,
					212.95898
				],
				[
					223.373,
					212.95898
				],
				[
					223.373,
					241.73999
				]
			],
			area: 998.5
		},
		"1310": {
			vertices: [
				"R1310:0"
			],
			center: [
				499.37524,
				427.4663
			],
			outline: [
				[
					503.2,
					451.83002
				],
				[
					521.043,
					415.687
				],
				[
					495.54803,
					403.1
				],
				[
					477.70505,
					439.243
				]
			],
			area: 1146.0469
		},
		"1311": {
			vertices: [
				"R1311:0"
			],
			center: [
				525.0328,
				440.13284
			],
			outline: [
				[
					503.2,
					451.83002
				],
				[
					529.021,
					464.57703
				],
				[
					546.864,
					428.43402
				],
				[
					521.043,
					415.687
				]
			],
			area: 1160.6875
		},
		"1312": {
			vertices: [
				"R1312:0"
			],
			center: [
				580.86475,
				416.42392
			],
			outline: [
				[
					566.28,
					396.47
				],
				[
					604.512,
					409.237
				],
				[
					595.4486,
					436.378
				],
				[
					557.2166,
					423.611
				]
			],
			area: 1153.3672
		},
		"1313": {
			vertices: [
				"R1313:0"
			],
			center: [
				589.949,
				389.46194
			],
			outline: [
				[
					566.28,
					396.47
				],
				[
					604.512,
					409.237
				],
				[
					613.57544,
					382.096
				],
				[
					575.13544,
					369.95102
				]
			],
			area: 1140.1562
		},
		"128B.4": {
			vertices: [
				"R128B.4:1",
				"R128B.4:0"
			],
			names: [
				"Practice Room 1"
			],
			center: [
				192.62445,
				192.3817
			],
			outline: [
				[
					189.41,
					194.70001
				],
				[
					189.41,
					190.06781
				],
				[
					195.8432,
					190.06781
				],
				[
					195.8432,
					194.70001
				]
			],
			area: 29.800781
		},
		"157Z": {
			vertices: [
				"R157Z:0"
			],
			center: [
				430.16528,
				244.9066
			],
			outline: [
				[
					426.29,
					250.59003
				],
				[
					426.29,
					239.22903
				],
				[
					434.0527,
					239.22903
				],
				[
					434.0527,
					250.59003
				]
			],
			area: 88.19531
		},
		"166B": {
			vertices: [
				"R166B:0"
			],
			center: [
				237.41908,
				335.374
			],
			outline: [
				[
					225.81,
					342.62003
				],
				[
					225.81,
					328.13004
				],
				[
					249.03,
					328.13004
				],
				[
					249.03,
					342.62003
				]
			],
			area: 336.46094
		},
		BW104: {
			vertices: [
				"RBW104:0"
			],
			names: [
				"Women's Restroom (Bulldog Lobby)",
				"Women's Bathroom (Bulldog Lobby)"
			],
			center: [
				383.9655,
				82.3281
			],
			outline: [
				[
					375.73,
					91.85004
				],
				[
					375.73,
					72.80603
				],
				[
					392.2,
					72.80603
				],
				[
					392.2,
					91.85004
				]
			],
			area: 313.6543,
			tags: [
				"women-bathroom"
			]
		},
		SBM200: {
			vertices: [
				"RSBM200:0"
			],
			names: [
				"Staff Men's Restroom (Upstairs Bulldog Lobby)",
				"Staff Men's Bathroom (Upstairs Bulldog Lobby)"
			],
			center: [
				343.50278,
				63.332714
			],
			outline: [
				[
					339.43002,
					66.42999
				],
				[
					339.43002,
					60.236572
				],
				[
					347.58173,
					60.236572
				],
				[
					347.58173,
					66.42999
				]
			],
			area: 50.48828,
			tags: [
				"staff-men-bathroom"
			]
		},
		"128B.2": {
			vertices: [
				"R128B.2:0"
			],
			names: [
				"Practice Room 2"
			],
			center: [
				186.78046,
				168.09177
			],
			outline: [
				[
					184.15,
					171.79999
				],
				[
					184.15,
					164.37756
				],
				[
					189.4041,
					164.37756
				],
				[
					189.4041,
					171.79999
				]
			],
			area: 38.996094
		},
		"235B": {
			vertices: [
				"R235B:0"
			],
			center: [
				179.28278,
				164.06764
			],
			outline: [
				[
					174.08,
					169.12
				],
				[
					174.08,
					159.018
				],
				[
					184.489,
					159.018
				],
				[
					184.489,
					169.12
				]
			],
			area: 105.1543
		},
		AED101: {
			vertices: [
				"RAED101:0"
			],
			names: [
				"AED (Gym)",
				"Automated External Defibrillator (Gym)",
				"AED (Main Gym)",
				"Automated External Defibrillator (Main Gym)"
			],
			center: [
				255.07112,
				295.5264
			],
			outline: [
				[
					254.24998,
					294.91
				],
				[
					254.24998,
					296.3295
				],
				[
					256.0535,
					296.3295
				],
				[
					256.0535,
					294.91
				]
			],
			area: 2.5625,
			tags: [
				"aed"
			]
		},
		"107J": {
			vertices: [
				"R107J:0"
			],
			center: [
				475.9122,
				44.693447
			],
			outline: [
				[
					467.64,
					49.820007
				],
				[
					467.64,
					39.567017
				],
				[
					484.18503,
					39.567017
				],
				[
					484.18503,
					49.820007
				]
			],
			area: 169.63672
		},
		"144Z": {
			vertices: [
				"R144Z:0"
			],
			center: [
				499.28833,
				102.430305
			],
			outline: [
				[
					498.01,
					107.71002
				],
				[
					498.01,
					97.156006
				],
				[
					500.5936,
					97.156006
				],
				[
					500.5936,
					107.71002
				]
			],
			area: 27.269531
		},
		"137D": {
			vertices: [
				"R137D:0"
			],
			center: [
				132.35812,
				262.4281
			],
			outline: [
				[
					128.83,
					273.75
				],
				[
					128.83,
					251.107
				],
				[
					135.8866,
					251.107
				],
				[
					135.8866,
					273.75
				]
			],
			area: 159.7832
		},
		EC17: {
			vertices: [
				"REC17:0"
			],
			names: [
				"EC-17",
				"Electrical Closet 17"
			],
			center: [
				217.47661,
				152.42403
			],
			outline: [
				[
					213.59999,
					154.03998
				],
				[
					213.59999,
					150.7998
				],
				[
					221.3416,
					150.7998
				],
				[
					221.3416,
					154.03998
				]
			],
			area: 25.082031,
			tags: [
				"ec"
			]
		},
		"235D": {
			vertices: [
				"R235D:0"
			],
			names: [
				"English Storage"
			],
			center: [
				217.47218,
				144.27286
			],
			outline: [
				[
					213.59999,
					150.79999
				],
				[
					213.59999,
					137.74402
				],
				[
					221.3416,
					137.74402
				],
				[
					221.3416,
					150.79999
				]
			],
			area: 101.072266
		},
		"242Z": {
			vertices: [
				"R242Z:0"
			],
			center: [
				485.4262,
				150.93987
			],
			outline: [
				[
					480.08002,
					155.78998
				],
				[
					480.08002,
					146.08618
				],
				[
					490.76,
					146.08618
				],
				[
					490.76,
					155.78998
				]
			],
			area: 103.63281
		},
		BM214: {
			vertices: [
				"RBM214:0"
			],
			names: [
				"Men's Restroom (Upstairs Central Intersection)",
				"Men's Bathroom (Upstairs Central Intersection)"
			],
			center: [
				339.86,
				157.31609
			],
			outline: [
				[
					336.99002,
					164.78003
				],
				[
					336.99002,
					149.854
				],
				[
					342.7336,
					149.854
				],
				[
					342.7336,
					164.78003
				]
			],
			area: 85.73047,
			tags: [
				"men-bathroom",
				"closed"
			]
		},
		x201: {
			vertices: [
				"Rx201:0"
			],
			names: [
				"Storage"
			],
			center: [
				483.5,
				284.125
			],
			outline: [
				[
					469.2,
					291.08002
				],
				[
					497.656,
					291.08026
				],
				[
					497.656,
					264.72827
				],
				[
					481.45502,
					264.72827
				],
				[
					481.45502,
					277.65527
				],
				[
					469.2,
					277.65503
				]
			],
			area: 591.45703
		},
		"130C": {
			vertices: [
				"R130C:0"
			],
			center: [
				280.6875,
				151.1875
			],
			outline: [
				[
					269.92,
					194.70001
				],
				[
					269.91986,
					160.98901
				],
				[
					269.91986,
					137.57
				],
				[
					292.05087,
					137.57
				],
				[
					292.05087,
					160.98901
				],
				[
					284.07288,
					160.98901
				],
				[
					284.07303,
					194.70001
				]
			],
			area: 995.39844
		},
		SBM100: {
			vertices: [
				"RSBM100:0"
			],
			names: [
				"Staff Men's Restroom (Downstairs Bulldog Lobby)",
				"Staff Men's Bathroom (Downstairs Bulldog Lobby)"
			],
			center: [
				343.50278,
				63.162685
			],
			outline: [
				[
					339.43002,
					66.26001
				],
				[
					339.43002,
					60.06659
				],
				[
					347.58173,
					60.06659
				],
				[
					347.58173,
					66.26001
				]
			],
			area: 50.48828,
			tags: [
				"staff-men-bathroom"
			]
		},
		"107B": {
			vertices: [
				"R107B:0"
			],
			center: [
				470.73276,
				25.903046
			],
			outline: [
				[
					466.1,
					33.859985
				],
				[
					466.1,
					17.945984
				],
				[
					475.36432,
					17.945984
				],
				[
					475.36432,
					33.859985
				]
			],
			area: 147.43164
		},
		"128B.3": {
			vertices: [
				"R128B.3:0"
			],
			names: [
				"Choral Office",
				"Choral Music Office"
			],
			center: [
				183.62047,
				186.33696
			],
			outline: [
				[
					177.83,
					194.70001
				],
				[
					177.83,
					177.97302
				],
				[
					189.41,
					177.97302
				],
				[
					189.41,
					194.70001
				]
			],
			area: 193.69727
		},
		HS103: {
			vertices: [
				"RHS103:0"
			],
			names: [
				"Hand Sanitization (Drop Off)",
				"Hand Sanitization Station (Drop Off)"
			],
			center: [
				570.09344,
				291.72763
			],
			outline: [
				[
					569.37,
					291.11002
				],
				[
					569.37,
					292.5295
				],
				[
					571.1735,
					292.5295
				],
				[
					571.1735,
					291.11002
				]
			],
			area: 2.5625,
			tags: [
				"hs"
			]
		},
		EC6: {
			vertices: [
				"REC6:0"
			],
			names: [
				"EC-6",
				"Electrical Closet 6"
			],
			center: [
				135.06012,
				189.6298
			],
			outline: [
				[
					128.42,
					188.12
				],
				[
					134.5837,
					194.69598
				],
				[
					139.9027,
					194.69598
				],
				[
					139.9027,
					185.68951
				],
				[
					128.4197,
					185.68951
				]
			],
			area: 83.15234,
			tags: [
				"ec"
			]
		},
		"235C": {
			vertices: [
				"R235C:0"
			],
			center: [
				180.9042,
				128.9923
			],
			outline: [
				[
					174.08,
					136.14001
				],
				[
					174.08,
					121.84503
				],
				[
					187.729,
					121.84503
				],
				[
					187.729,
					136.14001
				]
			],
			area: 195.11328
		},
		AED100: {
			vertices: [
				"RAED100:0"
			],
			names: [
				"AED (Main Office)",
				"Automated External Defibrillator (Main Office)"
			],
			center: [
				480.63818,
				160.57927
			],
			outline: [
				[
					481.5,
					159.73004
				],
				[
					480.0805,
					159.73004
				],
				[
					480.0805,
					161.53357
				],
				[
					481.5,
					161.53357
				]
			],
			area: 2.5625,
			tags: [
				"aed"
			]
		},
		"107E": {
			vertices: [
				"R107E:0"
			],
			center: [
				443.4479,
				25.903042
			],
			outline: [
				[
					439.33002,
					33.859985
				],
				[
					439.33002,
					17.945984
				],
				[
					447.5649,
					17.945984
				],
				[
					447.5649,
					33.859985
				]
			],
			area: 131.0498
		},
		"261B": {
			vertices: [
				"R261B:0"
			],
			names: [
				"TV Studio",
				"Television Studio",
				"Broadcast"
			],
			center: [
				408.09027,
				266.2014
			],
			outline: [
				[
					395.96002,
					281.7
				],
				[
					395.96002,
					250.70203
				],
				[
					420.21902,
					250.70203
				],
				[
					420.21902,
					281.7
				]
			],
			area: 751.97656
		},
		"159Z": {
			vertices: [
				"R159Z:0",
				"R159Z:1"
			],
			center: [
				421.10663,
				244.91016
			],
			outline: [
				[
					415.92,
					250.59003
				],
				[
					415.92,
					239.22903
				],
				[
					426.29,
					239.22903
				],
				[
					426.29,
					250.59003
				]
			],
			area: 117.8125
		},
		BM202: {
			vertices: [
				"RBM202:0"
			],
			names: [
				"Men's Restroom (25X)",
				"Men's Bathroom (25X)"
			],
			center: [
				536.62616,
				273.46774
			],
			outline: [
				[
					531.81,
					282.21002
				],
				[
					531.81,
					264.729
				],
				[
					541.448,
					264.729
				],
				[
					541.448,
					282.21002
				]
			],
			area: 168.48438,
			tags: [
				"men-bathroom"
			]
		},
		BC202: {
			vertices: [
				"RBC202:0"
			],
			names: [
				"Bleeding Control (22x)",
				"Bleeding Control Kit (22x)"
			],
			center: [
				212.90398,
				64.49268
			],
			outline: [
				[
					212.18,
					65.390015
				],
				[
					213.59949,
					65.390015
				],
				[
					213.59949,
					63.586487
				],
				[
					212.18,
					63.586487
				]
			],
			area: 2.5595703,
			tags: [
				"bleed-control"
			]
		},
		x202: {
			vertices: [
				"Rx202:0"
			],
			names: [
				"Storage"
			],
			center: [
				256.4553,
				180.65092
			],
			outline: [
				[
					246.34999,
					186.90002
				],
				[
					246.34999,
					174.40204
				],
				[
					266.561,
					174.40204
				],
				[
					266.561,
					186.90002
				]
			],
			area: 252.59766
		},
		BC200: {
			vertices: [
				"RBC200:0"
			],
			names: [
				"Bleeding Control (20x)",
				"Bleeding Control Kit (20x)"
			],
			center: [
				480.69055,
				50.69616
			],
			outline: [
				[
					479.82,
					49.98999
				],
				[
					479.82,
					51.409485
				],
				[
					481.6235,
					51.409485
				],
				[
					481.6235,
					49.98999
				]
			],
			area: 2.5605469,
			tags: [
				"bleed-control"
			]
		},
		"163X": {
			vertices: [
				"R163X:0"
			],
			names: [
				"Coaches' Office",
				"Coach Office",
				"Gym Office"
			],
			center: [
				363.8482,
				258.0924
			],
			outline: [
				[
					358.04,
					260.68002
				],
				[
					358.04,
					255.52393
				],
				[
					369.683,
					255.52393
				],
				[
					369.683,
					260.68002
				]
			],
			area: 60.039062
		},
		"100Y": {
			vertices: [
				"R100Y:0"
			],
			center: [
				486.75595,
				118.5144
			],
			outline: [
				[
					482.75,
					121.53003
				],
				[
					482.75,
					115.4978
				],
				[
					490.7566,
					115.4978
				],
				[
					490.7566,
					121.53003
				]
			],
			area: 48.296875
		},
		"244A": {
			vertices: [
				"R244A:0"
			],
			center: [
				527.8497,
				178.56822
			],
			outline: [
				[
					521.4,
					186.25
				],
				[
					521.4,
					170.88599
				],
				[
					534.299,
					170.88599
				],
				[
					534.299,
					186.25
				]
			],
			area: 198.17969
		},
		BW102: {
			vertices: [
				"RBW102:0"
			],
			names: [
				"Women's Restroom (Cafeteria)",
				"Women's Bathroom (Cafeteria)"
			],
			center: [
				546.41754,
				273.28848
			],
			outline: [
				[
					541.45,
					282.03
				],
				[
					541.45,
					264.549
				],
				[
					551.3892,
					264.549
				],
				[
					551.3892,
					282.03
				]
			],
			area: 173.75,
			tags: [
				"women-bathroom"
			]
		},
		"235A": {
			vertices: [
				"R235A:0",
				"R235A:1"
			],
			center: [
				192.49522,
				164.06902
			],
			outline: [
				[
					184.48999,
					169.12
				],
				[
					184.48999,
					159.018
				],
				[
					200.49998,
					159.018
				],
				[
					200.49998,
					169.12
				]
			],
			area: 161.73242
		},
		BC205: {
			vertices: [
				"RBC205:0"
			],
			names: [
				"Bleeding Control (26X)",
				"Bleeding Control Kit (26X)"
			],
			center: [
				329.31088,
				307.29254
			],
			outline: [
				[
					328.37003,
					307.98
				],
				[
					329.78952,
					307.98
				],
				[
					329.78952,
					306.1765
				],
				[
					328.37003,
					306.1765
				]
			],
			area: 2.5546875,
			tags: [
				"bleed-control"
			]
		},
		BM210: {
			vertices: [
				"RBM210:0"
			],
			names: [
				"Men's Restroom (Language Hall)",
				"Men's Bathroom (Language Hall)",
				"Men's Restroom (World Language Hallway)",
				"Men's Bathroom (World Language Hallway)"
			],
			center: [
				332.73642,
				328.55005
			],
			outline: [
				[
					328.37003,
					342.8
				],
				[
					338.17484,
					342.8
				],
				[
					338.17444,
					322.214
				],
				[
					333.75864,
					322.2141
				],
				[
					333.75864,
					310.20312
				],
				[
					328.37003,
					310.20312
				]
			],
			area: 266.5586,
			tags: [
				"closed",
				"men-bathroom"
			]
		},
		"139A": {
			vertices: [
				"R139A:0"
			],
			center: [
				166.84904,
				212.23553
			],
			outline: [
				[
					157.52,
					220.88
				],
				[
					157.52,
					203.591
				],
				[
					176.17801,
					203.591
				],
				[
					176.17801,
					220.88
				]
			],
			area: 322.57812
		},
		EC9: {
			vertices: [
				"REC9:0"
			],
			names: [
				"EC-9",
				"Electrical Closet 9"
			],
			center: [
				208.03818,
				45.81793
			],
			outline: [
				[
					204.87999,
					51.109985
				],
				[
					204.87999,
					40.526
				],
				[
					211.19699,
					40.526
				],
				[
					211.19699,
					51.109985
				]
			],
			area: 66.859375,
			tags: [
				"ec"
			]
		},
		"107F": {
			vertices: [
				"R107F:0"
			],
			center: [
				434.5714,
				25.902977
			],
			outline: [
				[
					429.81,
					33.859985
				],
				[
					429.81,
					17.945984
				],
				[
					439.3316,
					17.945984
				],
				[
					439.3316,
					33.859985
				]
			],
			area: 151.52686
		},
		"153Y": {
			vertices: [
				"R153Y:1",
				"R153Y:0"
			],
			center: [
				544.0233,
				257.17758
			],
			outline: [
				[
					536.63,
					264.55002
				],
				[
					536.63,
					249.79202
				],
				[
					551.388,
					249.79202
				],
				[
					551.388,
					264.55002
				]
			],
			area: 217.78125
		},
		BC102: {
			vertices: [
				"RBC102:0"
			],
			names: [
				"Bleeding Control (Gym)",
				"Bleeding Control Kit (Gym)",
				"Bleeding Control (Main Gym)",
				"Bleeding Control Kit (Main Gym)"
			],
			center: [
				251.50865,
				295.8267
			],
			outline: [
				[
					250.43001,
					294.91
				],
				[
					250.43001,
					296.3295
				],
				[
					252.2335,
					296.3295
				],
				[
					252.2335,
					294.91
				]
			],
			area: 2.5546875,
			tags: [
				"bleed-control"
			]
		},
		"155A": {
			vertices: [
				"R155A:0"
			],
			center: [
				461.24445,
				284.34308
			],
			outline: [
				[
					454.17,
					290.90002
				],
				[
					454.17,
					277.79602
				],
				[
					468.336,
					277.79602
				],
				[
					468.336,
					290.90002
				]
			],
			area: 185.64062
		},
		"238C": {
			vertices: [
				"R238C:0"
			],
			center: [
				397.45642,
				136.44833
			],
			outline: [
				[
					386.54,
					146.09003
				],
				[
					386.54,
					126.80701
				],
				[
					408.37302,
					126.80701
				],
				[
					408.37302,
					146.09003
				]
			],
			area: 421.0078
		},
		BW214: {
			vertices: [
				"RBW214:0"
			],
			names: [
				"Women's Restroom (Upstairs Central Intersection)",
				"Women's Bathroom (Upstairs Central Intersection)"
			],
			center: [
				334.35117,
				157.31825
			],
			outline: [
				[
					331.7,
					164.78003
				],
				[
					331.7,
					149.854
				],
				[
					336.99762,
					149.854
				],
				[
					336.99762,
					164.78003
				]
			],
			area: 79.07031,
			tags: [
				"closed",
				"women-bathroom"
			]
		},
		"147Z": {
			vertices: [
				"R147Z:1",
				"R147Z:0"
			],
			center: [
				472.85513,
				218.0082
			],
			outline: [
				[
					465.7,
					226.22003
				],
				[
					465.7,
					209.79706
				],
				[
					480.01202,
					209.79706
				],
				[
					480.01202,
					226.22003
				]
			],
			area: 235.04688
		},
		WF102: {
			vertices: [
				"RWF102:0"
			],
			names: [
				"Bottle Fill Station (Music)",
				"Water Bottle Filling Station (Music)",
				"Water Fountain (Music)",
				"Drinking Fountain (Music)"
			],
			center: [
				146.8482,
				202.86702
			],
			outline: [
				[
					147.76,
					203.59003
				],
				[
					147.76,
					202.17053
				],
				[
					145.9565,
					202.17053
				],
				[
					145.9565,
					203.59003
				]
			],
			area: 2.5605469,
			tags: [
				"wf"
			]
		},
		"241B": {
			vertices: [
				"R241B:0"
			],
			center: [
				308.8234,
				179.84523
			],
			outline: [
				[
					301.35,
					185.28998
				],
				[
					301.35,
					174.39996
				],
				[
					316.29602,
					174.39996
				],
				[
					316.29602,
					185.28998
				]
			],
			area: 162.76172
		},
		"127B": {
			vertices: [
				"R127B:0"
			],
			center: [
				168.46533,
				34.922493
			],
			outline: [
				[
					160.27,
					30.450012
				],
				[
					165.9185,
					40.23352
				],
				[
					174.0786,
					40.23352
				],
				[
					174.0786,
					30.450012
				]
			],
			area: 107.465576
		},
		BSC2EC3: {
			vertices: [
				"RBSC2EC3:0"
			],
			names: [
				"BSC-2 EC-3",
				"Bathroom Supply Closet 2, Electrical Closet 3"
			],
			center: [
				541.41534,
				285.9526
			],
			outline: [
				[
					537.98004,
					289.87003
				],
				[
					537.98004,
					282.03912
				],
				[
					544.8577,
					282.03912
				],
				[
					544.8577,
					289.87003
				]
			],
			area: 53.859375,
			tags: [
				"bsc",
				"ec"
			]
		},
		"144F": {
			vertices: [
				"R144F:0"
			],
			center: [
				525.38214,
				69.41408
			],
			outline: [
				[
					516.47003,
					75.70001
				],
				[
					516.47003,
					63.12799
				],
				[
					534.293,
					63.12799
				],
				[
					534.293,
					75.70001
				]
			],
			area: 224.07031
		},
		"203C": {
			vertices: [
				"R203C:0"
			],
			names: [
				"Special Education Services"
			],
			center: [
				521.2448,
				68.19993
			],
			outline: [
				[
					508.19,
					73.09003
				],
				[
					508.19,
					63.30951
				],
				[
					534.297,
					63.30951
				],
				[
					534.297,
					73.09003
				]
			],
			area: 255.33789
		},
		BSC11: {
			vertices: [
				"RBSC11:0"
			],
			names: [
				"BSC-11",
				"Bathroom Supply Closet 11"
			],
			center: [
				540.85144,
				286.66318
			],
			outline: [
				[
					536.77,
					291.08002
				],
				[
					536.77,
					282.20972
				],
				[
					544.8621,
					282.20972
				],
				[
					544.8621,
					291.08002
				]
			],
			area: 71.765625,
			tags: [
				"bsc"
			]
		},
		x102: {
			vertices: [
				"Rx102:0"
			],
			names: [
				"Closet"
			],
			center: [
				577.7713,
				279.68158
			],
			outline: [
				[
					569.37,
					282.73
				],
				[
					569.37,
					276.66052
				],
				[
					586.227,
					276.66052
				],
				[
					586.227,
					282.73
				]
			],
			area: 102.328125
		},
		BM104: {
			vertices: [
				"RBM104:0"
			],
			names: [
				"Men's Restroom (Bulldog Lobby)",
				"Men's Bathroom (Bulldog Lobby)"
			],
			center: [
				347.80078,
				82.32814
			],
			outline: [
				[
					339.43002,
					91.85004
				],
				[
					339.43002,
					72.80603
				],
				[
					356.17102,
					72.80603
				],
				[
					356.17102,
					91.85004
				]
			],
			area: 318.81445,
			tags: [
				"men-bathroom"
			]
		},
		"139B": {
			vertices: [
				"R139B:0"
			],
			center: [
				146.1495,
				238.75835
			],
			outline: [
				[
					135.87999,
					251.11002
				],
				[
					135.87999,
					226.40704
				],
				[
					156.41899,
					226.40704
				],
				[
					156.41899,
					251.11002
				]
			],
			area: 507.375
		},
		"138C": {
			vertices: [
				"R138C:0"
			],
			center: [
				399.54462,
				126.9037
			],
			outline: [
				[
					390.72,
					133.91003
				],
				[
					390.72,
					119.89801
				],
				[
					408.371,
					119.89801
				],
				[
					408.371,
					133.91003
				]
			],
			area: 247.32812
		},
		HS111: {
			vertices: [
				"RHS111:0"
			],
			names: [
				"Hand Sanitization (Gym)",
				"Hand Sanitization Station (Gym)",
				"Hand Sanitization (Main Gym)",
				"Hand Sanitization Station (Main Gym)"
			],
			center: [
				373.23343,
				233.56166
			],
			outline: [
				[
					372.26,
					234.29999
				],
				[
					373.6795,
					234.29999
				],
				[
					373.6795,
					232.49646
				],
				[
					372.26,
					232.49646
				]
			],
			area: 2.5546875,
			tags: [
				"hs"
			]
		},
		EC2: {
			vertices: [
				"REC2:0"
			],
			names: [
				"EC-2",
				"Electrical Closet 2"
			],
			center: [
				462.7875,
				167.77545
			],
			outline: [
				[
					457.32,
					176.12
				],
				[
					468.24802,
					176.12
				],
				[
					468.24802,
					159.42798
				],
				[
					457.32,
					159.42798
				]
			],
			area: 182.40625,
			tags: [
				"ec"
			]
		},
		"128A.5": {
			vertices: [
				"R128A.5:0"
			],
			names: [
				"Percussion Storage"
			],
			center: [
				158.7877,
				190.19637
			],
			outline: [
				[
					153.65,
					194.70001
				],
				[
					153.65,
					185.69354
				],
				[
					163.926,
					185.69354
				],
				[
					163.926,
					194.70001
				]
			],
			area: 92.55078
		},
		"127A": {
			vertices: [
				"R127A:0"
			],
			center: [
				170.76666,
				42.89496
			],
			outline: [
				[
					165.92,
					40.23999
				],
				[
					169.275,
					46.051086
				],
				[
					174.0801,
					46.051086
				],
				[
					174.0801,
					40.23999
				]
			],
			area: 37.6709
		},
		AHU2: {
			vertices: [
				"RAHU102:0"
			],
			names: [
				"AHU-2",
				"Air Handling Unit 2",
				"HVAC"
			],
			center: [
				142.46086,
				39.132736
			],
			outline: [
				[
					153.34999,
					35.910034
				],
				[
					155.0774,
					42.356445
				],
				[
					131.58339,
					42.356445
				],
				[
					129.83359,
					35.910034
				]
			],
			area: 151.52417,
			tags: [
				"ahu"
			]
		},
		CY3: {
			vertices: [
				"RCY3:0"
			],
			names: [
				"Courtyard 3"
			],
			center: [
				493.50095,
				246.46384
			],
			outline: [
				[
					465.7,
					271.55002
				],
				[
					465.7,
					226.219
				],
				[
					523.293,
					226.219
				],
				[
					523.293,
					264.55298
				],
				[
					481.46002,
					264.55298
				],
				[
					481.46002,
					271.54977
				]
			],
			area: 2318.0508
		},
		"156A": {
			vertices: [
				"R156A:0"
			],
			center: [
				501.76456,
				362.31436
			],
			outline: [
				[
					490.04,
					391.94
				],
				[
					503.65802,
					383.414
				],
				[
					515.276,
					373.5927
				],
				[
					515.276,
					340.5257
				],
				[
					490.04,
					340.5257
				]
			],
			area: 1083.3281
		},
		BSC14: {
			vertices: [
				"RBSC14:0"
			],
			names: [
				"BSC-14",
				"Bathroom Supply Closet 14"
			],
			center: [
				218.70184,
				158.66266
			],
			outline: [
				[
					216.06999,
					160.14001
				],
				[
					216.06999,
					157.18573
				],
				[
					221.33379,
					157.18573
				],
				[
					221.33379,
					160.14001
				]
			],
			area: 15.550781,
			tags: [
				"bsc"
			]
		},
		"138A": {
			vertices: [
				"R138A:0",
				"R138A:1"
			],
			center: [
				385.76755,
				97.57423
			],
			outline: [
				[
					375.73,
					103.29999
				],
				[
					375.73,
					91.84796
				],
				[
					395.803,
					91.84796
				],
				[
					395.803,
					103.29999
				]
			],
			area: 229.875
		},
		"130E": {
			vertices: [
				"R130E:0"
			],
			center: [
				230.05392,
				186.33727
			],
			outline: [
				[
					222.09,
					194.70001
				],
				[
					222.09,
					177.97302
				],
				[
					238.01599,
					177.97302
				],
				[
					238.01599,
					194.70001
				]
			],
			area: 266.39062
		},
		"128A.4": {
			vertices: [
				"R128A.4:0"
			],
			names: [
				"Band Office",
				"Instrumental Music Office"
			],
			center: [
				170.87778,
				186.33615
			],
			outline: [
				[
					163.93,
					194.70001
				],
				[
					163.93,
					177.97302
				],
				[
					177.82599,
					177.97302
				],
				[
					177.82599,
					194.70001
				]
			],
			area: 232.43945
		},
		BSC10: {
			vertices: [
				"RBSC10:0"
			],
			names: [
				"BSC-10",
				"Bathroom Supply Closet 10"
			],
			center: [
				338.4081,
				318.9969
			],
			outline: [
				[
					333.76,
					322.21
				],
				[
					333.76,
					315.7909
				],
				[
					343.0618,
					315.7909
				],
				[
					343.0618,
					322.21
				]
			],
			area: 59.710938,
			tags: [
				"bsc"
			]
		},
		POI200: {
			vertices: [
				"H14:0",
				"H14:2"
			],
			names: [
				"Art Gallery"
			],
			center: [
				232.02121,
				249.89714
			],
			outline: [
				[
					231.19,
					274.45
				],
				[
					231.19,
					225.344
				],
				[
					232.85071,
					225.344
				],
				[
					232.85071,
					274.45
				]
			],
			area: 81.55078
		},
		EC1: {
			vertices: [
				"REC1:0"
			],
			names: [
				"EC-1",
				"Electrical Closet 1"
			],
			center: [
				464.67178,
				67.72372
			],
			outline: [
				[
					462.58002,
					75.380005
				],
				[
					462.58002,
					60.067993
				],
				[
					466.76532,
					60.067993
				],
				[
					466.76532,
					75.380005
				]
			],
			area: 64.08594,
			tags: [
				"ec"
			]
		},
		BSC3: {
			vertices: [
				"RBSC3:0"
			],
			names: [
				"BSC-3",
				"Bathroom Supply Closet 3"
			],
			center: [
				429.02203,
				211.94742
			],
			outline: [
				[
					420.46002,
					214.29004
				],
				[
					420.46002,
					209.60236
				],
				[
					437.57803,
					209.60236
				],
				[
					437.57803,
					214.29004
				]
			],
			area: 80.24219,
			tags: [
				"bsc"
			]
		},
		BC201: {
			vertices: [
				"RBC201:0"
			],
			names: [
				"Bleeding Control (Bulldog Lobby Upstairs)",
				"Bleeding Control Kit (Bulldog Lobby Upstairs)"
			],
			center: [
				368.46808,
				44.90713
			],
			outline: [
				[
					367.59003,
					44.200012
				],
				[
					367.59003,
					45.619507
				],
				[
					369.39352,
					45.619507
				],
				[
					369.39352,
					44.200012
				]
			],
			area: 2.5605469,
			tags: [
				"bleed-control"
			]
		},
		SBW200: {
			vertices: [
				"RSBW200:0"
			],
			names: [
				"Staff Women's Restroom (Upstairs Bulldog Lobby)",
				"Staff Women's Bathroom (Upstairs Bulldog Lobby)"
			],
			center: [
				387.9154,
				63.33299
			],
			outline: [
				[
					383.63,
					66.42999
				],
				[
					383.63,
					60.236572
				],
				[
					392.20282,
					60.236572
				],
				[
					392.20282,
					66.42999
				]
			],
			area: 53.095703,
			tags: [
				"staff-women-bathroom"
			]
		},
		"144D": {
			vertices: [
				"R144D:0"
			],
			center: [
				525.3819,
				92.37161
			],
			outline: [
				[
					516.47003,
					97.72003
				],
				[
					516.47003,
					87.02301
				],
				[
					534.293,
					87.02301
				],
				[
					534.293,
					97.72003
				]
			],
			area: 190.65234
		},
		HS201: {
			vertices: [
				"RHS201:0"
			],
			names: [
				"Hand Sanitization (26X)",
				"Hand Sanitization Station (26X)"
			],
			center: [
				383.28455,
				320.3577
			],
			outline: [
				[
					382.7,
					321.36
				],
				[
					384.1195,
					321.36
				],
				[
					384.1195,
					319.5565
				],
				[
					382.7,
					319.5565
				]
			],
			area: 2.5625,
			tags: [
				"hs"
			]
		},
		"262D": {
			vertices: [
				"R262D:0"
			],
			center: [
				356.60754,
				325.14243
			],
			outline: [
				[
					347.78,
					342.8
				],
				[
					362.346,
					342.8
				],
				[
					362.346,
					324.896
				],
				[
					368.13,
					324.896
				],
				[
					368.13,
					310.204
				],
				[
					347.78,
					310.204
				]
			],
			area: 559.77344
		},
		"156Z": {
			vertices: [
				"R156Z:0"
			],
			center: [
				418.10892,
				346.12216
			],
			outline: [
				[
					412.94,
					393.24002
				],
				[
					412.94,
					301.359
				],
				[
					427.583,
					301.359
				],
				[
					427.583,
					306.7992
				],
				[
					422.8793,
					306.7992
				],
				[
					422.8793,
					393.2402
				]
			],
			area: 938.8203
		},
		"144H": {
			vertices: [
				"R144H:0"
			],
			center: [
				506.52148,
				99.61495
			],
			outline: [
				[
					500.6,
					102.07001
				],
				[
					500.6,
					97.15692
				],
				[
					512.428,
					97.15692
				],
				[
					512.428,
					102.07001
				]
			],
			area: 58.109375
		},
		"144E": {
			vertices: [
				"R144E:0"
			],
			center: [
				525.3793,
				81.36812
			],
			outline: [
				[
					516.47003,
					87.03003
				],
				[
					516.47003,
					75.70703
				],
				[
					534.293,
					75.70703
				],
				[
					534.293,
					87.03003
				]
			],
			area: 201.8125
		},
		"107D": {
			vertices: [
				"R107D:0"
			],
			center: [
				452.33127,
				25.903028
			],
			outline: [
				[
					447.57,
					33.859985
				],
				[
					447.57,
					17.945984
				],
				[
					457.0916,
					17.945984
				],
				[
					457.0916,
					33.859985
				]
			],
			area: 151.52637
		},
		BM105: {
			vertices: [
				"RBM105:0"
			],
			names: [
				"Men's Restroom (Auditorium)",
				"Men's Bathroom (Auditorium)",
				"Men's Restroom (Theater)",
				"Men's Bathroom (Theater)"
			],
			center: [
				206.00676,
				72.34352
			],
			outline: [
				[
					197.29,
					79.23999
				],
				[
					197.29,
					72.66919
				],
				[
					188.54489,
					72.66919
				],
				[
					188.54489,
					66.49249
				],
				[
					219.67789,
					66.49249
				],
				[
					219.67789,
					79.24048
				]
			],
			area: 339.41064,
			tags: [
				"closed",
				"men-bathroom"
			]
		},
		"144B": {
			vertices: [
				"R144B:0"
			],
			center: [
				525.3831,
				123.29073
			],
			outline: [
				[
					516.47003,
					132.32
				],
				[
					516.47003,
					114.26099
				],
				[
					534.293,
					114.26099
				],
				[
					534.293,
					132.32
				]
			],
			area: 321.86328
		},
		AHU9: {
			vertices: [
				"RAHU9:0"
			],
			names: [
				"AHU-9",
				"Air Handling Unit 9",
				"HVAC"
			],
			center: [
				472.857,
				211.76807
			],
			outline: [
				[
					465.7,
					226.39001
				],
				[
					465.7,
					197.146
				],
				[
					480.01202,
					197.146
				],
				[
					480.01202,
					226.39001
				]
			],
			area: 418.53906,
			tags: [
				"ahu"
			]
		},
		"164B": {
			vertices: [
				"R164B:0"
			],
			center: [
				278.6299,
				336.5756
			],
			outline: [
				[
					271.2,
					342.62003
				],
				[
					271.2,
					330.52203
				],
				[
					286.052,
					330.52203
				],
				[
					286.052,
					342.62003
				]
			],
			area: 179.67188
		},
		"115A": {
			vertices: [
				"R115A:0"
			],
			center: [
				409.351,
				25.902977
			],
			outline: [
				[
					404.59003,
					33.859985
				],
				[
					404.59003,
					17.945984
				],
				[
					414.11163,
					17.945984
				],
				[
					414.11163,
					33.859985
				]
			],
			area: 151.52686
		},
		BSC5: {
			vertices: [
				"RBSC5:0"
			],
			names: [
				"BSC-5",
				"Bathroom Supply Closet 5"
			],
			center: [
				192.9219,
				78.90473
			],
			outline: [
				[
					188.55,
					85.150024
				],
				[
					188.55,
					72.660034
				],
				[
					197.2952,
					72.660034
				],
				[
					197.2952,
					85.150024
				]
			],
			area: 109.228516,
			tags: [
				"bsc"
			]
		},
		"128A.2": {
			vertices: [
				"R128A.2:0"
			],
			names: [
				"Practice Room 4"
			],
			center: [
				180.76738,
				168.08963
			],
			outline: [
				[
					177.37999,
					171.79999
				],
				[
					177.37999,
					164.3775
				],
				[
					184.15219,
					164.3775
				],
				[
					184.15219,
					171.79999
				]
			],
			area: 50.265625
		},
		ERU15: {
			vertices: [
				"RERU15:0"
			],
			names: [
				"ERU-15"
			],
			center: [
				387.91135,
				69.70686
			],
			outline: [
				[
					383.63,
					72.97998
				],
				[
					383.63,
					66.43567
				],
				[
					392.20282,
					66.43567
				],
				[
					392.20282,
					72.97998
				]
			],
			area: 56.10547,
			tags: [
				"eru"
			]
		},
		x101: {
			vertices: [
				"Rx101:0"
			],
			names: [
				"Air Filter Storage Room"
			],
			center: [
				234.58464,
				216.19893
			],
			outline: [
				[
					231.15,
					219.73999
				],
				[
					231.15,
					212.65277
				],
				[
					238.0139,
					212.65277
				],
				[
					238.0139,
					219.73999
				]
			],
			area: 48.64453
		},
		BW202: {
			vertices: [
				"RBW202:0"
			],
			names: [
				"Women's Restroom (25X)",
				"Women's Bathroom (25X)"
			],
			center: [
				546.43353,
				273.47687
			],
			outline: [
				[
					541.45,
					282.21002
				],
				[
					541.45,
					264.729
				],
				[
					551.3892,
					264.729
				],
				[
					551.3892,
					282.21002
				]
			],
			area: 173.73438,
			tags: [
				"women-bathroom"
			]
		},
		"144I": {
			vertices: [
				"R144I:0"
			],
			center: [
				506.51147,
				104.8891
			],
			outline: [
				[
					500.6,
					107.71002
				],
				[
					500.6,
					102.06903
				],
				[
					512.428,
					102.06903
				],
				[
					512.428,
					107.71002
				]
			],
			area: 66.72266
		},
		"261Z": {
			vertices: [
				"R261Z:0",
				"R261Z:1"
			],
			names: [
				"MDF",
				"Main Distribution Frame"
			],
			center: [
				408.08978,
				294.22916
			],
			outline: [
				[
					395.96002,
					298.40002
				],
				[
					395.96002,
					290.05774
				],
				[
					420.21902,
					290.05774
				],
				[
					420.21902,
					298.40002
				]
			],
			area: 202.375
		},
		CP2: {
			vertices: [
				"RCP2:0"
			],
			names: [
				"CP-2",
				"Control Panel 2"
			],
			center: [
				441.2537,
				281.0683
			],
			outline: [
				[
					436.12003,
					284.33002
				],
				[
					436.12003,
					277.80402
				],
				[
					446.38202,
					277.80402
				],
				[
					446.38202,
					284.33002
				]
			],
			area: 66.96875,
			tags: [
				"cp"
			]
		},
		"107A": {
			vertices: [
				"R107A:0"
			],
			center: [
				479.77185,
				25.902954
			],
			outline: [
				[
					475.36002,
					33.859985
				],
				[
					475.36002,
					17.945984
				],
				[
					484.18472,
					17.945984
				],
				[
					484.18472,
					33.859985
				]
			],
			area: 140.43652
		},
		"127F": {
			vertices: [
				"R127F:0"
			],
			center: [
				156.00934,
				107.24871
			],
			outline: [
				[
					157.83,
					120.79999
				],
				[
					164.0104,
					97.734985
				],
				[
					153.14441,
					94.823364
				],
				[
					148.38171,
					109.790344
				],
				[
					152.86731,
					110.99225
				],
				[
					150.2393,
					120.800354
				]
			],
			area: 249.44385
		},
		HS105: {
			vertices: [
				"RHS105:0"
			],
			names: [
				"Hand Sanitization (Bulldog Lobby)",
				"Hand Sanitization Station (Bulldog Lobby)"
			],
			center: [
				380.52783,
				57.875793
			],
			outline: [
				[
					379.65002,
					57.169983
				],
				[
					379.65002,
					58.589478
				],
				[
					381.45352,
					58.589478
				],
				[
					381.45352,
					57.169983
				]
			],
			area: 2.5605469,
			tags: [
				"hs"
			]
		},
		AHU10: {
			vertices: [
				"RAHU10:0"
			],
			names: [
				"AHU-10",
				"Air Handling Unit 10",
				"HVAC"
			],
			center: [
				259.11908,
				207.6812
			],
			outline: [
				[
					251.68001,
					214.15997
				],
				[
					251.68001,
					201.19897
				],
				[
					266.55402,
					201.19897
				],
				[
					266.55402,
					214.15997
				]
			],
			area: 192.77734,
			tags: [
				"ahu"
			]
		},
		POI201: {
			vertices: [
				"I12:15:1"
			],
			names: [
				"Winston"
			],
			center: [
				367.535,
				190.66
			],
			outline: [
				[
					366.56,
					192.18
				],
				[
					366.56,
					189.23242
				],
				[
					368.6789,
					189.23242
				],
				[
					368.6789,
					192.18
				]
			],
			area: 6.25
		},
		"100Z": {
			vertices: [
				"R100Z:0"
			],
			center: [
				479.0085,
				118.51108
			],
			outline: [
				[
					475.29,
					121.53003
				],
				[
					475.29,
					115.4978
				],
				[
					482.7507,
					115.4978
				],
				[
					482.7507,
					121.53003
				]
			],
			area: 45.007812
		},
		"154C": {
			vertices: [
				"R154C:0"
			],
			center: [
				504.11633,
				320.41754
			],
			outline: [
				[
					490.04,
					340.53
				],
				[
					490.04,
					299.663
				],
				[
					515.276,
					299.663
				],
				[
					515.276,
					321.042
				],
				[
					528.313,
					321.042
				],
				[
					528.313,
					327.56238
				],
				[
					515.27496,
					327.56177
				],
				[
					515.2753,
					340.52975
				]
			],
			area: 1116.2969
		},
		WF100: {
			vertices: [
				"RWF100:0"
			],
			names: [
				"Bottle Fill Station (Cafeteria)",
				"Water Bottle Filling Station (Cafeteria)",
				"Water Fountain (Cafeteria)",
				"Drinking Fountain (Cafeteria)"
			],
			center: [
				434.6748,
				275.72476
			],
			outline: [
				[
					433.66,
					276.43002
				],
				[
					435.0795,
					276.43002
				],
				[
					435.0795,
					274.62653
				],
				[
					433.66,
					274.62653
				]
			],
			area: 2.5546875,
			tags: [
				"wf"
			]
		},
		HS104: {
			vertices: [
				"RHS104:0"
			],
			names: [
				"Hand Sanitization (Main Entrance)",
				"Hand Sanitization Station (Main Entrance)"
			],
			center: [
				561.126,
				163.68393
			],
			outline: [
				[
					561.15,
					162.59003
				],
				[
					560.14624,
					163.59381
				],
				[
					561.4216,
					164.86914
				],
				[
					562.42535,
					163.86536
				]
			],
			area: 2.5625,
			tags: [
				"hs"
			]
		},
		"155Z": {
			vertices: [
				"R155Z:0"
			],
			center: [
				438.12576,
				275.6757
			],
			outline: [
				[
					435.08002,
					277.80002
				],
				[
					435.08002,
					273.5999
				],
				[
					441.25012,
					273.5999
				],
				[
					441.25012,
					277.80002
				]
			],
			area: 25.921875
		},
		"274S": {
			vertices: [
				"R274S:0"
			],
			center: [
				214.5211,
				285.00378
			],
			outline: [
				[
					207.81999,
					291.74
				],
				[
					207.81999,
					278.263
				],
				[
					221.219,
					278.263
				],
				[
					221.219,
					291.74
				]
			],
			area: 180.57422
		},
		BM102: {
			vertices: [
				"RBM102:0"
			],
			names: [
				"Men's Restroom (Cafeteria)",
				"Men's Bathroom (Cafeteria)"
			],
			center: [
				536.6259,
				273.28806
			],
			outline: [
				[
					531.81,
					282.03
				],
				[
					531.81,
					264.549
				],
				[
					541.448,
					264.549
				],
				[
					541.448,
					282.03
				]
			],
			area: 168.48438,
			tags: [
				"men-bathroom"
			]
		},
		SBW201: {
			vertices: [
				"RSBW201:0"
			],
			names: [
				"Staff Women's Restroom (Upstairs Central Intersection)",
				"Staff Women's Bathroom (Upstairs Central Intersection)"
			],
			center: [
				413.63452,
				172.39133
			],
			outline: [
				[
					408.38,
					176.29999
				],
				[
					408.38,
					168.4831
				],
				[
					418.892,
					168.4831
				],
				[
					418.892,
					176.29999
				]
			],
			area: 82.171875,
			tags: [
				"staff-women-bathroom"
			]
		},
		BW210: {
			vertices: [
				"RBW210:0"
			],
			names: [
				"Women's Restroom (Language Hall)",
				"Women's Bathroom (Language Hall)",
				"Women's Restroom (World Language Hallway)",
				"Women's Bathroom (World Language Hallway)"
			],
			center: [
				343.51675,
				328.87744
			],
			outline: [
				[
					338.17,
					342.8
				],
				[
					347.7731,
					342.8
				],
				[
					347.7731,
					310.203
				],
				[
					343.056,
					310.203
				],
				[
					343.056,
					322.214
				],
				[
					338.17,
					322.214
				]
			],
			area: 254.34375,
			tags: [
				"women-bathroom",
				"closed"
			]
		},
		"115B": {
			vertices: [
				"R115B:0"
			],
			center: [
				397.90088,
				25.90295
			],
			outline: [
				[
					391.21002,
					33.859985
				],
				[
					391.21002,
					17.945984
				],
				[
					404.592,
					17.945984
				],
				[
					404.592,
					33.859985
				]
			],
			area: 212.96143
		},
		"163B": {
			vertices: [
				"R163B:0"
			],
			names: [
				"Concessions"
			],
			center: [
				363.8572,
				283.3808
			],
			outline: [
				[
					358.04,
					293.78
				],
				[
					358.04,
					272.989
				],
				[
					369.683,
					272.989
				],
				[
					369.683,
					293.78
				]
			],
			area: 242.07812
		},
		HS100: {
			vertices: [
				"RHS100:0"
			],
			names: [
				"Hand Sanitization (Cafeteria)",
				"Hand Sanitization Station (Cafeteria)"
			],
			center: [
				430.11008,
				306.3058
			],
			outline: [
				[
					430.71002,
					306.80002
				],
				[
					430.71002,
					305.38052
				],
				[
					428.90652,
					305.38052
				],
				[
					428.90652,
					306.80002
				]
			],
			area: 2.5546875,
			tags: [
				"hs"
			]
		},
		BW200: {
			vertices: [
				"RBW200:0"
			],
			names: [
				"Women's Restroom (Bulldog Lobby Upstairs)",
				"Women's Bathroom (Bulldog Lobby Upstairs)"
			],
			center: [
				383.96545,
				82.49807
			],
			outline: [
				[
					375.73,
					92.02002
				],
				[
					375.73,
					72.97601
				],
				[
					392.2,
					72.97601
				],
				[
					392.2,
					92.02002
				]
			],
			area: 313.6543,
			tags: [
				"women-bathroom"
			]
		},
		"166A": {
			vertices: [
				"R166A:0"
			],
			center: [
				233.89154,
				323.4367
			],
			outline: [
				[
					225.81,
					328.13
				],
				[
					225.81,
					318.7459
				],
				[
					241.97499,
					318.7459
				],
				[
					241.97499,
					328.13
				]
			],
			area: 151.69531
		},
		x203: {
			vertices: [
				"Rx203:0"
			],
			names: [
				"Laundry"
			],
			center: [
				217.45845,
				155.60902
			],
			outline: [
				[
					213.59999,
					157.19
				],
				[
					213.59999,
					154.04498
				],
				[
					221.3416,
					154.04498
				],
				[
					221.3416,
					157.19
				]
			],
			area: 24.351562
		},
		"138S": {
			vertices: [
				"R138S:0"
			],
			center: [
				383.22836,
				126.90419
			],
			outline: [
				[
					375.73,
					133.91003
				],
				[
					375.73,
					119.89801
				],
				[
					390.725,
					119.89801
				],
				[
					390.725,
					133.91003
				]
			],
			area: 210.10938
		},
		EC15: {
			vertices: [
				"REC15:0"
			],
			names: [
				"EC-15",
				"Electrical Closet 15"
			],
			center: [
				349.45203,
				139.74281
			],
			outline: [
				[
					342.74002,
					141.77002
				],
				[
					342.74002,
					137.71973
				],
				[
					356.174,
					137.71973
				],
				[
					356.174,
					141.77002
				]
			],
			area: 54.414062,
			tags: [
				"ec"
			]
		},
		"107G": {
			vertices: [
				"R107G:0"
			],
			center: [
				424.91962,
				25.90301
			],
			outline: [
				[
					420.03,
					33.859985
				],
				[
					420.03,
					17.945984
				],
				[
					429.809,
					17.945984
				],
				[
					429.809,
					33.859985
				]
			],
			area: 155.62256
		},
		"139Z": {
			vertices: [
				"R139Z:0"
			],
			center: [
				168.14487,
				236.1067
			],
			outline: [
				[
					160.11,
					245.81
				],
				[
					160.11,
					226.40399
				],
				[
					176.18001,
					226.40399
				],
				[
					176.18001,
					245.81
				]
			],
			area: 311.85547
		},
		"154Y": {
			vertices: [
				"R154Y:0"
			],
			center: [
				521.8113,
				324.30786
			],
			outline: [
				[
					515.28,
					327.56
				],
				[
					515.28,
					321.0396
				],
				[
					528.317,
					321.0396
				],
				[
					528.317,
					327.56
				]
			],
			area: 85
		},
		WF103: {
			vertices: [
				"RWF103:0"
			],
			names: [
				"Bottle Fill Station (Aux Gyms)",
				"Water Bottle Filling Station (Aux Gyms)",
				"Water Fountain (Aux Gyms)",
				"Drinking Fountain (Aux Gyms)"
			],
			center: [
				144.51604,
				296.39694
			],
			outline: [
				[
					145.39,
					297.05002
				],
				[
					145.39,
					295.63052
				],
				[
					143.5865,
					295.63052
				],
				[
					143.5865,
					297.05002
				]
			],
			area: 2.5585938,
			tags: [
				"wf"
			]
		},
		"162Z": {
			vertices: [
				"R162Z:0"
			],
			names: [
				"Boiler Room"
			],
			center: [
				340.61734,
				322.1667
			],
			outline: [
				[
					319.57,
					339.78
				],
				[
					319.57,
					311.148
				],
				[
					315.98282,
					311.148
				],
				[
					315.98282,
					304.9724
				],
				[
					362.3438,
					304.9724
				],
				[
					362.3438,
					339.77942
				]
			],
			area: 1510.9883
		},
		HS108: {
			vertices: [
				"RHS108:0"
			],
			names: [
				"Hand Sanitization (Music)",
				"Hand Sanitization Station (Music)"
			],
			center: [
				155.1313,
				144.86769
			],
			outline: [
				[
					154.2,
					144.13
				],
				[
					154.2,
					145.5495
				],
				[
					156.0035,
					145.5495
				],
				[
					156.0035,
					144.13
				]
			],
			area: 2.5585938,
			tags: [
				"hs"
			]
		},
		"251S": {
			vertices: [
				"R251S:0"
			],
			center: [
				543.99365,
				246.13179
			],
			outline: [
				[
					536.63,
					251.03998
				],
				[
					536.63,
					241.23737
				],
				[
					551.388,
					241.23737
				],
				[
					551.388,
					251.03998
				]
			],
			area: 144.67969
		},
		"169A": {
			vertices: [
				"R169A:0"
			],
			center: [
				167.08403,
				287.75082
			],
			outline: [
				[
					157.98999,
					295.63
				],
				[
					157.98999,
					279.87
				],
				[
					176.17699,
					279.87
				],
				[
					176.17699,
					295.63
				]
			],
			area: 286.625
		},
		CY2: {
			vertices: [
				"RCY2:0"
			],
			names: [
				"Courtyard 2"
			],
			center: [
				270.33005,
				114.707535
			],
			outline: [
				[
					213.59999,
					137.57
				],
				[
					213.59999,
					91.84503
				],
				[
					327.06,
					91.84503
				],
				[
					327.06,
					137.57
				]
			],
			area: 5187.953
		},
		"201A": {
			vertices: [
				"R201A:0",
				"R201:2"
			],
			center: [
				527.853,
				154.30951
			],
			outline: [
				[
					521.4,
					162.53003
				],
				[
					521.4,
					146.08704
				],
				[
					534.299,
					146.08704
				],
				[
					534.299,
					162.53003
				]
			],
			area: 212.09375
		},
		"242A": {
			vertices: [
				"R242A:0"
			],
			center: [
				485.41745,
				166.04863
			],
			outline: [
				[
					480.08002,
					176.29999
				],
				[
					480.08002,
					155.79901
				],
				[
					490.76,
					155.79901
				],
				[
					490.76,
					176.29999
				]
			],
			area: 218.95312
		},
		"166E": {
			vertices: [
				"R166E:0"
			],
			center: [
				263.3358,
				310.8207
			],
			outline: [
				[
					255.48,
					316.67
				],
				[
					255.48,
					304.97302
				],
				[
					271.19302,
					304.97302
				],
				[
					271.19302,
					316.67
				]
			],
			area: 183.79688
		},
		"137C": {
			vertices: [
				"R137C:0"
			],
			center: [
				132.35762,
				238.75735
			],
			outline: [
				[
					128.83,
					251.11002
				],
				[
					128.83,
					226.40704
				],
				[
					135.8864,
					226.40704
				],
				[
					135.8864,
					251.11002
				]
			],
			area: 174.3164
		},
		"142B": {
			vertices: [
				"R142B:0"
			],
			center: [
				422.356,
				150.65118
			],
			outline: [
				[
					416.02002,
					155.38
				],
				[
					416.02002,
					145.9195
				],
				[
					428.68402,
					145.9195
				],
				[
					428.68402,
					155.38
				]
			],
			area: 119.80469
		},
		"154Z": {
			vertices: [
				"R154Z:0"
			],
			center: [
				507.51025,
				307.74884
			],
			outline: [
				[
					502.99002,
					315.83002
				],
				[
					502.99002,
					299.66
				],
				[
					512.0194,
					299.66
				],
				[
					512.0194,
					315.83002
				]
			],
			area: 146
		},
		"128A.3": {
			vertices: [
				"R128A.3:0"
			],
			center: [
				181.65573,
				174.8821
			],
			outline: [
				[
					173.9,
					177.97003
				],
				[
					173.9,
					171.79382
				],
				[
					189.411,
					171.79382
				],
				[
					189.411,
					177.97003
				]
			],
			area: 95.79883
		},
		"130A": {
			vertices: [
				"R130A:1",
				"R130A:0"
			],
			center: [
				253.96516,
				180.67516
			],
			outline: [
				[
					238.01,
					194.70001
				],
				[
					238.01,
					166.65002
				],
				[
					269.92,
					166.65002
				],
				[
					269.92,
					194.70001
				]
			],
			area: 895.0742
		},
		"238S": {
			vertices: [
				"R238S:0"
			],
			center: [
				381.13345,
				136.44746
			],
			outline: [
				[
					375.73,
					146.09003
				],
				[
					375.73,
					126.80701
				],
				[
					386.543,
					126.80701
				],
				[
					386.543,
					146.09003
				]
			],
			area: 208.51172
		},
		"244Z": {
			vertices: [
				"R244Z:0"
			],
			center: [
				527.84186,
				166.70967
			],
			outline: [
				[
					521.4,
					170.89001
				],
				[
					521.4,
					162.534
				],
				[
					534.299,
					162.534
				],
				[
					534.299,
					170.89001
				]
			],
			area: 107.78906
		},
		ERU4: {
			vertices: [
				"RERU4:0"
			],
			names: [
				"ERU-4"
			],
			center: [
				219.38997,
				76.12902
			],
			outline: [
				[
					213.59999,
					92.02002
				],
				[
					213.59999,
					60.238037
				],
				[
					225.18,
					60.238037
				],
				[
					225.18,
					92.02002
				]
			],
			area: 368.03516,
			tags: [
				"eru"
			]
		},
		EC13: {
			vertices: [
				"REC13:0"
			],
			names: [
				"EC-13",
				"Electrical Closet 13"
			],
			center: [
				204.59758,
				38.056957
			],
			outline: [
				[
					200.5,
					47.130005
				],
				[
					200.5,
					28.984009
				],
				[
					208.6956,
					28.984009
				],
				[
					208.6956,
					47.130005
				]
			],
			area: 148.71777,
			tags: [
				"ec"
			]
		},
		"203D": {
			vertices: [
				"R203D:0"
			],
			center: [
				503.74988,
				65.50538
			],
			outline: [
				[
					499.30002,
					67.70001
				],
				[
					499.30002,
					63.310486
				],
				[
					508.19513,
					63.310486
				],
				[
					508.19513,
					67.70001
				]
			],
			area: 39.04492
		},
		"138B": {
			vertices: [
				"R138B:0"
			],
			center: [
				402.08804,
				97.574425
			],
			outline: [
				[
					395.80002,
					103.29999
				],
				[
					395.80002,
					91.84796
				],
				[
					408.37302,
					91.84796
				],
				[
					408.37302,
					103.29999
				]
			],
			area: 143.98438
		},
		AHU4: {
			vertices: [
				"RAHU104:0"
			],
			names: [
				"AHU-4",
				"Air Handling Unit 4",
				"HVAC"
			],
			center: [
				477.3869,
				87.85082
			],
			outline: [
				[
					466.95,
					101.31
				],
				[
					466.95,
					91.84729
				],
				[
					462.58282,
					91.84729
				],
				[
					462.58282,
					75.378296
				],
				[
					490.76184,
					75.378296
				],
				[
					490.76184,
					101.3103
				]
			],
			area: 689.4043,
			tags: [
				"ahu"
			]
		},
		"137E": {
			vertices: [
				"R137E:0"
			],
			center: [
				143.40671,
				285.15665
			],
			outline: [
				[
					135.87999,
					290.45
				],
				[
					135.87999,
					279.86502
				],
				[
					150.93399,
					279.86502
				],
				[
					150.93399,
					290.45
				]
			],
			area: 159.34766
		},
		"169Z": {
			vertices: [
				"R169Z:0"
			],
			center: [
				168.14462,
				264.07434
			],
			outline: [
				[
					160.11,
					273.75
				],
				[
					160.11,
					254.4
				],
				[
					176.18001,
					254.4
				],
				[
					176.18001,
					273.75
				]
			],
			area: 310.95703
		},
		"144K": {
			vertices: [
				"R144K:0"
			],
			center: [
				505.21634,
				137.64064
			],
			outline: [
				[
					498.01,
					144.46002
				],
				[
					498.01,
					130.82104
				],
				[
					512.421,
					130.82104
				],
				[
					512.421,
					144.46002
				]
			],
			area: 196.55078
		},
		BM103: {
			vertices: [
				"RBM103:0"
			],
			names: [
				"Men's Restroom (Gym)",
				"Men's Bathroom (Gym)"
			],
			center: [
				410.70538,
				205.63132
			],
			outline: [
				[
					400.95,
					214.29004
				],
				[
					400.95,
					196.97302
				],
				[
					420.462,
					196.97302
				],
				[
					420.462,
					214.29004
				]
			],
			area: 337.89062,
			tags: [
				"men-bathroom",
				"closed"
			]
		},
		"130Y": {
			vertices: [
				"R130Y:0"
			],
			center: [
				230.05301,
				143.87505
			],
			outline: [
				[
					222.09,
					150.18
				],
				[
					222.09,
					137.57
				],
				[
					238.01599,
					137.57
				],
				[
					238.01599,
					150.18
				]
			],
			area: 200.82617
		},
		"130Z": {
			vertices: [
				"R130Z:0"
			],
			center: [
				230.05301,
				158.41495
			],
			outline: [
				[
					222.09,
					166.65002
				],
				[
					222.09,
					150.18005
				],
				[
					238.01599,
					150.18005
				],
				[
					238.01599,
					166.65002
				]
			],
			area: 262.30078
		},
		"130D": {
			vertices: [
				"R130D:0"
			],
			center: [
				230.05214,
				172.3079
			],
			outline: [
				[
					222.09,
					177.97003
				],
				[
					222.09,
					166.64703
				],
				[
					238.01599,
					166.64703
				],
				[
					238.01599,
					177.97003
				]
			],
			area: 180.33203
		},
		"127E": {
			vertices: [
				"R127E:0"
			],
			center: [
				156.0543,
				66.963104
			],
			outline: [
				[
					157.95,
					53.059998
				],
				[
					164.01689,
					75.70203
				],
				[
					152.2609,
					78.85205
				],
				[
					148.58069,
					65.216064
				],
				[
					152.9549,
					64.043945
				],
				[
					150.5436,
					55.04474
				]
			],
			area: 243.51709
		},
		BC100: {
			vertices: [
				"RBC100:0"
			],
			names: [
				"Bleeding Control (Cafeteria)",
				"Bleeding Control Kit (Cafeteria)"
			],
			center: [
				456.54062,
				305.9939
			],
			outline: [
				[
					455.78,
					305.38
				],
				[
					455.78,
					306.7995
				],
				[
					457.5835,
					306.7995
				],
				[
					457.5835,
					305.38
				]
			],
			area: 2.5625,
			tags: [
				"bleed-control"
			]
		},
		"124Z": {
			vertices: [
				"R124Z:0"
			],
			center: [
				230.8056,
				63.322433
			],
			outline: [
				[
					225.18,
					66.58002
				],
				[
					225.18,
					60.06543
				],
				[
					236.433,
					60.06543
				],
				[
					236.433,
					66.58002
				]
			],
			area: 73.30957
		},
		"163Y": {
			vertices: [
				"R163Y:0"
			],
			center: [
				363.8664,
				266.83923
			],
			outline: [
				[
					358.04,
					272.99002
				],
				[
					358.04,
					260.682
				],
				[
					369.683,
					260.682
				],
				[
					369.683,
					272.99002
				]
			],
			area: 143.29688
		},
		EC10: {
			vertices: [
				"REC10:0"
			],
			names: [
				"EC-10",
				"Electrical Closet 10"
			],
			center: [
				347.66245,
				155.71367
			],
			outline: [
				[
					344.55002,
					160.98999
				],
				[
					344.55002,
					150.43597
				],
				[
					350.77182,
					150.43597
				],
				[
					350.77182,
					160.98999
				]
			],
			area: 65.66406,
			tags: [
				"ec"
			]
		},
		"128B.1": {
			vertices: [
				"R128B.1:0"
			],
			names: [
				"Practice Room 3"
			],
			center: [
				186.7774,
				160.48973
			],
			outline: [
				[
					184.15,
					164.37
				],
				[
					184.15,
					156.60931
				],
				[
					189.4041,
					156.60931
				],
				[
					189.4041,
					164.37
				]
			],
			area: 40.77539
		},
		"144A": {
			vertices: [
				"R144A:0"
			],
			center: [
				525.3765,
				138.3875
			],
			outline: [
				[
					516.47003,
					144.46002
				],
				[
					516.47003,
					132.318
				],
				[
					534.293,
					132.318
				],
				[
					534.293,
					144.46002
				]
			],
			area: 216.41406
		},
		"115Z": {
			vertices: [
				"R115Z:0"
			],
			center: [
				396.22778,
				44.69345
			],
			outline: [
				[
					391.21002,
					49.820007
				],
				[
					391.21002,
					39.567017
				],
				[
					401.24603,
					39.567017
				],
				[
					401.24603,
					49.820007
				]
			],
			area: 102.899414
		},
		WF101: {
			vertices: [
				"RWF101:0"
			],
			names: [
				"Bottle Fill Station (Bulldog Lobby)",
				"Water Bottle Filling Station (Bulldog Lobby)",
				"Water Fountain (Bulldog Lobby)",
				"Drinking Fountain (Bulldog Lobby)"
			],
			center: [
				382.89346,
				66.68446
			],
			outline: [
				[
					382.21002,
					67.59003
				],
				[
					383.62952,
					67.59003
				],
				[
					383.62952,
					65.7865
				],
				[
					382.21002,
					65.7865
				]
			],
			area: 2.5605469,
			tags: [
				"wf"
			]
		},
		"256A": {
			vertices: [
				"R256A:0"
			],
			center: [
				452.7407,
				305.0116
			],
			outline: [
				[
					443.03,
					310.2
				],
				[
					443.03,
					299.836
				],
				[
					462.471,
					299.836
				],
				[
					462.471,
					310.2
				]
			],
			area: 201.5
		},
		"142A": {
			vertices: [
				"R142A:1",
				"R142A:0"
			],
			center: [
				422.3515,
				165.74777
			],
			outline: [
				[
					416.02002,
					176.12
				],
				[
					416.02002,
					155.37598
				],
				[
					428.68402,
					155.37598
				],
				[
					428.68402,
					176.12
				]
			],
			area: 262.70312
		},
		"261A": {
			vertices: [
				"R261A:0"
			],
			center: [
				382.58655,
				293.9566
			],
			outline: [
				[
					376.77002,
					298.40002
				],
				[
					376.77002,
					289.51862
				],
				[
					388.41003,
					289.51862
				],
				[
					388.41003,
					298.40002
				]
			],
			area: 103.38281
		},
		"144C": {
			vertices: [
				"R144C:0"
			],
			center: [
				525.3812,
				105.9916
			],
			outline: [
				[
					516.47003,
					114.26001
				],
				[
					516.47003,
					97.72302
				],
				[
					534.293,
					97.72302
				],
				[
					534.293,
					114.26001
				]
			],
			area: 294.73828
		},
		WF200: {
			vertices: [
				"RWF200:0"
			],
			names: [
				"Bottle Fill Station (Library)",
				"Water Bottle Filling Station (Library)",
				"Water Fountain (Library)",
				"Drinking Fountain (Library)",
				"Bottle Fill Station (Media Center)",
				"Water Bottle Filling Station (Media Center)",
				"Water Fountain (Media Center)",
				"Drinking Fountain (Media Center)"
			],
			center: [
				419.17023,
				177.13506
			],
			outline: [
				[
					419.78,
					177.71997
				],
				[
					419.78,
					176.30048
				],
				[
					417.9765,
					176.30048
				],
				[
					417.9765,
					177.71997
				]
			],
			area: 2.5546875,
			tags: [
				"wf"
			]
		},
		"143Z": {
			vertices: [
				"R143Z:0",
				"R143Z:1"
			],
			names: [
				"Fitness Center Upstairs",
				"Second Floor Fitness Center",
				"Second Story Fitness Center",
				"Weight Room Upstairs",
				"Second Floor Weight Room",
				"Second Story Weight Room",
				"Exercise Room Upstairs",
				"Second Floor Exercise Room",
				"Second Story Exercise Room"
			],
			center: [
				242.5,
				248.25
			],
			outline: [
				[
					232.84999,
					279.46997
				],
				[
					232.84999,
					220.97797
				],
				[
					242.97699,
					220.97797
				],
				[
					242.97699,
					207.14899
				],
				[
					248.6034,
					207.14899
				],
				[
					248.6034,
					214.15741
				],
				[
					266.56342,
					214.15741
				],
				[
					266.56342,
					222.5968
				],
				[
					251.17839,
					222.5968
				],
				[
					251.17839,
					268.0208
				],
				[
					266.56342,
					268.0208
				],
				[
					266.56342,
					279.4698
				]
			],
			area: 1473.4121
		},
		"126A": {
			vertices: [
				"R126A:0"
			],
			center: [
				200.08533,
				130.5676
			],
			outline: [
				[
					184,
					145.54999
				],
				[
					222.087,
					145.552
				],
				[
					222.08699,
					137.57422
				],
				[
					213.59439,
					137.57422
				],
				[
					213.59439,
					113.9892
				],
				[
					184.0004,
					113.9892
				]
			],
			area: 1001.78906
		},
		BC103: {
			vertices: [
				"RBC102:0"
			],
			names: [
				"Bleeding Control (Music)",
				"Bleeding Control Kit (Music)"
			],
			center: [
				142.68855,
				195.44733
			],
			outline: [
				[
					141.76,
					194.70001
				],
				[
					141.76,
					196.1195
				],
				[
					143.56349,
					196.1195
				],
				[
					143.56349,
					194.70001
				]
			],
			area: 2.5585938,
			tags: [
				"bleed-control"
			]
		},
		"144Y": {
			vertices: [
				"R144:15",
				"R144Y:0"
			],
			names: [
				"Mail Room"
			],
			center: [
				507.2437,
				68.137245
			],
			outline: [
				[
					498.01,
					73.140015
				],
				[
					498.01,
					63.134033
				],
				[
					516.473,
					63.134033
				],
				[
					516.473,
					73.140015
				]
			],
			area: 184.73828
		},
		x100: {
			vertices: [
				"Rx100:1",
				"Rx100:0"
			],
			names: [
				"Attendance Office"
			],
			center: [
				574.57263,
				186.8015
			],
			outline: [
				[
					567.08,
					194.73004
				],
				[
					567.08,
					178.87805
				],
				[
					582.08,
					178.87805
				],
				[
					582.08,
					194.73004
				]
			],
			area: 237.78906
		},
		HS109: {
			vertices: [
				"RHS109:0"
			],
			names: [
				"Hand Sanitization (Side Gym)",
				"Hand Sanitization Station (Side Gym)",
				"Hand Sanitization (Aux Gym)",
				"Hand Sanitization Station (Aux Gym)",
				"Hand Sanitization (Auxillary Gym)",
				"Hand Sanitization Station (Auxillary Gym)"
			],
			center: [
				114.91254,
				262.68192
			],
			outline: [
				[
					114.21,
					263.6
				],
				[
					115.6295,
					263.6
				],
				[
					115.6295,
					261.7965
				],
				[
					114.21,
					261.7965
				]
			],
			area: 2.5605469,
			tags: [
				"hs"
			]
		},
		"150A": {
			vertices: [
				"R150A:0"
			],
			center: [
				574.8818,
				313.60922
			],
			outline: [
				[
					565.96,
					327.56
				],
				[
					565.96,
					299.66
				],
				[
					583.806,
					299.66
				],
				[
					583.806,
					327.56
				]
			],
			area: 497.90625
		},
		"238B": {
			vertices: [
				"R238B:0"
			],
			center: [
				402.08527,
				99.36676
			],
			outline: [
				[
					395.80002,
					106.71002
				],
				[
					395.80002,
					92.02405
				],
				[
					408.37302,
					92.02405
				],
				[
					408.37302,
					106.71002
				]
			],
			area: 184.64844
		},
		"130B": {
			vertices: [
				"R130B:0"
			],
			center: [
				253.96503,
				152.11003
			],
			outline: [
				[
					238.01,
					166.65002
				],
				[
					238.01,
					137.57
				],
				[
					269.92,
					137.57
				],
				[
					269.92,
					166.65002
				]
			],
			area: 927.94336
		},
		SBW100: {
			vertices: [
				"RSBW100:0"
			],
			names: [
				"Staff Women's Restroom (Downstairs Bulldog Lobby)",
				"Staff Women's Bathroom (Downstairs Bulldog Lobby)"
			],
			center: [
				387.91492,
				63.163067
			],
			outline: [
				[
					383.63,
					66.26001
				],
				[
					383.63,
					60.06659
				],
				[
					392.20282,
					60.06659
				],
				[
					392.20282,
					66.26001
				]
			],
			area: 53.095703,
			tags: [
				"staff-women-bathroom"
			]
		},
		CY1: {
			vertices: [
				"RCY1:0"
			],
			names: [
				"Courtyard 1"
			],
			center: [
				437.66696,
				118.88397
			],
			outline: [
				[
					408.38,
					145.91998
				],
				[
					408.38,
					91.84796
				],
				[
					466.954,
					91.84796
				],
				[
					466.954,
					145.91998
				]
			],
			area: 3167.2148
		},
		x103: {
			vertices: [
				"Rx103:0"
			],
			names: [
				"Closet"
			],
			center: [
				574.57654,
				205.51317
			],
			outline: [
				[
					567.07,
					208.97003
				],
				[
					567.07,
					202.0567
				],
				[
					582.084,
					202.0567
				],
				[
					582.084,
					208.97003
				]
			],
			area: 103.796875
		},
		HS102: {
			vertices: [
				"RHS102:0"
			],
			names: [
				"Hand Sanitization (Kitchen)",
				"Hand Sanitization Station (Kitchen)"
			],
			center: [
				379.6758,
				306.08154
			],
			outline: [
				[
					378.7,
					306.77002
				],
				[
					380.1195,
					306.77002
				],
				[
					380.1195,
					304.96652
				],
				[
					378.7,
					304.96652
				]
			],
			area: 2.5546875,
			tags: [
				"hs"
			]
		},
		AHU3: {
			vertices: [
				"RAHU3:0"
			],
			names: [
				"AHU-3",
				"Air Handling Unit 3",
				"HVAC"
			],
			center: [
				208.03815,
				34.674038
			],
			outline: [
				[
					204.87999,
					40.53003
				],
				[
					204.87999,
					28.818054
				],
				[
					211.1968,
					28.818054
				],
				[
					211.1968,
					40.53003
				]
			],
			area: 73.98242,
			tags: [
				"ahu"
			]
		},
		"152Z": {
			vertices: [
				"R152Z:0"
			],
			center: [
				513.68726,
				307.7668
			],
			outline: [
				[
					512.02,
					315.83002
				],
				[
					512.02,
					299.66
				],
				[
					515.2752,
					299.66
				],
				[
					515.2752,
					315.83002
				]
			],
			area: 52.625
		},
		"142C": {
			vertices: [
				"R142C:0"
			],
			center: [
				452.41556,
				157.11075
			],
			outline: [
				[
					447.5,
					168.29999
				],
				[
					447.5,
					145.91998
				],
				[
					457.3263,
					145.91998
				],
				[
					457.3263,
					168.29999
				]
			],
			area: 219.91016
		},
		"240A": {
			vertices: [
				"R240A:1",
				"R240A:0"
			],
			center: [
				418.53763,
				153.51103
			],
			outline: [
				[
					408.38,
					160.93
				],
				[
					408.38,
					146.08899
				],
				[
					428.687,
					146.08899
				],
				[
					428.687,
					160.93
				]
			],
			area: 301.3672
		},
		SBM201: {
			vertices: [
				"RSBM201:0"
			],
			names: [
				"Staff Men's Restroom (Upstairs Central Intersection)",
				"Staff Men's Bathroom (Upstairs Central Intersection)"
			],
			center: [
				423.78342,
				172.38994
			],
			outline: [
				[
					418.89,
					176.29999
				],
				[
					418.89,
					168.4831
				],
				[
					428.6842,
					168.4831
				],
				[
					428.6842,
					176.29999
				]
			],
			area: 76.5625,
			tags: [
				"staff-men-bathroom"
			]
		},
		"245A": {
			vertices: [
				"R245A:0"
			],
			center: [
				407.74017,
				193.59491
			],
			outline: [
				[
					389.79,
					201.78998
				],
				[
					421.048,
					201.78912
				],
				[
					421.048,
					196.83405
				],
				[
					431.721,
					196.83405
				],
				[
					431.721,
					189.60315
				],
				[
					416.664,
					189.60315
				],
				[
					416.66312,
					185.02936
				],
				[
					389.78912,
					185.02942
				]
			],
			area: 581.0156
		},
		IDF2: {
			vertices: [
				"RIDF102:0"
			],
			names: [
				"IDF2",
				"Intermediate Distribution Frame 2"
			],
			center: [
				387.91183,
				69.52684
			],
			outline: [
				[
					383.63,
					72.79999
				],
				[
					383.63,
					66.25568
				],
				[
					392.20282,
					66.25568
				],
				[
					392.20282,
					72.79999
				]
			],
			area: 56.10547,
			tags: [
				"idf"
			]
		},
		"146S": {
			vertices: [
				"R146S:0"
			],
			center: [
				565.55194,
				210.64749
			],
			outline: [
				[
					564.09,
					212.35004
				],
				[
					564.09,
					208.96857
				],
				[
					567.06305,
					208.96857
				],
				[
					567.06305,
					212.35004
				]
			],
			area: 10.0546875
		},
		"238A": {
			vertices: [
				"R238A:0"
			],
			center: [
				385.76605,
				99.366875
			],
			outline: [
				[
					375.73,
					106.71002
				],
				[
					375.73,
					92.02405
				],
				[
					395.803,
					92.02405
				],
				[
					395.803,
					106.71002
				]
			],
			area: 294.79297
		},
		"262A": {
			vertices: [
				"R262A:0"
			],
			center: [
				404.0075,
				320.83948
			],
			outline: [
				[
					397.85,
					331.49
				],
				[
					397.85,
					310.19598
				],
				[
					410.173,
					310.19598
				],
				[
					410.173,
					331.49
				]
			],
			area: 262.41406
		},
		"251A": {
			vertices: [
				"R251A:0"
			],
			center: [
				529.9557,
				246.13702
			],
			outline: [
				[
					523.29004,
					251.03998
				],
				[
					523.29004,
					241.23737
				],
				[
					536.62805,
					241.23737
				],
				[
					536.62805,
					251.03998
				]
			],
			area: 130.75
		},
		BC204: {
			vertices: [
				"RBC204:0"
			],
			names: [
				"Bleeding Control (Art)",
				"Bleeding Control Kit (Art)"
			],
			center: [
				221.83409,
				202.81934
			],
			outline: [
				[
					221.08,
					203.68
				],
				[
					222.4995,
					203.68
				],
				[
					222.4995,
					201.87646
				],
				[
					221.08,
					201.87646
				]
			],
			area: 2.5585938,
			tags: [
				"bleed-control"
			]
		},
		"107I": {
			vertices: [
				"R107I:0"
			],
			center: [
				462.7505,
				44.69356
			],
			outline: [
				[
					457.86002,
					49.820007
				],
				[
					457.86002,
					39.567017
				],
				[
					467.639,
					39.567017
				],
				[
					467.639,
					49.820007
				]
			],
			area: 100.26367
		},
		ERU7: {
			vertices: [
				"RERU7:0"
			],
			names: [
				"ERU-7"
			],
			center: [
				510.35132,
				171.60193
			],
			outline: [
				[
					499.30002,
					186.25
				],
				[
					499.30002,
					156.95398
				],
				[
					521.403,
					156.95398
				],
				[
					521.403,
					186.25
				]
			],
			area: 647.53125,
			tags: [
				"eru"
			]
		},
		"169B": {
			vertices: [
				"R169B:0"
			],
			center: [
				146.1497,
				262.42905
			],
			outline: [
				[
					135.87999,
					273.75
				],
				[
					135.87999,
					251.107
				],
				[
					156.41899,
					251.107
				],
				[
					156.41899,
					273.75
				]
			],
			area: 465.0625
		},
		"229A": {
			vertices: [
				"R229A:0"
			],
			center: [
				187.28929,
				79.15151
			],
			outline: [
				[
					174.08,
					81.82001
				],
				[
					174.08,
					76.483215
				],
				[
					200.49901,
					76.483215
				],
				[
					200.49901,
					81.82001
				]
			],
			area: 140.99316
		},
		"144G": {
			vertices: [
				"R144G:1",
				"R144G:0"
			],
			names: [
				"Conference Room"
			],
			center: [
				505.21356,
				85.14971
			],
			outline: [
				[
					498.01,
					97.160034
				],
				[
					498.01,
					73.140015
				],
				[
					512.421,
					73.140015
				],
				[
					512.421,
					97.160034
				]
			],
			area: 346.15625
		},
		"142S": {
			vertices: [
				"R142S:0"
			],
			center: [
				452.4048,
				172.20497
			],
			outline: [
				[
					447.5,
					176.12
				],
				[
					447.5,
					168.29541
				],
				[
					457.3263,
					168.29541
				],
				[
					457.3263,
					176.12
				]
			],
			area: 76.890625
		},
		"166D": {
			vertices: [
				"R166D:0"
			],
			center: [
				263.33347,
				322.39352
			],
			outline: [
				[
					255.48,
					328.13
				],
				[
					255.48,
					316.665
				],
				[
					271.19302,
					316.665
				],
				[
					271.19302,
					328.13
				]
			],
			area: 180.15625
		},
		"262C": {
			vertices: [
				"R262C:0"
			],
			center: [
				404.03528,
				337.16904
			],
			outline: [
				[
					397.85,
					342.8
				],
				[
					397.85,
					331.498
				],
				[
					410.173,
					331.498
				],
				[
					410.173,
					342.8
				]
			],
			area: 139.25
		},
		"127G": {
			vertices: [
				"R127G:0"
			],
			center: [
				149.72752,
				123.62339
			],
			outline: [
				[
					154.8,
					132.10999
				],
				[
					157.8313,
					120.797
				],
				[
					150.2402,
					120.797
				],
				[
					152.86821,
					110.98901
				],
				[
					148.38261,
					109.78711
				],
				[
					141.95341,
					132.1101
				]
			],
			area: 195.30908
		},
		BC203: {
			vertices: [
				"RBC203:0"
			],
			names: [
				"Bleeding Control (Central Upstairs)",
				"Bleeding Control Kit (Central Upstairs)"
			],
			center: [
				356.95062,
				163.85954
			],
			outline: [
				[
					356.17,
					164.72998
				],
				[
					357.5895,
					164.72998
				],
				[
					357.5895,
					162.92645
				],
				[
					356.17,
					162.92645
				]
			],
			area: 2.5585938,
			tags: [
				"bleed-control"
			]
		},
		"127D": {
			vertices: [
				"R127D:0"
			],
			center: [
				150.01671,
				51.004143
			],
			outline: [
				[
					155.08,
					42.350037
				],
				[
					157.9482,
					53.054016
				],
				[
					150.5419,
					55.038513
				],
				[
					152.9532,
					64.03772
				],
				[
					148.579,
					65.20984
				],
				[
					142.429,
					42.349854
				]
			],
			area: 197.55469
		},
		POI202: {
			vertices: [
				"H15:12"
			],
			names: [
				"\"!\""
			],
			center: [
				375.58517,
				246.48756
			],
			outline: [
				[
					374.39,
					272.52002
				],
				[
					374.39,
					220.45105
				],
				[
					376.7748,
					220.45105
				],
				[
					376.7748,
					272.52002
				]
			],
			area: 124.171875
		},
		"245C": {
			vertices: [
				"R245C:0"
			],
			center: [
				448.7332,
				269.71524
			],
			outline: [
				[
					431.77002,
					277.65002
				],
				[
					431.77002,
					261.78003
				],
				[
					465.69702,
					261.78003
				],
				[
					465.69702,
					277.65002
				]
			],
			area: 538.4219,
			tags: [
				"cp"
			]
		},
		"107C": {
			vertices: [
				"R107C:0"
			],
			center: [
				461.59302,
				25.902973
			],
			outline: [
				[
					457.09003,
					33.859985
				],
				[
					457.09003,
					17.945984
				],
				[
					466.09692,
					17.945984
				],
				[
					466.09692,
					33.859985
				]
			],
			area: 143.33594
		},
		IDF4: {
			vertices: [
				"RIDF104:0"
			],
			names: [
				"IDF4",
				"Intermediate Distribution Frame 4"
			],
			center: [
				11.901005,
				62.595608
			],
			outline: [
				[
					5.6949997,
					65.78003
				],
				[
					5.6949997,
					59.411133
				],
				[
					18.106998,
					59.411133
				],
				[
					18.106998,
					65.78003
				]
			],
			area: 79.05066,
			tags: [
				"idf"
			]
		},
		"235S": {
			vertices: [
				"R235S:0"
			],
			center: [
				194.11569,
				128.99304
			],
			outline: [
				[
					187.73,
					136.14001
				],
				[
					187.73,
					121.84503
				],
				[
					200.5,
					121.84503
				],
				[
					200.5,
					136.14001
				]
			],
			area: 182.54492
		},
		EC12ERU6: {
			vertices: [
				"REC12ERU6:0"
			],
			names: [
				"EC-12 ERU-6",
				"Electrical Closet 10, ERU-6"
			],
			center: [
				468.44644,
				76.12877
			],
			outline: [
				[
					462.58002,
					92.02002
				],
				[
					462.58002,
					60.238037
				],
				[
					474.316,
					60.238037
				],
				[
					474.316,
					92.02002
				]
			],
			area: 372.9961,
			tags: [
				"eru",
				"ec"
			]
		},
		"161Z": {
			vertices: [
				"R161Z:0"
			],
			center: [
				421.09973,
				231.935
			],
			outline: [
				[
					415.92,
					239.23001
				],
				[
					415.92,
					224.646
				],
				[
					426.29,
					224.646
				],
				[
					426.29,
					239.23001
				]
			],
			area: 151.24219
		},
		BM200: {
			vertices: [
				"RBM200:0"
			],
			names: [
				"Men's Restroom (Bulldog Lobby Upstairs)",
				"Men's Bathroom (Bulldog Lobby Upstairs)"
			],
			center: [
				347.80078,
				82.498085
			],
			outline: [
				[
					339.43002,
					92.02002
				],
				[
					339.43002,
					72.97601
				],
				[
					356.17102,
					72.97601
				],
				[
					356.17102,
					92.02002
				]
			],
			area: 318.81445,
			tags: [
				"men-bathroom"
			]
		},
		"203A": {
			vertices: [
				"R203A:0"
			],
			center: [
				503.74933,
				89.51166
			],
			outline: [
				[
					499.30002,
					103.54999
				],
				[
					499.30002,
					75.47296
				],
				[
					508.19513,
					75.47296
				],
				[
					508.19513,
					103.54999
				]
			],
			area: 249.7461
		},
		"166C": {
			vertices: [
				"R166C:0"
			],
			center: [
				260.11798,
				335.37747
			],
			outline: [
				[
					249.03,
					342.62003
				],
				[
					249.03,
					328.13004
				],
				[
					271.20203,
					328.13004
				],
				[
					271.20203,
					342.62003
				]
			],
			area: 321.26562
		},
		x200: {
			vertices: [
				"Rx200:0"
			],
			names: [
				"Office"
			],
			center: [
				575.3105,
				294.52725
			],
			outline: [
				[
					566.8,
					299.84003
				],
				[
					566.8,
					289.208
				],
				[
					583.807,
					289.208
				],
				[
					583.807,
					299.84003
				]
			],
			area: 180.8125
		},
		HS106: {
			vertices: [
				"RHS106:0"
			],
			names: [
				"Hand Sanitization (Bulldog Lobby)",
				"Hand Sanitization Station (Bulldog Lobby)"
			],
			center: [
				360.8492,
				57.875793
			],
			outline: [
				[
					359.97,
					57.169983
				],
				[
					359.97,
					58.589478
				],
				[
					361.7735,
					58.589478
				],
				[
					361.7735,
					57.169983
				]
			],
			area: 2.5605469,
			tags: [
				"hs"
			]
		},
		HS101: {
			vertices: [
				"RHS101:0"
			],
			names: [
				"Hand Sanitization (Cafeteria)",
				"Hand Sanitization Station (Cafeteria)"
			],
			center: [
				438.04062,
				305.9939
			],
			outline: [
				[
					437.28,
					305.38
				],
				[
					437.28,
					306.7995
				],
				[
					439.0835,
					306.7995
				],
				[
					439.0835,
					305.38
				]
			],
			area: 2.5625,
			tags: [
				"hs"
			]
		},
		"132A": {
			vertices: [
				"R132A:0"
			],
			center: [
				330.25,
				141.75
			],
			outline: [
				[
					292.06,
					160.98999
				],
				[
					292.06,
					137.57098
				],
				[
					344.55798,
					137.57098
				],
				[
					344.55798,
					160.98999
				]
			],
			area: 1229.4531
		},
		"127C": {
			vertices: [
				"R127C:0"
			],
			center: [
				166.24258,
				27.233063
			],
			outline: [
				[
					174.08,
					24.25
				],
				[
					174.07965,
					30.45819
				],
				[
					160.27165,
					30.45819
				],
				[
					156.68275,
					24.242065
				]
			],
			area: 96.91907
		},
		"241A": {
			vertices: [
				"R241A:0"
			],
			names: [
				"Yearbook"
			],
			center: [
				298.17963,
				189.32286
			],
			outline: [
				[
					289.59003,
					201.20001
				],
				[
					309.01703,
					201.20001
				],
				[
					309.01703,
					185.297
				],
				[
					301.34924,
					185.297
				],
				[
					301.34924,
					174.40698
				],
				[
					289.59024,
					174.40698
				]
			],
			area: 437.0039
		},
		HS110: {
			vertices: [
				"RHS110:0"
			],
			names: [
				"Hand Sanitization (Fitness Center)",
				"Hand Sanitization Station (Fitness Center)",
				"Hand Sanitization (Weight Room)",
				"Hand Sanitization Station (Weight Room)",
				"Hand Sanitization (Exercise Room)",
				"Hand Sanitization Station (Exercise Room)"
			],
			center: [
				264.47458,
				239.07214
			],
			outline: [
				[
					263.85,
					240.05002
				],
				[
					265.2695,
					240.05002
				],
				[
					265.2695,
					238.24652
				],
				[
					263.85,
					238.24652
				]
			],
			area: 2.5625,
			tags: [
				"hs"
			]
		},
		AHU1: {
			vertices: [
				"RAHU101:0"
			],
			names: [
				"AHU-1",
				"Air Handling Unit 1",
				"HVAC"
			],
			center: [
				140.85176,
				135.90158
			],
			outline: [
				[
					152.81999,
					139.52002
				],
				[
					154.8064,
					132.107
				],
				[
					130.8174,
					132.107
				],
				[
					125.1456,
					139.52002
				]
			],
			area: 191.49121,
			tags: [
				"ahu"
			]
		},
		"138D": {
			vertices: [
				"R138D:0"
			],
			center: [
				386.412,
				139.91505
			],
			outline: [
				[
					375.73,
					145.91998
				],
				[
					375.73,
					133.90997
				],
				[
					397.09402,
					133.90997
				],
				[
					397.09402,
					145.91998
				]
			],
			area: 256.58203
		},
		"161A": {
			vertices: [
				"R161A:0"
			],
			center: [
				420.64896,
				222.56763
			],
			outline: [
				[
					426.29,
					239.23001
				],
				[
					426.29,
					224.646
				],
				[
					400.95102,
					224.646
				],
				[
					400.95102,
					214.29602
				],
				[
					434.053,
					214.29602
				],
				[
					434.053,
					239.23001
				]
			],
			area: 455.8203
		},
		"203B": {
			vertices: [
				"R203B:0"
			],
			center: [
				521.2442,
				88.32055
			],
			outline: [
				[
					508.19,
					103.54999
				],
				[
					508.19,
					73.091
				],
				[
					534.297,
					73.091
				],
				[
					534.297,
					103.54999
				]
			],
			area: 795.1914
		},
		"128B": {
			vertices: [
				"R128B:0"
			],
			names: [
				"Chorus Room",
				"Choral Room"
			],
			center: [
				204.25,
				159.5
			],
			outline: [
				[
					177.83,
					194.70001
				],
				[
					177.83,
					177.97302
				],
				[
					189.41,
					177.93915
				],
				[
					189.41,
					171.79688
				],
				[
					184.1559,
					171.79694
				],
				[
					184.1559,
					156.61395
				],
				[
					189.41,
					156.61389
				],
				[
					189.41,
					145.5459
				],
				[
					222.092,
					145.54791
				],
				[
					222.09201,
					171.79694
				],
				[
					195.843,
					171.79694
				],
				[
					195.843,
					194.69995
				]
			],
			area: 1278.9062
		},
		BW105: {
			vertices: [
				"RBW105:0"
			],
			names: [
				"Women's Restroom (Auditorium)",
				"Women's Bathroom (Auditorium)",
				"Women's Restroom (Theater)",
				"Women's Bathroom (Theater)"
			],
			center: [
				205.81691,
				86.05332
			],
			outline: [
				[
					188.55,
					91.85004
				],
				[
					188.55,
					85.15924
				],
				[
					197.2951,
					85.15924
				],
				[
					197.2951,
					79.24011
				],
				[
					219.6831,
					79.24011
				],
				[
					219.6831,
					91.8501
				],
				[
					197.2951,
					91.8501
				]
			],
			area: 340.82324,
			tags: [
				"women-bathroom",
				"closed"
			]
		},
		BSC13: {
			vertices: [
				"RBSC13:0"
			],
			names: [
				"BSC-13",
				"Bathroom Supply Closet 13"
			],
			center: [
				343.5049,
				69.70776
			],
			outline: [
				[
					339.43002,
					72.97998
				],
				[
					339.43002,
					66.43567
				],
				[
					347.58173,
					66.43567
				],
				[
					347.58173,
					72.97998
				]
			],
			area: 53.347656,
			tags: [
				"bsc"
			]
		},
		"128A": {
			vertices: [
				"R128A:0"
			],
			names: [
				"Band Room",
				"Instrumental Music"
			],
			center: [
				151.625,
				168.125
			],
			outline: [
				[
					128.42,
					185.69
				],
				[
					128.42,
					145.54498
				],
				[
					163.933,
					145.54498
				],
				[
					163.933,
					156.60999
				],
				[
					184.155,
					156.61041
				],
				[
					184.155,
					171.7934
				],
				[
					189.4091,
					171.79333
				],
				[
					189.4091,
					177.96954
				],
				[
					177.8291,
					177.96954
				],
				[
					177.82912,
					194.69653
				],
				[
					139.90211,
					194.69653
				],
				[
					139.90211,
					185.69012
				]
			],
			area: 2338.9258
		},
		BC104: {
			vertices: [
				"RBC102:0"
			],
			names: [
				"Bleeding Control (Auditorium)",
				"Bleeding Control Kit (Auditorium)"
			],
			center: [
				183.27892,
				113.88203
			],
			outline: [
				[
					182.58,
					114.79004
				],
				[
					183.9995,
					114.79004
				],
				[
					183.9995,
					112.98651
				],
				[
					182.58,
					112.98651
				]
			],
			area: 2.5605469,
			tags: [
				"bleed-control"
			]
		},
		HS200: {
			vertices: [
				"RHS200:0"
			],
			names: [
				"Hand Sanitization (Bulldog Lobby Upstairs)",
				"Hand Sanitization Station (Bulldog Lobby Upstairs)"
			],
			center: [
				362.19833,
				44.846745
			],
			outline: [
				[
					361.32,
					44.140015
				],
				[
					361.32,
					45.55951
				],
				[
					363.1235,
					45.55951
				],
				[
					363.1235,
					44.140015
				]
			],
			area: 2.5605469,
			tags: [
				"hs"
			]
		},
		IDF3: {
			vertices: [
				"RIDF103:0"
			],
			names: [
				"IDF3",
				"Intermediate Distribution Frame 3"
			],
			center: [
				249.78474,
				212.86754
			],
			outline: [
				[
					245.61,
					219.73999
				],
				[
					245.61,
					205.99402
				],
				[
					253.95769,
					205.99402
				],
				[
					253.95769,
					219.73999
				]
			],
			area: 114.74609,
			tags: [
				"idf"
			]
		},
		HS107: {
			vertices: [
				"RHS107:0"
			],
			names: [
				"Hand Sanitization (Auditorium)",
				"Hand Sanitization Station (Auditorium)"
			],
			center: [
				174.79204,
				36.911945
			],
			outline: [
				[
					175.5,
					36.01001
				],
				[
					174.0805,
					36.01001
				],
				[
					174.0805,
					37.813538
				],
				[
					175.5,
					37.813538
				]
			],
			area: 2.5600586,
			tags: [
				"hs"
			]
		},
		"240Z": {
			vertices: [
				"R240Z:0"
			],
			center: [
				418.52625,
				164.70346
			],
			outline: [
				[
					408.38,
					168.47998
				],
				[
					408.38,
					160.93256
				],
				[
					428.687,
					160.93256
				],
				[
					428.687,
					168.47998
				]
			],
			area: 153.27344
		},
		BSC4: {
			vertices: [
				"RBSC4:0"
			],
			names: [
				"BSC-4",
				"Bathroom Supply Closet 4"
			],
			center: [
				343.5051,
				69.52759
			],
			outline: [
				[
					339.43002,
					72.79999
				],
				[
					339.43002,
					66.25568
				],
				[
					347.58173,
					66.25568
				],
				[
					347.58173,
					72.79999
				]
			],
			area: 53.347656,
			tags: [
				"bsc"
			]
		},
		"128A.6": {
			vertices: [
				"R128A.6:0"
			],
			names: [
				"Instrument Storage"
			],
			center: [
				146.77727,
				190.1964
			],
			outline: [
				[
					139.9,
					194.70001
				],
				[
					139.9,
					185.69354
				],
				[
					153.655,
					185.69354
				],
				[
					153.655,
					194.70001
				]
			],
			area: 123.884766
		},
		BSC12: {
			vertices: [
				"RBSC12:0"
			],
			names: [
				"BSC-12",
				"Bathroom Supply Closet 12"
			],
			center: [
				510.35016,
				151.52617
			],
			outline: [
				[
					499.30002,
					156.96002
				],
				[
					499.30002,
					146.09302
				],
				[
					521.403,
					146.09302
				],
				[
					521.403,
					156.96002
				]
			],
			area: 240.19531,
			tags: [
				"bsc"
			]
		},
		"166S": {
			vertices: [
				"R166S:0"
			],
			center: [
				233.89067,
				311.85846
			],
			outline: [
				[
					225.81,
					318.75
				],
				[
					225.81,
					304.972
				],
				[
					241.97499,
					304.972
				],
				[
					241.97499,
					318.75
				]
			],
			area: 222.72656
		},
		BC206: {
			vertices: [
				"RBC206:0"
			],
			names: [
				"Bleeding Control (25X)",
				"Bleeding Control Kit (25X)"
			],
			center: [
				558.1423,
				299.03656
			],
			outline: [
				[
					559.22003,
					299.84003
				],
				[
					559.22003,
					298.42053
				],
				[
					557.4165,
					298.42053
				],
				[
					557.4165,
					299.84003
				]
			],
			area: 2.5625,
			tags: [
				"bleed-control"
			]
		},
		"262B": {
			vertices: [
				"R262B:0"
			],
			center: [
				390.98047,
				338.76276
			],
			outline: [
				[
					384.12003,
					342.8
				],
				[
					384.12003,
					334.73288
				],
				[
					397.851,
					334.73288
				],
				[
					397.851,
					342.8
				]
			],
			area: 110.77344
		},
		"144J": {
			vertices: [
				"R144J:0"
			],
			center: [
				505.2151,
				119.26497
			],
			outline: [
				[
					498.01,
					130.82
				],
				[
					498.01,
					107.71002
				],
				[
					512.421,
					107.71002
				],
				[
					512.421,
					130.82
				]
			],
			area: 333.03906
		},
		BW103: {
			vertices: [
				"RBW103:0"
			],
			names: [
				"Women's Restroom (Gym)",
				"Women's Bathroom (Gym)"
			],
			center: [
				447.3156,
				205.63097
			],
			outline: [
				[
					437.58002,
					214.29004
				],
				[
					437.58002,
					196.97302
				],
				[
					457.05402,
					196.97302
				],
				[
					457.05402,
					214.29004
				]
			],
			area: 337.23438,
			tags: [
				"women-bathroom",
				"closed"
			]
		},
		"128A.1": {
			vertices: [
				"R128A.1:0"
			],
			names: [
				"Practice Room 5"
			],
			center: [
				180.76422,
				160.48784
			],
			outline: [
				[
					177.37999,
					164.37
				],
				[
					177.37999,
					156.60931
				],
				[
					184.15219,
					156.60931
				],
				[
					184.15219,
					164.37
				]
			],
			area: 52.558594
		},
		"153Z": {
			vertices: [
				"R153Z:1",
				"R153Z:0"
			],
			center: [
				529.9644,
				257.17358
			],
			outline: [
				[
					523.29004,
					264.55002
				],
				[
					523.29004,
					249.79202
				],
				[
					536.62805,
					249.79202
				],
				[
					536.62805,
					264.55002
				]
			],
			area: 196.83594
		},
		"137A": {
			vertices: [
				"R137A:0",
				"R137A:1"
			],
			center: [
				142.97427,
				212.23524
			],
			outline: [
				[
					135.87999,
					220.88
				],
				[
					135.87999,
					203.591
				],
				[
					150.06898,
					203.591
				],
				[
					150.06898,
					220.88
				]
			],
			area: 245.31445
		},
		"100B": {
			vertices: [
				"R100B:0"
			],
			center: [
				471.1176,
				120.24406
			],
			outline: [
				[
					466.95,
					124.98999
				],
				[
					466.95,
					115.50037
				],
				[
					475.2944,
					115.50037
				],
				[
					475.2944,
					124.98999
				]
			],
			area: 79.1875
		},
		BC101: {
			vertices: [
				"RBC101:0"
			],
			names: [
				"Bleeding Control (Main Office)",
				"Bleeding Control Kit (Main Office)"
			],
			center: [
				480.63818,
				156.06503
			],
			outline: [
				[
					481.5,
					155.21002
				],
				[
					480.0805,
					155.21002
				],
				[
					480.0805,
					157.01355
				],
				[
					481.5,
					157.01355
				]
			],
			area: 2.5625,
			tags: [
				"bleed-control"
			]
		},
		"107H": {
			vertices: [
				"R107H:0"
			],
			center: [
				452.71674,
				44.693436
			],
			outline: [
				[
					447.57,
					49.820007
				],
				[
					447.57,
					39.567017
				],
				[
					457.864,
					39.567017
				],
				[
					457.864,
					49.820007
				]
			],
			area: 105.54492
		},
		"163W": {
			vertices: [
				"R163W:0"
			],
			center: [
				363.86108,
				210.3351
			],
			outline: [
				[
					358.04,
					219.65002
				],
				[
					358.04,
					201.021
				],
				[
					369.683,
					201.021
				],
				[
					369.683,
					219.65002
				]
			],
			area: 216.89844
		},
		"243A": {
			vertices: [
				"R243:0"
			],
			names: [
				"Newspaper"
			],
			center: [
				320.30518,
				189.1565
			],
			outline: [
				[
					309.02002,
					201.20001
				],
				[
					329.36603,
					201.20001
				],
				[
					329.36603,
					174.40698
				],
				[
					316.29803,
					174.40698
				],
				[
					316.29803,
					185.297
				],
				[
					309.02014,
					185.297
				]
			],
			area: 465.8711
		},
		"128C": {
			vertices: [
				"R128C:0"
			],
			center: [
				208.96477,
				183.24863
			],
			outline: [
				[
					195.84,
					194.70001
				],
				[
					195.84,
					171.797
				],
				[
					222.089,
					171.797
				],
				[
					222.089,
					194.70001
				]
			],
			area: 601.1797
		},
		EC5: {
			vertices: [
				"REC5:0"
			],
			names: [
				"EC-5",
				"Electrical Closet 5"
			],
			center: [
				196.67375,
				331.6161
			],
			outline: [
				[
					178.65,
					336.43002
				],
				[
					178.65,
					326.80093
				],
				[
					214.69699,
					326.80093
				],
				[
					214.69699,
					336.43002
				]
			],
			area: 347.09766,
			tags: [
				"ec"
			]
		}
	};
	var mapDataJson = {
		floors: floors,
		vertices: vertices,
		edges: edges,
		rooms: rooms
	};

	// Tuple
	/**
	 * Explicitly create a tuple. Same as doing `[x, y, ...]`, but can return a tuple type instead of array.
	 * @param a Elements of the tuple
	 * @returns Tuple of `a`s
	 */
	function t(...a) {
	    return a;
	}
	// Functional
	/**
	 * Merges two arrays into a single array of pairs. Takes the length of the shorter array and discards the elements of
	 * the longer one above that length.
	 * @param a First array to merge
	 * @param b Second array to merge
	 * @returns Array of pairs of corresponding elements of `a` and `b`
	 */
	function zip(a, b) {
	    if (a.length > b.length) {
	        // i is known to be an integer index
	        // eslint-disable-next-line security/detect-object-injection
	        return b.map((el, i) => [a[i], el]);
	    }
	    else {
	        // eslint-disable-next-line security/detect-object-injection
	        return a.map((el, i) => [el, b[i]]);
	    }
	}
	/**
	 * Merges one array into another. If you're seeing these docs, you might be using larger arrays than the types support.
	 * In this case, you should extend the types to support your array length. However, the implementation is likely to work
	 * anyway.
	 * @param a Base array
	 * @param b Array to merge into `a`
	 * @returns Merged array
	 */
	function zipInto(a, b) {
	    if (a.length > b.length) {
	        // i is known to be an integer index
	        // eslint-disable-next-line security/detect-object-injection
	        return b.map((el, i) => [...a[i], el]);
	    }
	    else {
	        // eslint-disable-next-line security/detect-object-injection
	        return a.map((el, i) => [...el, b[i]]);
	    }
	}
	/**
	 * Flatten a list of lists into a single-depth list
	 * @param a List of lists
	 * @returns Flattened single-depth list
	 */
	function flatten(a) {
	    return a.reduce((flat, el) => [...flat, ...el], []);
	}
	/**
	 * Turn an array of `Option`s into an `Option` of an array. If any `None`s exist in the array, returns `None`.
	 * Otherwise, returns `Some` of the entire array of unwrapped elements.
	 */
	function extractOption(a) {
	    return a.reduce((optAcc, optCurr) => optCurr.andThen((curr) => optAcc.map((acc) => {
	        acc.push(curr);
	        return acc;
	    })), lib.Some([]));
	}
	/**
	 * Turn an array of `Result`s into a `Result` of an array. If any `Err`s exist in the array, returns one of those
	 * `Err`s. Otherwise, returns `Ok` of the entire array of unwrapped elements.
	 */
	function extractResult(a) {
	    return a.reduce((optAcc, optCurr) => optCurr.andThen((curr) => optAcc.map((acc) => {
	        acc.push(curr);
	        return acc;
	    })), lib.Ok([]));
	}
	/**
	 * Due to TypeScript's lack of something like Rust's `?` operator, working with `Result`s can be cumbersome. This
	 * function converts `Result`s into something like Go's error handling paradigm, which is at least more concise and type
	 * safe than a naive TypeScript-Result paradigm.
	 *
	 * ## Example
	 * ```typescript
	 * const resultRandom: Result<number, string> = maybeRandom();
	 *
	 * const randErr = goRes(resultRandom, "could not get random number");
	 * if (randErr[1] !== null) { return Err(randErr[1]); }
	 * const rand: number = randErr[0];
	 * ```
	 * or preferably, simply
	 * ```typescript
	 * const randErr = goRes(maybeRandom(), "could not get random number");
	 * if (randErr[1] !== null) { return Err(randErr[1]); }
	 * const rand = randErr[0];
	 * ```
	 *
	 * @param a Result to Go-ify
	 * @param errorMessage Error message prefix to use in case of `Err`
	 * @returns If `a` is `Ok(something)`, returns `[something, null]`. If `a` is `Err(error)`, returns
	 * `[null, errorMessage + error]`.
	 */
	function goRes(a, errorMessage = "") {
	    return a.match({
	        ok: (value) => [value, null],
	        err: (error) => [null, `${errorMessage}${error}`],
	    });
	}
	// Object
	/**
	 * Creates a deep copy of an object. This means that fields of the object are also recursively copied, so the result is
	 * entirely independent of the original.
	 * @param a Object to copy
	 * @returns Copy of `a`
	 */
	function deepCopy(a) {
	    if (typeof a !== "object" || a === null) {
	        return a;
	    }
	    if (Array.isArray(a)) {
	        // @ts-expect-error: TS can't tell that each element will be the same type, so this is okay
	        return a.map((entry) => deepCopy(entry));
	    }
	    else if (a !== null && a !== undefined && typeof a === "object") {
	        return Object.getOwnPropertyNames(a).reduce((copy, property) => {
	            const descriptor = Object.getOwnPropertyDescriptor(a, property);
	            if (descriptor !== undefined) {
	                Object.defineProperty(copy, property, descriptor);
	                // Indexing is appropriate because the types will match up and we want all properties of a on copy
	                // @ts-expect-error: TS can't tell that the types will work out
	                // eslint-disable-next-line security/detect-object-injection
	                copy[property] = deepCopy(a[property]);
	            }
	            return copy;
	        }, Object.create(Object.getPrototypeOf(a)));
	    }
	    else {
	        return a;
	    }
	}
	// DOM
	/**
	 * Removes all children of an element.
	 */
	function removeChildren(element) {
	    while (element.lastChild !== null) {
	        element.removeChild(element.lastChild);
	    }
	}

	/** Lazily sets up dev mode when enabled. Displays vertices, edges, and mouse click location. */
	class DeveloperModeService {
	    constructor(settings, map, mapData, floors, logger) {
	        this.map = map;
	        this.mapData = mapData;
	        this.floors = floors;
	        this.logger = logger;
	        this.showClickLoc = (e) => {
	            const link = this.getLink(e.latlng, floors);
	            this.locationPopup
	                .setLatLng(e.latlng)
	                .setContent(`<div>
                        <p>
                            ${e.latlng.lng}, ${e.latlng.lat}
                        </p>
                        <p>
                            <a href=${link}>${link}</a>
                        </p>
                    </div>`)
	                .openOn(this.map);
	        };
	        this.locationPopup = leafletSrc.popup();
	        this.devLayers = lib.None;
	        settings.addWatcher("dev", (devUnknown) => {
	            const dev = devUnknown;
	            this.onDevSettingChange(dev);
	        });
	    }
	    getLink(latlng, floors) {
	        const x = Math.round(latlng.lng);
	        const y = Math.round(latlng.lat);
	        const floor = floors.getCurrentFloor();
	        return `/#/pos:(${x},${y},${floor})`;
	    }
	    onDevSettingChange(dev) {
	        if (dev) {
	            this.onEnableDevSetting();
	        }
	        else {
	            this.onDisableDevSetting();
	        }
	    }
	    onEnableDevSetting() {
	        if (this.devLayers.isNone()) {
	            const layersErr = goRes(this.createDevLayers());
	            if (layersErr[1] !== null) {
	                this.logger.logError(`Error creating dev layers: ${layersErr[1]}`);
	                return;
	            }
	            this.devLayers = lib.Some(layersErr[0]);
	        }
	        this.devLayers
	            .unwrap()
	            .forEach((devLayer) => this.floors.addLayer(devLayer));
	        this.map.on("click", this.showClickLoc, this);
	    }
	    onDisableDevSetting() {
	        this.devLayers.ifSome((devLayers) => devLayers.forEach((devLayer) => this.floors.removeLayer(devLayer)));
	        this.map.off("click", this.showClickLoc, this);
	    }
	    createDevLayers() {
	        return extractResult(this.mapData
	            .getAllFloors()
	            .map((floorData) => floorData.number)
	            .map((floorNumber) => this.mapData.createDevLayerGroup(floorNumber)));
	    }
	}
	DeveloperModeService.inject = [
	    "settings",
	    "map",
	    "mapData",
	    "floors",
	    "logger",
	];

	/**
	 * k-d Tree JavaScript - V 1.01
	 *
	 * https://github.com/ubilabs/kd-tree-javascript
	 *
	 * @author Mircea Pricop <pricop@ubilabs.net>, 2012
	 * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
	 * @author Ubilabs http://ubilabs.net, 2012
	 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
	 */

	var kdTreeMin = createCommonjsModule(function (module, exports) {
	!function(t,n){n(exports);}(commonjsGlobal,function(t){function n(t,n,o){this.obj=t,this.left=null,this.right=null,this.parent=o,this.dimension=n;}function o(t){this.content=[],this.scoreFunction=t;}o.prototype={push:function(t){this.content.push(t),this.bubbleUp(this.content.length-1);},pop:function(){var t=this.content[0],n=this.content.pop();return this.content.length>0&&(this.content[0]=n,this.sinkDown(0)),t},peek:function(){return this.content[0]},remove:function(t){for(var n=this.content.length,o=0;o<n;o++)if(this.content[o]==t){var i=this.content.pop();return void(o!=n-1&&(this.content[o]=i,this.scoreFunction(i)<this.scoreFunction(t)?this.bubbleUp(o):this.sinkDown(o)))}throw new Error("Node not found.")},size:function(){return this.content.length},bubbleUp:function(t){for(var n=this.content[t];t>0;){var o=Math.floor((t+1)/2)-1,i=this.content[o];if(!(this.scoreFunction(n)<this.scoreFunction(i)))break;this.content[o]=n,this.content[t]=i,t=o;}},sinkDown:function(t){for(var n=this.content.length,o=this.content[t],i=this.scoreFunction(o);;){var e=2*(t+1),r=e-1,l=null;if(r<n){var u=this.content[r],h=this.scoreFunction(u);h<i&&(l=r);}if(e<n){var s=this.content[e];this.scoreFunction(s)<(null==l?i:h)&&(l=e);}if(null==l)break;this.content[t]=this.content[l],this.content[l]=o,t=l;}}},t.kdTree=function(t,i,e){function r(t,o,i){var l,u,h=o%e.length;return 0===t.length?null:1===t.length?new n(t[0],h,i):(t.sort(function(t,n){return t[e[h]]-n[e[h]]}),l=Math.floor(t.length/2),u=new n(t[l],h,i),u.left=r(t.slice(0,l),o+1,u),u.right=r(t.slice(l+1),o+1,u),u)}var l=this;Array.isArray(t)?this.root=r(t,0,null):function(t){function n(t){t.left&&(t.left.parent=t,n(t.left)),t.right&&(t.right.parent=t,n(t.right));}l.root=t,n(l.root);}(t),this.toJSON=function(t){t||(t=this.root);var o=new n(t.obj,t.dimension,null);return t.left&&(o.left=l.toJSON(t.left)),t.right&&(o.right=l.toJSON(t.right)),o},this.insert=function(t){function o(n,i){if(null===n)return i;var r=e[n.dimension];return t[r]<n.obj[r]?o(n.left,n):o(n.right,n)}var i,r,l=o(this.root,null);null!==l?(i=new n(t,(l.dimension+1)%e.length,l),r=e[l.dimension],t[r]<l.obj[r]?l.left=i:l.right=i):this.root=new n(t,0,null);},this.remove=function(t){function n(o){if(null===o)return null;if(o.obj===t)return o;var i=e[o.dimension];return t[i]<o.obj[i]?n(o.left):n(o.right)}function o(t){function n(t,o){var i,r,l,u,h;return null===t?null:(i=e[o],t.dimension===o?null!==t.left?n(t.left,o):t:(r=t.obj[i],l=n(t.left,o),u=n(t.right,o),h=t,null!==l&&l.obj[i]<r&&(h=l),null!==u&&u.obj[i]<h.obj[i]&&(h=u),h))}var i,r,u;if(null===t.left&&null===t.right)return null===t.parent?void(l.root=null):(u=e[t.parent.dimension],void(t.obj[u]<t.parent.obj[u]?t.parent.left=null:t.parent.right=null));null!==t.right?(r=(i=n(t.right,t.dimension)).obj,o(i),t.obj=r):(r=(i=n(t.left,t.dimension)).obj,o(i),t.right=t.left,t.left=null,t.obj=r);}var i;null!==(i=n(l.root))&&o(i);},this.nearest=function(t,n,r){function u(o){function r(t,o){f.push([t,o]),f.size()>n&&f.pop();}var l,h,s,c,a=e[o.dimension],g=i(t,o.obj),p={};for(c=0;c<e.length;c+=1)c===o.dimension?p[e[c]]=t[e[c]]:p[e[c]]=o.obj[e[c]];h=i(p,o.obj),null!==o.right||null!==o.left?(u(l=null===o.right?o.left:null===o.left?o.right:t[a]<o.obj[a]?o.left:o.right),(f.size()<n||g<f.peek()[1])&&r(o,g),(f.size()<n||Math.abs(h)<f.peek()[1])&&null!==(s=l===o.left?o.right:o.left)&&u(s)):(f.size()<n||g<f.peek()[1])&&r(o,g);}var h,s,f;if(f=new o(function(t){return -t[1]}),r)for(h=0;h<n;h+=1)f.push([null,r]);for(l.root&&u(l.root),s=[],h=0;h<Math.min(n,f.content.length);h+=1)f.content[h][0]&&s.push([f.content[h][0].obj,f.content[h][1]]);return s},this.balanceFactor=function(){function t(n){return null===n?0:Math.max(t(n.left),t(n.right))+1}function n(t){return null===t?0:n(t.left)+n(t.right)+1}return t(l.root)/(Math.log(n(l.root))/Math.log(2))};},t.BinaryHeap=o;});
	});

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */

	var __assign = function() {
	    __assign = Object.assign || function __assign(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign.apply(this, arguments);
	};

	function __values(o) {
	    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
	    if (m) return m.call(o);
	    if (o && typeof o.length === "number") return {
	        next: function () {
	            if (o && i >= o.length) o = void 0;
	            return { value: o && o[i++], done: !o };
	        }
	    };
	    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	}

	function __read(o, n) {
	    var m = typeof Symbol === "function" && o[Symbol.iterator];
	    if (!m) return o;
	    var i = m.call(o), r, ar = [], e;
	    try {
	        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	    }
	    catch (error) { e = { error: error }; }
	    finally {
	        try {
	            if (r && !r.done && (m = i["return"])) m.call(i);
	        }
	        finally { if (e) throw e.error; }
	    }
	    return ar;
	}

	function __spread() {
	    for (var ar = [], i = 0; i < arguments.length; i++)
	        ar = ar.concat(__read(arguments[i]));
	    return ar;
	}

	/** @ignore */
	var ENTRIES = 'ENTRIES';
	/** @ignore */
	var KEYS = 'KEYS';
	/** @ignore */
	var VALUES = 'VALUES';
	/** @ignore */
	var LEAF = '';
	/**
	 * @private
	 */
	var TreeIterator = /** @class */ (function () {
	    function TreeIterator(set, type) {
	        var node = set._tree;
	        var keys = Object.keys(node);
	        this.set = set;
	        this._type = type;
	        this._path = keys.length > 0 ? [{ node: node, keys: keys }] : [];
	    }
	    TreeIterator.prototype.next = function () {
	        var value = this.dive();
	        this.backtrack();
	        return value;
	    };
	    TreeIterator.prototype.dive = function () {
	        if (this._path.length === 0) {
	            return { done: true, value: undefined };
	        }
	        var _a = last(this._path), node = _a.node, keys = _a.keys;
	        if (last(keys) === LEAF) {
	            return { done: false, value: this.result() };
	        }
	        this._path.push({ node: node[last(keys)], keys: Object.keys(node[last(keys)]) });
	        return this.dive();
	    };
	    TreeIterator.prototype.backtrack = function () {
	        if (this._path.length === 0) {
	            return;
	        }
	        last(this._path).keys.pop();
	        if (last(this._path).keys.length > 0) {
	            return;
	        }
	        this._path.pop();
	        this.backtrack();
	    };
	    TreeIterator.prototype.key = function () {
	        return this.set._prefix + this._path
	            .map(function (_a) {
	            var keys = _a.keys;
	            return last(keys);
	        })
	            .filter(function (key) { return key !== LEAF; })
	            .join('');
	    };
	    TreeIterator.prototype.value = function () {
	        return last(this._path).node[LEAF];
	    };
	    TreeIterator.prototype.result = function () {
	        if (this._type === VALUES) {
	            return this.value();
	        }
	        if (this._type === KEYS) {
	            return this.key();
	        }
	        return [this.key(), this.value()];
	    };
	    TreeIterator.prototype[Symbol.iterator] = function () {
	        return this;
	    };
	    return TreeIterator;
	}());
	var last = function (array) {
	    return array[array.length - 1];
	};

	var NONE = 0;
	var CHANGE = 1;
	var ADD = 2;
	var DELETE = 3;
	/**
	 * @ignore
	 */
	var fuzzySearch = function (node, query, maxDistance) {
	    var stack = [{ distance: 0, i: 0, key: '', node: node }];
	    var results = {};
	    var innerStack = [];
	    var _loop_1 = function () {
	        var _a = stack.pop(), node_1 = _a.node, distance = _a.distance, key = _a.key, i = _a.i, edit = _a.edit;
	        Object.keys(node_1).forEach(function (k) {
	            if (k === LEAF) {
	                var totDistance = distance + (query.length - i);
	                var _a = __read(results[key] || [null, Infinity], 2), d = _a[1];
	                if (totDistance <= maxDistance && totDistance < d) {
	                    results[key] = [node_1[k], totDistance];
	                }
	            }
	            else {
	                withinDistance(query, k, maxDistance - distance, i, edit, innerStack).forEach(function (_a) {
	                    var d = _a.distance, i = _a.i, edit = _a.edit;
	                    stack.push({ node: node_1[k], distance: distance + d, key: key + k, i: i, edit: edit });
	                });
	            }
	        });
	    };
	    while (stack.length > 0) {
	        _loop_1();
	    }
	    return results;
	};
	/**
	 * @ignore
	 */
	var withinDistance = function (a, b, maxDistance, i, edit, stack) {
	    stack.push({ distance: 0, ia: i, ib: 0, edit: edit });
	    var results = [];
	    while (stack.length > 0) {
	        var _a = stack.pop(), distance = _a.distance, ia = _a.ia, ib = _a.ib, edit_1 = _a.edit;
	        if (ib === b.length) {
	            results.push({ distance: distance, i: ia, edit: edit_1 });
	            continue;
	        }
	        if (a[ia] === b[ib]) {
	            stack.push({ distance: distance, ia: ia + 1, ib: ib + 1, edit: NONE });
	        }
	        else {
	            if (distance >= maxDistance) {
	                continue;
	            }
	            if (edit_1 !== ADD) {
	                stack.push({ distance: distance + 1, ia: ia, ib: ib + 1, edit: DELETE });
	            }
	            if (ia < a.length) {
	                if (edit_1 !== DELETE) {
	                    stack.push({ distance: distance + 1, ia: ia + 1, ib: ib, edit: ADD });
	                }
	                if (edit_1 !== DELETE && edit_1 !== ADD) {
	                    stack.push({ distance: distance + 1, ia: ia + 1, ib: ib + 1, edit: CHANGE });
	                }
	            }
	        }
	    }
	    return results;
	};

	/**
	 * A class implementing the same interface as a standard JavaScript
	 * [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
	 * with string keys, but adding support for efficiently searching entries with
	 * prefix or fuzzy search. This class is used internally by [[MiniSearch]] as
	 * the inverted index data structure. The implementation is a radix tree
	 * (compressed prefix tree).
	 *
	 * Since this class can be of general utility beyond _MiniSearch_, it is
	 * exported by the `minisearch` package and can be imported (or required) as
	 * `minisearch/SearchableMap`.
	 *
	 * @typeParam T  The type of the values stored in the map.
	 */
	var SearchableMap = /** @class */ (function () {
	    /**
	     * The constructor is normally called without arguments, creating an empty
	     * map. In order to create a [[SearchableMap]] from an iterable or from an
	     * object, check [[SearchableMap.from]] and [[SearchableMap.fromObject]].
	     *
	     * The constructor arguments are for internal use, when creating derived
	     * mutable views of a map at a prefix.
	     */
	    function SearchableMap(tree, prefix) {
	        if (tree === void 0) { tree = {}; }
	        if (prefix === void 0) { prefix = ''; }
	        this._tree = tree;
	        this._prefix = prefix;
	    }
	    /**
	     * Creates and returns a mutable view of this [[SearchableMap]], containing only
	     * entries that share the given prefix.
	     *
	     * ### Usage:
	     *
	     * ```javascript
	     * let map = new SearchableMap()
	     * map.set("unicorn", 1)
	     * map.set("universe", 2)
	     * map.set("university", 3)
	     * map.set("unique", 4)
	     * map.set("hello", 5)
	     *
	     * let uni = map.atPrefix("uni")
	     * uni.get("unique") // => 4
	     * uni.get("unicorn") // => 1
	     * uni.get("hello") // => undefined
	     *
	     * let univer = map.atPrefix("univer")
	     * univer.get("unique") // => undefined
	     * univer.get("universe") // => 2
	     * univer.get("university") // => 3
	     * ```
	     *
	     * @param prefix  The prefix
	     * @return A [[SearchableMap]] representing a mutable view of the original Map at the given prefix
	     */
	    SearchableMap.prototype.atPrefix = function (prefix) {
	        var _a;
	        if (!prefix.startsWith(this._prefix)) {
	            throw new Error('Mismatched prefix');
	        }
	        var _b = __read(trackDown(this._tree, prefix.slice(this._prefix.length)), 2), node = _b[0], path = _b[1];
	        if (node === undefined) {
	            var _c = __read(last$1(path), 2), parentNode = _c[0], key_1 = _c[1];
	            var nodeKey = Object.keys(parentNode).find(function (k) { return k !== LEAF && k.startsWith(key_1); });
	            if (nodeKey !== undefined) {
	                return new SearchableMap((_a = {}, _a[nodeKey.slice(key_1.length)] = parentNode[nodeKey], _a), prefix);
	            }
	        }
	        return new SearchableMap(node || {}, prefix);
	    };
	    /**
	     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear
	     */
	    SearchableMap.prototype.clear = function () {
	        delete this._size;
	        this._tree = {};
	    };
	    /**
	     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete
	     * @param key  Key to delete
	     */
	    SearchableMap.prototype.delete = function (key) {
	        delete this._size;
	        return remove(this._tree, key);
	    };
	    /**
	     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries
	     * @return An iterator iterating through `[key, value]` entries.
	     */
	    SearchableMap.prototype.entries = function () {
	        return new TreeIterator(this, ENTRIES);
	    };
	    /**
	     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach
	     * @param fn  Iteration function
	     */
	    SearchableMap.prototype.forEach = function (fn) {
	        var e_1, _a;
	        try {
	            for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
	                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
	                fn(key, value, this);
	            }
	        }
	        catch (e_1_1) { e_1 = { error: e_1_1 }; }
	        finally {
	            try {
	                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
	            }
	            finally { if (e_1) throw e_1.error; }
	        }
	    };
	    /**
	     * Returns a key-value object of all the entries that have a key within the
	     * given edit distance from the search key. The keys of the returned object are
	     * the matching keys, while the values are two-elements arrays where the first
	     * element is the value associated to the key, and the second is the edit
	     * distance of the key to the search key.
	     *
	     * ### Usage:
	     *
	     * ```javascript
	     * let map = new SearchableMap()
	     * map.set('hello', 'world')
	     * map.set('hell', 'yeah')
	     * map.set('ciao', 'mondo')
	     *
	     * // Get all entries that match the key 'hallo' with a maximum edit distance of 2
	     * map.fuzzyGet('hallo', 2)
	     * // => { "hello": ["world", 1], "hell": ["yeah", 2] }
	     *
	     * // In the example, the "hello" key has value "world" and edit distance of 1
	     * // (change "e" to "a"), the key "hell" has value "yeah" and edit distance of 2
	     * // (change "e" to "a", delete "o")
	     * ```
	     *
	     * @param key  The search key
	     * @param maxEditDistance  The maximum edit distance (Levenshtein)
	     * @return A key-value object of the matching keys to their value and edit distance
	     */
	    SearchableMap.prototype.fuzzyGet = function (key, maxEditDistance) {
	        return fuzzySearch(this._tree, key, maxEditDistance);
	    };
	    /**
	     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get
	     * @param key  Key to get
	     * @return Value associated to the key, or `undefined` if the key is not
	     * found.
	     */
	    SearchableMap.prototype.get = function (key) {
	        var node = lookup(this._tree, key);
	        return node !== undefined ? node[LEAF] : undefined;
	    };
	    /**
	     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has
	     * @param key  Key
	     * @return True if the key is in the map, false otherwise
	     */
	    SearchableMap.prototype.has = function (key) {
	        var node = lookup(this._tree, key);
	        return node !== undefined && node.hasOwnProperty(LEAF);
	    };
	    /**
	     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys
	     * @return An `Iterable` iterating through keys
	     */
	    SearchableMap.prototype.keys = function () {
	        return new TreeIterator(this, KEYS);
	    };
	    /**
	     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set
	     * @param key  Key to set
	     * @param value  Value to associate to the key
	     * @return The [[SearchableMap]] itself, to allow chaining
	     */
	    SearchableMap.prototype.set = function (key, value) {
	        if (typeof key !== 'string') {
	            throw new Error('key must be a string');
	        }
	        delete this._size;
	        var node = createPath(this._tree, key);
	        node[LEAF] = value;
	        return this;
	    };
	    Object.defineProperty(SearchableMap.prototype, "size", {
	        /**
	         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size
	         */
	        get: function () {
	            var _this = this;
	            if (this._size) {
	                return this._size;
	            }
	            /** @ignore */
	            this._size = 0;
	            this.forEach(function () { _this._size += 1; });
	            return this._size;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    /**
	     * Updates the value at the given key using the provided function. The function
	     * is called with the current value at the key, and its return value is used as
	     * the new value to be set.
	     *
	     * ### Example:
	     *
	     * ```javascript
	     * // Increment the current value by one
	     * searchableMap.update('somekey', (currentValue) => currentValue == null ? 0 : currentValue + 1)
	     * ```
	     *
	     * @param key  The key to update
	     * @param fn  The function used to compute the new value from the current one
	     * @return The [[SearchableMap]] itself, to allow chaining
	     */
	    SearchableMap.prototype.update = function (key, fn) {
	        if (typeof key !== 'string') {
	            throw new Error('key must be a string');
	        }
	        delete this._size;
	        var node = createPath(this._tree, key);
	        node[LEAF] = fn(node[LEAF]);
	        return this;
	    };
	    /**
	     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values
	     * @return An `Iterable` iterating through values.
	     */
	    SearchableMap.prototype.values = function () {
	        return new TreeIterator(this, VALUES);
	    };
	    /**
	     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/@@iterator
	     */
	    SearchableMap.prototype[Symbol.iterator] = function () {
	        return this.entries();
	    };
	    /**
	     * Creates a [[SearchableMap]] from an `Iterable` of entries
	     *
	     * @param entries  Entries to be inserted in the [[SearchableMap]]
	     * @return A new [[SearchableMap]] with the given entries
	     */
	    SearchableMap.from = function (entries) {
	        var e_2, _a;
	        var tree = new SearchableMap();
	        try {
	            for (var entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
	                var _b = __read(entries_1_1.value, 2), key = _b[0], value = _b[1];
	                tree.set(key, value);
	            }
	        }
	        catch (e_2_1) { e_2 = { error: e_2_1 }; }
	        finally {
	            try {
	                if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
	            }
	            finally { if (e_2) throw e_2.error; }
	        }
	        return tree;
	    };
	    /**
	     * Creates a [[SearchableMap]] from the iterable properties of a JavaScript object
	     *
	     * @param object  Object of entries for the [[SearchableMap]]
	     * @return A new [[SearchableMap]] with the given entries
	     */
	    SearchableMap.fromObject = function (object) {
	        return SearchableMap.from(Object.entries(object));
	    };
	    return SearchableMap;
	}());
	var trackDown = function (tree, key, path) {
	    if (path === void 0) { path = []; }
	    if (key.length === 0 || tree == null) {
	        return [tree, path];
	    }
	    var nodeKey = Object.keys(tree).find(function (k) { return k !== LEAF && key.startsWith(k); });
	    if (nodeKey === undefined) {
	        path.push([tree, key]); // performance: update in place
	        return trackDown(undefined, '', path);
	    }
	    path.push([tree, nodeKey]); // performance: update in place
	    return trackDown(tree[nodeKey], key.slice(nodeKey.length), path);
	};
	var lookup = function (tree, key) {
	    if (key.length === 0 || tree == null) {
	        return tree;
	    }
	    var nodeKey = Object.keys(tree).find(function (k) { return k !== LEAF && key.startsWith(k); });
	    if (nodeKey === undefined) {
	        return undefined;
	    }
	    return lookup(tree[nodeKey], key.slice(nodeKey.length));
	};
	var createPath = function (tree, key) {
	    var _a;
	    if (key.length === 0 || tree == null) {
	        return tree;
	    }
	    var nodeKey = Object.keys(tree).find(function (k) { return k !== LEAF && key.startsWith(k); });
	    if (nodeKey === undefined) {
	        var toSplit = Object.keys(tree).find(function (k) { return k !== LEAF && k.startsWith(key[0]); });
	        if (toSplit === undefined) {
	            tree[key] = {};
	        }
	        else {
	            var prefix = commonPrefix(key, toSplit);
	            tree[prefix] = (_a = {}, _a[toSplit.slice(prefix.length)] = tree[toSplit], _a);
	            delete tree[toSplit];
	            return createPath(tree[prefix], key.slice(prefix.length));
	        }
	        return tree[key];
	    }
	    return createPath(tree[nodeKey], key.slice(nodeKey.length));
	};
	var commonPrefix = function (a, b, i, length, prefix) {
	    if (i === void 0) { i = 0; }
	    if (length === void 0) { length = Math.min(a.length, b.length); }
	    if (prefix === void 0) { prefix = ''; }
	    if (i >= length) {
	        return prefix;
	    }
	    if (a[i] !== b[i]) {
	        return prefix;
	    }
	    return commonPrefix(a, b, i + 1, length, prefix + a[i]);
	};
	var remove = function (tree, key) {
	    var _a = __read(trackDown(tree, key), 2), node = _a[0], path = _a[1];
	    if (node === undefined) {
	        return;
	    }
	    delete node[LEAF];
	    var keys = Object.keys(node);
	    if (keys.length === 0) {
	        cleanup(path);
	    }
	    if (keys.length === 1) {
	        merge(path, keys[0], node[keys[0]]);
	    }
	};
	var cleanup = function (path) {
	    if (path.length === 0) {
	        return;
	    }
	    var _a = __read(last$1(path), 2), node = _a[0], key = _a[1];
	    delete node[key];
	    if (Object.keys(node).length === 0) {
	        cleanup(path.slice(0, -1));
	    }
	};
	var merge = function (path, key, value) {
	    if (path.length === 0) {
	        return;
	    }
	    var _a = __read(last$1(path), 2), node = _a[0], nodeKey = _a[1];
	    node[nodeKey + key] = value;
	    delete node[nodeKey];
	};
	var last$1 = function (array) {
	    return array[array.length - 1];
	};

	var _a;
	var OR = 'or';
	var AND = 'and';
	/**
	 * [[MiniSearch]] is the main entrypoint class, implementing a full-text search
	 * engine in memory.
	 *
	 * @typeParam T  The type of the documents being indexed.
	 *
	 * ### Basic example:
	 *
	 * ```javascript
	 * const documents = [
	 *   {
	 *     id: 1,
	 *     title: 'Moby Dick',
	 *     text: 'Call me Ishmael. Some years ago...',
	 *     category: 'fiction'
	 *   },
	 *   {
	 *     id: 2,
	 *     title: 'Zen and the Art of Motorcycle Maintenance',
	 *     text: 'I can see by my watch...',
	 *     category: 'fiction'
	 *   },
	 *   {
	 *     id: 3,
	 *     title: 'Neuromancer',
	 *     text: 'The sky above the port was...',
	 *     category: 'fiction'
	 *   },
	 *   {
	 *     id: 4,
	 *     title: 'Zen and the Art of Archery',
	 *     text: 'At first sight it must seem...',
	 *     category: 'non-fiction'
	 *   },
	 *   // ...and more
	 * ]
	 *
	 * // Create a search engine that indexes the 'title' and 'text' fields for
	 * // full-text search. Search results will include 'title' and 'category' (plus the
	 * // id field, that is always stored and returned)
	 * const miniSearch = new MiniSearch({
	 *   fields: ['title', 'text'],
	 *   storeFields: ['title', 'category']
	 * })
	 *
	 * // Add documents to the index
	 * miniSearch.addAll(documents)
	 *
	 * // Search for documents:
	 * let results = miniSearch.search('zen art motorcycle')
	 * // => [
	 * //   { id: 2, title: 'Zen and the Art of Motorcycle Maintenance', category: 'fiction', score: 2.77258 },
	 * //   { id: 4, title: 'Zen and the Art of Archery', category: 'non-fiction', score: 1.38629 }
	 * // ]
	 * ```
	 */
	var MiniSearch = /** @class */ (function () {
	    /**
	     * @param options  Configuration options
	     *
	     * ### Examples:
	     *
	     * ```javascript
	     * // Create a search engine that indexes the 'title' and 'text' fields of your
	     * // documents:
	     * const miniSearch = new MiniSearch({ fields: ['title', 'text'] })
	     * ```
	     *
	     * ### ID Field:
	     *
	     * ```javascript
	     * // Your documents are assumed to include a unique 'id' field, but if you want
	     * // to use a different field for document identification, you can set the
	     * // 'idField' option:
	     * const miniSearch = new MiniSearch({ idField: 'key', fields: ['title', 'text'] })
	     * ```
	     *
	     * ### Options and defaults:
	     *
	     * ```javascript
	     * // The full set of options (here with their default value) is:
	     * const miniSearch = new MiniSearch({
	     *   // idField: field that uniquely identifies a document
	     *   idField: 'id',
	     *
	     *   // extractField: function used to get the value of a field in a document.
	     *   // By default, it assumes the document is a flat object with field names as
	     *   // property keys and field values as string property values, but custom logic
	     *   // can be implemented by setting this option to a custom extractor function.
	     *   extractField: (document, fieldName) => document[fieldName],
	     *
	     *   // tokenize: function used to split fields into individual terms. By
	     *   // default, it is also used to tokenize search queries, unless a specific
	     *   // `tokenize` search option is supplied. When tokenizing an indexed field,
	     *   // the field name is passed as the second argument.
	     *   tokenize: (string, _fieldName) => string.split(SPACE_OR_PUNCTUATION),
	     *
	     *   // processTerm: function used to process each tokenized term before
	     *   // indexing. It can be used for stemming and normalization. Return a falsy
	     *   // value in order to discard a term. By default, it is also used to process
	     *   // search queries, unless a specific `processTerm` option is supplied as a
	     *   // search option. When processing a term from a indexed field, the field
	     *   // name is passed as the second argument.
	     *   processTerm: (term, _fieldName) => term.toLowerCase(),
	     *
	     *   // searchOptions: default search options, see the `search` method for
	     *   // details
	     *   searchOptions: undefined,
	     *
	     *   // fields: document fields to be indexed. Mandatory, but not set by default
	     *   fields: undefined
	     *
	     *   // storeFields: document fields to be stored and returned as part of the
	     *   // search results.
	     *   storeFields: []
	     * })
	     * ```
	     */
	    function MiniSearch(options) {
	        if ((options === null || options === void 0 ? void 0 : options.fields) == null) {
	            throw new Error('MiniSearch: option "fields" must be provided');
	        }
	        this._options = __assign(__assign(__assign({}, defaultOptions), options), { searchOptions: __assign(__assign({}, defaultSearchOptions), (options.searchOptions || {})) });
	        this._index = new SearchableMap();
	        this._documentCount = 0;
	        this._documentIds = {};
	        this._fieldIds = {};
	        this._fieldLength = {};
	        this._averageFieldLength = {};
	        this._nextId = 0;
	        this._storedFields = {};
	        this.addFields(this._options.fields);
	    }
	    /**
	     * Adds a document to the index
	     *
	     * @param document  The document to be indexed
	     */
	    MiniSearch.prototype.add = function (document) {
	        var _this = this;
	        var _a = this._options, extractField = _a.extractField, tokenize = _a.tokenize, processTerm = _a.processTerm, fields = _a.fields, idField = _a.idField;
	        var id = extractField(document, idField);
	        if (id == null) {
	            throw new Error("MiniSearch: document does not have ID field \"" + idField + "\"");
	        }
	        var shortDocumentId = this.addDocumentId(id);
	        this.saveStoredFields(shortDocumentId, document);
	        fields.forEach(function (field) {
	            var fieldValue = extractField(document, field);
	            if (fieldValue == null) {
	                return;
	            }
	            var tokens = tokenize(fieldValue.toString(), field);
	            _this.addFieldLength(shortDocumentId, _this._fieldIds[field], _this.documentCount - 1, tokens.length);
	            tokens.forEach(function (term) {
	                var processedTerm = processTerm(term, field);
	                if (processedTerm) {
	                    _this.addTerm(_this._fieldIds[field], shortDocumentId, processedTerm);
	                }
	            });
	        });
	    };
	    /**
	     * Adds all the given documents to the index
	     *
	     * @param documents  An array of documents to be indexed
	     */
	    MiniSearch.prototype.addAll = function (documents) {
	        var _this = this;
	        documents.forEach(function (document) { return _this.add(document); });
	    };
	    /**
	     * Adds all the given documents to the index asynchronously.
	     *
	     * Returns a promise that resolves (to `undefined`) when the indexing is done.
	     * This method is useful when index many documents, to avoid blocking the main
	     * thread. The indexing is performed asynchronously and in chunks.
	     *
	     * @param documents  An array of documents to be indexed
	     * @param options  Configuration options
	     * @return A promise resolving to `undefined` when the indexing is done
	     */
	    MiniSearch.prototype.addAllAsync = function (documents, options) {
	        var _this = this;
	        if (options === void 0) { options = {}; }
	        var _a = options.chunkSize, chunkSize = _a === void 0 ? 10 : _a;
	        var acc = { chunk: [], promise: Promise.resolve() };
	        var _b = documents.reduce(function (_a, document, i) {
	            var chunk = _a.chunk, promise = _a.promise;
	            chunk.push(document);
	            if ((i + 1) % chunkSize === 0) {
	                return {
	                    chunk: [],
	                    promise: promise
	                        .then(function () { return new Promise(function (resolve) { return setTimeout(resolve, 0); }); })
	                        .then(function () { return _this.addAll(chunk); })
	                };
	            }
	            else {
	                return { chunk: chunk, promise: promise };
	            }
	        }, acc), chunk = _b.chunk, promise = _b.promise;
	        return promise.then(function () { return _this.addAll(chunk); });
	    };
	    /**
	     * Removes the given document from the index.
	     *
	     * The document to delete must NOT have changed between indexing and deletion,
	     * otherwise the index will be corrupted. Therefore, when reindexing a document
	     * after a change, the correct order of operations is:
	     *
	     *   1. remove old version
	     *   2. apply changes
	     *   3. index new version
	     *
	     * @param document  The document to be removed
	     */
	    MiniSearch.prototype.remove = function (document) {
	        var _this = this;
	        var _a = this._options, tokenize = _a.tokenize, processTerm = _a.processTerm, extractField = _a.extractField, fields = _a.fields, idField = _a.idField;
	        var id = extractField(document, idField);
	        if (id == null) {
	            throw new Error("MiniSearch: document does not have ID field \"" + idField + "\"");
	        }
	        var _b = __read(Object.entries(this._documentIds)
	            .find(function (_a) {
	            var _b = __read(_a, 2); _b[0]; var longId = _b[1];
	            return id === longId;
	        }) || [], 1), shortDocumentId = _b[0];
	        if (shortDocumentId == null) {
	            throw new Error("MiniSearch: cannot remove document with ID " + id + ": it is not in the index");
	        }
	        fields.forEach(function (field) {
	            var fieldValue = extractField(document, field);
	            if (fieldValue == null) {
	                return;
	            }
	            var tokens = tokenize(fieldValue.toString(), field);
	            tokens.forEach(function (term) {
	                var processedTerm = processTerm(term, field);
	                if (processedTerm) {
	                    _this.removeTerm(_this._fieldIds[field], shortDocumentId, processedTerm);
	                }
	            });
	        });
	        delete this._storedFields[shortDocumentId];
	        delete this._documentIds[shortDocumentId];
	        this._documentCount -= 1;
	    };
	    /**
	     * Removes all the given documents from the index. If called with no arguments,
	     * it removes _all_ documents from the index.
	     *
	     * @param documents  The documents to be removed. If this argument is omitted,
	     * all documents are removed. Note that, for removing all documents, it is
	     * more efficient to call this method with no arguments than to pass all
	     * documents.
	     */
	    MiniSearch.prototype.removeAll = function (documents) {
	        var _this = this;
	        if (documents) {
	            documents.forEach(function (document) { return _this.remove(document); });
	        }
	        else if (arguments.length > 0) {
	            throw new Error('Expected documents to be present. Omit the argument to remove all documents.');
	        }
	        else {
	            this._index = new SearchableMap();
	            this._documentCount = 0;
	            this._documentIds = {};
	            this._fieldLength = {};
	            this._averageFieldLength = {};
	            this._storedFields = {};
	            this._nextId = 0;
	        }
	    };
	    /**
	     * Search for documents matching the given search query.
	     *
	     * The result is a list of scored document IDs matching the query, sorted by
	     * descending score, and each including data about which terms were matched and
	     * in which fields.
	     *
	     * ### Basic usage:
	     *
	     * ```javascript
	     * // Search for "zen art motorcycle" with default options: terms have to match
	     * // exactly, and individual terms are joined with OR
	     * miniSearch.search('zen art motorcycle')
	     * // => [ { id: 2, score: 2.77258, match: { ... } }, { id: 4, score: 1.38629, match: { ... } } ]
	     * ```
	     *
	     * ### Restrict search to specific fields:
	     *
	     * ```javascript
	     * // Search only in the 'title' field
	     * miniSearch.search('zen', { fields: ['title'] })
	     * ```
	     *
	     * ### Field boosting:
	     *
	     * ```javascript
	     * // Boost a field
	     * miniSearch.search('zen', { boost: { title: 2 } })
	     * ```
	     *
	     * ### Prefix search:
	     *
	     * ```javascript
	     * // Search for "moto" with prefix search (it will match documents
	     * // containing terms that start with "moto" or "neuro")
	     * miniSearch.search('moto neuro', { prefix: true })
	     * ```
	     *
	     * ### Fuzzy search:
	     *
	     * ```javascript
	     * // Search for "ismael" with fuzzy search (it will match documents containing
	     * // terms similar to "ismael", with a maximum edit distance of 0.2 term.length
	     * // (rounded to nearest integer)
	     * miniSearch.search('ismael', { fuzzy: 0.2 })
	     * ```
	     *
	     * ### Combining strategies:
	     *
	     * ```javascript
	     * // Mix of exact match, prefix search, and fuzzy search
	     * miniSearch.search('ismael mob', {
	     *  prefix: true,
	     *  fuzzy: 0.2
	     * })
	     * ```
	     *
	     * ### Advanced prefix and fuzzy search:
	     *
	     * ```javascript
	     * // Perform fuzzy and prefix search depending on the search term. Here
	     * // performing prefix and fuzzy search only on terms longer than 3 characters
	     * miniSearch.search('ismael mob', {
	     *  prefix: term => term.length > 3
	     *  fuzzy: term => term.length > 3 ? 0.2 : null
	     * })
	     * ```
	     *
	     * ### Combine with AND:
	     *
	     * ```javascript
	     * // Combine search terms with AND (to match only documents that contain both
	     * // "motorcycle" and "art")
	     * miniSearch.search('motorcycle art', { combineWith: 'AND' })
	     * ```
	     *
	     * ### Filtering results:
	     *
	     * ```javascript
	     * // Filter only results in the 'fiction' category (assuming that 'category'
	     * // is a stored field)
	     * miniSearch.search('motorcycle art', {
	     *   filter: (result) => result.category === 'fiction'
	     * })
	     * ```
	     *
	     * @param queryString  Query string to search for
	     * @param options  Search options. Each option, if not given, defaults to the corresponding value of `searchOptions` given to the constructor, or to the library default.
	     */
	    MiniSearch.prototype.search = function (queryString, searchOptions) {
	        var _this = this;
	        if (searchOptions === void 0) { searchOptions = {}; }
	        var _a = this._options, tokenize = _a.tokenize, processTerm = _a.processTerm, globalSearchOptions = _a.searchOptions;
	        var options = __assign(__assign({ tokenize: tokenize, processTerm: processTerm }, globalSearchOptions), searchOptions);
	        var searchTokenize = options.tokenize, searchProcessTerm = options.processTerm;
	        var terms = searchTokenize(queryString)
	            .map(function (term) { return searchProcessTerm(term); })
	            .filter(function (term) { return !!term; });
	        var queries = terms.map(termToQuery(options));
	        var results = queries.map(function (query) { return _this.executeQuery(query, options); });
	        var combinedResults = this.combineResults(results, options.combineWith);
	        return Object.entries(combinedResults)
	            .reduce(function (results, _a) {
	            var _b = __read(_a, 2), docId = _b[0], _c = _b[1], score = _c.score, match = _c.match, terms = _c.terms;
	            var result = {
	                id: _this._documentIds[docId],
	                terms: uniq(terms),
	                score: score,
	                match: match
	            };
	            Object.assign(result, _this._storedFields[docId]);
	            if (options.filter == null || options.filter(result)) {
	                results.push(result);
	            }
	            return results;
	        }, [])
	            .sort(function (_a, _b) {
	            var a = _a.score;
	            var b = _b.score;
	            return a < b ? 1 : -1;
	        });
	    };
	    /**
	     * Provide suggestions for the given search query
	     *
	     * The result is a list of suggested modified search queries, derived from the
	     * given search query, each with a relevance score, sorted by descending score.
	     *
	     * ### Basic usage:
	     *
	     * ```javascript
	     * // Get suggestions for 'neuro':
	     * miniSearch.autoSuggest('neuro')
	     * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 0.46240 } ]
	     * ```
	     *
	     * ### Multiple words:
	     *
	     * ```javascript
	     * // Get suggestions for 'zen ar':
	     * miniSearch.autoSuggest('zen ar')
	     * // => [
	     * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
	     * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
	     * // ]
	     * ```
	     *
	     * ### Fuzzy suggestions:
	     *
	     * ```javascript
	     * // Correct spelling mistakes using fuzzy search:
	     * miniSearch.autoSuggest('neromancer', { fuzzy: 0.2 })
	     * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 1.03998 } ]
	     * ```
	     *
	     * ### Filtering:
	     *
	     * ```javascript
	     * // Get suggestions for 'zen ar', but only within the 'fiction' category
	     * // (assuming that 'category' is a stored field):
	     * miniSearch.autoSuggest('zen ar', {
	     *   filter: (result) => result.category === 'fiction'
	     * })
	     * // => [
	     * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
	     * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
	     * // ]
	     * ```
	     *
	     * @param queryString  Query string to be expanded into suggestions
	     * @param options  Search options. The supported options and default values
	     * are the same as for the `search` method, except that by default prefix
	     * search is performed on the last term in the query.
	     * @return  A sorted array of suggestions sorted by relevance score.
	     */
	    MiniSearch.prototype.autoSuggest = function (queryString, options) {
	        if (options === void 0) { options = {}; }
	        options = __assign(__assign({}, defaultAutoSuggestOptions), options);
	        var suggestions = this.search(queryString, options).reduce(function (suggestions, _a) {
	            var score = _a.score, terms = _a.terms;
	            var phrase = terms.join(' ');
	            if (suggestions[phrase] == null) {
	                suggestions[phrase] = { score: score, terms: terms, count: 1 };
	            }
	            else {
	                suggestions[phrase].score += score;
	                suggestions[phrase].count += 1;
	            }
	            return suggestions;
	        }, {});
	        return Object.entries(suggestions)
	            .map(function (_a) {
	            var _b = __read(_a, 2), suggestion = _b[0], _c = _b[1], score = _c.score, terms = _c.terms, count = _c.count;
	            return ({ suggestion: suggestion, terms: terms, score: score / count });
	        })
	            .sort(function (_a, _b) {
	            var a = _a.score;
	            var b = _b.score;
	            return a < b ? 1 : -1;
	        });
	    };
	    Object.defineProperty(MiniSearch.prototype, "documentCount", {
	        /**
	         * Number of documents in the index
	         */
	        get: function () {
	            return this._documentCount;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    /**
	     * Deserializes a JSON index (serialized with `miniSearch.toJSON()`) and
	     * instantiates a MiniSearch instance. It should be given the same options
	     * originally used when serializing the index.
	     *
	     * ### Usage:
	     *
	     * ```javascript
	     * // If the index was serialized with:
	     * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
	     * miniSearch.addAll(documents)
	     *
	     * const json = JSON.stringify(miniSearch)
	     * // It can later be deserialized like this:
	     * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
	     * ```
	     *
	     * @param json  JSON-serialized index
	     * @param options  configuration options, same as the constructor
	     * @return An instance of MiniSearch deserialized from the given JSON.
	     */
	    MiniSearch.loadJSON = function (json, options) {
	        if (options == null) {
	            throw new Error('MiniSearch: loadJSON should be given the same options used when serializing the index');
	        }
	        return MiniSearch.loadJS(JSON.parse(json), options);
	    };
	    /**
	     * Returns the default value of an option. It will throw an error if no option
	     * with the given name exists.
	     *
	     * @param optionName  Name of the option
	     * @return The default value of the given option
	     *
	     * ### Usage:
	     *
	     * ```javascript
	     * // Get default tokenizer
	     * MiniSearch.getDefault('tokenize')
	     *
	     * // Get default term processor
	     * MiniSearch.getDefault('processTerm')
	     *
	     * // Unknown options will throw an error
	     * MiniSearch.getDefault('notExisting')
	     * // => throws 'MiniSearch: unknown option "notExisting"'
	     * ```
	     */
	    MiniSearch.getDefault = function (optionName) {
	        if (defaultOptions.hasOwnProperty(optionName)) {
	            return getOwnProperty(defaultOptions, optionName);
	        }
	        else {
	            throw new Error("MiniSearch: unknown option \"" + optionName + "\"");
	        }
	    };
	    /**
	     * @ignore
	     */
	    MiniSearch.loadJS = function (js, options) {
	        var index = js.index, documentCount = js.documentCount, nextId = js.nextId, documentIds = js.documentIds, fieldIds = js.fieldIds, fieldLength = js.fieldLength, averageFieldLength = js.averageFieldLength, storedFields = js.storedFields;
	        var miniSearch = new MiniSearch(options);
	        miniSearch._index = new SearchableMap(index._tree, index._prefix);
	        miniSearch._documentCount = documentCount;
	        miniSearch._nextId = nextId;
	        miniSearch._documentIds = documentIds;
	        miniSearch._fieldIds = fieldIds;
	        miniSearch._fieldLength = fieldLength;
	        miniSearch._averageFieldLength = averageFieldLength;
	        miniSearch._fieldIds = fieldIds;
	        miniSearch._storedFields = storedFields || {};
	        return miniSearch;
	    };
	    /**
	     * @ignore
	     */
	    MiniSearch.prototype.executeQuery = function (query, searchOptions) {
	        var _this = this;
	        var options = __assign(__assign({}, this._options.searchOptions), searchOptions);
	        var boosts = (options.fields || this._options.fields).reduce(function (boosts, field) {
	            var _a;
	            return (__assign(__assign({}, boosts), (_a = {}, _a[field] = getOwnProperty(boosts, field) || 1, _a)));
	        }, options.boost || {});
	        var boostDocument = options.boostDocument, weights = options.weights;
	        var _a = __assign(__assign({}, defaultSearchOptions.weights), weights), fuzzyWeight = _a.fuzzy, prefixWeight = _a.prefix;
	        var exactMatch = this.termResults(query.term, boosts, boostDocument, this._index.get(query.term));
	        if (!query.fuzzy && !query.prefix) {
	            return exactMatch;
	        }
	        var results = [exactMatch];
	        if (query.prefix) {
	            this._index.atPrefix(query.term).forEach(function (term, data) {
	                var weightedDistance = (0.3 * (term.length - query.term.length)) / term.length;
	                results.push(_this.termResults(term, boosts, boostDocument, data, prefixWeight, weightedDistance));
	            });
	        }
	        if (query.fuzzy) {
	            var fuzzy = (query.fuzzy === true) ? 0.2 : query.fuzzy;
	            var maxDistance = fuzzy < 1 ? Math.round(query.term.length * fuzzy) : fuzzy;
	            Object.entries(this._index.fuzzyGet(query.term, maxDistance)).forEach(function (_a) {
	                var _b = __read(_a, 2), term = _b[0], _c = __read(_b[1], 2), data = _c[0], distance = _c[1];
	                var weightedDistance = distance / term.length;
	                results.push(_this.termResults(term, boosts, boostDocument, data, fuzzyWeight, weightedDistance));
	            });
	        }
	        return results.reduce(combinators[OR], {});
	    };
	    /**
	     * @ignore
	     */
	    MiniSearch.prototype.combineResults = function (results, combineWith) {
	        if (combineWith === void 0) { combineWith = OR; }
	        if (results.length === 0) {
	            return {};
	        }
	        var operator = combineWith.toLowerCase();
	        return results.reduce(combinators[operator], null) || {};
	    };
	    /**
	     * Allows serialization of the index to JSON, to possibly store it and later
	     * deserialize it with `MiniSearch.loadJSON`.
	     *
	     * Normally one does not directly call this method, but rather call the
	     * standard JavaScript `JSON.stringify()` passing the `MiniSearch` instance,
	     * and JavaScript will internally call this method. Upon deserialization, one
	     * must pass to `loadJSON` the same options used to create the original
	     * instance that was serialized.
	     *
	     * ### Usage:
	     *
	     * ```javascript
	     * // Serialize the index:
	     * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
	     * miniSearch.addAll(documents)
	     * const json = JSON.stringify(miniSearch)
	     *
	     * // Later, to deserialize it:
	     * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
	     * ```
	     *
	     * @return A plain-object serializeable representation of the search index.
	     */
	    MiniSearch.prototype.toJSON = function () {
	        return {
	            index: this._index,
	            documentCount: this._documentCount,
	            nextId: this._nextId,
	            documentIds: this._documentIds,
	            fieldIds: this._fieldIds,
	            fieldLength: this._fieldLength,
	            averageFieldLength: this._averageFieldLength,
	            storedFields: this._storedFields
	        };
	    };
	    /**
	     * @ignore
	     */
	    MiniSearch.prototype.termResults = function (term, boosts, boostDocument, indexData, weight, editDistance) {
	        var _this = this;
	        if (editDistance === void 0) { editDistance = 0; }
	        if (indexData == null) {
	            return {};
	        }
	        return Object.entries(boosts).reduce(function (results, _a) {
	            var _b = __read(_a, 2), field = _b[0], boost = _b[1];
	            var fieldId = _this._fieldIds[field];
	            var _c = indexData[fieldId] || { ds: {} }, df = _c.df, ds = _c.ds;
	            Object.entries(ds).forEach(function (_a) {
	                var _b = __read(_a, 2), documentId = _b[0], tf = _b[1];
	                var docBoost = boostDocument ? boostDocument(_this._documentIds[documentId], term) : 1;
	                if (!docBoost) {
	                    return;
	                }
	                var normalizedLength = _this._fieldLength[documentId][fieldId] / _this._averageFieldLength[fieldId];
	                results[documentId] = results[documentId] || { score: 0, match: {}, terms: [] };
	                results[documentId].terms.push(term);
	                results[documentId].match[term] = getOwnProperty(results[documentId].match, term) || [];
	                results[documentId].score += docBoost * score(tf, df, _this._documentCount, normalizedLength, boost, editDistance);
	                results[documentId].match[term].push(field);
	            });
	            return results;
	        }, {});
	    };
	    /**
	     * @ignore
	     */
	    MiniSearch.prototype.addTerm = function (fieldId, documentId, term) {
	        this._index.update(term, function (indexData) {
	            var _a;
	            indexData = indexData || {};
	            var fieldIndex = indexData[fieldId] || { df: 0, ds: {} };
	            if (fieldIndex.ds[documentId] == null) {
	                fieldIndex.df += 1;
	            }
	            fieldIndex.ds[documentId] = (fieldIndex.ds[documentId] || 0) + 1;
	            return __assign(__assign({}, indexData), (_a = {}, _a[fieldId] = fieldIndex, _a));
	        });
	    };
	    /**
	     * @ignore
	     */
	    MiniSearch.prototype.removeTerm = function (fieldId, documentId, term) {
	        var _this = this;
	        if (!this._index.has(term)) {
	            this.warnDocumentChanged(documentId, fieldId, term);
	            return;
	        }
	        this._index.update(term, function (indexData) {
	            var _a;
	            var fieldIndex = indexData[fieldId];
	            if (fieldIndex == null || fieldIndex.ds[documentId] == null) {
	                _this.warnDocumentChanged(documentId, fieldId, term);
	                return indexData;
	            }
	            if (fieldIndex.ds[documentId] <= 1) {
	                if (fieldIndex.df <= 1) {
	                    delete indexData[fieldId];
	                    return indexData;
	                }
	                fieldIndex.df -= 1;
	            }
	            if (fieldIndex.ds[documentId] <= 1) {
	                delete fieldIndex.ds[documentId];
	                return indexData;
	            }
	            fieldIndex.ds[documentId] -= 1;
	            return __assign(__assign({}, indexData), (_a = {}, _a[fieldId] = fieldIndex, _a));
	        });
	        if (Object.keys(this._index.get(term)).length === 0) {
	            this._index.delete(term);
	        }
	    };
	    /**
	     * @ignore
	     */
	    MiniSearch.prototype.warnDocumentChanged = function (shortDocumentId, fieldId, term) {
	        if (console == null || console.warn == null) {
	            return;
	        }
	        var fieldName = Object.entries(this._fieldIds).find(function (_a) {
	            var _b = __read(_a, 2); _b[0]; var id = _b[1];
	            return id === fieldId;
	        })[0];
	        console.warn("MiniSearch: document with ID " + this._documentIds[shortDocumentId] + " has changed before removal: term \"" + term + "\" was not present in field \"" + fieldName + "\". Removing a document after it has changed can corrupt the index!");
	    };
	    /**
	     * @ignore
	     */
	    MiniSearch.prototype.addDocumentId = function (documentId) {
	        var shortDocumentId = this._nextId.toString(36);
	        this._documentIds[shortDocumentId] = documentId;
	        this._documentCount += 1;
	        this._nextId += 1;
	        return shortDocumentId;
	    };
	    /**
	     * @ignore
	     */
	    MiniSearch.prototype.addFields = function (fields) {
	        var _this = this;
	        fields.forEach(function (field, i) { _this._fieldIds[field] = i; });
	    };
	    /**
	     * @ignore
	     */
	    MiniSearch.prototype.addFieldLength = function (documentId, fieldId, count, length) {
	        this._averageFieldLength[fieldId] = this._averageFieldLength[fieldId] || 0;
	        var totalLength = (this._averageFieldLength[fieldId] * count) + length;
	        this._fieldLength[documentId] = this._fieldLength[documentId] || {};
	        this._fieldLength[documentId][fieldId] = length;
	        this._averageFieldLength[fieldId] = totalLength / (count + 1);
	    };
	    /**
	     * @ignore
	     */
	    MiniSearch.prototype.saveStoredFields = function (documentId, doc) {
	        var _this = this;
	        var _a = this._options, storeFields = _a.storeFields, extractField = _a.extractField;
	        if (storeFields == null || storeFields.length === 0) {
	            return;
	        }
	        this._storedFields[documentId] = this._storedFields[documentId] || {};
	        storeFields.forEach(function (fieldName) {
	            var fieldValue = extractField(doc, fieldName);
	            if (fieldValue === undefined) {
	                return;
	            }
	            _this._storedFields[documentId][fieldName] = fieldValue;
	        });
	    };
	    return MiniSearch;
	}());
	var getOwnProperty = function (object, property) {
	    return Object.prototype.hasOwnProperty.call(object, property) ? object[property] : undefined;
	};
	var combinators = (_a = {},
	    _a[OR] = function (a, b) {
	        return Object.entries(b).reduce(function (combined, _a) {
	            var _b;
	            var _c = __read(_a, 2), documentId = _c[0], _d = _c[1], score = _d.score, match = _d.match, terms = _d.terms;
	            if (combined[documentId] == null) {
	                combined[documentId] = { score: score, match: match, terms: terms };
	            }
	            else {
	                combined[documentId].score += score;
	                combined[documentId].score *= 1.5;
	                (_b = combined[documentId].terms).push.apply(_b, __spread(terms));
	                Object.assign(combined[documentId].match, match);
	            }
	            return combined;
	        }, a || {});
	    },
	    _a[AND] = function (a, b) {
	        if (a == null) {
	            return b;
	        }
	        return Object.entries(b).reduce(function (combined, _a) {
	            var _b = __read(_a, 2), documentId = _b[0], _c = _b[1], score = _c.score, match = _c.match, terms = _c.terms;
	            if (a[documentId] === undefined) {
	                return combined;
	            }
	            combined[documentId] = combined[documentId] || {};
	            combined[documentId].score = a[documentId].score + score;
	            combined[documentId].match = __assign(__assign({}, a[documentId].match), match);
	            combined[documentId].terms = __spread(a[documentId].terms, terms);
	            return combined;
	        }, {});
	    },
	    _a);
	var tfIdf = function (tf, df, n) { return tf * Math.log(n / df); };
	var score = function (termFrequency, documentFrequency, documentCount, normalizedLength, boost, editDistance) {
	    var weight = boost / (1 + (0.333 * boost * editDistance));
	    return weight * tfIdf(termFrequency, documentFrequency, documentCount) / normalizedLength;
	};
	var termToQuery = function (options) { return function (term, i, terms) {
	    var fuzzy = (typeof options.fuzzy === 'function')
	        ? options.fuzzy(term, i, terms)
	        : (options.fuzzy || false);
	    var prefix = (typeof options.prefix === 'function')
	        ? options.prefix(term, i, terms)
	        : (options.prefix === true);
	    return { term: term, fuzzy: fuzzy, prefix: prefix };
	}; };
	var uniq = function (array) {
	    return array.filter(function (element, i, array) { return array.indexOf(element) === i; });
	};
	var defaultOptions = {
	    idField: 'id',
	    extractField: function (document, fieldName) { return document[fieldName]; },
	    tokenize: function (text, fieldName) { return text.split(SPACE_OR_PUNCTUATION); },
	    processTerm: function (term, fieldName) { return term.toLowerCase(); },
	    fields: undefined,
	    searchOptions: undefined,
	    storeFields: []
	};
	var defaultSearchOptions = {
	    combineWith: OR,
	    prefix: false,
	    fuzzy: false,
	    boost: {},
	    weights: { fuzzy: 0.9, prefix: 0.75 }
	};
	var defaultAutoSuggestOptions = {
	    prefix: function (term, i, terms) {
	        return i === terms.length - 1;
	    }
	};
	// This regular expression matches any Unicode space or punctuation character
	// Adapted from https://unicode.org/cldr/utility/list-unicodeset.jsp?a=%5Cp%7BZ%7D%5Cp%7BP%7D&abb=on&c=on&esc=on
	var SPACE_OR_PUNCTUATION = /[\n\r -#%-*,-/:;?@[-\]_{}\u00A0\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u1680\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2000-\u200A\u2010-\u2029\u202F-\u2043\u2045-\u2051\u2053-\u205F\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u3000-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]+/u;

	class GeocoderSuggestion {
	    constructor(name) {
	        this.name = name;
	    }
	}

	class Geocoder {
	    constructor(mapData) {
	        this.search = (async () => {
	            return new MiniSearch({
	                idField: "getName",
	                fields: [
	                    "getName",
	                    "getAlternateNames",
	                    "getDescription",
	                    "getTags",
	                ],
	                storeFields: ["getName"],
	                // Call the function instead of getting the value of a field
	                extractField: (definition, fieldName) => 
	                // This function is only called with our known-to-be-valid input
	                // eslint-disable-next-line security/detect-object-injection
	                definition[fieldName](),
	                searchOptions: {
	                    prefix: true,
	                    boost: {
	                        name: 2,
	                    },
	                },
	            });
	        })();
	        this.definitionsByName = new Map();
	        this.definitionsByAltName = new Map();
	        this.definitionsByLocation = new Map();
	        this.allNames = new Set();
	        this.roomCenterIndices = new Map();
	        mapData.getAllRooms().forEach((room) => this.addDefinition(room));
	    }
	    /**
	     * Adds a definition to the geocoder. Overrides any other definition with the same name, if already added to the
	     * geocoder. Returns the definition it replaced, if any.
	     */
	    async addDefinition(definition) {
	        // Deal with the existing definition if it exists
	        const existing = lib.fromMap(this.definitionsByName, definition.getName()).map((existing) => {
	            this.removeDefinition(existing);
	            return existing;
	        });
	        this.definitionsByName.set(definition.getName(), definition);
	        definition
	            .getAlternateNames()
	            .forEach((altName) => this.definitionsByAltName.set(altName, definition));
	        this.definitionsByLocation.set(definition.getLocation(), definition);
	        this.allNames.add(definition.getName());
	        (await this.search).add(definition);
	        const floor = definition.getLocation().getFloor();
	        this.updateTree(floor, (tree) => {
	            tree.insert(definitionToKDTreeEntry(definition));
	            return tree;
	        });
	        return existing;
	    }
	    async removeDefinition(definition) {
	        this.definitionsByName.delete(definition.getName());
	        const newDefinitionsByAltName = [...this.definitionsByAltName].filter(([checkingName, checkingDefinition]) => {
	            return (!definition.getAlternateNames().includes(checkingName) &&
	                definition !== checkingDefinition);
	        });
	        this.definitionsByAltName.clear();
	        for (const [name, definition] of newDefinitionsByAltName) {
	            this.definitionsByAltName.set(name, definition);
	        }
	        this.definitionsByLocation.delete(definition.getLocation());
	        this.allNames.delete(definition.getName());
	        (await this.search).remove(definition);
	        this.updateTree(definition.getLocation().getFloor(), (tree) => {
	            tree.remove(definitionToKDTreeEntry(definition));
	            return tree;
	        });
	    }
	    async getSuggestionsFrom(query) {
	        return ((await this.search)
	            .search(query)
	            // .getName here is a field, not a method, so named because of how minisearch works
	            .map((searchResult) => new GeocoderSuggestion(searchResult.getName)));
	    }
	    getDefinitionFromName(name) {
	        return lib.fromMap(this.definitionsByName, name).or(lib.fromMap(this.definitionsByAltName, name));
	    }
	    updateTree(floor, f) {
	        const tree = lib.fromMap(this.roomCenterIndices, floor).unwrapOr(new kdTreeMin.kdTree([], distanceBetween, ["x", "y"]));
	        this.roomCenterIndices.set(floor, f(tree));
	    }
	    /**
	     * Gets the definition closest to `location` on the same floor. Uses Euclidean distance.
	     */
	    getClosestDefinition(location) {
	        const tree = lib.fromMap(this.roomCenterIndices, location.getFloor()).unwrap();
	        const [closest] = tree.nearest(locationToKDTreeEntry(location), 1);
	        return closest[0].definition;
	    }
	    /**
	     * Gets the definition closest to `origin` based on the provided `distance` function. That function should return
	     * the distance between two definitions if possible, or None if not. None is interpreted as meaning there is no way
	     * to go between the two definitions. Only looks at definitions satisfying the predicate.
	     */
	    getClosestDefinitionToFilteredWithDistance(origin, predicate, distance) {
	        return [...this.definitionsByLocation.entries()]
	            .filter(([_location, definition]) => predicate(definition))
	            .map(([location, definition]) => t(distance(origin, location), definition))
	            .filter(([distance, _definition]) => distance.isSome())
	            .map(([distance, definition]) => t(distance.unwrap(), definition))
	            .reduce((min, curr) => {
	            return min.isNone() || curr[0] < min.unwrap()[0]
	                ? lib.Some(curr)
	                : min;
	        }, lib.None)
	            .map(([_distance, definition]) => definition);
	    }
	}
	Geocoder.inject = ["mapData"];
	function definitionToKDTreeEntry(definition) {
	    const location = definition.getLocation().getXY();
	    return {
	        x: location.lng,
	        y: location.lat,
	        definition: lib.Some(definition),
	    };
	}
	function locationToKDTreeEntry(location) {
	    const xy = location.getXY();
	    return {
	        x: xy.lng,
	        y: xy.lat,
	        definition: lib.None,
	    };
	}
	function distanceBetween(a, b) {
	    const dx = b.x - a.x;
	    const dy = b.y - a.y;
	    return Math.sqrt(dx * dx + dy * dy);
	}

	/**
	 * Stores a reference to the element creator. Ideally it would be injected into a JSX class, which would then construct
	 * elements, but TS does not appear to support this.
	 */
	class JSXHelper {
	}
	/**
	 * Give JSX the element creator to use. This must be called before using JSX tags.
	 * @param elementCreator Element creator for the JSX to use
	 */
	function injectElementCreator(elementCreator) {
	    JSXHelper.elementCreator = elementCreator;
	}
	/**
	 * Used by TS to turn JSX tags into HTML elements. Should be imported everywhere JSX is used, but does not need to be
	 * called manually.
	 */
	function h(tag, props, ...children) {
	    if (props !== null) {
	        // JSX doesn't like the `class` attribute and prefers `className`, but `ElementCreators` like using the correct
	        // attribute names
	        props = Object.fromEntries(Object.entries(props).map(([key, value]) => [
	            key === "className" ? "class" : key,
	            value,
	        ]));
	    }
	    return JSXHelper.elementCreator.create(tag, props, children);
	}

	/** Control used to choose the current floor to view */
	class FloorsControl extends leafletSrc.Control {
	    constructor(floors, defaultFloor, setFloor, options) {
	        super(options);
	        [this.controlElement, this.floorControls] = FloorsControl.createElement(floors, defaultFloor, setFloor);
	    }
	    initialize(options) {
	        leafletSrc.Util.setOptions(this, options);
	    }
	    onAdd(_map) {
	        return this.controlElement;
	    }
	    /**
	     * Set the styling of the control to reflect a new floor being set
	     */
	    setFloor(oldFloorNumber, newFloorNumber) {
	        lib.fromMap(this.floorControls, oldFloorNumber).ifSome((oldControl) => FloorsControl.deselectControl(oldControl));
	        lib.fromMap(this.floorControls, newFloorNumber).ifSome((newControl) => FloorsControl.selectControl(newControl));
	    }
	    /**
	     * Create the HTML element representing the control
	     * @returns `[controlElement, floorControls]`
	     * `controlElement` is the HTML element representing the control. `floorControls` is a mapping from room number to the
	     * part of `controlElement` that changes when the floor changes.
	     */
	    static createElement(floors, defaultFloor, setFloor) {
	        const controls = floors.map((floor) => h("a", { href: "#" }, floor));
	        zip(floors, controls)
	            .filter(([floor, _control]) => floor === defaultFloor)
	            .map(([_floor, control]) => FloorsControl.selectControl(control));
	        const callbacks = zip(floors, controls).map(([floor, control]) => () => {
	            setFloor(floor);
	            controls.forEach((otherControl) => FloorsControl.deselectControl(otherControl));
	            FloorsControl.selectControl(control);
	        });
	        zip(controls, callbacks).forEach(([control, callback]) => control.addEventListener("click", callback));
	        const floorControls = new Map(zip(floors, controls));
	        const base = (h("div", { className: "leaflet-bar leaflet-control leaflet-control-floors" }));
	        controls.forEach((control) => base.appendChild(control));
	        leafletSrc.DomEvent.disableClickPropagation(base);
	        leafletSrc.DomEvent.disableScrollPropagation(base);
	        return [base, floorControls];
	    }
	    static selectControl(control) {
	        control.classList.add("selected");
	    }
	    static deselectControl(control) {
	        control.classList.remove("selected");
	    }
	}

	function floorsFactoryFactory(defaultFloorNumber, options) {
	    const factory = (map) => {
	        return LFloors.new(map, defaultFloorNumber, options);
	    };
	    factory.inject = ["mapData"];
	    return factory;
	}
	class LFloors extends leafletSrc.LayerGroup {
	    constructor(options, allFloors, defaultFloorNumber, currentFloor, currentFloorNumber, additions) {
	        super([], options);
	        super.addLayer(currentFloor);
	        this.control = new FloorsControl([...allFloors.keys()], defaultFloorNumber, (floor) => {
	            this.setFloor(floor);
	        }, { position: "bottomleft" });
	        this.allFloors = allFloors;
	        this.currentFloor = currentFloor;
	        this.currentFloorNumber = currentFloorNumber;
	        this.additions = additions;
	    }
	    /**
	     * Creates a new layer that allows for switching between floors of a building.
	     * @param map The map data object for the map
	     * @param defaultFloorNumber The number of the floor to start on
	     * @param options Any extra Leaflet layer options
	     */
	    static new(map, defaultFloorNumber, options) {
	        const allFloorData = map
	            .getAllFloors()
	            // Reversing the array means that floors are ordered intuitively in the JSON (1, 2, 3...) and intuitively in
	            // the control (higher floors on top)
	            .reverse();
	        const floorImages = allFloorData
	            .map((floorData) => leafletSrc.imageOverlay(floorData.image, map.getBounds(), {
	            pane: "tilePane",
	        }))
	            .map((image) => leafletSrc.layerGroup([image]));
	        const floorNumbers = allFloorData.map((floorData) => floorData.number);
	        const allFloors = new Map(zip(floorNumbers, floorImages));
	        const resCurrentFloor = lib.fromMap(allFloors, defaultFloorNumber).match({
	            some: (floor) => lib.Ok(floor),
	            none: lib.Err(`could not find floor ${defaultFloorNumber}`),
	        });
	        if (resCurrentFloor.isErr()) {
	            return lib.Err(resCurrentFloor.unwrapErr());
	        }
	        const currentFloor = resCurrentFloor.unwrap();
	        return lib.Ok(new LFloors(options, allFloors, defaultFloorNumber, currentFloor, defaultFloorNumber, new Map()));
	    }
	    /** Get the floor number for all floors */
	    getFloors() {
	        return this.allFloors.keys();
	    }
	    /**
	     * Make Leaflet start rendering `floor` on the map
	     * @param floor Floor to start rendering
	     * @param floorNumber Number of the floor to render
	     */
	    startDrawingFloor(floor, floorNumber) {
	        super.addLayer(floor);
	        lib.fromMap(this.additions, floorNumber).ifSome((additions) => {
	            additions.forEach((addition) => floor.addLayer(addition));
	        });
	    }
	    /**
	     * Make Leaflet stop rendering `floor` on the map
	     * @param floor Floor to stop rendering
	     * @param floorNumber Number of the floor to stop rendering
	     */
	    stopDrawingFloor(floor, floorNumber) {
	        lib.fromMap(this.additions, floorNumber).ifSome((additions) => {
	            additions.forEach((addition) => floor.removeLayer(addition));
	        });
	        super.removeLayer(floor);
	    }
	    /**
	     * Switch the currently rendered floor to `floor`. Has no effect if `floor` is already the currently rendered floor.
	     * @param floor Floor to switch to
	     */
	    setFloor(floor) {
	        lib.fromMap(this.allFloors, floor).ifSome((newFloor) => {
	            if (newFloor !== this.currentFloor) {
	                this.control.setFloor(this.currentFloorNumber, floor);
	                this.stopDrawingFloor(this.currentFloor, this.currentFloorNumber);
	                this.currentFloor = newFloor;
	                this.currentFloorNumber = floor;
	                this.startDrawingFloor(this.currentFloor, this.currentFloorNumber);
	            }
	        });
	        return this;
	    }
	    /**
	     * Get the floor number of the floor currently being rendered
	     */
	    getCurrentFloor() {
	        return this.currentFloorNumber;
	    }
	    addLayer(layer) {
	        const floorNumber = layer.getFloorNumber();
	        return this.addLayerToFloor(layer, floorNumber);
	    }
	    /**
	     * Adds `layer` to the layer group on a specific floor. Will only be rendered by Leaflet when the given floor is
	     * being rendered.
	     * @param layer Layer to add
	     * @param floorNumber Floor number to add the floor on
	     */
	    addLayerToFloor(layer, floorNumber) {
	        const floorLayers = lib.fromMap(this.additions, floorNumber).unwrapOr(new Set());
	        floorLayers.add(layer);
	        this.additions.set(floorNumber, floorLayers);
	        if (floorNumber === this.currentFloorNumber) {
	            this.currentFloor.addLayer(layer);
	        }
	        return this;
	    }
	    removeLayer(layer) {
	        const floorNumber = layer.getFloorNumber();
	        if (floorNumber === this.currentFloorNumber) {
	            this.currentFloor.removeLayer(layer);
	        }
	        const floorAdditions = this.additions.get(floorNumber);
	        if (floorAdditions) {
	            floorAdditions.delete(layer);
	        }
	        return this;
	    }
	    onAdd(map) {
	        super.onAdd(map);
	        this.control.addTo(map);
	        return this;
	    }
	    onRemove(map) {
	        super.onRemove(map);
	        map.removeControl(this.control);
	        return this;
	    }
	}
	class LLayerGroupWithFloor extends leafletSrc.LayerGroup {
	    constructor(layers, options) {
	        super(layers, options);
	        this.floorNumber = options.floorNumber || "";
	    }
	    getFloorNumber() {
	        return this.floorNumber;
	    }
	}

	/** Tag which may be present on a definition */
	var DefinitionTag;
	(function (DefinitionTag) {
	    /**
	     * Location is closed to everyone. Should not be used on rooms when expected limited access is enforced (eg.
	     * electrical closets aren't closed just because you can't enter them).
	     */
	    DefinitionTag["Closed"] = "closed";
	    /** Bathroom for women */
	    DefinitionTag["WomenBathroom"] = "women-bathroom";
	    /** Bathroom for men */
	    DefinitionTag["MenBathroom"] = "men-bathroom";
	    /** Bathroom gender currently unknown */
	    DefinitionTag["UnknownBathroom"] = "unknown-bathroom";
	    /** Bathroom Supply Closet */
	    DefinitionTag["BSC"] = "bsc";
	    /** Water Fountain */
	    DefinitionTag["WF"] = "wf";
	    /** Electrical Closet */
	    DefinitionTag["EC"] = "ec";
	    /** Water Fountain */
	    DefinitionTag["EF"] = "wf";
	    /** Hand Sanitizing station */
	    DefinitionTag["HS"] = "hs";
	    /** Emergency Bleeding Control kits, installed in case of school shooting or similar event */
	    DefinitionTag["BleedControl"] = "bleed-control";
	    /** Defibrillator */
	    DefinitionTag["AED"] = "aed";
	    /** Air Handling Unit (HVAC room that blows air around) */
	    DefinitionTag["AHU"] = "ahu";
	    /** Intermediate Distribution Frame (support room for Internet and/or telephones) */
	    DefinitionTag["IDF"] = "idf";
	    /** Main Distribution Frame (main room for Internet and/or telephones) */
	    DefinitionTag["MDF"] = "mdf";
	    /** ERU, unknown meaning but likely HVAC-related; some doors are labeled as ERUs */
	    DefinitionTag["ERU"] = "eru";
	    /** Control Panel, security rooms housing a control panel and other such equipment */
	    DefinitionTag["CP"] = "cp";
	})(DefinitionTag || (DefinitionTag = {}));

	class BuildingLocation {
	    constructor(xy, floor) {
	        this.xy = xy;
	        this.floor = floor;
	    }
	    getXY() {
	        return this.xy;
	    }
	    getFloor() {
	        return this.floor;
	    }
	    distanceTo(other) {
	        if (this.floor === other.floor) {
	            const dlat = other.xy.lat - this.xy.lat;
	            const dlng = other.xy.lng - this.xy.lng;
	            return lib.Some(Math.sqrt(dlat * dlat + dlng * dlng));
	        }
	        else {
	            return lib.None;
	        }
	    }
	    distance2To(other) {
	        if (this.floor === other.floor) {
	            const dlat = other.xy.lat - this.xy.lat;
	            const dlng = other.xy.lng - this.xy.lng;
	            return lib.Some(dlat * dlat + dlng * dlng);
	        }
	        else {
	            return lib.None;
	        }
	    }
	}

	/**
	 * Represents a vertex in the map's navigation graph
	 */
	class Vertex {
	    constructor(vertex) {
	        var _a;
	        this.location = new BuildingLocation(new leafletSrc.LatLng(vertex.location[1], vertex.location[0]), vertex.floor);
	        this.tags = (_a = vertex.tags) !== null && _a !== void 0 ? _a : [];
	    }
	    getLocation() {
	        return this.location;
	    }
	    hasTag(tag) {
	        return this.tags.includes(tag);
	    }
	    getTags() {
	        return this.tags;
	    }
	}
	/** Tag which may be present on a vertex */
	var VertexTag;
	(function (VertexTag) {
	    /** Vertex represents a staircase */
	    VertexTag["Stairs"] = "stairs";
	    /** Vertex represents an elevator */
	    VertexTag["Elevator"] = "elevator";
	    /** Vertex represents an up-only staircase */
	    VertexTag["Up"] = "up";
	    /** Vertex represents a down-only staircase */
	    VertexTag["Down"] = "down";
	})(VertexTag || (VertexTag = {}));

	// Map
	const ATTRIBUTION = "© <a href='https://www.nathanvarner.com' target='_blank' rel='noopener'>Nathan Varner</a> and contributors";
	// Icons
	// TODO: Wow these icons are bad. Get new ones.
	/**
	 * Array of pairs, `[tag, icon]`. A vertex's icon should be first icon paired with a tag it has.
	 */
	const ICON_FOR_VERTEX_TAG = [
	    [VertexTag.Up, "\uf885"],
	    [VertexTag.Down, "\uf884"],
	    [VertexTag.Stairs, "\uf039"],
	    [VertexTag.Elevator, "\uf52a"], // fa-door-closed
	];
	/**
	 * Array of pairs, `[tag, icon]`. A room's icon should be first icon paired with a tag it has.
	 */
	const ICON_FOR_ROOM_TAG = [
	    [DefinitionTag.WomenBathroom, "\uf182"],
	    [DefinitionTag.MenBathroom, "\uf183"],
	    [DefinitionTag.UnknownBathroom, "\uf7d8"],
	    [DefinitionTag.EC, "\uf0e7"],
	    [DefinitionTag.BSC, "\uf71e"],
	    [DefinitionTag.WF, "\uf043"],
	    [DefinitionTag.HS, "\ue06b"],
	    [DefinitionTag.BleedControl, "\uf462"],
	    [DefinitionTag.AED, "\uf21e"],
	    [DefinitionTag.AHU, "\uf72e"],
	    [DefinitionTag.IDF, "\uf6ff"],
	    [DefinitionTag.ERU, "\uf128"],
	    [DefinitionTag.CP, "\uf023"],
	];
	/** CSS font string for icons */
	const ICON_FONT = '900 14px "Font Awesome 5 Free"';
	// Labels
	/** Spacing in pixels between each line in multiline map labels */
	const LABEL_LINE_SPACING_PX = 3;
	/** CSS font string for map labels */
	const LABEL_FONT = '12px/1.5 "Helvetica Neue", Arial, Helvetica, sans-serif';
	/** Minimum distance in pixels between two map labels */
	const LABEL_MIN_SPACING_PX = 3;
	// Navigation
	/** Edge weight for edge representing going up or down stairs in the navigation graph */
	const STAIR_WEIGHT = 10;
	// Location
	/**
	 * Distance in school coordinate units that a user must move for their location to be updated; prevents random noise in
	 * GPS signal from causing the dot to jump around when the user is sitting still
	 */
	const MOVEMENT_SENSITIVITY = 10;
	/**
	 * Indicates the control type that should be used for a certain setting.
	 * Key:
	 *  - dropdown: dropdown to choose between the finite set of options specified in `DROPDOWN_DATA`
	 */
	const SETTING_INPUT_TYPE = new Map([
	    [
	        "bathroom-gender",
	        [
	            "dropdown",
	            [
	                ["", "no-selection"],
	                ["Man", "m"],
	                ["Woman", "w"],
	            ],
	        ],
	    ],
	]);
	/**
	 * Defines the order and contents of sections in the settings menu. The first entry of each element is the title of the
	 * section, and the second is a list of the options available in that section.
	 */
	const SETTING_SECTIONS = [
	    ["Personal", ["bathroom-gender"]],
	    [
	        "Visibility",
	        [
	            "show-closed",
	            "show-infrastructure",
	            "show-emergency",
	            "hiding-location",
	        ],
	    ],
	    ["Advanced", ["synergy", "dev", "logger", "show-markers"]],
	];
	const NAME_MAPPING = new Map([
	    ["bathroom-gender", "Restroom Gender"],
	    ["synergy", "Enable Synergy Panel (alpha)"],
	    ["dev", "Developer Mode"],
	    ["hiding-location", "Hide Location Dot"],
	    ["show-closed", "Show Closed Room Icons"],
	    ["show-infrastructure", "Show Infrastructure Icons"],
	    ["show-emergency", "Show Emergency Icons"],
	    ["logger", "Show Logger"],
	    ["show-markers", "Show Markers"],
	]);
	// Tags
	const INFRASTRUCTURE_TAGS = new Set([
	    DefinitionTag.BSC,
	    DefinitionTag.EC,
	    DefinitionTag.AHU,
	    DefinitionTag.IDF,
	    DefinitionTag.MDF,
	    DefinitionTag.ERU,
	    DefinitionTag.CP,
	]);
	const EMERGENCY_TAGS = new Set([
	    DefinitionTag.AED,
	    DefinitionTag.BleedControl,
	]);

	class Locator {
	    constructor(logger, settings) {
	        this.logger = logger;
	        this.settings = settings;
	        this.onUpdateStateHandles = [];
	        // Assume near Churchill
	        this.positionState = PositionState.UnsureNearChurchill;
	        this.latestPosition = lib.None;
	        this.latestAccuracyRadius = lib.None;
	        this.currentWatchId = lib.None;
	        this.canEverGeolocate = "geolocation" in navigator;
	        if (this.canEverGeolocate) {
	            settings.addWatcher("location-permission", (hasPermissionUnknown) => {
	                const hasPermission = hasPermissionUnknown;
	                if (hasPermission) {
	                    this.initialize();
	                }
	                else {
	                    this.disengage();
	                }
	            });
	        }
	    }
	    addStateUpdateHandler(onUpdateState) {
	        this.onUpdateStateHandles.push(onUpdateState);
	    }
	    getCanEverGeolocate() {
	        return this.canEverGeolocate;
	    }
	    getLatestPosition() {
	        this.tryInitializeIfNeeded();
	        return this.latestPosition;
	    }
	    getPositionState() {
	        return this.positionState;
	    }
	    isNearChurchill() {
	        const state = this.getPositionState();
	        return (state === PositionState.NearChurchill ||
	            state === PositionState.UnsureNearChurchill);
	    }
	    tryInitializeIfNeeded() {
	        if (this.canEverGeolocate &&
	            !this.settings.getData("location-permission").unwrap()) {
	            navigator.geolocation.getCurrentPosition((latestPosition) => {
	                this.settings.updateData("location-permission", true);
	                this.onPositionUpdate(latestPosition);
	            });
	        }
	    }
	    initialize() {
	        const onPositionUpdate = (latestPosition) => {
	            this.onPositionUpdate(latestPosition);
	        };
	        const onPositionError = (error) => {
	            this.onPositionError(error);
	        };
	        this.currentWatchId.ifSome((_) => this.disengage());
	        // Get the rough current position once so we have a decent idea of the current location, but request a good
	        // location to be updated as often as possible.
	        navigator.geolocation.getCurrentPosition(onPositionUpdate, onPositionError);
	        this.currentWatchId = lib.Some(navigator.geolocation.watchPosition(onPositionUpdate, onPositionError, {
	            enableHighAccuracy: true,
	        }));
	    }
	    disengage() {
	        this.currentWatchId.ifSome((id) => navigator.geolocation.clearWatch(id));
	        this.currentWatchId = lib.None;
	    }
	    onPositionUpdate(latestPosition) {
	        const coords = latestPosition.coords;
	        if (Locator.latLongNearChurchill(coords.latitude, coords.longitude)) {
	            this.setPositionStateNearChurchill(coords);
	        }
	        else {
	            this.setPositionStateNotNearChurchill();
	        }
	    }
	    onPositionError(error) {
	        this.logger.logError(`geolocation error: ${error.message}`);
	        if (error.code == error.PERMISSION_DENIED) {
	            this.settings.updateData("location-permission", false);
	        }
	        this.setPositionStateUnknown();
	    }
	    /**
	     * Call state change handlers, then update the state to the new state.
	     */
	    onUpdateState(newState, position, accuracyRadius) {
	        for (const handler of this.onUpdateStateHandles) {
	            handler(this.positionState, newState, position, accuracyRadius);
	        }
	        this.positionState = newState;
	        this.latestPosition = position;
	        this.latestAccuracyRadius = accuracyRadius;
	    }
	    setPositionStateNearChurchill(coords) {
	        const position = Locator.latLongToChurchillSpace(coords.latitude, coords.longitude);
	        const accuracyRadius = Locator.metersToFeet(coords.accuracy);
	        if (this.positionState === PositionState.NearChurchill) {
	            const distToLast = position.distanceTo(this.latestPosition.unwrap());
	            if (distToLast < MOVEMENT_SENSITIVITY) {
	                this.logger.log(`got update, not moving dot (distance of ${distToLast})`);
	                return; // Did not move enough; probably just in one place with GPS noise
	            }
	            else {
	                this.logger.log(`got update, moving dot (distance of ${distToLast})`);
	            }
	        }
	        this.onUpdateState(PositionState.NearChurchill, lib.Some(position), lib.Some(accuracyRadius));
	    }
	    setPositionStateNotNearChurchill() {
	        // TODO: Switch to lower accuracy GPS readings
	        this.onUpdateState(PositionState.NotNearChurchill, this.latestPosition, this.latestAccuracyRadius);
	    }
	    setPositionStateUnknown() {
	        if (this.positionState === PositionState.NearChurchill) {
	            this.onUpdateState(PositionState.UnsureNearChurchill, this.latestPosition, this.latestAccuracyRadius);
	        }
	        else {
	            this.onUpdateState(PositionState.Unknown, this.latestPosition, this.latestAccuracyRadius);
	        }
	    }
	    static latLongToChurchillSpace(latitude, longitude) {
	        // Churchill (214, 137.125) becomes (-77.17316, 39.04371) long-lat
	        // (408.625, 145.5) -> (-77.17260, 39.04409)
	        // (466, 271.25) -> (-77.17277, 39.04453)
	        // Affine transformation matrix from long-lat to Churchill coords:
	        // 63832500/311  65216250/311 190395034993/24880
	        // -44100000/311 71843750/311 -99333444007/4976
	        // 0             0            1
	        // Calculated based on https://brilliant.org/wiki/affine-transformations/
	        const x = (63832500.0 / 311.0) * longitude +
	            (65216250 / 311) * latitude +
	            190395034993 / 24880;
	        const y = (-44100000 / 311) * longitude +
	            (71843750 / 311) * latitude +
	            -99333444007 / 4976;
	        return new leafletSrc.LatLng(y, x);
	    }
	    /**
	     * Determines if a lat-long coordinate is near Churchill. Any point within Churchill's campus (school building,
	     * parking lots, fields, etc.) must be near Churchill. Points that are physically close to Churchill but not
	     * necesarily on campus may be considered near. Points far from Churchill must never be considered near.
	     */
	    static latLongNearChurchill(latitude, longitude) {
	        // Bounding box completely containing Churchill and school grounds
	        const latMax = 39.04569;
	        const latMin = 39.04068;
	        const longMax = -77.17082;
	        const longMin = -77.17723;
	        return (latMax >= latitude &&
	            latitude >= latMin &&
	            longMax >= longitude &&
	            longitude >= longMin);
	    }
	    static metersToFeet(meters) {
	        return meters * 3.28084;
	    }
	}
	Locator.inject = ["logger", "settings"];
	var PositionState;
	(function (PositionState) {
	    PositionState[PositionState["Unknown"] = 0] = "Unknown";
	    PositionState[PositionState["NearChurchill"] = 1] = "NearChurchill";
	    PositionState[PositionState["UnsureNearChurchill"] = 2] = "UnsureNearChurchill";
	    PositionState[PositionState["NotNearChurchill"] = 3] = "NotNearChurchill";
	})(PositionState || (PositionState = {}));

	class LLocationControl extends leafletSrc.Control {
	    /**
	     * Creates a new control that moves the map to the user's location.
	     * @param locateCallback Callback function for when the user wants to be located on the map
	     * @param options Any extra Leaflet layer options
	     */
	    constructor(locateCallback, options) {
	        super(options);
	        this.locateCallback = locateCallback;
	        this.locateButton = LLocationControl.createLocateButton();
	    }
	    static createLocateButton() {
	        const button = document.createElement("a");
	        button.setAttribute("href", "#");
	        button.classList.add("leaflet-disabled");
	        const icon = document.createElement("i");
	        icon.classList.add("fas");
	        icon.classList.add("fa-map-pin");
	        button.appendChild(icon);
	        return button;
	    }
	    onAdd(_map) {
	        const base = document.createElement("div");
	        base.classList.add("leaflet-bar");
	        base.classList.add("leaflet-control");
	        base.classList.add("leaflet-control-floors");
	        base.appendChild(this.locateButton);
	        leafletSrc.DomEvent.disableClickPropagation(base);
	        leafletSrc.DomEvent.disableScrollPropagation(base);
	        return base;
	    }
	    onLocationAvailable() {
	        this.locateButton.addEventListener("click", this.locateCallback);
	        this.locateButton.classList.remove("leaflet-disabled");
	    }
	    onLocationNotAvailable() {
	        this.locateButton.removeEventListener("click", this.locateCallback);
	        this.locateButton.classList.add("leaflet-disabled");
	    }
	}

	class LLocation extends leafletSrc.LayerGroup {
	    /**
	     * Creates a new layer that shows the user's location on the map.
	     * @param options Any extra Leaflet layer options
	     */
	    constructor(locator, settings) {
	        super([], {
	            attribution: "© OpenStreetMap contributors",
	        });
	        this.locator = locator;
	        this.control = new LLocationControl(() => {
	            this.locate();
	        }, { position: "topright" });
	        this.positionMarker = lib.None;
	        this.map = lib.None;
	        this.hidingLocation = false;
	        settings.addWatcher("hiding-location", (hidingLocationUnknown) => {
	            const hidingLocation = hidingLocationUnknown;
	            this.onChangeHidingLocation(hidingLocation);
	        });
	        locator.addStateUpdateHandler((_oldState, newState, position, accuracyRadius) => this.onLocationStateChange(newState, position, accuracyRadius));
	        this.onLocationStateChange(locator.getPositionState(), lib.None, lib.None);
	    }
	    onAdd(map) {
	        super.onAdd(map);
	        this.control.addTo(map);
	        this.map = lib.Some(map);
	        return this;
	    }
	    onRemove(map) {
	        super.onRemove(map);
	        map.removeControl(this.control);
	        return this;
	    }
	    onLocationStateChange(newState, position, accuracyRadius) {
	        switch (newState) {
	            case PositionState.NearChurchill:
	                {
	                    this.positionMarker.ifSome((positionMarker) => super.removeLayer(positionMarker));
	                    const positionMarker = new PositionMarker(position.unwrap(), accuracyRadius.unwrap());
	                    this.positionMarker = lib.Some(positionMarker);
	                    if (!this.hidingLocation) {
	                        super.addLayer(positionMarker);
	                    }
	                    // When near Churchill, location is available
	                    this.control.onLocationAvailable();
	                }
	                break;
	            case PositionState.NotNearChurchill:
	                this.positionMarker.ifSome((positionMarker) => super.removeLayer(positionMarker));
	                // When not near Churchill, location is not available
	                this.control.onLocationNotAvailable();
	                break;
	            case PositionState.UnsureNearChurchill:
	                // Show greyed out circle instead
	                this.positionMarker.ifSome((positionMarker) => super.removeLayer(positionMarker));
	                this.positionMarker = this.positionMarker.map((_) => new PositionMarker(position.unwrap(), accuracyRadius.unwrap(), true));
	                this.control.onLocationAvailable();
	                break;
	            case PositionState.Unknown:
	                this.positionMarker.ifSome((positionMarker) => super.removeLayer(positionMarker));
	                this.control.onLocationNotAvailable();
	                break;
	        }
	    }
	    locate() {
	        this.locator.getLatestPosition().ifSome((position) => {
	            this.map.ifSome((map) => {
	                map.flyTo(position, 2.5);
	            });
	        });
	    }
	    onChangeHidingLocation(hidingLocation) {
	        this.hidingLocation = hidingLocation;
	        this.positionMarker.ifSome((positionMarker) => {
	            if (this.locator.getPositionState() == PositionState.NearChurchill) {
	                if (this.hidingLocation) {
	                    super.removeLayer(positionMarker);
	                }
	                else {
	                    super.addLayer(positionMarker);
	                }
	            }
	        });
	    }
	}
	LLocation.inject = ["locator", "settings"];
	class PositionMarker extends leafletSrc.LayerGroup {
	    constructor(position, accuracyRadius, unsure = false) {
	        const color = unsure ? "#bcbcbc" : "#3388ff";
	        const positionPoint = leafletSrc.circleMarker(position, {
	            radius: 1,
	            color: color,
	        });
	        const accuracyCircle = leafletSrc.circle(position, {
	            stroke: false,
	            radius: accuracyRadius,
	            color: color,
	        });
	        super([positionPoint, accuracyCircle]);
	    }
	}

	/* Font Face Observer v2.1.0 - © Bram Stein. License: BSD-3-Clause */

	var fontfaceobserver_standalone = createCommonjsModule(function (module) {
	(function(){function l(a,b){document.addEventListener?a.addEventListener("scroll",b,!1):a.attachEvent("scroll",b);}function m(a){document.body?a():document.addEventListener?document.addEventListener("DOMContentLoaded",function c(){document.removeEventListener("DOMContentLoaded",c);a();}):document.attachEvent("onreadystatechange",function k(){if("interactive"==document.readyState||"complete"==document.readyState)document.detachEvent("onreadystatechange",k),a();});}function t(a){this.a=document.createElement("div");this.a.setAttribute("aria-hidden","true");this.a.appendChild(document.createTextNode(a));this.b=document.createElement("span");this.c=document.createElement("span");this.h=document.createElement("span");this.f=document.createElement("span");this.g=-1;this.b.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.c.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
	this.f.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.h.style.cssText="display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";this.b.appendChild(this.h);this.c.appendChild(this.f);this.a.appendChild(this.b);this.a.appendChild(this.c);}
	function u(a,b){a.a.style.cssText="max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;white-space:nowrap;font-synthesis:none;font:"+b+";";}function z(a){var b=a.a.offsetWidth,c=b+100;a.f.style.width=c+"px";a.c.scrollLeft=c;a.b.scrollLeft=a.b.scrollWidth+100;return a.g!==b?(a.g=b,!0):!1}function A(a,b){function c(){var a=k;z(a)&&a.a.parentNode&&b(a.g);}var k=a;l(a.b,c);l(a.c,c);z(a);}function B(a,b){var c=b||{};this.family=a;this.style=c.style||"normal";this.weight=c.weight||"normal";this.stretch=c.stretch||"normal";}var C=null,D=null,E=null,F=null;function G(){if(null===D)if(J()&&/Apple/.test(window.navigator.vendor)){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(window.navigator.userAgent);D=!!a&&603>parseInt(a[1],10);}else D=!1;return D}function J(){null===F&&(F=!!document.fonts);return F}
	function K(){if(null===E){var a=document.createElement("div");try{a.style.font="condensed 100px sans-serif";}catch(b){}E=""!==a.style.font;}return E}function L(a,b){return [a.style,a.weight,K()?a.stretch:"","100px",b].join(" ")}
	B.prototype.load=function(a,b){var c=this,k=a||"BESbswy",r=0,n=b||3E3,H=(new Date).getTime();return new Promise(function(a,b){if(J()&&!G()){var M=new Promise(function(a,b){function e(){(new Date).getTime()-H>=n?b(Error(""+n+"ms timeout exceeded")):document.fonts.load(L(c,'"'+c.family+'"'),k).then(function(c){1<=c.length?a():setTimeout(e,25);},b);}e();}),N=new Promise(function(a,c){r=setTimeout(function(){c(Error(""+n+"ms timeout exceeded"));},n);});Promise.race([N,M]).then(function(){clearTimeout(r);a(c);},
	b);}else m(function(){function v(){var b;if(b=-1!=f&&-1!=g||-1!=f&&-1!=h||-1!=g&&-1!=h)(b=f!=g&&f!=h&&g!=h)||(null===C&&(b=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent),C=!!b&&(536>parseInt(b[1],10)||536===parseInt(b[1],10)&&11>=parseInt(b[2],10))),b=C&&(f==w&&g==w&&h==w||f==x&&g==x&&h==x||f==y&&g==y&&h==y)),b=!b;b&&(d.parentNode&&d.parentNode.removeChild(d),clearTimeout(r),a(c));}function I(){if((new Date).getTime()-H>=n)d.parentNode&&d.parentNode.removeChild(d),b(Error(""+
	n+"ms timeout exceeded"));else {var a=document.hidden;if(!0===a||void 0===a)f=e.a.offsetWidth,g=p.a.offsetWidth,h=q.a.offsetWidth,v();r=setTimeout(I,50);}}var e=new t(k),p=new t(k),q=new t(k),f=-1,g=-1,h=-1,w=-1,x=-1,y=-1,d=document.createElement("div");d.dir="ltr";u(e,L(c,"sans-serif"));u(p,L(c,"serif"));u(q,L(c,"monospace"));d.appendChild(e.a);d.appendChild(p.a);d.appendChild(q.a);document.body.appendChild(d);w=e.a.offsetWidth;x=p.a.offsetWidth;y=q.a.offsetWidth;I();A(e,function(a){f=a;v();});u(e,
	L(c,'"'+c.family+'",sans-serif'));A(p,function(a){g=a;v();});u(p,L(c,'"'+c.family+'",serif'));A(q,function(a){h=a;v();});u(q,L(c,'"'+c.family+'",monospace'));});})};module.exports=B;}());
	});

	var flat = function pointInPolygonFlat (point, vs, start, end) {
	    var x = point[0], y = point[1];
	    var inside = false;
	    if (start === undefined) start = 0;
	    if (end === undefined) end = vs.length;
	    var len = (end-start)/2;
	    for (var i = 0, j = len - 1; i < len; j = i++) {
	        var xi = vs[start+i*2+0], yi = vs[start+i*2+1];
	        var xj = vs[start+j*2+0], yj = vs[start+j*2+1];
	        var intersect = ((yi > y) !== (yj > y))
	            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
	        if (intersect) inside = !inside;
	    }
	    return inside;
	};

	// ray-casting algorithm based on
	// https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html

	var nested = function pointInPolygonNested (point, vs, start, end) {
	    var x = point[0], y = point[1];
	    var inside = false;
	    if (start === undefined) start = 0;
	    if (end === undefined) end = vs.length;
	    var len = end - start;
	    for (var i = 0, j = len - 1; i < len; j = i++) {
	        var xi = vs[i+start][0], yi = vs[i+start][1];
	        var xj = vs[j+start][0], yj = vs[j+start][1];
	        var intersect = ((yi > y) !== (yj > y))
	            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
	        if (intersect) inside = !inside;
	    }
	    return inside;
	};

	var pointInPolygon = function pointInPolygon (point, vs, start, end) {
	    if (vs.length > 0 && Array.isArray(vs[0])) {
	        return nested(point, vs, start, end);
	    } else {
	        return flat(point, vs, start, end);
	    }
	};
	var nested$1 = nested;
	var flat$1 = flat;
	pointInPolygon.nested = nested$1;
	pointInPolygon.flat = flat$1;

	var rbush = createCommonjsModule(function (module, exports) {
	(function (global, factory) {
	 module.exports = factory() ;
	}(commonjsGlobal, function () {
	function quickselect(arr, k, left, right, compare) {
	    quickselectStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
	}

	function quickselectStep(arr, k, left, right, compare) {

	    while (right > left) {
	        if (right - left > 600) {
	            var n = right - left + 1;
	            var m = k - left + 1;
	            var z = Math.log(n);
	            var s = 0.5 * Math.exp(2 * z / 3);
	            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
	            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
	            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
	            quickselectStep(arr, k, newLeft, newRight, compare);
	        }

	        var t = arr[k];
	        var i = left;
	        var j = right;

	        swap(arr, left, k);
	        if (compare(arr[right], t) > 0) { swap(arr, left, right); }

	        while (i < j) {
	            swap(arr, i, j);
	            i++;
	            j--;
	            while (compare(arr[i], t) < 0) { i++; }
	            while (compare(arr[j], t) > 0) { j--; }
	        }

	        if (compare(arr[left], t) === 0) { swap(arr, left, j); }
	        else {
	            j++;
	            swap(arr, j, right);
	        }

	        if (j <= k) { left = j + 1; }
	        if (k <= j) { right = j - 1; }
	    }
	}

	function swap(arr, i, j) {
	    var tmp = arr[i];
	    arr[i] = arr[j];
	    arr[j] = tmp;
	}

	function defaultCompare(a, b) {
	    return a < b ? -1 : a > b ? 1 : 0;
	}

	var RBush = function RBush(maxEntries) {
	    if ( maxEntries === void 0 ) maxEntries = 9;

	    // max entries in a node is 9 by default; min node fill is 40% for best performance
	    this._maxEntries = Math.max(4, maxEntries);
	    this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));
	    this.clear();
	};

	RBush.prototype.all = function all () {
	    return this._all(this.data, []);
	};

	RBush.prototype.search = function search (bbox) {
	    var node = this.data;
	    var result = [];

	    if (!intersects(bbox, node)) { return result; }

	    var toBBox = this.toBBox;
	    var nodesToSearch = [];

	    while (node) {
	        for (var i = 0; i < node.children.length; i++) {
	            var child = node.children[i];
	            var childBBox = node.leaf ? toBBox(child) : child;

	            if (intersects(bbox, childBBox)) {
	                if (node.leaf) { result.push(child); }
	                else if (contains(bbox, childBBox)) { this._all(child, result); }
	                else { nodesToSearch.push(child); }
	            }
	        }
	        node = nodesToSearch.pop();
	    }

	    return result;
	};

	RBush.prototype.collides = function collides (bbox) {
	    var node = this.data;

	    if (!intersects(bbox, node)) { return false; }

	    var nodesToSearch = [];
	    while (node) {
	        for (var i = 0; i < node.children.length; i++) {
	            var child = node.children[i];
	            var childBBox = node.leaf ? this.toBBox(child) : child;

	            if (intersects(bbox, childBBox)) {
	                if (node.leaf || contains(bbox, childBBox)) { return true; }
	                nodesToSearch.push(child);
	            }
	        }
	        node = nodesToSearch.pop();
	    }

	    return false;
	};

	RBush.prototype.load = function load (data) {
	    if (!(data && data.length)) { return this; }

	    if (data.length < this._minEntries) {
	        for (var i = 0; i < data.length; i++) {
	            this.insert(data[i]);
	        }
	        return this;
	    }

	    // recursively build the tree with the given data from scratch using OMT algorithm
	    var node = this._build(data.slice(), 0, data.length - 1, 0);

	    if (!this.data.children.length) {
	        // save as is if tree is empty
	        this.data = node;

	    } else if (this.data.height === node.height) {
	        // split root if trees have the same height
	        this._splitRoot(this.data, node);

	    } else {
	        if (this.data.height < node.height) {
	            // swap trees if inserted one is bigger
	            var tmpNode = this.data;
	            this.data = node;
	            node = tmpNode;
	        }

	        // insert the small tree into the large tree at appropriate level
	        this._insert(node, this.data.height - node.height - 1, true);
	    }

	    return this;
	};

	RBush.prototype.insert = function insert (item) {
	    if (item) { this._insert(item, this.data.height - 1); }
	    return this;
	};

	RBush.prototype.clear = function clear () {
	    this.data = createNode([]);
	    return this;
	};

	RBush.prototype.remove = function remove (item, equalsFn) {
	    if (!item) { return this; }

	    var node = this.data;
	    var bbox = this.toBBox(item);
	    var path = [];
	    var indexes = [];
	    var i, parent, goingUp;

	    // depth-first iterative tree traversal
	    while (node || path.length) {

	        if (!node) { // go up
	            node = path.pop();
	            parent = path[path.length - 1];
	            i = indexes.pop();
	            goingUp = true;
	        }

	        if (node.leaf) { // check current node
	            var index = findItem(item, node.children, equalsFn);

	            if (index !== -1) {
	                // item found, remove the item and condense tree upwards
	                node.children.splice(index, 1);
	                path.push(node);
	                this._condense(path);
	                return this;
	            }
	        }

	        if (!goingUp && !node.leaf && contains(node, bbox)) { // go down
	            path.push(node);
	            indexes.push(i);
	            i = 0;
	            parent = node;
	            node = node.children[0];

	        } else if (parent) { // go right
	            i++;
	            node = parent.children[i];
	            goingUp = false;

	        } else { node = null; } // nothing found
	    }

	    return this;
	};

	RBush.prototype.toBBox = function toBBox (item) { return item; };

	RBush.prototype.compareMinX = function compareMinX (a, b) { return a.minX - b.minX; };
	RBush.prototype.compareMinY = function compareMinY (a, b) { return a.minY - b.minY; };

	RBush.prototype.toJSON = function toJSON () { return this.data; };

	RBush.prototype.fromJSON = function fromJSON (data) {
	    this.data = data;
	    return this;
	};

	RBush.prototype._all = function _all (node, result) {
	    var nodesToSearch = [];
	    while (node) {
	        if (node.leaf) { result.push.apply(result, node.children); }
	        else { nodesToSearch.push.apply(nodesToSearch, node.children); }

	        node = nodesToSearch.pop();
	    }
	    return result;
	};

	RBush.prototype._build = function _build (items, left, right, height) {

	    var N = right - left + 1;
	    var M = this._maxEntries;
	    var node;

	    if (N <= M) {
	        // reached leaf level; return leaf
	        node = createNode(items.slice(left, right + 1));
	        calcBBox(node, this.toBBox);
	        return node;
	    }

	    if (!height) {
	        // target height of the bulk-loaded tree
	        height = Math.ceil(Math.log(N) / Math.log(M));

	        // target number of root entries to maximize storage utilization
	        M = Math.ceil(N / Math.pow(M, height - 1));
	    }

	    node = createNode([]);
	    node.leaf = false;
	    node.height = height;

	    // split the items into M mostly square tiles

	    var N2 = Math.ceil(N / M);
	    var N1 = N2 * Math.ceil(Math.sqrt(M));

	    multiSelect(items, left, right, N1, this.compareMinX);

	    for (var i = left; i <= right; i += N1) {

	        var right2 = Math.min(i + N1 - 1, right);

	        multiSelect(items, i, right2, N2, this.compareMinY);

	        for (var j = i; j <= right2; j += N2) {

	            var right3 = Math.min(j + N2 - 1, right2);

	            // pack each entry recursively
	            node.children.push(this._build(items, j, right3, height - 1));
	        }
	    }

	    calcBBox(node, this.toBBox);

	    return node;
	};

	RBush.prototype._chooseSubtree = function _chooseSubtree (bbox, node, level, path) {
	    while (true) {
	        path.push(node);

	        if (node.leaf || path.length - 1 === level) { break; }

	        var minArea = Infinity;
	        var minEnlargement = Infinity;
	        var targetNode = (void 0);

	        for (var i = 0; i < node.children.length; i++) {
	            var child = node.children[i];
	            var area = bboxArea(child);
	            var enlargement = enlargedArea(bbox, child) - area;

	            // choose entry with the least area enlargement
	            if (enlargement < minEnlargement) {
	                minEnlargement = enlargement;
	                minArea = area < minArea ? area : minArea;
	                targetNode = child;

	            } else if (enlargement === minEnlargement) {
	                // otherwise choose one with the smallest area
	                if (area < minArea) {
	                    minArea = area;
	                    targetNode = child;
	                }
	            }
	        }

	        node = targetNode || node.children[0];
	    }

	    return node;
	};

	RBush.prototype._insert = function _insert (item, level, isNode) {
	    var bbox = isNode ? item : this.toBBox(item);
	    var insertPath = [];

	    // find the best node for accommodating the item, saving all nodes along the path too
	    var node = this._chooseSubtree(bbox, this.data, level, insertPath);

	    // put the item into the node
	    node.children.push(item);
	    extend(node, bbox);

	    // split on node overflow; propagate upwards if necessary
	    while (level >= 0) {
	        if (insertPath[level].children.length > this._maxEntries) {
	            this._split(insertPath, level);
	            level--;
	        } else { break; }
	    }

	    // adjust bboxes along the insertion path
	    this._adjustParentBBoxes(bbox, insertPath, level);
	};

	// split overflowed node into two
	RBush.prototype._split = function _split (insertPath, level) {
	    var node = insertPath[level];
	    var M = node.children.length;
	    var m = this._minEntries;

	    this._chooseSplitAxis(node, m, M);

	    var splitIndex = this._chooseSplitIndex(node, m, M);

	    var newNode = createNode(node.children.splice(splitIndex, node.children.length - splitIndex));
	    newNode.height = node.height;
	    newNode.leaf = node.leaf;

	    calcBBox(node, this.toBBox);
	    calcBBox(newNode, this.toBBox);

	    if (level) { insertPath[level - 1].children.push(newNode); }
	    else { this._splitRoot(node, newNode); }
	};

	RBush.prototype._splitRoot = function _splitRoot (node, newNode) {
	    // split root node
	    this.data = createNode([node, newNode]);
	    this.data.height = node.height + 1;
	    this.data.leaf = false;
	    calcBBox(this.data, this.toBBox);
	};

	RBush.prototype._chooseSplitIndex = function _chooseSplitIndex (node, m, M) {
	    var index;
	    var minOverlap = Infinity;
	    var minArea = Infinity;

	    for (var i = m; i <= M - m; i++) {
	        var bbox1 = distBBox(node, 0, i, this.toBBox);
	        var bbox2 = distBBox(node, i, M, this.toBBox);

	        var overlap = intersectionArea(bbox1, bbox2);
	        var area = bboxArea(bbox1) + bboxArea(bbox2);

	        // choose distribution with minimum overlap
	        if (overlap < minOverlap) {
	            minOverlap = overlap;
	            index = i;

	            minArea = area < minArea ? area : minArea;

	        } else if (overlap === minOverlap) {
	            // otherwise choose distribution with minimum area
	            if (area < minArea) {
	                minArea = area;
	                index = i;
	            }
	        }
	    }

	    return index || M - m;
	};

	// sorts node children by the best axis for split
	RBush.prototype._chooseSplitAxis = function _chooseSplitAxis (node, m, M) {
	    var compareMinX = node.leaf ? this.compareMinX : compareNodeMinX;
	    var compareMinY = node.leaf ? this.compareMinY : compareNodeMinY;
	    var xMargin = this._allDistMargin(node, m, M, compareMinX);
	    var yMargin = this._allDistMargin(node, m, M, compareMinY);

	    // if total distributions margin value is minimal for x, sort by minX,
	    // otherwise it's already sorted by minY
	    if (xMargin < yMargin) { node.children.sort(compareMinX); }
	};

	// total margin of all possible split distributions where each node is at least m full
	RBush.prototype._allDistMargin = function _allDistMargin (node, m, M, compare) {
	    node.children.sort(compare);

	    var toBBox = this.toBBox;
	    var leftBBox = distBBox(node, 0, m, toBBox);
	    var rightBBox = distBBox(node, M - m, M, toBBox);
	    var margin = bboxMargin(leftBBox) + bboxMargin(rightBBox);

	    for (var i = m; i < M - m; i++) {
	        var child = node.children[i];
	        extend(leftBBox, node.leaf ? toBBox(child) : child);
	        margin += bboxMargin(leftBBox);
	    }

	    for (var i$1 = M - m - 1; i$1 >= m; i$1--) {
	        var child$1 = node.children[i$1];
	        extend(rightBBox, node.leaf ? toBBox(child$1) : child$1);
	        margin += bboxMargin(rightBBox);
	    }

	    return margin;
	};

	RBush.prototype._adjustParentBBoxes = function _adjustParentBBoxes (bbox, path, level) {
	    // adjust bboxes along the given tree path
	    for (var i = level; i >= 0; i--) {
	        extend(path[i], bbox);
	    }
	};

	RBush.prototype._condense = function _condense (path) {
	    // go through the path, removing empty nodes and updating bboxes
	    for (var i = path.length - 1, siblings = (void 0); i >= 0; i--) {
	        if (path[i].children.length === 0) {
	            if (i > 0) {
	                siblings = path[i - 1].children;
	                siblings.splice(siblings.indexOf(path[i]), 1);

	            } else { this.clear(); }

	        } else { calcBBox(path[i], this.toBBox); }
	    }
	};

	function findItem(item, items, equalsFn) {
	    if (!equalsFn) { return items.indexOf(item); }

	    for (var i = 0; i < items.length; i++) {
	        if (equalsFn(item, items[i])) { return i; }
	    }
	    return -1;
	}

	// calculate node's bbox from bboxes of its children
	function calcBBox(node, toBBox) {
	    distBBox(node, 0, node.children.length, toBBox, node);
	}

	// min bounding rectangle of node children from k to p-1
	function distBBox(node, k, p, toBBox, destNode) {
	    if (!destNode) { destNode = createNode(null); }
	    destNode.minX = Infinity;
	    destNode.minY = Infinity;
	    destNode.maxX = -Infinity;
	    destNode.maxY = -Infinity;

	    for (var i = k; i < p; i++) {
	        var child = node.children[i];
	        extend(destNode, node.leaf ? toBBox(child) : child);
	    }

	    return destNode;
	}

	function extend(a, b) {
	    a.minX = Math.min(a.minX, b.minX);
	    a.minY = Math.min(a.minY, b.minY);
	    a.maxX = Math.max(a.maxX, b.maxX);
	    a.maxY = Math.max(a.maxY, b.maxY);
	    return a;
	}

	function compareNodeMinX(a, b) { return a.minX - b.minX; }
	function compareNodeMinY(a, b) { return a.minY - b.minY; }

	function bboxArea(a)   { return (a.maxX - a.minX) * (a.maxY - a.minY); }
	function bboxMargin(a) { return (a.maxX - a.minX) + (a.maxY - a.minY); }

	function enlargedArea(a, b) {
	    return (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) *
	           (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY));
	}

	function intersectionArea(a, b) {
	    var minX = Math.max(a.minX, b.minX);
	    var minY = Math.max(a.minY, b.minY);
	    var maxX = Math.min(a.maxX, b.maxX);
	    var maxY = Math.min(a.maxY, b.maxY);

	    return Math.max(0, maxX - minX) *
	           Math.max(0, maxY - minY);
	}

	function contains(a, b) {
	    return a.minX <= b.minX &&
	           a.minY <= b.minY &&
	           b.maxX <= a.maxX &&
	           b.maxY <= a.maxY;
	}

	function intersects(a, b) {
	    return b.minX <= a.maxX &&
	           b.minY <= a.maxY &&
	           b.maxX >= a.minX &&
	           b.maxY >= a.minY;
	}

	function createNode(children) {
	    return {
	        children: children,
	        height: 1,
	        leaf: true,
	        minX: Infinity,
	        minY: Infinity,
	        maxX: -Infinity,
	        maxY: -Infinity
	    };
	}

	// sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
	// combines selection algorithm with binary divide & conquer approach

	function multiSelect(arr, left, right, n, compare) {
	    var stack = [left, right];

	    while (stack.length) {
	        right = stack.pop();
	        left = stack.pop();

	        if (right - left <= n) { continue; }

	        var mid = left + Math.ceil((right - left) / n / 2) * n;
	        quickselect(arr, mid, left, right, compare);

	        stack.push(left, mid, mid, right);
	    }
	}

	return RBush;

	}));
	});

	class OutlineLayer extends leafletSrc.GridLayer {
	    constructor(options, logger) {
	        super(options);
	        this.logger = logger;
	        this.outlines = new rbush();
	        this.outlines.load(options.outlines);
	        this.tileCache = new Map();
	    }
	    createTile(coords) {
	        const cachedTile = this.tileCache.get(JSON.stringify(coords));
	        if (cachedTile !== undefined) {
	            return cachedTile;
	        }
	        const tileSize = this.getTileSize();
	        const tile = (h("canvas", { width: tileSize.x, height: tileSize.y }));
	        const ctx = tile.getContext("2d");
	        if (ctx !== null) {
	            ctx.fillStyle = "rgba(125, 181, 52, 0.2)";
	            const tileTopLeftPoint = coords.scaleBy(tileSize);
	            const tileBBox = this.tileBBox(coords, tileSize);
	            tile.setAttribute("data-bbox", JSON.stringify(tileBBox));
	            const renderableOutlines = this.outlines.search(tileBBox);
	            for (const outline of renderableOutlines) {
	                outline.render(ctx, (latLng) => this._map
	                    .project(latLng, coords.z)
	                    .subtract(tileTopLeftPoint));
	            }
	        }
	        else {
	            // TODO: Tell user to use reasonable browser
	            this.logger.logError("cannot get 2d canvas context in OutlineLayer");
	        }
	        this.tileCache.set(JSON.stringify(coords), tile);
	        return tile;
	    }
	    getEvents() {
	        const events = super.getEvents ? super.getEvents() : {};
	        // Prevent layers from being invalidated after panning
	        delete events["viewprereset"];
	        events["click"] = (e) => {
	            const me = e;
	            const clickedOutlines = this.outlines
	                .search({
	                maxX: me.latlng.lng + 1,
	                maxY: me.latlng.lat + 1,
	                minX: me.latlng.lng,
	                minY: me.latlng.lat,
	            })
	                .filter((outline) => outline.didClick(me))
	                // Assume that user intends to click on smallest target
	                .sort((a, b) => a.bboxArea() - b.bboxArea());
	            if (clickedOutlines.length > 0) {
	                clickedOutlines[0].onClick(me);
	            }
	        };
	        return events;
	    }
	    tileBBox(coords, tileSize) {
	        const tileTopLeftPoint = coords.scaleBy(tileSize);
	        const tileTopLeft = this._map.unproject(tileTopLeftPoint, coords.z);
	        const tileBottomRightPoint = coords.add(leafletSrc.point(1, 1)).scaleBy(tileSize);
	        const tileBottomRight = this._map.unproject(tileBottomRightPoint, coords.z);
	        return {
	            maxX: tileBottomRight.lng,
	            maxY: tileTopLeft.lat,
	            minX: tileTopLeft.lng,
	            minY: tileBottomRight.lat,
	        };
	    }
	}
	class Outline {
	    constructor(points) {
	        this.points = points;
	        this.clickListeners = [];
	        const [maxX, maxY, minX, minY] = points.reduce(([maxX, maxY, minX, minY], point) => [
	            Math.max(maxX, point.lng),
	            Math.max(maxY, point.lat),
	            Math.min(minX, point.lng),
	            Math.min(minY, point.lat),
	        ], [-Infinity, -Infinity, Infinity, Infinity]);
	        this.maxX = maxX;
	        this.maxY = maxY;
	        this.minX = minX;
	        this.minY = minY;
	    }
	    render(ctx, toPoint) {
	        const points = this.points.map((latLng) => toPoint(latLng));
	        ctx.beginPath();
	        ctx.moveTo(points[0].x, points[0].y);
	        for (const point of points) {
	            ctx.lineTo(point.x, point.y);
	        }
	        ctx.lineTo(points[0].x, points[0].y);
	        ctx.fill();
	    }
	    addClickListener(listener) {
	        this.clickListeners.push(listener);
	    }
	    didClick(e) {
	        const polygon = this.points.map((latlng) => [latlng.lng, latlng.lat]);
	        return pointInPolygon([e.latlng.lng, e.latlng.lat], polygon);
	    }
	    onClick(e) {
	        for (const listener of this.clickListeners) {
	            listener(e);
	        }
	    }
	    bboxArea() {
	        return (this.maxX - this.minX) * (this.maxY - this.minY);
	    }
	}

	class IconLabel {
	    constructor(textMeasurer, center, icon, closed) {
	        this.textMeasurer = textMeasurer;
	        this.center = center;
	        this.icon = icon;
	        this.closed = closed;
	        this.iconSize = this.measureIcon(icon);
	        this.clickListeners = [];
	    }
	    getSize() {
	        return leafletSrc.point(2 * IconLabel.RADIUS_PX, 2 * IconLabel.RADIUS_PX);
	    }
	    getCenter() {
	        return this.center;
	    }
	    render(ctx, centeredAt) {
	        ctx.fillStyle = this.closed
	            ? IconLabel.CLOSED_BACKGROUND_COLOR
	            : IconLabel.BACKGROUND_COLOR;
	        ctx.beginPath();
	        ctx.arc(centeredAt.x, centeredAt.y, IconLabel.RADIUS_PX, 0, 2 * Math.PI);
	        ctx.fill();
	        ctx.strokeStyle = this.closed
	            ? IconLabel.CLOSED_BORDER_COLOR
	            : IconLabel.BORDER_COLOR;
	        ctx.lineWidth = IconLabel.BORDER_PX;
	        ctx.beginPath();
	        ctx.arc(centeredAt.x, centeredAt.y, IconLabel.RADIUS_PX - IconLabel.BORDER_PX / 2, 0, 2 * Math.PI);
	        ctx.stroke();
	        const oldFont = ctx.font;
	        ctx.font = ICON_FONT;
	        ctx.textAlign = "center";
	        ctx.fillStyle = this.closed
	            ? IconLabel.CLOSED_ICON_COLOR
	            : IconLabel.ICON_COLOR;
	        const topLeft = centeredAt.subtract(this.iconSize.divideBy(2));
	        ctx.fillText(this.icon, topLeft.x + this.iconSize.x / 2, topLeft.y + this.iconSize.y - IconLabel.ICON_VERTICAL_OFFSET_PX);
	        ctx.font = oldFont;
	    }
	    addClickListener(listener) {
	        this.clickListeners.push(listener);
	    }
	    didClick(e, map, zoom) {
	        const centerPoint = map.project(this.center, zoom);
	        const clickPoint = map.project(e.latlng);
	        return centerPoint.distanceTo(clickPoint) < IconLabel.RADIUS_PX;
	    }
	    onClick(e) {
	        for (const listener of this.clickListeners) {
	            listener(e);
	        }
	    }
	    measureIcon(icon) {
	        return this.textMeasurer.measureOneLine(icon, ICON_FONT);
	    }
	}
	IconLabel.RADIUS_PX = 14;
	IconLabel.BORDER_PX = 2;
	IconLabel.ICON_VERTICAL_OFFSET_PX = 1;
	IconLabel.BORDER_COLOR = "#cccccc";
	IconLabel.BACKGROUND_COLOR = "#ffffff";
	IconLabel.ICON_COLOR = "#000000";
	IconLabel.CLOSED_BORDER_COLOR = "#757575";
	IconLabel.CLOSED_BACKGROUND_COLOR = "#a7a7a7";
	IconLabel.CLOSED_ICON_COLOR = "#c93d3d";

	class LabelLayer extends leafletSrc.GridLayer {
	    constructor(logger, options) {
	        super(options);
	        this.logger = logger;
	        this.labels = options.labels;
	        this.visibleLabels = new Map();
	        this.tileCache = new Map();
	    }
	    createTile(coords) {
	        var _a;
	        const cachedTile = this.tileCache.get(JSON.stringify(coords));
	        if (cachedTile !== undefined) {
	            return cachedTile;
	        }
	        const tileSize = this.getTileSize();
	        const pixelRatio = devicePixelRatio !== null && devicePixelRatio !== void 0 ? devicePixelRatio : 1;
	        const tile = (h("canvas", { width: tileSize.x * pixelRatio, height: tileSize.y * pixelRatio }));
	        const ctx = tile.getContext("2d");
	        if (ctx !== null) {
	            ctx.scale(pixelRatio, pixelRatio);
	            ctx.font = LABEL_FONT;
	            const tileTopLeftPoint = coords.scaleBy(tileSize);
	            const tileCenterPoint = coords
	                .add(leafletSrc.point(0.5, 0.5))
	                .scaleBy(tileSize);
	            const tileCenter = this._map.unproject(tileCenterPoint, coords.z);
	            const visibleLabels = (_a = this.visibleLabels.get(coords.z)) !== null && _a !== void 0 ? _a : new VisibleLabels(this.labels, coords.z, this._map);
	            this.visibleLabels.set(coords.z, visibleLabels);
	            const renderableLabels = visibleLabels.getLabels(tileSize, tileCenter);
	            for (const label of renderableLabels) {
	                const latLng = label.getCenter();
	                const point = this._map.project(latLng, coords.z);
	                const canvasPoint = point.subtract(tileTopLeftPoint);
	                label.render(ctx, canvasPoint);
	            }
	        }
	        else {
	            // TODO: Tell user to use reasonable browser
	            this.logger.logError("cannot get 2d canvas context in LabelLayer");
	        }
	        this.tileCache.set(JSON.stringify(coords), tile);
	        return tile;
	    }
	    getEvents() {
	        const events = super.getEvents ? super.getEvents() : {};
	        // Prevent layers from being invalidated after panning
	        delete events["viewprereset"];
	        events["click"] = (e) => {
	            const me = e;
	            lib.fromMap(this.visibleLabels, this._map.getZoom()).ifSome((visibleLabels) => {
	                const clickedLabels = visibleLabels
	                    .getLabels(leafletSrc.point(1, 1), me.latlng)
	                    .filter((label) => isClickable(label) &&
	                    label.didClick(me, this._map, this._map.getZoom()));
	                if (clickedLabels.length > 0) {
	                    clickedLabels[0].onClick(me);
	                }
	            });
	        };
	        return events;
	    }
	}
	class VisibleLabels {
	    constructor(labels, zoom, map) {
	        this.zoom = zoom;
	        this.map = map;
	        const visibleLabels = new rbush();
	        const visibleLabelsEntries = [];
	        for (const label of labels) {
	            const bbox = this.bboxFrom(label);
	            bbox.maxX += LABEL_MIN_SPACING_PX;
	            bbox.maxY += LABEL_MIN_SPACING_PX;
	            bbox.minX -= LABEL_MIN_SPACING_PX;
	            bbox.minY -= LABEL_MIN_SPACING_PX;
	            if (!visibleLabels.collides(bbox)) {
	                const entry = this.rBushEntryFrom(label);
	                visibleLabels.insert(entry);
	                visibleLabelsEntries.push(entry);
	            }
	        }
	        this.visibleLabelIndex = new rbush();
	        this.visibleLabelIndex.load(visibleLabelsEntries);
	    }
	    getLabels(within, center) {
	        // TODO: Replace 100 with a number calculated as the max label bbox width/height
	        const bbox = this.bbox(within, center);
	        return this.visibleLabelIndex.search(bbox).map((entry) => entry.label);
	    }
	    rBushEntryFrom(label) {
	        const bbox = this.bboxFrom(label);
	        bbox.label = label;
	        return bbox;
	    }
	    bboxFrom(label) {
	        return this.bbox(label.getSize(), label.getCenter());
	    }
	    bbox(size, center) {
	        const pointSize = leafletSrc.point(size);
	        const centerToCorner = pointSize.multiplyBy(0.5);
	        const labelPoint = this.map.project(center, this.zoom);
	        const topLeftPoint = labelPoint.subtract(centerToCorner);
	        const bottomRightPoint = labelPoint.add(centerToCorner);
	        const topLeft = this.map.unproject(topLeftPoint, this.zoom);
	        const bottomRight = this.map.unproject(bottomRightPoint, this.zoom);
	        return {
	            minX: topLeft.lng,
	            maxX: bottomRight.lng,
	            minY: bottomRight.lat,
	            maxY: topLeft.lat,
	        };
	    }
	}
	function isClickable(label) {
	    return ("addClickListener" in label && "didClick" in label && "onClick" in label);
	}

	class TextLabel {
	    constructor(textMeasurer, center, content) {
	        this.center = center;
	        const lines = content.split(" ");
	        const [size, lineSizes] = textMeasurer.measureLines(lines, LABEL_LINE_SPACING_PX, LABEL_FONT);
	        this.size = size;
	        this.linesSizes = zip(lines, lineSizes);
	    }
	    getSize() {
	        return this.size;
	    }
	    getCenter() {
	        return this.center;
	    }
	    render(ctx, centeredAt) {
	        ctx.font = LABEL_FONT;
	        ctx.textAlign = "center";
	        ctx.fillStyle = "#ffffff";
	        this.renderLines(this.linesSizes, ctx, centeredAt.add(leafletSrc.point(1, 1)));
	        this.renderLines(this.linesSizes, ctx, centeredAt.add(leafletSrc.point(1, -1)));
	        this.renderLines(this.linesSizes, ctx, centeredAt.add(leafletSrc.point(-1, -1)));
	        this.renderLines(this.linesSizes, ctx, centeredAt.add(leafletSrc.point(-1, 1)));
	        ctx.fillStyle = "#000000";
	        this.renderLines(this.linesSizes, ctx, centeredAt);
	    }
	    renderLines(linesSizes, ctx, centeredAt) {
	        const lineTopLeft = centeredAt.subtract(this.size.divideBy(2));
	        for (const [line, size] of linesSizes) {
	            const left = lineTopLeft.x + this.size.x / 2;
	            const bottom = lineTopLeft.y + size.y;
	            ctx.fillText(line, left, bottom);
	            lineTopLeft.y += size.y + LABEL_LINE_SPACING_PX;
	        }
	    }
	}

	class RoomLabel extends leafletSrc.LayerGroup {
	    constructor(map, mapController, settings, logger, textMeasurer, floorNumber, options) {
	        super([], options);
	        this.settings = settings;
	        this.logger = logger;
	        this.textMeasurer = textMeasurer;
	        this.floorNumber = floorNumber;
	        this.options = options;
	        this.removeWatcher = lib.None;
	        // First room will be least important, last will be most important
	        // Later rooms' labels will end up on top of earlier rooms'
	        // So this prioritizes more important rooms
	        const rooms = map
	            .getAllRooms()
	            .sort((a, b) => b.estimateImportance() - a.estimateImportance());
	        const vertices = map
	            .getGraph()
	            .getIdsAndVertices()
	            .map(([_id, vertex]) => vertex);
	        const infrastructureLabels = [];
	        const emergencyLabels = [];
	        const closedLabels = [];
	        const outlines = [];
	        const labels = [];
	        for (const room of rooms) {
	            if (room.center.getFloor() === floorNumber) {
	                if (room.outline.length !== 0) {
	                    const outline = new Outline(room.outline.map((point) => leafletSrc.latLng(point[1], point[0])));
	                    outline.addClickListener(() => mapController.focusOnDefinition(room));
	                    outlines.push(outline);
	                }
	                else {
	                    console.log(`Room has no outline: ${room.getName()}`);
	                }
	                const roomLabel = this.getRoomLabel(room);
	                if (isClickable(roomLabel)) {
	                    roomLabel.addClickListener(() => mapController.focusOnDefinition(room));
	                }
	                if (room.isInfrastructure()) {
	                    infrastructureLabels.push(roomLabel);
	                }
	                else if (room.isEmergency()) {
	                    emergencyLabels.push(roomLabel);
	                }
	                else if (room.isClosed()) {
	                    closedLabels.push(roomLabel);
	                }
	                else {
	                    labels.push(roomLabel);
	                }
	            }
	        }
	        vertices
	            .filter((vertex) => vertex.getLocation().getFloor() === floorNumber)
	            .forEach((vertex) => this.getVertexLabel(vertex).ifSome((label) => labels.push(label)));
	        this.normalLabels = labels;
	        this.infrastructureLabels = infrastructureLabels;
	        this.emergencyLabels = emergencyLabels;
	        this.closedLabels = closedLabels;
	        // Wait for FontAwesome to load so icons render properly
	        const fontAwesome = new fontfaceobserver_standalone("Font Awesome 5 Free", {
	            weight: 900,
	        });
	        fontAwesome.load("\uf462").then(() => {
	            const outlineLayer = new OutlineLayer({
	                outlines: outlines,
	                minZoom: -Infinity,
	                maxZoom: Infinity,
	                minNativeZoom: this.options.minNativeZoom,
	                maxNativeZoom: this.options.maxNativeZoom,
	                bounds: this.options.bounds,
	                pane: "overlayPane",
	                tileSize: 2048,
	            }, logger);
	            super.addLayer(outlineLayer);
	            this.createLabelLayer();
	            const recreateLabelLayer = () => this.createLabelLayer();
	            settings.addWatcher("show-infrastructure", recreateLabelLayer, false);
	            settings.addWatcher("show-emergency", recreateLabelLayer, false);
	            settings.addWatcher("show-closed", recreateLabelLayer, false);
	        });
	    }
	    createLabelLayer() {
	        let labels = this.normalLabels;
	        if (this.settings.getData("show-infrastructure").unwrap()) {
	            labels = labels.concat(this.infrastructureLabels);
	        }
	        if (this.settings.getData("show-emergency").unwrap()) {
	            labels = labels.concat(this.emergencyLabels);
	        }
	        if (this.settings.getData("show-closed").unwrap()) {
	            labels = labels.concat(this.closedLabels);
	        }
	        if (this.labelLayer !== undefined) {
	            super.removeLayer(this.labelLayer);
	        }
	        this.labelLayer = new LabelLayer(this.logger, {
	            minZoom: -Infinity,
	            maxZoom: Infinity,
	            pane: "overlayPane",
	            tileSize: 2048,
	            labels: labels,
	            minNativeZoom: this.options.minNativeZoom,
	            maxNativeZoom: this.options.maxNativeZoom,
	            bounds: this.options.bounds,
	        });
	        super.addLayer(this.labelLayer);
	    }
	    getFloorNumber() {
	        return this.floorNumber;
	    }
	    onAdd(map) {
	        super.onAdd(map);
	        const watcher = (shouldShowUnknown) => {
	            const shouldShow = shouldShowUnknown;
	            if (shouldShow) {
	                super.onAdd(map);
	            }
	            else {
	                super.onRemove(map);
	            }
	        };
	        this.settings.addWatcher("show-markers", watcher);
	        this.removeWatcher = lib.Some(watcher);
	        return this;
	    }
	    onRemove(map) {
	        super.onRemove(map);
	        this.settings.removeWatcher("show-markers", this.removeWatcher.unwrap());
	        this.removeWatcher = lib.None;
	        return this;
	    }
	    static getIcon(pairs, tags) {
	        return pairs
	            .map(([tag, icon]) => (tags.includes(tag) ? lib.Some(icon) : lib.None))
	            .reduce((acc, className) => acc.or(className));
	    }
	    getRoomLabel(room) {
	        const icon = RoomLabel.getIcon(ICON_FOR_ROOM_TAG, room.getTags());
	        return icon.match({
	            some: (icon) => {
	                return new IconLabel(this.textMeasurer, room.center.getXY(), icon, room.hasTag(DefinitionTag.Closed));
	            },
	            none: () => {
	                const text = room.getShortName();
	                return new TextLabel(this.textMeasurer, room.center.getXY(), text);
	            },
	        });
	    }
	    getVertexLabel(vertex) {
	        return RoomLabel.getIcon(ICON_FOR_VERTEX_TAG, vertex.getTags()).map((icon) => new IconLabel(this.textMeasurer, vertex.getLocation().getXY(), icon, false));
	    }
	}

	class RoomLabelFactory {
	    constructor(mapData, mapController, settings, logger, textMeasurer) {
	        this.mapData = mapData;
	        this.mapController = mapController;
	        this.settings = settings;
	        this.logger = logger;
	        this.textMeasurer = textMeasurer;
	    }
	    build(floorNumber, options) {
	        return new RoomLabel(this.mapData, this.mapController, this.settings, this.logger, this.textMeasurer, floorNumber, options);
	    }
	}
	RoomLabelFactory.inject = [
	    "mapData",
	    "mapController",
	    "settings",
	    "logger",
	    "textMeasurer",
	];

	/**
	 * Represents a building location with entrance(s) that may be distinct from its center point.
	 */
	class BuildingLocationWithEntrances extends BuildingLocation {
	    /**
	     * @param center Single point that represents the location, usually its center. Used as the only entrance iff there
	     * are no provided entrances.
	     * @param entrances Location of entrance(s). If any are specified, the center is not treated as an entrance unless
	     * it is included in this list. If none are specified, the center is treated as the only entrance.
	     */
	    constructor(center, entrances) {
	        super(center.getXY(), center.getFloor());
	        this.entrances = entrances;
	    }
	    getEntrances() {
	        // Use the room's center as the entrance if we don't have an actual entrance
	        if (this.entrances.length === 0) {
	            return [this];
	        }
	        return this.entrances;
	    }
	}

	/** Represents a rectangular area on one floor */
	class BuildingLocationBBox {
	    constructor(bottomLeft, topRight, floor) {
	        this.bottomLeft = bottomLeft;
	        this.topRight = topRight;
	        this.floor = floor;
	    }
	    static fromPoints(points, floor) {
	        const xs = points.map((point) => point.lng);
	        const maxX = Math.max(...xs);
	        const minX = Math.min(...xs);
	        const ys = points.map((point) => point.lat);
	        const maxY = Math.max(...ys);
	        const minY = Math.min(...ys);
	        const bottomLeft = leafletSrc.latLng(minX, minY);
	        const topRight = leafletSrc.latLng(maxX, maxY);
	        return new BuildingLocationBBox(bottomLeft, topRight, floor);
	    }
	    getBottomLeft() {
	        return this.bottomLeft;
	    }
	    getTopRight() {
	        return this.topRight;
	    }
	    getFloor() {
	        return this.floor;
	    }
	    toLatLngBounds() {
	        return leafletSrc.latLngBounds(this.bottomLeft, this.topRight);
	    }
	}

	class LocationOnlyDefinition {
	    constructor(location, alternateNames = []) {
	        this.location = location;
	        this.alternateNames = alternateNames;
	    }
	    getBoundingBox() {
	        return new BuildingLocationBBox(this.location.getXY(), this.location.getXY(), this.location.getFloor());
	    }
	    getLocation() {
	        return this.location;
	    }
	    getName() {
	        return "";
	    }
	    getAlternateNames() {
	        return this.alternateNames;
	    }
	    getDescription() {
	        return "";
	    }
	    getTags() {
	        return [];
	    }
	    hasTag(_tag) {
	        return false;
	    }
	    extendedWithAlternateName(name) {
	        const newNames = deepCopy(this.alternateNames);
	        newNames.push(name);
	        return new LocationOnlyDefinition(this.location, newNames);
	    }
	}

	class LeafletMapController {
	    constructor(view, model, mapData, geocoder, logger, events) {
	        this.view = view;
	        this.model = model;
	        this.mapData = mapData;
	        this.logger = logger;
	        events.on("clickResult", (result) => {
	            geocoder
	                .getDefinitionFromName(result.name)
	                .ifSome((definition) => view.focusOnDefinition(definition));
	        });
	        events.on("clickClosestButton", (closest, starting) => {
	            const entranceLocation = new BuildingLocationWithEntrances(starting, []);
	            const startingDefinition = new LocationOnlyDefinition(entranceLocation);
	            this.navigateFrom(lib.Some(startingDefinition), true);
	            this.view.focusOnDefinition(closest);
	        });
	        events.on("swapNav", () => {
	            const from = this.model.navigateFrom;
	            this.navigateFrom(this.model.navigateTo, true);
	            this.navigateTo(from, true);
	        });
	        events.on("clickNavigateFromSuggestion", (suggestion) => {
	            const definition = geocoder
	                .getDefinitionFromName(suggestion.name)
	                .unwrap();
	            this.navigateFrom(lib.Some(definition), true);
	        });
	        events.on("clickNavigateToSuggestion", (suggestion) => {
	            const definition = geocoder
	                .getDefinitionFromName(suggestion.name)
	                .unwrap();
	            this.navigateTo(lib.Some(definition), true);
	        });
	        events.on("clickClosestButton", (closestDefinition, starting) => {
	            geocoder
	                .getClosestDefinition(new BuildingLocationWithEntrances(starting, []))
	                .ifSome((startingDefinition) => {
	                this.navigateFrom(lib.Some(startingDefinition), true);
	                this.navigateTo(lib.Some(closestDefinition), true);
	            });
	        });
	        events.on("dragToPin", (location) => {
	            const definition = geocoder.getClosestDefinition(new BuildingLocationWithEntrances(location, []));
	            this.navigateTo(definition, false);
	        });
	        events.on("dragFromPin", (location) => {
	            const definition = geocoder.getClosestDefinition(new BuildingLocationWithEntrances(location, []));
	            this.navigateFrom(definition, false);
	        });
	        events.on("clickNavigateToDefinitionButton", (definition) => {
	            this.navigateTo(lib.Some(definition), true);
	        });
	        events.on("clickFocusDefinitionButton", (definition) => {
	            this.focusOnDefinition(definition);
	        });
	        view.setSnapPinHandler((location) => {
	            const definition = geocoder.getClosestDefinition(new BuildingLocationWithEntrances(location, []));
	            return definition
	                .map((definition) => definition.getLocation())
	                .unwrapOr(location);
	        });
	    }
	    moveFromPin(location) {
	        this.view.moveFromPin(location);
	    }
	    moveToPin(location) {
	        this.view.moveToPin(location);
	    }
	    focusOnDefinition(definition) {
	        this.view.focusOnDefinition(definition);
	    }
	    calcNav(from, to) {
	        this.view.clearNav();
	        const path = this.mapData.findBestPath(from, to);
	        path.ifSome((path) => {
	            const resPathLayers = this.mapData.createLayerGroupsFromPath(path);
	            resPathLayers.match({
	                ok: (pathLayers) => this.view.displayNav(pathLayers),
	                err: (error) => this.logger.logError(`Error in NavigationPane.calcNav: ${error}`),
	            });
	        });
	    }
	    calcNavIfNeeded() {
	        this.model.navigateFrom.ifSome((from) => this.model.navigateTo.ifSome((to) => this.calcNav(from, to)));
	    }
	    navigateFrom(definition, movePin) {
	        this.model.navigateFrom = definition;
	        definition.ifSome((definition) => {
	            if (movePin) {
	                this.moveFromPin(definition.getLocation());
	            }
	            this.view.setNavigateFromInputContents(definition.getName());
	        });
	        this.calcNavIfNeeded();
	    }
	    navigateTo(definition, movePin) {
	        this.model.navigateTo = definition;
	        definition.ifSome((definition) => {
	            if (movePin) {
	                this.moveToPin(definition.getLocation());
	            }
	            this.view.setNavigateToInputContents(definition.getName());
	        });
	        this.view.clearNavSuggestions();
	        this.calcNavIfNeeded();
	    }
	}
	LeafletMapController.inject = [
	    "mapView",
	    "mapModel",
	    "mapData",
	    "geocoder",
	    "logger",
	    "events",
	];

	class LeafletMapModel {
	    constructor() {
	        this.navigateFrom = lib.None;
	        this.navigateTo = lib.None;
	    }
	}
	LeafletMapModel.inject = [];

	class LeafletMapView {
	    constructor(map, floors, sidebar) {
	        this.map = map;
	        this.floors = floors;
	        this.sidebar = sidebar;
	    }
	    moveFromPin(location) {
	        this.sidebar.moveFromPin(location);
	    }
	    moveToPin(location) {
	        this.sidebar.moveToPin(location);
	    }
	    setNavigateFromInputContents(contents) {
	        this.sidebar.setNavigateFromInputContents(contents);
	    }
	    setNavigateToInputContents(contents) {
	        this.sidebar.setNavigateToInputContents(contents);
	    }
	    /** Remove search suggestions from typing in the navigate from or to fields */
	    clearNavSuggestions() {
	        this.sidebar.clearNavSuggestions();
	    }
	    /**
	     * Set the callback for snapping the pin's location when it isn't being dragged. Defaults to the identity function,
	     * ie. no snapping.
	     * @param snapPin The callback, which takes in the location of the pin and returns the location to snap to
	     */
	    setSnapPinHandler(snapPin) {
	        this.sidebar.setSnapPinHandler(snapPin);
	    }
	    goToDefinition(definition) {
	        const location = definition.getLocation();
	        this.map.fitBounds(definition.getBoundingBox().toLatLngBounds().pad(0.1));
	        this.floors.setFloor(location.getFloor());
	    }
	    focusOnDefinition(definition) {
	        this.goToDefinition(definition);
	        this.sidebar.openInfoFor(definition);
	    }
	    clearNav() {
	        this.sidebar.clearNav();
	    }
	    displayNav(layers) {
	        this.sidebar.displayNav(layers);
	    }
	}
	LeafletMapView.inject = ["map", "floors", "sidebar"];

	function genButtonIcon(iconClass, onClickHandler, title) {
	    const button = document.createElement("a");
	    button.classList.add("button");
	    button.setAttribute("href", "#");
	    if (title) {
	        button.setAttribute("title", title);
	    }
	    if (onClickHandler !== undefined) {
	        button.addEventListener("click", onClickHandler);
	    }
	    const icon = document.createElement("i");
	    icon.classList.add("fas");
	    icon.classList.add(iconClass);
	    button.appendChild(icon);
	    return button;
	}
	function genTextInput(placeholder, content, border = true) {
	    const inputEl = document.createElement("input");
	    inputEl.classList.add("leaflet-style");
	    inputEl.classList.add("search-bar");
	    inputEl.setAttribute("type", "text");
	    if (placeholder) {
	        inputEl.setAttribute("placeholder", placeholder);
	    }
	    if (!border) {
	        inputEl.classList.add("no-border");
	    }
	    if (content) {
	        inputEl.value = content;
	    }
	    return inputEl;
	}
	function genPaneElement(title, content) {
	    const pane = document.createElement("div");
	    pane.classList.add("leaflet-sidebar-pane");
	    const header = document.createElement("h1");
	    header.classList.add("leaflet-sidebar-header");
	    pane.appendChild(header);
	    const titleNode = document.createTextNode(title);
	    header.appendChild(titleNode);
	    const closeSpan = document.createElement("span");
	    closeSpan.classList.add("leaflet-sidebar-close");
	    header.appendChild(closeSpan);
	    const closeIcon = document.createElement("i");
	    closeIcon.classList.add("fas");
	    closeIcon.classList.add("fa-caret-left");
	    closeSpan.appendChild(closeIcon);
	    if (Array.isArray(content)) {
	        for (const el of content) {
	            pane.appendChild(el);
	        }
	    }
	    else {
	        pane.appendChild(content);
	    }
	    return pane;
	}

	class Pane {
	    getPosition() {
	        return "top";
	    }
	    getPanelOptions() {
	        return {
	            id: this.getPaneId(),
	            tab: `<i class="fas ${this.getPaneIconClass()}"></i>`,
	            title: this.getPaneTitle(),
	            pane: this.getPaneElement(),
	            position: this.getPosition(),
	        };
	    }
	}

	class HelpPane extends Pane {
	    constructor() {
	        super();
	        const contents = (h("div", null,
	            h("h2", null, "Contributors"),
	            h("ul", null,
	                h("li", null, "Nathan Varner '21"),
	                h("li", null, "Nate Hollingsworths '21"),
	                h("li", null, "Elizabeth Qiu '22"),
	                h("li", null, "Samuel Segal '22")),
	            h("ul", null,
	                h("p", null, "Have questions or feedback? Let us know at wchsmap@gmail.com"),
	                h("p", null, "Join the Churchill Stem Club by texting \"@hellostem\" to 81010, or by visiting https://rmd.at/hellostem"))));
	        this.pane = genPaneElement("Help", contents);
	    }
	    getPaneId() {
	        return "help";
	    }
	    getPaneIconClass() {
	        return "fa-question-circle";
	    }
	    getPaneTitle() {
	        return "Help";
	    }
	    getPaneElement() {
	        return this.pane;
	    }
	    getPosition() {
	        return "bottom";
	    }
	}
	HelpPane.inject = [];

	class Logger {
	    constructor() {
	        this.queue = [];
	        this.logPane = lib.None;
	    }
	    log(logData) {
	        this.logPane.match({
	            some: (logPane) => {
	                logPane.log(logData);
	            },
	            none: () => {
	                this.queue.push(lib.Left(logData));
	            },
	        });
	        console.log(logData);
	    }
	    logError(logData) {
	        this.logPane.match({
	            some: (logPane) => {
	                logPane.logError(logData);
	            },
	            none: () => {
	                this.queue.push(lib.Right(logData));
	            },
	        });
	        console.error(logData);
	    }
	    associateWithLogPane(logPane) {
	        this.queue.forEach((queued) => queued.match({
	            left: (logData) => logPane.log(logData),
	            right: (logData) => logPane.logError(logData),
	        }));
	        this.queue = [];
	        this.logPane = lib.Some(logPane);
	    }
	}
	class LogPane extends Pane {
	    constructor(logs, pane) {
	        super();
	        this.logs = logs;
	        this.pane = pane;
	    }
	    static new() {
	        const logs = h("ul", null);
	        const pane = genPaneElement("Log", logs);
	        return new LogPane(logs, pane);
	    }
	    log(logData) {
	        const logElement = h("li", null, logData);
	        this.logs.appendChild(logElement);
	    }
	    logError(logData) {
	        // TODO: Include styling to make these stand out
	        const logElement = h("li", { className: "error" }, logData);
	        this.logs.appendChild(logElement);
	    }
	    getPaneId() {
	        return "log";
	    }
	    getPaneIconClass() {
	        return "fa-stream";
	    }
	    getPaneTitle() {
	        return "Log Pane";
	    }
	    getPaneElement() {
	        return this.pane;
	    }
	    getPosition() {
	        return "bottom";
	    }
	}

	/**
	 * Font Awesome Icon element. The class name's visual similarity to "Falcon" with some fonts is unintentional but should
	 * be appreciated.
	 * @see FaIconProps
	 */
	class FaIcon {
	    render(props, _children) {
	        if (props !== null) {
	            return h("i", { className: `fas fa-${props.faClass}` });
	        }
	        else {
	            throw new Error("FA icon must have required properties");
	        }
	    }
	}

	class ResultClearer {
	    constructor() {
	        this.clearFunctions = [];
	    }
	    linkRoomSearchBox(clearFunction) {
	        this.clearFunctions.push(clearFunction);
	    }
	    clear() {
	        this.clearFunctions.forEach((clear) => clear());
	    }
	}

	class DomUtils {
	    static clearChildren(parent) {
	        while (parent.firstChild !== null) {
	            parent.removeChild(parent.firstChild);
	        }
	    }
	}

	/**
	 * Styled standard textbox
	 * @see TextBoxProps for property documentation
	 */
	class TextBox {
	    // eslint-disable-next-line complexity
	    render(props, _children) {
	        const inputEl = (h("input", { className: "leaflet-style", type: "text" }));
	        if (props !== null) {
	            if ("placeholder" in props && props.placeholder !== undefined) {
	                inputEl.setAttribute("placeholder", props.placeholder);
	            }
	            if ("border" in props &&
	                props.border !== undefined &&
	                !props.border) {
	                inputEl.classList.add("no-border");
	            }
	            if (props.noBottomMargin !== undefined && props.noBottomMargin) {
	                inputEl.classList.add("no-bottom-margin");
	            }
	            if ("content" in props && props.content !== undefined) {
	                inputEl.value = props.content;
	            }
	            inputEl.addEventListener("input", () => {
	                if ("onInput" in props && props.onInput !== undefined) {
	                    props.onInput(inputEl.value);
	                }
	            });
	            inputEl.addEventListener("keydown", (e) => {
	                if (props.onKeydown !== undefined) {
	                    props.onKeydown(e);
	                }
	            });
	            if (props.linkToWriter !== undefined) {
	                props.linkToWriter.linkToInput(inputEl);
	            }
	        }
	        return inputEl;
	    }
	}

	/**
	 * Writes to text boxes (ie. changing their content). Should be linked by passing an instance as a property.
	 */
	class TextBoxWriter {
	    constructor() {
	        this.inputs = [];
	    }
	    linkToInput(input) {
	        this.inputs.push(input);
	    }
	    write(contents) {
	        this.inputs.forEach((input) => (input.value = contents));
	    }
	}

	/**
	 * Represents a search box with room search suggestions.
	 * @see RoomSearchBoxProps
	 */
	class RoomSearchBox {
	    clearResults() {
	        if (!this.resultContainer || !this.container) {
	            throw new Error("did not set all fields in RoomSearchBox");
	        }
	        this.resultContainer.classList.add("hidden");
	        this.container.classList.remove("showing-results");
	        DomUtils.clearChildren(this.resultContainer);
	        this.topResult = undefined;
	    }
	    chooseResult(result) {
	        if (!this.searchBox || !this.onChooseResult || !this.searchBoxWriter) {
	            throw new Error("did not set all fields in RoomSearchBox");
	        }
	        this.onChooseResult(result);
	        this.searchBoxWriter.write(result.name);
	        this.clearResults();
	        this.searchBox.focus();
	    }
	    createResultElement(result, icon) {
	        const onClick = () => {
	            this.chooseResult(result);
	        };
	        const resultElement = (h("li", { className: "search-result", onclick: onClick },
	            h("a", { href: "#" },
	                icon.cloneNode(),
	                result.name)));
	        const onNext = () => {
	            const nextSib = resultElement.nextSibling;
	            if (nextSib && nextSib.firstChild instanceof HTMLElement) {
	                nextSib.firstChild.focus();
	            }
	            else {
	                // Last result, so loop back to top
	                const ul = resultElement.parentElement;
	                if (ul &&
	                    ul.firstChild &&
	                    ul.firstChild.firstChild instanceof HTMLElement) {
	                    ul.firstChild.firstChild.focus();
	                }
	            }
	        };
	        const onPrev = () => {
	            const prevSib = resultElement.previousSibling;
	            if (prevSib && prevSib.firstChild instanceof HTMLElement) {
	                prevSib.firstChild.focus();
	            }
	            else {
	                // First result, so go to search box
	                if (this.searchBox) {
	                    this.searchBox.focus();
	                }
	            }
	        };
	        const onKeydown = (e) => {
	            if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
	                e.preventDefault();
	                onNext();
	            }
	            else if (e.key == "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
	                e.preventDefault();
	                onPrev();
	            }
	        };
	        resultElement.addEventListener("keydown", onKeydown);
	        return resultElement;
	    }
	    updateWithResults(query, resultIcon, results) {
	        if (!this.container || !this.resultContainer) {
	            throw new Error("did not set all fields in RoomSearchBox");
	        }
	        this.clearResults();
	        if (query === "") {
	            return;
	        }
	        this.resultContainer.classList.remove("hidden");
	        this.container.classList.add("showing-results");
	        const list = h("ul", null);
	        if (results.length > 0) {
	            this.topResult = results[0];
	            for (const result of results) {
	                const resultElement = this.createResultElement(result, resultIcon.cloneNode());
	                list.appendChild(resultElement);
	            }
	        }
	        else {
	            const container = h("li", { className: "no-results" }, "No results");
	            list.appendChild(container);
	        }
	        this.resultContainer.appendChild(list);
	    }
	    async handleInput(query, maxResults, resultIcon, geocoder) {
	        let results = await geocoder.getSuggestionsFrom(query);
	        if (maxResults >= 0) {
	            results = results.slice(0, maxResults);
	        }
	        this.updateWithResults(query, resultIcon, results);
	    }
	    handleKeypressInInput(e) {
	        if (!this.resultContainer) {
	            throw new Error("did not set all fields in RoomSearchBox");
	        }
	        if (e.key === "ArrowDown") {
	            e.preventDefault();
	            const ul = this.resultContainer.firstChild;
	            if (ul &&
	                ul.firstChild &&
	                ul.firstChild.firstChild instanceof HTMLElement) {
	                ul.firstChild.firstChild.focus();
	            }
	        }
	        else if (e.key === "Enter") {
	            e.preventDefault();
	            if (this.topResult) {
	                this.chooseResult(this.topResult);
	            }
	        }
	    }
	    render(props, _children) {
	        const container = h("div", { className: "room-search-box" });
	        this.container = container;
	        const resultContainer = (h("div", { className: "results-wrapper leaflet-style hidden" }));
	        this.resultContainer = resultContainer;
	        const searchBoxWriter = props !== null && props.searchBoxWriter !== undefined
	            ? props.searchBoxWriter
	            : new TextBoxWriter();
	        this.searchBoxWriter = searchBoxWriter;
	        this.resultClearer =
	            props !== null && props.resultClearer !== undefined
	                ? props.resultClearer
	                : new ResultClearer();
	        this.resultClearer.linkRoomSearchBox(() => this.clearResults());
	        const onChooseResult = props
	            ? props.onChooseResult
	            : (_result) => {
	                // No handler specified, so do nothing
	            };
	        this.onChooseResult = onChooseResult;
	        this.searchBox = (h(TextBox, { noBottomMargin: true, onInput: (input) => {
	                if (props !== null) {
	                    const maxResults = props.maxResults === undefined
	                        ? RoomSearchBox.DEFAULT_MAX_RESULTS
	                        : props.maxResults;
	                    this.handleInput(input, maxResults, props.resultIcon, props.geocoder);
	                }
	            }, onKeydown: (e) => this.handleKeypressInInput(e), linkToWriter: searchBoxWriter }));
	        container.appendChild(this.searchBox);
	        container.appendChild(resultContainer);
	        return container;
	    }
	}
	/**
	 * Default maximum number of search suggestions to display
	 */
	RoomSearchBox.DEFAULT_MAX_RESULTS = 5;

	function flooredMarker(position, options) {
	    return new FlooredMarker(position, options);
	}
	class FlooredMarker extends leafletSrc.Marker {
	    constructor(position, options) {
	        super(position.getXY(), options);
	        this.floorNumber = position.getFloor();
	    }
	    getFloorNumber() {
	        return this.floorNumber;
	    }
	    setLocation(location) {
	        this.setLatLng(location.getXY());
	        this.floorNumber = location.getFloor();
	    }
	    getLocation() {
	        return new BuildingLocation(this.getLatLng(), this.getFloorNumber());
	    }
	}

	class NavigationPane extends Pane {
	    constructor(floors, map, geocoder, events) {
	        super();
	        this.floors = floors;
	        this.map = map;
	        this.events = events;
	        this.snapPinHandler = (location) => location;
	        this.pathLayers = new Set();
	        this.fromToResultClearer = new ResultClearer();
	        this.fromPin = lib.None;
	        this.toPin = lib.None;
	        const fromPinButton = (h("a", { className: "leaflet-style button", href: "#", role: "button", title: "Choose starting point" },
	            h(FaIcon, { faClass: "map-marker-alt" })));
	        this.fromInputWriter = new TextBoxWriter();
	        const toPinButton = (h("a", { className: "leaflet-style button", href: "#", role: "button", title: "Choose destination" },
	            h("i", { className: "fas fa-flag-checkered" })));
	        this.toInputWriter = new TextBoxWriter();
	        const swapToFrom = (h("a", { className: "leaflet-style button swap-button", href: "#", role: "button", title: "Swap to/from" },
	            h(FaIcon, { faClass: "exchange-alt" })));
	        const toFromContainer = (h("div", { className: "navigation-container" },
	            h("div", { className: "directions-container" },
	                h("div", { className: "direction-container" },
	                    h("label", { className: "leaflet-style no-border" }, "From"),
	                    fromPinButton,
	                    h(RoomSearchBox, { geocoder: geocoder, resultIcon: h(FaIcon, { faClass: "location-arrow" }), onChooseResult: (result) => {
	                            this.events.trigger("clickNavigateFromSuggestion", result);
	                        }, searchBoxWriter: this.fromInputWriter, resultClearer: this.fromToResultClearer })),
	                h("div", { className: "direction-container" },
	                    h("label", { className: "leaflet-style no-border" }, "To"),
	                    toPinButton,
	                    h(RoomSearchBox, { geocoder: geocoder, resultIcon: h(FaIcon, { faClass: "location-arrow" }), onChooseResult: (result) => {
	                            this.events.trigger("clickNavigateToSuggestion", result);
	                        }, searchBoxWriter: this.toInputWriter, resultClearer: this.fromToResultClearer }))),
	            swapToFrom));
	        this.pane = genPaneElement("Navigation", toFromContainer);
	        fromPinButton.addEventListener("click", (_event) => {
	            const pinLocation = new BuildingLocation(this.map.getCenter(), this.floors.getCurrentFloor());
	            this.createFromPin(pinLocation);
	        });
	        toPinButton.addEventListener("click", (_event) => {
	            const pinLocation = new BuildingLocation(this.map.getCenter(), this.floors.getCurrentFloor());
	            this.createToPin(pinLocation);
	        });
	        swapToFrom.addEventListener("click", (_event) => this.swapNav());
	    }
	    getPaneId() {
	        return "nav";
	    }
	    getPaneIconClass() {
	        return "fa-location-arrow";
	    }
	    getPaneTitle() {
	        return "Navigation";
	    }
	    getPaneElement() {
	        return this.pane;
	    }
	    swapNav() {
	        this.events.trigger("swapNav");
	    }
	    /**
	     * Create and add the from pin, or delete and recreate it if it exists
	     */
	    createFromPin(location, snap = true) {
	        this.fromPin.ifSome((pin) => {
	            this.floors.removeLayer(pin);
	        });
	        const pin = this.genFromPin(location, snap);
	        pin.addTo(this.floors);
	        this.fromPin = lib.Some(pin);
	    }
	    /**
	     * Create and add the to pin, or delete and recreate it if it exists
	     */
	    createToPin(location, snap = true) {
	        this.toPin.ifSome((pin) => {
	            this.floors.removeLayer(pin);
	        });
	        const pin = this.genToPin(location, snap);
	        pin.addTo(this.floors);
	        this.toPin = lib.Some(pin);
	    }
	    /** Remove search suggestions from typing in the navigate from or to fields */
	    clearNavSuggestions() {
	        this.fromToResultClearer.clear();
	    }
	    clearNav() {
	        this.pathLayers.forEach((layer) => this.floors.removeLayer(layer));
	    }
	    displayNav(layers) {
	        this.pathLayers = layers;
	        this.pathLayers.forEach((layer) => this.floors.addLayer(layer));
	    }
	    moveFromPin(location, snap = true) {
	        this.createFromPin(location, snap);
	    }
	    moveToPin(location, snap = true) {
	        this.createToPin(location, snap);
	    }
	    setNavigateFromInputContents(contents) {
	        this.fromInputWriter.write(contents);
	    }
	    setNavigateToInputContents(contents) {
	        this.toInputWriter.write(contents);
	    }
	    /**
	     * Set the callback for snapping the pin's location when it isn't being dragged. Defaults to the identity function,
	     * ie. no snapping.
	     * @param snapPin The callback, which takes in the location of the pin and returns the location to snap to
	     */
	    setSnapPinHandler(snapPin) {
	        this.snapPinHandler = snapPin;
	    }
	    genFromPin(location, snap = true) {
	        if (snap) {
	            return this.genDraggableSnappingPin(location, "fa-map-marker-alt", (location) => this.events.trigger("dragFromPin", location), (location) => this.snapPinHandler(location));
	        }
	        else {
	            return this.genDraggablePin(location, "fa-map-marker-alt", (location) => this.events.trigger("dragFromPin", location));
	        }
	    }
	    genToPin(location, snap = true) {
	        if (snap) {
	            return this.genDraggableSnappingPin(location, "fa-flag-checkered", (location) => this.events.trigger("dragFromPin", location), (location) => this.snapPinHandler(location));
	        }
	        else {
	            return this.genDraggablePin(location, "fa-flag-checkered", (location) => this.events.trigger("dragFromPin", location));
	        }
	    }
	    /**
	     * Create a draggable pin that does not snap anywhere when released
	     * @param location Location to place the pin; note that the pin will be snapped before it is placed
	     * @param iconClass Class used for the icon
	     * @param onMove Called when the location of the pin changes, including while it is dragged and when it snaps
	     */
	    genDraggablePin(location, iconClass, onMove) {
	        const icon = h("i", { className: "fas" });
	        icon.classList.add(iconClass);
	        const pin = flooredMarker(location, {
	            draggable: true,
	            autoPan: true,
	            icon: leafletSrc.divIcon({
	                className: "draggable-pin",
	                html: icon,
	            }),
	        });
	        pin.on("move", (event) => {
	            // @ts-expect-error: event does have latlng for move event
	            const latLng = event.latlng;
	            const pinLocation = new BuildingLocation(latLng, pin.getFloorNumber());
	            onMove(pinLocation);
	        });
	        return pin;
	    }
	    /**
	     * Create a draggable pin that snaps to a new location when released
	     * @param location Location to place the pin; note that the pin will be snapped before it is placed
	     * @param iconClass Class used for the icon
	     * @param onMove Called when the location of the pin changes, including while it is dragged and when it snaps
	     * @param snapToDefinition Given an initial location, return a location that snaps the pin
	     */
	    genDraggableSnappingPin(location, iconClass, onMove, snapToDefinition) {
	        const pin = this.genDraggablePin(location, iconClass, onMove);
	        pin.on("dragend", (_event) => {
	            const snappedLocation = snapToDefinition(pin.getLocation());
	            pin.setLocation(snappedLocation);
	            onMove(snappedLocation);
	        });
	        return pin;
	    }
	}
	NavigationPane.inject = ["floors", "map", "geocoder", "events"];

	class ClosestDefinitionButton {
	    constructor(geocoder, locator, mapData, floorsLayer, predicate, iconClass, titleText, onGetClosest) {
	        this.geocoder = geocoder;
	        this.locator = locator;
	        this.mapData = mapData;
	        this.floorsLayer = floorsLayer;
	        this.predicate = predicate;
	        this.iconClass = iconClass;
	        this.titleText = titleText;
	        this.onGetClosest = onGetClosest;
	    }
	    getHtml() {
	        return (h("a", { href: "#", className: "leaflet-style button", onclick: () => this.handleClick(), title: this.titleText },
	            h("i", { className: this.iconClass })));
	    }
	    handleClick() {
	        if (this.locator.isNearChurchill()) {
	            this.locator.getLatestPosition().ifSome((position) => {
	                const starting = new BuildingLocation(position, this.floorsLayer.getCurrentFloor());
	                const closestOptional = this.geocoder.getClosestDefinitionToFilteredWithDistance(new BuildingLocationWithEntrances(starting, []), this.predicate, (from, to) => {
	                    const fromDef = new LocationOnlyDefinition(from);
	                    const toDef = new LocationOnlyDefinition(to);
	                    return this.mapData.findBestPathLength(fromDef, toDef);
	                });
	                closestOptional.ifSome((closest) => this.onGetClosest(closest, starting));
	            });
	        }
	    }
	}

	class ClosestAedButton extends ClosestDefinitionButton {
	    constructor(geocoder, locator, mapData, floorsLayer, onGetClosest) {
	        super(geocoder, locator, mapData, floorsLayer, (definition) => !definition.hasTag(DefinitionTag.Closed) &&
	            definition.hasTag(DefinitionTag.AED), "fas fa-heartbeat", "Nearest AED", onGetClosest);
	    }
	}

	class ClosestAhuButton extends ClosestDefinitionButton {
	    constructor(geocoder, locator, mapData, floorsLayer, onGetClosest) {
	        super(geocoder, locator, mapData, floorsLayer, (definition) => !definition.hasTag(DefinitionTag.Closed) &&
	            definition.hasTag(DefinitionTag.AHU), "fas fa-wind", "Nearest Air Handling Unit", onGetClosest);
	    }
	}

	class ClosestBathroomButton extends ClosestDefinitionButton {
	    constructor(geocoder, locator, settings, mapData, floorsLayer, onGetClosest) {
	        super(geocoder, locator, mapData, floorsLayer, (definition) => {
	            if (definition.hasTag(DefinitionTag.Closed))
	                return false;
	            const gender = settings.getData("bathroom-gender").unwrap();
	            if (gender === "m") {
	                return definition.hasTag(DefinitionTag.MenBathroom);
	            }
	            else if (gender === "w") {
	                return definition.hasTag(DefinitionTag.WomenBathroom);
	            }
	            else {
	                return (definition.hasTag(DefinitionTag.MenBathroom) ||
	                    definition.hasTag(DefinitionTag.WomenBathroom));
	            }
	        }, "fas fa-restroom", "Nearest Restroom", onGetClosest);
	    }
	}

	class ClosestBleedingControlKitButton extends ClosestDefinitionButton {
	    constructor(geocoder, locator, mapData, floorsLayer, onGetClosest) {
	        super(geocoder, locator, mapData, floorsLayer, (definition) => !definition.hasTag(DefinitionTag.Closed) &&
	            definition.hasTag(DefinitionTag.BleedControl), "fas fa-band-aid", "Nearest Bleeding Control Kit", onGetClosest);
	    }
	}

	class ClosestBottleFillingStationButton extends ClosestDefinitionButton {
	    constructor(geocoder, locator, mapData, floorsLayer, onGetClosest) {
	        super(geocoder, locator, mapData, floorsLayer, (definition) => !definition.hasTag(DefinitionTag.Closed) &&
	            definition.hasTag(DefinitionTag.WF), "fas fa-tint", "Nearest Bottle Filling Station", onGetClosest);
	    }
	}

	class ClosestBscButton extends ClosestDefinitionButton {
	    constructor(geocoder, locator, mapData, floorsLayer, onGetClosest) {
	        super(geocoder, locator, mapData, floorsLayer, (definition) => !definition.hasTag(DefinitionTag.Closed) &&
	            definition.hasTag(DefinitionTag.BSC), "fas fa-toilet-paper", "Nearest Bathroom Supply Closet", onGetClosest);
	    }
	}

	class ClosestEcButton extends ClosestDefinitionButton {
	    constructor(geocoder, locator, mapData, floorsLayer, onGetClosest) {
	        super(geocoder, locator, mapData, floorsLayer, (definition) => !definition.hasTag(DefinitionTag.Closed) &&
	            definition.hasTag(DefinitionTag.EC), "fas fa-bolt", "Nearest Electrical Closet", onGetClosest);
	    }
	}

	class ClosestHandSanitizerStationButton extends ClosestDefinitionButton {
	    constructor(geocoder, locator, mapData, floorsLayer, onGetClosest) {
	        super(geocoder, locator, mapData, floorsLayer, (definition) => !definition.hasTag(DefinitionTag.Closed) &&
	            definition.hasTag(DefinitionTag.HS), "fas fa-pump-soap", "Nearest Hand Sanitizer Station", onGetClosest);
	    }
	}

	class SearchPane extends Pane {
	    constructor(geocoder, locator, settings, mapData, floorsLayer, events) {
	        super();
	        const closestBathroomButton = new ClosestBathroomButton(geocoder, locator, settings, mapData, floorsLayer, (closest, starting) => events.trigger("clickClosestButton", closest, starting)).getHtml();
	        const closestBottleFillingButton = new ClosestBottleFillingStationButton(geocoder, locator, mapData, floorsLayer, (closest, starting) => events.trigger("clickClosestButton", closest, starting)).getHtml();
	        const closestHandSanitizerButton = new ClosestHandSanitizerStationButton(geocoder, locator, mapData, floorsLayer, (closest, starting) => events.trigger("clickClosestButton", closest, starting)).getHtml();
	        // Emergency
	        const closestBleedingControlKitButton = new ClosestBleedingControlKitButton(geocoder, locator, mapData, floorsLayer, (closest, starting) => events.trigger("clickClosestButton", closest, starting)).getHtml();
	        const closestAedButton = new ClosestAedButton(geocoder, locator, mapData, floorsLayer, (closest, starting) => events.trigger("clickClosestButton", closest, starting)).getHtml();
	        settings.addWatcher("show-emergency", (show) => {
	            if (show) {
	                closestBleedingControlKitButton.classList.remove("hidden");
	                closestAedButton.classList.remove("hidden");
	            }
	            else {
	                closestBleedingControlKitButton.classList.add("hidden");
	                closestAedButton.classList.add("hidden");
	            }
	        });
	        // Infrastructure
	        const closestAhuButton = new ClosestAhuButton(geocoder, locator, mapData, floorsLayer, (closest, starting) => events.trigger("clickClosestButton", closest, starting)).getHtml();
	        const closestEcButton = new ClosestEcButton(geocoder, locator, mapData, floorsLayer, (closest, starting) => events.trigger("clickClosestButton", closest, starting)).getHtml();
	        const closestBscButton = new ClosestBscButton(geocoder, locator, mapData, floorsLayer, (closest, starting) => events.trigger("clickClosestButton", closest, starting)).getHtml();
	        settings.addWatcher("show-infrastructure", (show) => {
	            if (show) {
	                closestAhuButton.classList.remove("hidden");
	                closestEcButton.classList.remove("hidden");
	                closestBscButton.classList.remove("hidden");
	            }
	            else {
	                closestAhuButton.classList.add("hidden");
	                closestEcButton.classList.add("hidden");
	                closestBscButton.classList.add("hidden");
	            }
	        });
	        const categoryButtonContainer = (h("div", { className: "wrapper" },
	            closestBathroomButton,
	            closestBottleFillingButton,
	            closestHandSanitizerButton,
	            closestBleedingControlKitButton,
	            closestAedButton,
	            closestAhuButton,
	            closestEcButton,
	            closestBscButton));
	        this.pane = genPaneElement("Search", [
	            h(RoomSearchBox, { resultIcon: h(FaIcon, { faClass: "search" }), geocoder: geocoder, onChooseResult: (result) => events.trigger("clickResult", result) }),
	            h("h2", null, "Find Nearest"),
	            categoryButtonContainer,
	        ]);
	    }
	    getPaneId() {
	        return "search";
	    }
	    getPaneIconClass() {
	        return "fa-search-location";
	    }
	    getPaneTitle() {
	        return "Search";
	    }
	    getPaneElement() {
	        return this.pane;
	    }
	}
	SearchPane.inject = [
	    "geocoder",
	    "locator",
	    "settings",
	    "mapData",
	    "floors",
	    "events",
	];

	class SettingsPane extends Pane {
	    constructor(settings) {
	        super();
	        this.settings = settings;
	        const settingsContainer = h("ul", { className: "wrapper settings-container" });
	        SETTING_SECTIONS.forEach(([category, categorySettings]) => {
	            const categorySettingsContainer = h("ul", null);
	            categorySettings
	                .map((name) => {
	                const container = h("li", { className: "setting-container" });
	                settings.addWatcher(name, (data) => {
	                    removeChildren(container);
	                    this.createSettingElementFor(name, data).ifSome((setting) => container.appendChild(setting));
	                });
	                return container;
	            })
	                .forEach((container) => categorySettingsContainer.appendChild(container));
	            const categoryContainer = (h("li", null,
	                h("h2", null, category),
	                categorySettingsContainer));
	            settingsContainer.appendChild(categoryContainer);
	        });
	        // Version injected by versionInjector
	        const aboutContainer = (h("li", null,
	            h("h2", null, "About"),
	            h("ul", null,
	                h("li", null,
	                    "Version: ",
	                    "0.10.4"))));
	        settingsContainer.appendChild(aboutContainer);
	        this.pane = genPaneElement("Settings", settingsContainer);
	    }
	    getPaneId() {
	        return "settings";
	    }
	    getPaneIconClass() {
	        return "fa-cog";
	    }
	    getPaneTitle() {
	        return "Settings";
	    }
	    getPaneElement() {
	        return this.pane;
	    }
	    getPosition() {
	        return "bottom";
	    }
	    createSettingElementFor(name, data) {
	        let setting = lib.None;
	        if (typeof data === "string") {
	            setting = lib.Some(lib.fromMap(SETTING_INPUT_TYPE, name)
	                .andThen(([type, settingData]) => {
	                if (type === "dropdown") {
	                    // Assume exists if type is dropdown
	                    const optionDisplayAndIds = settingData;
	                    return lib.Some(this.createDropdownSetting(name, data, optionDisplayAndIds, NAME_MAPPING));
	                }
	                else {
	                    return lib.None;
	                }
	            })
	                .unwrapOrElse(() => this.createStringSetting(name, data, NAME_MAPPING)));
	        }
	        else if (typeof data === "boolean") {
	            setting = lib.Some(this.createBooleanSetting(name, data, NAME_MAPPING));
	        }
	        return setting;
	    }
	    createSetting(name, control) {
	        return (h("div", null,
	            h("label", null, name),
	            control));
	    }
	    createStringSetting(name, value, nameMapping) {
	        const control = genTextInput("", value);
	        control.addEventListener("change", () => {
	            this.settings.updateData(name, control.value);
	        });
	        const mappedName = lib.fromMap(nameMapping, name).unwrapOr(name);
	        return this.createSetting(mappedName, control);
	    }
	    createBooleanSetting(name, value, nameMapping) {
	        const control = (h("input", { type: "checkbox" }));
	        control.checked = value;
	        control.addEventListener("change", () => {
	            this.settings.updateData(name, control.checked);
	        });
	        const mappedName = lib.fromMap(nameMapping, name).unwrapOr(name);
	        return this.createSetting(mappedName, control);
	    }
	    createDropdownSetting(name, value, optionDisplayAndIds, nameMapping) {
	        const control = (h("select", null));
	        for (const [display, id] of optionDisplayAndIds) {
	            const option = h("option", { value: id }, display);
	            if (id == value) {
	                option.setAttribute("selected", "selected");
	            }
	            control.appendChild(option);
	        }
	        control.addEventListener("change", () => {
	            this.settings.updateData(name, control.value);
	        });
	        const mappedName = lib.fromMap(nameMapping, name).unwrapOr(name);
	        return this.createSetting(mappedName, control);
	    }
	}
	SettingsPane.inject = ["settings"];

	class InfoPane extends Pane {
	    constructor(definition, events) {
	        super();
	        this.events = events;
	        const paneElements = [this.createHeader(definition)];
	        const roomFloor = (h("span", null,
	            "Floor: ",
	            definition.getLocation().getFloor()));
	        paneElements.push(roomFloor);
	        if (definition.getDescription.length !== 0) {
	            const description = h("p", null, definition.getDescription());
	            paneElements.push(description);
	        }
	        this.pane = genPaneElement("Room Info", paneElements);
	    }
	    getPaneId() {
	        return "info";
	    }
	    getPaneIconClass() {
	        return "fa-info";
	    }
	    getPaneTitle() {
	        return "Room Info";
	    }
	    getPaneElement() {
	        return this.pane;
	    }
	    createHeader(definition) {
	        const viewRoomButton = genButtonIcon("fa-map-pin", () => {
	            this.events.trigger("clickFocusDefinitionButton", definition);
	        }, "Show room");
	        viewRoomButton.classList.add("push-right");
	        const navButton = genButtonIcon("fa-location-arrow", () => {
	            this.events.trigger("clickNavigateToDefinitionButton", definition);
	        }, "Navigate");
	        return (h("div", { className: "wrapper header-wrapper" },
	            h("h2", null, definition.getName()),
	            viewRoomButton,
	            navButton));
	    }
	}

	class Sidebar {
	    constructor(map, settings, sidebar, navigationPane, synergyPane, searchPane, helpPane, settingsPane, logPane, events) {
	        this.map = map;
	        this.sidebar = sidebar;
	        this.navigationPane = navigationPane;
	        this.events = events;
	        this.sidebar.addTo(this.map);
	        this.infoPane = lib.None;
	        this.addPane(searchPane);
	        this.addPane(navigationPane);
	        this.addPane(helpPane);
	        this.addPane(settingsPane);
	        settings.addWatcher("logger", (enable) => {
	            if (enable) {
	                this.addPane(logPane);
	            }
	            else {
	                this.removePane(logPane);
	            }
	        });
	        settings.addWatcher("synergy", (enable) => {
	            if (enable) {
	                this.addPane(synergyPane);
	            }
	            else {
	                this.removePane(synergyPane);
	            }
	        });
	    }
	    addPane(pane) {
	        this.sidebar.addPanel(pane.getPanelOptions());
	    }
	    removePane(pane) {
	        this.sidebar.removePanel(pane.getPaneId());
	    }
	    openPane(pane) {
	        this.sidebar.open(pane.getPaneId());
	    }
	    /**
	     * Remove the old info pane if it exists, create an info pane, set the `infoPane` property, and return the unwrapped
	     * pane
	     * @param definition Definition to create an info pane for
	     * @returns New info pane
	     */
	    setUpInfoPane(definition) {
	        this.infoPane.ifSome((infoPane) => this.removePane(infoPane));
	        const infoPane = new InfoPane(definition, this.events);
	        this.infoPane = lib.Some(infoPane);
	        return infoPane;
	    }
	    /** Remove search suggestions from typing in the navigate from or to fields */
	    clearNavSuggestions() {
	        this.navigationPane.clearNavSuggestions();
	    }
	    /**
	     * Set the callback for snapping the pin's location when it isn't being dragged. Defaults to the identity function,
	     * ie. no snapping.
	     * @param snapPin The callback, which takes in the location of the pin and returns the location to snap to
	     */
	    setSnapPinHandler(snapPin) {
	        this.navigationPane.setSnapPinHandler(snapPin);
	    }
	    openInfoFor(definition) {
	        const infoPane = this.setUpInfoPane(definition);
	        this.addPane(infoPane);
	        this.openPane(infoPane);
	    }
	    openInfoForName(geocoder, name) {
	        geocoder
	            .getDefinitionFromName(name)
	            .ifSome((location) => this.openInfoFor(location));
	    }
	    clearNav() {
	        this.navigationPane.clearNav();
	    }
	    displayNav(layers) {
	        this.navigationPane.displayNav(layers);
	    }
	    moveFromPin(location) {
	        this.navigationPane.moveFromPin(location);
	    }
	    moveToPin(location) {
	        this.navigationPane.moveToPin(location);
	    }
	    setNavigateFromInputContents(contents) {
	        this.navigationPane.setNavigateFromInputContents(contents);
	    }
	    setNavigateToInputContents(contents) {
	        this.navigationPane.setNavigateToInputContents(contents);
	    }
	}
	Sidebar.inject = [
	    "map",
	    "settings",
	    "lSidebar",
	    "navigationPane",
	    "synergyPane",
	    "searchPane",
	    "helpPane",
	    "settingsPane",
	    "logPane",
	    "events",
	];

	const COURSE_NAME_REGEX = /course-title.*">([^:]*): ([^<]*)<\//g;
	const ROOM_NUMBER_REGEX = /teacher-room.*">Room: ([^<]+)<\//g;
	class Course {
	    constructor(period, name, room) {
	        this.period = period;
	        this.name = name;
	        this.room = room;
	        this.period = period;
	        this.name = name;
	        this.room = room;
	    }
	    toString() {
	        return `Period ${this.period}: ${this.name} in ${this.room.getName()}`;
	    }
	    toHtmlLi() {
	        const text = document.createTextNode(this.toString());
	        const li = document.createElement("li");
	        li.appendChild(text);
	        return li;
	    }
	    getDefinition() {
	        return this.room;
	    }
	}
	// TODO: Make this work offline
	class Synergy {
	    constructor(synergyPage, geocoder, logger) {
	        const courses = [];
	        let courseNameMatch;
	        while ((courseNameMatch = COURSE_NAME_REGEX.exec(synergyPage)) !== null) {
	            const period = courseNameMatch[1];
	            const name = courseNameMatch[2];
	            const roomNumberResult = ROOM_NUMBER_REGEX.exec(synergyPage);
	            // TODO: Proper error handling
	            if (roomNumberResult === null) {
	                throw "Invalid page";
	            }
	            const roomNumber = roomNumberResult[1];
	            const room = geocoder.getDefinitionFromName(roomNumber).match({
	                some: (room) => room,
	                none: () => {
	                    logger.logError(`Could not find room number for ${roomNumber}`);
	                    return null;
	                },
	            });
	            if (room === null) {
	                continue;
	            }
	            const course = new Course(period, name, room);
	            courses.push(course);
	            const courseRoom = room.extendedWithAlternateName(course.toString());
	            geocoder.addDefinition(courseRoom);
	        }
	        this.courses = courses;
	    }
	    getCourses() {
	        return this.courses;
	    }
	}

	// 2 MB
	const MAX_FILE_SIZE = 2 * 1024 * 1024;
	class SynergyPane extends Pane {
	    constructor(geocoder, logger) {
	        super();
	        const beta = h("p", null, "Currently in alpha. Doesn't fully work yet.");
	        const info = (h("p", null, "Download your Synergy page and upload the HTML file here."));
	        const siteUpload = (h("input", { type: "file", accept: "text/html" }));
	        const errorBox = h("p", null);
	        const courses = h("ol", null);
	        siteUpload.addEventListener("change", () => {
	            if (siteUpload.files === null || siteUpload.files.length === 0) {
	                return;
	            }
	            errorBox.innerText = "";
	            const file = siteUpload.files[0];
	            if (file.type !== "text/html") {
	                errorBox.innerText = "Wrong file type uploaded.";
	                return;
	            }
	            if (file.size > MAX_FILE_SIZE) {
	                errorBox.innerText = "File size is greater than 2 MB.";
	                return;
	            }
	            const reader = new FileReader();
	            reader.addEventListener("error", () => {
	                errorBox.innerText = "There was an error reading the file.";
	            });
	            reader.addEventListener("load", (result) => {
	                if (result.target === null || result.target.result === null) {
	                    errorBox.innerText = "There was an error loading the file.";
	                    return;
	                }
	                const synergyPage = result.target.result.toString();
	                const synergy = new Synergy(synergyPage, geocoder, logger);
	                for (const course of synergy.getCourses()) {
	                    courses.appendChild(course.toHtmlLi());
	                }
	            });
	            reader.readAsText(file);
	        });
	        this.pane = genPaneElement("Synergy", [
	            beta,
	            info,
	            siteUpload,
	            errorBox,
	            courses,
	        ]);
	    }
	    getPaneId() {
	        return "synergy";
	    }
	    getPaneIconClass() {
	        return "fa-sign-in-alt";
	    }
	    getPaneTitle() {
	        return "Synergy";
	    }
	    getPaneElement() {
	        return this.pane;
	    }
	}
	SynergyPane.inject = ["geocoder", "logger"];

	/**
	 * @license
	 * Copyright Daniel Imms <http://www.growingwiththeweb.com>
	 * Released under MIT license. See LICENSE in the project root for details.
	 */

	var Node = /** @class */ (function () {
	    function Node(key, value) {
	        this.parent = null;
	        this.child = null;
	        this.degree = 0;
	        this.isMarked = false;
	        this.key = key;
	        this.value = value;
	        this.prev = this;
	        this.next = this;
	    }
	    return Node;
	}());
	var Node_1 = Node;


	var node = /*#__PURE__*/Object.defineProperty({
		Node: Node_1
	}, '__esModule', {value: true});

	/**
	 * @license
	 * Copyright Daniel Imms <http://www.growingwiththeweb.com>
	 * Released under MIT license. See LICENSE in the project root for details.
	 */

	var NodeListIterator = /** @class */ (function () {
	    /**
	     * Creates an Iterator used to simplify the consolidate() method. It works by
	     * making a shallow copy of the nodes in the root list and iterating over the
	     * shallow copy instead of the source as the source will be modified.
	     * @param start A node from the root list.
	     */
	    function NodeListIterator(start) {
	        this._index = -1;
	        this._items = [];
	        var current = start;
	        do {
	            this._items.push(current);
	            current = current.next;
	        } while (start !== current);
	    }
	    /**
	     * @return Whether there is a next node in the iterator.
	     */
	    NodeListIterator.prototype.hasNext = function () {
	        return this._index < this._items.length - 1;
	    };
	    /**
	     * @return The next node.
	     */
	    NodeListIterator.prototype.next = function () {
	        return this._items[++this._index];
	    };
	    return NodeListIterator;
	}());
	var NodeListIterator_1 = NodeListIterator;


	var nodeListIterator = /*#__PURE__*/Object.defineProperty({
		NodeListIterator: NodeListIterator_1
	}, '__esModule', {value: true});

	/**
	 * @license
	 * Copyright Daniel Imms <http://www.growingwiththeweb.com>
	 * Released under MIT license. See LICENSE in the project root for details.
	 */



	var FibonacciHeap = /** @class */ (function () {
	    function FibonacciHeap(compare) {
	        this._minNode = null;
	        this._nodeCount = 0;
	        this._compare = compare ? compare : this._defaultCompare;
	    }
	    /**
	     * Clears the heap's data, making it an empty heap.
	     */
	    FibonacciHeap.prototype.clear = function () {
	        this._minNode = null;
	        this._nodeCount = 0;
	    };
	    /**
	     * Decreases a key of a node.
	     * @param node The node to decrease the key of.
	     * @param newKey The new key to assign to the node.
	     */
	    FibonacciHeap.prototype.decreaseKey = function (node, newKey) {
	        if (!node) {
	            throw new Error('Cannot decrease key of non-existent node');
	        }
	        if (this._compare({ key: newKey }, { key: node.key }) > 0) {
	            throw new Error('New key is larger than old key');
	        }
	        node.key = newKey;
	        var parent = node.parent;
	        if (parent && this._compare(node, parent) < 0) {
	            this._cut(node, parent, this._minNode);
	            this._cascadingCut(parent, this._minNode);
	        }
	        if (this._compare(node, this._minNode) < 0) {
	            this._minNode = node;
	        }
	    };
	    /**
	     * Deletes a node.
	     * @param node The node to delete.
	     */
	    FibonacciHeap.prototype.delete = function (node) {
	        // This is a special implementation of decreaseKey that sets the argument to
	        // the minimum value. This is necessary to make generic keys work, since there
	        // is no MIN_VALUE constant for generic types.
	        var parent = node.parent;
	        if (parent) {
	            this._cut(node, parent, this._minNode);
	            this._cascadingCut(parent, this._minNode);
	        }
	        this._minNode = node;
	        this.extractMinimum();
	    };
	    /**
	     * Extracts and returns the minimum node from the heap.
	     * @return The heap's minimum node or null if the heap is empty.
	     */
	    FibonacciHeap.prototype.extractMinimum = function () {
	        var extractedMin = this._minNode;
	        if (extractedMin) {
	            // Set parent to null for the minimum's children
	            if (extractedMin.child) {
	                var child = extractedMin.child;
	                do {
	                    child.parent = null;
	                    child = child.next;
	                } while (child !== extractedMin.child);
	            }
	            var nextInRootList = null;
	            if (extractedMin.next !== extractedMin) {
	                nextInRootList = extractedMin.next;
	            }
	            // Remove min from root list
	            this._removeNodeFromList(extractedMin);
	            this._nodeCount--;
	            // Merge the children of the minimum node with the root list
	            this._minNode = this._mergeLists(nextInRootList, extractedMin.child);
	            if (this._minNode) {
	                this._minNode = this._consolidate(this._minNode);
	            }
	        }
	        return extractedMin;
	    };
	    /**
	     * Returns the minimum node from the heap.
	     * @return The heap's minimum node or null if the heap is empty.
	     */
	    FibonacciHeap.prototype.findMinimum = function () {
	        return this._minNode;
	    };
	    /**
	     * Inserts a new key-value pair into the heap.
	     * @param key The key to insert.
	     * @param value The value to insert.
	     * @return node The inserted node.
	     */
	    FibonacciHeap.prototype.insert = function (key, value) {
	        var node$1 = new node.Node(key, value);
	        this._minNode = this._mergeLists(this._minNode, node$1);
	        this._nodeCount++;
	        return node$1;
	    };
	    /**
	     * @return Whether the heap is empty.
	     */
	    FibonacciHeap.prototype.isEmpty = function () {
	        return this._minNode === null;
	    };
	    /**
	     * @return The size of the heap.
	     */
	    FibonacciHeap.prototype.size = function () {
	        if (this._minNode === null) {
	            return 0;
	        }
	        return this._getNodeListSize(this._minNode);
	    };
	    /**
	     * Joins another heap to this heap.
	     * @param other The other heap.
	     */
	    FibonacciHeap.prototype.union = function (other) {
	        this._minNode = this._mergeLists(this._minNode, other._minNode);
	        this._nodeCount += other._nodeCount;
	    };
	    /**
	     * Compares two nodes with each other.
	     * @param a The first key to compare.
	     * @param b The second key to compare.
	     * @return -1, 0 or 1 if a < b, a == b or a > b respectively.
	     */
	    FibonacciHeap.prototype._defaultCompare = function (a, b) {
	        if (a.key > b.key) {
	            return 1;
	        }
	        if (a.key < b.key) {
	            return -1;
	        }
	        return 0;
	    };
	    /**
	     * Cut the link between a node and its parent, moving the node to the root list.
	     * @param node The node being cut.
	     * @param parent The parent of the node being cut.
	     * @param minNode The minimum node in the root list.
	     * @return The heap's new minimum node.
	     */
	    FibonacciHeap.prototype._cut = function (node, parent, minNode) {
	        node.parent = null;
	        parent.degree--;
	        if (node.next === node) {
	            parent.child = null;
	        }
	        else {
	            parent.child = node.next;
	        }
	        this._removeNodeFromList(node);
	        var newMinNode = this._mergeLists(minNode, node);
	        node.isMarked = false;
	        return newMinNode;
	    };
	    /**
	     * Perform a cascading cut on a node; mark the node if it is not marked,
	     * otherwise cut the node and perform a cascading cut on its parent.
	     * @param node The node being considered to be cut.
	     * @param minNode The minimum node in the root list.
	     * @return The heap's new minimum node.
	     */
	    FibonacciHeap.prototype._cascadingCut = function (node, minNode) {
	        var parent = node.parent;
	        if (parent) {
	            if (node.isMarked) {
	                minNode = this._cut(node, parent, minNode);
	                minNode = this._cascadingCut(parent, minNode);
	            }
	            else {
	                node.isMarked = true;
	            }
	        }
	        return minNode;
	    };
	    /**
	     * Merge all trees of the same order together until there are no two trees of
	     * the same order.
	     * @param minNode The current minimum node.
	     * @return The new minimum node.
	     */
	    FibonacciHeap.prototype._consolidate = function (minNode) {
	        var aux = [];
	        var it = new nodeListIterator.NodeListIterator(minNode);
	        while (it.hasNext()) {
	            var current = it.next();
	            // If there exists another node with the same degree, merge them
	            var auxCurrent = aux[current.degree];
	            while (auxCurrent) {
	                if (this._compare(current, auxCurrent) > 0) {
	                    var temp = current;
	                    current = auxCurrent;
	                    auxCurrent = temp;
	                }
	                this._linkHeaps(auxCurrent, current);
	                aux[current.degree] = null;
	                current.degree++;
	                auxCurrent = aux[current.degree];
	            }
	            aux[current.degree] = current;
	        }
	        var newMinNode = null;
	        for (var i = 0; i < aux.length; i++) {
	            var node = aux[i];
	            if (node) {
	                // Remove siblings before merging
	                node.next = node;
	                node.prev = node;
	                newMinNode = this._mergeLists(newMinNode, node);
	            }
	        }
	        return newMinNode;
	    };
	    /**
	     * Removes a node from a node list.
	     * @param node The node to remove.
	     */
	    FibonacciHeap.prototype._removeNodeFromList = function (node) {
	        var prev = node.prev;
	        var next = node.next;
	        prev.next = next;
	        next.prev = prev;
	        node.next = node;
	        node.prev = node;
	    };
	    /**
	     * Links two heaps of the same order together.
	     *
	     * @private
	     * @param max The heap with the larger root.
	     * @param min The heap with the smaller root.
	     */
	    FibonacciHeap.prototype._linkHeaps = function (max, min) {
	        this._removeNodeFromList(max);
	        min.child = this._mergeLists(max, min.child);
	        max.parent = min;
	        max.isMarked = false;
	    };
	    /**
	     * Merge two lists of nodes together.
	     *
	     * @private
	     * @param a The first list to merge.
	     * @param b The second list to merge.
	     * @return The new minimum node from the two lists.
	     */
	    FibonacciHeap.prototype._mergeLists = function (a, b) {
	        if (!a) {
	            if (!b) {
	                return null;
	            }
	            return b;
	        }
	        if (!b) {
	            return a;
	        }
	        var temp = a.next;
	        a.next = b.next;
	        a.next.prev = a;
	        b.next = temp;
	        b.next.prev = b;
	        return this._compare(a, b) < 0 ? a : b;
	    };
	    /**
	     * Gets the size of a node list.
	     * @param node A node within the node list.
	     * @return The size of the node list.
	     */
	    FibonacciHeap.prototype._getNodeListSize = function (node) {
	        var count = 0;
	        var current = node;
	        do {
	            count++;
	            if (current.child) {
	                count += this._getNodeListSize(current.child);
	            }
	            current = current.next;
	        } while (current !== node);
	        return count;
	    };
	    return FibonacciHeap;
	}());
	var FibonacciHeap_1 = FibonacciHeap;

	class Graph {
	    constructor(vertices, edges) {
	        this.vertices = vertices;
	        const adjList = new Map([...vertices.keys()].map((key) => t(key, [])));
	        edges.forEach((edge) => Graph.addEdgeTo(adjList, edge));
	        this.adjList = adjList;
	    }
	    /**
	     * Modifies an adjacency list to add an edge
	     * @param adjList Adjacency list to add the edge to
	     * @param from Vertex to start from
	     * @param to Vertex to end on
	     * @param weight Weight of the edge
	     * @param directed True if the edge should be one-way, false if it should be two-way
	     */
	    static addEdgeTo(adjList, [from, to, weight, directed]) {
	        this.addDirectedEdge(adjList, from, to, weight);
	        if (!directed) {
	            this.addDirectedEdge(adjList, to, from, weight);
	        }
	    }
	    static addDirectedEdge(adjList, from, to, weight) {
	        var _a;
	        const neighborList = (_a = adjList.get(from)) !== null && _a !== void 0 ? _a : [];
	        neighborList.push([to, weight]);
	        adjList.set(from, neighborList);
	    }
	    getVertex(p) {
	        return lib.fromMap(this.vertices, p);
	    }
	    /**
	     * Get all vertex IDs and their associated vertices
	     */
	    getIdsAndVertices() {
	        return [...this.vertices.entries()];
	    }
	    /**
	     * Get vertices that have an edge from `v`
	     * @param v ID of the vertex to find the neighbors of
	     */
	    getNeighbors(v) {
	        return lib.fromMap(this.adjList, v)
	            .unwrapOr([])
	            .map(([to, _weight]) => to);
	    }
	    /**
	     * Get the weight of an edge between two vertices
	     * @param v ID of the edge's starting vertex
	     * @param u ID of the edge's ending vertex
	     * @returns `Some(weight)` if the edge exists, `None` if not. Keep in mind that directed edges are one-way, so the
	     * order of `u` and `v` can affect the return value.
	     */
	    getWeight(v, u) {
	        const maybeNeighbors = lib.fromMap(this.adjList, v);
	        if (maybeNeighbors.isNone()) {
	            return lib.None;
	        }
	        const neighbors = maybeNeighbors.unwrap();
	        const maybeNeighbor = neighbors
	            .filter((neighbor) => neighbor[0] === u)
	            .map((neighbor) => neighbor[1]);
	        if (maybeNeighbor.length > 0)
	            return lib.Some(maybeNeighbor[0]);
	        else
	            return lib.None;
	    }
	    /**
	     * Run Dijkstra's pathfinding algorithm on the graph
	     * @param source ID of the vertex to start from
	     * @returns `[totalWeightToVertex, predecessor]`
	     *  - `totalWeightToVertex` stores the sum of the weights along the edges from `source` to any vertex in the graph.
	     * If the weight is `Infinity`, there does not exist a path from `source` to that vertex.
	     *  - `predecessor` represents the vertex before any vertex in the graph along the fastest path from `source`. It
	     * can be used to find the path from `source` to any vertex by repeatedly finding the vertex before until reaching
	     * `source`. If the predecessor is `null`, the vertex either is `source` or has no path from `source`.
	     */
	    dijkstra(source) {
	        const dist = new Map();
	        const prev = new Map();
	        dist.set(source, 0);
	        const q = new FibonacciHeap_1();
	        const vertexToNode = new Map();
	        for (const v of this.adjList.keys()) {
	            if (v !== source) {
	                dist.set(v, Infinity);
	                // TODO: Maybe use None?
	                prev.set(v, null);
	            }
	            // dist is guaranteed to contain v; dist[source] is set, and dist[v not source] is set
	            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	            const node = q.insert(dist.get(v), v);
	            vertexToNode.set(v, node);
	        }
	        while (!q.isEmpty()) {
	            // Guaranteed to have a minimum as q is not empty; guaranteed to have a value because one always inserted
	            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	            const u = q.extractMinimum().value;
	            for (const v of this.getNeighbors(u)) {
	                // dist is guaranteed to contain all possible v
	                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	                const vWeight = dist.get(v);
	                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	                const alt = dist.get(u) + this.getWeight(u, v).unwrap();
	                if (alt < vWeight) {
	                    dist.set(v, alt);
	                    prev.set(v, u);
	                    // vertexToNode guaranteed to contain all v
	                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	                    const node = vertexToNode.get(v);
	                    q.decreaseKey(node, alt);
	                }
	            }
	        }
	        return [dist, prev];
	    }
	    /**
	     * Generate a path of neighboring vertices to a destination from a `prev` map
	     * @param src Original start of the path
	     * @param dest Destination to find the path to
	     * @param prev Map from vertex to previous vertex
	     */
	    pathFromPrev(src, dest, prev) {
	        if (src === dest) {
	            return lib.Some([dest]);
	        }
	        const prevVertex = prev.get(dest);
	        if (!prevVertex) {
	            // No path from src to dest
	            return lib.None;
	        }
	        const pathToPrev = this.pathFromPrev(src, prevVertex, prev);
	        return pathToPrev.match({
	            some: (path) => lib.Some([dest, ...path]),
	            none: lib.None,
	        });
	    }
	}

	class Room {
	    constructor(entrances, roomNumber, names, outline, 
	    /** The center may not be the geometric center. It can be any point that represents the room. */
	    center, area, tags) {
	        this.entrances = entrances;
	        this.roomNumber = roomNumber;
	        this.names = names;
	        this.outline = outline;
	        this.center = center;
	        this.area = area;
	        this.tags = tags;
	        this.boundingBox = BuildingLocationBBox.fromPoints(outline.map(leafletSrc.latLng), center.getFloor());
	    }
	    /**
	     * Displayed to the user and the main factor in search. Must be unique among rooms.
	     */
	    getName() {
	        const names = this.names;
	        if (names.length > 0) {
	            return `${names[0]} (${this.roomNumber})`;
	        }
	        return this.roomNumber;
	    }
	    getShortName() {
	        const names = this.names;
	        if (names.length > 0) {
	            return names[0];
	        }
	        return this.roomNumber;
	    }
	    /*
	     * Not displayed to the user, but used in search.
	     */
	    getAlternateNames() {
	        return this.names;
	    }
	    /**
	     * Returns a new definition with an extra alternate name added. Does not modify the object on which it is called.
	     */
	    extendedWithAlternateName(name) {
	        const extended = deepCopy(this);
	        extended.names.push(name);
	        return extended;
	    }
	    /**
	     * Displayed to the user and used in search.
	     */
	    getDescription() {
	        return "";
	    }
	    /**
	     * May be displayed to the user and used in search.
	     */
	    getTags() {
	        return this.tags;
	    }
	    hasTag(tag) {
	        return this.tags.includes(tag);
	    }
	    getEntranceLocations() {
	        return this.entrances;
	    }
	    getLocation() {
	        return new BuildingLocationWithEntrances(this.center, this.entrances);
	    }
	    getBoundingBox() {
	        return this.boundingBox;
	    }
	    estimateImportance() {
	        return (this.area +
	            100 * this.tags.filter((tag) => tag !== DefinitionTag.Closed).length);
	    }
	    isInfrastructure() {
	        return (this.tags.filter((tag) => INFRASTRUCTURE_TAGS.has(tag)).length !== 0);
	    }
	    isEmergency() {
	        return this.tags.filter((tag) => EMERGENCY_TAGS.has(tag)).length !== 0;
	    }
	    isClosed() {
	        return this.tags.includes(DefinitionTag.Closed);
	    }
	}

	function mapDataFactoryFactory(mapData, bounds) {
	    const factory = () => {
	        return MapData.new(mapData, bounds);
	    };
	    factory.inject = [];
	    return factory;
	}
	/** Represents and stores all data known about the map */
	class MapData {
	    constructor(vertexStringToId, graph, rooms, floors, edges, bounds) {
	        this.vertexStringToId = vertexStringToId;
	        this.graph = graph;
	        this.rooms = rooms;
	        this.floors = floors;
	        this.edges = edges;
	        this.bounds = bounds;
	    }
	    static new(mapData, bounds) {
	        const vertexStringToId = MapData.createVertexNameMapping(mapData.vertices);
	        const graphErr = goRes(MapData.navigationGraph(mapData.vertices, mapData.edges, vertexStringToId));
	        if (graphErr[1] !== null) {
	            return lib.Err(graphErr[1]);
	        }
	        const graph = graphErr[0];
	        const roomsErr = goRes(MapData.roomNumberMapping(mapData.rooms, vertexStringToId, graph));
	        if (roomsErr[1] !== null) {
	            return lib.Err(roomsErr[1]);
	        }
	        const rooms = roomsErr[0];
	        const edges = mapData.edges.map(([from, to, directed]) => t(from, to, !!directed));
	        return lib.Ok(new MapData(vertexStringToId, graph, rooms, mapData.floors, edges, bounds));
	    }
	    /**
	     * Creates a map from vertex names to integer IDs
	     * @param jsonVertices Vertices to create the mapping for
	     */
	    static createVertexNameMapping(jsonVertices) {
	        const nameToIdArray = Object.entries(jsonVertices).map(([name, _vertex], id) => t(name, id));
	        return new Map(nameToIdArray);
	    }
	    /**
	     * Create the navigation graph for a map
	     * @param jsonVertices JSON vertex data
	     * @param jsonEdges JSON edge data
	     * @param vertexNameToId Mapping from vertex string names to integer IDs
	     * @returns Navigation graph for the map
	     */
	    static navigationGraph(jsonVertices, jsonEdges, vertexNameToId) {
	        const verticesErr = goRes(this.navigationGraphVertices(jsonVertices, vertexNameToId));
	        if (verticesErr[1] !== null) {
	            return lib.Err(verticesErr[1]);
	        }
	        const vertices = verticesErr[0];
	        const edgesErr = goRes(this.navigationGraphEdges(jsonEdges, vertexNameToId, vertices));
	        if (edgesErr[1] !== null) {
	            return lib.Err(edgesErr[1]);
	        }
	        const edges = edgesErr[0];
	        return lib.Ok(new Graph(vertices, edges));
	    }
	    static navigationGraphVertices(jsonVertices, vertexNameToId) {
	        const optVertexIds = extractOption(Object.keys(jsonVertices).map((name) => lib.fromMap(vertexNameToId, name)));
	        if (optVertexIds.isNone()) {
	            return lib.Err("unknown vertex while constructing navigation graph vertices");
	        }
	        const vertexIds = optVertexIds.unwrap();
	        const vertexObjects = Object.values(jsonVertices).map((jsonVertex) => new Vertex(jsonVertex));
	        return lib.Ok(new Map(zip(vertexIds, vertexObjects)));
	    }
	    static navigationGraphEdges(jsonEdges, vertexNameToId, vertices) {
	        const edgeDirected = jsonEdges.map(([_from, _to, directed]) => directed !== null && directed !== void 0 ? directed : false);
	        const optEdgeFromIds = extractOption(jsonEdges.map(([from, _to, _directed]) => lib.fromMap(vertexNameToId, from)));
	        if (optEdgeFromIds.isNone()) {
	            return lib.Err("unknown from vertex name while constructing navigation graph edges");
	        }
	        const edgeFromIds = optEdgeFromIds.unwrap();
	        const optEdgeToIds = extractOption(jsonEdges.map(([_from, to, _directed]) => lib.fromMap(vertexNameToId, to)));
	        if (optEdgeToIds.isNone()) {
	            return lib.Err("unknown to vertex name while constructing navigation graph edges");
	        }
	        const edgeToIds = optEdgeToIds.unwrap();
	        const edgeEndpointIds = zip(edgeFromIds, edgeToIds);
	        const optEdgeFromVertices = extractOption(edgeFromIds.map((from) => lib.fromMap(vertices, from)));
	        if (optEdgeFromVertices.isNone()) {
	            return lib.Err("unknown from vertex while constructing navigation graph edges");
	        }
	        const edgeFromVertices = optEdgeFromVertices.unwrap();
	        const optEdgeToVertices = extractOption(edgeToIds.map((to) => lib.fromMap(vertices, to)));
	        if (optEdgeFromVertices.isNone()) {
	            return lib.Err("unknown to vertex while constructing navigation graph edges");
	        }
	        const edgeToVertices = optEdgeToVertices.unwrap();
	        const edgeEndpointVertices = zip(edgeFromVertices, edgeToVertices);
	        const edgeWeights = edgeEndpointVertices.map(([from, to]) => from
	            .getLocation()
	            .distanceTo(to.getLocation())
	            .unwrapOr(STAIR_WEIGHT));
	        return lib.Ok(zipInto(zipInto(edgeEndpointIds, edgeWeights), edgeDirected));
	    }
	    /**
	     * Create the mapping from room numbers to `Room`s
	     * @param jsonNumbersRooms JSON room data
	     * @param vertexNameMapping Mapping from vertex string names to integer IDs
	     * @param navigationGraph Navigation graph for map
	     * @returns Mapping from room numbers to `Room`s
	     */
	    static roomNumberMapping(jsonNumbersRooms, vertexNameMapping, navigationGraph) {
	        const roomNumbers = Object.keys(jsonNumbersRooms);
	        const jsonRooms = Object.values(jsonNumbersRooms);
	        const vertexNames = jsonRooms.map((room) => room.vertices[0]);
	        const vertexIds = vertexNames.map((name) => vertexNameMapping.get(name));
	        // Check for no undefined vertex IDs
	        const undefinedVertexIds = zip(vertexNames, vertexIds).filter(([_name, id]) => id === undefined);
	        if (undefinedVertexIds.length > 0) {
	            const unmapped = undefinedVertexIds.map(([name, _id]) => name);
	            return lib.Err(`vertices in rooms not assigned IDs: ${unmapped}`);
	        }
	        const maybeVertices = vertexIds.map((id) => 
	        // Just checked for not undefined
	        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	        navigationGraph.getVertex(id));
	        // Check for no None vertices
	        const noneVertices = zip(maybeVertices, vertexNames).filter(([vertex, _name]) => vertex.isNone());
	        if (noneVertices.length > 0) {
	            const noneVertexNames = noneVertices.map(([_vertex, name]) => name);
	            return lib.Err(`vertices in rooms not present in navigation graph: ${noneVertexNames}`);
	        }
	        const vertices = maybeVertices.map((vertex) => vertex.unwrap());
	        const roomFloorNumbers = vertices.map((roomVertex) => roomVertex.getLocation().getFloor());
	        const roomCenters = zipInto(zip(jsonRooms, vertices), roomFloorNumbers).map(([room, vertex, floor]) => room.center !== null
	            ? new BuildingLocation(new leafletSrc.LatLng(room.center[1], room.center[0]), floor)
	            : vertex.getLocation());
	        const optRoomEntrances = extractOption(jsonRooms.map((room) => extractOption(room.vertices.map((vertexStringId) => lib.fromMap(vertexNameMapping, vertexStringId))).andThen((vertexIds) => extractOption(vertexIds
	            .map((vertexId) => navigationGraph.getVertex(vertexId))
	            .map((vertices) => vertices.map((vertex) => vertex.getLocation()))))));
	        if (optRoomEntrances.isNone()) {
	            return lib.Err("error managing room entrance vertices");
	        }
	        const roomEntrances = optRoomEntrances.unwrap();
	        const roomsArray = zipInto(zipInto(zip(roomNumbers, roomEntrances), jsonRooms), roomCenters).map(([roomNumber, entrances, room, center]) => {
	            var _a, _b, _c;
	            return t(roomNumber, new Room(entrances, roomNumber, (_a = room.names) !== null && _a !== void 0 ? _a : [], room.outline, center, (_b = room.area) !== null && _b !== void 0 ? _b : 0, (_c = room.tags) !== null && _c !== void 0 ? _c : []));
	        });
	        return lib.Ok(new Map(roomsArray));
	    }
	    /**
	     * Get the bounds of the map
	     */
	    getBounds() {
	        return this.bounds;
	    }
	    /**
	     * Get the map's navigation graph
	     */
	    getGraph() {
	        return this.graph;
	    }
	    /**
	     * Get the room with the specified room number if it exists
	     */
	    getRoom(roomNumber) {
	        return lib.fromMap(this.rooms, roomNumber);
	    }
	    getAllRooms() {
	        return Array.from(this.rooms.values());
	    }
	    getAllFloors() {
	        return this.floors;
	    }
	    /**
	     * Get the IDs of the entrance vertices of a definition
	     */
	    entranceVertexIds(definition) {
	        return definition
	            .getLocation()
	            .getEntrances()
	            .map((entrance) => this.getClosestVertex(entrance));
	    }
	    /**
	     * Run Dijkstra's algorithm on all exits from a definition
	     * @param src Definition to run Dijkstra's algorithm on
	     * @returns Results of running on each exit and the exit vertex IDs. See also `Graph.dijkstra`
	     */
	    definitionDijkstra(src) {
	        const entrances = this.entranceVertexIds(src);
	        return zipInto(entrances.map((exitId) => this.graph.dijkstra(exitId)), entrances);
	    }
	    /**
	     * Find the best path from `src` to `dest`
	     * @param src Definition to start from
	     * @param dest Definition to end at
	     * @returns Path from `src` to `dest` with the lowest total weight, if any exists, as an array of vertex IDs
	     */
	    findBestPath(src, dest) {
	        const destEntrances = this.entranceVertexIds(dest);
	        const results = this.definitionDijkstra(src);
	        const pathOptions = flatten(results.map(([dist, prev, exit]) => destEntrances.map((entrance) => t(lib.fromMap(dist, entrance).unwrapOr(Infinity), prev, entrance, exit))));
	        if (pathOptions.length === 0) {
	            // Either src or dest had no entrances
	            return lib.None;
	        }
	        const [shortestDistance, prev, destVertex, srcVertex] = pathOptions.reduce((best, current) => current[0] < best[0] ? current : best);
	        if (shortestDistance === Infinity) {
	            // No path exists from src to dest
	            return lib.None;
	        }
	        return this.graph.pathFromPrev(srcVertex, destVertex, prev);
	    }
	    /**
	     * Find the length of the best path from `src` to `dest`
	     * @param src Definition to start from
	     * @param dest Definition to end on
	     * @returns Total weight of the lowest weight path, if such a path exists
	     */
	    findBestPathLength(src, dest) {
	        const destEntrances = this.entranceVertexIds(dest);
	        const results = this.definitionDijkstra(src);
	        const distances = flatten(results.map(([dist]) => destEntrances.map((entrance) => lib.fromMap(dist, entrance).unwrapOr(Infinity))));
	        return distances.length > 0 ? lib.Some(Math.min(...distances)) : lib.None;
	    }
	    /**
	     * Get the color to use when rendering a vertex
	     * @returns Hex color code, eg. "#0000ff" for blue
	     */
	    static vertexColor(vertex) {
	        return vertex.hasTag(VertexTag.Stairs) ||
	            vertex.hasTag(VertexTag.Elevator)
	            ? "#0000ff"
	            : "#00ff00";
	    }
	    /**
	     * Create a layer with vertices, edges, and clock location popup for one floor
	     * @param floor Floor to create the dev layer for
	     */
	    createDevLayerGroup(floor) {
	        // Create layer showing points and edges
	        const devLayer = new LLayerGroupWithFloor([], {
	            floorNumber: floor,
	        });
	        for (const [pName, qName] of this.edges) {
	            const resP = lib.fromMap(this.vertexStringToId, pName).andThen((pId) => this.graph.getVertex(pId));
	            if (resP.isNone()) {
	                return lib.Err(`could not find edge start vertex ${pName} while constructing dev layer`);
	            }
	            const p = resP.unwrap();
	            const resQ = lib.fromMap(this.vertexStringToId, qName).andThen((qId) => this.graph.getVertex(qId));
	            if (resQ.isNone()) {
	                return lib.Err(`could not find edge end vertex ${qName} while constructing dev layer`);
	            }
	            const q = resQ.unwrap();
	            if (p.getLocation().getFloor() === floor &&
	                q.getLocation().getFloor() === floor) {
	                const pLoc = p.getLocation();
	                const qLoc = q.getLocation();
	                leafletSrc.polyline([pLoc.getXY(), qLoc.getXY()]).addTo(devLayer);
	            }
	        }
	        for (const [vertexName, vertexId] of this.vertexStringToId.entries()) {
	            const resVertex = this.graph.getVertex(vertexId);
	            if (resVertex.isNone()) {
	                return lib.Err(`could not find vertex ${vertexName} while constructing dev layer`);
	            }
	            const vertex = resVertex.unwrap();
	            if (vertex.getLocation().getFloor() === floor) {
	                const color = MapData.vertexColor(vertex);
	                const location = vertex.getLocation().getXY();
	                leafletSrc.circle(vertex.getLocation().getXY(), {
	                    radius: 1,
	                    color: color,
	                })
	                    .bindPopup(`${vertexName} (${vertexId})<br/>${location.lng}, ${location.lat}`)
	                    .addTo(devLayer);
	            }
	        }
	        return lib.Ok(devLayer);
	    }
	    /**
	     * Create layer groups displaying a path, one for each floor of a building
	     * @param path The path to create a group for
	     */
	    createLayerGroupsFromPath(path) {
	        const layers = new Map();
	        let last = path[0];
	        for (const vert of path) {
	            const resP = this.graph.getVertex(last);
	            if (resP.isNone()) {
	                return lib.Err(`could not find vertex with id ${last} while constructing a layer group from a path`);
	            }
	            const p = resP.unwrap();
	            const resQ = this.graph.getVertex(vert);
	            if (resQ.isNone()) {
	                return lib.Err(`could not find vertex with id ${vert} while constructing a layer group from a path`);
	            }
	            const q = resQ.unwrap();
	            const pLoc = p.getLocation();
	            const qLoc = q.getLocation();
	            const pFloor = pLoc.getFloor();
	            const qFloor = qLoc.getFloor();
	            if (pFloor === qFloor) {
	                // Same floor, draw path from p to q
	                if (!layers.has(pFloor)) {
	                    layers.set(pFloor, new LLayerGroupWithFloor([], { floorNumber: pFloor }));
	                }
	                leafletSrc.polyline([pLoc.getXY(), qLoc.getXY()], {
	                    color: "#ff0000",
	                }).addTo(layers.get(pFloor));
	            }
	            else {
	                // Different floor, change floors
	                if (!layers.has(pFloor)) {
	                    layers.set(pFloor, new LLayerGroupWithFloor([], { floorNumber: pFloor }));
	                }
	                if (!layers.has(qFloor)) {
	                    layers.set(qFloor, new LLayerGroupWithFloor([], { floorNumber: qFloor }));
	                }
	                // TODO: Add proper floor indexing so we don't have to hope that floors are integers
	                const pFloorNumber = parseInt(pFloor);
	                const qFloorNumber = parseInt(qFloor);
	                // These icons aren't actually stairs, but they look close enough to get the idea across
	                // They also look much nicer than my poor attempt at creating a stair icon
	                const iconClass = qFloorNumber < pFloorNumber
	                    ? "fas fa-sort-amount-up-alt"
	                    : "fas fa-sort-amount-down-alt";
	                const stairIcon = leafletSrc.divIcon({
	                    html: h("i", { className: iconClass }),
	                    className: "icon nav",
	                });
	                leafletSrc.marker(pLoc.getXY(), { icon: stairIcon }).addTo(layers.get(pFloor));
	                leafletSrc.marker(qLoc.getXY(), { icon: stairIcon }).addTo(layers.get(qFloor));
	            }
	            last = vert;
	        }
	        return lib.Ok(new Set(layers.values()));
	    }
	    /**
	     * Finds the closest vertex to `location` on the same floor as `location`
	     * @param location Location to find the closest vertex to
	     * @returns ID of the closest vertex
	     */
	    getClosestVertex(location) {
	        const idVertexToIdDistance2 = function (idVertex) {
	            const [id, vertex] = idVertex;
	            return [id, vertex.getLocation().distance2To(location)];
	        };
	        const [closestId, _distance] = this.graph
	            .getIdsAndVertices()
	            .map(idVertexToIdDistance2)
	            .filter(([_id, distance]) => distance.isSome())
	            .map(([id, distanceOption]) => [id, distanceOption.unwrap()])
	            .reduce(([minimumId, minimumDistance], [id, distance]) => distance < minimumDistance
	            ? [id, distance]
	            : [minimumId, minimumDistance]);
	        return closestId;
	    }
	}

	function textMeasurerFactory() {
	    return TextMeasurer.new();
	}
	textMeasurerFactory.inject = [];
	/** Measures the dimensions of text */
	class TextMeasurer {
	    constructor(ctx) {
	        this.ctx = ctx;
	    }
	    /**
	     * Create a new `TextMeasurer`
	     * @returns New `Some(TextMeasurer)` if construction succeeds, `Err(message)` if the construction fails
	     */
	    static new() {
	        const ctx = document.createElement("canvas").getContext("2d");
	        if (ctx !== null) {
	            return lib.Ok(new TextMeasurer(ctx));
	        }
	        else {
	            return lib.Err("could not get canvas 2d context in TextMeasurer");
	        }
	    }
	    /**
	     * Get the size of a single line
	     * @param font CSS font string representing the font to measure the text in. Should set at least font size and
	     * font-family.
	     */
	    measureOneLine(line, font) {
	        this.ctx.font = font;
	        const lineMetrics = this.ctx.measureText(line);
	        const width = lineMetrics.actualBoundingBoxLeft +
	            lineMetrics.actualBoundingBoxRight;
	        const height = lineMetrics.actualBoundingBoxAscent +
	            lineMetrics.actualBoundingBoxDescent;
	        return leafletSrc.point(width, height);
	    }
	    /**
	     * Get the total size of several lines and the individual size of each line
	     * @param lines Array of lines of text to measure
	     * @param lineSpacingPx Distance in pixels between the end of one line and the start of the next
	     * @param font CSS font string representing the font to measure the text in. Should set at least font size and
	     * font-family.
	     * @returns `[total size, size of each line[]]`; The total size is the combined size of each line plus the line
	     * spacing between each line, and each line's size is the size of the text without extra spacing
	     */
	    measureLines(lines, lineSpacingPx, font) {
	        const linesSizes = lines.map((line) => this.measureOneLine(line, font));
	        const size = linesSizes.reduce((totalSize, lineSize) => {
	            const width = Math.max(totalSize.x, lineSize.x);
	            const height = totalSize.y + lineSize.y;
	            return leafletSrc.point(width, height);
	        }, leafletSrc.point(0, (linesSizes.length - 1) * lineSpacingPx));
	        return [size, linesSizes];
	    }
	}

	// Churchill is 600ft long and 400ft across; portables add to that
	// bounds used to just be defined in terms of constants, but due to mistakes made when choosing those constants and
	// the subsequent addition of the portables, this was used instead. It should be easier to configure for existing maps,
	// but new maps should instead carefully choose a coordinate system such that the bounds fit the aspect ratio of the
	// base map image to avoid having to do this.
	const WIDTH = 161.31325; // width of 1st floor from Inkscape; arbitrary unit
	const HEIGHT = 123.15513; // height of 1nd floor from Inkscape; same unit as width
	const SCALE = 3.78;
	const PUSH_X = 5;
	const BOUNDS = new leafletSrc.LatLngBounds([0, PUSH_X], [SCALE * HEIGHT, SCALE * WIDTH + PUSH_X]);
	const MIN_ZOOM = -1;
	const MAX_ZOOM = 4;

	class Events {
	    constructor() {
	        this.eventHandlers = new Map();
	    }
	    on(event, handler) {
	        const handlers = lib.fromMap(this.eventHandlers, event).unwrapOr([]);
	        handlers.push(handler);
	        this.eventHandlers.set(event, handlers);
	    }
	    trigger(event, ...eventData) {
	        lib.fromMap(this.eventHandlers, event).ifSome((handlers) => handlers.forEach((handler) => {
	            const typedHandler = handler;
	            // @ts-expect-error: eventData is typed to be the parameters of the handler, so will be valid
	            typedHandler(...eventData);
	        }));
	    }
	}
	Events.inject = [];

	/**
	 * Element creator which supports custom elements (ie. elements starting with uppercase letters that are implemented in
	 * terms of lower level elements).
	 */
	class CustomElementCreator {
	    createIfCustom(tag, props, children) {
	        return new tag().render(props, children);
	    }
	    /**
	     * Removes the "on" from the name of an event, eg. "onClick" => "click"
	     */
	    removeOnFromEvent(onEvent) {
	        const firstChar = onEvent.substring(2, 3).toLowerCase();
	        const latterChars = onEvent.substring(3);
	        return firstChar + latterChars;
	    }
	    appendChild(parent, child) {
	        if (Array.isArray(child)) {
	            child.forEach((inner) => this.appendChild(parent, inner));
	        }
	        else {
	            if (typeof child === "string") {
	                parent.appendChild(document.createTextNode(child));
	            }
	            else {
	                parent.appendChild(child);
	            }
	        }
	    }
	    createIfNotCustom(tag, props, children) {
	        const element = document.createElement(tag);
	        if (props !== null) {
	            Object.entries(props).forEach(([name, value]) => {
	                if (name.startsWith("on")) {
	                    const callback = value;
	                    element.addEventListener(this.removeOnFromEvent(name), callback);
	                }
	                else {
	                    element.setAttribute(name, value);
	                }
	            });
	        }
	        children.forEach((child) => this.appendChild(element, child));
	        return element;
	    }
	    create(tag, props, children) {
	        if (typeof tag === "string") {
	            return this.createIfNotCustom(tag, props, children);
	        }
	        else {
	            return this.createIfCustom(tag, props, children);
	        }
	    }
	}

	/**
	 * Stores and manages mutable program state that can change at runtime and persists between page reloads. Allows
	 * watchers to be notified when data changes.
	 */
	class Settings {
	    /**
	     * @param prefix An arbitrary but unique string without underscores that represents this specific settings object
	     */
	    constructor(
	    /** Used to separate the values of multiple Settings instances in LocalStorage */
	    prefix) {
	        this.prefix = prefix;
	        this.data = new Map();
	        this.watchers = new Map();
	        this.loadSavedData();
	    }
	    /** Loads data saved from a previous page load into this instance by the prefix, if data is available */
	    loadSavedData() {
	        if (typeof Storage !== "undefined") {
	            for (const key in window.localStorage) {
	                if (key.startsWith(`${this.prefix}_`)) {
	                    const unprefixedKey = key.substring(this.prefix.length + 1);
	                    const data = window.localStorage.getItem(key);
	                    if (data !== null) {
	                        this.updateData(unprefixedKey, JSON.parse(data));
	                    }
	                }
	            }
	        }
	    }
	    /** Sets the data stored at `id` to the new `data`. Calls relevant watchers. */
	    updateData(id, data) {
	        this.data.set(id, data);
	        if (typeof Storage !== "undefined") {
	            window.localStorage.setItem(`${this.prefix}_${id}`, JSON.stringify(data));
	        }
	        lib.fromMap(this.watchers, id).ifSome((watchers) => watchers.forEach((watcher) => watcher(data)));
	    }
	    /**
	     * Register a function to call when certain data changes
	     * @param dataId ID to watch for changes on
	     * @param watcher Function to call when data changes
	     * @param callOnAdd If true, calls the watcher immediately after registering it
	     */
	    addWatcher(dataId, watcher, callOnAdd = true) {
	        const watchersForId = lib.fromMap(this.watchers, dataId).unwrapOr([]);
	        watchersForId.push(watcher);
	        this.watchers.set(dataId, watchersForId);
	        if (callOnAdd) {
	            this.getData(dataId).ifSome((data) => watcher(data));
	        }
	    }
	    /** Unregister a watcher so it is no longer called when certain data is updated */
	    removeWatcher(dataId, watcher) {
	        const watchers = lib.fromMap(this.watchers, dataId)
	            .unwrapOr([])
	            .filter((currentWatcher) => currentWatcher !== watcher);
	        this.watchers.set(dataId, watchers);
	    }
	    /** See the current value associated with an ID. However, `addWatcher` should be used instead when possible. */
	    getData(id) {
	        return lib.fromMap(this.data, id);
	    }
	    /** Sets an initial value for data only if the data wasn't already initialized, such as by `loadSavedData` */
	    setDefault(id, defaultValue) {
	        if (!this.data.has(id)) {
	            this.updateData(id, defaultValue);
	        }
	    }
	    /** Get all setting IDs */
	    getAllSettingNames() {
	        return [...this.data.keys()];
	    }
	}

	function parseUrl(url) {
	    const urlRegex = /pos:\((\d+),(\d+),(\d+)\)/u;
	    const matches = url.match(urlRegex);
	    if (!matches || matches.length < 4)
	        return lib.None;
	    const x = +matches[1];
	    const y = +matches[2];
	    const floor = matches[3];
	    const latlng = new leafletSrc.LatLng(y, x);
	    const outBuilding = new BuildingLocation(latlng, floor);
	    return lib.Some(outBuilding);
	}

	const zoomLevel = 5;
	function setMapUrlView(url, map, floors, navPane) {
	    const urlOption = parseUrl(url);
	    urlOption.ifSome((loc) => {
	        // Sets the view
	        floors.setFloor(loc.getFloor());
	        map.setView(loc.getXY(), zoomLevel);
	        // Sets the pin
	        navPane.moveFromPin(loc, false);
	    });
	}

	function main() {
	    if ("serviceWorker" in navigator) {
	        navigator.serviceWorker.register("/serviceWorker.js");
	    }
	    const logger = new Logger();
	    const elementCreator = new CustomElementCreator();
	    injectElementCreator(elementCreator);
	    // Create map
	    const map = leafletSrc.map("map", {
	        crs: leafletSrc.CRS.Simple,
	        center: BOUNDS.getCenter(),
	        transform3DLimit: 2 ^ 20,
	        maxZoom: MAX_ZOOM,
	        minZoom: MIN_ZOOM,
	        maxBounds: BOUNDS.pad(0.5),
	        maxBoundsViscosity: 1,
	        zoomSnap: 1,
	        zoomDelta: 1,
	        wheelPxPerZoomLevel: 150,
	        fadeAnimation: false,
	    });
	    map.fitBounds(BOUNDS.pad(0.05));
	    const lSidebar = leafletSrc.control.sidebar({
	        container: "sidebar",
	        closeButton: true,
	    });
	    const injectorErr = goRes(src.createInjector()
	        .provideValue("logger", logger)
	        .provideValue("map", map)
	        .provideValue("lSidebar", lSidebar)
	        // mapDataJson is actually valid as JsonMap, but TS can't tell (yet?), so the unknown hack is needed
	        .provideResultFactory("mapData", mapDataFactoryFactory(mapDataJson, BOUNDS))
	        .provideResultFactory("floors", floorsFactoryFactory("1", { attribution: ATTRIBUTION }))
	        .provideResultFactory("textMeasurer", textMeasurerFactory)
	        .provideFactory("settings", defaultSettings)
	        .provideClass("geocoder", Geocoder)
	        .provideClass("locator", Locator)
	        .provideClass("events", Events)
	        .provideClass("navigationPane", NavigationPane)
	        .provideClass("synergyPane", SynergyPane)
	        .provideClass("searchPane", SearchPane)
	        .provideClass("helpPane", HelpPane)
	        .provideClass("settingsPane", SettingsPane)
	        .provideFactory("logPane", () => {
	        const logPane = LogPane.new();
	        logger.associateWithLogPane(logPane);
	        return logPane;
	    })
	        .provideClass("sidebar", Sidebar)
	        .provideClass("mapView", LeafletMapView)
	        .provideClass("mapModel", LeafletMapModel)
	        .provideClass("mapController", LeafletMapController)
	        .build());
	    if (injectorErr[1] !== null) {
	        logger.logError(`Error building injector: ${injectorErr[1]}`);
	        // TODO: Error handling
	        return;
	    }
	    const injector = injectorErr[0];
	    const floors = injector.resolve("floors");
	    floors.addTo(map);
	    // Add location dot if we might be able to use it
	    const locator = injector.resolve("locator");
	    if (locator.getCanEverGeolocate()) {
	        const location = injector.injectClass(LLocation);
	        location.addTo(map);
	    }
	    // Create room label layers
	    const mapData = injector.resolve("mapData");
	    mapData
	        .getAllFloors()
	        .map((floorData) => floorData.number)
	        .map((floor) => injector.injectClass(RoomLabelFactory).build(floor, {
	        minNativeZoom: MIN_ZOOM,
	        maxNativeZoom: MAX_ZOOM,
	        bounds: BOUNDS,
	    }))
	        .forEach((layer) => floors.addLayer(layer));
	    // Sets the map view if url is argumentated
	    const navigationPane = injector.resolve("navigationPane");
	    setMapUrlView(window.location.href, map, floors, navigationPane);
	    // Set up developer mode
	    injector.injectClass(DeveloperModeService);
	}
	function defaultSettings() {
	    const settings = new Settings("settings");
	    settings.setDefault("bathroom-gender", "no-selection");
	    settings.setDefault("dev", false);
	    settings.setDefault("synergy", false);
	    settings.setDefault("hiding-location", false);
	    settings.setDefault("show-closed", false);
	    settings.setDefault("show-infrastructure", false);
	    settings.setDefault("show-emergency", false);
	    settings.setDefault("logger", false);
	    settings.setDefault("show-markers", true);
	    settings.setDefault("location-permission", false);
	    settings.setDefault("pd1", "");
	    settings.setDefault("pd2", "");
	    settings.setDefault("pd3", "");
	    settings.setDefault("pd4", "");
	    settings.setDefault("pd5", "");
	    settings.setDefault("pd6", "");
	    settings.setDefault("pd7", "");
	    settings.setDefault("pd8", "");
	    settings.setDefault("hr", "");
	    return settings;
	}
	main();

}());
//# sourceMappingURL=bundle.js.map
