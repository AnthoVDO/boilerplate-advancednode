module.exports = (app, myDataBase) =>{
    const passport = require("passport");
    const bcrypt = require("bcrypt");


    //root route
  app.route("/").get((req,res)=>{
    res.render("pug", {
      title: "Connected to Database",
      message:"Please login",
      showLogin: true,
      showRegistration:true,
      showSocialAuth: true
    }) 
  })

  //register route
  app.route('/register').post((req, res, next)=>{
    const hash = bcrypt.hashSync(req.body.password, 12);
    myDataBase.findOne({username: req.body.username}, (err, user)=>{
      if(err){next(err);}
      else if(user){
        res.redirect('/');
      } else {
        myDataBase.insertOne({
          username: req.body.username, password: hash
        }, (err, doc)=>{
          if(err){res.redirect('/')}
          else{
            next(null, doc.ops[0]);
          }
        })
      }
    })
  }, passport.authenticate("local", {faillureRedirect: '/'}), (req, res, next)=>{
    res.redirect("/profile");
  }
  )

  /*---------------------- Social auth ---------------------------------------*/

  app.route("/auth/github").get(passport.authenticate("github"),(req, res)=>{

  })

  app.route("/auth/github/callback").get(passport.authenticate("github", {faillureRedirect: "/"}), (req, res)=>{
    res.redirect("/profile")
  })

  /*---------------------- ----------- ---------------------------------------*/
  //login route
  app.post("/login", passport.authenticate('local', { failureRedirect: '/'}), 
  (req,res)=>{
     res.redirect("/profile");
  })

  //middleware to check aunth
  const ensureAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
      return next();
    }else{
      res.redirect("/")
    }
  }

  //profile route
  app.get("/profile", ensureAuthenticated, (req,res)=>{
    res.render(process.cwd()+"/views/pug/profile", {username: req.user.username})
  })

  //logout route
  app.get("/logout", (req,res)=>{
    req.logout();
    res.redirect('/');
  })

  //404
  app.use((req, res, next)=>{
    res.status(404).type("text").send("Not Found");
  })




}