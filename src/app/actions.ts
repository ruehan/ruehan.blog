"use server";

import prisma from "@/lib/prisma";
import fetch from "node-fetch";

const apiKey = process.env.CLOUDFLARE_API_KEY;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

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
		const videoDetails = await response.json();

		console.log(videoDetails.result.input);

		return {
			status: 200,
			success: true,
			data: videoDetails.result,
		};
	} else {
		return {
			status: 200,
			success: true,
			message: "failed",
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
