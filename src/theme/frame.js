import m from "mithril";
import $ from "jquery";
import base64 from "crypto-js/enc-base64";
import utf8encode from "crypto-js/enc-utf8";
import menu from "../consts/menu";
import API from "../api/api";

let initVal=1;

let menuEntry={
	view: (vnode)=>{
		return m(doClassReplace("li.sidebarNav-item"),
			m("a",{
					href: "#!"+vnode.attrs.item.route,
					class: (m.route.get()==vnode.attrs.item.route)?"sidebarNav-link ember-view sidebarNav-link--active":"sidebarNav-link ember-view",
					onclick: (e)=>{
						e.preventDefault();
						m.route.set(vnode.attrs.item.route);
					}
				},
				m.trust(base64.parse(vnode.attrs.item.icon).toString(utf8encode)),
				m("span.sidebarNav-link-text", vnode.attrs.item.name),
				m.trust(`<svg class="sidebarNav-link-chevron" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><path d="M23.624 13.98L9.732.45C9.43.148 9.05 0 8.594 0c-.455 0-.76.15-1.14.448C7.153.748 7 1.122 7 1.495c0 .374.152.748.455 1.047l12.903 12.486L7.455 27.514c-.303.298-.455.673-.455 1.047s.152.748.455 1.05c.532.52 1.594.52 2.125 0l13.89-13.534c.304-.3.455-.673.455-1.047.153-.45.078-.824-.3-1.05z"></path></svg>`)
			)
		);
	}
};

let stylesheets=[];
let replacemap={};
let removemap={};

let replacecache={};

function parseClassReplaceSheet(force) {
	if(force) {
		stylesheets=[];
		replacemap={};
		removemap={};
	}else{
		if(stylesheets.length!=0) {
			return new Promise((cb,reject)=>{cb();});
		}
	}
	return new Promise((cb)=>{
		$.getJSON("assets/themes.json",async (themes)=>{
			let themeConf=localStorage.getItem("theme")||"bootstrap";
			/*if(!themes[localStorage.getItem("theme")]) {
				throw new Error("Lost `theme` storage item.");
			}*/
			let current=themes[themeConf];
			for(let i of current.stylesheets) {
				stylesheets.push(m("link",{rel:"stylesheet", href:i}));
			}
			//stylesheets=current.stylesheets;
			for(let replacesheet of current.replacesheets) {
				let rs=await new Promise((cb2)=>{
					$.get(replacesheet,cb2);
				});
				let rssf=rs.matchAll(/(.{1,}?)($|\n)/g);
				for(let i=rssf.next();i.done!=true;i=rssf.next()) {
					let line=i.value[1];
					let replacematch=line.match(/^\.(.*?)\>(.*)$/);
					let removematch=line.match(/^\.(.*?)\!(.*)$/);
					if(replacematch) {
						replacemap[replacematch[1]]=replacematch[2].split(" ");
					}else if(removematch) {
						removemap[removematch[1]]=true;
						//replacemap[removematch[1]]=[];
					}
				}
			}
			replacecache={};
			initVal--;
			m.redraw();
			cb();
		});
	});
}


function doClassReplace(orig) {
	if(replacecache[orig])return replacecache[orig];
	let oar=orig.split(".");
	for(let i=oar.length-1;i>=0;i--) {
		if(i==0)continue;
		let rep=replacemap[oar[i]];
		if(rep) {
			for(let j=0;j<rep.length;j++) {
				oar.push(rep[j]);
			}
		}
		if(removemap[oar[i]]) {
			oar.splice(i,1);
		}
	}
	return replacecache[orig]=oar.join(".");
}

let appendPart=null;

