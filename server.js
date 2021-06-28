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
const passportSocketIo = require("passport.socketio");
const MongoStore = require("connect-mongo")(session);
const cookieParser =  require("cookie-parser");
const URI = process.env.MONGO_URI;
const store = new MongoStore({url: URI});

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
  cookie: {secure:false},
  key: "express.sid",
  store: store
}))

app.use(passport.initialize());
app.use(passport.session());

// Connect passport socket io to be able to have req methode to know who is connected
const onAuthorizeSuccess = (data, accept) =>{
  console.log("successful connection to socket.io");
  accept(null, true);
}

const onAuthorizeFail = (data, message, error, accept)=>{
  if(error) throw new Error(message);
  console.log("failed connection to socket.io: " , message);
  accept(null, false);
}

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: "express.sid",
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
)

//Connect to db
myDB(async client =>{

  const myDataBase = await client.db("database").collection('login');
  routes(app, myDataBase);
  auth(app, myDataBase);

  let currentUsers = 0;
  io.on('connection', (socket)=>{
    ++currentUsers;
    console.log('A user has connected');
    io.emit("user", {name: socket.request.user.name, currentUsers, connected: true});
    console.log("user" + socket.request.user.name + " connected");
    socket.on("chat message", (message)=>{
      io.emit("chat message", {name: socket.request.user.name, message});
    })
    socket.on("disconnect", ()=>{
      --currentUsers;
      io.emit("user", {name: socket.request.user.name, currentUsers, connected:false});
    })
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
