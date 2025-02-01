import { ChangeEvent, useState } from "react";
import XLSX from "xlsx";
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

		file.text().then((data) => {
			const book = XLSX.read(data, { type: "buffer" });
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
