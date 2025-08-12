const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

require('dotenv').config();

const data = [
  {
    name: '',
    email: '',
    company: '',
  }
];

function getTemplatePath(folderName, fileName) {
  const parentDir = path.join(__dirname);
  const templatesDir = path.join(parentDir, folderName);
  return path.join(templatesDir, fileName);
}

async function sendEmailService({ email, html }) {
  try {
    let mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    let mailDetails = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: process.env.EMAIL_SUBJECT,
      html,
      attachments: [
        {
          filename: process.env.ATTACHMENT_NAME,
          path: path.join(__dirname, process.env.ATTACHMENT_NAME),
        },
      ],
    };

    await mailTransporter.sendMail(mailDetails);
    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${email}:`, error.message);
  }
}

async function sendEmailsWithDelay() {
  const templatePath = getTemplatePath('templates', 'template.ejs');
  console.log(templatePath);
  const templateContent = fs.readFileSync(templatePath, 'utf8');

  for (let i = 0; i < data.length; i++) {
    const { name, email, company } = data[i];

    const renderedHtml = ejs.render(templateContent, {
      hrName: name,
      companyName: company,
    });

    await sendEmailService({ email, html: renderedHtml });

    if (i < data.length - 1) {
      console.log(
        `⏳ Waiting 30 seconds before sending to ${data[i + 1].email}...`
      );
      await new Promise((resolve) => setTimeout(resolve, 0.5 * 60 * 1000));
    }
  }
}

sendEmailsWithDelay();
