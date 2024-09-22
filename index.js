const express = require("express");
const path = require("path");
const userModel = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  bcrypt.compare(password, user.password, function (err, result) {
    if (!result) return res.status(400).send("Invalid password");

    const token = jwt.sign({ email: user.email }, 'secret');
    res.redirect("/");
  });
});



app.get("/", (req, res) => {
  res.send("Login Successfull");
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
