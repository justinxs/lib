import {getDataType} from './common.js'

export function isDom(dom) {
    return dom instanceof HTMLElement
}

// 中文输入
export function compositeInput(target, callback) {
    const isString = getDataType(val) === 'string';
    if (!isDom(target = isString ? document.querySelector(target) : target)) {
        return console.error('compositeInput target is not defined')
    };
    let flag = false;
    let cp_start_cb = e => flag = true;
    let cp_end_cb = e => {
        flag = false;
        callback && callback(e.target, 'compositionend')
    };
    let input_cb = e => {
        !flag && callback && callback(e.target, 'input')
    };
    let blur_cb = e => callback && callback(e.target, 'blur');

    target.addEventListener('compositionstart', function (e) {
        cp_start_cb(e)
    }, false);
    target.addEventListener('compositionend', function (e) {
        cp_end_cb(e)
    }, false);
    target.addEventListener('input', function (e) {
        input_cb(e)
    }, false);
    target.addEventListener('blur', function (e) {
        blur_cb(e)
    }, false);
    
    return {
        target,
        clear() {
            target.removeEventListener('compositionstart', cp_start_cb, false);
            target.removeEventListener('compositionend', cp_end_cb, false);
            target.removeEventListener('input', input_cb, false);
            target.removeEventListener('blur', blur_cb, false);
        }
    }
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