import api from '@/store/api';
//接口定义
interface MultimachineState {
  multimachineValue: any;
}
//Vuex模块定义
const MultimachineStore = {
  //使这个模块成为命名空间模块
  //这样它的所有 getter、action 和 mutation 都会自动根据模块名进行注册。
  namespaced: true,
  //定义模块初始状态，multimachineValue 被初始化为一个空对象，使用as断言，确保其状态符合接口
  state: {
    multimachineValue: {},
  } as MultimachineState,
  getters: {
    //从状态中获取multimachineValue的值
    MultimachineValue: (state: MultimachineState) => state.multimachineValue,
  },
  //用于设置 multimachineValue 的值
  mutations: {
    setMultimachineValue: (
      //接收两个参数，分别是state和MutimachineState
      state: MultimachineState,
      MultimachineValue: any
    ) => {
      //将当前状态下的value值修改为传入的value值
      state.multimachineValue = MultimachineValue;
    },
  },
  actions: {
    //从服务器获取机箱管理页面的信息
    getMultimachineValue({ commit }: any) {
      return api
        .get('/redfish/vi/Multimachine')
        .then((response) => {
          //成功响应后,提交mutation的setMultimachineValue方法—修改当前的状态值
          commit('setMultimachineValue', response.data);
        })
        .catch((error) => console.log(error))
        .finally();
    },
  },
};
export default MultimachineStore;
