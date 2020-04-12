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
                    users.push(object)
                }
            });
        });

        return Helper.main.response200(res, users, 'recently contacted users')
    }

    static userStatus(req, res) {
        User.findOne({_id: req.user.id})
            .then(user => {
                let temp = {};
                Object.assign(temp, user);
                temp.id = temp._id;
                delete temp._id;
                delete temp.password;
                return Helper.main.response200(res, temp, 'user status');
            });
    }

    static setUserOnline(userId, socketId) {
        User.findOneAndUpdate({_id: userId}, {isActive: true, socketId}, {new: true})
            .then(user => {
                // console.log('user', user);
            });
    }

    static async setUserOffline(socketId) {
        return User.findOneAndUpdate({socketId}, {isActive: false}, {new: true});
    }

    static getContactedUsers (userId) {
        let contactedUsers = [];
       return ChatRoom1.find({participants: {$in : [mongoose.Types.ObjectId(userId)]}}).populate('participants user').lean()
            .then(chatRooms => {
                console.log('chatRooms', chatRooms);
                chatRooms.forEach(chatRoom => {
                    chatRoom.participants.forEach(user => {
                        contactedUsers.push(user._id);
                    });
                });
                return _.compact(_.uniq(contactedUsers))
            })
    }
};
