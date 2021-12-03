
/**
 * 事件触发器
 */
class Events {
    constructor() {
        this.eventMap = {};
    }

    getRegister(eventName, callback) {
        let register = null;
        if (!eventName || !(callback && callback instanceof Function)) {
            console.error(callback && callback instanceof Function ? 'eventName is required' : 'callback function is required')
        } else {
            let index = undefined;
            const group = this.eventMap[eventName];
            if (group) {
                for (let i = 0; i < group.length; i++) {
                    const item = group[i]
                    if (item.callback === callback || item.callback.listener === callback) {
                        index = i
                        break
                    }
                }

                register = { group, index, isRegist: index !== undefined }
            }
        }
        return register
    }

    on(eventName, callback, callbackId = '') {
        let register = this.getRegister(eventName, callback);
        if (register) {
            !register.isRegist && register.group.push({ callbackId, callback })
        } else {
            this.eventMap[eventName] = [
                { callbackId, callback }
            ]
        }
    }

    once(eventName, callback, callbackId = '') {
        const onceCallback = (...arg) => {
            this.off(eventName, onceCallback)
            callback(...arg)
        }
        onceCallback.listener = callback
        this.on(eventName, onceCallback, callbackId)
    }

    off(eventName, callback) {
        let register = this.getRegister(eventName, callback);
        if (register && register.isRegist) {
            register.group.splice(register.index, 1)
            if (register.group.length == 0) {
                delete this.eventMap[eventName]
            }
        }
    }

    emit(eventName, data, callbackId = '') {
        let callbackGroup = this.eventMap[eventName];
        if (callbackGroup && (callbackGroup = callbackGroup.slice(0))) {
            for (let i = 0; i < callbackGroup.length; i++) {
                const item = callbackGroup[i];
                if (!callbackId) {
                    !item.callbackId && item.callback(data)
                } else {
                    callbackId === item.callbackId && item.callback(data)
                }
            }
        }
    }
    
    getCallbackId(key = '') {
        return key + Date.now() + parseInt(Math.random() * 10000)
    }
}

export default Events