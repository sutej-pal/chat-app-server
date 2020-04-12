const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../middleware/auth_middleware');

const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const ChatController = require('../controllers/ChatController');

router.post('/sign-up', AuthController.signUp);
router.post('/login', AuthController.login);
router.get('/users-list', AuthMiddleware, UserController.getAll);
router.post('/save-chat', ChatController.storeMessages);
router.post('/chat-history-1', ChatController.chatHistory);
router.get('/recent-users', AuthMiddleware, UserController.recentlyContactedUsers);

router.get('/user-status', AuthMiddleware, UserController.userStatus);

//chat routes

router.post('/chat-history', AuthMiddleware, ChatController.history);

router.post('/', (req, res, next) => {
  res.send({ title: 'Express' });
});

module.exports = router;
