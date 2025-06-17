import { ChangeEvent, useState } from "react";
import { parseSheet } from "../lib/parser";
import { Download, HelpCircle } from "feather-icons-react";
import { Schedule } from "../lib/schedule";
import { Toast } from "../components/Toast/Toast";
import { sheetToArray } from "../lib/sheet";
import { Instructions } from "../components/Instructions/Instructions";
import { Footer } from "../components/Footer/Footer";
import { Button } from "../components/Button/Button";
import { FilePicker } from "../components/FilePicker/FilePicker";
import styles from "./App.module.css";

enum ShowState {
	Info,
	None,
}

function App() {
	const [showState, setShowState] = useState<ShowState>(ShowState.None);
	const [schedule, setSchedule] = useState<Schedule | null>(null);
	const [error, setError] = useState<Error | null>(null);

	const onInfoPressed = () => {
		if (showState === ShowState.Info) setShowState(ShowState.None);
		else setShowState(ShowState.Info);
	};

	const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files === null || event.target.files.length === 0) return;
		const file = event.target.files[0];

		file.arrayBuffer().then(async (data) => {
			const { read } = await import("xlsx");
			const book = read(data, {
				type: "array",
				dense: true,
				cellDates: true,
			});
			const sheet = book.Sheets[book.SheetNames[0]];
			const sheetData = sheetToArray(sheet);

			parseSheet(sheetData)
				.then((schedule) => {
					if (error) setError(null);
					setSchedule(schedule);
				})
				.catch((e) => {
					console.error(e);
					console.error("Erroneous sheet data below:", sheetData);
					setSchedule(null);
					setError(e);
				});
		});
	};

	const downloadFile = () => {
		if (!schedule) return;
		const data = schedule.toICalendar().render();
		const blob = new Blob([data], { type: "text/calendar" });
		const url = URL.createObjectURL(blob);
		window.open(url);
	};

	return (
		<>
			<main className={styles.main}>
				<h1>Convert your WPI Workday schedule to ICS 🗓️</h1>

				{error && (
					<Toast
						type="error"
						message={
							"Failed to parse schedule. Did you upload the correct file?"
						}
					/>
				)}

				<div className={`${styles.controls} box`}>
					<FilePicker accept=".xlsx" onChange={onFileChange} />

					<div className={styles.btnCluster}>
						<Button onClick={onInfoPressed} intent="secondary">
							<HelpCircle size={20} /> Help
						</Button>
						<Button
							disabled={!schedule}
							onClick={downloadFile}
							intent="primary"
						>
							<Download size={20} /> Download
						</Button>
					</div>
				</div>

				{showState === ShowState.Info && <Instructions />}
			</main>

			<Footer />
		</>
	);
}

export default App;
