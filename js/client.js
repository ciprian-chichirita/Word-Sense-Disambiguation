'use strict';

class WordSenseDisambiguation {
	constructor(url, endpoint) {
		console.log("WordSenseDisambuguation constructor");
		this.url = url;
		this.endpoint = endpoint;
		this.typeOfWord = ["nouns","verbs","adjectives","adverbs"];
		this.response = null;
	}

	query() {
		let search_string = document.querySelector("[name='search-text']").value,
		keyword = document.querySelector("[name='keyword']").value,
		output_textarea = document.querySelector(".textarea-output textarea");

		console.log("search_string: ", search_string, " keyword: ", keyword);

		this._query(search_string).then((response)=>{
			// result_json.results
			this.response = response.results;
			
			this.typeOfWord.map((val, index)=>{
				if (this.response[val].length > 0) {
					this.response[val].map((v,i)=>{
						this.response[val][i] = {
							word: v,
							stemmer: stemmer(v)
						}
					});
				}
			});
			console.log("response: ", this.response);
			output_textarea.value = JSON.stringify(response);
		});
	}

	_query(search_string) {
		let myHeaders = new Headers(),
		url = this.url + this.endpoint;
		myHeaders.append("Content-Type", "application/json");

		return fetch(url+ "?q=" + encodeURIComponent(JSON.stringify({"input": search_string})), {mode: 'cors', method: 'GET', headers: myHeaders})
			.then((response) => { return response.json() })
			.then((response) => {
				return response;
			})
			.catch((error)=> {
				console.log("query error: ",error);
			});
	}
}