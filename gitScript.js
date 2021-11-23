const fs = require('fs')
const { exec } = require('child_process')
const TARGET_DIR = ''
/**
 * 对比差异的两个提交版本，git log 查看commit hash
 * 例如 1.0.0 <OLD_COMMIT> 更新到 1.0.1 <NEW_COMMIT>
 */
const NEW_COMMIT = '4386a9766d82073c5e49e227bb813c1148981bec'
const OLD_COMMIT = '4a0bee2c79044a20167b482ffb2759630e51f6b1'

// A: 你本地新增的文件 <ADD>
// C: 文件的一个新拷贝 <COPY>
// D: 你本地删除的文件 <DELETE>
// M: 文件的内容或者mode被修改了 <MODIFY>
// R: 文件名被修改了 <RENAME>
// T: 文件的类型被修改了 <TYPE>
// U: 文件没有被合并 <UNCATCH>
// X: 未知状态



const getPathIndex = status => {
    let statusMap = {
        R: 2
    }

    return statusMap[status] || 1
}

const statusLineHandle = lineText => {
    let statusIndex = 0
    let sides = lineText.split(/\t/)
    let originalStatus = sides[statusIndex] || ''
    let status = originalStatus[0] || ''
    let originalPath = (sides[1] || '').replace(/dist\//, '')
    let fullPath = (sides[getPathIndex(status)] || '').replace(/dist\//, '')
    let paths = fullPath.split('/')
    
    return {
        status,
        originalStatus,
        name: paths[paths.length - 1],
        originalPath,
        fullPath,
        path: paths.slice(0, -1).join('/')
    }
}


const exportJSON = jsonStr => {
    fs.writeFile(`update_${NEW_COMMIT}.json`, jsonStr, (error) => {
        if (error) {
            console.error('导出JSON失败', error)
        } else {
            console.log('导出 update.json')
        }
    })
}


const exportDir = arr => {
    const exportStatus = ['A', 'M', 'R'], parentDir = 'update_' + NEW_COMMIT
    fs.mkdir(parentDir, { recursive: true }, (err) => {
        if (err) return console.error('mkdir update error: ' + err);
        arr
        .filter(item => exportStatus.includes(item.status))
        .forEach(item => {
            fs.readFile((TARGET_DIR ? TARGET_DIR + '/' : '') + item.fullPath, (err, data) => {
                if (err) return console.error(`readFile ${item.fullPath} error: `, err)
                const writeFile = () => {
                    fs.writeFile(`${parentDir}/` + item.fullPath, data, (error) => {
                        if (error) {
                            console.error(`writeFile ${parentDir}/${item.fullPath} error: `, error)
                        }
                    })
                }
                if (!item.path || item.path === '/') {
                    writeFile()
                } else {
                    fs.mkdir(`${parentDir}/` + item.path, { recursive: true }, (err) => {
                        if (err) return console.error(`mkdir ${parentDir}/${item.path} error: `, err)
                        writeFile()
                    })
                }
            });
        })
    });
}

exec(`git diff --name-status ${OLD_COMMIT} ${NEW_COMMIT} ${TARGET_DIR}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
    }

    let jsonArr = stdout.split(/\n/)
        .map(t => statusLineHandle(t))
        .filter(item => item.status && item.name)
    // 导出 diff json
    exportJSON(JSON.stringify(jsonArr))
    // 导出update文件夹
    exportDir(jsonArr)
})
