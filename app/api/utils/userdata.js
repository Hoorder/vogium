import db from "@/app/lib/db_connect";

export async function findUserById(id) {
  const [rows] = await db.query(
    "SELECT * FROM customers WHERE id_customer = ?",
    [id]
  );
  return rows;
}

export async function getUserIpAndCountry() {
  const res = await fetch("https://api.ipify.org?format=json");
  const { ip } = await res.json();
  const ipDataRes = await fetch(
    `http://ip-api.com/json/${ip}?fields=status,message,country,city,query`
  );
  const { query, country } = await ipDataRes.json();
  return { query, country };
}

export async function updateLastLoginData(id, ip, country) {
  const [result] = await db.query(
    `UPDATE customers
      SET last_Ip = ? ,last_country = ?,
      last_successful_login_data = CURDATE(),
      last_successful_login_time = CURTIME()
      WHERE id_customer = ?`,
    [ip, country, id]
  );

  return result;
}