let frame={
	sidebarOpen: false,
	oninit: (vnode)=>{
		if(API.Inited()!=2) {
			m.route.set("/router/enter", {to:m.route.get()});
			return;
		}else{
			(async()=>{
				await API.DoInit();
				if(!localStorage.getItem("username")) {
					m.route.set("/login");
					return;
				}
			})();
		}
		init();
	},
	view: (vnode)=> {
		if(initVal!=0) {
			return m("h2", `Loading...(${initVal})`);
		}
		let menuEntries=[];
		for(let i of menu) {
			if(i.reserved)continue;
			if(i.admin&&!localStorage.getItem("admin"))continue;
			if(i.nodotcs&&localStorage.getItem("is_dotcs"))continue;
			menuEntries.push(m(menuEntry, {item: i}));
		}
		return [
			stylesheets,
			appendPart,
			m("main.ember-application",
				m("div.ember-view",
					m(doClassReplace("div.container"),
						m(doClassReplace("span.sidebar-toggler.at-root"),
							m("svg.sidebar-toggler-open.at-root", {
								xmlns: "http://www.w3.org/2000/svg",
								width: "20",
								height: "20",
								viewBox: "0 0 20 20",
								onclick: ()=>{
									frame.sidebarOpen=true;
								}
							}, m.trust(`<path d="M0 6.554h14.77v1.97H0v-1.97zm0 4.923h18.707v1.97H0v-1.97zm16.738 6.892H0v-1.9l16.738-.07v1.96zM0 1.63h19.692V3.6H0V1.63z"></path>`)),
							m("span.sidebar-toggler-name","用户中心")
						),
						m("div.container-sidebar.sidebar.ember-view"+(frame.sidebarOpen?".container-sidebar--open":""),
							m("span.sidebar-toggler",
								m("svg.sidebar-toggler-open", {
									xmlns: "http://www.w3.org/2000/svg",
									width: "20",
									height: "20",
									viewBox: "0 0 20 20",
									onclick: ()=>{
										frame.sidebarOpen=true;
									}
								}, m.trust(`<path d="M0 6.895h9.387v1.252H0V6.895zm0 3.128h11.89v1.25H0v-1.25zm10.64 4.38H0V13.2l10.64-.047v1.25zM0 3.767h12.516v1.25H0v-1.25zm16.767 2.52v1.075l2.028 1.96-2.028 1.962v1.077L20 9.33"></path>`)),
								m("span.sidebar-toggler-close",{
									onclick: ()=>{
										frame.sidebarOpen=false;
									}
								} , "✕")
							),
							m("div.sidebarUser.ember-view",
								m("img.sidebarUser-image", {src:"assets/user.png"}),
								m("span.sidebarUser-name", localStorage.getItem("is_dotcs")?localStorage.getItem("d_username"):localStorage.getItem("username")), 
								m("span.sidebarUser-title"/*nothing*/),
								m(doClassReplace("span.button.at-sidebarUser.sidebarUser-logout"), {
									onclick: async()=>{
										await API.Logout();
										m.route.set("/login");
									}
								}, "Logout")
							),
							m(doClassReplace("ul.sidebarNav.at-sidebar.ember-view"), menuEntries)
						),
						m("div.container-wrapper",
							m("div.container-content.at-userProfile",
								m("div.sectionTitle.at-Profile.ember-view",
									m("span.sectionTitle-content",
										m.trust(vnode.attrs.pageIcon),
										m("span.sectionTitle-text", vnode.attrs.pageName)
									)
								),
								vnode.children
							)
						)
					)
				)
			)
		];
	}
};

function init() {
	return parseClassReplaceSheet();
}

function reinit() {
	return parseClassReplaceSheet(true);
}


const section={
	view:(vnode)=>{
		return m("div.ember-view",
			m("div.userProfile-section",
				m("h2.userProfile-section-title", vnode.attrs.title),
				vnode.children
			)
		);
	}
};
export {section};

let sectionTitle={
	view:(vnode)=>{
		return m("h2.userProfile-section-title", vnode.attrs, vnode.children);
	}
};
export {sectionTitle};

let sectionGeneralText={
	view:(vnode)=>{
		return m("p.defaultModal-contact-text", vnode.attrs, vnode.children);
	}
};
export {sectionGeneralText};

export {frame, init, reinit};


let modal={
	view:(vnode)=>{
		return m("div.modal.fade",{id:"defaultModal",tabindex:"-1",role:"dialog","aria-labelledby":"defaultModalLabel","aria-hidden":"true"},
			m("div.modal-dialog", {role:"document"},
				m("div.modal-content",
					m("div.modal-header",
						m("h5.modal-title",{id:"defaultModalLabel"}, vnode.attrs.title),
						vnode.attrs.closable?m("button.close", {type:"button","data-dismiss":"modal","aria-label":"Close"},
							m("span",{"aria-hidden":true}, m.trust("&times;"))
						):null
					),
					m("div.modal-body",vnode.attrs.content),
					m("div.modal-footer",
						vnode.attrs.buttons
					)
				)
			)
		);
	},
	oncreate:(vnode)=>{
		$(vnode.dom).modal({
			backdrop:"static",
			keyboard:false,
			show: true
		});
		$(vnode.dom).modal("show");
	}
};

