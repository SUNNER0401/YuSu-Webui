<template>
  <div class="form-update">
    <div class="form-background p-3">
      <b-form @submit.prevent="onSubmitUpload">
        <b-form-group
          v-if="isTftpUploadAvailable"
          :label="$t('pageFirmware.form.updateFirmware.fileSource')"
          :disabled="isPageDisabled"
        >
          <b-form-radio-group
            v-model="isWorkstationSelected"
            :options="options"
          ></b-form-radio-group>
        </b-form-group>

        <!-- Workstation Upload -->
        <template v-if="isWorkstationSelected">
          <b-form-group
            :label="$t('pageFirmware.form.updateFirmware.imageFile')"
            label-for="image-file"
          >
            <form-file
              id="image-file"
              :disabled="isPageDisabled"
              :state="getValidationState($v.file)"
              aria-describedby="image-file-help-block"
              @input="onFileUpload($event)"
            >
              <template #invalid>
                <b-form-invalid-feedback role="alert">
                  {{ $t('global.form.required') }}
                </b-form-invalid-feedback>
              </template>
            </form-file>
          </b-form-group>
        </template>

        <!-- TFTP Server Upload -->
        <template v-else>
          <b-form-group
            :label="$t('pageFirmware.form.updateFirmware.fileAddress')"
            label-for="tftp-address"
          >
            <b-form-input
              id="tftp-address"
              v-model="tftpFileAddress"
              type="text"
              :state="getValidationState($v.tftpFileAddress)"
              :disabled="isPageDisabled"
              @input="$v.tftpFileAddress.$touch()"
            />
            <b-form-invalid-feedback role="alert">
              {{ $t('global.form.fieldRequired') }}
            </b-form-invalid-feedback>
          </b-form-group>
        </template>
        <b-btn
          data-test-id="firmware-button-startUpdate"
          type="submit"
          variant="primary"
          :disabled="isPageDisabled"
        >
          {{ $t('pageFirmware.form.updateFirmware.startUpdate') }}
        </b-btn>
        <alert
          v-if="isServerPowerOffRequired && !isServerOff"
          variant="warning"
          :small="true"
          class="mt-4"
        >
          <p class="col-form-label">
            {{
              $t('pageFirmware.alert.serverMustBePoweredOffToUpdateFirmware')
            }}
          </p>
        </alert>
      </b-form>
    </div>
    <!-- Modals -->
    <modal-update-firmware :update-firmware="updateFirmware" @ok="update" />
  </div>
</template>

<script lang="ts">
import { requiredIf } from 'vuelidate/lib/validators';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin, { loading } from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin';

import Alert from '@/components/Global/Alert';
import FormFile from '@/components/Global/FormFile';
import ModalUpdateFirmware from './FirmwareModalUpdateFirmware';

