import m from "mithril";
import frame from "../theme/frame";
import $ from "jquery";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 576 512"><path d="M234.8 511.7L196 500.4c-4.2-1.2-6.7-5.7-5.5-9.9L331.3 5.8c1.2-4.2 5.7-6.7 9.9-5.5L380 11.6c4.2 1.2 6.7 5.7 5.5 9.9L244.7 506.2c-1.2 4.3-5.6 6.7-9.9 5.5zm-83.2-121.1l27.2-29c3.1-3.3 2.8-8.5-.5-11.5L72.2 256l106.1-94.1c3.4-3 3.6-8.2.5-11.5l-27.2-29c-3-3.2-8.1-3.4-11.3-.4L2.5 250.2c-3.4 3.2-3.4 8.5 0 11.7L140.3 391c3.2 3 8.2 2.8 11.3-.4zm284.1.4l137.7-129.1c3.4-3.2 3.4-8.5 0-11.7L435.7 121c-3.2-3-8.3-2.9-11.3.4l-27.2 29c-3.1 3.3-2.8 8.5.5 11.5L503.8 256l-106.1 94.1c-3.4 3-3.6 8.2-.5 11.5l27.2 29c3.1 3.2 8.1 3.4 11.3.4z"></path></svg>`;

let submit_structure_name="";
let submit_structure_price="";
let submit_structure_description="";
let submit_structure_inprogress=false;
let myproducts=[];

let creative_center={
	oninit: ()=>{
		submit_structure_name="";
		submit_structure_price="";
		submit_structure_description="";
		submit_structure_inprogress=false;
		myproducts=[];
		$.get("/ccactions/get_my_products.web", (r)=>{
			if(r.success) {
				myproducts=r.value;
				m.redraw();
			}
		});
	},
	view: (vnode)=>{
		let myproducts_rendered=[];
		for(let i of myproducts) {
			myproducts_rendered.push(m("tr",
				m("th", {scope:"row"},
					i.product_name
				),
				m("td", ["￥", i.price])
			));
		}
		return m(frame.frame, {pageName: "创作中心", pageIcon},
			!localStorage.getItem("admin")?null:
			m("p", m("b", m("a", {href:"#!/creative_center/review"}, "审核"))),
			m(frame.section, {title: "已投稿作品"},
				m("table.table",
					m("thead",
						m("tr",
							m("th", {scope:"col"},"作品名称"),
							m("th", {scope:"col"},"售价"),
							m("th", {scope:"col"},"编号"),
							m("th", {scope:"col"},"状态"),
							m("th", {scope:"col"},"操作")
						)
					),
					m("tbody",
						myproducts_rendered
					)
				)
			),
			m(frame.section, {title: "投稿"},
				m("p", "提交建筑"),
				m(frame.form,
					m(frame.formInput, {
						value: submit_structure_name,
						oninput: (e) => {
							submit_structure_name = e.target.value;
						}
					}, "作品名称"),
					m(frame.formInput, {
						value: submit_structure_price,
						oninput: (e) => {
							submit_structure_price = e.target.value;
						}
					}, "售价 [CNY]"),
					m("small", "开发组将分成 30%"),
					m("p", {style:{"margin-top":".8rem","margin-bottom":".1rem"}}, "作品描述"),
					m("textarea.userProfile-form-input.form-input.ember-text-field.ember-view.form-control", {
						style: {
							"min-height": "8rem",
							"width": "60%"
						},
						value: submit_structure_description,
						oninput: (e)=>{
							submit_structure_description = e.target.value;
						}
					}),
					m("p", {style:{"margin-top":".8rem","margin-bottom":".1rem"}}, "图片 (png,jpg)"),
					m("input.userProfile-form-input.form-input.ember-view.form-control#pic-inp", {type:"file"}),
					m("p", {style:{"margin-top":".8rem","margin-bottom":".1rem"}}, "文件 (bdx)"),
					m("input.userProfile-form-input.form-input.ember-view.form-control#file-inp", {type:"file"}),
				),
				m(frame.button, {
					style: {
						"margin-top": "1rem"
					},
					disabled: submit_structure_inprogress,
					onclick: (e)=>{
						submit_structure_inprogress=true;
						let imgfilereader=new FileReader();
						imgfilereader.readAsDataURL($("#pic-inp")[0].files[0]);
						imgfilereader.onload=(e)=>{
							$.post("/ccactions/uploadtotmp.web", JSON.stringify({
								content: e.target.result.split(",")[1],
								filename: $("#pic-inp")[0].files[0].name,
								restrict: "image"
							}), (ret)=>{
								if(ret.code!=0) {
									submit_structure_inprogress=false;
									return frame.showAlert("图片上传失败", ret.message);
								}
								let bdxfilereader=new FileReader();
								bdxfilereader.readAsDataURL($("#file-inp")[0].files[0]);
								bdxfilerader.onload=(e)=>{
									$.post("/ccactions/uploadtotmp.web", JSON.stringify({
										content: e.target.result.split(",")[1],
										filename: $("#file-inp")[0].files[0].name,
										restrict: " [building) "
									}), (ret2)=>{
										if(ret2.code!=0) {
											submit_structure_inprogress=false;
											return frame.showAlert("建筑文件上传失败", ret.message);
										}
										$.get("/ccactions/submit_product.web", {
											name:submit_structure_name,
											price:submit_structure_price,
											description:submit_structure_description,
											image:ret.hash,
											building:ret2.hash,
										}, (ret3)=>{
											if(ret3.success) {
												creative_center.oninit();
											}else{
												submit_structure_inprogress=false;
												return frame.showAlert("稿件提交失败", ret3.message);
											}
										});
									});
								};
							});
						}
					}
				}, "提交")
			)
		);
	}
};

export default creative_center;