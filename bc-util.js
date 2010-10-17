/**
 * BC JS PAPI WRAPPER 2.0.0 (12 OCTOBER 2010)
 * A Brightcove JavaScript Player API wrapper with utilities
 * (Formerly known as BCJS)
 *
 * REFERENCES:
 *	 Official Website: http://opensource.brightcove.com
 *	 Code Repository: http://code.google.com/p/brightcove/
 *
 * AUTHORS:
 *	 Matthew Congrove, Professional Services Engineer, Brightcove
 *	 Brian Franklin, Professional Services Engineer, Brightcove
 *	 Jesse Streb, Professional Services Engineer, Brightcove
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
 * THE USE OR OTHER DEALINGS IN THE SOFTWARE. YOU AGREE TO RETAIN IN THE SOFTWARE AND ANY
 * MODIFICATIONS TO THE SOFTWARE THE REFERENCE URL INFORMATION, AUTHOR ATTRIBUTION AND
 * CONTRIBUTOR ATTRIBUTION PROVIDED HEREIN.
 *
 * BCUtil incorporates the following libraries:
 *
 *       BC JavaScript Media API Wrapper
 *       Copyright (C) 2009-2010 Brian Franklin, Matthew Congrove
 *       http://opensource.brightcove.com
 *
 * BCUtil requires the following libraries:
 *
 *       NWMatcher - http://javascript.nwbox.com/NWMatcher
 */

