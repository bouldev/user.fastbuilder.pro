import $ from "jquery";
import sha256 from "crypto-js/sha256";
import md5 from "crypto-js/md5";
import hexenc from "crypto-js/enc-hex";

let APIList={};
let APISecret="";
let errorHandler;
let GiveUpIpv6=false;
//let APIPrefix="https://api.fastbuilder.pro"
let APIPrefix="http://127.0.0.1:8687"
//if(location.hostname.match(/\.onion$/)) {
//	APIPrefix="/api";
//}else if(location.hostname.match(/^(127\.0\.0\.1|localhost)/)) {
//	APIPrefix="http://127.0.0.1:8687";
//}

class API {
	// * [String] `username`: Username.
	// * [String] `password`: Plain password.
	// * Returns:
	// ** [Boolean] `success`
	// ** [String]  `message`
	// ** [String]  `username`: Username (provided only if login is successful)
	// ** [String]  `theme`: Preferred theme
	// ** [String]  `isadmin`
	static Login(username, password, mfa_code) {
		return new Promise((ret)=>{
			$.post(APIList.login, JSON.stringify({username, password:hexenc.stringify(sha256(password)), mfa_code}),(response)=>{
				ret(response);
			});
		});
	}
	
	// * [String] `token`: FBToken.
	// * Returns:
	// ** [Boolean] `success`
	// ** [String]  `message`
	// ** [String]  `username`: Username (provided only if login is successful)
	// ** [String]  `theme`: Preferred theme
	// ** [String]  `isadmin`
	static LoginByToken(token, mfa_code) {
		return new Promise((ret)=>{
			$.post(APIList.login, JSON.stringify({token, mfa_code}),(response)=>{
				ret(response);
			});
		});
	}
	// * [String] `username`: Username.
	// * [String] `password`: Plain password.
	// * Returns:
	// ** [Boolean] `success`
	// ** [String]  `message`
	// ** [String]  `username`: Username (provided only if login is successful)
	// ** [String]  `theme`: Preferred theme
	// ** [String]  `isadmin`
	static Login_DotCS(username, password) {
		return new Promise((ret)=>{
			$.post(APIList.login_dotcs, JSON.stringify({username, password:password}),(response)=>{
				ret(response);
			});
		});
	}
	// * Returns:
	// ** [Array]
	// *** [String] `title`
	// *** [String] `uniqueId`
	// *** [String] `author`
	// *** [String] `date`
	static FetchAnnouncements() {
		return new Promise((cb)=>{
			$.get(APIList.fetch_announcements,cb);
		});
	}
	
	// Returns:
	// [Array] `slots`
	// - [Boolean] `locked`
	// - [Boolean] `canchange`
	// - [String] `sid`
	// [String] `cn_username`
	static FetchProfileGeneral() {
		return new Promise((cb)=>{
			$.get(APIList.fetch_profile,cb);
		});
	}
	
	// * Returns:
	// ** [Boolean] `set` (user_created?)
	// ** [Boolean] `need_realname`
	// ** [Boolean] `username` (game_nickname)
	// ** [String]  `realname_addr`
	static GetHelperStatus() {
		return new Promise((cb)=>{
			$.get(APIList.get_helper_status,cb);
		});
	}
	
	// [String] name
	// * I'm too lazy to write detailed info, sorry for that
	static SaveClientUsername(name) {
		return new Promise((cb)=>{
			$.get(APIList.save_client_username,`cnun=${name}`,cb);
		});
	}
	
	// No descriptions below, may be added one day, sorry.
	
	static SaveSlot(slotid, serverid, isRemove) {
		return new Promise((cb)=>{
			$.get(APIList.save_slot,`slotid=${slotid}&content=${encodeURIComponent(serverid)}&operation=${isRemove?"remove":"save"}`,cb);
		});
	}
	
	static ChangeHelperNameOrCreateHelper(name) {
		return new Promise((cb)=>{
			$.get(APIList.helper_operation,name?`username=${name}`:"",cb);
		});
	}
	
