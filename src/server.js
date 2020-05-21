const express = require('express');
const cnn = require('../config/db');

const app = express();

//database connection
// connectDB();

//middleware
app.use(express.json());

//routes
app.use('/api/users', require('../src/routes/users'));
app.use('/api/auth', require('../src/routes/auth'));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3334;
}

app.listen(port, () => console.log(`Listening on http://localhost:${port}/`));