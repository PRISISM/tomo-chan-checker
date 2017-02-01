$(document).ready(function() {


	var apiUrl = 'https://api.tumblr.com/v2/blog/lovelivescans/posts/photo/?api_key=iOWuHVlzVyFGjvKGHSB1zro7RRgQbAwsGuW5VJhMwtYACWBg78&limit=1';
	var redditUrl = 'https://www.reddit.com/r/manga/search.json';

	$('#settings-button').click(function(e) {
		e.preventDefault();
		$('.nav-tabs #settings-tab').tab('show');
		// $('#settings-button').addClass('active');
	});

	// $('#home-button').click(function(e) {
	// 	e.preventDefault();
	// 	$('.nav-tabs > .active').next('li').tab('show');
	// 	// $('#settings-button').addClass('active');
	// });


	$.get(apiUrl, function() {})
		.done(function(data) {
			var firstItem = data.response.posts[0];
			var latestLink = firstItem.post_url;
			var latestDate = new Date(firstItem.date).toString();
			var chapterNum = firstItem.tags[0];

			document.getElementById('latest-link').href = latestLink;
			document.getElementById('latest-date').innerHTML = latestDate;
			document.getElementById('latest-num').innerHTML = chapterNum;

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
			document.getElementById('ajax-err').innerHTML = err;
		});


});