export default {
  components: { Alert, FormFile, ModalUpdateFirmware },
  mixins: [BVToastMixin, LoadingBarMixin, VuelidateMixin],
  props: {
    isPageDisabled: {
      required: true,
      type: Boolean,
      default: false,
    },
    isServerOff: {
      required: true,
      type: Boolean,
    },
  },
  data() {
    return {
      loading,
      isWorkstationSelected: true,
      file: null,
      tftpFileAddress: null,
      isServerPowerOffRequired:
        process.env.VUE_APP_SERVER_OFF_REQUIRED === 'true',
      updateProgress: 0,
      updateFirmware: {},
      options: [
        {
          text: this.$t('pageFirmware.form.updateFirmware.workstation'),
          value: 'true',
        },
        {
          text: this.$t('pageFirmware.form.updateFirmware.tftpServer'),
          value: 'false',
        },
      ],
    };
  },
  computed: {
    isTftpUploadAvailable() {
      return this.$$store.getters['firmware/isTftpUploadAvailable'];
    },
    runningHost() {
      return this.$$store.getters['firmware/activeHostFirmware'];
    },
    runningBmc() {
      return this.$$store.getters['firmware/activeBmcFirmware'];
    },
    bmcFirmware() {
      return this.$$store.state.firmware.bmcFirmware;
    },
    hostFirmware() {
      return this.$$store.state.firmware.hostFirmware;
    },
  },
  watch: {
    isWorkstationSelected: function () {
      this.$v.$reset();
      this.file = null;
      this.tftpFileAddress = null;
    },
  },
  // @ts-ignore
  validations() {
    return {
      file: {
        required: requiredIf(function () {
          return this.isWorkstationSelected;
        }),
      },
      tftpFileAddress: {
        required: requiredIf(function () {
          return !this.isWorkstationSelected;
        }),
      },
    };
  },
  created() {
    this.$$store.dispatch('firmware/getUpdateServiceSettings');
  },
  methods: {
    async update() {
      // Init some state values in firmware.
      this.$bvModal.show('modal-update-firmware-bios-progress');
      this.infoToast(this.$t('pageFirmware.toast.updateStartedMessage'), {
        title: this.$t('pageFirmware.toast.updateStarted'),
        timestamp: true,
      });
      // Used for resetting basicFirmware informations.
      await this.$$store.dispatch('firmware/getFirmwareInventory');

      /* Clear redundant Hostfirmware. this can be used in special cases such as
      getting power off in updating. */
      if (this.hostFirmware.length > 1) {
        let redundantHostFirmware = this.hostFirmware.filter(
          (item: { id: any }) => {
            return item.id != this.$$store.state.firmware.hostActiveFirmwareId;
          }
        );
        this.$$store.commit(
          'firmware/setHostFirmware',
          this.hostFirmware.filter((item: { id: any }) => {
            return item.id == this.$$store.state.firmware.hostActiveFirmwareId;
          })
        );
        for (let item of redundantHostFirmware) {
          this.$$store.dispatch('firmware/deleteBrokenFirmware', item.id);
        }
      }
      // It is time to verify update status.
      const timerId = setTimeout(() => {
        this.$bvModal.hide('modal-update-firmware-bios-progress');
        this.infoToast(this.$t('pageFirmware.toast.verifyUpdateMessage'), {
          title: this.$t('pageFirmware.toast.verifyUpdate'),
          refreshAction: true,
        });
      }, 360000);

      // this flag used for validating while post successfully or not.
      let updateFlag = true;
      let updatingFirmware: {
        type?: string;
        taskUrl?: string;
      } = {};
      if (this.isWorkstationSelected) {
        updatingFirmware = await this.dispatchWorkstationUpload(timerId)
          .then((data: { Type: string; taskUrl: string }) => data)
          .catch(() => {
            updateFlag = false;
          });
      } else {
        updatingFirmware = await this.dispatchTftpUpload(timerId)
          .then((data: { Type: string; taskUrl: string }) => data)
          .catch(() => {
            updateFlag = false;
          });
      }
      if (!updateFlag) return;
      // Deliver to FirmwareModalUpdateFirmware.vue
      this.updateFirmware = updatingFirmware;
      // Used for compare the version of the active firmware.
      // Watch progress in real-time and stop watching when lose progress value.
      if (
        updatingFirmware['type'] == 'bios' ||
        updatingFirmware['type'] == 'cpld'
      ) {
        const timerId2 = setInterval(async () => {
          await this.$$store
            .dispatch('firmware/getUpdateinfo', updatingFirmware.taskUrl)
            .then(async ({ TaskState }: { TaskState: string }) => {
              if (TaskState == 'Completed' || TaskState == 'Exception')
                clearTimeout(timerId2);
              // Get the version of the active bios firmware.
              if (TaskState == 'Completed') {
                this.$$store.commit('firmware/setUpdateProgress', 100);
                setTimeout(async () => {
                  clearTimeout(timerId);
                  this.$bvModal.hide('modal-update-firmware-bios-progress');
                  this.successToast(
                    this.$t('pageFirmware.toast.updateSuccessfully')
                  );
                  this.infoToast(
                    this.$t('pageFirmware.toast.verifyUpdateMessage'),
                    {
                      title: this.$t('pageFirmware.toast.updateSuccessfully'),
                      timestamp: true,
                    }
                  );
                  // Reset basic states.
                  this.$$store.commit('firmware/setUpdateProgress', 0);
                  this.$$store.dispatch('firmware/getFirmwareInventory');
                }, 5000);
              }
              if (TaskState == 'Exception') {
                clearTimeout(timerId);
                this.$bvModal.hide('modal-update-firmware-bios-progress');
                this.errorToast(this.$t('pageFirmware.toast.errorUpdate'));
                this.$$store.commit('firmware/setUpdateProgress', 0);
                this.$$store.dispatch('firmware/getFirmwareInventory');
              }
            });
        }, 2000);
      }
      if (updatingFirmware['type'] == 'bmc') {
        this.$bvModal.hide('modal-update-firmware-bios-progress');
        this.$bvModal.show('modal-update-firmware-bmc-progress');
        this.bmcUpdate(updatingFirmware.taskUrl);
      }
    },
    bmcUpdate(taskUrl: string) {
      this.$$store
        .dispatch('firmware/getUpdateinfo', taskUrl)
        .then(
          ({
            TaskState,
            TaskStatus,
          }: {
            TaskState: string;
            TaskStatus: string;
          }) => {
            if (TaskState == 'Completed' && TaskStatus == 'OK') {
              this.$$store.dispatch('controls/rebootBmc');
              this.successToast(
                this.$t('pageFirmware.toast.UpdatingRebootBmc')
              );
            } else if (TaskState == 'Stopping' && TaskStatus == 'OK') {
              this.$bvModal.show('modal-update-firmware-bmc-progress');
              this.errorToast(this.$t('pageFirmware.toast.errorStop'));
            } else if (TaskState == 'Exception' && TaskStatus == 'Warning') {
              this.$bvModal.show('modal-update-firmware-bmc-progress');
              this.errorToast(this.$t('pageFirmware.toast.errorChecked'));
            } else if (TaskState == 'Cancelled' && TaskStatus == 'Warning') {
              this.$bvModal.show('modal-update-firmware-bmc-progress');
              this.errorToast(this.$t('pageFirmware.toast.TimeoutCancelled'));
            } else if (TaskState == 'Running' && TaskStatus == 'OK') {
              this.bmcUpdate(taskUrl);
            }
          }
        );
    },
    async dispatchWorkstationUpload(timerId: number | undefined) {
      return await this.$$store
        .dispatch('firmware/uploadFirmware', this.file)
        .then((data: any) => data)
        .catch(({ message }: { message: string }) => {
          this.$bvModal.hide('modal-update-firmware-bios-progress');
          this.errorToast(message);
          clearTimeout(timerId);
          throw 'error';
        });
    },
    async dispatchTftpUpload(timerId: number | undefined) {
      await this.$$store
        .dispatch('firmware/uploadFirmwareTFTP', this.tftpFileAddress)
        .catch(({ message }: { message: string }) => {
          this.$bvModal.hide('modal-update-firmware-bios-progress');
          this.errorToast(message);
          clearTimeout(timerId);
          throw 'error';
        });
    },
    getupdatingFirmware(basicFirmware: any, updatingFirmware: any[]) {
      for (let image of basicFirmware) {
        updatingFirmware = updatingFirmware.filter((item) => {
          return item.id !== image.id;
        });
      }
      return updatingFirmware;
    },
    onSubmitUpload() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$bvModal.show('modal-update-firmware');
    },
    onFileUpload(file: Blob) {
      this.file = file;
      this.$v.file.$touch();
    },
  },
};
</script>
