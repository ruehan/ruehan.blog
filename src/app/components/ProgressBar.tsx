// app/components/ProgressBar.tsx
"use client";

import { useState, useEffect } from "react";

export default function ProgressBar() {
	const [scrollProgress, setScrollProgress] = useState(0);

	useEffect(() => {
		const updateScrollProgress = () => {
			const scrollPx = document.documentElement.scrollTop;
			const winHeightPx =
				document.documentElement.scrollHeight -
				document.documentElement.clientHeight;
			const scrolled = `${(scrollPx / winHeightPx) * 100}%`;

			setScrollProgress((scrollPx / winHeightPx) * 100);
		};

		window.addEventListener("scroll", updateScrollProgress);

		return () => {
			window.removeEventListener("scroll", updateScrollProgress);
		};
	}, []);

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "4px",
				backgroundColor: "#ddd",
				zIndex: 1000,
			}}
		>
			<div
				style={{
					height: "100%",
					width: `${scrollProgress}%`,
					backgroundColor: "#3b82f6",
					transition: "width 0.3s ease",
				}}
			/>
		</div>
	);
}