	static GetProductList(page) {
		return new Promise((cb)=>{
			$.get(APIList.get_product_list,"page="+parseInt(page),cb);
		});
	}
	
	static AddProductToCart(productId) {
		return new Promise((cb)=>{
			$.get(APIList.add_product_to_cart,`product_id=${productId}`,cb);
		});
	}
	
	static GetShoppingCart() {
		return new Promise((cb)=>{
			$.get(APIList.get_shopping_cart,cb);
		});
	}
	
	static ShoppingCartSpliceProduct(productId) {
		return new Promise((cb)=>{
			$.get(APIList.erase_from_shopping_cart, `product_id=${productId}`,cb);
		});
	}
	
	static CalculatePrice() {
		return new Promise((cb)=>{
			$.get(APIList.generate_bill,cb);
		});
	}
	
	static GetBill() {
		return new Promise((cb)=>{
			$.get(APIList.get_bill,cb);
		});
	}
	
	static CheckPayment() {
		return new Promise((cb)=>{
			$.get(APIList.check_payment,cb);
		});
	}
	
	static GetBalance() {
		return new Promise((cb)=>{
			$.get(APIList.get_balance, (count)=>{
				cb(count[0]);
			});
		});
	}
	
	static AddBalance(username,value) {
		return new Promise((cb)=>{
			$.post(APIList.ext.add_balance, JSON.stringify({username, value: parseInt(value)}), cb);
		});
	}
	
	static ClearBalance() {
		return new Promise((cb)=>{
			$.get(APIList.ext.clear_balance, cb);
		});
	}
	
	static PairPayment(code) {
		return new Promise((cb)=>{
			$.get(APIList.pair_payment, `number=${encodeURIComponent(code)}`, cb);
		});
	}
	
	static ApprovePayment(code) {
		return new Promise((cb)=>{
			$.get(APIList.approve_payment, `number=${encodeURIComponent(code)}`, cb);
		});
	}
	
	static GetWhitelistAndPayments(whitelist_page, payments_page, whitelist_query, p_username, p_hname, p_desc) {
		return new Promise((cb)=>{
			$.post(APIList.ext.get_whitelist, JSON.stringify({
				whitelist_page,
				payment_log_page: payments_page,
				whitelist_query,
				p_username,
				p_hname,
				p_desc
			}), cb);
		});
	}
	
	static BanUser(username, reason) {
		return new Promise((cb)=> {
			$.get(APIList.ext.ban_user, {username, ban_reason: reason}, cb);
		});
	}
	
	static RemoveUser(username) {
		return new Promise((cb)=>{
			$.get(APIList.ext.drop_user, {username}, cb);
		});
	}
	
	static PublishAnnouncement(title, content) {
		return new Promise((cb)=>{
			$.post(APIList.ext.publish_announcement, JSON.stringify({title, content}), cb);
		});
	}
	
	static RemoveAnnouncement(uniqueId) {
		return new Promise((cb)=>{
			$.get(APIList.ext.remove_announcement, {param:uniqueId}, cb);
		});
	}
	
	static UpdateUserPassword(username, newPassword) {
		return new Promise((cb)=>{
			$.post(APIList.ext.update_user_password, JSON.stringify({
				username,
				new_password: hexenc.stringify(sha256(newPassword))
			}), cb);
		});
	}
	
	static GetRentalServerList(username) {
		return new Promise((cb)=>{
			$.get(APIList.ext.list_user_rental_servers, {
				user: username
			}, cb);
		});
	}
	
	static AddSlot(username) {
		return new Promise((cb)=>{
			$.get(APIList.ext.rental_server_operation, {
				operation: "add",
				slotid: "null",
				username
			}, cb);
		});
	}
	
	static RemoveSlot(username, slotid) {
		return new Promise((cb)=>{
			$.get(APIList.ext.rental_server_operation, {
				operation: "remove",
				slotid,
				username
			}, cb);
		});
	}
	
	static LockSlot(username, slotid) {
		return new Promise((cb)=>{
			$.get(APIList.ext.rental_server_operation, {
				operation: "lock",
				slotid,
				username
			}, cb);
		});
	}
	
