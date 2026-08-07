import { ChangeEvent, useEffect, useState } from "react";
import { parseSheet } from "../lib/parser";
import { ArrowLeft, Check, Download, HelpCircle } from "feather-icons-react";
import { DateRange, Schedule } from "../lib/schedule";
import { Toast } from "../components/Toast/Toast";
import { sheetToArray } from "../lib/sheet";
import { Button } from "../components/Button/Button";
import { FilePicker } from "../components/FilePicker/FilePicker";
import styles from "./Index.module.css";
import { Dialog } from "../components/Dialog/Dialog";
import { Link } from "../components/Link/Link";
import { Select } from "../components/Select/Select";
import { DateTime } from "luxon";
import academicCalendars from "../schedules.json";
import type { ScheduleOverride } from "../lib/schedule";
import { LabelCheckbox } from "../components/LabelCheckbox/LabelCheckbox";

enum DialogState {
	ObtainingInfo,
	ImportingInfo,
	None,
}

export function IndexPage() {
	const termOptions = ["A", "B", "C", "D", "E1", "E2"] as const;
	const [showState, setShowState] = useState<DialogState>(DialogState.None);
	const [schedule, setSchedule] = useState<Schedule | null>(null);
	const [errors, setErrors] = useState<Error[]>([]);
	const [step, setStep] = useState<number>(1);
	const [icsData, setIcsData] = useState<string>("");
	const [selectedAcademicCalendar, setSelectedAcademicCalendar] =
		useState<string>("2026-2027 Calendar");
	const [selectedTerms, setSelectedTerms] = useState<string[]>([]);

	useEffect(() => {
		if (icsData.length > 0) {
			setStep(3);
		} else if (schedule) {
			setStep(2);
		} else {
			setStep(1);
			setErrors([]);
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
				.then((parsedResult) => {
					setErrors(parsedResult[1]);
					setSchedule(parsedResult[0]);
				})
				.catch((e) => {
					console.error(e);
					console.error("Erroneous sheet data below:", sheetData);
					setSchedule(null);
					setErrors([e]);
				});
		});
	};

	const loadOverrides = () => {
		const calendar = academicCalendars.find(
			(cal) => cal.name === selectedAcademicCalendar,
		);

		if (!calendar) return [];

		const overrides: ScheduleOverride[] = calendar.overrides.map(
			(override) => ({
				...override,
				date: DateTime.fromFormat(override.date, "MM-dd-yyyy", {
					zone: "America/New_York",
				}),
			}),
		);

		return overrides;
	};

	const parseOverrideDate = (dateString: string) => {
		return DateTime.fromFormat(dateString, "MM-dd-yyyy", {
			zone: "America/New_York",
		});
	};

	const getTermRange = (term: string) => {
		const calendar = academicCalendars.find(
			(cal) => cal.name === selectedAcademicCalendar,
		);

		if (!calendar) return null;

		if (!(term in calendar.terms)) {
			console.error("Invalid term specified for term range: ", term);
			return null;
		}

		const termData = calendar.terms[term as keyof typeof calendar.terms];
		if (!termData) return null;

		return {
			start: parseOverrideDate(termData.start),
			end: parseOverrideDate(termData.end),
		};
	};

	const getSelectedRanges = (): DateRange[] => {
		const ranges: DateRange[] = [];

		for (const term of selectedTerms) {
			const range = getTermRange(term);
			if (!range) continue;
			ranges.push(range);
		}

		return ranges;
	};

	const isTermSelected = (term: string) => {
		return selectedTerms.includes(term);
	};

	const toggleTerm = (term: string) => {
		const selected = isTermSelected(term);

		if (selected) {
			const nextTerms = selectedTerms.filter((entry) => entry !== term);
			setSelectedTerms(nextTerms);
			return;
		}

		const nextTerms = [...selectedTerms, term];
		setSelectedTerms(nextTerms);
	};

	const generateFile = () => {
		if (!schedule) return;

		const overrides = loadOverrides();
		const selectedRanges = getSelectedRanges();
		const data = schedule.toICalendar(overrides, selectedRanges);
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
				{step === 1 && (
					<>
						<h1>WPI Calendar Generator</h1>

						<p>
							A tool to generate Outlook, Apple Calendar, or Google Calendar
							events from your WPI Workday schedule.
						</p>
					</>
				)}

				{errors.length > 0 && (
					<Toast type="error">
						{step === 1 ? (
							<p>
								The following errors occurred while parsing your sheet. Ensure
								that your sheet is a valid Workday registration export and that
								it hasn't been modified.
							</p>
						) : (
							<p>
								The following errors occurred while parsing your sheet. Verify
								the output against your Workday schedule to ensure that it is
								correct.
							</p>
						)}

						<div className={styles.errorList}>
							{errors.map((error) => (
								<p key={error.name + error.message}>
									<b>{error.name}</b>: {error.message}
								</p>
							))}
						</div>
					</Toast>
				)}

				{step == 1 && (
					<>
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
						<p>Apply modified schedule days from</p>

						<Select
							value={selectedAcademicCalendar}
							onChange={(event) => {
								setSelectedAcademicCalendar(event.target.value);
								setSelectedTerms([]);
							}}
						>
							<option value="2026-2027 Calendar">2026-2027 Calendar</option>
							<option value="default">Nothing. I'll do it myself</option>
						</Select>

						{selectedAcademicCalendar !== "default" && (
							<>
								<p>Include terms</p>
								<div className={styles.checkboxes}>
									{termOptions.map((term) => (
										<LabelCheckbox
											key={term}
											label={term}
											checked={isTermSelected(term)}
											onChange={() => toggleTerm(term)}
										/>
									))}
								</div>
							</>
						)}

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
						<Toast type="warning">
							Importing events to an Outlook account from an Apple Calendar
							client may result in broken events. Import to your calendar
							platform of choice using its native website or app.
						</Toast>
						<Toast type="info">
							<p>
								Bad output?{" "}
								<a href="https://github.com/unwieldycat/calmaker/issues">
									Create a GitHub issue
								</a>{" "}
								or contact me!
							</p>
						</Toast>
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
