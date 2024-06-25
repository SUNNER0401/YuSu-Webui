<template>
  <b-container fluid>
    <!-- 页面标题 -->
    <page-title />
    <b-card-group>
      <multimachine-card></multimachine-card>
      <multimachine-card></multimachine-card>
      <multimachine-card></multimachine-card>
      <multimachine-card></multimachine-card>
      <multimachine-card></multimachine-card>
      <multimachine-card></multimachine-card>
      <multimachine-card></multimachine-card>
      <multimachine-card></multimachine-card>
      <multimachine-card></multimachine-card>
      <multimachine-card></multimachine-card>
      <multimachine-card></multimachine-card>
    </b-card-group>
    <!-- <b-card-group>
      <div v-for="(value,key)in MultimachineCard" :key="key">
        <multimachine-card :data="value" :title="key"> </multimachine-card>
      </div>
    </b-card-group> -->
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
  //离开当前路由之前做的一些工作
  // beforeRouteLeave (to, from, next) {
  //   clearInterval(this.timer);
  //   this.hideLoader();
  //   next();
  // },
  // data() {
  //   return {};
  // },
  // computed: {
  //   MultimachineCard() {
  //     return this.$store.getters['Multimachine/'];
  //   },
  // },
};
</script>
