"use server";

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
