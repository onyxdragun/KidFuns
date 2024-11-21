import express from 'express';

import { getConnection } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const rows = await connection.query('SELECT * FROM users');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users: ', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.post("/login", async (req, res) => {
  const { uid, email, name } = req.body;
  let connection;

  try {
    connection = await getConnection();
    const existingUser = await connection.query("SELECT * FROM users WHERE uid = ?", [uid]);
    if (existingUser.length > 0) {
      return res.status(200).json(existingUser[0]);
    } else {
      const [result] = await connection.query(
        "INSERT INTO users (uid, email, name) VALUES (?, ?, ?)",
        [uid, email, name]
      );

      // Retreive new user
      const [newUser] = await connection.query("SELECT * FROM users WHERE user_id = ?", [result.insertId]);
      return res.status(201).json(newUser[0]);
    }
  } catch (error) {
    console.error("Error during user verification: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;