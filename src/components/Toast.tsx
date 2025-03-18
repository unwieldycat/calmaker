import { AlertTriangle } from "feather-icons-react";
import "./Toast.css";

export function Toast({ type, message }: { type: ToastType; message: string }) {
	return (
		<div className={`${type} toast`}>
			<AlertTriangle size={14} />
			{message}
		</div>
	);
}

export enum ToastType {
	Error = "error",
}
