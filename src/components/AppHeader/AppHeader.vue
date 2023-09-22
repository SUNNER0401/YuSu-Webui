<template>
  <div>
    <header id="page-header">
      <a
        class="link-skip-nav btn btn-light"
        href="#main-content"
        @click="setFocus"
      >
        {{ $t('appHeader.skipToContent') }}
      </a>
      <b-navbar type="dark" :aria-label="$t('appHeader.applicationHeader')">
        <!-- Left aligned nav items -->
        <b-button
          id="app-header-trigger"
          class="nav-trigger"
          aria-hidden="true"
          type="button"
          variant="link"
          :class="{ open: isNavigationOpen }"
          @click="toggleNavigation"
        >
          <icon-close
            v-if="isNavigationOpen"
            :title="$t('appHeader.titleHideNavigation')"
          />
          <icon-menu
            v-if="!isNavigationOpen"
            :title="$t('appHeader.titleShowNavigation')"
          />
        </b-button>
        <b-navbar-nav>
          <b-navbar-brand
            class="mr-0"
            to="/"
            data-test-id="appHeader-container-overview"
            :title="companyName"
          >
            <img
              class="header-logo"
              src="@/env/assets/images/OurBMC-logo.png"
              :alt="altLogo"
            />
          </b-navbar-brand>
        </b-navbar-nav>
        <div class="header-nav mx-auto">
          <el-menu
            :default-active="activeIndex"
            class="el-menu-demo"
            mode="horizontal"
            @select="handleSelect"
          >
            <el-menu-item id="overview-button" index="/">{{
              $t('appPageTitle.overview')
            }}</el-menu-item>
            <el-submenu index="/system-management">
              <template slot="title">{{
                $t('appNavigation.systemManagement')
              }}</template>
              <el-menu-item
                v-for="(info, i) in headerNavigation['system-management']"
                :key="i"
                :index="info.path"
                >{{ info.meta.title }}</el-menu-item
              >
            </el-submenu>
            <el-submenu index="/diagnostic">
              <template slot="title">{{
                $t('appNavigation.diagnostic')
              }}</template>
              <el-menu-item
                v-for="(info, i) in headerNavigation['diagnostic']"
                :key="i"
                :index="info.path"
                >{{ info.meta.title }}</el-menu-item
              >
            </el-submenu>
            <el-submenu index="/user-security">
              <template slot="title">{{
                $t('appNavigation.UserSecurity')
              }}</template>
              <el-menu-item
                v-for="(info, i) in headerNavigation['user-security']"
                :key="i"
                :index="info.path"
                >{{ info.meta.title }}</el-menu-item
              >
            </el-submenu>
            <el-submenu index="/services">
              <template slot="title">{{
                $t('appNavigation.Services')
              }}</template>
              <el-menu-item
                v-for="(info, i) in headerNavigation['services']"
                :key="i"
                :index="info.path"
                >{{ info.meta.title }}</el-menu-item
              >
            </el-submenu>
            <el-submenu index="/settings">
              <template slot="title">{{
                $t('appNavigation.settings')
              }}</template>
              <el-menu-item
                v-for="(info, i) in headerNavigation['settings']"
                :key="i"
                :index="info.path"
                >{{ info.meta.title }}</el-menu-item
              >
            </el-submenu>
          </el-menu>
        </div>
        <!-- Right aligned nav items -->
        <b-navbar-nav class="helper-menu">
          <b-nav-item
            to="/diagnostic/event-logs"
            data-test-id="appHeader-container-health"
          >
            <status-icon :status="healthStatusIcon" />
            {{ $t('appHeader.health') }}
          </b-nav-item>
          <b-nav-item
            to="/settings/server-power-operations"
            data-test-id="appHeader-container-power"
          >
            <status-icon :status="serverStatusIcon" />
            {{ $t('appHeader.power') }}
          </b-nav-item>
          <!-- Using LI elements instead of b-nav-item to support semantic button elements -->
          <li class="nav-item">
            <b-button
              id="app-header-refresh"
              variant="link"
              data-test-id="appHeader-button-refresh"
              @click="refresh"
            >
              <icon-renew :title="$t('appHeader.titleRefresh')" />
              <span class="responsive-text">{{ $t('appHeader.refresh') }}</span>
            </b-button>
          </li>
          <li class="nav-item">
            <b-dropdown
              id="app-header-user"
              variant="link"
              right
              data-test-id="appHeader-container-user"
            >
              <template #button-content>
                <icon-avatar :title="$t('appHeader.titleProfile')" />
                <span class="responsive-text">{{ username }}</span>
              </template>
              <b-dropdown-item
                data-test-id="appHeader-link-switchLanguage"
                @click="switchLanguage($event)"
                >{{ $t('appHeader.switchLanguage') }}
              </b-dropdown-item>
              <b-dropdown-item
                to="/profile-settings"
                data-test-id="appHeader-link-profile"
                >{{ $t('appHeader.profileSettings') }}
              </b-dropdown-item>
              <b-dropdown-item
                data-test-id="appHeader-link-logout"
                @click="logout"
              >
                {{ $t('appHeader.logOut') }}
              </b-dropdown-item>
            </b-dropdown>
          </li>
        </b-navbar-nav>
      </b-navbar>
    </header>
    <loading-bar />
  </div>
