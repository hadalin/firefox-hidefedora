var self = require("sdk/self"),
	data = self.data,
	pageMod = require("sdk/page-mod"),
	ss = require("sdk/simple-storage"),
	simplePrefs = require("sdk/simple-prefs");


if (!ss.storage.bannedProfiles) {
  ss.storage.bannedProfiles = [];
}

var bannedProfiles = ss.storage.bannedProfiles;


function startListening(worker) {
	function onPrefsChange(pref) {
		var payload = {};
		payload[pref] = simplePrefs.prefs[pref];
		worker.port.emit('prefsChange', payload);
	}

	simplePrefs.on("showReportButton", onPrefsChange);
	worker.port.emit("prefsChange", {
		showReportButton: simplePrefs.prefs.showReportButton
	});

	simplePrefs.on("bannedWords", onPrefsChange);
	worker.port.emit("prefsChange", {
		bannedWords: simplePrefs.prefs.bannedWords
	});

	worker.port.on('bannedProfilesChange', function(payload) {
		ss.storage.bannedProfiles = payload.bannedProfiles;
	});
}
 
pageMod.PageMod({
	include: ["*.google.com", "*.googleapis.com", "*.jhvisser.com"],
	contentScriptWhen: 'end',
	contentScriptFile: [data.url("jquery-1.11.1.min.js"), data.url("underscore-min.js"), data.url("content.js")],
	contentStyleFile: data.url("content.css"),
	contentScriptOptions: { 
		"bannedProfiles": bannedProfiles
	},
	onAttach: startListening
});

