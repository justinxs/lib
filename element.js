import {getDataType} from './common.js'
import Events from './events.js'

export function isDom(dom) {
    return dom instanceof HTMLElement
}

// 中文输入
export function compositeInput(target, callback) {
    const isString = getDataType(target) === 'string';
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


/**
 * 光标记忆输入框
 *  
 */
export class MemoriesEditor extends Events {
    constructor(params) {
        super()
        let {editor} = params
        this.editor = editor
        this.init()
    }
    get category() {
        return this.editor.nodeName === 'TEXTAREA' ? 'textarea' : 'editor'
    }
    set category(val) {
        return val
    }
    get content() {
        return this.category === 'textarea' ? this.editor.value : this.editor.innerHTML
    }
    set content(val) {
        this.setContent(val)
    }
    init() {
        if (!isDom(this.editor)) {
            this.editor = document.querySelector(this.editor)
        }
        if (this.category !== 'textarea' && this.editor.getAttribute('contenteditable') !== 'true') {
            this.editor.setAttribute('contenteditable', true)
        }
        this.lastEditRange = null
        this.editorEvent = this.addEvent()
        this.setRangeEnd()
    }
    changeSelection(e) {
        let selection = window.getSelection()
        this.lastEditRange = selection.getRangeAt(0);
    }
    contentChange(action = 'input') {
        this.emit('contentChange', {content: this.content, action})
    }
    setContent(content) {
        if (this.category === 'textarea') {
            this.editor.value = content
        } else {
            this.editor.innerHTML = content
        }
        this.setRangeEnd()
        this.contentChange('set')
    }
    addEvent() {
        const changeSelection = this.changeSelection.bind(this)
        const contentChange = (target, action) => this.contentChange(action)
        const category = this.category
        const editor = this.editor
        const inputEvent = compositeInput(editor, contentChange)
        if (category !== 'textarea') {
            editor.addEventListener('click', changeSelection, false);
            editor.addEventListener('keyup', changeSelection, false);
        }

        return {
            editor,
            clear() {
                if (category !== 'textarea') {
                    editor.removeEventListener('click', changeSelection, false)
                    editor.removeEventListener('keyup', changeSelection, false)
                }
                inputEvent && inputEvent.clear()
            }
        }
    }
    clearEvent() {
        if (this.editorEvent) {
            this.editorEvent.clear()
            this.editorEvent = null
        }
    }
    changeSelection(e) {
        let selection = window.getSelection()
        this.lastEditRange = selection.getRangeAt(0);
    }
    insert(content) {
        if (!content) return;

        this.category === 'textarea' ? this.insertTextarea(content) : this.insertEditor(content)
        this.contentChange('insert')
    }
    insertTextarea(content) {
        const editor = this.editor

        editor.focus();
        if (document.selection) {
            let sel = document.selection.createRange();
            sel.text = content;
        } else if (typeof editor.selectionStart === 'number' && typeof editor.selectionEnd === 'number') {
            let startPos = editor.selectionStart,
            endPos = editor.selectionEnd,
            cursorPos = startPos,
            tmpStr = editor.value;

            editor.value = tmpStr.substring(0, startPos) + content + tmpStr.substring(endPos, tmpStr.length);
            cursorPos += content.length;
            editor.selectionStart = editor.selectionEnd = cursorPos;
        } else {
            editor.value += content;
        }
    }
    insertEditor(content) {
        const el = content instanceof HTMLElement ? content : document.createTextNode(content)
        this.insertRange(el)
    }
    insertRange(el) {
        const editor = this.editor

        editor.focus();
        let selection = window.getSelection();
        if (this.lastEditRange) {
            selection.removeAllRanges();
            selection.addRange(this.lastEditRange);
        }
        let anchorNode = selection.anchorNode
        let anchorOffset = selection.anchorOffset
        let childs = [...anchorNode.childNodes];
        let childLen = childs.length;
        let range = null;
        let rangeContent = null
        let rangeStart = 0

        if (anchorNode.nodeType != Node.TEXT_NODE) {
            if (childLen == 1 && childs[0].nodeType == Node.COMMENT_NODE) {
                anchorNode.insertBefore(el, childs[0].nextSibling)
            } else if (childLen > 0 && anchorOffset > 0) {
                for (var i = 0; i < childLen; i++) {
                    if (i == anchorOffset - 1) {
                        anchorNode.insertBefore(el, childs[i].nextSibling)
                        break;
                    }
                }
            } else if (anchorOffset == 0) {
                let anchorChild = anchorNode.childNodes[0]
                anchorChild && anchorChild.nodeName === 'BR' && anchorNode.removeChild(anchorChild)
                anchorNode.appendChild(el)
            } else {
                anchorNode.appendChild(el)
            }
            
            rangeContent = el.parentNode
            rangeStart = anchorOffset + 1
        } else {
            rangeContent = anchorNode.splitText(anchorOffset);
            anchorNode.parentNode.insertBefore(el, rangeContent);
            // 末尾插入多一个换行标签实现换行
            if (!rangeContent.nodeValue && el.nodeName === 'BR') {
                anchorNode.parentNode.insertBefore(document.createElement('br'), rangeContent);
            }

            rangeStart = 0
        }

        range = document.createRange()
        range.selectNodeContents(rangeContent)
        range.setStart(rangeContent, rangeStart)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
        this.lastEditRange = selection.getRangeAt(0);
    }
    setRangeEnd() {
        const editor = this.editor
        if (this.category === 'textarea') {
            editor.selectionStart = editor.selectionEnd = this.content.length;
        } else {
            let selection = window.getSelection();
            let range = document.createRange();
            range.selectNodeContents(editor);
            range.setStart(editor, editor.childNodes.length);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            this.lastEditRange = selection.getRangeAt(0);
        }
    }
    destroy() {
        this.clearEvent()
        this.editor = null
        this.lastEditRange = null
    }
}