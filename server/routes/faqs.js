import express from 'express';

import { getConnection } from '../db.js';
import { logEvent } from '../utils/logs.js';

const router = express.Router();

router.get('/', async (req, res) => {
  let connection;

  try {
    connection = await getConnection();
    const results = await connection.execute(
      `
      SELECT fc.name AS category,
      GROUP_CONCAT(
        JSON_OBJECT(
          'id', f.id,
          'question', f.question,
          'answer', f.answer,
          'created_at', f.created_at,
          'updated_at', f.updated_at
        ) SEPARATOR ','
      ) AS faqs
      FROM faqs AS f
      INNER JOIN faqs_category AS fc on f.category_id = fc.id
      GROUP BY fc.name
      ORDER BY fc.name
      `,[]
    );
    console.log('SELECT: ', results);
    if (results.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'There are currently no FAQs available'
      });
    } 

    res.status(200).json({
      success: true,
      faqs: results
    });
  } catch (error) {
    console.log('Error fetching FAQs: ', error);
    res.status(400).json({
      success: false,
      message: 'Failed to fetch FAQs'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;