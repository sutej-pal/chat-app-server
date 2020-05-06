const Helper = require('../config/helper');
const User = require('../models/user');
const ChatRoom1 = require('../models/chat_room1');
const mongoose = require('mongoose');
const _ = require('underscore');
const storage = require('../config/storage');
const Utils = require('../utils/utils');
const fs = require('fs');

module.exports = class UserController {
    static async getAll(req, res) {
        let activeUser = req.user;
        try {
            let users = [];
            let response = await User.find();
            response.forEach(user => {
                if (user.name !== activeUser.name) {
                    if (!user.profileImage) {
                        user.profileImage = storage.defaultUserProfileImage
                    }
                    if (!user.coverImage) {
                        user.coverImage = storage.defaultUserCoverImage
                    }
                    users.push(user.toObject());
                }
            });
            return Helper.main.response200(res, users, 'user-list')
        } catch (err) {
            console.log('users', err);
            return Helper.main.response500(res, 'user-list')
        }
    }

    static async getUser (req, res) {
        try {
            let user = await User.findOne({_id: req.params.userId});
            let resp = user.toObject();
            return Helper.main.response200(res, resp, 'user');
        } catch (e) {

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
                } else {
                    let object = Object.assign({}, user);
                    object.id = object._id;
                    delete object._id;
                    delete object.__v;
                    delete object.otp;
                    delete object.password;
                    delete object.isVerified;
                    delete object.createdAt;
                    if (!object.profileImage) {
                        object.profileImage = storage.defaultUserProfileImage
                    }
                    if (!object.coverImage) {
                        object.coverImage = storage.defaultUserCoverImage
                    }
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
                chatRooms.forEach(chatRoom => {
                    chatRoom.participants.forEach(user => {
                        contactedUsers.push(user._id);
                    });
                });
                return _.compact(_.uniq(contactedUsers))
            })
    }

    static getUserProfile(req, res) {
        User.findOne({_id: req.body.userId})
            .select('name email profileImage bio coverImage').lean()
            .then(user => {
            if (!user.profileImage) {
                user.profileImage = storage.defaultUserProfileImage
            }
            if (!user.coverImage) {
                user.coverImage = storage.defaultUserCoverImage
            }
            user = Utils.replaceMongooseId(user);
            return Helper.main.response200(res, user, 'user profile');
        }).catch(err => {
            console.log('err', err);
            return Helper.main.response500(res, 'failed', 'user profile');
        })
    }

    static updateUserProfile(req, res) {
        let update = req.body;
        delete update.email;
        delete update.username;
        delete update._id;
        delete update.name;
        User.findOneAndUpdate({_id: req.body.id}, update, {new: true}).lean().then(user => {
            user.id = user._id;
            delete user._id;
            delete user.otp;
            delete user.isVerified;
            delete user.sockerId;
            return Helper.main.response200(res, user, 'user profile updated');

        }).catch(err => {
            console.log('err', err);
            return Helper.main.response500(res, 'failed', 'user profile update failed');
        })
    }

    static updateProfileImage(req, res) {
        if (!req.files || !req.files.file) {
            let message = 'image not found in request';
            return Helper.main.response400(res, message, 'profile image update failed');
        }
        let fileObject = Utils.getFileObject(req.files.file, 'profileImageSD');
        fs.writeFile(fileObject.filePath, fileObject.file, function (err) {
            if (err) return console.log(err);
            User.findOneAndUpdate({_id: req.user.id},
                {profileImage: storage.profileImageSD + fileObject.fileName},
                {new: true}).then(user => {
                return Helper.main.response200(res, {}, 'profile image updated');
            }).catch(err => {
                console.log('err', err);
                return Helper.main.response500(res, 'failed', 'profile image update failed');
            })
        });
    }

    static editCoverImage(req, res) {
        if (!req.files || !req.files.file) {
            let message = 'image not found in request';
            return Helper.main.response400(res, message, 'cover image update failed');
        }
        let fileObject = Utils.getFileObject(req.files.file, 'profileCoverImageSD');
        fs.writeFile(fileObject.filePath, fileObject.file, function (err) {
            if (err) return console.log(err);
            User.findOneAndUpdate({_id: req.user.id},
                {coverImage: storage.profileCoverImageSD + fileObject.fileName},
                {new: true}).then(user => {
                return Helper.main.response200(res, {}, 'cover image updated');
            }).catch(err => {
                console.log('err', err);
                return Helper.main.response500(res, 'failed', 'cover image update failed');
            })
        });
    }
};
