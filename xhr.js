import { toBlob } from "./base64.js"


/**
 * 兼容创建XMLHttpRquest对象
 * @method createXhr
 * @return {Object} xhr
 */

export function createXhr() {
    let xhr;
    try {
        xhr = new XMLHttpRequest()
    } catch (e) {
        try {
            xhr = ActiveXobject('Msxml12.XMLHTTP')
        } catch (ex) {
            try {
                xhr = ActiveXobject('Microsoft.XMLHTTP')
            } catch (failed) {
                xhr = false
            }
        }
    }

    return xhr
}
/**
 * 远程资源本地化
 * @method getStaticFile
 * @param {DOMString} url 地址
 * @param {String} type 
 *  ""	            将 responseType 设为空字符串与设置为"text"相同， 是默认类型 （实际上是 DOMString）。
 *  "arraybuffer"	response 是一个包含二进制数据的 JavaScript ArrayBuffer 。
 *  "blob"	        response 是一个包含二进制数据的 Blob 对象 。
 *  "document"	    response 是一个 HTML Document 或 XML XMLDocument ，这取决于接收到的数据的 MIME 类型。
 *  "json"	        response 是一个 JavaScript 对象。这个对象是通过将接收到的数据类型视为 JSON 解析得到的。
 *  "text"	        response 是包含在 DOMString 对象中的文本。
 * @return {Promise} 成功返回{code: 200, data}
 * 
 * 注：在工作环境(Work Environment)中将responseType的值设置为"document"通常会被忽略. 
 * 当将responseType设置为一个特定的类型时，你需要确保服务器所返回的类型和你所设置的返回值类型是兼容的。
 * 那么如果两者类型不兼容呢?
 * 恭喜你，你会发现服务器返回的数据变成了null，即使服务器返回了数据。
 * 还有一个要注意的是，给一个同步请求设置responseType会抛出一个InvalidAccessError 的异常
 */

export function getStaticFile(url, type = '') {
    return new Promise((resolve, reject) => {
        let xhr = createXhr();
        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200) {
                    resolve({
                        code: xhr.status,
                        data: xhr.response || xhr.responseText
                    })
                } else {
                    reject({
                        code: xhr.status,
                        data: xhr
                    })
                }
            }
        }
        xhr.onerror = function (error) {
            reject(error)
        }
        xhr.open('GET', url);
        xhr.responseType = type;
        xhr.send();
    })
}


/**
 * 前端下载文件(PC)
 * @param {File | Blob | Uint8Array | Uint16Array | Uint32Array | ArrayBuffer | base64String | URI}} file 文件数据或者远程地址 URI
 * @param {String} mimeType 文件类型(若file为 Uint8Array | Uint16Array | Uint32Array | ArrayBuffer时必传)
 * web mime对照表https://www.iana.org/assignments/media-types/media-types.xhtml
 * @param {String} fileName 文件名称(加上后缀)
 * @param {Boolean} isRemote 是否远程文件
 */ 
export async function downloadFile({ file, mimeType, fileName, isRemote }) {
    let blobData = null;
    if (!isRemote) {
        blobData = toBlob(file, mimeType);
    } else {
        let remoteData = await getStaticFile(file, 'blob');
        blobData = remoteData && remoteData.code == 200 ? remoteData.data : null
    } 
    if (!blobData) {
        return console.error(
            !isRemote
            ? 'file data type require [File|Blob|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|base64String]'
            : file + ' remote error'
        )
    }

    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blobData, fileName)
    } else {
        let dataURL = URL.createObjectURL(blobData),
        save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a'),
        event = document.createEvent('MouseEvents');

        save_link.href = dataURL;
        save_link.download = fileName;
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        save_link.dispatchEvent(event);
        URL.revokeObjectURL(dataURL);
        save_link = null;
    }
}


