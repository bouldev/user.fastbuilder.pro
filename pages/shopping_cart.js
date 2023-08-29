import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M551.991 64H144.28l-8.726-44.608C133.35 8.128 123.478 0 112 0H12C5.373 0 0 5.373 0 12v24c0 6.627 5.373 12 12 12h80.24l69.594 355.701C150.796 415.201 144 430.802 144 448c0 35.346 28.654 64 64 64s64-28.654 64-64a63.681 63.681 0 0 0-8.583-32h145.167a63.681 63.681 0 0 0-8.583 32c0 35.346 28.654 64 64 64 35.346 0 64-28.654 64-64 0-18.136-7.556-34.496-19.676-46.142l1.035-4.757c3.254-14.96-8.142-29.101-23.452-29.101H203.76l-9.39-48h312.405c11.29 0 21.054-7.869 23.452-18.902l45.216-208C578.695 78.139 567.299 64 551.991 64zM208 472c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm256 0c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm23.438-200H184.98l-31.31-160h368.548l-34.78 160z"></path></svg>`;

let shoppingCart={
	operationErrorNote: "",
	content: [],
	oninit:async (vnode)=>{
		let shoppingcart=await API.GetShoppingCart();
		shoppingCart.content=shoppingcart;
		m.redraw();
	},
	view:(vnode)=>{
		let proceededContent=[];
		for(let i of shoppingCart.content) {
			let current=i;
			proceededContent.push(m("tr",
				m("th",{scope:"row"},i.product_name),
				m("td",i.product_id),
				m("td",i.price),
				m("td","0"), // Broken
				m("td",i.price),
				m("td",
					m("button.btn.btn-danger", {
						onclick: async()=>{
							await API.ShoppingCartSpliceProduct(current.product_id);
							let shoppingcart=await API.GetShoppingCart();
							shoppingCart.content=shoppingcart;
							m.redraw();
						}
					}, "删除")
				)
			));
		}
		return m(frame.frame, {pageName: "购物车", pageIcon},
			m(frame.section, {title:"购物车"},
				shoppingCart.operationErrorNote.length==0?null:m("p",{style:{color:"red"}},shoppingCart.operationErrorNote),
				m(frame.doClassReplace("div.bootstrap-iso"),
					m("div.row",
						m("table.table",
							m("thead",
								m("tr",
									m("th", {
										scope: "col"
									}, "商品名称"),
									m("th", {
										scope: "col"
									}, "商品编号"),
									m("th", {
										scope: "col"
									}, "价格(CNY)"),
									m("th", {
										scope: "col"
									}, "抵价(CNY)"),
									m("th", {
										scope: "col"
									}, "应付(CNY)"),
									m("th", {
										scope: "col"
									}, "操作")
								)
							),
							m("tbody", proceededContent)
						)
					)
				)
			),
			m(frame.button, {
				onclick:async ()=>{
					let r=await API.CalculatePrice();
					if(!r.success) {
						frame.showAlert("错误", r.message);
						return;
					}
					m.route.set(r.location);
				}
			}, "结算"),
			" ",
			m(frame.button, {
				onclick:()=>{
					shoppingCart.oninit(vnode);
				}
			}, "刷新")
		);
	}
};

export default shoppingCart;
