import express from 'express';

import { getConnection } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const rows = await connection.query('SELECT * FROM users');
    console.log("get users/");
    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users: ', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
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
    const existingUser = await connection.query(
      "SELECT * FROM users WHERE uid = ?",
      [uid]
    );
    console.log('existingUser');
    console.log(existingUser);
    if (existingUser.length > 0) {
      return res.status(200).json({
        success: true,
        message: `Welcome back ${existingUser[0].name}`,
        ...existingUser[0]
      });
    } else {
      // USer does not exist, let's add them
      const result = await connection.query(
        "INSERT INTO users (uid, email, name) VALUES (?, ?, ?)",
        [uid, email, name]
      );

      const userId = result.insertId;

      // Retreive new user
      const newUser = await connection.query("SELECT * FROM users WHERE user_id = ?", [result.insertId]);
      console.log('newUser');
      console.log(newUser);
      res.status(201).json({
        success: true,
        message: 'Added new user',
        ...newUser[0]
      });
    }
  } catch (error) {
    console.error("Error during user verification: ", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;