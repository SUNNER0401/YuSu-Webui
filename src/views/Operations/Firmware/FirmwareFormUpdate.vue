<template>
  <div class="form-update">
    <div class="form-background p-3">
      <b-form @submit.prevent="onSubmitUpload">
        <b-form-group
          v-if="isTftpUploadAvailable"
          :label="$t('pageFirmware.form.updateFirmware.fileSource')"
          :disabled="isPageDisabled"
        >
          <b-form-radio v-model="isWorkstationSelected" :value="true">
            {{ $t('pageFirmware.form.updateFirmware.workstation') }}
          </b-form-radio>
          <b-form-radio v-model="isWorkstationSelected" :value="false">
            {{ $t('pageFirmware.form.updateFirmware.tftpServer') }}
          </b-form-radio>
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
    <modal-update-firmware @ok="updateFirmware" />
  </div>
</template>

<script>
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
    };
  },
  computed: {
    isTftpUploadAvailable() {
      return this.$store.getters['firmware/isTftpUploadAvailable'];
    },
    runningHost() {
      return this.$store.getters['firmware/activeHostFirmware'];
    },
    runningBmc() {
      return this.$store.getters['firmware/activeBmcFirmware'];
    },
    updatingFirmware() {
      return this.$store.getters['firmware/getUpdatingFirmware'];
    },
    bmcFirmware() {
      return this.$store.state.firmware.bmcFirmware;
    },
    hostFirmware() {
      return this.$store.state.firmware.hostFirmware;
    },
  },
  watch: {
    isWorkstationSelected: function () {
      this.$v.$reset();
      this.file = null;
      this.tftpFileAddress = null;
    },
  },
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
    this.$store.dispatch('firmware/getUpdateServiceSettings');
  },
  methods: {
    async updateFirmware() {
      // Init some state values in firmware.
      this.$store.state.firmware.lastGetProgress = 0;
      this.$store.state.firmware.updateFirmware = '';
      this.$bvModal.show('modal-update-firmware-bios-progress');
      this.infoToast(this.$t('pageFirmware.toast.updateStartedMessage'), {
        title: this.$t('pageFirmware.toast.updateStarted'),
        timestamp: true,
      });
      // Used for resetting basicFirmware informations.
      await this.$store.dispatch('firmware/getFirmwareInventory');
      let [allBmcFirmware, allHostFirmware] = [
        this.bmcFirmware,
        this.hostFirmware,
      ];

      /* Clear redundant Hostfirmware. this can be used in special cases such as
      getting power off in updating. */
      if (allHostFirmware.length > 1) {
        let redundantHostFirmware = allHostFirmware.filter((item) => {
          return item.id != this.$store.state.firmware.hostActiveFirmwareId;
        });
        allHostFirmware = allHostFirmware.filter((item) => {
          return item.id == this.$store.state.firmware.hostActiveFirmwareId;
        });
        for (let item of redundantHostFirmware) {
          this.$store.dispatch('firmware/deleteBrokenFirmware', item.id);
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
      if (this.isWorkstationSelected) {
        await this.dispatchWorkstationUpload(timerId).catch(() => {
          updateFlag = false;
        });
      } else {
        await this.dispatchTftpUpload(timerId).catch(() => {
          updateFlag = false;
        });
      }
      if (!updateFlag) return;

      // Get new firmware informations.
      await this.$store.dispatch('firmware/getFirmwareInventory');
      let [newBmcFirmware, newHostFirmware] = [
        this.bmcFirmware,
        this.hostFirmware,
      ];
      let [updatingBmcFirmware, updatingHostFirmware] = [
        newBmcFirmware,
        newHostFirmware,
      ];
      // To find the firmware which is updating.
      updatingHostFirmware = this.getupdatingFirmware(
        allHostFirmware,
        updatingHostFirmware
      );
      updatingBmcFirmware = this.getupdatingFirmware(
        allBmcFirmware,
        updatingBmcFirmware
      );
      // Validate type of updating firmware via length of final array.
      let updatingFirmware;
      if (updatingHostFirmware.length) {
        updatingFirmware = updatingHostFirmware[0];
        updatingFirmware['type'] = 'Bios';
      }
      if (updatingBmcFirmware.length) {
        updatingFirmware = updatingBmcFirmware[0];
        updatingFirmware['type'] = 'Bmc';
      }
      this.$store.state.firmware.updateFirmware = updatingFirmware;
      // Used for compare the version of the active firmware.
      let updatingVersion = updatingFirmware.version;
      // Watch progress in real-time and stop watching when lose progress value.
      if (updatingFirmware['type'] == 'Bios') {
        const timerId2 = setInterval(async () => {
          let Updateinfo = await this.$store
            .dispatch('firmware/getUpdateinfo', updatingFirmware.id)
            .catch(async () => {
              clearTimeout(timerId2);
              // Get the version of the active bios firmware.
              let bios_active = await this.$store.dispatch(
                'firmware/getFirmwareInfo',
                'bios_active'
              );
              if (bios_active.Version === updatingVersion) {
                this.$store.state.firmware.updateProgress = 100;
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
                  this.$store.state.firmware.updateProgress = 0;
                  this.$store.dispatch('firmware/getFirmwareInventory');
                }, 5000);
              } else {
                /* Only when missed updating page likewise versions are not same,
              this code block will excute. */
                this.$bvModal.hide('modal-update-firmware-bios-progress');
                this.errorToast(this.$t('pageFirmware.toast.pageMiss'));
                this.$store.state.firmware.updateProgress = 0;
                this.$store.dispatch('firmware/getFirmwareInventory');
                throw 'Page not found';
              }
            });
          //Judge whether progress still exists.
          if (Updateinfo) {
            if (!Updateinfo.Progress) {
              let Activation = Updateinfo.Activation.split('.').slice(-1)[0];
              if (Activation == 'Failed') {
                clearTimeout(timerId2);
                setTimeout(() => {
                  clearTimeout(timerId);
                  this.$bvModal.hide('modal-update-firmware-bios-progress');
                  this.errorToast(this.$t('pageFirmware.toast.errorBurning'));
                  // Reset basic states.
                  this.$store.state.firmware.updateProgress = 0;
                  this.$store.dispatch(
                    'firmware/deleteBrokenFirmware',
                    updatingFirmware.id
                  );
                  this.$store.dispatch('firmware/getFirmwareInventory');
                }, 5000);
              }
            }
          }
        }, 2000);
      }
      if (updatingFirmware['type'] == 'Bmc') {
        this.$bvModal.hide('modal-update-firmware-bios-progress');
        this.$bvModal.show('modal-update-firmware-bmc-progress');
      }
    },
    async dispatchWorkstationUpload(timerId) {
      await this.$store
        .dispatch('firmware/uploadFirmware', this.file)
        .catch(({ message }) => {
          // this.endLoader();
          this.$bvModal.hide('modal-update-firmware-bios-progress');
          this.errorToast(message);
          clearTimeout(timerId);
          throw 'error';
        });
    },
    async dispatchTftpUpload(timerId) {
      await this.$store
        .dispatch('firmware/uploadFirmwareTFTP', this.tftpFileAddress)
        .catch(({ message }) => {
          // this.endLoader();
          this.$bvModal.hide('modal-update-firmware-bios-progress');
          this.errorToast(message);
          clearTimeout(timerId);
          throw 'error';
        });
    },
    getupdatingFirmware(basicFirmware, updatingFirmware) {
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
    onFileUpload(file) {
      this.file = file;
      this.$v.file.$touch();
    },
  },
};
</script>
