import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M352 128C352 57.42 294.579 0 224 0 153.42 0 96 57.42 96 128H0v304c0 44.183 35.817 80 80 80h288c44.183 0 80-35.817 80-80V128h-96zM224 48c44.112 0 80 35.888 80 80H144c0-44.112 35.888-80 80-80zm176 384c0 17.645-14.355 32-32 32H80c-17.645 0-32-14.355-32-32V176h48v40c0 13.255 10.745 24 24 24s24-10.745 24-24v-40h160v40c0 13.255 10.745 24 24 24s24-10.745 24-24v-40h48v256z"></path></svg>`;

let productDetail={
	view: (vnode)=>{
		return m("div",
			m("div.liquid-container.ember-view",{style:{top:"0px",left:"0px"}},
				m("div.liquid-modal",
					m("div.liquid-child",
						m("div.lm-container",
							m("div.lf-dialog",{role:"dialog"},
								m("div.eventOverview.ember-view",
									m("header.lf-dialog-header.needs-close-button.ember-view.atStatus-lec",
										m("div", [vnode.attrs.product_name,vnode.attrs.owned?" (已拥有)":null]),
										m("button.button--iconHeader.at-lf-dialog-header", {
											type: "button",
											onclick:(e)=>{
												e.preventDefault();
												frame.placeAppendPart(null);
											}
										},"✕")
									),
									m("div.lf-dialog-content.ember-view",
										m("div.eventOverview-timeDate-wrapper",
											m("div",
												m(frame.doClassReplace("div.eventOverview-timeDate-right.bootstrap-iso"),
													vnode.attrs.product_image?m("img", {
														src: vnode.attrs.product_image,
														width: "512",
														height: "128"
													}):null,
													m("p", m.trust(vnode.attrs.product_detail))
												)
											)
										),
										m("div.eventOverview-separator"),
										m("div.eventOverviewData-dataRow",
											m("div.eventOverviewData-dataLabel","价格"),
											m("div.eventOverviewData-dataValue","￥"+vnode.attrs.price)
										),
										m("div.eventOverview-separator"),
										m("div.eventOverviewData-dataRow",
											m("div.eventOverviewData-dataLabel","作者"),
											m("div.eventOverviewData-dataValue",vnode.attrs.author)
										)
									),
									m("footer.lf-dialog-footer.ember-view",
										!vnode.attrs.owned&&!productDetail.nocart?m(frame.doClassReplace("button.button.button--primary"), {
											onclick:()=>{
												(async()=>{
													let r=await API.AddProductToCart(vnode.attrs.product_id);
													if(!r.success){
														frame.showAlert("错误", r.message);
														return;
													}
													frame.placeAppendPart(null);
												})();
											}
										}, "加入购物车"):null,
										m(frame.doClassReplace("button.button.button--primary"), {
											onclick:()=>{
												frame.placeAppendPart(null);
											}
										}, "关闭")
									)
								)
							)
						)
					)
				)
			)
		);
	}
};										

let mall={
	productlist: [],
	ownedlist: [],
	page: 1,
	havemore: false,
	oninit: async ()=>{
		let {products, owned}=await API.GetProductList(0);
		mall.productlist=products||[];
		mall.ownedlist=owned||[];
		m.redraw();
	},
	view: (vnode)=>{
		let productList=[];
		for(let product of mall.productlist) {
			if(product.forbid_cart||!product.product_id)continue;
			let productCopy=product;
			productList.push(m("div.chronos-agendaView-item.chronos-event--lec",
				m("time.chronos-agendaView-item-time.chronos-agendaView-item-time--monospace"),
				m("div.chronos-agendaView-item-infos.chronos-agendaView-item-infos-imageLess",
					m("span.chronos-agendaView-item-title",{
						onclick:()=>{
							let arg=productCopy;
							if(mall.ownedlist.indexOf(arg.product_id)!=-1) {
								arg.owned=true;
							}
							frame.placeAppendPart(m(productDetail,arg));
						}
					},product.product_name)
				)
			));
		}
		return m(frame.frame, {pageName: "商城", pageIcon},
			m("div.ember-view",
				m("div.chronos",
					m("div.chronos-events",
						m(frame.doClassReplace("div.chronos-agendaView"),
							m("time.chronos-agendaView-header","商品列表"),
							m("div#productList", productList),
							m("div",{style:{"text-align":"center",display:mall.havemore?undefined:"none"}},
								m(frame.doClassReplace("button.button.at-sidebarUser"), {
									onclick:()=>{
										mall.havemore=false;
										(async()=>{
											let {products}=await API.GetProductList(mall.page);
											mall.page++;
											if(products.length!=0)mall.havemore=true;
											for(let i of products) {
												mall.productlist.push(i);
											}
											m.redraw();
										})();
									}
								}, "加载更多")
							),
							m("br")
						)
					)
				)
			)
		);
	}
};

export default mall;
