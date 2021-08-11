const REGEXP_MAP = {
    type: /^\[object (\S+)\]$/,
    ie: /(?:ms|\()(ie)\s([\w\.]+)|trident|(edge|edgios|edga|edg)/i,
    base64: /^data:([\S]+);base64,(.+)/
}




/**
 * 获取数据类型
 * @param {*} data 需要检测的数据
 * @param {Boolean} isLower 结果是否小写，默认小写
 * @returns {String} 数据类型：nan/object/arraybuffer...
 */
export function getDataType(data, isLower = true) {
    let matches = null
    let type = Object.prototype.toString.call(data)
    if (matches = REGEXP_MAP.type.exec(type)) {
        type = matches[1] === 'Number' && isNaN(data) ? 'NaN' : matches[1]
    }

    return isLower ? type.toLowerCase() : type
}
  



/**
 * 字符串转 Uint8Array 类型数组
 * @param {String} str 字符串
 * @returns {Uint8Array} 
 */
function strToUnit8(str) {
    let aBytes, nChr, strLen = str.length, bytesLen = 0;
    for (let nMapIdx = 0; nMapIdx < strLen; nMapIdx++) {
        nChr = str.charCodeAt(nMapIdx);
        bytesLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
    }

    aBytes = new Uint8Array(bytesLen);

    for (let nIdx = 0, nChrIdx = 0; nIdx < bytesLen; nChrIdx++) {
        nChr = str.charCodeAt(nChrIdx);
        if (nChr < 128) {
            /* one byte */
            aBytes[nIdx++] = nChr;
        } else if (nChr < 0x800) {
            /* two bytes */
            aBytes[nIdx++] = 192 + (nChr >>> 6);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else if (nChr < 0x10000) {
            /* three bytes */
            aBytes[nIdx++] = 224 + (nChr >>> 12);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else if (nChr < 0x200000) {
            /* four bytes */
            aBytes[nIdx++] = 240 + (nChr >>> 18);
            aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else if (nChr < 0x4000000) {
            /* five bytes */
            aBytes[nIdx++] = 248 + (nChr >>> 24);
            aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        } else /* if (nChr <= 0x7fffffff) */ {
            /* six bytes */
            aBytes[nIdx++] = 252 + (nChr >>> 30);
            aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
            aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
            aBytes[nIdx++] = 128 + (nChr & 63);
        }
    }

    return aBytes;
}


function uint6ToB64(uint6) {
    let b64 = 65
    if (uint6 < 26) {
        b64 = uint6 + 65
    } else if (uint6 < 52) {
        b64 = uint6 + 71
    } else if (uint6 < 62) {
        b64 = uint6 - 4
    } else if (uint6 === 62) {
        b64 = 43
    } else if (uint6 === 63) {
        b64 = 47
    }

    return b64
}

/**
 * 字符串base64编码
 * @param {String} str 字符串
 * @returns {String} base64编码内容
 */
export function base64Encode(str) {
    let aBytes = strToUnit8(str)
    let eqLen = (3 - (aBytes.length % 3)) % 3, sB64Enc = ""

    for (let nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
        nMod3 = nIdx % 3
        nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24)
        if (nMod3 === 2 || aBytes.length - nIdx === 1) {
            sB64Enc += String.fromCharCode(
                uint6ToB64(nUint24 >>> 18 & 63), 
                uint6ToB64(nUint24 >>> 12 & 63), 
                uint6ToB64(nUint24 >>> 6 & 63), 
                uint6ToB64(nUint24 & 63)
            );
            nUint24 = 0;
        }
    }

    return  eqLen === 0 ? sB64Enc : sB64Enc.substring(0, sB64Enc.length - eqLen) + (eqLen === 1 ? "=" : "==")
}




function b64ToUint6(b64) {
    let unit6 = 0
    if (b64 > 64 && b64 < 91) {
        unit6 = b64 - 65
    } else if (b64 > 96 && b64 < 123) {
        unit6 = b64 - 71
    } else if (b64 > 47 && b64 < 58) {
        unit6 = b64 + 4
    } else if (b64 === 43) {
        unit6 = 62
    } else if (b64 === 47) {
        unit6 = 63
    }

    return unit6
}


function base64ToUnit8(base64Content, nBlockSize) {
    let sB64Enc = base64Content.replace(/[^A-Za-z0-9\+\/]/g, ""), 
        nInLen = sB64Enc.length,
        nOutLen = nBlockSize ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockSize) * nBlockSize : nInLen * 3 + 1 >>> 2, 
        aBytes = new Uint8Array(nOutLen);

    for (let nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
        nMod4 = nInIdx & 3;
        nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
        if (nMod4 === 3 || nInLen - nInIdx === 1) {
            for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
            }
            nUint24 = 0;
        }
    }

    return aBytes;
}

/**
 * base64解码
 * @param {String} base64Content base64内容字符串
 * @returns {String} 解码后的字符串
 */
export function base64Decode(base64Content) {
    let sView = "", aBytes = base64ToUnit8(base64Content);

    for (let nPart, nCode, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
        nPart = aBytes[nIdx];
        if (nPart > 251 && nPart < 254 && nIdx + 5 < nLen) {
            /* six bytes */
            /* (nPart - 252 << 30) may be not so safe in ECMAScript! So...: */
            nCode = (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        } else if (nPart > 247 && nPart < 252 && nIdx + 4 < nLen) {
            /* five bytes */
            nCode = (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        } else if (nPart > 239 && nPart < 248 && nIdx + 3 < nLen) {
            /* four bytes */
            nCode = (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        } else if (nPart > 223 && nPart < 240 && nIdx + 2 < nLen) {
            /* three bytes */
            nCode = (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        } else if (nPart > 191 && nPart < 224 && nIdx + 1 < nLen) {
            /* two bytes */
            nCode = (nPart - 192 << 6) + aBytes[++nIdx] - 128
        } else {
            /* nPart < 127 ? */ 
            /* one byte */
            nCode = nPart
        }

        sView += String.fromCharCode(nCode)
    }

    return sView
}


/**
 * 分解base64数据 
 * data:[<mediatype>][;base64],<data>  https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 每 4 个base64字符 = 3 byte           https://developer.mozilla.org/zh-CN/docs/Glossary/Base64
 * @param {DOMString} dataURI base64数据字符串
 * @param {Boolean} isUnit8 是否需要转化Uint8Array类型数组，为 true 时 size 取unit8.byteLength更加准确
 * @returns {Object} [mimeType]数据MIME类型，[size]数据大小，[content]数据内容, [unit8]内容转Uint8Array
 */
export function formatBase64(dataURI, isUnit8) {
    let matches = REGEXP_MAP.base64.exec(dataURI)
    if (!matches) {
        console.error('dataURI is not define or dataURI is not DataURI')
        return
    }
    let mediatype = matches[1], 
        content = matches[2], 
        result = {
            mimeType: mediatype || 'text/plain;charset=UTF-8',
            size: content.length / 4 * 3 | 0,
            content
        }
    
    if (isUnit8) {
        result.unit8 = base64ToUnit8(content)
        result.size = result.unit8.byteLength
    }

    return result
}


/**
 * base64 转blob文件流
 * https://developer.mozilla.org/zh-CN/docs/Web/API/Blob/Blob
 * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
 * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
 * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array
 * @method base64AsBlob
 * @param {DOMString} dataURI base64文件字符串
 * @param {String} mimeType 输出的MIME类型
 * @return {Object} 成功返回Blob 文件对象 
 */
export function base64AsBlob(dataURI, mimeType) {
    let base64 = formatBase64(dataURI), type = mimeType || base64.mimeType;

    return new Blob([base64.unit8], { type })
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


