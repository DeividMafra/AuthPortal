const express = require('express');
const crypto = require('crypto');
const cnn = require('../databaseCnn');

module.exports = {

  create(request, response) {
    const { email, password } = request.body;


    const hash = crypto.createHmac("sha256", "password")
      .update(password)
      .digest("base64");


    const credential = {
      email,
      password,
      hash
    }

    return response.json(credential);

  }

  // create = (request, response) => {
  //   const { email, password } = request.body;

  //   const salt = crypto.randomBytes(128).toString('base64');
  //   const hash = crypto.pbkdf2(password, salt, 1000);

  //   const credential = {
  //     email,
  //     password,
  //     hash
  //   }

  //   return response.json(credential);

  // }
}