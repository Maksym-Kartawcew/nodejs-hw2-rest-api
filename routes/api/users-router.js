import express from "express";

import * as userSchemas from "../../models/User.js";
import { validateBody } from "../../decorators/decorators.js";

import authController from "../../controllers/users-controller.js";

const usersRouter = express.Router();
const userRegisterValidate = validateBody(userSchemas.userRegisterSchema);
const userLoginValidate = validateBody(userSchemas.userLoginSchema);

usersRouter.post("/register", userRegisterValidate, authController.register);
usersRouter.post("/login", userLoginValidate, authController.login);

export default usersRouter;
