var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var restlessApi = require('../index.js');
var apiConfig = {
    "links": {
        /* each key in 'links' is a REST noun from 'nouns' at end */
        "user": { 
             "index": {
                "url": "/users",
                "method": "GET",
                "desc": "Show a list of users"
            },
            "read": {
                "url": "/users/:id",
                "method": "GET",
                "desc": "Get a user by ID"
            },
            "create": {
                "url": "/users",
                "method": "POST",
                "desc": "Add a new user"
            },
            "update": {
                "url": "/users/:id",
                "method": "PUT/POST",
                "desc": "Update an existing user with ID=:id" 
             }
             /* each key in a given noun denotes a REST endpoint (url+method)
                and will be routed to the callback in the noun module associated with the same key.
                
                for example, 'update' above will invoke the function 'update' in 'lib/users.js' - 
                because that is the module associated with the noun in 'nouns' below 
             */
        }
    },
    "nouns": {
    
        "user": {
	    "controller": require("./lib/userController.js"),
	    "model": require("./lib/userModel.js")
	}
	
	/* 
	   - Addl nouns:
              You can add more nouns here, e.g.:
	        "products": require("./lib/products.js")

	   - Model+controller and dependency injection (is optional):
              You can handle a noun in one file:
	        "products": require("./lib/products.js")

              Or you can specify a model and controller separately, e.g.:
                 "products": {
                        "model": require("./lib/productModel.js"),
                        "controller": require("./lib/productController.js")
                 }

           -  The callbacks in the 'controller' module will be invoked with the model dependency injected
	 */
    }
};
var apiRouter = restlessApi(apiConfig);

// The routes above are relative; restless-api returns an express.Router object
// which you can mount wherever you want
// e.g. "/api":
app.use("/api", apiRouter);

app.listen(3000);
console.log("API Spec: ");
console.log(JSON.stringify(apiConfig.links, undefined, 4));
console.log("Listening on port 3000!");

