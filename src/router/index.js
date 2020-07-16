import Vue from 'vue';
import Router from 'vue-router';
import VueResource from 'vue-resource';
import goods from '@/components/goods/goods';
import ratings from '@/components/ratings/ratings';
import seller from '@/components/seller/seller';

import '@/common/stylus/index.styl';

Vue.use(Router);
Vue.use(VueResource);

export default new Router({
  linkActiveClass: 'active', // 更改路由配置默认激活名
  routes: [
    {path: '*', redirect: '/goods'},
    {
      path: '/goods',
      name: 'goods',
      component: goods
    }, {
      path: '/ratings',
      name: 'ratings',
      component: ratings
    }, {
      path: '/seller',
      name: 'seller',
      component: seller
    }
  ]
});
