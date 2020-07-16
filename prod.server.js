/* var express = require('express');
var config = require('./config/index');

var port = process.env.PORT || config.build.PORT;

var app = express();

var router = express.Router();

router.get('/', function(req, res, next) {
    req.url = '/index.html';
    next();
});

app.use(router);

// 导入data.json数据
var appData = require('./data.json');// 加载本地数据文件
var seller = appData.seller; // 获取对应的本地数据
var goods = appData.goods;
var ratings = appData.ratings;
app.get('/api/seller', (req, res) => {
    res.json({
        errno: 0,
        data: seller
    })//接口返回json数据，上面配置的数据seller就赋值给data请求后调用
});
app.get('/api/goods', (req, res) => {
    res.json({
        errno: 0,
        data: goods
    })
});
app.get('/api/ratings', (req, res) => {
    res.json({
        errno: 0,
        data: ratings
    })
});

var apiRoutes = express.Router();
app.use('/api', apiRoutes); //通过路由请求数据

app.use(express.static('./dist')); */
