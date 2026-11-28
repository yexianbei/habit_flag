/*
 * @description: 
 * @LastEditTime: 2024-11-28 22:12:50
 */
import { createStore, createLogger } from 'vuex'

export const store = createStore({
  state() {
    return {
      flagList: [],
      deleteflagList:[],
      stat: '0',
      imghtml: '',
      tokencache:'',
      updateflagList: [],
      // 签名层提升为全局状态：不挂在 draw 页内，避免安卓 overflow/fixed 裁剪
      signVisible: false,
      signMainColor: '#ff5f47',
      signReady: false,
      signFinishName: '',
      signFinishSeq: 0,
    }
  },
  getters: {
    imghtml: (state: any) => {//通过方法访问
      return state.imghtml
    },
  },
  mutations: {
    SETCHOOSELIST(state: any, list: object[]) {
      state.flagList = list
    },
    DELETELIST(state: any, list: object[]) {
      state.deleteflagList = list
    },
    UPDATELIST(state: any, list: object[]) {
      state.updateflagList = list
    },
    SETSTAT(state: any, val: object[]) {
      state.stat = val
    },
    SETIMG(state: any, val: any) {
      state.imghtml = val
    },
    SETTOKEN(state: any, val: any) {
      state.tokencache = val
    },
    OPEN_SIGN(state: any, payload: { mainColor?: string }) {
      state.signMainColor = payload?.mainColor || '#ff5f47'
      state.signReady = false
      state.signVisible = true
    },
    CLOSE_SIGN(state: any) {
      state.signVisible = false
    },
    SET_SIGN_READY(state: any, ready: boolean) {
      state.signReady = !!ready
    },
    FINISH_SIGN(state: any, name: string) {
      state.signFinishName = name || ''
      state.signFinishSeq = state.signFinishSeq + 1
      state.signVisible = false
    },
  },
  actions: {
    ACTIONCHOOSELIST(
      { commit },
      list: object[]
    ) {
      commit('SETCHOOSELIST', list)
    },
    ACTIONDELETELIST(
      { commit },
      list: object[]
    ) {
      commit('DELETELIST', list)
    },
    ACTIONUPDATELIST(
      { commit },
      list: object[]
    ) {
      commit('UPDATELIST', list)
    },
    ACTIONSETSTAT(
      { commit },
      val: number
    ) {
      commit('SETSTAT', val)
    },
    ACTIONSETIMG(
      { commit },
      img: any
    ) {
      commit('SETIMG', img)
    },
    ACTIONSETTOKEN(
      { commit },
      value: any
    ) {
      commit('SETTOKEN', value)
    },
    ACTION_OPEN_SIGN({ commit }, payload: { mainColor?: string }) {
      commit('OPEN_SIGN', payload || {})
    },
    ACTION_CLOSE_SIGN({ commit }) {
      commit('CLOSE_SIGN')
    },
    ACTION_SET_SIGN_READY({ commit }, ready: boolean) {
      commit('SET_SIGN_READY', ready)
    },
    ACTION_FINISH_SIGN({ commit }, name: string) {
      commit('FINISH_SIGN', name)
    },
  }
})

export function useStore() {
  return store
}