import styles from "./loading.module.css";

export default function DashboardLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.welcomeSkeleton} />
      <div className={styles.statsGrid}>
        {[1, 2, 3].map((i) => <div key={i} className={styles.statSkeleton} />)}
      </div>
      <div className={styles.sectionSkeleton}>
        {[1, 2, 3].map((i) => <div key={i} className={styles.rowSkeleton} />)}
      </div>
    </div>
  );
}