	static UnlockSlot(username, slotid) {
		return new Promise((cb)=>{
			$.get(APIList.ext.rental_server_operation, {
				operation: "unlock",
				slotid,
				username
			}, cb);
		});
	}
	
	static AddUser(username, password) {
		return new Promise((cb)=>{
			$.get(APIList.ext.add_user, {
				username,
				password: hexenc.stringify(sha256(password))
			}, cb);
		});
	}
	
	static ChangePassword(originalPassword, newPassword) {
		return new Promise((cb)=>{
			$.post(APIList.change_password, JSON.stringify({
				originalPassword:  hexenc.stringify(sha256(originalPassword)),
				newPassword:  hexenc.stringify(sha256(newPassword))
			}), cb);
		});
	}
	
	static RemoveSelf(password) {
		return new Promise((cb)=>{
			$.post(APIList.remove_self, JSON.stringify({
				remove:true,
				"user-password": hexenc.stringify(sha256(password))
			}), cb);
		});
	}
	
	static GetPil() {
		return new Promise((cb)=>{
			$.get(APIList.ext.get_pil, cb);
		});
	}
	
	static Register(username, password, captcha) {
		return new Promise((cb)=>{
			$.post(APIList.register, JSON.stringify({
				username,
				password: hexenc.stringify(sha256(password)),
				captcha
			}), cb);
		});
	}
	
	static ResetPassword(username, email, captcha) {
		return new Promise((cb)=>{
			$.post(APIList.reset_password, JSON.stringify({
				username,
				email,
				password: captcha
			}), cb);
		});
	}
	
	static CheckRegister() {
		return new Promise((cb)=>{
			$.get(APIList.check_register, cb);
		});
	}
	
	static CalculateMonthlyPlanDuration() {
		return new Promise((cb)=>{
			$.get(APIList.calculate_monthly_plan_duration, cb);
		});
	}
	
	static StripeCreateSession() {
		return new Promise((cb)=>{
			$.get(APIList.stripe_create_session, cb);
		});
	}
	
	static CheckPaymentForPayPal(orderID) {
		return new Promise((cb)=>{
			$.post(APIList.pay_paypal, JSON.stringify({orderID}), cb);
		});
	}
	
	static RedeemForFree(captcha) {
		return new Promise((cb)=>{
			$.get(APIList.redeem_for_free, `captcha=${captcha}`, cb);
		});
	}
	
	static ChangeHeadImage(image) {
		return new Promise((cb)=>{
			$.post(APIList.change_headimage, JSON.stringify({image}), cb);
		});
	}
	
	static RemoveHeadImage() {
		return new Promise((cb)=>{
			$.delete(APIList.remove_headimage, cb);
		});
	}
	
	static MyOmegaCloudStatus() {
		return new Promise((cb)=>{
			$.get(APIList.my_omega_cloud, cb);
		});
	}
	
	static VoteAnnouncement(uniqueId, type) {
		return new Promise((cb)=>{
			$.get(APIList.vote_announcement,{
				unique_id: uniqueId,
				vote_type: type
			}, cb);
		});
	}
	
	static GetThemeInfo() {
		return new Promise((cb)=>{
			$.get(APIList.get_theme_info, cb);
		});
	}
	
	static EnrollOmegaCloud() {
		return new Promise((cb)=>{
			$.post(APIList.enroll_omega_cloud, cb);
		});
	}
	
	static ApplyTheme(name) {
		return new Promise((cb)=>{
			$.get(APIList.apply_theme, {
				name
			}, cb);
		});
	}
	
	static BindEmail(email, captcha) {
		return new Promise((cb)=>{
			$.get(APIList.bind_email, {
				email,
				captcha
			}, cb);
		});
	}
	
	static GetExRate() {
		return new Promise((cb)=>{
			$.get(APIList.get_exrate, (r)=>{
				cb(r.res);
			});
		});
	}
	
	static TransCurrencyAndPrepareToCharge(value) {
		return new Promise((cb)=>{
			$.post(APIList.prepare_charge, value.toString(), cb);
		});
	}
	
