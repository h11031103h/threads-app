import styles from "./page.module.css";
import LoginButton from "@/components/LoginButton";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Threads Manager</h1>
        <p className={styles.subtitle}>
          Create, Schedule, and Analyze your Threads presence with premium tools.
        </p>
        <LoginButton />
      </div>

      <div className={styles.grid}>
        <div className={`${styles.card} glass`}>
          <h2>
            Calendar <span>📅</span>
          </h2>
          <p>Manage your content schedule with a drag-and-drop calendar interface.</p>
        </div>

        <div className={`${styles.card} glass`}>
          <h2>
            Analytics <span>📈</span>
          </h2>
          <p>Track impressions, followers, and engagement metrics in real-time.</p>
        </div>

        <div className={`${styles.card} glass`}>
          <h2>
            Research <span>🔍</span>
          </h2>
          <p>Discover trending topics and accounts with advanced keyword search.</p>
        </div>

        <div className={`${styles.card} glass`}>
          <h2>
            Settings <span>⚙️</span>
          </h2>
          <p>Configure API keys and customize your dashboard preferences.</p>
        </div>
      </div>
    </main>
  );
}
