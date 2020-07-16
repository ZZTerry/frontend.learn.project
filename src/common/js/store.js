export function saveToLocal(id, key, value) {
    // 在eslint检测，localStorage要置于window之下
    let seller = window.localStorage.__seller__; // 外层用__seller__表示
    if (!seller) {
        seller = {};
        seller[id] = {};
    } else {
        seller = JSON.parse(seller);
        if (!seller[id]) {
            seller[id] = {};
        }
    }
    seller[id][key] = value;
    window.localStorage.__seller__ = JSON.stringify(seller);
};

export function LoadFromLocal(id, key, def) {
    let seller = window.localStorage.__seller__;
    if (!seller) {
        return def; // 返回传入的默认值
    }
    seller = JSON.parse(seller)[id];
    if (!seller) {
        return def; // 返回传入的默认值
    }
    let ret = seller[key];
    return ret || def;
};
