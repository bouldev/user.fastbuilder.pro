import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";
import $ from "jquery";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512"><path d="M128 224c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.4-32-32-32zM418.6 58.1C359.2 9.3 281.3-10 204.6 5 104.9 24.4 24.7 104.2 5.1 203.7c-16.7 84.2 8.1 168.3 67.8 230.6 47.3 49.4 109.7 77.8 167.9 77.8 8.8 0 17.5-.6 26.1-2 24.2-3.7 44.6-18.7 56.1-41.1 12.3-24 12.3-52.7.2-76.6-6.1-12-5.5-26.2 1.8-38 7-11.8 18.7-18.4 32-18.4h72.2c46.4 0 82.8-35.7 82.8-81.3-.2-76.4-34.3-148.1-93.4-196.6zM429.2 288H357c-29.9 0-57.2 15.4-73 41.3-16 26.1-17.3 57.8-3.6 84.9 5.1 10.1 5.1 22.7-.2 32.9-2.6 5-8.7 13.7-20.6 15.6-49.3 7.7-108.9-16.6-152-61.6-48.8-50.9-69-119.4-55.4-188 15.9-80.6 80.8-145.3 161.6-161 62.6-12.3 126.1 3.5 174.3 43.1 48.1 39.5 75.7 97.6 75.9 159.6 0 18.6-15.3 33.2-34.8 33.2zM160 128c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.4-32-32-32zm96-32.1c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32c0-17.6-14.3-32-32-32zm96 32.1c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32z"></path></svg>`;

let themePage={
	theme_name: "加载中",
	pr_themes: [],
	oninit:async ()=>{
		let theme_res=await API.GetThemeInfo();
		if(theme_res.success) {
			themePage.theme_name=theme_res.data;
		}
		$.get("assets/themes.json", (res)=> {
			themePage.pr_themes=[];
			for(let i in res) {
				let rn=String(i);
				if(themePage.pr_themes.length!=0) {
					themePage.pr_themes.push(m("hr"));
				}
				themePage.pr_themes.push([
					m("p",["名称: ",m("b", res[i].name)]),
					//m("p",["作者: ",m("b", res[i].author)]),
					m("p",["CSS 数: ",m("b", res[i].stylesheets.length)]),
					m("p",res[i].description),
					m("button.btn.btn-primary", {
						onclick: async ()=>{
							let r=await API.ApplyTheme(rn);
							if(!r.success) {
								return frame.showAlert("error", r.message);
							}
							location.reload(true);
						}
					}, "应用")
				]);
			}
			m.redraw();
		});
	},
	view:(vnode)=>{
		return m(frame.frame, {pageName:"主题",pageIcon},
			m(frame.section, {title: "切换主题"},
				m("h5", "已选主题: "+themePage.theme_name),
				themePage.pr_themes
			)
		);
	}
};

export default themePage;