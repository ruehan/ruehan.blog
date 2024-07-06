"use server";

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const postSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	content: z.string().min(1, { message: "Content is required" }),
	format_tags: z
		.array(z.string())
		.min(1, { message: "At least one tag is required" }),
	id: z.number().min(1),
});

export async function getPost(id: number) {
	const post = await prisma.post.findUnique({
		where: {
			id: id,
		},
		include: {
			tags: true,
		},
	});

	return post;
}
export async function getTags() {
	const tags = await prisma.tag.findMany({});

	return tags;
}

export async function editPost(prevState: any, formData: FormData) {
	const data = {
		title: formData.get("title") as string,
		content: formData.get("content") as string,
		format_tags: formData.getAll("format_tags") as string[],
		id: Number(formData.get("id")),
	};

	const result = postSchema.safeParse(data);

	if (!result.success) {
		return result.error.flatten();
	} else {
		try {
			// 각 태그의 고유한 이름을 기반으로 태그를 가져오거나 생성합니다.
			const tags = await Promise.all(
				result.data.format_tags.map(async (tag) => {
					const existingTag = await prisma.tag.findUnique({
						where: { name: tag },
					});

					if (existingTag) {
						return existingTag;
					} else {
						return prisma.tag.create({
							data: { name: tag },
						});
					}
				})
			);

			// 포스트를 업데이트하고 새로운 태그를 연결합니다.
			const post = await prisma.post.update({
				where: {
					id: result.data.id,
				},
				data: {
					title: result.data.title,
					content: result.data.content,
					tags: {
						deleteMany: {}, // 기존 태그 연결을 제거합니다.
						create: tags.map((tag) => ({
							tag: {
								connect: {
									id: tag.id,
								},
							},
						})),
					},
				},
			});

			if (post) {
				// 성공적으로 업데이트된 경우 리디렉션 또는 다른 작업을 수행합니다.
				// redirect("/");
			}
		} catch (error) {
			console.error("Error updating post:", error);
			throw new Error("Failed to update post");
		}
	}
}
