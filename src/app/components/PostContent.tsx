"use client";

import React, { useEffect, useState } from "react";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";

export interface TocItem {
	id: string;
	text: string;
	level?: number;
}

interface PostContentProps {
	content: string;
	toc: TocItem[];
}

const PostContent: React.FC<PostContentProps> = ({ content, toc }) => {
	const [tocItems, setTocItems] = useState<TocItem[]>(toc);
	const [activeTocId, setActiveTocId] = useState<string | null>(null);

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
					<MarkdownRenderer content={content} />
				</div>
			</div>
		</div>
	);
};

export default PostContent;
