const express = require("express");
const router = express.Router();
const userSchema = require("../validtions/user");
const UserModel = require("../models/users");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const returnUserKeys = ["email", "_id", "createdAt", "name"];
const checkToken = require("../middleware/chekToken");
const { date } = require("joi");
const saltRounds = 10;

router.post("/create", createRequest);

async function createRequest(req, res) {
  const { error, value } = userSchema.newUser.validate(req.body);
  const user = value;
  if (error) {
    res.status(400).send(error);
  } else {
    try {
      const result = await UserModel.find({ email: user.email });
      if (result.length > 0) {
        res.status(400).send("User already exists");
      } else {
        try {
          const savedUser = await saveUser(user);
          res.status(201).send(savedUser);
        } catch (err) {
          res.status(400).send(err);
        }
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }
}

function saveUser(user) {
  return new Promise(async (resolve, reject) => {
    try {
      user.password = await bcrypt.hash(user.password, saltRounds);
      const savedUser = await new UserModel(user).save();
      resolve(_.pick(savedUser, returnUserKeys));
    } catch (err) {
      reject(err);
    }
  });
}

router.post("/auth", login);
async function login(req, res) {
  const { error, value } = userSchema.auth.validate(req.body);
  const user = value;
  if (error) {
    res.status(400).send(error);
  } else {
    try {
      const userModel = await UserModel.findOne({ email: user.email });
      if (!userModel) {
        res.status(400).send("Username or password wrong");
        return;
      }
      const isAuth = await userModel.checkPassword(user.password);
      if (!isAuth) {
        res.status(400).send("Username or password wrong");
        return;
      }
      res.status(200).send(userModel.getToken());
    } catch (err) {
      res.status(400).send(err);
    }
  }
}
//
router.get("/me", checkToken, me);

async function me(req, res) {
  const userId = req.userId;
  try {
    const user = UserModel.findOne({ _id: userId });
    res.status(200).send(_.pick(user, returnUserKeys));
  } catch {
    res.status(400).send("User not exists try to login again");
  }
}

router.get("/create", (req, res) => {
  res.send("hi");
});

module.exports = router;
