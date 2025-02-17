import { ChangeEvent, useState } from "react";
import XLSX from "xlsx";
import { parseSheet } from "../utility/parser";
import "./App.css";

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
				<div className="btn-container">
					<input
						accept=".xlsx"
						type="file"
						id="file-input"
						onChange={onFileChange}
					/>
					<button
						id="start"
						className="btn"
						disabled={file === null}
						onClick={onStartPressed}
					>
						Start
					</button>
				</div>
			</div>
		</>
	);
}

export default App;
