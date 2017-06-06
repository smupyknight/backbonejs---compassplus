(function () {
	'use strict';

		// Occurrence
	je.Occurrence = Backbone.Model.extend(je.Issue);

	je.Occurrences = Backbone.Collection.extend({
		model: je.Occurrence,
		nextOrder: function () {
			if (!this.length) return 1;
			return this.last().get("order") + 1;
		}
	});

})(je || {});