import React from "react";

const LoadingSpinner: React.FC = () => {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
			<div className="text-2xl font-bold animate-spin custom-font">
				Ruehan.blog
			</div>
		</div>
	);
};

export default LoadingSpinner;
