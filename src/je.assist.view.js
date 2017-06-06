(function () {
	'use strict';

	je.AssistView = Backbone.View.extend({

		initialize: function () {
			this.$el = $('#' + this.model.get('id'));
			this.render();
		},
		render: function () {

					 // self style
			if (!je.isEmpty(this.model.get('style'))) {
				this.$el.addClass(this.model.get('style'));
			}

			// popover
			this.$el.popover({
				container: $('.right'),
				content: this.getContents(),
				placement: "auto",
				html: true,
				trigger: "hover",
				animation: false
			});

			this.delegateEvents();

		},
		getContents: function () {

			var content = je.comment(this.model.get('cid'), this.model.get('dest'));
			if (!je.isEmpty(this.model.get('e')) && this.model.get('cid') == 'du') {
				content = '<strong>External definition: </strong>' + content;
			}
			if (!je.isEmpty(this.model.get('v')) && this.model.get('cid') == 'xrAst') {
				content = '<strong>Verified: </strong>' + content;
			}
			if (!je.isEmpty(this.model.get('v')) && this.model.get('cid') == 'xrAst' && je.isEmpty(this.model.get('dest'))) {
				content = 'Correct use of keyword <strong>"this"</strong>';
			}
			if (!je.isEmpty(this.model.get('dest')) && je.isEmpty(this.model.get('e'))) {
				content += '<br/><strong>Click to follow link.</strong>';
			}
			return content;

		},
		events: {
					 'click': 'handle'
		},
		handle: function () {
			var dest = this.model.get("dest");
			if (!je.isEmpty(dest) && je.isEmpty(this.model.get("e"))) {
				if (dest.length > 8) {
					// external link
					var win = window.open(dest, '_blank');
					win.focus();
				} else {
					je.router.navigate('go/' + this.model.get('id'), true); // back button
					je.router.navigate('go/' + dest, true);
				}
			}
		}
	});

})(je || {});