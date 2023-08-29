import m from "mithril";
import frame from "../theme/frame";
import API from "../api/api";

const pageIcon=`<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 576 512"><path d="M528 288h-92.1l46.1-46.1c30.1-30.1 8.8-81.9-33.9-81.9h-64V48c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v112h-64c-42.6 0-64.2 51.7-33.9 81.9l46.1 46.1H48c-26.5 0-48 21.5-48 48v128c0 26.5 21.5 48 48 48h480c26.5 0 48-21.5 48-48V336c0-26.5-21.5-48-48-48zm-400-80h112V48h96v160h112L288 368 128 208zm400 256H48V336h140.1l65.9 65.9c18.8 18.8 49.1 18.7 67.9 0l65.9-65.9H528v128zm-88-64c0-13.3 10.7-24 24-24s24 10.7 24 24-10.7 24-24 24-24-10.7-24-24z"></path></svg>`;

let phoenixdownloads={
	view:(vnode)=>{
		return m(frame.frame, {pageName: "下载  PhoenixBuilder",pageIcon},
			m(frame.section, {title: "从源码构建"},
				m("p", "您可以从源码构建 PhoenixBuilder 以使用。"),
				m("p", "git clone git@github.com:LNSSPsd/PhoenixBuilder.git"),
				m("p", "cd PhoenixBuilder"),
				m("p", "make current"),
				m("p", "# 初次使用在执行完一次 make 后执行下面的命令"),
				m("p", "sed \"s/urrentProtocol byte = 10/urrentProtocol byte = 8/g\" ~/go/pkg/mod/github.com/sandertv/go-raknet@v1.9.1/conn.go"),
				m("p", "make current"),
				m("p", "./build/phoenixbuilder")
			),
			m(frame.section, {title: "下载预构建版本"},
				m("p", "我们也为每个稳定版本提供了预先构建好的二进制文件供您使用，点击以下链接以查看。"),
				m("a", {href:"https://github.com/LNSSPsd/PhoenixBuilder/releases/latest"},"https://github.com/LNSSPsd/PhoenixBuilder/releases/latest")
			)
		);
	}
};
export default phoenixdownloads;
