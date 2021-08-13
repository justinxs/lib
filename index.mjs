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




export { base64AsBlob, formatBase64, base64Encode, base64Decode } from './base64.mjs'
