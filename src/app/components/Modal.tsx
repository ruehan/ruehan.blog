"use client";

import ReactDOM from "react-dom";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 "
			onClick={onClose}
		>
			<div
				className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-3xl max-h-[90%] m-12"
				onClick={(e) => e.stopPropagation()} // 클릭 이벤트 전파 중지
			>
				<div className="p-4 flex justify-end">
					<button
						className="text-gray-500 hover:text-gray-700"
						onClick={onClose}
					>
						&times;
					</button>
				</div>
				<div className="p-4">{children}</div>
			</div>
		</div>
	);
};

export default Modal;
