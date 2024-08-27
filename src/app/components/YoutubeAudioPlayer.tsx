"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

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

interface MP3PlayerProps {
	songs: Song[];
}

const MP3Player: React.FC<MP3PlayerProps> = ({ songs }) => {
	const [currentSongIndex, setCurrentSongIndex] = useState(0);
	const [currentSong, setCurrentSong] = useState<Song | null>();
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState<number>(0);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);
	const playerRef = useRef<YouTube>(null);
	const progressInterval = useRef<number | null>(null);

	const [youTubeReady, setYouTubeReady] = useState(false);

	// useEffect(() => {
	// 	// 곡이 변경될 때마다 YouTube 플레이어 재초기화
	// 	if (playerRef.current?.internalPlayer) {
	// 		const videoId = extractYouTubeId(songs[currentSongIndex].audioUrl);
	// 		if (videoId) {
	// 			playerRef.current.internalPlayer.loadVideoById(videoId);
	// 			setIsPlaying(true);
	// 			setProgress(0);
	// 			setCurrentTime(0);
	// 		}
	// 	}
	// }, [currentSongIndex, songs]);

	useEffect(() => {
		console.log(songs[currentSongIndex]);
		setCurrentSong(songs[currentSongIndex]);
	}, [currentSongIndex]);

	useEffect(() => {
		return () => {
			if (progressInterval.current) {
				cancelAnimationFrame(progressInterval.current);
			}
		};
	}, []);

	const formatTime = (time: number): string => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	};

	const startProgressTracker = () => {
		if (progressInterval.current) {
			cancelAnimationFrame(progressInterval.current);
		}

		const updateProgress = () => {
			if (playerRef.current?.internalPlayer) {
				playerRef.current.internalPlayer.getCurrentTime().then((time: number) => {
					const progressPercent = Number.isFinite(time / duration) ? (time / duration) * 100 : 0;
					setProgress(progressPercent);
					setCurrentTime(time);
					progressInterval.current = requestAnimationFrame(updateProgress);
				});
			}
		};

		progressInterval.current = requestAnimationFrame(updateProgress);
	};

	const stopProgressTracker = () => {
		if (progressInterval.current) {
			cancelAnimationFrame(progressInterval.current);
		}
	};

	const handlePlayerStateChange = (event: YT.OnStateChangeEvent) => {
		const playerState = event.data;

		console.log(event.target);

		switch (playerState) {
			case YT.PlayerState.UNSTARTED:
				console.log("상태변경 [UNSTARTED]");
				setIsPlaying(false);
				startProgressTracker();
				break;
			case YT.PlayerState.PLAYING:
				console.log("상태변경 [PLAYING]");
				setIsPlaying(true);
				startProgressTracker();
				break;
			case YT.PlayerState.PAUSED:
				console.log("상태변경 [PAUSED]");
				setIsPlaying(false);
				stopProgressTracker();
				break;
			case YT.PlayerState.ENDED:
				console.log("상태변경 [ENDED]");
				handleNext();
				break;
		}
	};

	const handlePlayPause = () => {
		if (isPlaying) {
			playerRef.current?.internalPlayer.pauseVideo();
		} else {
			playerRef.current?.internalPlayer.playVideo();
		}
		setIsPlaying(!isPlaying);
	};

	const handleNext = () => {
		playerRef.current?.internalPlayer.pauseVideo();
		setCurrentSongIndex((prevIndex) => (prevIndex === songs.length - 1 ? 0 : prevIndex + 1));
		setCurrentSong(null);
	};

	const handlePrevious = () => {
		setCurrentSongIndex((prevIndex) => (prevIndex === 0 ? songs.length - 1 : prevIndex - 1));
		setCurrentSong(null);
	};

	const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
		const seekTime = (Number(event.target.value) / 100) * duration;
		if (playerRef.current?.internalPlayer) {
			playerRef.current.internalPlayer.seekTo(seekTime, true);
			setCurrentTime(seekTime);
		}
	};
	const extractYouTubeId = (url: string): string | undefined => {
		const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
		return match ? match[1] : undefined;
	};

	const opts = {
		height: "0",
		width: "0",
		playerVars: {
			autoplay: 1,
			origin: window.location.origin,
		},
	};

	if (currentSong == null) {
		return <div>Loading...</div>;
	}

	return (
		<div className="w-80 p-6 bg-gray-100 rounded-xl shadow-md font-sans fixed top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%]">
			<div className="text-center mb-6">
				<h2 className="text-xl font-bold text-gray-800">{currentSong.title}</h2>
				<p className="text-sm text-gray-600 mt-1">{currentSong.artist}</p>
			</div>
			<div className="flex justify-between items-center mb-6">
				<button className="text-gray-600 hover:text-gray-800 focus:outline-none" onClick={handlePrevious}>
					<ChevronLeft size={24} />
				</button>
				<div className="w-48 h-48 overflow-hidden rounded-lg">
					<img src={currentSong.coverImageUrl!} alt={`${currentSong.title} cover`} className="w-full h-full object-cover" />
				</div>
				<button className="text-gray-600 hover:text-gray-800 focus:outline-none" onClick={handleNext}>
					<ChevronRight size={24} />
				</button>
			</div>
			<div className="flex items-center gap-2 mb-4">
				<span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
				<input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer" />
				<span className="text-xs text-gray-500">{formatTime(duration)}</span>
			</div>
			<button className="w-12 h-12 mx-auto flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none" onClick={handlePlayPause}>
				{isPlaying ? <Pause size={24} /> : <Play size={24} />}
			</button>
			<YouTube
				videoId={extractYouTubeId(currentSong?.audioUrl)}
				opts={opts}
				onReady={(event: any) => {
					console.log("영상 준비 완료!");
					setDuration(event.target.getDuration());
					event.target.playVideo();
				}}
				onStateChange={handlePlayerStateChange}
				ref={playerRef}
			/>
		</div>
	);
};

export default MP3Player;
