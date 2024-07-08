import express from 'express';
import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to set CSP headers
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' 'nonce-${nonce}';`
  );
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});