import db from "@/app/lib/db_connect";

export async function sendLoginLog(ip, country, clientId, status) {
  try {
    const [result] = await db.query(
      `INSERT INTO logs(device_ip, device_country, id_customer_fk, data, time, login_status)
      VALUES(?, ?, ?, CURDATE(), CURTIME(), ?)`,
      [ip, country, clientId, status]
    );

    return result;
  } catch (error) {
    console.log(error);
  }
}

export async function sendLoginAttemptLog(ip, country, clientId, status) {
  try {
    const [result] = await db.query(
      `INSERT INTO logs(device_ip, device_country, attempted_client_id, data, time, login_status)
      VALUES(?, ?, ?, CURDATE(), CURTIME(), ?)`,
      [ip, country, clientId, status]
    );

    return result;
  } catch (error) {
    console.log(error);
  }
}
