const ChatController = require('../controllers/ChatController');
const UserController = require('../controllers/UserController');
const _ = require('underscore');

module.exports = function (server) {
    const io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log('connected', socket.id);
        socket.on('update-user-status', (user) => {
            UserController.setUserOnline(user.id, socket.id);
            io.sockets.emit('online-user', user);
        });
        socket.on('send-message', data => {
            console.log('send-message', socket.id);
            ChatController.storeMessages(data).then((data) => {
                io.to(data.receiverSocketId).emit('message', data.message);
                io.to(data.senderSocketId).emit('message', data.message);
            })
        });
        socket.on('messages-read', data => {
            ChatController.updateMessageReadStatus(data)
                .then(res => {
                    console.log(res);
                    io.to(res.receiverSocketId).emit('message-seen', res);
                    io.to(res.senderSocketId).emit('message-seen', res);
                })
        })
        socket.on('disconnect', function () {
            UserController.setUserOffline(socket.id).then(disconnectedUser => {
                if (disconnectedUser) {
                    UserController.getContactedUsers(disconnectedUser.id).then(users => {
                        _.each(users, user => {
                            io.sockets.emit('offline-user', disconnectedUser);
                        })
                    })
                }
            })
        });
    });
};
