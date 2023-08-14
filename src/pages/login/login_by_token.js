import loginTheme from "../../theme/special/login";
import m from "mithril";
import API from "../../api/api";
import Utils from "../../utils/utils";

let login_by_token_page={
	loginFailed_reason: "",
	userbannedfor: "",
	tokenValue: "",
	mfaValue: "",
	inProgress: false,
	goingtouc: false,
	oninit:()=>{
		login_by_token_page.userbannedfor="";
		login_by_token_page.loginFailed_reason="";
		login_by_token_page.inProgress=false;
		login_by_token_page.goingtouc=false;
		login_by_token_page.tokenValue="";
		login_by_token_page.mfaValue="";
	},
	view:(vnode)=>{
		return m(loginTheme.login_frame, 
			m("div.lowin-box.lowin-login",
				m("div.lowin-box-inner",
					m("form.login-form",
						m("p", "登录到 FastBuilder 用户中心 (Token)"),
						m({
							view: (vnode)=>{
								if(login_by_token_page.loginFailed_reason.length==0) {
									return null;
								}
								return m("p", {style:{color:"red"}}, login_by_token_page.loginFailed_reason);
							}
						}),
						m("div.lowin-group",
							m("input.lowin-input",{placeholder:"",type:"text",id:"token-input-id",readonly:login_by_token_page.inProgress,oninput:(e)=>{login_by_token_page.tokenValue=e.target.value;},value:login_by_token_page.tokenValue}),
							m("label",{for:"token-input-id"}, "FBToken")
						),
						m("div.lowin-group",
							m("input.lowin-input",{placeholder:"",type:"text",id:"mfa-input-id",readonly:login_by_token_page.inProgress,oninput:(e)=>{login_by_token_page.mfaValue=e.target.value;},value:login_by_token_page.mfaValue}),
							m("label",{for:"mfa-input-id"}, ["双重验证 ", m("b",{style:"color:red;"},"(若未设置则禁止使用 FBToken 登录)")])
						),
						m("div.lowin-buttondiv",
							m("button.lowin-btn", {
								disabled: login_by_token_page.inProgress,
								class: (login_by_token_page.goingtouc)?["back-fill"]:[],
								onclick:(e)=>{
									e.preventDefault();
									login_by_token_page.inProgress=true;
									API.LoginByToken(login_by_token_page.tokenValue,login_by_token_page.mfaValue).then((res)=>{
										if(!res.success) {
											if(res.banned) {
												m.route.set("/login/banned", {reason:res.reason});
												return;
											}
											login_by_token_page.loginFailed_reason=res.message;
											login_by_token_page.inProgress=false;
											m.redraw();
											Utils.FinishLogin(res);
											return;
										}
										login_by_token_page.goingtouc=true;
										m.redraw();
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
									m.route.set("/login");
								}
							}, "登录"),
							m("br"),m("hr"),
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

export default login_by_token_page;
