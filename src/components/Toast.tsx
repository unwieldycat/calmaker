import FeatherIcon from "feather-icons-react";
import "./Toast.css";

export function Toast({ type, message }: { type: ToastType; message: string }) {
	return (
		<div className="error toast">
			<FeatherIcon icon="alert-triangle" size={14} />
			{message}
		</div>
	);
}

export enum ToastType {
	Error = "error",
}
