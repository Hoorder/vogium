import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import {
  findUserById,
  getUserIpAndCountry,
  updateLastLoginData,
} from "../utils/userdata";
import {
  blockLoginAttemptsAccount,
  checkLoginAttempts,
  clearLoginAttempts,
  increaseLoginAttempts,
} from "../utils/loginAttemptsHelper";
import bcrypt from "bcrypt";
import { sendLoginAttemptLog, sendLoginLog } from "../utils/logs";
import {
  addIpToBlackList,
  checkBlacklistCountry,
  checkBlacklistIp,
} from "../utils/blackList";
import { impossibleTravelCheck } from "../utils/impossibleTravel";

const JWT_SECRET = new TextEncoder().encode(process.env.JW_SECRET_KEY);

async function generateJWT(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);
}

export async function POST(request) {
  try {
    const body = await request.json();
    //checking user ip and country
    const { query, country } = await getUserIpAndCountry();
    //getting blacklist IP and COUNTRY
    const ipAdress = await checkBlacklistIp(query);
    const countryName = await checkBlacklistCountry(country);
    //checking blacklistp IP nad COUNTRY
    if (ipAdress === query || countryName === country) {
      return NextResponse.json(
        { error: "Błąd podczas połączenia z serwerem." },
        { status: 401 }
      );
    }
    //clear user login data
    const clientId = body.clientId?.trim();
    const password = body.password?.trim();
    //checking if cliendID or password is empty
    if (clientId.length === 0 || password.length === 0) {
      return NextResponse.json(
        { error: "Wprowadź wszystkie wymagane dane" },
        { status: 401 }
      );
    }
    //checking if clientId is number
    if (!clientId || isNaN(Number(clientId))) {
      return NextResponse.json(
        { error: "Wprowadzony login jest nieprawidłowy" },
        { status: 401 }
      );
    }
    //find user with typed ID
    const rows = await findUserById(clientId);
    //checking if user exists
    if (rows.length === 0) {
      //create and send login logs
      await sendLoginAttemptLog(
        query,
        country,
        clientId,
        "failed_id_not_found"
      );

      return NextResponse.json(
        { error: "Nieprawidłowy identyfikator lub hasło" },
        { status: 401 }
      );
    }
    //checking if user account is blocked
    if (rows[0].account_status === "zablokowane") {
      return NextResponse.json(
        { error: "Twoje konto zostało zablokowane." },
        { status: 401 }
      );
    }
    //checking if passwords is this same
    const isPasswordCorrect = await bcrypt.compare(password, rows[0].password);

    if (isPasswordCorrect) {
      //clearing login attempts
      const { account_role } = rows[0];
      await clearLoginAttempts(clientId, account_role);
      //create and send login logs
      await sendLoginLog(query, country, clientId, "success");
      //checking if current country is diff then last login and time is 5min since last succesfull login
      const impossibleLogin = await impossibleTravelCheck(
        clientId,
        account_role,
        country
      );
      if (impossibleLogin) {
        await sendLoginLog(query, country, clientId, "failed_impossible_login");
        await updateLastLoginData(clientId, query, country);
        return NextResponse.json(
          { error: "Podejrzana aktywność. Twoje konto zostało zablokowane. " },
          { status: 403 }
        );
      }
      await updateLastLoginData(clientId, query, country);
      //creating token with user data from DB
      const token = await generateJWT({
        customer_id: rows[0].id_customer,
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        account_role: rows[0].account_role,
      });

      //response for client
      const response = NextResponse.json({
        customer_id: rows[0].id_customer,
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        account_role: rows[0].account_role,
      });

      //saving JWT in cookies
      response.cookies.set("token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 1,
        secure: false,
      });

      return response;
    } else {
      //set max login attempts number
      const MAX_ATTEMPTS_ADMIN = 2;
      const MAX_ATTEMPTS_CUSTOMER = 3;
      //finding role for clinet who's logining
      const { account_role } = rows[0];
      //create and send login logs
      await sendLoginLog(query, country, clientId, "failed_password");
      //increasing attempts
      await increaseLoginAttempts(clientId, account_role);
      const login_attempts_data = await checkLoginAttempts(
        clientId,
        account_role
      );
      // checking attempts number
      const current_attempts = login_attempts_data[0]?.login_attempt;

      if (current_attempts >= MAX_ATTEMPTS_ADMIN && account_role === "admin") {
        await addIpToBlackList(query);
      }

      if (
        (current_attempts >= MAX_ATTEMPTS_ADMIN && account_role === "admin") ||
        (current_attempts >= MAX_ATTEMPTS_CUSTOMER &&
          account_role === "customer")
      ) {
        await blockLoginAttemptsAccount(clientId, account_role);
        await sendLoginLog(query, country, clientId, "account_locked");

        return NextResponse.json(
          { error: "Skontaktuj się z administratorem systemu." },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Nieprawidłowy identyfikator lub hasło" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Błąd serwera", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json(
    { message: "Wylogowano pomyślnie (DELETE)" },
    { status: 200 }
  );

  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    secure: false,
  });

  return response;
}
