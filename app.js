const http = require('http')
const fs = require('fs')
const path = require('path')
const HTTPPORT = 8001;
const HOST = '0.0.0.0';
const suffixReg = /^\/?.+\.([^\/\s\.]+?)$/;


const requestListener = async (req, res) => {
    try {
        console.log(JSON.stringify({
            'remoteAddress': req.connection.remoteAddress,
            'X-Real-IP': req.headers['x-real-ip'] || req.headers['X-Real-IP'],
            'X-Forwarded-For': req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'],
            'X-NginX-Proxy': req.headers['x-nginx-proxy'] || req.headers['X-NginX-Proxy'],
            'X-Host': req.headers['x-host'] || req.headers['X-Host'],
            'x-forwarded-proto': req.headers['x-forwarded-proto'],
            'x-forwarded-host': req.headers['x-forwarded-host'],
            'host': req.headers['host'],
        }))
        console.log(req.headers)
        const protocol = req.socket.encrypted ? 'https' : 'http'
        const urlObj = new URL(req.url, `${protocol}://${req.headers['x-forwarded-host'] || req.headers['host']}`)
        console.log(urlObj.pathname)
        let filePath = urlObj.pathname === '/'
            ? 'index.html'
            : suffixReg.test(urlObj.pathname) ? urlObj.pathname : urlObj.pathname + '.html';
        
        fs.readFile(path.resolve(__dirname, './' + decodeURIComponent(filePath)), (err, data) => {
            if(err){ 
                console.log(err);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('<h3>404</h3>');
                res.end();
            }else{
                let contentType = 'text/html'
                switch (filePath.split('.').reverse()[0].toLowerCase()) {
                    case 'js':
                        contentType = 'application/javascript'
                        break;
                    case 'css':
                        contentType = 'text/css'
                        break;
                    case 'png':
                        contentType = 'image/png'
                        break;
                    case 'jpg':
                    case 'jpeg':
                        contentType = 'image/jpeg'
                        break;
                    case 'gif':
                        contentType = 'image/gif'
                        break;
                    case 'icon':
                        contentType = 'image/vnd.microsoft.icon'
                        break;
                    default:
                        contentType = 'text/html'
                        break;
                }
                res.writeHead(200, { 'Content-Type': contentType });
                res.write(data);
                res.end(); 
            }
        })
    } catch (error) {
        console.log(error);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<h3>404</h3>');
        res.end();
    }
}

const httpServer = http.createServer(requestListener)

httpServer.listen(HTTPPORT, HOST);
console.log(`http://localhost:${HTTPPORT}`)