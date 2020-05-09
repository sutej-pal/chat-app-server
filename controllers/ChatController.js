const Chat = require('../models/chat');
const ChatRoom = require('../models/chat_room1');
const mongoose = require('mongoose');
const fs = require('fs');
const {v4: uuidv4} = require('uuid');

const Helper = require('../config/helper');
const Storage = require('../config/storage');
const Utils = require('../utils/utils');
const MediaController = require("./MediaController");

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
                receiverId: mongoose.Types.ObjectId(data.receiverId),
                seen: false
            }
        };

        if (data.attachments && data.attachments.file) {
            let arr = data.attachments.fileName.split('.');
            let fileExtension = arr[arr.length - 1];
            let fileName = uuidv4() + '.' + fileExtension;
            let filePath = Storage.base + Storage.media + fileName;
            try {
                let thumb = '';
                await fs.writeFileSync(filePath, data.attachments.file);
                if (data.attachments.type === 'video') {
                    thumb = await MediaController.generateThumbFromVideo(Storage.media + fileName);
                    console.log('thumb', thumb);
                }
                if (data.attachments.type === 'image') {
                    const buffer = await MediaController.generateThumbFromImage(Storage.media + fileName);
                    let temp = Storage.media + uuidv4() + '.' + fileExtension;
                    await fs.writeFileSync(Storage.base + temp, buffer);
                    thumb = temp
                }
                object.messages.attachments = {
                    fileType: data.attachments.type,
                    file: Storage.media + fileName,
                    thumb: thumb
                }
            } catch (e) {
                console.log(e);
                return e
            }
        }
        return ChatRoom.find({
            participants: {
                $all:
                    [
                        mongoose.Types.ObjectId(data.senderId),
                        mongoose.Types.ObjectId(data.receiverId)
                    ]
            }
        }).lean().then(async chatRoom => {
            if (chatRoom.length === 0) {
                return ChatRoom.create(object).then(async newChatRoom => {
                    const message = newChatRoom.messages[0]
                    let receiver = await Utils.getUser(message.receiverId);
                    let sender = await Utils.getUser(message.senderId);
                    return {
                        message,
                        receiverSocketId: receiver.socketId,
                        senderSocketId: sender.socketId
                    }
                })
            } else {
                return ChatRoom.findOneAndUpdate(
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
        let chatRoom = await ChatRoom.findOne(
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

    static async updateMessageReadStatus(data) {
        await ChatRoom.updateOne(
            {_id: data.chatRoomId},
            {$set: {"messages.$[message].seen": true}},
            {
                multi: true,
                arrayFilters: [{"message.seen": false}]
            }
        );
        const receiver = await Utils.getUser(data.message.receiverId);
        const sender = await Utils.getUser(data.message.senderId);
        return {
            receiverSocketId: receiver.socketId,
            receiverId: receiver._id,
            senderSocketId: sender.socketId,
            senderId: sender._id
        }

    }
};
