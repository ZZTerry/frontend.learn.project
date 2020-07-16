export function formatDate(date, fmt) {
    if (/(y+)/.test(fmt)) {
        // 获取date对应的年月日时分秒替换匹配到的对应部分
        // substr(4 - RegExp.$1.length)作用，当匹配到的是YY,如年份2020则从第2位开始截取即替换为20
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    let o = {
        'M+': date.getMonth() + 1, // 月份从0开始存，需要加1
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };
    for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
            let str = o[k] + '';
            // 获取date对应的年月日时分秒替换匹配到的对应部分
            // padLeftZero(str)作用：当匹配到月份为MM或者日期为dd而真实日期为9个位数，则需补0
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
        }
    }
    return fmt;
};

function padLeftZero(str) {
    return ('00' + str).substr(str.length); // 左边补0,当9时从第1位处截取补一个0，当10时从第2位处截取不补0
}
