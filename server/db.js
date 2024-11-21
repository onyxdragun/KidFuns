import mariadb from 'mariadb';

import { loadEnvConfig } from './config';

loadEnvConfig();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 5
});

export async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error connecting to database: ', error);
    throw error;
  }
}
