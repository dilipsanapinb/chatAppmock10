const express = require("express");

const { User } = require("../models/user.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const userRoute = express.Router();

// register user

userRoute.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).send({ Message: "User is Allready Registered" });
    } else {
      // generate verification token

      const verifivationToken = jwt.sign({ email }, process.env.key, {
        expiresIn: "1d",
      });
      bcrypt.hash(password, 5, async function (err, hash) {
        // Store hash in your password DB.
        if (err) {
          console.log({
            " Error": "error at registering the user",
            Error: err,
          });
          res.status(404).send({ Message: err.message });
        } else {
          let newUser = new User({
            username,
            email,
            password: hash,
            isVerified: false,
          });
          await newUser.save();
          const verficationLink = `https://mockchatapp.onrender.com/user/api/verify/${verifivationToken}`;
          const mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: email,
            subject: "Email Verifcation fot Chat App",
            html: `Click the link to verify your Email:
                        <a href="${verficationLink}">${verficationLink}</a>`,
          };

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              type: "OAuth2",
              user: process.env.MAIL_USERNAME,
              pass: process.env.MAIL_PASSWORD,
              clientId: process.env.OAUTH_CLIENTID,
              clientSecret: process.env.OAUTH_CLIENT_SECRET,
              refreshToken: process.env.OAUTH_REFRESH_TOKEN,
            },
          });
          transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
              console.log("Error" + err);
            } else {
              console.log("Email sent successfully!");
            }
          });

          res.status(201).send({
            Message:
              "User Registered Successfully, please check your email for verification",
            User: newUser,
          });
        }
      });
    }
  } catch (error) {
    console.log({ Error: "error at registering the user", Error: error });
    res.status(500).send({ Message: error.message });
  }
});

// verify the email

userRoute.get("/api/verify/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const deocodedToken = jwt.verify(token, process.env.key);
    const { email } = deocodedToken;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ Message: "user not found" });
    }
    user.isVerified = true;
    await user.save();
    res.redirect("http://localhost:8000/login.html");
  } catch (error) {
    console.log({ Error: "error at verify the user", Error: error });
    res.status(500).send({ Message: error.message });
  }
});

// login user

userRoute.post("/api/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send({ Message: "User Not Found" });
  }
  let hashPass = user.password;
  let isVerified = user.isVerified;
  try {
    if (isVerified == false) {
      return res.status(400).send({ Message: "User is not verified" });
    }
    bcrypt.compare(password, hashPass, function (err, result) {
      // result == true
      if (result) {
        var token = jwt.sign({ userID: user._id }, process.env.key);
        res
          .status(201)
          .send({ Messsage: "User Logged in successfully", token: token });
      } else {
        console.log({
          Error: "error at login the user",
          Error: err,
        });
        res.status(404).send({ Message: err.message });
      }
    });
  } catch (error) {
    console.log({ Error: "error at login the user", Error: error });
    res.status(500).send({ Message: error.message });
  }
});

module.exports = { userRoute };
