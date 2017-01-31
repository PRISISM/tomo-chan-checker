/*
	Tomo-chan Checker!
	@toashel
 */

var apiUrl = 'https://api.tumblr.com/v2/blog/lovelivescans/posts/photo/?api_key=iOWuHVlzVyFGjvKGHSB1zro7RRgQbAwsGuW5VJhMwtYACWBg78&limit=1';
var refreshTime = 0.5;
var latestChapter;

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
	console.log('Schedule Request...');
	chrome.alarms.create('refresh', {
		periodInMinutes: refreshTime
	});
}

function setStorage() {
	console.log('Setting Storage...');
	var chapterPromise = getLatestPost();
	chapterPromise.then(function(data) {
		console.log(data);
		var firstItem = data.posts[0];
		var chapterNum = firstItem.tags[0];

		chrome.storage.sync.set({'tomoLatestChapter' : chapterNum}, function() {
			console.log('Latest chapter set to: ', chapterNum);
		});
	});
}

function onAlarm() {
	console.log('Alarm!');

	// Update the latest post
	// getLatestPost();

	chrome.browserAction.setBadgeText({
		text: "new"
	});
}


if (chrome.runtime.onStartup) {
	chrome.runtime.onStartup.addListener(function() {
		scheduleRequest();
		// setStorage();
	});
}
chrome.alarms.onAlarm.addListener(function() {
	onAlarm();
});