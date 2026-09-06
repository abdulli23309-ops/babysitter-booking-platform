import styles from './app-layout.module.css';

export default function AppLayout({ children }) {
  return (
    <div className={styles.shell}>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}

