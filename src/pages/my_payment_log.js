import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 448 512"><path d="M313.6 304c-28.7 0-42.5 16-89.6 16-47.1 0-60.8-16-89.6-16C60.2 304 0 364.2 0 438.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-25.6c0-74.2-60.2-134.4-134.4-134.4zM400 464H48v-25.6c0-47.6 38.8-86.4 86.4-86.4 14.6 0 38.3 16 89.6 16 51.7 0 74.9-16 89.6-16 47.6 0 86.4 38.8 86.4 86.4V464zM224 288c79.5 0 144-64.5 144-144S303.5 0 224 0 80 64.5 80 144s64.5 144 144 144zm0-240c52.9 0 96 43.1 96 96s-43.1 96-96 96-96-43.1-96-96 43.1-96 96-96z"></path></svg>`;

let paymentLogPage={
	payment_log_entries: [],
	page: 1,
	pages: 1,
	oninit: async ()=>{
		paymentLogPage.payment_log_entries=[];
		paymentLogPage.page=1;
		paymentLogPage.pages=1;
		let plr=await API.GetPaymentLog(1);
		paymentLogPage.payment_log_entries=plr.payments;
		paymentLogPage.pages=plr.pages;
		m.redraw();
	},
	view: (vnode)=>{
		let payment_log_output=[];
		if(!paymentLogPage.payment_log_entries) {
			payment_log_output.push(m("b", "加载中"));
		}
		for(let i of paymentLogPage.payment_log_entries) {
			payment_log_output.push(m(frame.section, {title: ((new Date(i.identifier)).toLocaleString())},
				m("div", m.trust(i.description)),
				i.no_refund?
				m("b", "不可退款")
				:m(frame.button, {
					onclick:()=>{
						window.open("/api/v2/3/api.web?jump_to=do_refund&log_id="+i.identifier);
					}
				}, "退款")
			));
		}
		return m(frame.frame, {pageName:"付款记录" ,pageIcon},
			payment_log_output
		);
	}
};

export default paymentLogPage;



