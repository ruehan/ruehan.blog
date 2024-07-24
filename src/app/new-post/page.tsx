"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useFormState } from "react-dom";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { getUploadUrl } from "../edit-post/[id]/actions";
import { createPost } from "./actions";

interface PostFormData {
	title: string;
	content: string;
	tags?: string;
	id: string;
	thumbnail: string;
}

const extractImageUrls = (markdown: string): string[] => {
	const regex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
	const matches = [];
	let match;

	while ((match = regex.exec(markdown)) !== null) {
		matches.push(match[1]);
	}

	return matches;
};

const NewPost: React.FC = () => {
	const { register, handleSubmit, watch } = useForm<PostFormData>();
	const [watchContent, setWatchContent] = useState<string>("");
	const watchTags = watch("tags");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const [imageUrls, setImageUrls] = useState<string[]>([]);

	const [imageId, setImageId] = useState("");
	const [uploadUrl, setUploadUrl] = useState("");
	const [preview, setPreview] = useState("");

	const interceptAction = (_: any, formData: FormData) => {
		const tags = watchTags!.split(",").map((tag) => tag.trim());
		tags.forEach((tag) => {
			formData.append("format_tags", tag);
		});

		console.log(imageUrls);

		imageUrls.forEach((image, idx) => {
			formData.append("images", image);
		});

		return createPost(_, formData);
	};

	const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const {
			target: { files },
		} = event;

		if (!files) {
			return;
		}

		const file = files[0];
		const url = URL.createObjectURL(file);

		const { success, result } = await getUploadUrl();

		if (success) {
			const { id, uploadURL } = result;

			setUploadUrl(uploadURL);
			setImageId(id);

			const cloudflareForm = new FormData();

			cloudflareForm.append("file", file);

			try {
				const uploadResponse = await fetch(uploadURL, {
					method: "POST",
					body: cloudflareForm,
				});

				console.log("Response status:", uploadResponse.status);
				const responseData = await uploadResponse.json();
				console.log("Response data:", responseData);

				if (uploadResponse.ok) {
					const photoUrl = `https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg/${id}/public`;
					console.log("Uploaded photo URL:", photoUrl);

					// 마크다운 형식으로 변환하여 textarea에 추가
					const markdown = `![image](${photoUrl})`;
					console.log(markdown);
					setWatchContent((prevContent) => prevContent + "\n" + markdown);
					// setValue("content", watchContent);
					if (textareaRef.current) {
						textareaRef.current.value =
							textareaRef.current.value + "\n" + markdown;
					}

					setPreview(url);
				} else {
					console.error("Failed to upload image:", responseData);
				}
			} catch (error) {
				console.error("Fetch error:", error);
			}

			const photoUrl = `https://imagedelivery.net/CJyrB-EkqcsF2D6ApJzEBg/${id}/public`;

			console.log(photoUrl);
		}
	};

	const handleInput = () => {
		if (textareaRef.current && formRef.current) {
			setWatchContent(textareaRef.current.value);
			const formHeight = formRef.current.clientHeight;
			const buttonHeight =
				formRef.current.querySelector("button")?.clientHeight || 0;
			const maxHeight = formHeight - buttonHeight - 48 - 192;
			textareaRef.current.style.maxHeight = `${maxHeight}px`;

			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${Math.min(
				textareaRef.current.scrollHeight,
				maxHeight
			)}px`;

			const urls = extractImageUrls(textareaRef.current.value);
			setImageUrls(urls);
		}
	};

	useEffect(() => {
		handleInput();
	}, []);

	const [state, dispatch] = useFormState(interceptAction, null);

	return (
		<main className="w-full h-screen flex overflow-hidden">
			<form
				className="w-full h-full flex-col p-8 relative md:full"
				ref={formRef}
				action={dispatch}
			>
				<div>
					<input
						id="thumbnail"
						type="text"
						{...register("thumbnail", { required: true })}
						placeholder="썸네일 URL"
						className="w-full h-12 p-4 font-bold"
						name="thumbnail"
					/>
				</div>
				<div>
					<input
						id="title"
						type="text"
						{...register("title", { required: true })}
						placeholder="제목을 입력하세요."
						className="w-full h-24 font-bold text-3xl p-4"
						name="title"
					/>
				</div>
				<div>
					<input
						id="tags"
						type="text"
						{...register("tags", { required: true })}
						placeholder="태그를 입력하세요. ex) 코딩, 베이스, 러닝"
						className="w-full h-12 p-4 font-bold"
						name="tags"
					/>
				</div>
				<div>
					<textarea
						id="content"
						{...register("content", { required: true })}
						placeholder="당신의 경험을 적어주세요."
						className="w-full p-4"
						name="content"
						onInput={handleInput}
						ref={textareaRef}
						value={watchContent}
						onChange={(e) => setWatchContent(e.target.value)}
					/>
				</div>
				<button
					type="submit"
					className="w-full md:w-1/2 h-16 p-4 fixed bottom-0 left-0 shadow-xl bg-white shadow-black z-10"
				>
					Create Post
				</button>
			</form>
			<div className="hidden md:block md:w-full  bg-[#fafdfc] p-8 overflow-scroll markdown">
				<MarkdownRenderer content={watchContent}></MarkdownRenderer>
			</div>
			<label
				htmlFor="photo"
				className="bg-blue-200 size-[200px] fixed bottom-0 right-0 rounded-full"
				style={{
					backgroundImage: `url(${preview})`,
					backgroundSize: "cover",
				}}
			></label>
			<input
				id="photo"
				type="file"
				accept="image/*"
				onChange={onImageChange}
				className="hidden"
				// onChange={(e) => handleFileUpload(e, "image")}
			/>
		</main>
	);
};

export default NewPost;
