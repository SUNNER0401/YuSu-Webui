export const searchFilter = null;

const SearchFilterMixin = {
  methods: {
    onChangeSearchInput(searchValue: any) {
      this.searchFilter = searchValue;
    },
    onClearSearchInput() {
      this.searchFilter = null;
    },
  },
};

export default SearchFilterMixin;
