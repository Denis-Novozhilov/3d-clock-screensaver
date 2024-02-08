export const debounce = (func, delay) => {
	let timeoutId;
	return function () {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			func.apply(this, arguments);
		}, delay);
	};
};
