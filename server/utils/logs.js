import { getConnection } from "../db.js";

export async function logEvent(userId, eventType, additionalInfo = null, ipAddress = null) {
  const query = `
  INSERT INTO logs (user_id, event_type, additional_info, ip_address, timestamp)
  VALUES (?, ?, ?, ?, NOW())`;

  const params = [
    userId,
    eventType,
    JSON.stringify(additionalInfo),
    ipAddress
  ];
  let connection;
  
  try {
    connection = await getConnection();
    await connection.execute(query, params);  
  } catch(error) {
    console.log("Error occurred: ", error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
