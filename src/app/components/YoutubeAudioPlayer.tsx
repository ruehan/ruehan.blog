import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, ListOrdered, Repeat, Shuffle, List, Filter, Heart, Star, Info } from "lucide-react";

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
	isFavorite?: boolean;
}

interface MP3PlayerProps {
	songs: Song[];
}

type PlaylistItem = Song & { isCurrentSong: boolean };

type PlaybackMode = "sequential" | "random" | "repeat";

const MP3Player: React.FC<MP3PlayerProps> = ({ songs: initialSongs }) => {
	const [songs, setSongs] = useState<Song[]>(initialSongs);
	const [currentSongIndex, setCurrentSongIndex] = useState(0);
	const [currentSong, setCurrentSong] = useState<Song | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState<number>(0);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);
	const [volume, setVolume] = useState<number>(50);
	const [isMuted, setIsMuted] = useState<boolean>(false);
	const playerRef = useRef<YouTube>(null);
	const progressInterval = useRef<number | null>(null);
	const [rotation, setRotation] = useState(0);
	const rotationRef = useRef(0);
	const animationFrameId = useRef<number | null>(null);

	const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("sequential");
	const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

	const [showPlaylist, setShowPlaylist] = useState(true);
	const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

	const [showFooterInfo, setShowFooterInfo] = useState(false);

	useEffect(() => {
		const favoritesData = localStorage.getItem("favoriteSongs");
		if (favoritesData) {
			const favoriteIds = new Set(JSON.parse(favoritesData));
			setSongs(songs.map((song) => ({ ...song, isFavorite: favoriteIds.has(song.id) })));
		}
		setShuffledIndices(shuffleArray([...Array(initialSongs.length).keys()]));
	}, []);

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

	useEffect(() => {
		if (currentSong === null && isPlaying) {
			const playNewSong = async () => {
				if (playerRef.current?.internalPlayer) {
					await playerRef.current.internalPlayer.loadVideoById(extractYouTubeId(songs[currentSongIndex].audioUrl));
					playerRef.current.internalPlayer.playVideo();
				}
			};
			playNewSong();
		}
	}, [currentSong, currentSongIndex, isPlaying]);

	const toggleFooterInfo = () => {
		setShowFooterInfo(!showFooterInfo);
	};

	const getFilteredSongs = () => {
		return showOnlyFavorites ? songs.filter((song) => song.isFavorite) : songs;
	};

	const shuffleArray = (array: number[]) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	};

	const toggleFavorite = (songId: number) => {
		setSongs((prevSongs) => {
			const newSongs = prevSongs.map((song) => (song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song));
			const favoriteIds = newSongs.filter((song) => song.isFavorite).map((song) => song.id);
			localStorage.setItem("favoriteSongs", JSON.stringify(favoriteIds));
			return newSongs;
		});
	};

	const getPlaylistItems = (): PlaylistItem[] => {
		const playlistSize = 9;
		const halfSize = Math.floor(playlistSize / 2);

		let filteredSongs = getFilteredSongs();
		let playlist: PlaylistItem[];

		const currentSongInFilteredList = filteredSongs.find((song) => song.id === songs[currentSongIndex].id);

		if (!currentSongInFilteredList) {
			filteredSongs = songs;
			setShowOnlyFavorites(false);
		}

		if (playbackMode === "random") {
			const validShuffledIndices = shuffledIndices.filter((index) => index < filteredSongs.length);
			const currentShuffleIndex = validShuffledIndices.findIndex((index) => filteredSongs[index].id === songs[currentSongIndex].id);

			if (currentShuffleIndex === -1) {
				const newShuffledIndices = shuffleArray([...Array(filteredSongs.length).keys()]);
				setShuffledIndices(newShuffledIndices);
				return getPlaylistItems();
			}

			let startIndex = Math.max(0, currentShuffleIndex - halfSize);
			let endIndex = Math.min(validShuffledIndices.length - 1, currentShuffleIndex + halfSize);

			playlist = validShuffledIndices.slice(startIndex, endIndex + 1).map((index) => ({
				...filteredSongs[index],
				isCurrentSong: filteredSongs[index].id === songs[currentSongIndex].id,
			}));
		} else {
			const currentFilteredIndex = filteredSongs.findIndex((song) => song.id === songs[currentSongIndex].id);

			let startIndex = Math.max(0, currentFilteredIndex - halfSize);
			let endIndex = Math.min(filteredSongs.length - 1, currentFilteredIndex + halfSize);

			playlist = filteredSongs.slice(startIndex, endIndex + 1).map((song, index) => ({
				...song,
				isCurrentSong: startIndex + index === currentFilteredIndex,
			}));
		}

		return playlist;
	};

	const handleSongSelect = (index: number) => {
		setCurrentSongIndex(index);
		setCurrentSong(null);
		setIsPlaying(true);
		setShowPlaylist(true);
	};

	const handlePlaybackModeChange = (mode: PlaybackMode) => {
		setPlaybackMode(mode);
		if (mode === "random") {
			setShuffledIndices(shuffleArray([...Array(songs.length).keys()]));
		}
	};

	const getNextSongIndex = (currentIndex: number, filteredSongs: Song[]) => {
		if (playbackMode === "repeat") {
			return currentIndex;
		} else if (playbackMode === "random") {
			const validShuffledIndices = shuffledIndices.filter((index) => filteredSongs.includes(songs[index]));
			const currentShuffleIndex = validShuffledIndices.indexOf(currentIndex);
			return validShuffledIndices[(currentShuffleIndex + 1) % validShuffledIndices.length];
		} else {
			// sequential mode
			const currentFilteredIndex = filteredSongs.findIndex((song) => song.id === songs[currentIndex].id);
			const nextFilteredIndex = (currentFilteredIndex + 1) % filteredSongs.length;
			return songs.findIndex((song) => song.id === filteredSongs[nextFilteredIndex].id);
		}
	};

	const getPreviousSongIndex = (currentIndex: number, filteredSongs: Song[]) => {
		if (playbackMode === "repeat") {
			return currentIndex;
		} else if (playbackMode === "random") {
			const validShuffledIndices = shuffledIndices.filter((index) => filteredSongs.includes(songs[index]));
			const currentShuffleIndex = validShuffledIndices.indexOf(currentIndex);
			return validShuffledIndices[(currentShuffleIndex - 1 + validShuffledIndices.length) % validShuffledIndices.length];
		} else {
			// sequential mode
			const currentFilteredIndex = filteredSongs.findIndex((song) => song.id === songs[currentIndex].id);
			const prevFilteredIndex = (currentFilteredIndex - 1 + filteredSongs.length) % filteredSongs.length;
			return songs.findIndex((song) => song.id === filteredSongs[prevFilteredIndex].id);
		}
	};

	const handleNext = () => {
		const filteredSongs = getFilteredSongs();
		const nextIndex = getNextSongIndex(currentSongIndex, filteredSongs);
		setCurrentSongIndex(nextIndex);
		setCurrentSong(null);
		setIsPlaying(true);
	};

	const handlePrevious = () => {
		const filteredSongs = getFilteredSongs();
		const prevIndex = getPreviousSongIndex(currentSongIndex, filteredSongs);
		setCurrentSongIndex(prevIndex);
		setCurrentSong(null);
		setIsPlaying(true);
	};

	const updateRotation = () => {
		if (isPlaying) {
			rotationRef.current += 0.5;
			setRotation(rotationRef.current);
			animationFrameId.current = requestAnimationFrame(updateRotation);
		}
	};

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

	const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
		const seekTime = (Number(event.target.value) / 100) * duration;
		if (playerRef.current?.internalPlayer) {
			playerRef.current.internalPlayer.seekTo(seekTime, true);
			playerRef.current.internalPlayer.setVolume(volume);
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
				<h2 className="text-xl font-bold text-gray-80 flex justify-center items-center gap-2">
					{currentSong.title}
					<button onClick={() => toggleFavorite(currentSong.id)} className={`focus:outline-none ${currentSong.isFavorite ? "text-yellow-500" : "text-gray-400"}`}>
						<Star size={20} fill={currentSong.isFavorite ? "currentColor" : "none"} />
					</button>
				</h2>
				<p className="text-sm text-gray-600 mt-1">{currentSong.artist}</p>
			</div>
			<div className="flex justify-between items-center mb-6">
				<button className="text-gray-600 hover:text-gray-800 focus:outline-none" onClick={handlePrevious}>
					<ChevronLeft size={24} />
				</button>
				<div className="relative w-48 h-48">
					<div className="absolute inset-0 rounded-full bg-black shadow-lg"></div>
					<div
						className={`absolute inset-2 rounded-full overflow-hidden shadow-inner`}
						style={{
							transform: `rotate(${rotation}deg)`,
						}}
					>
						<img src={currentSong.coverImageUrl!} alt={`${currentSong.title} cover`} className="w-full h-full object-cover" />
					</div>
					<div className="absolute top-1/2 left-1/2 w-12 h-12 bg-gray-200 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-inner z-10"></div>
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
			<div className="flex justify-center space-x-4 mt-4">
				<button className={`focus:outline-none ${playbackMode === "sequential" ? "text-green-500" : "text-gray-500"}`} onClick={() => handlePlaybackModeChange("sequential")} title="순차 재생">
					<ListOrdered size={20} />
				</button>
				<button className={`focus:outline-none ${playbackMode === "random" ? "text-green-500" : "text-gray-500"}`} onClick={() => handlePlaybackModeChange("random")} title="랜덤 재생">
					<Shuffle size={20} />
				</button>
				<button className={`focus:outline-none ${showPlaylist ? "text-blue-500" : "text-gray-500"}`} onClick={() => setShowPlaylist(!showPlaylist)} title="재생 목록">
					<List size={20} />
				</button>
				<button className={`focus:outline-none ${showOnlyFavorites ? "text-yellow-500" : "text-gray-500"}`} onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} title="즐겨찾기만 보기">
					<Star size={20} fill={showOnlyFavorites ? "currentColor" : "none"} />
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
					event.target.setVolume(volume);
				}}
				onStateChange={handlePlayerStateChange}
				ref={playerRef}
			/>

			{showPlaylist && (
				<div className="max-h-60 overflow-y-auto mb-4">
					{getPlaylistItems().map((song, index) => (
						<div key={song.id} className={`p-2 flex items-center justify-between ${song.isCurrentSong ? "bg-green-400" : "hover:bg-gray-200"}`}>
							<div className="cursor-pointer flex-grow" onClick={() => handleSongSelect(index)}>
								<p className="font-semibold">{song.title}</p>
								<p className="text-sm text-gray-600">{song.artist}</p>
							</div>
						</div>
					))}
				</div>
			)}

			<div className="mt-4 pt-2 border-t border-gray-300 text-xs text-gray-500">
				<div className="flex justify-between items-center">
					<span>© 2024 RueHan's Music</span>
					<button onClick={toggleFooterInfo} className="focus:outline-none text-gray-500 hover:text-gray-700">
						<Info size={16} />
					</button>
				</div>
				{showFooterInfo && (
					<div className="mt-2 space-y-1">
						<p>제작 시작: 2024년 8월 27일</p>
						<p>제작자: RueHan</p>
						<p>사용 기술: React, TypeScript, YouTube API</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default MP3Player;
