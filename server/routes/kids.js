import express from 'express';
import { connect } from 'react-redux';

import { getConnection } from '../db.js';

const router = express.Router();

router.post('/checkKidExists', async (req, res) => {
  const { kidname, familyId } = req.body;
  let connection;
  try {
    connection = await getConnection();
    const existingKid = await connection.query(
      'SELECT * FROM kids WHERE LOWER(name) = LOWER(?) AND family_id = ?',
      [kidname, familyId]
    );

    if (existingKid.length > 0) {
      return res.status(400).json({ error: 'Child already exists in this family' });
    }

    return res.status(200).json({ message: 'Kid does not exist, can be added.' });
  } catch (error) {
    console.error('Error checking if kid exists:', error);
    res.status(500).json({ error: 'Failed to check kid existence' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.post('/addKid', async (req, res) => {
  const { kidname, familyId, allowanceRate, startingBalance } = req.body;
  let connection;

  try {
    connection = await getConnection();

    // Check if the kid already exists in the database
    const existingKid = await connection.query(
      'SELECT * FROM kids WHERE LOWER(name) = LOWER(?) AND family_id = ?',
      [kidname, familyId]
    );

    if (existingKid.length > 0) {
      return res.status(400).json({ error: 'Child already exists in this family.' });
    }

    // If the kid does not exist, insert the new kid into the kids table
    const result = await connection.query(
      'INSERT INTO kids (name, allowanceRate, currentBalance, family_id) VALUES (?, ?, ?, ?)',
      [kidname, allowanceRatestartingBalance, familyId]
    );

    res.status(201).json({
      message: 'Child added successfully.',
      kidId: Number(result.insertId), // Get the ID of the newly inserted kid
    });

  } catch (error) {
    console.error('Error adding child: ', error);
    res.status(500).json({ error: 'Failed to add child' });
  } finally {
    if (connetion) {
      connection.release();
    }
  }
});

router.get('/:familyId', async (req, res) => {
  const { familyId } = req.params;
  let connection;

  try {
    connection = await getConnection();
    const kids = await connection.query(
      'SELECT * FROM kids WHERE family_id = ?',
      [familyId]
    );

    if (kids.length === 0) {
      return res.status(404).json({ message: 'No children found for this family' });
    }
    res.status(200).json(kids);
  } catch (error) {
    console.error('Error fetching children: ', error);
    res.status(500).json({ error: 'Failed to fetch children' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.get('/transactions/:kidId', async (req, res) => {
  const { kidId } = req.params;
  let connection;

  try {
    connection = await getConnection();
    const transactions = await connection.query(
      'SELECT * FROM transactions WHERE kid_id = ?',
      [kidId]
    );

    if (transactions.length === 0) {
      return res.status(400).json({ message: 'No transactions found for child' });
    }

    res.status(200).json(transactions);

  } catch (error) {
    console.error('Error fetching child transactions: ', error);
    res.status(500).json({ error: 'Failed to fetch transactions for child' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Add New Transaction
router.post('/transactions', async (req, res) => {
  const { kidId, amount, description } = req.body;
  let connection;

  try {
    connection = await getConnection();
    // Start a transaction to ensure both queries succeed together
    await connection.beginTransaction();

    const insertTransactionQuery = `
      INSERT INTO transactions (kid_id, description, amount, transaction_date)
      VALUES (?, ?, ?, NOW())`;
    await connection.query(insertTransactionQuery, [kidId, description, amount]);

    const updateBalanceQuery = `
      UPDATE kids SET currentBalance = currentBalance + ?
      WHERE kid_id = ?`;
    await connection.query(updateBalanceQuery, [parseFloat(amount), kidId]);

    const updatedTransactionQuery = `
      SELECT k.kid_id, k.currentBalance, t.transaction_id, t.amount, t.description, t.transaction_date
      FROM kids k
      LEFT JOIN transactions t on k.kid_id = t.kid_id
      WHERE k.kid_id = ?
      ORDER BY t.transaction_date DESC
      LIMIT 1
      `;
    const transaction = await connection.query(updatedTransactionQuery, [kidId]);

    await connection.commit();

    if (transaction && transaction.length > 0) {
      const transactionData = transaction[0];
      const { currentBalance, ...transactionWithoutBalance } = transactionData;

      res.status(200).json({
        message: 'Transaction added successfully and balance updated',
        currentBalance: currentBalance,
        transaction: transactionWithoutBalance,
        kidId
      });
      
    } else {
      res.status(404).json({message: 'Something went wrong'});
      console.error('Something went wrong');
    }
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error adding transaction: ', error);

    res.status(500).json({ message: 'Error adding transaction: ', error });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;