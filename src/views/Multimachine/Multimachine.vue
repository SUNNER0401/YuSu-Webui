<template>
  <b-container fluid>
    <page-title />
    <!-- Test测试所用 -->
    <b-card-group>
      <multimachine-card v-for="n in numCards" :key="n"></multimachine-card>
    </b-card-group>
    <!-- 实际使用 -->
    <b-card-group>
      <div v-for="(value, key) in MultimachineCard" :key="key">
        <multimachine-card :data="value" :title="key"> </multimachine-card>
      </div>
    </b-card-group>
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';
import MultimachineCard from './MultimachineCard';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
// import MultimachineCard from './MultimachineCard.vue';
export default {
  name: 'Multimachine',
  components: {
    PageTitle,
    MultimachineCard,
  },
  mixins: [LoadingBarMixin],
  //离开当前路由时清除定时器并隐藏加载器
  beforeRouteLeave(to, from, next) {
    clearInterval(this.timer);
    this.hideLoader(); //这个方法在 LoadingBarMixin 中定义
    next();
  },
  data() {
    return {
      numCards: 11, // 初始值为15，等待后端数据更新
    };
  },
  computed: {
    //定义一个计算属性计算属性
    MultimachineCard() {
      //返回 Vuex 状态管理getters中 multimachine/multimachineValue 的值
      return this.$store.getters['multimachine/multimachineValue'];
    },
  },
  created() {
    this.startLoader();
    //每个一秒钟就获取一次值，从服务器或其他数据源获取最新的 MultimachineValue
    this.timer = setInterval(() => {
      this.$store.dispatch('multimachine/getMultimachineValue');
    }, 1000);
  },
};
</script>
