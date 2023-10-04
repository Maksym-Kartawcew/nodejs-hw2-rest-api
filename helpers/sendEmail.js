import nodemailer from "nodemailer";
import "dotenv/config";

const { GMAIL_EMAIL_FROM, GMAIL_EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT } = process.env;

const nodemailerConfig = {
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: true,
  auth: {
    user: GMAIL_EMAIL_FROM,
    pass: GMAIL_EMAIL_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = (data) => {
  const email = { ...data, from: GMAIL_EMAIL_FROM };
  return transport.sendMail(email);
};

export default sendEmail;
