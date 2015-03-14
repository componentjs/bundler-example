var User = require('model');

module.exports = function getUser(config) {
    var user = new User(config);

    return user;
};
