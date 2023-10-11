<template>
  <div class="app-navigation">
    <div style="font-size: 2rem" class="pt-3">{{ fatherName[fatherPath] }}</div>
    <el-divider></el-divider>
    <div
      v-for="(item, i) in filteredNavigation(headerNavigation[fatherPath])"
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
import headerNavigation, {
  FatherName,
  NavItemType,
} from '../AppHeader/HeaderNavigation';

export default {
  name: 'AppNavigation',
  components: {
    'el-divider': Divider,
  },
  data() {
    return {
      currentUserRole: null,
    };
  },
  computed: {
    fatherPath() {
      return this.$route.path === '/' ? '/' : this.$route.path.split('/')[1];
    },
    fatherName() {
      return FatherName;
    },
    headerNavigation() {
      return headerNavigation;
    },
  },
  mounted() {
    this.getPrivilege();
  },
  methods: {
    routerPush(key: string) {
      this.$router.push(key);
    },
    isActive(path: string) {
      if (path != '/') return new RegExp('^' + path).test(this.$route.path);
      return path == this.$route.path;
    },
    getPrivilege() {
      this.currentUserRole = this.$store?.getters['global/userPrivilege'];
    },
    filteredNavigation(navigation: NavItemType[]) {
      if (this.currentUserRole) {
        return navigation.filter((item) => {
          if (item.meta.exclusiveToRoles) {
            return item.meta.exclusiveToRoles!.includes(this.currentUserRole);
          } else return true;
        });
      } else return navigation;
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
