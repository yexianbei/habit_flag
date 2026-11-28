import { post } from './http'
export const addFlag = (p:any) => post('/app/flag/addFlag', p)
export const selectFlagH5 = (p:any) => post('/app/flag/selectFlagH5', p)
