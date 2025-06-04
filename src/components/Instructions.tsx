export function Instructions() {
	return (
		<div className="box">
			<h3>Instructions</h3>
			<p>Export your schedule from Workday by navigating to</p>
			<b>Academics {">"} View My Courses</b>
			<p>
				and clicking the Excel icon above the <b>My Enrolled Courses</b> table.
			</p>
			<p>
				Upload the <code>.xlsx</code> file here and click download to generate a{" "}
				<code>.ics</code> file that can be imported to any calendar app.
			</p>
			<h3>Privacy Statement</h3>
			<p>
				This tool runs entirely in <i>your</i> browser, and does not store or
				send any data to a server.
			</p>
		</div>
	);
}
