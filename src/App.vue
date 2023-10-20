<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
export default {
  name: 'App',
  computed: {
    assetTag() {
      return this.$store.getters['global/assetTag'];
    },
  },
  watch: {
    assetTag(tag: any) {
      if (tag) {
        document.title = `${this.$route.meta.title}`;
      }
    },
    $route(to: { meta: { title: string } }) {
      document.title = to.meta.title || 'Page is missing title';
    },
  },
  mounted() {
    //Browser version detection.
    //Return head value of user-agent.
    const ua = navigator.userAgent.toLowerCase();
    // Chrome version detection.
    if (/chrome\/(\d+)/.test(ua)) {
      const matcher = ua.match(/chrome\/(\d+)/);
      if (matcher) {
        const chromeVersion = parseInt(matcher[1]);
        if (chromeVersion < 113)
          this.$bvModal.msgBoxOk(this.$t('global.BrowserVersionLow'));
      }
    }
    // Edge version detection.
    else if (/edge\/(\d+)/.test(ua)) {
      const matcher = ua.match(/edge\/(\d+)/);
      if (matcher) {
        const edgeVersion = parseInt(matcher![1]);
        if (edgeVersion < 113)
          this.$bvModal.msgBoxOk(this.$t('global.BrowserVersionLow'));
      }
    }
    // Firefox version detection.
    else if (/firefox\/(\d+)/.test(ua)) {
      const matcher = ua.match(/firefox\/(\d+)/);
      if (matcher) {
        const firefoxVersion = parseInt(matcher![1]);
        if (firefoxVersion < 113)
          this.$bvModal.msgBoxOk(this.$t('global.BrowserVersionLow'));
      }
    }
    // Other browsers.
    else {
      this.$bvModal.msgBoxOk(this.$t('global.BrowserVersionMisMatch'));
    }
  },
  created() {
    document.title = this.$route.meta.title || 'Page is missing title';
  },
};
</script>

<style lang="scss">
@import '@/assets/styles/_obmc-custom';
#app {
  position: relative;
}
#__SVG_SPRITE_NODE__ {
  display: none;
}
</style>
