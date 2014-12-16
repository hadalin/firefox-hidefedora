var bannedProfiles = self.options.bannedProfiles;

var removeFedora = function(outerSelector, innerSelector) {
	$(outerSelector).each(function(index, element) {
		var el = $(element),
			profileId = el.find('[oid]').first().attr('oid');

		if(_.contains(bannedProfiles, profileId)) {
			$(this).remove();
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
