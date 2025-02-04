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
			try {
				parseSheet(sheet);
			} catch (e) {
				console.error(e);
			}
		});
	};

	return (
		<>
			<div className="btn-container">
				<input
					accept=".xlsx"
					type="file"
					id="file-input"
					onChange={onFileChange}
				/>
				<button id="start" disabled={file === null} onClick={onStartPressed}>
					Start
				</button>
			</div>
		</>
	);
}

export default App;
