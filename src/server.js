const express = require('express');
const cnn = require('../config/db');
var cors = require('cors');

const app = express();
//middleware
app.use(express.json());
app.use(cors());

//routes
app.use('/api/users', require('../src/routes/users'));
app.use('/api/auth', require('../src/routes/auth'));
app.use('/api/email', require('../src/routes/email'));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3334;
}

app.listen(port, () => console.log(`Listening on http://localhost:${port}/`));