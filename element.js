

export function isDom(dom) {
    return dom instanceof HTMLElement
}


/**
 * url 查询参数
 * @param {string} name 键名
 * @param {string} mode 路由模式 history => 正常模式 hash => hash模式
 */
export function getQueryString(name, mode = 'history') {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let hashReg = /(\?.*)/;
    let queryString = window.location.search;
    if (mode === 'hash') {
        let matches = hashReg.exec(window.location.hash);
        queryString = matches ? matches[1] : ''
    }
	let r = queryString.substr(1).match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}