import express from "express";
import bodyParser from "body-parser";

import { loadEnvConfig, __dirname, join } from "./config.js";

import userRoutes from './routes/users.js';
import familiesRoutes from './routes/families.js';
import kidRoutes from './routes/kids.js';

loadEnvConfig();

const app = express();
const PORT = process.env.EXPRESS_PORT || 3000;
const HOST = process.env.EXPRESS_HOST || 'localhost';

app.use(bodyParser.json());

console.log('NODE_ENV: ', process.env.NODE_ENV);

app.use(express.static(join(__dirname, '../dist')));

app.use('/api/users', userRoutes);
app.use('/api/families', familiesRoutes);
app.use('/api/kids', kidRoutes);
// app.use('/api/transactions', transactionsRoute);

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

