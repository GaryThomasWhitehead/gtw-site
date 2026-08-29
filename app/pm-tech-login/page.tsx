import styles from "./tech-login.module.css";

export const metadata = { title: "Technician Sign In | Frontline Pro Services" };

export default async function TechLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; return?: string }> }) {
  const params = await searchParams;
  const returnTo = params.return?.startsWith("/") ? params.return : "/pm-report";
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.brand}>FRONTLINE PRO SERVICES</p>
        <h1>Technician Sign In</h1>
        <p>Enter your four-digit technician code to open the report forms.</p>
        {params.error && <div className={styles.error}>That code is not active. Please try again.</div>}
        <form action="/api/pm-techs/login" method="post">
          <input type="hidden" name="return" value={returnTo} />
          <label htmlFor="pin">Four-digit code</label>
          <input id="pin" name="pin" type="password" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} autoComplete="one-time-code" autoFocus required />
          <button type="submit">Open Report Forms</button>
        </form>
        <a href="/fedex-tracker">Management: return to tracker</a>
      </section>
    </main>
  );
}
