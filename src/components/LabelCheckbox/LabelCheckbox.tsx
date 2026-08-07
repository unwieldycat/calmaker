import styles from "./LabelCheckbox.module.css";

export interface LabelCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
}

export function LabelCheckbox({ label, ...props }: LabelCheckboxProps) {
	return (
		<label className={styles.label}>
			<span>{label}</span>
			<input type="checkbox" className={styles.checkbox} {...props} />
		</label>
	);
}
