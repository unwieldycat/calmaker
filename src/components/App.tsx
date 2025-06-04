import { ChangeEvent, useState } from "react";
import { parseSheet } from "../logic/parser";
import { Download, Info } from "feather-icons-react";
import { Schedule } from "../logic/schedule";
import { Toast } from "./Toast";
import { sheetToArray } from "../logic/sheet";
import { Instructions } from "./Instructions";
import { Footer } from "./Footer";
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
					<input
						accept=".xlsx"
						type="file"
						id="file-input"
						onChange={onFileChange}
					/>

					<div className={styles.btnCluster}>
						<button className="icon button" onClick={onInfoPressed}>
							<Info size={20} />
						</button>
						<button
							className="primary button"
							disabled={!schedule}
							onClick={downloadFile}
						>
							<Download size={20} />
						</button>
					</div>
				</div>

				{showState === ShowState.Info && <Instructions />}
			</main>

			<Footer />
		</>
	);
}

export default App;
