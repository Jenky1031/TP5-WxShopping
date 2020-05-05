// 引用使用es6的module引入和定义
// 全局变量以g_开头
// 私有函数以_开头

import * as Config from 'Config.js';

class Token {
    constructor() {
        this.verifyUrl = Config.restUrl + '/token/verify';
        this.tokenUrl = Config.restUrl + '/token/user';
    }

    /* 检测现存的令牌是否有效 */
    verify() {
        // 从缓存中获取令牌
        const token = wx.getStorageSync('token');
        if (!token) {
            // 如果缓存中没有令牌, 则到服务器获取令牌
            this.getTokenFromServer();
        } else {
            // 如果令牌存在, 则到服务器中检测令牌有无失效
            this._verifyFromServer(token);
        }
    }

    /* 携带令牌去服务器校验令牌 */
	_verifyFromServer(token) {
        wx.request({
            url: this.verifyUrl,
            method: 'POST',
            data: {
                token: token
            },
            success: (res) => {
                // valid 布尔值 true表示令牌未失效
                const valid = res.data.isValid;
                if (!valid) {
                    // 令牌失效, 则重新获取
                    this.getTokenFromServer();
                }
            }
        })
    }

    /* 从服务器获取token令牌 */
    getTokenFromServer(callBack) {
        // 调用微信登录接口 获取登录code码
        wx.login({
            success: (res) => {
                // 调用成功返回的数据res中含有code码
                // 调用服务器获取token的接口
                wx.request({
                    url: this.tokenUrl,
                    method: 'POST',
                    // POST请求, 将数据放在data对象中
                    data: {
                        code: res.code
                    },
                    // 成功调用服务器获取token接口后, 
                    success: (res) => {
                        // 将获取的token存在客户端缓存中
                        wx.setStorageSync('token', res.data.token);
                        // 执行回调函数, 将token返回
                        callBack && callBack(res.data.token);
                    }
                })
            }
        })
    }
}

export {
    Token
};