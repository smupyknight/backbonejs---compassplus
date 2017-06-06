(function () {
	'use strict';

	je.Category = Backbone.Model.extend({
		defaults: {
			id: '',
			name: '',
			count: '',
			helpInfo: ''
			// issues
			// selected
		},
		add: function (issue) {
			var cid = this.get("id");
			issue.set("cid", cid);
			issue.get("occurrences").each(function (occurrence) {
				occurrence.set("cid", cid);
			});
			issue.set("order", this.get("issues").nextOrder());
			issue.set("display", issue.display());
			this.get("issues").add(issue);
		},
		dismiss: function (iid, skipPost) {

			var issue = this.get("issues").findWhere({ 'id': iid });
			issue.set("dismissed", true);

			issue.get("occurrences").each(function (occurrence) {
				occurrence.set("dismissed", true);
				occurrence.set("selected", false);
			});
			if (!skipPost){
				issue.postAction();
			}
		},
		activate: function (iid, skipPost) {

			var issue = this.get("issues").findWhere({ 'id': iid });
			this.selected = issue;

			issue.set("dismissed", false);

			issue.get("occurrences").each(function (occurrence) {
				occurrence.set("dismissed", false);
			});
			if (!skipPost){
				issue.postAction();
			}
		},
		select: function (iid) {

			// clear current selection
			if (!je.isEmpty(this.selected)) {
				this.deselect(this.selected.get('id'));
			}

			// select
			this.selected = this.get('issues').findWhere({ id: iid });
			this.selected.set('selected', true);
			this.selected.get('occurrences').each(function (occurrence) {
				occurrence.set('selected', true);
			});

		},
		deselect: function (iid) {
			if (!je.isEmpty(this.selected) && this.selected.get('id') != iid) {
				//shouldn't happen
				this.selected.set('selected', false);
				this.selected.get('occurrences').each(function (occurrence) {
					occurrence.set('selected', false);
				});
				this.selected = null;
			}
			var target = this.get('issues').findWhere({ id: iid });
			target.set('selected', false);
			target.get('occurrences').each(function (occurrence) {
				occurrence.set('selected', false);
			});
		}
	});

})(je || {});