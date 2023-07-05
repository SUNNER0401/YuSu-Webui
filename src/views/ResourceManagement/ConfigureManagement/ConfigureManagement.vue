<template>
  <b-container fluid>
    <page-title :description="$t('pageConfigureManagement.description')" />
    <b-row>
      <b-col class="text-right">
        <form-file
          id="image-file"
          :name="$t('pageConfigureManagement.button.import')"
          class="d-inline"
          @input="confirmUpload($event)"
        />
        <b-button variant="primary" @click="confirmDownload">
          <icon-download /> {{ $t('pageConfigureManagement.button.download') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div>
          <b-card no-body>
            <b-tabs card>
              <sensor-tab :sensor-info="sensorInfo"></sensor-tab>
            </b-tabs>
          </b-card>
        </div>
      </b-col>
    </b-row>
    <modal-download />
    <modal-import @ok="upload" @cancel="resetInputFileButton" />
    <b-modal
      id="modal-update-firmware-bmc-progress"
      :title="$t('pageConfigureManagement.modal.bmcReboot')"
      no-close-on-backdrop
      no-close-on-esc
      hide-footer
      hide-header-close
    >
      <p>{{ $t('pageConfigureManagement.modal.bmcRebootingText') }}</p>
      <b-progress max="100" class="mt-3">
        <b-progress-bar
          :value="100"
          variant="danger"
          animated
          :label="
            $t('pageConfigureManagement.modal.bmcRebooting').split(':')[0]
          "
        >
        </b-progress-bar>
      </b-progress>
    </b-modal>
  </b-container>
</template>

<script lang="ts">
import PageTitle from '@/components/Global/PageTitle';
import SensorTab from './SensorTab';
import ModalDownload from './ModalDownload';
import ModalImport from './ModalImport';
import FormFile from '@/components/Global/FormFile';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import IconDownload from '@carbon/icons-vue/es/download/20';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import { AddEventTarget } from '@/.env.d.ts';

export default {
  name: 'ConfiureManagement',
  components: {
    PageTitle,
    SensorTab,
    IconDownload,
    FormFile,
    ModalDownload,
    ModalImport,
  },
  mixins: [LoadingBarMixin, BVToastMixin],
  data() {
    return {
      file: null,
    };
  },
  computed: {
    sensorInfo() {
      return {
        fields: [
          {
            key: 'Name',
            sortable: false,
            label: this.$t('pageConfigureManagement.tabs.tab1.fields.name'),
          },
          {
            key: 'CriticalLow',
            sortable: false,
            label: this.$t(
              'pageConfigureManagement.tabs.tab1.fields.criticalLow'
            ),
          },
          {
            key: 'WarningLow',
            sortable: false,
            label: this.$t(
              'pageConfigureManagement.tabs.tab1.fields.warningLow'
            ),
          },
          {
            key: 'WarningHigh',
            sortable: false,
            label: this.$t(
              'pageConfigureManagement.tabs.tab1.fields.WarningHigh'
            ),
          },
          {
            key: 'CriticalHigh',
            sortable: false,
            label: this.$t(
              'pageConfigureManagement.tabs.tab1.fields.criticalHigh'
            ),
          },
        ],
        items: this.$store.getters['configure/sensorInfo'],
      };
    },
  },
  mounted() {
    this.startLoader();
    this.$store.dispatch('configure/getConfigures').finally(() => {
      this.endLoader();
    });
  },
  methods: {
    confirmDownload() {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageConfigureManagement.modal.confirmMessage1'),
          {
            title: this.$t('pageConfigureManagement.modal.confirmTitle1'),
            okTitle: this.$t('global.action.confirm'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((confirm: boolean) => {
          if (confirm) {
            this.$bvModal.show('download-preparing');
            this.$store
              .dispatch('configure/download')
              .then(() => {
                this.successToast(
                  this.$t('pageConfigureManagement.modal.successDownload')
                );
              })
              .catch(() => {
                this.errorToast(
                  this.$t('pageConfigureManagement.modal.errorDownload')
                );
              })
              .finally(() => {
                this.$bvModal.hide('download-preparing');
              });
          }
        });
    },
    upload() {
      this.$store
        .dispatch('configure/upload', this.file)
        .then(() => {
          this.successToast(
            this.$t('pageConfigureManagement.toast.successUpload')
          );
          this.$store
            .dispatch('controls/rebootBmc')
            .then((message: string) => {
              this.successToast(message);
              this.$bvModal.show('modal-update-firmware-bmc-progress');
            })
            .catch(({ message }: { message: string }) =>
              this.errorToast(message)
            );
        })
        .catch(({ data }: any) => {
          console.log(data?.Message);
          switch (data?.error['@Message.ExtendedInfo'][0]?.Oem?.ErrorCode) {
            case 50: {
              this.errorToast(
                this.$t('pageConfigureManagement.toast.errorUpload1')
              );
              break;
            }
            case 51: {
              this.errorToast(
                this.$t('pageConfigureManagement.toast.errorUpload2')
              );
              break;
            }
            case 52: {
              this.errorToast(
                this.$t('pageConfigureManagement.toast.errorUpload3')
              );
              break;
            }
            case 53: {
              this.errorToast(
                this.$t('pageConfigureManagement.toast.errorUpload4')
              );
              break;
            }
            default: {
              this.errorToast(
                this.$t('pageConfigureManagement.toast.errorUpload')
              );
              break;
            }
          }
        })
        .finally(() => {
          this.resetInputFileButton();
        });
    },
    confirmUpload(file: Blob) {
      if (!file) return;
      this.file = file;
      this.$bvModal.show('upload-confirm');
    },
    resetInputFileButton() {
      let fileElement = document.querySelector('input[type="file"]');

      let newFileElement = document.createElement('input');
      newFileElement.type = 'file';
      newFileElement.id = 'image-file';
      newFileElement.style.display = 'none';
      newFileElement.classList.add('form-control-file');
      newFileElement.classList.add('is-valid');

      fileElement?.parentElement?.appendChild(newFileElement);
      fileElement?.remove();

      newFileElement.addEventListener('input', (event) => {
        this.confirmUpload((event.target as AddEventTarget)!.files[0]);
      });
    },
  },
};
</script>

<style scoped>
::v-deep .clear-selected-file {
  display: none;
}
</style>