function question(title, content, danger) {
	return new Promise((r)=>{
		appendPart=m({
			view: (vnode)=>{
				let modalRoot=m(modal,{
					title,
					content,
					buttons: [
						m(`button.btn.${danger?"btn-danger":"btn-primary"}`, {
								onclick: (e)=>{
									e.preventDefault();
									$(modalRoot.dom).modal("hide");
									appendPart=null;
									m.redraw();
									r(true);
								}
							},
							"Yes"
						),
						m(`button.btn.btn-secondary`, {
								onclick: (e)=>{
									e.preventDefault();
									$(modalRoot.dom).modal("hide");
									appendPart=null;
									m.redraw();
									r(false);
								}
							},
							"No"
						)
					]
				});
				return modalRoot;
			}
		});
		m.redraw();
	});
}

function showAlert(title, content) {
	return new Promise((r)=>{
		appendPart=m({
			view: (vnode)=>{
				let modalRoot=m(modal,{
					title,
					content,
					buttons: [
						m("button.btn.btn-primary", {
								onclick: (e)=>{
									e.preventDefault();
									$(modalRoot.dom).modal("hide");
									appendPart=null;
									m.redraw();
									r();
								}
							},
							"OK"
						)
					]
				});
				return modalRoot;
			}
		});
		m.redraw();
	});
}

function showIframe(title, url) {
	return new Promise((r)=>{
		appendPart=m({
			view: (vnode)=>{
				let modalRoot=m(modal,{
					title,
					content: m("iframe", {src: url, style:"transform:scale(2) translate(13%);"}),
					buttons: [
						m("button.btn.btn-primary", {
								onclick: (e)=>{
									e.preventDefault();
									$(modalRoot.dom).modal("hide");
									appendPart=null;
									m.redraw();
									r();
								}
							},
							"OK"
						)
					]
				});
				return modalRoot;
			}
		});
		m.redraw();
	});
}

function getInput(title, content, tip, secret, danger) {
	let inputContent="";
	return new Promise((r)=>{
		appendPart=m({
			view: (vnode)=>{
				let modalRoot=m(modal,{
					title,
					content: m("div",
						m("p", content),
						m("div.input-group",
							m("span.input-group-text", tip),
							m("input.form-control", {
								type:secret?"password":"text",
								value:inputContent,
								oninput:(e)=>{
									inputContent=e.target.value;
								}
							})
						)
					),
					buttons: [
						m(`button.btn.${danger?"btn-danger":"btn-primary"}`, {
								onclick: (e)=>{
									e.preventDefault();
									$(modalRoot.dom).modal("hide");
									appendPart=null;
									m.redraw();
									r(inputContent);
								}
							},
							"Confirm"
						),
						m(`button.btn.btn-secondary`, {
								onclick: (e)=>{
									e.preventDefault();
									$(modalRoot.dom).modal("hide");
									appendPart=null;
									m.redraw();
									r(false);
								}
							},
							"Cancel"
						)
					]
				});
				return modalRoot;
			}
		});
		m.redraw();
	});
}

function getCaptchaInput(title, content, tip, secret, danger) {
	let inputContent="";
	let arand=Math.random()*114514;
	return new Promise((r)=>{
		appendPart=m({
			view: (vnode)=>{
				let modalRoot=m(modal,{
					title,
					content: m("div",
						m("p", content),
						m("img", {style:{"background-color":"white"},src:API.GetAPI("captcha")+"&rand="+arand}),
						m("br"),
						m("div.input-group",
							m("span.input-group-text", tip),
							m("input.form-control", {
								type:secret?"password":"text",
								value:inputContent,
								oninput:(e)=>{
									inputContent=e.target.value;
								}
							})
						)
					),
					buttons: [
						m(`button.btn.${danger?"btn-danger":"btn-primary"}`, {
								onclick: (e)=>{
									e.preventDefault();
									$(modalRoot.dom).modal("hide");
									appendPart=null;
									m.redraw();
									r(inputContent);
								}
							},
							"Confirm"
						),
						m(`button.btn.btn-secondary`, {
								onclick: (e)=>{
									e.preventDefault();
									$(modalRoot.dom).modal("hide");
									appendPart=null;
									m.redraw();
									r(false);
								}
							},
							"Cancel"
						)
					]
				});
				return modalRoot;
			}
		});
		m.redraw();
	});
}

