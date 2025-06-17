import { IndexPage } from "./pages/Index";
import styles from "./App.module.css";
import { Footer } from "./components/Footer/Footer";

export function App() {
	return (
		<div className={styles.centeredContainer}>
			<h1>WPI Calendar Generator</h1>
			<IndexPage />
			<Footer />
		</div>
	);
}
