import env from "../../config";
import { PatientRepository } from "./../repositories/patientRepo";
var cron = require("node-cron");
var nodemailer = require("nodemailer");
var sent = false;
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: env.SKINCURE_EMAIL,
    pass: env.SKINCURE_PASS,
  },
});

const mailoptions = {
  from: env.SKINCURE_EMAIL,
  to: "popsafomle@gufum.com", //deafult temp mail
  subject: "SkinCure Reminder",
  text: `You have an appointment tomorrow`,
};
(() => {
  cron.schedule(
    "*/1 * * * *",
    () => {
      try {
        PatientRepository.createQueryBuilder("patient")
          .select(["appointment.aptdate", "user.email"])
          .innerJoin("patient.appointment", "appointment")
          .innerJoin("patient.user", "user")
          .where("appointment.paid =:true", { true: true })
          .getRawMany()
          .then((patients) => {
            patients.forEach((appointment) => {
              const aptdatestr = appointment.appointment_aptdate
                .split(":")
                .reverse()
                .join("-");
              const aptdate = new Date(aptdatestr);
              const curdate = new Date();
              let hoursbetween = aptdate.getTime() - curdate.getTime();
              hoursbetween = hoursbetween / (1000 * 60 * 60);
              if (hoursbetween > 0 && hoursbetween <= 24) {
                mailoptions.to = appointment.user_email;
                transporter.sendMail(
                  mailoptions,
                  function (err: any, info: any) {
                    if (err) console.log(err);
                    else console.log(info);
                  }
                );
              }
            });
          });
      } catch (error) {
        console.log("cronjob could not send the mail", 500);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Karachi",
    }
  );
  sent = true;
})();
export { sent };
