import express from 'express';

import { getConnection } from '../db.js';
import { logEvent } from '../utils/logs.js';

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
      return res.status(200).json({
        success: true,
        message: 'Child already exists in this family'
      });
    }

    return res.status(200).json({
      success: false,
      message: 'Child does not currently exist.'
    });
  } catch (error) {
    console.error('Error checking if kid exists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check kid existence'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.post('/addKid', async (req, res) => {
  const { kidname, familyId, allowanceRate, currentBalance, userId } = req.body;
  let connection;

  try {
    connection = await getConnection();

    // Check if the kid already exists in the database
    const existingKid = await connection.query(
      'SELECT * FROM kids WHERE LOWER(name) = LOWER(?) AND family_id = ?',
      [kidname, familyId]
    );

    if (existingKid.length > 0) {
      return res.status(200).json({
        success: false,
        message: 'Child already exists in this family.'
      });
    }

    await connection.beginTransaction();

    // If the kid does not exist, insert the new kid into the kids table
    let result = await connection.execute(
      'INSERT INTO kids (name, allowanceRate, currentBalance, family_id) VALUES (?, ?, ?, ?)',
      [kidname, allowanceRate, currentBalance, familyId]
    );

    const kidId = result.insertId;

    result = await connection.execute(
      `INSERT INTO transactions (kid_id, amount, description, transaction_date)
        VALUES (?, ?, ?, NOW())`,
      [kidId, currentBalance, "Starting Balance"]
    );

    result = await connection.commit();

    await logEvent(userId, 'ADD_KID', { kid_id: parseInt(kidId), currentBalance, allowanceRate }, req.ip);

    res.status(201).json({
      success: true,
      message: 'Child added successfully.',
      kidId: Number(kidId), // Get the ID of the newly inserted kid
    });

  } catch (error) {
    console.error('Error adding child: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add child'
    });
  } finally {
    if (connection) {
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
      return res.status(200).json({
        success: false,
        message: 'No children found for this family'
      });
    }
    res.status(200).json({
      success: true,
      message: '',
      kids
    });
  } catch (error) {
    console.error('Error fetching children: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch children'
    });
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
      return res.status(200).json({
        success: false,
        message: 'No transactions found for child'
      });
    }

    res.status(200).json({
      success: true,
      message: "Child has transactions",
      transactions
    });

  } catch (error) {
    console.error('Error fetching child transactions: ', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions for child'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Add New Transaction
router.post('/transactions', async (req, res) => {
  const { userId, kidId, amount, description } = req.body;
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
      logEvent(userId, 'ADD_TRANSACTION', { kid_id: kidId, description, amount }, req.ip);
      const transactionData = transaction[0];
      const { currentBalance, ...transactionWithoutBalance } = transactionData;

      res.status(201).json({
        success: true,
        message: 'Transaction added successfully and balance updated',
        currentBalance: currentBalance,
        transaction: transactionWithoutBalance,
        kidId
      });

    } else {
      res.status(500).json({
        success: false,
        message: 'Something went wrong'
      });
      console.error('Something went wrong');
    }
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error adding transaction: ', error);

    res.status(500).json({
      success: false,
      message: 'Error adding transaction: ', error
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Update transactions and current balance
router.put('/transactions/update/:transaction_id', async (req, res) => {
  const { transaction_id } = req.params;
  const { kid_id, amount, description, user_id } = req.body;
  let connection;

  try {
    connection = await getConnection();

    await connection.beginTransaction();

    const currentTransaction = await connection.execute(
      `SELECT * FROM transactions WHERE transaction_id = ?`,
      [transaction_id]
    );

    if (!currentTransaction.length) {
      await connection.rollback();
      return res.status(200).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const oldAmount = parseFloat(currentTransaction[0].amount);
    const oldDescription = currentTransaction[0].description;
    const delta = parseFloat(amount) - oldAmount;

    const result = await connection.execute(
      'UPDATE transactions SET amount = ?, description = ? WHERE transaction_id = ?',
      [amount, description, transaction_id]
    );

    const updateBalance = await connection.execute(
      `UPDATE kids SET currentBalance = currentBalance + ? WHERE kid_id = ?`,
      [delta, kid_id]
    );

    if (updateBalance.affectedRows === 0) {
      await connection.rollback();
      return res.status(200).json({
        success: false,
        message: 'Failed to update current balance',
      });
    }

    const updatedBalance = await connection.execute(
      `SELECT currentBalance FROM kids WHERE kid_id = ?`,
      [kid_id]
    );

    const updatedTransactions = await connection.execute(
      `SELECT * FROM transactions WHERE kid_id = ? ORDER BY transaction_date DESC`,
      [kid_id]
    );

    await connection.commit();
    const eventData = {
      kid_id,
      oldAmount: oldAmount,
      newAmount: amount,
      newBalance: updatedBalance[0].currentBalance,
      oldDescription,
      newDescription: description,
    }
    logEvent(user_id, "UPDATE_TRANSACTION", eventData, req.ip);
    res.json({
      success: true,
      message: 'Transaction and balance updated successfully',
      kid_id: kid_id,
      transactions: parseFloat(updatedTransactions),
      currentBalance: parseFloat(updatedBalance[0].currentBalance)
    });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: `Error updating transaction and current balance: ${error}`,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

//
// Update Kid Data
//
router.patch('/data/update', async (req, res) => {
  const { kid_id, currentBalance, allowanceRate, family_id, user_id } = req.body;
  console.log('Body: ', req.body);

  let connection;
  let result;

  try {
    connection = await getConnection();
    result = await connection.execute(
      `
      SELECT k.*
      FROM kids k
      INNER JOIN families f ON k.family_id = f.family_id
      INNER JOIN linked_accounts la ON f.family_id = la.family_id
      INNER JOIN users u ON la.user_id = u.user_id
      WHERE k.kid_id = ? AND u.user_id = ? AND k.family_id = ?;
      `, [kid_id, user_id, family_id]
    );

    console.log('Select Result: ', result);
    if (result.length > 0) {
      result = await connection.execute(
        `
        UPDATE kids
        SET allowanceRate = ?, currentBalance = ?
        WHERE kid_id = ?
        `, [allowanceRate, currentBalance, kid_id]
      );
      console.log('Update result: ', result);

      if (result) {
        result = await connection.execute(
          `
          SELECT * FROM kids WHERE kid_id = ?
          `, [kid_id]
        );
        if (result.length > 0) {
          logEvent(user_id, "UPDATE_CHILD_DATA", {kid_id, allowanceRate, currentBalance}, req.ip);
          return res.status(200).json({
            success: true,
            message: 'Child data successfully updated',
            kid_id: kid_id,
            allowanceRate: parseFloat(result[0].allowanceRate),
            currentBalance: parseFloat(result[0].currentBalance)
          });
        } else {
          throw new Error('Unexpected Server error');
        }
      }
    } else {
      return res.status(200).json({
        success: false,
        message: 'That child does not exist',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error updating child data: ${error}`,
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }

});

// Handle updating all kids currentBalance by allowanceRates
router.post('/updateAllowances', async (req, res) => {
  const { userId } = req.body;
  let connection;

  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const query = `
      UPDATE kids
      SET currentBalance = currentBalance + AllowanceRate;
    `;

    const results = await connection.execute(query);

    if (results.affectedRows > 0) {
      const fetchQuery = `SELECT kid_id, currentBalance, allowanceRate FROM kids`;
      const children = await connection.execute(fetchQuery);

      const insertQuery = `
      INSERT INTO transactions (kid_id, amount, description)
      VALUES (?, ?, ?)`;

      let kidsData = [];
      if (children.length > 0) {
        for (const child of children) {
          let data = [
            child.kid_id,
            parseFloat(child.allowanceRate),
            'Weekly Auto Allowance'
          ];
          try {
            await connection.execute(insertQuery, data);
          } catch (error) {
            console.log("insertQuery failed: ", error);
          }
          kidsData.push(data);
        }
      }

      await connection.commit();

      logEvent(userId, "ALLOWANCE_UPDATE_ALL", { kidsData }, req.ip);
      res.status(200).json({ success: true, message: 'Balances increased' });
    } else {
      console.log("Nothing to change");
      res.status(200).json({ success: false, message: 'Nothing to change' });
    }
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.log("Error with updating current balances: ", error);
    res.status(500).json({ success: false, message: 'Server error occurred' });
  } finally {
    if (connection) {
      connection.end();
      connection.release();
    }
  }

});

export default router;