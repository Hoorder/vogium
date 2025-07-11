import db from "@/app/lib/db_connect";
import { blockLoginAttemptsAccount } from "./loginAttemptsHelper";
import { NextResponse } from "next/server";

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

    console.log(`Ostatni Czas -> ${lastLoginTime}`);
    console.log(`Ostatni Kraj -> ${lastLoginCountry}`);
    console.log(`Obecny Kraj -> ${currentCountry}`);
    console.log(`Czy kraje są różne -> ${lastLoginCountry !== currentCountry}`);

    if (lastLoginCountry !== currentCountry) {
      const currentLoginDateTime = new Date();
    }

    return false;
  } catch (error) {
    console.error("Błąd podczas sprawdzania impossible travel:", error);
    throw new Error("Wystąpił błąd podczas weryfikacji podróży.");
  }
}
