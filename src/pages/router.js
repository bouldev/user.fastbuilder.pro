import m from "mithril";
import API from "../api/api";

let defaultRouter={
	oninit:(a)=>{
		if(a.attrs.secret) {
			API.SetSecret(a.attrs.secret);
		}
		if(API.Inited()!=2) {
			(async()=>{
				await API.DoInit();
				if(!localStorage.getItem("username")) {
					m.route.set("/login");
					return;
				}else if (localStorage.getItem("is_dotcs")){

					m.route.set(a.attrs.to||"/profile");
				} else {
					m.route.set(a.attrs.to||"/announcements");
				}
			})();
		}else{
			m.route.set(a.attrs.to||"/announcements");
		}
	},
	view:()=>{
		return m("h2", "Loading...");
	}
};

export default defaultRouter;