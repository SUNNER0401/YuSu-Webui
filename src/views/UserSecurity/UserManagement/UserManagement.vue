<template>
  <b-container fluid>
    <page-title />
    <b-row>
      <b-col xl="9" class="text-right">
        <b-button variant="link" @click="initModalSettings">
          <icon-settings />
          {{ $t('pageUserManagement.accountPolicySettings') }}
        </b-button>
        <b-button
          variant="primary"
          data-test-id="userManagement-button-addUser"
          @click="initModalUser(null)"
        >
          <icon-add />
          {{ $t('pageUserManagement.addUser') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="9">
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          :actions="tableToolbarActions"
          @clear-selected="clearSelectedRows($refs.table)"
          @batch-action="onBatchAction"
        />
        <b-table
          ref="table"
          responsive="md"
          selectable
          show-empty
          no-select-on-click
          hover
          :fields="fields"
          :items="tableItems"
          :empty-text="$t('global.table.emptyMessage')"
          @row-selected="onRowSelected($event, tableItems.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              data-test-id="userManagement-checkbox-tableHeaderCheckbox"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              @change="onChangeHeaderCheckbox($refs.table)"
            >
              <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
            </b-form-checkbox>
          </template>
          <template #cell(checkbox)="row">
            <b-form-checkbox
              v-model="row.rowSelected"
              data-test-id="userManagement-checkbox-toggleSelectRow"
              @change="toggleSelectRow($refs.table, row.index)"
            >
              <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
            </b-form-checkbox>
          </template>

          <!-- table actions column -->
          <template #cell(actions)="{ item }">
            <table-row-action
              v-for="(action, index) in item.actions"
              :key="index"
              :value="action.value"
              :enabled="action.enabled"
              :title="action.title"
              @click-table-action="onTableRowAction($event, item)"
            >
              <template #icon>
                <icon-password
                  v-if="action.value === 'password'"
                  :data-test-id="`userManagement-tableRowAction-passord-${index}`"
                />
                <icon-edit
                  v-if="action.value === 'edit'"
                  :data-test-id="`userManagement-tableRowAction-edit-${index}`"
                />
                <icon-trashcan
                  v-if="action.value === 'delete'"
                  :data-test-id="`userManagement-tableRowAction-delete-${index}`"
                />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="8">
        <b-button
          v-b-toggle.collapse-role-table
          data-test-id="userManagement-button-viewPrivilegeRoleDescriptions"
          variant="link"
          class="mt-3"
        >
          <icon-chevron />
          {{ $t('pageUserManagement.viewPrivilegeRoleDescriptions') }}
        </b-button>
        <b-collapse id="collapse-role-table" class="mt-3">
          <table-roles />
        </b-collapse>
      </b-col>
    </b-row>
    <!-- Modals -->
    <modal-change-password
      :user="activeUser"
      :password-requirements="passwordRequirements"
      @ok="changePassword"
    />
    <modal-settings :settings="settings" @ok="saveAccountSettings" />
    <modal-user
      :user="activeUser"
      :password-requirements="passwordRequirements"
      @ok="saveUser"
      @hidden="activeUser = null"
    />
  </b-container>
</template>

<script lang="ts">
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconSettings from '@carbon/icons-vue/es/settings/20';
import IconChevron from '@carbon/icons-vue/es/chevron--up/20';
import IconPassword from '@carbon/icons-vue/es/password/20';

import ModalUser from './ModalUser';
import ModalSettings from './ModalSettings';
import ModalChangePassword from './ModalChangePassword';
import PageTitle from '@/components/Global/PageTitle';
import TableRoles from './TableRoles';
import TableToolbar from '@/components/Global/TableToolbar';
import TableRowAction from '@/components/Global/TableRowAction';

import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'UserManagement',
  components: {
    IconAdd,
    IconChevron,
    IconEdit,
    IconSettings,
    IconTrashcan,
    IconPassword,
    ModalSettings,
    ModalUser,
    ModalChangePassword,
    PageTitle,
    TableRoles,
    TableRowAction,
    TableToolbar,
  },
  mixins: [BVTableSelectableMixin, BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to: any, from: any, next: () => void) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      activeUser: null,
      fields: [
        {
          key: 'checkbox',
        },
        {
          key: 'username',
          label: this.$t('pageUserManagement.table.username'),
        },
        {
          key: 'privilege',
          label: this.$t('pageUserManagement.table.privilege'),
        },
        {
          key: 'status',
          label: this.$t('pageUserManagement.table.status'),
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
      tableToolbarActions: [
        {
          value: 'delete',
          label: this.$t('global.action.delete'),
        },
        {
          value: 'enable',
          label: this.$t('global.action.enable'),
        },
        {
          value: 'disable',
          label: this.$t('global.action.disable'),
        },
      ],
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
    };
  },
  computed: {
    currentUsername() {
      return this.$store.getters['global/username'];
    },
    userPrivilege() {
      return this.$store.getters['global/userPrivilege'];
    },
    allUsers() {
      return this.$store.getters['userManagement/allUsers'];
    },
    tableItems() {
      // transform user data to table data
      return this.allUsers.map(
        (user: {
          UserName: string;
          RoleId: any;
          Locked: any;
          Enabled: any;
        }) => {
          return {
            username: user.UserName,
            privilege: user.RoleId,
            status: user.Locked
              ? 'Locked'
              : user.Enabled
              ? 'Enabled'
              : 'Disabled',
            actions: [
              {
                value: 'password',
                enabled:
                  user.UserName === this.currentUsername ||
                  this.userPrivilege === 'Administrator'
                    ? true
                    : false,
                title: this.$t('pageUserManagement.changePassword'),
              },
              {
                value: 'edit',
                enabled: true,
                title: this.$t('pageUserManagement.editUser'),
              },
              {
                value: 'delete',
                enabled: user.UserName === 'root' ? false : true,
                title: this.$tc('pageUserManagement.deleteUser'),
              },
            ],
            ...user,
          };
        }
      );
    },
    settings() {
      return this.$store.getters['userManagement/accountSettings'];
    },
    passwordRequirements() {
      return this.$store.getters['userManagement/accountPasswordRequirements'];
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('userManagement/getUsers')
      .finally(() => this.endLoader());
    this.$store.dispatch('userManagement/getAccountSettings');
    this.$store.dispatch('userManagement/getAccountRoles');
  },
  methods: {
    initModalUser(user: any) {
      this.activeUser = user;
      this.$bvModal.show('modal-user');
    },
    initModalDelete(user: { username: any }) {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageUserManagement.modal.deleteConfirmMessage', {
            user: user.username,
          }),
          {
            title: this.$tc('pageUserManagement.deleteUser'),
            okTitle: this.$tc('pageUserManagement.deleteUser'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((deleteConfirmed: boolean) => {
          if (deleteConfirmed) {
            this.deleteUser(user);
          }
        });
    },
    initModalChangePassword(user: { username: any }) {
      this.activeUser = user;
      this.$bvModal.show('modal-change-password');
    },
    initModalSettings() {
      this.$bvModal.show('modal-settings');
    },
    changePassword(password: string) {
      this.startLoader();
      this.$$store
        .dispatch('userManagement/changePassword', {
          username: this.activeUser.username,
          password,
        })
        .then(() => {
          this.successToast(this.$t('pageSessions.table.settingSuccessfully'));
        })
        .catch(() => {
          this.errorToast(this.$t('pageSessions.table.errorSetting'));
        })
        .finally(() => this.endLoader());
    },
    saveUser({ isNewUser, userData }: { isNewUser: boolean; userData: any }) {
      this.startLoader();
      if (isNewUser) {
        this.$store
          .dispatch('userManagement/createUser', userData)
          .then((success: string) => this.successToast(success))
          .catch(({ message }: { message: string }) => this.errorToast(message))
          .finally(() => this.endLoader());
      } else {
        this.$store
          .dispatch('userManagement/updateUser', userData)
          .then((success: string) => this.successToast(success))
          .catch(({ message }: { message: string }) => this.errorToast(message))
          .finally(() => this.endLoader());
      }
    },
    deleteUser({ username }: { username: string }) {
      this.startLoader();
      this.$store
        .dispatch('userManagement/deleteUser', username)
        .then((success: string) => this.successToast(success))
        .catch(({ message }: { message: string }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    onBatchAction(action: string) {
      switch (action) {
        case 'delete':
          this.$bvModal
            .msgBoxConfirm(
              this.$tc(
                'pageUserManagement.modal.batchDeleteConfirmMessage',
                this.selectedRows.length
              ),
              {
                title: this.$tc(
                  'pageUserManagement.deleteUser',
                  this.selectedRows.length
                ),
                okTitle: this.$tc(
                  'pageUserManagement.deleteUser',
                  this.selectedRows.length
                ),
                cancelTitle: this.$t('global.action.cancel'),
              }
            )
            .then((deleteConfirmed: any) => {
              if (deleteConfirmed) {
                this.startLoader();
                this.$store
                  .dispatch('userManagement/deleteUsers', this.selectedRows)
                  .then((messages: { type: any; message: any }[]) => {
                    messages.forEach(({ type, message }) => {
                      if (type === 'success') this.successToast(message);
                      if (type === 'error') this.errorToast(message);
                    });
                  })
                  .finally(() => this.endLoader());
              }
            });
          break;
        case 'enable':
          this.startLoader();
          this.$store
            .dispatch('userManagement/enableUsers', this.selectedRows)
            .then((messages: { type: any; message: any }[]) => {
              messages.forEach(({ type, message }) => {
                if (type === 'success') this.successToast(message);
                if (type === 'error') this.errorToast(message);
              });
            })
            .finally(() => this.endLoader());
          break;
        case 'disable':
          this.startLoader();
          this.$store
            .dispatch('userManagement/disableUsers', this.selectedRows)
            .then((messages: { type: any; message: any }[]) => {
              messages.forEach(({ type, message }) => {
                if (type === 'success') this.successToast(message);
                if (type === 'error') this.errorToast(message);
              });
            })
            .finally(() => this.endLoader());
          break;
      }
    },
    onTableRowAction(action: string, row: any) {
      switch (action) {
        case 'password':
          this.initModalChangePassword(row);
          break;
        case 'edit':
          this.initModalUser(row);
          break;
        case 'delete':
          this.initModalDelete(row);
          break;
        default:
          break;
      }
    },
    saveAccountSettings(settings: any) {
      this.startLoader();
      this.$store
        .dispatch('userManagement/saveAccountSettings', settings)
        .then((message: string) => this.successToast(message))
        .catch(({ message }: { message: string }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>

<style lang="scss" scoped>
.btn.collapsed {
  svg {
    transform: rotate(180deg);
  }
}
</style>
