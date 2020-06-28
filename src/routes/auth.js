const express = require('express');
const router = express.Router();
const cnn = require('../../config/db');
const simpleCrud = require('../controllers/generic');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/authentication');
const transporter = require('../services/emailservice');
const crypto = require('crypto');

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

router.post(
  '/forget-password',
  [check('email', 'Please insert a valid email').isEmail()],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const { email } = request.body;

    try {
      cnn.query(simpleCrud.getOne(tableName, "email", "'" + email + "'"),
        async (err, result) => {
          if (err)
            console.log(err);

          if (result.length <= 0) {
            return response.status(400).json({ msg: 'There is no user registered with this email' });
          } else {

            const now = new Date();
            now.setHours(now.getHours() + 1);

            const resetParameters = {
              pwdResetToken: crypto.randomBytes(20).toString('hex'),
              pwdResetExp: now,
            }

            const values = Object.values(resetParameters);
            // console.log(resetParameters.pwdResetToken, resetParameters.pwdResetExp);

            cnn.query(simpleCrud.modifyOne(tableName, resetParameters, "email", "'" + email + "'"), values, function (error, result) {
              if (error) {
                console.log(error);
              }
              if (result.affectedRows > 0) {
                const mailOptions = {
                  from: config.get('auth.user'),
                  to: email,
                  subject: 'Password Reset from back-end',
                  text: `You asked to reset your password on Teachers Portal - Please use the following link to update your password: http://localhost:3334/api/auth/reset-password/${resetParameters.pwdResetToken}/${email}`
                };

                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.error(error)
                    return response.send(`Something went wrong trying to send email to ${to}`);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });

                return response.send(`Reset email has been sent to ${email}`);
              }
            })
          }
        })
    } catch (err) {
      console.error(error.message);
      response.status(500).send('Server Error');
    }

  });

router.post(
  '/reset-password/:token/:email',
  [
    check('pwd', 'Password is required').exists(),
    check('confirmPwd', 'Password confirmation is required').exists(),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const { token, email } = request.params;
    const { pwd, confirmPwd } = request.body;

    //Check if the password and confirm password match
    if (pwd !== confirmPwd) {
      return response.status(400).json({ "error": 'The field Password and Confirm Password do not match' });
    }

    //Get the user in the database by email.
    cnn.query(simpleCrud.getOne(tableName, "email", "'" + email + "'"),
      async (err, result) => {
        if (err)
          console.log(err);

        //Check if the user exist.
        if (result.length <= 0) {
          return response.status(400).json({ msg: 'There is no user registered with this email' });
        }

        const now = new Date();
        //Compare the token from the database to the token from the url
        if (result[0].pwdResetToken !== token) {
          return response.status(400).json({ msg: 'Token invalid!' });
        }

        //Check if the token has expired
        if (now > result[0].pwdResetExp) {
          return response.status(400).json({ msg: 'Token expired!' });
        }

        //Generate the salt
        const salt = await bcrypt.genSalt(10);

        //Create a object to query in mysql and salt the password
        const password = {
          password: await bcrypt.hash(pwd, salt)
        };

        const values = Object.values(password);

        cnn.query(simpleCrud.modifyOne(tableName, password, "email", "'" + email + "'"), values, function (err, result) {

          if (err) {
            return response.status(500).json({ msg: 'Internal Server Error' });
          }

          if (result.affectedRows > 0) {
            return response.status(200).json({ msg: 'Password Updated Successfully!' });
          }

        });
      });
  });

module.exports = router;