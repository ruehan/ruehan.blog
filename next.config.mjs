/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		config.resolve.fallback = { fs: false, net: false, tls: false };
		return config;
	},
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
