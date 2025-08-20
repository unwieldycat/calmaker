import { AlertTriangle, Info } from "feather-icons-react";
import { cva } from "class-variance-authority";
import styles from "./Toast.module.css";
import { ReactNode } from "react";

const toastVariants = cva(styles.toast, {
	variants: {
		type: {
			error: styles.error,
			info: styles.info,
			warning: styles.warning,
		},
	},
	defaultVariants: {
		type: "info",
	},
});

export function Toast({ type, message }: ToastProps) {
	return (
		<div className={toastVariants({ type })}>
			<div className={styles.header}>
				{type === "error" && (
					<>
						<AlertTriangle size={18} /> Error
					</>
				)}
				{type === "info" && (
					<>
						<Info size={18} /> Info
					</>
				)}
				{type === "warning" && (
					<>
						<AlertTriangle size={18} /> Warning
					</>
				)}
			</div>

			{message}
		</div>
	);
}

export interface ToastProps {
	type: "error" | "info" | "warning";
	message: ReactNode;
}
