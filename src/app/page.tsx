import prisma from "@/lib/prisma";
import MarkdownRenderer from "./components/MarkdownRenderer";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

async function getPost() {
	const post = await prisma.post.findMany({
		orderBy: {
			id: "desc",
		},
		include: {
			tags: true,
		},
	});

	return post;
}

async function getTags() {
	const tags = await prisma.tag.findMany({});

	return tags;
}

function getNameById(tags: any, id: any) {
	const tag = tags.find((tag: any) => tag.id === id);
	return tag ? tag.name : null;
}

export default async function Home() {
	const posts = await getPost();
	const tags = await getTags();

	return (
		<main className="p-4 w-full flex flex-col items-center justify-center">
			{posts.map((post) => (
				<Link
					href={`/post/${post.id}`}
					key={post.id}
					className="text-center m-4 w-[90%] md:w-[600px] h-48 rounded-xl flex h-[200px] bg-[#fafdfc]"
				>
					<Image
						alt="Thumbnail"
						width={300}
						height={300}
						src={
							"https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg/652cd57b-c0af-45f1-2c75-0d9f1a5ec700/public"
						}
						className="hidden md:block md:size-[200px] bg-blue-100 rounded-xl md:flex md:justify-center md:items-center"
					></Image>
					<div className="grid grid-rows-4 p-4 w-fit">
						<div className="text-xl flex justify-start items-center font-bold">
							{post.title}
						</div>
						<div>2</div>
						<div className="flex items-center">
							<div className="flex gap-2 justify-start">
								{post.tags.map((tag) => (
									<span
										key={tag.postId}
										className="tag bg-red-100 text-xs font-bold rounded-full p-[5px]"
									>
										{getNameById(tags, tag.tagId)}
									</span>
								))}
							</div>
						</div>
						<div className="flex justify-start items-center text-sm">
							{formatDate(post.createdAt)}
						</div>
					</div>
				</Link>
			))}
		</main>
	);
}
