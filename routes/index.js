const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');

router.post('/sign-up', AuthController.signUp);
router.post('/login', AuthController.login);
router.get('/users-list', UserController.getAll);

router.get('/', (req, res, next) => {
  res.send({ title: 'Express' });
});

module.exports = router;
