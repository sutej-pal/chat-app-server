const ChatController = require('../controllers/ChatController');
const UserController = require('../controllers/UserController');

module.exports = function (server) {
    const io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log('connected', socket.id);
        socket.on('update-user-status', (userId) => {
            UserController.setUserOnline(userId.id, socket.id);
        });
        socket.on('SEND_MESSAGE', data => {
            ChatController.storeMessages(data).then(() => {
                io.emit('MESSAGE', data)
            })
        });
        socket.on('disconnect', function () {
            UserController.setUserOffline(socket.id)
        });
    });
};
