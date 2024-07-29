"use client";

import MarkdownRenderer from "@/app/components/MarkdownRenderer";
import { getPost } from "@/app/edit-post/[id]/actions";
import { useEffect, useState } from "react";

export default function Presentation({ params }: { params: { id: string } }) {
	const [slides, setSlides] = useState<any>([]);
	const [currentSlide, setcurrentSlide] = useState<number>(0);

	useEffect(() => {
		async function fetchContent() {
			try {
				const data = await getPost(Number(params.id));

				// console.log(data);

				if (data) {
					const slideContent = data.content.split("---");

					console.log(slideContent);

					setSlides(slideContent);
				}
			} catch (err) {
				console.log(err);
			}
		}

		fetchContent();
	}, [params.id]);

	const nextSlide = () => {
		if (currentSlide < slides.length - 1) {
			setcurrentSlide(currentSlide + 1);
		}
	};

	const prevSlide = () => {
		if (currentSlide > 0) {
			setcurrentSlide(currentSlide - 1);
		}
	};

	return (
		<div className="">
			<div className=" h-fit max-h-screen markdown p-12">
				<MarkdownRenderer content={slides[currentSlide]}></MarkdownRenderer>
			</div>
			<div className="w-full bg-gray-200 p-4 text-lg flex justify-around fixed bottom-0">
				<button onClick={prevSlide} disabled={currentSlide === 0}>
					Previous
				</button>
				<span>
					{currentSlide + 1} / {slides.length}
				</span>
				<button
					onClick={nextSlide}
					disabled={currentSlide === slides.length - 1}
				>
					Next
				</button>
			</div>
		</div>
	);
}
