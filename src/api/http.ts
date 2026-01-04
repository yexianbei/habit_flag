import axios from 'axios'

axios.defaults.baseURL = 'https://www.xianbeikeji.com/daily'//线上
// axios.defaults.baseURL = 'http://47.106.159.139:18001/daily'//测试库
// axios.defaults.baseURL = 'http://192.168.43.22:18001/daily'//本地2
// axios.defaults.baseURL = 'http://192.168.3.20:18001/daily'//本地

axios.defaults.timeout = 20000 //设置延迟时间

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8;multipart/form-data'
    // 允许当前axios携带cookie
axios.defaults.withCredentials = true
    // 请求拦截器
axios.interceptors.request.use(
    (config:any) => {
        // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
        // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
        // const token = this.$store.state.Authorization
        // token && (config.headers.Authorization = token)
        // return config
        // if (localStorage.getItem('Authorization')) {
        //       config.headers.Authorization = localStorage.getItem('Authorization');
        //     }
        const token = localStorage.getItem('Authorization');
        config.headers.token = token;
        // 调试日志
        console.log('🔵 API请求拦截器:', {
            url: config.url,
            method: config.method,
            token: token || '(未找到token)',
            headers: config.headers
        });
        return config;
    },
    (error:any) => {
        return error
        // return Promise.error(error)
    })

// 响应拦截器
axios.interceptors.response.use(
    response => {
        // 调试日志
        console.log('🟢 API响应成功:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        if (response.status === 200) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(response)
        }
    },
    // 服务器状态码不是200的情况
    error => {
        // 调试日志
        console.error('🔴 API响应错误:', {
            url: error.config?.url,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            error: error
        });
        if (error.response && error.response.status) {
            switch (error.response.status) {
                // 401: 未登录
                // 未登录则跳转登录页面，并携带当前页面的路径
                // 在登录成功后返回当前页面，这一步需要在登录页操作。
                case 401:
                    // router.replace({
                    //   path: '/Login',
                    //   query: {
                    //     redirect: router.currentRoute.fullPath
                    //   }
                    // })
                    // login()
                    break;
                    // 403 token过期
                    // 登录过期对用户进行提示
                    // 清除本地token和清空vuex中token对象
                    // 跳转登录页面
                case 403:
                    // Toast({
                    //         message: '登录过期，请重新登录',
                    //         duration: 1000,
                    //         forbidClick: true
                    //     })
                    //     // 清除token
                    // localStorage.removeItem('Authorization')
                    // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
                    // setTimeout(() => {
                    //   router.replace({
                    //     path: '/Login',
                    //     query: {
                    //       redirect: router.currentRoute.fullPath
                    //     }
                    //   })
                    // }, 1000)
                    // login()
                    break;
                    // 404请求不存在
                case 404:
                    // Toast({
                    //     message: '网络请求不存在',
                    //     duration: 1500,
                    //     forbidClick: true
                    // })
                    break;
                    // 其他错误，直接抛出错误提示
                default:
                    // Toast({
                    //     message: error.response.data.message,
                    //     duration: 1500,
                    //     forbidClick: true
                    // })
            }
            return Promise.reject(error.response)
        } else {
            // 没有response对象的情况（网络错误等）
            console.error('🔴 网络错误，无响应:', error);
            return Promise.reject(error)
        }
    }
)

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function get(url:any, params:any) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params: params
        }).then(res => {
            resolve(res.data)
        }).catch(err => {
            reject(err.data)
        })
    })
}
/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function post(url:any, params:any) {
    return new Promise((resolve, reject) => {
        axios.post(url, params)
            .then(res => {
                resolve(res.data)
            })
            .catch(err => {
                reject(err.data)
            })
    })
}