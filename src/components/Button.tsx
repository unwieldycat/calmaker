import { ButtonHTMLAttributes, ComponentProps } from "react";
import { Info } from "feather-icons-react";
import { cva } from "class-variance-authority";
import styles from "./Button.module.css";

const buttonVariants = cva(styles.button, {
	variants: {
		intent: {
			primary: styles.primary,
			secondary: styles.secondary,
		},
	},
	defaultVariants: {
		intent: "primary",
	},
});

export interface ButtonProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
	intent: "primary" | "secondary";
}

export function Button({ intent, children, ...props }: ButtonProps) {
	return (
		<button className={buttonVariants({ intent })} {...props}>
			{children}
		</button>
	);
}
