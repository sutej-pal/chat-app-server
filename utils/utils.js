const User = require('../models/user');
const mongoose = require('mongoose');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const storage = require('../config/storage');
const _ = require('underscore');

let imageExtensions = ['png', 'jpeg', 'jpg'];

module.exports = class Utils {
    static async updateUserStatus(userId, isActive, lastActive, lastContacted) {
        let status = await User.findOneAndUpdate(
            {_id: mongoose.Types.ObjectId(userId)},
            {
                user: userId,
                isActive,
                lastActive,
                lastContacted
            },
            {upsert: true, new: true});
        console.log('hi', status)
    }

    static replaceMongooseId(object) {
        object.id = object._id;
        delete object._id;
        return object
    }

    static getFileObject(file, type) {
        let arr = file.name.split('.');
        let fileExtension = arr[arr.length - 1];
        if (!imageExtensions.includes(fileExtension)) {
            throw 'invalid file'
        }
        let fileName = uuidv4() + '.' + fileExtension;
        let filePath = storage.base + storage[type] + fileName;
        return {
            file: file.data,
            fileExtension,
            fileName,
            filePath
        }
    }

    static async writeFile(path, file) {
        try {
            fs.writeFileSync(path, file);
            return 'ok'
        } catch (e) {
            throw e
        }
    }
};
