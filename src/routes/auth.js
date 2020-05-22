const express = require('express');
const router = express.Router();
const cnn = require('../../config/db');
const simpleCrud = require('../controllers/generic');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/authentication');

const tableName = "auth_portal.mm_user";

/**
 * @route GET api/auth
 * @description Get logged in user
 * @access Private
 */
router.get('/', auth, async (request, response) => {

  await cnn.query(simpleCrud.getUserFromAuth(tableName, "userId", request.user.user.id), function (err, result) {
    if (err)
      throw err;
    return response.json(result);
  });

});

/**
 * @route POST api/auth
 * @description Auth user & get token
 * @access Public
 */
router.post(
  '/',
  [check('email', 'Please insert a valid email').isEmail(),
  check('password', 'Password is required').exists()
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const { email, password } = request.body;

    try {

      cnn.query(simpleCrud.getOne(tableName, "email", "'" + email + "'"),
        async (err, result) => {
          if (err)
            console.log(err);
          if (result.length <= 0) {
            // checkpoint
            return response.status(400).json({ msg: 'Invalid Credentails' });
          }
          // checkpoint

          const isMatch = await bcrypt.compare(password, result[0].password);

          if (!isMatch) {
            // checkpoint
            return response.status(400).json({ msg: 'Invalid Credentails' });
          }

          const payload = {
            user: {
              id: result[0].userId
            }
          };

          jwt.sign(
            payload,
            config.get('jwtSecret'),
            {
              expiresIn: 3600
            },
            (err, token) => {
              if (err)
                throw err;
              return response.json({ token });
            }
          );
        });

    } catch (error) {
      console.error(error.message);
      response.status(500).send('Server Error');
    }
  });

module.exports = router;