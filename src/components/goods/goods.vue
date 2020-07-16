<template>
    <div>
      <div class="goods">
        <div class="menu-wrapper" ref="menuWrapper">
            <ul>
                <li v-for="(item,index) in goods" :key="index" class="menu-item menu-list-hook" @click="selectMenu(index, $event)" :class="{'current':currentIndex===index}">
                    <span class="text border-1px">
                        <span v-show="item.type>0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
                    </span>
                </li>
            </ul>
        </div>
        <div class="foods-wrapper" ref="foodsWrapper">
          <ul>
            <li v-for="(item, index) in goods" class="food-list food-list-hook" :key="index">
              <h1 class="title">{{item.name}}</h1>
              <ul>
                <li @click="selectFood(food,$event)" v-for="(food,index) in item.foods" :key="index" class="food-item border-1px">
                  <div class="icon">
                    <img :src="food.icon" width="57px" height="57px">
                  </div>
                  <div class="content">
                    <h2 class="name">{{food.name}}</h2>
                    <p class="desc">{{food.description}}</p>
                    <div class="extra">
                      <span>月售{{food.sellCount}}份</span>
                      <span>好评率{{food.rating}}%</span>
                    </div>
                    <div class="price">
                      <span class="now">¥{{food.price}}</span><span class="old" v-show="food.oldPrice">¥{{food.oldPrice}}</span>
                    </div>
                    <div class="cartcontrol-wrapper">
                      <cartcontrol :food="food" @cart-add="handlecartAdd"></cartcontrol>
                    </div>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <shopcart ref="shopcart" :select-foods="selectFoods" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice"></shopcart>
      </div>
      <food :food="selectedFood" ref="food" @cart-add="handlecartAdd"></food>
    </div>
</template>

<script>
    import BScroll from 'better-scroll';
    import shopcart from '../shopcart/shopcart';
    import cartcontrol from '../cartcontrol/cartcontrol';
    import food from '../food/food';
    const ERR_OK = 0;
    export default{
        data() {
            return {
                goods: [],
                listHeight: [],
                scrollY: 0,
                selectedFood: {}
            };
        },
        props: {
          seller: {
                type: Object
          }
        },
        computed: {
          currentIndex() {
            for (let i = 0; i < this.listHeight.length; i++) {
              let height1 = this.listHeight[i];
              let height2 = this.listHeight[i + 1];
              if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
                // 左边菜单栏随之滚动到对应菜单项
                let menuList = this.$refs.menuWrapper.getElementsByClassName('menu-list-hook');
                let menuel = menuList[i];
                this.menuScroll.scrollToElement(menuel, 300);
                return i;
              }
            }
            return 0;
          },
          selectFoods() {
            let foods = [];
            this.goods.forEach((good) => {
              good.foods.forEach((food) => {
                if (food.count) {
                  foods.push(food);
                }
              });
            });
            return foods;
          }
        },
        created() {
            this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
            this.$http.get('/api/goods').then((response) => {
                response = response.body;
                if (response.errno === ERR_OK) {
                    this.goods = response.data;
                    // console.log(this.goods);
                    this.$nextTick(() => { // this.$nextTick( () => {} ):是一个异步函数,为了确保 DOM已经渲染完成
                      this._initScroll();
                      // 调用计算高度的方法
                      this._calculateHeight();
                    });
                }
            });
        },
        methods: {
          selectMenu(index, event) {
            if (!event._constructed) {
              return;
            }
            let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
            let el = foodList[index];
            this.foodsScroll.scrollToElement(el, 300);
            // console.log(index);
          },
          selectFood(food, event) {
            if (!event._constructed) {
              return;
            }
            this.selectedFood = food;
            this.$refs.food.show();
          },
          _drop(target) { // 将cartcontrol传递过来的target对象再传递给shopcart
            this.$nextTick(() => { // 使用nextTick优化体验,异步执行下落动画
              this.$refs.shopcart.drop(target); // 父组件goods通过.$refs属性访问shopcart子组件的drop方法
            });
          },
          handlecartAdd(target) { // 点击加号按钮触发事件
            // console.log('调用_drop方法');
            this._drop(target); // 调用_drop方法
          },
          _initScroll() {
              this.menuScroll = new BScroll(this.$refs.menuWrapper, {
                click: true
              });

              this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
                click: true, // 添加click事件，使cartcontrol.vue的click事件生效
                probeType: 3 // 设置scroll滚动时可以给出实时位置
              });
              this.foodsScroll.on('scroll', (pos) => {
                this.scrollY = Math.abs(Math.round(pos.y)); // 获取实时滚动位置
              });
          },
          _calculateHeight() {
            let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
            let height = 0;
            this.listHeight.push(height);
            for (let i = 0; i < foodList.length; i++) {
              let item = foodList[i];
              height += item.clientHeight;
              this.listHeight.push(height);
            }
          }
        },
        components: {
          shopcart,
          cartcontrol,
          food
        }/* ,
        events: {
          'cart.add'(target) {
            this._drop(target);
          }
        } */
    };
</script>
<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin"
  .goods
    display: flex
    position: absolute
    width: 100%
    bottom: 46px // 购物车的高度
    top: 174px  // header+商品标签的高度
    overflow: hidden
    .menu-wrapper
      flex: 0 0 80px //等分、内容不足缩放情况、占位空间
      width: 80px
      background: #f3f5f7
      .menu-item
        display: table //table保证一行或者两行字都保持垂直居中
        height: 54px
        width: 56px
        line-height: 14px
        padding: 0 12px
        &.current
          position: relative
          z-index: 10
          margin-top: -1px
          background: #fff
          font-weight: 700
          .text
            border-none()
        .icon
          display: inline-block
          vertical-align: top
          width: 12px
          height: 12px
          margin-right: 2px
          &.decrease
            bg-image('decrease_3')
          &.discount
            bg-image('discount_3')
          &.guarantee
            bg-image('guarantee_3')
          &.invoice
            bg-image('invoice_3')
          &.special
            bg-image('special_3')
          background-size: 12px 12px
          background-repeat: no-repeat
        .text
            display: table-cell
            width: 56px
            vertical-align: middle //垂直居中
            border-1px(rgba(7,17,27,0.1))
            font-size: 12px
    .foods-wrapper
      flex: 1
      .title
        padding-left: 14px
        height: 26px
        line-height: 26px
        border-left: 2px solid #d9dde1
        font-size: 12px
        color: rgb(147, 153, 159)
        background: #f3f5f7
      .food-item
        display: flex
        margin: 18px
        padding-bottom: 18px
        border-1px(rgba(7,17,27,0.1))
        &:last-child
          border-none()
          margin-bottom: 0
        .icon
          flex: 0 0 57px
          margin-right: 10px
        .content
          flex: 1
          .name
            margin: 2px 0 8px 0
            height: 14px
            line-height: 14px
            font-size: 14px
            color: rgb(7, 17, 27)
          .desc, .extra
            line-height: 10px
            font-size: 10px
            color: rgb(147, 153, 159)
          .desc
            margin-bottom: 8px
            line-height: 12px
          .extra
            .count
              margin-right: 12px
          .price
            font-weight: 700
            line-height: 24px
            .now
              margin-right: 8px
              font-size: 14px
              color: rgb(240, 20, 20)
            .old
              text-decoration: line-through
              font-size: 10px
              color: rgb(147, 153, 159)
          .cartcontrol-wrapper
            position: absolute
            right: 0
            bottom: 12px
</style>
