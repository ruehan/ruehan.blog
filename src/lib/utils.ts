import moment from "moment";

export function formatDate(date: any) {
	const createdAt = moment(date);
	const formattedDate = createdAt.format("YYYY년 MM월 DD일 HH시 mm분");

	return formattedDate;
}
