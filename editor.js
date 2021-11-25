import { isDom } from './element.js'
import Events from './events.js'

// 中文输入
export function compositeInput(target, callback) {
    if (!isDom(target)) {
        target = document.querySelector(target)
    }
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
        clear() {
            target.removeEventListener('compositionstart', cp_start_cb, false);
            target.removeEventListener('compositionend', cp_end_cb, false);
            target.removeEventListener('input', input_cb, false);
            target.removeEventListener('blur', blur_cb, false);
            target = null
        }
    }
}


/**
 * 光标记忆输入框
 *  
 */
export class MemoriesEditor extends Events {
    constructor(params) {
        super()
        let { editor, isPreventEnter = false } = params
        this.editor = editor
        this.isPreventEnter = isPreventEnter
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
    preventEnter(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            this.emit('enter', this)
        }
    }
    changeSelection(e) {
        let selection = window.getSelection()
        this.lastEditRange = selection.getRangeAt(0);
    }
    contentChange(action = 'input') {
        this.emit('contentChange', { content: this.content, action })
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
        const preventEnter = this.preventEnter.bind(this)
        const category = this.category
        const editor = this.editor
        const isPreventEnter = this.isPreventEnter
        const inputEvent = compositeInput(editor, contentChange)
        if (category !== 'textarea') {
            editor.addEventListener('click', changeSelection, false);
            editor.addEventListener('keyup', changeSelection, false);
        }
        if (isPreventEnter) {
            editor.addEventListener('keydown', preventEnter, false)
        }
        return {
            editor,
            clear() {
                if (category !== 'textarea') {
                    editor.removeEventListener('click', changeSelection, false)
                    editor.removeEventListener('keyup', changeSelection, false)
                }
                if (isPreventEnter) {
                    editor.removeEventListener('keydown', preventEnter, false)
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
        this.lastEditRange = this.getSelection().getRangeAt(0);
    }
    getSelection(range) {
        let selection = window.getSelection();
        if (range) {
            this.setSelectionRange(selection, { range })
        }
        return selection
    }
    setSelectionRange(selection, rangeParams) {
        let { range, rangeNode, rangeStart } = rangeParams
        if (!range) {
            range = document.createRange()
            range.selectNodeContents(rangeNode)
            range.setStart(rangeNode, rangeStart)
            range.collapse(true)
        }
        selection.removeAllRanges();
        selection.addRange(range);
        
        return range
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
        const el = isDom(content) ? content : document.createTextNode(content)
        this.insertRange(el)
    }
    insertRange(el) {
        const editor = this.editor

        editor.focus();
        let selection = this.getSelection(this.lastEditRange),
            anchorNode = selection.anchorNode,
            anchorOffset = selection.anchorOffset,
            childs = [...anchorNode.childNodes],
            childLen = childs.length,
            rangeNode = null,
            rangeStart = anchorOffset;
        // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        // Node.ELEMENT_NODE	1	An Element node like <p> or <div>.
        // Node.ATTRIBUTE_NODE	2	An Attribute of an Element.
        // Node.TEXT_NODE	3	The actual Text inside an Element or Attr.
        // Node.CDATA_SECTION_NODE	4	A CDATASection, such as <!CDATA[[ … ]]>.
        // Node.PROCESSING_INSTRUCTION_NODE	7	A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
        // Node.COMMENT_NODE	8	A Comment node, such as <!-- … -->.
        // Node.DOCUMENT_NODE	9	A Document node.
        // Node.DOCUMENT_TYPE_NODE	10	A DocumentType node, such as <!DOCTYPE html>.
        // Node.DOCUMENT_FRAGMENT_NODE	11	A DocumentFragment node.
        
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
                if (anchorChild && anchorChild.nodeName === 'BR') {
                    anchorNode.removeChild(anchorChild)
                }
                anchorNode.appendChild(el)
            } else {
                anchorNode.appendChild(el)
            }
            
            rangeNode = el.parentNode
            rangeStart += 1
        } else {
            rangeNode = anchorNode.splitText(anchorOffset);
            anchorNode.parentNode.insertBefore(el, rangeNode);
            rangeStart = 0
        }

        this.lastEditRange = this.setSelectionRange(selection, { rangeNode, rangeStart });
    }
    setRangeEnd() {
        const editor = this.editor
        if (this.category === 'textarea') {
            editor.selectionStart = editor.selectionEnd = this.content.length;
        } else {
            let selection = window.getSelection();
            this.lastEditRange = this.setSelectionRange(selection, {
                rangeNode: editor, 
                rangeStart: editor.childNodes.length
            });
        }
    }
    destroy() {
        this.clearEvent()
        this.editor = null
        this.lastEditRange = null
    }
}