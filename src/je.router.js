(function () {
	'use strict';

	je.Router = Backbone.Router.extend({

		routes: {
			'go/:id': 'navigateToId',
			'do/:cid/:iid/dismiss': 'dismiss',
			'do/:cid/:iid/activate': 'activate'
		},
		navigateToId: function (id) {
			je.navigateToId(id);
		},
		dismiss: function (cid, iid) {
			
			$('[data-original-title]').popover('hide');
			if (je.categories){
				je.categories.findWhere({ id: cid }).dismiss(iid);
					
				var delta = {};
				delta[iid] = true;

				je.restService.updateIssues(je.store.stateId, delta, function(res){
					toastr.success('1 issue dismissed');
				});
			}
			
		},
		activate: function (cid, iid) {
			
			$('[data-original-title]').popover('hide');
			if (je.categories){
				je.categories.findWhere({ id: cid }).activate(iid);
				
				var delta = {};
				delta[iid] = false;
				
				je.restService.updateIssues(je.store.stateId, delta, function(res){
					toastr.success('1 issue reactivated');
				});
			}
			
		}

	});


})(je || {});