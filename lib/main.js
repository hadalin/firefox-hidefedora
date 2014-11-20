var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
 
pageMod.PageMod({
  include: ["*.youtube.com", "*.google.com", "*.googleapis.com", "*.githubusercontent.com"],
  contentScriptWhen: 'end',
  contentScriptFile: [data.url("jquery-1.11.1.min.js"), data.url("underscore-min.js"), data.url("content.js")]
});