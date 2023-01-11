<template>
  <div
    id="serial-over-lan-console"
    :class="isFullWindow ? 'full-window-container' : 'terminal-container'"
  >
    <b-row class="d-flex">
      <b-col class="d-flex flex-column justify-content-end">
        <dl class="mb-2" sm="6" md="6">
          <dt class="d-inline font-weight-bold mr-1">
            {{ $t('pageSerialOverLan.status') }}:
          </dt>
          <dd class="d-inline">
            <status-icon :status="serverStatusIcon" /> {{ connectionStatus }}
          </dd>
        </dl>
      </b-col>

      <b-col v-if="!isFullWindow" class="d-flex justify-content-end"> </b-col>
    </b-row>
    <div id="base-container">
      <div class="SOL-toolbar">
        <div class="SOL-toolbar-menu">
          <b-navbar-brand
            id="SOL-screen-full"
            class="SOL-toolbar-item ml-1 mr-1"
            :title="$t('pageKvm.brandTitle.screenFull')"
          >
            <screen-full class="SOL-toolbar-item" :element="element" />
          </b-navbar-brand>
        </div>
      </div>
      <div id="terminal" ref="panel2"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import StatusIcon from '@/components/Global/StatusIcon';
import ScreenFull from '@/components/Global/ScreenFull';

export default {
  name: 'SerialOverLanConsole',
  components: {
    StatusIcon,
    ScreenFull,
  },
  props: {
    isFullWindow: {
      type: Boolean,
      default: true,
    },
    element: {
      type: HTMLDivElement,
      default: null,
    },
  },
  data() {
    return {
      resizeConsoleWindow: null,
    };
  },
  computed: {
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    serverStatusIcon() {
      return this.serverStatus === 'on' ? 'success' : 'danger';
    },
    connectionStatus() {
      return this.serverStatus === 'on'
        ? this.$t('pageSerialOverLan.connected')
        : this.$t('pageSerialOverLan.disconnected');
    },
  },
  watch: {
    isFullWindow: {
      handler() {
        this.resizeConsoleWindow();
      },
      immediate: true,
    },
  },
  created() {
    this.$store.dispatch('global/getServerStatus');
  },
  mounted() {
    setTimeout(() => {
      this.openTerminal();
      if (navigator.keyboard && navigator.keyboard.lock) {
        navigator.keyboard.lock();
      } else {
        console.log('Your browser Not support!!!');
      }
    }, 300);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeConsoleWindow);
  },
  methods: {
    openTerminal() {
      const token = this.$store.getters['authentication/token'];

      const ws = new WebSocket(`wss://${window.location.host}/console0`, [
        token,
      ]);

      // Refer https://github.com/xtermjs/xterm.js/ for xterm implementation and addons.

      const term = new Terminal({
        fontSize: 15,
        fontFamily:
          'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
      });

      const attachAddon = new AttachAddon(ws);
      term.loadAddon(attachAddon);

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      const SOL_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)',
      };
      term.setOption('theme', SOL_THEME);

      term.open(this.$refs.panel2);
      fitAddon.fit();

      this.resizeConsoleWindow = this._.throttle(() => {
        fitAddon.fit();
      }, 1000);
      window.addEventListener('resize', this.resizeConsoleWindow);

      try {
        ws.onopen = function () {
          console.log('websocket console0/ opened');
        };
        ws.onclose = function (event) {
          console.log(
            'websocket console0/ closed. code: ' +
              event.code +
              ' reason: ' +
              event.reason
          );
        };
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~xterm/css/xterm.css';

.full-window-container {
  width: 97%;
  margin: 1.5%;
}

#serial-over-lan-console {
  max-width: 94vw;
  .SOL-toolbar {
    position: relative;
    float: right;
    height: 100%;
    width: 5%;
    background: #444444;
    .SOL-toolbar-menu {
      width: 100%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
    .SOL-toolbar-item {
      display: block;
      margin: 0 auto;
      color: white;
      & > *:hover {
        background: #cccccc !important;
      }
    }
  }
  .btn-link {
    padding-right: 0;
  }
  &.full-window-container {
    #terminal {
      overflow: auto;
      height: 100%;
      &::-webkit-scrollbar {
        display: none;
      }
      ::v-deep .xterm-screen {
        height: 100vh !important;
      }
    }
  }

  &:not(.full-window-container) {
    #terminal {
      position: relative;
      float: right;
      margin: 0;
      height: 391px;
      width: calc(100% - 60px);
    }
    .SOL-toolbar {
      height: 391px;
      width: 60px;
    }
  }
}
</style>
