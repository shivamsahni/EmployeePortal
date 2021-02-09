const createError = require('http-errors');
const express = require('express');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const db = require('./database/db');

const authRouter = require('./routes/auth')
const indexRouter = require('./routes/index');
const catalogRouter = require('./routes/catalog');

const compression = require('compression');
const helmet = require('helmet');
const passport = require('passport');
require('./passport/passport');
const auth = require('./middleswares/auth');
const jwt = require('express-jwt');

const app = express();

// connect database
const dev_db_url = 'mongodb+srv://test_user:12abcdef12@cluster0.bsl5z.mongodb.net/EmployeePortal?retryWrites=true&w=majority';
const mongoDB = process.env.DB_URL || dev_db_url;
db.connectToDatabase(mongoDB);

// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(helmet());
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
//app.use(auth.isAuthenticated());
app.use('/', indexRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
