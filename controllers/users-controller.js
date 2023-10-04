import User from "../models/User.js";
import { nanoid } from "nanoid";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import Jimp from "jimp";
import path from "path";
import fs from "fs/promises";

import { ctrlWrapper } from "../decorators/decorators.js";
import { HttpError, sendEmail } from "../helpers/helpers.js";

const { JWT_SECRET, BASE_URL } = process.env;
const avatarsPath = path.resolve("public", "avatars");

const register = async (req, res) => {
  const { useremail, password } = req.body;

  const user = await User.findOne({ useremail });
  if (user) {
    throw HttpError(409, "Email already exist");
  }

  const avatarURL = gravatar.url(useremail);
  const hashPassword = await bcrypt.hash(password, 10);
  const verificationCode = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationCode,
  });

  const verifyEmail = {
    to: useremail,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationCode}">Click to verify email</a>`,
  };
  await sendEmail(verifyEmail);

  res.status(201).json({
    username: newUser.username,
    useremail: newUser.useremail,
    avatarURL: newUser.avatarURL,
  });
};

const verify = async (req, res) => {
  const { verificationCode } = req.params;
  const user = await User.findOne({ verificationCode });
  if (!user) {
    throw HttpError(404);
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationCode: "",
  });

  res.json({
    message: "Email verify success",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { useremail } = req.body;
  const user = await User.findOne({ useremail });
  if (!user) {
    throw HttpError(404, "email not found");
  }
  if (user.verify) {
    throw HttpError(400, "Email already verify");
  }

  const verifyEmail = {
    to: useremail,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationCode}">Click to verify email</a>`,
  };
  await sendEmail(verifyEmail);

  res.json({
    message: "Verify email resend success",
  });
};

const login = async (req, res) => {
  const { useremail, password } = req.body;
  const user = await User.findOne({ useremail });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verify");
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
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { subscription },
      { new: true }
    );
    if (!updatedUser) {
      throw HttpError(404, "User not found");
    }
    res.json(updatedUser);
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarsPath, filename);

  Jimp.read(oldPath)
    .then((avatar) => {
      return avatar.resize(250, 250).write(newPath);
    })
    .catch((err) => {
      throw err;
    });

  await fs.rename(oldPath, newPath);
  const avatarURL = path.join("avatars", filename);

  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({ avatarURL });
};

export default {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  getCurrent: ctrlWrapper(getCurrent),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
