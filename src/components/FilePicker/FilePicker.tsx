import { InputHTMLAttributes, useRef, useState } from "react";
import buttonStyles from "../Button/Button.module.css";
import styles from "./FilePicker.module.css";
import { Upload } from "feather-icons-react";

type FilePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

let filePickerId = 0;

export function FilePicker({ ...props }: FilePickerProps) {
	const id = props.id || `file-picker-${filePickerId++}`;
	const inputRef = useRef<HTMLInputElement>(null);
	const [fileName, setFileName] = useState<string>("No file chosen");

	const updateFileName = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		setFileName(file ? file.name : "No file chosen");
	};

	return (
		<div className={styles.wrapper}>
			<input
				id={id}
				ref={inputRef}
				className={styles.input}
				type="file"
				{...props}
				onChange={(e) => {
					updateFileName(e);
					if (props.onChange) props.onChange(e);
				}}
			/>
			<label
				htmlFor={id}
				className={`${buttonStyles.button} ${buttonStyles.secondary} ${styles.label}`}
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						inputRef.current?.click();
					}
				}}
			>
				<Upload size={16} /> Upload
			</label>
			<span className={styles.fileName}>{fileName}</span>
		</div>
	);
}
