/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				hostname: "imagedelivery.net",
			},
		],
	},
};

export default nextConfig;
