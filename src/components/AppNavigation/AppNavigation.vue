<template>
  <div class="app-navigation">
    <div style="font-size: 2rem" class="pt-3">{{ FatherName[FatherPath] }}</div>
    <el-divider></el-divider>
    <div
      v-for="(item, i) in headerNavigation[FatherPath]"
      :key="i"
      class="nav-item py-3"
      :class="{ active: isActive(item.path) }"
      @click="routerPush(item.path)"
    >
      {{ item.meta.title }}
    </div>
  </div>
</template>

<script lang="ts">
//Do not change Mixin import.
//Exact match alias set to support
//dotenv customizations.
import { Divider } from 'element-ui';
import headerNavigation, { FatherName } from '../AppHeader/HeaderNavigation';

export default {
  name: 'AppNavigation',
  components: {
    'el-divider': Divider,
  },
  computed: {
    FatherPath() {
      return this.$route.path === '/' ? '/' : this.$route.path.split('/')[1];
    },
    FatherName() {
      return FatherName;
    },
    headerNavigation() {
      return headerNavigation;
    },
  },
  methods: {
    routerPush(key: string) {
      this.$router.push(key);
    },
    isActive(path: string) {
      if (path != '/') return new RegExp('^' + path).test(this.$route.path);
      return path == this.$route.path;
    },
  },
};
</script>

<style scoped lang="scss">
.app-navigation {
  color: #f2f6fc;
  width: 100%;
  height: 100%;
  background: #303133;
}
.nav-item {
  cursor: pointer;
  &:hover {
    background: #f2f6fc;
    color: #303133;
  }
}
div.active {
  background: #f2f6fc;
  color: #303133;
}
</style>
