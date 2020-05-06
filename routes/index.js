const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../middleware/auth_middleware');

const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const ChatController = require('../controllers/ChatController');
const MediaController = require('../controllers/MediaController');

router.post('/sign-up', AuthController.signUp);
router.post('/login', AuthController.login);
router.get('/all-users', AuthMiddleware, UserController.getAll);
router.get('/user/:userId', AuthMiddleware, UserController.getUser);
router.post('/save-chat', ChatController.storeMessages);
router.post('/chat-history-1', ChatController.chatHistory);
router.get('/recent-users', AuthMiddleware, UserController.recentlyContactedUsers);

router.get('/user-status', AuthMiddleware, UserController.userStatus);

//chat routes

router.post('/chat-history', AuthMiddleware, ChatController.history);


router.post('/user-profile', AuthMiddleware, UserController.getUserProfile);
router.post('/update-user-profile', AuthMiddleware, UserController.updateUserProfile);
router.post('/update-profile-image', AuthMiddleware, UserController.updateProfileImage);
router.post('/update-cover-image', AuthMiddleware, UserController.editCoverImage);

router.get('/get-chat-room-media/:chatRoomId', AuthMiddleware, MediaController.getMedia);

router.post('/', (req, res, next) => {
  res.send({ title: 'Express' });
});

module.exports = router;
