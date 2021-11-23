

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

/**
 *  iOS系统设备触摸行为
 */
export function iOSTouch(isPreventDouble = false) {
    if (/(iPhone|iPad|iPod|iOS)/ig.test(navigator.userAgent)) {
        //  iOS系统设备激活标签:active状态
        document.body.addEventListener('touchstart', () => {});
        // 阻止iOS双击缩放
        if (isPreventDouble) {
            let lastTouchEnd = 0;
            document.addEventListener('touchend', e => {
                let now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
        }
    }
}

/**
 * 代理a标签点击默认事件
 * @param {HTMLElement|String} parent 被代理a标签的父元素
 * @param {Function} cb 代理事件回调
 * 
 * @returns {Object} clear 解绑事件
 */
export function proxyAtag(parent, cb) {
    parent = isDom(parent) ? parent : document.querySelector(parent)

    if (!parent) return console.error(`parent is undefined!`)
    const getAtag = (target) => {
        if (target.nodeName === 'A') {
            return target
        }
        if (target === parent || !target) {
            return null
        }

        return getAtag(target.parentNode)
    }
    const listener = e => {
        let target = e.target
        if (target = getAtag(target)) {
            e.preventDefault();
            cb && cb({ href: target.getAttribute('href'), target: target.getAttribute('target') }, e)
        }
    }
    
    parent.addEventListener('click', listener)

    return { clear: () => parent.removeEventListener('click', listener) }
}
