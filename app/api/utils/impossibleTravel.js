import db from "@/app/lib/db_connect";
import { blockLoginAttemptsAccount } from "./loginAttemptsHelper";

export async function impossibleTravelCheck(
  clientId,
  accountRole,
  currentCountry
) {
  try {
    const [rows] = await db.query(
      `SELECT last_successful_login_data, last_successful_login_time, last_country, account_status
       FROM customers
       WHERE id_customer = ?`,
      [clientId]
    );

    if (!rows || rows.length === 0 || !rows[0].last_successful_login_data) {
      return false;
    }

    const userData = rows[0];
    const lastLoginTime = userData.last_successful_login_time;
    const lastLoginCountry = userData.last_country;

    const currentTime = new Date();
    const currHour = parseInt(currentTime.getHours());
    const currMin = parseInt(currentTime.getMinutes());
    const currSec = parseInt(currentTime.getSeconds());
    const totalCurrTimeSec = currHour * 3600 + currMin * 60 + currSec;

    const lastLoginParts = lastLoginTime.split(":");
    const lastLoginHour = parseInt(lastLoginParts[0], 10);
    const lastLoginMin = parseInt(lastLoginParts[1], 10);
    const lastLoginSec = parseInt(lastLoginParts[2], 10);
    const lastLoginTimeSec =
      lastLoginHour * 3600 + lastLoginMin * 60 + lastLoginSec;

    if (
      totalCurrTimeSec - lastLoginTimeSec <= 300 &&
      lastLoginCountry !== currentCountry
    ) {
      await blockLoginAttemptsAccount(clientId, accountRole);
      const impossibleLogin = true;
      return impossibleLogin;
    }

    return false;
  } catch (error) {
    console.error("Błąd podczas sprawdzania impossible travel:", error);
    throw new Error("Wystąpił błąd podczas weryfikacji podróży.");
  }
}
