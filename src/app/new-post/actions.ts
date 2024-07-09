"use server";

import { z } from "zod";
import prisma from "../../lib/prisma";
import { redirect } from "next/navigation";

const postSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	content: z.string().min(1, { message: "Content is required" }),
	format_tags: z
		.array(z.string())
		.min(1, { message: "At least one tag is required" }),
	images: z.array(z.string()),
});

export async function createPost(prevState: any, formData: FormData) {
	const data = {
		title: formData.get("title"),
		content: formData.get("content"),
		format_tags: formData.getAll("format_tags"),
		images: formData.getAll("images") as string[],
	};

	const result = postSchema.safeParse(data);

	if (!result.success) {
		// 검증 실패
		return result.error.flatten();
	} else {
		// 검증 성공
		// console.log("Validated data:", result.data);

		const post = await prisma.post.create({
			data: {
				title: result.data.title.toString(),
				content: result.data.content.toString(),
				tags: {
					create: result.data.format_tags.map((tag: any) => ({
						tag: {
							connectOrCreate: {
								where: { name: tag },
								create: { name: tag },
							},
						},
					})),
				},
				images: {
					create: result.data.images.map((image: any) => ({
						image: {
							connectOrCreate: {
								where: { url: image },
								create: { url: image },
							},
						},
					})),
				},
			},
		});

		if (post) {
			redirect("/");
		}
	}
}
