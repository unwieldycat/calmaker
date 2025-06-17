import styles from "./Footer.module.css";

export function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.footerRow}>
				<p>This tool is not officially endorsed by WPI</p>
			</div>
			<div className={styles.footerRow}>
				<p>© 2025 Thurston A Yates</p>
				<p> • </p>
				<a href="https://github.com/unwieldycat/calmaker">View Source</a>
			</div>
		</footer>
	);
}
