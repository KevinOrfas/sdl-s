/*!
 * Cube Portfolio - Responsive jQuery Grid Plugin
 *
 * version: 2.3.2 (26 May, 2015)
 * require: jQuery v1.7+
 *
 * Copyright 2013-2015, Mihai Buricea (http://scriptpie.com/cubeportfolio/live-preview/)
 * Licensed under CodeCanyon License (http://codecanyon.net/licenses)
 *
 */

(function($, window, document, undefined) {
    'use strict';

    function CubePortfolio(obj, options, callback) {
        /*jshint validthis: true */
        var t = this,
            initialCls = 'cbp',
            children;

        if ($.data(obj, 'cubeportfolio')) {
            throw new Error('cubeportfolio is already initialized. Destroy it before initialize again!');
        }

        // attached this instance to obj
        $.data(obj, 'cubeportfolio', t);

        // extend options
        t.options = $.extend({}, $.fn.cubeportfolio.options, options);

        // store the state of the animation used for filters
        t.isAnimating = true;

        // default filter for plugin
        t.defaultFilter = t.options.defaultFilter;

        // registered events (observator & publisher pattern)
        t.registeredEvents = [];

        // skip events (observator & publisher pattern)
        t.skipEvents = [];

        // has wrapper
        t.addedWrapp = false;

        // register callback function
        if ($.isFunction(callback)) {
            t._registerEvent('initFinish', callback, true);
        }

        // js element
        t.obj = obj;

        // jquery element
        t.$obj = $(obj);

        // when there are no .cbp-item
        children = t.$obj.children();

        // if caption is active
        if (t.options.caption) {
            if (!CubePortfolio.Private.modernBrowser) {
                t.options.caption = 'minimal';
            }

            // .cbp-caption-active is used only for css
            // so it will not generate a big css from sass if a caption is set
            initialCls += ' cbp-caption-active cbp-caption-' + t.options.caption;
        }

        t.$obj.addClass(initialCls);

        if (children.length === 0 || children.first().hasClass('cbp-item')) {
            t.wrapInner(t.obj, 'cbp-wrapper');
            t.addedWrapp = true;
        }

        // jquery wrapper element
        t.$ul = t.$obj.children().addClass('cbp-wrapper');

        // wrap the $ul in a outside wrapper
        t.wrapInner(t.obj, 'cbp-wrapper-outer');

        t.wrapper = t.$obj.children('.cbp-wrapper-outer');

        t.blocks = t.$ul.children('.cbp-item');

        // wrap .cbp-item-wrap div inside .cbp-item
        t.wrapInner(t.blocks, 'cbp-item-wrapper');

        // store main container width
        t.width = t.$obj.outerWidth();

        // wait to load all images and then go further
        t._load(t.$obj, t._display);
    }

    $.extend(CubePortfolio.prototype, {

        storeData: function(blocks) {
            blocks.each(function(index, el) {
                var block = $(el);

                block.data('cbp', {
                    wrapper: block.children('.cbp-item-wrapper'),

                    widthInitial: block.outerWidth(),
                    heightInitial: block.outerHeight(),
                    width: null,
                    height: null,

                    left: null,
                    leftNew: null,
                    top: null,
                    topNew: null
                });
            });
        },

        // http://bit.ly/pure-js-wrap
        wrapInner: function(items, classAttr) {
            var t = this,
                item,
                i,
                div;

            classAttr = classAttr || '';

            if (items.length && items.length < 1) {
                return; // there are no .cbp-item
            } else if (items.length === undefined) {
                items = [items];
            }

            for (i = items.length - 1; i >= 0; i--) {
                item = items[i];

                div = document.createElement('div');

                div.setAttribute('class', classAttr);

                while (item.childNodes.length) {
                    div.appendChild(item.childNodes[0]);
                }

                item.appendChild(div);

            }
        },


        /**
         * Destroy function for all captions
         */
        _captionDestroy: function() {
            var t = this;
            t.$obj.removeClass('cbp-caption-active cbp-caption-' + t.options.caption);
        },


        /**
         * Add resize event when browser width changes
         */
        resizeEvent: function() {
            var t = this,
                timeout, gridWidth;

            // resize
            $(window).on('resize.cbp', function() {
                clearTimeout(timeout);

                timeout = setTimeout(function() {

                    if (window.innerHeight == screen.height) {
                        // this is fulll screen mode. don't need to trigger a resize
                        return;
                    }

                    if (t.options.gridAdjustment === 'alignCenter') {
                        t.obj.style.maxWidth = '';
                    }

                    gridWidth = t.$obj.outerWidth();

                    if (t.width !== gridWidth) {

                        // update the current width
                        t.width = gridWidth;

                        t._gridAdjust();

                        // reposition the blocks
                        t._layout();

                        // repositionate the blocks with the best transition available
                        t.positionateItems();

                        // resize main container height
                        t._resizeMainContainer();

                        if (t.options.layoutMode === 'slider') {
                            t._updateSlider();
                        }

                        t._triggerEvent('resizeGrid');
                    }

                    t._triggerEvent('resizeWindow');

                }, 80);
            });

        },


        /**
         * Wait to load all images
         */
        _load: function(obj, callback, args) {
            var t = this,
                imgs,
                imgsLength,
                imgsLoaded = 0;

            args = args || [];

            imgs = obj.find('img:uncached').map(function() {
                return this.src;
            });

            imgsLength = imgs.length;

            if (imgsLength === 0) {
                callback.apply(t, args);
            }

            $.each(imgs, function(i, src) {
                var img = new Image();

                $(img).one('load.cbp error.cbp', function() {
                    $(this).off('load.cbp error.cbp');

                    imgsLoaded++;
                    if (imgsLoaded === imgsLength) {
                        callback.apply(t, args);
                        return false;
                    }

                });

                img.src = src;
            });

        },


        /**
         * Check if filters is present in url
         */
        _filterFromUrl: function() {
            var t = this,
                match = /#cbpf=(.*?)([#|?&]|$)/gi.exec(location.href);

            if (match !== null) {
                t.defaultFilter = match[1];
            }
        },


        /**
         * Show the plugin
         */
        _display: function() {
            var t = this;

            // store to data some values of t.blocks
            t.storeData(t.blocks);

            if (t.options.layoutMode === 'grid') {
                // set default filter if is present in url
                t._filterFromUrl();
            }

            if (t.defaultFilter !== '*') {
                t.blocksOn = t.blocks.filter(t.defaultFilter);
                t.blocks.not(t.defaultFilter).addClass('cbp-item-off');
            } else {
                t.blocksOn = t.blocks;
            }

            // plugins
            t._plugins = $.map(CubePortfolio.Plugins, function(pluginName) {
                return pluginName(t);
            });

            t._triggerEvent('initStartRead');
            t._triggerEvent('initStartWrite');

            t.localColumnWidth = t.options.gapVertical;

            if (t.blocks.length) {
                t.localColumnWidth += t.blocks.first().data('cbp').widthInitial;
            }

            t.getColumnsType = ($.isArray(t.options.mediaQueries)) ? '_getColumnsBreakpoints' : '_getColumnsAuto';

            t._gridAdjust();

            // create mark-up for layout mode
            t['_' + t.options.layoutMode + 'Markup']();

            // make layout
            t._layout();

            // positionate the blocks
            t.positionateItems();

            // resize main container height
            t._resizeMainContainer();

            t._triggerEvent('initEndRead');
            t._triggerEvent('initEndWrite');

            // plugin is ready to show and interact
            t.$obj.addClass('cbp-ready');

            t._registerEvent('delayFrame', t.delayFrame);

            //  the reason is to skip this event when you want from a plugin
            t._triggerEvent('delayFrame');

        },

        positionateItems: function() {
            var t = this,
                data;

            t.blocksOn.each(function(index, el) {
                data = $(el).data('cbp');

                data.left = data.leftNew;
                data.top = data.topNew;

                el.style.left = data.left + 'px';
                el.style.top = data.top + 'px';
            });
        },

        delayFrame: function() {
            var t = this;

            requestAnimationFrame(function() {
                t.resizeEvent();

                t._triggerEvent('initFinish');

                // animating is now false
                t.isAnimating = false;

                // trigger public event initComplete
                t.$obj.trigger('initComplete.cbp');
            });

        },

        _gridAdjust: function() {
            var t = this;

            // if responsive
            if (t.options.gridAdjustment === 'responsive') {
                t._responsiveLayout();
            } else {
                t.blocks.each(function(index, el) {
                    var data = $(el).data('cbp');

                    data.width = data.widthInitial;
                    data.height = data.heightInitial;
                });
            }
        },

        /**
         * Build the layout
         */
        _layout: function() {
            var t = this;

            t['_' + t.options.layoutMode + 'LayoutReset']();

            t['_' + t.options.layoutMode + 'Layout']();

            t.$obj.removeClass(function(index, css) {
                return (css.match(/\bcbp-cols-\d+/gi) || []).join(' ');
            });

            t.$obj.addClass('cbp-cols-' + t.cols);

        },

        // create mark
        _sliderMarkup: function() {
            var t = this;

            t.sliderStopEvents = false;

            t.sliderActive = 0;

            t._registerEvent('updateSliderPosition', function() {
                t.$obj.addClass('cbp-mode-slider');
            }, true);

            t.nav = $('<div/>', {
                'class': 'cbp-nav'
            });

            t.nav.on('click.cbp', '[data-slider-action]', function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();

                if (t.sliderStopEvents) {
                    return;
                }

                var el = $(this),
                    action = el.attr('data-slider-action');

                if (t['_' + action + 'Slider']) {
                    t['_' + action + 'Slider'](el);
                }

            });

            if (t.options.showNavigation) {
                t.controls = $('<div/>', {
                    'class': 'cbp-nav-controls'
                });

                t.navPrev = $('<div/>', {
                    'class': 'cbp-nav-prev',
                    'data-slider-action': 'prev'
                }).appendTo(t.controls);

                t.navNext = $('<div/>', {
                    'class': 'cbp-nav-next',
                    'data-slider-action': 'next'
                }).appendTo(t.controls);


                t.controls.appendTo(t.nav);
            }

            if (t.options.showPagination) {
                t.navPagination = $('<div/>', {
                    'class': 'cbp-nav-pagination'
                }).appendTo(t.nav);
            }

            if (t.controls || t.navPagination) {
                t.nav.appendTo(t.$obj);
            }

            t._updateSliderPagination();

            if (t.options.auto) {
                if (t.options.autoPauseOnHover) {
                    t.mouseIsEntered = false;
                    t.$obj.on('mouseenter.cbp', function(e) {
                        t.mouseIsEntered = true;
                        t._stopSliderAuto();
                    }).on('mouseleave.cbp', function(e) {
                        t.mouseIsEntered = false;
                        t._startSliderAuto();
                    });
                }

                t._startSliderAuto();
            }

            if (t.options.drag && CubePortfolio.Private.modernBrowser) {
                t._dragSlider();
            }

        },

        _updateSlider: function() {
            var t = this;

            t._updateSliderPosition();

            t._updateSliderPagination();

        },

        _updateSliderPagination: function() {
            var t = this,
                pages,
                i;

            if (t.options.showPagination) {

                // get number of pages
                pages = Math.ceil(t.blocksOn.length / t.cols);
                t.navPagination.empty();

                for (i = pages - 1; i >= 0; i--) {
                    $('<div/>', {
                        'class': 'cbp-nav-pagination-item',
                        'data-slider-action': 'jumpTo'
                    }).appendTo(t.navPagination);
                }

                t.navPaginationItems = t.navPagination.children();
            }

            // enable disable the nav
            t._enableDisableNavSlider();
        },

        _destroySlider: function() {
            var t = this;

            if (t.options.layoutMode !== 'slider') {
                return;
            }

            t.$obj.off('click.cbp');

            t.$obj.removeClass('cbp-mode-slider');

            if (t.options.showNavigation) {
                t.nav.remove();
            }

            if (t.navPagination) {
                t.navPagination.remove();
            }

        },

        _nextSlider: function(el) {
            var t = this;

            if (t._isEndSlider()) {
                if (t.isRewindNav()) {
                    t.sliderActive = 0;
                } else {
                    return;
                }
            } else {
                if (t.options.scrollByPage) {
                    t.sliderActive = Math.min(t.sliderActive + t.cols, t.blocksOn.length - t.cols);
                } else {
                    t.sliderActive += 1;
                }
            }

            t._goToSlider();
        },

        _prevSlider: function(el) {
            var t = this;

            if (t._isStartSlider()) {
                if (t.isRewindNav()) {
                    t.sliderActive = t.blocksOn.length - t.cols;
                } else {
                    return;
                }
            } else {
                if (t.options.scrollByPage) {
                    t.sliderActive = Math.max(0, t.sliderActive - t.cols);
                } else {
                    t.sliderActive -= 1;
                }
            }

            t._goToSlider();
        },

        _jumpToSlider: function(el) {
            var t = this,
                index = Math.min(el.index() * t.cols, t.blocksOn.length - t.cols);

            if (index === t.sliderActive) {
                return;
            }

            t.sliderActive = index;

            t._goToSlider();
        },

        _jumpDragToSlider: function(pos) {
            var t = this,
                jumpWidth,
                offset,
                condition,
                index,
                dragLeft = (pos > 0) ? true : false;

            if (t.options.scrollByPage) {
                jumpWidth = t.cols * t.localColumnWidth;
                offset = t.cols;
            } else {
                jumpWidth = t.localColumnWidth;
                offset = 1;
            }

            pos = Math.abs(pos);
            index = Math.floor(pos / jumpWidth) * offset;
            if (pos % jumpWidth > 20) {
                index += offset;
            }

            if (dragLeft) { // drag to left
                t.sliderActive = Math.min(t.sliderActive + index, t.blocksOn.length - t.cols);
            } else { // drag to right
                t.sliderActive = Math.max(0, t.sliderActive - index);
            }

            t._goToSlider();
        },

        _isStartSlider: function() {
            return this.sliderActive === 0;
        },

        _isEndSlider: function() {
            var t = this;
            return (t.sliderActive + t.cols) > t.blocksOn.length - 1;
        },

        _goToSlider: function() {
            var t = this;

            // enable disable the nav
            t._enableDisableNavSlider();

            t._updateSliderPosition();

        },

        _startSliderAuto: function() {
            var t = this;

            if (t.isDrag) {
                t._stopSliderAuto();
                return;
            }

            t.timeout = setTimeout(function() {

                // go to next slide
                t._nextSlider();

                // start auto
                t._startSliderAuto();

            }, t.options.autoTimeout);
        },

        _stopSliderAuto: function() {
            clearTimeout(this.timeout);
        },

        _enableDisableNavSlider: function() {
            var t = this,
                page,
                method;

            if (!t.isRewindNav()) {
                method = (t._isStartSlider()) ? 'addClass' : 'removeClass';
                t.navPrev[method]('cbp-nav-stop');

                method = (t._isEndSlider()) ? 'addClass' : 'removeClass';
                t.navNext[method]('cbp-nav-stop');
            }

            if (t.options.showPagination) {

                if (t.options.scrollByPage) {
                    page = Math.ceil(t.sliderActive / t.cols);
                } else {
                    if (t._isEndSlider()) {
                        page = t.navPaginationItems.length - 1;
                    } else {
                        page = Math.floor(t.sliderActive / t.cols);
                    }
                }

                // add class active on pagination's items
                t.navPaginationItems.removeClass('cbp-nav-pagination-active')
                    .eq(page)
                    .addClass('cbp-nav-pagination-active');
            }

        },

        /**
         * If slider loop is enabled don't add classes to `next` and `prev` buttons
         */
        isRewindNav: function() {
            var t = this;

            if (!t.options.showNavigation) {
                return true;
            }

            if (t.blocksOn.length <= t.cols) {
                return false;
            }

            if (t.options.rewindNav) {
                return true;
            }

            return false;
        },

        sliderItemsLength: function() {
            return this.blocksOn.length <= this.cols;
        },


        /**
         * Arrange the items in a slider layout
         */
        _sliderLayout: function() {
            var t = this;

            t.blocksOn.each(function(index, el) {
                var data = $(el).data('cbp');

                // update the values with the new ones
                data.leftNew = Math.round(t.localColumnWidth * index);
                data.topNew = 0;

                t.colVert.push(data.height + t.options.gapHorizontal);
            });

            t.sliderColVert = t.colVert.slice(t.sliderActive, t.sliderActive + t.cols);

            t.ulWidth = t.localColumnWidth * t.blocksOn.length - t.options.gapVertical;
            t.$ul.width(t.ulWidth);

        },

        _updateSliderPosition: function() {
            var t = this,
                value = -t.sliderActive * t.localColumnWidth;

            t._triggerEvent('updateSliderPosition');

            if (CubePortfolio.Private.modernBrowser) {
                t.$ul[0].style[CubePortfolio.Private.transform] = 'translate3d(' + value + 'px, 0px, 0)';
            } else {
                t.$ul[0].style.left = value + 'px';
            }

            t.sliderColVert = t.colVert.slice(t.sliderActive, t.sliderActive + t.cols);

            t._resizeMainContainer();

        },

        _dragSlider: function() {
            var t = this,
                $document = $(document),
                posInitial,
                pos,
                target,
                ulPosition,
                ulMaxWidth,
                isAnimating = false,
                events = {},
                isTouch = false,
                touchStartEvent,
                isHover = false;

            t.isDrag = false;

            if (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0)) {

                events = {
                    start: 'touchstart.cbp',
                    move: 'touchmove.cbp',
                    end: 'touchend.cbp'
                };

                isTouch = true;
            } else {
                events = {
                    start: 'mousedown.cbp',
                    move: 'mousemove.cbp',
                    end: 'mouseup.cbp'
                };
            }

            function dragStart(e) {
                if (t.sliderItemsLength()) {
                    return;
                }

                if (!isTouch) {
                    e.preventDefault();
                } else {
                    touchStartEvent = e;
                }

                if (t.options.auto) {
                    t._stopSliderAuto();
                }

                if (isAnimating) {
                    $(target).one('click.cbp', function() {
                        return false;
                    });
                    return;
                }

                target = $(e.target);
                posInitial = pointerEventToXY(e).x;
                pos = 0;
                ulPosition = -t.sliderActive * t.localColumnWidth;
                ulMaxWidth = t.localColumnWidth * (t.blocksOn.length - t.cols);

                $document.on(events.move, dragMove);
                $document.on(events.end, dragEnd);

                t.$obj.addClass('cbp-mode-slider-dragStart');
            }

            function dragEnd(e) {
                t.$obj.removeClass('cbp-mode-slider-dragStart');

                // put the state to animate
                isAnimating = true;

                if (pos !== 0) {
                    target.one('click.cbp', function() {
                        return false;
                    });

                    t._jumpDragToSlider(pos);

                    t.$ul.one(CubePortfolio.Private.transitionend, afterDragEnd);
                } else {
                    afterDragEnd.call(t);
                }

                $document.off(events.move);
                $document.off(events.end);
            }

            function dragMove(e) {
                pos = posInitial - pointerEventToXY(e).x;

                if (pos > 8 || pos < -8) {
                    e.preventDefault();
                }

                t.isDrag = true;

                var value = ulPosition - pos;

                if (pos < 0 && pos < ulPosition) { // to right
                    value = (ulPosition - pos) / 5;
                } else if (pos > 0 && (ulPosition - pos) < -ulMaxWidth) { // to left
                    value = -ulMaxWidth + (ulMaxWidth + ulPosition - pos) / 5;
                }

                if (CubePortfolio.Private.modernBrowser) {
                    t.$ul[0].style[CubePortfolio.Private.transform] = 'translate3d(' + value + 'px, 0px, 0)';
                } else {
                    t.$ul[0].style.left = value + 'px';
                }

            }

            function afterDragEnd() {
                isAnimating = false;
                t.isDrag = false;

                if (t.options.auto) {

                    if (t.mouseIsEntered) {
                        return;
                    }

                    t._startSliderAuto();

                }
            }

            function pointerEventToXY(e) {

                if (e.originalEvent !== undefined && e.originalEvent.touches !== undefined) {
                    e = e.originalEvent.touches[0];
                }

                return {
                    x: e.pageX,
                    y: e.pageY
                };
            }

            t.$ul.on(events.start, dragStart);

        },


        /**
         * Reset the slider layout
         */
        _sliderLayoutReset: function() {
            var t = this;
            t.colVert = [];
        },

        // create mark
        _gridMarkup: function() {

        },

        /**
         * Arrange the items in a grid layout
         */
        _gridLayout: function() {
            var t = this;

            t.blocksOn.each(function(index, el) {
                var minVert = Math.min.apply(Math, t.colVert),
                    column = 0,
                    data = $(el).data('cbp'),
                    setHeight,
                    colsLen,
                    i,
                    len;

                for (i = 0, len = t.colVert.length; i < len; i++) {
                    if (t.colVert[i] === minVert) {
                        column = i;
                        break;
                    }
                }

                // update the values with the new ones
                data.leftNew = Math.round(t.localColumnWidth * column);
                data.topNew = Math.round(minVert);

                setHeight = minVert + data.height + t.options.gapHorizontal;
                colsLen = t.cols + 1 - len;

                for (i = 0; i < colsLen; i++) {
                    t.colVert[column + i] = setHeight;
                }
            });

        },


        /**
         * Reset the grid layout
         */
        _gridLayoutReset: function() {
            var c, t = this;

            // @options gridAdjustment = alignCenter
            if (t.options.gridAdjustment === 'alignCenter') {

                // calculate numbers of columns
                t.cols = Math.max(Math.floor((t.width + t.options.gapVertical) / t.localColumnWidth), 1);

                t.width = t.cols * t.localColumnWidth - t.options.gapVertical;
                t.$obj.css('max-width', t.width);

            } else {

                // calculate numbers of columns
                t.cols = Math.max(Math.floor((t.width + t.options.gapVertical) / t.localColumnWidth), 1);

            }

            t.colVert = [];
            c = t.cols;

            while (c--) {
                t.colVert.push(0);
            }
        },

        /**
         * Make this plugin responsive
         */
        _responsiveLayout: function() {
            var t = this,
                widthWithoutGap,
                itemWidth;

            if (!t.columnWidthCache) {
                t.columnWidthCache = t.localColumnWidth;
            } else {
                t.localColumnWidth = t.columnWidthCache;
            }

            // calculate numbers of cols
            t.cols = t[t.getColumnsType]();

            // calculate the with of items without the gaps between them
            widthWithoutGap = t.width - t.options.gapVertical * (t.cols - 1);

            // calculate column with based on widthWithoutGap plus the gap
            t.localColumnWidth = parseInt(widthWithoutGap / t.cols, 10) + t.options.gapVertical;

            itemWidth = (t.localColumnWidth - t.options.gapVertical);

            t.blocks.each(function(index, item) {
                item.style.width = itemWidth + 'px';

                $(item).data('cbp').width = itemWidth;
            });

            t.blocks.each(function(index, el) {
                var item = $(el);

                item.data('cbp').height = item.outerHeight();
            });

        },


        /**
         * Get numbers of columns when t.options.mediaQueries is not an array
         */
        _getColumnsAuto: function() {
            var t = this;
            return Math.max(Math.round(t.width / t.localColumnWidth), 1);
        },

        /**
         * Get numbers of columns where t.options.mediaQueries is an array
         */
        _getColumnsBreakpoints: function() {
            var t = this,
                gridWidth = t.width - t.options.gapVertical,
                cols;

            $.each(t.options.mediaQueries, function(index, val) {
                if (gridWidth >= val.width) {
                    cols = val.cols;
                    return false;
                }
            });

            if (cols === undefined) {
                cols = t.options.mediaQueries[t.options.mediaQueries.length - 1].cols;
            }

            return cols;
        },


        /**
         * Resize main container vertically
         */
        _resizeMainContainer: function() {
            var t = this,
                cols = t.sliderColVert || t.colVert,
                height;

            // set container height for `overflow: hidden` to be applied
            height = Math.max(Math.max.apply(Math, cols) - t.options.gapHorizontal, 0);

            if (height === t.height) {
                return;
            }

            t.obj.style.height = height + 'px';

            // if _resizeMainContainer is called for the first time skip this event trigger
            if (t.height !== undefined) {
                if (CubePortfolio.Private.modernBrowser) {
                    t.$obj.one(CubePortfolio.Private.transitionend, function() {
                        t.$obj.trigger('pluginResize.cbp');
                    });
                } else {
                    t.$obj.trigger('pluginResize.cbp');
                }
            }

            t.height = height;
        },

        _filter: function(filterName) {
            var t = this;

            // blocks that are visible before applying the filter
            t.blocksOnInitial = t.blocksOn;

            // blocks visible after applying the filter
            t.blocksOn = t.blocks.filter(filterName);

            // blocks off after applying the filter
            t.blocksOff = t.blocks.not(filterName);

            // call layout
            t._layout();

            // filter call layout
            t.filterLayout(filterName);
        },


        /**
         *  Default filter layout if nothing overrides
         */
        filterLayout: function(filterName) {
            var t = this;

            t.blocksOff.addClass('cbp-item-off');

            t.blocksOn.removeClass('cbp-item-off')
                .each(function(index, el) {
                    var data = $(el).data('cbp');

                    data.left = data.leftNew;
                    data.top = data.topNew;

                    el.style.left = data.left + 'px';
                    el.style.top = data.top + 'px';
                });

            // resize main container height
            t._resizeMainContainer();

            t.filterFinish();
        },


        /**
         *  Trigger when a filter is finished
         */
        filterFinish: function() {
            var t = this;

            t.isAnimating = false;

            t.$obj.trigger('filterComplete.cbp');
            t._triggerEvent('filterFinish');
        },


        /**
         *  Register event
         */
        _registerEvent: function(name, callbackFunction, oneTime) {
            var t = this;

            if (!t.registeredEvents[name]) {
                t.registeredEvents[name] = [];
            }

            t.registeredEvents[name].push({
                func: callbackFunction,
                oneTime: oneTime || false
            });
        },


        /**
         *  Trigger event
         */
        _triggerEvent: function(name, param) {
            var t = this,
                i, len;

            if (t.skipEvents[name]) {
                delete t.skipEvents[name];
                return;
            }

            if (t.registeredEvents[name]) {
                for (i = 0, len = t.registeredEvents[name].length; i < len; i++) {

                    t.registeredEvents[name][i].func.call(t, param);

                    if (t.registeredEvents[name][i].oneTime) {
                        t.registeredEvents[name].splice(i, 1);
                        // function splice change the t.registeredEvents[name] array
                        // if event is one time you must set the i to the same value
                        // next time and set the length lower
                        i--;
                        len--;
                    }

                }
            }

        },


        /**
         *  Delay trigger event
         */
        _skipNextEvent: function(name) {
            var t = this;
            t.skipEvents[name] = true;
        },

        _addItems: function(els, callback) {
            var t = this,
                items = $(els)
                .filter('.cbp-item')
                .addClass('cbp-loading-fadeIn')
                .css('top', '1000%')
                .wrapInner('<div class="cbp-item-wrapper"></div>');

            if (!items.length) {
                t.isAnimating = false;

                if ($.isFunction(callback)) {
                    callback.call(t);
                }
                return;
            }

            t._load(items, function() {

                t.$obj.addClass('cbp-addItems');

                items.appendTo(t.$ul);

                // cache the new items to t.blocks
                $.merge(t.blocks, items);

                // push to data some values of items
                t.storeData(items);

                if (t.defaultFilter !== '*') {
                    t.blocksOn = t.blocks.filter(t.defaultFilter);
                    t.blocks.not(t.defaultFilter).addClass('cbp-item-off');
                } else {
                    t.blocksOn = t.blocks;
                }

                items.on(CubePortfolio.Private.animationend, function() {
                    t.$obj.find('.cbp-loading-fadeIn').removeClass('cbp-loading-fadeIn');
                    t.$obj.removeClass('cbp-addItems');
                });

                t._triggerEvent('addItemsToDOM', items);

                t._gridAdjust();

                t._layout();

                t.positionateItems();

                // resize main container height
                t._resizeMainContainer();

                if (t.options.layoutMode === 'slider') {
                    t._updateSlider();
                }

                // if show count was actived, call show count function again
                if (t.elems) {
                    CubePortfolio.Public.showCounter.call(t.obj, t.elems);
                }

                if (CubePortfolio.Private.modernBrowser) {
                    items.last().one(CubePortfolio.Private.animationend, function() {
                        t.isAnimating = false;

                        if ($.isFunction(callback)) {
                            callback.call(t);
                        }
                    });
                } else {
                    t.isAnimating = false;

                    if ($.isFunction(callback)) {
                        callback.call(t);
                    }
                }


            });

        }

    });


    /**
     * jQuery plugin initializer
     */
    $.fn.cubeportfolio = function(method, options, callback) {

        return this.each(function() {

            if (typeof method === 'object' || !method) {
                return CubePortfolio.Public.init.call(this, method, callback);
            } else if (CubePortfolio.Public[method]) {
                return CubePortfolio.Public[method].call(this, options, callback);
            }

            throw new Error('Method ' + method + ' does not exist on jquery.cubeportfolio.js');

        });

    };

    // Plugin default options
    $.fn.cubeportfolio.options = {
        /**
         *  Is used to define the wrapper for filters
         *  Values: strings that represent the elements in the document (DOM selector).
         */
        filters: '',

        /**
         *  Is used to define the wrapper for loadMore
         *  Values: strings that represent the elements in the document (DOM selector).
         */
        loadMore: '',

        /**
         *  How the loadMore functionality should behave. Load on click on the button or
         *  automatically when you scroll the page
         *  Values: - click
         *          - auto
         */
        loadMoreAction: 'click',

        /**
         *  Layout Mode for this instance
         *  Values: 'grid' or 'slider'
         */
        layoutMode: 'grid',

        /**
         *  Mouse and touch drag support
         *  Option available only for `layoutMode: 'slider'`
         *  Values: true or false
         */
        drag: true,

        /**
         *  Autoplay the slider
         *  Option available only for `layoutMode: 'slider'`
         *  Values: true or false
         */
        auto: false,

        /**
         *  Autoplay interval timeout. Time is set in milisecconds
         *  1000 milliseconds equals 1 second.
         *  Option available only for `layoutMode: 'slider'`
         *  Values: only integers (ex: 1000, 2000, 5000)
         */
        autoTimeout: 5000,

        /**
         *  Stops autoplay when user hover the slider
         *  Option available only for `layoutMode: 'slider'`
         *  Values: true or false
         */
        autoPauseOnHover: true,

        /**
         *  Show `next` and `prev` buttons for slider
         *  Option available only for `layoutMode: 'slider'`
         *  Values: true or false
         */
        showNavigation: true,

        /**
         *  Show pagination for slider
         *  Option available only for `layoutMode: 'slider'`
         *  Values: true or false
         */
        showPagination: true,

        /**
         *  Enable slide to first item (last item)
         *  Option available only for `layoutMode: 'slider'`
         *  Values: true or false
         */
        rewindNav: true,

        /**
         *  Scroll by page and not by item. This option affect next/prev buttons and drag support
         *  Option available only for `layoutMode: 'slider'`
         *  Values: true or false
         */
        scrollByPage: false,

        /**
         *  Default filter for plugin
         *  Option available only for `layoutMode: 'grid'`
         *  Values: strings that represent the filter name(ex: *, .logo, .web-design, .design)
         */
        defaultFilter: '*',

        /**
         *  Enable / disable the deeplinking feature when you click on filters
         *  Option available only for `layoutMode: 'grid'`
         *  Values: true or false
         */
        filterDeeplinking: false,

        /**
         *  Defines which animation to use for items that will be shown or hidden after a filter has been activated.
         *  Option available only for `layoutMode: 'grid'`
         *  The plugin use the best browser features available (css3 transitions and transform, GPU acceleration).
         *  Values: - fadeOut
         *          - quicksand
         *          - bounceLeft
         *          - bounceTop
         *          - bounceBottom
         *          - moveLeft
         *          - slideLeft
         *          - fadeOutTop
         *          - sequentially
         *          - skew
         *          - slideDelay
         *          - rotateSides
         *          - flipOutDelay
         *          - flipOut
         *          - unfold
         *          - foldLeft
         *          - scaleDown
         *          - scaleSides
         *          - frontRow
         *          - flipBottom
         *          - rotateRoom
         */
        animationType: 'fadeOut',

        /**
         *  Adjust the layout grid
         *  Values: - default (no adjustment applied)
         *          - alignCenter (align the grid on center of the page)
         *          - responsive (use a fluid grid to resize the grid)
         */
        gridAdjustment: 'responsive',

        /**
         * Define `media queries` for columns layout.
         * Format: [{width: a, cols: d}, {width: b, cols: e}, {width: c, cols: f}],
         * where a, b, c are the grid width and d, e, f are the columns displayed.
         * e.g. [{width: 1100, cols: 4}, {width: 800, cols: 3}, {width: 480, cols: 2}] means
         * if (gridWidth >= 1100) => show 4 columns,
         * if (gridWidth >= 800 && gridWidth < 1100) => show 3 columns,
         * if (gridWidth >= 480 && gridWidth < 800) => show 2 columns,
         * if (gridWidth < 480) => show 2 columns
         * Keep in mind that a > b > c
         * This option is available only when `gridAdjustment: 'responsive'`
         * Values:  - array of objects of format: [{width: a, cols: d}, {width: b, cols: e}]
         *          - you can define as many objects as you want
         *          - if this option is `false` Cube Portfolio will adjust the items
         *            width automatically (default option for backward compatibility)
         */
        mediaQueries: false,

        /**
         *  Horizontal gap between items
         *  Values: only integers (ex: 1, 5, 10)
         */
        gapHorizontal: 10,

        /**
         *  Vertical gap between items
         *  Values: only integers (ex: 1, 5, 10)
         */
        gapVertical: 10,

        /**
         *  Caption - the overlay that is shown when you put the mouse over an item
         *  NOTE: If you don't want to have captions set this option to an empty string ( caption: '')
         *  Values: - pushTop
         *          - pushDown
         *          - revealBottom
         *          - revealTop
         *          - moveRight
         *          - moveLeft
         *          - overlayBottomPush
         *          - overlayBottom
         *          - overlayBottomReveal
         *          - overlayBottomAlong
         *          - overlayRightAlong
         *          - minimal
         *          - fadeIn
         *          - zoom
         *          - opacity
         */
        caption: 'pushTop',

        /**
         *  The plugin will display his content based on the following values.
         *  Values: - default (the content will be displayed as soon as possible)
         *          - lazyLoading (the plugin will fully preload the images before displaying the items with a fadeIn effect)
         *          - fadeInToTop (the plugin will fully preload the images before displaying the items with a fadeIn effect from bottom to top)
         *          - sequentially (the plugin will fully preload the images before displaying the items with a sequentially effect)
         *          - bottomToTop (the plugin will fully preload the images before displaying the items with an animation from bottom to top)
         */
        displayType: 'lazyLoading',

        /**
         *  Defines the speed of displaying the items (when `displayType == default` this option will have no effect)
         *  Values: only integers, values in ms (ex: 200, 300, 500)
         */
        displayTypeSpeed: 400,

        /**
         *  This is used to define any clickable elements you wish to use to trigger lightbox popup on click.
         *  Values: strings that represent the elements in the document (DOM selector)
         */
        lightboxDelegate: '.cbp-lightbox',

        /**
         *  Enable / disable gallery mode
         *  Values: true or false
         */
        lightboxGallery: true,

        /**
         *  Attribute of the delegate item that contains caption for lightbox
         *  Values: html atributte
         */
        lightboxTitleSrc: 'data-title',

        /**
         *  Markup of the lightbox counter
         *  Values: html markup
         */
        lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',

        /**
         *  This is used to define any clickable elements you wish to use to trigger singlePage popup on click.
         *  Values: strings that represent the elements in the document (DOM selector)
         */
        singlePageDelegate: '.cbp-singlePage',

        /**
         *  Enable / disable the deeplinking feature for singlePage popup
         *  Values: true or false
         */
        singlePageDeeplinking: true,

        /**
         *  Enable / disable the sticky navigation for singlePage popup
         *  Values: true or false
         */
        singlePageStickyNavigation: true,

        /**
         *  Markup of the singlePage counter
         *  Values: html markup
         */
        singlePageCounter: '<div class="cbp-popup-singlePage-counter">{{current}} of {{total}}</div>',

        /**
         *  Defines which animation to use when singlePage appear
         *  Values: - left
         *          - fade
         *          - right
         */
        singlePageAnimation: 'left',

        /**
         *  Use this callback to update singlePage content.
         *  The callback will trigger after the singlePage popup will open.
         *  @param url = the href attribute of the item clicked
         *  @param element = the item clicked
         *  Values: function
         */
        singlePageCallback: function(url, element) {
            // to update singlePage content use the following method: this.updateSinglePage(yourContent)
        },

        /**
         *  This is used to define any clickable elements you wish to use to trigger singlePage Inline on click.
         *  Values: strings that represent the elements in the document (DOM selector)
         */
        singlePageInlineDelegate: '.cbp-singlePageInline',

        /**
         *  This is used to define the position of singlePage Inline block
         *  Values: - above ( above current element )
         *          - below ( below current elemnet)
         *          - top ( positon top )
         *          - bottom ( positon bottom )
         */
        singlePageInlinePosition: 'top',

        /**
         *  Push the open panel in focus and at close go back to the former stage
         *  Values: true or false
         */
        singlePageInlineInFocus: true,

        /**
         *  Use this callback to update singlePage Inline content.
         *  The callback will trigger after the singlePage Inline will open.
         *  @param url = the href attribute of the item clicked
         *  @param element = the item clicked
         *  Values: function
         */
        singlePageInlineCallback: function(url, element) {
            // to update singlePage Inline content use the following method: this.updateSinglePageInline(yourContent)
        }

    };

    CubePortfolio.Plugins = {};
    $.fn.cubeportfolio.Constructor = CubePortfolio;

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    function Filters(parent) {
        var t = this;

        t.parent = parent;

        t.filters = $(parent.options.filters);

        t.wrap = $();

        t.registerFilter();

    }

    Filters.prototype.registerFilter = function() {
        var t = this,
            parent = t.parent,
            filtersCallback;

        t.filters.each(function(index, el) {
            var filter = $(el),
                wrap;

            if (filter.hasClass('cbp-l-filters-dropdown')) {
                wrap = filter.find('.cbp-l-filters-dropdownWrap');

                wrap.on({
                    'mouseover.cbp': function() {
                        wrap.addClass('cbp-l-filters-dropdownWrap-open');
                    },
                    'mouseleave.cbp': function() {
                        wrap.removeClass('cbp-l-filters-dropdownWrap-open');
                    }
                });

                filtersCallback = function(me) {
                    wrap.find('.cbp-filter-item').removeClass('cbp-filter-item-active');
                    wrap.find('.cbp-l-filters-dropdownHeader').text(me.text());
                    me.addClass('cbp-filter-item-active');
                    wrap.trigger('mouseleave.cbp');
                };

                t.wrap.add(wrap);

            } else {
                filtersCallback = function(me) {
                    me.addClass('cbp-filter-item-active').siblings().removeClass('cbp-filter-item-active');
                };
            }

            filtersCallback(
                filter
                .find('.cbp-filter-item')
                .filter('[data-filter="' + parent.defaultFilter + '"]')
            );

            filter.on('click.cbp', '.cbp-filter-item', function() {
                var me = $(this);

                if (me.hasClass('cbp-filter-item-active')) {
                    return;
                }

                // get cubeportfolio data and check if is still animating (reposition) the items.
                if (!parent.isAnimating) {
                    filtersCallback.call(null, me);
                }

                // filter the items
                parent.$obj.cubeportfolio('filter', me.data('filter'));
            });

            // activate counter for filters
            parent.$obj.cubeportfolio('showCounter', filter.find('.cbp-filter-item'), function() {
                // read from url and change filter active
                var match = /#cbpf=(.*?)([#|?&]|$)/gi.exec(location.href),
                    item;
                if (match !== null) {
                    item = filter.find('.cbp-filter-item').filter('[data-filter="' + match[1] + '"]');
                    if (item.length) {
                        filtersCallback.call(null, item);
                    }
                }
            });
        });
    };

    Filters.prototype.destroy = function() {
        var t = this;

        t.filters.off('.cbp');
        if (t.wrap) {
            t.wrap.off('.cbp');
        }
    };

    CubePortfolio.Plugins.Filters = function(parent) {

        if (parent.options.filters === '') {
            return null;
        }

        return new Filters(parent);
    };

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    function LoadMore(parent) {
        var t = this;

        t.parent = parent;

        t.loadMore = $(parent.options.loadMore).find('.cbp-l-loadMore-link');

        // load click or auto action
        if (parent.options.loadMoreAction.length) {
            t[parent.options.loadMoreAction]();
        }

    }

    LoadMore.prototype.click = function() {
        var t = this,
            numberOfClicks = 0;

        t.loadMore.on('click.cbp', function(e) {
            var item = $(this);

            e.preventDefault();

            if (item.hasClass('cbp-l-loadMore-stop')) {
                return;
            }

            // set loading status
            item.addClass('cbp-l-loadMore-loading');

            numberOfClicks++;

            // perform ajax request
            $.ajax({
                url: t.loadMore.attr('href'),
                type: 'GET',
                dataType: 'HTML'
            }).done(function(result) {
                var items, itemsNext;

                // find current container
                items = $(result).filter(function() {
                    return $(this).is('div' + '.cbp-loadMore-block' + numberOfClicks);
                });

                t.parent.$obj.cubeportfolio('appendItems', items.html(), function() {

                    // put the original message back
                    item.removeClass('cbp-l-loadMore-loading');

                    // check if we have more works
                    itemsNext = $(result).filter(function() {
                        return $(this).is('div' + '.cbp-loadMore-block' + (numberOfClicks + 1));
                    });

                    if (itemsNext.length === 0) {
                        item.addClass('cbp-l-loadMore-stop');
                    }
                });

            }).fail(function() {
                // error
            });

        });
    };


    LoadMore.prototype.auto = function() {
        var t = this;

        t.parent.$obj.on('initComplete.cbp', function() {
            Object.create({
                init: function() {
                    var self = this;

                    // the job inactive
                    self.isActive = false;

                    self.numberOfClicks = 0;

                    // set loading status
                    t.loadMore.addClass('cbp-l-loadMore-loading');

                    // cache window selector
                    self.window = $(window);

                    // add events for scroll
                    self.addEvents();

                    // trigger method on init
                    self.getNewItems();
                },

                addEvents: function() {
                    var self = this,
                        timeout;

                    t.loadMore.on('click.cbp', function(e) {
                        e.preventDefault();
                    });

                    self.window.on('scroll.loadMoreObject', function() {

                        clearTimeout(timeout);

                        timeout = setTimeout(function() {
                            if (!t.parent.isAnimating) {
                                // get new items on scroll
                                self.getNewItems();
                            }
                        }, 80);

                    });

                    // when the filter is completed
                    t.parent.$obj.on('filterComplete.cbp', function() {
                        self.getNewItems();
                    });
                },

                getNewItems: function() {
                    var self = this,
                        topLoadMore, topWindow;

                    if (self.isActive || t.loadMore.hasClass('cbp-l-loadMore-stop')) {
                        return;
                    }

                    topLoadMore = t.loadMore.offset().top;
                    topWindow = self.window.scrollTop() + self.window.height();

                    if (topLoadMore > topWindow) {
                        return;
                    }

                    // this job is now busy
                    self.isActive = true;

                    // increment number of clicks
                    self.numberOfClicks++;

                    // perform ajax request
                    $.ajax({
                            url: t.loadMore.attr('href'),
                            type: 'GET',
                            dataType: 'HTML',
                            cache: true
                        })
                        .done(function(result) {
                            var items, itemsNext;

                            // find current container
                            items = $(result).filter(function() {
                                return $(this).is('div' + '.cbp-loadMore-block' + self.numberOfClicks);
                            });

                            t.parent.$obj.cubeportfolio('appendItems', items.html(), function() {
                                // check if we have more works
                                itemsNext = $(result).filter(function() {
                                    return $(this).is('div' + '.cbp-loadMore-block' + (self.numberOfClicks + 1));
                                });

                                if (itemsNext.length === 0) {
                                    t.loadMore.addClass('cbp-l-loadMore-stop');

                                    // remove events
                                    self.window.off('scroll.loadMoreObject');
                                    t.parent.$obj.off('filterComplete.cbp');
                                } else {
                                    // make the job inactive
                                    self.isActive = false;

                                    self.window.trigger('scroll.loadMoreObject');
                                }
                            });
                        })
                        .fail(function() {
                            // make the job inactive
                            self.isActive = false;
                        });
                }
            }).init();
        });

    };


    LoadMore.prototype.destroy = function() {
        var t = this;

        t.loadMore.off('.cbp');

        $(window).off('scroll.loadMoreObject');
    };

    CubePortfolio.Plugins.LoadMore = function(parent) {

        if (parent.options.loadMore === '') {
            return null;
        }

        return new LoadMore(parent);
    };

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    var popup = {

        /**
         * init function for popup
         * @param cubeportfolio = cubeportfolio instance
         * @param type =  'lightbox' or 'singlePage'
         */
        init: function(cubeportfolio, type) {
            var t = this,
                currentBlock;

            // remember cubeportfolio instance
            t.cubeportfolio = cubeportfolio;

            // remember if this instance is for lightbox or for singlePage
            t.type = type;

            // remember if the popup is open or not
            t.isOpen = false;

            t.options = t.cubeportfolio.options;

            if (type === 'lightbox') {
                t.cubeportfolio._registerEvent('resizeWindow', function() {
                    t.resizeImage();
                });
            }

            if (type === 'singlePageInline') {

                t.startInline = -1;

                t.height = 0;

                // create markup, css and add events for SinglePageInline
                t._createMarkupSinglePageInline();

                t.cubeportfolio._registerEvent('resizeGrid', function() {
                    if (t.isOpen) {
                        // @todo must add support for this features in the future
                        t.close(); // workaround
                    }
                });

                return;
            }

            // create markup, css and add events for lightbox and singlePage
            t._createMarkup();

            if (type === 'singlePage') {

                t.cubeportfolio._registerEvent('resizeWindow', function() {
                    if (t.options.singlePageStickyNavigation) {

                        var width = t.wrap[0].clientWidth;

                        if (width > 0) {
                            t.navigationWrap.width(width);

                            // set navigation width='window width' to center the divs
                            t.navigation.width(width);
                        }

                    }
                });

                if (t.options.singlePageDeeplinking) {
                    t.url = location.href;

                    if (t.url.slice(-1) === '#') {
                        t.url = t.url.slice(0, -1);
                    }

                    var links = t.url.split('#cbp=');
                    var url = links.shift(); // remove first item

                    $.each(links, function(index, link) {

                        t.cubeportfolio.blocksOn.each(function(index1, el) {
                            var singlePage = $(el).find(t.options.singlePageDelegate + '[href="' + link + '"]');

                            if (singlePage.length) {
                                currentBlock = singlePage;
                                return false;
                            }

                        });

                        if (currentBlock) {
                            return false;
                        }

                    });

                    if (currentBlock) {

                        t.url = url;

                        var self = currentBlock,
                            gallery = self.attr('data-cbp-singlePage'),
                            blocks = [];

                        if (gallery) {
                            blocks = self.closest($('.cbp-item')).find('[data-cbp-singlePage="' + gallery + '"]');
                        } else {
                            t.cubeportfolio.blocksOn.each(function(index, el) {
                                var item = $(el);

                                if (item.not('.cbp-item-off')) {
                                    item.find(t.options.singlePageDelegate).each(function(index2, el2) {
                                        if (!$(el2).attr('data-cbp-singlePage')) {
                                            blocks.push(el2);
                                        }
                                    });
                                }
                            });
                        }

                        t.openSinglePage(blocks, currentBlock[0]);

                    } else if (links.length) { // @todo - hack to load items from loadMore
                        var fakeLink = document.createElement('a');
                        fakeLink.setAttribute('href', links[0]);
                        t.openSinglePage([fakeLink], fakeLink);
                    }

                }
            }

        },

        /**
         * Create markup, css and add events
         */
        _createMarkup: function() {
            var t = this,
                animationCls = '';

            if (t.type === 'singlePage') {
                if (t.options.singlePageAnimation !== 'left') {
                    animationCls = ' cbp-popup-singlePage-' + t.options.singlePageAnimation;
                }
            }

            // wrap element
            t.wrap = $('<div/>', {
                'class': 'cbp-popup-wrap cbp-popup-' + t.type + animationCls,
                'data-action': (t.type === 'lightbox') ? 'close' : ''
            }).on('click.cbp', function(e) {
                if (t.stopEvents) {
                    return;
                }

                var action = $(e.target).attr('data-action');

                if (t[action]) {
                    t[action]();
                    e.preventDefault();
                }
            });

            // content element
            t.content = $('<div/>', {
                'class': 'cbp-popup-content'
            }).appendTo(t.wrap);

            // append loading div
            $('<div/>', {
                'class': 'cbp-popup-loadingBox'
            }).appendTo(t.wrap);

            // add background only for ie8
            if (CubePortfolio.Private.browser === 'ie8') {
                t.bg = $('<div/>', {
                    'class': 'cbp-popup-ie8bg',
                    'data-action': (t.type === 'lightbox') ? 'close' : ''
                }).appendTo(t.wrap);
            }

            // create navigation wrap
            t.navigationWrap = $('<div/>', {
                'class': 'cbp-popup-navigation-wrap'
            }).appendTo(t.wrap);

            // create navigation block
            t.navigation = $('<div/>', {
                'class': 'cbp-popup-navigation'
            }).appendTo(t.navigationWrap);

            // close
            t.closeButton = $('<div/>', {
                'class': 'cbp-popup-close',
                'title': 'Close (Esc arrow key)',
                'data-action': 'close'
            }).appendTo(t.navigation);

            // next
            t.nextButton = $('<div/>', {
                'class': 'cbp-popup-next',
                'title': 'Next (Right arrow key)',
                'data-action': 'next'
            }).appendTo(t.navigation);


            // prev
            t.prevButton = $('<div/>', {
                'class': 'cbp-popup-prev',
                'title': 'Previous (Left arrow key)',
                'data-action': 'prev'
            }).appendTo(t.navigation);


            if (t.type === 'singlePage') {

                if (t.options.singlePageCounter) {
                    // counter for singlePage
                    t.counter = $(t.options.singlePageCounter).appendTo(t.navigation);
                    t.counter.text('');
                }

                t.content.on('click.cbp', t.options.singlePageDelegate, function(e) {
                    e.preventDefault();
                    var i,
                        len = t.dataArray.length,
                        href = this.getAttribute('href');

                    for (i = 0; i < len; i++) {

                        if (t.dataArray[i].url === href) {
                            break;
                        }
                    }

                    t.singlePageJumpTo(i - t.current);

                });

                // if there are some events than overrides the default scroll behaviour don't go to them
                t.wrap.on('mousewheel.cbp' + ' DOMMouseScroll.cbp', function(e) {
                    e.stopImmediatePropagation();
                });

            }

            $(document).on('keydown.cbp', function(e) {

                // if is not open => return
                if (!t.isOpen) {
                    return;
                }

                // if all events are stopped => return
                if (t.stopEvents) {
                    return;
                }

                if (e.keyCode === 37) { // prev key
                    t.prev();
                } else if (e.keyCode === 39) { // next key
                    t.next();
                } else if (e.keyCode === 27) { //esc key
                    t.close();
                }
            });

        },

        _createMarkupSinglePageInline: function() {
            var t = this;

            // wrap element
            t.wrap = $('<div/>', {
                'class': 'cbp-popup-singlePageInline'
            }).on('click.cbp', function(e) {
                if (t.stopEvents) {
                    return;
                }

                var action = $(e.target).attr('data-action');

                if (action && t[action]) {
                    t[action]();
                    e.preventDefault();
                }
            });

            // content element
            t.content = $('<div/>', {
                'class': 'cbp-popup-content'
            }).appendTo(t.wrap);

            // append loading div
            // $('<div/>', {
            //     'class': 'cbp-popup-loadingBox'
            // }).appendTo(t.wrap);

            // create navigation block
            t.navigation = $('<div/>', {
                'class': 'cbp-popup-navigation'
            }).appendTo(t.wrap);

            // close
            t.closeButton = $('<div/>', {
                'class': 'cbp-popup-close',
                'title': 'Close (Esc arrow key)',
                'data-action': 'close'
            }).appendTo(t.navigation);

        },

        destroy: function() {
            var t = this,
                body = $('body');

            // remove off key down
            $(document).off('keydown.cbp');

            // external lightbox and singlePageInline
            body.off('click.cbp', t.options.lightboxDelegate);
            body.off('click.cbp', t.options.singlePageDelegate);

            t.content.off('click.cbp', t.options.singlePageDelegate);

            t.cubeportfolio.$obj.off('click.cbp', t.options.singlePageInlineDelegate);
            t.cubeportfolio.$obj.off('click.cbp', t.options.lightboxDelegate);
            t.cubeportfolio.$obj.off('click.cbp', t.options.singlePageDelegate);

            t.cubeportfolio.$obj.removeClass('cbp-popup-isOpening');

            t.cubeportfolio.$obj.find('.cbp-item').removeClass('cbp-singlePageInline-active');

            t.wrap.remove();
        },

        openLightbox: function(blocks, currentBlock) {
            var t = this,
                i = 0,
                currentBlockHref, tempHref = [],
                element;

            if (t.isOpen) {
                return;
            }

            // remember that the lightbox is open now
            t.isOpen = true;

            // remember to stop all events after the lightbox has been shown
            t.stopEvents = false;

            // array with elements
            t.dataArray = [];

            // reset current
            t.current = null;

            currentBlockHref = currentBlock.getAttribute('href');
            if (currentBlockHref === null) {
                throw new Error('HEI! Your clicked element doesn\'t have a href attribute.');
            }

            $.each(blocks, function(index, item) {
                var href = item.getAttribute('href'),
                    src = href, // default if element is image
                    type = 'isImage', // default if element is image
                    videoLink;

                if ($.inArray(href, tempHref) === -1) {

                    if (currentBlockHref === href) {
                        t.current = i;
                    } else if (!t.options.lightboxGallery) {
                        return;
                    }

                    if (/youtube/i.test(href)) {

                        videoLink = href.substring(href.lastIndexOf('v=') + 2);

                        if (!(/autoplay=/i.test(videoLink))) {
                            videoLink += '&autoplay=1';
                        }

                        videoLink = videoLink.replace(/\?|&/, '?');

                        // create new href
                        src = '//www.youtube.com/embed/' + videoLink;

                        type = 'isYoutube';

                    } else if (/vimeo/i.test(href)) {

                        videoLink = href.substring(href.lastIndexOf('/') + 1);

                        if (!(/autoplay=/i.test(videoLink))) {
                            videoLink += '&autoplay=1';
                        }

                        videoLink = videoLink.replace(/\?|&/, '?');

                        // create new href
                        src = '//player.vimeo.com/video/' + videoLink;

                        type = 'isVimeo';

                    } else if (/ted\.com/i.test(href)) {

                        // create new href
                        src = 'http://embed.ted.com/talks/' + href.substring(href.lastIndexOf('/') + 1) + '.html';

                        type = 'isTed';

                    } else if (/soundcloud\.com/i.test(href)) {

                        // create new href
                        src = href;

                        type = 'isSoundCloud';

                    } else if (/(\.mp4)|(\.ogg)|(\.ogv)|(\.webm)/i.test(href)) {

                        if (href.indexOf('|') !== -1) {
                            // create new href
                            src = href.split('|');
                        } else {
                            // create new href
                            src = href.split('%7C');
                        }

                        type = 'isSelfHostedVideo';

                    } else if (/\.mp3$/i.test(href)) {
                        src = href;
                        type = 'isSelfHostedAudio';
                    }

                    t.dataArray.push({
                        src: src,
                        title: item.getAttribute(t.options.lightboxTitleSrc),
                        type: type
                    });

                    i++;
                }

                tempHref.push(href);
            });


            // total numbers of elements
            t.counterTotal = t.dataArray.length;

            if (t.counterTotal === 1) {
                t.nextButton.hide();
                t.prevButton.hide();
                t.dataActionImg = '';
            } else {
                t.nextButton.show();
                t.prevButton.show();
                t.dataActionImg = 'data-action="next"';
            }

            // append to body
            t.wrap.appendTo(document.body);

            t.scrollTop = $(window).scrollTop();

            t.originalStyle = $('html').attr('style');

            $('html').css({
                overflow: 'hidden',
                paddingRight: window.innerWidth - $(document).width()
            });

            // show the wrapper (lightbox box)
            t.wrap.show();

            // get the current element
            element = t.dataArray[t.current];

            // call function if current element is image or video (iframe)
            t[element.type](element);

        },

        openSinglePage: function(blocks, currentBlock) {
            var t = this,
                i = 0,
                currentBlockHref, tempHref = [];

            if (t.isOpen) {
                return;
            }

            // check singlePageInline and close it
            if (t.cubeportfolio.singlePageInline && t.cubeportfolio.singlePageInline.isOpen) {
                t.cubeportfolio.singlePageInline.close();
            }

            // remember that the lightbox is open now
            t.isOpen = true;

            // remember to stop all events after the popup has been showing
            t.stopEvents = false;

            // array with elements
            t.dataArray = [];

            // reset current
            t.current = null;

            currentBlockHref = currentBlock.getAttribute('href');
            if (currentBlockHref === null) {
                throw new Error('HEI! Your clicked element doesn\'t have a href attribute.');
            }


            $.each(blocks, function(index, item) {
                var href = item.getAttribute('href');

                if ($.inArray(href, tempHref) === -1) {

                    if (currentBlockHref === href) {
                        t.current = i;
                    }

                    t.dataArray.push({
                        url: href,
                        element: item
                    });

                    i++;
                }

                tempHref.push(href);
            });

            // total numbers of elements
            t.counterTotal = t.dataArray.length;

            if (t.counterTotal === 1) {
                t.nextButton.hide();
                t.prevButton.hide();
            } else {
                t.nextButton.show();
                t.prevButton.show();
            }

            // append to body
            t.wrap.appendTo(document.body);

            t.scrollTop = $(window).scrollTop();

            $('html').css({
                overflow: 'hidden',
                paddingRight: window.innerWidth - $(document).width()
            });

            // go to top of the page (reset scroll)
            t.wrap.scrollTop(0);

            // show the wrapper
            t.wrap.show();

            // finish the open animation
            t.finishOpen = 2;

            // if transitionend is not fulfilled
            t.navigationMobile = $();
            t.wrap.one(CubePortfolio.Private.transitionend, function() {
                var width;

                // make the navigation sticky
                if (t.options.singlePageStickyNavigation) {

                    t.wrap.addClass('cbp-popup-singlePage-sticky');

                    width = t.wrap[0].clientWidth;
                    t.navigationWrap.width(width);

                    if (CubePortfolio.Private.browser === 'android' || CubePortfolio.Private.browser === 'ios') {
                        // wrap element
                        t.navigationMobile = $('<div/>', {
                            'class': 'cbp-popup-singlePage cbp-popup-singlePage-sticky',
                            'id': t.wrap.attr('id')
                        }).on('click.cbp', function(e) {
                            if (t.stopEvents) {
                                return;
                            }

                            var action = $(e.target).attr('data-action');

                            if (t[action]) {
                                t[action]();
                                e.preventDefault();
                            }
                        });

                        t.navigationMobile.appendTo(document.body).append(t.navigationWrap);
                    }

                }

                t.finishOpen--;
                if (t.finishOpen <= 0) {
                    t.updateSinglePageIsOpen.call(t);
                }

            });

            if (CubePortfolio.Private.browser === 'ie8' || CubePortfolio.Private.browser === 'ie9') {

                // make the navigation sticky
                if (t.options.singlePageStickyNavigation) {
                    var width = t.wrap[0].clientWidth;

                    t.navigationWrap.width(width);

                    setTimeout(function() {
                        t.wrap.addClass('cbp-popup-singlePage-sticky');
                    }, 1000);

                }

                t.finishOpen--;
            }

            t.wrap.addClass('cbp-popup-loading');

            // force reflow and then add class
            t.wrap.offset();
            t.wrap.addClass('cbp-popup-singlePage-open');

            // change link
            if (t.options.singlePageDeeplinking) {
                // ignore old #cbp from href
                t.url = t.url.split('#cbp=')[0];
                location.href = t.url + '#cbp=' + t.dataArray[t.current].url;
            }

            // run callback function
            if ($.isFunction(t.options.singlePageCallback)) {
                t.options.singlePageCallback.call(t, t.dataArray[t.current].url, t.dataArray[t.current].element);
            }

        },


        openSinglePageInline: function(blocks, currentBlock, fromOpen) {
            var t = this,
                start = 0,
                currentBlockHref,
                tempCurrent,
                cbpitem,
                parentElement;

            fromOpen = fromOpen || false;

            t.fromOpen = fromOpen;

            t.storeBlocks = blocks;
            t.storeCurrentBlock = currentBlock;

            // check singlePageInline and close it
            if (t.isOpen) {

                tempCurrent = $(currentBlock).closest('.cbp-item').index();

                if ((t.dataArray[t.current].url !== currentBlock.getAttribute('href')) || (t.current !== tempCurrent)) {
                    t.cubeportfolio.singlePageInline.close('open', {
                        blocks: blocks,
                        currentBlock: currentBlock,
                        fromOpen: true
                    });

                } else {
                    t.close();
                }

                return;
            }

            // remember that the lightbox is open now
            t.isOpen = true;

            // remember to stop all events after the popup has been showing
            t.stopEvents = false;

            // array with elements
            t.dataArray = [];

            // reset current
            t.current = null;

            currentBlockHref = currentBlock.getAttribute('href');
            if (currentBlockHref === null) {
                throw new Error('HEI! Your clicked element doesn\'t have a href attribute.');
            }

            cbpitem = $(currentBlock).closest('.cbp-item')[0];

            blocks.each(function(index, el) {
                if (cbpitem === el) {
                    t.current = index;
                }
            });

            t.dataArray[t.current] = {
                url: currentBlockHref,
                element: currentBlock
            };

            parentElement = $(t.dataArray[t.current].element).parents('.cbp-item').addClass('cbp-singlePageInline-active');

            // total numbers of elements
            t.counterTotal = blocks.length;

            t.wrap.insertBefore(t.cubeportfolio.wrapper);

            if (t.options.singlePageInlinePosition === 'top') {
                t.startInline = 0;
                t.top = 0;

                t.firstRow = true;
                t.lastRow = false;
            } else if (t.options.singlePageInlinePosition === 'bottom') {
                t.startInline = t.counterTotal;
                t.top = t.cubeportfolio.height;

                t.firstRow = false;
                t.lastRow = true;
            } else if (t.options.singlePageInlinePosition === 'above') {
                t.startInline = t.cubeportfolio.cols * Math.floor(t.current / t.cubeportfolio.cols);
                t.top = $(blocks[t.current]).data('cbp').top;

                if (t.startInline === 0) {
                    t.firstRow = true;
                } else {
                    t.top -= t.options.gapHorizontal;
                    t.firstRow = false;
                }

                t.lastRow = false;
            } else { // below
                t.top = $(blocks[t.current]).data('cbp').top + $(blocks[t.current]).data('cbp').height;
                t.startInline = Math.min(t.cubeportfolio.cols *
                    (Math.floor(t.current / t.cubeportfolio.cols) + 1),
                    t.counterTotal);

                t.firstRow = false;
                t.lastRow = (t.startInline === t.counterTotal) ? true : false;
            }

            t.wrap[0].style.height = t.wrap.outerHeight(true) + 'px';

            // debouncer for inline content
            t.deferredInline = $.Deferred();

            if (t.options.singlePageInlineInFocus) {

                t.scrollTop = $(window).scrollTop();

                var goToScroll = t.cubeportfolio.$obj.offset().top + t.top - 100;

                if (t.scrollTop !== goToScroll) {
                    $('html,body').animate({
                            scrollTop: goToScroll
                        }, 350)
                        .promise()
                        .then(function() {
                            t._resizeSinglePageInline();
                            t.deferredInline.resolve();
                        });
                } else {
                    t._resizeSinglePageInline();
                    t.deferredInline.resolve();
                }
            } else {
                t._resizeSinglePageInline();
                t.deferredInline.resolve();
            }

            t.cubeportfolio.$obj.addClass('cbp-popup-singlePageInline-open');

            t.wrap.css({
                top: t.top
            });

            // register callback function
            if ($.isFunction(t.options.singlePageInlineCallback)) {
                t.options.singlePageInlineCallback.call(t, t.dataArray[t.current].url, t.dataArray[t.current].element);
            }
        },

        _resizeSinglePageInline: function() {
            var t = this;

            t.height = (t.firstRow || t.lastRow) ? t.wrap.outerHeight(true) : t.wrap.outerHeight(true) - t.options.gapHorizontal;

            t.storeBlocks.each(function(index, el) {
                if (index < t.startInline) {
                    if (CubePortfolio.Private.modernBrowser) {
                        el.style[CubePortfolio.Private.transform] = '';
                    } else {
                        el.style.marginTop = '';
                    }
                } else {
                    if (CubePortfolio.Private.modernBrowser) {
                        el.style[CubePortfolio.Private.transform] = 'translate3d(0px, ' + t.height + 'px, 0)';
                    } else {
                        el.style.marginTop = t.height + 'px';
                    }
                }
            });

            t.cubeportfolio.obj.style.height = t.cubeportfolio.height + t.height + 'px';
        },

        _revertResizeSinglePageInline: function() {
            var t = this;

            // reset deferred object
            t.deferredInline = $.Deferred();

            t.storeBlocks.each(function(index, el) {
                if (CubePortfolio.Private.modernBrowser) {
                    el.style[CubePortfolio.Private.transform] = '';
                } else {
                    el.style.marginTop = '';
                }
            });

            t.cubeportfolio.obj.style.height = t.cubeportfolio.height + 'px';
        },

        appendScriptsToWrap: function(scripts) {
            var t = this,
                index = 0,
                loadScripts = function(item) {
                    var script = document.createElement('script'),
                        src = item.src;

                    script.type = 'text/javascript';

                    if (script.readyState) { // ie
                        script.onreadystatechange = function() {
                            if (script.readyState == 'loaded' || script.readyState == 'complete') {
                                script.onreadystatechange = null;
                                index++;
                                if (scripts[index]) {
                                    loadScripts(scripts[index]);
                                }
                            }
                        };
                    } else {
                        script.onload = function() {
                            index++;
                            if (scripts[index]) {
                                loadScripts(scripts[index]);
                            }
                        };
                    }

                    if (src) {
                        script.src = src;
                    } else {
                        script.text = item.text;
                    }

                    t.content[0].appendChild(script);

                };

            loadScripts(scripts[0]);
        },

        updateSinglePage: function(html, scripts, isWrap) {
            var t = this,
                counterMarkup,
                animationFinish;

            t.content.addClass('cbp-popup-content').removeClass('cbp-popup-content-basic');

            if (isWrap === false) {
                t.content.removeClass('cbp-popup-content').addClass('cbp-popup-content-basic');
            }

            // update counter navigation
            if (t.counter) {
                counterMarkup = $(t._getCounterMarkup(t.options.singlePageCounter, t.current + 1, t.counterTotal));
                t.counter.text(counterMarkup.text());
            }

            t.content.html(html);

            if (scripts) {
                t.appendScriptsToWrap(scripts);
            }

            // trigger public event
            t.cubeportfolio.$obj.trigger('updateSinglePageStart.cbp');

            t.finishOpen--;

            if (t.finishOpen <= 0) {
                t.updateSinglePageIsOpen.call(t);
            }
        },

        updateSinglePageIsOpen: function() {
            var t = this,
                selectorSlider;

            t.wrap.addClass('cbp-popup-ready');
            t.wrap.removeClass('cbp-popup-loading');

            // instantiate slider if exists
            selectorSlider = t.content.find('.cbp-slider');
            if (selectorSlider) {
                selectorSlider.find('.cbp-slider-item').addClass('cbp-item');
                t.slider = selectorSlider.cubeportfolio({
                    layoutMode: 'slider',
                    mediaQueries: [{
                        width: 1,
                        cols: 1
                    }],
                    gapHorizontal: 0,
                    gapVertical: 0,
                    caption: '',
                    coverRatio: '', // wp version only
                });
            } else {
                t.slider = null;
            }

            // scroll bug on android and ios
            if (CubePortfolio.Private.browser === 'android' || CubePortfolio.Private.browser === 'ios') {
                $('html').css({
                    position: 'fixed'
                });
            }

            // trigger public event
            t.cubeportfolio.$obj.trigger('updateSinglePageComplete.cbp');

        },


        updateSinglePageInline: function(html, scripts) {
            var t = this;

            t.content.html(html);

            if (scripts) {
                t.appendScriptsToWrap(scripts);
            }
            // trigger public event
            t.cubeportfolio.$obj.trigger('updateSinglePageInlineStart.cbp');

            t.singlePageInlineIsOpen.call(t);

        },

        singlePageInlineIsOpen: function() {
            var t = this;

            function finishLoading() {
                t.wrap.addClass('cbp-popup-singlePageInline-ready');
                t.wrap[0].style.height = '';

                t._resizeSinglePageInline();

                // trigger public event
                t.cubeportfolio.$obj.trigger('updateSinglePageInlineComplete.cbp');
            }

            // wait to load all images
            t.cubeportfolio._load(t.wrap, function() {


                // instantiate slider if exists
                var selectorSlider = t.content.find('.cbp-slider');

                if (selectorSlider.length) {
                    selectorSlider.find('.cbp-slider-item').addClass('cbp-item');

                    selectorSlider.one('initComplete.cbp', function() {
                        t.deferredInline.done(finishLoading);
                    });

                    selectorSlider.on('pluginResize.cbp', function() {
                        t.deferredInline.done(finishLoading);
                    });

                    t.slider = selectorSlider.cubeportfolio({
                        layoutMode: 'slider',
                        displayType: 'default',
                        mediaQueries: [{
                            width: 1,
                            cols: 1
                        }],
                        gapHorizontal: 0,
                        gapVertical: 0,
                        caption: '',
                        coverRatio: '', // wp version only
                    });
                } else {
                    t.slider = null;
                    t.deferredInline.done(finishLoading);
                }

            });

        },


        isImage: function(el) {
            var t = this,
                img = new Image();

            t.tooggleLoading(true);

            if ($('<img src="' + el.src + '">').is('img:uncached')) {

                $(img).on('load.cbp' + ' error.cbp', function() {

                    t.updateImagesMarkup(el.src, el.title, t._getCounterMarkup(t.options.lightboxCounter, t.current + 1, t.counterTotal));

                    t.tooggleLoading(false);

                });
                img.src = el.src;

            } else {

                t.updateImagesMarkup(el.src, el.title, t._getCounterMarkup(t.options.lightboxCounter, t.current + 1, t.counterTotal));

                t.tooggleLoading(false);
            }
        },

        isVimeo: function(el) {
            var t = this;

            t.updateVideoMarkup(el.src, el.title, t._getCounterMarkup(t.options.lightboxCounter, t.current + 1, t.counterTotal));
        },

        isYoutube: function(el) {
            var t = this;
            t.updateVideoMarkup(el.src, el.title, t._getCounterMarkup(t.options.lightboxCounter, t.current + 1, t.counterTotal));

        },

        isTed: function(el) {
            var t = this;
            t.updateVideoMarkup(el.src, el.title, t._getCounterMarkup(t.options.lightboxCounter, t.current + 1, t.counterTotal));
        },

        isSoundCloud: function(el) {
            var t = this;
            t.updateVideoMarkup(el.src, el.title, t._getCounterMarkup(t.options.lightboxCounter, t.current + 1, t.counterTotal));
        },

        isSelfHostedVideo: function(el) {
            var t = this;
            t.updateSelfHostedVideo(el.src, el.title, t._getCounterMarkup(t.options.lightboxCounter, t.current + 1, t.counterTotal));
        },

        isSelfHostedAudio: function(el) {
            var t = this;
            t.updateSelfHostedAudio(el.src, el.title, t._getCounterMarkup(t.options.lightboxCounter, t.current + 1, t.counterTotal));
        },

        _getCounterMarkup: function(markup, current, total) {
            if (!markup.length) {
                return '';
            }

            var mapObj = {
                current: current,
                total: total
            };

            return markup.replace(/\{\{current}}|\{\{total}}/gi, function(matched) {
                return mapObj[matched.slice(2, -2)];
            });
        },

        updateSelfHostedVideo: function(src, title, counter) {
            var t = this,
                i;

            t.wrap.addClass('cbp-popup-lightbox-isIframe');

            var markup = '<div class="cbp-popup-lightbox-iframe">' +
                '<video controls="controls" height="auto" style="width: 100%">';

            for (i = 0; i < src.length; i++) {
                if (/(\.mp4)/i.test(src[i])) {
                    markup += '<source src="' + src[i] + '" type="video/mp4">';
                } else if (/(\.ogg)|(\.ogv)/i.test(src[i])) {
                    markup += '<source src="' + src[i] + '" type="video/ogg">';
                } else if (/(\.webm)/i.test(src[i])) {
                    markup += '<source src="' + src[i] + '" type="video/webm">';
                }
            }

            markup += 'Your browser does not support the video tag.' +
                '</video>' +
                '<div class="cbp-popup-lightbox-bottom">' +
                ((title) ? '<div class="cbp-popup-lightbox-title">' + title + '</div>' : '') +
                counter +
                '</div>' +
                '</div>';

            t.content.html(markup);

            t.wrap.addClass('cbp-popup-ready');

            t.preloadNearbyImages();
        },

        updateSelfHostedAudio: function(src, title, counter) {
            var t = this,
                i;

            t.wrap.addClass('cbp-popup-lightbox-isIframe');

            var markup = '<div class="cbp-popup-lightbox-iframe">' +
                '<audio controls="controls" height="auto" style="width: 100%">' +
                '<source src="' + src + '" type="audio/mpeg">' +
                'Your browser does not support the audio tag.' +
                '</audio>' +
                '<div class="cbp-popup-lightbox-bottom">' +
                ((title) ? '<div class="cbp-popup-lightbox-title">' + title + '</div>' : '') +
                counter +
                '</div>' +
                '</div>';

            t.content.html(markup);

            t.wrap.addClass('cbp-popup-ready');

            t.preloadNearbyImages();
        },

        updateVideoMarkup: function(src, title, counter) {
            var t = this;
            t.wrap.addClass('cbp-popup-lightbox-isIframe');

            var markup = '<div class="cbp-popup-lightbox-iframe">' +
                '<iframe src="' + src + '" frameborder="0" allowfullscreen scrolling="no"></iframe>' +
                '<div class="cbp-popup-lightbox-bottom">' +
                ((title) ? '<div class="cbp-popup-lightbox-title">' + title + '</div>' : '') +
                counter +
                '</div>' +
                '</div>';

            t.content.html(markup);
            t.wrap.addClass('cbp-popup-ready');
            t.preloadNearbyImages();
        },

        updateImagesMarkup: function(src, title, counter) {
            var t = this;

            t.wrap.removeClass('cbp-popup-lightbox-isIframe');

            var markup = '<div class="cbp-popup-lightbox-figure">' +
                '<img src="' + src + '" class="cbp-popup-lightbox-img" ' + t.dataActionImg + ' />' +
                '<div class="cbp-popup-lightbox-bottom">' +
                ((title) ? '<div class="cbp-popup-lightbox-title">' + title + '</div>' : '') +
                counter +
                '</div>' +
                '</div>';

            t.content.html(markup);

            t.wrap.addClass('cbp-popup-ready');

            t.resizeImage();

            t.preloadNearbyImages();
        },

        next: function() {
            var t = this;
            t[t.type + 'JumpTo'](1);
        },

        prev: function() {
            var t = this;
            t[t.type + 'JumpTo'](-1);
        },

        lightboxJumpTo: function(index) {
            var t = this,
                el;

            t.current = t.getIndex(t.current + index);

            // get the current element
            el = t.dataArray[t.current];

            // call function if current element is image or video (iframe)
            t[el.type](el);
        },


        singlePageJumpTo: function(index) {
            var t = this;

            t.current = t.getIndex(t.current + index);

            // register singlePageCallback function
            if ($.isFunction(t.options.singlePageCallback)) {
                t.resetWrap();

                // go to top of the page (reset scroll)
                t.wrap.scrollTop(0);

                t.wrap.addClass('cbp-popup-loading');
                t.options.singlePageCallback.call(t, t.dataArray[t.current].url, t.dataArray[t.current].element);

                if (t.options.singlePageDeeplinking) {
                    location.href = t.url + '#cbp=' + t.dataArray[t.current].url;
                }
            }
        },

        resetWrap: function() {
            var t = this;

            if (t.type === 'singlePage' && t.options.singlePageDeeplinking) {
                location.href = t.url + '#';
            }
        },

        getIndex: function(index) {
            var t = this;

            // go to interval [0, (+ or -)this.counterTotal.length - 1]
            index = index % t.counterTotal;

            // if index is less then 0 then go to interval (0, this.counterTotal - 1]
            if (index < 0) {
                index = t.counterTotal + index;
            }

            return index;
        },

        close: function(method, data) {
            var t = this;

            function finishClose() {
                // reset content
                t.content.html('');

                // hide the wrap
                t.wrap.detach();

                t.cubeportfolio.$obj.removeClass('cbp-popup-singlePageInline-open cbp-popup-singlePageInline-close');

                if (method === 'promise') {
                    if ($.isFunction(data.callback)) {
                        data.callback.call(t.cubeportfolio);
                    }
                }
            }

            function checkFocusInline() {
                if (t.options.singlePageInlineInFocus && method !== 'promise') {
                    $('html,body').animate({
                            scrollTop: t.scrollTop
                        }, 350)
                        .promise()
                        .then(function() {
                            finishClose();
                        });
                } else {
                    finishClose();
                }
            }

            // now the popup is closed
            t.isOpen = false;

            if (t.type === 'singlePageInline') {

                if (method === 'open') {

                    t.wrap.removeClass('cbp-popup-singlePageInline-ready');

                    $(t.dataArray[t.current].element).closest('.cbp-item').removeClass('cbp-singlePageInline-active');

                    t.openSinglePageInline(data.blocks, data.currentBlock, data.fromOpen);

                } else {

                    t.height = 0;

                    t._revertResizeSinglePageInline();

                    t.wrap.removeClass('cbp-popup-singlePageInline-ready');

                    t.cubeportfolio.$obj.addClass('cbp-popup-singlePageInline-close');

                    t.startInline = -1;

                    t.cubeportfolio.$obj.find('.cbp-item').removeClass('cbp-singlePageInline-active');

                    if (CubePortfolio.Private.modernBrowser) {
                        t.wrap.one(CubePortfolio.Private.transitionend, function() {
                            checkFocusInline();
                        });
                    } else {
                        checkFocusInline();
                    }
                }

            } else if (t.type === 'singlePage') {

                t.resetWrap();

                t.wrap.removeClass('cbp-popup-ready');

                // scroll bug on android and ios
                if (CubePortfolio.Private.browser === 'android' || CubePortfolio.Private.browser === 'ios') {
                    $('html').css({
                        position: ''
                    });

                    t.navigationWrap.appendTo(t.wrap);
                    t.navigationMobile.remove();
                }

                $(window).scrollTop(t.scrollTop);

                // weird bug on mozilla. fixed with setTimeout
                setTimeout(function() {
                    t.stopScroll = true;

                    t.navigationWrap.css({
                        top: t.wrap.scrollTop()
                    });

                    t.wrap.removeClass('cbp-popup-singlePage-open cbp-popup-singlePage-sticky');

                    if (CubePortfolio.Private.browser === 'ie8' || CubePortfolio.Private.browser === 'ie9') {
                        // reset content
                        t.content.html('');

                        // hide the wrap
                        t.wrap.detach();

                        $('html').css({
                            overflow: '',
                            paddingRight: '',
                            position: ''
                        });

                        t.navigationWrap.removeAttr('style');
                    }

                }, 0);

                t.wrap.one(CubePortfolio.Private.transitionend, function() {

                    // reset content
                    t.content.html('');

                    // hide the wrap
                    t.wrap.detach();

                    $('html').css({
                        overflow: '',
                        paddingRight: '',
                        position: ''
                    });

                    t.navigationWrap.removeAttr('style');

                });

            } else {

                if (t.originalStyle) {
                    $('html').attr('style', t.originalStyle);
                } else {
                    $('html').css({
                        overflow: '',
                        paddingRight: ''
                    });
                }

                $(window).scrollTop(t.scrollTop);

                // reset content
                t.content.html('');

                // hide the wrap
                t.wrap.detach();

            }
        },

        tooggleLoading: function(state) {
            var t = this;

            t.stopEvents = state;
            t.wrap[(state) ? 'addClass' : 'removeClass']('cbp-popup-loading');
        },

        resizeImage: function() {
            // if lightbox is not open go out
            if (!this.isOpen) {
                return;
            }

            var height = $(window).height(),
                img = this.content.find('img'),
                padding = parseInt(img.css('margin-top'), 10) + parseInt(img.css('margin-bottom'), 10);

            img.css('max-height', (height - padding) + 'px');
        },

        preloadNearbyImages: function() {
            var arr = [],
                img, t = this,
                src;

            arr.push(t.getIndex(t.current + 1));
            arr.push(t.getIndex(t.current + 2));
            arr.push(t.getIndex(t.current + 3));
            arr.push(t.getIndex(t.current - 1));
            arr.push(t.getIndex(t.current - 2));
            arr.push(t.getIndex(t.current - 3));

            for (var i = arr.length - 1; i >= 0; i--) {
                if (t.dataArray[arr[i]].type === 'isImage') {
                    src = t.dataArray[arr[i]].src;
                    img = new Image();

                    if ($('<img src="' + src + '">').is('img:uncached')) {
                        img.src = src;
                    }
                }
            }
        }

    };


    function PopUp(parent) {
        var t = this;

        t.parent = parent;

        // if lightboxShowCounter is false, put lightboxCounter to ''
        if (parent.options.lightboxShowCounter === false) {
            parent.options.lightboxCounter = '';
        }

        // if singlePageShowCounter is false, put singlePageCounter to ''
        if (parent.options.singlePageShowCounter === false) {
            parent.options.singlePageCounter = '';
        }

        // @todo - schedule this in  future
        t.run();

    }

    var lightboxInit = false,
        singlePageInit = false;

    PopUp.prototype.run = function() {
        var t = this,
            p = t.parent,
            body = $(document.body);

        // default value for lightbox
        p.lightbox = null;

        // LIGHTBOX
        if (p.options.lightboxDelegate && !lightboxInit) {

            // init only one time @todo
            lightboxInit = true;

            p.lightbox = Object.create(popup);

            p.lightbox.init(p, 'lightbox');

            body.on('click.cbp', p.options.lightboxDelegate, function(e) {
                e.preventDefault();

                var self = $(this),
                    gallery = self.attr('data-cbp-lightbox'),
                    scope = t.detectScope(self),
                    cbp = scope.data('cubeportfolio'),
                    blocks = [];

                // is inside a cbp
                if (cbp) {

                    cbp.blocksOn.each(function(index, el) {
                        var item = $(el);

                        if (item.not('.cbp-item-off')) {
                            item.find(p.options.lightboxDelegate).each(function(index2, el2) {
                                if (gallery) {
                                    if ($(el2).attr('data-cbp-lightbox') === gallery) {
                                        blocks.push(el2);
                                    }
                                } else {
                                    blocks.push(el2);
                                }
                            });
                        }
                    });

                } else {

                    if (gallery) {
                        blocks = scope.find(p.options.lightboxDelegate + '[data-cbp-lightbox=' + gallery + ']');
                    } else {
                        blocks = scope.find(p.options.lightboxDelegate);
                    }
                }

                p.lightbox.openLightbox(blocks, self[0]);
            });
        }

        // default value for singlePage
        p.singlePage = null;

        // SINGLEPAGE
        if (p.options.singlePageDelegate && !singlePageInit) {

            // init only one time @todo
            singlePageInit = true;

            p.singlePage = Object.create(popup);

            p.singlePage.init(p, 'singlePage');

            body.on('click.cbp', p.options.singlePageDelegate, function(e) {
                e.preventDefault();

                var self = $(this),
                    gallery = self.attr('data-cbp-singlePage'),
                    scope = t.detectScope(self),
                    cbp = scope.data('cubeportfolio'),
                    blocks = [];

                // is inside a cbp
                if (cbp) {
                    cbp.blocksOn.each(function(index, el) {
                        var item = $(el);

                        if (item.not('.cbp-item-off')) {
                            item.find(p.options.singlePageDelegate).each(function(index2, el2) {
                                if (gallery) {
                                    if ($(el2).attr('data-cbp-singlePage') === gallery) {
                                        blocks.push(el2);
                                    }
                                } else {
                                    blocks.push(el2);
                                }
                            });
                        }
                    });

                } else {

                    if (gallery) {
                        blocks = scope.find(p.options.singlePageDelegate + '[data-cbp-singlePage=' + gallery + ']');
                    } else {
                        blocks = scope.find(p.options.singlePageDelegate);
                    }

                }

                p.singlePage.openSinglePage(blocks, self[0]);
            });
        }

        // default value for singlePageInline
        p.singlePageInline = null;

        // SINGLEPAGEINLINE
        if (p.options.singlePageDelegate) {

            p.singlePageInline = Object.create(popup);

            p.singlePageInline.init(p, 'singlePageInline');

            p.$obj.on('click.cbp', p.options.singlePageInlineDelegate, function(e) {
                e.preventDefault();
                p.singlePageInline.openSinglePageInline(p.blocksOn, this);
            });

        }
    };

    PopUp.prototype.detectScope = function(item) {
        var singlePageInline,
            singlePage,
            cbp;

        singlePageInline = item.closest('.cbp-popup-singlePageInline');
        if (singlePageInline.length) {
            cbp = item.closest('.cbp', singlePageInline[0]);
            return (cbp.length) ? cbp : singlePageInline;
        }

        singlePage = item.closest('.cbp-popup-singlePage');
        if (singlePage.length) {
            cbp = item.closest('.cbp', singlePage[0]);
            return (cbp.length) ? cbp : singlePage;
        }

        cbp = item.closest('.cbp');
        return (cbp.length) ? cbp : $(document.body);

    };

    PopUp.prototype.destroy = function() {
        var p = this.parent;

        $(document.body).off('click.cbp');

        // @todo - remove these from here
        lightboxInit = false;
        singlePageInit = false;

        // destroy lightbox if enabled
        if (p.lightbox) {
            p.lightbox.destroy();
        }

        // destroy singlePage if enabled
        if (p.singlePage) {
            p.singlePage.destroy();
        }

        // destroy singlePage inline if enabled
        if (p.singlePageInline) {
            p.singlePageInline.destroy();
        }
    };

    CubePortfolio.Plugins.PopUp = function(parent) {
        return new PopUp(parent);
    };

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    CubePortfolio.Private = {
        /**
         * Check if cubeportfolio instance exists on current element
         */
        checkInstance: function(method) {
            var t = $.data(this, 'cubeportfolio');

            if (!t) {
                throw new Error('cubeportfolio is not initialized. Initialize it before calling ' + method + ' method!');
            }

            return t;
        },

        /**
         * Get info about client browser
         */
        browserInfo: function() {
            var t = CubePortfolio.Private,
                appVersion = navigator.appVersion,
                transition, animation, perspective;

            if (appVersion.indexOf('MSIE 8.') !== -1) { // ie8
                t.browser = 'ie8';
            } else if (appVersion.indexOf('MSIE 9.') !== -1) { // ie9
                t.browser = 'ie9';
            } else if (appVersion.indexOf('MSIE 10.') !== -1) { // ie10
                t.browser = 'ie10';
            } else if (window.ActiveXObject || 'ActiveXObject' in window) { // ie11
                t.browser = 'ie11';
            } else if ((/android/gi).test(appVersion)) { // android
                t.browser = 'android';
            } else if ((/iphone|ipad|ipod/gi).test(appVersion)) { // ios
                t.browser = 'ios';
            } else if ((/chrome/gi).test(appVersion)) {
                t.browser = 'chrome';
            } else {
                t.browser = '';
            }

            // check if perspective is available
            perspective = t.styleSupport('perspective');

            // if perspective is not available => no modern browser
            if (typeof perspective === undefined) {
                return;
            }

            transition = t.styleSupport('transition');

            t.transitionend = {
                WebkitTransition: 'webkitTransitionEnd',
                transition: 'transitionend'
            }[transition];

            animation = t.styleSupport('animation');

            t.animationend = {
                WebkitAnimation: 'webkitAnimationEnd',
                animation: 'animationend'
            }[animation];

            t.animationDuration = {
                WebkitAnimation: 'webkitAnimationDuration',
                animation: 'animationDuration'
            }[animation];

            t.animationDelay = {
                WebkitAnimation: 'webkitAnimationDelay',
                animation: 'animationDelay'
            }[animation];

            t.transform = t.styleSupport('transform');

            if (transition && animation && t.transform) {
                t.modernBrowser = true;
            }

        },


        /**
         * Feature testing for css3
         */
        styleSupport: function(prop) {
            var supportedProp,
                // capitalize first character of the prop to test vendor prefix
                webkitProp = 'Webkit' + prop.charAt(0).toUpperCase() + prop.slice(1),
                div = document.createElement('div');

            // browser supports standard CSS property name
            if (prop in div.style) {
                supportedProp = prop;
            } else if (webkitProp in div.style) {
                supportedProp = webkitProp;
            }

            // avoid memory leak in IE
            div = null;

            return supportedProp;
        }

    };

    CubePortfolio.Private.browserInfo();

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    CubePortfolio.Public = {

        /*
         * Init the plugin
         */
        init: function(options, callback) {
            new CubePortfolio(this, options, callback);
        },

        /*
         * Destroy the plugin
         */
        destroy: function(callback) {
            var t = CubePortfolio.Private.checkInstance.call(this, 'destroy');

            t._triggerEvent('beforeDestroy');

            // remove data
            $.removeData(this, 'cubeportfolio');

            // remove data from blocks
            t.blocks.each(function() {
                $.removeData(this, 'cbp-wxh'); // wp only
            });

            // remove loading class and .cbp on container
            t.$obj.removeClass('cbp-ready cbp-addItems' + 'cbp-cols-' + t.cols).removeAttr('style');

            // remove class from ul
            t.$ul.removeClass('cbp-wrapper');

            // remove off resize event
            $(window).off('resize.cbp');

            t.$obj.off('.cbp');
            $(document).off('.cbp');

            // reset blocks
            t.blocks.removeClass('cbp-item-off').removeAttr('style');

            t.blocks.find('.cbp-item-wrapper').children().unwrap();

            if (t.options.caption) {
                t._captionDestroy();
            }

            t._destroySlider();

            // remove .cbp-wrapper-outer
            t.$ul.unwrap();

            // remove .cbp-wrapper
            if (t.addedWrapp) {
                t.blocks.unwrap();
            }

            $.each(t._plugins, function(i, item) {
                if (typeof item.destroy === 'function') {
                    item.destroy();
                }
            });

            if ($.isFunction(callback)) {
                callback.call(t);
            }

            t._triggerEvent('afterDestroy');
        },

        /*
         * Filter the plugin by filterName
         */
        filter: function(filterName, callback) {
            var t = CubePortfolio.Private.checkInstance.call(this, 'filter'),
                off2onBlocks, on2offBlocks, url;

            // register callback function
            if ($.isFunction(callback)) {
                t._registerEvent('filterFinish', callback, true);
            }

            if (t.isAnimating || t.defaultFilter === filterName) {
                return;
            }

            t.isAnimating = true;
            t.defaultFilter = filterName;

            if (t.singlePageInline && t.singlePageInline.isOpen) {
                t.singlePageInline.close('promise', {
                    callback: function() {
                        t._filter(filterName);
                    }
                });
            } else {
                t._filter(filterName);
            }

            if (t.options.filterDeeplinking) {

                url = location.href.replace(/#cbpf=(.*?)([#|?&]|$)/gi, '');

                location.href = url + '#cbpf=' + filterName;

                if (t.singlePage && t.singlePage.url) {
                    t.singlePage.url = location.href;
                }
            }
        },

        /*
         * Show counter for filters
         */
        showCounter: function(elems, callback) {
            var t = CubePortfolio.Private.checkInstance.call(this, 'showCounter');

            t.elems = elems;

            $.each(elems, function() {
                var el = $(this),
                    filterName = el.data('filter'),
                    count;

                count = t.blocks.filter(filterName).length;
                el.find('.cbp-filter-counter').text(count);
            });

            if ($.isFunction(callback)) {
                callback.call(t);
            }
        },

        /*
         * ApendItems elements
         */
        appendItems: function(items, callback) {
            var t = CubePortfolio.Private.checkInstance.call(this, 'appendItems');

            if (t.isAnimating) {
                return;
            }

            t.isAnimating = true;

            if (t.singlePageInline && t.singlePageInline.isOpen) {
                t.singlePageInline.close('promise', {
                    callback: function() {
                        t._addItems(items, callback);
                    }
                });
            } else {
                t._addItems(items, callback);
            }
        },

    };

})(jQuery, window, document);

// Utility
if (typeof Object.create !== 'function') {
    Object.create = function(obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

// jquery new filter for images uncached
jQuery.expr[':'].uncached = function(obj) {
    // Ensure we are dealing with an `img` element with a valid `src` attribute.
    if (!jQuery(obj).is('img[src][src!=""]')) {
        return false;
    }

    // Firefox's `complete` property will always be `true` even if the image has not been downloaded.
    // Doing it this way works in Firefox.
    var img = new Image();
    img.src = obj.src;

    // http://stackoverflow.com/questions/1977871/check-if-an-image-is-loaded-no-errors-in-javascript
    // During the onload event, IE correctly identifies any images that
    // weren�t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) {
        return true;
    }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.
    if (img.naturalWidth !== undefined && img.naturalWidth === 0) {
        return true;
    }

    // No other way of checking: assume it�s ok.
    return false;
};

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik M�ller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['moz', 'webkit'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    function AnimationClassic(parent) {
        var t = this;

        t.parent = parent;

        parent.filterLayout = t.filterLayout;
    }

    // here this value point to parent grid
    AnimationClassic.prototype.filterLayout = function(filterName) {
        var t = this;

        t.$obj.addClass('cbp-animation-' + t.options.animationType);

        // [1] - blocks that are only moving with translate
        t.blocksOnInitial
            .filter(filterName)
            .addClass('cbp-item-on2on')
            .each(function(index, el) {
                var data = $(el).data('cbp');
                el.style[CubePortfolio.Private.transform] = 'translate3d(' + (data.leftNew - data.left) + 'px, ' + (data.topNew - data.top) + 'px, 0)';
            });

        // [2] - blocks than intialy are on but after applying the filter are off
        t.blocksOn2Off = t.blocksOnInitial
            .not(filterName)
            .addClass('cbp-item-on2off');

        // [3] - blocks that are off and it will be on
        t.blocksOff2On = t.blocksOn
            .filter('.cbp-item-off')
            .removeClass('cbp-item-off')
            .addClass('cbp-item-off2on')
            .each(function(index, el) {
                var data = $(el).data('cbp');

                data.left = data.leftNew;
                data.top = data.topNew;

                el.style.left = data.left + 'px';
                el.style.top = data.top + 'px';
            });

        if (t.blocksOn2Off.length) {
            t.blocksOn2Off.last().data('cbp').wrapper.one(CubePortfolio.Private.animationend, animationend);
        } else if (t.blocksOff2On.length) {
            t.blocksOff2On.last().data('cbp').wrapper.one(CubePortfolio.Private.animationend, animationend);
        } else {
            animationend();
        }

        // resize main container height
        t._resizeMainContainer();

        function animationend() {
            t.blocks
                .removeClass('cbp-item-on2off cbp-item-off2on cbp-item-on2on')
                .each(function(index, el) {
                    var data = $(el).data('cbp');

                    data.left = data.leftNew;
                    data.top = data.topNew;

                    el.style.left = data.left + 'px';
                    el.style.top = data.top + 'px';

                    el.style[CubePortfolio.Private.transform] = '';
                });

            t.blocksOff.addClass('cbp-item-off');

            t.$obj.removeClass('cbp-animation-' + t.options.animationType);

            t.filterFinish();
        }

    };

    AnimationClassic.prototype.destroy = function() {
        var parent = this.parent;
        parent.$obj.removeClass('cbp-animation-' + parent.options.animationType);
    };

    CubePortfolio.Plugins.AnimationClassic = function(parent) {

        if (!CubePortfolio.Private.modernBrowser || $.inArray(parent.options.animationType, ['boxShadow', 'fadeOut', 'flipBottom', 'flipOut', 'quicksand', 'scaleSides', 'skew']) < 0) {
            return null;
        }

        return new AnimationClassic(parent);
    };

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    function AnimationClone(parent) {
        var t = this;

        t.parent = parent;

        parent.filterLayout = t.filterLayout;
    }

    // here this value point to parent grid
    AnimationClone.prototype.filterLayout = function(filterName) {
        var t = this,
            ulClone = t.$ul[0].cloneNode(true);

        ulClone.setAttribute('class', 'cbp-wrapper-helper');
        t.wrapper[0].insertBefore(ulClone, t.$ul[0]);

        requestAnimationFrame(function() {
            t.$obj.addClass('cbp-animation-' + t.options.animationType);

            t.blocksOff.addClass('cbp-item-off');

            t.blocksOn.removeClass('cbp-item-off')
                .each(function(index, el) {
                    var data = $(el).data('cbp');

                    data.left = data.leftNew;
                    data.top = data.topNew;

                    el.style.left = data.left + 'px';
                    el.style.top = data.top + 'px';

                    if (t.options.animationType === 'sequentially') {
                        data.wrapper[0].style[CubePortfolio.Private.animationDelay] = (index * 60) + 'ms';
                    }
                });

            if (t.blocksOn.length) {
                t.blocksOn.last().data('cbp').wrapper.one(CubePortfolio.Private.animationend, animationend);
            } else if (t.blocksOnInitial.length) {
                t.blocksOnInitial.last().data('cbp').wrapper.one(CubePortfolio.Private.animationend, animationend);
            } else {
                animationend();
            }

            // resize main container height
            t._resizeMainContainer();
        });

        function animationend() {
            t.wrapper[0].removeChild(ulClone);

            if (t.options.animationType === 'sequentially') {
                t.blocksOn.each(function(index, el) {
                    $(el).data('cbp').wrapper[0].style[CubePortfolio.Private.animationDelay] = '';
                });
            }

            t.$obj.removeClass('cbp-animation-' + t.options.animationType);

            t.filterFinish();
        }

    };

    AnimationClone.prototype.destroy = function() {
        var parent = this.parent;
        parent.$obj.removeClass('cbp-animation-' + parent.options.animationType);
    };

    CubePortfolio.Plugins.AnimationClone = function(parent) {

        if (!CubePortfolio.Private.modernBrowser || $.inArray(parent.options.animationType, ['fadeOutTop', 'slideLeft', 'sequentially']) < 0) {
            return null;
        }

        return new AnimationClone(parent);
    };

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    function AnimationCloneDelay(parent) {
        var t = this;

        t.parent = parent;

        parent.filterLayout = t.filterLayout;
    }

    // here this value point to parent grid
    AnimationCloneDelay.prototype.filterLayout = function(filterName) {
        var t = this,
            ulClone;

        // t.blocksOnInitial.each(function(index, el) {
        //     $(el).data('cbp').wrapper[0].style[CubePortfolio.Private.animationDelay] = (index * 50) + 'ms';
        // });

        ulClone = t.$ul[0].cloneNode(true);

        ulClone.setAttribute('class', 'cbp-wrapper-helper');
        t.wrapper[0].insertBefore(ulClone, t.$ul[0]);

        // hack for safari osx because it doesn't want to work if I set animationDelay
        // on cbp-item-wrapper before I clone the t.$ul
        $(ulClone).find('.cbp-item').not('.cbp-item-off').children('.cbp-item-wrapper').each(function(index, el) {
            el.style[CubePortfolio.Private.animationDelay] = (index * 50) + 'ms';
        });

        requestAnimationFrame(function() {
            t.$obj.addClass('cbp-animation-' + t.options.animationType);

            t.blocksOff.addClass('cbp-item-off');

            t.blocksOn.removeClass('cbp-item-off')
                .each(function(index, el) {
                    var data = $(el).data('cbp');

                    data.left = data.leftNew;
                    data.top = data.topNew;

                    el.style.left = data.left + 'px';
                    el.style.top = data.top + 'px';

                    data.wrapper[0].style[CubePortfolio.Private.animationDelay] = (index * 50) + 'ms';

                });

            if (t.blocksOn.length) {
                t.blocksOn.last().data('cbp').wrapper.one(CubePortfolio.Private.animationend, animationend);
            } else if (t.blocksOnInitial.length) {
                t.blocksOnInitial.last().data('cbp').wrapper.one(CubePortfolio.Private.animationend, animationend);
            } else {
                animationend();
            }

            // resize main container height
            t._resizeMainContainer();
        });

        function animationend() {
            t.wrapper[0].removeChild(ulClone);

            t.$obj.removeClass('cbp-animation-' + t.options.animationType);

            t.blocks.each(function(index, el) {
                $(el).data('cbp').wrapper[0].style[CubePortfolio.Private.animationDelay] = '';
            });

            t.filterFinish();
        }

    };

    AnimationCloneDelay.prototype.destroy = function() {
        var parent = this.parent;
        parent.$obj.removeClass('cbp-animation-' + parent.options.animationType);
    };

    CubePortfolio.Plugins.AnimationCloneDelay = function(parent) {

        if (!CubePortfolio.Private.modernBrowser || $.inArray(parent.options.animationType, ['3dflip', 'flipOutDelay', 'foldLeft', 'frontRow', 'rotateRoom', 'rotateSides', 'scaleDown', 'slideDelay', 'unfold']) < 0) {
            return null;
        }

        return new AnimationCloneDelay(parent);
    };

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    function AnimationWrapper(parent) {
        var t = this;

        t.parent = parent;

        parent.filterLayout = t.filterLayout;
    }

    // here this value point to parent grid
    AnimationWrapper.prototype.filterLayout = function(filterName) {
        var t = this,
            ulClone = t.$ul[0].cloneNode(true);

        ulClone.setAttribute('class', 'cbp-wrapper-helper');
        t.wrapper[0].insertBefore(ulClone, t.$ul[0]);

        requestAnimationFrame(function() {
            t.$obj.addClass('cbp-animation-' + t.options.animationType);

            t.blocksOff.addClass('cbp-item-off');

            t.blocksOn.removeClass('cbp-item-off')
                .each(function(index, el) {
                    var data = $(el).data('cbp');

                    data.left = data.leftNew;
                    data.top = data.topNew;

                    el.style.left = data.left + 'px';
                    el.style.top = data.top + 'px';
                });

            if (t.blocksOn.length) {
                t.$ul.one(CubePortfolio.Private.animationend, animationend);
            } else if (t.blocksOnInitial.length) {
                $(ulClone).one(CubePortfolio.Private.animationend, animationend);
            } else {
                animationend();
            }

            // resize main container height
            t._resizeMainContainer();
        });

        function animationend() {
            t.wrapper[0].removeChild(ulClone);

            t.$obj.removeClass('cbp-animation-' + t.options.animationType);

            t.filterFinish();
        }

    };

    AnimationWrapper.prototype.destroy = function() {
        var parent = this.parent;
        parent.$obj.removeClass('cbp-animation-' + parent.options.animationType);
    };

    CubePortfolio.Plugins.AnimationWrapper = function(parent) {

        if (!CubePortfolio.Private.modernBrowser || $.inArray(parent.options.animationType, ['bounceBottom', 'bounceLeft', 'bounceTop', 'moveLeft']) < 0) {
            return null;
        }

        return new AnimationWrapper(parent);
    };

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    function CaptionExpand(parent) {
        var t = this;

        t.parent = parent;

        parent._registerEvent('initFinish', function() {

            parent.$obj.on('click.cbp', '.cbp-caption-defaultWrap', function(e) {
                e.preventDefault();

                if (parent.isAnimating) {
                    return;
                }

                parent.isAnimating = true;

                var defaultWrap = $(this),
                    activeWrap = defaultWrap.next(),
                    caption = defaultWrap.parent(),
                    endStyle = {
                        position: 'relative',
                        height: activeWrap.outerHeight(true)
                    },
                    startStyle = {
                        position: 'relative',
                        height: 0
                    };

                parent.$obj.addClass('cbp-caption-expand-active');

                // swap endStyle & startStyle
                if (caption.hasClass('cbp-caption-expand-open')) {
                    var temp = startStyle;
                    startStyle = endStyle;
                    endStyle = temp;
                    caption.removeClass('cbp-caption-expand-open');
                }

                activeWrap.css(endStyle);

                parent._gridAdjust();

                // reposition the blocks
                parent._layout();

                // repositionate the blocks with the best transition available
                parent.positionateItems();

                // resize main container height
                parent._resizeMainContainer();

                // set activeWrap to 0 so I can start animation in the next frame
                activeWrap.css(startStyle);

                // delay animation
                requestAnimationFrame(function() {

                    caption.addClass('cbp-caption-expand-open');

                    activeWrap.one(CubePortfolio.Private.transitionend, function() {
                        parent.isAnimating = false;
                        parent.$obj.removeClass('cbp-caption-expand-active');

                        if (endStyle.height === 0) {
                            caption.removeClass('cbp-caption-expand-open');
                            activeWrap.attr('style', '');
                        }

                    });

                    activeWrap.css(endStyle);

                    if (parent.options.layoutMode === 'slider') {
                        parent._updateSlider();
                    }

                    parent._triggerEvent('resizeGrid');
                });
            });
        }, true);

    }

    CaptionExpand.prototype.destroy = function() {
        this.parent.$obj.find('.cbp-caption-defaultWrap').off('click.cbp').parent().removeClass('cbp-caption-expand-active');
    };

    CubePortfolio.Plugins.CaptionExpand = function(parent) {

        if (parent.options.caption !== 'expand') {
            return null;
        }

        return new CaptionExpand(parent);
    };

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    function BottomToTop(parent) {

        // skip next event from core
        parent._skipNextEvent('delayFrame');

        parent._registerEvent('initEndWrite', function() {

            parent.blocksOn.each(function(index, item) {
                item.style[CubePortfolio.Private.animationDelay] = (index * parent.options.displayTypeSpeed) + 'ms';
            });

            parent.$obj.addClass('cbp-displayType-bottomToTop');

            // get last element
            parent.blocksOn.last().one(CubePortfolio.Private.animationend, function() {
                parent.$obj.removeClass('cbp-displayType-bottomToTop');

                parent.blocksOn.each(function(index, item) {
                    item.style[CubePortfolio.Private.animationDelay] = '';
                });

                // trigger event after the animation is finished
                parent._triggerEvent('delayFrame');
            });

        }, true);

    }

    CubePortfolio.Plugins.BottomToTop = function (parent) {

        if (!CubePortfolio.Private.modernBrowser || parent.options.displayType !== 'bottomToTop' || parent.blocks.length === 0) {
            return null;
        }

        return new BottomToTop(parent);
    };

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    function FadeInToTop(parent) {

        // skip next event from core
        parent._skipNextEvent('delayFrame');

        parent._registerEvent('initEndWrite', function() {
            parent.obj.style[CubePortfolio.Private.animationDuration] = parent.options.displayTypeSpeed + 'ms';

            parent.$obj.addClass('cbp-displayType-fadeInToTop');

            parent.$obj.one(CubePortfolio.Private.animationend, function() {
                parent.$obj.removeClass('cbp-displayType-fadeInToTop');

                parent.obj.style[CubePortfolio.Private.animationDuration] = '';

                // trigger event after the animation is finished
                parent._triggerEvent('delayFrame');
            });

        }, true);

    }

    CubePortfolio.Plugins.FadeInToTop = function (parent) {

        if (!CubePortfolio.Private.modernBrowser || parent.options.displayType !== 'fadeInToTop' || parent.blocks.length === 0) {
            return null;
        }

        return new FadeInToTop(parent);
    };

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    function LazyLoading(parent) {

        // skip next event from core
        parent._skipNextEvent('delayFrame');

        parent._registerEvent('initEndWrite', function() {
            parent.obj.style[CubePortfolio.Private.animationDuration] = parent.options.displayTypeSpeed + 'ms';

            parent.$obj.addClass('cbp-displayType-lazyLoading');

            parent.$obj.one(CubePortfolio.Private.animationend, function() {
                parent.$obj.removeClass('cbp-displayType-lazyLoading');

                parent.obj.style[CubePortfolio.Private.animationDuration] = '';

                // trigger event after the animation is finished
                parent._triggerEvent('delayFrame');
            });

        }, true);

    }

    CubePortfolio.Plugins.LazyLoading = function (parent) {

        if (!CubePortfolio.Private.modernBrowser || (parent.options.displayType !== 'lazyLoading' && parent.options.displayType !== 'fadeIn') || parent.blocks.length === 0) {
            return null;
        }

        return new LazyLoading(parent);
    };

})(jQuery, window, document);

(function($, window, document, undefined) {
    'use strict';

    var CubePortfolio = $.fn.cubeportfolio.Constructor;

    function DisplaySequentially(parent) {

        // skip next event from core
        parent._skipNextEvent('delayFrame');

        parent._registerEvent('initEndWrite', function() {

            parent.blocksOn.each(function(index, item) {
                item.style[CubePortfolio.Private.animationDelay] = (index * parent.options.displayTypeSpeed) + 'ms';
            });

            parent.$obj.addClass('cbp-displayType-sequentially');

            // get last element
            parent.blocksOn.last().one(CubePortfolio.Private.animationend, function() {
                parent.$obj.removeClass('cbp-displayType-sequentially');

                parent.blocksOn.each(function(index, item) {
                    item.style[CubePortfolio.Private.animationDelay] = '';
                });

                // trigger event after the animation is finished
                parent._triggerEvent('delayFrame');
            });

        }, true);

    }

    CubePortfolio.Plugins.DisplaySequentially = function (parent) {

        if (!CubePortfolio.Private.modernBrowser || parent.options.displayType !== 'sequentially' || parent.blocks.length === 0) {
            return null;
        }

        return new DisplaySequentially(parent);
    };

})(jQuery, window, document);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ2ZW5kb3IvanF1ZXJ5LmN1YmVwb3J0Zm9saW8uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBDdWJlIFBvcnRmb2xpbyAtIFJlc3BvbnNpdmUgalF1ZXJ5IEdyaWQgUGx1Z2luXG4gKlxuICogdmVyc2lvbjogMi4zLjIgKDI2IE1heSwgMjAxNSlcbiAqIHJlcXVpcmU6IGpRdWVyeSB2MS43K1xuICpcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIE1paGFpIEJ1cmljZWEgKGh0dHA6Ly9zY3JpcHRwaWUuY29tL2N1YmVwb3J0Zm9saW8vbGl2ZS1wcmV2aWV3LylcbiAqIExpY2Vuc2VkIHVuZGVyIENvZGVDYW55b24gTGljZW5zZSAoaHR0cDovL2NvZGVjYW55b24ubmV0L2xpY2Vuc2VzKVxuICpcbiAqL1xuXG4oZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgZnVuY3Rpb24gQ3ViZVBvcnRmb2xpbyhvYmosIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8qanNoaW50IHZhbGlkdGhpczogdHJ1ZSAqL1xuICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICBpbml0aWFsQ2xzID0gJ2NicCcsXG4gICAgICAgICAgICBjaGlsZHJlbjtcblxuICAgICAgICBpZiAoJC5kYXRhKG9iaiwgJ2N1YmVwb3J0Zm9saW8nKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjdWJlcG9ydGZvbGlvIGlzIGFscmVhZHkgaW5pdGlhbGl6ZWQuIERlc3Ryb3kgaXQgYmVmb3JlIGluaXRpYWxpemUgYWdhaW4hJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhdHRhY2hlZCB0aGlzIGluc3RhbmNlIHRvIG9ialxuICAgICAgICAkLmRhdGEob2JqLCAnY3ViZXBvcnRmb2xpbycsIHQpO1xuXG4gICAgICAgIC8vIGV4dGVuZCBvcHRpb25zXG4gICAgICAgIHQub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCAkLmZuLmN1YmVwb3J0Zm9saW8ub3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gc3RvcmUgdGhlIHN0YXRlIG9mIHRoZSBhbmltYXRpb24gdXNlZCBmb3IgZmlsdGVyc1xuICAgICAgICB0LmlzQW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgICAgICAvLyBkZWZhdWx0IGZpbHRlciBmb3IgcGx1Z2luXG4gICAgICAgIHQuZGVmYXVsdEZpbHRlciA9IHQub3B0aW9ucy5kZWZhdWx0RmlsdGVyO1xuXG4gICAgICAgIC8vIHJlZ2lzdGVyZWQgZXZlbnRzIChvYnNlcnZhdG9yICYgcHVibGlzaGVyIHBhdHRlcm4pXG4gICAgICAgIHQucmVnaXN0ZXJlZEV2ZW50cyA9IFtdO1xuXG4gICAgICAgIC8vIHNraXAgZXZlbnRzIChvYnNlcnZhdG9yICYgcHVibGlzaGVyIHBhdHRlcm4pXG4gICAgICAgIHQuc2tpcEV2ZW50cyA9IFtdO1xuXG4gICAgICAgIC8vIGhhcyB3cmFwcGVyXG4gICAgICAgIHQuYWRkZWRXcmFwcCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIHJlZ2lzdGVyIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICB0Ll9yZWdpc3RlckV2ZW50KCdpbml0RmluaXNoJywgY2FsbGJhY2ssIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8ganMgZWxlbWVudFxuICAgICAgICB0Lm9iaiA9IG9iajtcblxuICAgICAgICAvLyBqcXVlcnkgZWxlbWVudFxuICAgICAgICB0LiRvYmogPSAkKG9iaik7XG5cbiAgICAgICAgLy8gd2hlbiB0aGVyZSBhcmUgbm8gLmNicC1pdGVtXG4gICAgICAgIGNoaWxkcmVuID0gdC4kb2JqLmNoaWxkcmVuKCk7XG5cbiAgICAgICAgLy8gaWYgY2FwdGlvbiBpcyBhY3RpdmVcbiAgICAgICAgaWYgKHQub3B0aW9ucy5jYXB0aW9uKSB7XG4gICAgICAgICAgICBpZiAoIUN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5tb2Rlcm5Ccm93c2VyKSB7XG4gICAgICAgICAgICAgICAgdC5vcHRpb25zLmNhcHRpb24gPSAnbWluaW1hbCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIC5jYnAtY2FwdGlvbi1hY3RpdmUgaXMgdXNlZCBvbmx5IGZvciBjc3NcbiAgICAgICAgICAgIC8vIHNvIGl0IHdpbGwgbm90IGdlbmVyYXRlIGEgYmlnIGNzcyBmcm9tIHNhc3MgaWYgYSBjYXB0aW9uIGlzIHNldFxuICAgICAgICAgICAgaW5pdGlhbENscyArPSAnIGNicC1jYXB0aW9uLWFjdGl2ZSBjYnAtY2FwdGlvbi0nICsgdC5vcHRpb25zLmNhcHRpb247XG4gICAgICAgIH1cblxuICAgICAgICB0LiRvYmouYWRkQ2xhc3MoaW5pdGlhbENscyk7XG5cbiAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMCB8fCBjaGlsZHJlbi5maXJzdCgpLmhhc0NsYXNzKCdjYnAtaXRlbScpKSB7XG4gICAgICAgICAgICB0LndyYXBJbm5lcih0Lm9iaiwgJ2NicC13cmFwcGVyJyk7XG4gICAgICAgICAgICB0LmFkZGVkV3JhcHAgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8ganF1ZXJ5IHdyYXBwZXIgZWxlbWVudFxuICAgICAgICB0LiR1bCA9IHQuJG9iai5jaGlsZHJlbigpLmFkZENsYXNzKCdjYnAtd3JhcHBlcicpO1xuXG4gICAgICAgIC8vIHdyYXAgdGhlICR1bCBpbiBhIG91dHNpZGUgd3JhcHBlclxuICAgICAgICB0LndyYXBJbm5lcih0Lm9iaiwgJ2NicC13cmFwcGVyLW91dGVyJyk7XG5cbiAgICAgICAgdC53cmFwcGVyID0gdC4kb2JqLmNoaWxkcmVuKCcuY2JwLXdyYXBwZXItb3V0ZXInKTtcblxuICAgICAgICB0LmJsb2NrcyA9IHQuJHVsLmNoaWxkcmVuKCcuY2JwLWl0ZW0nKTtcblxuICAgICAgICAvLyB3cmFwIC5jYnAtaXRlbS13cmFwIGRpdiBpbnNpZGUgLmNicC1pdGVtXG4gICAgICAgIHQud3JhcElubmVyKHQuYmxvY2tzLCAnY2JwLWl0ZW0td3JhcHBlcicpO1xuXG4gICAgICAgIC8vIHN0b3JlIG1haW4gY29udGFpbmVyIHdpZHRoXG4gICAgICAgIHQud2lkdGggPSB0LiRvYmoub3V0ZXJXaWR0aCgpO1xuXG4gICAgICAgIC8vIHdhaXQgdG8gbG9hZCBhbGwgaW1hZ2VzIGFuZCB0aGVuIGdvIGZ1cnRoZXJcbiAgICAgICAgdC5fbG9hZCh0LiRvYmosIHQuX2Rpc3BsYXkpO1xuICAgIH1cblxuICAgICQuZXh0ZW5kKEN1YmVQb3J0Zm9saW8ucHJvdG90eXBlLCB7XG5cbiAgICAgICAgc3RvcmVEYXRhOiBmdW5jdGlvbihibG9ja3MpIHtcbiAgICAgICAgICAgIGJsb2Nrcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAgICAgICAgIHZhciBibG9jayA9ICQoZWwpO1xuXG4gICAgICAgICAgICAgICAgYmxvY2suZGF0YSgnY2JwJywge1xuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyOiBibG9jay5jaGlsZHJlbignLmNicC1pdGVtLXdyYXBwZXInKSxcblxuICAgICAgICAgICAgICAgICAgICB3aWR0aEluaXRpYWw6IGJsb2NrLm91dGVyV2lkdGgoKSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0SW5pdGlhbDogYmxvY2sub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogbnVsbCxcblxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0TmV3OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICB0b3A6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHRvcE5ldzogbnVsbFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gaHR0cDovL2JpdC5seS9wdXJlLWpzLXdyYXBcbiAgICAgICAgd3JhcElubmVyOiBmdW5jdGlvbihpdGVtcywgY2xhc3NBdHRyKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaXRlbSxcbiAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgIGRpdjtcblxuICAgICAgICAgICAgY2xhc3NBdHRyID0gY2xhc3NBdHRyIHx8ICcnO1xuXG4gICAgICAgICAgICBpZiAoaXRlbXMubGVuZ3RoICYmIGl0ZW1zLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIHRoZXJlIGFyZSBubyAuY2JwLWl0ZW1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbXMubGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpdGVtcyA9IFtpdGVtc107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoaSA9IGl0ZW1zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICAgICAgaXRlbSA9IGl0ZW1zW2ldO1xuXG4gICAgICAgICAgICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgICAgICAgICAgICBkaXYuc2V0QXR0cmlidXRlKCdjbGFzcycsIGNsYXNzQXR0cik7XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAoaXRlbS5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoaXRlbS5jaGlsZE5vZGVzWzBdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpdGVtLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZXN0cm95IGZ1bmN0aW9uIGZvciBhbGwgY2FwdGlvbnNcbiAgICAgICAgICovXG4gICAgICAgIF9jYXB0aW9uRGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG4gICAgICAgICAgICB0LiRvYmoucmVtb3ZlQ2xhc3MoJ2NicC1jYXB0aW9uLWFjdGl2ZSBjYnAtY2FwdGlvbi0nICsgdC5vcHRpb25zLmNhcHRpb24pO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFkZCByZXNpemUgZXZlbnQgd2hlbiBicm93c2VyIHdpZHRoIGNoYW5nZXNcbiAgICAgICAgICovXG4gICAgICAgIHJlc2l6ZUV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB0aW1lb3V0LCBncmlkV2lkdGg7XG5cbiAgICAgICAgICAgIC8vIHJlc2l6ZVxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuY2JwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXG4gICAgICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lckhlaWdodCA9PSBzY3JlZW4uaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGZ1bGxsIHNjcmVlbiBtb2RlLiBkb24ndCBuZWVkIHRvIHRyaWdnZXIgYSByZXNpemVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0Lm9wdGlvbnMuZ3JpZEFkanVzdG1lbnQgPT09ICdhbGlnbkNlbnRlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQub2JqLnN0eWxlLm1heFdpZHRoID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBncmlkV2lkdGggPSB0LiRvYmoub3V0ZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0LndpZHRoICE9PSBncmlkV2lkdGgpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSBjdXJyZW50IHdpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICB0LndpZHRoID0gZ3JpZFdpZHRoO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0Ll9ncmlkQWRqdXN0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlcG9zaXRpb24gdGhlIGJsb2Nrc1xuICAgICAgICAgICAgICAgICAgICAgICAgdC5fbGF5b3V0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlcG9zaXRpb25hdGUgdGhlIGJsb2NrcyB3aXRoIHRoZSBiZXN0IHRyYW5zaXRpb24gYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICB0LnBvc2l0aW9uYXRlSXRlbXMoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVzaXplIG1haW4gY29udGFpbmVyIGhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgdC5fcmVzaXplTWFpbkNvbnRhaW5lcigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodC5vcHRpb25zLmxheW91dE1vZGUgPT09ICdzbGlkZXInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5fdXBkYXRlU2xpZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHQuX3RyaWdnZXJFdmVudCgncmVzaXplR3JpZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdC5fdHJpZ2dlckV2ZW50KCdyZXNpemVXaW5kb3cnKTtcblxuICAgICAgICAgICAgICAgIH0sIDgwKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogV2FpdCB0byBsb2FkIGFsbCBpbWFnZXNcbiAgICAgICAgICovXG4gICAgICAgIF9sb2FkOiBmdW5jdGlvbihvYmosIGNhbGxiYWNrLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaW1ncyxcbiAgICAgICAgICAgICAgICBpbWdzTGVuZ3RoLFxuICAgICAgICAgICAgICAgIGltZ3NMb2FkZWQgPSAwO1xuXG4gICAgICAgICAgICBhcmdzID0gYXJncyB8fCBbXTtcblxuICAgICAgICAgICAgaW1ncyA9IG9iai5maW5kKCdpbWc6dW5jYWNoZWQnKS5tYXAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3JjO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGltZ3NMZW5ndGggPSBpbWdzLmxlbmd0aDtcblxuICAgICAgICAgICAgaWYgKGltZ3NMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0LCBhcmdzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5lYWNoKGltZ3MsIGZ1bmN0aW9uKGksIHNyYykge1xuICAgICAgICAgICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcblxuICAgICAgICAgICAgICAgICQoaW1nKS5vbmUoJ2xvYWQuY2JwIGVycm9yLmNicCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLm9mZignbG9hZC5jYnAgZXJyb3IuY2JwJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaW1nc0xvYWRlZCsrO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW1nc0xvYWRlZCA9PT0gaW1nc0xlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9IHNyYztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgZmlsdGVycyBpcyBwcmVzZW50IGluIHVybFxuICAgICAgICAgKi9cbiAgICAgICAgX2ZpbHRlckZyb21Vcmw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG1hdGNoID0gLyNjYnBmPSguKj8pKFsjfD8mXXwkKS9naS5leGVjKGxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAgICAgICBpZiAobWF0Y2ggIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0LmRlZmF1bHRGaWx0ZXIgPSBtYXRjaFsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaG93IHRoZSBwbHVnaW5cbiAgICAgICAgICovXG4gICAgICAgIF9kaXNwbGF5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gc3RvcmUgdG8gZGF0YSBzb21lIHZhbHVlcyBvZiB0LmJsb2Nrc1xuICAgICAgICAgICAgdC5zdG9yZURhdGEodC5ibG9ja3MpO1xuXG4gICAgICAgICAgICBpZiAodC5vcHRpb25zLmxheW91dE1vZGUgPT09ICdncmlkJykge1xuICAgICAgICAgICAgICAgIC8vIHNldCBkZWZhdWx0IGZpbHRlciBpZiBpcyBwcmVzZW50IGluIHVybFxuICAgICAgICAgICAgICAgIHQuX2ZpbHRlckZyb21VcmwoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHQuZGVmYXVsdEZpbHRlciAhPT0gJyonKSB7XG4gICAgICAgICAgICAgICAgdC5ibG9ja3NPbiA9IHQuYmxvY2tzLmZpbHRlcih0LmRlZmF1bHRGaWx0ZXIpO1xuICAgICAgICAgICAgICAgIHQuYmxvY2tzLm5vdCh0LmRlZmF1bHRGaWx0ZXIpLmFkZENsYXNzKCdjYnAtaXRlbS1vZmYnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdC5ibG9ja3NPbiA9IHQuYmxvY2tzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBwbHVnaW5zXG4gICAgICAgICAgICB0Ll9wbHVnaW5zID0gJC5tYXAoQ3ViZVBvcnRmb2xpby5QbHVnaW5zLCBmdW5jdGlvbihwbHVnaW5OYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBsdWdpbk5hbWUodCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdC5fdHJpZ2dlckV2ZW50KCdpbml0U3RhcnRSZWFkJyk7XG4gICAgICAgICAgICB0Ll90cmlnZ2VyRXZlbnQoJ2luaXRTdGFydFdyaXRlJyk7XG5cbiAgICAgICAgICAgIHQubG9jYWxDb2x1bW5XaWR0aCA9IHQub3B0aW9ucy5nYXBWZXJ0aWNhbDtcblxuICAgICAgICAgICAgaWYgKHQuYmxvY2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHQubG9jYWxDb2x1bW5XaWR0aCArPSB0LmJsb2Nrcy5maXJzdCgpLmRhdGEoJ2NicCcpLndpZHRoSW5pdGlhbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5nZXRDb2x1bW5zVHlwZSA9ICgkLmlzQXJyYXkodC5vcHRpb25zLm1lZGlhUXVlcmllcykpID8gJ19nZXRDb2x1bW5zQnJlYWtwb2ludHMnIDogJ19nZXRDb2x1bW5zQXV0byc7XG5cbiAgICAgICAgICAgIHQuX2dyaWRBZGp1c3QoKTtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIG1hcmstdXAgZm9yIGxheW91dCBtb2RlXG4gICAgICAgICAgICB0WydfJyArIHQub3B0aW9ucy5sYXlvdXRNb2RlICsgJ01hcmt1cCddKCk7XG5cbiAgICAgICAgICAgIC8vIG1ha2UgbGF5b3V0XG4gICAgICAgICAgICB0Ll9sYXlvdXQoKTtcblxuICAgICAgICAgICAgLy8gcG9zaXRpb25hdGUgdGhlIGJsb2Nrc1xuICAgICAgICAgICAgdC5wb3NpdGlvbmF0ZUl0ZW1zKCk7XG5cbiAgICAgICAgICAgIC8vIHJlc2l6ZSBtYWluIGNvbnRhaW5lciBoZWlnaHRcbiAgICAgICAgICAgIHQuX3Jlc2l6ZU1haW5Db250YWluZXIoKTtcblxuICAgICAgICAgICAgdC5fdHJpZ2dlckV2ZW50KCdpbml0RW5kUmVhZCcpO1xuICAgICAgICAgICAgdC5fdHJpZ2dlckV2ZW50KCdpbml0RW5kV3JpdGUnKTtcblxuICAgICAgICAgICAgLy8gcGx1Z2luIGlzIHJlYWR5IHRvIHNob3cgYW5kIGludGVyYWN0XG4gICAgICAgICAgICB0LiRvYmouYWRkQ2xhc3MoJ2NicC1yZWFkeScpO1xuXG4gICAgICAgICAgICB0Ll9yZWdpc3RlckV2ZW50KCdkZWxheUZyYW1lJywgdC5kZWxheUZyYW1lKTtcblxuICAgICAgICAgICAgLy8gIHRoZSByZWFzb24gaXMgdG8gc2tpcCB0aGlzIGV2ZW50IHdoZW4geW91IHdhbnQgZnJvbSBhIHBsdWdpblxuICAgICAgICAgICAgdC5fdHJpZ2dlckV2ZW50KCdkZWxheUZyYW1lJyk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICBwb3NpdGlvbmF0ZUl0ZW1zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBkYXRhO1xuXG4gICAgICAgICAgICB0LmJsb2Nrc09uLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9ICQoZWwpLmRhdGEoJ2NicCcpO1xuXG4gICAgICAgICAgICAgICAgZGF0YS5sZWZ0ID0gZGF0YS5sZWZ0TmV3O1xuICAgICAgICAgICAgICAgIGRhdGEudG9wID0gZGF0YS50b3BOZXc7XG5cbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gZGF0YS5sZWZ0ICsgJ3B4JztcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBkYXRhLnRvcCArICdweCc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZWxheUZyYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHQucmVzaXplRXZlbnQoKTtcblxuICAgICAgICAgICAgICAgIHQuX3RyaWdnZXJFdmVudCgnaW5pdEZpbmlzaCcpO1xuXG4gICAgICAgICAgICAgICAgLy8gYW5pbWF0aW5nIGlzIG5vdyBmYWxzZVxuICAgICAgICAgICAgICAgIHQuaXNBbmltYXRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgcHVibGljIGV2ZW50IGluaXRDb21wbGV0ZVxuICAgICAgICAgICAgICAgIHQuJG9iai50cmlnZ2VyKCdpbml0Q29tcGxldGUuY2JwJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIF9ncmlkQWRqdXN0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gaWYgcmVzcG9uc2l2ZVxuICAgICAgICAgICAgaWYgKHQub3B0aW9ucy5ncmlkQWRqdXN0bWVudCA9PT0gJ3Jlc3BvbnNpdmUnKSB7XG4gICAgICAgICAgICAgICAgdC5fcmVzcG9uc2l2ZUxheW91dCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0LmJsb2Nrcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9ICQoZWwpLmRhdGEoJ2NicCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGRhdGEud2lkdGggPSBkYXRhLndpZHRoSW5pdGlhbDtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5oZWlnaHQgPSBkYXRhLmhlaWdodEluaXRpYWw7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEJ1aWxkIHRoZSBsYXlvdXRcbiAgICAgICAgICovXG4gICAgICAgIF9sYXlvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0WydfJyArIHQub3B0aW9ucy5sYXlvdXRNb2RlICsgJ0xheW91dFJlc2V0J10oKTtcblxuICAgICAgICAgICAgdFsnXycgKyB0Lm9wdGlvbnMubGF5b3V0TW9kZSArICdMYXlvdXQnXSgpO1xuXG4gICAgICAgICAgICB0LiRvYmoucmVtb3ZlQ2xhc3MoZnVuY3Rpb24oaW5kZXgsIGNzcykge1xuICAgICAgICAgICAgICAgIHJldHVybiAoY3NzLm1hdGNoKC9cXGJjYnAtY29scy1cXGQrL2dpKSB8fCBbXSkuam9pbignICcpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHQuJG9iai5hZGRDbGFzcygnY2JwLWNvbHMtJyArIHQuY29scyk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBjcmVhdGUgbWFya1xuICAgICAgICBfc2xpZGVyTWFya3VwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgdC5zbGlkZXJTdG9wRXZlbnRzID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHQuc2xpZGVyQWN0aXZlID0gMDtcblxuICAgICAgICAgICAgdC5fcmVnaXN0ZXJFdmVudCgndXBkYXRlU2xpZGVyUG9zaXRpb24nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0LiRvYmouYWRkQ2xhc3MoJ2NicC1tb2RlLXNsaWRlcicpO1xuICAgICAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHQubmF2ID0gJCgnPGRpdi8+Jywge1xuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdjYnAtbmF2J1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHQubmF2Lm9uKCdjbGljay5jYnAnLCAnW2RhdGEtc2xpZGVyLWFjdGlvbl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgICAgIGlmICh0LnNsaWRlclN0b3BFdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBlbCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbiA9IGVsLmF0dHIoJ2RhdGEtc2xpZGVyLWFjdGlvbicpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRbJ18nICsgYWN0aW9uICsgJ1NsaWRlciddKSB7XG4gICAgICAgICAgICAgICAgICAgIHRbJ18nICsgYWN0aW9uICsgJ1NsaWRlciddKGVsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAodC5vcHRpb25zLnNob3dOYXZpZ2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgdC5jb250cm9scyA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2NicC1uYXYtY29udHJvbHMnXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0Lm5hdlByZXYgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgICAgICAgICAgICAgICdjbGFzcyc6ICdjYnAtbmF2LXByZXYnLFxuICAgICAgICAgICAgICAgICAgICAnZGF0YS1zbGlkZXItYWN0aW9uJzogJ3ByZXYnXG4gICAgICAgICAgICAgICAgfSkuYXBwZW5kVG8odC5jb250cm9scyk7XG5cbiAgICAgICAgICAgICAgICB0Lm5hdk5leHQgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgICAgICAgICAgICAgICdjbGFzcyc6ICdjYnAtbmF2LW5leHQnLFxuICAgICAgICAgICAgICAgICAgICAnZGF0YS1zbGlkZXItYWN0aW9uJzogJ25leHQnXG4gICAgICAgICAgICAgICAgfSkuYXBwZW5kVG8odC5jb250cm9scyk7XG5cblxuICAgICAgICAgICAgICAgIHQuY29udHJvbHMuYXBwZW5kVG8odC5uYXYpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodC5vcHRpb25zLnNob3dQYWdpbmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgdC5uYXZQYWdpbmF0aW9uID0gJCgnPGRpdi8+Jywge1xuICAgICAgICAgICAgICAgICAgICAnY2xhc3MnOiAnY2JwLW5hdi1wYWdpbmF0aW9uJ1xuICAgICAgICAgICAgICAgIH0pLmFwcGVuZFRvKHQubmF2KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHQuY29udHJvbHMgfHwgdC5uYXZQYWdpbmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgdC5uYXYuYXBwZW5kVG8odC4kb2JqKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5fdXBkYXRlU2xpZGVyUGFnaW5hdGlvbigpO1xuXG4gICAgICAgICAgICBpZiAodC5vcHRpb25zLmF1dG8pIHtcbiAgICAgICAgICAgICAgICBpZiAodC5vcHRpb25zLmF1dG9QYXVzZU9uSG92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdC5tb3VzZUlzRW50ZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0LiRvYmoub24oJ21vdXNlZW50ZXIuY2JwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC5tb3VzZUlzRW50ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0Ll9zdG9wU2xpZGVyQXV0bygpO1xuICAgICAgICAgICAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZS5jYnAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0Lm1vdXNlSXNFbnRlcmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0Ll9zdGFydFNsaWRlckF1dG8oKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdC5fc3RhcnRTbGlkZXJBdXRvKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0Lm9wdGlvbnMuZHJhZyAmJiBDdWJlUG9ydGZvbGlvLlByaXZhdGUubW9kZXJuQnJvd3Nlcikge1xuICAgICAgICAgICAgICAgIHQuX2RyYWdTbGlkZXIoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG4gICAgICAgIF91cGRhdGVTbGlkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0Ll91cGRhdGVTbGlkZXJQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICB0Ll91cGRhdGVTbGlkZXJQYWdpbmF0aW9uKCk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICBfdXBkYXRlU2xpZGVyUGFnaW5hdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgcGFnZXMsXG4gICAgICAgICAgICAgICAgaTtcblxuICAgICAgICAgICAgaWYgKHQub3B0aW9ucy5zaG93UGFnaW5hdGlvbikge1xuXG4gICAgICAgICAgICAgICAgLy8gZ2V0IG51bWJlciBvZiBwYWdlc1xuICAgICAgICAgICAgICAgIHBhZ2VzID0gTWF0aC5jZWlsKHQuYmxvY2tzT24ubGVuZ3RoIC8gdC5jb2xzKTtcbiAgICAgICAgICAgICAgICB0Lm5hdlBhZ2luYXRpb24uZW1wdHkoKTtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IHBhZ2VzIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnPGRpdi8+Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2NicC1uYXYtcGFnaW5hdGlvbi1pdGVtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLXNsaWRlci1hY3Rpb24nOiAnanVtcFRvJ1xuICAgICAgICAgICAgICAgICAgICB9KS5hcHBlbmRUbyh0Lm5hdlBhZ2luYXRpb24pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHQubmF2UGFnaW5hdGlvbkl0ZW1zID0gdC5uYXZQYWdpbmF0aW9uLmNoaWxkcmVuKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGVuYWJsZSBkaXNhYmxlIHRoZSBuYXZcbiAgICAgICAgICAgIHQuX2VuYWJsZURpc2FibGVOYXZTbGlkZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZGVzdHJveVNsaWRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0Lm9wdGlvbnMubGF5b3V0TW9kZSAhPT0gJ3NsaWRlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQuJG9iai5vZmYoJ2NsaWNrLmNicCcpO1xuXG4gICAgICAgICAgICB0LiRvYmoucmVtb3ZlQ2xhc3MoJ2NicC1tb2RlLXNsaWRlcicpO1xuXG4gICAgICAgICAgICBpZiAodC5vcHRpb25zLnNob3dOYXZpZ2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgdC5uYXYucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0Lm5hdlBhZ2luYXRpb24pIHtcbiAgICAgICAgICAgICAgICB0Lm5hdlBhZ2luYXRpb24ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcblxuICAgICAgICBfbmV4dFNsaWRlcjogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHQuX2lzRW5kU2xpZGVyKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAodC5pc1Jld2luZE5hdigpKSB7XG4gICAgICAgICAgICAgICAgICAgIHQuc2xpZGVyQWN0aXZlID0gMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodC5vcHRpb25zLnNjcm9sbEJ5UGFnZSkge1xuICAgICAgICAgICAgICAgICAgICB0LnNsaWRlckFjdGl2ZSA9IE1hdGgubWluKHQuc2xpZGVyQWN0aXZlICsgdC5jb2xzLCB0LmJsb2Nrc09uLmxlbmd0aCAtIHQuY29scyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdC5zbGlkZXJBY3RpdmUgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQuX2dvVG9TbGlkZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfcHJldlNsaWRlcjogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHQuX2lzU3RhcnRTbGlkZXIoKSkge1xuICAgICAgICAgICAgICAgIGlmICh0LmlzUmV3aW5kTmF2KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdC5zbGlkZXJBY3RpdmUgPSB0LmJsb2Nrc09uLmxlbmd0aCAtIHQuY29scztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodC5vcHRpb25zLnNjcm9sbEJ5UGFnZSkge1xuICAgICAgICAgICAgICAgICAgICB0LnNsaWRlckFjdGl2ZSA9IE1hdGgubWF4KDAsIHQuc2xpZGVyQWN0aXZlIC0gdC5jb2xzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0LnNsaWRlckFjdGl2ZSAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5fZ29Ub1NsaWRlcigpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9qdW1wVG9TbGlkZXI6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaW5kZXggPSBNYXRoLm1pbihlbC5pbmRleCgpICogdC5jb2xzLCB0LmJsb2Nrc09uLmxlbmd0aCAtIHQuY29scyk7XG5cbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gdC5zbGlkZXJBY3RpdmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQuc2xpZGVyQWN0aXZlID0gaW5kZXg7XG5cbiAgICAgICAgICAgIHQuX2dvVG9TbGlkZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfanVtcERyYWdUb1NsaWRlcjogZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAganVtcFdpZHRoLFxuICAgICAgICAgICAgICAgIG9mZnNldCxcbiAgICAgICAgICAgICAgICBjb25kaXRpb24sXG4gICAgICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICAgICAgZHJhZ0xlZnQgPSAocG9zID4gMCkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgICAgIGlmICh0Lm9wdGlvbnMuc2Nyb2xsQnlQYWdlKSB7XG4gICAgICAgICAgICAgICAganVtcFdpZHRoID0gdC5jb2xzICogdC5sb2NhbENvbHVtbldpZHRoO1xuICAgICAgICAgICAgICAgIG9mZnNldCA9IHQuY29scztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAganVtcFdpZHRoID0gdC5sb2NhbENvbHVtbldpZHRoO1xuICAgICAgICAgICAgICAgIG9mZnNldCA9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBvcyA9IE1hdGguYWJzKHBvcyk7XG4gICAgICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IocG9zIC8ganVtcFdpZHRoKSAqIG9mZnNldDtcbiAgICAgICAgICAgIGlmIChwb3MgJSBqdW1wV2lkdGggPiAyMCkge1xuICAgICAgICAgICAgICAgIGluZGV4ICs9IG9mZnNldDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRyYWdMZWZ0KSB7IC8vIGRyYWcgdG8gbGVmdFxuICAgICAgICAgICAgICAgIHQuc2xpZGVyQWN0aXZlID0gTWF0aC5taW4odC5zbGlkZXJBY3RpdmUgKyBpbmRleCwgdC5ibG9ja3NPbi5sZW5ndGggLSB0LmNvbHMpO1xuICAgICAgICAgICAgfSBlbHNlIHsgLy8gZHJhZyB0byByaWdodFxuICAgICAgICAgICAgICAgIHQuc2xpZGVyQWN0aXZlID0gTWF0aC5tYXgoMCwgdC5zbGlkZXJBY3RpdmUgLSBpbmRleCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQuX2dvVG9TbGlkZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfaXNTdGFydFNsaWRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zbGlkZXJBY3RpdmUgPT09IDA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2lzRW5kU2xpZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiAodC5zbGlkZXJBY3RpdmUgKyB0LmNvbHMpID4gdC5ibG9ja3NPbi5sZW5ndGggLSAxO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9nb1RvU2xpZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gZW5hYmxlIGRpc2FibGUgdGhlIG5hdlxuICAgICAgICAgICAgdC5fZW5hYmxlRGlzYWJsZU5hdlNsaWRlcigpO1xuXG4gICAgICAgICAgICB0Ll91cGRhdGVTbGlkZXJQb3NpdGlvbigpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgX3N0YXJ0U2xpZGVyQXV0bzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0LmlzRHJhZykge1xuICAgICAgICAgICAgICAgIHQuX3N0b3BTbGlkZXJBdXRvKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0LnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgLy8gZ28gdG8gbmV4dCBzbGlkZVxuICAgICAgICAgICAgICAgIHQuX25leHRTbGlkZXIoKTtcblxuICAgICAgICAgICAgICAgIC8vIHN0YXJ0IGF1dG9cbiAgICAgICAgICAgICAgICB0Ll9zdGFydFNsaWRlckF1dG8oKTtcblxuICAgICAgICAgICAgfSwgdC5vcHRpb25zLmF1dG9UaW1lb3V0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBfc3RvcFNsaWRlckF1dG86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2VuYWJsZURpc2FibGVOYXZTbGlkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHBhZ2UsXG4gICAgICAgICAgICAgICAgbWV0aG9kO1xuXG4gICAgICAgICAgICBpZiAoIXQuaXNSZXdpbmROYXYoKSkge1xuICAgICAgICAgICAgICAgIG1ldGhvZCA9ICh0Ll9pc1N0YXJ0U2xpZGVyKCkpID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyc7XG4gICAgICAgICAgICAgICAgdC5uYXZQcmV2W21ldGhvZF0oJ2NicC1uYXYtc3RvcCcpO1xuXG4gICAgICAgICAgICAgICAgbWV0aG9kID0gKHQuX2lzRW5kU2xpZGVyKCkpID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyc7XG4gICAgICAgICAgICAgICAgdC5uYXZOZXh0W21ldGhvZF0oJ2NicC1uYXYtc3RvcCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodC5vcHRpb25zLnNob3dQYWdpbmF0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodC5vcHRpb25zLnNjcm9sbEJ5UGFnZSkge1xuICAgICAgICAgICAgICAgICAgICBwYWdlID0gTWF0aC5jZWlsKHQuc2xpZGVyQWN0aXZlIC8gdC5jb2xzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodC5faXNFbmRTbGlkZXIoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZSA9IHQubmF2UGFnaW5hdGlvbkl0ZW1zLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlID0gTWF0aC5mbG9vcih0LnNsaWRlckFjdGl2ZSAvIHQuY29scyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBhZGQgY2xhc3MgYWN0aXZlIG9uIHBhZ2luYXRpb24ncyBpdGVtc1xuICAgICAgICAgICAgICAgIHQubmF2UGFnaW5hdGlvbkl0ZW1zLnJlbW92ZUNsYXNzKCdjYnAtbmF2LXBhZ2luYXRpb24tYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgLmVxKHBhZ2UpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygnY2JwLW5hdi1wYWdpbmF0aW9uLWFjdGl2ZScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHNsaWRlciBsb29wIGlzIGVuYWJsZWQgZG9uJ3QgYWRkIGNsYXNzZXMgdG8gYG5leHRgIGFuZCBgcHJldmAgYnV0dG9uc1xuICAgICAgICAgKi9cbiAgICAgICAgaXNSZXdpbmROYXY6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoIXQub3B0aW9ucy5zaG93TmF2aWdhdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodC5ibG9ja3NPbi5sZW5ndGggPD0gdC5jb2xzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodC5vcHRpb25zLnJld2luZE5hdikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2xpZGVySXRlbXNMZW5ndGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tzT24ubGVuZ3RoIDw9IHRoaXMuY29scztcbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcnJhbmdlIHRoZSBpdGVtcyBpbiBhIHNsaWRlciBsYXlvdXRcbiAgICAgICAgICovXG4gICAgICAgIF9zbGlkZXJMYXlvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0LmJsb2Nrc09uLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSAkKGVsKS5kYXRhKCdjYnAnKTtcblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgdmFsdWVzIHdpdGggdGhlIG5ldyBvbmVzXG4gICAgICAgICAgICAgICAgZGF0YS5sZWZ0TmV3ID0gTWF0aC5yb3VuZCh0LmxvY2FsQ29sdW1uV2lkdGggKiBpbmRleCk7XG4gICAgICAgICAgICAgICAgZGF0YS50b3BOZXcgPSAwO1xuXG4gICAgICAgICAgICAgICAgdC5jb2xWZXJ0LnB1c2goZGF0YS5oZWlnaHQgKyB0Lm9wdGlvbnMuZ2FwSG9yaXpvbnRhbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdC5zbGlkZXJDb2xWZXJ0ID0gdC5jb2xWZXJ0LnNsaWNlKHQuc2xpZGVyQWN0aXZlLCB0LnNsaWRlckFjdGl2ZSArIHQuY29scyk7XG5cbiAgICAgICAgICAgIHQudWxXaWR0aCA9IHQubG9jYWxDb2x1bW5XaWR0aCAqIHQuYmxvY2tzT24ubGVuZ3RoIC0gdC5vcHRpb25zLmdhcFZlcnRpY2FsO1xuICAgICAgICAgICAgdC4kdWwud2lkdGgodC51bFdpZHRoKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIF91cGRhdGVTbGlkZXJQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSAtdC5zbGlkZXJBY3RpdmUgKiB0LmxvY2FsQ29sdW1uV2lkdGg7XG5cbiAgICAgICAgICAgIHQuX3RyaWdnZXJFdmVudCgndXBkYXRlU2xpZGVyUG9zaXRpb24nKTtcblxuICAgICAgICAgICAgaWYgKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5tb2Rlcm5Ccm93c2VyKSB7XG4gICAgICAgICAgICAgICAgdC4kdWxbMF0uc3R5bGVbQ3ViZVBvcnRmb2xpby5Qcml2YXRlLnRyYW5zZm9ybV0gPSAndHJhbnNsYXRlM2QoJyArIHZhbHVlICsgJ3B4LCAwcHgsIDApJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdC4kdWxbMF0uc3R5bGUubGVmdCA9IHZhbHVlICsgJ3B4JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5zbGlkZXJDb2xWZXJ0ID0gdC5jb2xWZXJ0LnNsaWNlKHQuc2xpZGVyQWN0aXZlLCB0LnNsaWRlckFjdGl2ZSArIHQuY29scyk7XG5cbiAgICAgICAgICAgIHQuX3Jlc2l6ZU1haW5Db250YWluZXIoKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIF9kcmFnU2xpZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAkZG9jdW1lbnQgPSAkKGRvY3VtZW50KSxcbiAgICAgICAgICAgICAgICBwb3NJbml0aWFsLFxuICAgICAgICAgICAgICAgIHBvcyxcbiAgICAgICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICAgICAgdWxQb3NpdGlvbixcbiAgICAgICAgICAgICAgICB1bE1heFdpZHRoLFxuICAgICAgICAgICAgICAgIGlzQW5pbWF0aW5nID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgZXZlbnRzID0ge30sXG4gICAgICAgICAgICAgICAgaXNUb3VjaCA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRvdWNoU3RhcnRFdmVudCxcbiAgICAgICAgICAgICAgICBpc0hvdmVyID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHQuaXNEcmFnID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmICgoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB8fFxuICAgICAgICAgICAgICAgIChuYXZpZ2F0b3IubWF4VG91Y2hQb2ludHMgPiAwKSB8fFxuICAgICAgICAgICAgICAgIChuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyA+IDApKSB7XG5cbiAgICAgICAgICAgICAgICBldmVudHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiAndG91Y2hzdGFydC5jYnAnLFxuICAgICAgICAgICAgICAgICAgICBtb3ZlOiAndG91Y2htb3ZlLmNicCcsXG4gICAgICAgICAgICAgICAgICAgIGVuZDogJ3RvdWNoZW5kLmNicCdcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaXNUb3VjaCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV2ZW50cyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6ICdtb3VzZWRvd24uY2JwJyxcbiAgICAgICAgICAgICAgICAgICAgbW92ZTogJ21vdXNlbW92ZS5jYnAnLFxuICAgICAgICAgICAgICAgICAgICBlbmQ6ICdtb3VzZXVwLmNicCdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBkcmFnU3RhcnQoZSkge1xuICAgICAgICAgICAgICAgIGlmICh0LnNsaWRlckl0ZW1zTGVuZ3RoKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghaXNUb3VjaCkge1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2hTdGFydEV2ZW50ID0gZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodC5vcHRpb25zLmF1dG8pIHtcbiAgICAgICAgICAgICAgICAgICAgdC5fc3RvcFNsaWRlckF1dG8oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNBbmltYXRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0YXJnZXQpLm9uZSgnY2xpY2suY2JwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gJChlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgcG9zSW5pdGlhbCA9IHBvaW50ZXJFdmVudFRvWFkoZSkueDtcbiAgICAgICAgICAgICAgICBwb3MgPSAwO1xuICAgICAgICAgICAgICAgIHVsUG9zaXRpb24gPSAtdC5zbGlkZXJBY3RpdmUgKiB0LmxvY2FsQ29sdW1uV2lkdGg7XG4gICAgICAgICAgICAgICAgdWxNYXhXaWR0aCA9IHQubG9jYWxDb2x1bW5XaWR0aCAqICh0LmJsb2Nrc09uLmxlbmd0aCAtIHQuY29scyk7XG5cbiAgICAgICAgICAgICAgICAkZG9jdW1lbnQub24oZXZlbnRzLm1vdmUsIGRyYWdNb3ZlKTtcbiAgICAgICAgICAgICAgICAkZG9jdW1lbnQub24oZXZlbnRzLmVuZCwgZHJhZ0VuZCk7XG5cbiAgICAgICAgICAgICAgICB0LiRvYmouYWRkQ2xhc3MoJ2NicC1tb2RlLXNsaWRlci1kcmFnU3RhcnQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZHJhZ0VuZChlKSB7XG4gICAgICAgICAgICAgICAgdC4kb2JqLnJlbW92ZUNsYXNzKCdjYnAtbW9kZS1zbGlkZXItZHJhZ1N0YXJ0Jyk7XG5cbiAgICAgICAgICAgICAgICAvLyBwdXQgdGhlIHN0YXRlIHRvIGFuaW1hdGVcbiAgICAgICAgICAgICAgICBpc0FuaW1hdGluZyA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5vbmUoJ2NsaWNrLmNicCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0Ll9qdW1wRHJhZ1RvU2xpZGVyKHBvcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdC4kdWwub25lKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS50cmFuc2l0aW9uZW5kLCBhZnRlckRyYWdFbmQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFmdGVyRHJhZ0VuZC5jYWxsKHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICRkb2N1bWVudC5vZmYoZXZlbnRzLm1vdmUpO1xuICAgICAgICAgICAgICAgICRkb2N1bWVudC5vZmYoZXZlbnRzLmVuZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRyYWdNb3ZlKGUpIHtcbiAgICAgICAgICAgICAgICBwb3MgPSBwb3NJbml0aWFsIC0gcG9pbnRlckV2ZW50VG9YWShlKS54O1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvcyA+IDggfHwgcG9zIDwgLTgpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHQuaXNEcmFnID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHVsUG9zaXRpb24gLSBwb3M7XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zIDwgMCAmJiBwb3MgPCB1bFBvc2l0aW9uKSB7IC8vIHRvIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gKHVsUG9zaXRpb24gLSBwb3MpIC8gNTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBvcyA+IDAgJiYgKHVsUG9zaXRpb24gLSBwb3MpIDwgLXVsTWF4V2lkdGgpIHsgLy8gdG8gbGVmdFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IC11bE1heFdpZHRoICsgKHVsTWF4V2lkdGggKyB1bFBvc2l0aW9uIC0gcG9zKSAvIDU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5tb2Rlcm5Ccm93c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHQuJHVsWzBdLnN0eWxlW0N1YmVQb3J0Zm9saW8uUHJpdmF0ZS50cmFuc2Zvcm1dID0gJ3RyYW5zbGF0ZTNkKCcgKyB2YWx1ZSArICdweCwgMHB4LCAwKSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdC4kdWxbMF0uc3R5bGUubGVmdCA9IHZhbHVlICsgJ3B4JztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gYWZ0ZXJEcmFnRW5kKCkge1xuICAgICAgICAgICAgICAgIGlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdC5pc0RyYWcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmICh0Lm9wdGlvbnMuYXV0bykge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0Lm1vdXNlSXNFbnRlcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0Ll9zdGFydFNsaWRlckF1dG8oKTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gcG9pbnRlckV2ZW50VG9YWShlKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoZS5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgJiYgZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBlID0gZS5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgeDogZS5wYWdlWCxcbiAgICAgICAgICAgICAgICAgICAgeTogZS5wYWdlWVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQuJHVsLm9uKGV2ZW50cy5zdGFydCwgZHJhZ1N0YXJ0KTtcblxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc2V0IHRoZSBzbGlkZXIgbGF5b3V0XG4gICAgICAgICAqL1xuICAgICAgICBfc2xpZGVyTGF5b3V0UmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuICAgICAgICAgICAgdC5jb2xWZXJ0ID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gY3JlYXRlIG1hcmtcbiAgICAgICAgX2dyaWRNYXJrdXA6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFycmFuZ2UgdGhlIGl0ZW1zIGluIGEgZ3JpZCBsYXlvdXRcbiAgICAgICAgICovXG4gICAgICAgIF9ncmlkTGF5b3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgdC5ibG9ja3NPbi5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAgICAgICAgIHZhciBtaW5WZXJ0ID0gTWF0aC5taW4uYXBwbHkoTWF0aCwgdC5jb2xWZXJ0KSxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uID0gMCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9ICQoZWwpLmRhdGEoJ2NicCcpLFxuICAgICAgICAgICAgICAgICAgICBzZXRIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGNvbHNMZW4sXG4gICAgICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgICAgIGxlbjtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHQuY29sVmVydC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodC5jb2xWZXJ0W2ldID09PSBtaW5WZXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW4gPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHZhbHVlcyB3aXRoIHRoZSBuZXcgb25lc1xuICAgICAgICAgICAgICAgIGRhdGEubGVmdE5ldyA9IE1hdGgucm91bmQodC5sb2NhbENvbHVtbldpZHRoICogY29sdW1uKTtcbiAgICAgICAgICAgICAgICBkYXRhLnRvcE5ldyA9IE1hdGgucm91bmQobWluVmVydCk7XG5cbiAgICAgICAgICAgICAgICBzZXRIZWlnaHQgPSBtaW5WZXJ0ICsgZGF0YS5oZWlnaHQgKyB0Lm9wdGlvbnMuZ2FwSG9yaXpvbnRhbDtcbiAgICAgICAgICAgICAgICBjb2xzTGVuID0gdC5jb2xzICsgMSAtIGxlbjtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb2xzTGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdC5jb2xWZXJ0W2NvbHVtbiArIGldID0gc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzZXQgdGhlIGdyaWQgbGF5b3V0XG4gICAgICAgICAqL1xuICAgICAgICBfZ3JpZExheW91dFJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBjLCB0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gQG9wdGlvbnMgZ3JpZEFkanVzdG1lbnQgPSBhbGlnbkNlbnRlclxuICAgICAgICAgICAgaWYgKHQub3B0aW9ucy5ncmlkQWRqdXN0bWVudCA9PT0gJ2FsaWduQ2VudGVyJykge1xuXG4gICAgICAgICAgICAgICAgLy8gY2FsY3VsYXRlIG51bWJlcnMgb2YgY29sdW1uc1xuICAgICAgICAgICAgICAgIHQuY29scyA9IE1hdGgubWF4KE1hdGguZmxvb3IoKHQud2lkdGggKyB0Lm9wdGlvbnMuZ2FwVmVydGljYWwpIC8gdC5sb2NhbENvbHVtbldpZHRoKSwgMSk7XG5cbiAgICAgICAgICAgICAgICB0LndpZHRoID0gdC5jb2xzICogdC5sb2NhbENvbHVtbldpZHRoIC0gdC5vcHRpb25zLmdhcFZlcnRpY2FsO1xuICAgICAgICAgICAgICAgIHQuJG9iai5jc3MoJ21heC13aWR0aCcsIHQud2lkdGgpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgLy8gY2FsY3VsYXRlIG51bWJlcnMgb2YgY29sdW1uc1xuICAgICAgICAgICAgICAgIHQuY29scyA9IE1hdGgubWF4KE1hdGguZmxvb3IoKHQud2lkdGggKyB0Lm9wdGlvbnMuZ2FwVmVydGljYWwpIC8gdC5sb2NhbENvbHVtbldpZHRoKSwgMSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5jb2xWZXJ0ID0gW107XG4gICAgICAgICAgICBjID0gdC5jb2xzO1xuXG4gICAgICAgICAgICB3aGlsZSAoYy0tKSB7XG4gICAgICAgICAgICAgICAgdC5jb2xWZXJ0LnB1c2goMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1ha2UgdGhpcyBwbHVnaW4gcmVzcG9uc2l2ZVxuICAgICAgICAgKi9cbiAgICAgICAgX3Jlc3BvbnNpdmVMYXlvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHdpZHRoV2l0aG91dEdhcCxcbiAgICAgICAgICAgICAgICBpdGVtV2lkdGg7XG5cbiAgICAgICAgICAgIGlmICghdC5jb2x1bW5XaWR0aENhY2hlKSB7XG4gICAgICAgICAgICAgICAgdC5jb2x1bW5XaWR0aENhY2hlID0gdC5sb2NhbENvbHVtbldpZHRoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0LmxvY2FsQ29sdW1uV2lkdGggPSB0LmNvbHVtbldpZHRoQ2FjaGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNhbGN1bGF0ZSBudW1iZXJzIG9mIGNvbHNcbiAgICAgICAgICAgIHQuY29scyA9IHRbdC5nZXRDb2x1bW5zVHlwZV0oKTtcblxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSB3aXRoIG9mIGl0ZW1zIHdpdGhvdXQgdGhlIGdhcHMgYmV0d2VlbiB0aGVtXG4gICAgICAgICAgICB3aWR0aFdpdGhvdXRHYXAgPSB0LndpZHRoIC0gdC5vcHRpb25zLmdhcFZlcnRpY2FsICogKHQuY29scyAtIDEpO1xuXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgY29sdW1uIHdpdGggYmFzZWQgb24gd2lkdGhXaXRob3V0R2FwIHBsdXMgdGhlIGdhcFxuICAgICAgICAgICAgdC5sb2NhbENvbHVtbldpZHRoID0gcGFyc2VJbnQod2lkdGhXaXRob3V0R2FwIC8gdC5jb2xzLCAxMCkgKyB0Lm9wdGlvbnMuZ2FwVmVydGljYWw7XG5cbiAgICAgICAgICAgIGl0ZW1XaWR0aCA9ICh0LmxvY2FsQ29sdW1uV2lkdGggLSB0Lm9wdGlvbnMuZ2FwVmVydGljYWwpO1xuXG4gICAgICAgICAgICB0LmJsb2Nrcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5zdHlsZS53aWR0aCA9IGl0ZW1XaWR0aCArICdweCc7XG5cbiAgICAgICAgICAgICAgICAkKGl0ZW0pLmRhdGEoJ2NicCcpLndpZHRoID0gaXRlbVdpZHRoO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHQuYmxvY2tzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSAkKGVsKTtcblxuICAgICAgICAgICAgICAgIGl0ZW0uZGF0YSgnY2JwJykuaGVpZ2h0ID0gaXRlbS5vdXRlckhlaWdodCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgbnVtYmVycyBvZiBjb2x1bW5zIHdoZW4gdC5vcHRpb25zLm1lZGlhUXVlcmllcyBpcyBub3QgYW4gYXJyYXlcbiAgICAgICAgICovXG4gICAgICAgIF9nZXRDb2x1bW5zQXV0bzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoTWF0aC5yb3VuZCh0LndpZHRoIC8gdC5sb2NhbENvbHVtbldpZHRoKSwgMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldCBudW1iZXJzIG9mIGNvbHVtbnMgd2hlcmUgdC5vcHRpb25zLm1lZGlhUXVlcmllcyBpcyBhbiBhcnJheVxuICAgICAgICAgKi9cbiAgICAgICAgX2dldENvbHVtbnNCcmVha3BvaW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZ3JpZFdpZHRoID0gdC53aWR0aCAtIHQub3B0aW9ucy5nYXBWZXJ0aWNhbCxcbiAgICAgICAgICAgICAgICBjb2xzO1xuXG4gICAgICAgICAgICAkLmVhY2godC5vcHRpb25zLm1lZGlhUXVlcmllcywgZnVuY3Rpb24oaW5kZXgsIHZhbCkge1xuICAgICAgICAgICAgICAgIGlmIChncmlkV2lkdGggPj0gdmFsLndpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbHMgPSB2YWwuY29scztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoY29scyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29scyA9IHQub3B0aW9ucy5tZWRpYVF1ZXJpZXNbdC5vcHRpb25zLm1lZGlhUXVlcmllcy5sZW5ndGggLSAxXS5jb2xzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gY29scztcbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXNpemUgbWFpbiBjb250YWluZXIgdmVydGljYWxseVxuICAgICAgICAgKi9cbiAgICAgICAgX3Jlc2l6ZU1haW5Db250YWluZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNvbHMgPSB0LnNsaWRlckNvbFZlcnQgfHwgdC5jb2xWZXJ0LFxuICAgICAgICAgICAgICAgIGhlaWdodDtcblxuICAgICAgICAgICAgLy8gc2V0IGNvbnRhaW5lciBoZWlnaHQgZm9yIGBvdmVyZmxvdzogaGlkZGVuYCB0byBiZSBhcHBsaWVkXG4gICAgICAgICAgICBoZWlnaHQgPSBNYXRoLm1heChNYXRoLm1heC5hcHBseShNYXRoLCBjb2xzKSAtIHQub3B0aW9ucy5nYXBIb3Jpem9udGFsLCAwKTtcblxuICAgICAgICAgICAgaWYgKGhlaWdodCA9PT0gdC5oZWlnaHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQub2JqLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG5cbiAgICAgICAgICAgIC8vIGlmIF9yZXNpemVNYWluQ29udGFpbmVyIGlzIGNhbGxlZCBmb3IgdGhlIGZpcnN0IHRpbWUgc2tpcCB0aGlzIGV2ZW50IHRyaWdnZXJcbiAgICAgICAgICAgIGlmICh0LmhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5tb2Rlcm5Ccm93c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHQuJG9iai5vbmUoQ3ViZVBvcnRmb2xpby5Qcml2YXRlLnRyYW5zaXRpb25lbmQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC4kb2JqLnRyaWdnZXIoJ3BsdWdpblJlc2l6ZS5jYnAnKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdC4kb2JqLnRyaWdnZXIoJ3BsdWdpblJlc2l6ZS5jYnAnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB9LFxuXG4gICAgICAgIF9maWx0ZXI6IGZ1bmN0aW9uKGZpbHRlck5hbWUpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gYmxvY2tzIHRoYXQgYXJlIHZpc2libGUgYmVmb3JlIGFwcGx5aW5nIHRoZSBmaWx0ZXJcbiAgICAgICAgICAgIHQuYmxvY2tzT25Jbml0aWFsID0gdC5ibG9ja3NPbjtcblxuICAgICAgICAgICAgLy8gYmxvY2tzIHZpc2libGUgYWZ0ZXIgYXBwbHlpbmcgdGhlIGZpbHRlclxuICAgICAgICAgICAgdC5ibG9ja3NPbiA9IHQuYmxvY2tzLmZpbHRlcihmaWx0ZXJOYW1lKTtcblxuICAgICAgICAgICAgLy8gYmxvY2tzIG9mZiBhZnRlciBhcHBseWluZyB0aGUgZmlsdGVyXG4gICAgICAgICAgICB0LmJsb2Nrc09mZiA9IHQuYmxvY2tzLm5vdChmaWx0ZXJOYW1lKTtcblxuICAgICAgICAgICAgLy8gY2FsbCBsYXlvdXRcbiAgICAgICAgICAgIHQuX2xheW91dCgpO1xuXG4gICAgICAgICAgICAvLyBmaWx0ZXIgY2FsbCBsYXlvdXRcbiAgICAgICAgICAgIHQuZmlsdGVyTGF5b3V0KGZpbHRlck5hbWUpO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBEZWZhdWx0IGZpbHRlciBsYXlvdXQgaWYgbm90aGluZyBvdmVycmlkZXNcbiAgICAgICAgICovXG4gICAgICAgIGZpbHRlckxheW91dDogZnVuY3Rpb24oZmlsdGVyTmFtZSkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0LmJsb2Nrc09mZi5hZGRDbGFzcygnY2JwLWl0ZW0tb2ZmJyk7XG5cbiAgICAgICAgICAgIHQuYmxvY2tzT24ucmVtb3ZlQ2xhc3MoJ2NicC1pdGVtLW9mZicpXG4gICAgICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gJChlbCkuZGF0YSgnY2JwJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5sZWZ0ID0gZGF0YS5sZWZ0TmV3O1xuICAgICAgICAgICAgICAgICAgICBkYXRhLnRvcCA9IGRhdGEudG9wTmV3O1xuXG4gICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBkYXRhLmxlZnQgKyAncHgnO1xuICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBkYXRhLnRvcCArICdweCc7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIHJlc2l6ZSBtYWluIGNvbnRhaW5lciBoZWlnaHRcbiAgICAgICAgICAgIHQuX3Jlc2l6ZU1haW5Db250YWluZXIoKTtcblxuICAgICAgICAgICAgdC5maWx0ZXJGaW5pc2goKTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgVHJpZ2dlciB3aGVuIGEgZmlsdGVyIGlzIGZpbmlzaGVkXG4gICAgICAgICAqL1xuICAgICAgICBmaWx0ZXJGaW5pc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0LmlzQW5pbWF0aW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHQuJG9iai50cmlnZ2VyKCdmaWx0ZXJDb21wbGV0ZS5jYnAnKTtcbiAgICAgICAgICAgIHQuX3RyaWdnZXJFdmVudCgnZmlsdGVyRmluaXNoJyk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogIFJlZ2lzdGVyIGV2ZW50XG4gICAgICAgICAqL1xuICAgICAgICBfcmVnaXN0ZXJFdmVudDogZnVuY3Rpb24obmFtZSwgY2FsbGJhY2tGdW5jdGlvbiwgb25lVGltZSkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoIXQucmVnaXN0ZXJlZEV2ZW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIHQucmVnaXN0ZXJlZEV2ZW50c1tuYW1lXSA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0LnJlZ2lzdGVyZWRFdmVudHNbbmFtZV0ucHVzaCh7XG4gICAgICAgICAgICAgICAgZnVuYzogY2FsbGJhY2tGdW5jdGlvbixcbiAgICAgICAgICAgICAgICBvbmVUaW1lOiBvbmVUaW1lIHx8IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgVHJpZ2dlciBldmVudFxuICAgICAgICAgKi9cbiAgICAgICAgX3RyaWdnZXJFdmVudDogZnVuY3Rpb24obmFtZSwgcGFyYW0pIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpLCBsZW47XG5cbiAgICAgICAgICAgIGlmICh0LnNraXBFdmVudHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdC5za2lwRXZlbnRzW25hbWVdO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHQucmVnaXN0ZXJlZEV2ZW50c1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHQucmVnaXN0ZXJlZEV2ZW50c1tuYW1lXS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXG4gICAgICAgICAgICAgICAgICAgIHQucmVnaXN0ZXJlZEV2ZW50c1tuYW1lXVtpXS5mdW5jLmNhbGwodCwgcGFyYW0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0LnJlZ2lzdGVyZWRFdmVudHNbbmFtZV1baV0ub25lVGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC5yZWdpc3RlcmVkRXZlbnRzW25hbWVdLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZ1bmN0aW9uIHNwbGljZSBjaGFuZ2UgdGhlIHQucmVnaXN0ZXJlZEV2ZW50c1tuYW1lXSBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgZXZlbnQgaXMgb25lIHRpbWUgeW91IG11c3Qgc2V0IHRoZSBpIHRvIHRoZSBzYW1lIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBuZXh0IHRpbWUgYW5kIHNldCB0aGUgbGVuZ3RoIGxvd2VyXG4gICAgICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgICAgICAgICBsZW4tLTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICogIERlbGF5IHRyaWdnZXIgZXZlbnRcbiAgICAgICAgICovXG4gICAgICAgIF9za2lwTmV4dEV2ZW50OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG4gICAgICAgICAgICB0LnNraXBFdmVudHNbbmFtZV0gPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9hZGRJdGVtczogZnVuY3Rpb24oZWxzLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGl0ZW1zID0gJChlbHMpXG4gICAgICAgICAgICAgICAgLmZpbHRlcignLmNicC1pdGVtJylcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ2NicC1sb2FkaW5nLWZhZGVJbicpXG4gICAgICAgICAgICAgICAgLmNzcygndG9wJywgJzEwMDAlJylcbiAgICAgICAgICAgICAgICAud3JhcElubmVyKCc8ZGl2IGNsYXNzPVwiY2JwLWl0ZW0td3JhcHBlclwiPjwvZGl2PicpO1xuXG4gICAgICAgICAgICBpZiAoIWl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHQuaXNBbmltYXRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5fbG9hZChpdGVtcywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICB0LiRvYmouYWRkQ2xhc3MoJ2NicC1hZGRJdGVtcycpO1xuXG4gICAgICAgICAgICAgICAgaXRlbXMuYXBwZW5kVG8odC4kdWwpO1xuXG4gICAgICAgICAgICAgICAgLy8gY2FjaGUgdGhlIG5ldyBpdGVtcyB0byB0LmJsb2Nrc1xuICAgICAgICAgICAgICAgICQubWVyZ2UodC5ibG9ja3MsIGl0ZW1zKTtcblxuICAgICAgICAgICAgICAgIC8vIHB1c2ggdG8gZGF0YSBzb21lIHZhbHVlcyBvZiBpdGVtc1xuICAgICAgICAgICAgICAgIHQuc3RvcmVEYXRhKGl0ZW1zKTtcblxuICAgICAgICAgICAgICAgIGlmICh0LmRlZmF1bHRGaWx0ZXIgIT09ICcqJykge1xuICAgICAgICAgICAgICAgICAgICB0LmJsb2Nrc09uID0gdC5ibG9ja3MuZmlsdGVyKHQuZGVmYXVsdEZpbHRlcik7XG4gICAgICAgICAgICAgICAgICAgIHQuYmxvY2tzLm5vdCh0LmRlZmF1bHRGaWx0ZXIpLmFkZENsYXNzKCdjYnAtaXRlbS1vZmYnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0LmJsb2Nrc09uID0gdC5ibG9ja3M7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaXRlbXMub24oQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmFuaW1hdGlvbmVuZCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHQuJG9iai5maW5kKCcuY2JwLWxvYWRpbmctZmFkZUluJykucmVtb3ZlQ2xhc3MoJ2NicC1sb2FkaW5nLWZhZGVJbicpO1xuICAgICAgICAgICAgICAgICAgICB0LiRvYmoucmVtb3ZlQ2xhc3MoJ2NicC1hZGRJdGVtcycpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdC5fdHJpZ2dlckV2ZW50KCdhZGRJdGVtc1RvRE9NJywgaXRlbXMpO1xuXG4gICAgICAgICAgICAgICAgdC5fZ3JpZEFkanVzdCgpO1xuXG4gICAgICAgICAgICAgICAgdC5fbGF5b3V0KCk7XG5cbiAgICAgICAgICAgICAgICB0LnBvc2l0aW9uYXRlSXRlbXMoKTtcblxuICAgICAgICAgICAgICAgIC8vIHJlc2l6ZSBtYWluIGNvbnRhaW5lciBoZWlnaHRcbiAgICAgICAgICAgICAgICB0Ll9yZXNpemVNYWluQ29udGFpbmVyKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodC5vcHRpb25zLmxheW91dE1vZGUgPT09ICdzbGlkZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIHQuX3VwZGF0ZVNsaWRlcigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGlmIHNob3cgY291bnQgd2FzIGFjdGl2ZWQsIGNhbGwgc2hvdyBjb3VudCBmdW5jdGlvbiBhZ2FpblxuICAgICAgICAgICAgICAgIGlmICh0LmVsZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIEN1YmVQb3J0Zm9saW8uUHVibGljLnNob3dDb3VudGVyLmNhbGwodC5vYmosIHQuZWxlbXMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChDdWJlUG9ydGZvbGlvLlByaXZhdGUubW9kZXJuQnJvd3Nlcikge1xuICAgICAgICAgICAgICAgICAgICBpdGVtcy5sYXN0KCkub25lKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5hbmltYXRpb25lbmQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC5pc0FuaW1hdGluZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHQuaXNBbmltYXRpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG5cbiAgICB9KTtcblxuXG4gICAgLyoqXG4gICAgICogalF1ZXJ5IHBsdWdpbiBpbml0aWFsaXplclxuICAgICAqL1xuICAgICQuZm4uY3ViZXBvcnRmb2xpbyA9IGZ1bmN0aW9uKG1ldGhvZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcblxuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PT0gJ29iamVjdCcgfHwgIW1ldGhvZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBDdWJlUG9ydGZvbGlvLlB1YmxpYy5pbml0LmNhbGwodGhpcywgbWV0aG9kLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKEN1YmVQb3J0Zm9saW8uUHVibGljW21ldGhvZF0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQ3ViZVBvcnRmb2xpby5QdWJsaWNbbWV0aG9kXS5jYWxsKHRoaXMsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXRob2QgJyArIG1ldGhvZCArICcgZG9lcyBub3QgZXhpc3Qgb24ganF1ZXJ5LmN1YmVwb3J0Zm9saW8uanMnKTtcblxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICAvLyBQbHVnaW4gZGVmYXVsdCBvcHRpb25zXG4gICAgJC5mbi5jdWJlcG9ydGZvbGlvLm9wdGlvbnMgPSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgSXMgdXNlZCB0byBkZWZpbmUgdGhlIHdyYXBwZXIgZm9yIGZpbHRlcnNcbiAgICAgICAgICogIFZhbHVlczogc3RyaW5ncyB0aGF0IHJlcHJlc2VudCB0aGUgZWxlbWVudHMgaW4gdGhlIGRvY3VtZW50IChET00gc2VsZWN0b3IpLlxuICAgICAgICAgKi9cbiAgICAgICAgZmlsdGVyczogJycsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBJcyB1c2VkIHRvIGRlZmluZSB0aGUgd3JhcHBlciBmb3IgbG9hZE1vcmVcbiAgICAgICAgICogIFZhbHVlczogc3RyaW5ncyB0aGF0IHJlcHJlc2VudCB0aGUgZWxlbWVudHMgaW4gdGhlIGRvY3VtZW50IChET00gc2VsZWN0b3IpLlxuICAgICAgICAgKi9cbiAgICAgICAgbG9hZE1vcmU6ICcnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgSG93IHRoZSBsb2FkTW9yZSBmdW5jdGlvbmFsaXR5IHNob3VsZCBiZWhhdmUuIExvYWQgb24gY2xpY2sgb24gdGhlIGJ1dHRvbiBvclxuICAgICAgICAgKiAgYXV0b21hdGljYWxseSB3aGVuIHlvdSBzY3JvbGwgdGhlIHBhZ2VcbiAgICAgICAgICogIFZhbHVlczogLSBjbGlja1xuICAgICAgICAgKiAgICAgICAgICAtIGF1dG9cbiAgICAgICAgICovXG4gICAgICAgIGxvYWRNb3JlQWN0aW9uOiAnY2xpY2snLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgTGF5b3V0IE1vZGUgZm9yIHRoaXMgaW5zdGFuY2VcbiAgICAgICAgICogIFZhbHVlczogJ2dyaWQnIG9yICdzbGlkZXInXG4gICAgICAgICAqL1xuICAgICAgICBsYXlvdXRNb2RlOiAnZ3JpZCcsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBNb3VzZSBhbmQgdG91Y2ggZHJhZyBzdXBwb3J0XG4gICAgICAgICAqICBPcHRpb24gYXZhaWxhYmxlIG9ubHkgZm9yIGBsYXlvdXRNb2RlOiAnc2xpZGVyJ2BcbiAgICAgICAgICogIFZhbHVlczogdHJ1ZSBvciBmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgZHJhZzogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIEF1dG9wbGF5IHRoZSBzbGlkZXJcbiAgICAgICAgICogIE9wdGlvbiBhdmFpbGFibGUgb25seSBmb3IgYGxheW91dE1vZGU6ICdzbGlkZXInYFxuICAgICAgICAgKiAgVmFsdWVzOiB0cnVlIG9yIGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICBhdXRvOiBmYWxzZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIEF1dG9wbGF5IGludGVydmFsIHRpbWVvdXQuIFRpbWUgaXMgc2V0IGluIG1pbGlzZWNjb25kc1xuICAgICAgICAgKiAgMTAwMCBtaWxsaXNlY29uZHMgZXF1YWxzIDEgc2Vjb25kLlxuICAgICAgICAgKiAgT3B0aW9uIGF2YWlsYWJsZSBvbmx5IGZvciBgbGF5b3V0TW9kZTogJ3NsaWRlcidgXG4gICAgICAgICAqICBWYWx1ZXM6IG9ubHkgaW50ZWdlcnMgKGV4OiAxMDAwLCAyMDAwLCA1MDAwKVxuICAgICAgICAgKi9cbiAgICAgICAgYXV0b1RpbWVvdXQ6IDUwMDAsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBTdG9wcyBhdXRvcGxheSB3aGVuIHVzZXIgaG92ZXIgdGhlIHNsaWRlclxuICAgICAgICAgKiAgT3B0aW9uIGF2YWlsYWJsZSBvbmx5IGZvciBgbGF5b3V0TW9kZTogJ3NsaWRlcidgXG4gICAgICAgICAqICBWYWx1ZXM6IHRydWUgb3IgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIGF1dG9QYXVzZU9uSG92ZXI6IHRydWUsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBTaG93IGBuZXh0YCBhbmQgYHByZXZgIGJ1dHRvbnMgZm9yIHNsaWRlclxuICAgICAgICAgKiAgT3B0aW9uIGF2YWlsYWJsZSBvbmx5IGZvciBgbGF5b3V0TW9kZTogJ3NsaWRlcidgXG4gICAgICAgICAqICBWYWx1ZXM6IHRydWUgb3IgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIHNob3dOYXZpZ2F0aW9uOiB0cnVlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgU2hvdyBwYWdpbmF0aW9uIGZvciBzbGlkZXJcbiAgICAgICAgICogIE9wdGlvbiBhdmFpbGFibGUgb25seSBmb3IgYGxheW91dE1vZGU6ICdzbGlkZXInYFxuICAgICAgICAgKiAgVmFsdWVzOiB0cnVlIG9yIGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICBzaG93UGFnaW5hdGlvbjogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIEVuYWJsZSBzbGlkZSB0byBmaXJzdCBpdGVtIChsYXN0IGl0ZW0pXG4gICAgICAgICAqICBPcHRpb24gYXZhaWxhYmxlIG9ubHkgZm9yIGBsYXlvdXRNb2RlOiAnc2xpZGVyJ2BcbiAgICAgICAgICogIFZhbHVlczogdHJ1ZSBvciBmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgcmV3aW5kTmF2OiB0cnVlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgU2Nyb2xsIGJ5IHBhZ2UgYW5kIG5vdCBieSBpdGVtLiBUaGlzIG9wdGlvbiBhZmZlY3QgbmV4dC9wcmV2IGJ1dHRvbnMgYW5kIGRyYWcgc3VwcG9ydFxuICAgICAgICAgKiAgT3B0aW9uIGF2YWlsYWJsZSBvbmx5IGZvciBgbGF5b3V0TW9kZTogJ3NsaWRlcidgXG4gICAgICAgICAqICBWYWx1ZXM6IHRydWUgb3IgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIHNjcm9sbEJ5UGFnZTogZmFsc2UsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBEZWZhdWx0IGZpbHRlciBmb3IgcGx1Z2luXG4gICAgICAgICAqICBPcHRpb24gYXZhaWxhYmxlIG9ubHkgZm9yIGBsYXlvdXRNb2RlOiAnZ3JpZCdgXG4gICAgICAgICAqICBWYWx1ZXM6IHN0cmluZ3MgdGhhdCByZXByZXNlbnQgdGhlIGZpbHRlciBuYW1lKGV4OiAqLCAubG9nbywgLndlYi1kZXNpZ24sIC5kZXNpZ24pXG4gICAgICAgICAqL1xuICAgICAgICBkZWZhdWx0RmlsdGVyOiAnKicsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBFbmFibGUgLyBkaXNhYmxlIHRoZSBkZWVwbGlua2luZyBmZWF0dXJlIHdoZW4geW91IGNsaWNrIG9uIGZpbHRlcnNcbiAgICAgICAgICogIE9wdGlvbiBhdmFpbGFibGUgb25seSBmb3IgYGxheW91dE1vZGU6ICdncmlkJ2BcbiAgICAgICAgICogIFZhbHVlczogdHJ1ZSBvciBmYWxzZVxuICAgICAgICAgKi9cbiAgICAgICAgZmlsdGVyRGVlcGxpbmtpbmc6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgRGVmaW5lcyB3aGljaCBhbmltYXRpb24gdG8gdXNlIGZvciBpdGVtcyB0aGF0IHdpbGwgYmUgc2hvd24gb3IgaGlkZGVuIGFmdGVyIGEgZmlsdGVyIGhhcyBiZWVuIGFjdGl2YXRlZC5cbiAgICAgICAgICogIE9wdGlvbiBhdmFpbGFibGUgb25seSBmb3IgYGxheW91dE1vZGU6ICdncmlkJ2BcbiAgICAgICAgICogIFRoZSBwbHVnaW4gdXNlIHRoZSBiZXN0IGJyb3dzZXIgZmVhdHVyZXMgYXZhaWxhYmxlIChjc3MzIHRyYW5zaXRpb25zIGFuZCB0cmFuc2Zvcm0sIEdQVSBhY2NlbGVyYXRpb24pLlxuICAgICAgICAgKiAgVmFsdWVzOiAtIGZhZGVPdXRcbiAgICAgICAgICogICAgICAgICAgLSBxdWlja3NhbmRcbiAgICAgICAgICogICAgICAgICAgLSBib3VuY2VMZWZ0XG4gICAgICAgICAqICAgICAgICAgIC0gYm91bmNlVG9wXG4gICAgICAgICAqICAgICAgICAgIC0gYm91bmNlQm90dG9tXG4gICAgICAgICAqICAgICAgICAgIC0gbW92ZUxlZnRcbiAgICAgICAgICogICAgICAgICAgLSBzbGlkZUxlZnRcbiAgICAgICAgICogICAgICAgICAgLSBmYWRlT3V0VG9wXG4gICAgICAgICAqICAgICAgICAgIC0gc2VxdWVudGlhbGx5XG4gICAgICAgICAqICAgICAgICAgIC0gc2tld1xuICAgICAgICAgKiAgICAgICAgICAtIHNsaWRlRGVsYXlcbiAgICAgICAgICogICAgICAgICAgLSByb3RhdGVTaWRlc1xuICAgICAgICAgKiAgICAgICAgICAtIGZsaXBPdXREZWxheVxuICAgICAgICAgKiAgICAgICAgICAtIGZsaXBPdXRcbiAgICAgICAgICogICAgICAgICAgLSB1bmZvbGRcbiAgICAgICAgICogICAgICAgICAgLSBmb2xkTGVmdFxuICAgICAgICAgKiAgICAgICAgICAtIHNjYWxlRG93blxuICAgICAgICAgKiAgICAgICAgICAtIHNjYWxlU2lkZXNcbiAgICAgICAgICogICAgICAgICAgLSBmcm9udFJvd1xuICAgICAgICAgKiAgICAgICAgICAtIGZsaXBCb3R0b21cbiAgICAgICAgICogICAgICAgICAgLSByb3RhdGVSb29tXG4gICAgICAgICAqL1xuICAgICAgICBhbmltYXRpb25UeXBlOiAnZmFkZU91dCcsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBBZGp1c3QgdGhlIGxheW91dCBncmlkXG4gICAgICAgICAqICBWYWx1ZXM6IC0gZGVmYXVsdCAobm8gYWRqdXN0bWVudCBhcHBsaWVkKVxuICAgICAgICAgKiAgICAgICAgICAtIGFsaWduQ2VudGVyIChhbGlnbiB0aGUgZ3JpZCBvbiBjZW50ZXIgb2YgdGhlIHBhZ2UpXG4gICAgICAgICAqICAgICAgICAgIC0gcmVzcG9uc2l2ZSAodXNlIGEgZmx1aWQgZ3JpZCB0byByZXNpemUgdGhlIGdyaWQpXG4gICAgICAgICAqL1xuICAgICAgICBncmlkQWRqdXN0bWVudDogJ3Jlc3BvbnNpdmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWZpbmUgYG1lZGlhIHF1ZXJpZXNgIGZvciBjb2x1bW5zIGxheW91dC5cbiAgICAgICAgICogRm9ybWF0OiBbe3dpZHRoOiBhLCBjb2xzOiBkfSwge3dpZHRoOiBiLCBjb2xzOiBlfSwge3dpZHRoOiBjLCBjb2xzOiBmfV0sXG4gICAgICAgICAqIHdoZXJlIGEsIGIsIGMgYXJlIHRoZSBncmlkIHdpZHRoIGFuZCBkLCBlLCBmIGFyZSB0aGUgY29sdW1ucyBkaXNwbGF5ZWQuXG4gICAgICAgICAqIGUuZy4gW3t3aWR0aDogMTEwMCwgY29sczogNH0sIHt3aWR0aDogODAwLCBjb2xzOiAzfSwge3dpZHRoOiA0ODAsIGNvbHM6IDJ9XSBtZWFuc1xuICAgICAgICAgKiBpZiAoZ3JpZFdpZHRoID49IDExMDApID0+IHNob3cgNCBjb2x1bW5zLFxuICAgICAgICAgKiBpZiAoZ3JpZFdpZHRoID49IDgwMCAmJiBncmlkV2lkdGggPCAxMTAwKSA9PiBzaG93IDMgY29sdW1ucyxcbiAgICAgICAgICogaWYgKGdyaWRXaWR0aCA+PSA0ODAgJiYgZ3JpZFdpZHRoIDwgODAwKSA9PiBzaG93IDIgY29sdW1ucyxcbiAgICAgICAgICogaWYgKGdyaWRXaWR0aCA8IDQ4MCkgPT4gc2hvdyAyIGNvbHVtbnNcbiAgICAgICAgICogS2VlcCBpbiBtaW5kIHRoYXQgYSA+IGIgPiBjXG4gICAgICAgICAqIFRoaXMgb3B0aW9uIGlzIGF2YWlsYWJsZSBvbmx5IHdoZW4gYGdyaWRBZGp1c3RtZW50OiAncmVzcG9uc2l2ZSdgXG4gICAgICAgICAqIFZhbHVlczogIC0gYXJyYXkgb2Ygb2JqZWN0cyBvZiBmb3JtYXQ6IFt7d2lkdGg6IGEsIGNvbHM6IGR9LCB7d2lkdGg6IGIsIGNvbHM6IGV9XVxuICAgICAgICAgKiAgICAgICAgICAtIHlvdSBjYW4gZGVmaW5lIGFzIG1hbnkgb2JqZWN0cyBhcyB5b3Ugd2FudFxuICAgICAgICAgKiAgICAgICAgICAtIGlmIHRoaXMgb3B0aW9uIGlzIGBmYWxzZWAgQ3ViZSBQb3J0Zm9saW8gd2lsbCBhZGp1c3QgdGhlIGl0ZW1zXG4gICAgICAgICAqICAgICAgICAgICAgd2lkdGggYXV0b21hdGljYWxseSAoZGVmYXVsdCBvcHRpb24gZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpXG4gICAgICAgICAqL1xuICAgICAgICBtZWRpYVF1ZXJpZXM6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgSG9yaXpvbnRhbCBnYXAgYmV0d2VlbiBpdGVtc1xuICAgICAgICAgKiAgVmFsdWVzOiBvbmx5IGludGVnZXJzIChleDogMSwgNSwgMTApXG4gICAgICAgICAqL1xuICAgICAgICBnYXBIb3Jpem9udGFsOiAxMCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIFZlcnRpY2FsIGdhcCBiZXR3ZWVuIGl0ZW1zXG4gICAgICAgICAqICBWYWx1ZXM6IG9ubHkgaW50ZWdlcnMgKGV4OiAxLCA1LCAxMClcbiAgICAgICAgICovXG4gICAgICAgIGdhcFZlcnRpY2FsOiAxMCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIENhcHRpb24gLSB0aGUgb3ZlcmxheSB0aGF0IGlzIHNob3duIHdoZW4geW91IHB1dCB0aGUgbW91c2Ugb3ZlciBhbiBpdGVtXG4gICAgICAgICAqICBOT1RFOiBJZiB5b3UgZG9uJ3Qgd2FudCB0byBoYXZlIGNhcHRpb25zIHNldCB0aGlzIG9wdGlvbiB0byBhbiBlbXB0eSBzdHJpbmcgKCBjYXB0aW9uOiAnJylcbiAgICAgICAgICogIFZhbHVlczogLSBwdXNoVG9wXG4gICAgICAgICAqICAgICAgICAgIC0gcHVzaERvd25cbiAgICAgICAgICogICAgICAgICAgLSByZXZlYWxCb3R0b21cbiAgICAgICAgICogICAgICAgICAgLSByZXZlYWxUb3BcbiAgICAgICAgICogICAgICAgICAgLSBtb3ZlUmlnaHRcbiAgICAgICAgICogICAgICAgICAgLSBtb3ZlTGVmdFxuICAgICAgICAgKiAgICAgICAgICAtIG92ZXJsYXlCb3R0b21QdXNoXG4gICAgICAgICAqICAgICAgICAgIC0gb3ZlcmxheUJvdHRvbVxuICAgICAgICAgKiAgICAgICAgICAtIG92ZXJsYXlCb3R0b21SZXZlYWxcbiAgICAgICAgICogICAgICAgICAgLSBvdmVybGF5Qm90dG9tQWxvbmdcbiAgICAgICAgICogICAgICAgICAgLSBvdmVybGF5UmlnaHRBbG9uZ1xuICAgICAgICAgKiAgICAgICAgICAtIG1pbmltYWxcbiAgICAgICAgICogICAgICAgICAgLSBmYWRlSW5cbiAgICAgICAgICogICAgICAgICAgLSB6b29tXG4gICAgICAgICAqICAgICAgICAgIC0gb3BhY2l0eVxuICAgICAgICAgKi9cbiAgICAgICAgY2FwdGlvbjogJ3B1c2hUb3AnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgVGhlIHBsdWdpbiB3aWxsIGRpc3BsYXkgaGlzIGNvbnRlbnQgYmFzZWQgb24gdGhlIGZvbGxvd2luZyB2YWx1ZXMuXG4gICAgICAgICAqICBWYWx1ZXM6IC0gZGVmYXVsdCAodGhlIGNvbnRlbnQgd2lsbCBiZSBkaXNwbGF5ZWQgYXMgc29vbiBhcyBwb3NzaWJsZSlcbiAgICAgICAgICogICAgICAgICAgLSBsYXp5TG9hZGluZyAodGhlIHBsdWdpbiB3aWxsIGZ1bGx5IHByZWxvYWQgdGhlIGltYWdlcyBiZWZvcmUgZGlzcGxheWluZyB0aGUgaXRlbXMgd2l0aCBhIGZhZGVJbiBlZmZlY3QpXG4gICAgICAgICAqICAgICAgICAgIC0gZmFkZUluVG9Ub3AgKHRoZSBwbHVnaW4gd2lsbCBmdWxseSBwcmVsb2FkIHRoZSBpbWFnZXMgYmVmb3JlIGRpc3BsYXlpbmcgdGhlIGl0ZW1zIHdpdGggYSBmYWRlSW4gZWZmZWN0IGZyb20gYm90dG9tIHRvIHRvcClcbiAgICAgICAgICogICAgICAgICAgLSBzZXF1ZW50aWFsbHkgKHRoZSBwbHVnaW4gd2lsbCBmdWxseSBwcmVsb2FkIHRoZSBpbWFnZXMgYmVmb3JlIGRpc3BsYXlpbmcgdGhlIGl0ZW1zIHdpdGggYSBzZXF1ZW50aWFsbHkgZWZmZWN0KVxuICAgICAgICAgKiAgICAgICAgICAtIGJvdHRvbVRvVG9wICh0aGUgcGx1Z2luIHdpbGwgZnVsbHkgcHJlbG9hZCB0aGUgaW1hZ2VzIGJlZm9yZSBkaXNwbGF5aW5nIHRoZSBpdGVtcyB3aXRoIGFuIGFuaW1hdGlvbiBmcm9tIGJvdHRvbSB0byB0b3ApXG4gICAgICAgICAqL1xuICAgICAgICBkaXNwbGF5VHlwZTogJ2xhenlMb2FkaW5nJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIERlZmluZXMgdGhlIHNwZWVkIG9mIGRpc3BsYXlpbmcgdGhlIGl0ZW1zICh3aGVuIGBkaXNwbGF5VHlwZSA9PSBkZWZhdWx0YCB0aGlzIG9wdGlvbiB3aWxsIGhhdmUgbm8gZWZmZWN0KVxuICAgICAgICAgKiAgVmFsdWVzOiBvbmx5IGludGVnZXJzLCB2YWx1ZXMgaW4gbXMgKGV4OiAyMDAsIDMwMCwgNTAwKVxuICAgICAgICAgKi9cbiAgICAgICAgZGlzcGxheVR5cGVTcGVlZDogNDAwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgVGhpcyBpcyB1c2VkIHRvIGRlZmluZSBhbnkgY2xpY2thYmxlIGVsZW1lbnRzIHlvdSB3aXNoIHRvIHVzZSB0byB0cmlnZ2VyIGxpZ2h0Ym94IHBvcHVwIG9uIGNsaWNrLlxuICAgICAgICAgKiAgVmFsdWVzOiBzdHJpbmdzIHRoYXQgcmVwcmVzZW50IHRoZSBlbGVtZW50cyBpbiB0aGUgZG9jdW1lbnQgKERPTSBzZWxlY3RvcilcbiAgICAgICAgICovXG4gICAgICAgIGxpZ2h0Ym94RGVsZWdhdGU6ICcuY2JwLWxpZ2h0Ym94JyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIEVuYWJsZSAvIGRpc2FibGUgZ2FsbGVyeSBtb2RlXG4gICAgICAgICAqICBWYWx1ZXM6IHRydWUgb3IgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIGxpZ2h0Ym94R2FsbGVyeTogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIEF0dHJpYnV0ZSBvZiB0aGUgZGVsZWdhdGUgaXRlbSB0aGF0IGNvbnRhaW5zIGNhcHRpb24gZm9yIGxpZ2h0Ym94XG4gICAgICAgICAqICBWYWx1ZXM6IGh0bWwgYXRyaWJ1dHRlXG4gICAgICAgICAqL1xuICAgICAgICBsaWdodGJveFRpdGxlU3JjOiAnZGF0YS10aXRsZScsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBNYXJrdXAgb2YgdGhlIGxpZ2h0Ym94IGNvdW50ZXJcbiAgICAgICAgICogIFZhbHVlczogaHRtbCBtYXJrdXBcbiAgICAgICAgICovXG4gICAgICAgIGxpZ2h0Ym94Q291bnRlcjogJzxkaXYgY2xhc3M9XCJjYnAtcG9wdXAtbGlnaHRib3gtY291bnRlclwiPnt7Y3VycmVudH19IG9mIHt7dG90YWx9fTwvZGl2PicsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBUaGlzIGlzIHVzZWQgdG8gZGVmaW5lIGFueSBjbGlja2FibGUgZWxlbWVudHMgeW91IHdpc2ggdG8gdXNlIHRvIHRyaWdnZXIgc2luZ2xlUGFnZSBwb3B1cCBvbiBjbGljay5cbiAgICAgICAgICogIFZhbHVlczogc3RyaW5ncyB0aGF0IHJlcHJlc2VudCB0aGUgZWxlbWVudHMgaW4gdGhlIGRvY3VtZW50IChET00gc2VsZWN0b3IpXG4gICAgICAgICAqL1xuICAgICAgICBzaW5nbGVQYWdlRGVsZWdhdGU6ICcuY2JwLXNpbmdsZVBhZ2UnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgRW5hYmxlIC8gZGlzYWJsZSB0aGUgZGVlcGxpbmtpbmcgZmVhdHVyZSBmb3Igc2luZ2xlUGFnZSBwb3B1cFxuICAgICAgICAgKiAgVmFsdWVzOiB0cnVlIG9yIGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICBzaW5nbGVQYWdlRGVlcGxpbmtpbmc6IHRydWUsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBFbmFibGUgLyBkaXNhYmxlIHRoZSBzdGlja3kgbmF2aWdhdGlvbiBmb3Igc2luZ2xlUGFnZSBwb3B1cFxuICAgICAgICAgKiAgVmFsdWVzOiB0cnVlIG9yIGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICBzaW5nbGVQYWdlU3RpY2t5TmF2aWdhdGlvbjogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIE1hcmt1cCBvZiB0aGUgc2luZ2xlUGFnZSBjb3VudGVyXG4gICAgICAgICAqICBWYWx1ZXM6IGh0bWwgbWFya3VwXG4gICAgICAgICAqL1xuICAgICAgICBzaW5nbGVQYWdlQ291bnRlcjogJzxkaXYgY2xhc3M9XCJjYnAtcG9wdXAtc2luZ2xlUGFnZS1jb3VudGVyXCI+e3tjdXJyZW50fX0gb2Yge3t0b3RhbH19PC9kaXY+JyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIERlZmluZXMgd2hpY2ggYW5pbWF0aW9uIHRvIHVzZSB3aGVuIHNpbmdsZVBhZ2UgYXBwZWFyXG4gICAgICAgICAqICBWYWx1ZXM6IC0gbGVmdFxuICAgICAgICAgKiAgICAgICAgICAtIGZhZGVcbiAgICAgICAgICogICAgICAgICAgLSByaWdodFxuICAgICAgICAgKi9cbiAgICAgICAgc2luZ2xlUGFnZUFuaW1hdGlvbjogJ2xlZnQnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgVXNlIHRoaXMgY2FsbGJhY2sgdG8gdXBkYXRlIHNpbmdsZVBhZ2UgY29udGVudC5cbiAgICAgICAgICogIFRoZSBjYWxsYmFjayB3aWxsIHRyaWdnZXIgYWZ0ZXIgdGhlIHNpbmdsZVBhZ2UgcG9wdXAgd2lsbCBvcGVuLlxuICAgICAgICAgKiAgQHBhcmFtIHVybCA9IHRoZSBocmVmIGF0dHJpYnV0ZSBvZiB0aGUgaXRlbSBjbGlja2VkXG4gICAgICAgICAqICBAcGFyYW0gZWxlbWVudCA9IHRoZSBpdGVtIGNsaWNrZWRcbiAgICAgICAgICogIFZhbHVlczogZnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIHNpbmdsZVBhZ2VDYWxsYmFjazogZnVuY3Rpb24odXJsLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAvLyB0byB1cGRhdGUgc2luZ2xlUGFnZSBjb250ZW50IHVzZSB0aGUgZm9sbG93aW5nIG1ldGhvZDogdGhpcy51cGRhdGVTaW5nbGVQYWdlKHlvdXJDb250ZW50KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAgVGhpcyBpcyB1c2VkIHRvIGRlZmluZSBhbnkgY2xpY2thYmxlIGVsZW1lbnRzIHlvdSB3aXNoIHRvIHVzZSB0byB0cmlnZ2VyIHNpbmdsZVBhZ2UgSW5saW5lIG9uIGNsaWNrLlxuICAgICAgICAgKiAgVmFsdWVzOiBzdHJpbmdzIHRoYXQgcmVwcmVzZW50IHRoZSBlbGVtZW50cyBpbiB0aGUgZG9jdW1lbnQgKERPTSBzZWxlY3RvcilcbiAgICAgICAgICovXG4gICAgICAgIHNpbmdsZVBhZ2VJbmxpbmVEZWxlZ2F0ZTogJy5jYnAtc2luZ2xlUGFnZUlubGluZScsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqICBUaGlzIGlzIHVzZWQgdG8gZGVmaW5lIHRoZSBwb3NpdGlvbiBvZiBzaW5nbGVQYWdlIElubGluZSBibG9ja1xuICAgICAgICAgKiAgVmFsdWVzOiAtIGFib3ZlICggYWJvdmUgY3VycmVudCBlbGVtZW50IClcbiAgICAgICAgICogICAgICAgICAgLSBiZWxvdyAoIGJlbG93IGN1cnJlbnQgZWxlbW5ldClcbiAgICAgICAgICogICAgICAgICAgLSB0b3AgKCBwb3NpdG9uIHRvcCApXG4gICAgICAgICAqICAgICAgICAgIC0gYm90dG9tICggcG9zaXRvbiBib3R0b20gKVxuICAgICAgICAgKi9cbiAgICAgICAgc2luZ2xlUGFnZUlubGluZVBvc2l0aW9uOiAndG9wJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIFB1c2ggdGhlIG9wZW4gcGFuZWwgaW4gZm9jdXMgYW5kIGF0IGNsb3NlIGdvIGJhY2sgdG8gdGhlIGZvcm1lciBzdGFnZVxuICAgICAgICAgKiAgVmFsdWVzOiB0cnVlIG9yIGZhbHNlXG4gICAgICAgICAqL1xuICAgICAgICBzaW5nbGVQYWdlSW5saW5lSW5Gb2N1czogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogIFVzZSB0aGlzIGNhbGxiYWNrIHRvIHVwZGF0ZSBzaW5nbGVQYWdlIElubGluZSBjb250ZW50LlxuICAgICAgICAgKiAgVGhlIGNhbGxiYWNrIHdpbGwgdHJpZ2dlciBhZnRlciB0aGUgc2luZ2xlUGFnZSBJbmxpbmUgd2lsbCBvcGVuLlxuICAgICAgICAgKiAgQHBhcmFtIHVybCA9IHRoZSBocmVmIGF0dHJpYnV0ZSBvZiB0aGUgaXRlbSBjbGlja2VkXG4gICAgICAgICAqICBAcGFyYW0gZWxlbWVudCA9IHRoZSBpdGVtIGNsaWNrZWRcbiAgICAgICAgICogIFZhbHVlczogZnVuY3Rpb25cbiAgICAgICAgICovXG4gICAgICAgIHNpbmdsZVBhZ2VJbmxpbmVDYWxsYmFjazogZnVuY3Rpb24odXJsLCBlbGVtZW50KSB7XG4gICAgICAgICAgICAvLyB0byB1cGRhdGUgc2luZ2xlUGFnZSBJbmxpbmUgY29udGVudCB1c2UgdGhlIGZvbGxvd2luZyBtZXRob2Q6IHRoaXMudXBkYXRlU2luZ2xlUGFnZUlubGluZSh5b3VyQ29udGVudClcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIEN1YmVQb3J0Zm9saW8uUGx1Z2lucyA9IHt9O1xuICAgICQuZm4uY3ViZXBvcnRmb2xpby5Db25zdHJ1Y3RvciA9IEN1YmVQb3J0Zm9saW87XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cbihmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQ3ViZVBvcnRmb2xpbyA9ICQuZm4uY3ViZXBvcnRmb2xpby5Db25zdHJ1Y3RvcjtcblxuICAgIGZ1bmN0aW9uIEZpbHRlcnMocGFyZW50KSB7XG4gICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICB0LnBhcmVudCA9IHBhcmVudDtcblxuICAgICAgICB0LmZpbHRlcnMgPSAkKHBhcmVudC5vcHRpb25zLmZpbHRlcnMpO1xuXG4gICAgICAgIHQud3JhcCA9ICQoKTtcblxuICAgICAgICB0LnJlZ2lzdGVyRmlsdGVyKCk7XG5cbiAgICB9XG5cbiAgICBGaWx0ZXJzLnByb3RvdHlwZS5yZWdpc3RlckZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICBwYXJlbnQgPSB0LnBhcmVudCxcbiAgICAgICAgICAgIGZpbHRlcnNDYWxsYmFjaztcblxuICAgICAgICB0LmZpbHRlcnMuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcbiAgICAgICAgICAgIHZhciBmaWx0ZXIgPSAkKGVsKSxcbiAgICAgICAgICAgICAgICB3cmFwO1xuXG4gICAgICAgICAgICBpZiAoZmlsdGVyLmhhc0NsYXNzKCdjYnAtbC1maWx0ZXJzLWRyb3Bkb3duJykpIHtcbiAgICAgICAgICAgICAgICB3cmFwID0gZmlsdGVyLmZpbmQoJy5jYnAtbC1maWx0ZXJzLWRyb3Bkb3duV3JhcCcpO1xuXG4gICAgICAgICAgICAgICAgd3JhcC5vbih7XG4gICAgICAgICAgICAgICAgICAgICdtb3VzZW92ZXIuY2JwJzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3cmFwLmFkZENsYXNzKCdjYnAtbC1maWx0ZXJzLWRyb3Bkb3duV3JhcC1vcGVuJyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICdtb3VzZWxlYXZlLmNicCc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd3JhcC5yZW1vdmVDbGFzcygnY2JwLWwtZmlsdGVycy1kcm9wZG93bldyYXAtb3BlbicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBmaWx0ZXJzQ2FsbGJhY2sgPSBmdW5jdGlvbihtZSkge1xuICAgICAgICAgICAgICAgICAgICB3cmFwLmZpbmQoJy5jYnAtZmlsdGVyLWl0ZW0nKS5yZW1vdmVDbGFzcygnY2JwLWZpbHRlci1pdGVtLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICB3cmFwLmZpbmQoJy5jYnAtbC1maWx0ZXJzLWRyb3Bkb3duSGVhZGVyJykudGV4dChtZS50ZXh0KCkpO1xuICAgICAgICAgICAgICAgICAgICBtZS5hZGRDbGFzcygnY2JwLWZpbHRlci1pdGVtLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICB3cmFwLnRyaWdnZXIoJ21vdXNlbGVhdmUuY2JwJyk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHQud3JhcC5hZGQod3JhcCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyc0NhbGxiYWNrID0gZnVuY3Rpb24obWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbWUuYWRkQ2xhc3MoJ2NicC1maWx0ZXItaXRlbS1hY3RpdmUnKS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdjYnAtZmlsdGVyLWl0ZW0tYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZmlsdGVyc0NhbGxiYWNrKFxuICAgICAgICAgICAgICAgIGZpbHRlclxuICAgICAgICAgICAgICAgIC5maW5kKCcuY2JwLWZpbHRlci1pdGVtJylcbiAgICAgICAgICAgICAgICAuZmlsdGVyKCdbZGF0YS1maWx0ZXI9XCInICsgcGFyZW50LmRlZmF1bHRGaWx0ZXIgKyAnXCJdJylcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGZpbHRlci5vbignY2xpY2suY2JwJywgJy5jYnAtZmlsdGVyLWl0ZW0nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWUgPSAkKHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1lLmhhc0NsYXNzKCdjYnAtZmlsdGVyLWl0ZW0tYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGdldCBjdWJlcG9ydGZvbGlvIGRhdGEgYW5kIGNoZWNrIGlmIGlzIHN0aWxsIGFuaW1hdGluZyAocmVwb3NpdGlvbikgdGhlIGl0ZW1zLlxuICAgICAgICAgICAgICAgIGlmICghcGFyZW50LmlzQW5pbWF0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnNDYWxsYmFjay5jYWxsKG51bGwsIG1lKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgdGhlIGl0ZW1zXG4gICAgICAgICAgICAgICAgcGFyZW50LiRvYmouY3ViZXBvcnRmb2xpbygnZmlsdGVyJywgbWUuZGF0YSgnZmlsdGVyJykpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFjdGl2YXRlIGNvdW50ZXIgZm9yIGZpbHRlcnNcbiAgICAgICAgICAgIHBhcmVudC4kb2JqLmN1YmVwb3J0Zm9saW8oJ3Nob3dDb3VudGVyJywgZmlsdGVyLmZpbmQoJy5jYnAtZmlsdGVyLWl0ZW0nKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVhZCBmcm9tIHVybCBhbmQgY2hhbmdlIGZpbHRlciBhY3RpdmVcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSAvI2NicGY9KC4qPykoWyN8PyZdfCQpL2dpLmV4ZWMobG9jYXRpb24uaHJlZiksXG4gICAgICAgICAgICAgICAgICAgIGl0ZW07XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0gPSBmaWx0ZXIuZmluZCgnLmNicC1maWx0ZXItaXRlbScpLmZpbHRlcignW2RhdGEtZmlsdGVyPVwiJyArIG1hdGNoWzFdICsgJ1wiXScpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcnNDYWxsYmFjay5jYWxsKG51bGwsIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBGaWx0ZXJzLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICB0LmZpbHRlcnMub2ZmKCcuY2JwJyk7XG4gICAgICAgIGlmICh0LndyYXApIHtcbiAgICAgICAgICAgIHQud3JhcC5vZmYoJy5jYnAnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDdWJlUG9ydGZvbGlvLlBsdWdpbnMuRmlsdGVycyA9IGZ1bmN0aW9uKHBhcmVudCkge1xuXG4gICAgICAgIGlmIChwYXJlbnQub3B0aW9ucy5maWx0ZXJzID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IEZpbHRlcnMocGFyZW50KTtcbiAgICB9O1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuXG4oZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEN1YmVQb3J0Zm9saW8gPSAkLmZuLmN1YmVwb3J0Zm9saW8uQ29uc3RydWN0b3I7XG5cbiAgICBmdW5jdGlvbiBMb2FkTW9yZShwYXJlbnQpIHtcbiAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgIHQucGFyZW50ID0gcGFyZW50O1xuXG4gICAgICAgIHQubG9hZE1vcmUgPSAkKHBhcmVudC5vcHRpb25zLmxvYWRNb3JlKS5maW5kKCcuY2JwLWwtbG9hZE1vcmUtbGluaycpO1xuXG4gICAgICAgIC8vIGxvYWQgY2xpY2sgb3IgYXV0byBhY3Rpb25cbiAgICAgICAgaWYgKHBhcmVudC5vcHRpb25zLmxvYWRNb3JlQWN0aW9uLmxlbmd0aCkge1xuICAgICAgICAgICAgdFtwYXJlbnQub3B0aW9ucy5sb2FkTW9yZUFjdGlvbl0oKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgTG9hZE1vcmUucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0ID0gdGhpcyxcbiAgICAgICAgICAgIG51bWJlck9mQ2xpY2tzID0gMDtcblxuICAgICAgICB0LmxvYWRNb3JlLm9uKCdjbGljay5jYnAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9ICQodGhpcyk7XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaWYgKGl0ZW0uaGFzQ2xhc3MoJ2NicC1sLWxvYWRNb3JlLXN0b3AnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc2V0IGxvYWRpbmcgc3RhdHVzXG4gICAgICAgICAgICBpdGVtLmFkZENsYXNzKCdjYnAtbC1sb2FkTW9yZS1sb2FkaW5nJyk7XG5cbiAgICAgICAgICAgIG51bWJlck9mQ2xpY2tzKys7XG5cbiAgICAgICAgICAgIC8vIHBlcmZvcm0gYWpheCByZXF1ZXN0XG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogdC5sb2FkTW9yZS5hdHRyKCdocmVmJyksXG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdIVE1MJ1xuICAgICAgICAgICAgfSkuZG9uZShmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMsIGl0ZW1zTmV4dDtcblxuICAgICAgICAgICAgICAgIC8vIGZpbmQgY3VycmVudCBjb250YWluZXJcbiAgICAgICAgICAgICAgICBpdGVtcyA9ICQocmVzdWx0KS5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkKHRoaXMpLmlzKCdkaXYnICsgJy5jYnAtbG9hZE1vcmUtYmxvY2snICsgbnVtYmVyT2ZDbGlja3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdC5wYXJlbnQuJG9iai5jdWJlcG9ydGZvbGlvKCdhcHBlbmRJdGVtcycsIGl0ZW1zLmh0bWwoKSwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcHV0IHRoZSBvcmlnaW5hbCBtZXNzYWdlIGJhY2tcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5yZW1vdmVDbGFzcygnY2JwLWwtbG9hZE1vcmUtbG9hZGluZycpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHdlIGhhdmUgbW9yZSB3b3Jrc1xuICAgICAgICAgICAgICAgICAgICBpdGVtc05leHQgPSAkKHJlc3VsdCkuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQodGhpcykuaXMoJ2RpdicgKyAnLmNicC1sb2FkTW9yZS1ibG9jaycgKyAobnVtYmVyT2ZDbGlja3MgKyAxKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtc05leHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmFkZENsYXNzKCdjYnAtbC1sb2FkTW9yZS1zdG9wJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvLyBlcnJvclxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG4gICAgTG9hZE1vcmUucHJvdG90eXBlLmF1dG8gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgIHQucGFyZW50LiRvYmoub24oJ2luaXRDb21wbGV0ZS5jYnAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIE9iamVjdC5jcmVhdGUoe1xuICAgICAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGpvYiBpbmFjdGl2ZVxuICAgICAgICAgICAgICAgICAgICBzZWxmLmlzQWN0aXZlID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5udW1iZXJPZkNsaWNrcyA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gc2V0IGxvYWRpbmcgc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIHQubG9hZE1vcmUuYWRkQ2xhc3MoJ2NicC1sLWxvYWRNb3JlLWxvYWRpbmcnKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjYWNoZSB3aW5kb3cgc2VsZWN0b3JcbiAgICAgICAgICAgICAgICAgICAgc2VsZi53aW5kb3cgPSAkKHdpbmRvdyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGV2ZW50cyBmb3Igc2Nyb2xsXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWRkRXZlbnRzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdHJpZ2dlciBtZXRob2Qgb24gaW5pdFxuICAgICAgICAgICAgICAgICAgICBzZWxmLmdldE5ld0l0ZW1zKCk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGFkZEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ7XG5cbiAgICAgICAgICAgICAgICAgICAgdC5sb2FkTW9yZS5vbignY2xpY2suY2JwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBzZWxmLndpbmRvdy5vbignc2Nyb2xsLmxvYWRNb3JlT2JqZWN0JywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0LnBhcmVudC5pc0FuaW1hdGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnZXQgbmV3IGl0ZW1zIG9uIHNjcm9sbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmdldE5ld0l0ZW1zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgODApO1xuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gdGhlIGZpbHRlciBpcyBjb21wbGV0ZWRcbiAgICAgICAgICAgICAgICAgICAgdC5wYXJlbnQuJG9iai5vbignZmlsdGVyQ29tcGxldGUuY2JwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmdldE5ld0l0ZW1zKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBnZXROZXdJdGVtczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcExvYWRNb3JlLCB0b3BXaW5kb3c7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuaXNBY3RpdmUgfHwgdC5sb2FkTW9yZS5oYXNDbGFzcygnY2JwLWwtbG9hZE1vcmUtc3RvcCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0b3BMb2FkTW9yZSA9IHQubG9hZE1vcmUub2Zmc2V0KCkudG9wO1xuICAgICAgICAgICAgICAgICAgICB0b3BXaW5kb3cgPSBzZWxmLndpbmRvdy5zY3JvbGxUb3AoKSArIHNlbGYud2luZG93LmhlaWdodCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0b3BMb2FkTW9yZSA+IHRvcFdpbmRvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBqb2IgaXMgbm93IGJ1c3lcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pc0FjdGl2ZSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaW5jcmVtZW50IG51bWJlciBvZiBjbGlja3NcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5udW1iZXJPZkNsaWNrcysrO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIHBlcmZvcm0gYWpheCByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB0LmxvYWRNb3JlLmF0dHIoJ2hyZWYnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ0hUTUwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW1zLCBpdGVtc05leHQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmaW5kIGN1cnJlbnQgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXMgPSAkKHJlc3VsdCkuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJCh0aGlzKS5pcygnZGl2JyArICcuY2JwLWxvYWRNb3JlLWJsb2NrJyArIHNlbGYubnVtYmVyT2ZDbGlja3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5wYXJlbnQuJG9iai5jdWJlcG9ydGZvbGlvKCdhcHBlbmRJdGVtcycsIGl0ZW1zLmh0bWwoKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHdlIGhhdmUgbW9yZSB3b3Jrc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtc05leHQgPSAkKHJlc3VsdCkuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQodGhpcykuaXMoJ2RpdicgKyAnLmNicC1sb2FkTW9yZS1ibG9jaycgKyAoc2VsZi5udW1iZXJPZkNsaWNrcyArIDEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW1zTmV4dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQubG9hZE1vcmUuYWRkQ2xhc3MoJ2NicC1sLWxvYWRNb3JlLXN0b3AnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGV2ZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi53aW5kb3cub2ZmKCdzY3JvbGwubG9hZE1vcmVPYmplY3QnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQucGFyZW50LiRvYmoub2ZmKCdmaWx0ZXJDb21wbGV0ZS5jYnAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ha2UgdGhlIGpvYiBpbmFjdGl2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5pc0FjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLndpbmRvdy50cmlnZ2VyKCdzY3JvbGwubG9hZE1vcmVPYmplY3QnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ha2UgdGhlIGpvYiBpbmFjdGl2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmluaXQoKTtcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG5cbiAgICBMb2FkTW9yZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgdC5sb2FkTW9yZS5vZmYoJy5jYnAnKTtcblxuICAgICAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwubG9hZE1vcmVPYmplY3QnKTtcbiAgICB9O1xuXG4gICAgQ3ViZVBvcnRmb2xpby5QbHVnaW5zLkxvYWRNb3JlID0gZnVuY3Rpb24ocGFyZW50KSB7XG5cbiAgICAgICAgaWYgKHBhcmVudC5vcHRpb25zLmxvYWRNb3JlID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IExvYWRNb3JlKHBhcmVudCk7XG4gICAgfTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuKGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDdWJlUG9ydGZvbGlvID0gJC5mbi5jdWJlcG9ydGZvbGlvLkNvbnN0cnVjdG9yO1xuXG4gICAgdmFyIHBvcHVwID0ge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpbml0IGZ1bmN0aW9uIGZvciBwb3B1cFxuICAgICAgICAgKiBAcGFyYW0gY3ViZXBvcnRmb2xpbyA9IGN1YmVwb3J0Zm9saW8gaW5zdGFuY2VcbiAgICAgICAgICogQHBhcmFtIHR5cGUgPSAgJ2xpZ2h0Ym94JyBvciAnc2luZ2xlUGFnZSdcbiAgICAgICAgICovXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKGN1YmVwb3J0Zm9saW8sIHR5cGUpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjdXJyZW50QmxvY2s7XG5cbiAgICAgICAgICAgIC8vIHJlbWVtYmVyIGN1YmVwb3J0Zm9saW8gaW5zdGFuY2VcbiAgICAgICAgICAgIHQuY3ViZXBvcnRmb2xpbyA9IGN1YmVwb3J0Zm9saW87XG5cbiAgICAgICAgICAgIC8vIHJlbWVtYmVyIGlmIHRoaXMgaW5zdGFuY2UgaXMgZm9yIGxpZ2h0Ym94IG9yIGZvciBzaW5nbGVQYWdlXG4gICAgICAgICAgICB0LnR5cGUgPSB0eXBlO1xuXG4gICAgICAgICAgICAvLyByZW1lbWJlciBpZiB0aGUgcG9wdXAgaXMgb3BlbiBvciBub3RcbiAgICAgICAgICAgIHQuaXNPcGVuID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHQub3B0aW9ucyA9IHQuY3ViZXBvcnRmb2xpby5vcHRpb25zO1xuXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2xpZ2h0Ym94Jykge1xuICAgICAgICAgICAgICAgIHQuY3ViZXBvcnRmb2xpby5fcmVnaXN0ZXJFdmVudCgncmVzaXplV2luZG93JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHQucmVzaXplSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzaW5nbGVQYWdlSW5saW5lJykge1xuXG4gICAgICAgICAgICAgICAgdC5zdGFydElubGluZSA9IC0xO1xuXG4gICAgICAgICAgICAgICAgdC5oZWlnaHQgPSAwO1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIG1hcmt1cCwgY3NzIGFuZCBhZGQgZXZlbnRzIGZvciBTaW5nbGVQYWdlSW5saW5lXG4gICAgICAgICAgICAgICAgdC5fY3JlYXRlTWFya3VwU2luZ2xlUGFnZUlubGluZSgpO1xuXG4gICAgICAgICAgICAgICAgdC5jdWJlcG9ydGZvbGlvLl9yZWdpc3RlckV2ZW50KCdyZXNpemVHcmlkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0LmlzT3Blbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRvZG8gbXVzdCBhZGQgc3VwcG9ydCBmb3IgdGhpcyBmZWF0dXJlcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgICAgICAgICAgICAgICAgICB0LmNsb3NlKCk7IC8vIHdvcmthcm91bmRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjcmVhdGUgbWFya3VwLCBjc3MgYW5kIGFkZCBldmVudHMgZm9yIGxpZ2h0Ym94IGFuZCBzaW5nbGVQYWdlXG4gICAgICAgICAgICB0Ll9jcmVhdGVNYXJrdXAoKTtcblxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdzaW5nbGVQYWdlJykge1xuXG4gICAgICAgICAgICAgICAgdC5jdWJlcG9ydGZvbGlvLl9yZWdpc3RlckV2ZW50KCdyZXNpemVXaW5kb3cnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQub3B0aW9ucy5zaW5nbGVQYWdlU3RpY2t5TmF2aWdhdGlvbikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgd2lkdGggPSB0LndyYXBbMF0uY2xpZW50V2lkdGg7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3aWR0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0Lm5hdmlnYXRpb25XcmFwLndpZHRoKHdpZHRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldCBuYXZpZ2F0aW9uIHdpZHRoPSd3aW5kb3cgd2lkdGgnIHRvIGNlbnRlciB0aGUgZGl2c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQubmF2aWdhdGlvbi53aWR0aCh3aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHQub3B0aW9ucy5zaW5nbGVQYWdlRGVlcGxpbmtpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdC51cmwgPSBsb2NhdGlvbi5ocmVmO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0LnVybC5zbGljZSgtMSkgPT09ICcjJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC51cmwgPSB0LnVybC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgbGlua3MgPSB0LnVybC5zcGxpdCgnI2NicD0nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9IGxpbmtzLnNoaWZ0KCk7IC8vIHJlbW92ZSBmaXJzdCBpdGVtXG5cbiAgICAgICAgICAgICAgICAgICAgJC5lYWNoKGxpbmtzLCBmdW5jdGlvbihpbmRleCwgbGluaykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0LmN1YmVwb3J0Zm9saW8uYmxvY2tzT24uZWFjaChmdW5jdGlvbihpbmRleDEsIGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNpbmdsZVBhZ2UgPSAkKGVsKS5maW5kKHQub3B0aW9ucy5zaW5nbGVQYWdlRGVsZWdhdGUgKyAnW2hyZWY9XCInICsgbGluayArICdcIl0nKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaW5nbGVQYWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50QmxvY2sgPSBzaW5nbGVQYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRCbG9jaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEJsb2NrKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHQudXJsID0gdXJsO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IGN1cnJlbnRCbG9jayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYWxsZXJ5ID0gc2VsZi5hdHRyKCdkYXRhLWNicC1zaW5nbGVQYWdlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChnYWxsZXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzID0gc2VsZi5jbG9zZXN0KCQoJy5jYnAtaXRlbScpKS5maW5kKCdbZGF0YS1jYnAtc2luZ2xlUGFnZT1cIicgKyBnYWxsZXJ5ICsgJ1wiXScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0LmN1YmVwb3J0Zm9saW8uYmxvY2tzT24uZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSAkKGVsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5ub3QoJy5jYnAtaXRlbS1vZmYnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5maW5kKHQub3B0aW9ucy5zaW5nbGVQYWdlRGVsZWdhdGUpLmVhY2goZnVuY3Rpb24oaW5kZXgyLCBlbDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoISQoZWwyKS5hdHRyKCdkYXRhLWNicC1zaW5nbGVQYWdlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzLnB1c2goZWwyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0Lm9wZW5TaW5nbGVQYWdlKGJsb2NrcywgY3VycmVudEJsb2NrWzBdKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGxpbmtzLmxlbmd0aCkgeyAvLyBAdG9kbyAtIGhhY2sgdG8gbG9hZCBpdGVtcyBmcm9tIGxvYWRNb3JlXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmFrZUxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWtlTGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBsaW5rc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0Lm9wZW5TaW5nbGVQYWdlKFtmYWtlTGlua10sIGZha2VMaW5rKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBtYXJrdXAsIGNzcyBhbmQgYWRkIGV2ZW50c1xuICAgICAgICAgKi9cbiAgICAgICAgX2NyZWF0ZU1hcmt1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uQ2xzID0gJyc7XG5cbiAgICAgICAgICAgIGlmICh0LnR5cGUgPT09ICdzaW5nbGVQYWdlJykge1xuICAgICAgICAgICAgICAgIGlmICh0Lm9wdGlvbnMuc2luZ2xlUGFnZUFuaW1hdGlvbiAhPT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkNscyA9ICcgY2JwLXBvcHVwLXNpbmdsZVBhZ2UtJyArIHQub3B0aW9ucy5zaW5nbGVQYWdlQW5pbWF0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gd3JhcCBlbGVtZW50XG4gICAgICAgICAgICB0LndyYXAgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2NicC1wb3B1cC13cmFwIGNicC1wb3B1cC0nICsgdC50eXBlICsgYW5pbWF0aW9uQ2xzLFxuICAgICAgICAgICAgICAgICdkYXRhLWFjdGlvbic6ICh0LnR5cGUgPT09ICdsaWdodGJveCcpID8gJ2Nsb3NlJyA6ICcnXG4gICAgICAgICAgICB9KS5vbignY2xpY2suY2JwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGlmICh0LnN0b3BFdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBhY3Rpb24gPSAkKGUudGFyZ2V0KS5hdHRyKCdkYXRhLWFjdGlvbicpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRbYWN0aW9uXSkge1xuICAgICAgICAgICAgICAgICAgICB0W2FjdGlvbl0oKTtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBjb250ZW50IGVsZW1lbnRcbiAgICAgICAgICAgIHQuY29udGVudCA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnY2JwLXBvcHVwLWNvbnRlbnQnXG4gICAgICAgICAgICB9KS5hcHBlbmRUbyh0LndyYXApO1xuXG4gICAgICAgICAgICAvLyBhcHBlbmQgbG9hZGluZyBkaXZcbiAgICAgICAgICAgICQoJzxkaXYvPicsIHtcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnY2JwLXBvcHVwLWxvYWRpbmdCb3gnXG4gICAgICAgICAgICB9KS5hcHBlbmRUbyh0LndyYXApO1xuXG4gICAgICAgICAgICAvLyBhZGQgYmFja2dyb3VuZCBvbmx5IGZvciBpZThcbiAgICAgICAgICAgIGlmIChDdWJlUG9ydGZvbGlvLlByaXZhdGUuYnJvd3NlciA9PT0gJ2llOCcpIHtcbiAgICAgICAgICAgICAgICB0LmJnID0gJCgnPGRpdi8+Jywge1xuICAgICAgICAgICAgICAgICAgICAnY2xhc3MnOiAnY2JwLXBvcHVwLWllOGJnJyxcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtYWN0aW9uJzogKHQudHlwZSA9PT0gJ2xpZ2h0Ym94JykgPyAnY2xvc2UnIDogJydcbiAgICAgICAgICAgICAgICB9KS5hcHBlbmRUbyh0LndyYXApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjcmVhdGUgbmF2aWdhdGlvbiB3cmFwXG4gICAgICAgICAgICB0Lm5hdmlnYXRpb25XcmFwID0gJCgnPGRpdi8+Jywge1xuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdjYnAtcG9wdXAtbmF2aWdhdGlvbi13cmFwJ1xuICAgICAgICAgICAgfSkuYXBwZW5kVG8odC53cmFwKTtcblxuICAgICAgICAgICAgLy8gY3JlYXRlIG5hdmlnYXRpb24gYmxvY2tcbiAgICAgICAgICAgIHQubmF2aWdhdGlvbiA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgICAgICAgICAnY2xhc3MnOiAnY2JwLXBvcHVwLW5hdmlnYXRpb24nXG4gICAgICAgICAgICB9KS5hcHBlbmRUbyh0Lm5hdmlnYXRpb25XcmFwKTtcblxuICAgICAgICAgICAgLy8gY2xvc2VcbiAgICAgICAgICAgIHQuY2xvc2VCdXR0b24gPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2NicC1wb3B1cC1jbG9zZScsXG4gICAgICAgICAgICAgICAgJ3RpdGxlJzogJ0Nsb3NlIChFc2MgYXJyb3cga2V5KScsXG4gICAgICAgICAgICAgICAgJ2RhdGEtYWN0aW9uJzogJ2Nsb3NlJ1xuICAgICAgICAgICAgfSkuYXBwZW5kVG8odC5uYXZpZ2F0aW9uKTtcblxuICAgICAgICAgICAgLy8gbmV4dFxuICAgICAgICAgICAgdC5uZXh0QnV0dG9uID0gJCgnPGRpdi8+Jywge1xuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdjYnAtcG9wdXAtbmV4dCcsXG4gICAgICAgICAgICAgICAgJ3RpdGxlJzogJ05leHQgKFJpZ2h0IGFycm93IGtleSknLFxuICAgICAgICAgICAgICAgICdkYXRhLWFjdGlvbic6ICduZXh0J1xuICAgICAgICAgICAgfSkuYXBwZW5kVG8odC5uYXZpZ2F0aW9uKTtcblxuXG4gICAgICAgICAgICAvLyBwcmV2XG4gICAgICAgICAgICB0LnByZXZCdXR0b24gPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2NicC1wb3B1cC1wcmV2JyxcbiAgICAgICAgICAgICAgICAndGl0bGUnOiAnUHJldmlvdXMgKExlZnQgYXJyb3cga2V5KScsXG4gICAgICAgICAgICAgICAgJ2RhdGEtYWN0aW9uJzogJ3ByZXYnXG4gICAgICAgICAgICB9KS5hcHBlbmRUbyh0Lm5hdmlnYXRpb24pO1xuXG5cbiAgICAgICAgICAgIGlmICh0LnR5cGUgPT09ICdzaW5nbGVQYWdlJykge1xuXG4gICAgICAgICAgICAgICAgaWYgKHQub3B0aW9ucy5zaW5nbGVQYWdlQ291bnRlcikge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb3VudGVyIGZvciBzaW5nbGVQYWdlXG4gICAgICAgICAgICAgICAgICAgIHQuY291bnRlciA9ICQodC5vcHRpb25zLnNpbmdsZVBhZ2VDb3VudGVyKS5hcHBlbmRUbyh0Lm5hdmlnYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0LmNvdW50ZXIudGV4dCgnJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdC5jb250ZW50Lm9uKCdjbGljay5jYnAnLCB0Lm9wdGlvbnMuc2luZ2xlUGFnZURlbGVnYXRlLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW4gPSB0LmRhdGFBcnJheS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBocmVmID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHQuZGF0YUFycmF5W2ldLnVybCA9PT0gaHJlZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdC5zaW5nbGVQYWdlSnVtcFRvKGkgLSB0LmN1cnJlbnQpO1xuXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgc29tZSBldmVudHMgdGhhbiBvdmVycmlkZXMgdGhlIGRlZmF1bHQgc2Nyb2xsIGJlaGF2aW91ciBkb24ndCBnbyB0byB0aGVtXG4gICAgICAgICAgICAgICAgdC53cmFwLm9uKCdtb3VzZXdoZWVsLmNicCcgKyAnIERPTU1vdXNlU2Nyb2xsLmNicCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbigna2V5ZG93bi5jYnAnLCBmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiBpcyBub3Qgb3BlbiA9PiByZXR1cm5cbiAgICAgICAgICAgICAgICBpZiAoIXQuaXNPcGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBpZiBhbGwgZXZlbnRzIGFyZSBzdG9wcGVkID0+IHJldHVyblxuICAgICAgICAgICAgICAgIGlmICh0LnN0b3BFdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDM3KSB7IC8vIHByZXYga2V5XG4gICAgICAgICAgICAgICAgICAgIHQucHJldigpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZS5rZXlDb2RlID09PSAzOSkgeyAvLyBuZXh0IGtleVxuICAgICAgICAgICAgICAgICAgICB0Lm5leHQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gMjcpIHsgLy9lc2Mga2V5XG4gICAgICAgICAgICAgICAgICAgIHQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIF9jcmVhdGVNYXJrdXBTaW5nbGVQYWdlSW5saW5lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gd3JhcCBlbGVtZW50XG4gICAgICAgICAgICB0LndyYXAgPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2NicC1wb3B1cC1zaW5nbGVQYWdlSW5saW5lJ1xuICAgICAgICAgICAgfSkub24oJ2NsaWNrLmNicCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodC5zdG9wRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgYWN0aW9uID0gJChlLnRhcmdldCkuYXR0cignZGF0YS1hY3Rpb24nKTtcblxuICAgICAgICAgICAgICAgIGlmIChhY3Rpb24gJiYgdFthY3Rpb25dKSB7XG4gICAgICAgICAgICAgICAgICAgIHRbYWN0aW9uXSgpO1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGNvbnRlbnQgZWxlbWVudFxuICAgICAgICAgICAgdC5jb250ZW50ID0gJCgnPGRpdi8+Jywge1xuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdjYnAtcG9wdXAtY29udGVudCdcbiAgICAgICAgICAgIH0pLmFwcGVuZFRvKHQud3JhcCk7XG5cbiAgICAgICAgICAgIC8vIGFwcGVuZCBsb2FkaW5nIGRpdlxuICAgICAgICAgICAgLy8gJCgnPGRpdi8+Jywge1xuICAgICAgICAgICAgLy8gICAgICdjbGFzcyc6ICdjYnAtcG9wdXAtbG9hZGluZ0JveCdcbiAgICAgICAgICAgIC8vIH0pLmFwcGVuZFRvKHQud3JhcCk7XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBuYXZpZ2F0aW9uIGJsb2NrXG4gICAgICAgICAgICB0Lm5hdmlnYXRpb24gPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2NicC1wb3B1cC1uYXZpZ2F0aW9uJ1xuICAgICAgICAgICAgfSkuYXBwZW5kVG8odC53cmFwKTtcblxuICAgICAgICAgICAgLy8gY2xvc2VcbiAgICAgICAgICAgIHQuY2xvc2VCdXR0b24gPSAkKCc8ZGl2Lz4nLCB7XG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2NicC1wb3B1cC1jbG9zZScsXG4gICAgICAgICAgICAgICAgJ3RpdGxlJzogJ0Nsb3NlIChFc2MgYXJyb3cga2V5KScsXG4gICAgICAgICAgICAgICAgJ2RhdGEtYWN0aW9uJzogJ2Nsb3NlJ1xuICAgICAgICAgICAgfSkuYXBwZW5kVG8odC5uYXZpZ2F0aW9uKTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGJvZHkgPSAkKCdib2R5Jyk7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSBvZmYga2V5IGRvd25cbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZigna2V5ZG93bi5jYnAnKTtcblxuICAgICAgICAgICAgLy8gZXh0ZXJuYWwgbGlnaHRib3ggYW5kIHNpbmdsZVBhZ2VJbmxpbmVcbiAgICAgICAgICAgIGJvZHkub2ZmKCdjbGljay5jYnAnLCB0Lm9wdGlvbnMubGlnaHRib3hEZWxlZ2F0ZSk7XG4gICAgICAgICAgICBib2R5Lm9mZignY2xpY2suY2JwJywgdC5vcHRpb25zLnNpbmdsZVBhZ2VEZWxlZ2F0ZSk7XG5cbiAgICAgICAgICAgIHQuY29udGVudC5vZmYoJ2NsaWNrLmNicCcsIHQub3B0aW9ucy5zaW5nbGVQYWdlRGVsZWdhdGUpO1xuXG4gICAgICAgICAgICB0LmN1YmVwb3J0Zm9saW8uJG9iai5vZmYoJ2NsaWNrLmNicCcsIHQub3B0aW9ucy5zaW5nbGVQYWdlSW5saW5lRGVsZWdhdGUpO1xuICAgICAgICAgICAgdC5jdWJlcG9ydGZvbGlvLiRvYmoub2ZmKCdjbGljay5jYnAnLCB0Lm9wdGlvbnMubGlnaHRib3hEZWxlZ2F0ZSk7XG4gICAgICAgICAgICB0LmN1YmVwb3J0Zm9saW8uJG9iai5vZmYoJ2NsaWNrLmNicCcsIHQub3B0aW9ucy5zaW5nbGVQYWdlRGVsZWdhdGUpO1xuXG4gICAgICAgICAgICB0LmN1YmVwb3J0Zm9saW8uJG9iai5yZW1vdmVDbGFzcygnY2JwLXBvcHVwLWlzT3BlbmluZycpO1xuXG4gICAgICAgICAgICB0LmN1YmVwb3J0Zm9saW8uJG9iai5maW5kKCcuY2JwLWl0ZW0nKS5yZW1vdmVDbGFzcygnY2JwLXNpbmdsZVBhZ2VJbmxpbmUtYWN0aXZlJyk7XG5cbiAgICAgICAgICAgIHQud3JhcC5yZW1vdmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvcGVuTGlnaHRib3g6IGZ1bmN0aW9uKGJsb2NrcywgY3VycmVudEJsb2NrKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgICAgICAgY3VycmVudEJsb2NrSHJlZiwgdGVtcEhyZWYgPSBbXSxcbiAgICAgICAgICAgICAgICBlbGVtZW50O1xuXG4gICAgICAgICAgICBpZiAodC5pc09wZW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHJlbWVtYmVyIHRoYXQgdGhlIGxpZ2h0Ym94IGlzIG9wZW4gbm93XG4gICAgICAgICAgICB0LmlzT3BlbiA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIHJlbWVtYmVyIHRvIHN0b3AgYWxsIGV2ZW50cyBhZnRlciB0aGUgbGlnaHRib3ggaGFzIGJlZW4gc2hvd25cbiAgICAgICAgICAgIHQuc3RvcEV2ZW50cyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBhcnJheSB3aXRoIGVsZW1lbnRzXG4gICAgICAgICAgICB0LmRhdGFBcnJheSA9IFtdO1xuXG4gICAgICAgICAgICAvLyByZXNldCBjdXJyZW50XG4gICAgICAgICAgICB0LmN1cnJlbnQgPSBudWxsO1xuXG4gICAgICAgICAgICBjdXJyZW50QmxvY2tIcmVmID0gY3VycmVudEJsb2NrLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRCbG9ja0hyZWYgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hFSSEgWW91ciBjbGlja2VkIGVsZW1lbnQgZG9lc25cXCd0IGhhdmUgYSBocmVmIGF0dHJpYnV0ZS4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5lYWNoKGJsb2NrcywgZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgaHJlZiA9IGl0ZW0uZ2V0QXR0cmlidXRlKCdocmVmJyksXG4gICAgICAgICAgICAgICAgICAgIHNyYyA9IGhyZWYsIC8vIGRlZmF1bHQgaWYgZWxlbWVudCBpcyBpbWFnZVxuICAgICAgICAgICAgICAgICAgICB0eXBlID0gJ2lzSW1hZ2UnLCAvLyBkZWZhdWx0IGlmIGVsZW1lbnQgaXMgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgdmlkZW9MaW5rO1xuXG4gICAgICAgICAgICAgICAgaWYgKCQuaW5BcnJheShocmVmLCB0ZW1wSHJlZikgPT09IC0xKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRCbG9ja0hyZWYgPT09IGhyZWYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuY3VycmVudCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXQub3B0aW9ucy5saWdodGJveEdhbGxlcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICgveW91dHViZS9pLnRlc3QoaHJlZikpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmlkZW9MaW5rID0gaHJlZi5zdWJzdHJpbmcoaHJlZi5sYXN0SW5kZXhPZigndj0nKSArIDIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISgvYXV0b3BsYXk9L2kudGVzdCh2aWRlb0xpbmspKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvTGluayArPSAnJmF1dG9wbGF5PTEnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWRlb0xpbmsgPSB2aWRlb0xpbmsucmVwbGFjZSgvXFw/fCYvLCAnPycpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgbmV3IGhyZWZcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYyA9ICcvL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8nICsgdmlkZW9MaW5rO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlID0gJ2lzWW91dHViZSc7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgvdmltZW8vaS50ZXN0KGhyZWYpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvTGluayA9IGhyZWYuc3Vic3RyaW5nKGhyZWYubGFzdEluZGV4T2YoJy8nKSArIDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoISgvYXV0b3BsYXk9L2kudGVzdCh2aWRlb0xpbmspKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvTGluayArPSAnJmF1dG9wbGF5PTEnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWRlb0xpbmsgPSB2aWRlb0xpbmsucmVwbGFjZSgvXFw/fCYvLCAnPycpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjcmVhdGUgbmV3IGhyZWZcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYyA9ICcvL3BsYXllci52aW1lby5jb20vdmlkZW8vJyArIHZpZGVvTGluaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdpc1ZpbWVvJztcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKC90ZWRcXC5jb20vaS50ZXN0KGhyZWYpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgaHJlZlxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjID0gJ2h0dHA6Ly9lbWJlZC50ZWQuY29tL3RhbGtzLycgKyBocmVmLnN1YnN0cmluZyhocmVmLmxhc3RJbmRleE9mKCcvJykgKyAxKSArICcuaHRtbCc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnaXNUZWQnO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoL3NvdW5kY2xvdWRcXC5jb20vaS50ZXN0KGhyZWYpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgaHJlZlxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjID0gaHJlZjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdpc1NvdW5kQ2xvdWQnO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoLyhcXC5tcDQpfChcXC5vZ2cpfChcXC5vZ3YpfChcXC53ZWJtKS9pLnRlc3QoaHJlZikpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhyZWYuaW5kZXhPZignfCcpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgaHJlZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYyA9IGhyZWYuc3BsaXQoJ3wnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBocmVmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjID0gaHJlZi5zcGxpdCgnJTdDJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnaXNTZWxmSG9zdGVkVmlkZW8nO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoL1xcLm1wMyQvaS50ZXN0KGhyZWYpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzcmMgPSBocmVmO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdpc1NlbGZIb3N0ZWRBdWRpbyc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0LmRhdGFBcnJheS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogc3JjLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGl0ZW0uZ2V0QXR0cmlidXRlKHQub3B0aW9ucy5saWdodGJveFRpdGxlU3JjKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRlbXBIcmVmLnB1c2goaHJlZik7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICAvLyB0b3RhbCBudW1iZXJzIG9mIGVsZW1lbnRzXG4gICAgICAgICAgICB0LmNvdW50ZXJUb3RhbCA9IHQuZGF0YUFycmF5Lmxlbmd0aDtcblxuICAgICAgICAgICAgaWYgKHQuY291bnRlclRvdGFsID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdC5uZXh0QnV0dG9uLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB0LnByZXZCdXR0b24uaGlkZSgpO1xuICAgICAgICAgICAgICAgIHQuZGF0YUFjdGlvbkltZyA9ICcnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0Lm5leHRCdXR0b24uc2hvdygpO1xuICAgICAgICAgICAgICAgIHQucHJldkJ1dHRvbi5zaG93KCk7XG4gICAgICAgICAgICAgICAgdC5kYXRhQWN0aW9uSW1nID0gJ2RhdGEtYWN0aW9uPVwibmV4dFwiJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYXBwZW5kIHRvIGJvZHlcbiAgICAgICAgICAgIHQud3JhcC5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KTtcblxuICAgICAgICAgICAgdC5zY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCk7XG5cbiAgICAgICAgICAgIHQub3JpZ2luYWxTdHlsZSA9ICQoJ2h0bWwnKS5hdHRyKCdzdHlsZScpO1xuXG4gICAgICAgICAgICAkKCdodG1sJykuY3NzKHtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0OiB3aW5kb3cuaW5uZXJXaWR0aCAtICQoZG9jdW1lbnQpLndpZHRoKClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBzaG93IHRoZSB3cmFwcGVyIChsaWdodGJveCBib3gpXG4gICAgICAgICAgICB0LndyYXAuc2hvdygpO1xuXG4gICAgICAgICAgICAvLyBnZXQgdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgICAgICAgICAgZWxlbWVudCA9IHQuZGF0YUFycmF5W3QuY3VycmVudF07XG5cbiAgICAgICAgICAgIC8vIGNhbGwgZnVuY3Rpb24gaWYgY3VycmVudCBlbGVtZW50IGlzIGltYWdlIG9yIHZpZGVvIChpZnJhbWUpXG4gICAgICAgICAgICB0W2VsZW1lbnQudHlwZV0oZWxlbWVudCk7XG5cbiAgICAgICAgfSxcblxuICAgICAgICBvcGVuU2luZ2xlUGFnZTogZnVuY3Rpb24oYmxvY2tzLCBjdXJyZW50QmxvY2spIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgICAgICBjdXJyZW50QmxvY2tIcmVmLCB0ZW1wSHJlZiA9IFtdO1xuXG4gICAgICAgICAgICBpZiAodC5pc09wZW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIHNpbmdsZVBhZ2VJbmxpbmUgYW5kIGNsb3NlIGl0XG4gICAgICAgICAgICBpZiAodC5jdWJlcG9ydGZvbGlvLnNpbmdsZVBhZ2VJbmxpbmUgJiYgdC5jdWJlcG9ydGZvbGlvLnNpbmdsZVBhZ2VJbmxpbmUuaXNPcGVuKSB7XG4gICAgICAgICAgICAgICAgdC5jdWJlcG9ydGZvbGlvLnNpbmdsZVBhZ2VJbmxpbmUuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhhdCB0aGUgbGlnaHRib3ggaXMgb3BlbiBub3dcbiAgICAgICAgICAgIHQuaXNPcGVuID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdG8gc3RvcCBhbGwgZXZlbnRzIGFmdGVyIHRoZSBwb3B1cCBoYXMgYmVlbiBzaG93aW5nXG4gICAgICAgICAgICB0LnN0b3BFdmVudHMgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gYXJyYXkgd2l0aCBlbGVtZW50c1xuICAgICAgICAgICAgdC5kYXRhQXJyYXkgPSBbXTtcblxuICAgICAgICAgICAgLy8gcmVzZXQgY3VycmVudFxuICAgICAgICAgICAgdC5jdXJyZW50ID0gbnVsbDtcblxuICAgICAgICAgICAgY3VycmVudEJsb2NrSHJlZiA9IGN1cnJlbnRCbG9jay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50QmxvY2tIcmVmID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIRUkhIFlvdXIgY2xpY2tlZCBlbGVtZW50IGRvZXNuXFwndCBoYXZlIGEgaHJlZiBhdHRyaWJ1dGUuJyk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgJC5lYWNoKGJsb2NrcywgZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgaHJlZiA9IGl0ZW0uZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoJC5pbkFycmF5KGhyZWYsIHRlbXBIcmVmKSA9PT0gLTEpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEJsb2NrSHJlZiA9PT0gaHJlZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC5jdXJyZW50ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHQuZGF0YUFycmF5LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBocmVmLFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudDogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGVtcEhyZWYucHVzaChocmVmKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyB0b3RhbCBudW1iZXJzIG9mIGVsZW1lbnRzXG4gICAgICAgICAgICB0LmNvdW50ZXJUb3RhbCA9IHQuZGF0YUFycmF5Lmxlbmd0aDtcblxuICAgICAgICAgICAgaWYgKHQuY291bnRlclRvdGFsID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdC5uZXh0QnV0dG9uLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB0LnByZXZCdXR0b24uaGlkZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0Lm5leHRCdXR0b24uc2hvdygpO1xuICAgICAgICAgICAgICAgIHQucHJldkJ1dHRvbi5zaG93KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGFwcGVuZCB0byBib2R5XG4gICAgICAgICAgICB0LndyYXAuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSk7XG5cbiAgICAgICAgICAgIHQuc2Nyb2xsVG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG4gICAgICAgICAgICAkKCdodG1sJykuY3NzKHtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0OiB3aW5kb3cuaW5uZXJXaWR0aCAtICQoZG9jdW1lbnQpLndpZHRoKClcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBnbyB0byB0b3Agb2YgdGhlIHBhZ2UgKHJlc2V0IHNjcm9sbClcbiAgICAgICAgICAgIHQud3JhcC5zY3JvbGxUb3AoMCk7XG5cbiAgICAgICAgICAgIC8vIHNob3cgdGhlIHdyYXBwZXJcbiAgICAgICAgICAgIHQud3JhcC5zaG93KCk7XG5cbiAgICAgICAgICAgIC8vIGZpbmlzaCB0aGUgb3BlbiBhbmltYXRpb25cbiAgICAgICAgICAgIHQuZmluaXNoT3BlbiA9IDI7XG5cbiAgICAgICAgICAgIC8vIGlmIHRyYW5zaXRpb25lbmQgaXMgbm90IGZ1bGZpbGxlZFxuICAgICAgICAgICAgdC5uYXZpZ2F0aW9uTW9iaWxlID0gJCgpO1xuICAgICAgICAgICAgdC53cmFwLm9uZShDdWJlUG9ydGZvbGlvLlByaXZhdGUudHJhbnNpdGlvbmVuZCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoO1xuXG4gICAgICAgICAgICAgICAgLy8gbWFrZSB0aGUgbmF2aWdhdGlvbiBzdGlja3lcbiAgICAgICAgICAgICAgICBpZiAodC5vcHRpb25zLnNpbmdsZVBhZ2VTdGlja3lOYXZpZ2F0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdC53cmFwLmFkZENsYXNzKCdjYnAtcG9wdXAtc2luZ2xlUGFnZS1zdGlja3knKTtcblxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHQud3JhcFswXS5jbGllbnRXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgdC5uYXZpZ2F0aW9uV3JhcC53aWR0aCh3aWR0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5icm93c2VyID09PSAnYW5kcm9pZCcgfHwgQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmJyb3dzZXIgPT09ICdpb3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3cmFwIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHQubmF2aWdhdGlvbk1vYmlsZSA9ICQoJzxkaXYvPicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2xhc3MnOiAnY2JwLXBvcHVwLXNpbmdsZVBhZ2UgY2JwLXBvcHVwLXNpbmdsZVBhZ2Utc3RpY2t5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaWQnOiB0LndyYXAuYXR0cignaWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkub24oJ2NsaWNrLmNicCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodC5zdG9wRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWN0aW9uID0gJChlLnRhcmdldCkuYXR0cignZGF0YS1hY3Rpb24nKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0W2FjdGlvbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdFthY3Rpb25dKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdC5uYXZpZ2F0aW9uTW9iaWxlLmFwcGVuZFRvKGRvY3VtZW50LmJvZHkpLmFwcGVuZCh0Lm5hdmlnYXRpb25XcmFwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdC5maW5pc2hPcGVuLS07XG4gICAgICAgICAgICAgICAgaWYgKHQuZmluaXNoT3BlbiA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHQudXBkYXRlU2luZ2xlUGFnZUlzT3Blbi5jYWxsKHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChDdWJlUG9ydGZvbGlvLlByaXZhdGUuYnJvd3NlciA9PT0gJ2llOCcgfHwgQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmJyb3dzZXIgPT09ICdpZTknKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBtYWtlIHRoZSBuYXZpZ2F0aW9uIHN0aWNreVxuICAgICAgICAgICAgICAgIGlmICh0Lm9wdGlvbnMuc2luZ2xlUGFnZVN0aWNreU5hdmlnYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gdC53cmFwWzBdLmNsaWVudFdpZHRoO1xuXG4gICAgICAgICAgICAgICAgICAgIHQubmF2aWdhdGlvbldyYXAud2lkdGgod2lkdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0LndyYXAuYWRkQ2xhc3MoJ2NicC1wb3B1cC1zaW5nbGVQYWdlLXN0aWNreScpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxMDAwKTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHQuZmluaXNoT3Blbi0tO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0LndyYXAuYWRkQ2xhc3MoJ2NicC1wb3B1cC1sb2FkaW5nJyk7XG5cbiAgICAgICAgICAgIC8vIGZvcmNlIHJlZmxvdyBhbmQgdGhlbiBhZGQgY2xhc3NcbiAgICAgICAgICAgIHQud3JhcC5vZmZzZXQoKTtcbiAgICAgICAgICAgIHQud3JhcC5hZGRDbGFzcygnY2JwLXBvcHVwLXNpbmdsZVBhZ2Utb3BlbicpO1xuXG4gICAgICAgICAgICAvLyBjaGFuZ2UgbGlua1xuICAgICAgICAgICAgaWYgKHQub3B0aW9ucy5zaW5nbGVQYWdlRGVlcGxpbmtpbmcpIHtcbiAgICAgICAgICAgICAgICAvLyBpZ25vcmUgb2xkICNjYnAgZnJvbSBocmVmXG4gICAgICAgICAgICAgICAgdC51cmwgPSB0LnVybC5zcGxpdCgnI2NicD0nKVswXTtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gdC51cmwgKyAnI2NicD0nICsgdC5kYXRhQXJyYXlbdC5jdXJyZW50XS51cmw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHJ1biBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbih0Lm9wdGlvbnMuc2luZ2xlUGFnZUNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIHQub3B0aW9ucy5zaW5nbGVQYWdlQ2FsbGJhY2suY2FsbCh0LCB0LmRhdGFBcnJheVt0LmN1cnJlbnRdLnVybCwgdC5kYXRhQXJyYXlbdC5jdXJyZW50XS5lbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG5cbiAgICAgICAgb3BlblNpbmdsZVBhZ2VJbmxpbmU6IGZ1bmN0aW9uKGJsb2NrcywgY3VycmVudEJsb2NrLCBmcm9tT3Blbikge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN0YXJ0ID0gMCxcbiAgICAgICAgICAgICAgICBjdXJyZW50QmxvY2tIcmVmLFxuICAgICAgICAgICAgICAgIHRlbXBDdXJyZW50LFxuICAgICAgICAgICAgICAgIGNicGl0ZW0sXG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudDtcblxuICAgICAgICAgICAgZnJvbU9wZW4gPSBmcm9tT3BlbiB8fCBmYWxzZTtcblxuICAgICAgICAgICAgdC5mcm9tT3BlbiA9IGZyb21PcGVuO1xuXG4gICAgICAgICAgICB0LnN0b3JlQmxvY2tzID0gYmxvY2tzO1xuICAgICAgICAgICAgdC5zdG9yZUN1cnJlbnRCbG9jayA9IGN1cnJlbnRCbG9jaztcblxuICAgICAgICAgICAgLy8gY2hlY2sgc2luZ2xlUGFnZUlubGluZSBhbmQgY2xvc2UgaXRcbiAgICAgICAgICAgIGlmICh0LmlzT3Blbikge1xuXG4gICAgICAgICAgICAgICAgdGVtcEN1cnJlbnQgPSAkKGN1cnJlbnRCbG9jaykuY2xvc2VzdCgnLmNicC1pdGVtJykuaW5kZXgoKTtcblxuICAgICAgICAgICAgICAgIGlmICgodC5kYXRhQXJyYXlbdC5jdXJyZW50XS51cmwgIT09IGN1cnJlbnRCbG9jay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSkgfHwgKHQuY3VycmVudCAhPT0gdGVtcEN1cnJlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHQuY3ViZXBvcnRmb2xpby5zaW5nbGVQYWdlSW5saW5lLmNsb3NlKCdvcGVuJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MsXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50QmxvY2s6IGN1cnJlbnRCbG9jayxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb21PcGVuOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhhdCB0aGUgbGlnaHRib3ggaXMgb3BlbiBub3dcbiAgICAgICAgICAgIHQuaXNPcGVuID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdG8gc3RvcCBhbGwgZXZlbnRzIGFmdGVyIHRoZSBwb3B1cCBoYXMgYmVlbiBzaG93aW5nXG4gICAgICAgICAgICB0LnN0b3BFdmVudHMgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gYXJyYXkgd2l0aCBlbGVtZW50c1xuICAgICAgICAgICAgdC5kYXRhQXJyYXkgPSBbXTtcblxuICAgICAgICAgICAgLy8gcmVzZXQgY3VycmVudFxuICAgICAgICAgICAgdC5jdXJyZW50ID0gbnVsbDtcblxuICAgICAgICAgICAgY3VycmVudEJsb2NrSHJlZiA9IGN1cnJlbnRCbG9jay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50QmxvY2tIcmVmID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIRUkhIFlvdXIgY2xpY2tlZCBlbGVtZW50IGRvZXNuXFwndCBoYXZlIGEgaHJlZiBhdHRyaWJ1dGUuJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNicGl0ZW0gPSAkKGN1cnJlbnRCbG9jaykuY2xvc2VzdCgnLmNicC1pdGVtJylbMF07XG5cbiAgICAgICAgICAgIGJsb2Nrcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAgICAgICAgIGlmIChjYnBpdGVtID09PSBlbCkge1xuICAgICAgICAgICAgICAgICAgICB0LmN1cnJlbnQgPSBpbmRleDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdC5kYXRhQXJyYXlbdC5jdXJyZW50XSA9IHtcbiAgICAgICAgICAgICAgICB1cmw6IGN1cnJlbnRCbG9ja0hyZWYsXG4gICAgICAgICAgICAgICAgZWxlbWVudDogY3VycmVudEJsb2NrXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwYXJlbnRFbGVtZW50ID0gJCh0LmRhdGFBcnJheVt0LmN1cnJlbnRdLmVsZW1lbnQpLnBhcmVudHMoJy5jYnAtaXRlbScpLmFkZENsYXNzKCdjYnAtc2luZ2xlUGFnZUlubGluZS1hY3RpdmUnKTtcblxuICAgICAgICAgICAgLy8gdG90YWwgbnVtYmVycyBvZiBlbGVtZW50c1xuICAgICAgICAgICAgdC5jb3VudGVyVG90YWwgPSBibG9ja3MubGVuZ3RoO1xuXG4gICAgICAgICAgICB0LndyYXAuaW5zZXJ0QmVmb3JlKHQuY3ViZXBvcnRmb2xpby53cmFwcGVyKTtcblxuICAgICAgICAgICAgaWYgKHQub3B0aW9ucy5zaW5nbGVQYWdlSW5saW5lUG9zaXRpb24gPT09ICd0b3AnKSB7XG4gICAgICAgICAgICAgICAgdC5zdGFydElubGluZSA9IDA7XG4gICAgICAgICAgICAgICAgdC50b3AgPSAwO1xuXG4gICAgICAgICAgICAgICAgdC5maXJzdFJvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdC5sYXN0Um93ID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHQub3B0aW9ucy5zaW5nbGVQYWdlSW5saW5lUG9zaXRpb24gPT09ICdib3R0b20nKSB7XG4gICAgICAgICAgICAgICAgdC5zdGFydElubGluZSA9IHQuY291bnRlclRvdGFsO1xuICAgICAgICAgICAgICAgIHQudG9wID0gdC5jdWJlcG9ydGZvbGlvLmhlaWdodDtcblxuICAgICAgICAgICAgICAgIHQuZmlyc3RSb3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0Lmxhc3RSb3cgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0Lm9wdGlvbnMuc2luZ2xlUGFnZUlubGluZVBvc2l0aW9uID09PSAnYWJvdmUnKSB7XG4gICAgICAgICAgICAgICAgdC5zdGFydElubGluZSA9IHQuY3ViZXBvcnRmb2xpby5jb2xzICogTWF0aC5mbG9vcih0LmN1cnJlbnQgLyB0LmN1YmVwb3J0Zm9saW8uY29scyk7XG4gICAgICAgICAgICAgICAgdC50b3AgPSAkKGJsb2Nrc1t0LmN1cnJlbnRdKS5kYXRhKCdjYnAnKS50b3A7XG5cbiAgICAgICAgICAgICAgICBpZiAodC5zdGFydElubGluZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0LmZpcnN0Um93ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0LnRvcCAtPSB0Lm9wdGlvbnMuZ2FwSG9yaXpvbnRhbDtcbiAgICAgICAgICAgICAgICAgICAgdC5maXJzdFJvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHQubGFzdFJvdyA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHsgLy8gYmVsb3dcbiAgICAgICAgICAgICAgICB0LnRvcCA9ICQoYmxvY2tzW3QuY3VycmVudF0pLmRhdGEoJ2NicCcpLnRvcCArICQoYmxvY2tzW3QuY3VycmVudF0pLmRhdGEoJ2NicCcpLmhlaWdodDtcbiAgICAgICAgICAgICAgICB0LnN0YXJ0SW5saW5lID0gTWF0aC5taW4odC5jdWJlcG9ydGZvbGlvLmNvbHMgKlxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5mbG9vcih0LmN1cnJlbnQgLyB0LmN1YmVwb3J0Zm9saW8uY29scykgKyAxKSxcbiAgICAgICAgICAgICAgICAgICAgdC5jb3VudGVyVG90YWwpO1xuXG4gICAgICAgICAgICAgICAgdC5maXJzdFJvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHQubGFzdFJvdyA9ICh0LnN0YXJ0SW5saW5lID09PSB0LmNvdW50ZXJUb3RhbCkgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQud3JhcFswXS5zdHlsZS5oZWlnaHQgPSB0LndyYXAub3V0ZXJIZWlnaHQodHJ1ZSkgKyAncHgnO1xuXG4gICAgICAgICAgICAvLyBkZWJvdW5jZXIgZm9yIGlubGluZSBjb250ZW50XG4gICAgICAgICAgICB0LmRlZmVycmVkSW5saW5lID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgICAgICBpZiAodC5vcHRpb25zLnNpbmdsZVBhZ2VJbmxpbmVJbkZvY3VzKSB7XG5cbiAgICAgICAgICAgICAgICB0LnNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblxuICAgICAgICAgICAgICAgIHZhciBnb1RvU2Nyb2xsID0gdC5jdWJlcG9ydGZvbGlvLiRvYmoub2Zmc2V0KCkudG9wICsgdC50b3AgLSAxMDA7XG5cbiAgICAgICAgICAgICAgICBpZiAodC5zY3JvbGxUb3AgIT09IGdvVG9TY3JvbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnaHRtbCxib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiBnb1RvU2Nyb2xsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAzNTApXG4gICAgICAgICAgICAgICAgICAgICAgICAucHJvbWlzZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0Ll9yZXNpemVTaW5nbGVQYWdlSW5saW5lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdC5kZWZlcnJlZElubGluZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0Ll9yZXNpemVTaW5nbGVQYWdlSW5saW5lKCk7XG4gICAgICAgICAgICAgICAgICAgIHQuZGVmZXJyZWRJbmxpbmUucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdC5fcmVzaXplU2luZ2xlUGFnZUlubGluZSgpO1xuICAgICAgICAgICAgICAgIHQuZGVmZXJyZWRJbmxpbmUucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0LmN1YmVwb3J0Zm9saW8uJG9iai5hZGRDbGFzcygnY2JwLXBvcHVwLXNpbmdsZVBhZ2VJbmxpbmUtb3BlbicpO1xuXG4gICAgICAgICAgICB0LndyYXAuY3NzKHtcbiAgICAgICAgICAgICAgICB0b3A6IHQudG9wXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gcmVnaXN0ZXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24odC5vcHRpb25zLnNpbmdsZVBhZ2VJbmxpbmVDYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICB0Lm9wdGlvbnMuc2luZ2xlUGFnZUlubGluZUNhbGxiYWNrLmNhbGwodCwgdC5kYXRhQXJyYXlbdC5jdXJyZW50XS51cmwsIHQuZGF0YUFycmF5W3QuY3VycmVudF0uZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3Jlc2l6ZVNpbmdsZVBhZ2VJbmxpbmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgICAgICB0LmhlaWdodCA9ICh0LmZpcnN0Um93IHx8IHQubGFzdFJvdykgPyB0LndyYXAub3V0ZXJIZWlnaHQodHJ1ZSkgOiB0LndyYXAub3V0ZXJIZWlnaHQodHJ1ZSkgLSB0Lm9wdGlvbnMuZ2FwSG9yaXpvbnRhbDtcblxuICAgICAgICAgICAgdC5zdG9yZUJsb2Nrcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IHQuc3RhcnRJbmxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5tb2Rlcm5Ccm93c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZVtDdWJlUG9ydGZvbGlvLlByaXZhdGUudHJhbnNmb3JtXSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUubWFyZ2luVG9wID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoQ3ViZVBvcnRmb2xpby5Qcml2YXRlLm1vZGVybkJyb3dzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlW0N1YmVQb3J0Zm9saW8uUHJpdmF0ZS50cmFuc2Zvcm1dID0gJ3RyYW5zbGF0ZTNkKDBweCwgJyArIHQuaGVpZ2h0ICsgJ3B4LCAwKSc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS5tYXJnaW5Ub3AgPSB0LmhlaWdodCArICdweCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdC5jdWJlcG9ydGZvbGlvLm9iai5zdHlsZS5oZWlnaHQgPSB0LmN1YmVwb3J0Zm9saW8uaGVpZ2h0ICsgdC5oZWlnaHQgKyAncHgnO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9yZXZlcnRSZXNpemVTaW5nbGVQYWdlSW5saW5lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gcmVzZXQgZGVmZXJyZWQgb2JqZWN0XG4gICAgICAgICAgICB0LmRlZmVycmVkSW5saW5lID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgICAgICB0LnN0b3JlQmxvY2tzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICAgICAgICAgICAgaWYgKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5tb2Rlcm5Ccm93c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlW0N1YmVQb3J0Zm9saW8uUHJpdmF0ZS50cmFuc2Zvcm1dID0gJyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUubWFyZ2luVG9wID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHQuY3ViZXBvcnRmb2xpby5vYmouc3R5bGUuaGVpZ2h0ID0gdC5jdWJlcG9ydGZvbGlvLmhlaWdodCArICdweCc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kU2NyaXB0c1RvV3JhcDogZnVuY3Rpb24oc2NyaXB0cykge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGluZGV4ID0gMCxcbiAgICAgICAgICAgICAgICBsb2FkU2NyaXB0cyA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjID0gaXRlbS5zcmM7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2NyaXB0LnJlYWR5U3RhdGUpIHsgLy8gaWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2NyaXB0LnJlYWR5U3RhdGUgPT0gJ2xvYWRlZCcgfHwgc2NyaXB0LnJlYWR5U3RhdGUgPT0gJ2NvbXBsZXRlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNjcmlwdHNbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkU2NyaXB0cyhzY3JpcHRzW2luZGV4XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNjcmlwdHNbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRTY3JpcHRzKHNjcmlwdHNbaW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNyYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9IHNyYztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdC50ZXh0ID0gaXRlbS50ZXh0O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdC5jb250ZW50WzBdLmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsb2FkU2NyaXB0cyhzY3JpcHRzWzBdKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVTaW5nbGVQYWdlOiBmdW5jdGlvbihodG1sLCBzY3JpcHRzLCBpc1dyYXApIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjb3VudGVyTWFya3VwLFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkZpbmlzaDtcblxuICAgICAgICAgICAgdC5jb250ZW50LmFkZENsYXNzKCdjYnAtcG9wdXAtY29udGVudCcpLnJlbW92ZUNsYXNzKCdjYnAtcG9wdXAtY29udGVudC1iYXNpYycpO1xuXG4gICAgICAgICAgICBpZiAoaXNXcmFwID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHQuY29udGVudC5yZW1vdmVDbGFzcygnY2JwLXBvcHVwLWNvbnRlbnQnKS5hZGRDbGFzcygnY2JwLXBvcHVwLWNvbnRlbnQtYmFzaWMnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdXBkYXRlIGNvdW50ZXIgbmF2aWdhdGlvblxuICAgICAgICAgICAgaWYgKHQuY291bnRlcikge1xuICAgICAgICAgICAgICAgIGNvdW50ZXJNYXJrdXAgPSAkKHQuX2dldENvdW50ZXJNYXJrdXAodC5vcHRpb25zLnNpbmdsZVBhZ2VDb3VudGVyLCB0LmN1cnJlbnQgKyAxLCB0LmNvdW50ZXJUb3RhbCkpO1xuICAgICAgICAgICAgICAgIHQuY291bnRlci50ZXh0KGNvdW50ZXJNYXJrdXAudGV4dCgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5jb250ZW50Lmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgIGlmIChzY3JpcHRzKSB7XG4gICAgICAgICAgICAgICAgdC5hcHBlbmRTY3JpcHRzVG9XcmFwKHNjcmlwdHMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0cmlnZ2VyIHB1YmxpYyBldmVudFxuICAgICAgICAgICAgdC5jdWJlcG9ydGZvbGlvLiRvYmoudHJpZ2dlcigndXBkYXRlU2luZ2xlUGFnZVN0YXJ0LmNicCcpO1xuXG4gICAgICAgICAgICB0LmZpbmlzaE9wZW4tLTtcblxuICAgICAgICAgICAgaWYgKHQuZmluaXNoT3BlbiA8PSAwKSB7XG4gICAgICAgICAgICAgICAgdC51cGRhdGVTaW5nbGVQYWdlSXNPcGVuLmNhbGwodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlU2luZ2xlUGFnZUlzT3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc2VsZWN0b3JTbGlkZXI7XG5cbiAgICAgICAgICAgIHQud3JhcC5hZGRDbGFzcygnY2JwLXBvcHVwLXJlYWR5Jyk7XG4gICAgICAgICAgICB0LndyYXAucmVtb3ZlQ2xhc3MoJ2NicC1wb3B1cC1sb2FkaW5nJyk7XG5cbiAgICAgICAgICAgIC8vIGluc3RhbnRpYXRlIHNsaWRlciBpZiBleGlzdHNcbiAgICAgICAgICAgIHNlbGVjdG9yU2xpZGVyID0gdC5jb250ZW50LmZpbmQoJy5jYnAtc2xpZGVyJyk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0b3JTbGlkZXIpIHtcbiAgICAgICAgICAgICAgICBzZWxlY3RvclNsaWRlci5maW5kKCcuY2JwLXNsaWRlci1pdGVtJykuYWRkQ2xhc3MoJ2NicC1pdGVtJyk7XG4gICAgICAgICAgICAgICAgdC5zbGlkZXIgPSBzZWxlY3RvclNsaWRlci5jdWJlcG9ydGZvbGlvKHtcbiAgICAgICAgICAgICAgICAgICAgbGF5b3V0TW9kZTogJ3NsaWRlcicsXG4gICAgICAgICAgICAgICAgICAgIG1lZGlhUXVlcmllczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sczogMVxuICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICAgICAgZ2FwSG9yaXpvbnRhbDogMCxcbiAgICAgICAgICAgICAgICAgICAgZ2FwVmVydGljYWw6IDAsXG4gICAgICAgICAgICAgICAgICAgIGNhcHRpb246ICcnLFxuICAgICAgICAgICAgICAgICAgICBjb3ZlclJhdGlvOiAnJywgLy8gd3AgdmVyc2lvbiBvbmx5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHQuc2xpZGVyID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc2Nyb2xsIGJ1ZyBvbiBhbmRyb2lkIGFuZCBpb3NcbiAgICAgICAgICAgIGlmIChDdWJlUG9ydGZvbGlvLlByaXZhdGUuYnJvd3NlciA9PT0gJ2FuZHJvaWQnIHx8IEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5icm93c2VyID09PSAnaW9zJykge1xuICAgICAgICAgICAgICAgICQoJ2h0bWwnKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0cmlnZ2VyIHB1YmxpYyBldmVudFxuICAgICAgICAgICAgdC5jdWJlcG9ydGZvbGlvLiRvYmoudHJpZ2dlcigndXBkYXRlU2luZ2xlUGFnZUNvbXBsZXRlLmNicCcpO1xuXG4gICAgICAgIH0sXG5cblxuICAgICAgICB1cGRhdGVTaW5nbGVQYWdlSW5saW5lOiBmdW5jdGlvbihodG1sLCBzY3JpcHRzKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHQuY29udGVudC5odG1sKGh0bWwpO1xuXG4gICAgICAgICAgICBpZiAoc2NyaXB0cykge1xuICAgICAgICAgICAgICAgIHQuYXBwZW5kU2NyaXB0c1RvV3JhcChzY3JpcHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHRyaWdnZXIgcHVibGljIGV2ZW50XG4gICAgICAgICAgICB0LmN1YmVwb3J0Zm9saW8uJG9iai50cmlnZ2VyKCd1cGRhdGVTaW5nbGVQYWdlSW5saW5lU3RhcnQuY2JwJyk7XG5cbiAgICAgICAgICAgIHQuc2luZ2xlUGFnZUlubGluZUlzT3Blbi5jYWxsKHQpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgc2luZ2xlUGFnZUlubGluZUlzT3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGZpbmlzaExvYWRpbmcoKSB7XG4gICAgICAgICAgICAgICAgdC53cmFwLmFkZENsYXNzKCdjYnAtcG9wdXAtc2luZ2xlUGFnZUlubGluZS1yZWFkeScpO1xuICAgICAgICAgICAgICAgIHQud3JhcFswXS5zdHlsZS5oZWlnaHQgPSAnJztcblxuICAgICAgICAgICAgICAgIHQuX3Jlc2l6ZVNpbmdsZVBhZ2VJbmxpbmUoKTtcblxuICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgcHVibGljIGV2ZW50XG4gICAgICAgICAgICAgICAgdC5jdWJlcG9ydGZvbGlvLiRvYmoudHJpZ2dlcigndXBkYXRlU2luZ2xlUGFnZUlubGluZUNvbXBsZXRlLmNicCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB3YWl0IHRvIGxvYWQgYWxsIGltYWdlc1xuICAgICAgICAgICAgdC5jdWJlcG9ydGZvbGlvLl9sb2FkKHQud3JhcCwgZnVuY3Rpb24oKSB7XG5cblxuICAgICAgICAgICAgICAgIC8vIGluc3RhbnRpYXRlIHNsaWRlciBpZiBleGlzdHNcbiAgICAgICAgICAgICAgICB2YXIgc2VsZWN0b3JTbGlkZXIgPSB0LmNvbnRlbnQuZmluZCgnLmNicC1zbGlkZXInKTtcblxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RvclNsaWRlci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3JTbGlkZXIuZmluZCgnLmNicC1zbGlkZXItaXRlbScpLmFkZENsYXNzKCdjYnAtaXRlbScpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yU2xpZGVyLm9uZSgnaW5pdENvbXBsZXRlLmNicCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC5kZWZlcnJlZElubGluZS5kb25lKGZpbmlzaExvYWRpbmcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RvclNsaWRlci5vbigncGx1Z2luUmVzaXplLmNicCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC5kZWZlcnJlZElubGluZS5kb25lKGZpbmlzaExvYWRpbmcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0LnNsaWRlciA9IHNlbGVjdG9yU2xpZGVyLmN1YmVwb3J0Zm9saW8oe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGF5b3V0TW9kZTogJ3NsaWRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5VHlwZTogJ2RlZmF1bHQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVkaWFRdWVyaWVzOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHM6IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FwSG9yaXpvbnRhbDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhcFZlcnRpY2FsOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FwdGlvbjogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3ZlclJhdGlvOiAnJywgLy8gd3AgdmVyc2lvbiBvbmx5XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHQuc2xpZGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdC5kZWZlcnJlZElubGluZS5kb25lKGZpbmlzaExvYWRpbmcpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSxcblxuXG4gICAgICAgIGlzSW1hZ2U6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaW1nID0gbmV3IEltYWdlKCk7XG5cbiAgICAgICAgICAgIHQudG9vZ2dsZUxvYWRpbmcodHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmICgkKCc8aW1nIHNyYz1cIicgKyBlbC5zcmMgKyAnXCI+JykuaXMoJ2ltZzp1bmNhY2hlZCcpKSB7XG5cbiAgICAgICAgICAgICAgICAkKGltZykub24oJ2xvYWQuY2JwJyArICcgZXJyb3IuY2JwJywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdC51cGRhdGVJbWFnZXNNYXJrdXAoZWwuc3JjLCBlbC50aXRsZSwgdC5fZ2V0Q291bnRlck1hcmt1cCh0Lm9wdGlvbnMubGlnaHRib3hDb3VudGVyLCB0LmN1cnJlbnQgKyAxLCB0LmNvdW50ZXJUb3RhbCkpO1xuXG4gICAgICAgICAgICAgICAgICAgIHQudG9vZ2dsZUxvYWRpbmcoZmFsc2UpO1xuXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9IGVsLnNyYztcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHQudXBkYXRlSW1hZ2VzTWFya3VwKGVsLnNyYywgZWwudGl0bGUsIHQuX2dldENvdW50ZXJNYXJrdXAodC5vcHRpb25zLmxpZ2h0Ym94Q291bnRlciwgdC5jdXJyZW50ICsgMSwgdC5jb3VudGVyVG90YWwpKTtcblxuICAgICAgICAgICAgICAgIHQudG9vZ2dsZUxvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzVmltZW86IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHQudXBkYXRlVmlkZW9NYXJrdXAoZWwuc3JjLCBlbC50aXRsZSwgdC5fZ2V0Q291bnRlck1hcmt1cCh0Lm9wdGlvbnMubGlnaHRib3hDb3VudGVyLCB0LmN1cnJlbnQgKyAxLCB0LmNvdW50ZXJUb3RhbCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzWW91dHViZTogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcbiAgICAgICAgICAgIHQudXBkYXRlVmlkZW9NYXJrdXAoZWwuc3JjLCBlbC50aXRsZSwgdC5fZ2V0Q291bnRlck1hcmt1cCh0Lm9wdGlvbnMubGlnaHRib3hDb3VudGVyLCB0LmN1cnJlbnQgKyAxLCB0LmNvdW50ZXJUb3RhbCkpO1xuXG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNUZWQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG4gICAgICAgICAgICB0LnVwZGF0ZVZpZGVvTWFya3VwKGVsLnNyYywgZWwudGl0bGUsIHQuX2dldENvdW50ZXJNYXJrdXAodC5vcHRpb25zLmxpZ2h0Ym94Q291bnRlciwgdC5jdXJyZW50ICsgMSwgdC5jb3VudGVyVG90YWwpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc1NvdW5kQ2xvdWQ6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG4gICAgICAgICAgICB0LnVwZGF0ZVZpZGVvTWFya3VwKGVsLnNyYywgZWwudGl0bGUsIHQuX2dldENvdW50ZXJNYXJrdXAodC5vcHRpb25zLmxpZ2h0Ym94Q291bnRlciwgdC5jdXJyZW50ICsgMSwgdC5jb3VudGVyVG90YWwpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc1NlbGZIb3N0ZWRWaWRlbzogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcbiAgICAgICAgICAgIHQudXBkYXRlU2VsZkhvc3RlZFZpZGVvKGVsLnNyYywgZWwudGl0bGUsIHQuX2dldENvdW50ZXJNYXJrdXAodC5vcHRpb25zLmxpZ2h0Ym94Q291bnRlciwgdC5jdXJyZW50ICsgMSwgdC5jb3VudGVyVG90YWwpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc1NlbGZIb3N0ZWRBdWRpbzogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcbiAgICAgICAgICAgIHQudXBkYXRlU2VsZkhvc3RlZEF1ZGlvKGVsLnNyYywgZWwudGl0bGUsIHQuX2dldENvdW50ZXJNYXJrdXAodC5vcHRpb25zLmxpZ2h0Ym94Q291bnRlciwgdC5jdXJyZW50ICsgMSwgdC5jb3VudGVyVG90YWwpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZ2V0Q291bnRlck1hcmt1cDogZnVuY3Rpb24obWFya3VwLCBjdXJyZW50LCB0b3RhbCkge1xuICAgICAgICAgICAgaWYgKCFtYXJrdXAubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbWFwT2JqID0ge1xuICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGN1cnJlbnQsXG4gICAgICAgICAgICAgICAgdG90YWw6IHRvdGFsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbWFya3VwLnJlcGxhY2UoL1xce1xce2N1cnJlbnR9fXxcXHtcXHt0b3RhbH19L2dpLCBmdW5jdGlvbihtYXRjaGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcE9ialttYXRjaGVkLnNsaWNlKDIsIC0yKV07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVTZWxmSG9zdGVkVmlkZW86IGZ1bmN0aW9uKHNyYywgdGl0bGUsIGNvdW50ZXIpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgICB0LndyYXAuYWRkQ2xhc3MoJ2NicC1wb3B1cC1saWdodGJveC1pc0lmcmFtZScpO1xuXG4gICAgICAgICAgICB2YXIgbWFya3VwID0gJzxkaXYgY2xhc3M9XCJjYnAtcG9wdXAtbGlnaHRib3gtaWZyYW1lXCI+JyArXG4gICAgICAgICAgICAgICAgJzx2aWRlbyBjb250cm9scz1cImNvbnRyb2xzXCIgaGVpZ2h0PVwiYXV0b1wiIHN0eWxlPVwid2lkdGg6IDEwMCVcIj4nO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3JjLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKC8oXFwubXA0KS9pLnRlc3Qoc3JjW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICBtYXJrdXAgKz0gJzxzb3VyY2Ugc3JjPVwiJyArIHNyY1tpXSArICdcIiB0eXBlPVwidmlkZW8vbXA0XCI+JztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKC8oXFwub2dnKXwoXFwub2d2KS9pLnRlc3Qoc3JjW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICBtYXJrdXAgKz0gJzxzb3VyY2Ugc3JjPVwiJyArIHNyY1tpXSArICdcIiB0eXBlPVwidmlkZW8vb2dnXCI+JztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKC8oXFwud2VibSkvaS50ZXN0KHNyY1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya3VwICs9ICc8c291cmNlIHNyYz1cIicgKyBzcmNbaV0gKyAnXCIgdHlwZT1cInZpZGVvL3dlYm1cIj4nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWFya3VwICs9ICdZb3VyIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0aGUgdmlkZW8gdGFnLicgK1xuICAgICAgICAgICAgICAgICc8L3ZpZGVvPicgK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY2JwLXBvcHVwLWxpZ2h0Ym94LWJvdHRvbVwiPicgK1xuICAgICAgICAgICAgICAgICgodGl0bGUpID8gJzxkaXYgY2xhc3M9XCJjYnAtcG9wdXAtbGlnaHRib3gtdGl0bGVcIj4nICsgdGl0bGUgKyAnPC9kaXY+JyA6ICcnKSArXG4gICAgICAgICAgICAgICAgY291bnRlciArXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xuXG4gICAgICAgICAgICB0LmNvbnRlbnQuaHRtbChtYXJrdXApO1xuXG4gICAgICAgICAgICB0LndyYXAuYWRkQ2xhc3MoJ2NicC1wb3B1cC1yZWFkeScpO1xuXG4gICAgICAgICAgICB0LnByZWxvYWROZWFyYnlJbWFnZXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVTZWxmSG9zdGVkQXVkaW86IGZ1bmN0aW9uKHNyYywgdGl0bGUsIGNvdW50ZXIpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgICB0LndyYXAuYWRkQ2xhc3MoJ2NicC1wb3B1cC1saWdodGJveC1pc0lmcmFtZScpO1xuXG4gICAgICAgICAgICB2YXIgbWFya3VwID0gJzxkaXYgY2xhc3M9XCJjYnAtcG9wdXAtbGlnaHRib3gtaWZyYW1lXCI+JyArXG4gICAgICAgICAgICAgICAgJzxhdWRpbyBjb250cm9scz1cImNvbnRyb2xzXCIgaGVpZ2h0PVwiYXV0b1wiIHN0eWxlPVwid2lkdGg6IDEwMCVcIj4nICtcbiAgICAgICAgICAgICAgICAnPHNvdXJjZSBzcmM9XCInICsgc3JjICsgJ1wiIHR5cGU9XCJhdWRpby9tcGVnXCI+JyArXG4gICAgICAgICAgICAgICAgJ1lvdXIgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHRoZSBhdWRpbyB0YWcuJyArXG4gICAgICAgICAgICAgICAgJzwvYXVkaW8+JyArXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjYnAtcG9wdXAtbGlnaHRib3gtYm90dG9tXCI+JyArXG4gICAgICAgICAgICAgICAgKCh0aXRsZSkgPyAnPGRpdiBjbGFzcz1cImNicC1wb3B1cC1saWdodGJveC10aXRsZVwiPicgKyB0aXRsZSArICc8L2Rpdj4nIDogJycpICtcbiAgICAgICAgICAgICAgICBjb3VudGVyICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XG5cbiAgICAgICAgICAgIHQuY29udGVudC5odG1sKG1hcmt1cCk7XG5cbiAgICAgICAgICAgIHQud3JhcC5hZGRDbGFzcygnY2JwLXBvcHVwLXJlYWR5Jyk7XG5cbiAgICAgICAgICAgIHQucHJlbG9hZE5lYXJieUltYWdlcygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVZpZGVvTWFya3VwOiBmdW5jdGlvbihzcmMsIHRpdGxlLCBjb3VudGVyKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG4gICAgICAgICAgICB0LndyYXAuYWRkQ2xhc3MoJ2NicC1wb3B1cC1saWdodGJveC1pc0lmcmFtZScpO1xuXG4gICAgICAgICAgICB2YXIgbWFya3VwID0gJzxkaXYgY2xhc3M9XCJjYnAtcG9wdXAtbGlnaHRib3gtaWZyYW1lXCI+JyArXG4gICAgICAgICAgICAgICAgJzxpZnJhbWUgc3JjPVwiJyArIHNyYyArICdcIiBmcmFtZWJvcmRlcj1cIjBcIiBhbGxvd2Z1bGxzY3JlZW4gc2Nyb2xsaW5nPVwibm9cIj48L2lmcmFtZT4nICtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNicC1wb3B1cC1saWdodGJveC1ib3R0b21cIj4nICtcbiAgICAgICAgICAgICAgICAoKHRpdGxlKSA/ICc8ZGl2IGNsYXNzPVwiY2JwLXBvcHVwLWxpZ2h0Ym94LXRpdGxlXCI+JyArIHRpdGxlICsgJzwvZGl2PicgOiAnJykgK1xuICAgICAgICAgICAgICAgIGNvdW50ZXIgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcblxuICAgICAgICAgICAgdC5jb250ZW50Lmh0bWwobWFya3VwKTtcbiAgICAgICAgICAgIHQud3JhcC5hZGRDbGFzcygnY2JwLXBvcHVwLXJlYWR5Jyk7XG4gICAgICAgICAgICB0LnByZWxvYWROZWFyYnlJbWFnZXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGVJbWFnZXNNYXJrdXA6IGZ1bmN0aW9uKHNyYywgdGl0bGUsIGNvdW50ZXIpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgdC53cmFwLnJlbW92ZUNsYXNzKCdjYnAtcG9wdXAtbGlnaHRib3gtaXNJZnJhbWUnKTtcblxuICAgICAgICAgICAgdmFyIG1hcmt1cCA9ICc8ZGl2IGNsYXNzPVwiY2JwLXBvcHVwLWxpZ2h0Ym94LWZpZ3VyZVwiPicgK1xuICAgICAgICAgICAgICAgICc8aW1nIHNyYz1cIicgKyBzcmMgKyAnXCIgY2xhc3M9XCJjYnAtcG9wdXAtbGlnaHRib3gtaW1nXCIgJyArIHQuZGF0YUFjdGlvbkltZyArICcgLz4nICtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNicC1wb3B1cC1saWdodGJveC1ib3R0b21cIj4nICtcbiAgICAgICAgICAgICAgICAoKHRpdGxlKSA/ICc8ZGl2IGNsYXNzPVwiY2JwLXBvcHVwLWxpZ2h0Ym94LXRpdGxlXCI+JyArIHRpdGxlICsgJzwvZGl2PicgOiAnJykgK1xuICAgICAgICAgICAgICAgIGNvdW50ZXIgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcblxuICAgICAgICAgICAgdC5jb250ZW50Lmh0bWwobWFya3VwKTtcblxuICAgICAgICAgICAgdC53cmFwLmFkZENsYXNzKCdjYnAtcG9wdXAtcmVhZHknKTtcblxuICAgICAgICAgICAgdC5yZXNpemVJbWFnZSgpO1xuXG4gICAgICAgICAgICB0LnByZWxvYWROZWFyYnlJbWFnZXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcbiAgICAgICAgICAgIHRbdC50eXBlICsgJ0p1bXBUbyddKDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByZXY6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzO1xuICAgICAgICAgICAgdFt0LnR5cGUgKyAnSnVtcFRvJ10oLTEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxpZ2h0Ym94SnVtcFRvOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGVsO1xuXG4gICAgICAgICAgICB0LmN1cnJlbnQgPSB0LmdldEluZGV4KHQuY3VycmVudCArIGluZGV4KTtcblxuICAgICAgICAgICAgLy8gZ2V0IHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICAgICAgICAgIGVsID0gdC5kYXRhQXJyYXlbdC5jdXJyZW50XTtcblxuICAgICAgICAgICAgLy8gY2FsbCBmdW5jdGlvbiBpZiBjdXJyZW50IGVsZW1lbnQgaXMgaW1hZ2Ugb3IgdmlkZW8gKGlmcmFtZSlcbiAgICAgICAgICAgIHRbZWwudHlwZV0oZWwpO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgc2luZ2xlUGFnZUp1bXBUbzogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgdC5jdXJyZW50ID0gdC5nZXRJbmRleCh0LmN1cnJlbnQgKyBpbmRleCk7XG5cbiAgICAgICAgICAgIC8vIHJlZ2lzdGVyIHNpbmdsZVBhZ2VDYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbih0Lm9wdGlvbnMuc2luZ2xlUGFnZUNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIHQucmVzZXRXcmFwKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBnbyB0byB0b3Agb2YgdGhlIHBhZ2UgKHJlc2V0IHNjcm9sbClcbiAgICAgICAgICAgICAgICB0LndyYXAuc2Nyb2xsVG9wKDApO1xuXG4gICAgICAgICAgICAgICAgdC53cmFwLmFkZENsYXNzKCdjYnAtcG9wdXAtbG9hZGluZycpO1xuICAgICAgICAgICAgICAgIHQub3B0aW9ucy5zaW5nbGVQYWdlQ2FsbGJhY2suY2FsbCh0LCB0LmRhdGFBcnJheVt0LmN1cnJlbnRdLnVybCwgdC5kYXRhQXJyYXlbdC5jdXJyZW50XS5lbGVtZW50KTtcblxuICAgICAgICAgICAgICAgIGlmICh0Lm9wdGlvbnMuc2luZ2xlUGFnZURlZXBsaW5raW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSB0LnVybCArICcjY2JwPScgKyB0LmRhdGFBcnJheVt0LmN1cnJlbnRdLnVybDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzZXRXcmFwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHQudHlwZSA9PT0gJ3NpbmdsZVBhZ2UnICYmIHQub3B0aW9ucy5zaW5nbGVQYWdlRGVlcGxpbmtpbmcpIHtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gdC51cmwgKyAnIyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0SW5kZXg6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIGdvIHRvIGludGVydmFsIFswLCAoKyBvciAtKXRoaXMuY291bnRlclRvdGFsLmxlbmd0aCAtIDFdXG4gICAgICAgICAgICBpbmRleCA9IGluZGV4ICUgdC5jb3VudGVyVG90YWw7XG5cbiAgICAgICAgICAgIC8vIGlmIGluZGV4IGlzIGxlc3MgdGhlbiAwIHRoZW4gZ28gdG8gaW50ZXJ2YWwgKDAsIHRoaXMuY291bnRlclRvdGFsIC0gMV1cbiAgICAgICAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IHQuY291bnRlclRvdGFsICsgaW5kZXg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfSxcblxuICAgICAgICBjbG9zZTogZnVuY3Rpb24obWV0aG9kLCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGZpbmlzaENsb3NlKCkge1xuICAgICAgICAgICAgICAgIC8vIHJlc2V0IGNvbnRlbnRcbiAgICAgICAgICAgICAgICB0LmNvbnRlbnQuaHRtbCgnJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBoaWRlIHRoZSB3cmFwXG4gICAgICAgICAgICAgICAgdC53cmFwLmRldGFjaCgpO1xuXG4gICAgICAgICAgICAgICAgdC5jdWJlcG9ydGZvbGlvLiRvYmoucmVtb3ZlQ2xhc3MoJ2NicC1wb3B1cC1zaW5nbGVQYWdlSW5saW5lLW9wZW4gY2JwLXBvcHVwLXNpbmdsZVBhZ2VJbmxpbmUtY2xvc2UnKTtcblxuICAgICAgICAgICAgICAgIGlmIChtZXRob2QgPT09ICdwcm9taXNlJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGRhdGEuY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNhbGxiYWNrLmNhbGwodC5jdWJlcG9ydGZvbGlvKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tGb2N1c0lubGluZSgpIHtcbiAgICAgICAgICAgICAgICBpZiAodC5vcHRpb25zLnNpbmdsZVBhZ2VJbmxpbmVJbkZvY3VzICYmIG1ldGhvZCAhPT0gJ3Byb21pc2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogdC5zY3JvbGxUb3BcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDM1MClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9taXNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaENsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2hDbG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbm93IHRoZSBwb3B1cCBpcyBjbG9zZWRcbiAgICAgICAgICAgIHQuaXNPcGVuID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmICh0LnR5cGUgPT09ICdzaW5nbGVQYWdlSW5saW5lJykge1xuXG4gICAgICAgICAgICAgICAgaWYgKG1ldGhvZCA9PT0gJ29wZW4nKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgdC53cmFwLnJlbW92ZUNsYXNzKCdjYnAtcG9wdXAtc2luZ2xlUGFnZUlubGluZS1yZWFkeScpO1xuXG4gICAgICAgICAgICAgICAgICAgICQodC5kYXRhQXJyYXlbdC5jdXJyZW50XS5lbGVtZW50KS5jbG9zZXN0KCcuY2JwLWl0ZW0nKS5yZW1vdmVDbGFzcygnY2JwLXNpbmdsZVBhZ2VJbmxpbmUtYWN0aXZlJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgdC5vcGVuU2luZ2xlUGFnZUlubGluZShkYXRhLmJsb2NrcywgZGF0YS5jdXJyZW50QmxvY2ssIGRhdGEuZnJvbU9wZW4pO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICB0LmhlaWdodCA9IDA7XG5cbiAgICAgICAgICAgICAgICAgICAgdC5fcmV2ZXJ0UmVzaXplU2luZ2xlUGFnZUlubGluZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHQud3JhcC5yZW1vdmVDbGFzcygnY2JwLXBvcHVwLXNpbmdsZVBhZ2VJbmxpbmUtcmVhZHknKTtcblxuICAgICAgICAgICAgICAgICAgICB0LmN1YmVwb3J0Zm9saW8uJG9iai5hZGRDbGFzcygnY2JwLXBvcHVwLXNpbmdsZVBhZ2VJbmxpbmUtY2xvc2UnKTtcblxuICAgICAgICAgICAgICAgICAgICB0LnN0YXJ0SW5saW5lID0gLTE7XG5cbiAgICAgICAgICAgICAgICAgICAgdC5jdWJlcG9ydGZvbGlvLiRvYmouZmluZCgnLmNicC1pdGVtJykucmVtb3ZlQ2xhc3MoJ2NicC1zaW5nbGVQYWdlSW5saW5lLWFjdGl2ZScpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChDdWJlUG9ydGZvbGlvLlByaXZhdGUubW9kZXJuQnJvd3Nlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdC53cmFwLm9uZShDdWJlUG9ydGZvbGlvLlByaXZhdGUudHJhbnNpdGlvbmVuZCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tGb2N1c0lubGluZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja0ZvY3VzSW5saW5lKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodC50eXBlID09PSAnc2luZ2xlUGFnZScpIHtcblxuICAgICAgICAgICAgICAgIHQucmVzZXRXcmFwKCk7XG5cbiAgICAgICAgICAgICAgICB0LndyYXAucmVtb3ZlQ2xhc3MoJ2NicC1wb3B1cC1yZWFkeScpO1xuXG4gICAgICAgICAgICAgICAgLy8gc2Nyb2xsIGJ1ZyBvbiBhbmRyb2lkIGFuZCBpb3NcbiAgICAgICAgICAgICAgICBpZiAoQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmJyb3dzZXIgPT09ICdhbmRyb2lkJyB8fCBDdWJlUG9ydGZvbGlvLlByaXZhdGUuYnJvd3NlciA9PT0gJ2lvcycpIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnaHRtbCcpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdC5uYXZpZ2F0aW9uV3JhcC5hcHBlbmRUbyh0LndyYXApO1xuICAgICAgICAgICAgICAgICAgICB0Lm5hdmlnYXRpb25Nb2JpbGUucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJCh3aW5kb3cpLnNjcm9sbFRvcCh0LnNjcm9sbFRvcCk7XG5cbiAgICAgICAgICAgICAgICAvLyB3ZWlyZCBidWcgb24gbW96aWxsYS4gZml4ZWQgd2l0aCBzZXRUaW1lb3V0XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdC5zdG9wU2Nyb2xsID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICB0Lm5hdmlnYXRpb25XcmFwLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IHQud3JhcC5zY3JvbGxUb3AoKVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0LndyYXAucmVtb3ZlQ2xhc3MoJ2NicC1wb3B1cC1zaW5nbGVQYWdlLW9wZW4gY2JwLXBvcHVwLXNpbmdsZVBhZ2Utc3RpY2t5Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5icm93c2VyID09PSAnaWU4JyB8fCBDdWJlUG9ydGZvbGlvLlByaXZhdGUuYnJvd3NlciA9PT0gJ2llOScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlc2V0IGNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuY29udGVudC5odG1sKCcnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaGlkZSB0aGUgd3JhcFxuICAgICAgICAgICAgICAgICAgICAgICAgdC53cmFwLmRldGFjaCgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkKCdodG1sJykuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0Lm5hdmlnYXRpb25XcmFwLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0sIDApO1xuXG4gICAgICAgICAgICAgICAgdC53cmFwLm9uZShDdWJlUG9ydGZvbGlvLlByaXZhdGUudHJhbnNpdGlvbmVuZCwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmVzZXQgY29udGVudFxuICAgICAgICAgICAgICAgICAgICB0LmNvbnRlbnQuaHRtbCgnJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gaGlkZSB0aGUgd3JhcFxuICAgICAgICAgICAgICAgICAgICB0LndyYXAuZGV0YWNoKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgJCgnaHRtbCcpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICcnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHQubmF2aWdhdGlvbldyYXAucmVtb3ZlQXR0cignc3R5bGUnKTtcblxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgaWYgKHQub3JpZ2luYWxTdHlsZSkge1xuICAgICAgICAgICAgICAgICAgICAkKCdodG1sJykuYXR0cignc3R5bGUnLCB0Lm9yaWdpbmFsU3R5bGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQoJ2h0bWwnKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0OiAnJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAkKHdpbmRvdykuc2Nyb2xsVG9wKHQuc2Nyb2xsVG9wKTtcblxuICAgICAgICAgICAgICAgIC8vIHJlc2V0IGNvbnRlbnRcbiAgICAgICAgICAgICAgICB0LmNvbnRlbnQuaHRtbCgnJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBoaWRlIHRoZSB3cmFwXG4gICAgICAgICAgICAgICAgdC53cmFwLmRldGFjaCgpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9vZ2dsZUxvYWRpbmc6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHQuc3RvcEV2ZW50cyA9IHN0YXRlO1xuICAgICAgICAgICAgdC53cmFwWyhzdGF0ZSkgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10oJ2NicC1wb3B1cC1sb2FkaW5nJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVzaXplSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gaWYgbGlnaHRib3ggaXMgbm90IG9wZW4gZ28gb3V0XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNPcGVuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLFxuICAgICAgICAgICAgICAgIGltZyA9IHRoaXMuY29udGVudC5maW5kKCdpbWcnKSxcbiAgICAgICAgICAgICAgICBwYWRkaW5nID0gcGFyc2VJbnQoaW1nLmNzcygnbWFyZ2luLXRvcCcpLCAxMCkgKyBwYXJzZUludChpbWcuY3NzKCdtYXJnaW4tYm90dG9tJyksIDEwKTtcblxuICAgICAgICAgICAgaW1nLmNzcygnbWF4LWhlaWdodCcsIChoZWlnaHQgLSBwYWRkaW5nKSArICdweCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByZWxvYWROZWFyYnlJbWFnZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGFyciA9IFtdLFxuICAgICAgICAgICAgICAgIGltZywgdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgc3JjO1xuXG4gICAgICAgICAgICBhcnIucHVzaCh0LmdldEluZGV4KHQuY3VycmVudCArIDEpKTtcbiAgICAgICAgICAgIGFyci5wdXNoKHQuZ2V0SW5kZXgodC5jdXJyZW50ICsgMikpO1xuICAgICAgICAgICAgYXJyLnB1c2godC5nZXRJbmRleCh0LmN1cnJlbnQgKyAzKSk7XG4gICAgICAgICAgICBhcnIucHVzaCh0LmdldEluZGV4KHQuY3VycmVudCAtIDEpKTtcbiAgICAgICAgICAgIGFyci5wdXNoKHQuZ2V0SW5kZXgodC5jdXJyZW50IC0gMikpO1xuICAgICAgICAgICAgYXJyLnB1c2godC5nZXRJbmRleCh0LmN1cnJlbnQgLSAzKSk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBhcnIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAodC5kYXRhQXJyYXlbYXJyW2ldXS50eXBlID09PSAnaXNJbWFnZScpIHtcbiAgICAgICAgICAgICAgICAgICAgc3JjID0gdC5kYXRhQXJyYXlbYXJyW2ldXS5zcmM7XG4gICAgICAgICAgICAgICAgICAgIGltZyA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICgkKCc8aW1nIHNyYz1cIicgKyBzcmMgKyAnXCI+JykuaXMoJ2ltZzp1bmNhY2hlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcuc3JjID0gc3JjO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBQb3BVcChwYXJlbnQpIHtcbiAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgIHQucGFyZW50ID0gcGFyZW50O1xuXG4gICAgICAgIC8vIGlmIGxpZ2h0Ym94U2hvd0NvdW50ZXIgaXMgZmFsc2UsIHB1dCBsaWdodGJveENvdW50ZXIgdG8gJydcbiAgICAgICAgaWYgKHBhcmVudC5vcHRpb25zLmxpZ2h0Ym94U2hvd0NvdW50ZXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBwYXJlbnQub3B0aW9ucy5saWdodGJveENvdW50ZXIgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHNpbmdsZVBhZ2VTaG93Q291bnRlciBpcyBmYWxzZSwgcHV0IHNpbmdsZVBhZ2VDb3VudGVyIHRvICcnXG4gICAgICAgIGlmIChwYXJlbnQub3B0aW9ucy5zaW5nbGVQYWdlU2hvd0NvdW50ZXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBwYXJlbnQub3B0aW9ucy5zaW5nbGVQYWdlQ291bnRlciA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQHRvZG8gLSBzY2hlZHVsZSB0aGlzIGluICBmdXR1cmVcbiAgICAgICAgdC5ydW4oKTtcblxuICAgIH1cblxuICAgIHZhciBsaWdodGJveEluaXQgPSBmYWxzZSxcbiAgICAgICAgc2luZ2xlUGFnZUluaXQgPSBmYWxzZTtcblxuICAgIFBvcFVwLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgcCA9IHQucGFyZW50LFxuICAgICAgICAgICAgYm9keSA9ICQoZG9jdW1lbnQuYm9keSk7XG5cbiAgICAgICAgLy8gZGVmYXVsdCB2YWx1ZSBmb3IgbGlnaHRib3hcbiAgICAgICAgcC5saWdodGJveCA9IG51bGw7XG5cbiAgICAgICAgLy8gTElHSFRCT1hcbiAgICAgICAgaWYgKHAub3B0aW9ucy5saWdodGJveERlbGVnYXRlICYmICFsaWdodGJveEluaXQpIHtcblxuICAgICAgICAgICAgLy8gaW5pdCBvbmx5IG9uZSB0aW1lIEB0b2RvXG4gICAgICAgICAgICBsaWdodGJveEluaXQgPSB0cnVlO1xuXG4gICAgICAgICAgICBwLmxpZ2h0Ym94ID0gT2JqZWN0LmNyZWF0ZShwb3B1cCk7XG5cbiAgICAgICAgICAgIHAubGlnaHRib3guaW5pdChwLCAnbGlnaHRib3gnKTtcblxuICAgICAgICAgICAgYm9keS5vbignY2xpY2suY2JwJywgcC5vcHRpb25zLmxpZ2h0Ym94RGVsZWdhdGUsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGdhbGxlcnkgPSBzZWxmLmF0dHIoJ2RhdGEtY2JwLWxpZ2h0Ym94JyksXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlID0gdC5kZXRlY3RTY29wZShzZWxmKSxcbiAgICAgICAgICAgICAgICAgICAgY2JwID0gc2NvcGUuZGF0YSgnY3ViZXBvcnRmb2xpbycpLFxuICAgICAgICAgICAgICAgICAgICBibG9ja3MgPSBbXTtcblxuICAgICAgICAgICAgICAgIC8vIGlzIGluc2lkZSBhIGNicFxuICAgICAgICAgICAgICAgIGlmIChjYnApIHtcblxuICAgICAgICAgICAgICAgICAgICBjYnAuYmxvY2tzT24uZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gJChlbCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLm5vdCgnLmNicC1pdGVtLW9mZicpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5maW5kKHAub3B0aW9ucy5saWdodGJveERlbGVnYXRlKS5lYWNoKGZ1bmN0aW9uKGluZGV4MiwgZWwyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChnYWxsZXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJChlbDIpLmF0dHIoJ2RhdGEtY2JwLWxpZ2h0Ym94JykgPT09IGdhbGxlcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9ja3MucHVzaChlbDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzLnB1c2goZWwyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGdhbGxlcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrcyA9IHNjb3BlLmZpbmQocC5vcHRpb25zLmxpZ2h0Ym94RGVsZWdhdGUgKyAnW2RhdGEtY2JwLWxpZ2h0Ym94PScgKyBnYWxsZXJ5ICsgJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrcyA9IHNjb3BlLmZpbmQocC5vcHRpb25zLmxpZ2h0Ym94RGVsZWdhdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcC5saWdodGJveC5vcGVuTGlnaHRib3goYmxvY2tzLCBzZWxmWzBdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGVmYXVsdCB2YWx1ZSBmb3Igc2luZ2xlUGFnZVxuICAgICAgICBwLnNpbmdsZVBhZ2UgPSBudWxsO1xuXG4gICAgICAgIC8vIFNJTkdMRVBBR0VcbiAgICAgICAgaWYgKHAub3B0aW9ucy5zaW5nbGVQYWdlRGVsZWdhdGUgJiYgIXNpbmdsZVBhZ2VJbml0KSB7XG5cbiAgICAgICAgICAgIC8vIGluaXQgb25seSBvbmUgdGltZSBAdG9kb1xuICAgICAgICAgICAgc2luZ2xlUGFnZUluaXQgPSB0cnVlO1xuXG4gICAgICAgICAgICBwLnNpbmdsZVBhZ2UgPSBPYmplY3QuY3JlYXRlKHBvcHVwKTtcblxuICAgICAgICAgICAgcC5zaW5nbGVQYWdlLmluaXQocCwgJ3NpbmdsZVBhZ2UnKTtcblxuICAgICAgICAgICAgYm9keS5vbignY2xpY2suY2JwJywgcC5vcHRpb25zLnNpbmdsZVBhZ2VEZWxlZ2F0ZSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgZ2FsbGVyeSA9IHNlbGYuYXR0cignZGF0YS1jYnAtc2luZ2xlUGFnZScpLFxuICAgICAgICAgICAgICAgICAgICBzY29wZSA9IHQuZGV0ZWN0U2NvcGUoc2VsZiksXG4gICAgICAgICAgICAgICAgICAgIGNicCA9IHNjb3BlLmRhdGEoJ2N1YmVwb3J0Zm9saW8nKSxcbiAgICAgICAgICAgICAgICAgICAgYmxvY2tzID0gW107XG5cbiAgICAgICAgICAgICAgICAvLyBpcyBpbnNpZGUgYSBjYnBcbiAgICAgICAgICAgICAgICBpZiAoY2JwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNicC5ibG9ja3NPbi5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSAkKGVsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ubm90KCcuY2JwLWl0ZW0tb2ZmJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmZpbmQocC5vcHRpb25zLnNpbmdsZVBhZ2VEZWxlZ2F0ZSkuZWFjaChmdW5jdGlvbihpbmRleDIsIGVsMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ2FsbGVyeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCQoZWwyKS5hdHRyKCdkYXRhLWNicC1zaW5nbGVQYWdlJykgPT09IGdhbGxlcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9ja3MucHVzaChlbDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmxvY2tzLnB1c2goZWwyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGdhbGxlcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrcyA9IHNjb3BlLmZpbmQocC5vcHRpb25zLnNpbmdsZVBhZ2VEZWxlZ2F0ZSArICdbZGF0YS1jYnAtc2luZ2xlUGFnZT0nICsgZ2FsbGVyeSArICddJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBibG9ja3MgPSBzY29wZS5maW5kKHAub3B0aW9ucy5zaW5nbGVQYWdlRGVsZWdhdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwLnNpbmdsZVBhZ2Uub3BlblNpbmdsZVBhZ2UoYmxvY2tzLCBzZWxmWzBdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGVmYXVsdCB2YWx1ZSBmb3Igc2luZ2xlUGFnZUlubGluZVxuICAgICAgICBwLnNpbmdsZVBhZ2VJbmxpbmUgPSBudWxsO1xuXG4gICAgICAgIC8vIFNJTkdMRVBBR0VJTkxJTkVcbiAgICAgICAgaWYgKHAub3B0aW9ucy5zaW5nbGVQYWdlRGVsZWdhdGUpIHtcblxuICAgICAgICAgICAgcC5zaW5nbGVQYWdlSW5saW5lID0gT2JqZWN0LmNyZWF0ZShwb3B1cCk7XG5cbiAgICAgICAgICAgIHAuc2luZ2xlUGFnZUlubGluZS5pbml0KHAsICdzaW5nbGVQYWdlSW5saW5lJyk7XG5cbiAgICAgICAgICAgIHAuJG9iai5vbignY2xpY2suY2JwJywgcC5vcHRpb25zLnNpbmdsZVBhZ2VJbmxpbmVEZWxlZ2F0ZSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBwLnNpbmdsZVBhZ2VJbmxpbmUub3BlblNpbmdsZVBhZ2VJbmxpbmUocC5ibG9ja3NPbiwgdGhpcyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgfTtcblxuICAgIFBvcFVwLnByb3RvdHlwZS5kZXRlY3RTY29wZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdmFyIHNpbmdsZVBhZ2VJbmxpbmUsXG4gICAgICAgICAgICBzaW5nbGVQYWdlLFxuICAgICAgICAgICAgY2JwO1xuXG4gICAgICAgIHNpbmdsZVBhZ2VJbmxpbmUgPSBpdGVtLmNsb3Nlc3QoJy5jYnAtcG9wdXAtc2luZ2xlUGFnZUlubGluZScpO1xuICAgICAgICBpZiAoc2luZ2xlUGFnZUlubGluZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNicCA9IGl0ZW0uY2xvc2VzdCgnLmNicCcsIHNpbmdsZVBhZ2VJbmxpbmVbMF0pO1xuICAgICAgICAgICAgcmV0dXJuIChjYnAubGVuZ3RoKSA/IGNicCA6IHNpbmdsZVBhZ2VJbmxpbmU7XG4gICAgICAgIH1cblxuICAgICAgICBzaW5nbGVQYWdlID0gaXRlbS5jbG9zZXN0KCcuY2JwLXBvcHVwLXNpbmdsZVBhZ2UnKTtcbiAgICAgICAgaWYgKHNpbmdsZVBhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYnAgPSBpdGVtLmNsb3Nlc3QoJy5jYnAnLCBzaW5nbGVQYWdlWzBdKTtcbiAgICAgICAgICAgIHJldHVybiAoY2JwLmxlbmd0aCkgPyBjYnAgOiBzaW5nbGVQYWdlO1xuICAgICAgICB9XG5cbiAgICAgICAgY2JwID0gaXRlbS5jbG9zZXN0KCcuY2JwJyk7XG4gICAgICAgIHJldHVybiAoY2JwLmxlbmd0aCkgPyBjYnAgOiAkKGRvY3VtZW50LmJvZHkpO1xuXG4gICAgfTtcblxuICAgIFBvcFVwLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwID0gdGhpcy5wYXJlbnQ7XG5cbiAgICAgICAgJChkb2N1bWVudC5ib2R5KS5vZmYoJ2NsaWNrLmNicCcpO1xuXG4gICAgICAgIC8vIEB0b2RvIC0gcmVtb3ZlIHRoZXNlIGZyb20gaGVyZVxuICAgICAgICBsaWdodGJveEluaXQgPSBmYWxzZTtcbiAgICAgICAgc2luZ2xlUGFnZUluaXQgPSBmYWxzZTtcblxuICAgICAgICAvLyBkZXN0cm95IGxpZ2h0Ym94IGlmIGVuYWJsZWRcbiAgICAgICAgaWYgKHAubGlnaHRib3gpIHtcbiAgICAgICAgICAgIHAubGlnaHRib3guZGVzdHJveSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGVzdHJveSBzaW5nbGVQYWdlIGlmIGVuYWJsZWRcbiAgICAgICAgaWYgKHAuc2luZ2xlUGFnZSkge1xuICAgICAgICAgICAgcC5zaW5nbGVQYWdlLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRlc3Ryb3kgc2luZ2xlUGFnZSBpbmxpbmUgaWYgZW5hYmxlZFxuICAgICAgICBpZiAocC5zaW5nbGVQYWdlSW5saW5lKSB7XG4gICAgICAgICAgICBwLnNpbmdsZVBhZ2VJbmxpbmUuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEN1YmVQb3J0Zm9saW8uUGx1Z2lucy5Qb3BVcCA9IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICByZXR1cm4gbmV3IFBvcFVwKHBhcmVudCk7XG4gICAgfTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuKGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDdWJlUG9ydGZvbGlvID0gJC5mbi5jdWJlcG9ydGZvbGlvLkNvbnN0cnVjdG9yO1xuXG4gICAgQ3ViZVBvcnRmb2xpby5Qcml2YXRlID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgY3ViZXBvcnRmb2xpbyBpbnN0YW5jZSBleGlzdHMgb24gY3VycmVudCBlbGVtZW50XG4gICAgICAgICAqL1xuICAgICAgICBjaGVja0luc3RhbmNlOiBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgICAgIHZhciB0ID0gJC5kYXRhKHRoaXMsICdjdWJlcG9ydGZvbGlvJyk7XG5cbiAgICAgICAgICAgIGlmICghdCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY3ViZXBvcnRmb2xpbyBpcyBub3QgaW5pdGlhbGl6ZWQuIEluaXRpYWxpemUgaXQgYmVmb3JlIGNhbGxpbmcgJyArIG1ldGhvZCArICcgbWV0aG9kIScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGluZm8gYWJvdXQgY2xpZW50IGJyb3dzZXJcbiAgICAgICAgICovXG4gICAgICAgIGJyb3dzZXJJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0ID0gQ3ViZVBvcnRmb2xpby5Qcml2YXRlLFxuICAgICAgICAgICAgICAgIGFwcFZlcnNpb24gPSBuYXZpZ2F0b3IuYXBwVmVyc2lvbixcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uLCBhbmltYXRpb24sIHBlcnNwZWN0aXZlO1xuXG4gICAgICAgICAgICBpZiAoYXBwVmVyc2lvbi5pbmRleE9mKCdNU0lFIDguJykgIT09IC0xKSB7IC8vIGllOFxuICAgICAgICAgICAgICAgIHQuYnJvd3NlciA9ICdpZTgnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhcHBWZXJzaW9uLmluZGV4T2YoJ01TSUUgOS4nKSAhPT0gLTEpIHsgLy8gaWU5XG4gICAgICAgICAgICAgICAgdC5icm93c2VyID0gJ2llOSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFwcFZlcnNpb24uaW5kZXhPZignTVNJRSAxMC4nKSAhPT0gLTEpIHsgLy8gaWUxMFxuICAgICAgICAgICAgICAgIHQuYnJvd3NlciA9ICdpZTEwJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2luZG93LkFjdGl2ZVhPYmplY3QgfHwgJ0FjdGl2ZVhPYmplY3QnIGluIHdpbmRvdykgeyAvLyBpZTExXG4gICAgICAgICAgICAgICAgdC5icm93c2VyID0gJ2llMTEnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoL2FuZHJvaWQvZ2kpLnRlc3QoYXBwVmVyc2lvbikpIHsgLy8gYW5kcm9pZFxuICAgICAgICAgICAgICAgIHQuYnJvd3NlciA9ICdhbmRyb2lkJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKC9pcGhvbmV8aXBhZHxpcG9kL2dpKS50ZXN0KGFwcFZlcnNpb24pKSB7IC8vIGlvc1xuICAgICAgICAgICAgICAgIHQuYnJvd3NlciA9ICdpb3MnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoL2Nocm9tZS9naSkudGVzdChhcHBWZXJzaW9uKSkge1xuICAgICAgICAgICAgICAgIHQuYnJvd3NlciA9ICdjaHJvbWUnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0LmJyb3dzZXIgPSAnJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgcGVyc3BlY3RpdmUgaXMgYXZhaWxhYmxlXG4gICAgICAgICAgICBwZXJzcGVjdGl2ZSA9IHQuc3R5bGVTdXBwb3J0KCdwZXJzcGVjdGl2ZScpO1xuXG4gICAgICAgICAgICAvLyBpZiBwZXJzcGVjdGl2ZSBpcyBub3QgYXZhaWxhYmxlID0+IG5vIG1vZGVybiBicm93c2VyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyYW5zaXRpb24gPSB0LnN0eWxlU3VwcG9ydCgndHJhbnNpdGlvbicpO1xuXG4gICAgICAgICAgICB0LnRyYW5zaXRpb25lbmQgPSB7XG4gICAgICAgICAgICAgICAgV2Via2l0VHJhbnNpdGlvbjogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2l0aW9uZW5kJ1xuICAgICAgICAgICAgfVt0cmFuc2l0aW9uXTtcblxuICAgICAgICAgICAgYW5pbWF0aW9uID0gdC5zdHlsZVN1cHBvcnQoJ2FuaW1hdGlvbicpO1xuXG4gICAgICAgICAgICB0LmFuaW1hdGlvbmVuZCA9IHtcbiAgICAgICAgICAgICAgICBXZWJraXRBbmltYXRpb246ICd3ZWJraXRBbmltYXRpb25FbmQnLFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogJ2FuaW1hdGlvbmVuZCdcbiAgICAgICAgICAgIH1bYW5pbWF0aW9uXTtcblxuICAgICAgICAgICAgdC5hbmltYXRpb25EdXJhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBXZWJraXRBbmltYXRpb246ICd3ZWJraXRBbmltYXRpb25EdXJhdGlvbicsXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uOiAnYW5pbWF0aW9uRHVyYXRpb24nXG4gICAgICAgICAgICB9W2FuaW1hdGlvbl07XG5cbiAgICAgICAgICAgIHQuYW5pbWF0aW9uRGVsYXkgPSB7XG4gICAgICAgICAgICAgICAgV2Via2l0QW5pbWF0aW9uOiAnd2Via2l0QW5pbWF0aW9uRGVsYXknLFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogJ2FuaW1hdGlvbkRlbGF5J1xuICAgICAgICAgICAgfVthbmltYXRpb25dO1xuXG4gICAgICAgICAgICB0LnRyYW5zZm9ybSA9IHQuc3R5bGVTdXBwb3J0KCd0cmFuc2Zvcm0nKTtcblxuICAgICAgICAgICAgaWYgKHRyYW5zaXRpb24gJiYgYW5pbWF0aW9uICYmIHQudHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgdC5tb2Rlcm5Ccm93c2VyID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZlYXR1cmUgdGVzdGluZyBmb3IgY3NzM1xuICAgICAgICAgKi9cbiAgICAgICAgc3R5bGVTdXBwb3J0OiBmdW5jdGlvbihwcm9wKSB7XG4gICAgICAgICAgICB2YXIgc3VwcG9ydGVkUHJvcCxcbiAgICAgICAgICAgICAgICAvLyBjYXBpdGFsaXplIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgcHJvcCB0byB0ZXN0IHZlbmRvciBwcmVmaXhcbiAgICAgICAgICAgICAgICB3ZWJraXRQcm9wID0gJ1dlYmtpdCcgKyBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKSxcbiAgICAgICAgICAgICAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICAgICAgLy8gYnJvd3NlciBzdXBwb3J0cyBzdGFuZGFyZCBDU1MgcHJvcGVydHkgbmFtZVxuICAgICAgICAgICAgaWYgKHByb3AgaW4gZGl2LnN0eWxlKSB7XG4gICAgICAgICAgICAgICAgc3VwcG9ydGVkUHJvcCA9IHByb3A7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHdlYmtpdFByb3AgaW4gZGl2LnN0eWxlKSB7XG4gICAgICAgICAgICAgICAgc3VwcG9ydGVkUHJvcCA9IHdlYmtpdFByb3A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGF2b2lkIG1lbW9yeSBsZWFrIGluIElFXG4gICAgICAgICAgICBkaXYgPSBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gc3VwcG9ydGVkUHJvcDtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5icm93c2VySW5mbygpO1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuXG4oZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEN1YmVQb3J0Zm9saW8gPSAkLmZuLmN1YmVwb3J0Zm9saW8uQ29uc3RydWN0b3I7XG5cbiAgICBDdWJlUG9ydGZvbGlvLlB1YmxpYyA9IHtcblxuICAgICAgICAvKlxuICAgICAgICAgKiBJbml0IHRoZSBwbHVnaW5cbiAgICAgICAgICovXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBuZXcgQ3ViZVBvcnRmb2xpbyh0aGlzLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLypcbiAgICAgICAgICogRGVzdHJveSB0aGUgcGx1Z2luXG4gICAgICAgICAqL1xuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHQgPSBDdWJlUG9ydGZvbGlvLlByaXZhdGUuY2hlY2tJbnN0YW5jZS5jYWxsKHRoaXMsICdkZXN0cm95Jyk7XG5cbiAgICAgICAgICAgIHQuX3RyaWdnZXJFdmVudCgnYmVmb3JlRGVzdHJveScpO1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgZGF0YVxuICAgICAgICAgICAgJC5yZW1vdmVEYXRhKHRoaXMsICdjdWJlcG9ydGZvbGlvJyk7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSBkYXRhIGZyb20gYmxvY2tzXG4gICAgICAgICAgICB0LmJsb2Nrcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQucmVtb3ZlRGF0YSh0aGlzLCAnY2JwLXd4aCcpOyAvLyB3cCBvbmx5XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIGxvYWRpbmcgY2xhc3MgYW5kIC5jYnAgb24gY29udGFpbmVyXG4gICAgICAgICAgICB0LiRvYmoucmVtb3ZlQ2xhc3MoJ2NicC1yZWFkeSBjYnAtYWRkSXRlbXMnICsgJ2NicC1jb2xzLScgKyB0LmNvbHMpLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSBjbGFzcyBmcm9tIHVsXG4gICAgICAgICAgICB0LiR1bC5yZW1vdmVDbGFzcygnY2JwLXdyYXBwZXInKTtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIG9mZiByZXNpemUgZXZlbnRcbiAgICAgICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5jYnAnKTtcblxuICAgICAgICAgICAgdC4kb2JqLm9mZignLmNicCcpO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCcuY2JwJyk7XG5cbiAgICAgICAgICAgIC8vIHJlc2V0IGJsb2Nrc1xuICAgICAgICAgICAgdC5ibG9ja3MucmVtb3ZlQ2xhc3MoJ2NicC1pdGVtLW9mZicpLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG5cbiAgICAgICAgICAgIHQuYmxvY2tzLmZpbmQoJy5jYnAtaXRlbS13cmFwcGVyJykuY2hpbGRyZW4oKS51bndyYXAoKTtcblxuICAgICAgICAgICAgaWYgKHQub3B0aW9ucy5jYXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgdC5fY2FwdGlvbkRlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5fZGVzdHJveVNsaWRlcigpO1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgLmNicC13cmFwcGVyLW91dGVyXG4gICAgICAgICAgICB0LiR1bC51bndyYXAoKTtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIC5jYnAtd3JhcHBlclxuICAgICAgICAgICAgaWYgKHQuYWRkZWRXcmFwcCkge1xuICAgICAgICAgICAgICAgIHQuYmxvY2tzLnVud3JhcCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmVhY2godC5fcGx1Z2lucywgZnVuY3Rpb24oaSwgaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbS5kZXN0cm95ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHQuX3RyaWdnZXJFdmVudCgnYWZ0ZXJEZXN0cm95Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLypcbiAgICAgICAgICogRmlsdGVyIHRoZSBwbHVnaW4gYnkgZmlsdGVyTmFtZVxuICAgICAgICAgKi9cbiAgICAgICAgZmlsdGVyOiBmdW5jdGlvbihmaWx0ZXJOYW1lLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHQgPSBDdWJlUG9ydGZvbGlvLlByaXZhdGUuY2hlY2tJbnN0YW5jZS5jYWxsKHRoaXMsICdmaWx0ZXInKSxcbiAgICAgICAgICAgICAgICBvZmYyb25CbG9ja3MsIG9uMm9mZkJsb2NrcywgdXJsO1xuXG4gICAgICAgICAgICAvLyByZWdpc3RlciBjYWxsYmFjayBmdW5jdGlvblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICB0Ll9yZWdpc3RlckV2ZW50KCdmaWx0ZXJGaW5pc2gnLCBjYWxsYmFjaywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0LmlzQW5pbWF0aW5nIHx8IHQuZGVmYXVsdEZpbHRlciA9PT0gZmlsdGVyTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC5pc0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgICB0LmRlZmF1bHRGaWx0ZXIgPSBmaWx0ZXJOYW1lO1xuXG4gICAgICAgICAgICBpZiAodC5zaW5nbGVQYWdlSW5saW5lICYmIHQuc2luZ2xlUGFnZUlubGluZS5pc09wZW4pIHtcbiAgICAgICAgICAgICAgICB0LnNpbmdsZVBhZ2VJbmxpbmUuY2xvc2UoJ3Byb21pc2UnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQuX2ZpbHRlcihmaWx0ZXJOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0Ll9maWx0ZXIoZmlsdGVyTmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0Lm9wdGlvbnMuZmlsdGVyRGVlcGxpbmtpbmcpIHtcblxuICAgICAgICAgICAgICAgIHVybCA9IGxvY2F0aW9uLmhyZWYucmVwbGFjZSgvI2NicGY9KC4qPykoWyN8PyZdfCQpL2dpLCAnJyk7XG5cbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gdXJsICsgJyNjYnBmPScgKyBmaWx0ZXJOYW1lO1xuXG4gICAgICAgICAgICAgICAgaWYgKHQuc2luZ2xlUGFnZSAmJiB0LnNpbmdsZVBhZ2UudXJsKSB7XG4gICAgICAgICAgICAgICAgICAgIHQuc2luZ2xlUGFnZS51cmwgPSBsb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKlxuICAgICAgICAgKiBTaG93IGNvdW50ZXIgZm9yIGZpbHRlcnNcbiAgICAgICAgICovXG4gICAgICAgIHNob3dDb3VudGVyOiBmdW5jdGlvbihlbGVtcywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciB0ID0gQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmNoZWNrSW5zdGFuY2UuY2FsbCh0aGlzLCAnc2hvd0NvdW50ZXInKTtcblxuICAgICAgICAgICAgdC5lbGVtcyA9IGVsZW1zO1xuXG4gICAgICAgICAgICAkLmVhY2goZWxlbXMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBlbCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlck5hbWUgPSBlbC5kYXRhKCdmaWx0ZXInKSxcbiAgICAgICAgICAgICAgICAgICAgY291bnQ7XG5cbiAgICAgICAgICAgICAgICBjb3VudCA9IHQuYmxvY2tzLmZpbHRlcihmaWx0ZXJOYW1lKS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZWwuZmluZCgnLmNicC1maWx0ZXItY291bnRlcicpLnRleHQoY291bnQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKlxuICAgICAgICAgKiBBcGVuZEl0ZW1zIGVsZW1lbnRzXG4gICAgICAgICAqL1xuICAgICAgICBhcHBlbmRJdGVtczogZnVuY3Rpb24oaXRlbXMsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgdCA9IEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5jaGVja0luc3RhbmNlLmNhbGwodGhpcywgJ2FwcGVuZEl0ZW1zJyk7XG5cbiAgICAgICAgICAgIGlmICh0LmlzQW5pbWF0aW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0LmlzQW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHQuc2luZ2xlUGFnZUlubGluZSAmJiB0LnNpbmdsZVBhZ2VJbmxpbmUuaXNPcGVuKSB7XG4gICAgICAgICAgICAgICAgdC5zaW5nbGVQYWdlSW5saW5lLmNsb3NlKCdwcm9taXNlJywge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0Ll9hZGRJdGVtcyhpdGVtcywgY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHQuX2FkZEl0ZW1zKGl0ZW1zLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICB9O1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuXG4vLyBVdGlsaXR5XG5pZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICBPYmplY3QuY3JlYXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIGZ1bmN0aW9uIEYoKSB7fVxuICAgICAgICBGLnByb3RvdHlwZSA9IG9iajtcbiAgICAgICAgcmV0dXJuIG5ldyBGKCk7XG4gICAgfTtcbn1cblxuLy8ganF1ZXJ5IG5ldyBmaWx0ZXIgZm9yIGltYWdlcyB1bmNhY2hlZFxualF1ZXJ5LmV4cHJbJzonXS51bmNhY2hlZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIC8vIEVuc3VyZSB3ZSBhcmUgZGVhbGluZyB3aXRoIGFuIGBpbWdgIGVsZW1lbnQgd2l0aCBhIHZhbGlkIGBzcmNgIGF0dHJpYnV0ZS5cbiAgICBpZiAoIWpRdWVyeShvYmopLmlzKCdpbWdbc3JjXVtzcmMhPVwiXCJdJykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEZpcmVmb3gncyBgY29tcGxldGVgIHByb3BlcnR5IHdpbGwgYWx3YXlzIGJlIGB0cnVlYCBldmVuIGlmIHRoZSBpbWFnZSBoYXMgbm90IGJlZW4gZG93bmxvYWRlZC5cbiAgICAvLyBEb2luZyBpdCB0aGlzIHdheSB3b3JrcyBpbiBGaXJlZm94LlxuICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWcuc3JjID0gb2JqLnNyYztcblxuICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTk3Nzg3MS9jaGVjay1pZi1hbi1pbWFnZS1pcy1sb2FkZWQtbm8tZXJyb3JzLWluLWphdmFzY3JpcHRcbiAgICAvLyBEdXJpbmcgdGhlIG9ubG9hZCBldmVudCwgSUUgY29ycmVjdGx5IGlkZW50aWZpZXMgYW55IGltYWdlcyB0aGF0XG4gICAgLy8gd2VyZW7vv710IGRvd25sb2FkZWQgYXMgbm90IGNvbXBsZXRlLiBPdGhlcnMgc2hvdWxkIHRvby4gR2Vja28tYmFzZWRcbiAgICAvLyBicm93c2VycyBhY3QgbGlrZSBOUzQgaW4gdGhhdCB0aGV5IHJlcG9ydCB0aGlzIGluY29ycmVjdGx5LlxuICAgIGlmICghaW1nLmNvbXBsZXRlKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEhvd2V2ZXIsIHRoZXkgZG8gaGF2ZSB0d28gdmVyeSB1c2VmdWwgcHJvcGVydGllczogbmF0dXJhbFdpZHRoIGFuZFxuICAgIC8vIG5hdHVyYWxIZWlnaHQuIFRoZXNlIGdpdmUgdGhlIHRydWUgc2l6ZSBvZiB0aGUgaW1hZ2UuIElmIGl0IGZhaWxlZFxuICAgIC8vIHRvIGxvYWQsIGVpdGhlciBvZiB0aGVzZSBzaG91bGQgYmUgemVyby5cbiAgICBpZiAoaW1nLm5hdHVyYWxXaWR0aCAhPT0gdW5kZWZpbmVkICYmIGltZy5uYXR1cmFsV2lkdGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gTm8gb3RoZXIgd2F5IG9mIGNoZWNraW5nOiBhc3N1bWUgaXTvv71zIG9rLlxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIGh0dHA6Ly9wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXG4vLyBodHRwOi8vbXkub3BlcmEuY29tL2Vtb2xsZXIvYmxvZy8yMDExLzEyLzIwL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtZXItYW5pbWF0aW5nXG5cbi8vIHJlcXVlc3RBbmltYXRpb25GcmFtZSBwb2x5ZmlsbCBieSBFcmlrIE3vv71sbGVyLiBmaXhlcyBmcm9tIFBhdWwgSXJpc2ggYW5kIFRpbm8gWmlqZGVsXG5cbi8vIE1JVCBsaWNlbnNlXG5cbihmdW5jdGlvbigpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHZhciB2ZW5kb3JzID0gWydtb3onLCAnd2Via2l0J107XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKyt4KSB7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdmVuZG9yc1t4XSArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0gKyAnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXSB8fCB3aW5kb3dbdmVuZG9yc1t4XSArICdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICB9XG5cbiAgICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgICAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGltZVRvQ2FsbCk7XG4gICAgICAgICAgICBsYXN0VGltZSA9IGN1cnJUaW1lICsgdGltZVRvQ2FsbDtcbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfTtcblxuICAgIGlmICghd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKVxuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgfTtcbn0oKSk7XG5cbihmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQ3ViZVBvcnRmb2xpbyA9ICQuZm4uY3ViZXBvcnRmb2xpby5Db25zdHJ1Y3RvcjtcblxuICAgIGZ1bmN0aW9uIEFuaW1hdGlvbkNsYXNzaWMocGFyZW50KSB7XG4gICAgICAgIHZhciB0ID0gdGhpcztcblxuICAgICAgICB0LnBhcmVudCA9IHBhcmVudDtcblxuICAgICAgICBwYXJlbnQuZmlsdGVyTGF5b3V0ID0gdC5maWx0ZXJMYXlvdXQ7XG4gICAgfVxuXG4gICAgLy8gaGVyZSB0aGlzIHZhbHVlIHBvaW50IHRvIHBhcmVudCBncmlkXG4gICAgQW5pbWF0aW9uQ2xhc3NpYy5wcm90b3R5cGUuZmlsdGVyTGF5b3V0ID0gZnVuY3Rpb24oZmlsdGVyTmFtZSkge1xuICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgdC4kb2JqLmFkZENsYXNzKCdjYnAtYW5pbWF0aW9uLScgKyB0Lm9wdGlvbnMuYW5pbWF0aW9uVHlwZSk7XG5cbiAgICAgICAgLy8gWzFdIC0gYmxvY2tzIHRoYXQgYXJlIG9ubHkgbW92aW5nIHdpdGggdHJhbnNsYXRlXG4gICAgICAgIHQuYmxvY2tzT25Jbml0aWFsXG4gICAgICAgICAgICAuZmlsdGVyKGZpbHRlck5hbWUpXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2NicC1pdGVtLW9uMm9uJylcbiAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gJChlbCkuZGF0YSgnY2JwJyk7XG4gICAgICAgICAgICAgICAgZWwuc3R5bGVbQ3ViZVBvcnRmb2xpby5Qcml2YXRlLnRyYW5zZm9ybV0gPSAndHJhbnNsYXRlM2QoJyArIChkYXRhLmxlZnROZXcgLSBkYXRhLmxlZnQpICsgJ3B4LCAnICsgKGRhdGEudG9wTmV3IC0gZGF0YS50b3ApICsgJ3B4LCAwKSc7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBbMl0gLSBibG9ja3MgdGhhbiBpbnRpYWx5IGFyZSBvbiBidXQgYWZ0ZXIgYXBwbHlpbmcgdGhlIGZpbHRlciBhcmUgb2ZmXG4gICAgICAgIHQuYmxvY2tzT24yT2ZmID0gdC5ibG9ja3NPbkluaXRpYWxcbiAgICAgICAgICAgIC5ub3QoZmlsdGVyTmFtZSlcbiAgICAgICAgICAgIC5hZGRDbGFzcygnY2JwLWl0ZW0tb24yb2ZmJyk7XG5cbiAgICAgICAgLy8gWzNdIC0gYmxvY2tzIHRoYXQgYXJlIG9mZiBhbmQgaXQgd2lsbCBiZSBvblxuICAgICAgICB0LmJsb2Nrc09mZjJPbiA9IHQuYmxvY2tzT25cbiAgICAgICAgICAgIC5maWx0ZXIoJy5jYnAtaXRlbS1vZmYnKVxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdjYnAtaXRlbS1vZmYnKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdjYnAtaXRlbS1vZmYyb24nKVxuICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSAkKGVsKS5kYXRhKCdjYnAnKTtcblxuICAgICAgICAgICAgICAgIGRhdGEubGVmdCA9IGRhdGEubGVmdE5ldztcbiAgICAgICAgICAgICAgICBkYXRhLnRvcCA9IGRhdGEudG9wTmV3O1xuXG4gICAgICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IGRhdGEubGVmdCArICdweCc7XG4gICAgICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gZGF0YS50b3AgKyAncHgnO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHQuYmxvY2tzT24yT2ZmLmxlbmd0aCkge1xuICAgICAgICAgICAgdC5ibG9ja3NPbjJPZmYubGFzdCgpLmRhdGEoJ2NicCcpLndyYXBwZXIub25lKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5hbmltYXRpb25lbmQsIGFuaW1hdGlvbmVuZCk7XG4gICAgICAgIH0gZWxzZSBpZiAodC5ibG9ja3NPZmYyT24ubGVuZ3RoKSB7XG4gICAgICAgICAgICB0LmJsb2Nrc09mZjJPbi5sYXN0KCkuZGF0YSgnY2JwJykud3JhcHBlci5vbmUoQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmFuaW1hdGlvbmVuZCwgYW5pbWF0aW9uZW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFuaW1hdGlvbmVuZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVzaXplIG1haW4gY29udGFpbmVyIGhlaWdodFxuICAgICAgICB0Ll9yZXNpemVNYWluQ29udGFpbmVyKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gYW5pbWF0aW9uZW5kKCkge1xuICAgICAgICAgICAgdC5ibG9ja3NcbiAgICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NicC1pdGVtLW9uMm9mZiBjYnAtaXRlbS1vZmYyb24gY2JwLWl0ZW0tb24yb24nKVxuICAgICAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9ICQoZWwpLmRhdGEoJ2NicCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGRhdGEubGVmdCA9IGRhdGEubGVmdE5ldztcbiAgICAgICAgICAgICAgICAgICAgZGF0YS50b3AgPSBkYXRhLnRvcE5ldztcblxuICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gZGF0YS5sZWZ0ICsgJ3B4JztcbiAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gZGF0YS50b3AgKyAncHgnO1xuXG4gICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlW0N1YmVQb3J0Zm9saW8uUHJpdmF0ZS50cmFuc2Zvcm1dID0gJyc7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHQuYmxvY2tzT2ZmLmFkZENsYXNzKCdjYnAtaXRlbS1vZmYnKTtcblxuICAgICAgICAgICAgdC4kb2JqLnJlbW92ZUNsYXNzKCdjYnAtYW5pbWF0aW9uLScgKyB0Lm9wdGlvbnMuYW5pbWF0aW9uVHlwZSk7XG5cbiAgICAgICAgICAgIHQuZmlsdGVyRmluaXNoKCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBBbmltYXRpb25DbGFzc2ljLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudDtcbiAgICAgICAgcGFyZW50LiRvYmoucmVtb3ZlQ2xhc3MoJ2NicC1hbmltYXRpb24tJyArIHBhcmVudC5vcHRpb25zLmFuaW1hdGlvblR5cGUpO1xuICAgIH07XG5cbiAgICBDdWJlUG9ydGZvbGlvLlBsdWdpbnMuQW5pbWF0aW9uQ2xhc3NpYyA9IGZ1bmN0aW9uKHBhcmVudCkge1xuXG4gICAgICAgIGlmICghQ3ViZVBvcnRmb2xpby5Qcml2YXRlLm1vZGVybkJyb3dzZXIgfHwgJC5pbkFycmF5KHBhcmVudC5vcHRpb25zLmFuaW1hdGlvblR5cGUsIFsnYm94U2hhZG93JywgJ2ZhZGVPdXQnLCAnZmxpcEJvdHRvbScsICdmbGlwT3V0JywgJ3F1aWNrc2FuZCcsICdzY2FsZVNpZGVzJywgJ3NrZXcnXSkgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgQW5pbWF0aW9uQ2xhc3NpYyhwYXJlbnQpO1xuICAgIH07XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cbihmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQ3ViZVBvcnRmb2xpbyA9ICQuZm4uY3ViZXBvcnRmb2xpby5Db25zdHJ1Y3RvcjtcblxuICAgIGZ1bmN0aW9uIEFuaW1hdGlvbkNsb25lKHBhcmVudCkge1xuICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgdC5wYXJlbnQgPSBwYXJlbnQ7XG5cbiAgICAgICAgcGFyZW50LmZpbHRlckxheW91dCA9IHQuZmlsdGVyTGF5b3V0O1xuICAgIH1cblxuICAgIC8vIGhlcmUgdGhpcyB2YWx1ZSBwb2ludCB0byBwYXJlbnQgZ3JpZFxuICAgIEFuaW1hdGlvbkNsb25lLnByb3RvdHlwZS5maWx0ZXJMYXlvdXQgPSBmdW5jdGlvbihmaWx0ZXJOYW1lKSB7XG4gICAgICAgIHZhciB0ID0gdGhpcyxcbiAgICAgICAgICAgIHVsQ2xvbmUgPSB0LiR1bFswXS5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgICAgdWxDbG9uZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2NicC13cmFwcGVyLWhlbHBlcicpO1xuICAgICAgICB0LndyYXBwZXJbMF0uaW5zZXJ0QmVmb3JlKHVsQ2xvbmUsIHQuJHVsWzBdKTtcblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0LiRvYmouYWRkQ2xhc3MoJ2NicC1hbmltYXRpb24tJyArIHQub3B0aW9ucy5hbmltYXRpb25UeXBlKTtcblxuICAgICAgICAgICAgdC5ibG9ja3NPZmYuYWRkQ2xhc3MoJ2NicC1pdGVtLW9mZicpO1xuXG4gICAgICAgICAgICB0LmJsb2Nrc09uLnJlbW92ZUNsYXNzKCdjYnAtaXRlbS1vZmYnKVxuICAgICAgICAgICAgICAgIC5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9ICQoZWwpLmRhdGEoJ2NicCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGRhdGEubGVmdCA9IGRhdGEubGVmdE5ldztcbiAgICAgICAgICAgICAgICAgICAgZGF0YS50b3AgPSBkYXRhLnRvcE5ldztcblxuICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gZGF0YS5sZWZ0ICsgJ3B4JztcbiAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gZGF0YS50b3AgKyAncHgnO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0Lm9wdGlvbnMuYW5pbWF0aW9uVHlwZSA9PT0gJ3NlcXVlbnRpYWxseScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEud3JhcHBlclswXS5zdHlsZVtDdWJlUG9ydGZvbGlvLlByaXZhdGUuYW5pbWF0aW9uRGVsYXldID0gKGluZGV4ICogNjApICsgJ21zJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAodC5ibG9ja3NPbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0LmJsb2Nrc09uLmxhc3QoKS5kYXRhKCdjYnAnKS53cmFwcGVyLm9uZShDdWJlUG9ydGZvbGlvLlByaXZhdGUuYW5pbWF0aW9uZW5kLCBhbmltYXRpb25lbmQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0LmJsb2Nrc09uSW5pdGlhbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0LmJsb2Nrc09uSW5pdGlhbC5sYXN0KCkuZGF0YSgnY2JwJykud3JhcHBlci5vbmUoQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmFuaW1hdGlvbmVuZCwgYW5pbWF0aW9uZW5kKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uZW5kKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHJlc2l6ZSBtYWluIGNvbnRhaW5lciBoZWlnaHRcbiAgICAgICAgICAgIHQuX3Jlc2l6ZU1haW5Db250YWluZXIoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gYW5pbWF0aW9uZW5kKCkge1xuICAgICAgICAgICAgdC53cmFwcGVyWzBdLnJlbW92ZUNoaWxkKHVsQ2xvbmUpO1xuXG4gICAgICAgICAgICBpZiAodC5vcHRpb25zLmFuaW1hdGlvblR5cGUgPT09ICdzZXF1ZW50aWFsbHknKSB7XG4gICAgICAgICAgICAgICAgdC5ibG9ja3NPbi5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAgICAgICAgICAgICAkKGVsKS5kYXRhKCdjYnAnKS53cmFwcGVyWzBdLnN0eWxlW0N1YmVQb3J0Zm9saW8uUHJpdmF0ZS5hbmltYXRpb25EZWxheV0gPSAnJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdC4kb2JqLnJlbW92ZUNsYXNzKCdjYnAtYW5pbWF0aW9uLScgKyB0Lm9wdGlvbnMuYW5pbWF0aW9uVHlwZSk7XG5cbiAgICAgICAgICAgIHQuZmlsdGVyRmluaXNoKCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBBbmltYXRpb25DbG9uZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQ7XG4gICAgICAgIHBhcmVudC4kb2JqLnJlbW92ZUNsYXNzKCdjYnAtYW5pbWF0aW9uLScgKyBwYXJlbnQub3B0aW9ucy5hbmltYXRpb25UeXBlKTtcbiAgICB9O1xuXG4gICAgQ3ViZVBvcnRmb2xpby5QbHVnaW5zLkFuaW1hdGlvbkNsb25lID0gZnVuY3Rpb24ocGFyZW50KSB7XG5cbiAgICAgICAgaWYgKCFDdWJlUG9ydGZvbGlvLlByaXZhdGUubW9kZXJuQnJvd3NlciB8fCAkLmluQXJyYXkocGFyZW50Lm9wdGlvbnMuYW5pbWF0aW9uVHlwZSwgWydmYWRlT3V0VG9wJywgJ3NsaWRlTGVmdCcsICdzZXF1ZW50aWFsbHknXSkgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgQW5pbWF0aW9uQ2xvbmUocGFyZW50KTtcbiAgICB9O1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuXG4oZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEN1YmVQb3J0Zm9saW8gPSAkLmZuLmN1YmVwb3J0Zm9saW8uQ29uc3RydWN0b3I7XG5cbiAgICBmdW5jdGlvbiBBbmltYXRpb25DbG9uZURlbGF5KHBhcmVudCkge1xuICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgdC5wYXJlbnQgPSBwYXJlbnQ7XG5cbiAgICAgICAgcGFyZW50LmZpbHRlckxheW91dCA9IHQuZmlsdGVyTGF5b3V0O1xuICAgIH1cblxuICAgIC8vIGhlcmUgdGhpcyB2YWx1ZSBwb2ludCB0byBwYXJlbnQgZ3JpZFxuICAgIEFuaW1hdGlvbkNsb25lRGVsYXkucHJvdG90eXBlLmZpbHRlckxheW91dCA9IGZ1bmN0aW9uKGZpbHRlck5hbWUpIHtcbiAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgdWxDbG9uZTtcblxuICAgICAgICAvLyB0LmJsb2Nrc09uSW5pdGlhbC5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbCkge1xuICAgICAgICAvLyAgICAgJChlbCkuZGF0YSgnY2JwJykud3JhcHBlclswXS5zdHlsZVtDdWJlUG9ydGZvbGlvLlByaXZhdGUuYW5pbWF0aW9uRGVsYXldID0gKGluZGV4ICogNTApICsgJ21zJztcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgdWxDbG9uZSA9IHQuJHVsWzBdLmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICB1bENsb25lLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnY2JwLXdyYXBwZXItaGVscGVyJyk7XG4gICAgICAgIHQud3JhcHBlclswXS5pbnNlcnRCZWZvcmUodWxDbG9uZSwgdC4kdWxbMF0pO1xuXG4gICAgICAgIC8vIGhhY2sgZm9yIHNhZmFyaSBvc3ggYmVjYXVzZSBpdCBkb2Vzbid0IHdhbnQgdG8gd29yayBpZiBJIHNldCBhbmltYXRpb25EZWxheVxuICAgICAgICAvLyBvbiBjYnAtaXRlbS13cmFwcGVyIGJlZm9yZSBJIGNsb25lIHRoZSB0LiR1bFxuICAgICAgICAkKHVsQ2xvbmUpLmZpbmQoJy5jYnAtaXRlbScpLm5vdCgnLmNicC1pdGVtLW9mZicpLmNoaWxkcmVuKCcuY2JwLWl0ZW0td3JhcHBlcicpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICAgICAgICBlbC5zdHlsZVtDdWJlUG9ydGZvbGlvLlByaXZhdGUuYW5pbWF0aW9uRGVsYXldID0gKGluZGV4ICogNTApICsgJ21zJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdC4kb2JqLmFkZENsYXNzKCdjYnAtYW5pbWF0aW9uLScgKyB0Lm9wdGlvbnMuYW5pbWF0aW9uVHlwZSk7XG5cbiAgICAgICAgICAgIHQuYmxvY2tzT2ZmLmFkZENsYXNzKCdjYnAtaXRlbS1vZmYnKTtcblxuICAgICAgICAgICAgdC5ibG9ja3NPbi5yZW1vdmVDbGFzcygnY2JwLWl0ZW0tb2ZmJylcbiAgICAgICAgICAgICAgICAuZWFjaChmdW5jdGlvbihpbmRleCwgZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSAkKGVsKS5kYXRhKCdjYnAnKTtcblxuICAgICAgICAgICAgICAgICAgICBkYXRhLmxlZnQgPSBkYXRhLmxlZnROZXc7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEudG9wID0gZGF0YS50b3BOZXc7XG5cbiAgICAgICAgICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IGRhdGEubGVmdCArICdweCc7XG4gICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IGRhdGEudG9wICsgJ3B4JztcblxuICAgICAgICAgICAgICAgICAgICBkYXRhLndyYXBwZXJbMF0uc3R5bGVbQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmFuaW1hdGlvbkRlbGF5XSA9IChpbmRleCAqIDUwKSArICdtcyc7XG5cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKHQuYmxvY2tzT24ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdC5ibG9ja3NPbi5sYXN0KCkuZGF0YSgnY2JwJykud3JhcHBlci5vbmUoQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmFuaW1hdGlvbmVuZCwgYW5pbWF0aW9uZW5kKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodC5ibG9ja3NPbkluaXRpYWwubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdC5ibG9ja3NPbkluaXRpYWwubGFzdCgpLmRhdGEoJ2NicCcpLndyYXBwZXIub25lKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5hbmltYXRpb25lbmQsIGFuaW1hdGlvbmVuZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbmVuZCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyByZXNpemUgbWFpbiBjb250YWluZXIgaGVpZ2h0XG4gICAgICAgICAgICB0Ll9yZXNpemVNYWluQ29udGFpbmVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIGFuaW1hdGlvbmVuZCgpIHtcbiAgICAgICAgICAgIHQud3JhcHBlclswXS5yZW1vdmVDaGlsZCh1bENsb25lKTtcblxuICAgICAgICAgICAgdC4kb2JqLnJlbW92ZUNsYXNzKCdjYnAtYW5pbWF0aW9uLScgKyB0Lm9wdGlvbnMuYW5pbWF0aW9uVHlwZSk7XG5cbiAgICAgICAgICAgIHQuYmxvY2tzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICAgICAgICAgICAgJChlbCkuZGF0YSgnY2JwJykud3JhcHBlclswXS5zdHlsZVtDdWJlUG9ydGZvbGlvLlByaXZhdGUuYW5pbWF0aW9uRGVsYXldID0gJyc7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdC5maWx0ZXJGaW5pc2goKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIEFuaW1hdGlvbkNsb25lRGVsYXkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50O1xuICAgICAgICBwYXJlbnQuJG9iai5yZW1vdmVDbGFzcygnY2JwLWFuaW1hdGlvbi0nICsgcGFyZW50Lm9wdGlvbnMuYW5pbWF0aW9uVHlwZSk7XG4gICAgfTtcblxuICAgIEN1YmVQb3J0Zm9saW8uUGx1Z2lucy5BbmltYXRpb25DbG9uZURlbGF5ID0gZnVuY3Rpb24ocGFyZW50KSB7XG5cbiAgICAgICAgaWYgKCFDdWJlUG9ydGZvbGlvLlByaXZhdGUubW9kZXJuQnJvd3NlciB8fCAkLmluQXJyYXkocGFyZW50Lm9wdGlvbnMuYW5pbWF0aW9uVHlwZSwgWyczZGZsaXAnLCAnZmxpcE91dERlbGF5JywgJ2ZvbGRMZWZ0JywgJ2Zyb250Um93JywgJ3JvdGF0ZVJvb20nLCAncm90YXRlU2lkZXMnLCAnc2NhbGVEb3duJywgJ3NsaWRlRGVsYXknLCAndW5mb2xkJ10pIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IEFuaW1hdGlvbkNsb25lRGVsYXkocGFyZW50KTtcbiAgICB9O1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuXG4oZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEN1YmVQb3J0Zm9saW8gPSAkLmZuLmN1YmVwb3J0Zm9saW8uQ29uc3RydWN0b3I7XG5cbiAgICBmdW5jdGlvbiBBbmltYXRpb25XcmFwcGVyKHBhcmVudCkge1xuICAgICAgICB2YXIgdCA9IHRoaXM7XG5cbiAgICAgICAgdC5wYXJlbnQgPSBwYXJlbnQ7XG5cbiAgICAgICAgcGFyZW50LmZpbHRlckxheW91dCA9IHQuZmlsdGVyTGF5b3V0O1xuICAgIH1cblxuICAgIC8vIGhlcmUgdGhpcyB2YWx1ZSBwb2ludCB0byBwYXJlbnQgZ3JpZFxuICAgIEFuaW1hdGlvbldyYXBwZXIucHJvdG90eXBlLmZpbHRlckxheW91dCA9IGZ1bmN0aW9uKGZpbHRlck5hbWUpIHtcbiAgICAgICAgdmFyIHQgPSB0aGlzLFxuICAgICAgICAgICAgdWxDbG9uZSA9IHQuJHVsWzBdLmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICB1bENsb25lLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnY2JwLXdyYXBwZXItaGVscGVyJyk7XG4gICAgICAgIHQud3JhcHBlclswXS5pbnNlcnRCZWZvcmUodWxDbG9uZSwgdC4kdWxbMF0pO1xuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHQuJG9iai5hZGRDbGFzcygnY2JwLWFuaW1hdGlvbi0nICsgdC5vcHRpb25zLmFuaW1hdGlvblR5cGUpO1xuXG4gICAgICAgICAgICB0LmJsb2Nrc09mZi5hZGRDbGFzcygnY2JwLWl0ZW0tb2ZmJyk7XG5cbiAgICAgICAgICAgIHQuYmxvY2tzT24ucmVtb3ZlQ2xhc3MoJ2NicC1pdGVtLW9mZicpXG4gICAgICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gJChlbCkuZGF0YSgnY2JwJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5sZWZ0ID0gZGF0YS5sZWZ0TmV3O1xuICAgICAgICAgICAgICAgICAgICBkYXRhLnRvcCA9IGRhdGEudG9wTmV3O1xuXG4gICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBkYXRhLmxlZnQgKyAncHgnO1xuICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBkYXRhLnRvcCArICdweCc7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICh0LmJsb2Nrc09uLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHQuJHVsLm9uZShDdWJlUG9ydGZvbGlvLlByaXZhdGUuYW5pbWF0aW9uZW5kLCBhbmltYXRpb25lbmQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0LmJsb2Nrc09uSW5pdGlhbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkKHVsQ2xvbmUpLm9uZShDdWJlUG9ydGZvbGlvLlByaXZhdGUuYW5pbWF0aW9uZW5kLCBhbmltYXRpb25lbmQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25lbmQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcmVzaXplIG1haW4gY29udGFpbmVyIGhlaWdodFxuICAgICAgICAgICAgdC5fcmVzaXplTWFpbkNvbnRhaW5lcigpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBhbmltYXRpb25lbmQoKSB7XG4gICAgICAgICAgICB0LndyYXBwZXJbMF0ucmVtb3ZlQ2hpbGQodWxDbG9uZSk7XG5cbiAgICAgICAgICAgIHQuJG9iai5yZW1vdmVDbGFzcygnY2JwLWFuaW1hdGlvbi0nICsgdC5vcHRpb25zLmFuaW1hdGlvblR5cGUpO1xuXG4gICAgICAgICAgICB0LmZpbHRlckZpbmlzaCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgQW5pbWF0aW9uV3JhcHBlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQ7XG4gICAgICAgIHBhcmVudC4kb2JqLnJlbW92ZUNsYXNzKCdjYnAtYW5pbWF0aW9uLScgKyBwYXJlbnQub3B0aW9ucy5hbmltYXRpb25UeXBlKTtcbiAgICB9O1xuXG4gICAgQ3ViZVBvcnRmb2xpby5QbHVnaW5zLkFuaW1hdGlvbldyYXBwZXIgPSBmdW5jdGlvbihwYXJlbnQpIHtcblxuICAgICAgICBpZiAoIUN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5tb2Rlcm5Ccm93c2VyIHx8ICQuaW5BcnJheShwYXJlbnQub3B0aW9ucy5hbmltYXRpb25UeXBlLCBbJ2JvdW5jZUJvdHRvbScsICdib3VuY2VMZWZ0JywgJ2JvdW5jZVRvcCcsICdtb3ZlTGVmdCddKSA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBBbmltYXRpb25XcmFwcGVyKHBhcmVudCk7XG4gICAgfTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuKGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDdWJlUG9ydGZvbGlvID0gJC5mbi5jdWJlcG9ydGZvbGlvLkNvbnN0cnVjdG9yO1xuXG4gICAgZnVuY3Rpb24gQ2FwdGlvbkV4cGFuZChwYXJlbnQpIHtcbiAgICAgICAgdmFyIHQgPSB0aGlzO1xuXG4gICAgICAgIHQucGFyZW50ID0gcGFyZW50O1xuXG4gICAgICAgIHBhcmVudC5fcmVnaXN0ZXJFdmVudCgnaW5pdEZpbmlzaCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBwYXJlbnQuJG9iai5vbignY2xpY2suY2JwJywgJy5jYnAtY2FwdGlvbi1kZWZhdWx0V3JhcCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFyZW50LmlzQW5pbWF0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXJlbnQuaXNBbmltYXRpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgdmFyIGRlZmF1bHRXcmFwID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlV3JhcCA9IGRlZmF1bHRXcmFwLm5leHQoKSxcbiAgICAgICAgICAgICAgICAgICAgY2FwdGlvbiA9IGRlZmF1bHRXcmFwLnBhcmVudCgpLFxuICAgICAgICAgICAgICAgICAgICBlbmRTdHlsZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBhY3RpdmVXcmFwLm91dGVySGVpZ2h0KHRydWUpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0U3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogMFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcGFyZW50LiRvYmouYWRkQ2xhc3MoJ2NicC1jYXB0aW9uLWV4cGFuZC1hY3RpdmUnKTtcblxuICAgICAgICAgICAgICAgIC8vIHN3YXAgZW5kU3R5bGUgJiBzdGFydFN0eWxlXG4gICAgICAgICAgICAgICAgaWYgKGNhcHRpb24uaGFzQ2xhc3MoJ2NicC1jYXB0aW9uLWV4cGFuZC1vcGVuJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRlbXAgPSBzdGFydFN0eWxlO1xuICAgICAgICAgICAgICAgICAgICBzdGFydFN0eWxlID0gZW5kU3R5bGU7XG4gICAgICAgICAgICAgICAgICAgIGVuZFN0eWxlID0gdGVtcDtcbiAgICAgICAgICAgICAgICAgICAgY2FwdGlvbi5yZW1vdmVDbGFzcygnY2JwLWNhcHRpb24tZXhwYW5kLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhY3RpdmVXcmFwLmNzcyhlbmRTdHlsZSk7XG5cbiAgICAgICAgICAgICAgICBwYXJlbnQuX2dyaWRBZGp1c3QoKTtcblxuICAgICAgICAgICAgICAgIC8vIHJlcG9zaXRpb24gdGhlIGJsb2Nrc1xuICAgICAgICAgICAgICAgIHBhcmVudC5fbGF5b3V0KCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXBvc2l0aW9uYXRlIHRoZSBibG9ja3Mgd2l0aCB0aGUgYmVzdCB0cmFuc2l0aW9uIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgIHBhcmVudC5wb3NpdGlvbmF0ZUl0ZW1zKCk7XG5cbiAgICAgICAgICAgICAgICAvLyByZXNpemUgbWFpbiBjb250YWluZXIgaGVpZ2h0XG4gICAgICAgICAgICAgICAgcGFyZW50Ll9yZXNpemVNYWluQ29udGFpbmVyKCk7XG5cbiAgICAgICAgICAgICAgICAvLyBzZXQgYWN0aXZlV3JhcCB0byAwIHNvIEkgY2FuIHN0YXJ0IGFuaW1hdGlvbiBpbiB0aGUgbmV4dCBmcmFtZVxuICAgICAgICAgICAgICAgIGFjdGl2ZVdyYXAuY3NzKHN0YXJ0U3R5bGUpO1xuXG4gICAgICAgICAgICAgICAgLy8gZGVsYXkgYW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGNhcHRpb24uYWRkQ2xhc3MoJ2NicC1jYXB0aW9uLWV4cGFuZC1vcGVuJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlV3JhcC5vbmUoQ3ViZVBvcnRmb2xpby5Qcml2YXRlLnRyYW5zaXRpb25lbmQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQuJG9iai5yZW1vdmVDbGFzcygnY2JwLWNhcHRpb24tZXhwYW5kLWFjdGl2ZScpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW5kU3R5bGUuaGVpZ2h0ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FwdGlvbi5yZW1vdmVDbGFzcygnY2JwLWNhcHRpb24tZXhwYW5kLW9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmVXcmFwLmF0dHIoJ3N0eWxlJywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVdyYXAuY3NzKGVuZFN0eWxlKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50Lm9wdGlvbnMubGF5b3V0TW9kZSA9PT0gJ3NsaWRlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5fdXBkYXRlU2xpZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuX3RyaWdnZXJFdmVudCgncmVzaXplR3JpZCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgfVxuXG4gICAgQ2FwdGlvbkV4cGFuZC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBhcmVudC4kb2JqLmZpbmQoJy5jYnAtY2FwdGlvbi1kZWZhdWx0V3JhcCcpLm9mZignY2xpY2suY2JwJykucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2NicC1jYXB0aW9uLWV4cGFuZC1hY3RpdmUnKTtcbiAgICB9O1xuXG4gICAgQ3ViZVBvcnRmb2xpby5QbHVnaW5zLkNhcHRpb25FeHBhbmQgPSBmdW5jdGlvbihwYXJlbnQpIHtcblxuICAgICAgICBpZiAocGFyZW50Lm9wdGlvbnMuY2FwdGlvbiAhPT0gJ2V4cGFuZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBDYXB0aW9uRXhwYW5kKHBhcmVudCk7XG4gICAgfTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuKGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDdWJlUG9ydGZvbGlvID0gJC5mbi5jdWJlcG9ydGZvbGlvLkNvbnN0cnVjdG9yO1xuXG4gICAgZnVuY3Rpb24gQm90dG9tVG9Ub3AocGFyZW50KSB7XG5cbiAgICAgICAgLy8gc2tpcCBuZXh0IGV2ZW50IGZyb20gY29yZVxuICAgICAgICBwYXJlbnQuX3NraXBOZXh0RXZlbnQoJ2RlbGF5RnJhbWUnKTtcblxuICAgICAgICBwYXJlbnQuX3JlZ2lzdGVyRXZlbnQoJ2luaXRFbmRXcml0ZScsIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBwYXJlbnQuYmxvY2tzT24uZWFjaChmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGVbQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmFuaW1hdGlvbkRlbGF5XSA9IChpbmRleCAqIHBhcmVudC5vcHRpb25zLmRpc3BsYXlUeXBlU3BlZWQpICsgJ21zJztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBwYXJlbnQuJG9iai5hZGRDbGFzcygnY2JwLWRpc3BsYXlUeXBlLWJvdHRvbVRvVG9wJyk7XG5cbiAgICAgICAgICAgIC8vIGdldCBsYXN0IGVsZW1lbnRcbiAgICAgICAgICAgIHBhcmVudC5ibG9ja3NPbi5sYXN0KCkub25lKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5hbmltYXRpb25lbmQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHBhcmVudC4kb2JqLnJlbW92ZUNsYXNzKCdjYnAtZGlzcGxheVR5cGUtYm90dG9tVG9Ub3AnKTtcblxuICAgICAgICAgICAgICAgIHBhcmVudC5ibG9ja3NPbi5lYWNoKGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uc3R5bGVbQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmFuaW1hdGlvbkRlbGF5XSA9ICcnO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gdHJpZ2dlciBldmVudCBhZnRlciB0aGUgYW5pbWF0aW9uIGlzIGZpbmlzaGVkXG4gICAgICAgICAgICAgICAgcGFyZW50Ll90cmlnZ2VyRXZlbnQoJ2RlbGF5RnJhbWUnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgfVxuXG4gICAgQ3ViZVBvcnRmb2xpby5QbHVnaW5zLkJvdHRvbVRvVG9wID0gZnVuY3Rpb24gKHBhcmVudCkge1xuXG4gICAgICAgIGlmICghQ3ViZVBvcnRmb2xpby5Qcml2YXRlLm1vZGVybkJyb3dzZXIgfHwgcGFyZW50Lm9wdGlvbnMuZGlzcGxheVR5cGUgIT09ICdib3R0b21Ub1RvcCcgfHwgcGFyZW50LmJsb2Nrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBCb3R0b21Ub1RvcChwYXJlbnQpO1xuICAgIH07XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG5cbihmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgQ3ViZVBvcnRmb2xpbyA9ICQuZm4uY3ViZXBvcnRmb2xpby5Db25zdHJ1Y3RvcjtcblxuICAgIGZ1bmN0aW9uIEZhZGVJblRvVG9wKHBhcmVudCkge1xuXG4gICAgICAgIC8vIHNraXAgbmV4dCBldmVudCBmcm9tIGNvcmVcbiAgICAgICAgcGFyZW50Ll9za2lwTmV4dEV2ZW50KCdkZWxheUZyYW1lJyk7XG5cbiAgICAgICAgcGFyZW50Ll9yZWdpc3RlckV2ZW50KCdpbml0RW5kV3JpdGUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHBhcmVudC5vYmouc3R5bGVbQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmFuaW1hdGlvbkR1cmF0aW9uXSA9IHBhcmVudC5vcHRpb25zLmRpc3BsYXlUeXBlU3BlZWQgKyAnbXMnO1xuXG4gICAgICAgICAgICBwYXJlbnQuJG9iai5hZGRDbGFzcygnY2JwLWRpc3BsYXlUeXBlLWZhZGVJblRvVG9wJyk7XG5cbiAgICAgICAgICAgIHBhcmVudC4kb2JqLm9uZShDdWJlUG9ydGZvbGlvLlByaXZhdGUuYW5pbWF0aW9uZW5kLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQuJG9iai5yZW1vdmVDbGFzcygnY2JwLWRpc3BsYXlUeXBlLWZhZGVJblRvVG9wJyk7XG5cbiAgICAgICAgICAgICAgICBwYXJlbnQub2JqLnN0eWxlW0N1YmVQb3J0Zm9saW8uUHJpdmF0ZS5hbmltYXRpb25EdXJhdGlvbl0gPSAnJztcblxuICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgZXZlbnQgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBpcyBmaW5pc2hlZFxuICAgICAgICAgICAgICAgIHBhcmVudC5fdHJpZ2dlckV2ZW50KCdkZWxheUZyYW1lJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LCB0cnVlKTtcblxuICAgIH1cblxuICAgIEN1YmVQb3J0Zm9saW8uUGx1Z2lucy5GYWRlSW5Ub1RvcCA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcblxuICAgICAgICBpZiAoIUN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5tb2Rlcm5Ccm93c2VyIHx8IHBhcmVudC5vcHRpb25zLmRpc3BsYXlUeXBlICE9PSAnZmFkZUluVG9Ub3AnIHx8IHBhcmVudC5ibG9ja3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgRmFkZUluVG9Ub3AocGFyZW50KTtcbiAgICB9O1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuXG4oZnVuY3Rpb24oJCwgd2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIEN1YmVQb3J0Zm9saW8gPSAkLmZuLmN1YmVwb3J0Zm9saW8uQ29uc3RydWN0b3I7XG5cbiAgICBmdW5jdGlvbiBMYXp5TG9hZGluZyhwYXJlbnQpIHtcblxuICAgICAgICAvLyBza2lwIG5leHQgZXZlbnQgZnJvbSBjb3JlXG4gICAgICAgIHBhcmVudC5fc2tpcE5leHRFdmVudCgnZGVsYXlGcmFtZScpO1xuXG4gICAgICAgIHBhcmVudC5fcmVnaXN0ZXJFdmVudCgnaW5pdEVuZFdyaXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwYXJlbnQub2JqLnN0eWxlW0N1YmVQb3J0Zm9saW8uUHJpdmF0ZS5hbmltYXRpb25EdXJhdGlvbl0gPSBwYXJlbnQub3B0aW9ucy5kaXNwbGF5VHlwZVNwZWVkICsgJ21zJztcblxuICAgICAgICAgICAgcGFyZW50LiRvYmouYWRkQ2xhc3MoJ2NicC1kaXNwbGF5VHlwZS1sYXp5TG9hZGluZycpO1xuXG4gICAgICAgICAgICBwYXJlbnQuJG9iai5vbmUoQ3ViZVBvcnRmb2xpby5Qcml2YXRlLmFuaW1hdGlvbmVuZCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50LiRvYmoucmVtb3ZlQ2xhc3MoJ2NicC1kaXNwbGF5VHlwZS1sYXp5TG9hZGluZycpO1xuXG4gICAgICAgICAgICAgICAgcGFyZW50Lm9iai5zdHlsZVtDdWJlUG9ydGZvbGlvLlByaXZhdGUuYW5pbWF0aW9uRHVyYXRpb25dID0gJyc7XG5cbiAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIGV2ZW50IGFmdGVyIHRoZSBhbmltYXRpb24gaXMgZmluaXNoZWRcbiAgICAgICAgICAgICAgICBwYXJlbnQuX3RyaWdnZXJFdmVudCgnZGVsYXlGcmFtZScpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICB9XG5cbiAgICBDdWJlUG9ydGZvbGlvLlBsdWdpbnMuTGF6eUxvYWRpbmcgPSBmdW5jdGlvbiAocGFyZW50KSB7XG5cbiAgICAgICAgaWYgKCFDdWJlUG9ydGZvbGlvLlByaXZhdGUubW9kZXJuQnJvd3NlciB8fCAocGFyZW50Lm9wdGlvbnMuZGlzcGxheVR5cGUgIT09ICdsYXp5TG9hZGluZycgJiYgcGFyZW50Lm9wdGlvbnMuZGlzcGxheVR5cGUgIT09ICdmYWRlSW4nKSB8fCBwYXJlbnQuYmxvY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IExhenlMb2FkaW5nKHBhcmVudCk7XG4gICAgfTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuKGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBDdWJlUG9ydGZvbGlvID0gJC5mbi5jdWJlcG9ydGZvbGlvLkNvbnN0cnVjdG9yO1xuXG4gICAgZnVuY3Rpb24gRGlzcGxheVNlcXVlbnRpYWxseShwYXJlbnQpIHtcblxuICAgICAgICAvLyBza2lwIG5leHQgZXZlbnQgZnJvbSBjb3JlXG4gICAgICAgIHBhcmVudC5fc2tpcE5leHRFdmVudCgnZGVsYXlGcmFtZScpO1xuXG4gICAgICAgIHBhcmVudC5fcmVnaXN0ZXJFdmVudCgnaW5pdEVuZFdyaXRlJywgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHBhcmVudC5ibG9ja3NPbi5lYWNoKGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5zdHlsZVtDdWJlUG9ydGZvbGlvLlByaXZhdGUuYW5pbWF0aW9uRGVsYXldID0gKGluZGV4ICogcGFyZW50Lm9wdGlvbnMuZGlzcGxheVR5cGVTcGVlZCkgKyAnbXMnO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHBhcmVudC4kb2JqLmFkZENsYXNzKCdjYnAtZGlzcGxheVR5cGUtc2VxdWVudGlhbGx5Jyk7XG5cbiAgICAgICAgICAgIC8vIGdldCBsYXN0IGVsZW1lbnRcbiAgICAgICAgICAgIHBhcmVudC5ibG9ja3NPbi5sYXN0KCkub25lKEN1YmVQb3J0Zm9saW8uUHJpdmF0ZS5hbmltYXRpb25lbmQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHBhcmVudC4kb2JqLnJlbW92ZUNsYXNzKCdjYnAtZGlzcGxheVR5cGUtc2VxdWVudGlhbGx5Jyk7XG5cbiAgICAgICAgICAgICAgICBwYXJlbnQuYmxvY2tzT24uZWFjaChmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnN0eWxlW0N1YmVQb3J0Zm9saW8uUHJpdmF0ZS5hbmltYXRpb25EZWxheV0gPSAnJztcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgZXZlbnQgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBpcyBmaW5pc2hlZFxuICAgICAgICAgICAgICAgIHBhcmVudC5fdHJpZ2dlckV2ZW50KCdkZWxheUZyYW1lJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LCB0cnVlKTtcblxuICAgIH1cblxuICAgIEN1YmVQb3J0Zm9saW8uUGx1Z2lucy5EaXNwbGF5U2VxdWVudGlhbGx5ID0gZnVuY3Rpb24gKHBhcmVudCkge1xuXG4gICAgICAgIGlmICghQ3ViZVBvcnRmb2xpby5Qcml2YXRlLm1vZGVybkJyb3dzZXIgfHwgcGFyZW50Lm9wdGlvbnMuZGlzcGxheVR5cGUgIT09ICdzZXF1ZW50aWFsbHknIHx8IHBhcmVudC5ibG9ja3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgRGlzcGxheVNlcXVlbnRpYWxseShwYXJlbnQpO1xuICAgIH07XG5cbn0pKGpRdWVyeSwgd2luZG93LCBkb2N1bWVudCk7XG4iXSwiZmlsZSI6InZlbmRvci9qcXVlcnkuY3ViZXBvcnRmb2xpby5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9