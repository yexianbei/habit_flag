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
  for (let i = 0; i < total; i++) {
    promiseImage[i] = new Promise(resolve => {
      imgs[i] = new Image()
      imgs[i].src = imagesArr[i]
      imgs[i].onload = function () {
        resolve(imgs[i])
      }
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