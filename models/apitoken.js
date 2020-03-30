'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const APITokenSchema = new Schema({
    email: String,
    token: String
}, {
    toObject: {
        transform: (obj, ret) => {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model("ApiToken", APITokenSchema);