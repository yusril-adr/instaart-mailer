require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.status(405).send({ error: true, message: 'Request method is not supported' });
});

app.post('/', async (req, res) => {
  const { 'x-auth': auth } = req.headers;
  if (auth !== process.env.AUTHCODE) {
    return res.status(401).send({ error: true, message: 'Authentication code is not correct.' });
  }

  const { email, recovery_token: recoveryToken } = req.body;

  if (!email) {
    return res.status(428).send({ error: true, attribute: 'email', message: 'Email is empty.' });
  }

  if (!recoveryToken) {
    return res.status(428)
      .send({ error: true, attribute: 'recovery_token', message: 'Recovery token is empty.' });
  }

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Recovery Password',
    // text: `Silakan kunjungi link berikut untuk mengganti password anda : http://instaart.expectron.tech/#/recovery/${recoveryToken}`,
    text: `
      Haloo, kami dari instaart mendapati bahwa anda telah kesulitan untuk login, silahkan ubah password anda melalui link tautan dibawah ini :
      
      http://instaart.expectron.tech/#/recovery/${recoveryToken}
      
      Semoga hari anda menyenangkan 
      - Admin Instaart
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    return res.send({ error: false, message: 'Email successfully sended!' });
  } catch (error) {
    return res.status(500)
      .send({ error: true, message: error.message });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT} || http://127.0.0.1:${PORT}`);
});
