/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				hostname: "imagedelivery.net",
			},
			{
				hostname: "res.cloudinary.com",
			},
		],
	},
};

export default nextConfig;
