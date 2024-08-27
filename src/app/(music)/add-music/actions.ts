"use server";
import prisma from "@/lib/prisma";
import { google } from "googleapis";

const youtube = google.youtube({
	version: "v3",
	auth: process.env.YOUTUBE_API_KEY,
});

export async function getYouTubeInfo(url: string) {
	try {
		// URL에서 비디오 ID 추출
		const videoId = extractVideoId(url);
		if (!videoId) {
			throw new Error("Invalid YouTube URL");
		}

		const response = await youtube.videos.list({
			part: ["snippet", "contentDetails"],
			id: [videoId],
		});

		const videoInfo = response.data.items?.[0];
		if (!videoInfo) {
			throw new Error("Video not found");
		}

		const duration = convertDuration(videoInfo.contentDetails?.duration || "");

		return {
			title: videoInfo.snippet?.title || "",
			artist: videoInfo.snippet?.channelTitle || "",
			duration,
			releaseYear: videoInfo.snippet?.publishedAt ? new Date(videoInfo.snippet.publishedAt).getFullYear() : null,
			coverImageUrl: videoInfo.snippet?.thumbnails?.high?.url || "",
			audioUrl: url,
		};
	} catch (error) {
		console.error("Failed to fetch YouTube info:", error);
		throw new Error("Failed to fetch YouTube info");
	}
}

function extractVideoId(url: string): string | null {
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = url.match(regExp);
	return match && match[2].length === 11 ? match[2] : null;
}

function convertDuration(duration: string): number {
	const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
	let hours = 0,
		minutes = 0,
		seconds = 0;
	if (match) {
		if (match[1]) hours = parseInt(match[1].slice(0, -1));
		if (match[2]) minutes = parseInt(match[2].slice(0, -1));
		if (match[3]) seconds = parseInt(match[3].slice(0, -1));
	}
	return hours * 3600 + minutes * 60 + seconds;
}

export async function createMusic(formData: FormData) {
	const title = formData.get("title") as string;
	const artist = formData.get("artist") as string;
	const album = formData.get("album") as string;
	const releaseYear = parseInt(formData.get("releaseYear") as string);
	const duration = parseInt(formData.get("duration") as string);
	const genre = formData.get("genre") as string;
	const audioUrl = formData.get("audioUrl") as string;
	const coverImageUrl = formData.get("coverImageUrl") as string;

	try {
		const newSong = await prisma.song.create({
			data: {
				title,
				artist,
				album,
				releaseYear: isNaN(releaseYear) ? null : releaseYear,
				duration,
				genre,
				audioUrl,
				coverImageUrl,
			},
		});

		return { success: true, song: newSong };
	} catch (error) {
		console.error("Failed to create song:", error);
		return { success: false, error: "Failed to create song" };
	}
}
