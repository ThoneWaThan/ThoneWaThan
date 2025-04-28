import express from 'express';
import crypto from 'crypto';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = "7907765042:AAGkCMUkVM7ZXh8sIjgbWDsIAD7IFchgafg";

app.use(cors()); // Allow frontend requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function checkTelegramAuth(initData) {
  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
  
  const dataCheckString = Object.keys(initData)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${initData[key]}`)
    .join('\n');
  
  const hmac = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hmac === initData.hash;
}

app.get('/auth', (req, res) => {
  const { user, hash, ...otherFields } = req.query;

  if (!user || !hash) {
    return res.status(400).send("Missing required fields.");
  }

  const initData = { user, hash, ...otherFields };

  if (checkTelegramAuth(initData)) {
    const userInfo = JSON.parse(user);
    res.send(`Hello, ${userInfo.first_name}! Your Telegram ID is ${userInfo.id}.`);
  } else {
    res.status(403).send('Invalid authentication.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
