"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getMusic } from "./actions";
import { useRouter } from "next/navigation";
// import { redirect } from "next/navigation";

interface Song {
	id: number;
	title: string;
	artist: string;
	album: string;
	releaseYear: number | null;
	duration: number;
	genre: string | null;
	audioUrl: string;
	coverImageUrl: string | null;
}

export default function MusicList() {
	const router = useRouter();
	const [music, setMusic] = useState<Song[]>([]);

	useEffect(() => {
		async function fetchData() {
			const data = await getMusic();
			console.log(data);
			setMusic(data as Song[]);
		}

		fetchData();
	}, []);

	console.log(music);

	const formatDuration = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	if (!music) {
		return null;
	}

	return (
		<div className="container mx-auto mt-10 p-6">
			<h1 className="text-3xl font-bold mb-6">음악 목록</h1>
			<button onClick={() => router.push("/add-music")} className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
				새 음악 등록
			</button>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{music.map((song) => (
					<div key={song.id} className="bg-white shadow-md rounded-lg overflow-hidden">
						<div className="relative h-48 w-full">
							<Image src={song.coverImageUrl || "/placeholder-image.jpg"} alt={`${song.title} cover`} layout="fill" objectFit="cover" />
						</div>
						<div className="p-4">
							<h2 className="text-xl font-semibold mb-2">{song.title}</h2>
							<p className="text-gray-600 mb-2">{song.artist}</p>
							<p className="text-sm text-gray-500 mb-2">앨범: {song.album || "N/A"}</p>
							<p className="text-sm text-gray-500 mb-2">발매년도: {song.releaseYear || "N/A"}</p>
							<p className="text-sm text-gray-500 mb-2">장르: {song.genre || "N/A"}</p>
							<p className="text-sm text-gray-500 mb-4">재생시간: {formatDuration(song.duration)}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
