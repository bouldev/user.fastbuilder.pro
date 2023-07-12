const m=require("mithril");
const API=require("../../api/api").default;

let initedPage=false;

module.exports={
	login_frame: {
		oninit: ()=>{
			if(localStorage.getItem("username")) {
				m.route.set("/router/enter");
				return;
			}
			initedPage=true;
			(async()=>{
				await API.DoInit();
				if(localStorage.getItem("username")) {
					m.route.set("/router/enter");
					return;
				}
			})();
		},
		view: (vnode)=> {
			if(!initedPage) {
				return m("h2", "Loading...");
			}
			return [
				m.trust(`<link rel="stylesheet" href="assets/css/auth.css"><link rel="stylesheet" href="assets/css/login-custom.css">`),
				m("div.lowin",
					m("div.lowin-brand",
						m("img.lighticon",{src:"fastbuilder.png",alt:"logo"}),
						m("img.darkeicon",{src:"fbbluelight.png",alt:"logo"})
					),
					m("div.lowin-wrapper", vnode.children),
					/*m("footer.lowin-footer", {style:{bottom:"-4rem",position:"absolute",width:"100%","text-align":"center"}},
						m("a", {href: "http://beian.miit.gov.cn"}, "ICP备案:闽ICP备20009638号-1")
					)*/
				)
			];
		}
	}
};