import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512"><path d="M224 96.1v48.8l29.7 29.7c-6.8-34.8 3.5-70.3 28.5-95.3 20.3-20.3 47.2-31.2 75-31.2h1.2L301 105.3l15.1 90.6 90.6 15.1 57.3-57.3c.3 28.3-10.6 55.5-31.2 76.1-9.3 9.3-20.2 16.4-31.8 21.6 1.8 1.6 3.9 2.9 5.6 4.6l30.7 30.7c10.5-6.3 20.5-13.9 29.4-22.9 38.1-38.1 53.7-94.3 40.7-146.6C504.4 105 495 95.4 483 92c-12.2-3.4-25.2.1-34 9l-58.7 58.6-32.4-5.4-5.4-32.4 58.6-58.6c8.9-8.9 12.3-21.9 8.9-34-3.3-12.1-13-21.5-25.2-24.5-53.2-13.2-107.9 2-146.6 40.6C238 55.5 229.7 67 222.9 79.2l1.1.8v16.1zM106 454c-12.8 12.8-35.3 12.8-48.1 0-6.4-6.4-10-15-10-24 0-9.1 3.5-17.6 10-24l134.4-134.4-33.9-33.9L24 372C8.5 387.5 0 408.1 0 430s8.5 42.5 24 58 36.1 24 58 24 42.5-8.5 58-24l100.9-100.9c-9.7-15.8-15.2-33.8-15.7-52.1L106 454zm395.1-58.3L384 278.6c-23.1-23.1-57.6-27.6-85.4-13.9L192 158.1V96L64 0 0 64l96 128h62.1l106.6 106.6c-13.6 27.8-9.2 62.3 13.9 85.4l117.1 117.1c14.6 14.6 38.2 14.6 52.7 0l52.7-52.7c14.5-14.6 14.5-38.2 0-52.7z"></path></svg>`;

