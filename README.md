# restless api: RESTful APIs for the highly impatient
**Under development, check back soon for more documentation**

- restless-api takes a JSON spec of your APIs like you would send your user (no code inside it) and handles all the Express routing

- the goal has been to be as-simple-as-possible at all decision points, but there is support for model/controller breakdown and dependency injection if you want it

- Available on NPM @ https://www.npmjs.org/package/restless-api

## Example: see Node Annotator Store backend
- The [NodeJS implementation of the Annotator backend](http://github.com/willy-b/node-annotator-store) is using restless-api

## Quick start
-  In your app file, call restless-api with JSON having two keys
	* `nouns`: contains reference to a module (or optionally a controller and model) for each noun
	* `links`: user-facing API spec (NO CODE, literally ready to send your user)

- Example:
```
var restlessApi = require('../index.js');
var apiRouter = restlessApi({
    "nouns": {
	"user": require("./lib/users.js")
	/* 
	   - Addl nouns:
	     You can add more nouns here, e.g.:
	        "products": require("./lib/products.js")

	   - Model+controller and dependency injection:
		You can also specify a model and controller separately, e.g.:
		 "products": {
		   	"model": require("./lib/productModel.js"),
			"controller": require("./lib/productController.js")
		 }
	    -  The callbacks in the 'controller' module will be invoked with the model dependency injected
	 */
    },
    "links": {
	/* each key in 'links' is a REST noun from 'nouns' above */
	"user": { 
	    /* each key in a given noun denotes a REST endpoint (url+method)
	       and will be routed to the callback in the noun module associated with the same key.

	       for example, 'index' below will invoke the function 'index' in 'lib/users.js' --
	       because that is the module associated with the noun in 'nouns' above 
	    */
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
	}
    }
});
```

- In your app file you use the router returned as normal:

```
// The routes above are relative; restless-api returns an express.Router object
// which you can mount wherever you want
// e.g. "/api":
express.use("/api", apiRouter);

express.listen(3000);
console.log("Listening on port 3000!");
```

- And then create modules for each noun, e.g. `./lib/users.js` might be:

```
module.exports =  {
	       index: function index(req, res, User) {
	       //      ...
	       },
	       read: function read(req. res, User) {
	       //       ...
	       },
//...	       	       	       
};

```

- Where the 3rd `user` argument is the user `model` (this example used one unified model+controller for user noun, but if they were separate this would be the controller and it would get the model ref there)

- more docs and example files coming soon...



