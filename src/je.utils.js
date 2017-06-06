(function () {
	'use strict';

	je.isEmpty = function isEmpty(str) {
		return typeof str == 'string' && !str.trim() || typeof str == 'undefined' || str === null;
	};

	je.flash = function (elements) {
		var opacity = 100;
		var color = "255, 255, 20"; // has to be in this format since we use rgba
		var interval = setInterval(function () {
			opacity -= 3;
			if (opacity <= 0) clearInterval(interval);
			$(elements).css({ background: "rgba(" + color + ", " + opacity / 100 + ")" });
		}, 60);
	};

	je.navigateToId = function (id) {
		var $right = $('.right');
		if (!je.isEmpty(id)) {
			var $scrollTarget = document.getElementById(id);
			if (!je.isEmpty($scrollTarget)) {
				$scrollTarget.scrollIntoView(true);
				$right.scrollTop($right.scrollTop() - 80);
				je.flash($($scrollTarget));
			}
		}
	};

	/* jshint -W086 */
	je.comment = function (cid, commentAttr) {

		switch (cid) {
			case 'up':
				return 'This term is likely undefined.  Please verify.';
			case 'ud':
				return 'This is likely an unused definition.  Please verify.';
			case 'lc':
				if (je.isEmpty(commentAttr)) {
					return 'An uppercase version of this phrase is defined. Please click to see more.';
				} else {
					return 'An uppercase version of this phrase is defined in the source document provided. Please verify.';
				}
			case 'ild':
				return 'This is likely an inline-only definition. Please verify.';
			case 'dd':
				return 'This is likely a duplicate definition. Please verify.';
			case 'od':
				return 'This is likely a definition that overrides another in the source document provided. Please verify.';
			case 'xr':
				return 'This cross-reference cannot be confirmed. Please verify.';
			case 'ni':
				return 'This is likely a numbering issue. Please verify.';
			case 'spin':
				if (!je.isEmpty(commentAttr)) {
					return je.store.comments[commentAttr];
				} else {
					return 'This is likely an inconsistent spelling.';
				}
			case 'spa':
				if (!je.isEmpty(commentAttr)) {
					return je.store.comments[commentAttr];
				} else {
					return 'This is a Spotlight alert.';
				}
			case 'xrAst':
				if (!je.isEmpty(commentAttr)) {
					if (!je.isEmpty(je.store.xrAstsMap[commentAttr])) {
												return je.store.xrAstsMap[commentAttr];
					} else {
												return 'This is a linked cross-reference.';
					}
				} else {
					return 'This is a linked cross-reference.';
				}
			case 'du':
				if (!je.isEmpty(commentAttr)) {
					return je.store.dusMap[commentAttr];
				} else {
					return 'Definition found.';
				}
			case 'spConstAst':
				return 'Consistent with a Spotlight rule specified.';
			case 'cite':
				return 'Citation located.';
			case 'br':
				return 'Square brackets detected.';
		}
	};

})(je || {});