import { getDataType } from "./common.js"

/**
 * Base64:     data:[<mediatype>][;base64],<data> 
 * 
 */

const BASE64_REGEXP = /^data:([\S]+);base64,(.+)/


export function testBase64(str) {
    return BASE64_REGEXP.test(str)
}

/**
 * 字符串转 Uint8Array 类型数组
 * @param {String} str 字符串
 * @returns {Uint8Array} 
 */
function strToUint8(str) {
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
    if (uint6 < 26) {
        return uint6 + 65
    } else if (uint6 < 52) {
        return uint6 + 71
    } else if (uint6 < 62) {
        return uint6 - 4
    } else if (uint6 === 62) {
        return 43
    } else if (uint6 === 63) {
        return 47
    }
}

/**
 * 字符串base64编码
 * @param {String} str 字符串
 * @returns {String} base64编码内容
 */
export function base64Encode(str) {
    let aBytes = strToUint8(str), eqLen = (3 - (aBytes.length % 3)) % 3, sB64Enc = ""

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
    if (b64 > 64 && b64 < 91) {
        return b64 - 65
    } else if (b64 > 96 && b64 < 123) {
        return b64 - 71
    } else if (b64 > 47 && b64 < 58) {
        return b64 + 4
    } else if (b64 === 43) {
        return 62
    } else if (b64 === 47) {
        return 63
    }
}

/**
 * https://juejin.cn/post/6844904197519835150
 * Base64 的内容是有 0-9，a-z，A-Z，+，/ 组成，正好 64 个字符，等号 = 用来作为后缀用途
 * MAP A-Z[0-25/0b000000-0b011001] a-z[27-51/0b011010-0b110011] 0-9[52-61/0b110100-0b111101] +[62/0b111110] /[63/0b111111]
 * 
 */
function base64ToUint8(base64Content, nBlockSize) {
    let {noPaddingContent: sB64Enc, size: nOutLen} = getBase64Size(base64Content, nBlockSize),
        nInLen = sB64Enc.length,
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
    let sView = "", aBytes = base64ToUint8(base64Content);

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
 * 每 4 个base64字符(4 * 6 = 24) = 3 byte(3 * 8 = 24)           https://developer.mozilla.org/zh-CN/docs/Glossary/Base64
 * @param {DOMString} dataURI base64数据字符串
 * @param {Number} blockSize 
 * @returns {Object} [mimeType]数据MIME类型，[size]数据大小，[content]数据内容
 */
export function formatBase64(dataURI, blockSize) {
    let matches = BASE64_REGEXP.exec(dataURI)
    if (!matches) {
        console.error('dataURI is not define or dataURI is not DataURI')
        return
    }
    let { noPaddingContent, size } = getBase64Size(matches[2], blockSize)
    return {
        mimeType: matches[1] || 'text/plain;charset=UTF-8',
        content: matches[2],
        noPaddingContent,
        size
    }
}

/**
 * nopaddingLen 应该等于 2/3/4/6/7/8，不会为 1。 +1 是为了处理异常nopaddingLen=1的情况
 * Math.floor((nopaddingLen * 6 + 2) / 8) => Math.floor((nopaddingLen * 3 + 1) / Math.pow(2, 2)) => nopaddingLen * 3 + 1 >>> 2
 * 
 * nopaddingLen = 4n - eqLen(= 0/1/2) =>  n = (nopaddingLen + eqLen) / 4  每 4 个base64字符等于 3 个字节
 * 
 * size  =  n * 3 - Math.ceil(eqLen * 6 / 8) (bytes/字节) = (n * 3 - Math.ceil(eqLen * 6 / 8)) * 8 (bits/比特/位)
 * 
 * => size = (nopaddingLen + eqLen) / 4 * 3 - Math.ceil(eqLen * 3 / 4)  =  (nopaddingLen * 3 + eqLen * 3) / 4 - Math.ceil(eqLen * 3 / 4)
 * 
 * => (nopaddingLen * 3 + (eqLen * 3 - Math.ceil(eqLen * 3 / 4) * 4)) / 4
 * 
 *  Math.ceil(eqLen * 3 / 4) ≈ eqLen
 * 
 * => (nopaddingLen * 3 + (eqLen * 3 - eqLen * 4)) / 4 = (nopaddingLen * 3 - eqLen) / 4 = (nopaddingLen * 3 - [0/1/2]) / 4 
 * 
 * = nopaddingLen * 3 / 4 - (0/0.25/0.5)  ≈  Math.floor(nopaddingLen * 3 / 4)
 */
function getBase64Size(base64Content, blockSize) {
    let noPaddingContent = base64Content.replace(/[^A-Za-z0-9\+\/]/g, ""),
        nopaddingLen = noPaddingContent.length;
    
    return {
        noPaddingContent,
        size: blockSize ? Math.ceil((nopaddingLen * 3 + 1 >>> 2) / blockSize) * blockSize : nopaddingLen * 3 + 1 >>> 2
    }
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
    let base64 = formatBase64(dataURI), buffer = base64ToUint8(base64.content);

    return new Blob([buffer], { type: mimeType || base64.mimeType })
}


/**
 * 文件转blob数据格式
 *  @param {*} file 文件数据
 *  @param {String} mimeType 文件MIME类型
 * 
 */
export function toBlob(file, mimeType) {
    let dataType = getDataType(file);
    let blobData = null;
    switch (dataType) {
        case 'file':
        case 'blob':
            blobData = file;
            break;
        case 'uint8array':
        case 'uint16array':
        case 'uint32array':
        case 'arraybuffer':
            blobData = new Blob([file], { type: mimeType });
            break;
        case 'string':
            blobData = base64Reg.test(file) ? base64AsBlob(file) : null;
            break;
        default:
            break;
    }
    
    return blobData
}


/**
 * 文件转base64格式
 * @method fileAsBase64
 * @param {Object} file 文件 [object File] [object Blob]
 * @param {String} mimeType file类型uint8array uint16array uint32array arraybuffer 需传
 * @return {Promise} 返回一个promise对象，成功得到一个对象 {code: 1, data}
 */
export async function fileAsBase64(file, mimeType) {
    const readFile = file => {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                resolve({
                    name: file.name || '',
                    type: file.type,
                    originSize: file.size,
                    base64: e.target.result
                })
            }
            reader.onerror = function (e) {
                console.error('[FileReader:error]' + e)
                reject(e)
            }
        })
    }
    let resourceType = getDataType(file);
    let base64Data = null;
    switch (resourceType) {
        case 'file':
            base64Data = await readFile(file);
            break;
        case 'blob':
            base64Data = await readFile(file);
            break;
        case 'uint8array':
        case 'uint16array':
        case 'uint32array':
        case 'arraybuffer':
            base64Data = await readFile(new Blob([file], { type: mimeType }));
            break;
        case 'string':
            if (testBase64(file)) {
                base64Data = formatBase64(file)
                base64Data = {
                    name: '',
                    type: base64Data.mimeType,
                    originSize: base64Data.size,
                    base64: file
                }
            }
            break;
        default:
            break;
    }
    
    return base64Data
}
