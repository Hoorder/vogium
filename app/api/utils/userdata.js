import db from "@/app/lib/db_connect";

export async function findUserById(id) {
  const [rows] = await db.query(
    "SELECT * FROM customers WHERE id_customer = ?",
    [id]
  );
  return rows;
}
