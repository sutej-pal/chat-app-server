const ChatController = require('../controllers/ChatController');

module.exports = function (server) {
    const io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log(socket.id);
        socket.on('SEND_MESSAGE', data => {
            ChatController.storeMessages(data).then(() => {
                io.emit('MESSAGE', data)
            })
        });
    });
};
