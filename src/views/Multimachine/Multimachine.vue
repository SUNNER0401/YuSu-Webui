<template>
  <b-container fluid>
    <page-title />
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
    <!-- 分页页面切换器 -->
    <!-- <div class="mt-3">
      <b-pagination
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        first-number
        last-number
        class="pagi"
      ></b-pagination>
    </div> -->
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
      // rows: 34, //数据集中的总行数
      // perPage: 8, //每页应显示的数据行数
      // currentPage: 2, //当前用户正在查看的页码
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
          warning: '0',
          error: '13',
        },
        test2: {
          model: 18,
          serialNumber: '556',
          ipAddress: '192.168.0.0',
          health: 'no',
          hostname: 'vdaf',
          linkStatus: 'fine',
          warning: '8',
          error: '0',
        },
        test3: {
          model: 18,
          serialNumber: '345',
          ipAddress: '192.168.0.0',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '1',
          error: '2',
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
          serialNumber: '1310',
          ipAddress: '192.168.0.100',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '0',
          error: '0',
        },
        test6: {
          model: 18,
          serialNumber: '9490',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'local',
          linkStatus: 'fine',
          warning: '0',
          error: '0',
        },
        test7: {
          model: 18,
          serialNumber: '4527',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '100',
          error: '0',
        },
        test8: {
          model: 18,
          serialNumber: '55558',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '0',
          error: '1',
        },
        test9: {
          model: 18,
          serialNumber: '987',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '3',
          error: '0',
        },
        test10: {
          model: 18,
          serialNumber: '657',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '10',
          error: '0',
        },
        test11: {
          model: 18,
          serialNumber: '7563',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '3',
          error: '0',
        },
        test12: {
          model: 323,
          serialNumber: '643',
          ipAddress: '192.168.0.123',
          health: 'yes',
          hostname: 'sdfsf',
          linkStatus: 'fine',
          warning: '0',
          error: '0',
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
/* .page-item:first-child .page-link {
  margin-left: 0;
  background-color: #d9eff0;
  border-radius: 3px;
  color: black;
}
.page-link {
  font-size: 18px;
  border-radius: 2px;
  height: 37.5px;
  background-color: #d9eff0;
  color: #000000;
}
.page-item.disabled .page-link {
  background-color: #d7dcec;
}
.b-pagination .page-item.active button {
  background-color: #d7dcec;
  border-color: #d8d8d8;
  box-shadow: inset 0px -2px #7a7a7a;
}
.page-link:hover {
  color: #161616;
  text-decoration: none;
  background-color: #d7dcec;
} */
</style>
