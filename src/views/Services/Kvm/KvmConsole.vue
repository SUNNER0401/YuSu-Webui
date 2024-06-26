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
    <div class="kvm-div" :class="terminalClass">
      <div id="terminal-kvm" ref="panel1"></div>
      <div v-show="loadFinished" class="kvm-toolbar2">
        <div id="kvm-toolbar-menu-row">
          <div class="kvm-toolbar-menu">
            <b-navbar-brand
              id="kvm-screenshot"
              class="kvm-toolbar2-item"
              :title="$t('pageKvm.brandTitle.screenShot')"
            >
              <screen-shot :element="shotArea" />
            </b-navbar-brand>
            <b-navbar-brand
              id="kvm-recorder"
              class="kvm-toolbar2-item"
              :title="$t('pageKvm.brandTitle.recorder')"
            >
              <kvm-recorder :element="shotArea" />
            </b-navbar-brand>
            <b-navbar-brand
              id="kvm-immersion-mode"
              class="kvm-toolbar2-item"
              :title="$t('pageKvm.brandTitle.immersionMode')"
            >
              <immersion-mode :area="shotArea" />
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
        <b-navbar-brand class="power-button">
          <b-icon
            class="h2 icon"
            :class="{ opened: powerStatus }"
            icon="power"
            @click.stop="togglePower()"
          />
        </b-navbar-brand>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import RFB from '@novnc/novnc/core/rfb';
import StatusIcon from '@/components/Global/StatusIcon';
import ScreenFull from '@/components/Global/ScreenFull';
import ScreenShot from '@/components/Global/ScreenShot';
import ImmersionMode from '@/components/Global/ImmersionMode';
import KvmRecorder from '@/components/Global/KvmRecorder';

const Connecting = 0;
const Connected = 1;
const Disconnected = 2;

export default {
  name: 'KvmConsole',
  components: {
    StatusIcon,
    ScreenFull,
    ScreenShot,
    ImmersionMode,
    KvmRecorder,
  },
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
      element: null,
      shotArea: null,
      loadFinished: false,
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
    powerStatus() {
      let op = this.$store.getters['global/serverStatus'];
      switch (op) {
        case 'off':
          return false;
        case 'unreachable':
          return false;
        default:
          return true;
      }
    },
  },
  watch: {
    isFullWindow: {
      handler(newvalue: boolean) {
        if (newvalue) {
          if (navigator.keyboard && navigator.keyboard.lock) {
            navigator.keyboard.lock();
          } else {
            console.log('Your browser Not support!!!');
          }
        }
      },
    },
  },
  mounted() {
    this.element = document.querySelector('.kvm-div');
    this.openTerminal();
  },
  beforeDestroy() {
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

      this.rfb.addEventListener('connect', () => {
        that.isConnected = true;
        that.status = Connected;
        this.loadFinished = true;
        this.shotArea = document.querySelector('#terminal-kvm > div > canvas');
      });

      this.rfb.addEventListener('disconnect', () => {
        this.isConnected = false;
        that.status = Disconnected;
      });
    },
    powerOn() {
      const modalMessage = this.$t(
        'pageServerPowerOperations.modal.confirmPowerOnMessage'
      );
      const modalOptions = {
        title: this.$t('pageServerPowerOperations.modal.confirmPowerOnTitle'),
        okTitle: this.$t('global.action.confirm'),
        cancelTitle: this.$t('global.action.cancel'),
      };
      this.$bvModal
        .msgBoxConfirm(modalMessage, modalOptions)
        .then((confirmed: any) => {
          if (confirmed) this.$store.dispatch('controls/serverPowerOn');
        });
    },
    shutdownServer() {
      const modalMessage = this.$t(
        'pageServerPowerOperations.modal.confirmShutdownMessage'
      );
      const modalOptions = {
        title: this.$t('pageServerPowerOperations.modal.confirmShutdownTitle'),
        okTitle: this.$t('global.action.confirm'),
        cancelTitle: this.$t('global.action.cancel'),
      };
      this.$bvModal
        .msgBoxConfirm(modalMessage, modalOptions)
        .then((confirmed: any) => {
          if (confirmed) this.$store.dispatch('controls/serverHardPowerOff');
        });
    },
    togglePower() {
      if (this.powerStatus) {
        this.shutdownServer();
      } else {
        this.powerOn();
      }
    },
    // openConsoleWindow() {
    //   window.open(
    //     '#/console/kvm',
    //     '_blank',
    //     'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=700,height=550'
    //   );
    // },
  },
};
</script>

<style scoped lang="scss">
.icon {
  &:hover {
    background-color: #cccccc;
    cursor: pointer;
  }
}

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
.kvm-div {
  position: relative;
  width: 609px;
  $canvaHeight: 100%;
  #terminal-kvm {
    overflow: auto;
  }
  .kvm-toolbar2 {
    background: #444444 !important;
    height: 457px;
    width: 7%;
    position: absolute;
    place-items: center;
    top: 0;
    right: -7%;
    .kvm-toolbar-menu {
      height: auto;
      width: auto;
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
    .power-button {
      position: absolute;
      bottom: 0px;
      left: calc(50%);
      transform: translateX(-50%);
      .icon {
        color: white;
        &:hover {
          background-color: #cccccc;
          cursor: pointer;
        }
        &.opened {
          color: #00ff15;
        }
      }
    }
  }
  ::v-deep canvas {
    &.immersionMode {
      cursor: none !important;
      margin: 0;
    }
  }
  &.full-window {
    .kvm-toolbar2 {
      height: 100%;
      width: 3%;
      top: 0;
      right: 0;
    }
    #terminal-kvm {
      height: 100%;
    }
    ::v-deep canvas {
      position: relative;
      display: block;
      margin: 0 auto;
    }
  }
}

#kvm-toolbar-menu-row {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
</style>
