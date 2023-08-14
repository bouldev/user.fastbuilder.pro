import loginTheme from "../theme/special/login";
import m from "mithril";
import API from "../api/api";
import Utils from "../utils/utils";

let loginPage={
	loginFailed_reason:"",
	userbannedfor:"",
	usernameValue:"",
	passwordValue:"",
	mfaValue:"",
	inProgress: false,
	goingtouc: false,
	oninit:()=>{
		loginPage.usernameValue="";
		loginPage.userbannedfor="";
		loginPage.loginFailed_reason="";
		loginPage.passwordValue="";
		loginPage.mfaValue="";
		loginPage.inProgress=false;
		loginPage.goingtouc=false;
	},
	view:(vnode)=>{
		return m(loginTheme.login_frame, 
			m("div.lowin-box.lowin-login",
				m("div.lowin-box-inner",
					m("form.login-form",
						m("p", "登录到 FastBuilder 用户中心"),
						m({
							view: (vnode)=>{
								if(loginPage.loginFailed_reason.length==0) {
									return null;
								}
								return m("p", {style:{color:"red"}}, loginPage.loginFailed_reason);
							}
						}),
						m("div.lowin-group",
							m("input.lowin-input",{placeholder:"",type:"text",id:"username-input-id",readonly:loginPage.inProgress,oninput:(e)=>{loginPage.usernameValue=e.target.value;},value:loginPage.usernameValue}),
							m("label",{for:"username-input-id"}, "用户名")
						),
						m("div.lowin-group",
							m("input.lowin-input",{placeholder:"",type:"password",id:"password-input-id",readonly:loginPage.inProgress,oninput:(e)=>{loginPage.passwordValue=e.target.value;},value:loginPage.passwordValue}),
							m("label",{for:"password-input-id"}, "密码")
						),
						m("div.lowin-group",
							m("input.lowin-input",{placeholder:"",type:"password",id:"mfa-input-id",readonly:loginPage.inProgress,oninput:(e)=>{loginPage.mfaValue=e.target.value;},value:loginPage.mfaValue}),
							m("label",{for:"mfa-input-id"}, "双重验证 (若未设置则留空)")
						),
						m("div.lowin-buttondiv",
							m("button.lowin-btn", {
								disabled: loginPage.inProgress,
								class: (loginPage.goingtouc)?["back-fill"]:[],
								onclick:(e)=>{
									e.preventDefault();
									loginPage.loginFailed_reason="";
									loginPage.inProgress=true;
									API.Login(loginPage.usernameValue,loginPage.passwordValue,loginPage.mfaValue).then((res)=>{
										if(!res.success) {
											if(res.banned) {
												m.route.set("/login/banned", {reason:res.reason,ticket:res.ticket_code});
												return;
											}
											loginPage.loginFailed_reason=res.message||"登录失败，请检查用户名或密码。";
											loginPage.inProgress=false;
											m.redraw();
											return;
										}
										loginPage.goingtouc=true;
										m.redraw();
										Utils.FinishLogin(res);
										m.route.set("/router/enter");
									});
								}
							}, "登录")
						),
						m("div.text-foot",
							m("a", {
								href:"#",
								onclick:(e)=>{
									e.preventDefault();
									m.route.set("/login/bytoken");
								}
							}, "以 FBToken 登录"),
							m("br"),m("hr"),
							/*m("a", {
								href:"#",
								onclick:(e)=>{
									e.preventDefault();
									m.route.set("/login/reset_password");
								}
							}, "找回密码"),
							m("br"),m("hr"),*/
							m("a", {
								href:"#",
								onclick:(e)=>{
									e.preventDefault();
									m.route.set("/login/register");
								}
							}, "注册")
						)
					)
				)
			)
		);
	}
};


export default loginPage;
