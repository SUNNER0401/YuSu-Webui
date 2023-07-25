import { Store as s } from '../store/index';

export { ReturnGetters } from '../store/index';
export type Store = s;
export interface ActionContext<AN, C, S, G> {
  dispatch: (actionsName: AN, ...payload: any) => any; // 全局的 dispatch, 有 ts 提示支持
  commit: (mutationName: C, ...payload: any) => any; // 全局的 commit, 有 ts 提示支持
  state: S;
  getters: G;
}
