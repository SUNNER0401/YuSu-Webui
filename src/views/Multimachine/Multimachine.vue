<template>
  <b-container fluid>
    <page-title />
    <!-- 分页页面切换器 -->
    <div class="mt-3">
      <b-pagination
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        first-number
        last-number
        class="pagi"
      ></b-pagination>
    </div>
    <!-- Test测试所用 -->
    <!-- <b-card-group>
      <multimachine-card v-for="n in numCards" :key="n"></multimachine-card>
    </b-card-group> -->
    <!-- 实际使用 -->
    <b-card-group>
      <div v-for="(value, key) in MultimachineCards" :key="key">
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
      //卡片数量
      numCards: 7,
      //分页数据
      rows: 100,
      perPage: 1,
      currentPage: 5,
    };
  },
  computed: {
    //定义一个计算属性计算属性
    MultimachineCards() {
      // example
      //有几个传入的数组，那就渲染多少个块块
      return {
        test1: {
          model: 18,
          serialNumber: '1213',
          ipAddress: '192.168.0.0',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '5',
          error: '10',
        },
        test2: {
          model: 18,
          serialNumber: '12400',
          ipAddress: '192.168.0.0',
          health: 'no',
          hostname: 'vdaf',
          linkStatus: 'fine',
          warning: '5',
          error: '7',
        },
        test3: {
          model: 18,
          serialNumber: '1213',
          ipAddress: '192.168.0.0',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '0',
          error: '9',
        },
        test4: {
          model: 18,
          serialNumber: '1213',
          ipAddress: '192.168.0.0',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '0',
          error: '1',
        },
        test5: {
          model: 18,
          serialNumber: '1213',
          ipAddress: '192.168.0.100',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '5',
          error: '10',
        },
        test6: {
          model: 18,
          serialNumber: '1213',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '5',
          error: '10',
        },
        test7: {
          model: 18,
          serialNumber: '7777',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '100',
          error: '10',
        },
      };
      //返回 Vuex 状态管理getters中 multimachine/multimachineValue 的值
      // return this.$store.getters['multimachine/multimachineValue'];
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
<style>
.pagi {
  margin-right: 19px;
}
</style>
