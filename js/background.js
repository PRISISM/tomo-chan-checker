/*
	Tomo-chan Checker!
	@toashel
 */

var redditUrl = 'https://www.reddit.com/r/manga/search.json';

// options for notification api
var opt = {
	type: "basic",
	title: "Tomo-chan Checker!",
	message: "A new chapter is available! Click on this notification or the extension to check it out!",
	iconUrl: "img/icon.png"
};

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

/* Initially set alarm */
function scheduleRequest() {
	console.log('Setting Alarm to 30 minutes refresh...');
	chrome.alarms.create('refresh', {
		periodInMinutes: 30
	});
}

function setStorage() {
	console.log('Setting Storage...');
	var chapterPromise = getLatestPost();

	chapterPromise.then(function(data) {
		var chapterNum = data.tags[0];

		chrome.storage.sync.set({
			'tomoLatestChapter': chapterNum
		}, function() {
			console.log('Latest chapter set to:', chapterNum);
		});
	});
}

function compareChapters() {
	console.log('Comparing Chapters...');

	var chapterPromise = getLatestPost();
	var newChapterNum;
	var latestChapter;

	/* Check if the new chapter is greater than the one stored in sync/local storage*/
	chapterPromise.then(function(data) {
		console.log(data);
		var newChapterNum = parseInt(data.tags[0]);

		chrome.storage.sync.get('tomoLatestChapter', function(storageObj) {
			latestChapter = parseInt(storageObj.tomoLatestChapter);
			console.log(latestChapter, storageObj);

			if (newChapterNum > latestChapter) {
				console.log(newChapterNum + ' > ' + latestChapter);
				chrome.browserAction.setBadgeText({
					text: "new"
				});
				var notification = chrome.notifications.create(opt);

			} else {
				console.log(newChapterNum, latestChapter);
			}
		});


	});
}

function onAlarm() {
	console.log('Alarm!');

	compareChapters();

}

/*
Sets a listener for the notification
Updates the latest chapter in storage sync and opens the chapter
 */
chrome.notifications.onClicked.addListener(function() {
	var notificationPromise = getLatestPost();

	notificationPromise.then(function(data) {
		var firstItem = data.posts[0];
		var latestLink = firstItem.post_url;
		var notifChapterNum = firstItem.tags[0];

		chrome.tabs.create({url: latestLink}, function() {
			chrome.browserAction.setBadgeText({
				'text': ''
			});

			chrome.storage.sync.set({
				'tomoLatestChapter': notifChapterNum
			}, function() {
				console.log('Latest chapter set to: ', notifChapterNum);
			});

		});

	});
});

/* 
Sets the latest chapter and alarm whenever the extension is installed, or Chrome is updated.
*/
chrome.runtime.onInstalled.addListener(setStorage);

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({
		'tomoRefreshTime': 30
	});
	scheduleRequest();
});

chrome.alarms.onAlarm.addListener(function() {
	onAlarm();
});