function placeAppendPart(ap) {
	appendPart=ap;
	m.redraw();
}

let formInput={
	view:(vnode)=>{
		return m("div.userProfile-form-item",
			m("label.userProfile-form-label",
				vnode.children,
				m(doClassReplace("input.userProfile-form-input.form-input.ember-text-field.ember-view"), {
					type:vnode.attrs.isPassword?"password":"text",
					...vnode.attrs
				})
			)
		);
	}
};

let button={
	view:(vnode)=>{
		return m(doClassReplace("button.button.button--primary.asyncButton.ember-view"), {
				...vnode.attrs
			},
			m("div.asyncButton-content",
				m("span.asyncButton-label",vnode.children),
				m.trust(`<svg class="asyncButton-loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="#fff"><path opacity=".1" d="M14 0h4v8h-4z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0"></animate></path><path opacity=".1" d="M25.898 3.274l2.828 2.828-5.656 5.656-2.828-2.828z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.125s"></animate></path><path opacity=".1" d="M32 14v4h-8v-4z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.25s"></animate></path><path opacity=".1" d="M28.726 25.898l-2.828 2.828-5.656-5.656 2.828-2.828z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.375s"></animate></path><path opacity=".1" d="M18 32h-4v-8h4z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.5s"></animate></path><path opacity=".1" d="M6.102 28.726l-2.828-2.828 5.656-5.656 2.828 2.828z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.675s"></animate></path><path opacity=".1" d="M0 18v-4h8v4z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.75s"></animate></path><path opacity=".1" d="M3.274 6.102l2.828-2.828 5.656 5.656-2.828 2.828z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.875s"></animate></path></svg>`)
			)
		);
	}
};

let abutton={
	view:(vnode)=>{
		return m(doClassReplace("a.button.button--primary.asyncButton.ember-view"), {
				role: "button",
				...vnode.attrs
			},
			m("div.asyncButton-content",
				m("span.asyncButton-label",vnode.children),
				m.trust(`<svg class="asyncButton-loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="#fff"><path opacity=".1" d="M14 0h4v8h-4z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0"></animate></path><path opacity=".1" d="M25.898 3.274l2.828 2.828-5.656 5.656-2.828-2.828z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.125s"></animate></path><path opacity=".1" d="M32 14v4h-8v-4z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.25s"></animate></path><path opacity=".1" d="M28.726 25.898l-2.828 2.828-5.656-5.656 2.828-2.828z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.375s"></animate></path><path opacity=".1" d="M18 32h-4v-8h4z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.5s"></animate></path><path opacity=".1" d="M6.102 28.726l-2.828-2.828 5.656-5.656 2.828 2.828z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.675s"></animate></path><path opacity=".1" d="M0 18v-4h8v4z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.75s"></animate></path><path opacity=".1" d="M3.274 6.102l2.828-2.828 5.656 5.656-2.828 2.828z"><animate attributeName="opacity" from="1" to=".1" dur="1s" repeatCount="indefinite" begin="0.875s"></animate></path></svg>`)
			)
		);
	}
};

let form={
	view:(vnode)=>{
		return m("form.userProfile-form",vnode.attrs,vnode.children);
	}
};

function getInitVal() {
	return initVal;
}

/*setInterval(async ()=>{
	if(localStorage.getItem("username")) {
		let ka=API.KeepAlive();
		if(ka.logout) {
			localStorage.removeItem("username");
			m.route.set("/login");
		}
	}
}, 3000);*/

API.SetErrorHandler((message)=>{
	if(message==401||message=="Login Required") {
		localStorage.removeItem("username");
		m.route.set("/login");
		return;
	}
	showAlert("出错了", message);
});

let frameExports= {
	frame,init,reinit,sectionGeneralText,sectionTitle,section,modal,question,
	formInput,button,form,doClassReplace,abutton,showAlert,placeAppendPart, getInput,
	getInitVal, getCaptchaInput, showIframe
};
export default frameExports;

