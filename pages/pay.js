import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M551.991 64H144.28l-8.726-44.608C133.35 8.128 123.478 0 112 0H12C5.373 0 0 5.373 0 12v24c0 6.627 5.373 12 12 12h80.24l69.594 355.701C150.796 415.201 144 430.802 144 448c0 35.346 28.654 64 64 64s64-28.654 64-64a63.681 63.681 0 0 0-8.583-32h145.167a63.681 63.681 0 0 0-8.583 32c0 35.346 28.654 64 64 64 35.346 0 64-28.654 64-64 0-18.136-7.556-34.496-19.676-46.142l1.035-4.757c3.254-14.96-8.142-29.101-23.452-29.101H203.76l-9.39-48h312.405c11.29 0 21.054-7.869 23.452-18.902l45.216-208C578.695 78.139 567.299 64 551.991 64zM208 472c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm256 0c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm23.438-200H184.98l-31.31-160h368.548l-34.78 160z"></path></svg>`;

let intv=null;

let pay={
	info: "",
	isfree: false,
	paired: false,
	paired_notice: "",
	error: "",
	fatal: false,
	success: false,
	showcodepwnpay: false,
	iframeurl: "",
	showingcodepwnpay: false,
	use_point_input: "",
	oninit: async ()=>{
		pay.info="";
		pay.paired=false;
		pay.isfree=false;
		pay.paired_notice="";
		pay.error="";
		pay.showingcodepwnpay=false;
		let payinfo=await API.GetBill();
		if(typeof payinfo!="object")return;
		pay.isfree=payinfo.isfree;
		pay.iframeurl=payinfo.codepwn_pay_url;
		pay.showcodepwnpay=payinfo.codepwn_pay_available;
		pay.can_use_point=payinfo.can_use_point;
		pay.use_point_input="";
		pay.info=payinfo.show.replace(/\n/g,"<br/>");
		m.redraw();
		if(!payinfo.success)return;
		if(intv)clearInterval(intv);
		intv=setInterval(dorefresh,1000);
	},
	onremove: ()=>{
		if(intv) {
			clearInterval(intv);
			intv=null;
		}
	},
	view: (vnode)=>{
		return m(frame.frame, {pageName: "支付", pageIcon},
			m(frame.section, {title:"清单"},
				m("p", m.trust(pay.info))
			),
			pay.can_use_point&&!pay.paired?m("div",
				m("p", "你可以使用 Point 抵价。每 100 Point 可以抵价 ￥1，请输入 100 的倍数。"),
				m(frame.formInput, {
					value: pay.use_point_input,
					oninput: (e)=>{
						pay.use_point_input=e.target.value;
					}
				}),
				m(frame.button, {
					onclick: async ()=>{
						let upr=await API.UsePoints(pay.use_point_input);
						if(upr.success) {
							m.route.set("/router/enter", {to:"/pay"});
						}else{
							frame.showAlert("错误", upr.message);
							return;
						}
					}
				}, "抵价")
			):null,
			!pay.paired?[
				//m("p", "请通过以下方式支付:"),
				//m("p", "请联系代理并告知其你的用户名，在其确认前请勿支付。"),
				pay.showcodepwnpay&&!pay.showingcodepwnpay?m("p", ["或者：",m("a",{
					href: pay.iframeurl,
					target: "_blank",
					style: {
						display: pay.showingcodepwnpay?"none":"inline-block"
					},
					onclick: (e)=>{
						//e.preventDefault();
						//pay.showingcodepwnpay=true;
					}
				}, "自动结算[微信]（提供: CodePwn）")]):null,
				m("br"),m("br")
			]:null,
			pay.isfree&&!pay.success?[
				m("button.btn.btn-primary",{
					onclick: async ()=>{
						let captcha=await frame.getCaptchaInput("输入验证码", "本操作需要输入验证码完成，请输入下方显示的验证码","验证码",false,false);
						let r=await API.RedeemForFree(captcha);
						if(!r.success) {
							frame.showAlert("错误", r.message);
						}
					}
				}, "免费获取"),
				m("br"),
				m("br")
			]:null,
			pay.error?m("p", {style:{color:"red"}}, pay.error):null,
			pay.paired?m("p",{style:{color:"blue"}}, pay.paired_notice):null,
			pay.fatal?null:[
				!pay.success?m(frame.button, {
					onclick: ()=>{
						dorefresh(true);
					}
				}, "刷新状态"):null,
				m("br"),m("br"),
				m("div",
					{
						style: {
							"width": "40%",
							"display": (pay.paired||pay.isfree)?"none":""
						}
					},
					m("form#payment-form",
						m("p", "点击下方按钮完成支付。"),
						m("button.btn.btn-primary", {style:{width:"100%"},onclick:async(e)=>{
							e.preventDefault();
							location.href=(await API.StripeCreateSession()).url;
						}},
							"支付"
						)
					),m("br"),m("br")
				),
				m("a",{
					href: "#!/shopping_cart",
					onclick: (e)=>{
						e.preventDefault();
						m.route.set("/shopping_cart");
					}
				}, "返回")
			]
		);
	}
};

async function dorefresh(manual) {
	let pairInfo=await API.CheckPayment();
	if(pairInfo.error) {
		if(intv)clearInterval(intv);
		intv=null;
		await frame.showAlert("错误", pairInfo.error_message);
		m.route.set("/shopping_cart");
		return;
	}
	if(!pay.paired) {
		if(!pairInfo.paired) {
			if(manual) {
				pay.error=pairInfo.message;
				m.redraw();
			}
			return;
		}else{
			pay.error="";
			pay.paired_notice=`请支付: ￥${pairInfo.price}`;
			pay.paired=true;
			m.redraw();
		}
		manual=false;
	}
	if(!pairInfo.success) {
		if(manual) {
			pay.error="尚未成功";
			m.redraw();
		}
	}else{
		pay.error="";
		pay.paired_notice="支付成功！";
		pay.success=true;
		clearInterval(intv);
		intv=null;
		m.redraw();
	}
}

export default pay;
			
