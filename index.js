(function() {
    var express = require('express');
    var _ = require('underscore');

    module.exports = function(config) {
	var MODULE_NAME = "restless-api";

	if(!config || !config.nouns) {
	    console.error("ERROR: " + MODULE_NAME + " module needs to be initialized with a 'config' object with a property, 'nouns', containing a map of noun-names to noun objects (a noun: 'aNoun': {'model': './models/aNounModel.js', 'controller': './controllers/aNounController.js'})");
	    throw ("ERROR: could not load module " + MODULE_NAME + " since 'config' object needed for initialization was missing or didn't have the required 'nouns' property");
	}

	var nouns = getNounsFromJSON(config.nouns);
	var router = generateRoutesFromJSON(config.links, nouns);

	return router;
    };


    function generateRoutesFromJSON(spec, nouns) {
	var router = new express.Router();
	var nounsInSpec = _.keys(spec);

	try {
	    _.each(nounsInSpec, function(nounName) {
		var noun = nouns[nounName];
		if(!noun || typeof(noun) !== "object") {
		    throw "ERROR: noun with name '" + nounName + "' missing from 'nouns' argument passed to generateRoutesFromJSON method";
		}

		var nounLinks = spec[nounName];
		var linksInNoun = _.keys(nounLinks);
		_.each(linksInNoun, function(linkName) {
		    var link = nounLinks[linkName];
		    if(!link || typeof(link) !== "object") {
			throw "ERROR: link with name '" + linkName + "' missing from noun '" + nounName + "' passed in 'nouns' argument to generateRoutesFromJSON method";
		    }
		    
		    addRouteForLink(router, linkName, link, noun);
		});
	    });
	} catch(exc) {
	    console.error("ERROR executing generateRoutesFromJSON:");
	    console.error(exc);
	    throw exc;
	}
	return router;
    };

    function addRouteForLink(router, linkName, link, noun) {
	if(!_validateLink(link)) {
	    throw "ERROR - addRouteForLink: Could not validate link '" + linkName + "'";
	}

	link.url = link.url.trim();

	var methods = link.method.toLowerCase().trim().split(new RegExp(/[\/\,\ ]/)).filter(function(method) {
	    return (method && method.trim() !== "");
	});
	
	var ALLOWED_METHODS = ["get", "post", "put", "delete"];
	_.each(methods, function(method) {
	    method = method.trim().toLowerCase();
	    if(ALLOWED_METHODS.indexOf(method) === -1) {
		throw "ERROR - addRouteForLink: don't understand method '" + method + "' for link '" + linkName + "'";
	    }

	    // For the really impatient we support just specifying a single file (controller+model) for a given noun :-)
	    var controller = (noun.controller?noun.controller:noun);
	    var model = (noun.model?noun.model:noun);

	    var action = controller[linkName];
	    router[method](link.url, function(req, res) {
		action(req, res, model, link.url);
	    });
	});

    };

    function _validateLink(link) {
	var valid = (link && link.url && link.method?true:false);
	// TODO: validate the method (a string, array of strings, or a single string containing a list of methods separated by '/' or ',' or ' ')
	return valid;
    }

    function requirePathValuesInJSON(json, config) {
	var keys = _.keys(json);
	var values = {};
	_.each(keys, function(key) {
	    if(config && key === "config") {
		return;
	    }
	    var foundValue  = json[key];
	    if(typeof(foundValue) === 'string') {
		if(!config) {
		    foundValue = require(foundValue);
		} else if(config) {
		    foundValue = require(foundValue)(config);
		}
	    }
	    values[key] = foundValue;
	});
	return values;
    }

    function getNounsFromJSON(nounjson) {
	var nounkeys = _.keys(nounjson);
	var nouns = {};
	_.each(nounkeys, function(nounName) {
	    var nounconfig = null;
	    var noun = nounjson[nounName];
	    if(noun.config) { 
		try {
		    nounconfig = (typeof(noun.config) === "string"?require(noun.config):noun.config); 
		} catch (exc) {
		    console.error("ERROR: Couldn't load config for noun '" + nounName + "' from path '" + noun.config + "'");
		    console.error(exc);
		    throw exc;
		}
	    }
	    try {
		nouns[nounName] = requirePathValuesInJSON(noun, nounconfig);
	    } catch(exc) {
		console.error("ERROR: Couldn't load value for noun '" + nounName + "' from path '" + nounjson[nounName] + "':");
		console.error(exc);
		throw exc;
	    }
	});
	return nouns;
    }
})();



