import { ChangeEvent, useState } from "react";
import XLSX from "xlsx";
import { parseSheet } from "../logic/parser";
import "./App.css";
import FeatherIcon from "feather-icons-react";

function App() {
	const [file, setFile] = useState<File | null>(null);

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

			<div className="controls-container">
				<input
					accept=".xlsx"
					type="file"
					id="file-input"
					onChange={onFileChange}
				/>

				<div className="btn-cluster">
					<button id="config" className="icon button">
						<FeatherIcon icon="settings" size={20} />
					</button>
					<button
						id="start"
						className="primary button"
						disabled={file === null}
						onClick={onStartPressed}
					>
						Start
					</button>
				</div>
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
