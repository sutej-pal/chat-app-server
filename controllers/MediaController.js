const ChatRoom = require('../models/chat_room1');
const Helper = require('../config/helper');
const _ = require('underscore');
const ffmpeg = require('ffmpeg');
const Storage = require('../config/storage');
const { v4: uuidv4 } = require('uuid');

class MediaController {
    static async getMedia(req, res) {
        let media = [];
        try {
            let chatRoom = await ChatRoom.findOne({_id: req.params.chatRoomId});
            await _.each(chatRoom.messages, async (message) => {
                if (message.attachments && message.attachments.file) {
                    media.push(message)
                }
            })
            return Helper.main.response200(res, media, 'chat-media');
        } catch (e) {

        }

    }

    static generateThumbFromVideo(filePath) {
        return new Promise((resolve, reject) => {
            let file_name = uuidv4()
            try {
                const process = new ffmpeg(Storage.base + filePath);
                process.then(function (video) {
                    video.fnExtractFrameToJPG(Storage.media, {
                        number: 1,
                        file_name
                    }, error => {
                        if (error) {
                            console.log(error);
                            reject('')
                        }
                        resolve(Storage.media + file_name + '_1.jpg')
                    });
                }, (err) => {
                    console.log('Error: ' + err);
                });
            } catch (e) {
                console.log(e.code);
                console.log(e.msg);
                reject('')
            }
        });
    }
}

module.exports = MediaController;
