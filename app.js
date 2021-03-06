const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const API = require('./routes/index');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileupload());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', API);

const db = require('./engine/db');

module.exports = app;


