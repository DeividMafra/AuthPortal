const express = require('express');
const router = express.Router();
const transporter = require('../services/emailservice');

router.post('/send', (request, response) => {

  const {
    from,
    to,
    subject,
    msg
  } = request.body;

  var mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: msg
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error)
      return response.send(`Something went wrong trying to send email to ${to}`);
    } else {
      console.log('Email sent: ' + info.response);
      return response.send(`Reset email has been sent to ${to}`);
    }
  })

})

module.exports = router;
