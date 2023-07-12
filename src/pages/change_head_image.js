import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 448 512"><path d="M313.6 304c-28.7 0-42.5 16-89.6 16-47.1 0-60.8-16-89.6-16C60.2 304 0 364.2 0 438.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-25.6c0-74.2-60.2-134.4-134.4-134.4zM400 464H48v-25.6c0-47.6 38.8-86.4 86.4-86.4 14.6 0 38.3 16 89.6 16 51.7 0 74.9-16 89.6-16 47.6 0 86.4 38.8 86.4 86.4V464zM224 288c79.5 0 144-64.5 144-144S303.5 0 224 0 80 64.5 80 144s64.5 144 144 144zm0-240c52.9 0 96 43.1 96 96s-43.1 96-96 96-96-43.1-96-96 43.1-96 96-96z"></path></svg>`;

let changeHeadImagePage={
	selectedPicture: null,
	oninit: async ()=>{
		
	},
	view: (vnode)=>{
		return m(frame.frame, {pageName: "修改头像", pageIcon},
			m(frame.section, {title: "修改头像"},
				m("div.mb-3",
					m("label.form-label", {for:"sel-img-i"}, "选择图片"),
					m("input.form-control", {
						type:"file",
						id:"sel-img-i",
						oninput:(e)=>{
							changeHeadImagePage.selectedPicture=e.files[0];
						}	
					})
				),
				m("button.btn.btn-primary", {
					disabled: changeHeadImagePage.selectedPicture===null,
					onclick:()=>{
						let selPicture=changeHeadImagePage.selectedPicture;
						changeHeadImagePage.selectedPicture=null;
						(async ()=>{
							let bytes=new Uint8Array(await selPicture.arrayBuffer());
							let len=bytes.byteLength;
							let bin="";
							for(let i=0;i<len;i++) {
								bin+=String.fromCharCode(bytes[i]);
							}
							let result=await API.ChangeHeadImage(window.btoa(bin));
							if(!result.success) {
								await frame.showAlert("失败", result.message);
							}
						})();
					}
				}, "提交")
	}
};

export default changeHeadImagePage;