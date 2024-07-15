<template>
  <b-container fluid="xl">
    <page-title />
    <page-section class="con">
      <div class="part1">
        <b-button variant="primary" style="width: 90px" @click="powerOpen">
          {{ $t('power.powerOpen') }}
        </b-button>
        <b-button variant="primary" style="width: 90px" @click="powerClose">
          {{ $t('power.powerClose') }}
        </b-button>
        <b-button variant="primary" style="width: 90px" @click="reboot">
          {{ $t('power.reboot') }}
        </b-button>
      </div>
      <div class="part2">
        <b-button variant="primary" style="width: 300px" @click="reboot">
          {{ $t('power.vga') }}
        </b-button>
      </div>
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'PowerManage',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {};
  },
  computed: {
    currentStatus() {
      return this.$store.getters['PowerManage/currentStatus'];
    },
  },
  created() {
    this.startLoader();
  },
  methods: {
    // auto control command
    powerOpen() {
      this.$store
        .dispatch('powerManage/powerOpen')
        .catch((error) => console.log(error))
        .finally();
    },
    powerClose() {
      this.$store
        .dispatch('powerManage/powerClose')
        .catch((error) => console.log(error))
        .finally();
    },
    reboot() {
      this.$store
        .dispatch('powerManage/reboot')
        .catch((error) => console.log(error))
        .finally();
    },
    vga() {
      this.$store
        .dispatch('powerManage/vga')
        .catch((error) => console.log(error))
        .finally();
    },
  },
};
</script>

<style lang="scss" scoped>
.con {
  display: flex;
  flex-direction: column;
}
.part1 {
  display: flex;
  justify-content: space-between;
  width: 300px;
  margin-bottom: 20px;
}
</style>
