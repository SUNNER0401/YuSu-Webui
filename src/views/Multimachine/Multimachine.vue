<template>
  <b-container fluid>
    <page-title />
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
export default {
  name: 'Multimachine',
  components: {
    PageTitle,
    MultimachineCard,
  },
  mixins: [LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    clearInterval(this.timer);
    this.hideLoader();
    next();
  },
  computed: {
    MultimachineCards() {
      // return {
      //   test1: {
      //     model: 18,
      //     serialNumber: '1213',
      //     ipAddress: '192.168.0.0',
      //     health: 'yes',
      //     hostname: 'local',
      //     linkStatus: 'fine',
      //     warning: '0',
      //     error: '13',
      //   },
      //   test12: {
      //     model: 323,
      //     serialNumber: '643',
      //     ipAddress: '192.168.0.123',
      //     health: 'yes',
      //     hostname: 'sdfsf',
      //     linkStatus: 'fine',
      //     warning: '0',
      //     error: '0',
      //   },
      // };
      return this.$store.getters['multimachine/multimachineValue'];
    },
  },
  created() {
    this.startLoader();
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
