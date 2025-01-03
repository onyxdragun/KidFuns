import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import { CronJob } from 'cron';

import { loadEnvConfig, __dirname, join } from "./config.js";

import userRoutes from './routes/users.js';
import familiesRoutes from './routes/families.js';
import kidRoutes from './routes/kids.js';
import systemRoutes from './routes/system.js';
import faqRoutes from './routes/faqs.js';
import { logEvent } from "./utils/logs.js";
import { incrementAllowances } from "./utils/autoAllowance.js";

loadEnvConfig();

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;
const HOST = process.env.EXPRESS_HOST || 'localhost';

const allowedOrigins = [
  'http://kidfuns.dyndns.org:5000', // Production,
  'http://192.168.1.20:5000',
  'http://75.156.62.221:5000',      // Public IP
  'http://localhost:2000',          // Local Development
  'http://192.168.1.20:2000',
];

app.use(bodyParser.json());

console.log('NODE_ENV: ', process.env.NODE_ENV);

app.use((req, res, next) => {
  const start = Date.now();

  // Log the incoming request
  console.log(`[${new Date().toISOString()}] ${req.ip} -> ${req.method} ${req.url}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.ip} <- ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
});

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

app.use(express.static(join(__dirname, '../dist')));

app.use('/api/users', userRoutes);
app.use('/api/families', familiesRoutes);
app.use('/api/kids', kidRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/faq', faqRoutes);

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const job = new CronJob('1 0 * * *', async () => {
  console.log('Running auto allowance increment job');
  logEvent(-1, "AUO_ALLOWANCE_EVENT", { message: 'Cron Job: Auto Allowance Executing' }, 'server')
  try {
    const result = await incrementAllowances();
    console.log('Auto allowance result:', result);
  } catch (error) {
    console.error('Error running auto allowance increment job:', error);
  }
},
  null,
  true,
  "America/Vancouver" // Adjust to your local timezone
);

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

