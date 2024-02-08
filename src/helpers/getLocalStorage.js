export const getLocal = (key, byDefault = null, parsing = true) => {
	let res = localStorage.getItem(key);
	if (res) {
		return parsing ? JSON.parse(res) : res;
	} else {
		return byDefault;
	}
};
