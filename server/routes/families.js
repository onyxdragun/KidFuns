import express from 'express';

import { getConnection } from '../db.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  const { family_name, user_id } = req.body;
  let connection;

  try {
    connection = await getConnection();
    const results = await connection.query(
      'SELECT family_name FROM families WHERE LOWER(family_name) = LOWER(?)',
      [family_name]
    );

    if (results.length > 0) {
      return res.status(200).json({
        success: false,
        message: 'Family name already exists'
      });
    }

    const result = await connection.query(
      'INSERT INTO families (family_name) VALUES (?)',
      [family_name]
    );

    const family_id = Number(result.insertId);

    const existingLink = await connection.query(
      'SELECT * FROM linked_accounts WHERE family_id = ? AND user_id = ?',
      [family_id, user_id]
    );

    if (existingLink.length > 0) {
      return res.status(200).json({
        succes: false,
        message: 'User is already linked to this family'
      });
    }

    await connection.query(
      'INSERT INTO linked_accounts (family_id, user_id) VALUES (?, ?)',
      [family_id, user_id]
    );

    res.status(201).json({
      success: true,
      family_id,
      family_name,
      message: 'Family created and linked to user successfully',
    });
  } catch (error) {
    console.error('Error creating family:', error);
    res.status(500).json({
      sucess: false,
      message: 'Failed to create family: ', error
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  let connection;

  try {
    connection = await getConnection();
    const rows = await connection.query(
      `SELECT families.family_id, families.family_name
      FROM families
      INNER JOIN linked_accounts ON families.family_id = linked_accounts.family_id
      WHERE linked_accounts.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No family found for that user'
      });
    }

    const family = rows[0];
    const [kids] = await connection.query(
      `SELECT * FROM kids WHERE family_id = ?`,
      [family.family_id]
    );

    const familyData = {
      success: true,
      message: 'Found family',
      family_id: family.family_id,
      family_name: family.family_name,
      kids,
    };

    res.status(201).json(familyData);

  } catch (error) {
    console.error('Error fetching family data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch family data'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;