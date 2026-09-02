import nodemailer from "nodemailer";
// @ts-ignore
import hbs from "nodemailer-express-handlebars";
import path from "path";
import prisma from "./prisma";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || "nfhusain.fana@gmail.com",
    pass: process.env.SMTP_PASS || "gjen opnx wsmd pmze",
  },
});

// point to the template folder
const handlebarOptions = {
  viewEngine: {
    partialsDir: path.resolve(process.cwd(), "views/"),
    defaultLayout: false,
  },
  viewPath: path.resolve(process.cwd(), "views/"),
};

// use a template file with nodemailer
transporter.use("compile", hbs(handlebarOptions as any));

const sendEmail = async (
  mailOptions: Record<string, unknown>,
  to: string,
  role: number,
  emailType: string,
  schoolId: number | null = null
) => {
  try {
    await transporter.sendMail(mailOptions as any);
    await prisma.email.create({
      data: {
        school_id: schoolId,
        email_type: emailType,
        receiver_email: to,
        role,
        status: 1,
        message: "Email Sent Successfully",
      },
    });
  } catch (error) {
    console.error("Email error:", error);
    try {
      await prisma.email.create({
        data: {
          school_id: schoolId,
          email_type: emailType,
          receiver_email: to,
          role,
          status: 0,
          message: "Error Sending Email",
        },
      });
    } catch (dbErr) {
      console.error("Failed to log email error:", dbErr);
    }
  }
};

export default sendEmail;
