(function () {
	'use strict';
		var baseUrl = '',
				failIntervalValue = 20 * 1000, // 20 sec
				failInterval;

		je.restService = {
			failQueue: {
			}
		};

		je.restService.apiVersion = function(callback){
			$.ajax({
				headers: {
					Accept: "application/json"
				},
				'type': 'GET',
				'url': baseUrl + '/rest/compass/server/conditions',
			})
			.done(callback)
			.fail(function (data, status) {
				console.log('Can\'t get API version');
			});
		};

		je.restService.whitelistIssue = function(stateId, delta, whiteListString, done, ignoreSaveFail){
			var data = {
					stateId: stateId,
					deltaString: JSON.stringify(delta),
					whiteListString: whiteListString
			};

			$.ajax({
				headers: {
					'Accept': 'text/plain',
					'Content-Type': 'application/json'
				},
				'type': 'POST',
				'url': baseUrl + '/rest/compass/whitelist',
				'data': JSON.stringify(data),
				// 'dataType': 'json'
			})
			.done( function (data, status) {
				console.log("whitelistIssue: success=", data);
				
				// if network is up now and we have something in queue then we clear succes items
				if (je.restService.failQueue.delta){
					_.each(delta, function(value, key){
						if (je.restService.failQueue.delta[key] !== null) {
							if (je.restService.failQueue.delta[key] === false && value === true){
								delete je.restService.failQueue.delta[key];
							} else if (je.restService.failQueue.delta[key] === true && value === false){
								delete je.restService.failQueue.delta[key];
							} 
						}
					});
					var length = _.allKeys(je.restService.failQueue.delta).length;
					if (length === 0){
						clearInterval(failInterval);
					}
				}

				if (done){
					done(data);
				}
			})
			.fail( function (data, status) {
				console.log("updateIssues: error=", data);
				if (!ignoreSaveFail){
					saveFailQueue(stateId, delta);
				}
			});

		};

		je.restService.updateIssues = function(stateId, delta, done, ignoreSaveFail){
			var data = {
					stateId: stateId,
					deltaString: JSON.stringify(delta)
			};

			$.ajax({
				headers: {
					'Accept': 'text/plain',
					'Content-Type': 'application/json'
				},
				'type': 'POST',
				'url': baseUrl + '/rest/compass/update',
				'data': JSON.stringify(data),
				// 'dataType': 'json'
			})
			.done( function (data, status) {
				console.log("updateIssues: success=", data);
				
				// if network is up now and we have something in queue then we clear succes items
				if (je.restService.failQueue.delta){
					_.each(delta, function(value, key){
						if (je.restService.failQueue.delta[key] !== null) {
							if (je.restService.failQueue.delta[key] === false && value === true){
								delete je.restService.failQueue.delta[key];
							} else if (je.restService.failQueue.delta[key] === true && value === false){
								delete je.restService.failQueue.delta[key];
							} 
						}
					});
					var length = _.allKeys(je.restService.failQueue.delta).length;
					if (length === 0){
						clearInterval(failInterval);
					}
				}

				if (done){
					done(data);
				}
			})
			.fail( function (data, status) {
				console.log("updateIssues: error=", data);
				if (!ignoreSaveFail){
					saveFailQueue(stateId, delta);
				}
			});

		};

		var saveFailQueue = function(stateId, delta){
			if (!je.restService.failQueue.stateId){
				je.restService.failQueue = { stateId: stateId, delta: delta };
			} else {
				_.each(delta, function(value, key){
					if (je.restService.failQueue.delta[key] === null) {
						// not exist - just add as new
						je.restService.failQueue.delta[key] = value;
					} else {
						// key netting
						if (je.restService.failQueue.delta[key] === false && value === true){
							delete je.restService.failQueue.delta[key];
						} else if (je.restService.failQueue.delta[key] === true && value === false){
							delete je.restService.failQueue.delta[key];
						} else {
							je.restService.failQueue.delta[key] = value;
						}
					}
				});
			}
			// console.log(je.restService.failQueue.delta);

			var queueLength = _.allKeys(je.restService.failQueue.delta).length;
			if (queueLength > 0){
				toastr.info(queueLength + ' actions queued due to network interruption.');
				// create new interval to sync data
				if (!failInterval){
					failInterval = setInterval(function(){
						var length = _.allKeys(je.restService.failQueue.delta).length;
						console.log('queued interval...', length);
						
						if (length > 0){
							je.restService.updateIssues(je.restService.failQueue.stateId, je.restService.failQueue.delta, function(){
								toastr.info(length + ' queued actions performed.');
								je.restService.failQueue = {};
								clearInterval(failInterval);
							}, true);
						} else {
								clearInterval(failInterval);
						}
					}, failIntervalValue);
				}
			} else {
				if (failInterval){
					clearInterval(failInterval);
				}
			} 
		};

})(je || {});