	static CheckChargePaymentForPayPal(orderID) {
		return new Promise((cb)=>{
			$.post(APIList.pay_charge_paypal, JSON.stringify({orderID}), cb);
		});
	}
	
	static PayTicket(ticketID) {
		return new Promise((cb)=>{
			$.get(APIList.pay_ticket, {ticket_code: ticketID}, cb);
		});
	}
	
	static CheckTicketPaymentForPayPal(orderID, ticketID) {
		return new Promise((cb)=>{
			$.post(APIList.pay_ticket_on_paypal, JSON.stringify({orderID, ticketID}), cb);
		});
	}
	
	static CheckTicketPayment(ticketID) {
		return new Promise((cb)=>{
			$.get(APIList.check_ticket_payment,{ticketID},cb);
		});
	}
	
	static ClearDBCache() {
		return new Promise((cb)=>{
			$.get(APIList.ext.empty_db_cache, cb);
		});
	}
	
	static UsePoints(points) {
		return new Promise((cb)=>{
			$.post(APIList.use_points_on_checkout, JSON.stringify({value:parseInt(points)}), cb);
		});
	}
	
	static ReloadPV4Modules() {
		return new Promise((cb)=>{
			$.get(APIList.ext.reload_pv4_modules, cb);
		});
	}
	
	static KeepAlive() {
		//return new Promise((cb)=>{
		//	$.get(APIList.keep_alive, cb);
		//});
	}
	
	static GetPaymentLog(page) {
		return new Promise((cb)=>{
			$.get(APIList.get_payment_log, {page}, cb);
		});
	}
	
	static SwitchToTestPaymentEnv() {
		return new Promise((cb)=>{
			$.get(APIList.ext.switch_to_test_payment_env, cb);
		});
	}
	
	static GetUserContacts(contact_id) {
		return new Promise((cb)=>{
			$.post(APIList.get_user_contacts, JSON.stringify({identifier: contact_id||undefined}), cb);
		});
	}
	
	static CreateUserContact(title, content) {
		return new Promise((cb)=>{
			$.post(APIList.create_user_contact, JSON.stringify({title,content}), cb);
		});
	}
	
	static UpdateUserContact(identifier, content, anonymous, closing) {
		return new Promise((cb)=>{
			$.post(APIList.update_user_contact, JSON.stringify({identifier, content, anonymous, closing}), cb);
		});
	}
	
	static DeleteUserContact(identifier) {
		return new Promise((cb)=>{
			$.post(APIList.delete_user_contact, JSON.stringify({identifier}), cb);
		});
	}

	static Kickstart2FA() {
		return new Promise((cb)=>{
			$.get(APIList.kickstart_2fa, cb);
		});
	}

	static FinishRegistering2FA(auth_code) {
		return new Promise((cb)=>{
			$.get(APIList.finish_registering_2fa, {code:auth_code}, cb);
		});
	}

	static FinishLogin2FA(auth_code) {
		return new Promise((cb)=>{
			$.get(APIList.finish_login_2fa, {code:auth_code}, cb);
		});
	}
	
	static TurnOff2FA() {
		return new Promise((cb)=>{
			$.get(APIList.retract_2fa, cb);
		});
	}
	
	static GetIsRateLimited() {
		return new Promise((cb)=>{
			$.get(APIList.get_is_rate_limited, cb);
		});
	}
	
	static Logout() {
		return new Promise((cb)=>{
			$.get(APIList.logout, cb);
		});
	}
	
	static HelperCharge(value) {
		return new Promise((cb)=>{
			$.post(APIList.helper_charge, JSON.stringify({value}), cb);
		});
	}
	
	static GetUserWhitelistValue(username) {
		return new Promise((cb)=>{
			$.get(APIList.ext.get_user_whitelist_value, {username}, cb);
		});
	}
	
	static SetUserWhitelistValue(username, name, value) {
		return new Promise((cb)=>{
			$.post(APIList.ext.set_user_whitelist_value, JSON.stringify({username,item_name:name,value,is_unset:value===null}), cb);
		});
	}
	