let ap={
	newAnnouncementTitle: "",
	newAnnouncementContent: "",
	newAnnouncementPublishing: false,
	userlist: [],
	payments: [],
	selected_serverlist: {
		username: "",
		content: []
	},
	addUser_Username: "",
	addUser_Password: "",
	addUser_InProgress: false,
	db_cache_clean_wip: false,
	az_TargetUsername: "",
	az_Value: "",
	az_InProgress: false,
	whitelist_page: 1,
	payments_page: 1,
	whitelist_maxpage: 1,
	payments_maxpage: 1,
	whitelist_query: "",
	whitelist_query_additional: [false,false,false,false],
	payments_query: {
		username: "",
		hname: "",
		desc: ""	
	},
	pil_value: [],
	oninit: async ()=>{
		let whitelist_query_proc=`${ap.whitelist_query_additional[0]?"1":"0"}${ap.whitelist_query_additional[1]?"1":"0"}${ap.whitelist_query_additional[2]?"1":"0"}${ap.whitelist_query_additional[3]?"1":"0"}${ap.whitelist_query}`;
		let whitelist_and_payments=await API.GetWhitelistAndPayments(
			ap.whitelist_page,
			ap.payments_page,
			whitelist_query_proc,
			ap.payments_query.username,
			ap.payments_query.hname,
			ap.payments_query.desc
		);
		ap.userlist=whitelist_and_payments.wlist;
		ap.payments=whitelist_and_payments.payments;
		ap.whitelist_maxpage=whitelist_and_payments.pn_wlist;
		ap.payments_maxpage=whitelist_and_payments.pn_plist;
		if(ap.whitelist_maxpage==0) ap.whitelist_maxpage=1;
		if(ap.payments_maxpage==0) ap.payments_maxpage=1;
		let {pil} = await API.GetPil();
		ap.pil_value=pil;
		m.redraw();
	},
	view: (vnode)=>{
		let kclNode=[];
		for(let i in ap.pil_value){
			kclNode.push(m("tr",
				m("th",{scope:"row"},i),
				m("td",JSON.stringify(ap.pil_value[i]))
			));
		}
		let userlist_rendered=[];
		for(let index in ap.userlist) {
			let i = ap.userlist[index];
			let index_num=parseInt(index);
			let additionalTags=[];
			if(i.banned) {
				additionalTags.push(m("b", {style:{color:"red"}}, "[B]"));
			}
			if(i.admin) {
				additionalTags.push(m("b", {style:{color:"red"}}, "[ADMIN]"));
			}
			if(i.allowed_to_use_phoenix) {
				additionalTags.push(m("b", {style:{color:"blue"}}, "[P]"));
			}
			userlist_rendered.push(m("tr",
				m("th",{scope:"row"},[additionalTags,i.username]),
				m("td",i.promocodeCount||"0"),
				!i.editing?m("td", m("a",
					{
						style: {
							cursor: "pointer"
						},
						onclick: (e)=>{
							e.preventDefault();
							ap.userlist[index_num].editing_psw="";
							ap.userlist[index_num].editing=true;
						}
					},
					i.password.substr(0,8)
				)):
				m("td", m("input.col-sm-4.form-control", {
					style: {
						width: "initial"
					},
					value: i.editing_psw,
					oninput: (e)=>{
						ap.userlist[index_num].editing_psw=e.target.value;
					},
					onkeypress: async (e)=>{
						if(e.key=="Enter") {
							e.preventDefault();
							ap.userlist[index_num].editing=false;
							ap.userlist[index_num].password=ap.userlist[index_num].editing_psw;
							await API.UpdateUserPassword(ap.userlist[index_num].username,ap.userlist[index_num].password);
							ap.oninit();
						}
					}
				})),
				m("td", [
					m("button.btn.btn-secondary", {
						onclick: ()=>{
							ap.selected_serverlist.username=ap.userlist[index_num].username;
							ap.selected_serverlist.content=ap.userlist[index_num].rentalservers;
							m.redraw();
						}
					}, "Serv."),
					/*" ",
					m("button.btn.btn-danger", {
						onclick: async ()=>{
							if(i.banned) {
								let confirm_stat=await frame.question("Retract Ticket", `Retract the ticket for ${i.username}?`, true);
								if(!confirm_stat)return;
								let r=await API.BanUser(i.username);
								if(!r.success) {
									return await frame.showAlert("Failed", r.message);
								}
								i.banned=false;
								m.redraw();
								return;
							}
							let reason=await frame.getInput("Fine User", "Please confirm and give a reason for fining "+i.username, "Reason", false, true);
							if(reason===false)return;
							let r=await API.BanUser(i.username, reason);
							if(!r.success) {
								return await frame.showAlert("Failed", r.message);
							}
							i.banned=true;
							m.redraw();
						}
					}, !i.banned?"Fine":"RetrTkt"),*/
					" ",
					m("button.btn.btn-danger", {
						onclick: async ()=>{
							if(!await frame.question("Remove user", `Remove user ${i.username}? This will remove the entry permanently from the database!`, true)) {
								return;
							}
							let r=await API.RemoveUser(i.username);
							if(!r.success) {
								return await frame.showAlert("Failed", r.message);
							}
							ap.oninit();
						}
					}, "Remove")
				])
			));
		}
		let userlist_pagination_items=[];
		userlist_pagination_items[0]=m("li.page-item"+(ap.whitelist_page==1?".disabled":""),
			m("a.page-link", {
				href: "#",
				onclick:(e)=>{
					e.preventDefault();
					ap.whitelist_page--;
					ap.oninit();
				}
			}, "^")
		);
		userlist_pagination_items.push(m("li.page-item"+(ap.whitelist_page==1?".disabled":""),
			m("a.page-link", {
				href: "#",
				onclick: (e)=>{
					e.preventDefault();
					ap.whitelist_page=1;
					ap.oninit();
				}
			}, "1")
		));
		if(ap.whitelist_page==1||ap.whitelist_page==ap.whitelist_maxpage) {
			if(ap.whitelist_maxpage==1) {
				userlist_pagination_items.push(m("li.page-item.disabled",
					m("a.page-link", "...")
				));
			}else{
				userlist_pagination_items.push(m("li.page-item",
					m("a.page-link", {
						href: "#",
						onclick: (e)=>{
							e.preventDefault();
							ap.whitelist_page=2;
							ap.oninit();
						}
					}, "2")
				));
			}
		}else{
			userlist_pagination_items.push(m("li.page-item.disabled",
				m("a.page-link", ap.whitelist_page)
			));
		}
		userlist_pagination_items.push(m("li.page-item"+(1==ap.whitelist_maxpage?".disabled":""),
			m("a.page-link", {
				href: "#",
				onclick: async (e)=>{
					e.preventDefault();
					let jumpPage=await frame.getInput("Jump", "Jump to:", "Page", false, false);
					if(jumpPage===false)return;
					let pn=parseInt(jumpPage);
					if(isNaN(pn)||pn>ap.whitelist_maxpage||pn<1) {
						await frame.showAlert("Jump", "Invalid page number");
						return;
					}
					ap.whitelist_page=pn;
					ap.oninit();
				}
			}, "...")
		));
		userlist_pagination_items.push(m("li.page-item"+(ap.whitelist_page==ap.whitelist_maxpage?".disabled":""),
			m("a.page-link", {
				href: "#",
				onclick:(e)=>{
					e.preventDefault();
					ap.whitelist_page=ap.whitelist_maxpage;
					ap.oninit();
				}
			}, ap.whitelist_maxpage)
		));
		userlist_pagination_items.push(m("li.page-item"+(ap.whitelist_page==ap.whitelist_maxpage?".disabled":""),
			m("a.page-link", {
				href: "#",
				style: {
					transform: "rotate(180deg)",
					"border-top-left-radius": ".25rem",
					"border-top-right-radius": ".25rem",
					"border-bottom-left-radius": "initial",
					"border-bottom-right-radius": "initial"
				},
				onclick:(e)=>{
					e.preventDefault();
					ap.whitelist_page++;
					ap.oninit();
				}
			}, "^")
		));
		let paymentLog_rendered=[];
		for(let i of ap.payments) {
			if(i.helper&&i.helper.length>40) {
				i.helper=i.helper.substr(0,36)+"...";
			}
			paymentLog_rendered.push(m("tr", {
				style: i.refunded?"text-decoration-line:line-through;color:gray;":"",
				ondblclick: ()=>{
					frame.showAlert("Full Content",JSON.stringify(i,null,"\t"));
				}/*,
				onmousedown:()=>{
					i.holding=true;
					setTimeout(()=>{
						if(i.holding){
							delete i.holding;
							frame.showAlert("Full Content",JSON.stringify(i,null,"\t"));
						}
					}, 2000);
				},
				onmouseup:()=>{
					delete i.holding;
				}*/
			},
				m("td", ((new Date(i.date)).toLocaleString())),
				m("td", i.username),
				m("td", i.helper||"(null)"),
				m("td", i.price),
				m("td", i.helper_price),
				m("td", m.trust(i.description.replace(/\n/g, "<br/>")))
			));
		}
		let paymentLog_pagination_items=[];
		paymentLog_pagination_items.push(m("li.page-item"+(ap.payments_page==1?".disabled":""),
			m("a.page-link", {
				href: "#",
				onclick:(e)=>{
					e.preventDefault();
					ap.payments_page--;
					ap.oninit();
				}
			}, "^")
		));
		paymentLog_pagination_items.push(m("li.page-item"+(ap.payments_page==1?".disabled":""),
			m("a.page-link", {
				href: "#",
				onclick: (e)=>{
					e.preventDefault();
					ap.payments_page=1;
					ap.oninit();
				}
			}, "1")
		));
		if(ap.payments_page==1||ap.payments_page==ap.payments_maxpage) {
			if(ap.payments_maxpage==1) {
				paymentLog_pagination_items.push(m("li.page-item.disabled", m("a.page-link", "...")));
			}else{
				paymentLog_pagination_items.push(m("li.page-item",
					m("a.page-link", {
						href: "#",
						onclick: (e)=>{
							e.preventDefault();
							ap.payments_page=2;
							ap.oninit();
						}
					}, "2")
				));
			}
		}else{
			paymentLog_pagination_items.push(m("li.page-item.disabled",
				m("a.page-link", ap.payments_page)
			));
		}
		paymentLog_pagination_items.push(m("li.page-item"+(ap.payments_maxpage==1?".disabled":""),
			m("a.page-link", {
				href: "#",
				onclick: async (e)=>{
					e.preventDefault();
					let jumpPage=await frame.getInput("Jump", "Jump to:", "Page", false, false);
					if(jumpPage===false)return;
					let pn=parseInt(jumpPage);
					if(isNaN(pn)||pn>ap.payments_maxpage||pn<1) {
						await frame.showAlert("Jump", "Invalid page number");
						return;
					}
					ap.payments_page=pn;
					ap.oninit();
				}
			}, "...")
		));
		paymentLog_pagination_items.push(m("li.page-item"+(ap.payments_page==ap.payments_maxpage?".disabled":""),
			m("a.page-link", {
				href: "#",
				onclick:(e)=>{
					e.preventDefault();
					ap.payments_page=ap.payments_maxpage;
					ap.oninit();
				}
			}, ap.payments_maxpage)
		));
		paymentLog_pagination_items.push(m("li.page-item"+(ap.payments_page==ap.payments_maxpage?".disabled":""),
			m("a.page-link", {
				href: "#",
				style: {
					transform: "rotate(180deg)"
				},
				onclick:(e)=>{
					e.preventDefault();
					ap.payments_page++;
					ap.oninit();
				}
			}, "^")
		));
		let renderedRentalServerField=null;
		if(ap.selected_serverlist.username) {
			let body_items=[];
			if(!ap.selected_serverlist.content) ap.selected_serverlist.content=[];
			for(let i of ap.selected_serverlist.content) {
				let canchange=false;
				let ato=0;
				if(i.locked) {
					ato="[One-Time]";
				}
				if(i.lastdate==null&&!i.locked){
					canchange=true;
				}else{
					if(i.locked) {
						canchange=false;
					}else{
						let sugosu=(new Date()).getTime()/1000-i.lastdate;
						if(sugosu>2592000/*86400000*30*/){
							canchange=true;
						}else{
							ato=Math.round(((2592000-sugosu)/86400)*100)/100;
						}
					}
				}
				let actionButtons=[];
				if(!canchange) {
					actionButtons.push(m("button.btn.btn-secondary", {
						onclick: async (e)=>{
							await API.UnlockSlot(ap.selected_serverlist.username, i.slotid);
							await ap.oninit();
							ap.selected_serverlist.content=(await API.GetRentalServerList(ap.selected_serverlist.username)).rentalservers;
							m.redraw();
						}
					}, "Unlock"));
				}
				if(!i.locked) {
					if(actionButtons.length!=0)actionButtons.push(" ");
					actionButtons.push(m("button.btn.btn-secondary", {
						onclick: async (e)=>{
							await API.LockSlot(ap.selected_serverlist.username, i.slotid);
							await ap.oninit();
							ap.selected_serverlist.content=(await API.GetRentalServerList(ap.selected_serverlist.username)).rentalservers;
							m.redraw();
						}
					}, "Lock"));
				}
				if(actionButtons.length!=0)actionButtons.push(" ");
				actionButtons.push(m("button.btn.btn-danger", {
					onclick: async (e)=>{
						await API.RemoveSlot(ap.selected_serverlist.username, i.slotid);
						await ap.oninit();
						ap.selected_serverlist.content=(await API.GetRentalServerList(ap.selected_serverlist.username)).rentalservers;
						m.redraw();
					}
				}, "Remove"));
				body_items.push(m("tr",
					m("td", i.slotid),
					m("td", i.sid),
					m("td", `${ato}|${canchange}`),
					m("td", actionButtons)
				));
			}
			renderedRentalServerField=m(frame.section, {title: "Server list for "+ap.selected_serverlist.username},
				m("div.row.pre-scrollable",
					m("table.table",
						m("thead",
							m("tr",
								m("th", {scope: "col"}, "SlotID"),
								m("th", {scope: "col"}, "ServerID"),
								m("th", {scope: "col"}, "ATO|CanChange"),
								m("th", {scope: "col"}, "Actions")
							)
						),
						m("tbody", body_items)
					)
				),
				m("div",
					m("button.btn.btn-primary", {
						onclick: async (e)=>{
							await API.AddSlot(ap.selected_serverlist.username);
							await ap.oninit();
							ap.selected_serverlist.content=(await API.GetRentalServerList(ap.selected_serverlist.username)).rentalservers;
							m.redraw();
						}
					}, "Add"),
					" ",
					m("button.btn.btn-primary", {
						onclick: async (e)=>{
							await ap.oninit();
							ap.selected_serverlist.content=(await API.GetRentalServerList(ap.selected_serverlist.username)).rentalservers;
							m.redraw();
						}
					}, "Refresh"),
					" ",
					m("button.btn.btn-secondary", {
						onclick: ()=>{
							ap.selected_serverlist.content=[];
							ap.selected_serverlist.username="";
						}
					}, "Close")
				)
			);
		}
		return m(frame.frame, {pageName: "用户中心管理", pageIcon},
			m.trust("<style>.page-item:first-child .page-link {\n\tborder-bottom-left-radius: initial;\n\tborder-top-right-radius: .25rem\n}\n\n.page-item:last-child .page-link {\n\tborder-top-right-radius: initial;\n\tborder-bottom-left-radius: .25rem\n}\n\n.page-item:not(:first-child) .page-link {\n\tmargin-top: -1px;\n\tmargin-left: initial;\n}\n\n"),
			m(frame.section, {title: "发布公告"},
				m(frame.form,
					m(frame.formInput, {
						value: ap.newAnnouncementTitle,
						style: {
							width: "90%"
						},
						oninput: (e)=>{
							ap.newAnnouncementTitle=e.target.value;
						}
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
									value:ap.newAnnouncementContent,
									oninput:(e)=>{ap.newAnnouncementContent=e.target.value;}
								})
							]
						)
					)
				),
				m(frame.button, {
					disabled: ap.newAnnouncementPublishing,
					onclick: (e)=>{
						e.preventDefault();
						ap.newAnnouncementPublishing=true;
						(async function() {
							if(!(await API.PublishAnnouncement(ap.newAnnouncementTitle,ap.newAnnouncementContent)).success) {
								return frame.showAlert("Error", "Failed to publish announcement.");
							}
							ap.newAnnouncementTitle="";
							ap.newAnnouncementContent="";
							ap.newAnnouncementPublishing=false;
							m.redraw();
						})();
					}
				}, "发布")
			),
			m(frame.section, {title: "用户列表"},
				m("div", {
					style: {
						display: "flex"
					}
				}, 
					m("div.row.pre-scrollable", {
						style: {
							height: "250px",
							"flex-grow": 1
						}
					},
						m("table.table",
							m("thead",
								m("tr",
									m("th", {scope:"col"},"UN"),
									m("th", {scope:"col"},"PC"),
									m("th", {scope:"col"},"PSW(SHA256(1..8))"),
									m("th", {scope:"col"},"Actions")
								)
							),
							m("tbody", userlist_rendered)
						)
					),
					m("nav", {style:{"margin-left":"1.5rem","margin-top":".5rem"}},
						m("ul.pagination", {
							style: {
								"flex-direction": "column",
								width: "min-content",
							}
						}, userlist_pagination_items)
					)
				),
				m("h5", "Query"),
				m("div.userlist-query",
					m("label", {style:{"margin-top":"auto","margin-bottom":"auto","margin-right":".5rem"}}, "Flags"),
					m("div", {style:{display:"flex","margin-top":"auto","margin-bottom":"auto","margin-right":".5rem"}},
						m("div.form-check", {style:{"margin-right":".2rem"}},
							m("input.form-check-input", {
								type: "checkbox",
								id: "adminFilterCheck",
								value: ap.whitelist_query_additional[0]?"on":"off",
								oninput:(e)=>{
									if(e.target.value=="off") {
										ap.whitelist_query_additional[0]=true;
									}else{
										ap.whitelist_query_additional[0]=false;
									}
									ap.oninit();
								}
							}),
							m("label.form-check-label", {
								for: "adminFilterCheck"
							}, "Admin")
						),
						m("div.form-check", {style:{"margin-right":".2rem"}},
							m("input.form-check-input", {
								type: "checkbox",
								id: "PValueFilterCheck",
								value: ap.whitelist_query_additional[1]?"on":"off",
								oninput:(e)=>{
									if(e.target.value=="off") {
										ap.whitelist_query_additional[1]=true;
									}else{
										ap.whitelist_query_additional[1]=false;
									}
									ap.oninit();
								}
							}),
							m("label.form-check-label", {
								for: "PValueFilterCheck"
							}, "P")
						),
						m("div.form-check", {style:{"margin-right":".2rem"}},
							m("input.form-check-input", {
								type: "checkbox",
								id: "BannedFilterCheck",
								value: ap.whitelist_query_additional[2]?"on":"off",
								oninput:(e)=>{
									if(e.target.value=="off") {
										ap.whitelist_query_additional[2]=true;
									}else{
										ap.whitelist_query_additional[2]=false;
									}
									ap.oninit();
								}
							}),
							m("label.form-check-label", {
								for: "BannedFilterCheck"
							}, "Banned")
						),
						m("div.form-check", {style:{"margin-right":".2rem"}},
							m("input.form-check-input", {
								type: "checkbox",
								id: "HasPCFilterCheck",
								value: ap.whitelist_query_additional[3]?"on":"off",
								oninput:(e)=>{
									if(e.target.value=="off") {
										ap.whitelist_query_additional[3]=true;
									}else{
										ap.whitelist_query_additional[3]=false;
									}
									ap.oninit();
								}
							}),
							m("label.form-check-label", {
								for: "HasPCFilterCheck"
							}, "PC!=0")
						)
					),
					m("label", {style:{"margin-top":"auto","margin-bottom":"auto","margin-right":".5rem"}}, "Username"),
					m("input.form-control", {
						value: ap.whitelist_query,
						oninput: (e)=>{
							ap.whitelist_query=e.target.value;
							ap.oninit();
						}
					})
				)
			),
			renderedRentalServerField,
			/*m(frame.section, {title: "确认码列表"},
				m("div", {style:{display:"flex"}},
					m("div.row.pre-scrollable", {style:{height:"250px"}},
						m("table.table",
							m("thead",
								m("tr",
									m("th",{scope:"col"},"Key"),
									m("th",{scope:"col"},"Content")
								)
							),
							m("tbody",
								kclNode
							)
						)
					),
					m("nav", {style:{"margin-left":"1rem"}},
						m("ul", {class:"pagination",style:{"margin-top":"auto","margin-bottom":"auto",width:"min-content","flex-direction":"column"}},
							null
						)
					)
				)
			),*/
			m(frame.section, {title: "购买记录"},
				m("p", "なんと！ローを二回押すと、詳細を見ることができるようになった！"),
				m("div", {style:{display:"flex"}},
					m("div.row.pre-scrollable", {style:{height:"250px"}},
						m("table.table",
							m("thead",
								m("tr",
									m("th",{scope:"col"},"Date"),
									m("th",{scope:"col"},"Username"),
									m("th",{scope:"col"},"Helper"),
									m("th",{scope:"col"},"Price"),
									m("th",{scope:"col"},"Helper's Price"),
									m("th",{scope:"col"},"Description")
								)
							),
							m("tbody", paymentLog_rendered)
						)
					),
					m("nav", {style:{"margin-left":"1rem"}},
						m("ul", {class:"pagination",style:{"margin-top":"auto","margin-bottom":"auto",width:"min-content","flex-direction":"column"}},
							paymentLog_pagination_items
						)
					)
				),
				m("h5", "Query"),
				m("div.plog-query",
					m("label", {style: {"margin-right":".5rem","margin-top": "auto", "margin-bottom": "auto"}}, "Username"),
					m("input.form-control", {
						value: ap.payments_query.username,
						oninput: (e)=>{
							ap.payments_query.username=e.target.value;
							ap.oninit();
						},
						style: {
							width: "10rem",
							"margin-right": "1rem"
						}
					}),
					m("label", {style:{"margin-right":".5rem","margin-top": "auto", "margin-bottom": "auto"}}, "Helper"),
					m("input.form-control", {
						value: ap.payments_query.hname,
						oninput: (e)=>{
							ap.payments_query.hname=e.target.value;
							ap.oninit();
						},
						style: {
							width: "10rem",
							"margin-right": "1rem"
						}
					}),
					m("label", {style:{"margin-right":".5rem","margin-top": "auto", "margin-bottom": "auto"}}, "Description"),
					m("input.form-control", {
						value: ap.payments_query.desc,
						oninput: (e)=>{
							ap.payments_query.desc=e.target.value;
							ap.oninit();
						},
						style: {
							width: "10rem",
							"margin-right": "1rem"
						}
					})
				)
			),
			m(frame.section, {title: "添加用户"},
				m(frame.form,
					m(frame.formInput, {
						value: ap.addUser_Username,
						style: {
							width: "90%"
						},
						oninput: (e)=>{
							ap.addUser_Username=e.target.value;
						}
					}, "用户名"),
					m(frame.formInput, {
						value: ap.addUser_Password,
						style: {
							width: "90%"
						},
						isPassword: true,
						oninput: (e)=>{
							ap.addUser_Password=e.target.value;
						}
					}, "密码")
				),
				m(frame.button, {
					disabled: ap.addUser_InProgress,
					onclick: ()=>{
						ap.addUser_InProgress=true;
						(async ()=>{
							let r=await API.AddUser(ap.addUser_Username, ap.addUser_Password);
							if(!r.success) {
								ap.addUser_InProgress=false;
								frame.showAlert("Error", r.msg);
								return m.redraw();
							}
							ap.addUser_InProgress=false;
							ap.addUser_Username="";
							ap.addUser_Password="";
							ap.oninit();
						})();
					}
				}, "添加")
			),
			m(frame.section, {title: "添加余额"},
				m(frame.form,
					m(frame.formInput, {
						value: ap.az_TargetUsername,
						style: {
							width: "90%"
						},
						oninput: (e)=>{
							ap.az_TargetUsername=e.target.value;
						}
					}, "用户名"),
					m(frame.formInput, {
						value: ap.az_Value,
						style: {
							width: "90%"
						},
						oninput: (e)=>{
							ap.az_Value=e.target.value;
						}
					}, "值")
				),
				m(frame.button, {
					disabled: ap.az_InProgress,
					onclick: ()=>{
						ap.az_InProgress=true;
						(async ()=>{
							let r=await API.AddBalance(ap.az_TargetUsername, ap.az_Value);
							if(!r.success) {
								ap.az_InProgress=false;
								frame.showAlert("Error", "Failed");
								m.redraw();
								return;
							}
							ap.az_InProgress=false;
							ap.az_TargetUsername="";
							ap.az_Value="";
							m.redraw();
						})();
					}
				}, "添加")
			)/*,
			m(frame.section, {title: "清空数据库缓存"},
				m("p", "一部のユーザのデータはメモリに cache されているため、データベースへの変更が直接にサーバーに作用できない。もしそうしたいなら下のボータンを押してね。"),
				m(frame.button, {
					disabled: ap.db_cache_clean_wip,
					onclick: ()=>{
						ap.db_cache_clean_wip=true;
						(async ()=>{
							let r=await API.ClearDBCache();
							ap.db_cache_clean_wip=false;
							if(!r.success) {
								frame.showAlert("Error", r.message);
								return;
							}
							m.redraw();
						})();
					}
				}, "クリア")
			),
			m(frame.section, {title: "Activate TEST Payment Environment"},
				m("p", "Dangerous! Don't use in production! Restart fbuc to recover."),
				m("p", "A production mode protector is working and this won't work in production"),
				m(frame.button, {
					onclick: async ()=>{
						await API.SwitchToTestPaymentEnv();
						return frame.showAlert("Done", "HAVE FUN");
					}
				},"GO TEST")
			),
			m(frame.section, {title: "Reload Modules"},
				m("p", "Reload shared modules"),
				m(frame.button, {
					onclick: async ()=>{
						await API.ReloadPV4Modules();
						return frame.showAlert("Scheduled", "Modules reload scheduled, and will be executed in a few seconds.");
					}
				}, "Reload")
			)*/
		);
	}
};

export default ap;









