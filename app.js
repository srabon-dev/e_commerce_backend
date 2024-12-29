const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const router = require('./src/app/route/router');

const notFoundError = require('./src/error/not.found.error.js');
const globalErrorHandler = require('./src/error/global.error.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("uploads"));

app.use('/api', router);


// Global Error Handler
app.use(globalErrorHandler);

// Handle not found
app.use(notFoundError.hendle);

module.exports = app;
