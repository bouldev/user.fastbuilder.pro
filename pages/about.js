import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon = `<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 512 512"><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm0-338c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"></path></svg>`;

let ap = {
	view: (vnode) => {
		return m(frame.frame, { pageName: "关于 FastBuilder 用户中心", pageIcon },
			m(frame.section, { title: "相关信息" },
				m("p", "FastBuilder User Center"),
				m("p", "(Based on Mithril.JS)"),
				m("p", "Copyright © 2019-2023 FastBuilder Dev. Group, Ruphane, Bouldev"),
				//m("p", "如有任何问题可通过 Email 联系我们："),
				//m("p", "Email: ", m("a", {href: "mailto:admin@boul.dev"}, "admin@boul.dev")),
				//m("p", "若您使用 QQ邮箱 发送邮件，可能会因为被判定为 spam 而延迟回信。"),
				//m("p", "若您发送的邮件不包含有效的一般人类可读信息，则我们可能会忽略您的邮件或永久屏蔽您的信箱，对此可能带来的不便深表歉意。"),
				m("p", [m("a", { href: "https://fastbuilder.pro/privacy-policy.html" }, "隐私策略"), " ", m("a", { href: "https://fastbuilder.pro/enduser-license.html" }, "使用协议")])
			),
			localStorage.getItem("is_dotcs") ?
				m(frame.section, { title: "DotCS相关信息" },
					m("p", "Dream Connect User Center"),
					m("p", "(Based on AdminLTE)"),
					m("p", "Copyright © 2022-2023 万载县幻梦互联网服务工作室. All rights reserved."),
					m("p", "如有任何问题有关本工作室的问题可通过 Email 联系我们："),
					m("p", "Email: ", m("a", { href: "mailto:uc@mcppl.cn" }, "uc@mcppl.cn")),
					m("p", [
						m("a", { href: "https://zeus.mcppl.cn/doc/privacy_policy" }, "幻梦互联隐私策略"), " ",
						m("a", { href: "https://zeus.mcppl.cn/doc/enduser_licensel" }, "幻梦互联用户协议"), " ",
						m("a", { href: "https://zeus.mcppl.cn/doc/fastbuilder_login.html" }, "DotCS 用户协议(FB用户中心篇)"), " ",
						m("a", { href: "https://zeus.mcppl.cn/doc/fastbuilder_login_privacy_processing.html" }, "DotCS 用户协议-隐私处理(FB用户中心篇)"),
					])
				) : null,
			!localStorage.getItem("is_dotcs") ? m(frame.section, { title: "联系我们" },
				localStorage.getItem("is_dotcs") ? m("p", "请通过邮箱联系 DotCS,邮箱:", m("a", { href: "mailto:uc@mcppl.cn" }, "uc@mcppl.cn"), "。") : m("p", "您可以点按下面的联络按钮来进入联络界面与用户中心管理员进行联系。"),
				localStorage.getItem("is_dotcs") ? null : m(frame.button, { onclick: () => { m.route.set("/contact-us"); } }, "联络")
			): null
		);
	}
};
export default ap;
