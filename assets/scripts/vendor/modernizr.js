/*!
 * Modernizr v2.8.2
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.8.2',

    Modernizr = {},

    /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true,
    /*>>cssclasses*/

    docElement = document.documentElement,

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/ ,

    /*>>smile*/
    smile = ':)',
    /*>>smile*/

    toString = {}.toString,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),
    /*>>domprefixes*/

    /*>>ns*/
    ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, // used in testing loop


    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
          // After page load injecting a fake body doesn't work so check if body exists
          body = document.body,
          // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
          fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
      style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
      // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
      // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
          //avoid crashing IE8, if background image is used
          fakeBody.style.background = '';
          //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
          fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      // If this is done after page load we don't want to remove the body so check if body exists
      if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },
    /*>>teststyles*/

    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq) && matchMedia(mq).matches || false;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
     /*>>mq*/


    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    /*>>hasevent*/

    // TODO :: Add flag for hasownprop ? didn't last time

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                // return the property name as a string
                if (elem === false) return props[i];

                // let's bind a function
                if (is(item, 'function')){
                  // default to autobind unless override
                  return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function() {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   goo.gl/v3V4Gp
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
             // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
              (str1 + '-webkit- '.split(' ').join(str2 + str1) +
             // standard syntax             // trailing 'background-image:'
              prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-webkit-transform-3d){ ... }`
          injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
              // safari false positive's on datalist: webk.it/74252
              // see also github.com/Modernizr/Modernizr/issues/146
              attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesn't define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        /*>>inputtypes*/
    }
    /*>>webforms*/


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };


    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    /*>>shiv*/
    /**
     * @preserve HTML5 Shiv prev3.7.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
     */
    ;(function(window, document) {
        /*jshint evil:true */
        /** version */
        var version = '3.7.0';

        /** Preset options */
        var options = window.html5 || {};

        /** Used to skip problem elements */
        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

        /** Not all elements can be cloned in IE **/
        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

        /** Detect whether the browser supports default html5 styles */
        var supportsHtml5Styles;

        /** Name of the expando, to work with multiple documents or to re-shiv one document */
        var expando = '_html5shiv';

        /** The id for the the documents expando */
        var expanID = 0;

        /** Cached data for each document */
        var expandoData = {};

        /** Detect whether the browser supports unknown elements */
        var supportsUnknownElements;

        (function() {
          try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
            supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
              // assign a false positive if unable to shiv
              (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
          } catch(e) {
            // assign a false positive if detection fails => unable to shiv
            supportsHtml5Styles = true;
            supportsUnknownElements = true;
          }

        }());

        /*--------------------------------------------------------------------------*/

        /**
         * Creates a style sheet with the given CSS text and adds it to the document.
         * @private
         * @param {Document} ownerDocument The document.
         * @param {String} cssText The CSS text.
         * @returns {StyleSheet} The style element.
         */
        function addStyleSheet(ownerDocument, cssText) {
          var p = ownerDocument.createElement('p'),
          parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

          p.innerHTML = 'x<style>' + cssText + '</style>';
          return parent.insertBefore(p.lastChild, parent.firstChild);
        }

        /**
         * Returns the value of `html5.elements` as an array.
         * @private
         * @returns {Array} An array of shived element node names.
         */
        function getElements() {
          var elements = html5.elements;
          return typeof elements == 'string' ? elements.split(' ') : elements;
        }

        /**
         * Returns the data associated to the given document
         * @private
         * @param {Document} ownerDocument The document.
         * @returns {Object} An object of data.
         */
        function getExpandoData(ownerDocument) {
          var data = expandoData[ownerDocument[expando]];
          if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
          }
          return data;
        }

        /**
         * returns a shived element for the given nodeName and document
         * @memberOf html5
         * @param {String} nodeName name of the element
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived element.
         */
        function createElement(nodeName, ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
          }
          if (!data) {
            data = getExpandoData(ownerDocument);
          }
          var node;

          if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
          } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
          } else {
            node = data.createElem(nodeName);
          }

          // Avoid adding some elements to fragments in IE < 9 because
          // * Attributes like `name` or `type` cannot be set/changed once an element
          //   is inserted into a document/fragment
          // * Link elements with `src` attributes that are inaccessible, as with
          //   a 403 response, will cause the tab/window to crash
          // * Script elements appended to fragments will execute when their `src`
          //   or `text` property is set
          return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
        }

        /**
         * returns a shived DocumentFragment for the given document
         * @memberOf html5
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived DocumentFragment.
         */
        function createDocumentFragment(ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
          }
          data = data || getExpandoData(ownerDocument);
          var clone = data.frag.cloneNode(),
          i = 0,
          elems = getElements(),
          l = elems.length;
          for(;i<l;i++){
            clone.createElement(elems[i]);
          }
          return clone;
        }

        /**
         * Shivs the `createElement` and `createDocumentFragment` methods of the document.
         * @private
         * @param {Document|DocumentFragment} ownerDocument The document.
         * @param {Object} data of the document.
         */
        function shivMethods(ownerDocument, data) {
          if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
          }


          ownerDocument.createElement = function(nodeName) {
            //abort shiv
            if (!html5.shivMethods) {
              return data.createElem(nodeName);
            }
            return createElement(nodeName, ownerDocument, data);
          };

          ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                                                          'var n=f.cloneNode(),c=n.createElement;' +
                                                          'h.shivMethods&&(' +
                                                          // unroll the `createElement` calls
                                                          getElements().join().replace(/[\w\-]+/g, function(nodeName) {
            data.createElem(nodeName);
            data.frag.createElement(nodeName);
            return 'c("' + nodeName + '")';
          }) +
            ');return n}'
                                                         )(html5, data.frag);
        }

        /*--------------------------------------------------------------------------*/

        /**
         * Shivs the given document.
         * @memberOf html5
         * @param {Document} ownerDocument The document to shiv.
         * @returns {Document} The shived document.
         */
        function shivDocument(ownerDocument) {
          if (!ownerDocument) {
            ownerDocument = document;
          }
          var data = getExpandoData(ownerDocument);

          if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                                          // corrects block display not defined in IE6/7/8/9
                                          'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                            // adds styling not present in IE6/7/8/9
                                            'mark{background:#FF0;color:#000}' +
                                            // hides non-rendered elements
                                            'template{display:none}'
                                         );
          }
          if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
          }
          return ownerDocument;
        }

        /*--------------------------------------------------------------------------*/

        /**
         * The `html5` object is exposed so that more elements can be shived and
         * existing shiving can be detected on iframes.
         * @type Object
         * @example
         *
         * // options can be changed before the script is included
         * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
         */
        var html5 = {

          /**
           * An array or space separated string of node names of the elements to shiv.
           * @memberOf html5
           * @type Array|String
           */
          'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

          /**
           * current version of html5shiv
           */
          'version': version,

          /**
           * A flag to indicate that the HTML5 style sheet should be inserted.
           * @memberOf html5
           * @type Boolean
           */
          'shivCSS': (options.shivCSS !== false),

          /**
           * Is equal to true if a browser supports creating unknown/HTML5 elements
           * @memberOf html5
           * @type boolean
           */
          'supportsUnknownElements': supportsUnknownElements,

          /**
           * A flag to indicate that the document's `createElement` and `createDocumentFragment`
           * methods should be overwritten.
           * @memberOf html5
           * @type Boolean
           */
          'shivMethods': (options.shivMethods !== false),

          /**
           * A string to describe the type of `html5` object ("default" or "default print").
           * @memberOf html5
           * @type String
           */
          'type': 'default',

          // shivs the document according to the specified `html5` object options
          'shivDocument': shivDocument,

          //creates a shived element
          createElement: createElement,

          //creates a shived documentFragment
          createDocumentFragment: createDocumentFragment
        };

        /*--------------------------------------------------------------------------*/

        // expose html5
        window.html5 = html5;

        // shiv the document
        shivDocument(document);

    }(this, document));
    /*>>shiv*/

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes     = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;
    /*>>domprefixes*/

    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;
    /*>>mq*/

    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported;
    /*>>hasevent*/

    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };
    /*>>testprop*/

    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps  = testPropsAll;
    /*>>testallprops*/


    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles;
    /*>>teststyles*/


    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
        // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
        return testPropsAll(prop, obj, elem);
      }
    };
    /*>>prefixed*/


    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                            // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
    /*>>cssclasses*/

    return Modernizr;

})(this, this.document);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ2ZW5kb3IvbW9kZXJuaXpyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogTW9kZXJuaXpyIHYyLjguMlxuICogd3d3Lm1vZGVybml6ci5jb21cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIEZhcnVrIEF0ZXMsIFBhdWwgSXJpc2gsIEFsZXggU2V4dG9uXG4gKiBBdmFpbGFibGUgdW5kZXIgdGhlIEJTRCBhbmQgTUlUIGxpY2Vuc2VzOiB3d3cubW9kZXJuaXpyLmNvbS9saWNlbnNlL1xuICovXG5cbi8qXG4gKiBNb2Rlcm5penIgdGVzdHMgd2hpY2ggbmF0aXZlIENTUzMgYW5kIEhUTUw1IGZlYXR1cmVzIGFyZSBhdmFpbGFibGUgaW5cbiAqIHRoZSBjdXJyZW50IFVBIGFuZCBtYWtlcyB0aGUgcmVzdWx0cyBhdmFpbGFibGUgdG8geW91IGluIHR3byB3YXlzOlxuICogYXMgcHJvcGVydGllcyBvbiBhIGdsb2JhbCBNb2Rlcm5penIgb2JqZWN0LCBhbmQgYXMgY2xhc3NlcyBvbiB0aGVcbiAqIDxodG1sPiBlbGVtZW50LiBUaGlzIGluZm9ybWF0aW9uIGFsbG93cyB5b3UgdG8gcHJvZ3Jlc3NpdmVseSBlbmhhbmNlXG4gKiB5b3VyIHBhZ2VzIHdpdGggYSBncmFudWxhciBsZXZlbCBvZiBjb250cm9sIG92ZXIgdGhlIGV4cGVyaWVuY2UuXG4gKlxuICogTW9kZXJuaXpyIGhhcyBhbiBvcHRpb25hbCAobm90IGluY2x1ZGVkKSBjb25kaXRpb25hbCByZXNvdXJjZSBsb2FkZXJcbiAqIGNhbGxlZCBNb2Rlcm5penIubG9hZCgpLCBiYXNlZCBvbiBZZXBub3BlLmpzICh5ZXBub3BlanMuY29tKS5cbiAqIFRvIGdldCBhIGJ1aWxkIHRoYXQgaW5jbHVkZXMgTW9kZXJuaXpyLmxvYWQoKSwgYXMgd2VsbCBhcyBjaG9vc2luZ1xuICogd2hpY2ggdGVzdHMgdG8gaW5jbHVkZSwgZ28gdG8gd3d3Lm1vZGVybml6ci5jb20vZG93bmxvYWQvXG4gKlxuICogQXV0aG9ycyAgICAgICAgRmFydWsgQXRlcywgUGF1bCBJcmlzaCwgQWxleCBTZXh0b25cbiAqIENvbnRyaWJ1dG9ycyAgIFJ5YW4gU2VkZG9uLCBCZW4gQWxtYW5cbiAqL1xuXG53aW5kb3cuTW9kZXJuaXpyID0gKGZ1bmN0aW9uKCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQgKSB7XG5cbiAgICB2YXIgdmVyc2lvbiA9ICcyLjguMicsXG5cbiAgICBNb2Rlcm5penIgPSB7fSxcblxuICAgIC8qPj5jc3NjbGFzc2VzKi9cbiAgICAvLyBvcHRpb24gZm9yIGVuYWJsaW5nIHRoZSBIVE1MIGNsYXNzZXMgdG8gYmUgYWRkZWRcbiAgICBlbmFibGVDbGFzc2VzID0gdHJ1ZSxcbiAgICAvKj4+Y3NzY2xhc3NlcyovXG5cbiAgICBkb2NFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG91ciBcIm1vZGVybml6clwiIGVsZW1lbnQgdGhhdCB3ZSBkbyBtb3N0IGZlYXR1cmUgdGVzdHMgb24uXG4gICAgICovXG4gICAgbW9kID0gJ21vZGVybml6cicsXG4gICAgbW9kRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobW9kKSxcbiAgICBtU3R5bGUgPSBtb2RFbGVtLnN0eWxlLFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRoZSBpbnB1dCBlbGVtZW50IGZvciB2YXJpb3VzIFdlYiBGb3JtcyBmZWF0dXJlIHRlc3RzLlxuICAgICAqL1xuICAgIGlucHV0RWxlbSAvKj4+aW5wdXRlbGVtKi8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpIC8qPj5pbnB1dGVsZW0qLyAsXG5cbiAgICAvKj4+c21pbGUqL1xuICAgIHNtaWxlID0gJzopJyxcbiAgICAvKj4+c21pbGUqL1xuXG4gICAgdG9TdHJpbmcgPSB7fS50b1N0cmluZyxcblxuICAgIC8vIFRPRE8gOjogbWFrZSB0aGUgcHJlZml4ZXMgbW9yZSBncmFudWxhclxuICAgIC8qPj5wcmVmaXhlcyovXG4gICAgLy8gTGlzdCBvZiBwcm9wZXJ0eSB2YWx1ZXMgdG8gc2V0IGZvciBjc3MgdGVzdHMuIFNlZSB0aWNrZXQgIzIxXG4gICAgcHJlZml4ZXMgPSAnIC13ZWJraXQtIC1tb3otIC1vLSAtbXMtICcuc3BsaXQoJyAnKSxcbiAgICAvKj4+cHJlZml4ZXMqL1xuXG4gICAgLyo+PmRvbXByZWZpeGVzKi9cbiAgICAvLyBGb2xsb3dpbmcgc3BlYyBpcyB0byBleHBvc2UgdmVuZG9yLXNwZWNpZmljIHN0eWxlIHByb3BlcnRpZXMgYXM6XG4gICAgLy8gICBlbGVtLnN0eWxlLldlYmtpdEJvcmRlclJhZGl1c1xuICAgIC8vIGFuZCB0aGUgZm9sbG93aW5nIHdvdWxkIGJlIGluY29ycmVjdDpcbiAgICAvLyAgIGVsZW0uc3R5bGUud2Via2l0Qm9yZGVyUmFkaXVzXG5cbiAgICAvLyBXZWJraXQgZ2hvc3RzIHRoZWlyIHByb3BlcnRpZXMgaW4gbG93ZXJjYXNlIGJ1dCBPcGVyYSAmIE1veiBkbyBub3QuXG4gICAgLy8gTWljcm9zb2Z0IHVzZXMgYSBsb3dlcmNhc2UgYG1zYCBpbnN0ZWFkIG9mIHRoZSBjb3JyZWN0IGBNc2AgaW4gSUU4K1xuICAgIC8vICAgZXJpay5lYWUubmV0L2FyY2hpdmVzLzIwMDgvMDMvMTAvMjEuNDguMTAvXG5cbiAgICAvLyBNb3JlIGhlcmU6IGdpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvaXNzdWUvMjFcbiAgICBvbVByZWZpeGVzID0gJ1dlYmtpdCBNb3ogTyBtcycsXG5cbiAgICBjc3NvbVByZWZpeGVzID0gb21QcmVmaXhlcy5zcGxpdCgnICcpLFxuXG4gICAgZG9tUHJlZml4ZXMgPSBvbVByZWZpeGVzLnRvTG93ZXJDYXNlKCkuc3BsaXQoJyAnKSxcbiAgICAvKj4+ZG9tcHJlZml4ZXMqL1xuXG4gICAgLyo+Pm5zKi9cbiAgICBucyA9IHsnc3ZnJzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ30sXG4gICAgLyo+Pm5zKi9cblxuICAgIHRlc3RzID0ge30sXG4gICAgaW5wdXRzID0ge30sXG4gICAgYXR0cnMgPSB7fSxcblxuICAgIGNsYXNzZXMgPSBbXSxcblxuICAgIHNsaWNlID0gY2xhc3Nlcy5zbGljZSxcblxuICAgIGZlYXR1cmVOYW1lLCAvLyB1c2VkIGluIHRlc3RpbmcgbG9vcFxuXG5cbiAgICAvKj4+dGVzdHN0eWxlcyovXG4gICAgLy8gSW5qZWN0IGVsZW1lbnQgd2l0aCBzdHlsZSBlbGVtZW50IGFuZCBzb21lIENTUyBydWxlc1xuICAgIGluamVjdEVsZW1lbnRXaXRoU3R5bGVzID0gZnVuY3Rpb24oIHJ1bGUsIGNhbGxiYWNrLCBub2RlcywgdGVzdG5hbWVzICkge1xuXG4gICAgICB2YXIgc3R5bGUsIHJldCwgbm9kZSwgZG9jT3ZlcmZsb3csXG4gICAgICAgICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgICAgLy8gQWZ0ZXIgcGFnZSBsb2FkIGluamVjdGluZyBhIGZha2UgYm9keSBkb2Vzbid0IHdvcmsgc28gY2hlY2sgaWYgYm9keSBleGlzdHNcbiAgICAgICAgICBib2R5ID0gZG9jdW1lbnQuYm9keSxcbiAgICAgICAgICAvLyBJRTYgYW5kIDcgd29uJ3QgcmV0dXJuIG9mZnNldFdpZHRoIG9yIG9mZnNldEhlaWdodCB1bmxlc3MgaXQncyBpbiB0aGUgYm9keSBlbGVtZW50LCBzbyB3ZSBmYWtlIGl0LlxuICAgICAgICAgIGZha2VCb2R5ID0gYm9keSB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib2R5Jyk7XG5cbiAgICAgIGlmICggcGFyc2VJbnQobm9kZXMsIDEwKSApIHtcbiAgICAgICAgICAvLyBJbiBvcmRlciBub3QgdG8gZ2l2ZSBmYWxzZSBwb3NpdGl2ZXMgd2UgY3JlYXRlIGEgbm9kZSBmb3IgZWFjaCB0ZXN0XG4gICAgICAgICAgLy8gVGhpcyBhbHNvIGFsbG93cyB0aGUgbWV0aG9kIHRvIHNjYWxlIGZvciB1bnNwZWNpZmllZCB1c2VzXG4gICAgICAgICAgd2hpbGUgKCBub2Rlcy0tICkge1xuICAgICAgICAgICAgICBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgIG5vZGUuaWQgPSB0ZXN0bmFtZXMgPyB0ZXN0bmFtZXNbbm9kZXNdIDogbW9kICsgKG5vZGVzICsgMSk7XG4gICAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIDxzdHlsZT4gZWxlbWVudHMgaW4gSUU2LTkgYXJlIGNvbnNpZGVyZWQgJ05vU2NvcGUnIGVsZW1lbnRzIGFuZCB0aGVyZWZvcmUgd2lsbCBiZSByZW1vdmVkXG4gICAgICAvLyB3aGVuIGluamVjdGVkIHdpdGggaW5uZXJIVE1MLiBUbyBnZXQgYXJvdW5kIHRoaXMgeW91IG5lZWQgdG8gcHJlcGVuZCB0aGUgJ05vU2NvcGUnIGVsZW1lbnRcbiAgICAgIC8vIHdpdGggYSAnc2NvcGVkJyBlbGVtZW50LCBpbiBvdXIgY2FzZSB0aGUgc29mdC1oeXBoZW4gZW50aXR5IGFzIGl0IHdvbid0IG1lc3Mgd2l0aCBvdXIgbWVhc3VyZW1lbnRzLlxuICAgICAgLy8gbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1MzM4OTclMjhWUy44NSUyOS5hc3B4XG4gICAgICAvLyBEb2N1bWVudHMgc2VydmVkIGFzIHhtbCB3aWxsIHRocm93IGlmIHVzaW5nICZzaHk7IHNvIHVzZSB4bWwgZnJpZW5kbHkgZW5jb2RlZCB2ZXJzaW9uLiBTZWUgaXNzdWUgIzI3N1xuICAgICAgc3R5bGUgPSBbJyYjMTczOycsJzxzdHlsZSBpZD1cInMnLCBtb2QsICdcIj4nLCBydWxlLCAnPC9zdHlsZT4nXS5qb2luKCcnKTtcbiAgICAgIGRpdi5pZCA9IG1vZDtcbiAgICAgIC8vIElFNiB3aWxsIGZhbHNlIHBvc2l0aXZlIG9uIHNvbWUgdGVzdHMgZHVlIHRvIHRoZSBzdHlsZSBlbGVtZW50IGluc2lkZSB0aGUgdGVzdCBkaXYgc29tZWhvdyBpbnRlcmZlcmluZyBvZmZzZXRIZWlnaHQsIHNvIGluc2VydCBpdCBpbnRvIGJvZHkgb3IgZmFrZWJvZHkuXG4gICAgICAvLyBPcGVyYSB3aWxsIGFjdCBhbGwgcXVpcmt5IHdoZW4gaW5qZWN0aW5nIGVsZW1lbnRzIGluIGRvY3VtZW50RWxlbWVudCB3aGVuIHBhZ2UgaXMgc2VydmVkIGFzIHhtbCwgbmVlZHMgZmFrZWJvZHkgdG9vLiAjMjcwXG4gICAgICAoYm9keSA/IGRpdiA6IGZha2VCb2R5KS5pbm5lckhUTUwgKz0gc3R5bGU7XG4gICAgICBmYWtlQm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgaWYgKCAhYm9keSApIHtcbiAgICAgICAgICAvL2F2b2lkIGNyYXNoaW5nIElFOCwgaWYgYmFja2dyb3VuZCBpbWFnZSBpcyB1c2VkXG4gICAgICAgICAgZmFrZUJvZHkuc3R5bGUuYmFja2dyb3VuZCA9ICcnO1xuICAgICAgICAgIC8vU2FmYXJpIDUuMTMvNS4xLjQgT1NYIHN0b3BzIGxvYWRpbmcgaWYgOjotd2Via2l0LXNjcm9sbGJhciBpcyB1c2VkIGFuZCBzY3JvbGxiYXJzIGFyZSB2aXNpYmxlXG4gICAgICAgICAgZmFrZUJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgICAgICBkb2NPdmVyZmxvdyA9IGRvY0VsZW1lbnQuc3R5bGUub3ZlcmZsb3c7XG4gICAgICAgICAgZG9jRWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICAgIGRvY0VsZW1lbnQuYXBwZW5kQ2hpbGQoZmFrZUJvZHkpO1xuICAgICAgfVxuXG4gICAgICByZXQgPSBjYWxsYmFjayhkaXYsIHJ1bGUpO1xuICAgICAgLy8gSWYgdGhpcyBpcyBkb25lIGFmdGVyIHBhZ2UgbG9hZCB3ZSBkb24ndCB3YW50IHRvIHJlbW92ZSB0aGUgYm9keSBzbyBjaGVjayBpZiBib2R5IGV4aXN0c1xuICAgICAgaWYgKCAhYm9keSApIHtcbiAgICAgICAgICBmYWtlQm9keS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGZha2VCb2R5KTtcbiAgICAgICAgICBkb2NFbGVtZW50LnN0eWxlLm92ZXJmbG93ID0gZG9jT3ZlcmZsb3c7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpdi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRpdik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAhIXJldDtcblxuICAgIH0sXG4gICAgLyo+PnRlc3RzdHlsZXMqL1xuXG4gICAgLyo+Pm1xKi9cbiAgICAvLyBhZGFwdGVkIGZyb20gbWF0Y2hNZWRpYSBwb2x5ZmlsbFxuICAgIC8vIGJ5IFNjb3R0IEplaGwgYW5kIFBhdWwgSXJpc2hcbiAgICAvLyBnaXN0LmdpdGh1Yi5jb20vNzg2NzY4XG4gICAgdGVzdE1lZGlhUXVlcnkgPSBmdW5jdGlvbiggbXEgKSB7XG5cbiAgICAgIHZhciBtYXRjaE1lZGlhID0gd2luZG93Lm1hdGNoTWVkaWEgfHwgd2luZG93Lm1zTWF0Y2hNZWRpYTtcbiAgICAgIGlmICggbWF0Y2hNZWRpYSApIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoTWVkaWEobXEpICYmIG1hdGNoTWVkaWEobXEpLm1hdGNoZXMgfHwgZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBib29sO1xuXG4gICAgICBpbmplY3RFbGVtZW50V2l0aFN0eWxlcygnQG1lZGlhICcgKyBtcSArICcgeyAjJyArIG1vZCArICcgeyBwb3NpdGlvbjogYWJzb2x1dGU7IH0gfScsIGZ1bmN0aW9uKCBub2RlICkge1xuICAgICAgICBib29sID0gKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlID9cbiAgICAgICAgICAgICAgICAgIGdldENvbXB1dGVkU3R5bGUobm9kZSwgbnVsbCkgOlxuICAgICAgICAgICAgICAgICAgbm9kZS5jdXJyZW50U3R5bGUpWydwb3NpdGlvbiddID09ICdhYnNvbHV0ZSc7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGJvb2w7XG5cbiAgICAgfSxcbiAgICAgLyo+Pm1xKi9cblxuXG4gICAgLyo+Pmhhc2V2ZW50Ki9cbiAgICAvL1xuICAgIC8vIGlzRXZlbnRTdXBwb3J0ZWQgZGV0ZXJtaW5lcyBpZiBhIGdpdmVuIGVsZW1lbnQgc3VwcG9ydHMgdGhlIGdpdmVuIGV2ZW50XG4gICAgLy8ga2FuZ2F4LmdpdGh1Yi5jb20vaXNldmVudHN1cHBvcnRlZC9cbiAgICAvL1xuICAgIC8vIFRoZSBmb2xsb3dpbmcgcmVzdWx0cyBhcmUga25vd24gaW5jb3JyZWN0czpcbiAgICAvLyAgIE1vZGVybml6ci5oYXNFdmVudChcIndlYmtpdFRyYW5zaXRpb25FbmRcIiwgZWxlbSkgLy8gZmFsc2UgbmVnYXRpdmVcbiAgICAvLyAgIE1vZGVybml6ci5oYXNFdmVudChcInRleHRJbnB1dFwiKSAvLyBpbiBXZWJraXQuIGdpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvMzMzXG4gICAgLy8gICAuLi5cbiAgICBpc0V2ZW50U3VwcG9ydGVkID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgICB2YXIgVEFHTkFNRVMgPSB7XG4gICAgICAgICdzZWxlY3QnOiAnaW5wdXQnLCAnY2hhbmdlJzogJ2lucHV0JyxcbiAgICAgICAgJ3N1Ym1pdCc6ICdmb3JtJywgJ3Jlc2V0JzogJ2Zvcm0nLFxuICAgICAgICAnZXJyb3InOiAnaW1nJywgJ2xvYWQnOiAnaW1nJywgJ2Fib3J0JzogJ2ltZydcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIGlzRXZlbnRTdXBwb3J0ZWQoIGV2ZW50TmFtZSwgZWxlbWVudCApIHtcblxuICAgICAgICBlbGVtZW50ID0gZWxlbWVudCB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFRBR05BTUVTW2V2ZW50TmFtZV0gfHwgJ2RpdicpO1xuICAgICAgICBldmVudE5hbWUgPSAnb24nICsgZXZlbnROYW1lO1xuXG4gICAgICAgIC8vIFdoZW4gdXNpbmcgYHNldEF0dHJpYnV0ZWAsIElFIHNraXBzIFwidW5sb2FkXCIsIFdlYktpdCBza2lwcyBcInVubG9hZFwiIGFuZCBcInJlc2l6ZVwiLCB3aGVyZWFzIGBpbmAgXCJjYXRjaGVzXCIgdGhvc2VcbiAgICAgICAgdmFyIGlzU3VwcG9ydGVkID0gZXZlbnROYW1lIGluIGVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKCAhaXNTdXBwb3J0ZWQgKSB7XG4gICAgICAgICAgLy8gSWYgaXQgaGFzIG5vIGBzZXRBdHRyaWJ1dGVgIChpLmUuIGRvZXNuJ3QgaW1wbGVtZW50IE5vZGUgaW50ZXJmYWNlKSwgdHJ5IGdlbmVyaWMgZWxlbWVudFxuICAgICAgICAgIGlmICggIWVsZW1lbnQuc2V0QXR0cmlidXRlICkge1xuICAgICAgICAgICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIGVsZW1lbnQuc2V0QXR0cmlidXRlICYmIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlICkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoZXZlbnROYW1lLCAnJyk7XG4gICAgICAgICAgICBpc1N1cHBvcnRlZCA9IGlzKGVsZW1lbnRbZXZlbnROYW1lXSwgJ2Z1bmN0aW9uJyk7XG5cbiAgICAgICAgICAgIC8vIElmIHByb3BlcnR5IHdhcyBjcmVhdGVkLCBcInJlbW92ZSBpdFwiIChieSBzZXR0aW5nIHZhbHVlIHRvIGB1bmRlZmluZWRgKVxuICAgICAgICAgICAgaWYgKCAhaXMoZWxlbWVudFtldmVudE5hbWVdLCAndW5kZWZpbmVkJykgKSB7XG4gICAgICAgICAgICAgIGVsZW1lbnRbZXZlbnROYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGV2ZW50TmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudCA9IG51bGw7XG4gICAgICAgIHJldHVybiBpc1N1cHBvcnRlZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc0V2ZW50U3VwcG9ydGVkO1xuICAgIH0pKCksXG4gICAgLyo+Pmhhc2V2ZW50Ki9cblxuICAgIC8vIFRPRE8gOjogQWRkIGZsYWcgZm9yIGhhc293bnByb3AgPyBkaWRuJ3QgbGFzdCB0aW1lXG5cbiAgICAvLyBoYXNPd25Qcm9wZXJ0eSBzaGltIGJ5IGthbmdheCBuZWVkZWQgZm9yIFNhZmFyaSAyLjAgc3VwcG9ydFxuICAgIF9oYXNPd25Qcm9wZXJ0eSA9ICh7fSkuaGFzT3duUHJvcGVydHksIGhhc093blByb3A7XG5cbiAgICBpZiAoICFpcyhfaGFzT3duUHJvcGVydHksICd1bmRlZmluZWQnKSAmJiAhaXMoX2hhc093blByb3BlcnR5LmNhbGwsICd1bmRlZmluZWQnKSApIHtcbiAgICAgIGhhc093blByb3AgPSBmdW5jdGlvbiAob2JqZWN0LCBwcm9wZXJ0eSkge1xuICAgICAgICByZXR1cm4gX2hhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7XG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGhhc093blByb3AgPSBmdW5jdGlvbiAob2JqZWN0LCBwcm9wZXJ0eSkgeyAvKiB5ZXMsIHRoaXMgY2FuIGdpdmUgZmFsc2UgcG9zaXRpdmVzL25lZ2F0aXZlcywgYnV0IG1vc3Qgb2YgdGhlIHRpbWUgd2UgZG9uJ3QgY2FyZSBhYm91dCB0aG9zZSAqL1xuICAgICAgICByZXR1cm4gKChwcm9wZXJ0eSBpbiBvYmplY3QpICYmIGlzKG9iamVjdC5jb25zdHJ1Y3Rvci5wcm90b3R5cGVbcHJvcGVydHldLCAndW5kZWZpbmVkJykpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBBZGFwdGVkIGZyb20gRVM1LXNoaW0gaHR0cHM6Ly9naXRodWIuY29tL2tyaXNrb3dhbC9lczUtc2hpbS9ibG9iL21hc3Rlci9lczUtc2hpbS5qc1xuICAgIC8vIGVzNS5naXRodWIuY29tLyN4MTUuMy40LjVcblxuICAgIGlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gYmluZCh0aGF0KSB7XG5cbiAgICAgICAgdmFyIHRhcmdldCA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQgIT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgICAgIGJvdW5kID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG5cbiAgICAgICAgICAgICAgdmFyIEYgPSBmdW5jdGlvbigpe307XG4gICAgICAgICAgICAgIEYucHJvdG90eXBlID0gdGFyZ2V0LnByb3RvdHlwZTtcbiAgICAgICAgICAgICAgdmFyIHNlbGYgPSBuZXcgRigpO1xuXG4gICAgICAgICAgICAgIHZhciByZXN1bHQgPSB0YXJnZXQuYXBwbHkoXG4gICAgICAgICAgICAgICAgICBzZWxmLFxuICAgICAgICAgICAgICAgICAgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpZiAoT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gc2VsZjtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LmFwcGx5KFxuICAgICAgICAgICAgICAgICAgdGhhdCxcbiAgICAgICAgICAgICAgICAgIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSlcbiAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGJvdW5kO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZXRDc3MgYXBwbGllcyBnaXZlbiBzdHlsZXMgdG8gdGhlIE1vZGVybml6ciBET00gbm9kZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzZXRDc3MoIHN0ciApIHtcbiAgICAgICAgbVN0eWxlLmNzc1RleHQgPSBzdHI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2V0Q3NzQWxsIGV4dHJhcG9sYXRlcyBhbGwgdmVuZG9yLXNwZWNpZmljIGNzcyBzdHJpbmdzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNldENzc0FsbCggc3RyMSwgc3RyMiApIHtcbiAgICAgICAgcmV0dXJuIHNldENzcyhwcmVmaXhlcy5qb2luKHN0cjEgKyAnOycpICsgKCBzdHIyIHx8ICcnICkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGlzIHJldHVybnMgYSBib29sZWFuIGZvciBpZiB0eXBlb2Ygb2JqIGlzIGV4YWN0bHkgdHlwZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpcyggb2JqLCB0eXBlICkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gdHlwZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjb250YWlucyByZXR1cm5zIGEgYm9vbGVhbiBmb3IgaWYgc3Vic3RyIGlzIGZvdW5kIHdpdGhpbiBzdHIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gY29udGFpbnMoIHN0ciwgc3Vic3RyICkge1xuICAgICAgICByZXR1cm4gISF+KCcnICsgc3RyKS5pbmRleE9mKHN1YnN0cik7XG4gICAgfVxuXG4gICAgLyo+PnRlc3Rwcm9wKi9cblxuICAgIC8vIHRlc3RQcm9wcyBpcyBhIGdlbmVyaWMgQ1NTIC8gRE9NIHByb3BlcnR5IHRlc3QuXG5cbiAgICAvLyBJbiB0ZXN0aW5nIHN1cHBvcnQgZm9yIGEgZ2l2ZW4gQ1NTIHByb3BlcnR5LCBpdCdzIGxlZ2l0IHRvIHRlc3Q6XG4gICAgLy8gICAgYGVsZW0uc3R5bGVbc3R5bGVOYW1lXSAhPT0gdW5kZWZpbmVkYFxuICAgIC8vIElmIHRoZSBwcm9wZXJ0eSBpcyBzdXBwb3J0ZWQgaXQgd2lsbCByZXR1cm4gYW4gZW1wdHkgc3RyaW5nLFxuICAgIC8vIGlmIHVuc3VwcG9ydGVkIGl0IHdpbGwgcmV0dXJuIHVuZGVmaW5lZC5cblxuICAgIC8vIFdlJ2xsIHRha2UgYWR2YW50YWdlIG9mIHRoaXMgcXVpY2sgdGVzdCBhbmQgc2tpcCBzZXR0aW5nIGEgc3R5bGVcbiAgICAvLyBvbiBvdXIgbW9kZXJuaXpyIGVsZW1lbnQsIGJ1dCBpbnN0ZWFkIGp1c3QgdGVzdGluZyB1bmRlZmluZWQgdnNcbiAgICAvLyBlbXB0eSBzdHJpbmcuXG5cbiAgICAvLyBCZWNhdXNlIHRoZSB0ZXN0aW5nIG9mIHRoZSBDU1MgcHJvcGVydHkgbmFtZXMgKHdpdGggXCItXCIsIGFzXG4gICAgLy8gb3Bwb3NlZCB0byB0aGUgY2FtZWxDYXNlIERPTSBwcm9wZXJ0aWVzKSBpcyBub24tcG9ydGFibGUgYW5kXG4gICAgLy8gbm9uLXN0YW5kYXJkIGJ1dCB3b3JrcyBpbiBXZWJLaXQgYW5kIElFIChidXQgbm90IEdlY2tvIG9yIE9wZXJhKSxcbiAgICAvLyB3ZSBleHBsaWNpdGx5IHJlamVjdCBwcm9wZXJ0aWVzIHdpdGggZGFzaGVzIHNvIHRoYXQgYXV0aG9yc1xuICAgIC8vIGRldmVsb3BpbmcgaW4gV2ViS2l0IG9yIElFIGZpcnN0IGRvbid0IGVuZCB1cCB3aXRoXG4gICAgLy8gYnJvd3Nlci1zcGVjaWZpYyBjb250ZW50IGJ5IGFjY2lkZW50LlxuXG4gICAgZnVuY3Rpb24gdGVzdFByb3BzKCBwcm9wcywgcHJlZml4ZWQgKSB7XG4gICAgICAgIGZvciAoIHZhciBpIGluIHByb3BzICkge1xuICAgICAgICAgICAgdmFyIHByb3AgPSBwcm9wc1tpXTtcbiAgICAgICAgICAgIGlmICggIWNvbnRhaW5zKHByb3AsIFwiLVwiKSAmJiBtU3R5bGVbcHJvcF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJlZml4ZWQgPT0gJ3BmeCcgPyBwcm9wIDogdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8qPj50ZXN0cHJvcCovXG5cbiAgICAvLyBUT0RPIDo6IGFkZCB0ZXN0RE9NUHJvcHNcbiAgICAvKipcbiAgICAgKiB0ZXN0RE9NUHJvcHMgaXMgYSBnZW5lcmljIERPTSBwcm9wZXJ0eSB0ZXN0OyBpZiBhIGJyb3dzZXIgc3VwcG9ydHNcbiAgICAgKiAgIGEgY2VydGFpbiBwcm9wZXJ0eSwgaXQgd29uJ3QgcmV0dXJuIHVuZGVmaW5lZCBmb3IgaXQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gdGVzdERPTVByb3BzKCBwcm9wcywgb2JqLCBlbGVtICkge1xuICAgICAgICBmb3IgKCB2YXIgaSBpbiBwcm9wcyApIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gb2JqW3Byb3BzW2ldXTtcbiAgICAgICAgICAgIGlmICggaXRlbSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhlIHByb3BlcnR5IG5hbWUgYXMgYSBzdHJpbmdcbiAgICAgICAgICAgICAgICBpZiAoZWxlbSA9PT0gZmFsc2UpIHJldHVybiBwcm9wc1tpXTtcblxuICAgICAgICAgICAgICAgIC8vIGxldCdzIGJpbmQgYSBmdW5jdGlvblxuICAgICAgICAgICAgICAgIGlmIChpcyhpdGVtLCAnZnVuY3Rpb24nKSl7XG4gICAgICAgICAgICAgICAgICAvLyBkZWZhdWx0IHRvIGF1dG9iaW5kIHVubGVzcyBvdmVycmlkZVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uYmluZChlbGVtIHx8IG9iaik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1bmJvdW5kIGZ1bmN0aW9uIG9yIG9iaiBvciB2YWx1ZVxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKj4+dGVzdGFsbHByb3BzKi9cbiAgICAvKipcbiAgICAgKiB0ZXN0UHJvcHNBbGwgdGVzdHMgYSBsaXN0IG9mIERPTSBwcm9wZXJ0aWVzIHdlIHdhbnQgdG8gY2hlY2sgYWdhaW5zdC5cbiAgICAgKiAgIFdlIHNwZWNpZnkgbGl0ZXJhbGx5IEFMTCBwb3NzaWJsZSAoa25vd24gYW5kL29yIGxpa2VseSkgcHJvcGVydGllcyBvblxuICAgICAqICAgdGhlIGVsZW1lbnQgaW5jbHVkaW5nIHRoZSBub24tdmVuZG9yIHByZWZpeGVkIG9uZSwgZm9yIGZvcndhcmQtXG4gICAgICogICBjb21wYXRpYmlsaXR5LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRlc3RQcm9wc0FsbCggcHJvcCwgcHJlZml4ZWQsIGVsZW0gKSB7XG5cbiAgICAgICAgdmFyIHVjUHJvcCAgPSBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKSxcbiAgICAgICAgICAgIHByb3BzICAgPSAocHJvcCArICcgJyArIGNzc29tUHJlZml4ZXMuam9pbih1Y1Byb3AgKyAnICcpICsgdWNQcm9wKS5zcGxpdCgnICcpO1xuXG4gICAgICAgIC8vIGRpZCB0aGV5IGNhbGwgLnByZWZpeGVkKCdib3hTaXppbmcnKSBvciBhcmUgd2UganVzdCB0ZXN0aW5nIGEgcHJvcD9cbiAgICAgICAgaWYoaXMocHJlZml4ZWQsIFwic3RyaW5nXCIpIHx8IGlzKHByZWZpeGVkLCBcInVuZGVmaW5lZFwiKSkge1xuICAgICAgICAgIHJldHVybiB0ZXN0UHJvcHMocHJvcHMsIHByZWZpeGVkKTtcblxuICAgICAgICAvLyBvdGhlcndpc2UsIHRoZXkgY2FsbGVkIC5wcmVmaXhlZCgncmVxdWVzdEFuaW1hdGlvbkZyYW1lJywgd2luZG93WywgZWxlbV0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvcHMgPSAocHJvcCArICcgJyArIChkb21QcmVmaXhlcykuam9pbih1Y1Byb3AgKyAnICcpICsgdWNQcm9wKS5zcGxpdCgnICcpO1xuICAgICAgICAgIHJldHVybiB0ZXN0RE9NUHJvcHMocHJvcHMsIHByZWZpeGVkLCBlbGVtKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKj4+dGVzdGFsbHByb3BzKi9cblxuXG4gICAgLyoqXG4gICAgICogVGVzdHNcbiAgICAgKiAtLS0tLVxuICAgICAqL1xuXG4gICAgLy8gVGhlICpuZXcqIGZsZXhib3hcbiAgICAvLyBkZXYudzMub3JnL2Nzc3dnL2NzczMtZmxleGJveFxuXG4gICAgdGVzdHNbJ2ZsZXhib3gnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRlc3RQcm9wc0FsbCgnZmxleFdyYXAnKTtcbiAgICB9O1xuXG4gICAgLy8gVGhlICpvbGQqIGZsZXhib3hcbiAgICAvLyB3d3cudzMub3JnL1RSLzIwMDkvV0QtY3NzMy1mbGV4Ym94LTIwMDkwNzIzL1xuXG4gICAgdGVzdHNbJ2ZsZXhib3hsZWdhY3knXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGVzdFByb3BzQWxsKCdib3hEaXJlY3Rpb24nKTtcbiAgICB9O1xuXG4gICAgLy8gT24gdGhlIFM2MCBhbmQgQkIgU3Rvcm0sIGdldENvbnRleHQgZXhpc3RzLCBidXQgYWx3YXlzIHJldHVybnMgdW5kZWZpbmVkXG4gICAgLy8gc28gd2UgYWN0dWFsbHkgaGF2ZSB0byBjYWxsIGdldENvbnRleHQoKSB0byB2ZXJpZnlcbiAgICAvLyBnaXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzL2lzc3VlLzk3L1xuXG4gICAgdGVzdHNbJ2NhbnZhcyddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHJldHVybiAhIShlbGVtLmdldENvbnRleHQgJiYgZWxlbS5nZXRDb250ZXh0KCcyZCcpKTtcbiAgICB9O1xuXG4gICAgdGVzdHNbJ2NhbnZhc3RleHQnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gISEoTW9kZXJuaXpyWydjYW52YXMnXSAmJiBpcyhkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KCcyZCcpLmZpbGxUZXh0LCAnZnVuY3Rpb24nKSk7XG4gICAgfTtcblxuICAgIC8vIHdlYmsuaXQvNzAxMTcgaXMgdHJhY2tpbmcgYSBsZWdpdCBXZWJHTCBmZWF0dXJlIGRldGVjdCBwcm9wb3NhbFxuXG4gICAgLy8gV2UgZG8gYSBzb2Z0IGRldGVjdCB3aGljaCBtYXkgZmFsc2UgcG9zaXRpdmUgaW4gb3JkZXIgdG8gYXZvaWRcbiAgICAvLyBhbiBleHBlbnNpdmUgY29udGV4dCBjcmVhdGlvbjogYnVnemlsLmxhLzczMjQ0MVxuXG4gICAgdGVzdHNbJ3dlYmdsJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhd2luZG93LldlYkdMUmVuZGVyaW5nQ29udGV4dDtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBUaGUgTW9kZXJuaXpyLnRvdWNoIHRlc3Qgb25seSBpbmRpY2F0ZXMgaWYgdGhlIGJyb3dzZXIgc3VwcG9ydHNcbiAgICAgKiAgICB0b3VjaCBldmVudHMsIHdoaWNoIGRvZXMgbm90IG5lY2Vzc2FyaWx5IHJlZmxlY3QgYSB0b3VjaHNjcmVlblxuICAgICAqICAgIGRldmljZSwgYXMgZXZpZGVuY2VkIGJ5IHRhYmxldHMgcnVubmluZyBXaW5kb3dzIDcgb3IsIGFsYXMsXG4gICAgICogICAgdGhlIFBhbG0gUHJlIC8gV2ViT1MgKHRvdWNoKSBwaG9uZXMuXG4gICAgICpcbiAgICAgKiBBZGRpdGlvbmFsbHksIENocm9tZSAoZGVza3RvcCkgdXNlZCB0byBsaWUgYWJvdXQgaXRzIHN1cHBvcnQgb24gdGhpcyxcbiAgICAgKiAgICBidXQgdGhhdCBoYXMgc2luY2UgYmVlbiByZWN0aWZpZWQ6IGNyYnVnLmNvbS8zNjQxNVxuICAgICAqXG4gICAgICogV2UgYWxzbyB0ZXN0IGZvciBGaXJlZm94IDQgTXVsdGl0b3VjaCBTdXBwb3J0LlxuICAgICAqXG4gICAgICogRm9yIG1vcmUgaW5mbywgc2VlOiBtb2Rlcm5penIuZ2l0aHViLmNvbS9Nb2Rlcm5penIvdG91Y2guaHRtbFxuICAgICAqL1xuXG4gICAgdGVzdHNbJ3RvdWNoJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGJvb2w7XG5cbiAgICAgICAgaWYoKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykgfHwgd2luZG93LkRvY3VtZW50VG91Y2ggJiYgZG9jdW1lbnQgaW5zdGFuY2VvZiBEb2N1bWVudFRvdWNoKSB7XG4gICAgICAgICAgYm9vbCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5qZWN0RWxlbWVudFdpdGhTdHlsZXMoWydAbWVkaWEgKCcscHJlZml4ZXMuam9pbigndG91Y2gtZW5hYmxlZCksKCcpLG1vZCwnKScsJ3sjbW9kZXJuaXpye3RvcDo5cHg7cG9zaXRpb246YWJzb2x1dGV9fSddLmpvaW4oJycpLCBmdW5jdGlvbiggbm9kZSApIHtcbiAgICAgICAgICAgIGJvb2wgPSBub2RlLm9mZnNldFRvcCA9PT0gOTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBib29sO1xuICAgIH07XG5cblxuICAgIC8vIGdlb2xvY2F0aW9uIGlzIG9mdGVuIGNvbnNpZGVyZWQgYSB0cml2aWFsIGZlYXR1cmUgZGV0ZWN0Li4uXG4gICAgLy8gVHVybnMgb3V0LCBpdCdzIHF1aXRlIHRyaWNreSB0byBnZXQgcmlnaHQ6XG4gICAgLy9cbiAgICAvLyBVc2luZyAhIW5hdmlnYXRvci5nZW9sb2NhdGlvbiBkb2VzIHR3byB0aGluZ3Mgd2UgZG9uJ3Qgd2FudC4gSXQ6XG4gICAgLy8gICAxLiBMZWFrcyBtZW1vcnkgaW4gSUU5OiBnaXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzLzUxM1xuICAgIC8vICAgMi4gRGlzYWJsZXMgcGFnZSBjYWNoaW5nIGluIFdlYktpdDogd2Viay5pdC80Mzk1NlxuICAgIC8vXG4gICAgLy8gTWVhbndoaWxlLCBpbiBGaXJlZm94IDwgOCwgYW4gYWJvdXQ6Y29uZmlnIHNldHRpbmcgY291bGQgZXhwb3NlXG4gICAgLy8gYSBmYWxzZSBwb3NpdGl2ZSB0aGF0IHdvdWxkIHRocm93IGFuIGV4Y2VwdGlvbjogYnVnemlsLmxhLzY4ODE1OFxuXG4gICAgdGVzdHNbJ2dlb2xvY2F0aW9uJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICdnZW9sb2NhdGlvbicgaW4gbmF2aWdhdG9yO1xuICAgIH07XG5cblxuICAgIHRlc3RzWydwb3N0bWVzc2FnZSddID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gISF3aW5kb3cucG9zdE1lc3NhZ2U7XG4gICAgfTtcblxuXG4gICAgLy8gQ2hyb21lIGluY29nbml0byBtb2RlIHVzZWQgdG8gdGhyb3cgYW4gZXhjZXB0aW9uIHdoZW4gdXNpbmcgb3BlbkRhdGFiYXNlXG4gICAgLy8gSXQgZG9lc24ndCBhbnltb3JlLlxuICAgIHRlc3RzWyd3ZWJzcWxkYXRhYmFzZSddID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gISF3aW5kb3cub3BlbkRhdGFiYXNlO1xuICAgIH07XG5cbiAgICAvLyBWZW5kb3JzIGhhZCBpbmNvbnNpc3RlbnQgcHJlZml4aW5nIHdpdGggdGhlIGV4cGVyaW1lbnRhbCBJbmRleGVkIERCOlxuICAgIC8vIC0gV2Via2l0J3MgaW1wbGVtZW50YXRpb24gaXMgYWNjZXNzaWJsZSB0aHJvdWdoIHdlYmtpdEluZGV4ZWREQlxuICAgIC8vIC0gRmlyZWZveCBzaGlwcGVkIG1vel9pbmRleGVkREIgYmVmb3JlIEZGNGI5LCBidXQgc2luY2UgdGhlbiBoYXMgYmVlbiBtb3pJbmRleGVkREJcbiAgICAvLyBGb3Igc3BlZWQsIHdlIGRvbid0IHRlc3QgdGhlIGxlZ2FjeSAoYW5kIGJldGEtb25seSkgaW5kZXhlZERCXG4gICAgdGVzdHNbJ2luZGV4ZWREQiddID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gISF0ZXN0UHJvcHNBbGwoXCJpbmRleGVkREJcIiwgd2luZG93KTtcbiAgICB9O1xuXG4gICAgLy8gZG9jdW1lbnRNb2RlIGxvZ2ljIGZyb20gWVVJIHRvIGZpbHRlciBvdXQgSUU4IENvbXBhdCBNb2RlXG4gICAgLy8gICB3aGljaCBmYWxzZSBwb3NpdGl2ZXMuXG4gICAgdGVzdHNbJ2hhc2hjaGFuZ2UnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGlzRXZlbnRTdXBwb3J0ZWQoJ2hhc2hjaGFuZ2UnLCB3aW5kb3cpICYmIChkb2N1bWVudC5kb2N1bWVudE1vZGUgPT09IHVuZGVmaW5lZCB8fCBkb2N1bWVudC5kb2N1bWVudE1vZGUgPiA3KTtcbiAgICB9O1xuXG4gICAgLy8gUGVyIDEuNjpcbiAgICAvLyBUaGlzIHVzZWQgdG8gYmUgTW9kZXJuaXpyLmhpc3RvcnltYW5hZ2VtZW50IGJ1dCB0aGUgbG9uZ2VyXG4gICAgLy8gbmFtZSBoYXMgYmVlbiBkZXByZWNhdGVkIGluIGZhdm9yIG9mIGEgc2hvcnRlciBhbmQgcHJvcGVydHktbWF0Y2hpbmcgb25lLlxuICAgIC8vIFRoZSBvbGQgQVBJIGlzIHN0aWxsIGF2YWlsYWJsZSBpbiAxLjYsIGJ1dCBhcyBvZiAyLjAgd2lsbCB0aHJvdyBhIHdhcm5pbmcsXG4gICAgLy8gYW5kIGluIHRoZSBmaXJzdCByZWxlYXNlIHRoZXJlYWZ0ZXIgZGlzYXBwZWFyIGVudGlyZWx5LlxuICAgIHRlc3RzWydoaXN0b3J5J10gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhISh3aW5kb3cuaGlzdG9yeSAmJiBoaXN0b3J5LnB1c2hTdGF0ZSk7XG4gICAgfTtcblxuICAgIHRlc3RzWydkcmFnYW5kZHJvcCddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgcmV0dXJuICgnZHJhZ2dhYmxlJyBpbiBkaXYpIHx8ICgnb25kcmFnc3RhcnQnIGluIGRpdiAmJiAnb25kcm9wJyBpbiBkaXYpO1xuICAgIH07XG5cbiAgICAvLyBGRjMuNiB3YXMgRU9MJ2VkIG9uIDQvMjQvMTIsIGJ1dCB0aGUgRVNSIHZlcnNpb24gb2YgRkYxMFxuICAgIC8vIHdpbGwgYmUgc3VwcG9ydGVkIHVudGlsIEZGMTkgKDIvMTIvMTMpLCBhdCB3aGljaCB0aW1lLCBFU1IgYmVjb21lcyBGRjE3LlxuICAgIC8vIEZGMTAgc3RpbGwgdXNlcyBwcmVmaXhlcywgc28gY2hlY2sgZm9yIGl0IHVudGlsIHRoZW4uXG4gICAgLy8gZm9yIG1vcmUgRVNSIGluZm8sIHNlZTogbW96aWxsYS5vcmcvZW4tVVMvZmlyZWZveC9vcmdhbml6YXRpb25zL2ZhcS9cbiAgICB0ZXN0c1snd2Vic29ja2V0cyddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAnV2ViU29ja2V0JyBpbiB3aW5kb3cgfHwgJ01veldlYlNvY2tldCcgaW4gd2luZG93O1xuICAgIH07XG5cblxuICAgIC8vIGNzcy10cmlja3MuY29tL3JnYmEtYnJvd3Nlci1zdXBwb3J0L1xuICAgIHRlc3RzWydyZ2JhJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gU2V0IGFuIHJnYmEoKSBjb2xvciBhbmQgY2hlY2sgdGhlIHJldHVybmVkIHZhbHVlXG5cbiAgICAgICAgc2V0Q3NzKCdiYWNrZ3JvdW5kLWNvbG9yOnJnYmEoMTUwLDI1NSwxNTAsLjUpJyk7XG5cbiAgICAgICAgcmV0dXJuIGNvbnRhaW5zKG1TdHlsZS5iYWNrZ3JvdW5kQ29sb3IsICdyZ2JhJyk7XG4gICAgfTtcblxuICAgIHRlc3RzWydoc2xhJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gU2FtZSBhcyByZ2JhKCksIGluIGZhY3QsIGJyb3dzZXJzIHJlLW1hcCBoc2xhKCkgdG8gcmdiYSgpIGludGVybmFsbHksXG4gICAgICAgIC8vICAgZXhjZXB0IElFOSB3aG8gcmV0YWlucyBpdCBhcyBoc2xhXG5cbiAgICAgICAgc2V0Q3NzKCdiYWNrZ3JvdW5kLWNvbG9yOmhzbGEoMTIwLDQwJSwxMDAlLC41KScpO1xuXG4gICAgICAgIHJldHVybiBjb250YWlucyhtU3R5bGUuYmFja2dyb3VuZENvbG9yLCAncmdiYScpIHx8IGNvbnRhaW5zKG1TdHlsZS5iYWNrZ3JvdW5kQ29sb3IsICdoc2xhJyk7XG4gICAgfTtcblxuICAgIHRlc3RzWydtdWx0aXBsZWJncyddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFNldHRpbmcgbXVsdGlwbGUgaW1hZ2VzIEFORCBhIGNvbG9yIG9uIHRoZSBiYWNrZ3JvdW5kIHNob3J0aGFuZCBwcm9wZXJ0eVxuICAgICAgICAvLyAgYW5kIHRoZW4gcXVlcnlpbmcgdGhlIHN0eWxlLmJhY2tncm91bmQgcHJvcGVydHkgdmFsdWUgZm9yIHRoZSBudW1iZXIgb2ZcbiAgICAgICAgLy8gIG9jY3VycmVuY2VzIG9mIFwidXJsKFwiIGlzIGEgcmVsaWFibGUgbWV0aG9kIGZvciBkZXRlY3RpbmcgQUNUVUFMIHN1cHBvcnQgZm9yIHRoaXMhXG5cbiAgICAgICAgc2V0Q3NzKCdiYWNrZ3JvdW5kOnVybChodHRwczovLyksdXJsKGh0dHBzOi8vKSxyZWQgdXJsKGh0dHBzOi8vKScpO1xuXG4gICAgICAgIC8vIElmIHRoZSBVQSBzdXBwb3J0cyBtdWx0aXBsZSBiYWNrZ3JvdW5kcywgdGhlcmUgc2hvdWxkIGJlIHRocmVlIG9jY3VycmVuY2VzXG4gICAgICAgIC8vICAgb2YgdGhlIHN0cmluZyBcInVybChcIiBpbiB0aGUgcmV0dXJuIHZhbHVlIGZvciBlbGVtU3R5bGUuYmFja2dyb3VuZFxuXG4gICAgICAgIHJldHVybiAoLyh1cmxcXHMqXFwoLio/KXszfS8pLnRlc3QobVN0eWxlLmJhY2tncm91bmQpO1xuICAgIH07XG5cblxuXG4gICAgLy8gdGhpcyB3aWxsIGZhbHNlIHBvc2l0aXZlIGluIE9wZXJhIE1pbmlcbiAgICAvLyAgIGdpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvMzk2XG5cbiAgICB0ZXN0c1snYmFja2dyb3VuZHNpemUnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGVzdFByb3BzQWxsKCdiYWNrZ3JvdW5kU2l6ZScpO1xuICAgIH07XG5cbiAgICB0ZXN0c1snYm9yZGVyaW1hZ2UnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGVzdFByb3BzQWxsKCdib3JkZXJJbWFnZScpO1xuICAgIH07XG5cblxuICAgIC8vIFN1cGVyIGNvbXByZWhlbnNpdmUgdGFibGUgYWJvdXQgYWxsIHRoZSB1bmlxdWUgaW1wbGVtZW50YXRpb25zIG9mXG4gICAgLy8gYm9yZGVyLXJhZGl1czogbXVkZGxlZHJhbWJsaW5ncy5jb20vdGFibGUtb2YtY3NzMy1ib3JkZXItcmFkaXVzLWNvbXBsaWFuY2VcblxuICAgIHRlc3RzWydib3JkZXJyYWRpdXMnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGVzdFByb3BzQWxsKCdib3JkZXJSYWRpdXMnKTtcbiAgICB9O1xuXG4gICAgLy8gV2ViT1MgdW5mb3J0dW5hdGVseSBmYWxzZSBwb3NpdGl2ZXMgb24gdGhpcyB0ZXN0LlxuICAgIHRlc3RzWydib3hzaGFkb3cnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGVzdFByb3BzQWxsKCdib3hTaGFkb3cnKTtcbiAgICB9O1xuXG4gICAgLy8gRkYzLjAgd2lsbCBmYWxzZSBwb3NpdGl2ZSBvbiB0aGlzIHRlc3RcbiAgICB0ZXN0c1sndGV4dHNoYWRvdyddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKS5zdHlsZS50ZXh0U2hhZG93ID09PSAnJztcbiAgICB9O1xuXG5cbiAgICB0ZXN0c1snb3BhY2l0eSddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEJyb3dzZXJzIHRoYXQgYWN0dWFsbHkgaGF2ZSBDU1MgT3BhY2l0eSBpbXBsZW1lbnRlZCBoYXZlIGRvbmUgc29cbiAgICAgICAgLy8gIGFjY29yZGluZyB0byBzcGVjLCB3aGljaCBtZWFucyB0aGVpciByZXR1cm4gdmFsdWVzIGFyZSB3aXRoaW4gdGhlXG4gICAgICAgIC8vICByYW5nZSBvZiBbMC4wLDEuMF0gLSBpbmNsdWRpbmcgdGhlIGxlYWRpbmcgemVyby5cblxuICAgICAgICBzZXRDc3NBbGwoJ29wYWNpdHk6LjU1Jyk7XG5cbiAgICAgICAgLy8gVGhlIG5vbi1saXRlcmFsIC4gaW4gdGhpcyByZWdleCBpcyBpbnRlbnRpb25hbDpcbiAgICAgICAgLy8gICBHZXJtYW4gQ2hyb21lIHJldHVybnMgdGhpcyB2YWx1ZSBhcyAwLDU1XG4gICAgICAgIC8vIGdpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvI2lzc3VlLzU5L2NvbW1lbnQvNTE2NjMyXG4gICAgICAgIHJldHVybiAoL14wLjU1JC8pLnRlc3QobVN0eWxlLm9wYWNpdHkpO1xuICAgIH07XG5cblxuICAgIC8vIE5vdGUsIEFuZHJvaWQgPCA0IHdpbGwgcGFzcyB0aGlzIHRlc3QsIGJ1dCBjYW4gb25seSBhbmltYXRlXG4gICAgLy8gICBhIHNpbmdsZSBwcm9wZXJ0eSBhdCBhIHRpbWVcbiAgICAvLyAgIGdvby5nbC92M1Y0R3BcbiAgICB0ZXN0c1snY3NzYW5pbWF0aW9ucyddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0ZXN0UHJvcHNBbGwoJ2FuaW1hdGlvbk5hbWUnKTtcbiAgICB9O1xuXG5cbiAgICB0ZXN0c1snY3NzY29sdW1ucyddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0ZXN0UHJvcHNBbGwoJ2NvbHVtbkNvdW50Jyk7XG4gICAgfTtcblxuXG4gICAgdGVzdHNbJ2Nzc2dyYWRpZW50cyddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGb3IgQ1NTIEdyYWRpZW50cyBzeW50YXgsIHBsZWFzZSBzZWU6XG4gICAgICAgICAqIHdlYmtpdC5vcmcvYmxvZy8xNzUvaW50cm9kdWNpbmctY3NzLWdyYWRpZW50cy9cbiAgICAgICAgICogZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0NTUy8tbW96LWxpbmVhci1ncmFkaWVudFxuICAgICAgICAgKiBkZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vQ1NTLy1tb3otcmFkaWFsLWdyYWRpZW50XG4gICAgICAgICAqIGRldi53My5vcmcvY3Nzd2cvY3NzMy1pbWFnZXMvI2dyYWRpZW50cy1cbiAgICAgICAgICovXG5cbiAgICAgICAgdmFyIHN0cjEgPSAnYmFja2dyb3VuZC1pbWFnZTonLFxuICAgICAgICAgICAgc3RyMiA9ICdncmFkaWVudChsaW5lYXIsbGVmdCB0b3AscmlnaHQgYm90dG9tLGZyb20oIzlmOSksdG8od2hpdGUpKTsnLFxuICAgICAgICAgICAgc3RyMyA9ICdsaW5lYXItZ3JhZGllbnQobGVmdCB0b3AsIzlmOSwgd2hpdGUpOyc7XG5cbiAgICAgICAgc2V0Q3NzKFxuICAgICAgICAgICAgIC8vIGxlZ2FjeSB3ZWJraXQgc3ludGF4IChGSVhNRTogcmVtb3ZlIHdoZW4gc3ludGF4IG5vdCBpbiB1c2UgYW55bW9yZSlcbiAgICAgICAgICAgICAgKHN0cjEgKyAnLXdlYmtpdC0gJy5zcGxpdCgnICcpLmpvaW4oc3RyMiArIHN0cjEpICtcbiAgICAgICAgICAgICAvLyBzdGFuZGFyZCBzeW50YXggICAgICAgICAgICAgLy8gdHJhaWxpbmcgJ2JhY2tncm91bmQtaW1hZ2U6J1xuICAgICAgICAgICAgICBwcmVmaXhlcy5qb2luKHN0cjMgKyBzdHIxKSkuc2xpY2UoMCwgLXN0cjEubGVuZ3RoKVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBjb250YWlucyhtU3R5bGUuYmFja2dyb3VuZEltYWdlLCAnZ3JhZGllbnQnKTtcbiAgICB9O1xuXG5cbiAgICB0ZXN0c1snY3NzcmVmbGVjdGlvbnMnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGVzdFByb3BzQWxsKCdib3hSZWZsZWN0Jyk7XG4gICAgfTtcblxuXG4gICAgdGVzdHNbJ2Nzc3RyYW5zZm9ybXMnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gISF0ZXN0UHJvcHNBbGwoJ3RyYW5zZm9ybScpO1xuICAgIH07XG5cblxuICAgIHRlc3RzWydjc3N0cmFuc2Zvcm1zM2QnXSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciByZXQgPSAhIXRlc3RQcm9wc0FsbCgncGVyc3BlY3RpdmUnKTtcblxuICAgICAgICAvLyBXZWJraXQncyAzRCB0cmFuc2Zvcm1zIGFyZSBwYXNzZWQgb2ZmIHRvIHRoZSBicm93c2VyJ3Mgb3duIGdyYXBoaWNzIHJlbmRlcmVyLlxuICAgICAgICAvLyAgIEl0IHdvcmtzIGZpbmUgaW4gU2FmYXJpIG9uIExlb3BhcmQgYW5kIFNub3cgTGVvcGFyZCwgYnV0IG5vdCBpbiBDaHJvbWUgaW5cbiAgICAgICAgLy8gICBzb21lIGNvbmRpdGlvbnMuIEFzIGEgcmVzdWx0LCBXZWJraXQgdHlwaWNhbGx5IHJlY29nbml6ZXMgdGhlIHN5bnRheCBidXRcbiAgICAgICAgLy8gICB3aWxsIHNvbWV0aW1lcyB0aHJvdyBhIGZhbHNlIHBvc2l0aXZlLCB0aHVzIHdlIG11c3QgZG8gYSBtb3JlIHRob3JvdWdoIGNoZWNrOlxuICAgICAgICBpZiAoIHJldCAmJiAnd2Via2l0UGVyc3BlY3RpdmUnIGluIGRvY0VsZW1lbnQuc3R5bGUgKSB7XG5cbiAgICAgICAgICAvLyBXZWJraXQgYWxsb3dzIHRoaXMgbWVkaWEgcXVlcnkgdG8gc3VjY2VlZCBvbmx5IGlmIHRoZSBmZWF0dXJlIGlzIGVuYWJsZWQuXG4gICAgICAgICAgLy8gYEBtZWRpYSAodHJhbnNmb3JtLTNkKSwoLXdlYmtpdC10cmFuc2Zvcm0tM2QpeyAuLi4gfWBcbiAgICAgICAgICBpbmplY3RFbGVtZW50V2l0aFN0eWxlcygnQG1lZGlhICh0cmFuc2Zvcm0tM2QpLCgtd2Via2l0LXRyYW5zZm9ybS0zZCl7I21vZGVybml6cntsZWZ0OjlweDtwb3NpdGlvbjphYnNvbHV0ZTtoZWlnaHQ6M3B4O319JywgZnVuY3Rpb24oIG5vZGUsIHJ1bGUgKSB7XG4gICAgICAgICAgICByZXQgPSBub2RlLm9mZnNldExlZnQgPT09IDkgJiYgbm9kZS5vZmZzZXRIZWlnaHQgPT09IDM7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuXG5cbiAgICB0ZXN0c1snY3NzdHJhbnNpdGlvbnMnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGVzdFByb3BzQWxsKCd0cmFuc2l0aW9uJyk7XG4gICAgfTtcblxuXG4gICAgLyo+PmZvbnRmYWNlKi9cbiAgICAvLyBAZm9udC1mYWNlIGRldGVjdGlvbiByb3V0aW5lIGJ5IERpZWdvIFBlcmluaVxuICAgIC8vIGphdmFzY3JpcHQubndib3guY29tL0NTU1N1cHBvcnQvXG5cbiAgICAvLyBmYWxzZSBwb3NpdGl2ZXM6XG4gICAgLy8gICBXZWJPUyBnaXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzLzM0MlxuICAgIC8vICAgV1A3ICAgZ2l0aHViLmNvbS9Nb2Rlcm5penIvTW9kZXJuaXpyL2lzc3Vlcy81MzhcbiAgICB0ZXN0c1snZm9udGZhY2UnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYm9vbDtcblxuICAgICAgICBpbmplY3RFbGVtZW50V2l0aFN0eWxlcygnQGZvbnQtZmFjZSB7Zm9udC1mYW1pbHk6XCJmb250XCI7c3JjOnVybChcImh0dHBzOi8vXCIpfScsIGZ1bmN0aW9uKCBub2RlLCBydWxlICkge1xuICAgICAgICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzbW9kZXJuaXpyJyksXG4gICAgICAgICAgICAgIHNoZWV0ID0gc3R5bGUuc2hlZXQgfHwgc3R5bGUuc3R5bGVTaGVldCxcbiAgICAgICAgICAgICAgY3NzVGV4dCA9IHNoZWV0ID8gKHNoZWV0LmNzc1J1bGVzICYmIHNoZWV0LmNzc1J1bGVzWzBdID8gc2hlZXQuY3NzUnVsZXNbMF0uY3NzVGV4dCA6IHNoZWV0LmNzc1RleHQgfHwgJycpIDogJyc7XG5cbiAgICAgICAgICBib29sID0gL3NyYy9pLnRlc3QoY3NzVGV4dCkgJiYgY3NzVGV4dC5pbmRleE9mKHJ1bGUuc3BsaXQoJyAnKVswXSkgPT09IDA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBib29sO1xuICAgIH07XG4gICAgLyo+PmZvbnRmYWNlKi9cblxuICAgIC8vIENTUyBnZW5lcmF0ZWQgY29udGVudCBkZXRlY3Rpb25cbiAgICB0ZXN0c1snZ2VuZXJhdGVkY29udGVudCddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBib29sO1xuXG4gICAgICAgIGluamVjdEVsZW1lbnRXaXRoU3R5bGVzKFsnIycsbW9kLCd7Zm9udDowLzAgYX0jJyxtb2QsJzphZnRlcntjb250ZW50OlwiJyxzbWlsZSwnXCI7dmlzaWJpbGl0eTpoaWRkZW47Zm9udDozcHgvMSBhfSddLmpvaW4oJycpLCBmdW5jdGlvbiggbm9kZSApIHtcbiAgICAgICAgICBib29sID0gbm9kZS5vZmZzZXRIZWlnaHQgPj0gMztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGJvb2w7XG4gICAgfTtcblxuXG5cbiAgICAvLyBUaGVzZSB0ZXN0cyBldmFsdWF0ZSBzdXBwb3J0IG9mIHRoZSB2aWRlby9hdWRpbyBlbGVtZW50cywgYXMgd2VsbCBhc1xuICAgIC8vIHRlc3Rpbmcgd2hhdCB0eXBlcyBvZiBjb250ZW50IHRoZXkgc3VwcG9ydC5cbiAgICAvL1xuICAgIC8vIFdlJ3JlIHVzaW5nIHRoZSBCb29sZWFuIGNvbnN0cnVjdG9yIGhlcmUsIHNvIHRoYXQgd2UgY2FuIGV4dGVuZCB0aGUgdmFsdWVcbiAgICAvLyBlLmcuICBNb2Rlcm5penIudmlkZW8gICAgIC8vIHRydWVcbiAgICAvLyAgICAgICBNb2Rlcm5penIudmlkZW8ub2dnIC8vICdwcm9iYWJseSdcbiAgICAvL1xuICAgIC8vIENvZGVjIHZhbHVlcyBmcm9tIDogZ2l0aHViLmNvbS9OaWVsc0xlZW5oZWVyL2h0bWw1dGVzdC9ibG9iLzkxMDZhOC9pbmRleC5odG1sI0w4NDVcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHRoeCB0byBOaWVsc0xlZW5oZWVyIGFuZCB6Y29ycGFuXG5cbiAgICAvLyBOb3RlOiBpbiBzb21lIG9sZGVyIGJyb3dzZXJzLCBcIm5vXCIgd2FzIGEgcmV0dXJuIHZhbHVlIGluc3RlYWQgb2YgZW1wdHkgc3RyaW5nLlxuICAgIC8vICAgSXQgd2FzIGxpdmUgaW4gRkYzLjUuMCBhbmQgMy41LjEsIGJ1dCBmaXhlZCBpbiAzLjUuMlxuICAgIC8vICAgSXQgd2FzIGFsc28gbGl2ZSBpbiBTYWZhcmkgNC4wLjAgLSA0LjAuNCwgYnV0IGZpeGVkIGluIDQuMC41XG5cbiAgICB0ZXN0c1sndmlkZW8nXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyksXG4gICAgICAgICAgICBib29sID0gZmFsc2U7XG5cbiAgICAgICAgLy8gSUU5IFJ1bm5pbmcgb24gV2luZG93cyBTZXJ2ZXIgU0tVIGNhbiBjYXVzZSBhbiBleGNlcHRpb24gdG8gYmUgdGhyb3duLCBidWcgIzIyNFxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCBib29sID0gISFlbGVtLmNhblBsYXlUeXBlICkge1xuICAgICAgICAgICAgICAgIGJvb2wgICAgICA9IG5ldyBCb29sZWFuKGJvb2wpO1xuICAgICAgICAgICAgICAgIGJvb2wub2dnICA9IGVsZW0uY2FuUGxheVR5cGUoJ3ZpZGVvL29nZzsgY29kZWNzPVwidGhlb3JhXCInKSAgICAgIC5yZXBsYWNlKC9ebm8kLywnJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBXaXRob3V0IFF1aWNrVGltZSwgdGhpcyB2YWx1ZSB3aWxsIGJlIGB1bmRlZmluZWRgLiBnaXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzLzU0NlxuICAgICAgICAgICAgICAgIGJvb2wuaDI2NCA9IGVsZW0uY2FuUGxheVR5cGUoJ3ZpZGVvL21wNDsgY29kZWNzPVwiYXZjMS40MkUwMUVcIicpIC5yZXBsYWNlKC9ebm8kLywnJyk7XG5cbiAgICAgICAgICAgICAgICBib29sLndlYm0gPSBlbGVtLmNhblBsYXlUeXBlKCd2aWRlby93ZWJtOyBjb2RlY3M9XCJ2cDgsIHZvcmJpc1wiJykucmVwbGFjZSgvXm5vJC8sJycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gY2F0Y2goZSkgeyB9XG5cbiAgICAgICAgcmV0dXJuIGJvb2w7XG4gICAgfTtcblxuICAgIHRlc3RzWydhdWRpbyddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXVkaW8nKSxcbiAgICAgICAgICAgIGJvb2wgPSBmYWxzZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKCBib29sID0gISFlbGVtLmNhblBsYXlUeXBlICkge1xuICAgICAgICAgICAgICAgIGJvb2wgICAgICA9IG5ldyBCb29sZWFuKGJvb2wpO1xuICAgICAgICAgICAgICAgIGJvb2wub2dnICA9IGVsZW0uY2FuUGxheVR5cGUoJ2F1ZGlvL29nZzsgY29kZWNzPVwidm9yYmlzXCInKS5yZXBsYWNlKC9ebm8kLywnJyk7XG4gICAgICAgICAgICAgICAgYm9vbC5tcDMgID0gZWxlbS5jYW5QbGF5VHlwZSgnYXVkaW8vbXBlZzsnKSAgICAgICAgICAgICAgIC5yZXBsYWNlKC9ebm8kLywnJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBNaW1ldHlwZXMgYWNjZXB0ZWQ6XG4gICAgICAgICAgICAgICAgLy8gICBkZXZlbG9wZXIubW96aWxsYS5vcmcvRW4vTWVkaWFfZm9ybWF0c19zdXBwb3J0ZWRfYnlfdGhlX2F1ZGlvX2FuZF92aWRlb19lbGVtZW50c1xuICAgICAgICAgICAgICAgIC8vICAgYml0Lmx5L2lwaG9uZW9zY29kZWNzXG4gICAgICAgICAgICAgICAgYm9vbC53YXYgID0gZWxlbS5jYW5QbGF5VHlwZSgnYXVkaW8vd2F2OyBjb2RlY3M9XCIxXCInKSAgICAgLnJlcGxhY2UoL15ubyQvLCcnKTtcbiAgICAgICAgICAgICAgICBib29sLm00YSAgPSAoIGVsZW0uY2FuUGxheVR5cGUoJ2F1ZGlvL3gtbTRhOycpICAgICAgICAgICAgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW0uY2FuUGxheVR5cGUoJ2F1ZGlvL2FhYzsnKSkgICAgICAgICAgICAgLnJlcGxhY2UoL15ubyQvLCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaChlKSB7IH1cblxuICAgICAgICByZXR1cm4gYm9vbDtcbiAgICB9O1xuXG5cbiAgICAvLyBJbiBGRjQsIGlmIGRpc2FibGVkLCB3aW5kb3cubG9jYWxTdG9yYWdlIHNob3VsZCA9PT0gbnVsbC5cblxuICAgIC8vIE5vcm1hbGx5LCB3ZSBjb3VsZCBub3QgdGVzdCB0aGF0IGRpcmVjdGx5IGFuZCBuZWVkIHRvIGRvIGFcbiAgICAvLyAgIGAoJ2xvY2FsU3RvcmFnZScgaW4gd2luZG93KSAmJiBgIHRlc3QgZmlyc3QgYmVjYXVzZSBvdGhlcndpc2UgRmlyZWZveCB3aWxsXG4gICAgLy8gICB0aHJvdyBidWd6aWwubGEvMzY1NzcyIGlmIGNvb2tpZXMgYXJlIGRpc2FibGVkXG5cbiAgICAvLyBBbHNvIGluIGlPUzUgUHJpdmF0ZSBCcm93c2luZyBtb2RlLCBhdHRlbXB0aW5nIHRvIHVzZSBsb2NhbFN0b3JhZ2Uuc2V0SXRlbVxuICAgIC8vIHdpbGwgdGhyb3cgdGhlIGV4Y2VwdGlvbjpcbiAgICAvLyAgIFFVT1RBX0VYQ0VFREVEX0VSUlJPUiBET00gRXhjZXB0aW9uIDIyLlxuICAgIC8vIFBlY3VsaWFybHksIGdldEl0ZW0gYW5kIHJlbW92ZUl0ZW0gY2FsbHMgZG8gbm90IHRocm93LlxuXG4gICAgLy8gQmVjYXVzZSB3ZSBhcmUgZm9yY2VkIHRvIHRyeS9jYXRjaCB0aGlzLCB3ZSdsbCBnbyBhZ2dyZXNzaXZlLlxuXG4gICAgLy8gSnVzdCBGV0lXOiBJRTggQ29tcGF0IG1vZGUgc3VwcG9ydHMgdGhlc2UgZmVhdHVyZXMgY29tcGxldGVseTpcbiAgICAvLyAgIHd3dy5xdWlya3Ntb2RlLm9yZy9kb20vaHRtbDUuaHRtbFxuICAgIC8vIEJ1dCBJRTggZG9lc24ndCBzdXBwb3J0IGVpdGhlciB3aXRoIGxvY2FsIGZpbGVzXG5cbiAgICB0ZXN0c1snbG9jYWxzdG9yYWdlJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKG1vZCwgbW9kKTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKG1vZCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGVzdHNbJ3Nlc3Npb25zdG9yYWdlJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0obW9kLCBtb2QpO1xuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShtb2QpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgdGVzdHNbJ3dlYndvcmtlcnMnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gISF3aW5kb3cuV29ya2VyO1xuICAgIH07XG5cblxuICAgIHRlc3RzWydhcHBsaWNhdGlvbmNhY2hlJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhd2luZG93LmFwcGxpY2F0aW9uQ2FjaGU7XG4gICAgfTtcblxuXG4gICAgLy8gVGhhbmtzIHRvIEVyaWsgRGFobHN0cm9tXG4gICAgdGVzdHNbJ3N2ZyddID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAhIWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyAmJiAhIWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucy5zdmcsICdzdmcnKS5jcmVhdGVTVkdSZWN0O1xuICAgIH07XG5cbiAgICAvLyBzcGVjaWZpY2FsbHkgZm9yIFNWRyBpbmxpbmUgaW4gSFRNTCwgbm90IHdpdGhpbiBYSFRNTFxuICAgIC8vIHRlc3QgcGFnZTogcGF1bGlyaXNoLmNvbS9kZW1vL2lubGluZS1zdmdcbiAgICB0ZXN0c1snaW5saW5lc3ZnJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSAnPHN2Zy8+JztcbiAgICAgIHJldHVybiAoZGl2LmZpcnN0Q2hpbGQgJiYgZGl2LmZpcnN0Q2hpbGQubmFtZXNwYWNlVVJJKSA9PSBucy5zdmc7XG4gICAgfTtcblxuICAgIC8vIFNWRyBTTUlMIGFuaW1hdGlvblxuICAgIHRlc3RzWydzbWlsJ10gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICEhZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TICYmIC9TVkdBbmltYXRlLy50ZXN0KHRvU3RyaW5nLmNhbGwoZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLnN2ZywgJ2FuaW1hdGUnKSkpO1xuICAgIH07XG5cbiAgICAvLyBUaGlzIHRlc3QgaXMgb25seSBmb3IgY2xpcCBwYXRocyBpbiBTVkcgcHJvcGVyLCBub3QgY2xpcCBwYXRocyBvbiBIVE1MIGNvbnRlbnRcbiAgICAvLyBkZW1vOiBzcnVmYWN1bHR5LnNydS5lZHUvZGF2aWQuZGFpbGV5L3N2Zy9uZXdzdHVmZi9jbGlwUGF0aDQuc3ZnXG5cbiAgICAvLyBIb3dldmVyIHJlYWQgdGhlIGNvbW1lbnRzIHRvIGRpZyBpbnRvIGFwcGx5aW5nIFNWRyBjbGlwcGF0aHMgdG8gSFRNTCBjb250ZW50IGhlcmU6XG4gICAgLy8gICBnaXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzLzIxMyNpc3N1ZWNvbW1lbnQtMTE0OTQ5MVxuICAgIHRlc3RzWydzdmdjbGlwcGF0aHMnXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gISFkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMgJiYgL1NWR0NsaXBQYXRoLy50ZXN0KHRvU3RyaW5nLmNhbGwoZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLnN2ZywgJ2NsaXBQYXRoJykpKTtcbiAgICB9O1xuXG4gICAgLyo+PndlYmZvcm1zKi9cbiAgICAvLyBpbnB1dCBmZWF0dXJlcyBhbmQgaW5wdXQgdHlwZXMgZ28gZGlyZWN0bHkgb250byB0aGUgcmV0IG9iamVjdCwgYnlwYXNzaW5nIHRoZSB0ZXN0cyBsb29wLlxuICAgIC8vIEhvbGQgdGhpcyBndXkgdG8gZXhlY3V0ZSBpbiBhIG1vbWVudC5cbiAgICBmdW5jdGlvbiB3ZWJmb3JtcygpIHtcbiAgICAgICAgLyo+PmlucHV0Ki9cbiAgICAgICAgLy8gUnVuIHRocm91Z2ggSFRNTDUncyBuZXcgaW5wdXQgYXR0cmlidXRlcyB0byBzZWUgaWYgdGhlIFVBIHVuZGVyc3RhbmRzIGFueS5cbiAgICAgICAgLy8gV2UncmUgdXNpbmcgZiB3aGljaCBpcyB0aGUgPGlucHV0PiBlbGVtZW50IGNyZWF0ZWQgZWFybHkgb25cbiAgICAgICAgLy8gTWlrZSBUYXlsciBoYXMgY3JlYXRlZCBhIGNvbXByZWhlbnNpdmUgcmVzb3VyY2UgZm9yIHRlc3RpbmcgdGhlc2UgYXR0cmlidXRlc1xuICAgICAgICAvLyAgIHdoZW4gYXBwbGllZCB0byBhbGwgaW5wdXQgdHlwZXM6XG4gICAgICAgIC8vICAgbWlrZXRheWxyLmNvbS9jb2RlL2lucHV0LXR5cGUtYXR0ci5odG1sXG4gICAgICAgIC8vIHNwZWM6IHd3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdGhlLWlucHV0LWVsZW1lbnQuaHRtbCNpbnB1dC10eXBlLWF0dHItc3VtbWFyeVxuXG4gICAgICAgIC8vIE9ubHkgaW5wdXQgcGxhY2Vob2xkZXIgaXMgdGVzdGVkIHdoaWxlIHRleHRhcmVhJ3MgcGxhY2Vob2xkZXIgaXMgbm90LlxuICAgICAgICAvLyBDdXJyZW50bHkgU2FmYXJpIDQgYW5kIE9wZXJhIDExIGhhdmUgc3VwcG9ydCBvbmx5IGZvciB0aGUgaW5wdXQgcGxhY2Vob2xkZXJcbiAgICAgICAgLy8gQm90aCB0ZXN0cyBhcmUgYXZhaWxhYmxlIGluIGZlYXR1cmUtZGV0ZWN0cy9mb3Jtcy1wbGFjZWhvbGRlci5qc1xuICAgICAgICBNb2Rlcm5penJbJ2lucHV0J10gPSAoZnVuY3Rpb24oIHByb3BzICkge1xuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwLCBsZW4gPSBwcm9wcy5sZW5ndGg7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgICAgICAgICAgICBhdHRyc1sgcHJvcHNbaV0gXSA9ICEhKHByb3BzW2ldIGluIGlucHV0RWxlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXR0cnMubGlzdCl7XG4gICAgICAgICAgICAgIC8vIHNhZmFyaSBmYWxzZSBwb3NpdGl2ZSdzIG9uIGRhdGFsaXN0OiB3ZWJrLml0Lzc0MjUyXG4gICAgICAgICAgICAgIC8vIHNlZSBhbHNvIGdpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvMTQ2XG4gICAgICAgICAgICAgIGF0dHJzLmxpc3QgPSAhIShkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkYXRhbGlzdCcpICYmIHdpbmRvdy5IVE1MRGF0YUxpc3RFbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhdHRycztcbiAgICAgICAgfSkoJ2F1dG9jb21wbGV0ZSBhdXRvZm9jdXMgbGlzdCBwbGFjZWhvbGRlciBtYXggbWluIG11bHRpcGxlIHBhdHRlcm4gcmVxdWlyZWQgc3RlcCcuc3BsaXQoJyAnKSk7XG4gICAgICAgIC8qPj5pbnB1dCovXG5cbiAgICAgICAgLyo+PmlucHV0dHlwZXMqL1xuICAgICAgICAvLyBSdW4gdGhyb3VnaCBIVE1MNSdzIG5ldyBpbnB1dCB0eXBlcyB0byBzZWUgaWYgdGhlIFVBIHVuZGVyc3RhbmRzIGFueS5cbiAgICAgICAgLy8gICBUaGlzIGlzIHB1dCBiZWhpbmQgdGhlIHRlc3RzIHJ1bmxvb3AgYmVjYXVzZSBpdCBkb2Vzbid0IHJldHVybiBhXG4gICAgICAgIC8vICAgdHJ1ZS9mYWxzZSBsaWtlIGFsbCB0aGUgb3RoZXIgdGVzdHM7IGluc3RlYWQsIGl0IHJldHVybnMgYW4gb2JqZWN0XG4gICAgICAgIC8vICAgY29udGFpbmluZyBlYWNoIGlucHV0IHR5cGUgd2l0aCBpdHMgY29ycmVzcG9uZGluZyB0cnVlL2ZhbHNlIHZhbHVlXG5cbiAgICAgICAgLy8gQmlnIHRoYW5rcyB0byBAbWlrZXRheWxyIGZvciB0aGUgaHRtbDUgZm9ybXMgZXhwZXJ0aXNlLiBtaWtldGF5bHIuY29tL1xuICAgICAgICBNb2Rlcm5penJbJ2lucHV0dHlwZXMnXSA9IChmdW5jdGlvbihwcm9wcykge1xuXG4gICAgICAgICAgICBmb3IgKCB2YXIgaSA9IDAsIGJvb2wsIGlucHV0RWxlbVR5cGUsIGRlZmF1bHRWaWV3LCBsZW4gPSBwcm9wcy5sZW5ndGg7IGkgPCBsZW47IGkrKyApIHtcblxuICAgICAgICAgICAgICAgIGlucHV0RWxlbS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBpbnB1dEVsZW1UeXBlID0gcHJvcHNbaV0pO1xuICAgICAgICAgICAgICAgIGJvb2wgPSBpbnB1dEVsZW0udHlwZSAhPT0gJ3RleHQnO1xuXG4gICAgICAgICAgICAgICAgLy8gV2UgZmlyc3QgY2hlY2sgdG8gc2VlIGlmIHRoZSB0eXBlIHdlIGdpdmUgaXQgc3RpY2tzLi5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgdHlwZSBkb2VzLCB3ZSBmZWVkIGl0IGEgdGV4dHVhbCB2YWx1ZSwgd2hpY2ggc2hvdWxkbid0IGJlIHZhbGlkLlxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSB2YWx1ZSBkb2Vzbid0IHN0aWNrLCB3ZSBrbm93IHRoZXJlJ3MgaW5wdXQgc2FuaXRpemF0aW9uIHdoaWNoIGluZmVycyBhIGN1c3RvbSBVSVxuICAgICAgICAgICAgICAgIGlmICggYm9vbCApIHtcblxuICAgICAgICAgICAgICAgICAgICBpbnB1dEVsZW0udmFsdWUgICAgICAgICA9IHNtaWxlO1xuICAgICAgICAgICAgICAgICAgICBpbnB1dEVsZW0uc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjphYnNvbHV0ZTt2aXNpYmlsaXR5OmhpZGRlbjsnO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggL15yYW5nZSQvLnRlc3QoaW5wdXRFbGVtVHlwZSkgJiYgaW5wdXRFbGVtLnN0eWxlLldlYmtpdEFwcGVhcmFuY2UgIT09IHVuZGVmaW5lZCApIHtcblxuICAgICAgICAgICAgICAgICAgICAgIGRvY0VsZW1lbnQuYXBwZW5kQ2hpbGQoaW5wdXRFbGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VmlldyA9IGRvY3VtZW50LmRlZmF1bHRWaWV3O1xuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gU2FmYXJpIDItNCBhbGxvd3MgdGhlIHNtaWxleSBhcyBhIHZhbHVlLCBkZXNwaXRlIG1ha2luZyBhIHNsaWRlclxuICAgICAgICAgICAgICAgICAgICAgIGJvb2wgPSAgZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShpbnB1dEVsZW0sIG51bGwpLldlYmtpdEFwcGVhcmFuY2UgIT09ICd0ZXh0ZmllbGQnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNb2JpbGUgYW5kcm9pZCB3ZWIgYnJvd3NlciBoYXMgZmFsc2UgcG9zaXRpdmUsIHNvIG11c3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRoZSBoZWlnaHQgdG8gc2VlIGlmIHRoZSB3aWRnZXQgaXMgYWN0dWFsbHkgdGhlcmUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaW5wdXRFbGVtLm9mZnNldEhlaWdodCAhPT0gMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICBkb2NFbGVtZW50LnJlbW92ZUNoaWxkKGlucHV0RWxlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggL14oc2VhcmNofHRlbCkkLy50ZXN0KGlucHV0RWxlbVR5cGUpICl7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gU3BlYyBkb2Vzbid0IGRlZmluZSBhbnkgc3BlY2lhbCBwYXJzaW5nIG9yIGRldGVjdGFibGUgVUlcbiAgICAgICAgICAgICAgICAgICAgICAvLyAgIGJlaGF2aW9ycyBzbyB3ZSBwYXNzIHRoZXNlIHRocm91Z2ggYXMgdHJ1ZVxuXG4gICAgICAgICAgICAgICAgICAgICAgLy8gSW50ZXJlc3RpbmdseSwgb3BlcmEgZmFpbHMgdGhlIGVhcmxpZXIgdGVzdCwgc28gaXQgZG9lc24ndFxuICAgICAgICAgICAgICAgICAgICAgIC8vICBldmVuIG1ha2UgaXQgaGVyZS5cblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCAvXih1cmx8ZW1haWwpJC8udGVzdChpbnB1dEVsZW1UeXBlKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBSZWFsIHVybCBhbmQgZW1haWwgc3VwcG9ydCBjb21lcyB3aXRoIHByZWJha2VkIHZhbGlkYXRpb24uXG4gICAgICAgICAgICAgICAgICAgICAgYm9vbCA9IGlucHV0RWxlbS5jaGVja1ZhbGlkaXR5ICYmIGlucHV0RWxlbS5jaGVja1ZhbGlkaXR5KCkgPT09IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHVwZ3JhZGVkIGlucHV0IGNvbXBvbnRlbnQgcmVqZWN0cyB0aGUgOikgdGV4dCwgd2UgZ290IGEgd2lubmVyXG4gICAgICAgICAgICAgICAgICAgICAgYm9vbCA9IGlucHV0RWxlbS52YWx1ZSAhPSBzbWlsZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlucHV0c1sgcHJvcHNbaV0gXSA9ICEhYm9vbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbnB1dHM7XG4gICAgICAgIH0pKCdzZWFyY2ggdGVsIHVybCBlbWFpbCBkYXRldGltZSBkYXRlIG1vbnRoIHdlZWsgdGltZSBkYXRldGltZS1sb2NhbCBudW1iZXIgcmFuZ2UgY29sb3InLnNwbGl0KCcgJykpO1xuICAgICAgICAvKj4+aW5wdXR0eXBlcyovXG4gICAgfVxuICAgIC8qPj53ZWJmb3JtcyovXG5cblxuICAgIC8vIEVuZCBvZiB0ZXN0IGRlZmluaXRpb25zXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICAvLyBSdW4gdGhyb3VnaCBhbGwgdGVzdHMgYW5kIGRldGVjdCB0aGVpciBzdXBwb3J0IGluIHRoZSBjdXJyZW50IFVBLlxuICAgIC8vIHRvZG86IGh5cG90aGV0aWNhbGx5IHdlIGNvdWxkIGJlIGRvaW5nIGFuIGFycmF5IG9mIHRlc3RzIGFuZCB1c2UgYSBiYXNpYyBsb29wIGhlcmUuXG4gICAgZm9yICggdmFyIGZlYXR1cmUgaW4gdGVzdHMgKSB7XG4gICAgICAgIGlmICggaGFzT3duUHJvcCh0ZXN0cywgZmVhdHVyZSkgKSB7XG4gICAgICAgICAgICAvLyBydW4gdGhlIHRlc3QsIHRocm93IHRoZSByZXR1cm4gdmFsdWUgaW50byB0aGUgTW9kZXJuaXpyLFxuICAgICAgICAgICAgLy8gICB0aGVuIGJhc2VkIG9uIHRoYXQgYm9vbGVhbiwgZGVmaW5lIGFuIGFwcHJvcHJpYXRlIGNsYXNzTmFtZVxuICAgICAgICAgICAgLy8gICBhbmQgcHVzaCBpdCBpbnRvIGFuIGFycmF5IG9mIGNsYXNzZXMgd2UnbGwgam9pbiBsYXRlci5cbiAgICAgICAgICAgIGZlYXR1cmVOYW1lICA9IGZlYXR1cmUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIE1vZGVybml6cltmZWF0dXJlTmFtZV0gPSB0ZXN0c1tmZWF0dXJlXSgpO1xuXG4gICAgICAgICAgICBjbGFzc2VzLnB1c2goKE1vZGVybml6cltmZWF0dXJlTmFtZV0gPyAnJyA6ICduby0nKSArIGZlYXR1cmVOYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qPj53ZWJmb3JtcyovXG4gICAgLy8gaW5wdXQgdGVzdHMgbmVlZCB0byBydW4uXG4gICAgTW9kZXJuaXpyLmlucHV0IHx8IHdlYmZvcm1zKCk7XG4gICAgLyo+PndlYmZvcm1zKi9cblxuXG4gICAgLyoqXG4gICAgICogYWRkVGVzdCBhbGxvd3MgdGhlIHVzZXIgdG8gZGVmaW5lIHRoZWlyIG93biBmZWF0dXJlIHRlc3RzXG4gICAgICogdGhlIHJlc3VsdCB3aWxsIGJlIGFkZGVkIG9udG8gdGhlIE1vZGVybml6ciBvYmplY3QsXG4gICAgICogYXMgd2VsbCBhcyBhbiBhcHByb3ByaWF0ZSBjbGFzc05hbWUgc2V0IG9uIHRoZSBodG1sIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSBmZWF0dXJlIC0gU3RyaW5nIG5hbWluZyB0aGUgZmVhdHVyZVxuICAgICAqIEBwYXJhbSB0ZXN0IC0gRnVuY3Rpb24gcmV0dXJuaW5nIHRydWUgaWYgZmVhdHVyZSBpcyBzdXBwb3J0ZWQsIGZhbHNlIGlmIG5vdFxuICAgICAqL1xuICAgICBNb2Rlcm5penIuYWRkVGVzdCA9IGZ1bmN0aW9uICggZmVhdHVyZSwgdGVzdCApIHtcbiAgICAgICBpZiAoIHR5cGVvZiBmZWF0dXJlID09ICdvYmplY3QnICkge1xuICAgICAgICAgZm9yICggdmFyIGtleSBpbiBmZWF0dXJlICkge1xuICAgICAgICAgICBpZiAoIGhhc093blByb3AoIGZlYXR1cmUsIGtleSApICkge1xuICAgICAgICAgICAgIE1vZGVybml6ci5hZGRUZXN0KCBrZXksIGZlYXR1cmVbIGtleSBdICk7XG4gICAgICAgICAgIH1cbiAgICAgICAgIH1cbiAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICBmZWF0dXJlID0gZmVhdHVyZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICBpZiAoIE1vZGVybml6cltmZWF0dXJlXSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAvLyB3ZSdyZSBnb2luZyB0byBxdWl0IGlmIHlvdSdyZSB0cnlpbmcgdG8gb3ZlcndyaXRlIGFuIGV4aXN0aW5nIHRlc3RcbiAgICAgICAgICAgLy8gaWYgd2Ugd2VyZSB0byBhbGxvdyBpdCwgd2UnZCBkbyB0aGlzOlxuICAgICAgICAgICAvLyAgIHZhciByZSA9IG5ldyBSZWdFeHAoXCJcXFxcYihuby0pP1wiICsgZmVhdHVyZSArIFwiXFxcXGJcIik7XG4gICAgICAgICAgIC8vICAgZG9jRWxlbWVudC5jbGFzc05hbWUgPSBkb2NFbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKCByZSwgJycgKTtcbiAgICAgICAgICAgLy8gYnV0LCBubyBybHksIHN0dWZmICdlbS5cbiAgICAgICAgICAgcmV0dXJuIE1vZGVybml6cjtcbiAgICAgICAgIH1cblxuICAgICAgICAgdGVzdCA9IHR5cGVvZiB0ZXN0ID09ICdmdW5jdGlvbicgPyB0ZXN0KCkgOiB0ZXN0O1xuXG4gICAgICAgICBpZiAodHlwZW9mIGVuYWJsZUNsYXNzZXMgIT09IFwidW5kZWZpbmVkXCIgJiYgZW5hYmxlQ2xhc3Nlcykge1xuICAgICAgICAgICBkb2NFbGVtZW50LmNsYXNzTmFtZSArPSAnICcgKyAodGVzdCA/ICcnIDogJ25vLScpICsgZmVhdHVyZTtcbiAgICAgICAgIH1cbiAgICAgICAgIE1vZGVybml6cltmZWF0dXJlXSA9IHRlc3Q7XG5cbiAgICAgICB9XG5cbiAgICAgICByZXR1cm4gTW9kZXJuaXpyOyAvLyBhbGxvdyBjaGFpbmluZy5cbiAgICAgfTtcblxuXG4gICAgLy8gUmVzZXQgbW9kRWxlbS5jc3NUZXh0IHRvIG5vdGhpbmcgdG8gcmVkdWNlIG1lbW9yeSBmb290cHJpbnQuXG4gICAgc2V0Q3NzKCcnKTtcbiAgICBtb2RFbGVtID0gaW5wdXRFbGVtID0gbnVsbDtcblxuICAgIC8qPj5zaGl2Ki9cbiAgICAvKipcbiAgICAgKiBAcHJlc2VydmUgSFRNTDUgU2hpdiBwcmV2My43LjEgfCBAYWZhcmthcyBAamRhbHRvbiBAam9uX25lYWwgQHJlbSB8IE1JVC9HUEwyIExpY2Vuc2VkXG4gICAgICovXG4gICAgOyhmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50KSB7XG4gICAgICAgIC8qanNoaW50IGV2aWw6dHJ1ZSAqL1xuICAgICAgICAvKiogdmVyc2lvbiAqL1xuICAgICAgICB2YXIgdmVyc2lvbiA9ICczLjcuMCc7XG5cbiAgICAgICAgLyoqIFByZXNldCBvcHRpb25zICovXG4gICAgICAgIHZhciBvcHRpb25zID0gd2luZG93Lmh0bWw1IHx8IHt9O1xuXG4gICAgICAgIC8qKiBVc2VkIHRvIHNraXAgcHJvYmxlbSBlbGVtZW50cyAqL1xuICAgICAgICB2YXIgcmVTa2lwID0gL148fF4oPzpidXR0b258bWFwfHNlbGVjdHx0ZXh0YXJlYXxvYmplY3R8aWZyYW1lfG9wdGlvbnxvcHRncm91cCkkL2k7XG5cbiAgICAgICAgLyoqIE5vdCBhbGwgZWxlbWVudHMgY2FuIGJlIGNsb25lZCBpbiBJRSAqKi9cbiAgICAgICAgdmFyIHNhdmVDbG9uZXMgPSAvXig/OmF8Ynxjb2RlfGRpdnxmaWVsZHNldHxoMXxoMnxoM3xoNHxoNXxoNnxpfGxhYmVsfGxpfG9sfHB8cXxzcGFufHN0cm9uZ3xzdHlsZXx0YWJsZXx0Ym9keXx0ZHx0aHx0cnx1bCkkL2k7XG5cbiAgICAgICAgLyoqIERldGVjdCB3aGV0aGVyIHRoZSBicm93c2VyIHN1cHBvcnRzIGRlZmF1bHQgaHRtbDUgc3R5bGVzICovXG4gICAgICAgIHZhciBzdXBwb3J0c0h0bWw1U3R5bGVzO1xuXG4gICAgICAgIC8qKiBOYW1lIG9mIHRoZSBleHBhbmRvLCB0byB3b3JrIHdpdGggbXVsdGlwbGUgZG9jdW1lbnRzIG9yIHRvIHJlLXNoaXYgb25lIGRvY3VtZW50ICovXG4gICAgICAgIHZhciBleHBhbmRvID0gJ19odG1sNXNoaXYnO1xuXG4gICAgICAgIC8qKiBUaGUgaWQgZm9yIHRoZSB0aGUgZG9jdW1lbnRzIGV4cGFuZG8gKi9cbiAgICAgICAgdmFyIGV4cGFuSUQgPSAwO1xuXG4gICAgICAgIC8qKiBDYWNoZWQgZGF0YSBmb3IgZWFjaCBkb2N1bWVudCAqL1xuICAgICAgICB2YXIgZXhwYW5kb0RhdGEgPSB7fTtcblxuICAgICAgICAvKiogRGV0ZWN0IHdoZXRoZXIgdGhlIGJyb3dzZXIgc3VwcG9ydHMgdW5rbm93biBlbGVtZW50cyAqL1xuICAgICAgICB2YXIgc3VwcG9ydHNVbmtub3duRWxlbWVudHM7XG5cbiAgICAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICAgIGEuaW5uZXJIVE1MID0gJzx4eXo+PC94eXo+JztcbiAgICAgICAgICAgIC8vaWYgdGhlIGhpZGRlbiBwcm9wZXJ0eSBpcyBpbXBsZW1lbnRlZCB3ZSBjYW4gYXNzdW1lLCB0aGF0IHRoZSBicm93c2VyIHN1cHBvcnRzIGJhc2ljIEhUTUw1IFN0eWxlc1xuICAgICAgICAgICAgc3VwcG9ydHNIdG1sNVN0eWxlcyA9ICgnaGlkZGVuJyBpbiBhKTtcblxuICAgICAgICAgICAgc3VwcG9ydHNVbmtub3duRWxlbWVudHMgPSBhLmNoaWxkTm9kZXMubGVuZ3RoID09IDEgfHwgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAvLyBhc3NpZ24gYSBmYWxzZSBwb3NpdGl2ZSBpZiB1bmFibGUgdG8gc2hpdlxuICAgICAgICAgICAgICAoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCkoJ2EnKTtcbiAgICAgICAgICAgICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgdHlwZW9mIGZyYWcuY2xvbmVOb2RlID09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgICAgICAgICAgdHlwZW9mIGZyYWcuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCA9PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICAgICAgICAgIHR5cGVvZiBmcmFnLmNyZWF0ZUVsZW1lbnQgPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0oKSk7XG4gICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAvLyBhc3NpZ24gYSBmYWxzZSBwb3NpdGl2ZSBpZiBkZXRlY3Rpb24gZmFpbHMgPT4gdW5hYmxlIHRvIHNoaXZcbiAgICAgICAgICAgIHN1cHBvcnRzSHRtbDVTdHlsZXMgPSB0cnVlO1xuICAgICAgICAgICAgc3VwcG9ydHNVbmtub3duRWxlbWVudHMgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICB9KCkpO1xuXG4gICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGVzIGEgc3R5bGUgc2hlZXQgd2l0aCB0aGUgZ2l2ZW4gQ1NTIHRleHQgYW5kIGFkZHMgaXQgdG8gdGhlIGRvY3VtZW50LlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcGFyYW0ge0RvY3VtZW50fSBvd25lckRvY3VtZW50IFRoZSBkb2N1bWVudC5cbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGNzc1RleHQgVGhlIENTUyB0ZXh0LlxuICAgICAgICAgKiBAcmV0dXJucyB7U3R5bGVTaGVldH0gVGhlIHN0eWxlIGVsZW1lbnQuXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBhZGRTdHlsZVNoZWV0KG93bmVyRG9jdW1lbnQsIGNzc1RleHQpIHtcbiAgICAgICAgICB2YXIgcCA9IG93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpLFxuICAgICAgICAgIHBhcmVudCA9IG93bmVyRG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSB8fCBvd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuICAgICAgICAgIHAuaW5uZXJIVE1MID0gJ3g8c3R5bGU+JyArIGNzc1RleHQgKyAnPC9zdHlsZT4nO1xuICAgICAgICAgIHJldHVybiBwYXJlbnQuaW5zZXJ0QmVmb3JlKHAubGFzdENoaWxkLCBwYXJlbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYGh0bWw1LmVsZW1lbnRzYCBhcyBhbiBhcnJheS5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fSBBbiBhcnJheSBvZiBzaGl2ZWQgZWxlbWVudCBub2RlIG5hbWVzLlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gZ2V0RWxlbWVudHMoKSB7XG4gICAgICAgICAgdmFyIGVsZW1lbnRzID0gaHRtbDUuZWxlbWVudHM7XG4gICAgICAgICAgcmV0dXJuIHR5cGVvZiBlbGVtZW50cyA9PSAnc3RyaW5nJyA/IGVsZW1lbnRzLnNwbGl0KCcgJykgOiBlbGVtZW50cztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBkYXRhIGFzc29jaWF0ZWQgdG8gdGhlIGdpdmVuIGRvY3VtZW50XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwYXJhbSB7RG9jdW1lbnR9IG93bmVyRG9jdW1lbnQgVGhlIGRvY3VtZW50LlxuICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBBbiBvYmplY3Qgb2YgZGF0YS5cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGdldEV4cGFuZG9EYXRhKG93bmVyRG9jdW1lbnQpIHtcbiAgICAgICAgICB2YXIgZGF0YSA9IGV4cGFuZG9EYXRhW293bmVyRG9jdW1lbnRbZXhwYW5kb11dO1xuICAgICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgICAgZGF0YSA9IHt9O1xuICAgICAgICAgICAgZXhwYW5JRCsrO1xuICAgICAgICAgICAgb3duZXJEb2N1bWVudFtleHBhbmRvXSA9IGV4cGFuSUQ7XG4gICAgICAgICAgICBleHBhbmRvRGF0YVtleHBhbklEXSA9IGRhdGE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSBzaGl2ZWQgZWxlbWVudCBmb3IgdGhlIGdpdmVuIG5vZGVOYW1lIGFuZCBkb2N1bWVudFxuICAgICAgICAgKiBAbWVtYmVyT2YgaHRtbDVcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IG5vZGVOYW1lIG5hbWUgb2YgdGhlIGVsZW1lbnRcbiAgICAgICAgICogQHBhcmFtIHtEb2N1bWVudH0gb3duZXJEb2N1bWVudCBUaGUgY29udGV4dCBkb2N1bWVudC5cbiAgICAgICAgICogQHJldHVybnMge09iamVjdH0gVGhlIHNoaXZlZCBlbGVtZW50LlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlRWxlbWVudChub2RlTmFtZSwgb3duZXJEb2N1bWVudCwgZGF0YSl7XG4gICAgICAgICAgaWYgKCFvd25lckRvY3VtZW50KSB7XG4gICAgICAgICAgICBvd25lckRvY3VtZW50ID0gZG9jdW1lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKHN1cHBvcnRzVW5rbm93bkVsZW1lbnRzKXtcbiAgICAgICAgICAgIHJldHVybiBvd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAgIGRhdGEgPSBnZXRFeHBhbmRvRGF0YShvd25lckRvY3VtZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIG5vZGU7XG5cbiAgICAgICAgICBpZiAoZGF0YS5jYWNoZVtub2RlTmFtZV0pIHtcbiAgICAgICAgICAgIG5vZGUgPSBkYXRhLmNhY2hlW25vZGVOYW1lXS5jbG9uZU5vZGUoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNhdmVDbG9uZXMudGVzdChub2RlTmFtZSkpIHtcbiAgICAgICAgICAgIG5vZGUgPSAoZGF0YS5jYWNoZVtub2RlTmFtZV0gPSBkYXRhLmNyZWF0ZUVsZW0obm9kZU5hbWUpKS5jbG9uZU5vZGUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9kZSA9IGRhdGEuY3JlYXRlRWxlbShub2RlTmFtZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQXZvaWQgYWRkaW5nIHNvbWUgZWxlbWVudHMgdG8gZnJhZ21lbnRzIGluIElFIDwgOSBiZWNhdXNlXG4gICAgICAgICAgLy8gKiBBdHRyaWJ1dGVzIGxpa2UgYG5hbWVgIG9yIGB0eXBlYCBjYW5ub3QgYmUgc2V0L2NoYW5nZWQgb25jZSBhbiBlbGVtZW50XG4gICAgICAgICAgLy8gICBpcyBpbnNlcnRlZCBpbnRvIGEgZG9jdW1lbnQvZnJhZ21lbnRcbiAgICAgICAgICAvLyAqIExpbmsgZWxlbWVudHMgd2l0aCBgc3JjYCBhdHRyaWJ1dGVzIHRoYXQgYXJlIGluYWNjZXNzaWJsZSwgYXMgd2l0aFxuICAgICAgICAgIC8vICAgYSA0MDMgcmVzcG9uc2UsIHdpbGwgY2F1c2UgdGhlIHRhYi93aW5kb3cgdG8gY3Jhc2hcbiAgICAgICAgICAvLyAqIFNjcmlwdCBlbGVtZW50cyBhcHBlbmRlZCB0byBmcmFnbWVudHMgd2lsbCBleGVjdXRlIHdoZW4gdGhlaXIgYHNyY2BcbiAgICAgICAgICAvLyAgIG9yIGB0ZXh0YCBwcm9wZXJ0eSBpcyBzZXRcbiAgICAgICAgICByZXR1cm4gbm9kZS5jYW5IYXZlQ2hpbGRyZW4gJiYgIXJlU2tpcC50ZXN0KG5vZGVOYW1lKSAmJiAhbm9kZS50YWdVcm4gPyBkYXRhLmZyYWcuYXBwZW5kQ2hpbGQobm9kZSkgOiBub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSBzaGl2ZWQgRG9jdW1lbnRGcmFnbWVudCBmb3IgdGhlIGdpdmVuIGRvY3VtZW50XG4gICAgICAgICAqIEBtZW1iZXJPZiBodG1sNVxuICAgICAgICAgKiBAcGFyYW0ge0RvY3VtZW50fSBvd25lckRvY3VtZW50IFRoZSBjb250ZXh0IGRvY3VtZW50LlxuICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgc2hpdmVkIERvY3VtZW50RnJhZ21lbnQuXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBjcmVhdGVEb2N1bWVudEZyYWdtZW50KG93bmVyRG9jdW1lbnQsIGRhdGEpe1xuICAgICAgICAgIGlmICghb3duZXJEb2N1bWVudCkge1xuICAgICAgICAgICAgb3duZXJEb2N1bWVudCA9IGRvY3VtZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihzdXBwb3J0c1Vua25vd25FbGVtZW50cyl7XG4gICAgICAgICAgICByZXR1cm4gb3duZXJEb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRhdGEgPSBkYXRhIHx8IGdldEV4cGFuZG9EYXRhKG93bmVyRG9jdW1lbnQpO1xuICAgICAgICAgIHZhciBjbG9uZSA9IGRhdGEuZnJhZy5jbG9uZU5vZGUoKSxcbiAgICAgICAgICBpID0gMCxcbiAgICAgICAgICBlbGVtcyA9IGdldEVsZW1lbnRzKCksXG4gICAgICAgICAgbCA9IGVsZW1zLmxlbmd0aDtcbiAgICAgICAgICBmb3IoO2k8bDtpKyspe1xuICAgICAgICAgICAgY2xvbmUuY3JlYXRlRWxlbWVudChlbGVtc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjbG9uZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaGl2cyB0aGUgYGNyZWF0ZUVsZW1lbnRgIGFuZCBgY3JlYXRlRG9jdW1lbnRGcmFnbWVudGAgbWV0aG9kcyBvZiB0aGUgZG9jdW1lbnQuXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqIEBwYXJhbSB7RG9jdW1lbnR8RG9jdW1lbnRGcmFnbWVudH0gb3duZXJEb2N1bWVudCBUaGUgZG9jdW1lbnQuXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIG9mIHRoZSBkb2N1bWVudC5cbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIHNoaXZNZXRob2RzKG93bmVyRG9jdW1lbnQsIGRhdGEpIHtcbiAgICAgICAgICBpZiAoIWRhdGEuY2FjaGUpIHtcbiAgICAgICAgICAgIGRhdGEuY2FjaGUgPSB7fTtcbiAgICAgICAgICAgIGRhdGEuY3JlYXRlRWxlbSA9IG93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudDtcbiAgICAgICAgICAgIGRhdGEuY3JlYXRlRnJhZyA9IG93bmVyRG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudDtcbiAgICAgICAgICAgIGRhdGEuZnJhZyA9IGRhdGEuY3JlYXRlRnJhZygpO1xuICAgICAgICAgIH1cblxuXG4gICAgICAgICAgb3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24obm9kZU5hbWUpIHtcbiAgICAgICAgICAgIC8vYWJvcnQgc2hpdlxuICAgICAgICAgICAgaWYgKCFodG1sNS5zaGl2TWV0aG9kcykge1xuICAgICAgICAgICAgICByZXR1cm4gZGF0YS5jcmVhdGVFbGVtKG5vZGVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVFbGVtZW50KG5vZGVOYW1lLCBvd25lckRvY3VtZW50LCBkYXRhKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgb3duZXJEb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50ID0gRnVuY3Rpb24oJ2gsZicsICdyZXR1cm4gZnVuY3Rpb24oKXsnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndmFyIG49Zi5jbG9uZU5vZGUoKSxjPW4uY3JlYXRlRWxlbWVudDsnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaC5zaGl2TWV0aG9kcyYmKCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVucm9sbCB0aGUgYGNyZWF0ZUVsZW1lbnRgIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0RWxlbWVudHMoKS5qb2luKCkucmVwbGFjZSgvW1xcd1xcLV0rL2csIGZ1bmN0aW9uKG5vZGVOYW1lKSB7XG4gICAgICAgICAgICBkYXRhLmNyZWF0ZUVsZW0obm9kZU5hbWUpO1xuICAgICAgICAgICAgZGF0YS5mcmFnLmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuICdjKFwiJyArIG5vZGVOYW1lICsgJ1wiKSc7XG4gICAgICAgICAgfSkgK1xuICAgICAgICAgICAgJyk7cmV0dXJuIG59J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKShodG1sNSwgZGF0YS5mcmFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTaGl2cyB0aGUgZ2l2ZW4gZG9jdW1lbnQuXG4gICAgICAgICAqIEBtZW1iZXJPZiBodG1sNVxuICAgICAgICAgKiBAcGFyYW0ge0RvY3VtZW50fSBvd25lckRvY3VtZW50IFRoZSBkb2N1bWVudCB0byBzaGl2LlxuICAgICAgICAgKiBAcmV0dXJucyB7RG9jdW1lbnR9IFRoZSBzaGl2ZWQgZG9jdW1lbnQuXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBzaGl2RG9jdW1lbnQob3duZXJEb2N1bWVudCkge1xuICAgICAgICAgIGlmICghb3duZXJEb2N1bWVudCkge1xuICAgICAgICAgICAgb3duZXJEb2N1bWVudCA9IGRvY3VtZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgZGF0YSA9IGdldEV4cGFuZG9EYXRhKG93bmVyRG9jdW1lbnQpO1xuXG4gICAgICAgICAgaWYgKGh0bWw1LnNoaXZDU1MgJiYgIXN1cHBvcnRzSHRtbDVTdHlsZXMgJiYgIWRhdGEuaGFzQ1NTKSB7XG4gICAgICAgICAgICBkYXRhLmhhc0NTUyA9ICEhYWRkU3R5bGVTaGVldChvd25lckRvY3VtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29ycmVjdHMgYmxvY2sgZGlzcGxheSBub3QgZGVmaW5lZCBpbiBJRTYvNy84LzlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhcnRpY2xlLGFzaWRlLGRpYWxvZyxmaWdjYXB0aW9uLGZpZ3VyZSxmb290ZXIsaGVhZGVyLGhncm91cCxtYWluLG5hdixzZWN0aW9ue2Rpc3BsYXk6YmxvY2t9JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgc3R5bGluZyBub3QgcHJlc2VudCBpbiBJRTYvNy84LzlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21hcmt7YmFja2dyb3VuZDojRkYwO2NvbG9yOiMwMDB9JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhpZGVzIG5vbi1yZW5kZXJlZCBlbGVtZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGVtcGxhdGV7ZGlzcGxheTpub25lfSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFzdXBwb3J0c1Vua25vd25FbGVtZW50cykge1xuICAgICAgICAgICAgc2hpdk1ldGhvZHMob3duZXJEb2N1bWVudCwgZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBvd25lckRvY3VtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBgaHRtbDVgIG9iamVjdCBpcyBleHBvc2VkIHNvIHRoYXQgbW9yZSBlbGVtZW50cyBjYW4gYmUgc2hpdmVkIGFuZFxuICAgICAgICAgKiBleGlzdGluZyBzaGl2aW5nIGNhbiBiZSBkZXRlY3RlZCBvbiBpZnJhbWVzLlxuICAgICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICpcbiAgICAgICAgICogLy8gb3B0aW9ucyBjYW4gYmUgY2hhbmdlZCBiZWZvcmUgdGhlIHNjcmlwdCBpcyBpbmNsdWRlZFxuICAgICAgICAgKiBodG1sNSA9IHsgJ2VsZW1lbnRzJzogJ21hcmsgc2VjdGlvbicsICdzaGl2Q1NTJzogZmFsc2UsICdzaGl2TWV0aG9kcyc6IGZhbHNlIH07XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgaHRtbDUgPSB7XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBBbiBhcnJheSBvciBzcGFjZSBzZXBhcmF0ZWQgc3RyaW5nIG9mIG5vZGUgbmFtZXMgb2YgdGhlIGVsZW1lbnRzIHRvIHNoaXYuXG4gICAgICAgICAgICogQG1lbWJlck9mIGh0bWw1XG4gICAgICAgICAgICogQHR5cGUgQXJyYXl8U3RyaW5nXG4gICAgICAgICAgICovXG4gICAgICAgICAgJ2VsZW1lbnRzJzogb3B0aW9ucy5lbGVtZW50cyB8fCAnYWJiciBhcnRpY2xlIGFzaWRlIGF1ZGlvIGJkaSBjYW52YXMgZGF0YSBkYXRhbGlzdCBkZXRhaWxzIGRpYWxvZyBmaWdjYXB0aW9uIGZpZ3VyZSBmb290ZXIgaGVhZGVyIGhncm91cCBtYWluIG1hcmsgbWV0ZXIgbmF2IG91dHB1dCBwcm9ncmVzcyBzZWN0aW9uIHN1bW1hcnkgdGVtcGxhdGUgdGltZSB2aWRlbycsXG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBjdXJyZW50IHZlcnNpb24gb2YgaHRtbDVzaGl2XG4gICAgICAgICAgICovXG4gICAgICAgICAgJ3ZlcnNpb24nOiB2ZXJzaW9uLFxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogQSBmbGFnIHRvIGluZGljYXRlIHRoYXQgdGhlIEhUTUw1IHN0eWxlIHNoZWV0IHNob3VsZCBiZSBpbnNlcnRlZC5cbiAgICAgICAgICAgKiBAbWVtYmVyT2YgaHRtbDVcbiAgICAgICAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICAgICAgICovXG4gICAgICAgICAgJ3NoaXZDU1MnOiAob3B0aW9ucy5zaGl2Q1NTICE9PSBmYWxzZSksXG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBJcyBlcXVhbCB0byB0cnVlIGlmIGEgYnJvd3NlciBzdXBwb3J0cyBjcmVhdGluZyB1bmtub3duL0hUTUw1IGVsZW1lbnRzXG4gICAgICAgICAgICogQG1lbWJlck9mIGh0bWw1XG4gICAgICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAgICAqL1xuICAgICAgICAgICdzdXBwb3J0c1Vua25vd25FbGVtZW50cyc6IHN1cHBvcnRzVW5rbm93bkVsZW1lbnRzLFxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogQSBmbGFnIHRvIGluZGljYXRlIHRoYXQgdGhlIGRvY3VtZW50J3MgYGNyZWF0ZUVsZW1lbnRgIGFuZCBgY3JlYXRlRG9jdW1lbnRGcmFnbWVudGBcbiAgICAgICAgICAgKiBtZXRob2RzIHNob3VsZCBiZSBvdmVyd3JpdHRlbi5cbiAgICAgICAgICAgKiBAbWVtYmVyT2YgaHRtbDVcbiAgICAgICAgICAgKiBAdHlwZSBCb29sZWFuXG4gICAgICAgICAgICovXG4gICAgICAgICAgJ3NoaXZNZXRob2RzJzogKG9wdGlvbnMuc2hpdk1ldGhvZHMgIT09IGZhbHNlKSxcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEEgc3RyaW5nIHRvIGRlc2NyaWJlIHRoZSB0eXBlIG9mIGBodG1sNWAgb2JqZWN0IChcImRlZmF1bHRcIiBvciBcImRlZmF1bHQgcHJpbnRcIikuXG4gICAgICAgICAgICogQG1lbWJlck9mIGh0bWw1XG4gICAgICAgICAgICogQHR5cGUgU3RyaW5nXG4gICAgICAgICAgICovXG4gICAgICAgICAgJ3R5cGUnOiAnZGVmYXVsdCcsXG5cbiAgICAgICAgICAvLyBzaGl2cyB0aGUgZG9jdW1lbnQgYWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpZWQgYGh0bWw1YCBvYmplY3Qgb3B0aW9uc1xuICAgICAgICAgICdzaGl2RG9jdW1lbnQnOiBzaGl2RG9jdW1lbnQsXG5cbiAgICAgICAgICAvL2NyZWF0ZXMgYSBzaGl2ZWQgZWxlbWVudFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQ6IGNyZWF0ZUVsZW1lbnQsXG5cbiAgICAgICAgICAvL2NyZWF0ZXMgYSBzaGl2ZWQgZG9jdW1lbnRGcmFnbWVudFxuICAgICAgICAgIGNyZWF0ZURvY3VtZW50RnJhZ21lbnQ6IGNyZWF0ZURvY3VtZW50RnJhZ21lbnRcbiAgICAgICAgfTtcblxuICAgICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgICAgICAvLyBleHBvc2UgaHRtbDVcbiAgICAgICAgd2luZG93Lmh0bWw1ID0gaHRtbDU7XG5cbiAgICAgICAgLy8gc2hpdiB0aGUgZG9jdW1lbnRcbiAgICAgICAgc2hpdkRvY3VtZW50KGRvY3VtZW50KTtcblxuICAgIH0odGhpcywgZG9jdW1lbnQpKTtcbiAgICAvKj4+c2hpdiovXG5cbiAgICAvLyBBc3NpZ24gcHJpdmF0ZSBwcm9wZXJ0aWVzIHRvIHRoZSByZXR1cm4gb2JqZWN0IHdpdGggcHJlZml4XG4gICAgTW9kZXJuaXpyLl92ZXJzaW9uICAgICAgPSB2ZXJzaW9uO1xuXG4gICAgLy8gZXhwb3NlIHRoZXNlIGZvciB0aGUgcGx1Z2luIEFQSS4gTG9vayBpbiB0aGUgc291cmNlIGZvciBob3cgdG8gam9pbigpIHRoZW0gYWdhaW5zdCB5b3VyIGlucHV0XG4gICAgLyo+PnByZWZpeGVzKi9cbiAgICBNb2Rlcm5penIuX3ByZWZpeGVzICAgICA9IHByZWZpeGVzO1xuICAgIC8qPj5wcmVmaXhlcyovXG4gICAgLyo+PmRvbXByZWZpeGVzKi9cbiAgICBNb2Rlcm5penIuX2RvbVByZWZpeGVzICA9IGRvbVByZWZpeGVzO1xuICAgIE1vZGVybml6ci5fY3Nzb21QcmVmaXhlcyAgPSBjc3NvbVByZWZpeGVzO1xuICAgIC8qPj5kb21wcmVmaXhlcyovXG5cbiAgICAvKj4+bXEqL1xuICAgIC8vIE1vZGVybml6ci5tcSB0ZXN0cyBhIGdpdmVuIG1lZGlhIHF1ZXJ5LCBsaXZlIGFnYWluc3QgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHdpbmRvd1xuICAgIC8vIEEgZmV3IGltcG9ydGFudCBub3RlczpcbiAgICAvLyAgICogSWYgYSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgbWVkaWEgcXVlcmllcyBhdCBhbGwgKGVnLiBvbGRJRSkgdGhlIG1xKCkgd2lsbCBhbHdheXMgcmV0dXJuIGZhbHNlXG4gICAgLy8gICAqIEEgbWF4LXdpZHRoIG9yIG9yaWVudGF0aW9uIHF1ZXJ5IHdpbGwgYmUgZXZhbHVhdGVkIGFnYWluc3QgdGhlIGN1cnJlbnQgc3RhdGUsIHdoaWNoIG1heSBjaGFuZ2UgbGF0ZXIuXG4gICAgLy8gICAqIFlvdSBtdXN0IHNwZWNpZnkgdmFsdWVzLiBFZy4gSWYgeW91IGFyZSB0ZXN0aW5nIHN1cHBvcnQgZm9yIHRoZSBtaW4td2lkdGggbWVkaWEgcXVlcnkgdXNlOlxuICAgIC8vICAgICAgIE1vZGVybml6ci5tcSgnKG1pbi13aWR0aDowKScpXG4gICAgLy8gdXNhZ2U6XG4gICAgLy8gTW9kZXJuaXpyLm1xKCdvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDo3NjgpJylcbiAgICBNb2Rlcm5penIubXEgICAgICAgICAgICA9IHRlc3RNZWRpYVF1ZXJ5O1xuICAgIC8qPj5tcSovXG5cbiAgICAvKj4+aGFzZXZlbnQqL1xuICAgIC8vIE1vZGVybml6ci5oYXNFdmVudCgpIGRldGVjdHMgc3VwcG9ydCBmb3IgYSBnaXZlbiBldmVudCwgd2l0aCBhbiBvcHRpb25hbCBlbGVtZW50IHRvIHRlc3Qgb25cbiAgICAvLyBNb2Rlcm5penIuaGFzRXZlbnQoJ2dlc3R1cmVzdGFydCcsIGVsZW0pXG4gICAgTW9kZXJuaXpyLmhhc0V2ZW50ICAgICAgPSBpc0V2ZW50U3VwcG9ydGVkO1xuICAgIC8qPj5oYXNldmVudCovXG5cbiAgICAvKj4+dGVzdHByb3AqL1xuICAgIC8vIE1vZGVybml6ci50ZXN0UHJvcCgpIGludmVzdGlnYXRlcyB3aGV0aGVyIGEgZ2l2ZW4gc3R5bGUgcHJvcGVydHkgaXMgcmVjb2duaXplZFxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcHJvcGVydHkgbmFtZXMgbXVzdCBiZSBwcm92aWRlZCBpbiB0aGUgY2FtZWxDYXNlIHZhcmlhbnQuXG4gICAgLy8gTW9kZXJuaXpyLnRlc3RQcm9wKCdwb2ludGVyRXZlbnRzJylcbiAgICBNb2Rlcm5penIudGVzdFByb3AgICAgICA9IGZ1bmN0aW9uKHByb3Ape1xuICAgICAgICByZXR1cm4gdGVzdFByb3BzKFtwcm9wXSk7XG4gICAgfTtcbiAgICAvKj4+dGVzdHByb3AqL1xuXG4gICAgLyo+PnRlc3RhbGxwcm9wcyovXG4gICAgLy8gTW9kZXJuaXpyLnRlc3RBbGxQcm9wcygpIGludmVzdGlnYXRlcyB3aGV0aGVyIGEgZ2l2ZW4gc3R5bGUgcHJvcGVydHksXG4gICAgLy8gICBvciBhbnkgb2YgaXRzIHZlbmRvci1wcmVmaXhlZCB2YXJpYW50cywgaXMgcmVjb2duaXplZFxuICAgIC8vIE5vdGUgdGhhdCB0aGUgcHJvcGVydHkgbmFtZXMgbXVzdCBiZSBwcm92aWRlZCBpbiB0aGUgY2FtZWxDYXNlIHZhcmlhbnQuXG4gICAgLy8gTW9kZXJuaXpyLnRlc3RBbGxQcm9wcygnYm94U2l6aW5nJylcbiAgICBNb2Rlcm5penIudGVzdEFsbFByb3BzICA9IHRlc3RQcm9wc0FsbDtcbiAgICAvKj4+dGVzdGFsbHByb3BzKi9cblxuXG4gICAgLyo+PnRlc3RzdHlsZXMqL1xuICAgIC8vIE1vZGVybml6ci50ZXN0U3R5bGVzKCkgYWxsb3dzIHlvdSB0byBhZGQgY3VzdG9tIHN0eWxlcyB0byB0aGUgZG9jdW1lbnQgYW5kIHRlc3QgYW4gZWxlbWVudCBhZnRlcndhcmRzXG4gICAgLy8gTW9kZXJuaXpyLnRlc3RTdHlsZXMoJyNtb2Rlcm5penIgeyBwb3NpdGlvbjphYnNvbHV0ZSB9JywgZnVuY3Rpb24oZWxlbSwgcnVsZSl7IC4uLiB9KVxuICAgIE1vZGVybml6ci50ZXN0U3R5bGVzICAgID0gaW5qZWN0RWxlbWVudFdpdGhTdHlsZXM7XG4gICAgLyo+PnRlc3RzdHlsZXMqL1xuXG5cbiAgICAvKj4+cHJlZml4ZWQqL1xuICAgIC8vIE1vZGVybml6ci5wcmVmaXhlZCgpIHJldHVybnMgdGhlIHByZWZpeGVkIG9yIG5vbnByZWZpeGVkIHByb3BlcnR5IG5hbWUgdmFyaWFudCBvZiB5b3VyIGlucHV0XG4gICAgLy8gTW9kZXJuaXpyLnByZWZpeGVkKCdib3hTaXppbmcnKSAvLyAnTW96Qm94U2l6aW5nJ1xuXG4gICAgLy8gUHJvcGVydGllcyBtdXN0IGJlIHBhc3NlZCBhcyBkb20tc3R5bGUgY2FtZWxjYXNlLCByYXRoZXIgdGhhbiBgYm94LXNpemluZ2AgaHlwZW50YXRlZCBzdHlsZS5cbiAgICAvLyBSZXR1cm4gdmFsdWVzIHdpbGwgYWxzbyBiZSB0aGUgY2FtZWxDYXNlIHZhcmlhbnQsIGlmIHlvdSBuZWVkIHRvIHRyYW5zbGF0ZSB0aGF0IHRvIGh5cGVuYXRlZCBzdHlsZSB1c2U6XG4gICAgLy9cbiAgICAvLyAgICAgc3RyLnJlcGxhY2UoLyhbQS1aXSkvZywgZnVuY3Rpb24oc3RyLG0xKXsgcmV0dXJuICctJyArIG0xLnRvTG93ZXJDYXNlKCk7IH0pLnJlcGxhY2UoL15tcy0vLCctbXMtJyk7XG5cbiAgICAvLyBJZiB5b3UncmUgdHJ5aW5nIHRvIGFzY2VydGFpbiB3aGljaCB0cmFuc2l0aW9uIGVuZCBldmVudCB0byBiaW5kIHRvLCB5b3UgbWlnaHQgZG8gc29tZXRoaW5nIGxpa2UuLi5cbiAgICAvL1xuICAgIC8vICAgICB2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xuICAgIC8vICAgICAgICdXZWJraXRUcmFuc2l0aW9uJyA6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAvLyAgICAgICAnTW96VHJhbnNpdGlvbicgICAgOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgLy8gICAgICAgJ09UcmFuc2l0aW9uJyAgICAgIDogJ29UcmFuc2l0aW9uRW5kJyxcbiAgICAvLyAgICAgICAnbXNUcmFuc2l0aW9uJyAgICAgOiAnTVNUcmFuc2l0aW9uRW5kJyxcbiAgICAvLyAgICAgICAndHJhbnNpdGlvbicgICAgICAgOiAndHJhbnNpdGlvbmVuZCdcbiAgICAvLyAgICAgfSxcbiAgICAvLyAgICAgdHJhbnNFbmRFdmVudE5hbWUgPSB0cmFuc0VuZEV2ZW50TmFtZXNbIE1vZGVybml6ci5wcmVmaXhlZCgndHJhbnNpdGlvbicpIF07XG5cbiAgICBNb2Rlcm5penIucHJlZml4ZWQgICAgICA9IGZ1bmN0aW9uKHByb3AsIG9iaiwgZWxlbSl7XG4gICAgICBpZighb2JqKSB7XG4gICAgICAgIHJldHVybiB0ZXN0UHJvcHNBbGwocHJvcCwgJ3BmeCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGVzdGluZyBET00gcHJvcGVydHkgZS5nLiBNb2Rlcm5penIucHJlZml4ZWQoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScsIHdpbmRvdykgLy8gJ21velJlcXVlc3RBbmltYXRpb25GcmFtZSdcbiAgICAgICAgcmV0dXJuIHRlc3RQcm9wc0FsbChwcm9wLCBvYmosIGVsZW0pO1xuICAgICAgfVxuICAgIH07XG4gICAgLyo+PnByZWZpeGVkKi9cblxuXG4gICAgLyo+PmNzc2NsYXNzZXMqL1xuICAgIC8vIFJlbW92ZSBcIm5vLWpzXCIgY2xhc3MgZnJvbSA8aHRtbD4gZWxlbWVudCwgaWYgaXQgZXhpc3RzOlxuICAgIGRvY0VsZW1lbnQuY2xhc3NOYW1lID0gZG9jRWxlbWVudC5jbGFzc05hbWUucmVwbGFjZSgvKF58XFxzKW5vLWpzKFxcc3wkKS8sICckMSQyJykgK1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBuZXcgY2xhc3NlcyB0byB0aGUgPGh0bWw+IGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGVuYWJsZUNsYXNzZXMgPyAnIGpzICcgKyBjbGFzc2VzLmpvaW4oJyAnKSA6ICcnKTtcbiAgICAvKj4+Y3NzY2xhc3NlcyovXG5cbiAgICByZXR1cm4gTW9kZXJuaXpyO1xuXG59KSh0aGlzLCB0aGlzLmRvY3VtZW50KTtcbiJdLCJmaWxlIjoidmVuZG9yL21vZGVybml6ci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9