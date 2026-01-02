import {get, post } from './http'
export const api1 = (p1:any) => get('http://v.juhe.cn/toutiao/index?type=&page=&page_size=&key=24a7d6a478f8bf2c367c749e598d2cc2', p1)
export const api2 = (p2:any) => post('/lanlema/user/toLogin', p2)
export const addFlag = (p:any) => post('/app/flag/addFlag', p)
export const selectFlagH5 = (p:any) => post('/app/flag/selectFlagH5', p)