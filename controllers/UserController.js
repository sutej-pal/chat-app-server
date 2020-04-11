const Helper = require('../config/helper');
const User = require('../models/user');
const ChatRoom1 = require('../models/chat_room1');
const mongoose = require('mongoose');
const _ = require('underscore');

module.exports = class UserController {
    static async getAll(req, res) {
        let activeUser = req.user;
        try {
            let users = [];
            let response = await User.find();
            response.forEach(user => {
                if (user.name !== activeUser.name) {
                    users.push(user.toObject());
                }
            });
            return Helper.main.response200(res, users, 'user-list')
        } catch (err) {
            console.log('users', err);
            return Helper.main.response500(res, 'user-list')
        }
    }

    static async recentlyContactedUsers(req, res) {
        let activeUser = req.user;
        let chatRooms = await ChatRoom1
            .find({participants: {$in: [mongoose.Types.ObjectId(activeUser.id)]}})
            .select('participants -_id')
            .populate('participants user')
            .lean()
            .sort({'updatedAt': -1});

        let users = [];

        _.each(chatRooms, chatRoom => {
            _.each(chatRoom.participants, user => {
                if (user._id.toString() === activeUser.id.toString()) {
                    console.log(user._id, activeUser.id);
                } else {
                    let object = Object.assign({}, user);
                    object.id = object._id;
                    delete object._id;
                    delete object.__v;
                    delete object.otp;
                    delete object.password;
                    delete object.isVerified;
                    delete object.createdAt;
                    delete object.updatedAt;
                    users.push(object)
                }
            });
        });

        return Helper.main.response200(res, users, 'recently contacted users')
    }
};
