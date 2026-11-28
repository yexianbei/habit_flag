/*
 * @description: 专注森林云端同步（阿里云 FC）
 * 入口：https://agent.xianbeikeji.com/forest
 */
import type { ForestState } from '../types/focusTree'

const DEFAULT_BASE = 'https://agent.xianbeikeji.com/forest'

export type CloudForestPayload = {
  state: ForestState | null
  updatedAt: string | null
  exists?: boolean
  saved?: boolean
  conflict?: boolean
}

function cloudBase(): string {
  if (typeof window !== 'undefined') {
    const fromWin = window.__HABIT_CLIENT__?.forestCloudUrl
    if (typeof fromWin === 'string' && fromWin) return fromWin.replace(/\/+$/, '')
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash || ''
    const hashQuery = hash.includes('?') ? hash.split('?')[1] : ''
    const fromQuery =
      params.get('forestCloud') ||
      new URLSearchParams(hashQuery).get('forestCloud')
    if (fromQuery) return fromQuery.replace(/\/+$/, '')
  }
  return DEFAULT_BASE
}

function readToken(): string {
  if (typeof window === 'undefined') return ''
  const fromStore = localStorage.getItem('Authorization') || ''
  if (fromStore) return fromStore
  const params = new URLSearchParams(window.location.search)
  const hash = window.location.hash || ''
  const hashQuery = hash.includes('?') ? hash.split('?')[1] : ''
  return (
    params.get('token') ||
    new URLSearchParams(hashQuery).get('token') ||
    ''
  )
}

function readDailyUserId(): string {
  if (typeof window === 'undefined') return ''
  const fromWin = window.__HABIT_CLIENT__?.dailyUserId
  if (typeof fromWin === 'string' && fromWin) return fromWin
  try {
    const stored = localStorage.getItem('habit_daily_user_id')
    if (stored) return stored
  } catch {
    /* ignore */
  }
  const params = new URLSearchParams(window.location.search)
  const hash = window.location.hash || ''
  const hashQuery = hash.includes('?') ? hash.split('?')[1] : ''
  return (
    params.get('dailyUserId') ||
    new URLSearchParams(hashQuery).get('dailyUserId') ||
    ''
  )
}

/** 缓存 App 传入的用户 id，便于后续上传 */
export function rememberCloudIdentity(dailyUserId?: string | null, token?: string | null) {
  if (typeof window === 'undefined') return
  if (dailyUserId) {
    try {
      localStorage.setItem('habit_daily_user_id', String(dailyUserId))
    } catch {
      /* ignore */
    }
    window.__HABIT_CLIENT__ = window.__HABIT_CLIENT__ || {}
    window.__HABIT_CLIENT__.dailyUserId = String(dailyUserId)
  }
  if (token) {
    localStorage.setItem('Authorization', String(token))
  }
}

export function canSyncForestCloud(): boolean {
  return !!(readDailyUserId() && readToken())
}

async function postForest<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T | null> {
  const uid = readDailyUserId()
  const token = readToken()
  if (!uid || !token) return null

  const url = `${cloudBase()}${path.startsWith('/') ? path : `/${path}`}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token,
      },
      body: JSON.stringify({
        dailyUserId: uid,
        ...body,
      }),
    })
    if (!res.ok) {
      console.warn('专注森林云端请求失败', res.status, path)
      return null
    }
    const json = await res.json()
    if (!json || json.code !== 0) {
      console.warn('专注森林云端业务失败', json?.msg || json, path)
      return null
    }
    return (json.data || null) as T
  } catch (e) {
    console.warn('专注森林云端网络错误', e)
    return null
  }
}

export function fetchForestCloud(): Promise<CloudForestPayload | null> {
  return postForest<CloudForestPayload>('/get', {})
}

export function saveForestCloud(
  state: ForestState
): Promise<CloudForestPayload | null> {
  return postForest<CloudForestPayload>('/save', {
    state,
    updatedAt: state.updatedAt,
  })
}
