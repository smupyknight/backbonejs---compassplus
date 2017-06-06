$(function () {
	'use strict';
	
	// First
	je.reviewMode = true;
	je.version = '1.0.15';
	je.minimumApiVersion = {
		whiteListMode: '2.0'
	};

	console.log('je.version', je.version);

	toastr.options = {
		'timeOut': 3000,
		"positionClass": "toast-bottom-right",
	};

	// hide features 
	var jeugeneRegex = /jeugene.com$/;
	//var jeugeneRegex = /localhost$/; //debug 
	if (je.store.whid && je.store.whid !== "" && je.store.whid !== 0){
		$('.jeugene-only').show();
	}

	 //SIDEBAR TRIGGER
	$('.left-trigger').click(function () {
		$('body').toggleClass('left-on');
	});

	function toggleReviewMode() {
		je.reviewMode = !je.reviewMode;
		$('body').toggleClass('review-off');
	}

	$('#closeReviewMode, #openReviewMode').click(toggleReviewMode);

	// Click to dismiss
	$('.right').click(function (e) {
		if ($(e.target).hasClass('right')) {
			je.categories.each(function (category) {
				if (!je.isEmpty(category.selected)) {
					category.deselect(category.selected.get('id'));
				}
			});
		}
	});

	$('.right').on('click', '.btn-action', function(e){
		$('[data-original-title]').popover('hide');
		var btn = $(this);
		var cid = btn.data('cid'),
				iid = btn.data('iid'),
				action = btn.data('action');

		if (action === 'dismiss'){
			je.categories.findWhere({ id: cid }).dismiss(iid);
		} else {
			je.categories.findWhere({ id: cid }).activate(iid);
		}

	});

	$('#editDocument').click(function(e){
		var url;
		if (je.edit_on){
			// TURN OFF EDIT MODE
			url = 'compass://' + je.store.whid + '/edit_off';
			$(this).removeClass('edit-mode').find('span').text('Enter Edit Mode (One Screen)');
			$('body').removeClass('edit-mode');
			je.edit_on = false;

			// no need resize back
			if (!je.twoScreenEditMode){
				window.open(url, '_self');
				console.log('url', url);
			}
		} else {
			document.title = 'jEugene - ' + je.store.whid;
			url = 'compass://' + je.store.whid +'/edit_on';
			$(this).addClass('edit-mode').find('span').text('Exit Edit Mode');
			// TURN ON EDIT MODE
			if (e.shiftKey){
				je.twoScreenEditMode = true;
				url += '?noresize=true';
			} else {
				je.twoScreenEditMode = false;
				$('body').addClass('edit-mode');
			}
			je.edit_on = true;
			window.open(url, '_self');
		}

	});

	je.activateWhiteListMode = function(){
		console.log('Activating whitelist mode...');
		var $body = $('body');
		$body.bind('keydown.whitelist', function(e){
			if (e.shiftKey){
				je.up.whitelistMode = true;
				$(this).addClass('whitelist-mode');
			} 
		});
		$body.bind('keyup.whitelist', function(e){
			if (!e.shiftKey){
				je.up.whitelistMode = false;
				$(this).removeClass('whitelist-mode');
			} 
		});

		var helpInfo = 'Hold SHIFT to add to list of known phrases';
		var text = '<div class="alert-help"><i class="glyphicon glyphicon-info-sign"></i>' + helpInfo + '</div>';
		$('#up_el .issuesList').prepend(text);
	};

	je.activateEditModes = function(){
		console.log('Activating edit modes one and two handlers...');
		var $body = $('body');
		$body.bind('keydown.editmode', function(e){
			if (e.shiftKey && !je.edit_on){
				$('#editDocument span').text('Enter Edit Mode (Two Screens)');
			} 
		});
		$body.bind('keyup.editmode', function(e){
			if (!e.shiftKey && !je.edit_on){
				$('#editDocument span').text('Enter Edit Mode (One Screen)');
			} 
		});
	};

	je.activateEditModes();

	je.deactivateWhiteListMode = function(){
		var $body = $('body');
		$body.unbind('keydown.whitelist');
		$body.unbind('keyup.whitelist');
	};

	je.restService.apiVersion(function(response){
		if (response.version){
			console.log('API version:', response.version);
			if (versionCompare(response.version, je.minimumApiVersion.whiteListMode) >= 0){
				je.activateWhiteListMode();
			}
		}
	});

	// Insert compass key
	$('#compass_key').text(je.store.stateId);

	// Start routing
	je.router = new je.Router();
	Backbone.history.start();

	// Utils
	je.assemble = function (category, collection) {

		for (var i = 0; i < collection.length; i++) {

			var item = collection[i];

			var issue = new je.Issue({
				id: item.id,
				name: item.name,
				dest: item.dest,
				comment: je.comment(category.get("id"), item.comment),
				occurrences: new je.Occurrences()
			});
			
			// Pre-dismissal used here
			if(!je.isEmpty(je.store.preDismissed)) {
				if(je.store.preDismissed.hasOwnProperty(item.id)) {
					issue.set("dismissed", true);
				}
			}

			for (var j = 0; j < item.occurrences.length; j++) {
				var occur = item.occurrences[j];
				var occurrence = new je.Occurrence({ id: occur });
				issue.add(occurrence);
				new je.OccurrenceView({ model: occurrence });
			}

			category.add(issue);

		}

	};

	je.assembleAssists = function (collection, cid) {

		for (var i = 0; i < collection.length; i++) {

			var item = collection[i];

			var _style = 'blueAssist';

			if ((cid == 'xrAst' && !je.isEmpty(item.v)) ||
							 cid == 'spConstAst') {
				_style = 'greenAssist';
			}

			var assist = new je.Assist({
				id: item.id,
				cid: cid,
				dest: item.dest,
				e: item.e,
				style: _style,
				v: item.v
			});

			new je.AssistView({ model: assist });
		}
	};

	// Build
	je.categories = new je.Categories();

	// Xref Assists
	je.assembleAssists(je.store.xrAsts, 'xrAst');

	// DefUses Assists
	je.assembleAssists(je.store.dus, 'du');

	// Spotlight Consistency Assists
	je.assembleAssists(je.store.spConstAsts, 'spConstAst');

	// Citation Assists
	je.assembleAssists(je.store.cites, 'cite');

	// Unknown Phrases
	je.up = new je.Category({
		id: "up",
		name: "Unknown Phrases",
		issues: new je.Issues()
	});
	je.categories.add(je.up);
	je.assemble(je.up, je.store.up);
	new je.CategoryView({ model: je.up });

	// Unused Definitions
	je.ud = new je.Category({
		id: "ud",
		name: "Unused Definitions",
		issues: new je.Issues()
	});
	je.categories.add(je.ud);
	je.assemble(je.ud, je.store.ud);
	new je.CategoryView({ model: je.ud });

	// Incorrect Uses of Definition

	je.lc = new je.Category({
		id: "lc",
		name: "Incorrect Uses of Definitions",
		issues: new je.Issues()
	});
	je.categories.add(je.lc);
	je.assemble(je.lc, je.store.lc);
	new je.CategoryView({ model: je.lc });

	// Inline-only Definitions
	je.ild = new je.Category({
		id: "ild",
		name: "Inline-Only Definitions",
		issues: new je.Issues()
	});
	je.categories.add(je.ild);
	je.assemble(je.ild, je.store.ild);
	new je.CategoryView({ model: je.ild });

	// Duplicate Definitions
	je.dd = new je.Category({
		id: "dd",
		name: "Duplicate Definitions",
		issues: new je.Issues()
	});
	je.categories.add(je.dd);
	je.assemble(je.dd, je.store.dd);
	new je.CategoryView({ model: je.dd });

	// Overriding Definitions
	je.od = new je.Category({
		id: "od",
		name: "Overriding Definitions",
		issues: new je.Issues()
	});
	je.categories.add(je.od);
	je.assemble(je.od, je.store.od);
	new je.CategoryView({ model: je.od });

	// Cross-Reference Issues
	je.xr = new je.Category({
		id: "xr",
		name: "Cross-Reference Issues",
		issues: new je.Issues()
	});
	je.categories.add(je.xr);
	je.assemble(je.xr, je.store.xr);
	new je.CategoryView({ model: je.xr });

	// Numbering Issues
	je.ni = new je.Category({
		id: "ni",
		name: "Numbering Issues",
		issues: new je.Issues()
	});
	je.categories.add(je.ni);
	je.assemble(je.ni, je.store.ni);
	new je.CategoryView({ model: je.ni });

	// Spotlight Consistency

	je.spin = new je.Category({
		id: "spin",
		name: "Inconsistencies",
		issues: new je.Issues()
	});
	je.categories.add(je.spin);
	je.assemble(je.spin, je.store.spin);
	new je.CategoryView({ model: je.spin });

	// Spotlight Alerts

	je.spa = new je.Category({
		id: "spa",
		name: "Alerts",
		issues: new je.Issues()
	});
	je.categories.add(je.spa);
	je.assemble(je.spa, je.store.spa);
	new je.CategoryView({ model: je.spa });
	
	// Dawn Brackets

	je.br = new je.Category({
		id: "br",
		name: "Square Brackets",
		issues: new je.Issues()
	});
	je.categories.add(je.br);
	je.assemble(je.br, je.store.br);
	new je.CategoryView({ model: je.br });

});