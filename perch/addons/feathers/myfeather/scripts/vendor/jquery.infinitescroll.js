/*jshint undef: true */
/*global jQuery: true */

/*
   --------------------------------
   Infinite Scroll
   --------------------------------
   + https://github.com/paulirish/infinite-scroll
   + version 2.0b2.120519
   + Copyright 2011/12 Paul Irish & Luke Shumard
   + Licensed under the MIT license

   + Documentation: http://infinite-scroll.com/
*/

(function (window, $, undefined) {
	"use strict";

    $.infinitescroll = function infscr(options, callback, element) {
        this.element = $(element);

        // Flag the object in the event of a failed creation
        if (!this._create(options, callback)) {
            this.failed = true;
        }
    };

    $.infinitescroll.defaults = {
        loading: {
            finished: undefined,
            finishedMsg: "<em>No more stories to load</em>",
			img: "data:image/gif;base64,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",
            msg: null,
            msgText: "<em>Loading the next set of posts...</em>",
            selector: null,
            speed: 'fast',
            start: undefined
        },
        state: {
            isDuringAjax: false,
            isInvalidPage: false,
            isDestroyed: false,
            isDone: false, // For when it goes all the way through the archive.
            isPaused: false,
            isBeyondMaxPage: false,
            currPage: 1
        },
        debug: false,
		behavior: undefined,
        binder: $(window), // used to cache the selector
        nextSelector: "div.navigation a:first",
        navSelector: "div.navigation",
        contentSelector: null, // rename to pageFragment
        extraScrollPx: 150,
        itemSelector: "div.post",
        animate: false,
        pathParse: undefined,
        dataType: 'html',
        appendCallback: true,
        bufferPx: 40,
        errorCallback: function () { },
        infid: 0, //Instance ID
        pixelsFromNavToBottom: undefined,
        path: undefined, // Either parts of a URL as an array (e.g. ["/page/", "/"] or a function that takes in the page number and returns a URL
		prefill: false, // When the document is smaller than the window, load data until the document is larger or links are exhausted
        maxPage: undefined // to manually control maximum page (when maxPage is undefined, maximum page limitation is not work)
	};

    $.infinitescroll.prototype = {

        /*	
            ----------------------------
            Private methods
            ----------------------------
            */

        // Bind or unbind from scroll
        _binding: function infscr_binding(binding) {

            var instance = this,
            opts = instance.options;

            opts.v = '2.0b2.120520';

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_binding_'+opts.behavior] !== undefined) {
                this['_binding_'+opts.behavior].call(this);
                return;
            }

            if (binding !== 'bind' && binding !== 'unbind') {
                this._debug('Binding value  ' + binding + ' not valid');
                return false;
            }

            if (binding === 'unbind') {
                (this.options.binder).unbind('smartscroll.infscr.' + instance.options.infid);
            } else {
                (this.options.binder)[binding]('smartscroll.infscr.' + instance.options.infid, function () {
                    instance.scroll();
                });
            }

            this._debug('Binding', binding);
        },

        // Fundamental aspects of the plugin are initialized
        _create: function infscr_create(options, callback) {

            // Add custom options to defaults
            var opts = $.extend(true, {}, $.infinitescroll.defaults, options);
			this.options = opts;
			var $window = $(window);
			var instance = this;

			// Validate selectors
            if (!instance._validate(options)) {
				return false;
			}

            // Validate page fragment path
            var path = $(opts.nextSelector).attr('href');
            if (!path) {
                this._debug('Navigation selector not found');
                return false;
            }

            // Set the path to be a relative URL from root.
            opts.path = opts.path || this._determinepath(path);

            // contentSelector is 'page fragment' option for .load() / .ajax() calls
            opts.contentSelector = opts.contentSelector || this.element;

            // loading.selector - if we want to place the load message in a specific selector, defaulted to the contentSelector
            opts.loading.selector = opts.loading.selector || opts.contentSelector;

            // Define loading.msg
            opts.loading.msg = opts.loading.msg || $('<div id="infscr-loading"><img alt="Loading..." src="' + opts.loading.img + '" /><div>' + opts.loading.msgText + '</div></div>');

            // Preload loading.img
            (new Image()).src = opts.loading.img;

            // distance from nav links to bottom
            // computed as: height of the document + top offset of container - top offset of nav link
            if(opts.pixelsFromNavToBottom === undefined) {
				opts.pixelsFromNavToBottom = $(document).height() - $(opts.navSelector).offset().top;
				this._debug("pixelsFromNavToBottom: " + opts.pixelsFromNavToBottom);
			}

			var self = this;

            // determine loading.start actions
            opts.loading.start = opts.loading.start || function() {
                $(opts.navSelector).hide();
                opts.loading.msg
                .appendTo(opts.loading.selector)
                .show(opts.loading.speed, $.proxy(function() {
					this.beginAjax(opts);
				}, self));
            };

            // determine loading.finished actions
            opts.loading.finished = opts.loading.finished || function() {
                if (!opts.state.isBeyondMaxPage)
                    opts.loading.msg.fadeOut(opts.loading.speed);
            };

			// callback loading
            opts.callback = function(instance, data, url) {
                if (!!opts.behavior && instance['_callback_'+opts.behavior] !== undefined) {
                    instance['_callback_'+opts.behavior].call($(opts.contentSelector)[0], data, url);
                }

                if (callback) {
                    callback.call($(opts.contentSelector)[0], data, opts, url);
                }

				if (opts.prefill) {
					$window.bind("resize.infinite-scroll", instance._prefill);
				}
            };

			if (options.debug) {
				// Tell IE9 to use its built-in console
				if (Function.prototype.bind && (typeof console === 'object' || typeof console === 'function') && typeof console.log === "object") {
					["log","info","warn","error","assert","dir","clear","profile","profileEnd"]
						.forEach(function (method) {
							console[method] = this.call(console[method], console);
						}, Function.prototype.bind);
				}
			}

            this._setup();

			// Setups the prefill method for use
			if (opts.prefill) {
				this._prefill();
			}

            // Return true to indicate successful creation
            return true;
        },

		_prefill: function infscr_prefill() {
			var instance = this;
			var $window = $(window);

			function needsPrefill() {
				return (instance.options.contentSelector.height() <= $window.height());
			}

			this._prefill = function() {
				if (needsPrefill()) {
					instance.scroll();
				}

				$window.bind("resize.infinite-scroll", function() {
					if (needsPrefill()) {
						$window.unbind("resize.infinite-scroll");
						instance.scroll();
					}
				});
			};

			// Call self after setting up the new function
			this._prefill();
		},

        // Console log wrapper
        _debug: function infscr_debug() {
			if (true !== this.options.debug) {
				return;
			}

			if (typeof console !== 'undefined' && typeof console.log === 'function') {
				// Modern browsers
				// Single argument, which is a string
				if ((Array.prototype.slice.call(arguments)).length === 1 && typeof Array.prototype.slice.call(arguments)[0] === 'string') {
					console.log( (Array.prototype.slice.call(arguments)).toString() );
				} else {
					console.log( Array.prototype.slice.call(arguments) );
				}
			} else if (!Function.prototype.bind && typeof console !== 'undefined' && typeof console.log === 'object') {
				// IE8
				Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));
			}
        },

        // find the number to increment in the path.
        _determinepath: function infscr_determinepath(path) {

            var opts = this.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_determinepath_'+opts.behavior] !== undefined) {
                return this['_determinepath_'+opts.behavior].call(this,path);
            }

            if (!!opts.pathParse) {

                this._debug('pathParse manual');
                return opts.pathParse(path, this.options.state.currPage+1);

            } else if (path.match(/^(.*?)\b2\b(.*?$)/)) {
                path = path.match(/^(.*?)\b2\b(.*?$)/).slice(1);

                // if there is any 2 in the url at all.    
            } else if (path.match(/^(.*?)2(.*?$)/)) {

                // page= is used in django:
                // http://www.infinite-scroll.com/changelog/comment-page-1/#comment-127
                if (path.match(/^(.*?page=)2(\/.*|$)/)) {
                    path = path.match(/^(.*?page=)2(\/.*|$)/).slice(1);
                    return path;
                }

                path = path.match(/^(.*?)2(.*?$)/).slice(1);

            } else {

                // page= is used in drupal too but second page is page=1 not page=2:
                // thx Jerod Fritz, vladikoff
                if (path.match(/^(.*?page=)1(\/.*|$)/)) {
                    path = path.match(/^(.*?page=)1(\/.*|$)/).slice(1);
                    return path;
                } else {
                    this._debug('Sorry, we couldn\'t parse your Next (Previous Posts) URL. Verify your the css selector points to the correct A tag. If you still get this error: yell, scream, and kindly ask for help at infinite-scroll.com.');
                    // Get rid of isInvalidPage to allow permalink to state
                    opts.state.isInvalidPage = true;  //prevent it from running on this page.
                }
            }
            this._debug('determinePath', path);
            return path;

        },

        // Custom error
        _error: function infscr_error(xhr) {

            var opts = this.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_error_'+opts.behavior] !== undefined) {
                this['_error_'+opts.behavior].call(this,xhr);
                return;
            }

            if (xhr !== 'destroy' && xhr !== 'end') {
                xhr = 'unknown';
            }

            this._debug('Error', xhr);

            if (xhr === 'end' || opts.state.isBeyondMaxPage) {
                this._showdonemsg();
            }

            opts.state.isDone = true;
            opts.state.currPage = 1; // if you need to go back to this instance
            opts.state.isPaused = false;
            opts.state.isBeyondMaxPage = false;
            this._binding('unbind');

        },

        // Load Callback
        _loadcallback: function infscr_loadcallback(box, data, url) {
            var opts = this.options,
            callback = this.options.callback, // GLOBAL OBJECT FOR CALLBACK
            result = (opts.state.isDone) ? 'done' : (!opts.appendCallback) ? 'no-append' : 'append',
            frag;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_loadcallback_'+opts.behavior] !== undefined) {
                this['_loadcallback_'+opts.behavior].call(this,box,data);
                return;
            }

			switch (result) {
				case 'done':
					this._showdonemsg();
					return false;

				case 'no-append':
					if (opts.dataType === 'html') {
						data = '<div>' + data + '</div>';
						data = $(data).find(opts.itemSelector);
					}
					break;

				case 'append':
					var children = box.children();
					// if it didn't return anything
					if (children.length === 0) {
						return this._error('end');
					}

					// use a documentFragment because it works when content is going into a table or UL
					frag = document.createDocumentFragment();
					while (box[0].firstChild) {
						frag.appendChild(box[0].firstChild);
					}

					this._debug('contentSelector', $(opts.contentSelector)[0]);
					$(opts.contentSelector)[0].appendChild(frag);
					// previously, we would pass in the new DOM element as context for the callback
					// however we're now using a documentfragment, which doesn't have parents or children,
					// so the context is the contentContainer guy, and we pass in an array
					// of the elements collected as the first argument.

					data = children.get();
					break;
			}

            // loadingEnd function
            opts.loading.finished.call($(opts.contentSelector)[0],opts);

            // smooth scroll to ease in the new content
            if (opts.animate) {
                var scrollTo = $(window).scrollTop() + $(opts.loading.msg).height() + opts.extraScrollPx + 'px';
                $('html,body').animate({ scrollTop: scrollTo }, 800, function () { opts.state.isDuringAjax = false; });
            }

            if (!opts.animate) {
				// once the call is done, we can allow it again.
				opts.state.isDuringAjax = false;
			}

            callback(this, data, url);

			if (opts.prefill) {
				this._prefill();
			}
		},

        _nearbottom: function infscr_nearbottom() {

            var opts = this.options,
            pixelsFromWindowBottomToBottom = 0 + $(document).height() - (opts.binder.scrollTop()) - $(window).height();

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_nearbottom_'+opts.behavior] !== undefined) {
                return this['_nearbottom_'+opts.behavior].call(this);
            }

            this._debug('math:', pixelsFromWindowBottomToBottom, opts.pixelsFromNavToBottom);

            // if distance remaining in the scroll (including buffer) is less than the orignal nav to bottom....
            return (pixelsFromWindowBottomToBottom - opts.bufferPx < opts.pixelsFromNavToBottom);

        },

        // Pause / temporarily disable plugin from firing
        _pausing: function infscr_pausing(pause) {

            var opts = this.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_pausing_'+opts.behavior] !== undefined) {
                this['_pausing_'+opts.behavior].call(this,pause);
                return;
            }

            // If pause is not 'pause' or 'resume', toggle it's value
            if (pause !== 'pause' && pause !== 'resume' && pause !== null) {
                this._debug('Invalid argument. Toggling pause value instead');
            }

            pause = (pause && (pause === 'pause' || pause === 'resume')) ? pause : 'toggle';

            switch (pause) {
                case 'pause':
                    opts.state.isPaused = true;
                break;

                case 'resume':
                    opts.state.isPaused = false;
                break;

                case 'toggle':
                    opts.state.isPaused = !opts.state.isPaused;
                break;
            }

            this._debug('Paused', opts.state.isPaused);
            return false;

        },

        // Behavior is determined
        // If the behavior option is undefined, it will set to default and bind to scroll
        _setup: function infscr_setup() {

            var opts = this.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_setup_'+opts.behavior] !== undefined) {
                this['_setup_'+opts.behavior].call(this);
                return;
            }

            this._binding('bind');

            return false;

        },

        // Show done message
        _showdonemsg: function infscr_showdonemsg() {

            var opts = this.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['_showdonemsg_'+opts.behavior] !== undefined) {
                this['_showdonemsg_'+opts.behavior].call(this);
                return;
            }

            opts.loading.msg
            .find('img')
            .hide()
            .parent()
            .find('div').html(opts.loading.finishedMsg).animate({ opacity: 1 }, 2000, function () {
                $(this).parent().fadeOut(opts.loading.speed);
            });

            // user provided callback when done    
            opts.errorCallback.call($(opts.contentSelector)[0],'done');
        },

        // grab each selector option and see if any fail
        _validate: function infscr_validate(opts) {
            for (var key in opts) {
                if (key.indexOf && key.indexOf('Selector') > -1 && $(opts[key]).length === 0) {
                    this._debug('Your ' + key + ' found no elements.');
                    return false;
                }
            }

            return true;
        },

        /*	
            ----------------------------
            Public methods
            ----------------------------
            */

        // Bind to scroll
        bind: function infscr_bind() {
            this._binding('bind');
        },

        // Destroy current instance of plugin
        destroy: function infscr_destroy() {
            this.options.state.isDestroyed = true;
			this.options.loading.finished();
            return this._error('destroy');
        },

        // Set pause value to false
        pause: function infscr_pause() {
            this._pausing('pause');
        },

        // Set pause value to false
        resume: function infscr_resume() {
            this._pausing('resume');
        },

		beginAjax: function infscr_ajax(opts) {
			var instance = this,
				path = opts.path,
				box, desturl, method, condition;

			// increment the URL bit. e.g. /page/3/
			opts.state.currPage++;

            // Manually control maximum page 
            if ( opts.maxPage != undefined && opts.state.currPage > opts.maxPage ){
                opts.state.isBeyondMaxPage = true;
                this.destroy();
                return;
            }

			// if we're dealing with a table we can't use DIVs
			box = $(opts.contentSelector).is('table, tbody') ? $('<tbody/>') : $('<div/>');

			desturl = (typeof path === 'function') ? path(opts.state.currPage) : path.join(opts.state.currPage);
			instance._debug('heading into ajax', desturl);

			method = (opts.dataType === 'html' || opts.dataType === 'json' ) ? opts.dataType : 'html+callback';
			if (opts.appendCallback && opts.dataType === 'html') {
				method += '+callback';
			}

			switch (method) {
				case 'html+callback':
					instance._debug('Using HTML via .load() method');
					box.load(desturl + ' ' + opts.itemSelector, undefined, function infscr_ajax_callback(responseText) {
						instance._loadcallback(box, responseText, desturl);
					});

					break;

				case 'html':
					instance._debug('Using ' + (method.toUpperCase()) + ' via $.ajax() method');
					$.ajax({
						// params
						url: desturl,
						dataType: opts.dataType,
						complete: function infscr_ajax_callback(jqXHR, textStatus) {
							condition = (typeof (jqXHR.isResolved) !== 'undefined') ? (jqXHR.isResolved()) : (textStatus === "success" || textStatus === "notmodified");
							if (condition) {
								instance._loadcallback(box, jqXHR.responseText, desturl);
							} else {
								instance._error('end');
							}
						}
					});

					break;
				case 'json':
					instance._debug('Using ' + (method.toUpperCase()) + ' via $.ajax() method');
					$.ajax({
						dataType: 'json',
						type: 'GET',
						url: desturl,
						success: function (data, textStatus, jqXHR) {
							condition = (typeof (jqXHR.isResolved) !== 'undefined') ? (jqXHR.isResolved()) : (textStatus === "success" || textStatus === "notmodified");
							if (opts.appendCallback) {
								// if appendCallback is true, you must defined template in options.
								// note that data passed into _loadcallback is already an html (after processed in opts.template(data)).
								if (opts.template !== undefined) {
									var theData = opts.template(data);
									box.append(theData);
									if (condition) {
										instance._loadcallback(box, theData);
									} else {
										instance._error('end');
									}
								} else {
									instance._debug("template must be defined.");
									instance._error('end');
								}
							} else {
								// if appendCallback is false, we will pass in the JSON object. you should handle it yourself in your callback.
								if (condition) {
									instance._loadcallback(box, data, desturl);
								} else {
									instance._error('end');
								}
							}
						},
						error: function() {
							instance._debug("JSON ajax request failed.");
							instance._error('end');
						}
					});

					break;
			}
		},

        // Retrieve next set of content items
        retrieve: function infscr_retrieve(pageNum) {
			pageNum = pageNum || null;

			var instance = this,
            opts = instance.options;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['retrieve_'+opts.behavior] !== undefined) {
                this['retrieve_'+opts.behavior].call(this,pageNum);
                return;
            }

            // for manual triggers, if destroyed, get out of here
            if (opts.state.isDestroyed) {
                this._debug('Instance is destroyed');
                return false;
            }

            // we dont want to fire the ajax multiple times
            opts.state.isDuringAjax = true;

            opts.loading.start.call($(opts.contentSelector)[0],opts);
        },

        // Check to see next page is needed
        scroll: function infscr_scroll() {

            var opts = this.options,
            state = opts.state;

            // if behavior is defined and this function is extended, call that instead of default
            if (!!opts.behavior && this['scroll_'+opts.behavior] !== undefined) {
                this['scroll_'+opts.behavior].call(this);
                return;
            }

            if (state.isDuringAjax || state.isInvalidPage || state.isDone || state.isDestroyed || state.isPaused) {
				return;
			}

            if (!this._nearbottom()) {
				return;
			}

            this.retrieve();

        },

        // Toggle pause value
        toggle: function infscr_toggle() {
            this._pausing();
        },

        // Unbind from scroll
        unbind: function infscr_unbind() {
            this._binding('unbind');
        },

        // update options
        update: function infscr_options(key) {
            if ($.isPlainObject(key)) {
                this.options = $.extend(true,this.options,key);
            }
        }
    };


    /*	
        ----------------------------
        Infinite Scroll function
        ----------------------------

        Borrowed logic from the following...

        jQuery UI
        - https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js

        jCarousel
        - https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js

        Masonry
        - https://github.com/desandro/masonry/blob/master/jquery.masonry.js		

*/

    $.fn.infinitescroll = function infscr_init(options, callback) {


        var thisCall = typeof options;

        switch (thisCall) {

            // method 
            case 'string':
                var args = Array.prototype.slice.call(arguments, 1);

				this.each(function () {
					var instance = $.data(this, 'infinitescroll');

					if (!instance) {
						// not setup yet
						// return $.error('Method ' + options + ' cannot be called until Infinite Scroll is setup');
						return false;
					}

					if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
						// return $.error('No such method ' + options + ' for Infinite Scroll');
						return false;
					}

					// no errors!
					instance[options].apply(instance, args);
				});

            break;

            // creation 
            case 'object':

                this.each(function () {

                var instance = $.data(this, 'infinitescroll');

                if (instance) {

                    // update options of current instance
                    instance.update(options);

                } else {

                    // initialize new instance
                    instance = new $.infinitescroll(options, callback, this);

                    // don't attach if instantiation failed
                    if (!instance.failed) {
                        $.data(this, 'infinitescroll', instance);
                    }

                }

            });

            break;

        }

        return this;
    };



    /* 
     * smartscroll: debounced scroll event for jQuery *
     * https://github.com/lukeshumard/smartscroll
     * Based on smartresize by @louis_remi: https://github.com/lrbabe/jquery.smartresize.js *
     * Copyright 2011 Louis-Remi & Luke Shumard * Licensed under the MIT license. *
     */

    var event = $.event,
    scrollTimeout;

    event.special.smartscroll = {
        setup: function () {
            $(this).bind("scroll", event.special.smartscroll.handler);
        },
        teardown: function () {
            $(this).unbind("scroll", event.special.smartscroll.handler);
        },
        handler: function (event, execAsap) {
            // Save the context
            var context = this,
            args = arguments;

            // set correct event type
            event.type = "smartscroll";

            if (scrollTimeout) { clearTimeout(scrollTimeout); }
            scrollTimeout = setTimeout(function () {
                $(context).trigger('smartscroll', args);
            }, execAsap === "execAsap" ? 0 : 100);
        }
    };

    $.fn.smartscroll = function (fn) {
        return fn ? this.bind("smartscroll", fn) : this.trigger("smartscroll", ["execAsap"]);
    };


})(window, jQuery);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ2ZW5kb3IvanF1ZXJ5LmluZmluaXRlc2Nyb2xsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qanNoaW50IHVuZGVmOiB0cnVlICovXG4vKmdsb2JhbCBqUXVlcnk6IHRydWUgKi9cblxuLypcbiAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICBJbmZpbml0ZSBTY3JvbGxcbiAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICArIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXVsaXJpc2gvaW5maW5pdGUtc2Nyb2xsXG4gICArIHZlcnNpb24gMi4wYjIuMTIwNTE5XG4gICArIENvcHlyaWdodCAyMDExLzEyIFBhdWwgSXJpc2ggJiBMdWtlIFNodW1hcmRcbiAgICsgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG5cbiAgICsgRG9jdW1lbnRhdGlvbjogaHR0cDovL2luZmluaXRlLXNjcm9sbC5jb20vXG4qL1xuXG4oZnVuY3Rpb24gKHdpbmRvdywgJCwgdW5kZWZpbmVkKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG4gICAgJC5pbmZpbml0ZXNjcm9sbCA9IGZ1bmN0aW9uIGluZnNjcihvcHRpb25zLCBjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuXG4gICAgICAgIC8vIEZsYWcgdGhlIG9iamVjdCBpbiB0aGUgZXZlbnQgb2YgYSBmYWlsZWQgY3JlYXRpb25cbiAgICAgICAgaWYgKCF0aGlzLl9jcmVhdGUob3B0aW9ucywgY2FsbGJhY2spKSB7XG4gICAgICAgICAgICB0aGlzLmZhaWxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJC5pbmZpbml0ZXNjcm9sbC5kZWZhdWx0cyA9IHtcbiAgICAgICAgbG9hZGluZzoge1xuICAgICAgICAgICAgZmluaXNoZWQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGZpbmlzaGVkTXNnOiBcIjxlbT5ObyBtb3JlIHN0b3JpZXMgdG8gbG9hZDwvZW0+XCIsXG5cdFx0XHRpbWc6IFwiZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoM0FBVEFQUWVBUER5K01uUTZMVy80TjNoOE16VDZyakM0c1RNNXIvSTVOSFg3TjdqOGM3VTZ0dmc4T0xsOHVYbzlPanI5YjNHNU1mUDZPdnU5dFBaN1BUMSt2WDIrdGJiN3ZmNCs4L1c2OWpkN3JDNzN2bjUvTy94K0syNDNhaTAyLy8vL3dBQUFDSC9DMDVGVkZORFFWQkZNaTR3QXdFQUFBQWgrUVFFQ2dEL0FDd0FBQUFBM0FBVEFBQUYvNkFuam1ScG5taXFybXpydm5Bc3ozUnQzM2l1NzN6di84Q2djRWowQkFTY3BITEpiRHFmMEtoMFNxMWFyOWlzZGlvSXRBS0d3K01BS1lNRmhiRjYzQ1c0MzhmMG1nMVIyTzhFdVhqL2FPUHRhSHg3Zm45NmdvUjRobXVJZDRxRGRYOTVjNCtSQklHQ0I0eUFqcG1RaFpOMFlHWUdYaXRkWkJJVkdBc0xvcTRCQktRRHN3bTFDUVJrY0c2eXRyWUt1YnE4dmJmQWNNSzl2N3E3RU1PMXljckh2c1c2emNUS3Njek56OEhadzl2RzNjalRzTUlZcVFrQ0xCd0hDZ3NNRFE0UkRBWUlxZllTRnhEeEVmejg4L1gzOE9ucjE2K0JwNEFEQ2NvN2VDOGhRWU1BRWU1N3lOQ2V3NElWQlU3RUdORGlSbjhaODMxY0dMSGhTSWdkRmY5Y2hJZUJnN29BN2dqYVdVV1RWUUFHRTNMcUJEQ1RsYzlXT0hmbTdQa1RxTkNoNTRyZVBEcUI2TStsUjUzNmhDcFVxczJnVlpNK3hiclRxdEdvV3FkeTFlbVZhbGVYS3pnZ1lCQkI1eTFhY0ZOWm1FdlhBb04yY0dmSnJUdjNibDY5RmZqMnhadDNMMSsvZnczWFJWdzRzR0RHY1IwZkpoeFpzRjNLdEJUVGhaeFo4bUxNZ0MzZlJhdENiWU1ORkN6d0xFcUxnRTROc0RXcy90dnFkZXpaZjEzSHZrMkE5U3pkdTJYM3BnMThOKzY4eFhuN3JoMWMrUExrc0kvRGhlNmN1TzNvdzNOZlY5MmJkQXJUcUMyRWJkM0E4dmpmNVFXZkg2Qmc3TnoxN2MyZmo2OStmbnErOE4yTHR5K2Z1UDc4L2VWMlgxM25lSWNDZUJSd3hvcmJackExQU5vQ0RHcmdvRzhSVHNoYWhROWlTS0VFelVtWUlZZk5XVmlVaGhlQ0dKeUlQNUU0b29tN1dXamdDZUJGQUpOdjFEVlYwMU1BZEpoaGpka3BsV056Ty81b1hJODQ2bmpqVkVJcVIyT1MyQjFwRTVQVnNjYWpreGhNeWNxTEpnaFFTd1Q0MFBnZkFsNEdxTlNYWWRaWEpuNWdTa21tbW1KdTFhWlliMTRWNTFkbytwVE9DbUE0MEFxVkNJaEc1SUo5UHZZbmhJRk94bWRxaHBhSTZHZUhDdHBvb2lzdXV0bWcrRWc2MktPTUt1cW9UYVhnaWNRV29JWXE2cWlrbG1vcUZWMFVvZXFxckxicTZxdXd4aXJyckxUV2F1dXRKNFFBQUNINUJBVUtBQndBTEFjQUJBRE9BQXNBQUFYL0lQZDBEMmR5UkNvVXAvazhncEhPS3RzZVI5eWlTbUdidUJ5a2xlcjlYTEFoa2JEYXZYVEw1azJvcUZxTk94elVaUFU1WVlaZDFYc0Q3MnJacEJqYmVoNTJtU05uTVNDOGx3YmxLWkd3aSswUWZJSjhDbmNuQ29DRGdvVm5CSG1LZkJ5R0ppbVBrSXd0aUFlQmtINlpISmFLbUNlVm5LS1RISWloZzVLTnE0dW9xbUV0Y1JVdEVSRU1CZ2d0RXI0UURyakN1UkM4aDcvQnd4RU5laWNTRjhES3k4MnB5TkxNT3h6V3lnekZtZHZEMkwzUDBkemU0K1hoMUFya3llcGk3ZGZGdnZUdExRa1pCQzBUL0ZYM0NSZ0NNT0JIc0orRUhZUVk3T2luQUdFQ2dRc0IrTHUzQU9LK0Nld2NXand4UWVKQmlodE5HSFNvUU9FK2lRMy8vNFhrd0JCaFJaTWNVUzZZU1hPQXdJTDhQR3FFYVNKQ2lZdDlTTm9DbW5KUEFnVVZMQ2hkYW9GQlVSTjhNQXpsMlBRcGh3UUxmREZkNmxUb3dnbEh2ZTZyS3BiamhLNy9wRzVWaW5aUDFxa2l6MXJsNCt0cjJMUndXVTY0Y0ZFaWh3RXRaZ2JnUjFVaUhhTVZ2eHBPU3dCQTM3a3pHejllOEcrQjVNSUVLTHV0T0dFc0FIMkFUUXdZZlRtdVg4YUVUV2RHUFptaVpjY2NOU3plVENBMVN3MGJkaWl0QzdMQldndThqUXI4SFJ6cWdwSzZnWDg4UWJyQjE0ei9rRitFTHB3QjhlVlFqL0prcWR5bEF1ZGppLyt0czMwMzl2RUVmSzhWejJkbHZ4WktHMENtYmtLREJ2bGxSZDZmQ3pEdkJMS0JEU0NlZmZoUkpFRmViRmsxay9NdjlqVklvSUpaU2VCZ2d3VWFOZUIrUWszNElFMGNYbGloY2ZSeGtPQUpGRmh3R21LbG1XRGlha1poVUp0bkxCcG5XV2NuS2FBWmN4STBwaUZHR0xCbTFtYzkwa2FqU0N2ZWVCVldLZVlFb1Uyd3FlYVFpMFBldG9FK3JyMTRFcFZDN29BYkFVSHFoWUV4Ym4yWEhIc1ZxYmNWZXc5dHg4K1hKS2s1QVpzcXFkbGRkR3BxQUtkYkFZQm4xcGNjem1TVGRXdmRtWjE3YzFiM0ZaOTl2blRkQ1JGTThPRWNBaEx3bTFOZFhuV2NCQlNNUldtZmtXWnFWbHNtTElpQXAvbzFnR1YydnBTNGxhbEdZc1VPcVhyZGRjS0NtSzYxYVo4U2pFcFVwVkZWb0NwVGo0cjY2MUttN2tCSGpyRHljMVJBSVFBQUlma0VCUW9BR3dBc0J3QUVBTTRBQ3dBQUJmL2d0bVVDZDRnb1FRZ0ZLajZQWUtpMHlycmJjOGk0b2hRdDEyRUhjYWwrTU5TUWlDUDhnaWdkejdpQ2lvYUNJdlVtWkxwOFFCelcwRU4ydlNsQ3VEdEZLYXE0UnlIelFMRUtaTmRpUURoUkRWb29Dd2tiZm01OUVBbUtpNFNHSW0rQWpJc0tqaHNxQjRtU2pUMklPSU9VbklDZUNhQi9tWktGTlRTUm1xVnBtSnFrbFNxc2txNlBmWVlDRHdZSERDNFJFUXdHQ0JMR3h4SVFEc0hNd2hBSVg4Ykt6Y0VOZ1NMR0Y5UFUxajNTeTl6WDJOcmd6UXppQ2hMazFCSFd4Y2pmN04wNDZ0dk44MjcxNWN6bjlQcnl6NklsYzRBQ2o0RUJPQ1pNOEtFbkFZWUFEQlJLbkFDQVlVTUZ2MXdvdEloQ0VjYUpDaXNxd0pGZ0FVU1FHeVgva0NTVlVVVElkS013Smx5bzBvWEhsaHNrd3JUSmNpWkhFWHNnYXFTNHM2UEppQ0FyMXV6WVU4a0JCU2duV0ZxcG9NSk1Vakd0RG1Vd2ttZlZtVnlwYWtXaEVLdlhzUzRuaExXNXdOalZyb0pJb2MwNXdTelRyMFB0aWlncFllNEVDMnZqNGlXckZ1NWV1V0lNUkJoYWNhVkpoWVFCRUZqQTlqSGp5UTB4RUFCd0djZUdBWllqWTBZQk9yUkxDeFVwMjlRTStiUmt4NXM3WnlZZ1ZiVHF3d3RpMnliSit2THREWXB5Y3laYllPbHB0eGR4MGtWK1Y3bEM1aUpBeXlScndZS3hBZGl6ODJuZzAvam5BZE1KRnowY1BpMTA0RWMxVmo5L002RjE3M3ZLTC9mZVh2MTU2ZHcxMXRscWVNTW52NFY1QXA1M0dtalFRSDk3bkZmZytJRml1Y2ZnUlg1WjhLQWdiVWxRNElVTElsZ2hoaGRPU0I2QWdYMElWbjhlUmVnaGVuM05SSUJzUmduSDRsNEx1RWlkWkJqd1JwdDZOTTVXR3dvVzBLU2pDd1g2eUpTTWFiMkd3d0FQRFhmYUJDdFdwbHVSVFFxQzVKTTVvVVpBalVOUytWZU9MV3BKRVE3VllRQU5XMElOSlNaVkRGU25acGhqU2lrZm16RTVONEVFYlFJMVFKbW5XWENtSHVsUnAyZWR3RFhGNDN0eHVrZW5Kd3ZJOXh5ZzlRMjZaM016R1VjQllGRUNoWmg2RFZUcTM0QVU4SWZsaDUxU2QrQ25LRllRNm1tWmtocWZCS2ZTeFpXcUE5RFphbldqeG1ocld3aTBxdENydC80M0s2V3FWampwbWhJcWdFR3ZjdWxhR0trbEtzdEFBQ0VBQUNINUJBVUtBQndBTEFjQUJBRE9BQXNBQUFYL0lDZHlRbWFNWXlBVXFQZ0lCaUhQeE5weTc5a3FSWEg4d0FQc1JtRGRYcEFXZ1dkRUlZbTJsbENIcWpWSFUrampKa3dxQlRlY3dJdFNoTVhrRWZOV1NoOGUxTkdBY0xncERHbFJnazdFSi82QWUzVktmb0YvZkR1RmhvaFZlRGVDZlhrY0NRcURWUWNRaG4rVk5ET1ltcFNXYW9xQmxVU2Ztb3dqRUEraUVBRUdEUkd6dEF3R0NEY1hFQTYwdFhFaUNycTh2UkVNRUJMSXlSTEN4TVdTSE16RXhuYlJ2UTJTeTd2TjB6dlZ0TmZVMnRMWTNyUGdMZG5EdmNhNFZRUy9DcGszQUJ3U0xRa1lBUXdUL1AzMDl2Y0k3T3ZYcjk0akJRTUovbnNra0dBL0JRQlJMTkRuY0FJQWlEY0c2THN4QVdPTGlRem1lVVJCS1dTTENRYnYvMUYwZURHaW5KVUtSNDdZWTFJRWdRQVNLazdZYzdBQ1J3Wm03bUh3ZVJKb3o1OUJKVW9naXNLQ1VhRk1SMHg0U2xKQlZCRlRrOHBaaXZUUjBLNzNyTjV3cWxYRUFxNUZ5M0lZZ0hiRXpRMG5MeTRRU29DalhMb29tOTZWT0pFZUNvc0s1bjRra0ZmcVhqbDk0d2ErbDFndkFjR0lDYmV3QU9BeFk4bC9LeS9RaEFHejRjVWtHeHUySE5vemh3TUdCbkNVcVVkQmc5VXVXOWVVeW5xU3dMSElCdWplUGVmMVpHUVpYY00rT0Z1RUJlQmhpM09ZZ0x5cWN1YXhiVDl2TGtmNFNlcXlXeFNRcEtHQjJnUXBtMUtkV2J1NzJyUFJ6UjlOZTJOdTlLenIvMUpxajB5RC9mdnFQNGFYT3Q1c1cvNXFzWFhWY3YxTnNwOElCVUFtZ3N3R0YzbGxHZ2VVMVlWWFhLVE4xRmxoV0ZYVzNnSUUrRFZDaEFweXNBQ0hIbzdRNEEzNWxMaWNoaCtST0JtTEtBemdZbVlFWURBaENneEtHT09NbjRXUjRra0Rhb0JCT3hKdGROS1F4Rm1nNUpJV0lCblFjMDdHYU9SZlVZNEFFa2RWNmpIbENFSVNTWjV5VFhwcDFwYkdaYmtXbWN1Wm1RQ2FFNmlKMEZoak1hRGpUTXNnWmFORUhGUkFRVnAzYnFYblpFRDFxWWNFQ096NVY2QmhTV0NvVkpRSUt1S1FpMktGS0VrRUZBcW9Bbzd1WVNtTzNqazYxd1VVTUtta25KNFNHaW1CbUFhMHFWUUJoQUFBSWZrRUJRb0FHd0FzQndBRUFNNEFDd0FBQmYvZ0ptNUZtUmxFcWhKQytieXdnSzVwTzRySEkwRDNwaWkyMitNZzYvMEVqOTZ3ZUNNQWs3Y0RrWGY3bFpUVG5yTWw3ZWFZb3kxMEpOMFpGZGNvMFhBdXZLSTZxa2dWRkpYWU53amtJQmNOQmdSOFRRb0dmUnNKQ1J1Q1lZUVFpSStJQ29zaUNvR09rSWlLZlNsOG1Ka0haNFU5a1pNYkthSTNwS0dYbUpLcm5nbXVnNFd3a2hBMGxyQ0JXZ1lGQ0NNUUZ3b1FEUkhHeHd3R0NCTE16UkxFeDhpR3pNTU8wY1lOZUNNS3pCRFcxOWxuRjlEWERJWS80OFhnMDkzZjBRM3MxZGNSOE9MZTgrWTkxT1R2NXdyajdvN0IrN1ZOUXFBQklvUlZDTUJnZ3NPSEUzNmtTb0NCSWNTSDNFYkZhbmd4b2dKWUZpOENrSmhxUWNpTEpFZi9MRERKRWVKSUJUMEdzT3dZVVlKR0JTMGZqcFFBTWlkR215VlA2c3g0WTZWUWh6czlWVXdrd3FhQ0NoMHRtS29GdFNNRG1CT2Y5cGhnNFNyVnJST3Vhc1JRQWF4WHBWVWhkc1U2SXNFQ1psdlgza3dMVVd6UnQwQkhPTFRiTmxiWkczdlppbkFyZ2U1RHZuN3dicXRRa1NZQUFndEttblNzWUtWS28yQWZXMDQ4dWFQbUczODZpNFE4RVFNQkFJQW5mQjd4QnhCcXZhcEo5elg5V2dSUzJZTXBudllNR2RQSzNhTWp0LzNkVWNOSTRibHBqN2l3a01GV0RYRHZTbWdBbGlqcnQ5UlRSNzgrUFM2ejF1QUpaSWU5M1E4ZzV6Y3NXQ2kvNFkrQzhiYWg1elV2M3Z2ODl1ZnQzMFFQMjNwdW5HQ3g1OTU0b0JCd253WWFOQ0RZL3dZcnNZZWdnbk05QjJGcGY4R0cyQ0VVVldoYldBdEdvdUVHRHk3WTRJRUpWcmJTaVhnaHFHS0lvN3oxSVZjWElrS1dXUjM2MVFPTFdXbklod0VScExhYUNDZWU1aU1CR0pRbUpHeVBGVG5ia2ZIVlpHUnRJR3JnNUhBTEVKQVpidTM5QnVVRVVtcTFKSlFJUHRaaWxZNWhHZVNXc1NrNTJHOVhxc21nbGpkSWNBQnl0cTEzSHlJTTZSY1VBK3IxcVo0RUJGM1dIV0IyOXRCZ0F6UmhFR2hpZzhLbXFLRnY4U2VDZW8rbWdzRjdZRlhhMXFXU2JrRHBvbS9tcVIxUG1IQ3FKM2Z3TlJWWGpDN1M2Q1poRlZDUTJsV3ZaaWlyaFFxNDJTQUN0MjVJSzJodjhUcHJyaVVWMXVzR2dla2E3TEZjTm1DbGRNTGk2cVpNZ0ZMZ3B3MTZDaXBiN2JDMWtuWHNCaUVBQUNINUJBVUtBQnNBTEFjQUJBRE9BQXNBQUFYLzRGWnNKUGtVbVVHc0xDRVVUeXdYZ2xGdVNnN2ZXMXhBdk5XTEY2c0ZGY1BiNDJDOEVaQ2oyNEVKZENwMnlvZWdXc29sUzBVdTZmbWFtZzhuOFlZY0xVMmJYU2lSYVhNR3ZxVjYvS0FlSkFoOFZnWnFDWCtCZXhDRmlvV0FZZ3FOaTRxQVI0T1JoUnVIWTQwOGpBZVVoQW1ZWWl1VmxwaWZscUdaYTVDV2t6YzVmS21iYmhJcHNBb1FEUkc4dlF3UUNCTEN3eEs2dmI1cXdoZkd4eEVOYWh2Q0VBN056c2tTeTd2Tnp6ekswOVcvUE5IRjFOdlgyZFhjTjhLNTVjZmg2OUx1dmVvbDN2Tzh6d2k0WWhqK0FRd21DQnc0SVljbERBQUpEbFFnZ1ZPQ2hBb0xLa2dGa1NDQUhEd1dMS2hJRU9PTkFSc0RLcnlvZ0ZQSWlBVWIvOTVnSk5JaXc0d25JNzc4R0ZQaHpCS0ZPQXE4cUxKRWhRcGlOQXJqTWNIQ21sVENVRElvdVRLQmhBcEVMU3hGV2lHaVZLWTRFMkNBZWtQZ1VwaER1MDc0Mm5SclZMSlpueXJGU3FLUTJvaG9TWUFNVzZJb0RwTko0YkxkSUxUbkFqOEtVRjdVZUVOakFLdUR5eElnT3VHaU9JMEVCQk1nTE5ldzVBVXJEVE1Hc0ZpeHdCSWFOQ1F1QVhKQjU3cU5KMk9XbTJBajRza3dDUUNJeU5raGh0TWtkc0l1b2RFMEFONExKRFJnZkxQdG41WURMZEJscmFBQnl1VWJCZ3hRd0lDeE1PbllwVk9QZWowNzRPRmRsZmMwVHFDNjJPSWJjcHBIalY0bytMcmllV2hmVDhKQy9JL1Q2VzhvQ2wyOXZRMFhqTGRCYUEzczFSY1BCTzdsRnZwWDhCVm9HNE81alRYUlFSRHVKNkZEVHpFV0YxL0JDWmhnYnlBS0U5cUlDWUxsb1FZT0Z0YWhWUnNXWWxaNEtRSkhsd0hTL0lZYVo2c1pkOXRtdTVIUW0yeGkxVWFUYnp4WXdKay93QkY1ZzVFRVlPQlplRWZHWm1OZEZ5RlptWklSNGppa2JMVGhsaDVrVVVWSkdtUlQ3c2Vra3ppUldVSUFDQUJrM1Q0cUNzZWRnTzR4aGdHY1k3cTVwSEo0a2xCQlRRUkowQ2VIY29ZSEhVaDZ3Z2Zkbjl1SmRTZE1pZWJHSjB6VVBUY29TMjg2RkNrclp4bllvWVlLV0xrQm93aFFvQmVhT2xaQWdWaExpZHJYcWcyR2lxcFFwWjRhcHdTd1J0anFyQjNtdW9GOUJib2FYS21zaGxxV3FzV2lHdDJ3cGhKa1FiQVU1aG9DQUNINUJBVUtBQnNBTEFjQUJBRE9BQXNBQUFYL29HRncyV1p1VDVvWlJPc1NRbkdhS2pSdmlsSTg5M01JdGxOT0o1djVnRGNGckhoS0lXY0VZdS94RkVxTnY2QjFONjJhY2x5c0Y3ZnNaWWU1YU94MnlMNWFBVUdTYVQxb1RZTUJ3UTVWR0NBSmdZSUpDbngxZ0lPQmhYZHdpSWw3ZDBwMmlZR1FVQVFCam9PRlNRUi9sSVFIblorVWU2T2FncVl6U3FTSmk1ZVRwVHhHY2pjU0NoQU5FYnU4REJBSUVzSEJDaGU1dkwxM0c3ZkZ1c2NSRGNuS3VNM0gwTGEzRUE3T3o4a0tFc1hhenI3Q3c5L0d6dGFyNXVISHZ0ZTQ3TWprdHpuWjJ3MEcxK0QzQmdpckFxSm1KTUFRZ01HRWd3Z241RWkwZ0tEQmhCTUFMR1JZRU9KQmI1UWNXbFFvNGNiQWloWnozR2dJTXFGRUJTTTEvNFpFT1dQQWdwSUlKWFlVK1BJaFJHOGphMXFVNlZIbHpaa25KTlE2VWFuQ2pRa1dDSUdTVUdFakF3VkxqYzQ0K0RUcVVRdFBQUzVnZWpVclRhNVRKM2c5c1dDcjFCTlVXWkkxNjFTdGlRVURtTFlkR2Zlc2liUTNYTXExT1BZdGhyd3VBMnlVMkxCczJjQkhJeXBZUVBQbFlBS0ZENWNWdk5QdFc4ZVZHYmRjUUFEQVRzaU5PNGNGQVBrdkhwZWRQemM4a1VjUGdOR2daNVJORFpHMDVyZW9FOXMydlNFUDc5TUVHaVFHeTFxUDhMQTRaY2R0c0pFNDhPTm9MVEJ0VFYwQjlMc1RuUGNlb0lEQkRRdlM3Vzd2ZmpWWTNxM2VaNEEzMzlKNGVhQW1LcVUvc1Y1OEh2SmgyUmNuSUJzRFV3MEFCcWhCQTVhVjVWOVhVRkdpSGZWZUFpV3dvRmdKSnJJWFJIMXRFTWlERlY0b0hvQUVHbGFXaGdJR1NHQk8ybkZvbVlZM21LalZnbGlkYU5ZSkdKRGtXVzJ4eFRmYmpDYlZhT0dOcW9YMkdsb1I4WmVUYUVDUzlwdGhSR0pIMmcwYjNBZ2JrNmhOQU50dGVIRDJHSlV1Y2ZhakNRQnk1T09UUTI1WmdVUHZhVlZRbWJLaDk1MTAvcVFwd1h4M1NRZGZrOHRaSk9kNWI2SkpGcGxUM1pubW1YM3FkNWwxZWc1cTAwSHJ0VWtVbjBBS2FpR2pDbFNBZ0tMWVpjZ1dYd29jR1JjQ0ZHQ0t3U0I2Y2VxcGh3bVlSVUZZVC8xV0tsT2RVcGlwbXhXMG1sQ3FIallrQWFlb1pscXJxWjRxZCt1cFFLYWFwbi9BbWdBZWdaOEtVdFl0RkFRUUFnQWgrUVFGQ2dBYkFDd0hBQVFBemdBTEFBQUYvK0MyUFVjbWlDaVpHVVRyRWtLQmlzOGpRRXF1S3dVNUh5WEliRVBneVg3QllhNXdUTm1FTXdXc1NYc3FGYkVoOERZczltcmdHamRLNkdrUFk1R09lVTZyeXo3VUZvcFNRRXp5Z09HaEpCam9JZ01EQkFjQk0wVi9DWXFMQ1FxRk93b2JpWXlLam4yVGxJNkdLQzJZakpaa25vdWFaQWNRbEpVSGw2ZW9vSndLb29vYnFvZXdySlNFbXlLZHQ1OU5oUktGTXhMRUVBNFJ5TWtNRUFqREVoZkd5Y3FBRzhUUXg5SVJEUkRFM2QzUjJjdEQxUkxnMHR0S0VuYlk1d1pEMyt6SjZNN1gyUkhpOU9ieTd1L3I5ZzM4VUZqVGgyeFpKQkVCTURBYm9vZ0Fnd2tRSTA3SU1VT1J3b2NTSndDZ1dERkJBSXdaT2FKSXNPQmpSb2dLSlA4d1RPRHc1RVNWSFZ0bTNBaHpwRWVRRWxPdU5EbFRaMHljRVVXS1dGQVNxRWFoR3dZVVBibnhvQWdFZGxZU3FEQmtnb1VOQ2xBbElIYlNBb09zcUNSUW5RSHhxMWF4VmIwNkZXRnhMSXF5YXplMFRmdDFKVnF5RStwV1hNRDFwRjZiWWwzK0hUcUFXTlc4Y1JVRnptaWgwWkFBQjJvR0t1a1NBQUdHUkhXSmdMaVI2QXlsQkxwdUhLS1VNbE1DbmdNcERTQWE5UUlVZ2daVlZ2RGFKb2JMZUMzWFpwdmdOZ0NtdFBjdXdQM1dnbVhTcTRkbzBEQzZvMi9ndXpjc2VFQ3RVb08waG1jc0dLRGdPdDdzc0JkMDd3cWVzQUlHWkMxWUlCYTdQUUh2YjErU0ZvKysrSHJKU1FmQjMzeGZhdjNpNWVYM0huYjRDVEpnZWdFcTh0SC9ZUUVPY0lKemJtMkcyRW9ZUkxnQlhGcFZtRllEY1JFVjRISWNubVVoaUdCUm91RU1KR0pHekhJc3BxZ2RYeEsweUNLSFJOWG9JWDR1b3JDZFR5amt5TnRkUFdyQTRVcDgyRWJBYnpNUnh4WlJSNTRXWFZMRElSbVJjYWc1ZDJSNnVnbDNaWHpOaFRlY2NocE1oSUdWQUtBWXBnSmpqc1NrbEJFZDk5bWFab281MzVadmRhbWpCRXB1c0p5Y3RnM2g0WDhYcW9kQk14MHRpTmVnL29HSmFLR0FCcG9nUzQwS1NxaWFFZ0JxbFFXTFV0cW9WUW55dGVrRWp6bzBoSHFoUm9ycHBPWnQycDkyM00yQUFWK29CdHBBbm5QTm9CNkhhVTZtQUFJVStJWG1pM2oybXRGWHVVb0hLd1hwelZyc2pjZ0dPYXVLRWpRcndxMTU3aGl0R3EyTm9XbWpoN3o2V214YjBtNXc2NisyVlJBdVhOL3lGVUFJQUNINUJBVUtBQnNBTEFjQUJBRE9BQXNBQUFYLzRDWnVSaWFNNDVNWnFCZ0lSYnM5QXFUY3VGTEU3VkhMT2g3S0I1RVJkakphRWFVNENsTy9sZ0tXaktLY01pSlE4S2d1bWNpZVZkUU1EOGNiQmV1QWtrQzZMWUxoT3hvUTJQRjVZczlQS1BCTWVuMTdmMENDZzRWU2gzMkpWNHQ4alNOcUVJT0VnSktQbGtZQmxKV1JJbktkaUpka21RbHZLQXNMQnhkQUJBNFJzYklNQmdndEVoY1FzTEt4REJDMlRBUzZ2TEVOZEpMRHhNWkF1YnU4dmpJYnpjUVJ0TXpKejc5UzA4b1FFdC9ndU5peXk3ZmN2TWJoNE9lemRBdkdyYWtMQVF3eUFCc0VMUWtZOUJQKy8vY2t5UERENEo5QmZBTWgxR3NCb0ltTWVRVU4rbE1nVUo5Q2lSTWE1bXN4b0I5R2gvbzhHbXhZTVpYSWd4dFIveVE0NlMvZ1FBVVJSMHBEd1lEZnl3b3lMUGlwNUFkbkN3c01GUEJVNEJQRmhLQkRpNDQ0cXVDbURLWk9md1o5S0VHcENLZ2NOMWpkQUxTcFBxSVlzYWJTK25TcXZxcGx2WXFRWUFlRFBnd0t3amFNdGlEbDBvYXFVQXlvKzNUdVd3VUFNUHBWQ2ZlZTBjRWpWQkdRcTJBQng3b1RXbVFrNEZnbFpNR045ZkdWRE1DdWlIMkFPVk91L1BteXhNNjMwZ3dNMENDbjZxOExqVko4R1h2cGE1VXduOTVPVEMvbk54a2RhMS9kTFNLNDc1SWpDRDZkSGJLMVpPYTRoWFA5RFhzNWNoSjAwVXBWbTV4bzJxUnBveHB0d0YyRTQvSWJKcEIvU0R6OStxOWIxYU5mUUgwOCtwNGE4dXZYOEI1M2ZMUCt5Y0FmZW1qc1JVQmdwMUgyMEsrQmdoSGdWZ3QxR1haWFpwWjVsdDRFQ2p4WVI0U2NVV2lTaEV0WnFCaUlJblJHV25FUk5uamlCZ2x3K0p5R254VW1Hb3dzeWlpWmcxODlsTnRQR0FDalYyK1M5VWpiVTBKV0Y2U1B2RWszUVpFcXNaWVRrM1VBYVJTVW56bkpJNUxtRVNDZEJWU3lhT1dVV0xLNEk1Z0RVWVZlVjFUOWwrRlpDbENBVVZBMDl1U21SSEJDS0FFQ0ZFaFc1MWh0NnJubVdCWGthUitOanVIcEo0MEQzRG1uUVh0MkYraWhaeGxxVktPZlFSQUNBQ0g1QkFVS0FCd0FMQWNBQkFET0FBc0FBQVgvSUNkeVVDa1VvL2c4bVVHOE1DR2tLZ3NwZUM2ajZYRUlFQnBCVWVDTmZFQ2FnbEJjT1ZmSkZLN1lRd1pIUTZKUlpCVXFUclN1VkV1RDNuSTQ1cFlqRnVXS3ZqalNrQ29SYUJVTVd4a3dCR2dKQ1hzcFEzNkJoNEVFQjBvS2hvaUJneU5Mam84S2k0UUVsSWlXZkpxSG5JU05FSStRbDVKOW82U2drcUtrZ3FZaWhhbVBrVzZvTkJnU2ZpTU1EUWtHQ0JMQ3d4SVFEaEhJeVF3UUNHTUt4c25LVnlQQ0Y5RFJFUTNNeE1QWDBjdTR3dDdKMnVIV3g5amxLZDNvMzlNaXVlZllFY3ZOa3VMdDVPOGMxZVBJMnR5RUxYR1F3b0dEQVFmK2lFQzJ4QnlEQ1JBalRsQWdJVVdDQlJnQ1BKUTRBUUJGWEFzMGNvVDQwV0xJalJ4TC80N0FjSExreElvbVJYTDBDSFBFUlprcGE0cTRpVktpeXAwdFIvN2t3SE1rVFVCQkpSNWRPQ0VCQVZjS0t0Q0F5T0hwb3dYQ3BrN2dvQUJxQlpkY3ZXcGxvQUNwQktrcElKSTFxNU9EMnJJV0UwUjF1VFp1MUxGd2JXTDlPbEt1V2I0YzYrbzlpM2RFZ3cwUkNHRFVHOUtsUnc1NmdEWTJxbUNCeVpCYUFTaStUQUNBMFR1Y0FhVHRlQ2N5MFp1T0szTjJ2Smx4NTgrTFJReVkzWG0wWnNnalpnK29QUUxpN2RVY05YaTBMT0p3MXBnTnRCN1hHNkNCeStVNzVTWWZQVFNRQWdaVE5VRG5RSHQ2N3duYlp5dndMZ0tpTU4zb0NaQjNDNzZ0ZGV3cExGZ0lQMkM4OHJiaTRZK1FUMys4UzVVU01JQ1pYV2oxcGtFRGVVVTNsT1lHQjNhbFNvRWlNSWpnWDRXbGdORjJFaWJJd1FJWGF1V1hTUmcyU0FPSElVNUlJSU1vWmtoaFdpSmFpRlZiS282QVFFZ1FYclRBYXpPMUpoa0JyQkczWTJZNkVzVWhhR245NWhwclNOMG9XcEZFN3Joa2VhUUJjaEdPRVdud0VtYzB1S1daajBMZXVOVjNXNFkybFpIRmxRQ1NSalRJbDh1WitrRzVIVS8zc1JsblRHMnl0eWFkeXRuRDNIcm11UmNTbiswaDFkeWNleElLMUtDallhQ25qQ0NWcU9GRkpUWjVHa1VVakVTV2FVSUtVMmxnQ21BS0tRSVVqSGFwWFJLRSt0Mm9nMVZnYW5rTllub2hxS0oyQ21LcGxzbzZHS3o3V1lDZ3F4ZXV5b0Y4dTlJUUFnQTdcIixcbiAgICAgICAgICAgIG1zZzogbnVsbCxcbiAgICAgICAgICAgIG1zZ1RleHQ6IFwiPGVtPkxvYWRpbmcgdGhlIG5leHQgc2V0IG9mIHBvc3RzLi4uPC9lbT5cIixcbiAgICAgICAgICAgIHNlbGVjdG9yOiBudWxsLFxuICAgICAgICAgICAgc3BlZWQ6ICdmYXN0JyxcbiAgICAgICAgICAgIHN0YXJ0OiB1bmRlZmluZWRcbiAgICAgICAgfSxcbiAgICAgICAgc3RhdGU6IHtcbiAgICAgICAgICAgIGlzRHVyaW5nQWpheDogZmFsc2UsXG4gICAgICAgICAgICBpc0ludmFsaWRQYWdlOiBmYWxzZSxcbiAgICAgICAgICAgIGlzRGVzdHJveWVkOiBmYWxzZSxcbiAgICAgICAgICAgIGlzRG9uZTogZmFsc2UsIC8vIEZvciB3aGVuIGl0IGdvZXMgYWxsIHRoZSB3YXkgdGhyb3VnaCB0aGUgYXJjaGl2ZS5cbiAgICAgICAgICAgIGlzUGF1c2VkOiBmYWxzZSxcbiAgICAgICAgICAgIGlzQmV5b25kTWF4UGFnZTogZmFsc2UsXG4gICAgICAgICAgICBjdXJyUGFnZTogMVxuICAgICAgICB9LFxuICAgICAgICBkZWJ1ZzogZmFsc2UsXG5cdFx0YmVoYXZpb3I6IHVuZGVmaW5lZCxcbiAgICAgICAgYmluZGVyOiAkKHdpbmRvdyksIC8vIHVzZWQgdG8gY2FjaGUgdGhlIHNlbGVjdG9yXG4gICAgICAgIG5leHRTZWxlY3RvcjogXCJkaXYubmF2aWdhdGlvbiBhOmZpcnN0XCIsXG4gICAgICAgIG5hdlNlbGVjdG9yOiBcImRpdi5uYXZpZ2F0aW9uXCIsXG4gICAgICAgIGNvbnRlbnRTZWxlY3RvcjogbnVsbCwgLy8gcmVuYW1lIHRvIHBhZ2VGcmFnbWVudFxuICAgICAgICBleHRyYVNjcm9sbFB4OiAxNTAsXG4gICAgICAgIGl0ZW1TZWxlY3RvcjogXCJkaXYucG9zdFwiLFxuICAgICAgICBhbmltYXRlOiBmYWxzZSxcbiAgICAgICAgcGF0aFBhcnNlOiB1bmRlZmluZWQsXG4gICAgICAgIGRhdGFUeXBlOiAnaHRtbCcsXG4gICAgICAgIGFwcGVuZENhbGxiYWNrOiB0cnVlLFxuICAgICAgICBidWZmZXJQeDogNDAsXG4gICAgICAgIGVycm9yQ2FsbGJhY2s6IGZ1bmN0aW9uICgpIHsgfSxcbiAgICAgICAgaW5maWQ6IDAsIC8vSW5zdGFuY2UgSURcbiAgICAgICAgcGl4ZWxzRnJvbU5hdlRvQm90dG9tOiB1bmRlZmluZWQsXG4gICAgICAgIHBhdGg6IHVuZGVmaW5lZCwgLy8gRWl0aGVyIHBhcnRzIG9mIGEgVVJMIGFzIGFuIGFycmF5IChlLmcuIFtcIi9wYWdlL1wiLCBcIi9cIl0gb3IgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGluIHRoZSBwYWdlIG51bWJlciBhbmQgcmV0dXJucyBhIFVSTFxuXHRcdHByZWZpbGw6IGZhbHNlLCAvLyBXaGVuIHRoZSBkb2N1bWVudCBpcyBzbWFsbGVyIHRoYW4gdGhlIHdpbmRvdywgbG9hZCBkYXRhIHVudGlsIHRoZSBkb2N1bWVudCBpcyBsYXJnZXIgb3IgbGlua3MgYXJlIGV4aGF1c3RlZFxuICAgICAgICBtYXhQYWdlOiB1bmRlZmluZWQgLy8gdG8gbWFudWFsbHkgY29udHJvbCBtYXhpbXVtIHBhZ2UgKHdoZW4gbWF4UGFnZSBpcyB1bmRlZmluZWQsIG1heGltdW0gcGFnZSBsaW1pdGF0aW9uIGlzIG5vdCB3b3JrKVxuXHR9O1xuXG4gICAgJC5pbmZpbml0ZXNjcm9sbC5wcm90b3R5cGUgPSB7XG5cbiAgICAgICAgLypcdFxuICAgICAgICAgICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgUHJpdmF0ZSBtZXRob2RzXG4gICAgICAgICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAqL1xuXG4gICAgICAgIC8vIEJpbmQgb3IgdW5iaW5kIGZyb20gc2Nyb2xsXG4gICAgICAgIF9iaW5kaW5nOiBmdW5jdGlvbiBpbmZzY3JfYmluZGluZyhiaW5kaW5nKSB7XG5cbiAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMsXG4gICAgICAgICAgICBvcHRzID0gaW5zdGFuY2Uub3B0aW9ucztcblxuICAgICAgICAgICAgb3B0cy52ID0gJzIuMGIyLjEyMDUyMCc7XG5cbiAgICAgICAgICAgIC8vIGlmIGJlaGF2aW9yIGlzIGRlZmluZWQgYW5kIHRoaXMgZnVuY3Rpb24gaXMgZXh0ZW5kZWQsIGNhbGwgdGhhdCBpbnN0ZWFkIG9mIGRlZmF1bHRcbiAgICAgICAgICAgIGlmICghIW9wdHMuYmVoYXZpb3IgJiYgdGhpc1snX2JpbmRpbmdfJytvcHRzLmJlaGF2aW9yXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpc1snX2JpbmRpbmdfJytvcHRzLmJlaGF2aW9yXS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJpbmRpbmcgIT09ICdiaW5kJyAmJiBiaW5kaW5nICE9PSAndW5iaW5kJykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdCaW5kaW5nIHZhbHVlICAnICsgYmluZGluZyArICcgbm90IHZhbGlkJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYmluZGluZyA9PT0gJ3VuYmluZCcpIHtcbiAgICAgICAgICAgICAgICAodGhpcy5vcHRpb25zLmJpbmRlcikudW5iaW5kKCdzbWFydHNjcm9sbC5pbmZzY3IuJyArIGluc3RhbmNlLm9wdGlvbnMuaW5maWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAodGhpcy5vcHRpb25zLmJpbmRlcilbYmluZGluZ10oJ3NtYXJ0c2Nyb2xsLmluZnNjci4nICsgaW5zdGFuY2Uub3B0aW9ucy5pbmZpZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5zY3JvbGwoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ0JpbmRpbmcnLCBiaW5kaW5nKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBGdW5kYW1lbnRhbCBhc3BlY3RzIG9mIHRoZSBwbHVnaW4gYXJlIGluaXRpYWxpemVkXG4gICAgICAgIF9jcmVhdGU6IGZ1bmN0aW9uIGluZnNjcl9jcmVhdGUob3B0aW9ucywgY2FsbGJhY2spIHtcblxuICAgICAgICAgICAgLy8gQWRkIGN1c3RvbSBvcHRpb25zIHRvIGRlZmF1bHRzXG4gICAgICAgICAgICB2YXIgb3B0cyA9ICQuZXh0ZW5kKHRydWUsIHt9LCAkLmluZmluaXRlc2Nyb2xsLmRlZmF1bHRzLCBvcHRpb25zKTtcblx0XHRcdHRoaXMub3B0aW9ucyA9IG9wdHM7XG5cdFx0XHR2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcblx0XHRcdHZhciBpbnN0YW5jZSA9IHRoaXM7XG5cblx0XHRcdC8vIFZhbGlkYXRlIHNlbGVjdG9yc1xuICAgICAgICAgICAgaWYgKCFpbnN0YW5jZS5fdmFsaWRhdGUob3B0aW9ucykpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSBwYWdlIGZyYWdtZW50IHBhdGhcbiAgICAgICAgICAgIHZhciBwYXRoID0gJChvcHRzLm5leHRTZWxlY3RvcikuYXR0cignaHJlZicpO1xuICAgICAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ05hdmlnYXRpb24gc2VsZWN0b3Igbm90IGZvdW5kJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXQgdGhlIHBhdGggdG8gYmUgYSByZWxhdGl2ZSBVUkwgZnJvbSByb290LlxuICAgICAgICAgICAgb3B0cy5wYXRoID0gb3B0cy5wYXRoIHx8IHRoaXMuX2RldGVybWluZXBhdGgocGF0aCk7XG5cbiAgICAgICAgICAgIC8vIGNvbnRlbnRTZWxlY3RvciBpcyAncGFnZSBmcmFnbWVudCcgb3B0aW9uIGZvciAubG9hZCgpIC8gLmFqYXgoKSBjYWxsc1xuICAgICAgICAgICAgb3B0cy5jb250ZW50U2VsZWN0b3IgPSBvcHRzLmNvbnRlbnRTZWxlY3RvciB8fCB0aGlzLmVsZW1lbnQ7XG5cbiAgICAgICAgICAgIC8vIGxvYWRpbmcuc2VsZWN0b3IgLSBpZiB3ZSB3YW50IHRvIHBsYWNlIHRoZSBsb2FkIG1lc3NhZ2UgaW4gYSBzcGVjaWZpYyBzZWxlY3RvciwgZGVmYXVsdGVkIHRvIHRoZSBjb250ZW50U2VsZWN0b3JcbiAgICAgICAgICAgIG9wdHMubG9hZGluZy5zZWxlY3RvciA9IG9wdHMubG9hZGluZy5zZWxlY3RvciB8fCBvcHRzLmNvbnRlbnRTZWxlY3RvcjtcblxuICAgICAgICAgICAgLy8gRGVmaW5lIGxvYWRpbmcubXNnXG4gICAgICAgICAgICBvcHRzLmxvYWRpbmcubXNnID0gb3B0cy5sb2FkaW5nLm1zZyB8fCAkKCc8ZGl2IGlkPVwiaW5mc2NyLWxvYWRpbmdcIj48aW1nIGFsdD1cIkxvYWRpbmcuLi5cIiBzcmM9XCInICsgb3B0cy5sb2FkaW5nLmltZyArICdcIiAvPjxkaXY+JyArIG9wdHMubG9hZGluZy5tc2dUZXh0ICsgJzwvZGl2PjwvZGl2PicpO1xuXG4gICAgICAgICAgICAvLyBQcmVsb2FkIGxvYWRpbmcuaW1nXG4gICAgICAgICAgICAobmV3IEltYWdlKCkpLnNyYyA9IG9wdHMubG9hZGluZy5pbWc7XG5cbiAgICAgICAgICAgIC8vIGRpc3RhbmNlIGZyb20gbmF2IGxpbmtzIHRvIGJvdHRvbVxuICAgICAgICAgICAgLy8gY29tcHV0ZWQgYXM6IGhlaWdodCBvZiB0aGUgZG9jdW1lbnQgKyB0b3Agb2Zmc2V0IG9mIGNvbnRhaW5lciAtIHRvcCBvZmZzZXQgb2YgbmF2IGxpbmtcbiAgICAgICAgICAgIGlmKG9wdHMucGl4ZWxzRnJvbU5hdlRvQm90dG9tID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0b3B0cy5waXhlbHNGcm9tTmF2VG9Cb3R0b20gPSAkKGRvY3VtZW50KS5oZWlnaHQoKSAtICQob3B0cy5uYXZTZWxlY3Rvcikub2Zmc2V0KCkudG9wO1xuXHRcdFx0XHR0aGlzLl9kZWJ1ZyhcInBpeGVsc0Zyb21OYXZUb0JvdHRvbTogXCIgKyBvcHRzLnBpeGVsc0Zyb21OYXZUb0JvdHRvbSk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgLy8gZGV0ZXJtaW5lIGxvYWRpbmcuc3RhcnQgYWN0aW9uc1xuICAgICAgICAgICAgb3B0cy5sb2FkaW5nLnN0YXJ0ID0gb3B0cy5sb2FkaW5nLnN0YXJ0IHx8IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQob3B0cy5uYXZTZWxlY3RvcikuaGlkZSgpO1xuICAgICAgICAgICAgICAgIG9wdHMubG9hZGluZy5tc2dcbiAgICAgICAgICAgICAgICAuYXBwZW5kVG8ob3B0cy5sb2FkaW5nLnNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5zaG93KG9wdHMubG9hZGluZy5zcGVlZCwgJC5wcm94eShmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR0aGlzLmJlZ2luQWpheChvcHRzKTtcblx0XHRcdFx0fSwgc2VsZikpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gZGV0ZXJtaW5lIGxvYWRpbmcuZmluaXNoZWQgYWN0aW9uc1xuICAgICAgICAgICAgb3B0cy5sb2FkaW5nLmZpbmlzaGVkID0gb3B0cy5sb2FkaW5nLmZpbmlzaGVkIHx8IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICghb3B0cy5zdGF0ZS5pc0JleW9uZE1heFBhZ2UpXG4gICAgICAgICAgICAgICAgICAgIG9wdHMubG9hZGluZy5tc2cuZmFkZU91dChvcHRzLmxvYWRpbmcuc3BlZWQpO1xuICAgICAgICAgICAgfTtcblxuXHRcdFx0Ly8gY2FsbGJhY2sgbG9hZGluZ1xuICAgICAgICAgICAgb3B0cy5jYWxsYmFjayA9IGZ1bmN0aW9uKGluc3RhbmNlLCBkYXRhLCB1cmwpIHtcbiAgICAgICAgICAgICAgICBpZiAoISFvcHRzLmJlaGF2aW9yICYmIGluc3RhbmNlWydfY2FsbGJhY2tfJytvcHRzLmJlaGF2aW9yXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlWydfY2FsbGJhY2tfJytvcHRzLmJlaGF2aW9yXS5jYWxsKCQob3B0cy5jb250ZW50U2VsZWN0b3IpWzBdLCBkYXRhLCB1cmwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKCQob3B0cy5jb250ZW50U2VsZWN0b3IpWzBdLCBkYXRhLCBvcHRzLCB1cmwpO1xuICAgICAgICAgICAgICAgIH1cblxuXHRcdFx0XHRpZiAob3B0cy5wcmVmaWxsKSB7XG5cdFx0XHRcdFx0JHdpbmRvdy5iaW5kKFwicmVzaXplLmluZmluaXRlLXNjcm9sbFwiLCBpbnN0YW5jZS5fcHJlZmlsbCk7XG5cdFx0XHRcdH1cbiAgICAgICAgICAgIH07XG5cblx0XHRcdGlmIChvcHRpb25zLmRlYnVnKSB7XG5cdFx0XHRcdC8vIFRlbGwgSUU5IHRvIHVzZSBpdHMgYnVpbHQtaW4gY29uc29sZVxuXHRcdFx0XHRpZiAoRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgJiYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgY29uc29sZSA9PT0gJ2Z1bmN0aW9uJykgJiYgdHlwZW9mIGNvbnNvbGUubG9nID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0W1wibG9nXCIsXCJpbmZvXCIsXCJ3YXJuXCIsXCJlcnJvclwiLFwiYXNzZXJ0XCIsXCJkaXJcIixcImNsZWFyXCIsXCJwcm9maWxlXCIsXCJwcm9maWxlRW5kXCJdXG5cdFx0XHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGVbbWV0aG9kXSA9IHRoaXMuY2FsbChjb25zb2xlW21ldGhvZF0sIGNvbnNvbGUpO1xuXHRcdFx0XHRcdFx0fSwgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cbiAgICAgICAgICAgIHRoaXMuX3NldHVwKCk7XG5cblx0XHRcdC8vIFNldHVwcyB0aGUgcHJlZmlsbCBtZXRob2QgZm9yIHVzZVxuXHRcdFx0aWYgKG9wdHMucHJlZmlsbCkge1xuXHRcdFx0XHR0aGlzLl9wcmVmaWxsKCk7XG5cdFx0XHR9XG5cbiAgICAgICAgICAgIC8vIFJldHVybiB0cnVlIHRvIGluZGljYXRlIHN1Y2Nlc3NmdWwgY3JlYXRpb25cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuXG5cdFx0X3ByZWZpbGw6IGZ1bmN0aW9uIGluZnNjcl9wcmVmaWxsKCkge1xuXHRcdFx0dmFyIGluc3RhbmNlID0gdGhpcztcblx0XHRcdHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuXG5cdFx0XHRmdW5jdGlvbiBuZWVkc1ByZWZpbGwoKSB7XG5cdFx0XHRcdHJldHVybiAoaW5zdGFuY2Uub3B0aW9ucy5jb250ZW50U2VsZWN0b3IuaGVpZ2h0KCkgPD0gJHdpbmRvdy5oZWlnaHQoKSk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX3ByZWZpbGwgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKG5lZWRzUHJlZmlsbCgpKSB7XG5cdFx0XHRcdFx0aW5zdGFuY2Uuc2Nyb2xsKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkd2luZG93LmJpbmQoXCJyZXNpemUuaW5maW5pdGUtc2Nyb2xsXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmIChuZWVkc1ByZWZpbGwoKSkge1xuXHRcdFx0XHRcdFx0JHdpbmRvdy51bmJpbmQoXCJyZXNpemUuaW5maW5pdGUtc2Nyb2xsXCIpO1xuXHRcdFx0XHRcdFx0aW5zdGFuY2Uuc2Nyb2xsKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH07XG5cblx0XHRcdC8vIENhbGwgc2VsZiBhZnRlciBzZXR0aW5nIHVwIHRoZSBuZXcgZnVuY3Rpb25cblx0XHRcdHRoaXMuX3ByZWZpbGwoKTtcblx0XHR9LFxuXG4gICAgICAgIC8vIENvbnNvbGUgbG9nIHdyYXBwZXJcbiAgICAgICAgX2RlYnVnOiBmdW5jdGlvbiBpbmZzY3JfZGVidWcoKSB7XG5cdFx0XHRpZiAodHJ1ZSAhPT0gdGhpcy5vcHRpb25zLmRlYnVnKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5sb2cgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0Ly8gTW9kZXJuIGJyb3dzZXJzXG5cdFx0XHRcdC8vIFNpbmdsZSBhcmd1bWVudCwgd2hpY2ggaXMgYSBzdHJpbmdcblx0XHRcdFx0aWYgKChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKS5sZW5ndGggPT09IDEgJiYgdHlwZW9mIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cylbMF0gPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coIChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKS50b1N0cmluZygpICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLmxvZyA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0Ly8gSUU4XG5cdFx0XHRcdEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsLmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuXHRcdFx0fVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGZpbmQgdGhlIG51bWJlciB0byBpbmNyZW1lbnQgaW4gdGhlIHBhdGguXG4gICAgICAgIF9kZXRlcm1pbmVwYXRoOiBmdW5jdGlvbiBpbmZzY3JfZGV0ZXJtaW5lcGF0aChwYXRoKSB7XG5cbiAgICAgICAgICAgIHZhciBvcHRzID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICAgICAgICAvLyBpZiBiZWhhdmlvciBpcyBkZWZpbmVkIGFuZCB0aGlzIGZ1bmN0aW9uIGlzIGV4dGVuZGVkLCBjYWxsIHRoYXQgaW5zdGVhZCBvZiBkZWZhdWx0XG4gICAgICAgICAgICBpZiAoISFvcHRzLmJlaGF2aW9yICYmIHRoaXNbJ19kZXRlcm1pbmVwYXRoXycrb3B0cy5iZWhhdmlvcl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzWydfZGV0ZXJtaW5lcGF0aF8nK29wdHMuYmVoYXZpb3JdLmNhbGwodGhpcyxwYXRoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCEhb3B0cy5wYXRoUGFyc2UpIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdwYXRoUGFyc2UgbWFudWFsJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdHMucGF0aFBhcnNlKHBhdGgsIHRoaXMub3B0aW9ucy5zdGF0ZS5jdXJyUGFnZSsxKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXRoLm1hdGNoKC9eKC4qPylcXGIyXFxiKC4qPyQpLykpIHtcbiAgICAgICAgICAgICAgICBwYXRoID0gcGF0aC5tYXRjaCgvXiguKj8pXFxiMlxcYiguKj8kKS8pLnNsaWNlKDEpO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW55IDIgaW4gdGhlIHVybCBhdCBhbGwuICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXRoLm1hdGNoKC9eKC4qPykyKC4qPyQpLykpIHtcblxuICAgICAgICAgICAgICAgIC8vIHBhZ2U9IGlzIHVzZWQgaW4gZGphbmdvOlxuICAgICAgICAgICAgICAgIC8vIGh0dHA6Ly93d3cuaW5maW5pdGUtc2Nyb2xsLmNvbS9jaGFuZ2Vsb2cvY29tbWVudC1wYWdlLTEvI2NvbW1lbnQtMTI3XG4gICAgICAgICAgICAgICAgaWYgKHBhdGgubWF0Y2goL14oLio/cGFnZT0pMihcXC8uKnwkKS8pKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBwYXRoLm1hdGNoKC9eKC4qP3BhZ2U9KTIoXFwvLip8JCkvKS5zbGljZSgxKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcGF0aCA9IHBhdGgubWF0Y2goL14oLio/KTIoLio/JCkvKS5zbGljZSgxKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIC8vIHBhZ2U9IGlzIHVzZWQgaW4gZHJ1cGFsIHRvbyBidXQgc2Vjb25kIHBhZ2UgaXMgcGFnZT0xIG5vdCBwYWdlPTI6XG4gICAgICAgICAgICAgICAgLy8gdGh4IEplcm9kIEZyaXR6LCB2bGFkaWtvZmZcbiAgICAgICAgICAgICAgICBpZiAocGF0aC5tYXRjaCgvXiguKj9wYWdlPSkxKFxcLy4qfCQpLykpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aCA9IHBhdGgubWF0Y2goL14oLio/cGFnZT0pMShcXC8uKnwkKS8pLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGF0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnU29ycnksIHdlIGNvdWxkblxcJ3QgcGFyc2UgeW91ciBOZXh0IChQcmV2aW91cyBQb3N0cykgVVJMLiBWZXJpZnkgeW91ciB0aGUgY3NzIHNlbGVjdG9yIHBvaW50cyB0byB0aGUgY29ycmVjdCBBIHRhZy4gSWYgeW91IHN0aWxsIGdldCB0aGlzIGVycm9yOiB5ZWxsLCBzY3JlYW0sIGFuZCBraW5kbHkgYXNrIGZvciBoZWxwIGF0IGluZmluaXRlLXNjcm9sbC5jb20uJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIEdldCByaWQgb2YgaXNJbnZhbGlkUGFnZSB0byBhbGxvdyBwZXJtYWxpbmsgdG8gc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgb3B0cy5zdGF0ZS5pc0ludmFsaWRQYWdlID0gdHJ1ZTsgIC8vcHJldmVudCBpdCBmcm9tIHJ1bm5pbmcgb24gdGhpcyBwYWdlLlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdkZXRlcm1pbmVQYXRoJywgcGF0aCk7XG4gICAgICAgICAgICByZXR1cm4gcGF0aDtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIEN1c3RvbSBlcnJvclxuICAgICAgICBfZXJyb3I6IGZ1bmN0aW9uIGluZnNjcl9lcnJvcih4aHIpIHtcblxuICAgICAgICAgICAgdmFyIG9wdHMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgICAgIC8vIGlmIGJlaGF2aW9yIGlzIGRlZmluZWQgYW5kIHRoaXMgZnVuY3Rpb24gaXMgZXh0ZW5kZWQsIGNhbGwgdGhhdCBpbnN0ZWFkIG9mIGRlZmF1bHRcbiAgICAgICAgICAgIGlmICghIW9wdHMuYmVoYXZpb3IgJiYgdGhpc1snX2Vycm9yXycrb3B0cy5iZWhhdmlvcl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXNbJ19lcnJvcl8nK29wdHMuYmVoYXZpb3JdLmNhbGwodGhpcyx4aHIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHhociAhPT0gJ2Rlc3Ryb3knICYmIHhociAhPT0gJ2VuZCcpIHtcbiAgICAgICAgICAgICAgICB4aHIgPSAndW5rbm93bic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdFcnJvcicsIHhocik7XG5cbiAgICAgICAgICAgIGlmICh4aHIgPT09ICdlbmQnIHx8IG9wdHMuc3RhdGUuaXNCZXlvbmRNYXhQYWdlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2hvd2RvbmVtc2coKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3B0cy5zdGF0ZS5pc0RvbmUgPSB0cnVlO1xuICAgICAgICAgICAgb3B0cy5zdGF0ZS5jdXJyUGFnZSA9IDE7IC8vIGlmIHlvdSBuZWVkIHRvIGdvIGJhY2sgdG8gdGhpcyBpbnN0YW5jZVxuICAgICAgICAgICAgb3B0cy5zdGF0ZS5pc1BhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgb3B0cy5zdGF0ZS5pc0JleW9uZE1heFBhZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2JpbmRpbmcoJ3VuYmluZCcpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gTG9hZCBDYWxsYmFja1xuICAgICAgICBfbG9hZGNhbGxiYWNrOiBmdW5jdGlvbiBpbmZzY3JfbG9hZGNhbGxiYWNrKGJveCwgZGF0YSwgdXJsKSB7XG4gICAgICAgICAgICB2YXIgb3B0cyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdGhpcy5vcHRpb25zLmNhbGxiYWNrLCAvLyBHTE9CQUwgT0JKRUNUIEZPUiBDQUxMQkFDS1xuICAgICAgICAgICAgcmVzdWx0ID0gKG9wdHMuc3RhdGUuaXNEb25lKSA/ICdkb25lJyA6ICghb3B0cy5hcHBlbmRDYWxsYmFjaykgPyAnbm8tYXBwZW5kJyA6ICdhcHBlbmQnLFxuICAgICAgICAgICAgZnJhZztcblxuICAgICAgICAgICAgLy8gaWYgYmVoYXZpb3IgaXMgZGVmaW5lZCBhbmQgdGhpcyBmdW5jdGlvbiBpcyBleHRlbmRlZCwgY2FsbCB0aGF0IGluc3RlYWQgb2YgZGVmYXVsdFxuICAgICAgICAgICAgaWYgKCEhb3B0cy5iZWhhdmlvciAmJiB0aGlzWydfbG9hZGNhbGxiYWNrXycrb3B0cy5iZWhhdmlvcl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXNbJ19sb2FkY2FsbGJhY2tfJytvcHRzLmJlaGF2aW9yXS5jYWxsKHRoaXMsYm94LGRhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuXHRcdFx0c3dpdGNoIChyZXN1bHQpIHtcblx0XHRcdFx0Y2FzZSAnZG9uZSc6XG5cdFx0XHRcdFx0dGhpcy5fc2hvd2RvbmVtc2coKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRcdFx0Y2FzZSAnbm8tYXBwZW5kJzpcblx0XHRcdFx0XHRpZiAob3B0cy5kYXRhVHlwZSA9PT0gJ2h0bWwnKSB7XG5cdFx0XHRcdFx0XHRkYXRhID0gJzxkaXY+JyArIGRhdGEgKyAnPC9kaXY+Jztcblx0XHRcdFx0XHRcdGRhdGEgPSAkKGRhdGEpLmZpbmQob3B0cy5pdGVtU2VsZWN0b3IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlICdhcHBlbmQnOlxuXHRcdFx0XHRcdHZhciBjaGlsZHJlbiA9IGJveC5jaGlsZHJlbigpO1xuXHRcdFx0XHRcdC8vIGlmIGl0IGRpZG4ndCByZXR1cm4gYW55dGhpbmdcblx0XHRcdFx0XHRpZiAoY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fZXJyb3IoJ2VuZCcpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIHVzZSBhIGRvY3VtZW50RnJhZ21lbnQgYmVjYXVzZSBpdCB3b3JrcyB3aGVuIGNvbnRlbnQgaXMgZ29pbmcgaW50byBhIHRhYmxlIG9yIFVMXG5cdFx0XHRcdFx0ZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblx0XHRcdFx0XHR3aGlsZSAoYm94WzBdLmZpcnN0Q2hpbGQpIHtcblx0XHRcdFx0XHRcdGZyYWcuYXBwZW5kQ2hpbGQoYm94WzBdLmZpcnN0Q2hpbGQpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHRoaXMuX2RlYnVnKCdjb250ZW50U2VsZWN0b3InLCAkKG9wdHMuY29udGVudFNlbGVjdG9yKVswXSk7XG5cdFx0XHRcdFx0JChvcHRzLmNvbnRlbnRTZWxlY3RvcilbMF0uYXBwZW5kQ2hpbGQoZnJhZyk7XG5cdFx0XHRcdFx0Ly8gcHJldmlvdXNseSwgd2Ugd291bGQgcGFzcyBpbiB0aGUgbmV3IERPTSBlbGVtZW50IGFzIGNvbnRleHQgZm9yIHRoZSBjYWxsYmFja1xuXHRcdFx0XHRcdC8vIGhvd2V2ZXIgd2UncmUgbm93IHVzaW5nIGEgZG9jdW1lbnRmcmFnbWVudCwgd2hpY2ggZG9lc24ndCBoYXZlIHBhcmVudHMgb3IgY2hpbGRyZW4sXG5cdFx0XHRcdFx0Ly8gc28gdGhlIGNvbnRleHQgaXMgdGhlIGNvbnRlbnRDb250YWluZXIgZ3V5LCBhbmQgd2UgcGFzcyBpbiBhbiBhcnJheVxuXHRcdFx0XHRcdC8vIG9mIHRoZSBlbGVtZW50cyBjb2xsZWN0ZWQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuXG5cdFx0XHRcdFx0ZGF0YSA9IGNoaWxkcmVuLmdldCgpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG4gICAgICAgICAgICAvLyBsb2FkaW5nRW5kIGZ1bmN0aW9uXG4gICAgICAgICAgICBvcHRzLmxvYWRpbmcuZmluaXNoZWQuY2FsbCgkKG9wdHMuY29udGVudFNlbGVjdG9yKVswXSxvcHRzKTtcblxuICAgICAgICAgICAgLy8gc21vb3RoIHNjcm9sbCB0byBlYXNlIGluIHRoZSBuZXcgY29udGVudFxuICAgICAgICAgICAgaWYgKG9wdHMuYW5pbWF0ZSkge1xuICAgICAgICAgICAgICAgIHZhciBzY3JvbGxUbyA9ICQod2luZG93KS5zY3JvbGxUb3AoKSArICQob3B0cy5sb2FkaW5nLm1zZykuaGVpZ2h0KCkgKyBvcHRzLmV4dHJhU2Nyb2xsUHggKyAncHgnO1xuICAgICAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IHNjcm9sbFRvIH0sIDgwMCwgZnVuY3Rpb24gKCkgeyBvcHRzLnN0YXRlLmlzRHVyaW5nQWpheCA9IGZhbHNlOyB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFvcHRzLmFuaW1hdGUpIHtcblx0XHRcdFx0Ly8gb25jZSB0aGUgY2FsbCBpcyBkb25lLCB3ZSBjYW4gYWxsb3cgaXQgYWdhaW4uXG5cdFx0XHRcdG9wdHMuc3RhdGUuaXNEdXJpbmdBamF4ID0gZmFsc2U7XG5cdFx0XHR9XG5cbiAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMsIGRhdGEsIHVybCk7XG5cblx0XHRcdGlmIChvcHRzLnByZWZpbGwpIHtcblx0XHRcdFx0dGhpcy5fcHJlZmlsbCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cbiAgICAgICAgX25lYXJib3R0b206IGZ1bmN0aW9uIGluZnNjcl9uZWFyYm90dG9tKCkge1xuXG4gICAgICAgICAgICB2YXIgb3B0cyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIHBpeGVsc0Zyb21XaW5kb3dCb3R0b21Ub0JvdHRvbSA9IDAgKyAkKGRvY3VtZW50KS5oZWlnaHQoKSAtIChvcHRzLmJpbmRlci5zY3JvbGxUb3AoKSkgLSAkKHdpbmRvdykuaGVpZ2h0KCk7XG5cbiAgICAgICAgICAgIC8vIGlmIGJlaGF2aW9yIGlzIGRlZmluZWQgYW5kIHRoaXMgZnVuY3Rpb24gaXMgZXh0ZW5kZWQsIGNhbGwgdGhhdCBpbnN0ZWFkIG9mIGRlZmF1bHRcbiAgICAgICAgICAgIGlmICghIW9wdHMuYmVoYXZpb3IgJiYgdGhpc1snX25lYXJib3R0b21fJytvcHRzLmJlaGF2aW9yXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbJ19uZWFyYm90dG9tXycrb3B0cy5iZWhhdmlvcl0uY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ21hdGg6JywgcGl4ZWxzRnJvbVdpbmRvd0JvdHRvbVRvQm90dG9tLCBvcHRzLnBpeGVsc0Zyb21OYXZUb0JvdHRvbSk7XG5cbiAgICAgICAgICAgIC8vIGlmIGRpc3RhbmNlIHJlbWFpbmluZyBpbiB0aGUgc2Nyb2xsIChpbmNsdWRpbmcgYnVmZmVyKSBpcyBsZXNzIHRoYW4gdGhlIG9yaWduYWwgbmF2IHRvIGJvdHRvbS4uLi5cbiAgICAgICAgICAgIHJldHVybiAocGl4ZWxzRnJvbVdpbmRvd0JvdHRvbVRvQm90dG9tIC0gb3B0cy5idWZmZXJQeCA8IG9wdHMucGl4ZWxzRnJvbU5hdlRvQm90dG9tKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFBhdXNlIC8gdGVtcG9yYXJpbHkgZGlzYWJsZSBwbHVnaW4gZnJvbSBmaXJpbmdcbiAgICAgICAgX3BhdXNpbmc6IGZ1bmN0aW9uIGluZnNjcl9wYXVzaW5nKHBhdXNlKSB7XG5cbiAgICAgICAgICAgIHZhciBvcHRzID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICAgICAgICAvLyBpZiBiZWhhdmlvciBpcyBkZWZpbmVkIGFuZCB0aGlzIGZ1bmN0aW9uIGlzIGV4dGVuZGVkLCBjYWxsIHRoYXQgaW5zdGVhZCBvZiBkZWZhdWx0XG4gICAgICAgICAgICBpZiAoISFvcHRzLmJlaGF2aW9yICYmIHRoaXNbJ19wYXVzaW5nXycrb3B0cy5iZWhhdmlvcl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXNbJ19wYXVzaW5nXycrb3B0cy5iZWhhdmlvcl0uY2FsbCh0aGlzLHBhdXNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIHBhdXNlIGlzIG5vdCAncGF1c2UnIG9yICdyZXN1bWUnLCB0b2dnbGUgaXQncyB2YWx1ZVxuICAgICAgICAgICAgaWYgKHBhdXNlICE9PSAncGF1c2UnICYmIHBhdXNlICE9PSAncmVzdW1lJyAmJiBwYXVzZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdJbnZhbGlkIGFyZ3VtZW50LiBUb2dnbGluZyBwYXVzZSB2YWx1ZSBpbnN0ZWFkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBhdXNlID0gKHBhdXNlICYmIChwYXVzZSA9PT0gJ3BhdXNlJyB8fCBwYXVzZSA9PT0gJ3Jlc3VtZScpKSA/IHBhdXNlIDogJ3RvZ2dsZSc7XG5cbiAgICAgICAgICAgIHN3aXRjaCAocGF1c2UpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdwYXVzZSc6XG4gICAgICAgICAgICAgICAgICAgIG9wdHMuc3RhdGUuaXNQYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAncmVzdW1lJzpcbiAgICAgICAgICAgICAgICAgICAgb3B0cy5zdGF0ZS5pc1BhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAndG9nZ2xlJzpcbiAgICAgICAgICAgICAgICAgICAgb3B0cy5zdGF0ZS5pc1BhdXNlZCA9ICFvcHRzLnN0YXRlLmlzUGF1c2VkO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnUGF1c2VkJywgb3B0cy5zdGF0ZS5pc1BhdXNlZCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBCZWhhdmlvciBpcyBkZXRlcm1pbmVkXG4gICAgICAgIC8vIElmIHRoZSBiZWhhdmlvciBvcHRpb24gaXMgdW5kZWZpbmVkLCBpdCB3aWxsIHNldCB0byBkZWZhdWx0IGFuZCBiaW5kIHRvIHNjcm9sbFxuICAgICAgICBfc2V0dXA6IGZ1bmN0aW9uIGluZnNjcl9zZXR1cCgpIHtcblxuICAgICAgICAgICAgdmFyIG9wdHMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgICAgIC8vIGlmIGJlaGF2aW9yIGlzIGRlZmluZWQgYW5kIHRoaXMgZnVuY3Rpb24gaXMgZXh0ZW5kZWQsIGNhbGwgdGhhdCBpbnN0ZWFkIG9mIGRlZmF1bHRcbiAgICAgICAgICAgIGlmICghIW9wdHMuYmVoYXZpb3IgJiYgdGhpc1snX3NldHVwXycrb3B0cy5iZWhhdmlvcl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXNbJ19zZXR1cF8nK29wdHMuYmVoYXZpb3JdLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9iaW5kaW5nKCdiaW5kJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFNob3cgZG9uZSBtZXNzYWdlXG4gICAgICAgIF9zaG93ZG9uZW1zZzogZnVuY3Rpb24gaW5mc2NyX3Nob3dkb25lbXNnKCkge1xuXG4gICAgICAgICAgICB2YXIgb3B0cyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgICAgICAgLy8gaWYgYmVoYXZpb3IgaXMgZGVmaW5lZCBhbmQgdGhpcyBmdW5jdGlvbiBpcyBleHRlbmRlZCwgY2FsbCB0aGF0IGluc3RlYWQgb2YgZGVmYXVsdFxuICAgICAgICAgICAgaWYgKCEhb3B0cy5iZWhhdmlvciAmJiB0aGlzWydfc2hvd2RvbmVtc2dfJytvcHRzLmJlaGF2aW9yXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpc1snX3Nob3dkb25lbXNnXycrb3B0cy5iZWhhdmlvcl0uY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdHMubG9hZGluZy5tc2dcbiAgICAgICAgICAgIC5maW5kKCdpbWcnKVxuICAgICAgICAgICAgLmhpZGUoKVxuICAgICAgICAgICAgLnBhcmVudCgpXG4gICAgICAgICAgICAuZmluZCgnZGl2JykuaHRtbChvcHRzLmxvYWRpbmcuZmluaXNoZWRNc2cpLmFuaW1hdGUoeyBvcGFjaXR5OiAxIH0sIDIwMDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZhZGVPdXQob3B0cy5sb2FkaW5nLnNwZWVkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyB1c2VyIHByb3ZpZGVkIGNhbGxiYWNrIHdoZW4gZG9uZSAgICBcbiAgICAgICAgICAgIG9wdHMuZXJyb3JDYWxsYmFjay5jYWxsKCQob3B0cy5jb250ZW50U2VsZWN0b3IpWzBdLCdkb25lJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gZ3JhYiBlYWNoIHNlbGVjdG9yIG9wdGlvbiBhbmQgc2VlIGlmIGFueSBmYWlsXG4gICAgICAgIF92YWxpZGF0ZTogZnVuY3Rpb24gaW5mc2NyX3ZhbGlkYXRlKG9wdHMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBvcHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleS5pbmRleE9mICYmIGtleS5pbmRleE9mKCdTZWxlY3RvcicpID4gLTEgJiYgJChvcHRzW2tleV0pLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnWW91ciAnICsga2V5ICsgJyBmb3VuZCBubyBlbGVtZW50cy4nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLypcdFxuICAgICAgICAgICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgUHVibGljIG1ldGhvZHNcbiAgICAgICAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgICovXG5cbiAgICAgICAgLy8gQmluZCB0byBzY3JvbGxcbiAgICAgICAgYmluZDogZnVuY3Rpb24gaW5mc2NyX2JpbmQoKSB7XG4gICAgICAgICAgICB0aGlzLl9iaW5kaW5nKCdiaW5kJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gRGVzdHJveSBjdXJyZW50IGluc3RhbmNlIG9mIHBsdWdpblxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiBpbmZzY3JfZGVzdHJveSgpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zdGF0ZS5pc0Rlc3Ryb3llZCA9IHRydWU7XG5cdFx0XHR0aGlzLm9wdGlvbnMubG9hZGluZy5maW5pc2hlZCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Vycm9yKCdkZXN0cm95Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gU2V0IHBhdXNlIHZhbHVlIHRvIGZhbHNlXG4gICAgICAgIHBhdXNlOiBmdW5jdGlvbiBpbmZzY3JfcGF1c2UoKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXVzaW5nKCdwYXVzZScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFNldCBwYXVzZSB2YWx1ZSB0byBmYWxzZVxuICAgICAgICByZXN1bWU6IGZ1bmN0aW9uIGluZnNjcl9yZXN1bWUoKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXVzaW5nKCdyZXN1bWUnKTtcbiAgICAgICAgfSxcblxuXHRcdGJlZ2luQWpheDogZnVuY3Rpb24gaW5mc2NyX2FqYXgob3B0cykge1xuXHRcdFx0dmFyIGluc3RhbmNlID0gdGhpcyxcblx0XHRcdFx0cGF0aCA9IG9wdHMucGF0aCxcblx0XHRcdFx0Ym94LCBkZXN0dXJsLCBtZXRob2QsIGNvbmRpdGlvbjtcblxuXHRcdFx0Ly8gaW5jcmVtZW50IHRoZSBVUkwgYml0LiBlLmcuIC9wYWdlLzMvXG5cdFx0XHRvcHRzLnN0YXRlLmN1cnJQYWdlKys7XG5cbiAgICAgICAgICAgIC8vIE1hbnVhbGx5IGNvbnRyb2wgbWF4aW11bSBwYWdlIFxuICAgICAgICAgICAgaWYgKCBvcHRzLm1heFBhZ2UgIT0gdW5kZWZpbmVkICYmIG9wdHMuc3RhdGUuY3VyclBhZ2UgPiBvcHRzLm1heFBhZ2UgKXtcbiAgICAgICAgICAgICAgICBvcHRzLnN0YXRlLmlzQmV5b25kTWF4UGFnZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG5cdFx0XHQvLyBpZiB3ZSdyZSBkZWFsaW5nIHdpdGggYSB0YWJsZSB3ZSBjYW4ndCB1c2UgRElWc1xuXHRcdFx0Ym94ID0gJChvcHRzLmNvbnRlbnRTZWxlY3RvcikuaXMoJ3RhYmxlLCB0Ym9keScpID8gJCgnPHRib2R5Lz4nKSA6ICQoJzxkaXYvPicpO1xuXG5cdFx0XHRkZXN0dXJsID0gKHR5cGVvZiBwYXRoID09PSAnZnVuY3Rpb24nKSA/IHBhdGgob3B0cy5zdGF0ZS5jdXJyUGFnZSkgOiBwYXRoLmpvaW4ob3B0cy5zdGF0ZS5jdXJyUGFnZSk7XG5cdFx0XHRpbnN0YW5jZS5fZGVidWcoJ2hlYWRpbmcgaW50byBhamF4JywgZGVzdHVybCk7XG5cblx0XHRcdG1ldGhvZCA9IChvcHRzLmRhdGFUeXBlID09PSAnaHRtbCcgfHwgb3B0cy5kYXRhVHlwZSA9PT0gJ2pzb24nICkgPyBvcHRzLmRhdGFUeXBlIDogJ2h0bWwrY2FsbGJhY2snO1xuXHRcdFx0aWYgKG9wdHMuYXBwZW5kQ2FsbGJhY2sgJiYgb3B0cy5kYXRhVHlwZSA9PT0gJ2h0bWwnKSB7XG5cdFx0XHRcdG1ldGhvZCArPSAnK2NhbGxiYWNrJztcblx0XHRcdH1cblxuXHRcdFx0c3dpdGNoIChtZXRob2QpIHtcblx0XHRcdFx0Y2FzZSAnaHRtbCtjYWxsYmFjayc6XG5cdFx0XHRcdFx0aW5zdGFuY2UuX2RlYnVnKCdVc2luZyBIVE1MIHZpYSAubG9hZCgpIG1ldGhvZCcpO1xuXHRcdFx0XHRcdGJveC5sb2FkKGRlc3R1cmwgKyAnICcgKyBvcHRzLml0ZW1TZWxlY3RvciwgdW5kZWZpbmVkLCBmdW5jdGlvbiBpbmZzY3JfYWpheF9jYWxsYmFjayhyZXNwb25zZVRleHQpIHtcblx0XHRcdFx0XHRcdGluc3RhbmNlLl9sb2FkY2FsbGJhY2soYm94LCByZXNwb25zZVRleHQsIGRlc3R1cmwpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAnaHRtbCc6XG5cdFx0XHRcdFx0aW5zdGFuY2UuX2RlYnVnKCdVc2luZyAnICsgKG1ldGhvZC50b1VwcGVyQ2FzZSgpKSArICcgdmlhICQuYWpheCgpIG1ldGhvZCcpO1xuXHRcdFx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdFx0XHQvLyBwYXJhbXNcblx0XHRcdFx0XHRcdHVybDogZGVzdHVybCxcblx0XHRcdFx0XHRcdGRhdGFUeXBlOiBvcHRzLmRhdGFUeXBlLFxuXHRcdFx0XHRcdFx0Y29tcGxldGU6IGZ1bmN0aW9uIGluZnNjcl9hamF4X2NhbGxiYWNrKGpxWEhSLCB0ZXh0U3RhdHVzKSB7XG5cdFx0XHRcdFx0XHRcdGNvbmRpdGlvbiA9ICh0eXBlb2YgKGpxWEhSLmlzUmVzb2x2ZWQpICE9PSAndW5kZWZpbmVkJykgPyAoanFYSFIuaXNSZXNvbHZlZCgpKSA6ICh0ZXh0U3RhdHVzID09PSBcInN1Y2Nlc3NcIiB8fCB0ZXh0U3RhdHVzID09PSBcIm5vdG1vZGlmaWVkXCIpO1xuXHRcdFx0XHRcdFx0XHRpZiAoY29uZGl0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdFx0aW5zdGFuY2UuX2xvYWRjYWxsYmFjayhib3gsIGpxWEhSLnJlc3BvbnNlVGV4dCwgZGVzdHVybCk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0aW5zdGFuY2UuX2Vycm9yKCdlbmQnKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgJ2pzb24nOlxuXHRcdFx0XHRcdGluc3RhbmNlLl9kZWJ1ZygnVXNpbmcgJyArIChtZXRob2QudG9VcHBlckNhc2UoKSkgKyAnIHZpYSAkLmFqYXgoKSBtZXRob2QnKTtcblx0XHRcdFx0XHQkLmFqYXgoe1xuXHRcdFx0XHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdFx0XHRcdHR5cGU6ICdHRVQnLFxuXHRcdFx0XHRcdFx0dXJsOiBkZXN0dXJsLFxuXHRcdFx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24gKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSB7XG5cdFx0XHRcdFx0XHRcdGNvbmRpdGlvbiA9ICh0eXBlb2YgKGpxWEhSLmlzUmVzb2x2ZWQpICE9PSAndW5kZWZpbmVkJykgPyAoanFYSFIuaXNSZXNvbHZlZCgpKSA6ICh0ZXh0U3RhdHVzID09PSBcInN1Y2Nlc3NcIiB8fCB0ZXh0U3RhdHVzID09PSBcIm5vdG1vZGlmaWVkXCIpO1xuXHRcdFx0XHRcdFx0XHRpZiAob3B0cy5hcHBlbmRDYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdC8vIGlmIGFwcGVuZENhbGxiYWNrIGlzIHRydWUsIHlvdSBtdXN0IGRlZmluZWQgdGVtcGxhdGUgaW4gb3B0aW9ucy5cblx0XHRcdFx0XHRcdFx0XHQvLyBub3RlIHRoYXQgZGF0YSBwYXNzZWQgaW50byBfbG9hZGNhbGxiYWNrIGlzIGFscmVhZHkgYW4gaHRtbCAoYWZ0ZXIgcHJvY2Vzc2VkIGluIG9wdHMudGVtcGxhdGUoZGF0YSkpLlxuXHRcdFx0XHRcdFx0XHRcdGlmIChvcHRzLnRlbXBsYXRlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciB0aGVEYXRhID0gb3B0cy50ZW1wbGF0ZShkYXRhKTtcblx0XHRcdFx0XHRcdFx0XHRcdGJveC5hcHBlbmQodGhlRGF0YSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoY29uZGl0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGluc3RhbmNlLl9sb2FkY2FsbGJhY2soYm94LCB0aGVEYXRhKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGluc3RhbmNlLl9lcnJvcignZW5kJyk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGluc3RhbmNlLl9kZWJ1ZyhcInRlbXBsYXRlIG11c3QgYmUgZGVmaW5lZC5cIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRpbnN0YW5jZS5fZXJyb3IoJ2VuZCcpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBpZiBhcHBlbmRDYWxsYmFjayBpcyBmYWxzZSwgd2Ugd2lsbCBwYXNzIGluIHRoZSBKU09OIG9iamVjdC4geW91IHNob3VsZCBoYW5kbGUgaXQgeW91cnNlbGYgaW4geW91ciBjYWxsYmFjay5cblx0XHRcdFx0XHRcdFx0XHRpZiAoY29uZGl0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpbnN0YW5jZS5fbG9hZGNhbGxiYWNrKGJveCwgZGF0YSwgZGVzdHVybCk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGluc3RhbmNlLl9lcnJvcignZW5kJyk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRpbnN0YW5jZS5fZGVidWcoXCJKU09OIGFqYXggcmVxdWVzdCBmYWlsZWQuXCIpO1xuXHRcdFx0XHRcdFx0XHRpbnN0YW5jZS5fZXJyb3IoJ2VuZCcpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fSxcblxuICAgICAgICAvLyBSZXRyaWV2ZSBuZXh0IHNldCBvZiBjb250ZW50IGl0ZW1zXG4gICAgICAgIHJldHJpZXZlOiBmdW5jdGlvbiBpbmZzY3JfcmV0cmlldmUocGFnZU51bSkge1xuXHRcdFx0cGFnZU51bSA9IHBhZ2VOdW0gfHwgbnVsbDtcblxuXHRcdFx0dmFyIGluc3RhbmNlID0gdGhpcyxcbiAgICAgICAgICAgIG9wdHMgPSBpbnN0YW5jZS5vcHRpb25zO1xuXG4gICAgICAgICAgICAvLyBpZiBiZWhhdmlvciBpcyBkZWZpbmVkIGFuZCB0aGlzIGZ1bmN0aW9uIGlzIGV4dGVuZGVkLCBjYWxsIHRoYXQgaW5zdGVhZCBvZiBkZWZhdWx0XG4gICAgICAgICAgICBpZiAoISFvcHRzLmJlaGF2aW9yICYmIHRoaXNbJ3JldHJpZXZlXycrb3B0cy5iZWhhdmlvcl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXNbJ3JldHJpZXZlXycrb3B0cy5iZWhhdmlvcl0uY2FsbCh0aGlzLHBhZ2VOdW0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZm9yIG1hbnVhbCB0cmlnZ2VycywgaWYgZGVzdHJveWVkLCBnZXQgb3V0IG9mIGhlcmVcbiAgICAgICAgICAgIGlmIChvcHRzLnN0YXRlLmlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ0luc3RhbmNlIGlzIGRlc3Ryb3llZCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gd2UgZG9udCB3YW50IHRvIGZpcmUgdGhlIGFqYXggbXVsdGlwbGUgdGltZXNcbiAgICAgICAgICAgIG9wdHMuc3RhdGUuaXNEdXJpbmdBamF4ID0gdHJ1ZTtcblxuICAgICAgICAgICAgb3B0cy5sb2FkaW5nLnN0YXJ0LmNhbGwoJChvcHRzLmNvbnRlbnRTZWxlY3RvcilbMF0sb3B0cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIG5leHQgcGFnZSBpcyBuZWVkZWRcbiAgICAgICAgc2Nyb2xsOiBmdW5jdGlvbiBpbmZzY3Jfc2Nyb2xsKCkge1xuXG4gICAgICAgICAgICB2YXIgb3B0cyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIHN0YXRlID0gb3B0cy5zdGF0ZTtcblxuICAgICAgICAgICAgLy8gaWYgYmVoYXZpb3IgaXMgZGVmaW5lZCBhbmQgdGhpcyBmdW5jdGlvbiBpcyBleHRlbmRlZCwgY2FsbCB0aGF0IGluc3RlYWQgb2YgZGVmYXVsdFxuICAgICAgICAgICAgaWYgKCEhb3B0cy5iZWhhdmlvciAmJiB0aGlzWydzY3JvbGxfJytvcHRzLmJlaGF2aW9yXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpc1snc2Nyb2xsXycrb3B0cy5iZWhhdmlvcl0uY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZS5pc0R1cmluZ0FqYXggfHwgc3RhdGUuaXNJbnZhbGlkUGFnZSB8fCBzdGF0ZS5pc0RvbmUgfHwgc3RhdGUuaXNEZXN0cm95ZWQgfHwgc3RhdGUuaXNQYXVzZWQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMuX25lYXJib3R0b20oKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cbiAgICAgICAgICAgIHRoaXMucmV0cmlldmUoKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIFRvZ2dsZSBwYXVzZSB2YWx1ZVxuICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uIGluZnNjcl90b2dnbGUoKSB7XG4gICAgICAgICAgICB0aGlzLl9wYXVzaW5nKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gVW5iaW5kIGZyb20gc2Nyb2xsXG4gICAgICAgIHVuYmluZDogZnVuY3Rpb24gaW5mc2NyX3VuYmluZCgpIHtcbiAgICAgICAgICAgIHRoaXMuX2JpbmRpbmcoJ3VuYmluZCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHVwZGF0ZSBvcHRpb25zXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gaW5mc2NyX29wdGlvbnMoa2V5KSB7XG4gICAgICAgICAgICBpZiAoJC5pc1BsYWluT2JqZWN0KGtleSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLHRoaXMub3B0aW9ucyxrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgLypcdFxuICAgICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIEluZmluaXRlIFNjcm9sbCBmdW5jdGlvblxuICAgICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgQm9ycm93ZWQgbG9naWMgZnJvbSB0aGUgZm9sbG93aW5nLi4uXG5cbiAgICAgICAgalF1ZXJ5IFVJXG4gICAgICAgIC0gaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9qcXVlcnktdWkvYmxvYi9tYXN0ZXIvdWkvanF1ZXJ5LnVpLndpZGdldC5qc1xuXG4gICAgICAgIGpDYXJvdXNlbFxuICAgICAgICAtIGh0dHBzOi8vZ2l0aHViLmNvbS9qc29yL2pjYXJvdXNlbC9ibG9iL21hc3Rlci9saWIvanF1ZXJ5LmpjYXJvdXNlbC5qc1xuXG4gICAgICAgIE1hc29ucnlcbiAgICAgICAgLSBodHRwczovL2dpdGh1Yi5jb20vZGVzYW5kcm8vbWFzb25yeS9ibG9iL21hc3Rlci9qcXVlcnkubWFzb25yeS5qc1x0XHRcblxuKi9cblxuICAgICQuZm4uaW5maW5pdGVzY3JvbGwgPSBmdW5jdGlvbiBpbmZzY3JfaW5pdChvcHRpb25zLCBjYWxsYmFjaykge1xuXG5cbiAgICAgICAgdmFyIHRoaXNDYWxsID0gdHlwZW9mIG9wdGlvbnM7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzQ2FsbCkge1xuXG4gICAgICAgICAgICAvLyBtZXRob2QgXG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuXHRcdFx0XHR0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHZhciBpbnN0YW5jZSA9ICQuZGF0YSh0aGlzLCAnaW5maW5pdGVzY3JvbGwnKTtcblxuXHRcdFx0XHRcdGlmICghaW5zdGFuY2UpIHtcblx0XHRcdFx0XHRcdC8vIG5vdCBzZXR1cCB5ZXRcblx0XHRcdFx0XHRcdC8vIHJldHVybiAkLmVycm9yKCdNZXRob2QgJyArIG9wdGlvbnMgKyAnIGNhbm5vdCBiZSBjYWxsZWQgdW50aWwgSW5maW5pdGUgU2Nyb2xsIGlzIHNldHVwJyk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCEkLmlzRnVuY3Rpb24oaW5zdGFuY2Vbb3B0aW9uc10pIHx8IG9wdGlvbnMuY2hhckF0KDApID09PSBcIl9cIikge1xuXHRcdFx0XHRcdFx0Ly8gcmV0dXJuICQuZXJyb3IoJ05vIHN1Y2ggbWV0aG9kICcgKyBvcHRpb25zICsgJyBmb3IgSW5maW5pdGUgU2Nyb2xsJyk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gbm8gZXJyb3JzIVxuXHRcdFx0XHRcdGluc3RhbmNlW29wdGlvbnNdLmFwcGx5KGluc3RhbmNlLCBhcmdzKTtcblx0XHRcdFx0fSk7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAvLyBjcmVhdGlvbiBcbiAgICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGluc3RhbmNlID0gJC5kYXRhKHRoaXMsICdpbmZpbml0ZXNjcm9sbCcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIG9wdGlvbnMgb2YgY3VycmVudCBpbnN0YW5jZVxuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS51cGRhdGUob3B0aW9ucyk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgbmV3IGluc3RhbmNlXG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3ICQuaW5maW5pdGVzY3JvbGwob3B0aW9ucywgY2FsbGJhY2ssIHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGRvbid0IGF0dGFjaCBpZiBpbnN0YW50aWF0aW9uIGZhaWxlZFxuICAgICAgICAgICAgICAgICAgICBpZiAoIWluc3RhbmNlLmZhaWxlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJC5kYXRhKHRoaXMsICdpbmZpbml0ZXNjcm9sbCcsIGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cblxuXG4gICAgLyogXG4gICAgICogc21hcnRzY3JvbGw6IGRlYm91bmNlZCBzY3JvbGwgZXZlbnQgZm9yIGpRdWVyeSAqXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL2x1a2VzaHVtYXJkL3NtYXJ0c2Nyb2xsXG4gICAgICogQmFzZWQgb24gc21hcnRyZXNpemUgYnkgQGxvdWlzX3JlbWk6IGh0dHBzOi8vZ2l0aHViLmNvbS9scmJhYmUvanF1ZXJ5LnNtYXJ0cmVzaXplLmpzICpcbiAgICAgKiBDb3B5cmlnaHQgMjAxMSBMb3Vpcy1SZW1pICYgTHVrZSBTaHVtYXJkICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLiAqXG4gICAgICovXG5cbiAgICB2YXIgZXZlbnQgPSAkLmV2ZW50LFxuICAgIHNjcm9sbFRpbWVvdXQ7XG5cbiAgICBldmVudC5zcGVjaWFsLnNtYXJ0c2Nyb2xsID0ge1xuICAgICAgICBzZXR1cDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5iaW5kKFwic2Nyb2xsXCIsIGV2ZW50LnNwZWNpYWwuc21hcnRzY3JvbGwuaGFuZGxlcik7XG4gICAgICAgIH0sXG4gICAgICAgIHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKHRoaXMpLnVuYmluZChcInNjcm9sbFwiLCBldmVudC5zcGVjaWFsLnNtYXJ0c2Nyb2xsLmhhbmRsZXIpO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVyOiBmdW5jdGlvbiAoZXZlbnQsIGV4ZWNBc2FwKSB7XG4gICAgICAgICAgICAvLyBTYXZlIHRoZSBjb250ZXh0XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMsXG4gICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgICAgICAvLyBzZXQgY29ycmVjdCBldmVudCB0eXBlXG4gICAgICAgICAgICBldmVudC50eXBlID0gXCJzbWFydHNjcm9sbFwiO1xuXG4gICAgICAgICAgICBpZiAoc2Nyb2xsVGltZW91dCkgeyBjbGVhclRpbWVvdXQoc2Nyb2xsVGltZW91dCk7IH1cbiAgICAgICAgICAgIHNjcm9sbFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkKGNvbnRleHQpLnRyaWdnZXIoJ3NtYXJ0c2Nyb2xsJywgYXJncyk7XG4gICAgICAgICAgICB9LCBleGVjQXNhcCA9PT0gXCJleGVjQXNhcFwiID8gMCA6IDEwMCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJC5mbi5zbWFydHNjcm9sbCA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZm4gPyB0aGlzLmJpbmQoXCJzbWFydHNjcm9sbFwiLCBmbikgOiB0aGlzLnRyaWdnZXIoXCJzbWFydHNjcm9sbFwiLCBbXCJleGVjQXNhcFwiXSk7XG4gICAgfTtcblxuXG59KSh3aW5kb3csIGpRdWVyeSk7XG4iXSwiZmlsZSI6InZlbmRvci9qcXVlcnkuaW5maW5pdGVzY3JvbGwuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==