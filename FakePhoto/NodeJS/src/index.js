const express = require('express');
require('dotenv').config();
const { PORT, MONGO_URL } = process.env;

//MONGO DB
const mongoose = require('mongoose');

mongoose.connect(MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err))


//EXPRESS
const app = express();


app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.listen(PORT, () => {
  console.log(`Server is running`);
});