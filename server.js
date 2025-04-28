import express from 'express';
import crypto from 'crypto';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Your Telegram Bot Token
const BOT_TOKEN = "7907765042:AAGkCMUkVM7ZXh8sIjgbWDsIAD7IFchgafg";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function checkTelegramAuth(data) {
  const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  
  const sortedKeys = Object.keys(data).filter(k => k !== 'hash').sort();
  const checkString = sortedKeys.map(k => `${k}=${data[k]}`).join('\n');
  
  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
  return hmac === data.hash;
}

app.get('/auth', (req, res) => {
  const data = req.query;

  if (!data.hash) {
    return res.status(400).send('Missing hash.');
  }

  if (checkTelegramAuth(data)) {
    let userInfo = {};
    if (data.user) {
      userInfo = JSON.parse(data.user);
    }
    res.send(`Hello ${userInfo.first_name || 'User'}, you are authenticated!`);
  } else {
    res.status(403).send('Authentication failed.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
