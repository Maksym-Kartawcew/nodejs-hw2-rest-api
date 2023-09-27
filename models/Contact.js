import {Schema, model} from "mongoose";
import Joi from "joi";

import { handleSaveError, runValidateAtUpdate } from "./hooks.js";

const contactSchema = new Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
}, {versionKey: false, timestamps: true});

contactSchema.post("save", handleSaveError);

contactSchema.pre("findOneAndUpdate", runValidateAtUpdate);

contactSchema.post("findOneAndUpdate", handleSaveError);

export const ContactAddSchema = Joi.object({
    name: Joi.string().required().messages({
        "any.required": `"title" must be exist`
    }),
    email: Joi.string().required(),
    favorite: Joi.boolean(),
    phone: Joi.string().required(),
})

export const ContactUpdateFavoriteSchema = Joi.object({
    favorite: Joi.boolean().required(),
})

const Contact = model("Contact", contactSchema);

export default Contact;