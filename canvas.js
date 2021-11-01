import { fileAsBase64, formatBase64 } from './base64.js'

/**
 * 图片大小压缩 
 * @method  imgFileZip
 * @param {Object} file 图片文件 [object File] [object Blob]
 * @param {String} type 输出图片格式
 * @param {Number} q 在指定图片格式为 image/jpeg 或 image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，将会使用默认值 0.92。其他参数会被忽略
 * @return {Promise} 返回一个promise对象，成功得到一个对象
 * 
 * 注：由于压缩只能image/jpeg 或 image/webp格式的图片生效，如果传入的图片不是这两个格式，则强制转成image/jpeg输出
 */
export async function imgFileZip(file, { q, type }) {
    const types = ['image/jpeg', 'image/webp'];
    const base64Data = await fileAsBase64(file, type)
    let result = null
    if (base64Data) {
        const canvas = await imgAsCanvas(base64Data.base64)
        const inputType = base64Data.type || ('image/' + base64Data.name.split('.')[1]),
            outputType = (~types.indexOf(type) && type) || (~types.indexOf(inputType) && inputType) || types[0],
            base64 = canvas.toDataURL(outputType, q || 0.92);

        result = {
            name: base64Data.name, 
            inputType, 
            outputType, 
            outputQ: q || 0.92, 
            originSize: base64Data.originSize, 
            w: canvas.width, 
            h: canvas.height, 
            base64, 
            outputSize: formatBase64(base64).size
        }
    }

    return result
}

/**
 * 以图片元素为源 压缩图片
 * @method  imgDomZip
 * @param {String} url 图片
 * @param {String} type 输出图片格式
 * @param {Number} q 在指定图片格式为 image/jpeg 或 image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，将会使用默认值 0.92。其他参数会被忽略
 * @return base64
 */
export async function imgZip(url, { q, type }) {
    const types = ['image/jpeg', 'image/webp'];
    const canvas = await imgAsCanvas(url)

    return canvas.toDataURL((~types.indexOf(type) && type) || types[0], q || 0.92)
}


/**
 * 图片绘制在canvas画布上
 * @method imgAsCanvas
 * @param {String} url 图片
 * @return {DOM} 返回一个绘制好的canvas
 */
export async function imgAsCanvas(url) {
    const loadImg = url => {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.crossOrigin = 'anonymous'
            img.onload = function (e) {
                resolve(img)
            }
            img.onabort = function (e) {
                console.warn('[Image:abort] ' + e)
                reject(e)
            }
            img.onerror = function (e) {
                console.error('[Image:error] ' + e)
                reject(e)
            }
    
            img.src = url
        })
    }
    let canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    img = await loadImg(url);

    canvas.height =  img.height;
    canvas.width = img.width;
    context.drawImage(img, 0, 0, img.width, img.height);
    return canvas
}
