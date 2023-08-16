const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


// register
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }
  const userAvailble = await User.findOne({ email });
  if (userAvailble) {
    res.status(400);
    throw new Error("user already registered");
  }
  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  // create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });
  if (user) {
    res.status(201).json({ user });
  } else {
    res.status(400);
    throw new Error("Data is not valid");
  }
  //   console.log(`user created successfully ${user}`);
});


// login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }
  const user = await User.findOne({ email });
  // compare password with hashPassword
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "30m" }
    );
    res.status(200).json({ token });
  } else {
    res.status(401);
    throw new Error("Email or Password Incorrect");
  }
});