#!/usr/bin/env node
/*
Automatically grades files for the presence of specified HTML tags/attributes.
User commander.js and cheerio. Teaches command line application development and basic DOM parsing.

Refences:

+ cheerio

+ commander.js

+ JSON

*/

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";


var assertFileExists = function(infile) {
  var instr = infile.toString();
  if (!fs.existsSync(instr)) {
       console.log("%s does no exist. Exiting.", instr);
       process.exit(1);
  }
  return instr;
};

var cheerioHtml = function(html) {
    return cheerio.load(html);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var loadHtmlFile = function(htmlfile) {
  return fs.readFileSync(htmlfile);
}

var checkHtmlFile = function (html, checksfile) {
  $ = cheerioHtml(html);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for (var ii in checks) {
      var present = $(checks[ii]).length > 0;
      out[checks[ii]] = present;
  }

  return out;
};

var clone = function(fn) {
  // Workaround for commander.js issue.
  // http://stackoverflow.com/a/6772648
  return fn.bind({});
};

var gradeHtml = function(htmlfile, checksfile, urlpath)
{
  if (urlpath !== undefined)
  {
    rest.get(urlpath).on('success', function(result)
    {
      
      var json =  checkHtmlFile(result, checksfile);
      var outJson = JSON.stringify(json, null, 4);
      return console.log(outJson);
    });
  }
  else
  {
    var json = checkHtmlFile(loadHtmlFile(htmlfile), checksfile);
    var outJson = JSON.stringify(json, null, 4);
    return console.log(outJson);
  }  
}

if (require.main == module) {
   program.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT).option('-f, --file <html_file>', 'Path to index.html', function(){}, HTMLFILE_DEFAULT).option('-u, --url <url>', 'Url to grade').parse(process.argv);   
   
   gradeHtml(program.file, program.checks, program.url);
} else {
   exports.checkHtmlFile = checkHtmlFile;
}
