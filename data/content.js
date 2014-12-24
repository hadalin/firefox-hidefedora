var bannedProfiles = self.options.bannedProfiles;


var getParentUrl = function() {
	var isInIFrame = (parent !== window),
        parentUrl = null;

    if(isInIFrame) {
        parentUrl = document.referrer;
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
	var profileId = $(this).data("profileId"),
		comment = $(this).data("comment"),
		thisEl = $(this);

	submitReport(profileId, comment);

	thisEl.prop('disabled', true).html('Reported').addClass('hide-fedora-reported');

	setTimeout(function() {
		thisEl.remove();
	}, 1000);
};

var removeFedora = function(outerSelector, innerSelector) {
	$(outerSelector).each(function(index, element) {
		var el = $(element),
			profileId = el.find('[oid]').first().attr('oid'),
			comment = el.find('div.Ct').first().text(),
			thisEl = $(this);

		if(_.contains(bannedProfiles, profileId)) {
			$(this).remove();
		}
		else {
			if(!thisEl.hasClass("hide-fedora-tagged")) {
				thisEl.addClass("hide-fedora-tagged");
				thisEl
					.find('.RN.f8b')
					.first()
					.after('<button type="button" class="hide-fedora-report-btn">Report</button>');

				thisEl.find('.hide-fedora-report-btn')
					.data('profileId', profileId)
					.data('comment', comment)
					.click(onReportClick);
			}
		}
	});
};

var execute = function() {
	removeFedora(".Yp.yt.Xa", ".ve.oba.HPa > a");
	removeFedora(".Ik.Wv", ".fR > a");
};

$.getJSON("https://jhvisser.com/hidefedora/getJSON.php", function(res) {
	bannedProfiles = res.fedoras;
	self.port.emit('msg', { bannedProfiles: bannedProfiles });
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