</template>

<script lang="ts">
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconAvatar from '@carbon/icons-vue/es/user--avatar/20';
import IconClose from '@carbon/icons-vue/es/close/20';
import IconMenu from '@carbon/icons-vue/es/menu/20';
import IconRenew from '@carbon/icons-vue/es/renew/20';
import StatusIcon from '@/components/Global/StatusIcon';
import LoadingBar from '@/components/Global/LoadingBar';
import { AddEventTarget } from '@/.env.d.ts';
import router from '@/router';
import { Menu, MenuItem, Submenu } from 'element-ui';
import HeaderNavigation from './HeaderNavigation';

export default {
  name: 'AppHeader',
  components: {
    IconAvatar,
    IconClose,
    IconMenu,
    IconRenew,
    StatusIcon,
    LoadingBar,
    [Menu.name]: Menu,
    [MenuItem.name]: MenuItem,
    [Submenu.name]: Submenu,
  },
  mixins: [BVToastMixin],
  data() {
    return {
      isNavigationOpen: false,
      altLogo: process.env.VUE_APP_COMPANY_NAME || 'Built on OpenBMC',
      isFullscreen: false,
      companyName: process.env.VUE_APP_COMPANY_NAME,
    };
  },
  computed: {
    activeIndex() {
      return this.$route.path;
    },
    headerNavigation() {
      return HeaderNavigation;
    },
    isNavTagPresent() {
      return this.assetTag || this.modelType || this.serialNumber;
    },
    assetTag() {
      return this.$store.getters['global/assetTag'];
    },
    modelType() {
      return this.$store.getters['global/modelType'];
    },
    serialNumber() {
      return this.$store.getters['global/serialNumber'];
    },
    isAuthorized() {
      return this.$store.getters['global/isAuthorized'];
    },
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    healthStatus() {
      return this.$store.getters['eventLog/healthStatus'];
    },
    serverStatusIcon() {
      switch (this.serverStatus) {
        case 'on':
          return 'success';
        case 'error':
          return 'danger';
        case 'diagnosticMode':
          return 'warning';
        case 'off':
        default:
          return 'secondary';
      }
    },
    healthStatusIcon() {
      switch (this.healthStatus) {
        case 'OK':
          return 'success';
        case 'Warning':
          return 'warning';
        case 'Critical':
          return 'danger';
        default:
          return 'secondary';
      }
    },
    username() {
      return this.$store.getters['global/username'];
    },
  },
  watch: {
    isAuthorized(value: boolean) {
      if (value === false) {
        this.errorToast(this.$t('global.toast.unAuthDescription'), {
          title: this.$t('global.toast.unAuthTitle'),
        });
      }
    },
  },
  created() {
    // Reset auth state to check if user is authenticated based
    // on available browser cookies
    this.$store.dispatch('authentication/resetStoreState');
    this.getSystemInfo();
    this.getEvents();
  },
  mounted() {
    this.isFullscreen = this.$refs.globalFullScreen.isFullscreen;
    this.$root.$on(
      'change-is-navigation-open',
      (isNavigationOpen: any) => (this.isNavigationOpen = isNavigationOpen)
    );
  },
  methods: {
    handleSelect(key: string) {
      this.$router.push(key);
    },
    switchLanguage($event: Event) {
      if (($event!.target! as AddEventTarget).innerHTML.trim() == '中文') {
        localStorage.setItem('storedLanguage', 'zh-CN');
      } else if (
        ($event!.target! as AddEventTarget).innerHTML.trim() == 'English'
      )
        localStorage.setItem('storedLanguage', 'en-US');
      router.go(0);
    },
    blur(event: { which: number }) {
      if (event.which == 1) {
        document.querySelector('#global-fullscreen>.nav-link')!.blur();
        this.isFullscreen = !this.$refs.globalFullScreen.isFullscreen;
      }
    },
    fullscreen() {
      this.$refs.globalFullScreen.click();
    },
    getSystemInfo() {
      this.$store.dispatch('global/getSystemInfo');
    },
    getEvents() {
      this.$store.dispatch('eventLog/getEventLogData');
    },
    refresh() {
      this.$emit('refresh');
    },
    logout() {
      this.$store.dispatch('authentication/logout');
    },
    toggleNavigation() {
      this.$root.$emit('toggle-navigation');
    },
    setFocus(event: { preventDefault: () => void }) {
      event.preventDefault();
      this.$root.$emit('skip-navigation');
    },
  },
};
</script>

