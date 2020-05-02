const Chat = require('../models/chat');
const ChatRoom = require('../models/chat_room');
const ChatRoom1 = require('../models/chat_room1');
const mongoose = require('mongoose');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const Helper = require('../config/helper');
const Storage = require('../config/storage');
const Utils = require('../utils/utils');

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

        if (data.attachments && data.attachments.file) {
            let arr = data.attachments.fileName.split('.');
            let fileExtension = arr[arr.length - 1];
            let fileName = uuidv4() + '.' + fileExtension;
            let filePath = Storage.base + Storage.media + fileName;
            try {
                let file = await fs.writeFileSync(filePath, data.attachments.file);
                object.messages.attachments = {
                    fileType: 'image',
                    file: Storage.media + fileName
                }
            } catch (e) {
                return e
            }
        }
        return ChatRoom1.find({
            participants: {
                $all:
                    [
                        mongoose.Types.ObjectId(data.senderId),
                        mongoose.Types.ObjectId(data.receiverId)
                    ]
            }
        }).lean().then(async chatRoom => {
            if (chatRoom.length === 0) {
                return ChatRoom1.create(object).then(newChatRoom => {
                    const messagesArray = newChatRoom.messages;
                    return messagesArray[messagesArray.length - 1]
                })
            } else {
                return ChatRoom1.findOneAndUpdate(
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
                    }, {new: true}).then(async updatedChatRoom => {
                    const messagesArray = updatedChatRoom.messages;
                    const message = messagesArray[messagesArray.length - 1];
                    let receiver = await Utils.getUser(message.receiverId);
                    let sender = await Utils.getUser(message.senderId);
                    return {
                        message,
                        receiverSocketId: receiver.socketId,
                        senderSocketId: sender.socketId
                    }
                })
            }
        });
    }

    static async chatHistory(req, res) {
        let chatRoom = await ChatRoom1.findOne(
            {
                participants: {
                    $all:
                        [
                            mongoose.Types.ObjectId(req.body.senderId),
                            mongoose.Types.ObjectId(req.body.receiverId)
                        ]
                }
            });
        if (chatRoom) {
            return Helper.main.response200(res, chatRoom, 'chat history');
        } else {
            return Helper.main.response200(res, [], 'chat history');
        }

    }
};
