import { AlertTriangle } from "feather-icons-react";
import { cva } from "class-variance-authority";
import styles from "./Toast.module.css";

const toastVariants = cva(styles.toast, {
	variants: {
		type: {
			error: styles.error,
		},
	},
	defaultVariants: {
		type: "error",
	},
});

export function Toast({ type, message }: ToastProps) {
	return (
		<div className={toastVariants({ type })}>
			<div className={styles.header}>
				<AlertTriangle size={18} /> Error
			</div>

			{message}
		</div>
	);
}

export interface ToastProps {
	type: "error";
	message: string;
}
