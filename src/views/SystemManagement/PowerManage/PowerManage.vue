<template>
  <b-container fluid="xl">
    <page-title />
    <page-section>
      <b-button variant="primary" @click="powerOpen">
        {{ $t('power.powerOpen') }}
      </b-button>
      <b-button variant="primary" @click="powerClose">
        {{ $t('power.powerClose') }}
      </b-button>
      <b-button variant="primary" @click="reboot">
        {{ $t('power.reboot') }}
      </b-button>
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
        .dispatch('PowerManage/powerOpen')
        .catch((error) => console.log(error))
        .finally();
    },
    powerClose() {
      this.$store
        .dispatch('PowerManage/powerClose')
        .catch((error) => console.log(error))
        .finally();
    },
    reboot() {
      this.$store
        .dispatch('PowerManage/reboot')
        .catch((error) => console.log(error))
        .finally();
    },
  },
};
</script>

<style lang="scss" scoped></style>
