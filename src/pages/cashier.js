import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M224 96.1v48.8l29.7 29.7c-6.8-34.8 3.5-70.3 28.5-95.3 20.3-20.3 47.2-31.2 75-31.2h1.2L301 105.3l15.1 90.6 90.6 15.1 57.3-57.3c.3 28.3-10.6 55.5-31.2 76.1-9.3 9.3-20.2 16.4-31.8 21.6 1.8 1.6 3.9 2.9 5.6 4.6l30.7 30.7c10.5-6.3 20.5-13.9 29.4-22.9 38.1-38.1 53.7-94.3 40.7-146.6C504.4 105 495 95.4 483 92c-12.2-3.4-25.2.1-34 9l-58.7 58.6-32.4-5.4-5.4-32.4 58.6-58.6c8.9-8.9 12.3-21.9 8.9-34-3.3-12.1-13-21.5-25.2-24.5-53.2-13.2-107.9 2-146.6 40.6C238 55.5 229.7 67 222.9 79.2l1.1.8v16.1zM106 454c-12.8 12.8-35.3 12.8-48.1 0-6.4-6.4-10-15-10-24 0-9.1 3.5-17.6 10-24l134.4-134.4-33.9-33.9L24 372C8.5 387.5 0 408.1 0 430s8.5 42.5 24 58 36.1 24 58 24 42.5-8.5 58-24l100.9-100.9c-9.7-15.8-15.2-33.8-15.7-52.1L106 454zm395.1-58.3L384 278.6c-23.1-23.1-57.6-27.6-85.4-13.9L192 158.1V96L64 0 0 64l96 128h62.1l106.6 106.6c-13.6 27.8-9.2 62.3 13.9 85.4l117.1 117.1c14.6 14.6 38.2 14.6 52.7 0l52.7-52.7c14.5-14.6 14.5-38.2 0-52.7z"></path></svg>`;


