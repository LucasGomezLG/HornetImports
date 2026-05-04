import styles from "../dashboard/loading.module.css";

export default function PedidosLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.welcomeSkeleton} />
      <div className={styles.sectionSkeleton}>
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className={styles.rowSkeleton} />)}
      </div>
    </div>
  );
}
