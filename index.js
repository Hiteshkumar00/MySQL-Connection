const mysql = require("mysql2");
const express = require("express");
const methodOverride = require('method-override')
const app = express();
const port = 8080;
const path = require("path");
const { v4: uuidv4 } = require('uuid');

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: '220824'
});

//home route

app.get("/", (req, res)=>{
  let q = "SELECT count(*) FROM user";
  try{
    connection.query(q, (err, result)=>{
      if(err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", {count});
    });
  }catch(err){
    res.send("Some error in database<br>" + err);
  };
});

//Show all

app.get("/user", (req, res)=>{
  let q = "SELECT id, username, email FROM user";
  try{
    connection.query(q, (err, result)=>{
      if(err) throw err;
      let users = result;
      res.render("show.ejs", {users});
    });
  }catch(err){
    res.send("Some error in database<br>" + err);
  };
});

//get user edit form 

app.get("/user/:id/edit",(req, res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = "${id}"`;
  try{
    connection.query(q, (err, result)=>{
      if(err) throw err;
      let user = result[0];
      console.log(user.password);
      res.render("edit.ejs", { user });
    });
  }catch(err){
    res.send("Some error in database<br>" + err);
  };
});

//update user

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { username, pass } = req.body;
  let qp = `SELECT password FROM user WHERE id = "${id}"`;
  try{
    connection.query(qp, (err, result)=>{
      if(err) throw err;
      let password = result[0]["password"];
      console.log(password);
      if(password == pass){
        let q = `UPDATE user SET username = "${username}" WHERE id = "${id}"`;
        try{
          connection.query(q, (err, result)=>{
            if(err) throw err;
            res.redirect("/user");
          });
        }catch(err){
          res.send("Some error in database<br>" + err);
        };
      }else{
        res.redirect(`/user/${id}/edit`);
      }
    });
  }catch(err){
    res.send("Some error in database<br>" + err);
  };
});


//nuw user form
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

//add new user,  dont enter duplicate entry
app.post("/user", (req, res) => {
  let {username, email, password} = req.body;
  let id = uuidv4();
  let data = [id, username, email, password];

  let q = `INSERT INTO user (id, username, email, password) VALUES (?)`;

  try{
    connection.query(q,[data],(err, result)=>{
      if(err){
        throw err;
      };
      res.redirect("/user");
    });
  }catch(err){
    console.log(err);
    res.redirect("/user/new");
  };
});


// verify pass and email
app.get("/user/:id/delete", (req, res)=>{
  let { id } = req.params;
  let q = `SELECT email, password FROM user WHERE id = "${id}"`;
  try{
    connection.query(q, (err, result)=>{
      if(err) throw err;
      console.log(result[0]);
    });
  }catch(err){
    res.send("Some error in database<br>" + err);
  };
  res.render("verifyUser.ejs", {id});
})

// destroy user, sad moment
app.delete("/user/:id", (req, res) => {
  let {id} = req.params;
  let {email : UEmail, password: UPass} = req.body;
  let q = `SELECT email, password FROM user WHERE id = "${id}"`;
  try{
    connection.query(q, (err, result)=>{
      if(err) throw err;
      let {email, password} = result[0];
      if(email == UEmail && password == UPass){

          let q = `DELETE FROM user WHERE id = '${id}'`;
          try{
            connection.query(q, (err, result)=>{
              if(err) throw err;
              res.redirect("/user");
            });
          }catch(err){
            res.send("Some error in database<br>" + err);
          };

      }else{
        res.redirect(`/user/${id}/delete`);
      } 
    });
  }catch(err){
    res.send("Some error in database<br>" + err);
  };
})


app.listen(port, ()=>{
  console.log(`Server is listining to port ${8080}`);
});