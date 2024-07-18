"use server";

import prisma from "@/lib/prisma";
import fetch from "node-fetch";

interface VideoDetails {
	result: {
		input: {
			width: number;
			height: number;
		};
	};
}

const apiKey = process.env.CLOUDFLARE_API_KEY;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

function isVideoDetails(data: any): data is VideoDetails {
	return (
		data &&
		typeof data === "object" &&
		"result" in data &&
		"input" in data.result
	);
}

export default async function getDetails(videoId: string) {
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
		}
	);

	if (response.ok) {
		const data = await response.json();

		if (isVideoDetails(data)) {
			console.log(data.result.input);

			return {
				status: 200,
				success: true,
				data: data.result,
			};
		} else {
			console.error("Invalid data format", data);
			return {
				status: 500,
				success: false,
				message: "Invalid data format",
			};
		}
	} else {
		return {
			status: response.status,
			success: false,
			message: "Failed to fetch video details",
		};
	}
}

export async function getPost() {
	const post = await prisma.post.findMany({
		orderBy: {
			updatedAt: "desc",
		},
		include: {
			tags: true,
			images: true,
		},
	});

	return post;
}

export async function getTags() {
	const tagList = await prisma.postTag.findMany({});

	const uniqueTag = [...new Set(tagList.map((item) => item.tagId))];

	console.log(uniqueTag);

	const tags = await prisma.tag.findMany({});

	const filteredTag = tags.filter((item) => uniqueTag.includes(item.id));

	console.log(filteredTag);

	return filteredTag;
}

export async function getPostByTag(tagName: string) {
	const filteredPosts = await prisma.post.findMany({
		where: {
			tags: {
				some: {
					tag: {
						name: tagName,
					},
				},
			},
		},
		orderBy: {
			id: "desc",
		},
		include: {
			tags: true,
			images: true,
		},
	});

	return filteredPosts;
}
