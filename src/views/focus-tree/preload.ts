import { loadImgReady } from '@/common/utils'

const treeImageModules = import.meta.glob('@/assets/images/focus-tree/*.png') as Record<
  string,
  () => Promise<{ default: string } | string>
>

let preloadPromise: Promise<unknown> | null = null

/** 进入种树流程后预加载树图；只执行一次，失败不抛错 */
export function preloadFocusTreeImages(): Promise<unknown> {
  if (preloadPromise) return preloadPromise
  preloadPromise = Promise.all(
    Object.values(treeImageModules).map(async (loader) => {
      const mod = await loader()
      return typeof mod === 'string' ? mod : (mod as { default: string }).default
    })
  )
    .then((urls) => Promise.all(loadImgReady(urls.filter(Boolean) as string[])))
    .catch((error) => {
      console.error('种树图片预加载失败，但不影响页面使用:', error)
    })
  return preloadPromise
}
