const express = require("express");
const app = express();
const path = require("path");
const userModel = require("./models/user");
const postModel = require("./models/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggedIn, (req, res) => {
  res.send(req.user);
});

app.post("/register", async (req, res) => {
  let { username, name, email, age, password } = req.body;
  // Check if user already exists
  let user = await userModel.findOne({ email });
  if (user !== null) return res.status(500).send("User already exists");

  // Encrypt Password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      // New user
      const newUser = await userModel.create({
        username,
        name,
        email,
        age,
        password: hash,
      });

      // Create and store token
      let token = jwt.sign({ email: email, userId: newUser._id }, "secret"); // Currently added secret as string. Will Update in future.
      res.cookie("token", token);
      res.send("User Registered !! ");
    });
  });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  // Check if user already exists
  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something Went Wrong");

  // If user Exists
  // Compare Password

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: email, userId: user._id }, "secret"); // Currently added secret as string. Will Update in future.
      res.cookie("token", token);
      res.status(200).send("You can login");
    } else {
      res.redirect("/login");
    }
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") res.send("Please Login First");
  else {
    let data = jwt.verify(req.cookies.token, "secret");
    req.user = data;
    next();
  }
}

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
