const express = require('express');
const cnn = require('../../config/db');
const simpleCrud = require('../controllers/generic');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const router = express.Router();

const tableName = "auth_portal.mm_user";

/**
 * @route POST api/users
 * @description Register a user
 * @access Public
 */
router.post('/',
  [check('name', 'Please insert a name')
    .not()
    .isEmpty(),
  check('email', ' Please insert a valid email')
    .isEmail(),
  check('password', 'The password should be at least 6 characters')
    .isLength({ min: 6 }),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    let { email } = request.body;

    cnn.query(simpleCrud.getOne(tableName, "email", "'" + email + "'"),
      async (err, result) => {
        if (err)
          console.log(err);
        if (result.length > 0) {
          // checkpoint
          return response.status(400).json({ msg: 'There is an user with this email already registered!' });
        }
        else {
          // checkpoint

          newUser = {
            name,
            email,
            password
          } = request.body;

          const salt = await bcrypt.genSalt(10);
          newUser.password = await bcrypt.hash(password, salt);

          const values = Object.values(newUser);

          try {
            await cnn.query(simpleCrud.createOne(tableName, newUser), [[values]],
              function (err, result) {
                if (err)
                  console.log(err)

                const payload = {
                  user: {
                    id: result.insertId
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

        }
      });
  });

module.exports = router;