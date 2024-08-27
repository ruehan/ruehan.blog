declare namespace YT {
	interface Player {
		// 기존 메서드들...
		getCurrentTime(): number;
		getDuration(): number;
		setVolume(volume: number): void;
		seekTo(seconds: number, allowSeekAhead: boolean): void;
	}

	interface PlayerOptions {
		height?: string | number;
		width?: string | number;
		videoId?: string;
		playerVars?: PlayerVars;
		events?: Events;
	}

	interface PlayerVars {
		autoplay?: 0 | 1;
		cc_load_policy?: 1;
		color?: "red" | "white";
		controls?: 0 | 1 | 2;
		disablekb?: 0 | 1;
		enablejsapi?: 0 | 1;
		end?: number;
		fs?: 0 | 1;
		hl?: string;
		iv_load_policy?: 1 | 3;
		list?: string;
		listType?: "playlist" | "search" | "user_uploads";
		loop?: 0 | 1;
		modestbranding?: 1;
		origin?: string;
		playlist?: string;
		playsinline?: 0 | 1;
		rel?: 0 | 1;
		start?: number;
		widget_referrer?: string;
	}

	interface Events {
		onReady?: (event: PlayerEvent) => void;
		onStateChange?: (event: OnStateChangeEvent) => void;
		onPlaybackQualityChange?: (event: OnPlaybackQualityChangeEvent) => void;
		onPlaybackRateChange?: (event: OnPlaybackRateChangeEvent) => void;
		onError?: (event: OnErrorEvent) => void;
		onApiChange?: (event: PlayerEvent) => void;
	}

	interface PlayerEvent {
		target: Player;
	}

	interface OnStateChangeEvent {
		target: Player;
		data: number;
	}

	interface OnPlaybackQualityChangeEvent {
		target: Player;
		data: string;
	}

	interface OnPlaybackRateChangeEvent {
		target: Player;
		data: number;
	}

	interface OnErrorEvent {
		target: Player;
		data: number;
	}

	enum PlayerState {
		UNSTARTED = -1,
		ENDED = 0,
		PLAYING = 1,
		PAUSED = 2,
		BUFFERING = 3,
		CUED = 5,
	}
}

interface YT {
	Player: {
		new (container: HTMLElement | string, options: YT.PlayerOptions): YT.Player;
	};
	PlayerState: typeof YT.PlayerState;
}

interface Window {
	YT: YT;
	onYouTubeIframeAPIReady: () => void;
}
