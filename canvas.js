import { fileAsBase64, formatBase64 } from './base64.js'
import { loadImg } from './element.js'
/**
 * 图片大小压缩 
 * @method  imgZip
 * @for 所属类名
 * @param {Object} file 图片文件 [object File] [object Blob]
 * @param {String} type 输出图片格式
 * @param {Number} q 在指定图片格式为 image/jpeg 或 image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，将会使用默认值 0.92。其他参数会被忽略
 * @return {Promise} 返回一个promise对象，成功得到一个对象
 * 
 * 注：由于压缩只能image/jpeg 或 image/webp格式的图片生效，如果传入的图片不是这两个格式，则强制转成image/jpeg输出
 */
export async function imgZip(file, {q, type}) {
    const types = ['image/jpeg', 'image/webp'];
    const base64Data = await fileAsBase64(file, type)
    let result = null
    if (base64Data) {
        const img = await loadImg(base64Data.base64)
        const inputType = base64Data.type || ('image/' + base64Data.name.split('.')[1]),
            outputType = (~types.indexOf(type) && type) || (~types.indexOf(inputType) && inputType) || types[0],
            base64 = imgAsCanvas(img).toDataURL(outputType, q || 0.92);

        result = {
            name: base64Data.name, 
            inputType, 
            outputType, 
            outputQ: q || 0.92, 
            originSize: base64Data.originSize, 
            w: img.width, 
            h: img.height, 
            base64, 
            outputSize: formatBase64(base64).size
        }
    }

    return result
}

/**
 * 图片绘制在canvas画布上
 * @method imgAsCanvas
 * @param {DOM} img 已加载完毕的图片元素DOM节点,或者一个canvas
 * @return {DOM} 返回一个绘制好的canvas
 */
export function imgAsCanvas(img) {
    let canvas = document.createElement('canvas'),
    context = canvas.getContext('2d');
    
    canvas.height =  img.height;
    canvas.width = img.width;
    context.drawImage(img, 0, 0, img.width, img.height);
    return canvas
}