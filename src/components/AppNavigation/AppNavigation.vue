<template>
  <div>
    <div class="nav-container" :class="{ open: isNavigationOpen }">
      <div class="nav-container-menu">
        <nav ref="nav" :aria-label="$t('appNavigation.primaryNavigation')">
          <b-nav vertical class="mb-4">
            <template v-for="(navItem, index) in navigationItems">
              <!-- Navigation items with no children -->
              <b-nav-item
                v-if="!navItem.children"
                :key="index"
                :to="navItem.route"
                :data-test-id="`nav-item-${navItem.id}`"
              >
                <component :is="navItem.icon" />
                {{ navItem.label }}
              </b-nav-item>

              <!-- Navigation items with children -->
              <li v-else :key="index" class="nav-item">
                <b-button
                  v-b-toggle="`${navItem.id}`"
                  variant="link"
                  :data-test-id="`nav-button-${navItem.id}`"
                >
                  <component :is="navItem.icon" />
                  {{ navItem.label }}
                  <icon-expand class="icon-expand" />
                </b-button>
                <b-collapse :id="navItem.id" tag="ul" class="nav-item__nav">
                  <li class="nav-item">
                    <router-link
                      v-for="(subNavItem, i) of navItem.children"
                      :key="i"
                      :to="subNavItem.route"
                      :data-test-id="`nav-item-${subNavItem.id}`"
                      class="nav-link"
                    >
                      {{ subNavItem.label }}
                    </router-link>
                  </li>
                </b-collapse>
              </li>
            </template>
          </b-nav>
        </nav>
      </div>
      <button class="zipper1" @click="toggleIsOpen">
        <chevron-left v-if="isNavigationOpen" style="float: left" />
        <chevron-right v-else style="float: left" />
      </button>
    </div>
    <transition name="fade">
      <div
        v-if="isNavigationOpen"
        id="nav-overlay"
        class="nav-overlay"
        @click="toggleIsOpen"
      ></div>
    </transition>
  </div>
</template>

<script>
//Do not change Mixin import.
//Exact match alias set to support
//dotenv customizations.
import AppNavigationMixin from './AppNavigationMixin';
import chevronLeft from '@carbon/icons-vue/es/chevron--left/32';
import chevronRight from '@carbon/icons-vue/es/chevron--right/32';

export default {
  name: 'AppNavigation',
  components: {
    chevronLeft,
    chevronRight,
  },
  mixins: [AppNavigationMixin],
  data() {
    return {
      isNavigationOpen: false,
    };
  },
  watch: {
    $route: function () {
      this.isNavigationOpen = false;
    },
    isNavigationOpen: function (isNavigationOpen) {
      this.$root.$emit('change-is-navigation-open', isNavigationOpen);
    },
  },
  mounted() {
    this.$root.$on('toggle-navigation', () => this.toggleIsOpen());
  },
  methods: {
    toggleIsOpen() {
      this.isNavigationOpen = !this.isNavigationOpen;
    },
  },
};
</script>

<style scoped lang="scss">
svg {
  fill: currentColor;
  height: 1.2rem;
  width: 1.2rem;
  margin-left: 0 !important; //!important overriding button specificity
  vertical-align: text-bottom;
  &:not(.icon-expand) {
    margin-right: $spacer;
  }
}

.nav {
  padding-top: $spacer / 4;
  @include media-breakpoint-up($responsive-layout-bp) {
    padding-top: $spacer;
  }
}

.nav-item__nav {
  list-style: none;
  padding-left: 0;
  margin-left: 0;

  .nav-item {
    outline: none;
  }

  .nav-link {
    padding-left: $spacer * 4;
    outline: none;

    &:not(.nav-link--current) {
      font-weight: normal;
    }
  }
}

.btn-link {
  display: inline-block;
  width: 100%;
  text-align: left;
  text-decoration: none !important;
  border-radius: 0;

  &.collapsed {
    .icon-expand {
      transform: rotate(180deg);
    }
  }
}

.icon-expand {
  float: right;
  margin-top: $spacer / 4;
}

.btn-link,
.nav-link {
  position: relative;
  font-weight: $headings-font-weight;
  padding-left: $spacer; // defining consistent padding for links and buttons
  padding-right: $spacer;
  width: 299px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: theme-color-level('secondary', -5);

  &:hover {
    background-color: theme-color-level(dark, -10.5);
    color: theme-color('dark');
  }

  &:focus {
    background-color: theme-color-level(light, 5);
    box-shadow: inset 0 0 0 2px theme-color('primary');
    color: theme-color('light');
    outline: 0;
  }

  &:active {
    background-color: theme-color('secondary');
    color: $white;
  }
}

.nav-link--current {
  font-weight: $headings-font-weight;
  background-color: theme-color('secondary');
  color: theme-color('light');
  cursor: default;
  box-shadow: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background-color: theme-color('primary');
  }

  &:hover,
  &:focus {
    background-color: theme-color('secondary');
    color: theme-color('light');
  }
}

.nav-container {
  position: fixed;
  width: $navigation-width;
  top: $header-height;
  bottom: 0;
  left: 0;
  transform: translateX(-$navigation-width);
  transition: transform $exit-easing--productive $duration--moderate-02;
  border-right: 1px solid theme-color-level('dark', 2.85);
  z-index: $zindex-fixed + 2;

  &.open {
    transform: translateX(0);
    transition-timing-function: $entrance-easing--productive;
  }
  @include media-breakpoint-down(md) {
    &:focus-within {
      transform: translateX(0);
      transition-timing-function: $entrance-easing--productive;
    }
  }
  // @include media-breakpoint-up($responsive-layout-bp) {
  //   transition-duration: $duration--fast-01;
  //   transform: translateX(0);
  // }
  .nav-container-menu {
    position: absolute;
    height: 100%;
    background-color: $navigation-color;
    z-index: 2;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .zipper1 {
    display: none;
    @include media-breakpoint-up($responsive-layout-bp) {
      position: absolute;
      left: $navigation-width - 3px;
      top: 50%;
      margin-top: -30px;
      height: 60px;
      width: 30px;
      border-radius: 0 30px 30px 0;
      z-index: 1;
      background-color: $navigation-color;
      svg {
        display: inline-block;
        width: 100%;
        text-align: left;
        color: $white;
      }
      display: inline;
    }
  }
}

.nav-overlay {
  position: fixed;
  top: $header-height;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $zindex-fixed + 1;
  background-color: $black;
  opacity: 0.5;

  &.fade-enter-active {
    transition: opacity $duration--moderate-02 $entrance-easing--productive;
  }

  &.fade-leave-active {
    transition: opacity $duration--fast-02 $exit-easing--productive;
  }

  &.fade-enter, // Remove this vue2 based only class when switching to vue3
  &.fade-enter-from, // This is vue3 based only class modified from 'fade-enter'
  &.fade-leave-to {
    opacity: 0;
  }

  @include media-breakpoint-up($responsive-layout-bp) {
    // display: none;
  }
}
</style>
