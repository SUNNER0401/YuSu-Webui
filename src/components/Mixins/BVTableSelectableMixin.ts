export const selectedRows = [];
export const tableHeaderCheckboxModel = false;
export const tableHeaderCheckboxIndeterminate = false;

const BVTableSelectableMixin = {
  methods: {
    clearSelectedRows(tableRef: { clearSelected: () => void }) {
      if (tableRef) tableRef.clearSelected();
    },
    toggleSelectRow(
      tableRef: {
        isRowSelected: (arg0: any) => any;
        unselectRow: (arg0: any) => any;
        selectRow: (arg0: any) => any;
      },
      rowIndex: undefined
    ) {
      if (tableRef && rowIndex !== undefined) {
        tableRef.isRowSelected(rowIndex)
          ? tableRef.unselectRow(rowIndex)
          : tableRef.selectRow(rowIndex);
      }
    },
    onRowSelected(selectedRows: string | any[], totalRowsCount: undefined) {
      if (selectedRows && totalRowsCount !== undefined) {
        this.selectedRows = selectedRows;
        if (selectedRows.length === 0) {
          this.tableHeaderCheckboxIndeterminate = false;
          this.tableHeaderCheckboxModel = false;
        } else if (selectedRows.length === totalRowsCount) {
          this.tableHeaderCheckboxIndeterminate = false;
          this.tableHeaderCheckboxModel = true;
        } else {
          this.tableHeaderCheckboxIndeterminate = true;
          this.tableHeaderCheckboxModel = true;
        }
      }
    },
    onChangeHeaderCheckbox(tableRef: {
      selectAllRows: () => void;
      clearSelected: () => void;
    }) {
      if (tableRef) {
        if (this.tableHeaderCheckboxModel) tableRef.selectAllRows();
        else tableRef.clearSelected();
      }
    },
  },
};

export default BVTableSelectableMixin;
