const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../middleware/auth_middleware');

const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');

router.post('/sign-up', AuthController.signUp);
router.post('/login', AuthController.login);
router.get('/users-list', AuthMiddleware, UserController.getAll);

router.get('/', (req, res, next) => {
  res.send({ title: 'Express' });
});

module.exports = router;
