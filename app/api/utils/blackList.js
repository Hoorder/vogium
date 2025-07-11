import db from "@/app/lib/db_connect";

//IP ADRESS BLACKLIST
export async function checkBlacklistIp(ip) {
  const [result] = await db.query(
    `SELECT ip_adress FROM blacklist_ip WHERE ip_adress = ?`,
    [ip]
  );
  const ipAdress = result[0]?.ip_adress;
  return ipAdress;
}

export async function addIpToBlackList(ip) {
  const [result] = await db.query(
    `INSERT INTO blacklist_ip(ip_adress) VALUES (?)`,
    [ip]
  );
  return result;
}

//COUNTRY BLACKLIST
export async function checkBlacklistCountry(country) {
  const [result] = await db.query(
    `SELECT country_name FROM blacklist_country WHERE country_name = ?`,
    [country]
  );
  const countryName = result[0]?.country_name;
  return countryName;
}
