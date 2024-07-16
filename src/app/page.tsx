"use client";

import prisma from "@/lib/prisma";
import MarkdownRenderer from "./components/MarkdownRenderer";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getImages } from "./edit-post/[id]/actions";
import { useEffect, useState } from "react";
import { getPost, getPostByTag, getTags } from "./actions";

export function getNameById(tags: any, id: any) {
	const tag = tags.find((tag: any) => tag.id === id);
	return tag ? tag.name : null;
}

function getUrlById(urls: any, id: any) {
	const url = urls.find((url: any) => url.id === id);
	return url ? url.url : null;
}

export default function Home() {
	// const posts = await getPost();
	// const tags = await getTags();
	// const images = await getImages();

	const [posts, setPosts] = useState<any>();
	const [tags, setTags] = useState<any>();
	const [images, setImages] = useState<any>();
	const [selectedTag, setSelectedTag] = useState("전체보기");

	useEffect(() => {
		async function fetchData() {
			const fetchedPosts = await getPost();
			const fetchedTags = await getTags();
			const fetchedImages = await getImages();
			setPosts(fetchedPosts);
			setTags(fetchedTags);
			setImages(fetchedImages);
		}

		fetchData();
	}, []);

	console.log(posts);
	function getThumbNail(image: any) {
		let urlArr: any = [];

		image.forEach((url: any) => {
			urlArr.push(getUrlById(images, url.imageId));
		});

		const tnStrings = urlArr
			.filter((str: string) => str.startsWith("tn"))
			.map((str: string) => str.slice(2));

		// console.log(tnStrings);

		return tnStrings[0];
	}

	async function handleTagClick(tagName: string) {
		setSelectedTag(tagName);
		if (tagName === "전체보기") {
			const fetchedPosts = await getPost();
			setPosts(fetchedPosts);
		} else {
			const filteredPosts = await getPostByTag(tagName);
			setPosts(filteredPosts);
		}
	}

	if (!posts || !tags) {
		return <div>Loading...</div>;
	}

	return (
		<main className="p-4 w-full flex flex-col items-center justify-center">
			<div className="flex gap-2 mb-4">
				<button
					onClick={() => handleTagClick("전체보기")}
					className={`tag ${
						selectedTag === "전체보기" ? "bg-blue-200" : "bg-gray-200"
					} text-xs font-bold rounded-full p-[5px]`}
				>
					전체보기
				</button>
				{tags.map((tag: any) => (
					<button
						key={tag.id}
						onClick={() => handleTagClick(tag.name)}
						className={`tag ${
							selectedTag === tag.name ? "bg-blue-200" : "bg-gray-200"
						} text-xs font-bold rounded-full p-[5px]`}
					>
						{tag.name}
					</button>
				))}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
				{posts.map((post: any) => (
					<Link
						href={`/post/${post.id}`}
						key={post.id}
						className="text-center  w-full h-fit rounded-xl flex flex-col bg-[#fafdfc]"
					>
						<Image
							alt="Thumbnail"
							width={300}
							height={300}
							src={getThumbNail(post.images)}
							className="w-full bg-blue-100 rounded-t-xl"
						></Image>
						<div className="grid grid-rows-4 p-4 w-fit">
							<div className="text-xl flex justify-start items-center font-bold">
								{post.title}
							</div>
							<div></div>
							<div className="flex items-center">
								<div className="flex gap-2 justify-start">
									{post.tags.map((tag: any) => (
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
								{formatDate(post.updatedAt)}
							</div>
						</div>
					</Link>
				))}
			</div>
		</main>
	);
}
