import prisma from "@/lib/prisma";

export async function getPost(id: number) {
	const post = await prisma.post.findUnique({
		where: {
			id: id,
		},
	});

	return post;
}
