<template>
  <b-container fluid>
    <page-title :description="$t('pageAlarmSetting.description')" />
    <b-row>
      <b-col md="6">
        <remote-network-setting id="remote-nerwork-setting" />
        <b-form novalidate @submit.prevent="submitForm">
          <b-form-group>
            <page-section :section-title="$t('pageAlarmSetting.Managers')">
              <b-row class="setting-section">
                <b-col>
                  <b-table
                    responsive
                    hover
                    :fields="managerTableFields"
                    :items="form.snmpManagers"
                    :empty-text="$t('global.table.emptyMessage')"
                    class="mb-0"
                    show-empty
                  >
                    <template #cell(address)="{ item, index }">
                      <b-form-input
                        v-model.trim="item.address"
                        :state="
                          getValidationState(
                            $v.snmpManagers.$each.$iter[index].address
                          )
                        "
                        :data-test-id="`alarmSetting-input-Address-${index}`"
                        :aria-label="
                          $t('pageAlarmSetting.table.staticManagerRow') +
                          ' ' +
                          (index + 1)
                        "
                        @change="item.updateAddress = true"
                        @blur="
                          $v.snmpManagers.$each.$iter[index].address.$touch()
                        "
                        @focus="
                          $v.snmpManagers.$each.$iter[index].address.$reset()
                        "
                      />
                      <b-form-invalid-feedback role="alert">
                        <div
                          v-if="
                            !$v.snmpManagers.$each.$iter[index].address.required
                          "
                        >
                          {{ $t('global.form.fieldRequired') }}
                        </div>
                      </b-form-invalid-feedback>
                    </template>
                    <template #cell(port)="{ item, index }">
                      <b-form-input
                        v-model.trim="item.port"
                        :data-test-id="`alarmSetting-input-port-${index}`"
                        :aria-label="
                          $t('pageAlarmSetting.table.staticManagerRow') +
                          ' ' +
                          (index + 1)
                        "
                        :state="
                          getValidationState(
                            $v.snmpManagers.$each.$iter[index].port
                          )
                        "
                        @change="item.updatePort = true"
                        @blur="$v.snmpManagers.$each.$iter[index].port.$touch()"
                        @focus="
                          $v.snmpManagers.$each.$iter[index].port.$reset()
                        "
                      />
                      <b-form-invalid-feedback role="alert">
                        <div
                          v-if="
                            !$v.snmpManagers.$each.$iter[index].port.required
                          "
                        >
                          {{ $t('global.form.fieldRequired') }}
                        </div>
                        <div
                          v-if="
                            !$v.snmpManagers.$each.$iter[index].port.between
                          "
                        >
                          {{ $t('global.form.invalidFormat') }}
                        </div>
                      </b-form-invalid-feedback>
                    </template>
                    <template #cell(actions)="{ item, index }">
                      <table-row-action
                        v-for="(action, actionIndex) in item.actions"
                        :key="actionIndex"
                        :value="action.value"
                        :title="action.title"
                        @click-table-action="onDeleteManagerTableRow(index)"
                      >
                        <template #icon>
                          <icon-trashcan v-if="action.value === 'delete'" />
                        </template>
                      </table-row-action>
                    </template>
                  </b-table>
                  <b-button variant="link" @click="addNewSNMPManager">
                    <icon-add /> {{ $t('pageAlarmSetting.table.addmanager') }}
                  </b-button>
                </b-col>
              </b-row>
            </page-section>
            <b-row
              id="SNMP-submit-button-group"
              class="d-flex justify-content-end"
            >
              <b-button
                data-test-id="network-button-saveCancel"
                @click="refresh"
              >
                {{ $t('global.action.cancel') }}
              </b-button>
              <b-button
                variant="primary"
                type="submit"
                data-test-id="network-button-saveSnmpSettings"
              >
                {{ $t('global.action.saveSettings') }}
              </b-button>
            </b-row>
          </b-form-group>
        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import TableRowAction from '@/components/Global/TableRowAction';
import RemoteNetworkSetting from './RemoteNetworkSetting';

import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';
import { required, between } from 'vuelidate/lib/validators';

