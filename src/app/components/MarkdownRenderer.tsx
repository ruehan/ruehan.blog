import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import "highlight.js/styles/github.css"; // 코드 하이라이팅 스타일 추가

interface MarkdownRendererProps {
	content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
	return (
		<ReactMarkdown
			children={content}
			remarkPlugins={[remarkGfm]}
			rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
		/>
	);
};

export default MarkdownRenderer;
