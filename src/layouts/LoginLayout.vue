<template>
  <div>
    <transition
      name="animate__animated animate__bounce"
      leave-active-class="animate__fadeOut"
    >
      <main>
        <div v-show="onload" class="login-container">
          <div class="login-main">
            <transition
              appear
              name="animate__animated animate__bounce"
              enter-active-class="animate__fadeInUp"
            >
              <router-view class="login-form form-background" />
            </transition>
          </div>
        </div>
      </main>
    </transition>
  </div>
</template>

<script lang="ts">
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
    getDivImage(divElement: Element) {
      let imgurl = window
        .getComputedStyle(divElement, null)
        .getPropertyValue('background-image');
      return imgurl.substring(5, imgurl.lastIndexOf('"'));
    },
  },
};
</script>

<style lang="scss" scoped>
.animate__bounceOutLeft {
  animation-duration: 1s;
}
.form-background {
  background: transparent;
}
.login-container {
  width: 100%;
  height: 100%;

  background: linear-gradient(rgb(175 199 223 / 92%), transparent),
    linear-gradient(90deg, #3da7cd, transparent),
    linear-gradient(-90deg, #1a4d87, transparent);
  background-blend-mode: screen;
}

.login-main {
  min-height: 50vh;
  padding: $spacer * 3;
  padding-top: $spacer * 2;
  @include media-breakpoint-up('md') {
    display: flex;
    flex-direction: column;
    flex: 1 1 75%;
    min-height: 100vh;
    justify-content: center;
    align-items: center;
  }
}

main {
  position: absolute;
  top: 0;
  height: 100vh;
  width: 100vw;
  background-size: 100% 100%;
  .customizableGuiName {
    color: #fb0000de;
    font-size: 29px;
    font-weight: bold;
  }
  overflow: hidden;
  .login-brand {
    position: absolute;
    left: 58vw;
    top: 41vh;
    img {
      width: 24vw;
      height: 12vh;
    }
  }
}
</style>
