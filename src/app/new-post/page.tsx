"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useFormState } from "react-dom";
import { createPost } from "./actions";
import MarkdownRenderer from "../components/MarkdownRenderer";

interface PostFormData {
	title: string;
	content: string;
	tags?: string;
	tagArr?: string[];
	id: string;
}

const NewPost: React.FC = () => {
	const { register, handleSubmit, reset, watch } = useForm<PostFormData>();
	const [watchContent, setWatchContent] = useState<string>("");
	const watchTags = watch("tags");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const [imageUrls, setImageUrls] = useState<string[]>([]);

	const interceptAction = (_: any, formData: FormData) => {
		const tags = watchTags!.split(",").map((tag) => tag.trim());
		// console.log(tags);
		tags.forEach((tag) => {
			formData.append("format_tags", tag);
		});

		imageUrls.forEach((image, idx) => {
			if (idx === 0) {
				formData.append("images", "tn" + image);
			} else {
				formData.append("images", image);
			}
		});

		return createPost(_, formData);
	};

	const handleInput = () => {
		if (textareaRef.current && formRef.current) {
			setWatchContent(textareaRef.current.value);
			const formHeight = formRef.current.clientHeight;
			const buttonHeight =
				formRef.current.querySelector("button")?.clientHeight || 0;
			const maxHeight = formHeight - buttonHeight - 48 - 192; // adjust 48px as padding/margin
			textareaRef.current.style.maxHeight = `${maxHeight}px`;

			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${Math.min(
				textareaRef.current.scrollHeight,
				maxHeight
			)}px`;
		}
	};

	useEffect(() => {
		handleInput();
	}, []);

	const [state, dispatch] = useFormState(interceptAction, null);

	return (
		<main className="w-full h-screen flex overflow-hidden">
			<form
				action={dispatch}
				className="w-full h-full flex-col p-8 relative md:full"
				ref={formRef}
			>
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
		</main>
	);
};

export default NewPost;
