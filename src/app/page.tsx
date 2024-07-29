"use client";

import { formatDate, generateRandomKey, getNameById } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getImages } from "./edit-post/[id]/actions";
import { useEffect, useState } from "react";
import { getPost, getPostByTag, getTags } from "./actions";
import LoadingSpinner from "./components/Loader";

function getUrlById(urls: any, id: any) {
	const url = urls.find((url: any) => url.id === id);
	return url ? url.url : null;
}

function hasTagId(tags: any, targetTagId: number) {
	return tags.some((tag: any) => tag.tagId === targetTagId);
}

export default function Home() {
	const [posts, setPosts] = useState<any>();
	const [tags, setTags] = useState<any>();
	const [images, setImages] = useState<any>();
	const [selectedTag, setSelectedTag] = useState("전체보기");
	const [loading, setLoading] = useState<boolean>(true);

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
		setLoading(false);
		setSelectedTag(tagName);
		if (tagName === "전체보기") {
			const fetchedPosts = await getPost();
			setPosts(fetchedPosts);
		} else {
			const filteredPosts = await getPostByTag(tagName);
			setPosts(filteredPosts);
		}

		setLoading(true);
	}

	if (!posts || !tags || !loading) {
		return <LoadingSpinner />;
	}

	return (
		<main className="p-[4rem] w-full flex flex-col items-center justify-center">
			<div className="flex justify-center p-2 gap-2 w-full flex-wrap  overflow-scroll fixed bottom-0 z-20 backdrop-blur-sm">
				<button
					onClick={() => handleTagClick("전체보기")}
					className={`tag ${
						selectedTag === "전체보기" ? "bg-blue-200" : "bg-gray-200"
					} text-xs font-bold rounded-full p-[1rem]`}
				>
					전체보기
				</button>
				{tags.map((tag: any) => (
					<button
						key={tag.id}
						onClick={() => handleTagClick(tag.name)}
						className={`tag ${
							selectedTag === tag.name ? "bg-blue-200" : "bg-gray-200"
						} text-xs font-bold rounded-full p-[1rem]`}
					>
						{tag.name}
					</button>
				))}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-8 w-full ">
				{posts.map((post: any) => (
					<Link
						href={
							hasTagId(post.tags, 24) ? `/slide/${post.id}` : `/post/${post.id}`
						}
						key={generateRandomKey()}
						className="text-center  w-full h-fit rounded-xl flex flex-col bg-[#F1F2FF] hover:scale-110 duration-300 flex-nowrap"
					>
						<Image
							alt="Thumbnail"
							width={300}
							height={300}
							src={getThumbNail(post.images)}
							className="bg-blue-100 rounded-t-xl w-full h-[160px]"
							style={{ objectFit: "cover" }}
						></Image>
						<div className="grid grid-rows-4 p-4 w-fit">
							<div className="text-xl w-full flex-nowrap flex justify-start items-center font-bold ">
								{post.title}
							</div>
							<div></div>
							<div className="flex items-center">
								<div className="flex gap-2 justify-start">
									{post.tags.map((tag: any) => (
										<span
											key={generateRandomKey()}
											className="tag bg-[#cfdfee] text-xs font-bold rounded-full p-[5px]"
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
