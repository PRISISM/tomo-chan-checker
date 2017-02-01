/*
	Tomo-chan Checker!
	@toashel
 */

var apiUrl = 'https://api.tumblr.com/v2/blog/lovelivescans/posts/photo/?api_key=iOWuHVlzVyFGjvKGHSB1zro7RRgQbAwsGuW5VJhMwtYACWBg78&limit=1';

// options for notification api
var opt = {
	type: "basic",
	title: "Tomo-chan Checker!",
	message: "A new chapter is available! Click on this notification or the extension to check it out!",
	iconUrl: "img/icon.png"
};

// Set default refresh time in sync storage
chrome.storage.sync.set({
	'tomoRefreshTime': 30
});

function getLatestPost() {
	return $.get(apiUrl, function() {}).then(function(result) {
		return result.response;
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
		var firstItem = data.posts[0];
		var chapterNum = firstItem.tags[0];

		chrome.storage.sync.set({
			'tomoLatestChapter': chapterNum
		}, function() {
			console.log('Latest chapter set to: ', chapterNum);
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
		var firstItem = data.posts[0];
		newChapterNum = parseInt(firstItem.tags[0]);

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
	scheduleRequest();
});

chrome.alarms.onAlarm.addListener(function() {
	onAlarm();
});