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
  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  console.log(token);

  res.json({
    token,
  });
};

export default {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
};
