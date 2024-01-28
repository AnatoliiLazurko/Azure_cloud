const express = require('express');
const path = require('path');
require('dotenv').config();
const { PORT, MONGO_URL } = process.env;

//MONGO DB
const mongoose = require('mongoose');

mongoose.connect(MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err))


//EXPRESS
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const AuthRouter = require('./routes/auth-router');
const FakeImageRouter = require('./routes/fakeImage-router');

app.use('/api', AuthRouter);
app.use('/api', FakeImageRouter);
app.use('/storage', express.static(path.join(__dirname, 'storage')));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.listen(PORT, () => {
  console.log(`Server is running`);
});