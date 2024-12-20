import express from 'express';

import { getConnection } from '../db.js';
import { incrementAllowances } from '../utils/autoAllowance.js';
import { logEvent } from '../utils/logs.js';

const router = express.Router();

router.get('/changelog', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const offset = (page - 1) * limit;

  if (isNaN(page) || page < 1) {
    return res.status(400).json({ success: false, error: 'Invalid page number' });
  }

  if (isNaN(limit) || limit < 1) {
    return res.status(400).json({ success: false, error: 'Invalid limit' });
  }

  let connection;

  try {
    connection = await getConnection();
    const rows = await connection.execute(
      `SELECT * FROM changelog ORDER BY release_date DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    if (rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No data was found'
      });
    }
    res.status(200).json({
      success: true,
      rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch changelog'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;