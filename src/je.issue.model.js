(function () {
	'use strict';

	je.Issue = Backbone.Model.extend({
		defaults: {
			id: '',
			cid: '',
			order: '',
			name: '',
			display: '',
			dest: '',
			comment: '',
			//occurrences
			selected: false,
			dismissed: false
		},
		add: function (occurrence) {
			occurrence.set("iid", this.get("id"));
			occurrence.set("dest", this.get("dest"));
			occurrence.set("comment", this.get("comment"));
			occurrence.set("selected", this.get("selected"));
			occurrence.set("dismissed", this.get("dismissed"));
			occurrence.set("order", this.get("occurrences").nextOrder());
			this.get("occurrences").add(occurrence);
		},
		display: function () {
			if (!je.isEmpty(this.get('name'))) {
				return this.get('name');
			} else {
				return '# ' + this.get('order');
			}
		},
		postAction: function () {
			
			var delta = {};
			var dismissed = this.get('dismissed');
			delta[this.get('id')] = dismissed;

			if (this.get('cid') === 'up' && je.up.whitelistMode && dismissed){
				var whiteListString = this.get('name');
				je.restService.whitelistIssue(je.store.stateId, delta, whiteListString, function(res){
					toastr.success('1 issue added to whitelist');
				});
			} else {
				je.restService.updateIssues(je.store.stateId, delta, function(res){
					toastr.success('1 issue ' + (dismissed ? 'dismissed' : 'reactivated'));
				});
			}
		}
	});

	je.Issues = Backbone.Collection.extend({
		model: je.Issue,
		nextOrder: function () {
			if (!this.length) return 1;
			return this.last().get("order") + 1;
		}
	});

})(je || {});