import { ChangeEvent, useState } from "react";
import XLSX from "xlsx";
import { parseSheet } from "../logic/parser";
import "./App.css";
import FeatherIcon from "feather-icons-react";

enum ShowState {
	Settings,
	Info,
	None,
}

function App() {
	const [file, setFile] = useState<File | null>(null);
	const [showState, setShowState] = useState<ShowState>(ShowState.None);

	const onInfoPressed = () => {
		if (showState === ShowState.Info) setShowState(ShowState.None);
		else setShowState(ShowState.Info);
	};

	const onSettingsPressed = () => {
		if (showState === ShowState.Settings) setShowState(ShowState.None);
		else setShowState(ShowState.Settings);
	};

	const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files === null || event.target.files.length === 0) {
			setFile(null);
		} else {
			setFile(event.target.files[0]);
		}
	};

	const onStartPressed = () => {
		if (!file) return;

		file.arrayBuffer().then((data) => {
			const book = XLSX.read(data, {
				type: "array",
				dense: true,
				cellDates: true,
			});
			const sheet = book.Sheets[book.SheetNames[0]];

			parseSheet(sheet)
				.then((schedule) => {
					const data = schedule.toICalendar().render();
					const blob = new Blob([data], { type: "text/calendar" });
					const url = URL.createObjectURL(blob);
					window.open(url);
				})
				.catch((e) => console.error(e));
		});
	};

	return (
		<>
			<h1>Convert your WPI Workday schedule to ICS 🗓️</h1>
			<div className="controls box">
				<input
					accept=".xlsx"
					type="file"
					id="file-input"
					onChange={onFileChange}
				/>

				<div className="btn-cluster">
					<button className="icon button" onClick={onInfoPressed}>
						<FeatherIcon icon="info" size={20} />
					</button>
					<button
						className="icon button"
						onClick={onSettingsPressed}
						disabled={file === null}
					>
						<FeatherIcon icon="settings" size={20} />
					</button>
					<button
						id="start"
						className="primary button"
						disabled={file === null}
						onClick={onStartPressed}
					>
						<FeatherIcon icon="download" size={20} />
					</button>
				</div>
			</div>

			<div className="info box" hidden={showState !== ShowState.Info}>
				<h3>Instructions</h3>
				<p>
					Export your schedule from Workday and upload it here. You can export
					your schedule from Workday by navigating to{" "}
					<i>Academics {">"} View My Courses</i> and clicking the Excel icon
					next to <i>My Enrolled Courses</i>.
				</p>
				<p>
					Note that there are multiple ways of exporting your schedule, and not
					all formats work (despite my best efforts). The method above should be
					the most reliable.
				</p>

				<h3>Privacy</h3>
				<p>
					This tool runs entirely in <i>your</i> browser, and does not store or
					send any data to a server.
				</p>
			</div>

			<div className="footer-container">
				<div className="footer-row">
					<p>This tool is not officially endorsed by WPI</p>
				</div>
				<div className="footer-row">
					<p>© 2025 Thurston A Yates</p>
					<p> • </p>
					<a href="https://github.com/unwieldycat/calmaker">View Source</a>
				</div>
			</div>
		</>
	);
}

export default App;
