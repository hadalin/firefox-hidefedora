var TIME_PERIOD_CHECK_HOURS = 1,
	JSON_URL = 'https://jhvisser.com/hidefedora/reports/profiles.json',
	bannedProfiles = self.options.bannedProfiles,
	lastJSONUpdate = self.options.lastJSONUpdate,
	showReportButton = true,
	bannedWords = [];


self.port.on("bannedProfiles", function(payload) {
	if(typeof payload.bannedProfiles !== "undefined") {
		bannedProfiles = payload.bannedProfiles;
	}
});

self.port.on("prefsChange", function(payload) {
	if(typeof payload.showReportButton !== "undefined") {
		showReportButton = payload.showReportButton;
	}
	if(typeof payload.bannedWords !== "undefined") {
		bannedWords = _.filter(_.map(payload.bannedWords.split(';'),
			function(word) { return word.trim(); }), function(word) { return word !== ""; });
	}
});


var submitReport = function(profileId, comment) {
	$.ajax({
		url: 'https://jhvisser.com/hidefedora/reports',
		type: 'POST',
		data: {
			submit: 1,
			profileUrl: profileId,
			comment: comment,
			youtubeUrl: window.location.href
		}
	});
};

var onReportClick = function() {
	if(confirm('Are you sure you want to report fedora profile?')) {
		var profileId = $(this).data("profileId"),
			comment = $(this).data("comment"),
			thisEl = $(this);

		submitReport(profileId, comment);

		thisEl.prop('disabled', true).html('Reported').addClass('hide-fedora-reported');

		setTimeout(function() {
			thisEl.remove();
		}, 1000);
	}
};

var removeFedora = function(outerSelector) {
	$(outerSelector).each(function(index, element) {
		var el = $(element),
			profileId = el.attr('data-aid'),
			comment = el.find('.comment-text-content').first().text(),
			thisEl = $(this);

		if(_.contains(bannedProfiles, profileId) ||
			_.some(bannedWords, function(word) {
				return comment.toLowerCase().indexOf(word.toLowerCase()) > -1; 
			})) {

			thisEl.parent().remove();
		}
		else if(showReportButton && !thisEl.hasClass("hide-fedora-tagged")) {
			thisEl.addClass("hide-fedora-tagged");
			thisEl
				.find('.footer-button-bar')
				.first()
				.after('<button type="button" class="hide-fedora-report-btn">HF</button>');

			thisEl.find('.hide-fedora-report-btn')
				.data('profileId', profileId)
				.data('comment', comment)
				.click(onReportClick);
		}
	});
};

var execute = function() {
	removeFedora(".comment-item");
};

var fetchJSON = function(dateString) {
	$.getJSON(JSON_URL, function(res) {
		bannedProfiles = res.fedoras;
		lastJSONUpdate = dateString;
		self.port.emit('bannedProfilesChange', { bannedProfiles: bannedProfiles });
		self.port.emit('lastJSONUpdateChange', { lastJSONUpdate: dateString });
	});
};

self.port.on("lastJSONUpdate", function(payload) {
	if(typeof payload.lastJSONUpdate !== "undefined") {
		lastJSONUpdate = payload.lastJSONUpdate;

		var now = moment();
		if(moment(lastJSONUpdate).add(TIME_PERIOD_CHECK_HOURS, 'hours').isBefore(now)) {
			fetchJSON(now.toISOString());
		}
	}
});


$(function() {

	var target = document.querySelector('#watch-discussion');
	 
	if(target !== null) {

		// Set MutationObserver
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		var observer = new MutationObserver(function() {
			execute();
		});

		var config = { childList: true, subtree: true };
		 
		observer.observe(target, config);

		// Execute removal a couple of times before MutationObserver kicks in
		var counter = 0;
		var interval = setInterval(function() {
			execute();

			counter++;
			if(counter === 8) {
				clearInterval(interval);
			}
		}, 1000);
	}

});
