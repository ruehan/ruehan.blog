import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useFormState } from "react-dom";
import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import EditPostContent from "@/app/components/EditPostContent";
import { getImages, getPost, getTags } from "./actions";

interface PostFormData {
	title: string;
	content: string;
	tags: string;
}

function getNameById(tags: any, id: any) {
	const tag = tags.find((tag: any) => tag.id === id);
	return tag ? tag.name : null;
}

function getUrlById(urls: any, id: any) {
	const url = urls.find((url: any) => url.id === id);
	return url ? url.url : null;
}

export default async function EditPost({ params }: { params: { id: string } }) {
	const data = await getPost(Number(params.id));
	const tags = await getTags();
	const images = await getImages();
	let tagArr: any = [];
	let urlArr: any = [];

	// console.log(data);

	if (!data) {
		return null;
	}

	if (data.tags) {
		data.tags.forEach((tag) => {
			tagArr.push(getNameById(tags, tag.tagId));
		});
	}

	if (data.images) {
		data.images.forEach((url) => {
			urlArr.push(getUrlById(images, url.imageId));
		});
	}

	console.log(urlArr);

	if (tagArr.length === 0) {
		return null;
	}

	return (
		<EditPostContent
			id={params.id}
			content={data.content}
			tagArr={tagArr}
			title={data.title}
			thumbnail={urlArr.filter((url: string) => url.startsWith("tn"))}
		></EditPostContent>
	);
}
