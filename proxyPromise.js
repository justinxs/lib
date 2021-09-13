function proxyPromise(p) {
    if (!(p instanceof Promise)) {
        p = Promise.resolve(p)
    }
    let proxy = {
        promise: p,
        state: 'pending',
        then(success, failure) {
            const proxySuccess = res => {
                if (this.state !== 'aborted' && success) {
                    return success(res)
                }
            }
            const proxyFailure = err => {
                if (this.state !== 'aborted' && failure) {
                    return failure(err)
                }
            }
            return proxyPromise(failure ? p.then(proxySuccess, proxyFailure) : p.then(proxySuccess))
        },
        catch(failure) {
            return proxyPromise(p.catch(err => {
                if (this.state !== 'aborted' && failure) {
                    return failure(err)
                }
            }))
        },
        finally(cb) {
            return proxyPromise(p.finally(res => {
                if (this.state !== 'aborted' && cb) {
                    return cb(res)
                }
            }))
        },
        abort() {
            if (this.state === 'pending') {
                console.warn('promise aborted', p)
                this.state = 'aborted'
            }

            return this
        }
    }

    p.then(res => proxy.state = 'fulfilled')
    p.catch(err => proxy.state = 'rejected')

    return proxy
}

export default proxyPromise