(function () {
	'use strict';

	je.CategoryView = Backbone.View.extend({

		template: _.template(
			'<div id="<%=info.id%>_el">' +
			'<a href="#<%=info.id%>" class="list-group-item category" data-toggle="collapse">' +
			'<i class="glyphicon glyphicon-<%=info.icon%>"></i> <%=info.name%><span style="margin-right:15px;" class="badge countBadge"><%=info.count%></span>' +
			'<button class="btn-issue-action btn-issue-action--dismissed-all"></button></a>' +
			'<div class="list-group issuesList collapse" id="<%=info.id%>">' +
			'</div>' +
			'</div>'
		),
		initialize: function () {

			this.render();
			this.listenTo(this.model.get('issues'), 'change:dismissed', this.refresh);
			this.delegateEvents();
		},
		render: function () {

			var info = {};
			info.id = this.model.get('id');
			info.name = this.model.get('name');
			info.count = this.count();
			info.icon = this.icon();

			this.$el = $($.parseHTML(this.template({ info: info })));

			$('#CategoriesList').append(this.$el);
			var $container = this.$el.children('.issuesList');

			var helpInfo = this.model.get('helpInfo');
			if (helpInfo){
				$container.append('<div class="alert-help"><i class="glyphicon glyphicon-info-sign"></i>' + helpInfo + '</div>');
			}

			// render out issues
			this.model.get('issues').each(function (issue) {
				var issueView = new je.IssueView({ model: issue });
				$container.append(issueView.$el);
			});

			this.setCategoryHeader(info.count);
		},
		setCategoryHeader: function (count) {
			if (count === 0) {
				this.$el.find('.category .btn-issue-action').removeClass('btn-issue-action--dismissed-all').addClass('btn-issue-action--reactivate-all');
			} else {
				this.$el.find('.category .btn-issue-action').removeClass('btn-issue-action--reactivate-all').addClass('btn-issue-action--dismissed-all');
			}
		},
		refresh: function () {
			var count = this.count();
			this.setCategoryHeader(count);
			this.$el.find('.countBadge').text(count);
		},
		count: function () {
			return this.model.get('issues').where({ dismissed: false }).length;
		},
		events: {
			'click .btn-issue-action': 'allIssueAction'
		},
		allIssueAction: function (e) {
			e.stopPropagation();
			e.preventDefault();
			// search category, because context will be lost on dismiss
			var category = je.categories.findWhere({ id: this.model.get('id') });
			var count = this.count();
			this.setCategoryHeader(count);

			// update all issues according status
			var delta = {}, deltaLength = 0;
			var activateAll = count === 0;
			if (activateAll) {
				// update all issues according status
				this.model.get('issues').each(function (issue) {
					category.activate(issue.get('id'), true);
					delta[issue.get('id')] = false;
					deltaLength++;
				});
			} else {
				this.model.get('issues').each(function (issue) {
					category.dismiss(issue.get('id'), true);
					delta[issue.get('id')] = true;
					deltaLength++;
				});
			}

			je.restService.updateIssues(je.store.stateId, delta, function(){
				// activateAll
				toastr.success(deltaLength + ' issue' + (deltaLength > 1 ? 's ' : ' ') + (activateAll ? 'reactivated' : 'dismissed'));
			});

		},
		icon: function () {
			switch (this.model.get('id')) {
				case 'up': return 'list-alt';
				case 'ud':
				case 'lc':
				case 'ild':
				case 'dd':
				case 'od': return 'transfer';
				case 'xr':
				case 'ni': return 'retweet';
				case 'spin':
				case 'spa': return 'eye-open';
				default: return 'eye-open';
			}
		}
	});

	je.Categories = Backbone.Collection.extend({ model: je.Category });

})(je || {});