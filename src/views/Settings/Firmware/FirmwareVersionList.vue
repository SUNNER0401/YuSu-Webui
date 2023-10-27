<template>
  <b-card no-body>
    <el-table
      class="table-responsive table"
      header-row-class-name="thead-light"
      :data="versionList"
    >
      <el-table-column :label="$t('pageFirmware.table.name')" prop="name">
      </el-table-column>
      <el-table-column
        :label="$t('pageFirmware.table.currentVersion')"
        prop="version"
      >
      </el-table-column>
    </el-table>
  </b-card>
</template>

<script lang="ts">
import { Table, TableColumn } from 'element-ui';

export default {
  name: 'FirmwareVersionList',
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
  },
  computed: {
    bmcVersion() {
      return this.$store.getters['firmware/activeBmcFirmware']
        ? this.$store.state.firmware.bmcActiveFirmwareId
        : '--';
    },
    hostVersion() {
      return this.$store.getters['firmware/activeHostFirmware']
        ? this.$store.state.firmware.hostActiveFirmwareId
        : '--';
    },
    cpldVersion() {
      return this.$store.getters['firmware/activeCpldFirmware']
        ? this.$store.state.firmware.cpldActiveFirmwareId
        : '--';
    },
    versionList() {
      return [
        {
          name: 'BMC',
          version: this.bmcVersion,
        },
        {
          name: 'Bios',
          version: this.hostVersion,
        },
        {
          name: 'Cpld',
          version: this.cpldVersion,
        },
      ];
    },
  },
};
</script>

<style></style>
