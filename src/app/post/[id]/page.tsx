// app/posts/[id]/page.tsx

import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PostContent, { TocItem } from "@/app/components/PostContent";
import { getImages } from "@/app/edit-post/[id]/actions";

async function getTags() {
	const tags = await prisma.tag.findMany({});

	return tags;
}

function getUrlById(urls: any, id: any) {
	const url = urls.find((url: any) => url.id === id);
	return url ? url.url : null;
}

async function getPost(id: number) {
	const post = await prisma.post.findUnique({
		where: {
			id: id,
		},
		include: {
			tags: true,
			images: true,
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

	return { content, toc: tocItems, post };
}

export default async function PostPage({ params }: { params: { id: string } }) {
	const post = await getPost(Number(params.id));
	const tags = await getTags();
	const images = await getImages();
	let urlArr: any = [];

	if (!post) {
		notFound();
	}

	console.log(post.post.images);

	if (post.post.images) {
		post.post.images.forEach((url) => {
			urlArr.push(getUrlById(images, url.imageId));
		});
	}

	const tnStrings = urlArr
		.filter((str: string) => str.startsWith("tn"))
		.map((str: string) => str.slice(2));

	return (
		<PostContent
			content={post.content}
			toc={post.toc}
			post={post.post}
			tags={tags}
			thumbnail={tnStrings[0]}
		/>
	);
}
