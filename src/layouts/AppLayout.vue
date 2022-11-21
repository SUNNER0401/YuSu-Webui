<template>
  <div class="app-container">
    <app-header ref="focusTarget" class="app-header" @refresh="refresh" />
    <app-navigation class="app-navigation" />
    <page-container class="app-content">
      <transition
        name="animate__animated animate__bounce"
        leave-active-class="animate__fadeOut"
        enter-active-class="animate__fadeIn"
        mode="out-in"
      >
        <router-view ref="routerView" :key="routerKey" />
      </transition>
      <!-- Scroll to top button -->
      <button-back-to-top />
      <!-- <div class="two-dimension">
        <img
          class="two-dimension"
          src="@/env/assets/images/phytium-two-dimension.jpg"
        />
      </div> -->
    </page-container>
    <!-- <app-footer class="app-footer">
      <copy-right class="app-copyright" />
    </app-footer> -->
  </div>
</template>

<script lang="ts">
import AppHeader from '@/components/AppHeader';
import AppNavigation from '@/components/AppNavigation';
import PageContainer from '@/components/Global/PageContainer';
// import AppFooter from '@/components/AppFooter';
import ButtonBackToTop from '@/components/Global/ButtonBackToTop';
// import CopyRight from '@/components/Global/CopyRight';
import JumpLinkMixin from '@/components/Mixins/JumpLinkMixin';
import 'animate.css';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppNavigation,
    PageContainer,
    // AppFooter,
    ButtonBackToTop,
    // CopyRight,
  },
  mixins: [JumpLinkMixin],
  data() {
    return {
      routerKey: 0,
    };
  },
  watch: {
    $route: function () {
      this.$nextTick(function () {
        this.setFocus(this.$refs.focusTarget.$el);
      });
    },
  },
  mounted() {
    this.$root.$on('refresh-application', () => this.refresh());
  },
  methods: {
    refresh() {
      // Changing the component :key value will trigger
      // a component re-rendering and 'refresh' the view
      this.routerKey += 1;
    },
  },
};
</script>

<style lang="scss" scoped>
.app-container {
  display: grid;
  background-color: $Page-background-color;
  grid-template-columns: 100%;
  grid-template-rows: auto;
  grid-template-areas:
    'header'
    'content';

  @include media-breakpoint-up($responsive-layout-bp) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'header'
      'content'
      'footer';
  }
}

.app-header {
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: $zindex-fixed + 1;
}

.app-navigation {
  grid-area: navigation;
}

.app-content {
  grid-area: content;
  overflow: hidden;
}
.two-dimension {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 10000;
}
.animate__animated {
  animation-duration: 500ms;
  -webkit-animation-duration: 500ms;
}
.app-footer {
  grid-area: footer;
  background-color: #c3e2e5;
}
</style>
