import React, { useEffect, useRef, useState, useCallback } from "react";

interface YouTubePlayerProps {
	videoId: string;
	onReady: (event: any) => void;
	onStateChange: (state: number) => void;
	onProgressChange: (progress: number) => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, onReady, onStateChange, onProgressChange }) => {
	const playerRef = useRef<any>(null);
	const [isPlayerReady, setIsPlayerReady] = useState(false);

	const initializePlayer = useCallback(() => {
		console.log("YouTubePlayer: Creating player with video ID:", videoId);
		playerRef.current = new window.YT.Player("youtube-player", {
			height: "360",
			width: "640",
			videoId: videoId,
			playerVars: {
				playsinline: 1,
				controls: 0,
			},
			events: {
				onReady: handleReady,
				onStateChange: handleStateChange,
				onError: (event: any) => {
					console.error("YouTubePlayer: Error occurred", event.data);
				},
			},
		});
	}, [videoId, onReady, onStateChange]);

	useEffect(() => {
		if (!window.YT) {
			const tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			const firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

			window.onYouTubeIframeAPIReady = initializePlayer;
		} else {
			initializePlayer();
		}

		return () => {
			if (playerRef.current) {
				playerRef.current.destroy();
			}
		};
	}, [initializePlayer]);

	const handleReady = (event: any) => {
		console.log("YouTubePlayer: Player is ready");
		setIsPlayerReady(true);
		onReady(event);
	};

	const handleStateChange = (event: any) => {
		console.log("YouTubePlayer: State changed to", event.data);
		onStateChange(event.data);
	};

	useEffect(() => {
		let intervalId: NodeJS.Timeout;
		if (isPlayerReady && playerRef.current) {
			intervalId = setInterval(() => {
				const currentTime = playerRef.current.getCurrentTime() || 0;
				const duration = playerRef.current.getDuration() || 1;
				const progress = (currentTime / duration) * 100;
				onProgressChange(progress);
			}, 1000);
		}
		return () => clearInterval(intervalId);
	}, [isPlayerReady, onProgressChange]);

	return (
		<div
			id="youtube-player"
			style={{
				opacity: 0,
				width: "10px",
				height: "10px",
				position: "fixed",
				bottom: "10px",
				left: "10px",
			}}
		/>
	);
};

export default YouTubePlayer;
