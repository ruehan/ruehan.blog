"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getMusic } from "../music-list/actions";
import YouTubePlayer from "@/app/components/YoutubeAudioPlayer";

interface Song {
	id: number;
	title: string;
	artist: string;
	album: string;
	audioUrl: string;
	coverImageUrl: string;
}

const MusicPlayerPage: React.FC = () => {
	const [songs, setSongs] = useState<Song[]>([]);
	const [currentSongIndex, setCurrentSongIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [player, setPlayer] = useState<any>(null);
	const [volume, setVolume] = useState(10);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		async function fetchSongs() {
			const fetchedSongs = await getMusic();
			setSongs(fetchedSongs as Song[]);
		}
		fetchSongs();
	}, []);

	const currentSong = songs[currentSongIndex];

	const handlePrevious = useCallback(() => {
		setCurrentSongIndex((prevIndex) => (prevIndex === 0 ? songs.length - 1 : prevIndex - 1));
	}, [songs.length]);

	const handleNext = useCallback(() => {
		setCurrentSongIndex((prevIndex) => (prevIndex === songs.length - 1 ? 0 : prevIndex + 1));
	}, [songs.length]);

	const handlePlayPause = useCallback(() => {
		console.log("MusicPlayerPage: Play/Pause button clicked");
		if (player) {
			if (isPlaying) {
				console.log("MusicPlayerPage: Attempting to pause");
				player.pauseVideo();
			} else {
				console.log("MusicPlayerPage: Attempting to play");
				player.playVideo();
			}
		} else {
			console.error("MusicPlayerPage: YouTube player is not ready");
		}
	}, [player, isPlaying]);

	const handlePlayerReady = useCallback(
		(event: any) => {
			console.log("MusicPlayerPage: YouTube player is ready");
			setPlayer(event.target);
			event.target.setVolume(volume);
		},
		[volume]
	);

	const handlePlayerStateChange = useCallback((state: number) => {
		console.log("MusicPlayerPage: Player state changed:", state);
		setIsPlaying(state === window.YT.PlayerState.PLAYING);
	}, []);

	const handleVolumeChange = useCallback(
		(newVolume: number) => {
			setVolume(newVolume);
			if (player) {
				player.setVolume(newVolume);
			}
		},
		[player]
	);

	const handleProgressChange = useCallback((newProgress: number) => {
		setProgress(newProgress);
	}, []);

	const handleSeek = useCallback(
		(newProgress: number) => {
			if (player) {
				const duration = player.getDuration();
				const seekTime = (newProgress / 100) * duration;
				player.seekTo(seekTime);
			}
		},
		[player]
	);

	if (!currentSong) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			<div className="w-64 h-64 relative mb-4">
				<Image src={currentSong.coverImageUrl} alt={`${currentSong.title} cover`} layout="fill" objectFit="cover" className="rounded-lg" />
			</div>
			<h2 className="text-2xl font-bold mb-2">{currentSong.title}</h2>
			<p className="text-gray-600 mb-4">{currentSong.artist}</p>
			<div className="w-full max-w-md mb-4">
				<input type="range" min="0" max="100" value={progress} onChange={(e) => handleSeek(Number(e.target.value))} className="w-full" />
			</div>
			<div className="flex space-x-4 mb-4">
				<button onClick={handlePrevious} className="bg-blue-500 text-white px-4 py-2 rounded">
					Previous
				</button>
				<button onClick={handlePlayPause} className="bg-blue-500 text-white px-4 py-2 rounded">
					{isPlaying ? "Pause" : "Play"}
				</button>
				<button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">
					Next
				</button>
			</div>
			<div className="w-full max-w-md mb-4">
				<input type="range" min="0" max="100" value={volume} onChange={(e) => handleVolumeChange(Number(e.target.value))} className="w-full" />
			</div>
			<YouTubePlayer videoId={extractYouTubeId(currentSong.audioUrl)} onReady={handlePlayerReady} onStateChange={handlePlayerStateChange} onProgressChange={handleProgressChange} />
		</div>
	);
};

function extractYouTubeId(url: string): string {
	console.log("Extracting YouTube ID from URL:", url);
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = url.match(regExp);
	const id = match && match[2].length === 11 ? match[2] : "";
	console.log("Extracted YouTube ID:", id);
	return id;
}

export default MusicPlayerPage;
