var bannedProfiles = self.options.bannedProfiles,
	showReportButton = true,
	bannedWords = [];


self.port.on("prefsChange", function(payload) {
	if(typeof payload.showReportButton !== "undefined") {
		showReportButton = payload.showReportButton;
	}
	if(typeof payload.bannedWords !== "undefined") {
		bannedWords = _.filter(_.map(payload.bannedWords.split(';'),
			function(word) { return word.trim(); }), function(word) { return word !== ""; });
	}
});


var getParentUrl = function() {
	var isInIFrame = (parent !== window),
        parentUrl = null;

    if(isInIFrame) {
        parentUrl = _.escape(document.referrer);
    }

    return parentUrl;
};

var submitReport = function(profileId, comment) {
	$.ajax({
		url: 'https://jhvisser.com/hidefedora/html/submit/submit.php',
		type: 'POST',
		data: {
			submit: 1,
			profileUrl: profileId,
			comment: comment,
			youtubeUrl: getParentUrl()
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

var removeFedora = function(outerSelector, innerSelector) {
	$(outerSelector).each(function(index, element) {
		var el = $(element),
			profileId = el.find('[oid]').first().attr('oid'),
			comment = el.find('div.Ct').first().text(),
			thisEl = $(this);

		if(_.contains(bannedProfiles, profileId) ||
			_.some(bannedWords, function(word) {
				return comment.toLowerCase().indexOf(word.toLowerCase()) > -1; 
			})) {

			$(this).remove();
		}
		else if(showReportButton && !thisEl.hasClass("hide-fedora-tagged")) {
			thisEl.addClass("hide-fedora-tagged");
			thisEl
				.find('.RN.f8b')
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
	removeFedora(".Yp.yt.Xa", ".ve.oba.HPa > a");
	removeFedora(".Ik.Wv", ".fR > a");
};

$.getJSON("https://jhvisser.com/hidefedora/getJSON.php", function(res) {
	bannedProfiles = res.fedoras;
	self.port.emit('bannedProfilesChange', { bannedProfiles: bannedProfiles });
});


$(function() {

	var target = document.querySelector('.yJa');
	 
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
