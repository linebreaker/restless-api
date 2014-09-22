var _ = require('underscore');

// mock datastore
var mockUserData = {};

function randomId() {
    return Math.random().toString(36).substring(7);
}

/** User model class **/
function User(config) {
    this.id = randomId();
    _.extend(this, {
	'name': config.name, 
	'address': config.address, 
	'email': config.email
    });
}
/** Instance methods **/
User.prototype.save = function save() {
    mockUserData[this.id] = this;
};
User.prototype.updateFromPartial = function updateFromPartial(partialUser) {
    if(!partialUser) {
	return null;
    }
    delete partialUser.save;
    for(var field in partialUser) {
	if(partialUser.hasOwnProperty(field) && typeof(partialUser[field]) !== 'function') {
	    this[field] = partialUser[field];
	}
    }
    this.save();
    return this;
};
/** Static methods **/
User.getOneById = function getOneById(id) {
    if(id && typeof(id) === 'string' && mockUserData.hasOwnProperty(id)) {
	return mockUserData[id];
    } else {
	return null;
    }
};
User.getIndex = function getIndex() {
    return _.values(mockUserData);
};

User.update = function update(id, partialUser) {
    var user = User.getOneById(id);
    if(!partialUser) {
	return null;
    }
    if(partialUser.id !== undefined && partialUser.id !== id) {
	return null;
    }

    return user.updateFromPartial(partialUser);
};


/** Create fake data **/
var john = new User({'name': 'John White', 'address': '50 Grove St., Seagrove Beach, FL 32459'});
john.save();

module.exports = User;
