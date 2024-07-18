import moment from "moment";

export function formatDate(date: any) {
	const createdAt = moment(date);
	const formattedDate = createdAt.format("YYYY년 MM월 DD일 HH시 mm분");

	return formattedDate;
}

export function getNameById(tags: any, id: any) {
	const tag = tags.find((tag: any) => tag.id === id);
	return tag ? tag.name : null;
}

export function generateRandomKey() {
	return Math.random().toString(36).substr(2, 9);
}
