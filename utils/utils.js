


class Utils {
	static FinishLogin(response) {
		localStorage.setItem("username", response.username);
		localStorage.setItem("theme", response.theme);
		if(response.isadmin) {
			localStorage.setItem("admin", response.isadmin);
		}else{
			localStorage.removeItem("admin");
		}
	}
};

export default Utils;
