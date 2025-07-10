"use client";

export default function AdminDashboard() {
  const handleLogOut = async () => {
    try {
      const res = await fetch("/api/session", {
        method: "DELETE",
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        console.error("Wylogowanie nie powiodło się");
      }
    } catch (error) {
      console.error("Błąd przy wylogowaniu:", error);
    }
  };

  return (
    <>
      <button onClick={handleLogOut}>Wyloguj</button>
      <p>Siema Admin</p>
    </>
  );
}