	static BindNeteaseAccount(email, password) {
		return new Promise((cb)=>{
			$.post(APIList.bind_netease_account_action, JSON.stringify({email, password:hexenc.stringify(md5(password))}), cb);
		});
	}
	
	static GetUserRentalServers() {
		return new Promise((cb)=>{
			$.get(APIList.get_user_rental_servers, cb);
		});
	}
	
	static AbandonSecurityMeasures() {
		return new Promise((cb)=>{
			$.get(APIList.disable_all_security_measures, cb);
		});
	}
	
	static GetAPI(name) {
		return APIList[name]+"?secret="+APISecret;
	}
	
	static GetAPISecret() {
		return APISecret;
	}
	
	static Inited() {
		if(!APIList.login) {
			return 0;
		}else if(!APIList.username) {
			return 1;
		}else{
			return 2;
		}
	}
	
	static SetErrorHandler(cb) {
		errorHandler=cb;
	}
	
	static SetSecret(secret) {
		APISecret=secret;
		$.ajaxSetup({
			headers: {
				Authorization: `Bearer ${secret}`
			}
		});
	}
	
	static StartupInit() {
		APISecret=localStorage.getItem("secret");
		if(APISecret) {
			$.ajaxSetup({
				headers: {
					Authorization: `Bearer ${APISecret}`
				}
			});
		}
		$(document).ajaxError((event, xhr, opt, thrownError)=>{
			if(xhr.status==401) {
				if(errorHandler)
					errorHandler(401);
				$.get(APIPrefix+"/api/new", (val)=>{
					APISecret=val;
					localStorage.setItem("secret", val);
					$.ajaxSetup({
						headers: {
							Authorization: `Bearer ${val}`
						}
					});
					//if(opt.url.match(/\/api\/new$/))
					//	return;
					if(!opt.headers)
						opt.headers={};
					opt.headers.Authorization=`Bearer ${val}`;
					$.ajax(opt);
				});
				return;
			}
			if(errorHandler) {
				let trymatch=xhr.responseText.match(/^\d{3} [a-zA-Z ]+\n\n(.*?)(\n|$)/);
				errorHandler(trymatch[1]||"Unknown error");
			}
		});
	}
	
	static DoInit() {
		return new Promise((cb)=>{
			/*$.ajaxSetup({
				beforeSend: (xhr, opt)=>{
					if(opt.
				}
			});*/
			if(!GiveUpIpv6&&APIPrefix=="https://api.fastbuilder.pro") {
				let _callback=this.DoInit;
				$.get("https://api6.fastbuilder.pro/",async (ret)=>{
					if(GiveUpIpv6)
						return;
					// If successful
					APIPrefix="https://api6.fastbuilder.pro";
					GiveUpIpv6=true;
					cb(await _callback());
				});
				$.get("https://api.fastbuilder.pro/",async (ret)=>{
					if(GiveUpIpv6)
						return;
					// If legacy one comes first
					GiveUpIpv6=true;
					cb(await _callback());
				});
				return;
			}
			$.get(APIPrefix+"/api/api",{with_prefix:APIPrefix},(ret)=>{
				if(!ret.username) {
					localStorage.removeItem("username");
					localStorage.removeItem("theme");
					localStorage.removeItem("admin");
					localStorage.removeItem("is_dotcs");
					localStorage.removeItem("d_username");
				}else{
					localStorage.setItem("username", ret.username);
					if(ret.ext) {
						localStorage.setItem("admin", true);
					}else{
						localStorage.removeItem("admin");
					}
					if(ret.is_DotCS) {
						localStorage.setItem("is_dotcs", true);
					}else{
						localStorage.removeItem("is_dotcs");
					}
					if(ret.DotCS_User_Name){
						localStorage.setItem("d_username", ret.DotCS_User_Name);
					}else{
						localStorage.removeItem("d_username");
					}
					localStorage.setItem("theme", ret.theme);
					
				}
				APIList=ret;
				cb();
			});
		});
	}
}

export default API;
