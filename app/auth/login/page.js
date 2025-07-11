"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

const rolePath = {
  customer: "/dashboard/customer",
  admin: "/dashboard/admin",
};

export default function Home() {
  const [clientId, setClientId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, password }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setErrorMessage(error || `Błąd odpowiedzi: ${response.statusText}`);
        return;
      }

      const { account_role } = await response.json();
      const destination = rolePath[account_role];

      if (destination) {
        router.replace(destination);
      } else {
        setErrorMessage("Nieznana rola użytkownika.");
      }
    } catch (error) {
      console.error("Błąd rządania:", error);
      setErrorMessage("Błąd rządania. Wróć później.");
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p className={styles.logo}>Vogium</p>

        <form onSubmit={handleSubmit} className={styles.container}>
          <label htmlFor="login">Numer Klienta</label>
          <input
            type="number"
            id="login"
            placeholder="Identyificator"
            onChange={(e) => setClientId(e.target.value)}
          />

          <label htmlFor="password">Hasło</label>
          <input
            className={styles.input}
            type="password"
            id="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <p>{errorMessage}</p>

          <button className={styles.button} type="submit">
            Zaloguj
          </button>
        </form>
      </main>
    </div>
  );
}
