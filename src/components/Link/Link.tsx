import styles from "./Link.module.css";
import { ExternalLink } from "feather-icons-react";

export interface LinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export function Link({ href, children }: LinkProps) {
	return (
		<a href={href} className={styles.link} target="_blank">
			<ExternalLink size={20} />
			{children}
		</a>
	);
}
