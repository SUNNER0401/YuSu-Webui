<template>
  <div>
    <transition
      name="animate__animated animate__bounce"
      leave-active-class="animate__fadeOut"
    >
      <main>
        <div key="1" class="login-brand mb-5">
          <img
            width="353px"
            src="@/assets/images/login-company-logo.svg"
            :alt="altLogo"
          />
        </div>
        <div v-show="onload" class="login-container">
          <div class="login-main">
            <div>
              <transition-group
                appear
                name="animate__animated animate__bounce"
                enter-active-class="animate__slideInDown"
              >
                <h1
                  v-if="customizableGuiName"
                  key="2"
                  class="customizableGuiName h3 mb-5"
                >
                  {{ customizableGuiName }}
                </h1>
              </transition-group>
              <transition
                appear
                name="animate__animated animate__bounce"
                enter-active-class="animate__fadeInUp"
              >
                <router-view class="login=form form-background" />
              </transition>
            </div>
          </div>
        </div>
      </main>
    </transition>
  </div>
</template>

<script>
import 'animate.css';

export default {
  name: 'LoginLayout',
  data() {
    return {
      altLogo: process.env.VUE_APP_COMPANY_NAME || 'OpenBMC',
      customizableGuiName: process.env.VUE_APP_GUI_NAME || '',
      onload: false,
    };
  },
  mounted() {
    let divImg = document.querySelector('main');
    let getImg = new Image();
    getImg.src = this.getDivImage(divImg);

    const interval = setInterval(() => {
      if (getImg.complete) {
        this.onload = true;
        clearInterval(interval);
      }
    }, 100);
  },
  methods: {
    getDivImage(divElement) {
      let imgurl = window
        .getComputedStyle(divElement, null)
        .getPropertyValue('background-image');
      return imgurl.substring(5, imgurl.lastIndexOf('"'));
    },
  },
};
</script>

<style lang="scss" scoped>
.spinner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translateX(-12px) translateY(-12px);
}
.animate__bounceOutLeft {
  animation-duration: 1s;
}
.form-background {
  background: transparent;
}
.login-container {
  display: flex;
  flex-direction: column;
  gap: $spacer * 2;
  // max-width: 1400px;
  min-width: 320px;
  min-height: 100vh;
  justify-content: space-around;

  @include media-breakpoint-up('md') {
    background-color: rgba(0, 0, 0, 0.05);
    flex-direction: row;
  }
}

.login-main {
  min-height: 50vh;
  padding: $spacer * 3;
  padding-top: $spacer * 2;
  @include media-breakpoint-up('md') {
    // background: $login-background-color;
    display: flex;
    flex-direction: column;
    flex: 1 1 75%;
    min-height: 100vh;
    justify-content: center;
    align-items: center;
  }
  & > div {
    position: relative;
    left: -15vw;
  }
}

.login-form {
  @include media-breakpoint-up('md') {
    max-width: 360px;
  }
}

.login-aside {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: $spacer * 1.5;
  margin-right: $spacer * 3;
  margin-bottom: $spacer;

  @include media-breakpoint-up('md') {
    min-height: 100vh;
    padding-bottom: $spacer;
    flex: 1 1 25%;
    margin-bottom: 0;
  }
}

.login-aside__logo-brand:not(:empty) {
  &::after {
    content: '';
    display: inline-block;
    height: 2.5rem;
    width: 2px;
    background-color: gray('200');
    margin-left: $spacer * 1.5;
    vertical-align: middle;
  }
}

main {
  position: absolute;
  top: 0;
  z-index: 9999;
  height: 100vh;
  width: 100vw;
  background: url('~@/env/assets/images/login-background.webp') no-repeat fixed
    center;
  background-size: 100% 100%;
  .customizableGuiName {
    color: #fb0000de;
    font-size: 29px;
    font-weight: bold;
  }
  overflow: hidden;
  .login-brand {
    position: absolute;
    left: 63vw;
    top: 34vh;
    img {
      width: 15vw;
      height: 33vh;
    }
  }
}
.two-dimension {
  position: fixed;
  bottom: 10px;
  right: 10px;
}
</style>
