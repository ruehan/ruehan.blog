"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(
	() => import("../../components/travel/MapComponent"),
	{
		ssr: false,
		loading: () => <p>Map is loading...</p>,
	}
);

export default function Home() {
	return (
		<main>
			<MapComponent />
		</main>
	);
}
