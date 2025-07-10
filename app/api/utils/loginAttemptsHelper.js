import db from "@/app/lib/db_connect";

export async function checkLoginAttempts(id, role) {
  const [login_attempt] = await db.query(
    "SELECT login_attempt from customers WHERE id_customer =? AND account_role = ?",
    [id, role]
  );
  return login_attempt;
}

export async function increaseLoginAttempts(id, role) {
  const [result] = await db.query(
    "UPDATE customers SET login_attempt = login_attempt + 1 WHERE id_customer = ? AND account_role = ?",
    [id, role]
  );
  return result;
}

export async function blockLoginAttemptsAccount(id, role) {
  const [result] = await db.query(
    `UPDATE customers SET account_status = "zablokowane" WHERE id_customer = ? AND account_role = ?`,
    [id, role]
  );
  return result;
}

export async function clearLoginAttempts(id, role) {
  const [result] = await db.query(
    "UPDATE customers SET login_attempt = 0 WHERE id_customer = ? AND account_role = ?",
    [id, role]
  );
  return result;
}

//Jeżeli ktoś loguje się na admina ale mu sie dwa razy nie uda to jest blokowany a ip trafia do black listy
