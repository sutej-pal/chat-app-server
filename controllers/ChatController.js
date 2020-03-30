const Chat = require('../models/chat');
const ChatRoom = require('../models/chat_room');
const mongoose = require('mongoose');

module.exports = class ChatController {

    static async saveChat(data) {
        let object = {
            participants: [
                mongoose.Types.ObjectId(data.senderId),
                mongoose.Types.ObjectId(data.receiverId)
            ]
        };
        ChatRoom.find(object).lean().then(res => {
            if (res.length === 1) {
                ChatController.chat(res[0]._id, data)
            } else {
                ChatRoom.create(object).then(res => {
                    ChatController.chat(res._id, data)
                })
            }
        })
    }

    static async chat(roomId, data) {
        let object = {
            roomId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message
        };
        console.log('object', object);
        try {
            const response = await Chat.create(object);
            return response._doc
        } catch (e) {
            console.log('Err', e);
            return 'err'
        }
    }

    static async history(req, response) {
        let object = {
            participants: [
                mongoose.Types.ObjectId(req.body.senderId),
                mongoose.Types.ObjectId(req.body.receiverId)
            ]
        };
        ChatRoom.find(object).lean()
            .then(res => {
                Chat.find({roomId: res[0]._id}).lean()
                    .then(res => {
                        response.send(res);
                    })
            })
    }
};
