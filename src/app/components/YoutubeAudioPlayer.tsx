import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from "lucide-react";

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
	const [currentSong, setCurrentSong] = useState<Song | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState<number>(0);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);
	const [volume, setVolume] = useState<number>(10);
	const [isMuted, setIsMuted] = useState<boolean>(false);
	const playerRef = useRef<YouTube>(null);
	const progressInterval = useRef<number | null>(null);
	const [rotation, setRotation] = useState(0);
	const rotationRef = useRef(0);
	const animationFrameId = useRef<number | null>(null);

	useEffect(() => {
		console.log(songs[currentSongIndex]);
		setCurrentSong(songs[currentSongIndex]);
	}, [currentSongIndex, songs]);

	useEffect(() => {
		return () => {
			if (progressInterval.current) {
				cancelAnimationFrame(progressInterval.current);
			}
		};
	}, []);

	const updateRotation = () => {
		if (isPlaying) {
			rotationRef.current += 0.5; // 회전 속도 조절 (더 작은 값으로 설정하여 천천히 회전)
			setRotation(rotationRef.current);
			animationFrameId.current = requestAnimationFrame(updateRotation);
		}
	};

	useEffect(() => {
		if (isPlaying) {
			animationFrameId.current = requestAnimationFrame(updateRotation);
		} else {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
			}
		}

		return () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
			}
		};
	}, [isPlaying]);

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

		switch (playerState) {
			case YT.PlayerState.UNSTARTED:
				setIsPlaying(false);
				startProgressTracker();
				break;
			case YT.PlayerState.PLAYING:
				setIsPlaying(true);
				startProgressTracker();
				break;
			case YT.PlayerState.PAUSED:
				setIsPlaying(false);
				stopProgressTracker();
				break;
			case YT.PlayerState.ENDED:
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
		rotationRef.current = 0;
	};

	const handlePrevious = () => {
		setCurrentSongIndex((prevIndex) => (prevIndex === 0 ? songs.length - 1 : prevIndex - 1));
		setCurrentSong(null);
		rotationRef.current = 0;
	};

	const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
		const seekTime = (Number(event.target.value) / 100) * duration;
		if (playerRef.current?.internalPlayer) {
			playerRef.current.internalPlayer.seekTo(seekTime, true);
			setCurrentTime(seekTime);
		}
	};

	const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = Number(event.target.value);
		setVolume(newVolume);
		if (playerRef.current?.internalPlayer) {
			playerRef.current.internalPlayer.setVolume(newVolume);
		}
		if (newVolume === 0) {
			setIsMuted(true);
		} else {
			setIsMuted(false);
		}
	};

	const toggleMute = () => {
		if (playerRef.current?.internalPlayer) {
			if (isMuted) {
				playerRef.current.internalPlayer.unMute();
				playerRef.current.internalPlayer.setVolume(volume);
				setIsMuted(false);
			} else {
				playerRef.current.internalPlayer.mute();
				setIsMuted(true);
			}
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
				<div className="relative w-48 h-48">
					{/* 비닐 레코드 테두리 */}
					<div className="absolute inset-0 rounded-full bg-black shadow-lg"></div>
					{/* CD 모양 앨범 커버 */}
					<div
						className={`absolute inset-2 rounded-full overflow-hidden shadow-inner`}
						style={{
							// transition: "transform 0.1s linear",
							transform: `rotate(${rotation}deg)`,
						}}
					>
						<img src={currentSong.coverImageUrl!} alt={`${currentSong.title} cover`} className="w-full h-full object-cover" />
					</div>
					{/* CD 중앙 홀 */}
					<div className="absolute top-1/2 left-1/2 w-12 h-12 bg-gray-200 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-inner z-10"></div>
					{/* 재생/일시정지 버튼 */}
					<button
						className="absolute top-1/2 left-1/2 w-16 h-16 flex items-center justify-center bg-white bg-opacity-75 text-green-500 rounded-full hover:bg-opacity-100 focus:outline-none transform -translate-x-1/2 -translate-y-1/2 z-20"
						onClick={handlePlayPause}
					>
						{isPlaying ? <Pause size={32} /> : <Play size={32} />}
					</button>
				</div>
				<button className="text-gray-600 hover:text-gray-800 focus:outline-none" onClick={handleNext}>
					<ChevronRight size={24} />
				</button>
			</div>
			<div className="mb-4">
				<div className="flex items-center justify-between text-xs text-gray-500 mb-1">
					<span>{formatTime(currentTime)}</span>
					<span>{formatTime(duration)}</span>
				</div>
				<div className="relative w-full h-2 bg-gray-300 rounded-full">
					<div className="absolute top-0 left-0 h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }}></div>
					<input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
				</div>
			</div>
			<div className="flex items-center justify-between mb-4">
				<button className="text-gray-600 hover:text-gray-800 focus:outline-none" onClick={toggleMute}>
					{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
				</button>
				<div className="relative w-48 h-2 bg-gray-300 rounded-full">
					<div className="absolute top-0 left-0 h-full bg-purple-500 rounded-full" style={{ width: `${isMuted ? 0 : volume}%` }}></div>
					<input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
				</div>
			</div>
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
