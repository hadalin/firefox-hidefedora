var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
 
pageMod.PageMod({
  include: ["*.google.com", "*.googleapis.com", "*.jhvisser.com"],
  contentScriptWhen: 'end',
  contentScriptFile: [data.url("jquery-1.11.1.min.js"), data.url("underscore-min.js"), data.url("content.js")]
});