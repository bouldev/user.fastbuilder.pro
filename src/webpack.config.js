const path=require("path");

const pages={
	main: "./src/index.js"/*,
	page_about: "./src/pages/about.js",
	page_admin: "./src/pages/admin.js",
	page_announcements: "./src/pages/announcements.js",
	page_cashier: "./src/pages/cashier.js",
	page_downloads: "./src/pages/downloads.js",
	//page_login: "./src/pages/login.js",
	page_login_banned: "./src/pages/login/banned.js",
	page_login_by_token: "./src/pages/login/login_by_token.js",
	page_login_register: "./src/pages/login/register.js",
	page_mall: "./src/pages/mall.js",
	page_pay: "./src/pages/pay.js",
	page_profile: "./src/pages/profile.js",
	page_remove_account: "./src/pages/remove_account.js",
	//page_router: "./src/pages/router.js",
	page_shopping_cart: "./src/pages/shopping_cart.js",
	page_theme: "./src/pages/theme.js"*/
};

module.exports = {
	entry: pages,
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "bin")
	}
};