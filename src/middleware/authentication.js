const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (request, response, next) {
  //getting token from header
  const token = request.header('x-auth-token');

  //checking if there is a token
  if (!token) {
    return response.status(401).json({ msg: 'Access denied!' });
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    request.user = decoded;
    next();

  } catch (error) {
    return response.status(401).json({ msg: 'Invalid token!' });
  }

}
