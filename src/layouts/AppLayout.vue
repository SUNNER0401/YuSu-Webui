<template>
  <el-container class="position-relative">
    <el-header
      ><app-header ref="focusTarget" class="app-header" @refresh="refresh"
    /></el-header>
    <el-container id="body-container" class="overflow-auto">
      <el-aside class="position-fixed"> <app-navigation /></el-aside>
      <el-main
        class="position-fixed"
        :class="{
          isFullScreen:
            $route.path === '/' ||
            $route.name === 'page-not-found' ||
            $route.path === '/profile-settings',
        }"
      >
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
        </page-container>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import AppHeader from '@/components/AppHeader';
import AppNavigation from '@/components/AppNavigation';
import PageContainer from '@/components/Global/PageContainer';
import ButtonBackToTop from '@/components/Global/ButtonBackToTop';
import JumpLinkMixin from '@/components/Mixins/JumpLinkMixin';
import 'animate.css';
import { Container, Header, Main, Aside } from 'element-ui';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppNavigation,
    PageContainer,
    ButtonBackToTop,
    [Container.name]: Container,
    [Header.name]: Header,
    [Main.name]: Main,
    [Aside.name]: Aside,
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
.app-header {
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: $zindex-fixed + 1;
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

.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
  padding: 0px;
}

.el-aside {
  width: $navigation-width !important;
  height: calc(100% - #{$header-height});
  background-color: #d3dce6;
  color: #333;
  text-align: center;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  height: 100%;
  left: $navigation-width;
  right: 0;
  padding: 0;
}
.el-main.isFullScreen {
  left: 0;
  position: fixed;
}

body > .el-container {
  margin-bottom: 40px;
}
#body-container {
  min-width: 1454px;
}
</style>
