"use client";

import { useState } from "react";
import { getYouTubeInfo } from "./actions";
import Image from "next/image";
import { createMusic } from "./actions";
import { useRouter } from "next/navigation";

export default function RegisterMusic() {
	// const router = useRouter();
	const [formData, setFormData] = useState({
		title: "",
		artist: "",
		album: "",
		releaseYear: "",
		duration: "",
		genre: "",
		audioUrl: "",
		coverImageUrl: "",
	});

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const router = useRouter();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleYouTubeUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const url = e.target.value;
		if (url.includes("youtube.com") || url.includes("youtu.be")) {
			setIsLoading(true);
			try {
				const info = await getYouTubeInfo(url);
				setFormData((prev) => ({
					...prev,
					title: info.title,
					artist: info.artist,
					duration: info.duration.toString(),
					releaseYear: info.releaseYear ? info.releaseYear.toString() : "",
					coverImageUrl: info.coverImageUrl,
					audioUrl: url,
				}));
			} catch (error) {
				console.error("Failed to fetch YouTube info:", error);
				alert("YouTube 정보를 가져오는데 실패했습니다. 올바른 URL인지 확인해주세요.");
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const form = new FormData();
		Object.entries(formData).forEach(([key, value]) => {
			form.append(key, value);
		});

		try {
			const result = await createMusic(form);
			if (result.success) {
				router.push("/music-list");
			} else {
				setError("음악 등록에 실패했습니다. 다시 시도해주세요.");
			}
		} catch (error) {
			console.error("Error submitting form:", error);
			setError("서버 오류가 발생했습니다. 나중에 다시 시도해주세요.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto mt-10 p-6 bg-white shadow-md rounded-lg max-w-2xl">
			<h1 className="text-3xl font-bold mb-6 text-center">음악 등록</h1>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label htmlFor="audioUrl" className="block mb-2 font-semibold">
						YouTube URL
					</label>
					<input
						type="url"
						id="audioUrl"
						name="audioUrl"
						value={formData.audioUrl}
						onChange={(e) => {
							handleInputChange(e);
							handleYouTubeUrlChange(e);
						}}
						className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
						required
					/>
				</div>
				{isLoading && <p className="text-center text-blue-500">YouTube 정보를 불러오는 중...</p>}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="title" className="block mb-2 font-semibold">
							제목
						</label>
						<input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2 border rounded focus:ring focus:ring-blue-300" required />
					</div>
					<div>
						<label htmlFor="artist" className="block mb-2 font-semibold">
							아티스트
						</label>
						<input type="text" id="artist" name="artist" value={formData.artist} onChange={handleInputChange} className="w-full p-2 border rounded focus:ring focus:ring-blue-300" required />
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="album" className="block mb-2 font-semibold">
							앨범
						</label>
						<input type="text" id="album" name="album" value={formData.album} onChange={handleInputChange} className="w-full p-2 border rounded focus:ring focus:ring-blue-300" />
					</div>
					<div>
						<label htmlFor="releaseYear" className="block mb-2 font-semibold">
							발매년도
						</label>
						<input
							type="number"
							id="releaseYear"
							name="releaseYear"
							value={formData.releaseYear}
							onChange={handleInputChange}
							className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
							min="1900"
							max={new Date().getFullYear()}
						/>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="duration" className="block mb-2 font-semibold">
							재생 시간 (초)
						</label>
						<input
							type="number"
							id="duration"
							name="duration"
							value={formData.duration}
							onChange={handleInputChange}
							className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
							min="1"
							required
						/>
					</div>
					<div>
						<label htmlFor="genre" className="block mb-2 font-semibold">
							장르
						</label>
						<input type="text" id="genre" name="genre" value={formData.genre} onChange={handleInputChange} className="w-full p-2 border rounded focus:ring focus:ring-blue-300" />
					</div>
				</div>
				<div>
					<label htmlFor="coverImageUrl" className="block mb-2 font-semibold">
						커버 이미지 URL
					</label>
					<input type="url" id="coverImageUrl" name="coverImageUrl" value={formData.coverImageUrl} onChange={handleInputChange} className="w-full p-2 border rounded focus:ring focus:ring-blue-300" />
				</div>
				{formData.coverImageUrl && (
					<div className="mt-4">
						<h3 className="font-semibold mb-2">커버 이미지 미리보기:</h3>
						<div className="relative w-48 h-48 mx-auto">
							<Image src={formData.coverImageUrl} alt="Cover Image Preview" layout="fill" objectFit="cover" className="rounded" />
						</div>
					</div>
				)}
				<button type="submit" className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-300">
					등록하기
				</button>
			</form>
		</div>
	);
}
