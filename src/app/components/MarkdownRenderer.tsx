"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github.css"; // 코드 하이라이팅 스타일 추가
import Link from "next/link";
import Modal from "./Modal";
import { Stream } from "@cloudflare/stream-react";
import getDetails from "../actions";

interface MarkdownRendererProps {
	content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [url, setUrl] = useState<string>("");
	const [size, setSize] = useState<{ width: number; height: number }>({
		width: 0,
		height: 0,
	});

	const openModal = async (url: string) => {
		const response = await getDetails(url.slice(7));

		const videoId = url.slice(7);

		if (response.success && response.data) {
			const { width, height } = response.data.input;

			// Call the function to calculate size
			calSize(width, height);

			// Log the dimensions
			console.log(width, height);

			// Update state
			setUrl(videoId);
			setIsOpen(true);
		} else {
			// Handle the case where the response is not successful or data is undefined
			console.error(
				"Failed to get video details or data is undefined:",
				response
			);
			// You might want to show an error message to the user or handle the error in some way
		}
	};

	const calSize = (width: number, height: number) => {
		let w = 0;
		let h = 0;

		if (width > height) {
			w = (width * 2) / 10;
			h = (height * 2) / 10;
		} else if (width < height) {
			if (height < 2000) {
				w = (width * 4) / 10;
				h = (height * 4) / 10;
			} else {
				w = (width * 2) / 10;
				h = (height * 2) / 10;
			}
		}

		setSize({ width: w, height: h });
	};

	const components: Components = {
		a: ({ node, ...props }) => {
			const href = props.href || "";

			if (href.startsWith("/video")) {
				return (
					<div
						onClick={() => openModal(href)}
						className="cursor-pointer text-blue-500"
					>
						[영상] {props.children}
					</div>
				);
			}
		},
	};

	return (
		<>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[
					rehypeSlug,
					rehypeAutolinkHeadings,
					rehypeHighlight,
					rehypeRaw,
				]}
				components={components}
			>
				{content}
			</ReactMarkdown>
			{isOpen ? (
				<Modal isOpen={true} onClose={() => setIsOpen(false)}>
					{/* <iframe
						src={`https://customer-3g1yzvjsoktzwfrw.cloudflarestream.com/${url}/watch`}
						width="100%"
						height="100%"
					></iframe> */}
					{/* <video
						src={`https://customer-3g1yzvjsoktzwfrw.cloudflarestream.com/${url}/watch`}
					></video> */}
					<Stream
						controls
						volume={0}
						responsive={false}
						width={size.width.toString()}
						height={size.height.toString()}
						src={url}
						className="flex"
					></Stream>
				</Modal>
			) : null}
		</>
	);
};

export default MarkdownRenderer;
