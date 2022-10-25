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
</style>
