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
    }
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
  }
})

export function useStore() {
  return store
}