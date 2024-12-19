import { getConnection } from "../db.js";
import { logEvent } from './logs.js';

export const incrementAllowances = async () => {
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();
    const today = new Date();
    const day = today.getDay();
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today);

    const kids = await connection.execute(
      `
      SELECT kids.kid_id, kids.currentBalance, kids.allowanceRate, families.family_id
      FROM kids
      INNER JOIN families ON kids.family_id = families.family_id
      WHERE families.auto_allowance_enable = 1 AND families.auto_allowance_day = ?
      `, [day]
    );

    if (kids.length === 0) {
      console.log(`No kids eligble for allowance update this ${dayName}`);
      logEvent(-1, 'AUTO_ALLOWANCE_EVENT', { message: `No allowances were to be updated this ${dayName} ` }, 'server');
      return {
        success: false,
        message: 'No eligable records found'
      }
    }

    for (const kid of kids) {
      const newBalance = parseFloat(kid.currentBalance) + parseFloat(kid.allowanceRate);

      await connection.execute(
        `
        UPDATE kids
        SET currentBalance = ?
        WHERE kid_id = ?
        `, [newBalance, kid.kid_id]
      );

      await connection.execute(
        `
        INSERT INTO transactions (kid_id, amount, description)
        VALUES (?, ?, ?)
        `, [kid.kid_id, kid.allowanceRate, 'Weekly Auto Allowance']
      );

      await connection.commit();
    }

    console.log(`Updated balances for ${kids.length} kids.`);
    logEvent(-1, 'AUTO_ALLOWANCE_EVENT', { message: `${kids.length} allowances updated` }, 'server');
    return {
      success: true,
      message: `${kids.length} allowances updated`
    };

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error during allowance update: ", error);
    logEvent(-1, 'AUTO_ALLOWANCE_EVENT_FAILURE', { message: `${error.message}` }, 'server');

    return {
      success: false,
      message: 'Error processing auto allowances'
    };

  } finally {
    if (connection) {
      connection.release();
    }
  }
}
