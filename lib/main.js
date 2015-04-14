var self = require("sdk/self"),
	data = self.data,
	pageMod = require("sdk/page-mod"),
	ss = require("sdk/simple-storage"),
	simplePrefs = require("sdk/simple-prefs");


if (!ss.storage.bannedProfiles) {
	ss.storage.bannedProfiles = [];
}

if (!ss.storage.lastJSONUpdate) {
	var date = new Date();
	date.setFullYear(date.getFullYear() - 1);
	ss.storage.lastJSONUpdate = date;
}

var bannedProfiles = ss.storage.bannedProfiles,
	lastJSONUpdate = ss.storage.lastJSONUpdate;


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
		bannedProfiles = payload.bannedProfiles;
		ss.storage.bannedProfiles = bannedProfiles;
	});

	worker.port.emit("bannedProfiles", {
		bannedProfiles: bannedProfiles
	});

	worker.port.on('lastJSONUpdateChange', function(payload) {
		lastJSONUpdate = payload.lastJSONUpdate;
		ss.storage.bannedProfiles = lastJSONUpdate;

	});

	worker.port.emit("lastJSONUpdate", {
		lastJSONUpdate: lastJSONUpdate
	});
}
 
pageMod.PageMod({
	include: ["*.youtube.com", "*.jhvisser.com"],
	contentScriptWhen: 'end',
	contentScriptFile: [
		data.url("jquery-1.11.1.min.js"),
		data.url("underscore-min.js"),
		data.url("moment.min.js"),
		data.url("content.js")
	],
	contentStyleFile: data.url("content.css"),
	contentScriptOptions: { 
		"bannedProfiles": bannedProfiles,
		"lastJSONUpdate": lastJSONUpdate
	},
	onAttach: startListening
});

