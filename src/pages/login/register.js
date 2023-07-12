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
	checkRegisterStatus: async (manual)=>{
		let stat=await API.CheckRegister();
		if(!stat.success){
			if(stat.error) {
				alert("注册失败："+stat.error_message);
				rg.inProgress=false;
				rg.stage=1;
				m.redraw();
				return;
			}
			if(manual){
				rg.errorMessage=stat.message;
				rg.inProgress=false;
				m.redraw();
			}
			return;
		}
		rg.oninit();
		m.route.set("/router/enter");
	},
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
						m("p", "注册"),
						//m("p", "新用户的密码将经由邮箱发送给您。"),
						rg.errorMessage?m("p", {style:{color:"red"}}, rg.errorMessage):null,
						rg.stage==1?
						[
							m("div.lowin-group",
								m("input.lowin-input",{placeholder:"",type:"text",id:"username-input-id",readonly:rg.inProgress,oninput:(e)=>{rg.usernameValue=e.target.value;},value:rg.usernameValue}),
								m("label",{for:"username-input-id"}, "用户名")
							),
							m("div.lowin-group",
								m("input.lowin-input",{placeholder:"",type:"password",id:"password-input-id",readonly:rg.inProgress,oninput:(e)=>{rg.passwordValue=e.target.value;},value:rg.passwordValue}),
								m("label",{for:"password-input-id"}, "密码")
							),
							m("img", {style:{"background-color":"white",height:"50px",width:"300px"},src:API.GetAPI("captcha")+"&rand="+rg.captchaRand}),
							m("div.lowin-group",
								m("input.lowin-input",{placeholder:"",type:"text",id:"captcha-input-id",readonly:rg.inProgress,oninput:(e)=>{rg.captchaValue=e.target.value;},value:rg.captchaValue}),
								m("label",{for:"captcha-input-id"}, "验证码")
							),
							m("p", "请阅读",m("a",{href:"https://fastbuilder.pro/privacy-policy.html"}, "隐私策略"),"以了解本服务可能涉及的隐私信息。"),
							m("p", "点击下方注册按钮代表您同意遵守",m("a",{href:"https://fastbuilder.pro/enduser-license.html"}, "用户协议"))
						]:
						[
							m("p", "注册成功："+rg.usernameValue),
							m("p", "您的新密码已经经由邮件发送给您。")
						],
						m("div.lowin-buttondiv",
							rg.stage==1?m("button.lowin-btn", {
								disabled: rg.inProgress,
								onclick: ()=>{
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
											rg.errorMessage="用户名或密码不能为空";
											rg.captchaRand=Math.random();
											return;
										}
										(async ()=>{
											let res=await API.Register(rg.usernameValue, rg.passwordValue, rg.captchaValue);
											rg.captchaRand=Math.random();
											if(!res.success){
												rg.inProgress=false;
												rg.errorMessage=res.message;
												m.redraw();
												return;
											}
											//rg.stage=2;
											rg.inProgress=false;
											m.redraw();
											rg.oninit();
											m.route.set("/router/enter");
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
									}else if(rg.stage==2) {
										rg.checkRegisterStatus(true);
									}
								}
							}, rg.stage==1?"注册":"确认"):null
						),
						m("div.text-foot",
							m("a", {href:"#!/login",onclick:(e)=>{
								e.preventDefault();
								m.route.set("/login");
							}}, "登录")/*,
							rg.stage==1?null:
							[
								m("br"),m("br"),
								m("a", {href:"javascript:void(0)",onclick:()=>{
									rg.stage=1;
									m.redraw();
								}}, "返回")
							]*/
						)
					)
				)
			)
		);
	}
};

export default rg;

