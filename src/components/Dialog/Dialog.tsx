import styles from "./Dialog.module.css";

export function Dialog({ children }: { children: React.ReactNode }) {
	return (
		<div className={styles.dialog}>
			<div className={styles.dialogContent}>{children}</div>
		</div>
	);
}
