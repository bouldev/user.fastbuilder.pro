"use strict";(self.webpackChunkwebpages=self.webpackChunkwebpages||[]).push([[685],{5685:(e,n,r)=>{r.r(n),r.d(n,{default:()=>l});var i=r(865),o=r.n(i),a=r(578),t=r(2641);const s='<svg class="sectionTitle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M224 96.1v48.8l29.7 29.7c-6.8-34.8 3.5-70.3 28.5-95.3 20.3-20.3 47.2-31.2 75-31.2h1.2L301 105.3l15.1 90.6 90.6 15.1 57.3-57.3c.3 28.3-10.6 55.5-31.2 76.1-9.3 9.3-20.2 16.4-31.8 21.6 1.8 1.6 3.9 2.9 5.6 4.6l30.7 30.7c10.5-6.3 20.5-13.9 29.4-22.9 38.1-38.1 53.7-94.3 40.7-146.6C504.4 105 495 95.4 483 92c-12.2-3.4-25.2.1-34 9l-58.7 58.6-32.4-5.4-5.4-32.4 58.6-58.6c8.9-8.9 12.3-21.9 8.9-34-3.3-12.1-13-21.5-25.2-24.5-53.2-13.2-107.9 2-146.6 40.6C238 55.5 229.7 67 222.9 79.2l1.1.8v16.1zM106 454c-12.8 12.8-35.3 12.8-48.1 0-6.4-6.4-10-15-10-24 0-9.1 3.5-17.6 10-24l134.4-134.4-33.9-33.9L24 372C8.5 387.5 0 408.1 0 430s8.5 42.5 24 58 36.1 24 58 24 42.5-8.5 58-24l100.9-100.9c-9.7-15.8-15.2-33.8-15.7-52.1L106 454zm395.1-58.3L384 278.6c-23.1-23.1-57.6-27.6-85.4-13.9L192 158.1V96L64 0 0 64l96 128h62.1l106.6 106.6c-13.6 27.8-9.2 62.3 13.9 85.4l117.1 117.1c14.6 14.6 38.2 14.6 52.7 0l52.7-52.7c14.5-14.6 14.5-38.2 0-52.7z"></path></svg>';let c={shouldrender:!1,okane:-1,kakunincode:"",kakunincodeLocked:!1,confirmInProgress:!1,confirmTrustDivContent:"",finishConfError:"",finishingConf:!1,quickAddError:"",quickAddWorkingProcess:[!1,!1,!1,!1],removeAllWorking:!1,addValue:"",addValueInProgress:!1,current_exrate:"1 USD = 7 CNY",paypal_usd_num:0,prepared_paypal_pay:!1,oninit:async()=>{c.addValue="",c.addValueInProgress=!1,c.prepared_paypal_pay=!1,c.okane=await t.Z.GetBalance(),c.current_exrate="",0!=c.okane||localStorage.getItem("admin")?c.shouldrender=!0:c.shouldrender=!1,o().redraw()},view:e=>c.shouldrender?o()(a.ZP.frame,{pageName:"收银台",pageIcon:s},o()(a.ZP.section,{title:"代理余额"},o()("b",["余额(CNY): ",c.okane])),o()(a.ZP.section,{title:"确认商品"},o()(a.ZP.formInput,{value:c.kakunincode,oninput:e=>{c.kakunincodeLocked&&(c.confirmTrustDivContent=""),c.kakunincode=e.target.value}}),o()(a.ZP.button,{disabled:c.confirmInProgress,onclick:async()=>{c.confirmInProgress=!0,c.confirmTrustDivContent="",o().redraw();let e=await t.Z.PairPayment(c.kakunincode);if(!e.success)return e.list?(c.confirmTrustDivContent=e.list,c.finishConfError=e.message,c.confirmInProgress=!1,void o().redraw()):(a.ZP.showAlert("错误",e.message),c.confirmInProgress=!1,void o().redraw());c.finishConfError="",c.confirmTrustDivContent=e.list,c.confirmInProgress=!1,o().redraw()}},"显示商品列表")),""==c.confirmTrustDivContent?null:o()(a.ZP.section,{title:"确认商品列表"},o()("div",o().trust(c.confirmTrustDivContent)),""==c.finishConfError?null:o()("p",{style:{color:"red"}},c.finishConfError),""==c.finishConfError?o()(a.ZP.button,{disabled:c.finishingConf,onclick:()=>{c.finishingConf=!0,(async()=>{if(!await a.ZP.question("确认","确认完成本次支付？",!0))return c.finishingConf=!1,o().redraw();let e=await t.Z.ApprovePayment(c.kakunincode);if(c.finishingConf=!1,c.kakunincode="",c.confirmTrustDivContent="",!e.success)return a.ZP.showAlert("ERROR",e.message),c.finishConfError=e.message,o().redraw();c.oninit()})()}},"完成"):null),o()(a.ZP.section,{title:"充值"},o()("p","请输入 10 以上的整数，单位 CNY"),o()(a.ZP.form,o()(a.ZP.formInput,{value:c.addValue,style:{width:"90%"},oninput:e=>{c.addValue=e.target.value}})),o()(a.ZP.button,{onclick:async e=>{let n=parseInt(c.addValue);if(isNaN(n))return void a.ZP.showAlert("ERROR","Please input an integer");if(n<10)return void a.ZP.showAlert("ERROR","Please input an integer that greater than or equals 10.");let r=await t.Z.HelperCharge(n);r.success||a.ZP.showAlert("ERROR",r.message),location.href=r.url}},"充值")),localStorage.getItem("admin")?o()(a.ZP.section,{title:"快速添加"},c.quickAddError?o()("p",{style:{color:"red"}},c.quickAddError):null,[o()(a.ZP.button,{disabled:c.quickAddWorkingProcess[0],onclick:async()=>{c.quickAddWorkingProcess[0]=!0,o().redraw(),await t.Z.AddZanDaka(localStorage.getItem("username"),50),c.quickAddWorkingProcess[0]=!1,c.oninit()}},"添加50CNY")," ",o()(a.ZP.button,{disabled:c.quickAddWorkingProcess[1],onclick:async()=>{c.quickAddWorkingProcess[1]=!0,o().redraw(),await t.Z.AddZanDaka(localStorage.getItem("username"),200),c.quickAddWorkingProcess[1]=!1,c.oninit()}},"添加200CNY")," ",o()(a.ZP.button,{disabled:c.quickAddWorkingProcess[2],onclick:async()=>{c.quickAddWorkingProcess[2]=!0,o().redraw(),await t.Z.AddZanDaka(localStorage.getItem("username"),500),c.quickAddWorkingProcess[2]=!1,c.oninit()}},"添加500CNY")," ",o()(a.ZP.button,{disabled:c.quickAddWorkingProcess[3],onclick:async()=>{c.quickAddWorkingProcess[3]=!0,o().redraw(),await t.Z.AddBalance(localStorage.getItem("username"),1e3),c.quickAddWorkingProcess[3]=!1,c.oninit()}},"添加1000CNY")]):null,o()(a.ZP.section,{title:"清空余额"},o()(a.ZP.button,{disabled:c.removeAllWorking,onclick:async()=>{c.removeAllWorking=!0,o().redraw(),await t.Z.ClearBalance(),c.removeAllWorking=!1,c.oninit()}},"DOIT"))):o()(a.ZP.frame,{pageName:"收银台",pageIcon:s},o()(a.ZP.section,{title:"收银台"},o()("p","余额: 0, 不可使用")))};const l=c}}]);