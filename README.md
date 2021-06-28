# [Introduction to Advanced Node and Express Challenges](https://www.freecodecamp.org/learn/quality-assurance/advanced-node-and-express/)

# Notes  
## To use Pug.js  
1) add pug  
2) set pug => app.set("view engine", "pug")  
3) use in render => res.render()  
Note: don't forget __dirname or process.cwd() for the file directory  

## Authentication  
We can use Passeport.js to make the authentication.  
we can add Express-session to handle session (save cookie)  
  
- Surround with DB  
- Serial user and deserial user  
- Choose a strategy  
- Check authentication  
- Create a middleware to check if the user is authenticated to avoid all people who know the route to be there  
- if authentication is ok, show the profile and other route  
- get logout  
- get 404 status  
- catch if db error  
- register new user with this logic : post form => check if user exist already => authenticate the new user => redirect to profile  
- to user redirect, you need to create an app.get(path, (req, res)=>{res.render(pathfile, {optional variable})})  
- install bcrypt to encrypt password in the database  
  
## OAunth  
  
with passport, it's possible to use third app auth like google, github and facebook to log on our site.  
use socket.io for real time even  
with socket io, it's http.listen instead of app.listen
