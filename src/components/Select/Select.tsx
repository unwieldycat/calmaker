import styles from "./Select.module.css";

export interface SelectProps
	extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ children, ...props }: SelectProps) {
	return (
		<select className={styles.select} {...props}>
			{children}
		</select>
	);
}
