import { ChangeEvent, useEffect, useState } from "react";
import { parseSheet } from "../lib/parser";
import { ArrowLeft, Check, Download, HelpCircle, X } from "feather-icons-react";
import { Schedule } from "../lib/schedule";
import { Toast } from "../components/Toast/Toast";
import { sheetToArray } from "../lib/sheet";
import { Instructions } from "../components/Instructions/Instructions";
import { Button } from "../components/Button/Button";
import { FilePicker } from "../components/FilePicker/FilePicker";
import styles from "./Index.module.css";
import { Dialog } from "../components/Dialog/Dialog";

enum DialogState {
	Info,
	None,
}

export function IndexPage() {
	const [showState, setShowState] = useState<DialogState>(DialogState.None);
	const [schedule, setSchedule] = useState<Schedule | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [step, setStep] = useState<number>(1);

	useEffect(() => {
		if (schedule) {
			setStep(2);
		} else {
			setStep(1);
		}
	}, [schedule]);

	const onInfoPressed = () => {
		setShowState(DialogState.Info);
	};

	const closeDialog = () => {
		setShowState(DialogState.None);
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
				{error && (
					<Toast
						type="error"
						message={"Failed to parse file. It could be the wrong one."}
					/>
				)}

				{step == 1 && (
					<div className={styles.step}>
						<h2>Step 1</h2>
						<p>Upload your registered classes spreadsheet</p>
						<div className={styles.btnCluster}>
							<FilePicker accept=".xlsx" onChange={onFileChange} />
							<Button intent="secondary" onClick={onInfoPressed}>
								<HelpCircle size={20} /> Help
							</Button>
						</div>
					</div>
				)}

				{step == 2 && (
					<div className={styles.step}>
						<h2>Step 2</h2>
						<p>Download calendar and import into any calendar app</p>

						<div className={styles.btnCluster}>
							<Button intent="secondary" onClick={() => setSchedule(null)}>
								<ArrowLeft size={20} /> Done
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
				)}

				{showState === DialogState.Info && (
					<Dialog>
						<h2>Obtaining your spreadsheet</h2>
						<p>
							In Workday, navigate to <b>Academics {">"} View My Courses</b>
						</p>
						<p>
							Click the Excel sheet icon above the <b>My Enrolled Courses</b>{" "}
							table. It should download your registrations as an{" "}
							<code>.xlsx</code> spreadsheet.
						</p>

						<Button intent="secondary" onClick={closeDialog}>
							<Check size={20} />
							Got it
						</Button>
					</Dialog>
				)}
			</main>
		</>
	);
}
