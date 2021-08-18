/**
 * type:       [object Object]
 * ie:         Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3; rv:11.0) like Gecko
 *             Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; InfoPath.3)
 */

const REGEXP_TYPE = /^\[object (\S+)\]$/
const REGEXP_IE = /(?:ms|\()(ie)\s([\w\.]+)|trident|(edge|edgios|edga|edg)/i



/**
 * 获取数据类型
 * @param {*} data 需要检测的数据
 * @param {Boolean} isLower 结果是否小写，默认小写
 * @returns {String} 数据类型：nan/object/arraybuffer...
 */
export function getDataType(data, isLower = true) {
    let matches, type = Object.prototype.toString.call(data)
    if (matches = REGEXP_TYPE.exec(type)) {
        type = matches[1] === 'Number' && isNaN(data) ? 'NaN' : matches[1]
    }

    return isLower ? type.toLowerCase() : type
}
 
 
/**
 * 转义 new RegExp(string) 中string的特殊字符，避免正则中被当作特殊字符匹配
 * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions#special-unicode-escape-es6
 * @param {String} string 需要转义的字符串
 * @returns {String} 转义后的字符串
 */

export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&")
}


/**
 * 模块安装
 * @param {Function} factory 模块工厂函数
 * @param {String} namespace 模块全局命名空间
 */
export function installModule(factory, namespace) {
    return (function (global, factory) {
        typeof exports === 'object' && typeof module !== 'undefined' 
            ? module.exports = factory() 
            : typeof define === 'function' && define.amd 
                ? define(factory) 
                :(global = global || self, global[namespace] = factory());
    }(this, factory))
}



// 数字
export function getNumber(val, type) {
    let res = val !== '' ? val.replace(/\D/g, '') : val
    return res && (type === 'number' ? parseInt(res, 10) : res)
};

// 浮点数，radixPoint小数点后几位
export function getFloatNumber(val, radixPoint) {
    const setRadixPoint = (val, radixPoint) => {
        let floatStr = val || val === 0 ? val.toString().replace(/[^0-9\\.\\^0-9]/ig, '').replace(/^\./, '') : ''
        if (radixPoint && typeof radixPoint === 'number') {
            val = floatStr.split('.').slice(0, 2).map((str, i) => i == 1 ? str.slice(0, radixPoint) : +str).join('.')
        } else {
            val = floatStr.split('.').slice(0, 2).map((str, i) => i == 0 ? +str : str).join('.')
        }
        return val
    };
    let res = val !== '' ? setRadixPoint(val, radixPoint) : val;
    
    return res
}

// 正负数，maxLen 最大位数
export function getPlusMinusNumber(val, maxLen) {
    if (val !== '') {
        const reg = new RegExp(maxLen > 0 ? `^-?[0-9]{0,${maxLen}}` : `^-?[0-9]*`);
        let matches = reg.exec(val.replace(/(?:-)0*|^0/, ''));
        val = matches ? matches[0] : ''
    }
    return val
};


// 正负浮点数，radixPoint小数点后几位
export function getPlusMinusFloat(val, radixPoint) {
    if (val !== '') {
        const reg = new RegExp(radixPoint > 0 ? `^-?[0-9]*\.?[0-9]{0,${radixPoint}}` : `^-?[0-9]*\.?[0-9]*`);
        let matches = reg.exec(val.replace(/(?:-)0*|^0/, ''));
        val = matches ? matches[0] : ''
    }
    return val
};

/**
 * 浮点数运算
 * @param {String} action add => 相加 subtract => 相减  multiply => 相乘 divide => 相除
 */
export function floatOperate(action, ...data) {
    if (!['add', 'subtract', 'multiply', 'divide'].includes(action) || !data) return;
    const getFloat = num => String(num).split('.')[1] || '';
    const getPow = (exponent, base = 10) => Math.pow(base, exponent);
    const handler = (action, a, b) => {
        const aFloat = getFloat(a);
        const bFloat = getFloat(b);
        let aPow = 1, bPow = 1, maxPow = 1;
        switch (action) {
            case 'add':
            case 'subtract':
                maxPow = getPow(Math.max(aFloat.length, bFloat.length))
                return action === 'add' ? (a * maxPow + b * maxPow) / maxPow : (a * maxPow - b * maxPow) / maxPow
            case 'multiply':
            case 'divide':
                aPow = getPow(aFloat.length);
                bPow = getPow(bFloat.length);
                return  action === 'multiply' ? (a * aPow) * (b * bPow) / (aPow * bPow) : (a * aPow * bPow) / (b * bPow * aPow)
            default:
                break;
        }
    }
    return data.length > 1 ? data.reduce((re, num) => handler(action, re, num)) : data[0]
};



/**
 * 节流函数
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
 export function debounce(func, wait, immediate) {
    let timeout, args, context, timestamp, result

    const later = function() {
        // 据上一次触发时间间隔
        const last = +new Date() - timestamp

        // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
        if (last < wait && last > 0) {
            timeout = setTimeout(later, wait - last)
        } else {
            timeout = null
            // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
            if (!immediate) {
                result = func.apply(context, args)
                if (!timeout) context = args = null
            }
        }
    }

    return function(...args) {
        context = this
        timestamp = +new Date()
        const callNow = immediate && !timeout
        // 如果延时不存在，重新设定延时
        if (!timeout) timeout = setTimeout(later, wait)
        if (callNow) {
            result = func.apply(context, args)
            context = args = null
        }

        return result
    }
}


// 判断一个数是否是素数
export function isPrinme(num) {
    if (num <= 3) {
        return num > 1
    } else {
        let sq = Math.sqrt(num)
        for (let i = 2; i <= sq; i++) {
            if (num % i === 0) {
                return false
            }
        }
        return true
    }
}

/**
 * 获取字符串中下标为素数/质数的字符集合
 * @param {String} str
 */
export function prinme(str) {
    return str ? str.split('').filter((v, i) => isPrinme(i)).join('') : ''
}


// 深拷贝
export function deepClone(source) {
    let result = null
    let type = getDataType(source)
    switch (type) {
        case 'array':
            result = []
            for (let i = 0; i < source.length; i++) {
                result.push(deepClone(source[i]))
            }
            break;
        case 'object':
            result = {}
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    result[key] = deepClone(source[key])
                }
            }
            break;
        default:
            result = source
            break;
    }

    return result
}


/**
 * 16进制颜色值转RGB
 * @param  {String} hex 16进制颜色字符串
 * @return {String}     RGB颜色字符串
 */
export function HexToRGB(hex) {
    var hexx = hex.replace('#', '0x')
    var r = hexx >> 16
    var g = hexx >> 8 & 0xff
    var b = hexx & 0xff
    return `rgb(${r}, ${g}, ${b})`
}

/**
* RGB颜色转16进制颜色
* @param  {String} rgb RGB进制颜色字符串
* @return {String}     16进制颜色字符串
*/
export function RGBToHex(rgb) {
    var rgbArr = rgb.split(/[^\d]+/)
    var color = rgbArr[1]<<16 | rgbArr[2]<<8 | rgbArr[3]
    return '#'+ color.toString(16)
}

/**
* 数组乱序
* @param  {Array} arr 原数组
* @return {Array}     乱序后数组
*/
export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
    }

    return arr
}

