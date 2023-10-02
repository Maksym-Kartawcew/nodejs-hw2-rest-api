import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ctrlWrapper } from "../decorators/decorators.js";
import { HttpError } from "../helpers/helpers.js";

const { JWT_SECRET } = process.env;

const register = async (req, res) => {
  const { useremail, password } = req.body;
  const user = await User.findOne({ useremail });
  if (user) {
    throw HttpError(409, "Email already exist");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ ...req.body, password: hashPassword });

  res.status(201).json({
    username: newUser.username,
    useremail: newUser.useremail,
  });
};

const login = async (req, res) => {
  const { useremail, password } = req.body;
  const user = await User.findOne({ useremail });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  const { _id: id } = user;
  const payload = { id };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(id, { token });

  res.json({
    token,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "Logout success",
  });
};

const getCurrent = (req, res) => {
  const { username, useremail } = req.user;

  res.json({ useremail, username });
};



const updateSubscription = async (req, res) => {
  const { subscription } = req.body;
  const { _id } = req.user;

  try {
       if (!["starter", "pro", "business"].includes(subscription)) {
      throw HttpError(400, "Invalid subscription value");
    }
    const updatedUser = await User.findByIdAndUpdate(_id, { subscription }, { new: true });
    if (!updatedUser) {
      throw HttpError(404, "User not found");
    }
     res.json(updatedUser);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
  }
};



export default {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateSubscription: ctrlWrapper(updateSubscription),
};
