const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendMail = async data => {
  const mail = { ...data, from: 'vokoloven@gmail.com' };

  sgMail
    .send(mail)
    .then(() => console.log('Mail sent'))
    .catch(e => console.log(e.message));
};

module.exports = sendMail;
