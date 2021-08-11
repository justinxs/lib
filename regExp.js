(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' 
        ? module.exports = factory() 
        : typeof define === 'function' && define.amd 
            ? define(factory) 
            :(global = global || self, global.regLib = factory());
}(this, function () {
    /**
     * 转义 new RegExp(string) 中string的特殊字符
     * @param {String} string 需要转义的字符串
     */
    const escapeRegExp = string => string.replace(/[.*+?^${}()|\[\]\\]/g, "\\$&");







    return {
        escapeRegExp
    }
}))