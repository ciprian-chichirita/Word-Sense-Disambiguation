var WordPOS = require('wordpos');
var express = require('express');

var app = express();
var wordpos = new WordPOS({
  /**
   * enable profiling, time in msec returned as last argument in callback
   */
  profile: false,

  /**
   * if true, exclude standard stopwords.
   * if array, stopwords to exclude, eg, ['all','of','this',...]
   * if false, do not filter any stopwords.
   */
  stopwords: true
});

var PORT = 8086;
var typeOfWord = {
	"nouns" : "lookupNoun",
	"verbs" : "lookupVerb",
	"adjectives" : "lookupAdjective",
	"adverbs" : "lookupAdverb"
};

// Define the port to run on
app.set('port', PORT);

// Add headers
app.use((req, res, next) => {
	// Website you wish to allow to connect
	res.header("Access-Control-Allow-Origin", "*");
	// Request methods you wish to allow
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	// Request headers you wish to allow
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	next();
});

//FROM: https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function _debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var that = this, args = arguments, later, callNow;
        
        later = function() {
            timeout = null;
            if (!immediate) func.apply(that, args);
        };

        callNow = immediate && !timeout;
        clearTimeout(timeout);

        timeout = setTimeout(later, wait || 100);//default to 100 milliseconds

        if (callNow) func.apply(that, args);
    };
};

app.get('/wordnet.json',  (req, res) => {
	var input = JSON.parse(req.query.q).input;
	var result_json = {};
	var typeOfWordKeys = Object.keys(typeOfWord);


	var _debounce_res = _debounce(function () {
		res.json(result_json);
	}, 2000);


	wordpos.getPOS(input, (results)=> {
		result_json.results = results;
		result_json.words = [];

		typeOfWordKeys.map((key, i)=> {
			let result = results[key];
			if (result.length > 0) {
				result.map((word, ind)=> {
					wordpos[typeOfWord[key]](word, (r, word)=>{

						result_json.words.push({
							results: r,
							word: word
						});
						_debounce_res();
					});
				});
			}
		});
	});
});

// Listen for requests
var server = app.listen(app.get('port'), () => {
	var port = server.address().port;
	console.log('wordnet pos server running at: ' + port);
});