/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:
3
 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
   */

var fs = require('fs');
var program = require ('commander');
var restler = require('restler');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
     console.log("%s does not exist. Exiting.", instr);
     process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    return checkValid($, checksfile);
};

var checkURL = function(URL, checksfile) {
    $ = cheerio.load(URL);
    return checkValid($, checksfile);
}

var checkValid = function($, checksfile){
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}

var clone = function(fn) {
    return fn.bind({});
};

var printGrader = function(json) {
    outJson = JSON.stringify(json, null, 4);
    //fs.writeFileSync("./out.json", outJson); Write to file
    console.log(outJson);
}
if(require.main == module) {
    program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url>', 'URL to HTML file')
    .parse(process.argv);

    if (program.url != undefined) {
        restler.get(program.url).on('complete', function(result) {
        if (result instanceof Error) {
            console.log('Error for %s: %s', program.url, result.message);
        } else {
        var checkJson = (checkURL(result, program.checks));
        printGrader(checkJson);
        }
    });
  } else {
  var checkJson = checkHtmlFile(program.file, program.checks);
  printGrader(checkJson);
  }       
} else {
  exports.checkHtmlFile = checkHtmlFile;
}