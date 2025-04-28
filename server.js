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

// Function to check if the Telegram signature matches
function checkTelegramAuth(data) {
  const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();

  const sortedKeys = Object.keys(data).filter(k => k !== 'hash').sort();
  const checkString = sortedKeys.map(k => `${k}=${data[k]}`).join('\n');

  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
  return hmac === data.hash;
}

app.get('/auth', (req, res) => {
  const data = req.query;

  // Log incoming request data for debugging
  console.log("Received Data:", data);

  if (!data.hash) {
    console.log('Error: Missing hash in data.');
    return res.status(400).send('Missing hash.');
  }

  // Check the signature
  if (checkTelegramAuth(data)) {
    console.log("Signature verified successfully.");

    // Now it's safe to parse the user data
    let userInfo = {};
    try {
      if (data.user) {
        // Decode and parse the user data
        userInfo = JSON.parse(decodeURIComponent(data.user));
        console.log("Parsed user data:", userInfo);
      }
    } catch (err) {
      console.error("Error parsing user data:", err);
    }

    // Send a success message to the frontend
    res.send(`
      <h1>Hello ${userInfo.first_name || 'User'}!</h1>
      <p>Username: ${userInfo.username || 'N/A'}</p>
      <img src="${userInfo.photo_url}" alt="Profile Picture" width="100" />
    `);
  } else {
    console.log('Error: Authentication failed. Invalid signature.');
    res.status(403).send('Authentication failed.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
