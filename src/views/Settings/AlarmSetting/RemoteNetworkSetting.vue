<template>
  <b-row>
    <b-col align="right">
      <dl>
        <dt v-if="$i18n.locale == 'zh-CN'" id="remote-title-ch">
          {{ $t('pageAlarmSetting.remoteServer.remoteTitleLabel') }}
        </dt>
        <dt v-else id="remote-title-en">
          {{ $t('pageAlarmSetting.remoteServer.remoteTitleLabel') }}
        </dt>
        <template v-if="!remoteAddress">
          <b-button variant="link" @click="addServer()">
            <icon-add /> {{ $t('pageAlarmSetting.remoteServer.addServer') }}
          </b-button>
        </template>
        <template v-else>
          <dd id="remote-address" class="d-inline">{{ remoteAddress }}</dd>
          <dd class="d-inline">
            <b-button id="remote-edit" variant="link" @click="editServer()">
              <icon-edit />
            </b-button>
            <b-button
              id="remote-trashcan"
              variant="link"
              @click="deleteServer()"
            >
              <icon-trashcan />
            </b-button>
          </dd>
        </template>
      </dl>
    </b-col>

    <!-- Modals -->
    <modal-remote-setting
      ref="modal-remote-setting"
      :remote-address="remoteAddress"
      :remote-port="remotePort"
    />
  </b-row>
</template>

<script lang="ts">
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import ModalRemoteSetting from './ModalRemoteSetting';

export default {
  name: 'RemoteNetworkSetting',
  components: {
    IconEdit,
    IconAdd,
    IconTrashcan,
    ModalRemoteSetting,
  },
  computed: {
    remoteAddress() {
      return this.$store.getters['alarmSetting/remoteServer'].Address;
    },
    remotePort() {
      return this.$store.getters['alarmSetting/remoteServer'].Port;
    },
  },
  created() {
    this.$store.dispatch('alarmSetting/getRemoteServer');
    this.$root.$on('update-remote-server', (updateServer: any) => {
      this.updateServer = updateServer;
    });
    this.$root.$on('$v-reset', ($v_reset: any) => {
      this.$v_reset = $v_reset;
    });
  },
  beforeDestroy() {
    this.$root.$off('update-remote-server');
    this.$root.$off('$v-reset');
  },
  methods: {
    async addServer() {
      this.$v_reset();
      await this.$store.dispatch('alarmSetting/getRemoteServer');
      await this.updateServer();
      this.$bvModal.show('modal-remote-setting');
    },
    async editServer() {
      this.$v_reset();
      await this.$store.dispatch('alarmSetting/getRemoteServer');
      await this.updateServer();
      this.$bvModal.show('modal-remote-setting');
    },
    async deleteServer() {
      this.$bvModal
        .msgBoxConfirm(
          this.$t(
            'pageAlarmSetting.remoteServer.modal.confirmDeleteRemoteMessage'
          ),
          {
            title: this.$t(
              'pageAlarmSetting.remoteServer.modal.confirmDeleteRemoteTitle'
            ),
            okTitle: this.$t('global.action.confirm'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then(async (confirmed: boolean) => {
          if (confirmed) {
            await this.$store.dispatch('alarmSetting/deleteServer');
            await this.$store.dispatch('alarmSetting/getRemoteServer');
            this.updateServer();
          }
        });
    },
  },
};
</script>

<style lang="scss" scoped>
#remote-title-ch {
  color: #666;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 1.15em;
  margin-bottom: 0.5rem;
}
#remote-title-en {
  color: #666;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 0.75em;
  margin-bottom: 0.5rem;
}
#remote-edit,
#remote-trashcan {
  padding-right: 0px;
  padding-left: 5px;
  margin-left: 0px;
  margin-right: 0px;
  border-right: 0px;
}
button {
  padding: 0px;
}
</style>
