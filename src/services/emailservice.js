const nodemailer = require('nodemailer');
const config = require('config')


const transporter = nodemailer.createTransport({
  host: 'smtp.live.com',
  port: 587,
  secure: false,
  auth: {
    user: config.get('auth.user'),
    pass: config.get('auth.pass')
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;
