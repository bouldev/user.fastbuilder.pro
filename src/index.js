import m from "mithril";
import loginPage from "./pages/login";
import entranceRouter from "./pages/router";
import API from "./api/api"
import $ from "jquery";

window.jQuery=$;
import bootstrap from "bootstrap";

function do_import(alias) {
	switch(alias) {
		case "page_login_by_token":
			return import("./pages/login/login_by_token.js");
		case "page_login_banned":
			return import("./pages/login/banned");
		case "page_announcements":
			return import("./pages/announcements");
		case "page_profile":
			return import("./pages/profile");
		case "page_downloads":
			return import("./pages/downloads");
		case "page_mall":
			return import("./pages/mall");
		case "page_shopping_cart":
			return import("./pages/shopping_cart");
		case "page_cashier":
			return import("./pages/cashier");
		case "page_pay":
			return import("./pages/pay");
		case "page_admin":
			return import("./pages/admin");
		case "page_remove_account":
			return import("./pages/remove_account");
		case "page_login_register":
			return import("./pages/login/register");
		case "page_about":
			return import("./pages/about");
		case "page_theme":
			return import("./pages/theme.js");
		case "page_my_payment_log":
			return import("./pages/my_payment_log.js");
		case "page_contact_us":
			return import("./pages/contact_us.js");
		default:
			throw new Error("UNKNOWN IMPORT");
	}
}

function createCopier(obj) {
	return {
		onmatch: async ()=>{
			return (await do_import(obj)).default;
		}
	};
}

API.StartupInit();

m.route(document.body, "/login", {
	"/login": loginPage,
	"/login/bytoken": createCopier("page_login_by_token"),
	"/login/banned": createCopier("page_login_banned"),
	"/router/enter": entranceRouter,
	"/announcements": createCopier("page_announcements"),
	"/profile": createCopier("page_profile"),
	"/downloads": createCopier("page_downloads"),
	"/mall": createCopier("page_mall"),
	"/shopping_cart": createCopier("page_shopping_cart"),
	"/cashier": createCopier("page_cashier"),
	"/pay": createCopier("page_pay"),
	"/admin": createCopier("page_admin"),
	"/remove-user": createCopier("page_remove_account"),
	"/login/register": createCopier("page_login_register"),
	"/about": createCopier("page_about"),
	"/theme": createCopier("page_theme"),
	"/my-payment-log": createCopier("page_my_payment_log"),
	"/contact-us": createCopier("page_contact_us"),
	//"/login/reset_password": createCopier(resetPasswordPage),
	//"/creative_center": creativeCenterPage
});
