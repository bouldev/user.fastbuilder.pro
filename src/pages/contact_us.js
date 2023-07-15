import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512"><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"></path></svg>`;

let contact_us={
	detail_identifier: 0,
	can_reply: false,
	contact_title: "",
	contact_list: [],
	oninit:async ()=>{
		contact_us.new_contact_title="";
		contact_us.contact_content="";
		contact_us.contact_reply_anonymous=false;
		contact_us.contact_closing=false;
		contact_us.contact_add_in_progress=false;
		contact_us.can_reply=false;
		contact_us.detail_identifier=0;
		contact_us.contact_list=[];
		let contact_content=await API.GetUserContacts(0);
		contact_us.contact_list=contact_content.contacts;
		m.redraw();
	},
	view:(vnode)=>{
		let layout_content=[];
		if(!contact_us.detail_identifier) {
			if(!localStorage.getItem("admin"))layout_content.push(m(frame.section, {title: "创建联络"},
				m(frame.form,
					m(frame.formInput, {
						value: contact_us.new_contact_title,
						style:{width:"90%"},
						oninput:(e)=>{contact_us.new_contact_title=e.target.value;}
					}, "标题"),
					m("div.userProfile-form-item",
						m("label.userProfile-form-label",
							[
								"内容",
								m(frame.doClassReplace("textarea.userProfile-form-input.form-input.ember-text-field.ember-view"), {
									rows: "10",
									cols: "90%",
									style: {
										width: "90%"
									},
									value:contact_us.contact_content,
									oninput:(e)=>{contact_us.contact_content=e.target.value;}
								})
							]
						)
					),
					m(frame.button, {
						disabled:contact_us.contact_add_in_progress,
						onclick:(e)=>{
							e.preventDefault();
							contact_us.contact_add_in_progress=true;
							(async()=>{
								let create_r=await API.CreateUserContact(contact_us.new_contact_title, contact_us.contact_content);
								if(!create_r.success) {
									contact_us.contact_add_in_progress=false;
									frame.showAlert("失败", create_r.message);
									return;
								}
								contact_us.contact_add_in_progress=false;
								contact_us.detail_identifier=create_r.identifier;
								let contact_content=await API.GetUserContacts(create_r.identifier);
								contact_us.contact_list=contact_content.item.thread;
								contact_us.contact_title=contact_content.item.title;
								contact_us.can_reply=contact_content.item.user_can_add_msg;
								contact_us.contact_content="";
								m.redraw();
							})();
						}
					}, "创建")
				)
			));
			for(let index in contact_us.contact_list) {
				let i=contact_us.contact_list[index];
				layout_content.push(m(frame.section, {title:i.title},
					i.has_update?m("p",m("b", {style:"color:red;"}, "(新消息)")):null,
					i.closed?m("p",m("b", {style:"color:gray;"}, "(已关闭)")):null,
					m(frame.button, {
						onclick: async ()=>{
							contact_us.detail_identifier=i.identifier;
							let contact_content=await API.GetUserContacts(i.identifier);
							contact_us.contact_list=contact_content.item.thread;
							contact_us.contact_title=contact_content.item.title;
							contact_us.can_reply=contact_content.item.user_can_add_msg;
							m.redraw();
						}
					}, "查看")
				));
			}
		}else{
			let allow_anonymous=false;
			if(localStorage.getItem("admin")) {
				allow_anonymous=true;
			}
			layout_content.push(m(frame.section, {title: ""},
				m(frame.button, {style: "margin-right: 2rem;",onclick:()=>{
					contact_us.oninit();
				}}, "返回"),
				m(frame.button, {onclick:async()=>{
					let con=await frame.question("确认", "确认要删除本联络吗？", true);
					if(!con)return;
					let del_r=await API.DeleteUserContact(contact_us.detail_identifier);
					if(!del_r.success) {
						return frame.showAlert("失败", del_r.message);
					}
					contact_us.oninit();
				}}, "删除本联络")
			));
			if(contact_us.can_reply) {
				layout_content.push(m(frame.section, {title: "回复/追加"},
					m(frame.form,
						allow_anonymous?m("div.form-check", {style:{"margin-right":".2rem"}},
							m("input.form-check-input", {
								type: "checkbox",
								id: "contact_anonymous_check",
								value: contact_us.contact_reply_anonymous?"on":"off",
								oninput: (e)=>{
									if(e.target.value=="off") {
										contact_us.contact_reply_anonymous=true;
									}else{
										contact_us.contact_reply_anonymous=false;
									}
								}
							}),
							m("label.form-check-label", {for:"contact_anonymous_check",style:"margin-right:1rem;"}, "匿名")
						):null,
						allow_anonymous?m("div.form-check", {style:{"margin-right":".2rem"}},
							m("input.form-check-input", {
								type: "checkbox",
								id: "contact_closing_check",
								value: contact_us.contact_closing?"on":"off",
								oninput: (e)=>{
									if(e.target.value=="off") {
										contact_us.contact_closing=true;
									}else{
										contact_us.contact_closing=false;
									}
								}
							}),
							m("label.form-check-label", {for:"contact_closing_check"}, "关闭此联络")
						):null,
						m("div.userProfile-form-item",
							m("label.userProfile-form-label",
								[
									"内容",
									m(frame.doClassReplace("textarea.userProfile-form-input.form-input.ember-text-field.ember-view"), {
										rows: "10",
										cols: "90%",
										style: {
											width: "90%"
										},
										value:contact_us.contact_content,
										oninput:(e)=>{contact_us.contact_content=e.target.value;}
									})
								]
							)
						),
						m(frame.button, {
							disabled:contact_us.contact_add_in_progress,
							onclick:(e)=>{
								e.preventDefault();
								contact_us.contact_add_in_progress=true;
								(async()=>{
									let update_r=await API.UpdateUserContact(contact_us.detail_identifier, contact_us.contact_content, contact_us.contact_reply_anonymous,contact_us.contact_closing);
									if(!update_r.success) {
										contact_us.contact_add_in_progress=false;
										return frame.showAlert("失败", update_r.message);
									}
									contact_us.contact_add_in_progress=false;
									let contact_content=await API.GetUserContacts(contact_us.detail_identifier);
									contact_us.contact_list=contact_content.item.thread;
									contact_us.contact_title=contact_content.item.title;
									contact_us.can_reply=contact_content.item.user_can_add_msg;
									contact_us.contact_content="";
									m.redraw();
								})();
							}
						}, "追加")
					)
				));
			}
			for(let i of contact_us.contact_list) {
				let formatted_content=[];
				let spl_content=i.content.split("\n");
				for(let line of spl_content) {
					formatted_content.push(m("p", line.toString()));
				}
				layout_content.push(m(frame.section, {title:""},
					m("p", ["发送方: ", i.sender]),
					m("p", ["日期: ", (new Date(parseInt(i.time+"000"))).toLocaleString()]),
					m("hr"),
					formatted_content
				));
			}
		}
		return m(frame.frame, {pageName:
			contact_us.detail_identifier?`联络: ${contact_us.contact_title}`:"联络",
			pageIcon},
			layout_content
		);
	}
};
export default contact_us;
