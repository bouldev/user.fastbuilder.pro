import loginTheme from "../../theme/special/login";
import m from "mithril";
import API from "../../api/api";

let intv=null;

let banned_page={
	can_pay: false,
	paired: false,
	pay_error: "",
	pay_fatal: false,
	pay_success: false,
	pay_invoice_id: "",
	ticket_id: "",
	oninit: (vnode)=>{
		banned_page.ticket_id=vnode.attrs.ticket;
		banned_page.can_pay=false;
		banned_page.paired=false;
		banned_page.pay_error="";
		banned_page.pay_fatal=false;
		banned_page.pay_success=false;
		if(intv) {
			clearInterval(intv);
			intv=null;
		}
	},
	onremove: ()=>{
		if(intv) {
			clearInterval(intv);
			intv=null;
		}
	},
	view:(vnode)=>{
		return m(loginTheme.login_frame, 
			m("div.lowin-box.lowin-login",
				m("div.lowin-box-inner",
					m("form.login-form",
						m("p", "登录到 FastBuilder 用户中心"),
						m("p", "￥6 的罚款已被附加到你的账户，理由如以下所示。"),
						m("p", m("b",{style:{color:"red"}},vnode.attrs.reason)),
						m("p", "要继续使用这个账户，你需要缴纳这笔罚款。"),
						!banned_page.can_pay?m("div.lowin-buttondiv",
							m("button.lowin-btn", {
								onclick: async(e)=>{
									e.preventDefault();
									let ticketResp=await API.PayTicket(vnode.attrs.ticket);
									if(!ticketResp.success) {
										alert(ticketResp.message);
										return;
									}
									banned_page.can_pay=true;
									intv=setInterval(dorefresh, 1000);
									m.redraw();
								}
							}, "缴纳罚款"),m("hr")
						):[
							m("p", "您正在支付: 用户协议违反罚款"),
							!banned_page.paired?[
								m("p", "请联系代理并告知其你的用户名，在其确认前请勿支付。"),
								m("p", ["或者：", m("a", {
									href: "https://fs.webapp.codepwn.xyz/new",
									target: "_blank",
									style: { display: "inline-block" }
								}, "自助结算[微信/支付宝] (提供: CodePwn)")]),
								m("p", [m("a", {
									href: "/api/v2/stripe/pay_ticket.web?ticketID="+banned_page.ticket_id
								}, "银行卡结算")])
							]:null,
							banned_page.pay_success?[
								m("p", "支付成功，您的账号已经恢复正常，请点击 [退出登录] 按钮，然后重新登录。")
							]:[
								banned_page.pay_error?m("p", {style:{color:"red"}}, banned_page.pay_error):null,
								banned_page.paired?m("p", {style:{color:"blue"}}, "请支付: ￥6"):null,
								banned_page.pay_fatal?null:[
									!banned_page.pay_success?m("div.lowin-buttondiv",
										m("button.lowin-btn", {
											onclick: async(e)=>{
												e.preventDefault();
												dorefresh(true);
											}
										}, "刷新状态"),m("hr")
									):null
								]
							]
						],
						m("div.lowin-buttondiv",
							m("button.lowin-btn", {
								onclick:(e)=>{
									e.preventDefault();
									m.route.set("/login");
								}
							}, "退出登录")
						)
					)
				)
			)
		);
	}
};

async function dorefresh(manual) {
	let pairInfo=await API.CheckTicketPayment(banned_page.ticket_id);
	if(pairInfo.error) {
		if(intv)clearInterval(intv);
		intv=null;
		alert(pairInfo.error_message);
		banned_page.pay_fatal=true;
		m.redraw();
		return;
	}
	if(!banned_page.paired) {
		if(!pairInfo.paired) {
			if(manual) {
				banned_page.pay_error=pairInfo.message;
				m.redraw();
			}
			return;
		}else{
			banned_page.pay_error="";
			banned_page.paired=true;
			m.redraw();
		}
		manual=false;
	}
	if(!pairInfo.success) {
		if(manual) {
			banned_page.pay_error="尚未成功";
			m.redraw();
		}
	}else{
		banned_page.pay_error="";
		banned_page.pay_success=true;
		clearInterval(intv);
		intv=null;
		m.redraw();
	}
}

export default banned_page;
