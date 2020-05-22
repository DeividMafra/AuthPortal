const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

router.get('/', (request, response) => {
  return response.json({ message: 'Auth Portal' });
});

router.post('/login', [
  check('email', 'Please insert a valid email').isEmail(),
  check('password', 'The password should be at least 6 characters').isLength({ min: 6 })
],
  loginController.create);

module.exports = router;