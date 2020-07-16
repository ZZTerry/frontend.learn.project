<template>
    <div class="cartcontrol">
        <transition name="move">
        <div class="cart-decrease" v-show="food.count>0" @click.stop.prevent="decreaseCart">
            <span class="inner icon-remove_circle_outline"></span>
        </div>
        </transition>
        <div class="cart-count" v-show="food.count>0">{{food.count}}</div>
        <div class="cart-add icon-add_circle" @click.stop.prevent="addCart"></div>
    </div>
</template>

<script>
    import Vue from 'vue';
    export default {
        props: {
            food: {
                type: Object
            }
        },
        created() {
            // console.log(this.food);
        },
        methods: {
            addCart(event) {
                if (!event._constructed) { // 解决PC点击两次问题,判断是better scroll创建的click事件才继续执行，忽略系统的click事件
                    return;
                }
                // console.log('click');
                if (!this.food.count) {
                    Vue.set(this.food, 'count', 1); // 通过Vue.set添加属性时，变化就能被观测到，最终能通知dom发生变化
                } else {
                    this.food.count++;
                }
                // 此处原使用this.$dispatch('cart.add', event.target),报错"TypeError: this.$dispatch is not a function"
                this.$emit('cart-add', event.target); // 创建一个事件，把当前事件dom对象传入(event.target)
            },
            decreaseCart() {
                if (!event._constructed) { // 解决PC点击两次问题
                    return;
                }
                if (this.food.count) {
                    this.food.count--;
                }
            }
        }
    };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .cartcontrol
    font-size: 0
    .cart-decrease // 外层负责平移
        display: inline-block
        padding: 6px
        transition: all 0.4s linear
        opacity: 1
        transform: translate3d(0, 0, 0)
        .inner //内层负责滚动
            display:inline-block
            line-height: 24px
            font-size: 24px
            color : rgb(0, 160, 220)
            transition: all 0.4s linear
            transform: rotate(0)
        &.move-enter, &.move-leave-to
            opacity: 0
            transform: translate3d(24px, 0, 0) // 设置x轴距离，从加号图表开始滚动和结束滚动
            .inner
                transform: rotate(180deg) //内层负责滚动
    .cart-count
        display: inline-block
        vertical-align: top
        width: 12px
        padding-top: 6px
        line-height: 24px
        text-align: center
        font-size: 10px
        color: rgb(147, 153, 159)
    .cart-add
        display: inline-block
        padding: 6px
        line-height: 24px
        font-size: 24px
        color : rgb(0, 160, 220)
</style>
