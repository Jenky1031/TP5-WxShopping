import {
    Token
} from './utils/token.js'
App({
    /* 声明周期函数: 初始化完成时 */
    onLaunch: function() {
        // 实例化Token类
        const token = new Token();
        // 验证token有无过期
        token.verify();
		// 当token失效时, 再次携带code码到服务器生成token
    },
    globalData: {
        userInfo: null
    }
})