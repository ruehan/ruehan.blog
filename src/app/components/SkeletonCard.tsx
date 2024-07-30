export default function SkeletonCard() {
	return (
		<div className="animate-pulse bg-[#F1F2FF] rounded-xl overflow-hidden">
			<div className="bg-gray-300 h-[160px] w-full"></div>
			<div className="p-4">
				<div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
				<div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
				<div className="flex gap-2 mt-2">
					<div className="h-3 bg-gray-300 rounded-full w-16"></div>
					<div className="h-3 bg-gray-300 rounded-full w-16"></div>
				</div>
				<div className="h-3 bg-gray-300 rounded w-1/4 mt-2"></div>
			</div>
		</div>
	);
}
