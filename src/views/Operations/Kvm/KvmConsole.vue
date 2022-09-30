<template>
  <div :class="marginClass">
    <div ref="toolbar1" class="kvm-toolbar1">
      <b-row class="d-flex">
        <b-col class="d-flex flex-column justify-content-end" cols="4">
          <dl class="mb-2" sm="2" md="2">
            <dt class="d-inline font-weight-bold mr-1">
              {{ $t('pageKvm.status') }}:
            </dt>
            <dd class="d-inline">
              <status-icon :status="serverStatusIcon" />
              <span class="d-none d-md-inline"> {{ serverStatus }}</span>
            </dd>
          </dl>
        </b-col>

        <b-col class="d-flex justify-content-end pr-1"></b-col>
      </b-row>
    </div>
    <div id="terminal-kvm" ref="panel1" :class="terminalClass">
      <div ref="toolbar2" class="kvm-toolbar2">
        <div class="kvm-toolbar-menu">
          <b-navbar-brand
            id="kvm-screenshot"
            class="kvm-toolbar2-item"
            :title="$t('pageKvm.brandTitle.screenShot')"
          >
            <screen-shot :element="shotArea" />
          </b-navbar-brand>
          <b-navbar-brand
            id="kvm-screen-full"
            class="kvm-toolbar2-item"
            :title="$t('pageKvm.brandTitle.screenFull')"
          >
            <screen-full :element="element" />
          </b-navbar-brand>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RFB from '@novnc/novnc/core/rfb';
import StatusIcon from '@/components/Global/StatusIcon';
import ScreenFull from '@/components/Global/ScreenFull';
import ScreenShot from '@/components/Global/ScreenShot';

const Connecting = 0;
const Connected = 1;
const Disconnected = 2;

export default {
  name: 'KvmConsole',
  components: { StatusIcon, ScreenFull, ScreenShot },
  props: {
    isFullWindow: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      rfb: null,
      isConnected: false,
      status: Connecting,
      convasRef: null,
      resizeKvmWindow: null,
      element: null,
      shotArea: null,
    };
  },
  computed: {
    marginClass() {
      return this.isFullWindow ? 'margin-left-full-window' : '';
    },
    terminalClass() {
      return this.isFullWindow ? 'full-window' : '';
    },
    serverStatusIcon() {
      if (this.status === Connected) {
        return 'success';
      } else if (this.status === Disconnected) {
        return 'danger';
      }
      return 'secondary';
    },
    serverStatus() {
      if (this.status === Connected) {
        return this.$t('pageKvm.connected');
      } else if (this.status === Disconnected) {
        return this.$t('pageKvm.disconnected');
      }
      return this.$t('pageKvm.connecting');
    },
  },
  watch: {
    isFullWindow: {
      handler() {
        this.resizeKvmWindow();
      },
    },
    immediate: true,
  },
  mounted() {
    this.element = document.querySelector('#terminal-kvm');
    this.openTerminal();
    setTimeout(() => {
      this.shotArea = document.querySelector('#terminal-kvm > div > canvas');
      document.querySelector(
        '.kvm-toolbar2'
      ).style.height = this.shotArea.height;
    }, 1700);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeKvmWindow);
    this.closeTerminal();
  },
  methods: {
    // sendCtrlAltDel() {
    //   this.rfb.sendCtrlAltDel();
    // },
    closeTerminal() {
      this.rfb.disconnect();
      this.rfb = null;
    },
    openTerminal() {
      const token = this.$store.getters['authentication/token'];
      this.rfb = new RFB(
        this.$refs.panel1,
        `wss://${window.location.host}/kvm/0`,
        { wsProtocols: [token] }
      );

      this.rfb.scaleViewport = true;
      this.rfb.clipViewport = true;
      const that = this;

      this.resizeKvmWindow = this._.throttle(() => {
        setTimeout(that.setWidthToolbars, 0);
      }, 1000);
      window.addEventListener('resize', this.resizeKvmWindow);

      this.rfb.addEventListener('connect', () => {
        that.isConnected = true;
        that.status = Connected;
        that.setWidthToolbars();
      });

      this.rfb.addEventListener('disconnect', () => {
        this.isConnected = false;
        that.status = Disconnected;
      });
    },
    setWidthToolbars() {
      if (
        this.$refs.panel1.children &&
        this.$refs.panel1.children.length > 0 &&
        this.$refs.panel1.children[0].children.length > 0
      ) {
        this.$refs.toolbar1.style.width =
          this.$refs.panel1.children[1].children[0].clientWidth - 10 + 'px';
      }
    },
    openConsoleWindow() {
      window.open(
        '#/console/kvm',
        '_blank',
        'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=700,height=550'
      );
    },
  },
};
</script>

<style scoped lang="scss">
.button-ctrl-alt-delete {
  float: right;
}

.kvm-status {
  padding-top: $spacer / 2;
  padding-left: $spacer / 4;
  display: inline-block;
}

.margin-left-full-window {
  margin-left: 5px;
}

.kvm-toolbar1 {
  width: 660px;
}

#terminal-kvm {
  width: 873px;
  $canvaHeight: 100%;
  .kvm-toolbar2 {
    float: right;
    background: #444444 !important;
    height: $canvaHeight;
    width: 7%;
    position: relative;
    .kvm-toolbar-menu {
      height: auto;
      width: auto;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateY(-50%) translateX(-50%);
      & > * {
        padding: 0;
        svg {
          margin: 0;
        }
      }
      .kvm-toolbar2-item {
        text-align: center;
        color: white;
        display: block;
        margin: 0 auto;
        height: 36px;

        &:nth-child(1) {
          padding: 0;
        }

        & > *:hover {
          background: #cccccc !important;
        }
      }
    }
  }
  // &:not(.full-window) {
  //   ::v-deep canvas {
  //     height: 100% !important;
  //   }
  // }
  &.full-window {
    .kvm-toolbar2 {
      height: 100%;
      width: 3%;
    }
  }
}
</style>
