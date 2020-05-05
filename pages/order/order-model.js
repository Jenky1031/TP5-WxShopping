import {
    Base
} from '../../utils/Base.js'

class Order extends Base {
    constructor() {
        super();
        this._storageKeyName = 'newOrder';
    }

    /*下订单*/
    doOrder(param, callback) {
        var that = this;
        var allParams = {
            url: '/order',
            type: 'post',
            data: {
                products: param
            },
            sCallback: function(data) {
                // 如果服务器成功下订单, 
                that.execSetStorageSync(true); // 保存newOrder为true
                callback && callback(data);
            },
            eCallback: function() {}
        };
        this.request(allParams);
    }

    /*
     * 拉起微信支付
     * params:
     * norderNumber - {int} 订单id
     * return：
     * callback - {obj} 回调方法 ，返回参数 可能值 0:商品缺货等原因导致订单不能支付;  1: 支付失败或者支付取消； 2:支付成功；
     * */
    execPay(orderNumber, callback) {
        var allParams = {
            url: '/pay/pre_order',
            type: 'post',
            data: {
                id: orderNumber
            },
            sCallback: function(data) {
                // 从服务器中成功获取支付参数
                var timeStamp = data.timeStamp;
                if (timeStamp) { //服务器返回结果如果有时间戳, 代表可以支付
                    // 使用这些支付参数调用小程序支付API
                    wx.requestPayment({
                        'timeStamp': timeStamp.toString(),
                        'nonceStr': data.nonceStr,
                        'package': data.package,
                        'signType': data.signType,
                        'paySign': data.paySign,
                        success: function() {
                            callback && callback(2);
                        },
                        fail: function() {
                            callback && callback(1);
                        }
                    });
                } else {
                    // 没有时间戳, 可能是库存量不足了
                    callback && callback(0);
                }
            }
        };
        this.request(allParams);
    }

    /*从服务器中获得订单的具体内容*/
    getOrderInfoById(id, callback) {
        var that = this;
        var allParams = {
            url: '/order/' + id,
            sCallback: function(data) {
                callback && callback(data);
            },
            eCallback: function() {

            }
        };
        this.request(allParams);
    }

    /*获得所有订单,pageIndex 从1开始*/
    getOrders(pageIndex, callback) {
        var allParams = {
            url: '/order/by_user',
            data: {
                page: pageIndex
            },
            type: 'get',
            sCallback: function(data) {
                //1 未支付  2，已支付  3，已发货，4已支付，但库存不足
                callback && callback(data);
            }
        };
        this.request(allParams);
    }

    /*本地缓存 保存／更新*/
    execSetStorageSync(data) {
        wx.setStorageSync(this._storageKeyName, data);
    };

	/*是否有新的订单*/
	hasNewOrder() {
		var flag = wx.getStorageSync(this._storageKeyName);
		return flag == true;
	}
}

export {
    Order
};