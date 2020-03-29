const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController.js');

router.post('/sign-up', AuthController.signUp);
router.post('/login', AuthController.login);

router.get('/', (req, res, next) => {
  res.send({ title: 'Express' });
});

module.exports = router;
