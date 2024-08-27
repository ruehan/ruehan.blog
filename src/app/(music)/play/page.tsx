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

export default function Home() {
	const [songs, setSongs] = useState<Song[]>([]);

	useEffect(() => {
		async function fetchSongs() {
			const fetchedSongs = await getMusic();

			setSongs(fetchedSongs);
		}
		fetchSongs();
	}, []);

	return <div>{songs.length > 0 && <MP3Player songs={songs} />}</div>;
}
