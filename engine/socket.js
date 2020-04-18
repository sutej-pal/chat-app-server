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
        socket.on('SEND_MESSAGE', data => {
            ChatController.storeMessages(data).then((message) => {
                io.emit('MESSAGE', message)
            })
        });
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