export default {
  name: 'AlarmSetting',
  components: {
    PageTitle,
    PageSection,
    IconAdd,
    IconTrashcan,
    TableRowAction,
    RemoteNetworkSetting,
  },
  mixins: [LoadingBarMixin, BVToastMixin, VuelidateMixin],
  data() {
    return {
      // snmpManagers:this.$store.getters['alarmSetting/snmpManagers'],
      snmpManagers: [],
      managersToDelete: [],
      managerTableFields: [
        {
          key: 'address',
          label: this.$t('pageAlarmSetting.table.address'),
        },
        { key: 'port', label: this.$t('pageAlarmSetting.table.port') },
        { key: 'actions', label: '', tdClass: 'text-right' },
      ],
    };
  },
  // @ts-ignore
  validations() {
    return {
      snmpManagers: {
        $each: {
          port: {
            required,
            between: between(0, 65535),
          },
          address: {
            required,
          },
        },
      },
    };
  },
  computed: {
    form() {
      return {
        snmpManagers: this.snmpManagers,
        managersToDelete: this.managersToDelete,
      };
    },
  },
  created() {
    let oldArr = this.$store.state.alarmSetting.snmpManagers;
    oldArr.splice(0, oldArr.length);
    this.startLoader();
    this.$store.dispatch('alarmSetting/getManagerData').finally(() => {
      this.snmpManagers = this.$store.getters['alarmSetting/snmpManagers'];
      this.managersToDelete = this.$store.getters[
        'alarmSetting/managersToDelete'
      ];
      this.endLoader();
    });
  },
  methods: {
    async updateManagersSettings() {
      this.startLoader();
      // Validate that no field are empty and port is valid. Port value is
      // undefined if it is an invalid number.
      for (let i in this.snmpManagers) {
        if (!this.snmpManagers[i].address || !this.snmpManagers[i].port) {
          this.errorToast(this.$t('pageAlarmSetting.toast.errorSave'));
          this.endLoader();
          return;
        }
      }
      let managersLength = this.snmpManagers.length;
      let errorTag = false;
      while (managersLength--) {
        // If the manager does not have a 'path', it is a new manager
        // and needs to be created
        if (!this.snmpManagers[managersLength].path) {
          await this.$store
            .dispatch('alarmSetting/addManager', {
              address: this.snmpManagers[managersLength].address,
              port: this.snmpManagers[managersLength].port,
            })
            .catch(() => {
              errorTag = true;
              this.errorToast(this.$t('pageAlarmSetting.toast.errorSave'));
            });
        } else {
          if (this.snmpManagers[managersLength].updateAddress) {
            await this.$store
              .dispatch('alarmSetting/setManagerAddress', {
                path: this.snmpManagers[managersLength].path,
                address: this.snmpManagers[managersLength].address,
              })
              .catch(() => {
                errorTag = true;
                this.errorToast(this.$t('pageAlarmSetting.toast.errorSave'));
              });
          }
          if (this.snmpManagers[managersLength].updatePort) {
            await this.$store
              .dispatch('alarmSetting/setManagerPort', {
                path: this.snmpManagers[managersLength].path,
                port: this.snmpManagers[managersLength].port,
              })
              .catch(() => {
                errorTag = true;
                this.errorToast(this.$t('pageAlarmSetting.toast.errorSave'));
              });
          }
        }
      }
      // delete all items in managersToDelete
      for (let i in this.managersToDelete) {
        await this.$store
          .dispatch('alarmSetting/deleteManager', this.managersToDelete[i])
          .catch(() => {
            errorTag = true;
            this.errorToast(this.$t('pageAlarmSetting.toast.errorSave'));
          });
      }
      this.endLoader();
      if (!errorTag) {
        this.successToast(this.$t('pageAlarmSetting.toast.successSave'));
      }
    },
    async submitForm() {
      let returntag = false;
      this.$v.$touch();
      if (this.$v.$invalid) {
        await this.$bvModal
          .msgBoxOk(this.$t('pageAlarmSetting.modal.errorSaveMessage'), {
            title: this.$t('pageAlarmSetting.modal.errorSave'),
          })
          .then(() => {
            returntag = true;
          });
        if (returntag) {
          return;
        }
      }
      this.$bvModal
        .msgBoxConfirm(this.$t('pageAlarmSetting.modal.confirmMessage'), {
          title: this.$t('pageAlarmSetting.modal.confirmTitle'),
          okTitle: this.$t('global.action.confirm'),
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((confirmed: boolean) => {
          if (confirmed) this.updateManagersSettings();
        });
    },
    addNewSNMPManager() {
      this.$store.dispatch('alarmSetting/addNewSNMPManager');
    },
    refresh() {
      this.$router.go(0);
    },
    onDeleteManagerTableRow(row: any) {
      this.$store.dispatch('alarmSetting/onDeleteManagerTableRow', row);
    },
  },
};
</script>

<style lang="scss" scoped>
.setting-section {
  border-bottom: 1px solid gray('300');
}
button {
  margin: 5px;
}
</style>
