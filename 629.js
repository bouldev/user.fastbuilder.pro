"use strict";(self.webpackChunkwebpages=self.webpackChunkwebpages||[]).push([[629],{3629:(e,n,o)=>{o.r(n),o.d(n,{default:()=>d});var i=o(5143),l=o.n(i),r=o(865),t=o.n(r),a=o(2641),u=o(5484);let s={loginFailed_reason:"",userbannedfor:"",tokenValue:"",mfaValue:"",inProgress:!1,goingtouc:!1,oninit:()=>{s.userbannedfor="",s.loginFailed_reason="",s.inProgress=!1,s.goingtouc=!1,s.tokenValue="",s.mfaValue=""},view:e=>t()(l().login_frame,t()("div.lowin-box.lowin-login",t()("div.lowin-box-inner",t()("form.login-form",t()("p","登录到 FastBuilder 用户中心 (Token)"),t()({view:e=>0==s.loginFailed_reason.length?null:t()("p",{style:{color:"red"}},s.loginFailed_reason)}),t()("div.lowin-group",t()("input.lowin-input",{placeholder:"",type:"text",id:"token-input-id",readonly:s.inProgress,oninput:e=>{s.tokenValue=e.target.value},value:s.tokenValue}),t()("label",{for:"token-input-id"},"FBToken")),t()("div.lowin-group",t()("input.lowin-input",{placeholder:"",type:"text",id:"mfa-input-id",readonly:s.inProgress,oninput:e=>{s.mfaValue=e.target.value},value:s.mfaValue}),t()("label",{for:"mfa-input-id"},["双重验证 ",t()("b",{style:"color:red;"},"(若未设置则禁止使用 FBToken 登录)")])),t()("div.lowin-buttondiv",t()("button.lowin-btn",{disabled:s.inProgress,class:s.goingtouc?["back-fill"]:[],onclick:e=>{e.preventDefault(),s.inProgress=!0,a.Z.LoginByToken(s.tokenValue,s.mfaValue).then((e=>{if(!e.success)return e.banned?void t().route.set("/login/banned",{reason:e.reason}):(s.loginFailed_reason=e.message,s.inProgress=!1,t().redraw(),void u.Z.FinishLogin(e));s.goingtouc=!0,t().redraw(),t().route.set("/router/enter")}))}},"登录")),t()("div.text-foot",t()("a",{href:"#",onclick:e=>{e.preventDefault(),t().route.set("/login")}},"登录"),t()("br"),t()("hr"),t()("a",{href:"#",onclick:e=>{e.preventDefault(),t().route.set("/login/register")}},"注册"))))))};const d=s}}]);