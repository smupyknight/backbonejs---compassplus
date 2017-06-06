(function () {
	'use strict';

	je.IssueView = Backbone.View.extend({
		template: _.template(
			'<div class="issue-container">' +
			'<a href="#<%=info.id%>" class="list-group-item issue" data-toggle="collapse"><%=info.display%> <span class="glyphicon glyphicon-ok" aria-hidden="false" style="display: none;"></span></a>' +
			'<button class="btn-issue-action btn-issue-action--dismissed"></button>' +
			'<div class="list-group collapse OccurrencesList" id="<%=info.id%>">' +
			'<% _.each(occurrences, function(occurrence) { %>' +
			'<a href="#go/<%=occurrence.id%>" data-occurrenceid="<%=occurrence.id%>" class="list-group-item occurrence"># <%=occurrence.order%></a>' +
			'<%});%>' +
			'</div>' +
			'</div>'
		),
		initialize: function () {
			var info = this.model.toJSON();
			var jsonifiedOccurrences = this.model.get('occurrences').length > 1 ? this.model.get('occurrences').toJSON() : {};
			this.$el = $($.parseHTML(this.template({
				info: info,
				occurrences: jsonifiedOccurrences
			})));
			// handle pre-dismissed situation
			this.refreshDismissed();
			var _model = this.model;

			this.$el.click(function () {
				je.navigateToId(_model.get('occurrences').findWhere({ order: 1 }).get('id'));

				if (je.edit_on){
					setTimeout(function(){
						var id = _model.get('occurrences').findWhere({ order: 1 }).get('id');
						var name = _model.get('name');
						
						if (je.store.idPidMap){
							var wordId = je.store.idPidMap[id];
							if (wordId){
								var link = 'compass://' + je.store.whid + '/' +je.store.idPidMap[id];
								if (name){
									link += '/' + encodeURIComponent(name);
								}
								if (je.twoScreenEditMode){
									link += '?noresize=true';
								}
								console.log('link: ' + id + '; ' + link);
								window.open(link, '_self');
							}
						}
					}, 1);
				}
			});

			this.listenTo(this.model, 'change:dismissed', this.refreshDismissed);
			this.listenTo(this.model, 'change:selected', this.refreshselected);

			this.delegateEvents();
		},
		refreshDismissed: function () {
			if (this.model.get('dismissed')) {
				this.$el.find('.glyphicon').show();
				this.$el.find('.btn-issue-action').removeClass('btn-issue-action--dismissed').addClass('btn-issue-action--reactivate');
			} else {
				this.$el.find('.glyphicon').hide();
				this.$el.find('.btn-issue-action').removeClass('btn-issue-action--reactivate').addClass('btn-issue-action--dismissed');
			}
		},
		refreshselected: function () {
			if (!this.model.get('selected')) {
				this.$el.children('.list-group').collapse('hide');
			}
		},
		events: {
			'click': 'toggleSelect',
			'click .occurrence': 'occurrenceClick',
			'click .btn-issue-action': 'issueAction'
		},
		occurrenceClick: function(e){
			if (je.edit_on){
				e.stopPropagation();
				var id = $(e.currentTarget).data('occurrenceid');
				var name = this.model.get('name');
				
				if (je.store.idPidMap){
					var wordId = je.store.idPidMap[id];
					if (wordId){
						var link = 'compass://' + je.store.whid + '/' + je.store.idPidMap[id];
						if (name){
							link += '/' + encodeURIComponent(name);
						}
						if (je.twoScreenEditMode){
							link += '?noresize=true';
						}
						console.log('link: ' + id + '; ' + link);
						window.open(link, '_self');
					}
				}
			}
		},
		toggleSelect: function (e) {

			if ($(e.target).hasClass('issue')) {
				if (this.model.get('selected')) {
					je.categories.findWhere({ id: this.model.get('cid') }).deselect(this.model.get('id'));
				} else {
					je.categories.findWhere({ id: this.model.get('cid') }).select(this.model.get('id'));
				}
			}
			// e.preventDefault();
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
		}
	});

})(je || {});