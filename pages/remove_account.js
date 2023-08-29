import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

// A page icon for the page of removing the user permanently by themselves
const pageIcon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;

let ru={
	passwordInputValue: "",
	view: function(vnode){
		return m(frame.frame, {pageName: "注销用户", pageIcon},
				m(frame.section, {title: "注销用户"},
					m(frame.sectionGeneralText, "注销后您的所有数据都将从数据库中被移除，视为主动放弃帐号并无法再度找回，请悉知。"),
					m(frame.formInput, {
						isPassword: true,
						value: ru.passwordInputValue,
						oninput: function(e){ru.passwordInputValue=e.target.value;}
					}, "当前密码"),
					m(frame.button, {
						onclick: async ()=>{
							if(!(await frame.question("确认注销", "请确认是否要注销用户。此操作不可以撤回。"))){
								return;
							}
							let rs=await API.RemoveSelf(ru.passwordInputValue);
							if(!rs.success) {
								frame.showAlert("注销失败", rs.message);
								return;
							}
							location.href="/remove-user.sumi.html";
						}
					}, "确认注销")
				)
		);
	}
};

export default ru;

