const ChatRoom = require('../models/chat_room1');
const Helper = require('../config/helper');
const _ = require('underscore');

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
}

module.exports = MediaController;
