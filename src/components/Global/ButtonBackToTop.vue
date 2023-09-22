<template>
  <b-button
    id="scrollToTopBtn"
    class="btn-top btn-icon-only"
    :class="{ 'show-btn': showButton }"
    variant="secondary"
    :title="$t('global.ariaLabel.scrollToTop')"
    @click="scrollToTop"
  >
    <icon-up-to-top />
    <span class="sr-only">{{ $t('global.ariaLabel.scrollToTop') }}</span>
  </b-button>
</template>

<script lang="ts">
import UpToTop24 from '@carbon/icons-vue/es/up-to-top/24';

export default {
  name: 'BackToTop',
  components: { IconUpToTop: UpToTop24 },
  data() {
    return {
      showButton: false,
    };
  },
  mounted() {
    document
      .querySelector('.el-main')!
      .addEventListener('scroll', this._.debounce(this.handleScroll, 200));
  },
  methods: {
    handleScroll() {
      document.querySelector('.el-main')!.scrollTop > 500
        ? (this.showButton = true)
        : (this.showButton = false);
    },
    scrollToTop() {
      document.querySelector('.el-main')!.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.btn-top {
  position: fixed;
  bottom: 24px;
  right: 24px;

  box-shadow: $box-shadow;
  visibility: hidden;
  opacity: 0;
  transition: $transition-base;
  z-index: $zindex-fixed;

  @media (min-width: 1600px) {
    left: 1485px;
    right: auto;
  }
}
.show-btn {
  visibility: visible;
  opacity: 1;
}
</style>
