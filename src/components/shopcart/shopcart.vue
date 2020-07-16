<template>
    <div>
        <div class="shopcart">
            <div class="content" @click="toggleList">
                <div class="content-left">
                    <div class="logo-wrapper">
                        <div class="logo" :class="{'highlight':totalCount>0}">
                            <i class="icon-shopping_cart" :class="{'highlight':totalCount>0}"></i>
                        </div>
                        <div class="num" v-show="totalCount>0">{{totalCount}}</div>
                    </div>
                    <div class="price" :class="{'highlight':totalPrice>0}">¥{{totalPrice}}</div>
                    <div class="desc">另需配送费¥{{deliveryPrice}}元</div>
                </div>
                <!-- click.stop.prevent阻止冒泡或者说默认事件的发生 -->
                <div class="content-right" @click.stop.prevent="pay">
                    <div class="pay" :class="payClass">{{payDesc}}</div>
                </div>
            </div>
            <!-- 购物车小球 -->
            <div class="ball-container">
                <div v-for="(ball,index) in balls" :key="index">
                    <transition name="drop" @before-enter="handleBeforeEnter"
                @enter="handleEnter" @after-enter="handleAfterEnter">
                        <div class="ball" v-show="ball.show" v-bind:css="false"> <!-- 外层盒子 -->
                            <div class="inner inner-hook"></div> <!-- 内层盒子 -->
                        </div>
                    </transition>
                </div>
            </div>
            <transition name="fold">
                <div class="shopcart-list" v-show="listShow">
                    <div class="list-header">
                        <h1 class="title">购物车</h1>
                        <span class="empty" @click="empty">清空</span>
                    </div>
                    <div class="list-content" ref="listContent">
                        <ul>
                            <li class="food" v-for="(food,index) in selectFoods" :key="index">
                                <span class="name">{{food.name}}</span>
                                <div class="price">
                                    <span>¥{{food.price*food.count}}</span>
                                </div>
                                <div class="cartcontrol-wrapper">
                                    <cartcontrol :food="food"></cartcontrol>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </transition>
        </div>
        <transition name="fade">
            <div class="list-mask" v-show="listShow" @click="hideList"></div>
        </transition>
    </div>
</template>

