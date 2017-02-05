$(document).ready(function() {

	// var apiUrl = 'https://api.tumblr.com/v2/blog/lovelivescans/posts/photo/?api_key=iOWuHVlzVyFGjvKGHSB1zro7RRgQbAwsGuW5VJhMwtYACWBg78&limit=3';
	var redditUrl = 'https://www.reddit.com/r/manga/search.json';
	var redditParams = '&sort=new&restrict_sr=true&type=link';

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

	$.ajax({
		type:'GET',
		url: redditUrl,
		data: {
			q: '[DISC] Tomo-chan wa Onnanoko!',
			sort: 'new',
			restrict_sr : 'true',
			type : 'link'
		}
	}).done(function(redditData) {
		var redditPost = redditData.data.children[0].data; //Get first child - may not be correct sometimes.
	
		var latestLink = redditPost.url;
		var redditPermalink = redditPost.permalink;
		var latestChapter = redditPost.title.match(/\d+/g)[0];
		
		var d = new Date(0);
		d.setUTCSeconds(redditPost.created_utc);
		var latestDate = d.toString();

		document.getElementById('latest-link').href = latestLink;
		document.getElementById('latest-date').innerHTML = latestDate;
		document.getElementById('latest-num').innerHTML = latestChapter;

		/* Update sync storage */
		chrome.storage.sync.set({
			'tomoLatestChapter': latestChapter
		}, function() {
			console.log('Latest chapter set to: ', latestChapter);
		});

		/* Update latest-link */
		$('#latest-link').removeClass('disabled');
		$('#latest-link').click(function() {
			chrome.tabs.create({
				url: $(this).attr('href')
			});
		});

		$('#latest-reddit').attr('href', 'https://reddit.com' + redditPermalink);
		$('#latest-reddit').removeClass('disabled');
		$('#latest-reddit').click(function() {
			chrome.tabs.create({
				url: $(this).attr('href')
			});
		});

	})
	.fail(function(err) {
		console.log(err);
		$('#ajax-err').parent().show();
		document.getElementById('ajax-err').innerHTML = "Sorry, there was an error: " + err.responseJSON.meta.msg;
	});

});