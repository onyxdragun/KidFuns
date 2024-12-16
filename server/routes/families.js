import express from 'express';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { getConnection } from '../db.js';
import { logEvent } from '../utils/logs.js';

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

    logEvent(user_id, "CREATE_FAMILY", { user_id: user_id, family_id, family_name }, req.ip);

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

const checkTokenValidity = (expiresAt) => {
  const now = new Date();
  return new Date(expiresAt) > now;
}

//
// Generate a Family Token to allow linking users to families
//
router.post('/generate-token', async (req, res) => {
  let connection;
  const { userId, familyId } = req.body;
  let result;

  try {
    connection = await getConnection();
    result = await connection.execute(
      `
      SELECT token, expires_at FROM family_tokens WHERE user_id = ? AND family_id = ?
      `,
      [userId, familyId]
    );

    if (result.length > 0) {
      // Token found
      const { token, expires_at } = result[0];
      if (checkTokenValidity(expires_at)) {
        logEvent(userId, "GET_FAMILY_TOKEN", { user_id: userId, family_id: familyId, token }, req.ip);

        return res.status(200).json({
          success: true,
          token
        })
      } else {
        // Token expired, generate a new one
        const newToken = uuidv4().slice(0, 5);
        const newExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

        result = await connection.execute(
          `
          UPDATE family_tokens
          SET token = ?, expires_at = ? 
          WHERE user_id = ? AND family_id = ?
          `,
          [newToken, newExpiresAt, userId, familyId]
        );
        logEvent(userId, "UPDATED_FAMILY_TOKEN", { user_id: userId, family_id: familyId, token: newToken }, req.ip);
        return res.status(200).json({
          success: true,
          token: newToken
        });
      }
    } else {
      const newToken = uuidv4().slice(0, 5);
      const newExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

      result = await connection.execute(
        `
        INSERT INTO family_tokens (user_id, family_id, token, expires_at)
        VALUES (?, ?, ?, ?)
        `,
        [userId, familyId, newToken, newExpiresAt]
      );
      logEvent(userId, "CREATE_FAMILY_TOKEN", { user_id: userId, family_id: familyId, token: newToken }, req.ip);

      return res.status(201).json({
        success: true,
        token: newToken
      })
    }
  } catch (error) {
    console.error('Error fetching token: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch family token'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

//
// Join a user to a family
//
router.post('/join', async (req, res) => {
  const { token, userId } = req.body;
  let connection;
  let result;

  try {
    connection = await getConnection();
    result = await connection.execute(
      `
      SELECT * FROM family_tokens WHERE token = ? and expires_at > NOW() LIMIT 1
      `,
      [token]
    );
    console.log("Select token: ", result);
    if (result.length > 0) {
      // Check if user already is a family member
      const familyId = result[0].family_id;

      result = await connection.execute(
        `
        SELECT * FROM linked_accounts WHERE user_id = ? AND family_id = ?
        `,
        [userId, familyId]
      );

      console.log("Select family: ", result);
      if (result.length > 0) {
        return res.status(200).json({
          success: false,
          message: 'User is already a member of the family'
        });
      } else {
        result = await connection.execute(
          `
          INSERT INTO linked_accounts (family_id, user_id)
          VALUES (?, ?)
          `, [familyId, userId]
        );
        console.log("Insert link: ", result);
        logEvent(userId, "CREATE_FAMILY_LINK", { user_id: userId, family_id: familyId }, req.ip);

        return res.status(201).json({
          success: true,
          familyId
        });
      }
    } else {
      logEvent(userId, "INVALID_FAMILY_TOKEN", { user_id: userId, token }, req.ip);

      return res.status(200).json({
        success: false,
        message: 'Token invalid or expired'
      });
    }
  } catch (error) {
    console.error('Error fetching token: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch family token'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }

});

//
// Family Save Settings
//
router.patch('/save-settings', async (req, res) => {
  const {familyId, autoAllowance, autoAllowanceDay} = req.body;
  let connection;
  let result;
  try {
    connection = await getConnection();
    result = await connection.execute(
      `
      SELECT * FROM families WHERE family_id = ?
      `,[familyId]
    );
    if (result.length > 0) {
      result = await connection.execute(
        `
        UPDATE families
        SET auto_allowance_enable = ?, auto_allowance_day = ?
        WHERE family_id = ?
        `,[autoAllowance, autoAllowanceDay, familyId]
      );
      return res.status(200).json({
        success: true,
        message: 'Family settings updated successfully'
      });
    } else {
      return res.status(200).json({
        succes: false,
        message: 'Family does not exist'
      });
    }

  } catch (error) {
    console.error('Error updating family settings: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update family settings'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.get('/get-settings/:familyId', async (req, res) => {
  const {familyId} = req.params;
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `
      SELECT auto_allowance_enable, auto_allowance_day FROM families WHERE family_id = ?
      `,[familyId]
    );
    console.log(result);
    res.status(200).json({
      success: true,
      message: '',
      data: result[0]
    });
  } catch (error) {
    console.error('Error fetching family settings: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch family settings'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.get('/by-user/:userId', async (req, res) => {
  const { userId } = req.params;
  let connection;

  try {
    connection = await getConnection();
    const rows = await connection.execute(
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
    const [kids] = await connection.execute(
      `SELECT * FROM kids WHERE family_id = ?`,
      [family.family_id]
    );

    const familyMembers = await connection.execute(
      `
      SELECT families.family_name, users.name, users.uid
      FROM families
      JOIN linked_accounts ON families.family_id = linked_accounts.family_id
      JOIN users ON linked_accounts.user_id = users.user_id
      WHERE families.family_id = ?
      `,
      [family.family_id]
    );

    const familyData = {
      success: true,
      message: 'Found family',
      family_id: family.family_id,
      family_name: family.family_name,
      members: familyMembers.map(user => ({
        name: user.name,
        uid: user.uid
      })),
      kids,
    };

    res.status(200).json(familyData);

  } catch (error) {
    console.error('Error fetching family data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch family data'
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
});

router.get('/by-family/:familyId', async (req, res) => {
  console.log('Route handler triggered');
  const { familyId } = req.params;
  let connection;

  try {
    connection = await getConnection();
    const familyData = await connection.execute(`
      SELECT families.family_name, users.name
      FROM families
      JOIN linked_accounts ON families.family_id = linked_accounts.family_id
      JOIN users ON linked_accounts.user_id = users.user_id
      WHERE families.family_id = ?`,
      [familyId]
    );
    console.log('familyData: ', familyData);
    res.status(200).json({
      success: true,
      message: '',
      familyData: []
    });
  } catch (error) {
    console.error('Error fetching family data: ', error);
    res.status(500).json({
      success: false,
      message: error
    });
  } finally {
    if (connection) {
      await connection.release();
    }
  }
});

// Catch All Route
router.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Router ${req.originalUrl} not found`,
  });
});

export default router;