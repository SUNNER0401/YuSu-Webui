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
      // return this.$store.getters['multimachine/multimachineValue'];
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
