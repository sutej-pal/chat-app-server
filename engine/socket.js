const ChatController = require('../controllers/ChatController');

module.exports = function (server) {
    const io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log(socket.id);
        socket.on('SEND_MESSAGE', data => {
            // console.log('MESSAGE', data);
            ChatController.saveChat(data)
            // ChatController.chat(data).then(res => {
            //     console.log(res);
                io.emit('MESSAGE', data)
            // });
        });
    });
};
