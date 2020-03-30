const Helper = require('../config/helper');
const User = require('../models/user');

module.exports = class UserController {
    static async getAll(req, res) {
        try {
            let users = [];
            let response = await User.find();
            response.forEach(user => {
                users.push(user.toObject());
            });
            return Helper.main.response200(res, users, 'user-list')
        } catch (err) {
            console.log('users', err);
            return Helper.main.response500(res, 'user-list')
        }
    }
};