var BCUtil = function () {
	/**
	 * Instantiation method
	 * @since 1.0.0
	 */
	this.init = function () {
		this.DOM = new BCUtil.DOM();
		this.DOM.init();
		this.EXP = new BCUtil.EXP();
		this.EXP.init();
		this.UI = new BCUtil.UI();
		this.UI.init();
		this.API = new BCUtil.API();
		this.API.init();

		this.$ = this.DOM.select;
		this.$$ = this.DOM.hasMatch;

		this.debug = false;

		this.addScripts();

		this.browser = this.browser();
		this.isSafari = false;
		this.isFirefox = false;
		this.isIE = false;
		this.isIE6 = false;
		this.isIE7 = false;

		if (this.browser[1] == "firefox") {
			this.isFirefox = true;
		} else if (this.browser[1] == "safari") {
			this.isSafari = true;
		} else if (this.browser[1] == "explorer") {
			this.isIE = true;

			if (this.browser[2] < 7) {
				this.isIE6 = true;
			} else if (this.browser[2] < 8) {
				this.isIE7 = true;
			}
		}
	};

	/**
	 * Determines if all required scripts are present, if not then injects
	 * @since 1.0.0
	 */
	this.addScripts = function () {
		var pScripts = document.getElementsByTagName("script");
		var experienceScriptFound = false;
		var modulesScriptFound = false;

		for(var i = 0; i < pScripts.length; i++) {
			if (pScripts[i].src == "http://admin.brightcove.com/js/BrightcoveExperiences.js") {
				experienceScriptFound = true;
			} else if (pScripts[i].src == "http://admin.brightcove.com/js/APIModules_all.js") {
				modulesScriptFound = true;
			}
		}

		if (!experienceScriptFound) {
			BCUtil.error("Experience script not found. Added by BCUtil.");

			var pEl = document.createElement("script");
			pEl.src = "http://admin.brightcove.com/js/BrightcoveExperiences.js";
			pEl.type = "text/javascript";
			document.getElementsByTagName("head")[0].appendChild(pEl);
		}

		if (!modulesScriptFound) {
			BCUtil.error("API Modules script not found. Added by BCUtil.");

			var pEl = document.createElement("script");
			pEl.src = "http://admin.brightcove.com/js/APIModules_all.js";
			pEl.type = "text/javascript";
			document.getElementsByTagName("head")[0].appendChild(pEl);
		}

		var matcherScriptFound = typeof NW == "undefined" ? false : true;

		if (typeof NW == "undefined") {
			BCUtil.error("NWMatcher script not found.");
		}
	};

	/**
	 * Queues up functions for the window.onload() method
	 * @since 1.0.0
	 * @param function [pFunc] The function to run on window load
	 */
	this.loadQueue = function (pFunc) {
		if (typeof window.addEventListener != "undefined") {
			window.addEventListener("load", pFunc, false);
		} else if (typeof window.attachEvent != "undefined") {
			window.attachEvent("onload", pFunc);
		} else {
			if (window.onload !== null) {
				var oldOnload = window.onload;

				window.onload = function (e) {
					oldOnload(e);

					window[pFunc]();
				};
			} else {
				window.onload = pFunc;
			}
		}
	};

	/**
	 * Makes an AJAX request
	 * @since 1.0.0
	 * @param string [pSrc] The URL to request
	 * @param function [pCallback] An optional callback function
	 * @param bool [pPost] Whether to use POST instead of GET
	 * @param object [pParams] An object of properties to POST
	 * @param string [pResponse]
	 * @return string The response if not using a callback
	 */
	this.ajax = function (pSrc, pCallback, pPost, pParams, pResponse) {
		pResponse = typeof(pResponse) != "undefined" ? pResponse : "xml";

		if (window.XMLHttpRequest) {
			httpRequest = new XMLHttpRequest();
			if (httpRequest.overrideMimeType) {
				httpRequest.overrideMimeType("text/xml");
			}
		} else if (window.ActiveXObject) {
			try {
				httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e1) {
				try {
					httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
				} catch(e2) {}
			}
		}

		if (!httpRequest) {
			return false;
		}

		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState == 4) {
				if (httpRequest.status == 200) {
					if (!pCallback) {
						if (pResponse.toLowerCase() == "xml") {
							return httpRequest.responseXML;
						} else {
							return httpRequest.responseText;
						}
					} else {
						if (pResponse.toLowerCase() == "xml") {
							pCallback(httpRequest.responseXML);
						} else {
							pCallback(httpRequest.responseText);
						}
					}
				}
			}
		};

		if (!pPost) {
			if (!pCallback) {
				httpRequest.open("GET", pSrc, false);
			} else {
				httpRequest.open("GET", pSrc, true);
			}

			httpRequest.send("");
		} else {
			httpRequest.open("POST", pSrc, true);
			httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			httpRequest.setRequestHeader("Content-length", pParams.length);
			httpRequest.send(pParams);
		}
	};

	/**
	 * Determines information about the current browser
	 * @since 1.0.0
	 * @return array Information about the browser
	 */
	this.browser = function () {
		var type;
		var os;
		var version;

		var browser = new Array(
			{string: navigator.userAgent, subString: "Chrome", identity: "Chrome"},
			{string: navigator.userAgent, subString: "OmniWeb", versionSearch: "OmniWeb/", identity: "OmniWeb"},
			{string: navigator.vendor, subString: "Apple", identity: "Safari", versionSearch: "version"},
			{prop: window.opera, identity: "Opera"},
			{string: navigator.vendor, subString: "iCab", identity: "iCab"},
			{string: navigator.vendor, subString: "KDE", identity: "Konqueror"},
			{string: navigator.userAgent, subString: "Firefox", identity: "Firefox"},
			{string: navigator.vendor, subString: "Camino", identity: "Camino"},
			{string: navigator.userAgent, subString: "Netscape", identity: "Netscape"},
			{string: navigator.userAgent, subString: "MSIE", identity: "Explorer", versionSearch: "MSIE"},
			{string: navigator.userAgent, subString: "Gecko", identity: "Mozilla", versionSearch: "rv"},
			{string: navigator.userAgent, subString: "Mozilla", identity: "Netscape", versionSearch: "Mozilla"}
		);

		var system = new Array(
			{string: navigator.platform, subString: "Win", identity: "windows"},
			{string: navigator.platform, subString: "Mac", identity: "mac"},
			{string: navigator.platform, subString: "Linux", identity: "linux"}
		);

		var g = function (d) {
			for(var i = 0; i < d.length; i++) {
				var s = d[i].string;
				var p = d[i].prop;

				type = d[i].versionSearch || d[i].identity;

				if (s) {
					if (s.indexOf(d[i].subString) != -1) {
						return d[i].identity;
					}
				} else if (p) {
					return d[i].identity;
				}
			}
		};

		var h = function (s, t) {
			var i = s.indexOf(t);

			if (i == -1) {
				return;
			}

			return parseFloat(s.substring(i + t.length + 1));
		};

		browser = g(browser) || "unknown";
		version = h(navigator.userAgent, type) || h(navigator.appVersion, type) || "unknown";
		browser = browser.toLowerCase();
		os = g(system) || "unknown";

		return new Array(os, browser, version);
	};

	/**
	 * Determines the current dimensions of the browser window
	 * @since 1.0.0
	 * @return array The dimensions of the browser window
	 */
	this.dimensions = function () {
		var win_width;
		var win_height;
		var scroll_width;
		var scroll_height;

		if (typeof window.innerWidth != "undefined") {
			win_width = window.innerWidth;
			win_height = window.innerHeight;
		} else if (typeof document.documentElement != "undefined" && typeof document.documentElement.clientWidth != "undefined" && document.documentElement.clientWidth != 0) {
			win_width = document.documentElement.clientWidth;
			win_height = document.documentElement.clientHeight;
		} else {
			win_width = document.getElementsByTagName("body")[0].clientWidth;
			win_height = document.getElementsByTagName("body")[0].clientHeight;
		}

		if (typeof(window.pageYOffset) == "number") {
			scroll_width = window.pageXOffset;
			scroll_height = window.pageYOffset;
		} else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
			scroll_width = document.body.scrollLeft;
			scroll_height = document.body.scrollTop;
		} else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
			scroll_width = document.documentElement.scrollLeft;
			scroll_height = document.documentElement.scrollTop;
		}

		if (typeof(win_width) == "undefined") { win_width = 0; }
		if (typeof(win_height) == "undefined") { win_height = 0; }
		if (typeof(scroll_width) == "undefined") { scroll_width = 0; }
		if (typeof(scroll_height) == "undefined") { scroll_height = 0; }

		return new Array(win_width, win_height, scroll_width, scroll_height);
	};

	/**
	 * Retrieves a number from a CSS value
	 * @since 1.0.0
	 * @param string [pNum] The value to retrieve the number from
	 * @return array The number, and whether a number was originally in pixels
	 */
	this.getNum = function (pNum) {
		var ret = "";
		var bool = false;

		if (pNum.indexOf("px") > -1) {
			bool = true;
			ret = parseInt(pNum.substring(0, pNum.indexOf("px")));
		} else {
			ret = parseInt(pNum);
		}

		return new Array(ret, bool);
	};

	/**
	 * Converts a millisecond timestamp to a human-readable format
	 * @since 1.0.0
	 * @param int [pNum] The millisecond timestamp to convert
	 * @return string A human-readable version of the timestamp
	 */
	this.time = function (pNum) {
		pNum = new Number(pNum / 1000);
		var h = Math.floor(pNum / 3600);
		var m = Math.floor(pNum % 3600 / 60);
		var s = Math.floor(pNum % 3600 % 60);
		return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
	};

	/**
	 * Retrieves a browser cookie
	 * @since 1.0.0
	 * @param string [pName] The key of the cookie to retrieve
	 * @return string|int The value of the cookie
	 */
	this.getCookie = function (pName) {
		var start = document.cookie.indexOf(pName + "=");
		var len = start + pName.length + 1;

		if ((!start) && (pName != document.cookie.substring(0, pName.length))) {
			return null;
		}

		if (start == -1) {
			return null;
		}

		var end = document.cookie.indexOf(";", len);

		if (end == -1) {
			end = document.cookie.length;
		}

		return unescape(document.cookie.substring(len, end));
	};

	/**
	 * Sets a browser cookie
	 * @since 1.0.0
	 * @param string [pName] The key of the cookie
	 * @param string|int [pValue] The value of the cookie
	 * @param int [pExpires] The length of time to keep the cookie valid
	 * @param object [pOptions] A list of cookie options to set
	 */
	this.setCookie = function (pName, pValue, pExpires, pOptions) {
		if (pOptions === undefined) {
			pOptions = {};
		}

		if (pExpires) {
			var expires_date = new Date();
			expires_date.setDate(expires_date.getDate() + pExpires)
		}

		document.cookie = pName + "=" + escape(pValue) +
			((pExpires) ? ";expires="+expires_date.toGMTString() : "") +
			((pOptions.path) ? ";path=" + pOptions.path : "") +
			((pOptions.domain) ? ";domain=" + pOptions.domain : "") +
			((pOptions.secure) ? ";secure" : "");
	};

	/**
	 * Deletes a browser cookie
	 * @since 1.0.0
	 * @param string [pName] The key of the cookie
	 * @param string [pPath] The path of the cookie
	 * @param string [pDomain] The domain of the cookie
	 */
	this.deleteCookie = function (pName, pPath, pDomain) {
		if (BCUtil.getCookie(pName)) {
			document.cookie = pName + "=" +
			((pPath) ? ";path=" + pPath : "") +
			((pDomain) ? ";domain=" + pDomain : "") +
			";expires=Thu, 01-Jan-1970 00:00:01 GMT";
		}
	};

	/**
	 * Encodes or decodes a string with the Base64 algorithm
	 * @since 1.0.0
	 * @param string [pType] Either "encode" or "decode", defines which way to convert
	 * @param string [pString] The string to convert
	 * @return string The converted string
	 */
	this.base64 = function (pType, pString) {
		var key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var keyRe = new RegExp("[^" + key + "=]", "g");

		if (pType == "encode") {
			var i = 0;
			var output = "";
			var len = pString.length;
			var padding = 3 - (len % 3);

			while(i < len) {
				var byte1 = pString.charCodeAt(i++);
				var byte2 = pString.charCodeAt(i++) || 0;
				var byte3 = pString.charCodeAt(i++) || 0;
				var index1 = byte1 >> 2;
				var index2 = (byte1 & 3) << 4 | byte2 >> 4;
				var index3 = (byte2 & 15) << 2 | byte3 >> 6;
				var index4 = byte3 & 63;

				output += key.charAt(index1) + key.charAt(index2) + key.charAt(index3) + key.charAt(index4);
			}

			if (padding) {
				output = output.slice(0, output.length - padding) + (padding == 1 ? "=" : "==");
			}

			return output;
		} else {
			pString = pString.replace(keyRe, "");

			var i = 0;
			var output = "";
			var len = pString.length;
			var padding = len - pString.indexOf("=");

			while(i < len) {
				var byte1 = key.indexOf(pString.substr(i++, 1));
				var byte2 = key.indexOf(pString.substr(i++, 1));
				var byte3 = key.indexOf(pString.substr(i++, 1));
				var byte4 = key.indexOf(pString.substr(i++, 1));
				var char1 = byte1 << 2 | byte2 >> 4;
				var char2 = ((byte2 & 15) << 4) | (byte3 >> 2);
				var char3 = ((byte3 & 3) << 6) | byte4 & 63;

				output += String.fromCharCode(char1) + String.fromCharCode(char2) + String.fromCharCode(char3);
			}

			if (padding) {
				output = output.substr(0, output.length - padding);
			}

			return output;
		}
	};

	/**
	 * Retrieves a value from the current URL
	 * @since 1.0.0
	 * @param string [pName] The key of the value to retrieve
	 * @return string The requested value
	 */
	this.param = function (pName) {
		pName = pName.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

		var regexS = "[\\?&]" + pName + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);

		if (results == null) {
			return "";
		} else {
			return results[1];
		}
	};

	/**
	 * Outputs an error to console
	 * @since 1.0.0
	 * @param string [pData] The error message to log
	 */
	this.error = function (pData) {
		if (this.debug) {
			if (typeof console !== "undefined") {
				console.log("" + pData);
			}
		}
	};

	this.UI = function () {
		/**
		 * Instantiation method
		 * @since 1.0.0
		 */
		this.init = function () {
			this.isFading = false;
		};

		/**
		 * Tweens an object from one state to another
		 * @since 1.0.0
		 * @param object|string [pEl] The element or element ID to perform the tween on
		 * @param string [pType] The value to tween
		 * @param string|int [pNewValue] The new value to tween to
		 * @param int [pTime] The amount of time to perform the tween
		 * @param function [pCallback] A function to run on tween completion
		 */
		this.tween = function (pEl, pType, pNewValue, pTime, pCallback) {
			if (typeof(pEl) == "string") {
				pEl = BCUtil.DOM.select(pEl)[0];
			}

			if (pType == "opacity") {
				if (BCUtil.isIE) {
					pType = "filter";
				}
			}

			if (pTime == 0 || typeof(pTime) != "number") {
				pTime = 1;
			}

			var pStartValue = BCUtil.getNum(pEl.style[pType])[0];
			var pValueDistance = pNewValue - pStartValue;
			var pTimeStart = new Date().getTime();
			var pTimeEnd = pTimeStart + pTime;

			BCUtil.UI.tweenExecute(pEl, pType, pStartValue, pValueDistance, pTime, pTimeEnd, pCallback);
		};

		/**
		 * Executes a tween request
		 * @since 1.0.0
		 * @param object|string [pEl] The element or element ID to perform the tween on
		 * @param string [pType] The value to tween
		 * @param string|int [pStartValue] The start value of the tween
		 * @param string|int [pValueDistance] The distance between the start and end values
		 * @param int [pTime] The amount of time to perform the tween
		 * @param int [pTimeEnd] The time at which to end the tween
		 * @param function [pCallback] A function to run on tween completion
		 */
		this.tweenExecute = function (pEl, pType, pStartValue, pValueDistance, pTime, pTimeEnd, pCallback) {
			var pCurrentTime = new Date().getTime();
			var pTimeRemaining = Math.max(0, pTimeEnd - pCurrentTime);
			var pCurrentMove;

			if (pType == "top" || pType == "right" || pType == "bottom" || pType == "left") {
				pCurrentMove = Math.round((pValueDistance - (Math.pow(pTimeRemaining, 3) / Math.pow(pTime, 3)) * pValueDistance) * 10) / 10;
			} else {
				pCurrentMove = Math.round((pValueDistance - (pTimeRemaining / pTime) * pValueDistance) * 10) / 10;
			}

			if (pTimeRemaining <= 0 || pValueDistance > 10) {
				pCurrentMove = parseInt(pCurrentMove);
			}

			if (pType != "filter") {
				var isPx = BCUtil.getNum(pEl.style[pType])[1];
			}

			if (isPx) {
				pEl.style[pType] = (pStartValue + pCurrentMove) + "px";
			} else {
				if (pType == "filter") {
					pEl.style[pType] = "alpha(opacity=" + ((pStartValue + pCurrentMove) * 100) + ")";
				} else {
					pEl.style[pType] = (pStartValue + pCurrentMove);
				}
			}

			if (pTimeRemaining > 0) {
				setTimeout(
					function () {
						BCUtil.UI.tweenExecute(pEl, pType, pStartValue, pValueDistance, pTime, pTimeEnd, pCallback);
					},
					10
				);
			} else {
				if (typeof(pCallback) == "function") {
					pCallback();
				}
			}
		};

		/**
		 * Hides a DOM element
		 * @since 1.0.0
		 * @param object|string [pEl] The element or element ID to hide
		 */
		this.hide = function (pEl) {
			if (typeof(pEl) == "string") {
				pEl = BCUtil.DOM.select(pEl)[0];
			}

			if (pEl.style["display"] != "none" && pEl.style["display"] != "hidden") {
				pEl.style["display"] = "none";
			}
		};

		/**
		 * Shows a DOM element
		 * @since 1.0.0
		 * @param object|string [pEl] The element or element ID to
		 */
		this.show = function (pEl) {
			if (typeof(pEl) == "string") {
				pEl = BCUtil.DOM.select(pEl)[0];
			}

			if (pEl.style["display"] == "none" || pEl.style["display"] == "hidden") {
				pEl.style["display"] = "block";
			}
		};

		/**
		 * Toggle the visibility of a DOM element
		 * @since 1.0.0
		 * @param object|string [pEl] The element or element ID to
		 */
		this.toggle = function (pEl) {
			if (typeof(pEl) == "string") {
				pEl = BCUtil.DOM.select(pEl)[0];
			}

			if (pEl.style["display"] == "none" || pEl.style["display"] == "hidden") {
				pEl.style["display"] = "block";
			} else {
				pEl.style["display"] = "none";
			}
		};

		/**
		 * Center a DOM element on the page
		 * @since 1.0.0
		 * @param object|string [pEl] The element or element ID to center
		 * @param string [pType] Either "fixed" or "absolute", the manner in which to center the element
		 */
		this.center = function (pEl, pType) {
			if (typeof(pEl) == "string") {
				pEl = BCUtil.DOM.select(pEl)[0];
			}

			var elWidth;
			var elHeight;

			if (pEl.offsetWidth) {
				elWidth = pEl.offsetWidth;
			} else {
				elWidth = BCUtil.getNum(pEl.style["width"])[0];
			}

			if (pEl.offsetHeight) {
				elHeight = pEl.offsetHeight;
			} else {
				elHeight = BCUtil.getNum(pEl.style["height"])[0];
			}

			var win = BCUtil.dimensions();

			if (pType == "fixed") {
				var newX = ((win[0] / 2) - (elWidth / 2));
				var newY = ((win[1] / 2) - (elHeight / 2));
			} else {
				var newX = ((win[0] / 2) - (elWidth / 2) + win[2]);
				var newY = ((win[1] / 2) - (elHeight / 2) + win[3]);
			}

			if (newY < 0) {
				newY = 0;
			}

			if (newX < 0) {
				newX = 0;
			}

			pEl.style["left"] = newX + "px";
			pEl.style["top"] = newY + "px";
		};

		/**
		 * Performs an accordion on a group of elements
		 * @since 1.0.0
		 * @param string [pId] The ID of the DOM element to open
		 * @param string [pClass] The class name of the DOM elements bound to the accordion
		 * @param int [pSpeed] The speed at which to perform the accordion tween
		 */
		this.accordion = function (pId, pClass, pSpeed) {
			var pEls = BCUtil.DOM.select("." + pClass);

			for(var i = 0; i < pEls.length; i++) {
				if (pEls[i].id == pId) {
					BCUtil.UI.blind(pEls[i].id, pSpeed);
				} else {
					pContainer = BCUtil.DOM.select("#" + pEls[i].id + "_BCUtilC")[0];

					if (pContainer) {
						BCUtil.UI.blindClose(pContainer.id, pSpeed);
					}
				}
			}
		}

		/**
		 * Performs a blind on an element
		 * @since 1.0.0
		 * @param string [pId] The ID of the DOM element to open
		 * @param int [pSpeed] The speed at which to perform the blind tween
		 */
		this.blind = function (pId, pSpeed) {
			var pContainer = BCUtil.DOM.select("#" + pId + "_BCUtilC")[0];

			if (BCUtil.DOM.select("#" + pId + "_BCUtilC")[0]) {
				if (BCUtil.getNum(pContainer.style["height"])[0] > 0) {
					BCUtil.UI.blindClose(pContainer.id, pSpeed);
				} else {
					var pEl = BCUtil.DOM.select("#" + pId)[0];
					var finalHeight = pEl.offsetHeight;

					BCUtil.UI.blindOpen(pContainer.id, finalHeight, pSpeed);
				}
			} else {
				BCUtil.UI.blindExecute(pId, pSpeed);
			}
		}

		/**
		 * Executes a blind tween
		 * @since 1.0.0
		 * @param string [pId] The ID of the DOM element to open
		 * @param int [pSpeed] The speed at which to perform the blind tween
		 */
		this.blindExecute = function (pId, pSpeed) {
			var pOrigEl = BCUtil.DOM.select("#" + pId)[0];
			var pParent = pOrigEl.parentNode;

			var pNewEl = pOrigEl.cloneNode(true);
			pNewEl.style["display"] = "block";

			var pContainer = document.createElement("div");
			pContainer.id = pId + "_BCUtilC";
			pContainer.style["height"] = "0px";
			pContainer.style["overflow"] = "hidden";
			pContainer.style["position"] = "relative";

			pParent.insertBefore(pContainer, pOrigEl);
			pParent.removeChild(pOrigEl);

			pContainer = BCUtil.DOM.select("#" + pContainer.id)[0];
			pContainer.appendChild(pNewEl);

			pNewEl = BCUtil.DOM.select("#" + pId)[0];
			var finalHeight = pNewEl.offsetHeight;
			pNewEl.style["width"] = pNewEl.offsetWidth + "px";
			pNewEl.style["position"] = "absolute";
			pNewEl.style["bottom"] = "0px";

			BCUtil.UI.blindOpen(pContainer.id, finalHeight, pSpeed);
		}

		/**
		 * Closes an element with a blind tween
		 * @since 1.0.0
		 * @param string [pId] The ID of the DOM element to close
		 * @param int [pSpeed] The speed at which to perform the blind tween
		 */
		this.blindClose = function (pId, pSpeed) {
			BCUtil.UI.tween(
				"#" + pId,
				"height",
				0,
				pSpeed
			);
		}

		/**
		 * Opens an element with a blind tween
		 * @since 1.0.0
		 * @param string [pId] The ID of the DOM element to open
		 * @param int [pSpeed] The speed at which to perform the blind tween
		 */
		this.blindOpen = function (pId, pHeight, pSpeed) {
			BCUtil.UI.tween(
				"#" + pId,
				"height",
				pHeight,
				pSpeed
			);
		}
	};

	this.DOM = function () {
		/**
		 * Instantiation method
		 * @since 1.0.0
		 */
		this.init = function () {
			// No init actions required
		};

		/**
		 * Determines if an element has a specific class
		 * @since 1.0.0
		 * @param object|string [pEl] The element or element ID to check
		 * @param string [pAttr] The class name to find
		 * @return bool True if found, otherwise false
		 */
		this.match = function (pEl, pAttr) {
			if (typeof(pEl) == "string") {
				pEl = this.select(pEl)[0];
			}

			return NW.Dom.match(pEl, pAttr);
		};

		/**
		 * Dummy method for match()
		 * @since 1.0.0
		 */
		this.hasMatch = function (pEl, pAttr) {
			return this.match(pEl, pAttr);
		};

		/**
		 * Find elements that match the selector
		 * @since 1.0.0
		 * @param string [pEl] The CSS selector used to find elements
		 * @return array The matching elements
		 */
		this.select = function (pEl) {
			return NW.Dom.select(pEl);
		};

		/**
		 * Adds a class to a DOM element if it doesn't already exist
		 * @since 1.0.0
		 * @param object|string [pEl] The element or element ID to check
		 * @param string [pClass] The class name to add
		 */
		this.addClass = function (pEl, pClass) {
			if (typeof(pEl) == "string") {
				pEl = this.select(pEl)[0];
			}

			if (!this.match(pEl, "." + pClass)) {
				pEl.className = pEl.className + " " + pClass;
			}
		};

		/**
		 * Removes a class from a DOM element if it exists
		 * @since 1.0.0
		 * @param object|string [pEl] The element or element ID to check
		 * @param string [pClass] The class name to remove
		 * @return
		 */
		this.removeClass = function (pEl, pClass) {
			if (typeof(pEl) == "string") {
				pEl = this.select(pEl)[0];
			}

			if (this.match(pEl, "." + pClass)) {
				var reg = new RegExp("(\\s|^)" + pClass + "(\\s|$)");
				pEl.className = pEl.className.replace(reg, " ");
			}
		};

		/**
		 * Removes or adds a class to a DOM element, depending on if it already exists
		 * @since 1.0.0
		 * @param object|string [pEl] The element or element ID to check
		 * @param string [pClass] The class name to remove or add
		 * @return
		 */
		this.toggleClass = function (pEl, pClass) {
			if (typeof(pEl) == "string") {
				pEl = this.select(pEl)[0];
			}

			if (!this.match(pEl, "." + pClass)) {
				this.addClass(pEl, pClass);
			} else {
				this.removeClass(pEl, pClass);
			}
		};
	};

	this.EXP = function () {
		/**
		 * Instantiation method
		 * @since 1.0.0
		 */
		this.init = function () {
			this.ad = null;
			this.brightcove = null;
			this.cue = null;
			this.experience = null;
			this.media = null;
			this.menu = null;
			this.social = null;
			this.player = null;

			this.apiEnabled = false;
			this.apiEnabledCount = 0;
			this.apiEnabledTimer = null;

			BCUtil.loadQueue(function () {
				BCUtil.EXP.apiEnabledTimer = setInterval(
					function () {
						if (this.apiEnabled) {
							clearInterval(BCUtil.EXP.apiEnabledTimer);
						} else {
							BCUtil.EXP.apiEnabledCount++;

							if (BCUtil.EXP.apiEnabledCount == 5) {
								clearInterval(BCUtil.EXP.apiEnabledTimer);

								BCUtil.error("JavaScript API not enabled.");
							}
						}
					}, 1000
				);
			});

			this.templateLoadedQueue(function (pId) {
				BCUtil.EXP.onTemplateLoaded(pId);
			});
		};

		/**
		 * Queues up functions for the onTemplateLoaded method
		 * @since 1.0.0
		 * @param function [pFunc] The function to run
		 */
		this.templateLoadedQueue = function (pFunc) {
			if (typeof onTemplateLoaded != "undefined") {
				var oldOnTemplateLoaded = onTemplateLoaded;

				onTemplateLoaded = function (pEvent) {
					oldOnTemplateLoaded(pEvent);
					pFunc(pEvent);
				};
			} else {
				onTemplateLoaded = function (pEvent) {
					pFunc(pEvent);
				};
			}
		};

		/**
		 * Queues up functions for the onAdRulesReady method
		 * @since 1.0.0
		 * @param function [pFunc] The function to run
		 */
		this.adRulesReadyQueue = function (pFunc) {
			if (typeof BCUtil.EXP.onAdRulesReady != "undefined") {
				var oldOnAdRulesReady = BCUtil.EXP.onAdRulesReady;

				BCUtil.EXP.onAdRulesReady = function (pEvent) {
					oldOnAdRulesReady(pEvent);
					pFunc(pEvent);
				};
			} else {
				BCUtil.EXP.onAdRulesReady = function (pEvent) {
					pFunc(pEvent);
				};
			}
		};

		/**
		 * The event to run when onTemplatedLoaded is fired
		 * @since 1.0.0
		 * @param string [pId] The ID of the Brightcove player DOM element
		 */
		this.onTemplateLoaded = function (pId) {
			this.apiEnabled = true;

			BCUtil.EXP.brightcove = brightcove.getExperience(pId);
			BCUtil.EXP.ad = BCUtil.EXP.brightcove.getModule(APIModules.ADVERTISING);
			BCUtil.EXP.cue = BCUtil.EXP.brightcove.getModule(APIModules.CUE_POINTS);
			BCUtil.EXP.experience = BCUtil.EXP.brightcove.getModule(APIModules.EXPERIENCE);
			BCUtil.EXP.content = BCUtil.EXP.brightcove.getModule(APIModules.CONTENT);
			BCUtil.EXP.social = BCUtil.EXP.brightcove.getModule(APIModules.SOCIAL);
			BCUtil.EXP.player = BCUtil.EXP.brightcove.getModule(APIModules.VIDEO_PLAYER);
			BCUtil.EXP.menu = BCUtil.EXP.brightcove.getModule(APIModules.MENU);

			BCUtil.EXP.experience.addEventListener(BCExperienceEvent.TEMPLATE_READY, BCUtil.EXP.onTemplateReady);
			BCUtil.EXP.experience.addEventListener(BCExperienceEvent.CONTENT_LOAD, BCUtil.EXP.onContentLoaded);
			BCUtil.EXP.ad.addEventListener(BCAdvertisingEvent.AD_START, BCUtil.EXP.onAdStart);
			BCUtil.EXP.ad.addEventListener(BCAdvertisingEvent.AD_COMPLETE, BCUtil.EXP.onAdComplete);
			BCUtil.EXP.ad.addEventListener(BCAdvertisingEvent.AD_POSTROLLS_COMPLETE, BCUtil.EXP.onAdPostrollsComplete);
			BCUtil.EXP.ad.addEventListener(BCAdvertisingEvent.AD_RULES_READY, BCUtil.EXP.onAdRulesReady);

			if (typeof BCUtil_templateLoaded == "function") {
				BCUtil_templateLoaded(pId);
			}
		};

		/**
		 * The event to run when onTemplateReady is fired
		 * @since 1.0.0
		 */
		this.onTemplateReady = function () {
			BCUtil.EXP.player.addEventListener(BCMediaEvent.COMPLETE, BCUtil.EXP.onMediaComplete);
			BCUtil.EXP.player.addEventListener(BCMediaEvent.CHANGE, BCUtil.EXP.onMediaChange);
			BCUtil.EXP.cue.addEventListener(BCCuePointEvent.CUE, BCUtil.EXP.onCuePoint);

			if (typeof BCUtil_templateReady == "function") {
				BCUtil_templateReady();
			}
		};

		/**
		 * The event to run when onContentLoaded is fired
		 * @since 1.0.0
		 */
		this.onContentLoaded = function () { if (typeof BCUtil_contentLoaded == "function") { BCUtil_contentLoaded(); } };

		/**
		 * The event to run when onMediaComplete is fired
		 * @since 1.0.0
		 */
		this.onMediaComplete = function () { if (typeof BCUtil_mediaComplete == "function") { BCUtil_mediaComplete(); } };

		/**
		 * The event to run when onMediaChange is fired
		 * @since 1.0.0
		 */
		this.onMediaChange = function () { if (typeof BCUtil_mediaChange == "function") { BCUtil_mediaChange(); } };

		/**
		 * The event to run when onCuePoint is fired
		 * @since 1.0.0
		 */
		this.onCuePoint = function (pData) { if (typeof BCUtil_cuePoint == "function") { BCUtil_cuePoint(pData); } };

		/**
		 * The event to run when onExternalAd is fired
		 * @since 1.0.0
		 */
		this.onExternalAd = function (pData) { if (typeof BCUtil_externalAd == "function") { BCUtil_externalAd(pData); } };

		/**
		 * The event to run when onAdStart is fired
		 * @since 1.0.0
		 */
		this.onAdStart = function () { if (typeof BCUtil_adStart == "function") { BCUtil_adStart(); } };

		/**
		 * The event to run when onAdComplete is fired
		 * @since 1.0.0
		 */
		this.onAdComplete = function () { if (typeof BCUtil_adComplete == "function") { BCUtil_adComplete(); } };

		/**
		 * The event to run when onAdPostrollsComplete is fired
		 * @since 1.0.0
		 */
		this.onAdPostrollsComplete = function () { if (typeof BCUtil_adPostrollsComplete == "function") { BCUtil_adPostrollsComplete(); } };
	};

	this.API = function () {
		/**
		 * Instantiation method
		 * @since 1.0.0
		 */
		this.init = function () {
			this.token = "";
			this.callback = "BCUtil.API.flush";
			this.url = "http://api.brightcove.com/services/library";
			this.calls = [
				{ "s":"find_all_videos", "o":false },
				{ "s":"find_playlists_for_player_id", "o":"player_id" },
				{ "s":"find_all_playlists", "o":false },
				{ "s":"find_playlist_by_id", "o":"playlist_id" },
				{ "s":"find_related_videos", "o":"video_id" },
				{ "s":"find_video_by_id", "o":"video_id" },
				{ "s":"find_videos_by_ids", "o":"video_ids" },
				{ "s":"find_videos_by_tags", "o":"or_tags" },
				{ "s":"find_video_by_reference_id", "o":"reference_id" },
				{ "s":"find_video_by_reference_ids", "o":"reference_ids" },
				{ "s":"find_videos_by_user_id", "o":"user_id" },
				{ "s":"find_videos_by_campaign_id", "o":"campaign_id" },
				{ "s":"find_videos_by_text", "o":"text" },
				{ "s":"find_modified_videos", "o":"from_date" },
				{ "s":"find_playlists_by_ids", "o":"playlist_ids" },
				{ "s":"find_playlist_by_reference_id", "o":"reference_id" },
				{ "s":"find_playlists_by_reference_ids", "o":"reference_ids" },
				{ "s":"search_videos", "o":"all" }
			];
		};

		/**
		 * Create a script element and include the API result
		 * @since 0.1
		 * @param string [s] A query string with no leading question mark
		 * @return true
		 */
		this.inject = function (s) {
			var e = document.createElement("script");
			e.setAttribute("src", BCUtil.API.url + "?" + s);
			e.setAttribute("type", "text/javascript");
			document.getElementsByTagName("head")[0].appendChild(e);
			return true;
		};

		/**
		 * Construct the API call
		 * @since 1.0
		 * @param string [s] A Brightcove API method
		 * @param mixed [v] Either an object containing the API parameters to apply to the given command, or a single value which is applied to the command's default selector
		 * @return true
		 */
		this.find = function (s, v) {
			v = v || null;
			var o = null;
			var q = "";
			s = s.toLowerCase().replace(/(find_)|(_)|(get_)/g, "");

			for (var z in BCUtil.API.calls) {
				if (typeof BCUtil.API.calls[z].s == "undefined") { continue; }
				if (s == BCUtil.API.calls[z].s.toLowerCase().replace(/(find_)|(_)|(get_)/g, "")) {
					s = BCUtil.API.calls[z].s;
					if (typeof BCUtil.API.calls[z].o != "undefined") {
						o = BCUtil.API.calls[z].o;
					}
					break;
				}
			}

			q = "command=" + s;

			if ((typeof v == "object") && v) {
				for (var x in v) {
					if (x == "selector") {
						q += "&" + o + "=" + encodeURIComponent(v[x]);
					} else {
						q += "&" + x + "=" + encodeURIComponent(v[x]);
					}
				}

				if (typeof v.callback != "string") {

					q += "&callback=" + BCUtil.API.callback;
				}

				if (typeof v.token != "string") {
					q += "&token=" + BCUtil.API.token;
				}
			} else if (v) {
				q += "&" + o + "=" + encodeURIComponent(v) + "&callback=" + BCUtil.API.callback;
				q += "&token=" + BCUtil.API.token;
			} else {
				q += "&token=" + BCUtil.API.token;
				q += "&callback=" + BCUtil.API.callback;
			}

			BCUtil.API.inject(q);

			return true;
		};

		/**
		 * Dummy method for search calls
		 * @since 1.0
		 * @param string [s] A Brightcove API method
		 * @param mixed [v] Either an object containing the API parameters to apply to the given command, or a single value which is applied to the command's default selector
		 * @return true
		 */
		this.search = function (v) {
			return BCUtil.API.find("search_videos", v);
		};

		/**
		 * Default callback which does nothing
		 * @since 0.1
		 * @return true
		 */
		this.flush = function (s) {
			return true;
		};
	};
};

BCUtil = new BCUtil();
BCUtil.init();