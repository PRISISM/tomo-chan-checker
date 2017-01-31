/*
	Tomo-chan Checker!
	@toashel
 */

var apiUrl = 'https://api.tumblr.com/v2/blog/lovelivescans/posts/photo/?api_key=iOWuHVlzVyFGjvKGHSB1zro7RRgQbAwsGuW5VJhMwtYACWBg78&limit=1';
var refreshTime = 0.5;
// var latestChapter = 460; // Placeholder value 

function getLatestPost() {
	return $.get(apiUrl, function() {}).then(function(result) {
		return result.response;
	});
	// .done(function (data) {
	// 	var firstItem = data.response.posts[0];
	// 	var chapterNum = firstItem.tags[0];
	// 	var latestDate = new Date(firstItem.date);

	// 	return chapterNum;
	// });
}

function setLatestChapter(num) {
	latestChapter = num;
}

function scheduleRequest() {
	console.log('Setting Alarm...');
	chrome.alarms.create('refresh', {
		periodInMinutes: refreshTime
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
	var newChapter;
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
Sets the latest chapter and alarm whenever the extension is installed, or Chrome is updated.
*/
chrome.runtime.onInstalled.addListener(setStorage);

chrome.runtime.onInstalled.addListener(function() {
	scheduleRequest();
});

chrome.alarms.onAlarm.addListener(function() {
	onAlarm();
});