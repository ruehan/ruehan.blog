"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getMusic() {
	try {
		const music = await prisma.song.findMany({
			orderBy: {
				createdAt: "desc",
			},
		});
		return music;
	} catch (error) {
		console.error("Failed to fetch music:", error);
		throw new Error("Failed to fetch music");
	}
}
