(function () {
	'use strict';

	je.OccurrenceView = Backbone.View.extend({

		initialize: function () {
			this.listenTo(this.model, 'change', this.refresh);
			this.$el = $("#" + this.model.get("id"));
			this.render();
		},
		render: function () {

			// self style
			this.$el.addClass('dottedBadge');

			this.$el.popover({
				container: $('.right'),
				content: this.getContents(),
				placement: "auto",
				html: true,
				trigger: "manual",
				animation: false
			}).on("mouseenter", function () {
				if (je.reviewMode) {
					var _this = this;
					$(this).popover("show");
					$(".popover").on("mouseleave", function () {
						$(_this).popover('hide');
					});
				}
			}).on("mouseleave", function () {
				if (je.reviewMode) {
					var _this = this;
					setTimeout(function () {
						if (!$(".popover:hover").length) {
							$(_this).popover("hide");
						}
					}, 300);
				}
			});

			this.delegateEvents();

		},
		refresh: function () {
			// self style
			if (this.model.get("dismissed")) {
				this.$el.removeClass('dottedBadge');
				//                   this.$el.removeClass('yellowBadge');
				//	    	   } else if(this.model.get("selected")) {
				//                   this.$el.addClass('yellowBadge');
			} else {
				this.$el.addClass('dottedBadge');
				//                   this.$el.removeClass('yellowBadge');
			}

			// popover
			var popover = this.$el.data("bs.popover");

			if (je.isEmpty(popover)) {
				console.log('popover null: ' + this.model.get('id'));
			} else {
				popover.options.content = this.getContents();
			}
		},
		getContents: function () {

				var template = _.template("<strong><%=prefix%></strong><p><%=comment%><%=suffix%></p><button type='button' " + 
				"class='btn btn-<%=cid%> btn-info btn-action btn-xs' data-cid='<%=cid%>' data-iid='<%=iid%>' data-action='<%=action%>'><span><%=text%></span></button>");

				var info = {
					comment: this.model.get('comment'),
					cid: this.model.get('cid'),
					iid: this.model.get('iid'),
					suffix: '' // Empty
				};

				if (this.model.get('dismissed')) {
					info.prefix = 'Dismissed: ';
					info.action = 'activate';
					info.text = 'Reactivate';
				} else {
					info.prefix = '';
					info.action = 'dismiss';
					info.text = 'Dismiss';
				}

				if (this.model.get('cid') == 'spa' && !je.isEmpty(this.model.get('dest'))) {
					info.suffix = ' Please click to see more information.';
				}

				return template(info);

		},
		events: {
			'click': 'handle'
		},
		handle: function (e) {
			e.stopPropagation();
			var dest = this.model.get("dest");
			if (!je.isEmpty(dest)) {
				if (dest.length > 8) {
					// external link
					var win = window.open(dest, '_blank');
					win.focus();
				} else {
					var id = this.model.get('id');

					je.router.navigate('go/' + id, true); // back button
					je.router.navigate('go/' + dest, true);

					if (je.edit_on){
						setTimeout(function(){
							var link = 'compass://' + je.store.whid + '/' + je.store.idPidMap[id];
							console.log('link: ' + id + '; ' + link);
							if (je.twoScreenEditMode){
								link += '?noresize=true';
							}
							window.open(link, '_blank');
						}, 1);
					}
				}
			}
		},
		issueAction: function(e){
			e.stopPropagation();
			var cid = this.model.get('cid');
			var iid = this.model.get('id');
			if (this.model.get('dismissed')) {
				je.categories.findWhere({ id: cid }).activate(iid);
			} else {
				je.categories.findWhere({ id: cid }).dismiss(iid);
			}
			this.postAction();
		}

	});

})(je || {});