(function () {
	'use strict';

	je.Assist = Backbone.Model.extend({
		defaults: {
			id: '',
			cid: '',
			dest: '',
			comment: '',
			style: ''
		}
	});

})(je || {});