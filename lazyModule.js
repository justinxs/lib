import Events from './events'
import proxyPromise from './proxyPromise'

class LazyModule extends Events {
    constructor() {
        super()
        this.sourceMap = {
            'QRCode': {type: 'js', path: 'lib/qrcode.min.js'},
            'swipercss': {type: 'css', path: 'lib/swiper.min.css'},
        }
    }

    get version() {
        if (!this.sourceVersion) {
            let resourceMeta = document.head.querySelector('meta[name="resource-version"]');
            this.sourceVersion = (resourceMeta && resourceMeta.getAttribute('content')) || Date.now();
        }
        return this.sourceVersion
    }

    set version(val) {
        this.sourceVersion = val
    }

    getSourceDom(tabName, namespace) {
        return document.head.querySelector(`${tabName}[data-namespace=${namespace}]`)
    }

    load(...args) {
        let promises = []
        for (let i = 0, len = args.length; i < len; i++) {
            const item = args[i],
            isStr = typeof item === 'string',
            namespace = isStr ? item : item.namespace,
            query = Object.assign({v: this.version}, isStr ? null : item.query),
            sItem = this.sourceMap[namespace];

            if (sItem) {
                let tabName = sItem.type === 'css' ? 'link' : 'script'

                if (!this.getSourceDom(tabName, namespace)) {
                    const target = document.createElement(tabName), 
                    sURL = query ? sItem.path + `?${Object.keys(query).map(k => `${k}=${query[k]}`).join('&')}` : sItem.path;

                    target.setAttribute('data-namespace', namespace)

                    promises.push(new Promise((resolve, reject) => {
                        this.once(namespace, res => {
                            res.error ? reject(res.error) : resolve(res.data)
                        })
                    }))

                    this.onceEvent(target, 'load', e => {
                        this.emit(namespace, {data: window[namespace]})
                    })
                    this.onceEvent(target, 'error', e => {
                        this.emit(namespace, {error: e})
                    })
                    if (tabName === 'link') {
                        target.rel = "stylesheet"
                        target.href = sURL
                    } else {
                        target.src = sURL
                    }

                    document.head.appendChild(target)
                } else {
                    promises.push(Promise.resolve(window[namespace]))
                }
            }
        }

        return proxyPromise(promises.length == 1 ? promises[0] : Promise.all(promises))
    }

    onceEvent(target, event, cb) {
        const callback = e => {
            target.removeEventListener(event, callback);
            cb && cb(e)
        }
        if (target && event) {
            target.addEventListener(event, callback)
        }
    }

    get(...args) {
        let promises = []
        for (let i = 0, len = args.length; i < len; i++) {
            const namespace = args[i];
            if (window[namespace]) {
                promises.push(Promise.resolve(window[namespace]))
            } else if (this.sourceMap[namespace] && this.sourceMap[namespace].type === 'js') {
                promises.push(new Promise((resolve, reject) => {
                    this.once(namespace, res => res.error ? reject(res.error) : resolve(res.data))
                }))
                this.load(namespace)
            } else {
                promises.push(Promise.resolve(null))
            }
        }

        return proxyPromise(promises.length == 1 ? promises[0] : Promise.all(promises))
    }

    remove(...args) {
        for (let i = 0, len = args.length; i < len; i++) {
            const namespace = args[i];
            let target, sItem = this.sourceMap[namespace];
            if (sItem && (target = this.getSourceDom(sItem.type === 'css' ? 'link' : 'script', namespace))) {
                document.head.removeChild(target)
                sItem.type === 'js' && (window[namespace] = null)
            }
        }
    }
}

export default new LazyModule()