<style lang="scss" scoped>
@mixin focus-box-shadow($padding-color: $navbar-color, $outline-color: $white) {
  box-shadow: inset 0 0 0 3px $padding-color, inset 0 0 0 5px $outline-color;
}
.app-header {
  .link-skip-nav {
    position: absolute;
    top: -60px;
    left: 0.5rem;
    z-index: $zindex-popover;
    transition: $duration--moderate-01 $exit-easing--expressive;
    &:focus {
      top: 0.5rem;
      transition-timing-function: $entrance-easing--expressive;
    }
  }
  .navbar-text,
  .nav-link,
  .btn-link {
    line-height: 2;
    height: $header-height;
    .responsive-text {
      color: #444444;
    }
    svg {
      color: #444444;
      transition: all 0.3s;
    }
    .status-icon {
      ::v-deep svg {
        bottom: -4px;
        position: relative;
      }
    }
    color: #444444 !important;
    fill: currentColor;
    padding: 0.68rem 1rem !important;

    &:hover {
      background-color: theme-color-level(light, 10);
      &#app-header-refresh {
        svg {
          transform: rotate(360deg);
        }
      }
    }
    &:active {
      background-color: theme-color-level(light, 9);
    }
    &:focus {
      @include focus-box-shadow;
      outline: 0;
    }
  }

  .nav-item {
    fill: theme-color('light');
  }

  .navbar {
    padding: 0;
    // background-color: #ffe8e8;
    background: linear-gradient(to right, #eae5c9, #6cc6cb);
    @include media-breakpoint-up($responsive-layout-bp) {
      height: $header-height;
    }

    .helper-menu {
      @include media-breakpoint-down(sm) {
        background-color: gray('800');
        width: 100%;
        justify-content: flex-end;

        .nav-link,
        .btn {
          padding: $spacer / 1.125 $spacer / 2;
        }

        .nav-link:focus,
        .btn:focus {
          @include focus-box-shadow($gray-800);
        }
      }

      .responsive-text {
        @include media-breakpoint-down(xs) {
          @include sr-only;
        }
      }
    }
  }

  .navbar-nav {
    @include media-breakpoint-up($responsive-layout-bp) {
      padding: 0 $spacer;
    }
    align-items: center;

    .navbar-brand,
    .nav-link {
      transition: $focus-transition;
    }
    .nav-tags {
      @include media-breakpoint-down(xs) {
        @include sr-only;
      }
      .asset-tag {
        @include media-breakpoint-down($responsive-layout-bp) {
          @include sr-only;
        }
      }
    }
  }

  .nav-trigger {
    fill: theme-color('light');
    width: $header-height;
    height: $header-height;
    transition: none;
    display: inline-flex;
    flex: 0 0 20px;
    align-items: center;

    svg {
      margin: 0;
    }

    &:hover {
      fill: theme-color('light');
      background-color: theme-color-level(light, 10);
    }

    &.open {
      background-color: gray('800');
    }

    @include media-breakpoint-up($responsive-layout-bp) {
      display: none;
    }
  }

  .dropdown-menu {
    margin-top: 0;

    @include media-breakpoint-only(md) {
      margin-top: 4px;
    }
  }

  .navbar-expand {
    @include media-breakpoint-down(sm) {
      flex-flow: wrap;
    }
  }
}

.navbar-brand {
  padding: $spacer/2;
  height: $header-height;
  line-height: 1;
  &:focus {
    box-shadow: inset 0 0 0 3px $navbar-color, inset 0 0 0 5px color('white');
    outline: 0;
  }
}

img {
  height: 0.8 * $header-height;
}
#global-fullscreen span {
  margin-left: 5px;
}

.header-nav {
  height: $header-height;
  span.active {
    background: white;
  }
}
.el-menu {
  background: transparent;
  height: $header-height;
  .el-menu-item,
  .el-submenu {
    line-height: $header-height;
    height: $header-height !important;
    ::v-deep .el-submenu__title {
      line-height: $header-height;
      height: $header-height !important;
    }
  }
  .el-submenu {
    &:not(.is-active) {
      ::v-deep .el-submenu__title {
        color: #6a707c;
      }
    }
  }
  #overview-button {
    &:not(.is-active) {
      color: #6a707c;
    }
  }
}
</style>
