"use client";

import React, { useEffect, useState } from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import { formatDate, generateRandomKey } from "@/lib/utils";
import ColorThief from "colorthief";

export interface TocItem {
	id: string;
	text: string;
	level?: number;
}

interface PostContentProps {
	content: string;
	post: any;
	tags: any;
	toc: TocItem[];
	thumbnail: string;
}

function getNameById(tags: any, id: any) {
	const tag = tags.find((tag: any) => tag.id === id);
	return tag ? tag.name : null;
}

const getContrastYIQ = (rgb: number[]) => {
	const [r, g, b] = rgb;
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;

	return yiq >= 128 ? "black" : "white";
};

const PostContent: React.FC<PostContentProps> = ({
	content,
	toc,
	post,
	tags,
	thumbnail,
}) => {
	const [tocItems, setTocItems] = useState<TocItem[]>(toc);
	const [activeTocId, setActiveTocId] = useState<string | null>(null);
	const [textColor, setTextColor] = useState<string>("white");

	useEffect(() => {
		const img = new Image();

		img.crossOrigin = "Anoymous";
		img.src = thumbnail;
		img.onload = () => {
			const colorThief = new ColorThief();
			const dominantColor = colorThief.getColor(img);
			const textColor = getContrastYIQ(dominantColor);
			setTextColor(textColor);
		};
	}, [thumbnail]);

	useEffect(() => {
		const generateToc = () => {
			const contentElement = document.getElementById("content-render");
			if (!contentElement) return;

			const headers = contentElement.querySelectorAll("h1, h2, h3, h4");
			const newTocItems: TocItem[] = [];

			headers.forEach((header) => {
				const level = parseInt(header.tagName[1], 10); // h1, h2, h3, h4에서 숫자 추출
				newTocItems.push({
					id: header.id,
					text: header.textContent || "",
					level,
				});
			});

			setTocItems(newTocItems);
		};

		generateToc();
	}, [content]);

	const handleTocClick = (id: string) => {
		const targetElement = document.getElementById(id);
		if (targetElement) {
			setActiveTocId(id);
			targetElement.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<div className="flex">
			<div className="sticky left-0 top-16 overflow-scroll h-fit max-h-[95vh] hidden md:block w-1/4 p-4">
				<ul className="toc">
					{tocItems.map((item) => (
						<li
							key={item.id}
							className={`toc-h${item.level} ${
								item.id === activeTocId ? "text-blue-700 font-bold" : ""
							}`}
						>
							<a
								href={`#${item.id}`}
								onClick={(e) => {
									e.preventDefault();
									handleTocClick(item.id);
								}}
							>
								{item.text}
							</a>
						</li>
					))}
				</ul>
			</div>
			<div className="w-full md:w-3/4 p-4">
				<div id="content-render" className="markdown">
					<div
						className="w-full h-72 bg-gray-100 flex flex-col justify-end p-8 gap-4"
						style={{
							backgroundImage: `url(
								${thumbnail}
							)`,
							backgroundSize: "cover",
							backgroundRepeat: "no-repeat",
							backgroundPosition: "center",
							color: textColor,
						}}
					>
						<div className="text-3xl font-bold">{post.title}</div>
						<div>
							{post.tags.map((tag: any) => (
								<span
									key={generateRandomKey()}
									className="tag text-sm font-bold rounded-full p-[5px]"
								>
									{getNameById(tags, tag.tagId)}
								</span>
							))}
						</div>
						<div className="font-bold text-xs">
							{formatDate(post.updatedAt)}
						</div>
					</div>
					<MarkdownRenderer content={content} />
				</div>
			</div>
		</div>
	);
};

export default PostContent;
