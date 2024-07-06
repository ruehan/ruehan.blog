// app/posts/[id]/page.tsx

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PostContent, { TocItem } from "@/app/components/PostContent";

async function getPost(id: number) {
	const post = await prisma.post.findUnique({
		where: {
			id: id,
		},
	});

	if (!post) {
		return null;
	}

	// Markdown content rendering
	const content = post.content;

	// Generate TOC
	const tocItems: TocItem[] = [];
	const headers = content.match(/(#{1,4})\s(.+)/g);

	if (headers) {
		headers.forEach((header, index) => {
			const id = `header-${index}`;
			const text = header.replace(/(#{1,4})\s/, "");
			tocItems.push({ id, text });
		});
	}

	return { content, toc: tocItems };
}

export default async function PostPage({ params }: { params: { id: string } }) {
	const post = await getPost(Number(params.id));

	if (!post) {
		notFound();
	}

	return <PostContent content={post.content} toc={post.toc} />;
}
