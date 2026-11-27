/*
 * @description:
 * @LastEditTime: 2021-12-30 23:11:46
 */

/**
 * @description:
 * @param {*}
 * @return {*}
 */
export const queryColorIndex = (val: number) => {
  if (val < 25) {
    return 0
  } else if (val >= 25 && val < 50) {
    return 1
  } else if (val >= 50 && val < 75) {
    return 2
  } else {
    return 3
  }
}


//加载图片
export const loadImgReady = (imagesArr: any[]) => {
  let promiseImage = [],
    imgs: any[] = [],
    total = imagesArr.length
  const IMAGE_LOAD_TIMEOUT = 10000 // 10秒超时
  
  for (let i = 0; i < total; i++) {
    promiseImage[i] = new Promise((resolve, reject) => {
      imgs[i] = new Image()
      let timeoutId: any = null
      let isResolved = false
      
      // 超时处理
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          console.error(`图片加载超时: ${imagesArr[i]}`)
          // 即使超时也resolve，避免阻塞页面加载
          resolve(imgs[i])
        }
      }, IMAGE_LOAD_TIMEOUT)
      
      // 成功加载
      imgs[i].onload = function () {
        if (!isResolved) {
          isResolved = true
          if (timeoutId) clearTimeout(timeoutId)
          resolve(imgs[i])
        }
      }
      
      // 加载失败处理
      imgs[i].onerror = function (error: any) {
        if (!isResolved) {
          isResolved = true
          if (timeoutId) clearTimeout(timeoutId)
          console.error(`图片加载失败: ${imagesArr[i]}`, error)
          // 即使失败也resolve，避免阻塞页面加载
          resolve(imgs[i])
        }
      }
      
      // 开始加载
      imgs[i].src = imagesArr[i]
    })
  }
  return promiseImage
}


const ua = typeof window === 'object' ? window.navigator.userAgent : '';

let _isIOS = -1;
let _isAndroid = -1;

export const isIOS = () => {
  if (_isIOS === -1) {
    _isIOS = /iPhone|iPod|iPad/i.test(ua) ? 1 : 0;
  }
  return _isIOS === 1;
}

export const isAndroid = () => {
  if (_isAndroid === -1) {
    _isAndroid = /Android/i.test(ua) ? 1 : 0;
  }
  return _isAndroid === 1;
}