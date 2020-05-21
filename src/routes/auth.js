const express = require('express');
const router = express.Router();

/**
 * @route GET api/auth
 * @description Get logged in user
 * @access Private
 */
router.get('/', (request, response) => {
  response.json({ msg: 'Get logged in user' });
});

/**
 * @route POST api/auth
 * @description Auth user & get token
 * @access Public
 */
router.post('/', (request, response) => {
  response.json({ msg: 'Auth user & get token' });
});

module.exports = router;