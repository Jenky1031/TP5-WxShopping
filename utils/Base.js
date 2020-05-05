import * as Config from './Config.js'
import {
    Token
} from './token.js'

class Base {
    constructor() {
        this.baseRequestUrl = Config.restUrl;
        this.onPay = Config.onPay;
    }

    /* noRefetch为true时, 不进行未授权重试机制 */
    request(params, noRefetch) {
        const url = this.baseRequestUrl + params.url
        if (!params.type) {
            params.type = 'GET'
        }
        // console.log(params.data)
        wx.request({
            url: url,
            data: params.data,
            header: {
                'content-type': 'application/json',
                'token': wx.getStorageSync('token')
            },
            method: params.type,
            success: (res) => {
                // 获取服务器返回的状态码, 查看是否调用成功
                const code = res.statusCode.toString();
                // 获取状态码的第一个字符
                const startChar = code.charAt(0);
                // 如果状态码的是以2开头, 此次服务器调用成功, 则将获取的数据从成功的回调函数中返回
                if (startChar === '2') {
                    params.sCallback && params.sCallback(res.data)
                } else {
                    // AOP
                    // 如果状态码不是以2开头, 则调用失败的回调函数返回错误信息
                    if (code === '401') {
                        // 如果状态码是401, 代表token失效或没有, 
                        //应重新向服务器请求token令牌, 并重新发送http请求---重新授权
                        if (!noRefetch) {
                            this._refetch(params);
                        }
                    }
                    // 当不再执行重发时, 再返回错误信息
                    if (noRefetch) {
                        params.eCallback && params.eCallback(res.data)
                    }
                }

            },
            // 根本没调用到服务器时触发fail, 如网络中断
            fail: function(res) {
                console.log('无法发送http请求,请检查网络等');
            }
        })
    }

    _refetch(params) {
        // 调用Token类的重新从服务器获取token令牌
        const token = new Token();
        token.getTokenFromServer((token) => {
            // 回调函数获取到token后, 调用http请求
            // 将noRefetch设置为true, 不再重发http请求
            this.request(params, true);
        });
    }

    // 获得元素上绑定的值
    getDataSet(event, key) {
        return event.currentTarget.dataset[key]
    }
}

export {
    Base
}