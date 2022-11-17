<template>
  <b-container fluid>
    <page-title />
    <b-row>
      <b-col xl="11">
        <!-- Expired certificates banner -->
        <alert :show="expiredCertificateTypes.length > 0" variant="danger">
          <template v-if="expiredCertificateTypes.length > 1">
            {{ $t('pageCertificates.alert.certificatesExpiredMessage') }}
          </template>
          <template v-else>
            {{
              $t('pageCertificates.alert.certificateExpiredMessage', {
                certificate: expiredCertificateTypes[0],
              })
            }}
          </template>
        </alert>
        <!-- Expiring certificates banner -->
        <alert :show="expiringCertificateTypes.length > 0" variant="warning">
          <template v-if="expiringCertificateTypes.length > 1">
            {{ $t('pageCertificates.alert.certificatesExpiringMessage') }}
          </template>
          <template v-else>
            {{
              $t('pageCertificates.alert.certificateExpiringMessage', {
                certificate: expiringCertificateTypes[0],
              })
            }}
          </template>
        </alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="11" class="text-right">
        <b-button
          v-b-modal.generate-csr
          data-test-id="certificates-button-generateCsr"
          variant="link"
        >
          <icon-add />
          {{ $t('pageCertificates.generateCsr') }}
        </b-button>
        <b-button
          variant="primary"
          :disabled="certificatesForUpload.length === 0"
          @click="initModalUploadCertificate(null)"
        >
          <icon-add />
          {{ $t('pageCertificates.addNewCertificate') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="11">
        <b-table
          responsive="md"
          show-empty
          hover
          :fields="fields"
          :items="tableItems"
          :empty-text="$t('global.table.emptyMessage')"
        >
          <template #cell(validFrom)="{ value }">
            {{ value | formatDate }}
          </template>

          <template #cell(validUntil)="{ value }">
            <status-icon
              v-if="getDaysUntilExpired(value) < 31"
              :status="getIconStatus(value)"
            />
            {{ value | formatDate }}
          </template>

          <template #cell(actions)="{ value, item }">
            <table-row-action
              v-for="(action, index) in value"
              :key="index"
              :value="action.value"
              :title="action.title"
              :enabled="action.enabled"
              @click-table-action="onTableRowAction($event, item)"
            >
              <template #icon>
                <icon-replace v-if="action.value === 'replace'" />
                <icon-trashcan v-if="action.value === 'delete'" />
              </template>
            </table-row-action>
          </template>
        </b-table>
      </b-col>
    </b-row>

    <!-- Modals -->
    <modal-upload-certificate :certificate="modalCertificate" @ok="onModalOk" />
    <modal-generate-csr />
  </b-container>
</template>

<script lang="ts">
import IconAdd from '@carbon/icons-vue/es/add--alt/20';
import IconReplace from '@carbon/icons-vue/es/renew/20';
import IconTrashcan from '@carbon/icons-vue/es/trash-can/20';

import ModalGenerateCsr from './ModalGenerateCsr';
import ModalUploadCertificate from './ModalUploadCertificate';
import PageTitle from '@/components/Global/PageTitle';
import TableRowAction from '@/components/Global/TableRowAction';
import StatusIcon from '@/components/Global/StatusIcon';
import Alert from '@/components/Global/Alert';

import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'Certificates',
  components: {
    Alert,
    IconAdd,
    IconReplace,
    IconTrashcan,
    ModalGenerateCsr,
    ModalUploadCertificate,
    PageTitle,
    StatusIcon,
    TableRowAction,
  },
  mixins: [BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to: any, from: any, next: () => void) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      modalCertificate: null,
      fields: [
        {
          key: 'certificate',
          label: this.$t('pageCertificates.table.certificate'),
        },
        {
          key: 'issuedBy',
          label: this.$t('pageCertificates.table.issuedBy'),
        },
        {
          key: 'issuedTo',
          label: this.$t('pageCertificates.table.issuedTo'),
        },
        {
          key: 'validFrom',
          label: this.$t('pageCertificates.table.validFrom'),
        },
        {
          key: 'validUntil',
          label: this.$t('pageCertificates.table.validUntil'),
        },
        {
          key: 'actions',
          label: '',
          tdClass: 'text-right text-nowrap',
        },
      ],
    };
  },
  computed: {
    certificates() {
      return this.$store.getters['certificates/allCertificates'];
    },
    tableItems() {
      return this.certificates.map((certificate: { type: string }) => {
        return {
          ...certificate,
          actions: [
            {
              value: 'replace',
              title: this.$t('pageCertificates.replaceCertificate'),
            },
            {
              value: 'delete',
              title: this.$t('pageCertificates.deleteCertificate'),
              enabled:
                certificate.type === 'TrustStore Certificate' ? true : false,
            },
          ],
        };
      });
    },
    certificatesForUpload() {
      return this.$store.getters['certificates/availableUploadTypes'];
    },
    bmcTime() {
      return this.$store.getters['global/bmcTime'];
    },
    expiredCertificateTypes() {
      return this.certificates.reduce(
        (acc: any[], val: { validUntil: any; certificate: any }) => {
          const daysUntilExpired = this.getDaysUntilExpired(val.validUntil);
          if (daysUntilExpired < 1) {
            acc.push(val.certificate);
          }
          return acc;
        },
        []
      );
    },
    expiringCertificateTypes() {
      return this.certificates.reduce(
        (acc: any[], val: { validUntil: any; certificate: any }) => {
          const daysUntilExpired = this.getDaysUntilExpired(val.validUntil);
          if (daysUntilExpired < 31 && daysUntilExpired > 0) {
            acc.push(val.certificate);
          }
          return acc;
        },
        []
      );
    },
  },
  async created() {
    this.startLoader();
    await this.$store.dispatch('global/getBmcTime');
    this.$store
      .dispatch('certificates/getCertificates')
      .finally(() => this.endLoader());
  },
  methods: {
    onTableRowAction(event: string, rowItem: any) {
      switch (event) {
        case 'replace':
          this.initModalUploadCertificate(rowItem);
          break;
        case 'delete':
          this.initModalDeleteCertificate(rowItem);
          break;
        default:
          break;
      }
    },
    initModalUploadCertificate(certificate = null) {
      this.modalCertificate = certificate;
      this.$bvModal.show('upload-certificate');
    },
    initModalDeleteCertificate(certificate: {
      issuedBy: any;
      certificate: any;
    }) {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageCertificates.modal.deleteConfirmMessage', {
            issuedBy: certificate.issuedBy,
            certificate: certificate.certificate,
          }),
          {
            title: this.$t('pageCertificates.deleteCertificate'),
            okTitle: this.$t('global.action.delete'),
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((deleteConfirmed: boolean) => {
          if (deleteConfirmed) this.deleteCertificate(certificate);
        });
    },
    onModalOk({
      addNew,
      file,
      type,
      location,
    }: {
      addNew: any;
      file: any;
      type: any;
      location: any;
    }) {
      if (addNew) {
        // Upload a new certificate
        this.addNewCertificate(file, type);
      } else {
        // Replace an existing certificate
        this.replaceCertificate(file, type, location);
      }
    },
    addNewCertificate(file: any, type: any) {
      this.startLoader();
      this.$store
        .dispatch('certificates/addNewCertificate', { file, type })
        .then((success: string) => this.successToast(success))
        .catch(({ message }: { message: string }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    replaceCertificate(file: Blob, type: any, location: any) {
      this.startLoader();
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onloadend = (event) => {
        const certificateString = event.target!.result;
        this.$store
          .dispatch('certificates/replaceCertificate', {
            certificateString,
            type,
            location,
          })
          .then((success: string) => this.successToast(success))
          .catch(({ message }: { message: string }) => this.errorToast(message))
          .finally(() => this.endLoader());
      };
    },
    deleteCertificate({ type, location }: { type: any; location: any }) {
      this.startLoader();
      this.$store
        .dispatch('certificates/deleteCertificate', {
          type,
          location,
        })
        .then((success: string) => this.successToast(success))
        .catch(({ message }: { message: string }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
    getDaysUntilExpired(date: { getTime: () => any }) {
      if (this.bmcTime) {
        const validUntilMs = date.getTime();
        const currentBmcTimeMs = this.bmcTime.getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        return Math.round((validUntilMs - currentBmcTimeMs) / oneDayInMs);
      }
      return new Date();
    },
    getIconStatus(date: string) {
      const daysUntilExpired = this.getDaysUntilExpired(date);
      if (daysUntilExpired < 1) {
        return 'danger';
      } else if (daysUntilExpired < 31) {
        return 'warning';
      }
    },
  },
};
</script>
