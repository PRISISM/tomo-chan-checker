$(document).ready(function() {

	var apiUrl = 'https://api.tumblr.com/v2/blog/lovelivescans/posts/photo/?api_key=iOWuHVlzVyFGjvKGHSB1zro7RRgQbAwsGuW5VJhMwtYACWBg78&limit=3';
	var redditUrl = 'https://www.reddit.com/r/manga/search.json';

	function getLatestPost() {
		// Returns a promise that returns a post that has a valid tag
		return $.get(apiUrl, function() {}).then(function(result) {
			for (var i = 0; i < result.response.posts.length; i++) {
				var tag = result.response.posts[i].tags[0];
				if (tag == parseInt(tag))
					return result.response.posts[i];
			}

		});
	}

	/*Update badge*/
	chrome.browserAction.setBadgeText({
		'text': ''
	});

	chrome.storage.sync.get('tomoRefreshTime', function(storageObj) {
		var refreshMins = parseInt(storageObj.tomoRefreshTime);
		var refreshTime = Math.floor((refreshMins / 60)).toString() + 'h ' +
			(refreshMins % 60).toString() + 'm';
		$('#refresh-time').text(refreshTime);
	});

	$('#settings-button').click(function(e) {
		e.preventDefault();
		$('.nav-tabs #settings-tab').tab('show');
	});

	$('#main-button').click(function(e) {
		e.preventDefault();
		$('.nav-tabs #main-tab').tab('show');
	});

	$('.selectpicker').selectpicker();

	$('#refresh-button').click(function() {
		var selectedRate = $('#refresh-select').find("option:selected").val();

		chrome.storage.sync.set({
			'tomoRefreshTime': parseInt(selectedRate)
		}, function() {
			console.log('Refresh time set to: ' + selectedRate);

			chrome.alarms.create('refresh', {
				periodInMinutes: parseInt(selectedRate)
			});

			console.log('Alarm set to: ' + selectedRate);
			var refreshMins = parseInt(selectedRate);
			var refreshTime = Math.floor((refreshMins / 60)).toString() + 'h ' +
				(refreshMins % 60).toString() + 'm';
			$('#refresh-time').text(refreshTime);

		});

	});

	var chapterPromise = getLatestPost();
	chapterPromise.then(function(data) {

		var latestLink = data.post_url;
		var latestDate = new Date(data.date).toString();
		var chapterNum = data.tags[0];

		document.getElementById('latest-link').href = latestLink;
		document.getElementById('latest-date').innerHTML = latestDate;
		document.getElementById('latest-num').innerHTML = chapterNum;

		/* Update sync storage */
		chrome.storage.sync.set({
			'tomoLatestChapter': chapterNum
		}, function() {
			console.log('Latest chapter set to: ', chapterNum);
		});

		$('#latest-link').removeClass('disabled');
		$('#latest-link').click(function() {
			chrome.tabs.create({
				url: $(this).attr('href')
			});
		});

		$.ajax({
				type: 'GET',
				url: redditUrl,
				data: {
					q: '[DISC] Tomo-chan wa Onnanoko! ' + chapterNum
				}
			})
			.done(function(redditData) {
				var redditPost = redditData.data.children[0];
				$('#latest-reddit').attr('href', 'https://reddit.com' + redditPost.data.permalink);
				$('#latest-reddit').removeClass('disabled');

				$('#latest-reddit').click(function() {
					chrome.tabs.create({
						url: $(this).attr('href')
					});
				});

			});
	})
	.fail(function(err) {
		console.log(err);
		$('#ajax-err').parent().show();
		document.getElementById('ajax-err').innerHTML = "Sorry, there was an error: " + err.responseJSON.meta.msg;
	});


});