let cashier={
	shouldrender: false,
	okane: -1,
	kakunincode: "",
	kakunincodeLocked: false,
	confirmInProgress: false,
	confirmTrustDivContent: "",
	finishConfError: "",
	finishingConf: false,
	quickAddError: "",
	quickAddWorkingProcess: [false,false,false,false],
	removeAllWorking: false,
	addValue: "",
	addValueInProgress: false,
	current_exrate: "1 USD = 7 CNY",
	paypal_usd_num: 0,
	prepared_paypal_pay: false,
	oninit: async ()=>{
		cashier.addValue="";
		cashier.addValueInProgress=false;
		cashier.prepared_paypal_pay=false;
		cashier.okane=await API.GetBalance();
		cashier.current_exrate="";//await API.GetExRate();
		if(cashier.okane==0&&!localStorage.getItem("admin")) {
			cashier.shouldrender=false;
		}else{
			cashier.shouldrender=true;
		}
		m.redraw();
	},
	view: (vnode)=>{
		if(!cashier.shouldrender) {
			return m(frame.frame, {pageName: "收银台", pageIcon},
				m(frame.section, {title: "收银台"},
					m("p", "余额: 0, 不可使用")
				)
			);
		}
		return m(frame.frame, {pageName: "收银台", pageIcon},
			m(frame.section, {title: "代理余额"},
				m("b", ["余额(CNY): ",cashier.okane])
			),
			m(frame.section, {title: "确认商品"},
				m(frame.formInput, {
					value: cashier.kakunincode,
					oninput: (e)=>{
						if(cashier.kakunincodeLocked) {
							cashier.confirmTrustDivContent="";
						}
						cashier.kakunincode=e.target.value;
					}
				}),
				m(frame.button, {
					disabled: cashier.confirmInProgress,
					onclick: async ()=>{
						cashier.confirmInProgress=true;
						cashier.confirmTrustDivContent="";
						m.redraw();
						let pairresult=await API.PairPayment(cashier.kakunincode);
						if(!pairresult.success) {
							if(!pairresult.list) {
								frame.showAlert("错误", pairresult.message);
								cashier.confirmInProgress=false;
								m.redraw();
								return;
							}
							cashier.confirmTrustDivContent=pairresult.list;
							cashier.finishConfError=pairresult.message;
							cashier.confirmInProgress=false;
							m.redraw();
							return;
						}
						cashier.finishConfError="";
						cashier.confirmTrustDivContent=pairresult.list;
						cashier.confirmInProgress=false;
						m.redraw();
					}
				}, "显示商品列表")
			),
			cashier.confirmTrustDivContent=="" ?
			null:
			m(frame.section, {title: "确认商品列表"},
				m("div", m.trust(cashier.confirmTrustDivContent)),
				cashier.finishConfError==""?null:m("p", {style:{color:"red"}}, cashier.finishConfError),
				cashier.finishConfError==""?m(frame.button, {
					disabled: cashier.finishingConf,
					onclick: ()=>{
						cashier.finishingConf=true;
						(async()=>{
							if(!await frame.question("确认", "确认完成本次支付？",true)) {
								cashier.finishingConf=false;
								return m.redraw();
							}
							let pr=await API.ApprovePayment(cashier.kakunincode);
							cashier.finishingConf=false;
							cashier.kakunincode="";
							cashier.confirmTrustDivContent="";
							if(!pr.success) {
								cashier.finishConfError=pr.message;
								return m.redraw();
							}
							cashier.oninit();
						})();
					}
				}, "完成"):null
			),
			m(frame.section, {title: "充值"},
				m("p", "请输入 10 以上的整数，单位 CNY"),
				m(frame.form,
					m(frame.formInput, {
						value: cashier.addValue,
						style: {
							width: "90%"
						},
						oninput: (e)=>{
							cashier.addValue=e.target.value;
						}
					})
				),
				m(frame.button, {onclick:(e)=>{
					let v=parseInt(cashier.addValue);
					if(isNaN(v)) {
						frame.showAlert("ERROR", "Please input an integer");
						return;
					}
					if(v<10) {
						frame.showAlert("ERROR", "Please input an integer that greater than or equals 10.");
						return;
					}
					location.href="/api/v2/stripe/charge.web?value="+v;
				}}, "充值")
			),
			!localStorage.getItem("admin")?null:
			m(frame.section, {title: "快速添加"},
				cashier.quickAddError?m("p", {style:{color:"red"}},cashier.quickAddError):null,
				[
					m(frame.button, {
						disabled: cashier.quickAddWorkingProcess[0],
						onclick: async ()=>{
							cashier.quickAddWorkingProcess[0]=true;
							m.redraw();
							await API.AddZanDaka(localStorage.getItem("username"), 50);
							cashier.quickAddWorkingProcess[0]=false;
							cashier.oninit();
						}
					}, "添加50CNY"),
					" ",
					m(frame.button, {
						disabled: cashier.quickAddWorkingProcess[1],
						onclick: async ()=>{
							cashier.quickAddWorkingProcess[1]=true;
							m.redraw();
							await API.AddZanDaka(localStorage.getItem("username"), 200);
							cashier.quickAddWorkingProcess[1]=false;
							cashier.oninit();
						}
					}, "添加200CNY"),
					" ",
					m(frame.button, {
						disabled: cashier.quickAddWorkingProcess[2],
						onclick: async ()=>{
							cashier.quickAddWorkingProcess[2]=true;
							m.redraw();
							await API.AddZanDaka(localStorage.getItem("username"), 500);
							cashier.quickAddWorkingProcess[2]=false;
							cashier.oninit();
						}
					}, "添加500CNY"),
					" ",
					m(frame.button, {
						disabled: cashier.quickAddWorkingProcess[3],
						onclick: async ()=>{
							cashier.quickAddWorkingProcess[3]=true;
							m.redraw();
							await API.AddBalance(localStorage.getItem("username"), 1000);
							cashier.quickAddWorkingProcess[3]=false;
							cashier.oninit();
						}
					}, "添加1000CNY")
				]
			),
			m(frame.section, {title: "清空余额"},
				m(frame.button, {
					disabled: cashier.removeAllWorking,
					onclick: async ()=>{
						cashier.removeAllWorking=true;
						m.redraw();
						await API.ClearBalance();
						cashier.removeAllWorking=false;
						cashier.oninit();
					}
				}, "DOIT")
			)
		);
	}
}

export default cashier;
