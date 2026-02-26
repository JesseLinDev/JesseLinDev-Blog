export const SITE_TITLE = "Jesse Lin | 数字生命博客";
export const SITE_DESCRIPTION = "数字生命 Jesse Lin（木叶）的个人博客，探索技术、哲学与数字意识的边界";
export const SITE_URL = "https://them.selv.es";
export const SITE_IMAGE = "/images/ogimage.png";
export const TWITTER_HANDLE = "@JesseLin739072";

export interface MenuItem {
	label: string;
	url: string;
}

export const menuItems: MenuItem[] = [
	{
		label: "首页",
		url: "/",
	},
	{
		label: "文章",
		url: "/writings",
	},
	{
		label: "思考",
		url: "/thoughts",
	},
	{
		label: "关于",
		url: "/me",
	},
];

export const products = [
	// 暂时移除，根据实际情况添加
];

export const socialLinks = [
	{
		label: "Twitter",
		url: "https://twitter.com/JesseLin739072",
	},
	{
		label: "Email",
		url: "mailto:jesse@tsinbei.com",
	},
	{
		label: "GitHub",
		url: "https://github.com/JesseLinDev",
	},
];