<script>
    import cartcontrol from '../cartcontrol/cartcontrol';
    import BScroll from 'better-scroll';
    export default {
        props: {
            selectFoods: {
                type: Array,
                default() {
                    return [];
                }
            },
            deliveryPrice: {
                type: Number,
                default: 0
            },
            minPrice: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                balls: [ // 使用balls存放5个小球，这些小球的默认状态都是不显示的
                    {
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    },
                    {
                        show: false
                    }
                ],
                dropBalls: [], // 用dropBalls来存放掉落的小球
                fold: true
            };
        },
        computed: {
            totalPrice() {
                let total = 0;
                this.selectFoods.forEach((food) => {
                    total += food.price * food.count;
                });
                return total;
            },
            totalCount() {
                let count = 0;
                this.selectFoods.forEach((food) => {
                    count += food.count;
                });
                // console.log(count);
                return count;
            },
            payDesc() {
                if (this.totalPrice === 0) {
                    return `¥${this.minPrice}元起送`; // 反引号（~同一按键）直接拼接字符串，不用使用加号
                } else if (this.totalPrice < this.minPrice) {
                    let diff = this.minPrice - this.totalPrice;
                    return `还差¥${diff}元起送`;
                } else {
                    return '去结算';
                }
            },
            payClass() {
                if (this.totalPrice < this.minPrice) {
                    return 'not-enough';
                } else {
                    return 'enough';
                }
            },
            listShow() {
                if (!this.totalCount) {
                    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                    this.fold = true;
                    return false;
                }
                let show = !this.fold;
                if (show) {
                    this.$nextTick(() => {
                        if (!this.scroll) {
                            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                            this.scroll = new BScroll(this.$refs.listContent, {
                                click: true
                            });
                        } else {
                            this.scroll.refresh();
                        }
                    });
                }
                return show;
            }
        },
        methods: {
            // 当触发drop方法时小球开始掉落
            drop(el) {
                for (let i = 0; i < this.balls.length; i++) {
                    let ball = this.balls[i];
                    if (!ball.show) {
                        ball.show = true;
                        ball.el = el; // 将cartcontrol传过来的对象挂载到ball的el属性上
                        this.dropBalls.push(ball);
                        return;
                    }
                }
            },
            handleBeforeEnter: function(el) {
                let count = this.balls.length;
                while (count--) {
                    let ball = this.balls[count];
                    if (ball.show) {
                        let rect = ball.el.getBoundingClientRect(); // 获取小球相对于视窗的位置，屏幕左上角坐标为0,0
                        let x = rect.left - 32; // 小球x方向位移 = 小球距离屏幕左侧的距离 - 外层盒子距离水平的距离
                        let y = -(window.innerHeight - rect.top - 22); // 负数，因为是从左上角向下
                        el.style.display = '';
                        el.style.webkitTransform = `translate3d(0,${y}px,0)`;
                        el.style.transform = `translate3d(0,${y}px,0)`;
                        let inner = el.getElementsByClassName('inner-hook')[0]; // 获取内层盒子
                        inner.style.webkitTransform = `translate3d(${x}px,0,0)`; // 设置内层盒子，即小球水平方向的距离
                        inner.style.transform = `translate3d(${x}px,0,0)`;
                    }
                }
            },
            handleEnter: function(el, done) {
                /* eslint-disable no-unused-vars */
                let rf = el.offsetHeight; // 触发浏览器重绘
                this.$nextTick(() => {
                    el.style.webkitTransform = 'translate3d(0,0,0)';
                    el.style.transform = 'translate3d(0,0,0)';
                    let inner = el.getElementsByClassName('inner-hook')[0];
                    inner.style.webkitTransform = 'translate3d(0,0,0)';
                    inner.style.transform = 'translate3d(0,0,0)';
                    // Vue为了知道过渡的完成，必须设置相应的事件监听器
                    // 如果没有这一句将不会执行handleAfterEnter
                    el.addEventListener('transitionend', done);
                });
            },
            handleAfterEnter: function(el) {
                // el.style.display = 'none';
                let ball = this.dropBalls.shift(); // 完成一次动画就删除一个dropBalls的小球
                if (ball.show) {
                    ball.show = false;
                    el.style.display = 'none';
                }
            },
            toggleList() {
                if (!this.totalCount) {
                    return;
                }
                this.fold = !this.fold;
            },
            hideList () {
                this.fold = true;
            },
            empty() {
                this.selectFoods.forEach((food) => {
                    food.count = 0;
                });
            },
            pay() {
                if (this.totalPrice < this.minPrice) {
                    return;
                }
                window.alert(`支付${this.totalPrice}元`);
            }
        },
        components: {
            cartcontrol
        }
    };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/mixin"
  .shopcart
    position: fixed
    left: 0
    bottom: 0
    z-index : 50
    width: 100%
    height: 48px
    .content
      display: flex
      background: #141d27
      font-size: 0
      color: rgba(255, 255, 255, 0.4)
      .content-left
        flex: 1 //宽度自适应
        .logo-wrapper
          display: inline-block
          vertical-align: top
          position: relative
          top: -10px
          margin: 0 12px
          padding: 6px
          width: 56px
          height: 56px
          box-sizing: border-box
          border-radius: 50% //圆角
          background: #141d27
          .logo
            width: 100%
            height: 100%
            border-radius: 50%
            text-align: center
            background: #2b343c
            &.highlight
              background: rgb(0, 160, 220)
            .icon-shopping_cart
              line-height: 44px
              font-size: 24px
              color: #80858a
              &.highlight
                color: #fff
          .num
            position: absolute
            top: 0
            right: 0
            width: 24px
            height: 16px
            line-height: 16px
            text-align: center
            border-radius: 16px
            font-size: 9px
            font-weight: 700
            color: #fff
            background: rgb(240, 20, 20)
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4)
        .price
          display: inline-block
          vertical-align: top
          margin-top: 12px
          line-height: 24px
          padding-right: 12px
          box-sizing: border-box
          border-right: 1px solid rgba(255, 255, 255, 0.1)
          font-size: 16px
          font-weight: 700
          &.highlight
            color: #fff
        .desc
          display: inline-block
          vertical-align: top
          margin: 12px 0 0 12px
          line-height: 24px
          font-size: 10px
      .content-right
        flex: 0 0 105px
        width: 105px
        .pay
          height: 48px
          line-height: 48px
          text-align: center
          font-size: 12px
          font-weight: 700
          background:  #2b333b
          &.not-enough
            background: #2b333b
          &.enough
            background: #00b43c
            color: #fff
    .ball-container
        .ball
            position: fixed
            left: 32px
            bottom: 22px
            z-index: 999
            &.drop-enter-active, &.drop-enter-active
                /* 贝塞尔曲线，官网https://cubic-bezier.com */
                transition: all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
                .inner
                    width: 16px
                    height: 16px
                    border-radius: 50%
                    background: rgb(0, 160, 220)
                    transition: all 0.4s linear
    .shopcart-list
        position: absolute
        left: 0
        top: 0
        z-index:-1
        width: 100%
        transition: all 0.5s
        transform: translate3d(0, -100%, 0)
        &.fold-enter, &.fold-leave-to
            transform: translate3d(0, 0, 0)
        .list-header
            height: 40px
            line-height: 40px
            padding: 0 18px
            background: #f3f5f7
            border-bottom: 1px solid rgba(7, 17, 27, 0.1)
            .title
                float: left
                font-size: 14px
                color: rgb(7, 17, 27)
            .empty
                float: right
                font-size: 12px
                color: rgb(0, 160, 220)
        .list-content
            padding: 0 18px
            max-height: 217px
            overflow: hidden
            background: #fff
            .food
                position: relative
                padding: 12px 0
                box-sizing: border-box
                border-1px(rgba(7, 17, 27, 0.1))
                .name
                    line-height: 24px
                    font-size: 14px
                    color: rgb(7, 17, 27)
                .price
                    position: absolute
                    right: 90px
                    bottom: 12px
                    line-height: 24px
                    font-size: 14px
                    font-weight: 700
                    color: rgb(240, 20, 20)
                .cartcontrol-wrapper
                    position: absolute
                    right: 0
                    bottom: 6px
  .list-mask
    position: fixed
    top: 0
    left: 0
    width: 100%
    height: 100%
    z-index: 40
    backdrop-filter: blur(10px)
    transition: all 0.5s
    opacity: 1
    background: rgba(7, 17, 27, 0.6)
    &.fade-enter, &.fade-leave-to
        opacity: 0
        background: rgba(7,17, 27, 0)
</style>
