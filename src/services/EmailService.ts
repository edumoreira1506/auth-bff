import nodemailer from 'nodemailer'

import { EMAIL_PASSWOWRD, EMAIL_USERNAME } from '@Constants/email'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWOWRD
  }
})

export default class EmailService {
  static send({
    emailDestination,
    message,
    subject,
  }:  {
    emailDestination: string;
    message: string;
    subject: string;
  }) {
    const mailOptions = {
      from: EMAIL_USERNAME,
      to: emailDestination,
      subject,
      text: message
    }
  
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error)
      } else {
        console.log('Email sent: ' + info.response)
      }
    })
  }
}
