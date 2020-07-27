require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require("fs");
var CronJob = require("cron").CronJob;

const port = 587;

const subject = "Daily Reminder";

function parseHtml() {
  function dateDiffInDays(a, b) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  let html = "<ul>";
  const data = JSON.parse(fs.readFileSync("./data.json"));

  data.forEach((element) => {
    html +=
      "<li>" +
      element.name +
      "<br>" +
      Date(element.date) +
      "<br>" +
      "Dagar kvar: " +
      dateDiffInDays(new Date(), new Date(element.date)) +
      "</li>";
  });

  html += "</ul>";
  return html;
}

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP,
    port: port,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.F_NAME + " " + process.env.F_MAIL, // sender address
    to: process.env.REC, // list of receivers
    subject: subject, // Subject line
    html: parseHtml(), // html body
  });

  console.log("Message sent: %s", info.messageId);
}

var job = new CronJob(
  "0 0 7 * * *",
  function () {
    main().catch(console.error);
  },
  null,
  true,
  "Europe/Stockholm"
);

job.start();

console.log("Aaaand we have liftoff");
