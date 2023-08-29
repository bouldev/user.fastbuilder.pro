import loginTheme from "../../theme/special/login";
import m from "mithril";
import API from "../../api/api";
import Utils from "../../utils/utils";

let rg={
	inProgress: false,
	stage: 1,
	captchaRand: Math.random(),
	usernameValue: "",
	passwordValue: "",
	captchaValue: "",
	mailboxAddress: "",
	errorMessage: "",
	oninit: ()=>{
		rg.inProgress=false;
		rg.stage=1;
		rg.usernameValue="";
		rg.passwordValue="";
		rg.mailboxAddress="";
		rg.errorMessage="";
	},
	view: (vnode)=>{
		return m(loginTheme.login_frame,
			m("div.lowin-box.lowin-login",
				m("div.lowin-box-inner",
					m("form-login.form",
						m("p", "重置密码"),
						m("p", "您的新密码将经由邮箱发送给您。"),
						rg.errorMessage?m("p", {style:{color:"red"}}, rg.errorMessage):null,
						rg.stage==1?
						[
							m("div.lowin-group",
								m("input.lowin-input",{placeholder:"",type:"text",id:"username-input-id",readonly:rg.inProgress,oninput:(e)=>{rg.usernameValue=e.target.value;},value:rg.usernameValue}),
								m("label",{for:"username-input-id"}, "用户名")
							),
							m("div.lowin-group",
								m("input.lowin-input",{placeholder:"",type:"text",id:"password-input-id",readonly:rg.inProgress,oninput:(e)=>{rg.passwordValue=e.target.value;},value:rg.passwordValue}),
								m("label",{for:"password-input-id"}, "邮箱")
							),
							m("img", {style:{"background-color":"white"},src:"/api/v2/3/get-captcha.web?rand="+rg.captchaRand}),
							m("div.lowin-group",
								m("input.lowin-input",{placeholder:"",type:"text",id:"captcha-input-id",readonly:rg.inProgress,oninput:(e)=>{rg.captchaValue=e.target.value;},value:rg.captchaValue}),
								m("label",{for:"captcha-input-id"}, "验证码")
							),
						]:
						[
							m("p", "已成功重置密码："+rg.usernameValue),
							m("p", "您的新密码已经经由邮件发送给您。")
						],
						m("div.lowin-buttondiv",
							rg.stage==1?m("button.lowin-btn", {
								disabled: rg.inProgress,
								onclick: (e)=>{
									e.preventDefault();
									rg.errorMessage="";
									rg.inProgress=true;
									if(rg.stage==1){
										if(rg.captchaValue.length!=12) {
											rg.inProgress=false;
											rg.errorMessage="验证码错误";
											rg.captchaRand=Math.random();
											return;
										}
										if(rg.usernameValue.length==0 || rg.passwordValue.length==0){
											rg.inProgress=false;
											rg.errorMessage="用户名或邮箱不能为空";
											rg.captchaRand=Math.random();
											return;
										}
										(async ()=>{
											let res=await API.ResetPassword(rg.usernameValue, rg.passwordValue, rg.captchaValue);
											rg.captchaRand=Math.random();
											if(!res.success){
												rg.inProgress=false;
												rg.errorMessage=res.message;
												m.redraw();
												return;
											}
											rg.stage=2;
											rg.inProgress=false;
											m.redraw();
											//rg.oninit();
											//m.route.set("/router/enter");
											return;
											rg.mailboxAddress=res.mailboxAddress;
											rg.stage=2;
											rg.inProgress=false;
											let intv=setInterval(()=>{
												if(rg.stage!=2){
													clearInterval(intv);
													return;
												}
												rg.checkRegisterStatus(false);
											}, 2500);
											m.redraw();
										})();
										return;
									}
								}
							}, rg.stage==1?"重置密码":""):null
						),
						m("div.text-foot",
							m("a", {href:"#!/login",onclick:(e)=>{
								e.preventDefault();
								m.route.set("/login");
							}}, "登录")
						)
					)
				)
			)
		);
	}
};

export default rg;

