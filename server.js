//init

'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require("express-session");
const routes = require("./routes");
const auth = require("./auth");
const passport = require("passport");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

//setting

app.set("view engine", "pug");
fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//login init
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {secure:false}
}))

app.use(passport.initialize());
app.use(passport.session());

//Connect to db
myDB(async client =>{

  const myDataBase = await client.db("database").collection('login');
  routes(app, myDataBase);
  auth(app, myDataBase);

  io.onconnection('connection', (socket)=>{
    console.log('A user has connected');
  })

}).catch(e=>{

  app.route('/').get((req, res) => {
  res.render('pug', {title: e, message:"Unable to login"});

});
})

//connect server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
