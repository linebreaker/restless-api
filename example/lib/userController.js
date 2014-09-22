module.exports = {
    index: function(req, res, User) {
	var results = User.getIndex();
	var count = (results && results.length? results.length : 0);

	res.json({'count': count, 'users': results});
    },
    read: function(req, res, User) {
	var id = req.params.id;
	var user = User.getOneById(id);
	if(user) {
	    res.json(user);
	} else {
	    res.status(404).end();
	}
    },
    create: function(req, res, User) {
	var body = req.body;
	console.log(body);
	var newUser = body;

	if(newUser === null || !newUser || !newUser.name) {
	    res.status(400).json({"error": "Bad request. User must be of form '{\"name\": \"joe smith\", \"address\": \"101 somewhere lane, somecity, california\"}'"});

	} else {
	    var user = new User(newUser);
	    if(user.id) {
		user.save();
		res.json(user);
	    } else {
		res.status(500).end();
	    }
	}
    },
    update: function(req, res, User) {
	var id = req.params.id;
	var user = User.getOneById(id);
	var partialUser = req.body; 

	if(user && partialUser) {
	    if(partialUser.id !== undefined && partialUser.id !== id) {
		res.status(400).json({'error': 'Error: JSON id must agree with path id'});
	    } else {
		user = user.updateFromPartial(partialUser);
		res.json(user);
	    }
	} else {
	    res.status(404).end();
	}
    }
};
