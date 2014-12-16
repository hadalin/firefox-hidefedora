var self = require("sdk/self");
var data = self.data;
var pageMod = require("sdk/page-mod");
var ss = require("sdk/simple-storage");

if (!ss.storage.bannedProfiles) {
  ss.storage.bannedProfiles = [];
}

var bannedProfiles = ss.storage.bannedProfiles;

 
pageMod.PageMod({
  include: ["*.google.com", "*.googleapis.com", "*.jhvisser.com"],
  contentScriptWhen: 'end',
  contentScriptFile: [data.url("jquery-1.11.1.min.js"), data.url("underscore-min.js"), data.url("content.js")],
  contentScriptOptions: { "bannedProfiles": bannedProfiles },
  onAttach: startListening
});

function startListening(worker) {
  worker.port.on('msg', function(payload) {
  	ss.storage.bannedProfiles = payload.bannedProfiles;
  });
}