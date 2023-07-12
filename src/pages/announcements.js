import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 576 512"><path d="M544 184.88V32.01C544 23.26 537.02 0 512.01 0H512c-7.12 0-14.19 2.38-19.98 7.02l-85.03 68.03C364.28 109.19 310.66 128 256 128H64c-35.35 0-64 28.65-64 64v96c0 35.35 28.65 64 64 64l-.48 32c0 39.77 9.26 77.35 25.56 110.94 5.19 10.69 16.52 17.06 28.4 17.06h106.28c26.05 0 41.69-29.84 25.9-50.56-16.4-21.52-26.15-48.36-26.15-77.44 0-11.11 1.62-21.79 4.41-32H256c54.66 0 108.28 18.81 150.98 52.95l85.03 68.03a32.023 32.023 0 0 0 19.98 7.02c24.92 0 32-22.78 32-32V295.13c19.05-11.09 32-31.49 32-55.12.01-23.64-12.94-44.04-31.99-55.13zM127.73 464c-10.76-25.45-16.21-52.31-16.21-80 0-14.22 1.72-25.34 2.6-32h64.91c-2.09 10.7-3.52 21.41-3.52 32 0 28.22 6.58 55.4 19.21 80h-66.99zM240 304H64c-8.82 0-16-7.18-16-16v-96c0-8.82 7.18-16 16-16h176v128zm256 110.7l-59.04-47.24c-42.8-34.22-94.79-55.37-148.96-61.45V173.99c54.17-6.08 106.16-27.23 148.97-61.46L496 65.3v349.4z"></path></svg>`;


let announcementsPage={
	announcements: [],
	oninit: async()=>{
		let announcements=await API.FetchAnnouncements();
		if(Array.isArray(announcements)) {
			announcementsPage.announcements=announcements;
		}else{
			while(announcements.is_2fa) {
				let tfacode=await frame.getInput("双重验证", "您已启用双重验证，请输入您的 Google Authenticator (或任意密码器) 中显示的验证码", "验证码", false, false);
				if(tfacode===false) {
					location.href="/logout.web";
				}
				let tfa_res=await API.FinishLogin2FA(tfacode);
				if(!tfa_res.success) {
					await frame.showAlert("错误", tfa_res.message);
					continue;
				}
				announcementsPage.oninit();
				return;
			}
		}
		m.redraw();
	},
	view: (vnode)=>{
		let announcementFields=[];
		//for(let i=0;i<10;i++) {
		//	announcementFields.push(m("img",{width:754,height:75,src:"/assets/banner.png",style:{"margin-bottom":"1rem"}}));
		//}
		for(let i of announcementsPage.announcements) {
			let rc=String(i.content).replace(/\n/g,"<br/>");
			let uniqid=String(i.uniqueId);
			announcementFields.push(m(frame.section, {title: i.title},
				localStorage.getItem("admin") ? m("p",m("a", {
					style:{color:"red"},
					href:"#",
					onclick:async (e)=>{
						e.preventDefault();
						let ur=await frame.question("Remove announcement","Sure?",true);
						if(!ur)return;
						let response=await API.RemoveAnnouncement(uniqid);
						if(!response.done) {
							return frame.showAlert("Error", "Failed to remove announcement.");
						}
						announcementsPage.oninit();
					}
				}, "Delete")) : null,
				m("p", `Author: ${i.author}`),
				m("p", `Date: ${i.date}`),
				m(frame.sectionGeneralText, m.trust(rc)),
				[m("a",{href:"#",onclick:async(e)=>{
					e.preventDefault();
					let res=await API.VoteAnnouncement(uniqid, "up");
					if(!res.success) {
						return frame.showAlert("error",res.message);
					}
					i.upvotes=res.update.upvotes;
					m.redraw();
				}},"支持")," ",m("label",i.upvotes)," | ",
				 m("a",{href:"#",onclick:async(e)=>{
					e.preventDefault();
					let res=await API.VoteAnnouncement(uniqid, "down");
					if(!res.success) {
						return frame.showAlert("error",res.message);
					}
					i.downvotes=res.update.downvotes;
					m.redraw();
				}},"反对")," ",m("label",i.downvotes)]
			));
		}
		return m(frame.frame, {pageName: "公告", pageIcon},
			announcementFields
		);
	}
};

export default announcementsPage;