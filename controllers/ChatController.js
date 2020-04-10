const Chat = require('../models/chat');
const ChatRoom = require('../models/chat_room');
const ChatRoom1 = require('../models/chat_room1');
const mongoose = require('mongoose');

const Helper = require('../config/helper');

module.exports = class ChatController {

    static async saveChat(data) {
        let object = {
            participants: [
                mongoose.Types.ObjectId(data.senderId),
                mongoose.Types.ObjectId(data.receiverId)
            ]
        };

        ChatRoom.find({participants: {$all: object.participants}}).lean().then(res => {
            if (res.length === 1) {
                ChatController.chat(res[0]._id, data).then(() => {
                    return 'chatSaved'
                });
            } else {
                ChatRoom.create(object).then(res => {
                    ChatController.chat(res._id, data).then(() => {
                        return 'chatSaved'
                    })
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
        // let object = {
        //     participants: [
        //         mongoose.Types.ObjectId(req.body.senderId),
        //         mongoose.Types.ObjectId(req.body.receiverId)
        //     ]
        // };
        let senderId = mongoose.Types.ObjectId(req.body.senderId);
        let receiverId = mongoose.Types.ObjectId(req.body.receiverId);

        ChatRoom.find({participants: {$all: [senderId, receiverId]}}).lean()
            .then(res => {
                if (res.length === 1) {
                    Chat.find({roomId: res[0]._id}).lean()
                        .then(res => {
                            return Helper.main.response200(response, res, 'chat-history');
                        })
                } else {
                    return Helper.main.response200(response, [], 'chat-history');
                }

            })
    }

    static async storeMessages(data) {
        let object = {
            participants: [
                mongoose.Types.ObjectId(data.senderId),
                mongoose.Types.ObjectId(data.receiverId)
            ],
            messages: {
                message: data.message,
                senderId: mongoose.Types.ObjectId(data.senderId),
                receiverId: mongoose.Types.ObjectId(data.receiverId)
            }
        };
        ChatRoom1.find({
            participants: {
                $all:
                    [
                        mongoose.Types.ObjectId(data.senderId),
                        mongoose.Types.ObjectId(data.receiverId)
                    ]
            }
        }).lean().then(chatRoom => {
            console.log('chatRoom', chatRoom);
            if (chatRoom.length === 0) {
                ChatRoom1.create(object).then(newChatRoom => {
                    console.log('newChatRoom', newChatRoom);
                })
            } else {
                ChatRoom1.findOneAndUpdate(
                    {
                        participants: {
                            $all:
                                [
                                    mongoose.Types.ObjectId(data.senderId),
                                    mongoose.Types.ObjectId(data.receiverId)
                                ]
                        }
                    },
                    {
                        $push: {messages: object.messages}
                    }, {new: true}).then(updatedChatRoom => {
                    console.log('updatedChatRoom', updatedChatRoom);
                })
            }
        });
    }

    static async chatHistory(req, res) {
        let chatRoom = await ChatRoom1.find(
            {
                participants: {
                    $all:
                        [
                            mongoose.Types.ObjectId(req.body.senderId),
                            mongoose.Types.ObjectId(req.body.receiverId)
                        ]
                }
            });
        if (chatRoom.length > 0 && chatRoom[0].messages) {
            return Helper.main.response200(res, chatRoom[0].messages, 'chat history');
        } else {
            return Helper.main.response200(res, [], 'chat history');
        }

    }
};
