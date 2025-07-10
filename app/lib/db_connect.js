import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.HOST_NAME,
  user: process.env.USER_NAME,
  password: process.env.USER_PASSWORD,
  database: process.env.DB_NAME,
});

export default db;
