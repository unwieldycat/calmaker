import { ChangeEvent, useEffect, useState } from "react";
import { parseSheet } from "../lib/parser";
import {
	ArrowLeft,
	ArrowRight,
	Check,
	Download,
	HelpCircle,
} from "feather-icons-react";
import { Schedule } from "../lib/schedule";
import { Toast } from "../components/Toast/Toast";
import { sheetToArray } from "../lib/sheet";
import { Button } from "../components/Button/Button";
import { FilePicker } from "../components/FilePicker/FilePicker";
import styles from "./Index.module.css";
import { Dialog } from "../components/Dialog/Dialog";
import { Link } from "../components/Link/Link";
import { Select } from "../components/Select/Select";

enum DialogState {
	ObtainingInfo,
	ImportingInfo,
	None,
}

export function IndexPage() {
	const [showState, setShowState] = useState<DialogState>(DialogState.None);
	const [schedule, setSchedule] = useState<Schedule | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [step, setStep] = useState<number>(1);
	const [icsData, setIcsData] = useState<string>("");

	useEffect(() => {
		if (icsData.length > 0) {
			setStep(3);
		} else if (schedule) {
			setStep(2);
		} else {
			setStep(1);
		}
	}, [schedule, icsData]);

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

	const generateFile = () => {
		if (!schedule) return;
		const data = schedule.toICalendar();
		setIcsData(data);
	};

	const downloadFile = () => {
		const blob = new Blob([icsData], { type: "text/calendar" });
		const url = URL.createObjectURL(blob);
		window.open(url);
	};

	return (
		<>
			<main className={styles.main}>
				<h1>WPI Calendar Generator</h1>

				<p>
					A quick tool to generate Outlook, Apple Calendar, or Google Calendar
					events from your WPI Workday schedule.
				</p>

				{error && (
					<Toast
						type="error"
						message={<p>Failed to parse file. It could be the wrong one.</p>}
					/>
				)}

				{step == 1 && (
					<>
						<Toast
							type="warning"
							message={
								<p>
									A previous version of this tool had issues with daylight
									savings where B-Term classes after the switch would be off by
									one hour. Check your schedule if you've used this before!
								</p>
							}
						/>

						<div className={styles.step}>
							<h2>Upload Time Table</h2>
							<p>Upload your registered classes spreadsheet</p>
							<div className={styles.btnCluster}>
								<FilePicker accept=".xlsx" onChange={onFileChange} />
								<Button
									intent="secondary"
									onClick={() => setShowState(DialogState.ObtainingInfo)}
								>
									<HelpCircle size={20} /> Help
								</Button>
							</div>
						</div>
					</>
				)}

				{step == 2 && (
					<div className={styles.step}>
						<h2>Review Options</h2>
						<p>Select options for your calendar export.</p>

						<Select defaultValue="25-26">
							<option value="default">No modified days</option>
							<option value="25-26">2025-2026 Schedule</option>
							<option value="26-27">2026-2027 Schedule</option>
						</Select>

						<div className={styles.btnCluster}>
							<Button
								intent="secondary"
								onClick={() => {
									setSchedule(null);
									setIcsData("");
								}}
							>
								<ArrowLeft size={20} /> Back
							</Button>
							<Button
								disabled={!schedule}
								onClick={generateFile}
								intent="primary"
							>
								<Check size={20} /> Generate
							</Button>
						</div>
					</div>
				)}

				{step == 3 && (
					<>
						<Toast
							type="info"
							message={
								<p>
									Bad output?{" "}
									<a href="https://github.com/unwieldycat/calmaker/issues">
										Create a GitHub issue
									</a>{" "}
									or contact me!
								</p>
							}
						/>
						<div className={styles.step}>
							<h2>Export Calendar</h2>
							<p>
								Download the <code>.ics</code> file and import it into a new
								calendar. Cross-check with your Workday schedule in case of
								incorrect output.
							</p>

							<div className={styles.btnCluster}>
								<Button
									intent="secondary"
									onClick={() => {
										setIcsData("");
									}}
								>
									<ArrowLeft size={20} /> Back
								</Button>
								<Button
									disabled={!schedule}
									onClick={downloadFile}
									intent="primary"
								>
									<Download size={20} /> Download
								</Button>
								<Button
									intent="secondary"
									onClick={() => setShowState(DialogState.ImportingInfo)}
								>
									<HelpCircle /> Help
								</Button>
							</div>
						</div>
					</>
				)}

				{showState === DialogState.ObtainingInfo && (
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

				{showState === DialogState.ImportingInfo && (
					<Dialog>
						<h2>Importing your calendar</h2>
						<p>
							Opening the file directly should open it in your default calendar
							app. If not, Below are links to detailed instructions for each
							platform.
						</p>
						<div>
							<Link href="https://support.google.com/calendar/answer/37118?hl=en&co=GENIE.Platform%3DDesktop&oco=1">
								Google Calendar
							</Link>
							<Link href="https://support.microsoft.com/en-us/office/import-calendars-into-outlook-8e8364e1-400e-4c0f-a573-fe76b5a2d379">
								Outlook
							</Link>
							<Link href="https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac">
								Apple Calendar (Mac)
							</Link>
						</div>
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
