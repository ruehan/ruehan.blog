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
	images: z.array(z.string()),
});

export async function getPost(id: number) {
	const post = await prisma.post.findUnique({
		where: {
			id: id,
		},
		include: {
			tags: true,
			images: true,
		},
	});

	return post;
}
export async function getTags() {
	const tags = await prisma.tag.findMany({});

	return tags;
}

export async function getImages() {
	const images = await prisma.image.findMany({});

	return images;
}

export async function editPost(prevState: any, formData: FormData) {
	const data = {
		title: formData.get("title") as string,
		content: formData.get("content") as string,
		format_tags: formData.getAll("format_tags") as string[],
		id: Number(formData.get("id")),
		images: formData.getAll("images") as string[],
	};

	const result = postSchema.safeParse(data);

	console.log(result);

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

			const deleteImages = await prisma.imageTag.deleteMany({
				where: {
					postId: result.data.id,
				},
			});

			console.log(deleteImages);

			const images = await Promise.all(
				result.data.images.map(async (url) => {
					const existingImage = await prisma.image.findUnique({
						where: { url: url },
					});

					if (existingImage) {
						return existingImage;
					} else {
						return prisma.image.create({
							data: { url: url },
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
					images: {
						deleteMany: {},
						create: images.map((image) => ({
							image: {
								connect: {
									id: image.id,
								},
							},
						})),
					},
				},
			});
		} catch (error) {
			console.error("Error updating post:", error);
			throw new Error("Failed to update post");
		}
	}
}
