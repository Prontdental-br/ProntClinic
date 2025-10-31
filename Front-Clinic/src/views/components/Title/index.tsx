import React, { ReactNode } from "react";
import Typography from "@material-ui/core/Typography";

interface Props {
  children: ReactNode
}

export default function Title(props: Props) {
	return (
		<Typography variant="h5" color="primary" gutterBottom>
			{props.children}
		</Typography>
	);
}
