! function($) {
    var e = {
        sectionContainer: "section",
        easing: "ease",
        animationTime: 1e3,
        pagination: !0,
        updateURL: !1,
        keyboard: !0,
        beforeMove: null,
        afterMove: null,
        loop: !0,
        responsiveFallback: !1,
        direction: "vertical"
    };
    $.fn.swipeEvents = function() {
        return this.each(function() {
            function e(e) {
                var r = e.originalEvent.touches;
                r && r.length && (a = r[0].pageX, n = r[0].pageY, i.bind("touchmove", t))
            }

            function t(e) {
                var r = e.originalEvent.touches;
                if (r && r.length) {
                    var o = a - r[0].pageX,
                        s = n - r[0].pageY;
                    o >= 50 && i.trigger("swipeLeft"), -50 >= o && i.trigger("swipeRight"), s >= 50 && i.trigger("swipeUp"), -50 >= s && i.trigger("swipeDown"), (Math.abs(o) >= 50 || Math.abs(s) >= 50) && i.unbind("touchmove", t)
                }
            }
            var a, n, i = $(this);
            i.bind("touchstart", e)
        })
    }, $.fn.onepage_scroll = function(t) {
        function a() {
            var e = !1,
                t = typeof i.responsiveFallback;
            "number" == t && (e = $(window).width() < i.responsiveFallback), "boolean" == t && (e = i.responsiveFallback), "function" == t && (valFunction = i.responsiveFallback(), e = valFunction, typeOFv = typeof e, "number" == typeOFv && (e = $(window).width() < valFunction)), e ? ($("body").addClass("disabled-onepage-scroll"), $(document).unbind("mousewheel DOMMouseScroll MozMousePixelScroll"), r.swipeEvents().unbind("swipeDown swipeUp")) : ($("body").hasClass("disabled-onepage-scroll") && ($("body").removeClass("disabled-onepage-scroll"), $("html, body, .wrapper").animate({
                scrollTop: 0
            }, "fast")), r.swipeEvents().bind("swipeDown", function(e) {
                $("body").hasClass("disabled-onepage-scroll") || e.preventDefault(), r.moveUp()
            }).bind("swipeUp", function(e) {
                $("body").hasClass("disabled-onepage-scroll") || e.preventDefault(), r.moveDown()
            }), $(document).bind("mousewheel DOMMouseScroll MozMousePixelScroll", function(e) {
                e.preventDefault();
                var t = e.originalEvent.wheelDelta || -e.originalEvent.detail;
                n(e, t)
            }))
        }

        function n(e, t) {
            deltaOfInterest = t;
            var a = (new Date).getTime();
            return a - lastAnimation < quietPeriod + i.animationTime ? void e.preventDefault() : (deltaOfInterest < 0 ? r.moveDown() : r.moveUp(), void(lastAnimation = a))
        }
        var i = $.extend({}, e, t),
            r = $(this),
            o = $(i.sectionContainer);
        if (total = o.length, status = "off", topPos = 0, leftPos = 0, lastAnimation = 0, quietPeriod = 500, paginationList = "", $.fn.transformPage = function(e, t, a) {
            if ($(window).trigger("beforeMove"), "function" == typeof e.beforeMove && e.beforeMove(a), $("html").hasClass("ie8"))
                if ("horizontal" == e.direction) {
                    var n = r.width() / 100 * t;
                    $(this).animate({
                        left: n + "px"
                    }, e.animationTime)
                } else {
                    var n = r.height() / 100 * t;
                    $(this).animate({
                        top: n + "px"
                    }, e.animationTime)
                } else $(this).css({
                    "-webkit-transform": "horizontal" == e.direction ? "translate3d(" + t + "%, 0, 0)" : "translate3d(0, " + t + "%, 0)",
                    "-webkit-transition": "all " + e.animationTime + "ms " + e.easing,
                    "-moz-transform": "horizontal" == e.direction ? "translate3d(" + t + "%, 0, 0)" : "translate3d(0, " + t + "%, 0)",
                    "-moz-transition": "all " + e.animationTime + "ms " + e.easing,
                    "-ms-transform": "horizontal" == e.direction ? "translate3d(" + t + "%, 0, 0)" : "translate3d(0, " + t + "%, 0)",
                    "-ms-transition": "all " + e.animationTime + "ms " + e.easing,
                    transform: "horizontal" == e.direction ? "translate3d(" + t + "%, 0, 0)" : "translate3d(0, " + t + "%, 0)",
                    transition: "all " + e.animationTime + "ms " + e.easing
                });
            $(this).one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(t) {
                $(window).trigger("afterMove"), "function" == typeof e.afterMove && e.afterMove(a)
            })
        }, $.fn.moveDown = function() {
            var e = $(this);
            if (index = $(i.sectionContainer + ".active").data("index"), current = $(i.sectionContainer + "[data-index='" + index + "']"), next = $(i.sectionContainer + "[data-index='" + (index + 1) + "']"), next.length < 1) {
                if (1 != i.loop) return;
                pos = 0, next = $(i.sectionContainer + "[data-index='1']")
            } else pos = 100 * index * -1; if ("function" == typeof i.beforeMove && i.beforeMove(next.data("index")), current.removeClass("active"), next.addClass("active"), 1 == i.pagination && ($(".onepage-pagination li a[data-index='" + index + "']").removeClass("active"), $(".onepage-pagination li a[data-index='" + next.data("index") + "']").addClass("active")), $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, ""), $("body").addClass("viewing-page-" + next.data("index")), history.replaceState && 1 == i.updateURL) {
                var t = next.attr("id"),
                    a = window.location.href.substr(0, window.location.href.indexOf("#")) + "#" + t;
                history.pushState({}, document.title, a)
            }
            e.transformPage(i, pos, next.data("index"))
        }, $.fn.moveUp = function() {
            var e = $(this);
            if (index = $(i.sectionContainer + ".active").data("index"), current = $(i.sectionContainer + "[data-index='" + index + "']"), next = $(i.sectionContainer + "[data-index='" + (index - 1) + "']"), next.length < 1) {
                if (1 != i.loop) return;
                pos = 100 * (total - 1) * -1, next = $(i.sectionContainer + "[data-index='" + total + "']")
            } else pos = 100 * (next.data("index") - 1) * -1; if ("function" == typeof i.beforeMove && i.beforeMove(next.data("index")), current.removeClass("active"), next.addClass("active"), 1 == i.pagination && ($(".onepage-pagination li a[data-index='" + index + "']").removeClass("active"), $(".onepage-pagination li a[data-index='" + next.data("index") + "']").addClass("active")), $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, ""), $("body").addClass("viewing-page-" + next.data("index")), history.replaceState && 1 == i.updateURL) {
                var t = next.attr("id");
                if (index - 1 > 1) {
                    var a = window.location.href.substr(0, window.location.href.indexOf("#")) + "#" + t;
                    history.pushState({}, document.title, a)
                } else {
                    var a = window.location.href.substr(0, window.location.href.indexOf("#"));
                    history.pushState({}, document.title, a)
                }
            }
            e.transformPage(i, pos, next.data("index"))
        }, $.fn.moveTo = function(e) {
            if ($(window).trigger("beforeMove"), current = $(i.sectionContainer + ".active"), next = $(i.sectionContainer + "[data-index='" + e + "']"), next.length > 0) {
                if ("function" == typeof i.beforeMove && i.beforeMove(next.data("index")), current.removeClass("active"), next.addClass("active"), $(".onepage-pagination li a.active").removeClass("active"), $(".onepage-pagination li a[data-index='" + e + "']").addClass("active"), $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, ""), $("body").addClass("viewing-page-" + next.data("index")), pos = 100 * (e - 1) * -1, history.replaceState && 1 == i.updateURL) {
                    var t = next.attr("id");
                    if (e - 1 > 1) {
                        var a = window.location.href.substr(0, window.location.href.indexOf("#")) + "#" + t;
                        history.pushState({}, document.title, a)
                    } else {
                        var a = window.location.href.substr(0, window.location.href.indexOf("#"));
                        history.pushState({}, document.title, a)
                    }
                }
                r.transformPage(i, pos, e), $(window).trigger("afterMove"), "function" == typeof i.afterMove && i.afterMove(index)
            }
        }, r.addClass("onepage-wrapper").css("position", "relative"), $.each(o, function(e) {
            $(this).css({
                position: "absolute",
                top: topPos + "%"
            }).addClass("section").attr("data-index", e + 1), $(this).css({
                position: "absolute",
                left: "horizontal" == i.direction ? leftPos + "%" : 0,
                top: "vertical" == i.direction || "horizontal" != i.direction ? topPos + "%" : 0
            }), "horizontal" == i.direction ? leftPos += 100 : topPos += 100, 1 == i.pagination && (paginationList += "<li><a data-index='" + (e + 1) + "' href='#" + (e + 1) + "'></a></li>")
        }), r.swipeEvents().bind("swipeDown", function(e) {
            $("body").hasClass("disabled-onepage-scroll") || e.preventDefault(), r.moveUp()
        }).bind("swipeUp", function(e) {
            $("body").hasClass("disabled-onepage-scroll") || e.preventDefault(), r.moveDown()
        }), 1 == i.pagination && ($("ul.onepage-pagination").length < 1 && $("<ul class='onepage-pagination'></ul>").prependTo("body"), "horizontal" == i.direction ? (posLeft = r.find(".onepage-pagination").width() / 2 * -1, r.find(".onepage-pagination").css("margin-left", posLeft)) : (posTop = r.find(".onepage-pagination").height() / 2 * -1, r.find(".onepage-pagination").css("margin-top", posTop)), $("ul.onepage-pagination").html(paginationList)), "" != window.location.hash && "#1" != window.location.hash)
            if (init_index = window.location.hash.replace("#", ""), parseInt(init_index) <= total && parseInt(init_index) > 0) {
                if ($(i.sectionContainer + "[data-index='" + init_index + "']").addClass("active"), $("body").addClass("viewing-page-" + init_index), 1 == i.pagination && $(".onepage-pagination li a[data-index='" + init_index + "']").addClass("active"), next = $(i.sectionContainer + "[data-index='" + init_index + "']"), next && (next.addClass("active"), 1 == i.pagination && $(".onepage-pagination li a[data-index='" + init_index + "']").addClass("active"), $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, ""), $("body").addClass("viewing-page-" + next.data("index")), history.replaceState && 1 == i.updateURL)) {
                    var s = next.attr("id");
                    if (init_index > 1) {
                        var l = window.location.href.substr(0, window.location.href.indexOf("#")) + "#" + s;
                        history.pushState({}, document.title, l)
                    } else {
                        var l = window.location.href.substr(0, window.location.href.indexOf("#"));
                        history.pushState({}, document.title, l)
                    }
                }
                pos = 100 * (init_index - 1) * -1, r.transformPage(i, pos, init_index)
            } else $(i.sectionContainer + "[data-index='1']").addClass("active"), $("body").addClass("viewing-page-1"), 1 == i.pagination && $(".onepage-pagination li a[data-index='1']").addClass("active");
            else $(i.sectionContainer + "[data-index='1']").addClass("active"), $("body").addClass("viewing-page-1"), 1 == i.pagination && $(".onepage-pagination li a[data-index='1']").addClass("active");
        return 1 == i.pagination && $(".onepage-pagination li a").click(function(e) {
            e.preventDefault();
            var t = $(this).data("index");
            r.moveTo(t)
        }), $(document).bind("mousewheel DOMMouseScroll MozMousePixelScroll", function(e) {
            e.preventDefault();
            var t = e.originalEvent.wheelDelta || -e.originalEvent.detail;
            $("body").hasClass("disabled-onepage-scroll") || n(e, t)
        }), 0 != i.responsiveFallback && ($(window).resize(function() {
            a()
        }), a()), 1 == i.keyboard && $(document).keydown(function(e) {
            var t = e.target.tagName.toLowerCase();
            if (!$("body").hasClass("disabled-onepage-scroll")) switch (e.which) {
                case 38:
                    "input" != t && "textarea" != t && r.moveUp();
                    break;
                case 40:
                    "input" != t && "textarea" != t && r.moveDown();
                    break;
                case 32:
                    "input" != t && "textarea" != t && r.moveDown();
                    break;
                case 33:
                    "input" != t && "textarea" != t && r.moveUp();
                    break;
                case 34:
                    "input" != t && "textarea" != t && r.moveDown();
                    break;
                case 36:
                    r.moveTo(1);
                    break;
                case 35:
                    r.moveTo(total);
                    break;
                default:
                    return
            }
        }), !1
    }
}(window.jQuery),
function(e) {
    function t(e) {
        var t = e.length,
            a = $.type(e);
        return "function" === a || $.isWindow(e) ? !1 : 1 === e.nodeType && t ? !0 : "array" === a || 0 === t || "number" == typeof t && t > 0 && t - 1 in e
    }
    if (!e.jQuery) {
        var $ = function(e, t) {
            return new $.fn.init(e, t)
        };
        $.isWindow = function(e) {
            return null != e && e == e.window
        }, $.type = function(e) {
            return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? n[r.call(e)] || "object" : typeof e
        }, $.isArray = Array.isArray || function(e) {
            return "array" === $.type(e)
        }, $.isPlainObject = function(e) {
            var t;
            if (!e || "object" !== $.type(e) || e.nodeType || $.isWindow(e)) return !1;
            try {
                if (e.constructor && !i.call(e, "constructor") && !i.call(e.constructor.prototype, "isPrototypeOf")) return !1
            } catch (a) {
                return !1
            }
            for (t in e);
            return void 0 === t || i.call(e, t)
        }, $.each = function(e, a, n) {
            var i, r = 0,
                o = e.length,
                s = t(e);
            if (n) {
                if (s)
                    for (; o > r && (i = a.apply(e[r], n), i !== !1); r++);
                else
                    for (r in e)
                        if (i = a.apply(e[r], n), i === !1) break
            } else if (s)
                for (; o > r && (i = a.call(e[r], r, e[r]), i !== !1); r++);
            else
                for (r in e)
                    if (i = a.call(e[r], r, e[r]), i === !1) break; return e
        }, $.data = function(e, t, n) {
            if (void 0 === n) {
                var i = e[$.expando],
                    r = i && a[i];
                if (void 0 === t) return r;
                if (r && t in r) return r[t]
            } else if (void 0 !== t) {
                var i = e[$.expando] || (e[$.expando] = ++$.uuid);
                return a[i] = a[i] || {}, a[i][t] = n, n
            }
        }, $.removeData = function(e, t) {
            var n = e[$.expando],
                i = n && a[n];
            i && $.each(t, function(e, t) {
                delete i[t]
            })
        }, $.extend = function() {
            var e, t, a, n, i, r, o = arguments[0] || {}, s = 1,
                l = arguments.length,
                u = !1;
            for ("boolean" == typeof o && (u = o, o = arguments[s] || {}, s++), "object" != typeof o && "function" !== $.type(o) && (o = {}), s === l && (o = this, s--); l > s; s++)
                if (null != (i = arguments[s]))
                    for (n in i) e = o[n], a = i[n], o !== a && (u && a && ($.isPlainObject(a) || (t = $.isArray(a))) ? (t ? (t = !1, r = e && $.isArray(e) ? e : []) : r = e && $.isPlainObject(e) ? e : {}, o[n] = $.extend(u, r, a)) : void 0 !== a && (o[n] = a));
            return o
        }, $.queue = function(e, a, n) {
            function i(e, a) {
                var n = a || [];
                return null != e && (t(Object(e)) ? ! function(e, t) {
                    for (var a = +t.length, n = 0, i = e.length; a > n;) e[i++] = t[n++];
                    if (a !== a)
                        for (; void 0 !== t[n];) e[i++] = t[n++];
                    return e.length = i, e
                }(n, "string" == typeof e ? [e] : e) : [].push.call(n, e)), n
            }
            if (e) {
                a = (a || "fx") + "queue";
                var r = $.data(e, a);
                return n ? (!r || $.isArray(n) ? r = $.data(e, a, i(n)) : r.push(n), r) : r || []
            }
        }, $.dequeue = function(e, t) {
            $.each(e.nodeType ? [e] : e, function(e, a) {
                t = t || "fx";
                var n = $.queue(a, t),
                    i = n.shift();
                "inprogress" === i && (i = n.shift()), i && ("fx" === t && n.unshift("inprogress"), i.call(a, function() {
                    $.dequeue(a, t)
                }))
            })
        }, $.fn = $.prototype = {
            init: function(e) {
                if (e.nodeType) return this[0] = e, this;
                throw new Error("Not a DOM node.")
            },
            offset: function() {
                var t = this[0].getBoundingClientRect ? this[0].getBoundingClientRect() : {
                    top: 0,
                    left: 0
                };
                return {
                    top: t.top + (e.pageYOffset || document.scrollTop || 0) - (document.clientTop || 0),
                    left: t.left + (e.pageXOffset || document.scrollLeft || 0) - (document.clientLeft || 0)
                }
            },
            position: function() {
                function e() {
                    for (var e = this.offsetParent || document; e && "html" === !e.nodeType.toLowerCase && "static" === e.style.position;) e = e.offsetParent;
                    return e || document
                }
                var t = this[0],
                    e = e.apply(t),
                    a = this.offset(),
                    n = /^(?:body|html)$/i.test(e.nodeName) ? {
                        top: 0,
                        left: 0
                    } : $(e).offset();
                return a.top -= parseFloat(t.style.marginTop) || 0, a.left -= parseFloat(t.style.marginLeft) || 0, e.style && (n.top += parseFloat(e.style.borderTopWidth) || 0, n.left += parseFloat(e.style.borderLeftWidth) || 0), {
                    top: a.top - n.top,
                    left: a.left - n.left
                }
            }
        };
        var a = {};
        $.expando = "velocity" + (new Date).getTime(), $.uuid = 0;
        for (var n = {}, i = n.hasOwnProperty, r = n.toString, o = "Boolean Number String Function Array Date RegExp Object Error".split(" "), s = 0; s < o.length; s++) n["[object " + o[s] + "]"] = o[s].toLowerCase();
        $.fn.init.prototype = $.fn, e.Velocity = {
            Utilities: $
        }
    }
}(window),
function(e) {
    "object" == typeof module && "object" == typeof module.exports ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : e()
}(function() {
    return function(e, t, a, n) {
        function i(e) {
            for (var t = -1, a = e ? e.length : 0, n = []; ++t < a;) {
                var i = e[t];
                i && n.push(i)
            }
            return n
        }

        function r(e) {
            return g.isWrapped(e) ? e = [].slice.call(e) : g.isNode(e) && (e = [e]), e
        }

        function o(e) {
            var t = $.data(e, "velocity");
            return null === t ? n : t
        }

        function s(e) {
            return function(t) {
                return Math.round(t * e) * (1 / e)
            }
        }

        function l(e, a, n, i) {
            function r(e, t) {
                return 1 - 3 * t + 3 * e
            }

            function o(e, t) {
                return 3 * t - 6 * e
            }

            function s(e) {
                return 3 * e
            }

            function l(e, t, a) {
                return ((r(t, a) * e + o(t, a)) * e + s(t)) * e
            }

            function u(e, t, a) {
                return 3 * r(t, a) * e * e + 2 * o(t, a) * e + s(t)
            }

            function c(t, a) {
                for (var i = 0; m > i; ++i) {
                    var r = u(a, e, n);
                    if (0 === r) return a;
                    var o = l(a, e, n) - t;
                    a -= o / r
                }
                return a
            }

            function d() {
                for (var t = 0; b > t; ++t) C[t] = l(t * x, e, n)
            }

            function p(t, a, i) {
                var r, o, s = 0;
                do o = a + (i - a) / 2, r = l(o, e, n) - t, r > 0 ? i = o : a = o; while (Math.abs(r) > h && ++s < y);
                return o
            }

            function f(t) {
                for (var a = 0, i = 1, r = b - 1; i != r && C[i] <= t; ++i) a += x;
                --i;
                var o = (t - C[i]) / (C[i + 1] - C[i]),
                    s = a + o * x,
                    l = u(s, e, n);
                return l >= v ? c(t, s) : 0 == l ? s : p(t, a, a + x)
            }

            function g() {
                P = !0, (e != a || n != i) && d()
            }
            var m = 4,
                v = .001,
                h = 1e-7,
                y = 10,
                b = 11,
                x = 1 / (b - 1),
                w = "Float32Array" in t;
            if (4 !== arguments.length) return !1;
            for (var S = 0; 4 > S; ++S)
                if ("number" != typeof arguments[S] || isNaN(arguments[S]) || !isFinite(arguments[S])) return !1;
            e = Math.min(e, 1), n = Math.min(n, 1), e = Math.max(e, 0), n = Math.max(n, 0);
            var C = w ? new Float32Array(b) : new Array(b),
                P = !1,
                V = function(t) {
                    return P || g(), e === a && n === i ? t : 0 === t ? 0 : 1 === t ? 1 : l(f(t), a, i)
                };
            V.getControlPoints = function() {
                return [{
                    x: e,
                    y: a
                }, {
                    x: n,
                    y: i
                }]
            };
            var T = "generateBezier(" + [e, a, n, i] + ")";
            return V.toString = function() {
                return T
            }, V
        }

        function u(e, t) {
            var a = e;
            return g.isString(e) ? y.Easings[e] || (a = !1) : a = g.isArray(e) && 1 === e.length ? s.apply(null, e) : g.isArray(e) && 2 === e.length ? b.apply(null, e.concat([t])) : g.isArray(e) && 4 === e.length ? l.apply(null, e) : !1, a === !1 && (a = y.Easings[y.defaults.easing] ? y.defaults.easing : h), a
        }

        function c(e) {
            if (e) {
                var t = (new Date).getTime(),
                    a = y.State.calls.length;
                a > 1e4 && (y.State.calls = i(y.State.calls));
                for (var r = 0; a > r; r++)
                    if (y.State.calls[r]) {
                        var s = y.State.calls[r],
                            l = s[0],
                            u = s[2],
                            p = s[3],
                            f = !! p,
                            m = null;
                        p || (p = y.State.calls[r][3] = t - 16);
                        for (var v = Math.min((t - p) / u.duration, 1), h = 0, b = l.length; b > h; h++) {
                            var w = l[h],
                                C = w.element;
                            if (o(C)) {
                                var P = !1;
                                if (u.display !== n && null !== u.display && "none" !== u.display) {
                                    if ("flex" === u.display) {
                                        var V = ["-webkit-box", "-moz-box", "-ms-flexbox", "-webkit-flex"];
                                        $.each(V, function(e, t) {
                                            x.setPropertyValue(C, "display", t)
                                        })
                                    }
                                    x.setPropertyValue(C, "display", u.display)
                                }
                                u.visibility !== n && "hidden" !== u.visibility && x.setPropertyValue(C, "visibility", u.visibility);
                                for (var T in w)
                                    if ("element" !== T) {
                                        var k = w[T],
                                            F, A = g.isString(k.easing) ? y.Easings[k.easing] : k.easing;
                                        if (1 === v) F = k.endValue;
                                        else {
                                            var E = k.endValue - k.startValue;
                                            if (F = k.startValue + E * A(v, u, E), !f && F === k.currentValue) continue
                                        } if (k.currentValue = F, "tween" === T) m = F;
                                        else {
                                            if (x.Hooks.registered[T]) {
                                                var M = x.Hooks.getRoot(T),
                                                    L = o(C).rootPropertyValueCache[M];
                                                L && (k.rootPropertyValue = L)
                                            }
                                            var N = x.setPropertyValue(C, T, k.currentValue + (0 === parseFloat(F) ? "" : k.unitType), k.rootPropertyValue, k.scrollData);
                                            x.Hooks.registered[T] && (x.Normalizations.registered[M] ? o(C).rootPropertyValueCache[M] = x.Normalizations.registered[M]("extract", null, N[1]) : o(C).rootPropertyValueCache[M] = N[1]), "transform" === N[0] && (P = !0)
                                        }
                                    }
                                u.mobileHA && o(C).transformCache.translate3d === n && (o(C).transformCache.translate3d = "(0px, 0px, 0px)", P = !0), P && x.flushTransformCache(C)
                            }
                        }
                        u.display !== n && "none" !== u.display && (y.State.calls[r][2].display = !1), u.visibility !== n && "hidden" !== u.visibility && (y.State.calls[r][2].visibility = !1), u.progress && u.progress.call(s[1], s[1], v, Math.max(0, p + u.duration - t), p, m), 1 === v && d(r)
                    }
            }
            y.State.isTicking && S(c)
        }

        function d(e, t) {
            if (!y.State.calls[e]) return !1;
            for (var a = y.State.calls[e][0], i = y.State.calls[e][1], r = y.State.calls[e][2], s = y.State.calls[e][4], l = !1, u = 0, c = a.length; c > u; u++) {
                var d = a[u].element;
                if (t || r.loop || ("none" === r.display && x.setPropertyValue(d, "display", r.display), "hidden" === r.visibility && x.setPropertyValue(d, "visibility", r.visibility)), r.loop !== !0 && ($.queue(d)[1] === n || !/\.velocityQueueEntryFlag/i.test($.queue(d)[1])) && o(d)) {
                    o(d).isAnimating = !1, o(d).rootPropertyValueCache = {};
                    var p = !1;
                    $.each(x.Lists.transforms3D, function(e, t) {
                        var a = /^scale/.test(t) ? 1 : 0,
                            i = o(d).transformCache[t];
                        o(d).transformCache[t] !== n && new RegExp("^\\(" + a + "[^.]").test(i) && (p = !0, delete o(d).transformCache[t])
                    }), r.mobileHA && (p = !0, delete o(d).transformCache.translate3d), p && x.flushTransformCache(d), x.Values.removeClass(d, "velocity-animating")
                }
                if (!t && r.complete && !r.loop && u === c - 1) try {
                    r.complete.call(i, i)
                } catch (f) {
                    setTimeout(function() {
                        throw f
                    }, 1)
                }
                s && r.loop !== !0 && s(i), o(d) && r.loop === !0 && !t && ($.each(o(d).tweensContainer, function(e, t) {
                    /^rotate/.test(e) && 360 === parseFloat(t.endValue) && (t.endValue = 0, t.startValue = 360), /^backgroundPosition/.test(e) && 100 === parseFloat(t.endValue) && "%" === t.unitType && (t.endValue = 0, t.startValue = 100)
                }), y(d, "reverse", {
                    loop: !0,
                    delay: r.delay
                })), r.queue !== !1 && $.dequeue(d, r.queue)
            }
            y.State.calls[e] = !1;
            for (var g = 0, m = y.State.calls.length; m > g; g++)
                if (y.State.calls[g] !== !1) {
                    l = !0;
                    break
                }
            l === !1 && (y.State.isTicking = !1, delete y.State.calls, y.State.calls = [])
        }
        var p = function() {
            if (a.documentMode) return a.documentMode;
            for (var e = 7; e > 4; e--) {
                var t = a.createElement("div");
                if (t.innerHTML = "<!--[if IE " + e + "]><span></span><![endif]-->", t.getElementsByTagName("span").length) return t = null, e
            }
            return n
        }(),
            f = function() {
                var e = 0;
                return t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || function(t) {
                    var a = (new Date).getTime(),
                        n;
                    return n = Math.max(0, 16 - (a - e)), e = a + n, setTimeout(function() {
                        t(a + n)
                    }, n)
                }
            }(),
            g = {
                isString: function(e) {
                    return "string" == typeof e
                },
                isArray: Array.isArray || function(e) {
                    return "[object Array]" === Object.prototype.toString.call(e)
                },
                isFunction: function(e) {
                    return "[object Function]" === Object.prototype.toString.call(e)
                },
                isNode: function(e) {
                    return e && e.nodeType
                },
                isNodeList: function(e) {
                    return "object" == typeof e && /^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(e)) && e.length !== n && (0 === e.length || "object" == typeof e[0] && e[0].nodeType > 0)
                },
                isWrapped: function(e) {
                    return e && (e.jquery || t.Zepto && t.Zepto.zepto.isZ(e))
                },
                isSVG: function(e) {
                    return t.SVGElement && e instanceof t.SVGElement
                },
                isEmptyObject: function(e) {
                    for (var t in e) return !1;
                    return !0
                }
            }, $, m = !1;
        if (e.fn && e.fn.jquery ? ($ = e, m = !0) : $ = t.Velocity.Utilities, 8 >= p && !m) throw new Error("Velocity: IE8 and below require jQuery to be loaded before Velocity.");
        if (7 >= p) return void(jQuery.fn.velocity = jQuery.fn.animate);
        var v = 400,
            h = "swing",
            y = {
                State: {
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                    isAndroid: /Android/i.test(navigator.userAgent),
                    isGingerbread: /Android 2\.3\.[3-7]/i.test(navigator.userAgent),
                    isChrome: t.chrome,
                    isFirefox: /Firefox/i.test(navigator.userAgent),
                    prefixElement: a.createElement("div"),
                    prefixMatches: {},
                    scrollAnchor: null,
                    scrollPropertyLeft: null,
                    scrollPropertyTop: null,
                    isTicking: !1,
                    calls: []
                },
                CSS: {},
                Utilities: $,
                Redirects: {},
                Easings: {},
                Promise: t.Promise,
                defaults: {
                    queue: "",
                    duration: v,
                    easing: h,
                    begin: n,
                    complete: n,
                    progress: n,
                    display: n,
                    visibility: n,
                    loop: !1,
                    delay: !1,
                    mobileHA: !0,
                    _cacheValues: !0
                },
                init: function(e) {
                    $.data(e, "velocity", {
                        isSVG: g.isSVG(e),
                        isAnimating: !1,
                        computedStyle: null,
                        tweensContainer: null,
                        rootPropertyValueCache: {},
                        transformCache: {}
                    })
                },
                hook: null,
                mock: !1,
                version: {
                    major: 1,
                    minor: 2,
                    patch: 2
                },
                debug: !1
            };
        t.pageYOffset !== n ? (y.State.scrollAnchor = t, y.State.scrollPropertyLeft = "pageXOffset", y.State.scrollPropertyTop = "pageYOffset") : (y.State.scrollAnchor = a.documentElement || a.body.parentNode || a.body, y.State.scrollPropertyLeft = "scrollLeft", y.State.scrollPropertyTop = "scrollTop");
        var b = function() {
            function e(e) {
                return -e.tension * e.x - e.friction * e.v
            }

            function t(t, a, n) {
                var i = {
                    x: t.x + n.dx * a,
                    v: t.v + n.dv * a,
                    tension: t.tension,
                    friction: t.friction
                };
                return {
                    dx: i.v,
                    dv: e(i)
                }
            }

            function a(a, n) {
                var i = {
                    dx: a.v,
                    dv: e(a)
                }, r = t(a, .5 * n, i),
                    o = t(a, .5 * n, r),
                    s = t(a, n, o),
                    l = 1 / 6 * (i.dx + 2 * (r.dx + o.dx) + s.dx),
                    u = 1 / 6 * (i.dv + 2 * (r.dv + o.dv) + s.dv);
                return a.x = a.x + l * n, a.v = a.v + u * n, a
            }
            return function n(e, t, i) {
                var r = {
                    x: -1,
                    v: 0,
                    tension: null,
                    friction: null
                }, o = [0],
                    s = 0,
                    l = 1e-4,
                    u = .016,
                    c, d, p;
                for (e = parseFloat(e) || 500, t = parseFloat(t) || 20, i = i || null, r.tension = e, r.friction = t, c = null !== i, c ? (s = n(e, t), d = s / i * u) : d = u;;)
                    if (p = a(p || r, d), o.push(1 + p.x), s += 16, !(Math.abs(p.x) > l && Math.abs(p.v) > l)) break;
                return c ? function(e) {
                    return o[e * (o.length - 1) | 0]
                } : s
            }
        }();
        y.Easings = {
            linear: function(e) {
                return e
            },
            swing: function(e) {
                return .5 - Math.cos(e * Math.PI) / 2
            },
            spring: function(e) {
                return 1 - Math.cos(4.5 * e * Math.PI) * Math.exp(6 * -e)
            }
        }, $.each([
            ["ease", [.25, .1, .25, 1]],
            ["ease-in", [.42, 0, 1, 1]],
            ["ease-out", [0, 0, .58, 1]],
            ["ease-in-out", [.42, 0, .58, 1]],
            ["easeInSine", [.47, 0, .745, .715]],
            ["easeOutSine", [.39, .575, .565, 1]],
            ["easeInOutSine", [.445, .05, .55, .95]],
            ["easeInQuad", [.55, .085, .68, .53]],
            ["easeOutQuad", [.25, .46, .45, .94]],
            ["easeInOutQuad", [.455, .03, .515, .955]],
            ["easeInCubic", [.55, .055, .675, .19]],
            ["easeOutCubic", [.215, .61, .355, 1]],
            ["easeInOutCubic", [.645, .045, .355, 1]],
            ["easeInQuart", [.895, .03, .685, .22]],
            ["easeOutQuart", [.165, .84, .44, 1]],
            ["easeInOutQuart", [.77, 0, .175, 1]],
            ["easeInQuint", [.755, .05, .855, .06]],
            ["easeOutQuint", [.23, 1, .32, 1]],
            ["easeInOutQuint", [.86, 0, .07, 1]],
            ["easeInExpo", [.95, .05, .795, .035]],
            ["easeOutExpo", [.19, 1, .22, 1]],
            ["easeInOutExpo", [1, 0, 0, 1]],
            ["easeInCirc", [.6, .04, .98, .335]],
            ["easeOutCirc", [.075, .82, .165, 1]],
            ["easeInOutCirc", [.785, .135, .15, .86]]
        ], function(e, t) {
            y.Easings[t[0]] = l.apply(null, t[1])
        });
        var x = y.CSS = {
            RegEx: {
                isHex: /^#([A-f\d]{3}){1,2}$/i,
                valueUnwrap: /^[A-z]+\((.*)\)$/i,
                wrappedValueAlreadyExtracted: /[0-9.]+ [0-9.]+ [0-9.]+( [0-9.]+)?/,
                valueSplit: /([A-z]+\(.+\))|(([A-z0-9#-.]+?)(?=\s|$))/gi
            },
            Lists: {
                colors: ["fill", "stroke", "stopColor", "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor"],
                transformsBase: ["translateX", "translateY", "scale", "scaleX", "scaleY", "skewX", "skewY", "rotateZ"],
                transforms3D: ["transformPerspective", "translateZ", "scaleZ", "rotateX", "rotateY"]
            },
            Hooks: {
                templates: {
                    textShadow: ["Color X Y Blur", "black 0px 0px 0px"],
                    boxShadow: ["Color X Y Blur Spread", "black 0px 0px 0px 0px"],
                    clip: ["Top Right Bottom Left", "0px 0px 0px 0px"],
                    backgroundPosition: ["X Y", "0% 0%"],
                    transformOrigin: ["X Y Z", "50% 50% 0px"],
                    perspectiveOrigin: ["X Y", "50% 50%"]
                },
                registered: {},
                register: function() {
                    for (var e = 0; e < x.Lists.colors.length; e++) {
                        var t = "color" === x.Lists.colors[e] ? "0 0 0 1" : "255 255 255 1";
                        x.Hooks.templates[x.Lists.colors[e]] = ["Red Green Blue Alpha", t]
                    }
                    var a, n, i;
                    if (p)
                        for (a in x.Hooks.templates) {
                            n = x.Hooks.templates[a], i = n[0].split(" ");
                            var r = n[1].match(x.RegEx.valueSplit);
                            "Color" === i[0] && (i.push(i.shift()), r.push(r.shift()), x.Hooks.templates[a] = [i.join(" "), r.join(" ")])
                        }
                    for (a in x.Hooks.templates) {
                        n = x.Hooks.templates[a], i = n[0].split(" ");
                        for (var e in i) {
                            var o = a + i[e],
                                s = e;
                            x.Hooks.registered[o] = [a, s]
                        }
                    }
                },
                getRoot: function(e) {
                    var t = x.Hooks.registered[e];
                    return t ? t[0] : e
                },
                cleanRootPropertyValue: function(e, t) {
                    return x.RegEx.valueUnwrap.test(t) && (t = t.match(x.RegEx.valueUnwrap)[1]), x.Values.isCSSNullValue(t) && (t = x.Hooks.templates[e][1]), t
                },
                extractValue: function(e, t) {
                    var a = x.Hooks.registered[e];
                    if (a) {
                        var n = a[0],
                            i = a[1];
                        return t = x.Hooks.cleanRootPropertyValue(n, t), t.toString().match(x.RegEx.valueSplit)[i]
                    }
                    return t
                },
                injectValue: function(e, t, a) {
                    var n = x.Hooks.registered[e];
                    if (n) {
                        var i = n[0],
                            r = n[1],
                            o, s;
                        return a = x.Hooks.cleanRootPropertyValue(i, a), o = a.toString().match(x.RegEx.valueSplit), o[r] = t, s = o.join(" ")
                    }
                    return a
                }
            },
            Normalizations: {
                registered: {
                    clip: function(e, t, a) {
                        switch (e) {
                            case "name":
                                return "clip";
                            case "extract":
                                var n;
                                return x.RegEx.wrappedValueAlreadyExtracted.test(a) ? n = a : (n = a.toString().match(x.RegEx.valueUnwrap), n = n ? n[1].replace(/,(\s+)?/g, " ") : a), n;
                            case "inject":
                                return "rect(" + a + ")"
                        }
                    },
                    blur: function(e, t, a) {
                        switch (e) {
                            case "name":
                                return y.State.isFirefox ? "filter" : "-webkit-filter";
                            case "extract":
                                var n = parseFloat(a);
                                if (!n && 0 !== n) {
                                    var i = a.toString().match(/blur\(([0-9]+[A-z]+)\)/i);
                                    n = i ? i[1] : 0
                                }
                                return n;
                            case "inject":
                                return parseFloat(a) ? "blur(" + a + ")" : "none"
                        }
                    },
                    opacity: function(e, t, a) {
                        if (8 >= p) switch (e) {
                            case "name":
                                return "filter";
                            case "extract":
                                var n = a.toString().match(/alpha\(opacity=(.*)\)/i);
                                return a = n ? n[1] / 100 : 1;
                            case "inject":
                                return t.style.zoom = 1, parseFloat(a) >= 1 ? "" : "alpha(opacity=" + parseInt(100 * parseFloat(a), 10) + ")"
                        } else switch (e) {
                            case "name":
                                return "opacity";
                            case "extract":
                                return a;
                            case "inject":
                                return a
                        }
                    }
                },
                register: function() {
                    9 >= p || y.State.isGingerbread || (x.Lists.transformsBase = x.Lists.transformsBase.concat(x.Lists.transforms3D));
                    for (var e = 0; e < x.Lists.transformsBase.length; e++)! function() {
                        var t = x.Lists.transformsBase[e];
                        x.Normalizations.registered[t] = function(e, a, i) {
                            switch (e) {
                                case "name":
                                    return "transform";
                                case "extract":
                                    return o(a) === n || o(a).transformCache[t] === n ? /^scale/i.test(t) ? 1 : 0 : o(a).transformCache[t].replace(/[()]/g, "");
                                case "inject":
                                    var r = !1;
                                    switch (t.substr(0, t.length - 1)) {
                                        case "translate":
                                            r = !/(%|px|em|rem|vw|vh|\d)$/i.test(i);
                                            break;
                                        case "scal":
                                        case "scale":
                                            y.State.isAndroid && o(a).transformCache[t] === n && 1 > i && (i = 1), r = !/(\d)$/i.test(i);
                                            break;
                                        case "skew":
                                            r = !/(deg|\d)$/i.test(i);
                                            break;
                                        case "rotate":
                                            r = !/(deg|\d)$/i.test(i)
                                    }
                                    return r || (o(a).transformCache[t] = "(" + i + ")"), o(a).transformCache[t]
                            }
                        }
                    }();
                    for (var e = 0; e < x.Lists.colors.length; e++)! function() {
                        var t = x.Lists.colors[e];
                        x.Normalizations.registered[t] = function(e, a, i) {
                            switch (e) {
                                case "name":
                                    return t;
                                case "extract":
                                    var r;
                                    if (x.RegEx.wrappedValueAlreadyExtracted.test(i)) r = i;
                                    else {
                                        var o, s = {
                                                black: "rgb(0, 0, 0)",
                                                blue: "rgb(0, 0, 255)",
                                                gray: "rgb(128, 128, 128)",
                                                green: "rgb(0, 128, 0)",
                                                red: "rgb(255, 0, 0)",
                                                white: "rgb(255, 255, 255)"
                                            };
                                        /^[A-z]+$/i.test(i) ? o = s[i] !== n ? s[i] : s.black : x.RegEx.isHex.test(i) ? o = "rgb(" + x.Values.hexToRgb(i).join(" ") + ")" : /^rgba?\(/i.test(i) || (o = s.black), r = (o || i).toString().match(x.RegEx.valueUnwrap)[1].replace(/,(\s+)?/g, " ")
                                    }
                                    return 8 >= p || 3 !== r.split(" ").length || (r += " 1"), r;
                                case "inject":
                                    return 8 >= p ? 4 === i.split(" ").length && (i = i.split(/\s+/).slice(0, 3).join(" ")) : 3 === i.split(" ").length && (i += " 1"), (8 >= p ? "rgb" : "rgba") + "(" + i.replace(/\s+/g, ",").replace(/\.(\d)+(?=,)/g, "") + ")"
                            }
                        }
                    }()
                }
            },
            Names: {
                camelCase: function(e) {
                    return e.replace(/-(\w)/g, function(e, t) {
                        return t.toUpperCase()
                    })
                },
                SVGAttribute: function(e) {
                    var t = "width|height|x|y|cx|cy|r|rx|ry|x1|x2|y1|y2";
                    return (p || y.State.isAndroid && !y.State.isChrome) && (t += "|transform"), new RegExp("^(" + t + ")$", "i").test(e)
                },
                prefixCheck: function(e) {
                    if (y.State.prefixMatches[e]) return [y.State.prefixMatches[e], !0];
                    for (var t = ["", "Webkit", "Moz", "ms", "O"], a = 0, n = t.length; n > a; a++) {
                        var i;
                        if (i = 0 === a ? e : t[a] + e.replace(/^\w/, function(e) {
                            return e.toUpperCase()
                        }), g.isString(y.State.prefixElement.style[i])) return y.State.prefixMatches[e] = i, [i, !0]
                    }
                    return [e, !1]
                }
            },
            Values: {
                hexToRgb: function(e) {
                    var t = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
                        a = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
                        n;
                    return e = e.replace(t, function(e, t, a, n) {
                        return t + t + a + a + n + n
                    }), n = a.exec(e), n ? [parseInt(n[1], 16), parseInt(n[2], 16), parseInt(n[3], 16)] : [0, 0, 0]
                },
                isCSSNullValue: function(e) {
                    return 0 == e || /^(none|auto|transparent|(rgba\(0, ?0, ?0, ?0\)))$/i.test(e)
                },
                getUnitType: function(e) {
                    return /^(rotate|skew)/i.test(e) ? "deg" : /(^(scale|scaleX|scaleY|scaleZ|alpha|flexGrow|flexHeight|zIndex|fontWeight)$)|((opacity|red|green|blue|alpha)$)/i.test(e) ? "" : "px"
                },
                getDisplayType: function(e) {
                    var t = e && e.tagName.toString().toLowerCase();
                    return /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i.test(t) ? "inline" : /^(li)$/i.test(t) ? "list-item" : /^(tr)$/i.test(t) ? "table-row" : /^(table)$/i.test(t) ? "table" : /^(tbody)$/i.test(t) ? "table-row-group" : "block"
                },
                addClass: function(e, t) {
                    e.classList ? e.classList.add(t) : e.className += (e.className.length ? " " : "") + t
                },
                removeClass: function(e, t) {
                    e.classList ? e.classList.remove(t) : e.className = e.className.toString().replace(new RegExp("(^|\\s)" + t.split(" ").join("|") + "(\\s|$)", "gi"), " ")
                }
            },
            getPropertyValue: function(e, a, i, r) {
                function s(e, a) {
                    function i() {
                        u && x.setPropertyValue(e, "display", "none")
                    }
                    var l = 0;
                    if (8 >= p) l = $.css(e, a);
                    else {
                        var u = !1;
                        if (/^(width|height)$/.test(a) && 0 === x.getPropertyValue(e, "display") && (u = !0, x.setPropertyValue(e, "display", x.Values.getDisplayType(e))), !r) {
                            if ("height" === a && "border-box" !== x.getPropertyValue(e, "boxSizing").toString().toLowerCase()) {
                                var c = e.offsetHeight - (parseFloat(x.getPropertyValue(e, "borderTopWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "borderBottomWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingTop")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingBottom")) || 0);
                                return i(), c
                            }
                            if ("width" === a && "border-box" !== x.getPropertyValue(e, "boxSizing").toString().toLowerCase()) {
                                var d = e.offsetWidth - (parseFloat(x.getPropertyValue(e, "borderLeftWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "borderRightWidth")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingLeft")) || 0) - (parseFloat(x.getPropertyValue(e, "paddingRight")) || 0);
                                return i(), d
                            }
                        }
                        var f;
                        f = o(e) === n ? t.getComputedStyle(e, null) : o(e).computedStyle ? o(e).computedStyle : o(e).computedStyle = t.getComputedStyle(e, null), "borderColor" === a && (a = "borderTopColor"), l = 9 === p && "filter" === a ? f.getPropertyValue(a) : f[a], ("" === l || null === l) && (l = e.style[a]), i()
                    } if ("auto" === l && /^(top|right|bottom|left)$/i.test(a)) {
                        var g = s(e, "position");
                        ("fixed" === g || "absolute" === g && /top|left/i.test(a)) && (l = $(e).position()[a] + "px")
                    }
                    return l
                }
                var l;
                if (x.Hooks.registered[a]) {
                    var u = a,
                        c = x.Hooks.getRoot(u);
                    i === n && (i = x.getPropertyValue(e, x.Names.prefixCheck(c)[0])), x.Normalizations.registered[c] && (i = x.Normalizations.registered[c]("extract", e, i)), l = x.Hooks.extractValue(u, i)
                } else if (x.Normalizations.registered[a]) {
                    var d, f;
                    d = x.Normalizations.registered[a]("name", e), "transform" !== d && (f = s(e, x.Names.prefixCheck(d)[0]), x.Values.isCSSNullValue(f) && x.Hooks.templates[a] && (f = x.Hooks.templates[a][1])), l = x.Normalizations.registered[a]("extract", e, f)
                }
                if (!/^[\d-]/.test(l))
                    if (o(e) && o(e).isSVG && x.Names.SVGAttribute(a))
                        if (/^(height|width)$/i.test(a)) try {
                            l = e.getBBox()[a]
                        } catch (g) {
                            l = 0
                        } else l = e.getAttribute(a);
                        else l = s(e, x.Names.prefixCheck(a)[0]);
                return x.Values.isCSSNullValue(l) && (l = 0), y.debug >= 2 && console.log("Get " + a + ": " + l), l
            },
            setPropertyValue: function(e, a, n, i, r) {
                var s = a;
                if ("scroll" === a) r.container ? r.container["scroll" + r.direction] = n : "Left" === r.direction ? t.scrollTo(n, r.alternateValue) : t.scrollTo(r.alternateValue, n);
                else if (x.Normalizations.registered[a] && "transform" === x.Normalizations.registered[a]("name", e)) x.Normalizations.registered[a]("inject", e, n), s = "transform", n = o(e).transformCache[a];
                else {
                    if (x.Hooks.registered[a]) {
                        var l = a,
                            u = x.Hooks.getRoot(a);
                        i = i || x.getPropertyValue(e, u), n = x.Hooks.injectValue(l, n, i), a = u
                    }
                    if (x.Normalizations.registered[a] && (n = x.Normalizations.registered[a]("inject", e, n), a = x.Normalizations.registered[a]("name", e)), s = x.Names.prefixCheck(a)[0], 8 >= p) try {
                        e.style[s] = n
                    } catch (c) {
                        y.debug && console.log("Browser does not support [" + n + "] for [" + s + "]")
                    } else o(e) && o(e).isSVG && x.Names.SVGAttribute(a) ? e.setAttribute(a, n) : e.style[s] = n;
                    y.debug >= 2 && console.log("Set " + a + " (" + s + "): " + n)
                }
                return [s, n]
            },
            flushTransformCache: function(e) {
                function t(t) {
                    return parseFloat(x.getPropertyValue(e, t))
                }
                var a = "";
                if ((p || y.State.isAndroid && !y.State.isChrome) && o(e).isSVG) {
                    var n = {
                        translate: [t("translateX"), t("translateY")],
                        skewX: [t("skewX")],
                        skewY: [t("skewY")],
                        scale: 1 !== t("scale") ? [t("scale"), t("scale")] : [t("scaleX"), t("scaleY")],
                        rotate: [t("rotateZ"), 0, 0]
                    };
                    $.each(o(e).transformCache, function(e) {
                        /^translate/i.test(e) ? e = "translate" : /^scale/i.test(e) ? e = "scale" : /^rotate/i.test(e) && (e = "rotate"), n[e] && (a += e + "(" + n[e].join(" ") + ") ", delete n[e])
                    })
                } else {
                    var i, r;
                    $.each(o(e).transformCache, function(t) {
                        return i = o(e).transformCache[t], "transformPerspective" === t ? (r = i, !0) : (9 === p && "rotateZ" === t && (t = "rotate"), void(a += t + i + " "))
                    }), r && (a = "perspective" + r + " " + a)
                }
                x.setPropertyValue(e, "transform", a)
            }
        };
        x.Hooks.register(), x.Normalizations.register(), y.hook = function(e, t, a) {
            var i = n;
            return e = r(e), $.each(e, function(e, r) {
                if (o(r) === n && y.init(r), a === n) i === n && (i = y.CSS.getPropertyValue(r, t));
                else {
                    var s = y.CSS.setPropertyValue(r, t, a);
                    "transform" === s[0] && y.CSS.flushTransformCache(r), i = s
                }
            }), i
        };
        var w = function() {
            function e() {
                return l ? T.promise || null : p
            }

            function i() {
                function e(e) {
                    function d(e, t) {
                        var a = n,
                            o = n,
                            s = n;
                        return g.isArray(e) ? (a = e[0], !g.isArray(e[1]) && /^[\d-]/.test(e[1]) || g.isFunction(e[1]) || x.RegEx.isHex.test(e[1]) ? s = e[1] : (g.isString(e[1]) && !x.RegEx.isHex.test(e[1]) || g.isArray(e[1])) && (o = t ? e[1] : u(e[1], r.duration), e[2] !== n && (s = e[2]))) : a = e, t || (o = o || r.easing), g.isFunction(a) && (a = a.call(i, C, S)), g.isFunction(s) && (s = s.call(i, C, S)), [a || 0, o, s]
                    }

                    function p(e, t) {
                        var a, n;
                        return n = (t || "0").toString().toLowerCase().replace(/[%A-z]+$/, function(e) {
                            return a = e, ""
                        }), a || (a = x.Values.getUnitType(e)), [n, a]
                    }

                    function f() {
                        var e = {
                            myParent: i.parentNode || a.body,
                            position: x.getPropertyValue(i, "position"),
                            fontSize: x.getPropertyValue(i, "fontSize")
                        }, n = e.position === N.lastPosition && e.myParent === N.lastParent,
                            r = e.fontSize === N.lastFontSize;
                        N.lastParent = e.myParent, N.lastPosition = e.position, N.lastFontSize = e.fontSize;
                        var s = 100,
                            l = {};
                        if (r && n) l.emToPx = N.lastEmToPx, l.percentToPxWidth = N.lastPercentToPxWidth, l.percentToPxHeight = N.lastPercentToPxHeight;
                        else {
                            var u = o(i).isSVG ? a.createElementNS("http://www.w3.org/2000/svg", "rect") : a.createElement("div");
                            y.init(u), e.myParent.appendChild(u), $.each(["overflow", "overflowX", "overflowY"], function(e, t) {
                                y.CSS.setPropertyValue(u, t, "hidden")
                            }), y.CSS.setPropertyValue(u, "position", e.position), y.CSS.setPropertyValue(u, "fontSize", e.fontSize), y.CSS.setPropertyValue(u, "boxSizing", "content-box"), $.each(["minWidth", "maxWidth", "width", "minHeight", "maxHeight", "height"], function(e, t) {
                                y.CSS.setPropertyValue(u, t, s + "%")
                            }), y.CSS.setPropertyValue(u, "paddingLeft", s + "em"), l.percentToPxWidth = N.lastPercentToPxWidth = (parseFloat(x.getPropertyValue(u, "width", null, !0)) || 1) / s, l.percentToPxHeight = N.lastPercentToPxHeight = (parseFloat(x.getPropertyValue(u, "height", null, !0)) || 1) / s, l.emToPx = N.lastEmToPx = (parseFloat(x.getPropertyValue(u, "paddingLeft")) || 1) / s, e.myParent.removeChild(u)
                        }
                        return null === N.remToPx && (N.remToPx = parseFloat(x.getPropertyValue(a.body, "fontSize")) || 16), null === N.vwToPx && (N.vwToPx = parseFloat(t.innerWidth) / 100, N.vhToPx = parseFloat(t.innerHeight) / 100), l.remToPx = N.remToPx, l.vwToPx = N.vwToPx, l.vhToPx = N.vhToPx, y.debug >= 1 && console.log("Unit ratios: " + JSON.stringify(l), i), l
                    }
                    if (r.begin && 0 === C) try {
                        r.begin.call(m, m)
                    } catch (v) {
                        setTimeout(function() {
                            throw v
                        }, 1)
                    }
                    if ("scroll" === k) {
                        var w = /^x$/i.test(r.axis) ? "Left" : "Top",
                            P = parseFloat(r.offset) || 0,
                            V, F, A;
                        r.container ? g.isWrapped(r.container) || g.isNode(r.container) ? (r.container = r.container[0] || r.container, V = r.container["scroll" + w], A = V + $(i).position()[w.toLowerCase()] + P) : r.container = null : (V = y.State.scrollAnchor[y.State["scrollProperty" + w]], F = y.State.scrollAnchor[y.State["scrollProperty" + ("Left" === w ? "Top" : "Left")]], A = $(i).offset()[w.toLowerCase()] + P), s = {
                            scroll: {
                                rootPropertyValue: !1,
                                startValue: V,
                                currentValue: V,
                                endValue: A,
                                unitType: "",
                                easing: r.easing,
                                scrollData: {
                                    container: r.container,
                                    direction: w,
                                    alternateValue: F
                                }
                            },
                            element: i
                        }, y.debug && console.log("tweensContainer (scroll): ", s.scroll, i)
                    } else if ("reverse" === k) {
                        if (!o(i).tweensContainer) return void $.dequeue(i, r.queue);
                        "none" === o(i).opts.display && (o(i).opts.display = "auto"), "hidden" === o(i).opts.visibility && (o(i).opts.visibility = "visible"), o(i).opts.loop = !1, o(i).opts.begin = null, o(i).opts.complete = null, b.easing || delete r.easing, b.duration || delete r.duration, r = $.extend({}, o(i).opts, r);
                        var E = $.extend(!0, {}, o(i).tweensContainer);
                        for (var M in E)
                            if ("element" !== M) {
                                var L = E[M].startValue;
                                E[M].startValue = E[M].currentValue = E[M].endValue, E[M].endValue = L, g.isEmptyObject(b) || (E[M].easing = r.easing), y.debug && console.log("reverse tweensContainer (" + M + "): " + JSON.stringify(E[M]), i)
                            }
                        s = E
                    } else if ("start" === k) {
                        var E;
                        o(i).tweensContainer && o(i).isAnimating === !0 && (E = o(i).tweensContainer), $.each(h, function(e, t) {
                            if (RegExp("^" + x.Lists.colors.join("$|^") + "$").test(e)) {
                                var a = d(t, !0),
                                    i = a[0],
                                    r = a[1],
                                    o = a[2];
                                if (x.RegEx.isHex.test(i)) {
                                    for (var s = ["Red", "Green", "Blue"], l = x.Values.hexToRgb(i), u = o ? x.Values.hexToRgb(o) : n, c = 0; c < s.length; c++) {
                                        var p = [l[c]];
                                        r && p.push(r), u !== n && p.push(u[c]), h[e + s[c]] = p
                                    }
                                    delete h[e]
                                }
                            }
                        });
                        for (var O in h) {
                            var j = d(h[O]),
                                H = j[0],
                                R = j[1],
                                D = j[2];
                            O = x.Names.camelCase(O);
                            var q = x.Hooks.getRoot(O),
                                I = !1;
                            if (o(i).isSVG || "tween" === q || x.Names.prefixCheck(q)[1] !== !1 || x.Normalizations.registered[q] !== n) {
                                (r.display !== n && null !== r.display && "none" !== r.display || r.visibility !== n && "hidden" !== r.visibility) && /opacity|filter/.test(O) && !D && 0 !== H && (D = 0), r._cacheValues && E && E[O] ? (D === n && (D = E[O].endValue + E[O].unitType), I = o(i).rootPropertyValueCache[q]) : x.Hooks.registered[O] ? D === n ? (I = x.getPropertyValue(i, q), D = x.getPropertyValue(i, O, I)) : I = x.Hooks.templates[q][1] : D === n && (D = x.getPropertyValue(i, O));
                                var U, B, W, G = !1;
                                if (U = p(O, D), D = U[0], W = U[1], U = p(O, H), H = U[0].replace(/^([+-\/*])=/, function(e, t) {
                                    return G = t, ""
                                }), B = U[1], D = parseFloat(D) || 0, H = parseFloat(H) || 0, "%" === B && (/^(fontSize|lineHeight)$/.test(O) ? (H /= 100, B = "em") : /^scale/.test(O) ? (H /= 100, B = "") : /(Red|Green|Blue)$/i.test(O) && (H = H / 100 * 255, B = "")), /[\/*]/.test(G)) B = W;
                                else if (W !== B && 0 !== D)
                                    if (0 === H) B = W;
                                    else {
                                        l = l || f();
                                        var X = /margin|padding|left|right|width|text|word|letter/i.test(O) || /X$/.test(O) || "x" === O ? "x" : "y";
                                        switch (W) {
                                            case "%":
                                                D *= "x" === X ? l.percentToPxWidth : l.percentToPxHeight;
                                                break;
                                            case "px":
                                                break;
                                            default:
                                                D *= l[W + "ToPx"]
                                        }
                                        switch (B) {
                                            case "%":
                                                D *= 1 / ("x" === X ? l.percentToPxWidth : l.percentToPxHeight);
                                                break;
                                            case "px":
                                                break;
                                            default:
                                                D *= 1 / l[B + "ToPx"]
                                        }
                                    }
                                switch (G) {
                                    case "+":
                                        H = D + H;
                                        break;
                                    case "-":
                                        H = D - H;
                                        break;
                                    case "*":
                                        H = D * H;
                                        break;
                                    case "/":
                                        H = D / H
                                }
                                s[O] = {
                                    rootPropertyValue: I,
                                    startValue: D,
                                    currentValue: D,
                                    endValue: H,
                                    unitType: B,
                                    easing: R
                                }, y.debug && console.log("tweensContainer (" + O + "): " + JSON.stringify(s[O]), i)
                            } else y.debug && console.log("Skipping [" + q + "] due to a lack of browser support.")
                        }
                        s.element = i
                    }
                    s.element && (x.Values.addClass(i, "velocity-animating"), z.push(s), "" === r.queue && (o(i).tweensContainer = s, o(i).opts = r), o(i).isAnimating = !0, C === S - 1 ? (y.State.calls.push([z, m, r, null, T.resolver]), y.State.isTicking === !1 && (y.State.isTicking = !0, c())) : C++)
                }
                var i = this,
                    r = $.extend({}, y.defaults, b),
                    s = {}, l;
                switch (o(i) === n && y.init(i), parseFloat(r.delay) && r.queue !== !1 && $.queue(i, r.queue, function(e) {
                    y.velocityQueueEntryFlag = !0, o(i).delayTimer = {
                        setTimeout: setTimeout(e, parseFloat(r.delay)),
                        next: e
                    }
                }), r.duration.toString().toLowerCase()) {
                    case "fast":
                        r.duration = 200;
                        break;
                    case "normal":
                        r.duration = v;
                        break;
                    case "slow":
                        r.duration = 600;
                        break;
                    default:
                        r.duration = parseFloat(r.duration) || 1
                }
                y.mock !== !1 && (y.mock === !0 ? r.duration = r.delay = 1 : (r.duration *= parseFloat(y.mock) || 1, r.delay *= parseFloat(y.mock) || 1)), r.easing = u(r.easing, r.duration), r.begin && !g.isFunction(r.begin) && (r.begin = null), r.progress && !g.isFunction(r.progress) && (r.progress = null), r.complete && !g.isFunction(r.complete) && (r.complete = null), r.display !== n && null !== r.display && (r.display = r.display.toString().toLowerCase(), "auto" === r.display && (r.display = y.CSS.Values.getDisplayType(i))), r.visibility !== n && null !== r.visibility && (r.visibility = r.visibility.toString().toLowerCase()), r.mobileHA = r.mobileHA && y.State.isMobile && !y.State.isGingerbread, r.queue === !1 ? r.delay ? setTimeout(e, r.delay) : e() : $.queue(i, r.queue, function(t, a) {
                    return a === !0 ? (T.promise && T.resolver(m), !0) : (y.velocityQueueEntryFlag = !0, void e(t))
                }), "" !== r.queue && "fx" !== r.queue || "inprogress" === $.queue(i)[0] || $.dequeue(i)
            }
            var s = arguments[0] && (arguments[0].p || $.isPlainObject(arguments[0].properties) && !arguments[0].properties.names || g.isString(arguments[0].properties)),
                l, p, f, m, h, b;
            if (g.isWrapped(this) ? (l = !1, f = 0, m = this, p = this) : (l = !0, f = 1, m = s ? arguments[0].elements || arguments[0].e : arguments[0]), m = r(m)) {
                s ? (h = arguments[0].properties || arguments[0].p, b = arguments[0].options || arguments[0].o) : (h = arguments[f], b = arguments[f + 1]);
                var S = m.length,
                    C = 0;
                if (!/^(stop|finish)$/i.test(h) && !$.isPlainObject(b)) {
                    var P = f + 1;
                    b = {};
                    for (var V = P; V < arguments.length; V++) g.isArray(arguments[V]) || !/^(fast|normal|slow)$/i.test(arguments[V]) && !/^\d/.test(arguments[V]) ? g.isString(arguments[V]) || g.isArray(arguments[V]) ? b.easing = arguments[V] : g.isFunction(arguments[V]) && (b.complete = arguments[V]) : b.duration = arguments[V]
                }
                var T = {
                    promise: null,
                    resolver: null,
                    rejecter: null
                };
                l && y.Promise && (T.promise = new y.Promise(function(e, t) {
                    T.resolver = e, T.rejecter = t
                }));
                var k;
                switch (h) {
                    case "scroll":
                        k = "scroll";
                        break;
                    case "reverse":
                        k = "reverse";
                        break;
                    case "finish":
                    case "stop":
                        $.each(m, function(e, t) {
                            o(t) && o(t).delayTimer && (clearTimeout(o(t).delayTimer.setTimeout), o(t).delayTimer.next && o(t).delayTimer.next(), delete o(t).delayTimer)
                        });
                        var F = [];
                        return $.each(y.State.calls, function(e, t) {
                            t && $.each(t[1], function(a, i) {
                                var r = b === n ? "" : b;
                                return r === !0 || t[2].queue === r || b === n && t[2].queue === !1 ? void $.each(m, function(a, n) {
                                    n === i && ((b === !0 || g.isString(b)) && ($.each($.queue(n, g.isString(b) ? b : ""), function(e, t) {
                                        g.isFunction(t) && t(null, !0)
                                    }), $.queue(n, g.isString(b) ? b : "", [])), "stop" === h ? (o(n) && o(n).tweensContainer && r !== !1 && $.each(o(n).tweensContainer, function(e, t) {
                                        t.endValue = t.currentValue
                                    }), F.push(e)) : "finish" === h && (t[2].duration = 1))
                                }) : !0
                            })
                        }), "stop" === h && ($.each(F, function(e, t) {
                            d(t, !0)
                        }), T.promise && T.resolver(m)), e();
                    default:
                        if (!$.isPlainObject(h) || g.isEmptyObject(h)) {
                            if (g.isString(h) && y.Redirects[h]) {
                                var A = $.extend({}, b),
                                    E = A.duration,
                                    M = A.delay || 0;
                                return A.backwards === !0 && (m = $.extend(!0, [], m).reverse()), $.each(m, function(e, t) {
                                    parseFloat(A.stagger) ? A.delay = M + parseFloat(A.stagger) * e : g.isFunction(A.stagger) && (A.delay = M + A.stagger.call(t, e, S)), A.drag && (A.duration = parseFloat(E) || (/^(callout|transition)/.test(h) ? 1e3 : v), A.duration = Math.max(A.duration * (A.backwards ? 1 - e / S : (e + 1) / S), .75 * A.duration, 200)), y.Redirects[h].call(t, t, A || {}, e, S, m, T.promise ? T : n)
                                }), e()
                            }
                            var L = "Velocity: First argument (" + h + ") was not a property map, a known action, or a registered redirect. Aborting.";
                            return T.promise ? T.rejecter(new Error(L)) : console.log(L), e()
                        }
                        k = "start"
                }
                var N = {
                    lastParent: null,
                    lastPosition: null,
                    lastFontSize: null,
                    lastPercentToPxWidth: null,
                    lastPercentToPxHeight: null,
                    lastEmToPx: null,
                    remToPx: null,
                    vwToPx: null,
                    vhToPx: null
                }, z = [];
                $.each(m, function(e, t) {
                    g.isNode(t) && i.call(t)
                });
                var A = $.extend({}, y.defaults, b),
                    O;
                if (A.loop = parseInt(A.loop), O = 2 * A.loop - 1, A.loop)
                    for (var j = 0; O > j; j++) {
                        var H = {
                            delay: A.delay,
                            progress: A.progress
                        };
                        j === O - 1 && (H.display = A.display, H.visibility = A.visibility, H.complete = A.complete), w(m, "reverse", H)
                    }
                return e()
            }
        };
        y = $.extend(w, y), y.animate = w;
        var S = t.requestAnimationFrame || f;
        return y.State.isMobile || a.hidden === n || a.addEventListener("visibilitychange", function() {
            a.hidden ? (S = function(e) {
                return setTimeout(function() {
                    e(!0)
                }, 16)
            }, c()) : S = t.requestAnimationFrame || f
        }), e.Velocity = y, e !== t && (e.fn.velocity = w, e.fn.velocity.defaults = y.defaults), $.each(["Down", "Up"], function(e, t) {
            y.Redirects["slide" + t] = function(e, a, i, r, o, s) {
                var l = $.extend({}, a),
                    u = l.begin,
                    c = l.complete,
                    d = {
                        height: "",
                        marginTop: "",
                        marginBottom: "",
                        paddingTop: "",
                        paddingBottom: ""
                    }, p = {};
                l.display === n && (l.display = "Down" === t ? "inline" === y.CSS.Values.getDisplayType(e) ? "inline-block" : "block" : "none"), l.begin = function() {
                    u && u.call(o, o);
                    for (var a in d) {
                        p[a] = e.style[a];
                        var n = y.CSS.getPropertyValue(e, a);
                        d[a] = "Down" === t ? [n, 0] : [0, n]
                    }
                    p.overflow = e.style.overflow, e.style.overflow = "hidden"
                }, l.complete = function() {
                    for (var t in p) e.style[t] = p[t];
                    c && c.call(o, o), s && s.resolver(o)
                }, y(e, d, l)
            }
        }), $.each(["In", "Out"], function(e, t) {
            y.Redirects["fade" + t] = function(e, a, i, r, o, s) {
                var l = $.extend({}, a),
                    u = {
                        opacity: "In" === t ? 1 : 0
                    }, c = l.complete;
                i !== r - 1 ? l.complete = l.begin = null : l.complete = function() {
                    c && c.call(o, o), s && s.resolver(o)
                }, l.display === n && (l.display = "In" === t ? "auto" : "none"), y(this, u, l)
            }
        }), y
    }(window.jQuery || window.Zepto || window, window, document)
});
