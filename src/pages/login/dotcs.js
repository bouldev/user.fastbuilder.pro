import loginTheme from "../../theme/special/login";
import m from "mithril";
import API from "../../api/api";
import Utils from "../../utils/utils";

let login_by_dotcs_page = {
	loginFailed_reason: "",
	userbannedfor: "",
	usernameValue: "",
	passwordValue: "",
	mfaValue: "",
	inProgress: false,
	goingtouc: false,
	oninit: () => {
		login_by_dotcs_page.usernameValue = "";
		login_by_dotcs_page.userbannedfor = "";
		login_by_dotcs_page.loginFailed_reason = "";
		login_by_dotcs_page.passwordValue = "";
		login_by_dotcs_page.mfaValue = ""; 
		login_by_dotcs_page.inProgress = false;
		login_by_dotcs_page.goingtouc = false;
	},
	view: (vnode) => {
		return m(loginTheme.login_frame,
			m("div.lowin-box.lowin-login",
				m("div.lowin-box-inner",
					m("form.login-form",
						m("p", "登录到 FastBuilder 用户中心"),
						m({
							view: (vnode) => {
								if (login_by_dotcs_page.loginFailed_reason.length == 0) {
									return null;
								}
								return m("p", { style: { color: "red" } }, login_by_dotcs_page.loginFailed_reason);
							}
						}),
						m("div.lowin-group",
							m("input.lowin-input", { placeholder: "", type: "text", id: "username-input-id", readonly: login_by_dotcs_page.inProgress, oninput: (e) => { login_by_dotcs_page.usernameValue = e.target.value; }, value: login_by_dotcs_page.usernameValue }),
							m("label", { for: "username-input-id" }, "DotCS 用户名")
						),
						m("div.lowin-group",
							m("input.lowin-input", { placeholder: "", type: "password", id: "password-input-id", readonly: login_by_dotcs_page.inProgress, oninput: (e) => { login_by_dotcs_page.passwordValue = e.target.value; }, value: login_by_dotcs_page.passwordValue }),
							m("label", { for: "password-input-id" }, "密码")
						),
						m("div.lowin-buttondiv",
							m("button.lowin-btn", {
								disabled: login_by_dotcs_page.inProgress,
								class: (login_by_dotcs_page.goingtouc) ? ["back-fill"] : [],
								onclick: (e) => {
                                    e.preventDefault();
									login_by_dotcs_page.loginFailed_reason = "";
									login_by_dotcs_page.inProgress = true;
									API.Login_DotCS(login_by_dotcs_page.usernameValue, login_by_dotcs_page.passwordValue).then((res) => {
										if (!res.success) {
											if (res.banned) {
												m.route.set("/login/banned", { reason: res.reason, ticket: res.ticket_code });
												return;
											}
											login_by_dotcs_page.loginFailed_reason = res.message || "登录失败，请检查DotCS 用户名或DotCS密码。";
											login_by_dotcs_page.inProgress = false;
											m.redraw();
											return;
										}
										login_by_dotcs_page.goingtouc = true;
										m.redraw();
										Utils.FinishLogin(res);
										m.route.set("/router/enter");
									});
									// e.preventDefault();
									// login_by_dotcs_page.loginFailed_reason = "";
									// login_by_dotcs_page.inProgress = true;
									// API.Login(login_by_dotcs_page.usernameValue, login_by_dotcs_page.passwordValue, login_by_dotcs_page.mfaValue).then((res) => {
									// 	if (!res.success) {
									// 		if (res.banned) {
									// 			m.route.set("/login/banned", { reason: res.reason, ticket: res.ticket_code });
									// 			return;
									// 		}
									// 		login_by_dotcs_page.loginFailed_reason = res.message || "登录失败，请检查用户名或密码。";
									// 		login_by_dotcs_page.inProgress = false;
									// 		m.redraw();
									// 		return;
									// 	}
									// 	login_by_dotcs_page.goingtouc = true;
									// 	m.redraw();
									// 	Utils.FinishLogin(res);
									// 	m.route.set("/router/enter");
									// });
								}
							}, "登录")
						), 
						m("br"), 
						m("div.text-foot",
                            m("p", "请阅读",m("a",{href:"https://zeus.mcppl.cn/doc/fastbuilder_login.html"}, "DotCS 用户协议(FB用户中心篇)"),"和",m("a",{href:"https://zeus.mcppl.cn/doc/fastbuilder_login_privacy_processing.html"}, "DotCS 用户协议-隐私处理(FB用户中心篇)"),"以了解本登录方式的隐私以及各种原因"),
							m("a", {
								href: "#",
								onclick: (e) => {
									e.preventDefault();
									m.route.set("/login/bytoken");
								}
							}, "以 FBToken 登录"),
							m("br"), m("hr"),
							m("a", {
								href: "#",
								onclick: (e) => {
									e.preventDefault();
									m.route.set("/login");
								}
							}, "以 FastBuilder 账户登录"),
							m("br"), m("hr"),
                            
							/*m("a", {
								href:"#",
								onclick:(e)=>{
									e.preventDefault();
									m.route.set("/login/reset_password");
								}
							}, "找回密码"),
							m("br"),m("hr"),*/
							m("a", {
								href: "#",
								onclick: (e) => {
									e.preventDefault();
									m.route.set("/login/register");
								}
							}, "注册 FastBuilder 账户"),
                            
						)
					)
				)
			)
		);
	}
};


export default login_by_dotcs_page;
