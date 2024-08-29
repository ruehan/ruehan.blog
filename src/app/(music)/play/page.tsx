"use client";

interface Song {
	id: number;
	title: string;
	artist: string;
	album: string | null;
	releaseYear: number | null;
	duration: number;
	genre: string | null;
	audioUrl: string;
	coverImageUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
}

import MP3Player from "@/app/components/YoutubeAudioPlayer";
import React, { useEffect, useState } from "react";
import { getMusic } from "../music-list/actions";
import Link from "next/link";

export default function Home() {
	const [songs, setSongs] = useState<Song[]>([]);

	useEffect(() => {
		async function fetchSongs() {
			const fetchedSongs = await getMusic();

			setSongs(fetchedSongs);
		}
		fetchSongs();
	}, []);

	return (
		<>
			<p className="fixed top-10 left-10 bg-yellow-300 p-8 font-bold rounded-md">개발 중 - Beta</p>
			<div>{songs.length > 0 && <MP3Player songs={songs} />}</div>
		</>
	);
}
