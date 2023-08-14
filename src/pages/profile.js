import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 448 512"><path d="M313.6 304c-28.7 0-42.5 16-89.6 16-47.1 0-60.8-16-89.6-16C60.2 304 0 364.2 0 438.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-25.6c0-74.2-60.2-134.4-134.4-134.4zM400 464H48v-25.6c0-47.6 38.8-86.4 86.4-86.4 14.6 0 38.3 16 89.6 16 51.7 0 74.9-16 89.6-16 47.6 0 86.4 38.8 86.4 86.4V464zM224 288c79.5 0 144-64.5 144-144S303.5 0 224 0 80 64.5 80 144s64.5 144 144 144zm0-240c52.9 0 96 43.1 96 96s-43.1 96-96 96-96-43.1-96-96 43.1-96 96-96z"></path></svg>`;

let profilePage={
	gamenameinputcontent: "",
	isgamenamesetfailed: false,
	monthly_plan_duration: 0,
	slots: [],
	helpername: "",
	helpername_set_error: "",
	helperuserbtntitle: "",
	helperloaded: false,
	helperRealnameUrl: "",
	helperCreated: false,
	helperDefaultButtonWorking: false,
	acceptWorldChat: false,
	phoenix_otp: "",
	phoenix_otp_displayOrdered: false,
	//combineUserError: "",
	changePassword_working: false,
	//combineUser_currentUserPassword: "",
	//combineUser_targetUserPassword: "",
	//combineUser_targetUsername: "",
	gamename_apply_btn_working: false,
	changePassword_inputs: ["","",""],
	//omegaCloudActivated: false,
	//omegaCloudNoKoRu: 0,
	//omegaCloudJoinInProgress: false,
	binded_mail: null,
	email_bind_val: "",
	email_bind_captcha_val: "",
	email_bind_working: false,
	bot_linkCode: "",
	bot_linkCode_displayOrdered: false,
	is_commercial_2022: false,
	is_2fa_enabled: false,
	is_2fa_in_progress: false,
	captchaRand: 0,
	user_points: 0,
	rate_limit_waiving_in_progress:false,
	nemcbind_inputs: ["", ""],
	nemcbind_status: false,
	oninit: async ()=>{
		profilePage.captchaRand=Math.random();
		profilePage.is_2fa_in_progress=false;
		let generalInfo=await API.FetchProfileGeneral();
		profilePage.is_2fa_enabled=generalInfo.is_2fa;
		profilePage.bot_linkCode=generalInfo.blc;
		profilePage.gamenameinputcontent=generalInfo.cn_username;
		profilePage.slots=generalInfo.slots;
		profilePage.user_points=generalInfo.points||0;
		profilePage.nemcbind_status=generalInfo.nemcbind_status;
		profilePage.phoenix_otp=generalInfo.phoenix_otp;
		if(generalInfo.binded_mail) {
			profilePage.binded_mail=generalInfo.binded_mail;
		}else{
			profilePage.binded_mail=null;
		}
		profilePage.monthly_plan_duration=generalInfo.monthly_plan_duration;
		m.redraw();
		let helperInfo=await API.GetHelperStatus();
		profilePage.helpername=helperInfo.username;
		profilePage.helperCreated=helperInfo.set;
		profilePage.helperRealnameUrl=helperInfo.realname_addr||"";
		if(helperInfo.realname_addr||profilePage.helperCreated||profilePage.helpername||helperInfo.set===false) {
			profilePage.helperloaded=true;
		}
		m.redraw();
	},
	view: (vnode)=>{
		let slotControls=[];
		for(let n in profilePage.slots) {
			let num=parseInt(n);
			let i=profilePage.slots[n];
			if(!i.walked&&!i.canchange) {
				if(i.locked) {
					i.sid+="|固定slot，不可修改";
				}else{
					i.sid+=`|${i.ato}天后方可修改`;
				}
				i.walked=true;
			}
			slotControls.push(m("tr",
				m("td",
					m(frame.doClassReplace("input.userProfile-form-input.form-input.ember-text-field.ember-view"), {
						value: profilePage.slots[num].sid,
						disabled: !profilePage.slots[num].canchange,
						oninput:(e)=>{
							profilePage.slots[num].sid=e.target.value;
						}
					})
				),
				m("td", i.locked?"固定":"可变"),
				m("td",
					i.canchange?m(frame.button, {
						disabled: profilePage.slots[num].isProcessing,
						onclick: (e)=>{
							e.preventDefault();
							profilePage.slots[num].isProcessing=true;
							(async()=>{
								let confirmation=await frame.question("提示", `您正将槽位内容更改为"${profilePage.slots[num].sid}"`);
								if(!confirmation) {
									profilePage.slots[num].isProcessing=false;
									m.redraw();
									return;
								}
								let res=await API.SaveSlot(profilePage.slots[num].slotid,profilePage.slots[num].sid,false);
								if(!res.success) {
									await frame.showAlert("错误","未能应用操作："+res.message);
									profilePage.slots[num].isProcessing=false;
									m.redraw();
									return;
								}
								profilePage.slots=res.slots;
								m.redraw();
							})();
						}
					}, "保存"):null,
					i.locked&&!i.canchange ? m(frame.button, {
						disabled: profilePage.slots[num].isProcessing,
						onclick: (e)=>{
							e.preventDefault();
							profilePage.slots[num].isProcessing=true;
							frame.question("警告", "确定要删除这个槽位吗?",true).then(async(sel)=>{
								if(!sel) {
									profilePage.slots[num].isProcessing=false;
									m.redraw();
									return;
								}
								await API.SaveSlot(profilePage.slots[num].slotid,"",true);
								profilePage.slots[num].isProcessing=false;
								profilePage.oninit();
							});
						}
					}, "删除"):null
				)
			));
		}
		return m(frame.frame, {pageName:"用户信息" ,pageIcon},
			m(frame.section, {title: "游戏名"},
				profilePage.isgamenamesetfailed?m("p",{style:{color:"red"}},"设置失败"):null,
				m(frame.sectionGeneralText, "在此处设置客户端默认游戏名，可以不设置。"),
				m(frame.form,
					m(frame.formInput, {
						value: profilePage.gamenameinputcontent,
						oninput: (e)=>{
							profilePage.gamenameinputcontent=e.target.value;
						}
					}, "游戏名")
				),
				m(frame.button, {
					disabled: profilePage.gamename_apply_btn_working,
					onclick:(e)=>{
						e.preventDefault();
						profilePage.gamename_apply_btn_working=true;
						(async function(){
							let res=await API.SaveClientUsername(profilePage.gamenameinputcontent);
							if(!res.success) {
								profilePage.gamename_apply_btn_working=false;
								profilePage.isgamenamesetfailed=true;
								return m.redraw();
							}
							profilePage.gamename_apply_btn_working=false;
							profilePage.gamenameinputcontent=res.namearray[0];
							return m.redraw();
						})();
					}
				},
				"应用")
			),
			m(frame.section, {title: "Points"},
				m("p", "100 pts = 1 CNY"),
				m("p", ["剩余 Points: ", m("b", {style:"color:blue;"}, profilePage.user_points.toString())]),
				m(frame.button, {
					onclick: ()=>{
						window.open(`https://api.fastbuilder.pro/local/cgi/exchange_points?secret=${API.GetAPISecret()}`);
					}
				}, "兑换")
			),
			m(frame.section, {title: "月额 Plan"},
				profilePage.is_commercial_2022?m("p",{style:{color:"red"}},"由于您的账号是商业账号，在有效期过期后数日后将会被删除。"):null,
				m("p", profilePage.monthly_plan_duration===-1?"永久":`剩余 ${profilePage.monthly_plan_duration} 天有效`)
			),
			m(frame.section, {title: "租赁服绑定"},
				m(frame.sectionGeneralText, "请在下方列表中设定您的常用租赁服，每个位置(slot)均在设置后1个月内不可变。您仅可以进入已在这里绑定的租赁服。"),
				m(frame.sectionGeneralText, "slot 可自商城购买。"),
				m(frame.form,
					m("div.userProfile-form-item",
						m("table",
							m("tr",m("th", "服务器号"),m("th", "类型"),m("th", "操作")),
							slotControls
						)
					)
				)
			),
			m(frame.section, {title: "fbtoken"},
				m(frame.sectionGeneralText, "fbtoken 是 PhoenixBuilder 用于登入至您的 FastBuilder 用户中心账户的凭证。"),
				m(frame.sectionGeneralText, "点击下方按钮获取。"),
				m(frame.button, {
					onclick: (e)=>{
						location.href=API.GetAPI("get_phoenix_token");
					}
				}, "获取")
			),
			m(frame.section, {title: "辅助用户"},
				!profilePage.helperloaded?m("p","请稍候，正在加载"):
				[
					m({
						view: (vnode)=>{
							if(profilePage.helpername_set_error.length===0)return null;
							return m("p",{style:{color:"red"}},
								profilePage.helpername_set_error);
						}
					}),
					m(frame.sectionGeneralText, [
						"辅助用户是用于进入您的租赁服完成操作的",
						m("b", "机器人用户"),
						"。",
						"辅助用户之创建是 PhoenixBuilder 正常工作的必要条件。",
						"当您创建辅助用户后，可能需要刷新页面才可进行网易实名操作。"
					]),
					profilePage.helperCreated&&profilePage.helperRealnameUrl.length===0 ?m(frame.formInput, {
						value: profilePage.helpername,
						oninput: (e)=>{
							profilePage.helpername=e.target.value;
						}
					}, "辅助用户名称"):null,
					profilePage.helperRealnameUrl.length===0?m(frame.button, {
						disabled: profilePage.helperDefaultButtonWorking,
						onclick: (e)=>{
							e.preventDefault();
							profilePage.helpername_set_error="";
							profilePage.helperDefaultButtonWorking=true;
							(async function(){
								//if(profilePage.helperCreated) {
									let res=await API.ChangeHelperNameOrCreateHelper(profilePage.helpername);
									if(!res.success) {
										if(res.verify_url) {
											await frame.showAlert("网易验证码验证", "本次操作需要完成网易验证码验证，点击 OK 后将跳转至验证页面。");
											window.open(res.verify_url);
											//frame.showIframe("网易验证码验证",res.verify_url);
										}
										profilePage.helpername_set_error=res.message;
										profilePage.helperDefaultButtonWorking=false;
										m.redraw();
										return;
									}
									profilePage.helperDefaultButtonWorking=false;
									if(res.need_realname) {
										profilePage.helperloaded=false;
										m.redraw();
										let helperInfo=await API.GetHelperStatus();
										profilePage.helpername=helperInfo.username;
										profilePage.helperCreated=helperInfo.set;
										profilePage.helperRealnameUrl=helperInfo.realname_addr;
										profilePage.helperloaded=true;
									}
									m.redraw();
								//}

							})();
						}
					}, profilePage.helperCreated? "更改昵称" : "创建辅助用户") :
					m(frame.abutton, {
						href: profilePage.helperRealnameUrl,
						target: "_blank"
					}, "网易实名认证")
				]
			),
			m(frame.section, {title: "双重验证"},
				m(frame.sectionGeneralText, "双重验证可以防止未经授权的人登入你的账号。双重验证使用密码器生成的一次性密码。"),
				m(frame.button, {
					disabled: profilePage.is_2fa_in_progress,
					onclick: ()=> {
						if(!profilePage.is_2fa_enabled) {
							profilePage.is_2fa_in_progress=true;
							(async()=>{
								let inf=await API.Kickstart2FA();
								profilePage.is_2fa_in_progress=false;
								if(!inf.success) {
									return frame.showAlert("错误", inf.message);
								}
								let auth_code=await frame.getInput("启用双重验证",[
									m("p", "请使用 Google Authenticator (或任意密码器) 扫描以下二维码"),
									m("div", m("img", {src:inf.qrcode})),
									m("p", "或者输入这段文字:"),
									m("p", m("b", inf.plainkey)),
									m("p", "完成后，你会看到对应验证码，请将其输入到下方文本框内。")
								], "验证码", false, false);
								if(auth_code===false) {
									return;
								}
								profilePage.is_2fa_in_progress=true;
								m.redraw();
								let fin_req=await API.FinishRegistering2FA(auth_code);
								profilePage.is_2fa_in_progress=false;
								if(!fin_req.success) {
									return frame.showAlert("错误", fin_req.message);
								}
								profilePage.is_2fa_enabled=true;
								await frame.showAlert("成功", "您再次登录时将被要求输入验证码。");
							})();
						}else{
							(async()=>{
								let conf=await frame.question("关闭二重验证", "确认关闭二重验证？", true);
								if(!conf)
									return;
								profilePage.is_2fa_in_progress=true;
								m.redraw();
								let req_res=await API.TurnOff2FA();
								profilePage.is_2fa_in_progress=false;
								if(!req_res.success) {
									m.redraw();
									return;
								}
								profilePage.is_2fa_enabled=false;
								m.redraw();
								return;
							})();
						}
						
					}
				}, profilePage.is_2fa_enabled?"禁用":"启用")
			),
			m(frame.section, {title: "密码"},
				m(frame.sectionGeneralText, "更改用户中心的登录密码。"),
				m(frame.formInput, {
					isPassword: true,
					value: profilePage.changePassword_inputs[0],
					oninput: (e)=>{
						profilePage.changePassword_inputs[0]=e.target.value;
					}
				}, "原密码"),
				m(frame.formInput, {
					isPassword: true,
					value: profilePage.changePassword_inputs[1],
					oninput: (e)=>{
						profilePage.changePassword_inputs[1]=e.target.value;
					}
				}, "新密码"),
				m(frame.formInput, {
					isPassword: true,
					value: profilePage.changePassword_inputs[2],
					oninput: (e)=>{
						profilePage.changePassword_inputs[2]=e.target.value;
					}
				}, "确认新密码"),
				m(frame.button, {
					disabled: profilePage.changePassword_working,
					onclick: (e)=>{
						e.preventDefault();
						if(profilePage.changePassword_inputs[1]!==profilePage.changePassword_inputs[2]) {
							return frame.showAlert("错误", "新密码两次输入不一致。");
						}
						profilePage.changePassword_working=true;
						(async function(){
							let res=await API.ChangePassword(profilePage.changePassword_inputs[0], profilePage.changePassword_inputs[1]);
							if(!res.success) {
								frame.showAlert("错误", res.message);
								profilePage.changePassword_working=false;
								m.redraw();
								return;
							}
							profilePage.changePassword_working=false;
							m.route.set("/login");
							m.redraw();
						})();
					}
				}, "更改")
			),
			m(frame.section, {title: "PhoenixBuilder 一次性密码"},
				m(frame.sectionGeneralText, "这是你用于登录 PhoenixBuilder 的一次性密码，你不能使用用户中心密码登录 PhoenixBuilder 。"),
				m(frame.sectionGeneralText, "Token 登录不受此影响。"),
				m("p", profilePage.phoenix_otp_displayOrdered?profilePage.phoenix_otp:"***"),
				m(frame.button, {
					onclick: (e) => {
						profilePage.phoenix_otp_displayOrdered=(!profilePage.phoenix_otp_displayOrdered);
					}
				}, profilePage.phoenix_otp_displayOrdered?"隐藏密码":"显示密码")
			),
			m(frame.section, {title: "机器人链接口令"},
				m(frame.sectionGeneralText, "您可以使用以下链接口令来链接此账号到机器人。请注意：这将给予其对您账号完整的控制权！"),
				m("p", profilePage.bot_linkCode_displayOrdered?profilePage.bot_linkCode:m("b", "***")),
				m(frame.button, {
					onclick: (e) => {
						profilePage.bot_linkCode_displayOrdered=(!profilePage.bot_linkCode_displayOrdered);
					}
				}, profilePage.bot_linkCode_displayOrdered?"隐藏链接口令":"显示链接口令")
			),
			/*m(frame.section, {title: "下载登录日志"},
				m(frame.sectionGeneralText, "点击下方按钮以下载你的账户的登录日志。"),
				m(frame.button, {
					onclick:()=>{location.href="/api/v2/3/api.web?jump_to=download_account_log";}
				}, "下载")
			),*/
			/*m(frame.section, {title: "邮箱绑定"},
				m(frame.sectionGeneralText, "绑定邮箱以便接收通知或找回密码。"),
				profilePage.binded_mail?
				m("p", ["已绑定邮箱: ",profilePage.binded_mail]):
				m("p", "未绑定邮箱"),
				m(frame.formInput, {
					isPassword: false,
					value: profilePage.email_bind_val,
					oninput: (e)=>{
						profilePage.email_bind_val=e.target.value;
					}
				}, "邮箱"),
				m("img", {src:"/api/v2/3/get-captcha.web?rand="+encodeURIComponent(String(profilePage.captchaRand))}),
				m(frame.formInput, {
					value: profilePage.email_bind_captcha_val,
					oninput: (e)=>{
						profilePage.email_bind_captcha_val=e.target.value;
					}
				}, "验证码"),
				m(frame.button, {
					disabled: profilePage.email_bind_working,
					onclick: ()=>{
						if(!profilePage.email_bind_val) {
							return frame.showAlert("错误", "请输入邮箱");
						}
						profilePage.email_bind_working=true;
						(async ()=>{
							let r=await API.BindEmail(profilePage.email_bind_val, profilePage.email_bind_captcha_val);
							await frame.showAlert("message", r.message);
							profilePage.email_bind_working=false;
							profilePage.captchaRand=Math.random();
							m.redraw();
						})()
					}
				}, "绑定")
			),
			m(frame.section, {"title": "Omega Cloud (Beta)"},
				m(frame.sectionGeneralText, "在我们的服务器上为您运行 Omega 服务。"),
				profilePage.omegaCloudActivated?[
					m("p", "您已经拥有测试资格"),
					m("p", ["请您前往",m("a", {href:"https://st.fastbuilder.pro"}, "https://st.fastbuilder.pro"),"进行操作。"]),
					m("p", "用户名为您的用户中心用户名，密码为加入测试时分配给您的密码，若忘记，可以点击下方按钮重置密码。"),
					m(frame.button, {
						disabled: profilePage.omegaCloudJoinInProgress,
						onclick: ()=>{
							profilePage.omegaCloudJoinInProgress=true;
							(async()=>{
								let res=await API.EnrollOmegaCloud();
								await frame.showAlert("提示",res.message);
								profilePage.omegaCloudJoinInProgress=false;
								m.redraw();
							})();
						}
					}, "重置密码")
				]:[
					m("p", "此服务在测试阶段免费，但随时可能终止。"),
					profilePage.omegaCloudNoKoRu==0?
					m("p", "测试名额被占满了，以后再说吧～"):
					[
						m("p", ["还剩", profilePage.omegaCloudNoKoRu, "个名额可用，点按下方按钮可以立刻免费参加测试。"]),
						m(frame.button, {
							disabled: profilePage.omegaCloudJoinInProgress,
							onclick: ()=>{
								profilePage.omegaCloudJoinInProgress=true;
								(async()=>{
									let res=await API.EnrollOmegaCloud();
									await frame.showAlert("提示",res.message);
									profilePage.omegaCloudJoinInProgress=false;
									if(res.success) {
										profilePage.omegaCloudActivated=true;
									}
									m.redraw();
								})();
							}
						}, "加入测试")
					]
				]
			),*/
			/*m(frame.section, {title: "绑定网易游戏账号"},
				profilePage.nemcbind_status?
				[
					m("p", "已绑定"),
					m(frame.button, {
						onclick:async()=>{
							if(await frame.question("查看信息", "此操作需要登入你的网易账号，继续操作将会挤占登录，要继续吗？", true)) {
								m.route.set("/my-rental-servers");
							}
						}
					}, "我的服务器")
				]:
				[
					m(frame.formInput, {
						value: profilePage.nemcbind_inputs[0],
						oninput: (e)=>{
							profilePage.nemcbind_inputs[0]=e.target.value;
						}
					}, "邮箱"),
					m(frame.formInput, {
						isPassword: true,
						value: profilePage.nemcbind_inputs[1],
						oninput: (e)=>{
							profilePage.nemcbind_inputs[1]=e.target.value;
						}
					}, "密码"),
					m(frame.button, {
						onclick:async(e)=>{
							e.preventDefault();
							let ret=await API.BindNeteaseAccount(profilePage.nemcbind_inputs[0], profilePage.nemcbind_inputs[1]);
							profilePage.nemcbind_inputs=["",""];
							if(!ret.success) {
								await frame.showAlert("error", ret.message);
								if(ret.verify_url) {
									window.open(ret.verify_url);
								}
								return;
							}
							profilePage.nemcbind_status=true;
							m.redraw();
						}
					}, "绑定")
				]
			),*/
			m(frame.section, {title: "付款记录"},
				m(frame.button, {
					onclick:(e)=>{
						e.preventDefault();
						m.route.set("/my-payment-log");
					}
				}, "查询付款记录")
			)/*,
			m(frame.section, {"title": "注销用户"},
				m(frame.sectionGeneralText, [
					"此功能将您的信息从数据库中",
					m("b","完全"),
					"移除。"
				]),
				m(frame.button, {
					onclick:(e)=>{
						e.preventDefault();
						m.route.set("/remove-user");
					}
				},"前往注销")
			)*/
		);
	}
};

export default profilePage;



