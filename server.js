import express from 'express';
import crypto from 'crypto';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Your Telegram Bot Token
const BOT_TOKEN = "7907765042:AAGkCMUkVM7ZXh8sIjgbWDsIAD7IFchgafg";

app.use(cors()); // Allow MiniApp frontend to call this
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to verify Telegram login initData
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

// Auth endpoint
app.get('/auth', (req, res) => {
  const { user, hash, ...otherFields } = req.query;

  if (!user || !hash) {
    return res.status(400).send("Missing required fields.");
  }

  const initData = { user, hash, ...otherFields };

  if (checkTelegramAuth(initData)) {
    const userInfo = JSON.parse(user);
    res.send(`Hello ${userInfo.first_name}, you are authenticated!`);
  } else {
    res.status(403).send('Authentication failed.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
