import {
    My
} from './my-model.js'

import {
    Order
} from '../order/order-model.js'

import {
    Address
} from '../../utils/address.js'

import * as Config from '../../utils/Config.js'

const my = new My();
const address = new Address();
const order = new Order();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageIndex: 1,
        orderArr: [],
        isLoadedAll: false,
        openSrc: '/imgs/icon/open.png',
        closeSrc: '/imgs/icon/close.png',
        showTip: true,
        mockPaySwitch: false,
        paySuccess: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this._loadData();
        this._getAddressInfo();
    },

    onShow: function() {
        const newOrderFlag = order.hasNewOrder();
        if (newOrderFlag) {
            this.refresh();
            order.execSetStorageSync(false);
        }
    },

    refresh: function() {
        this.data.orderArr = [];
        this._getOrders(() => {
            this.data.isLoadedAll = false;
            this.data.pageIndex = 1;
        });
    },

    _loadData: function() {
        var that = this;
        my.getUserInfo((data) => {
            that.setData({
                showAuth: !data.auth,
                userInfo: data.userInfo
            })
        });

        this._getOrders();
        order.execSetStorageSync(false); //更新标志位
    },

    /**
     * 获取用户信息按钮回调事件
     */
    getUserInfo(event) {
        const {
            nickName,
            avatarUrl
        } = event.detail.userInfo
        this.setData({
            showAuth: false,
            userInfo: {
                nickName,
                avatarUrl
            }
        })
    },

    /*从服务器获取订单列表信息*/
    _getOrders: function(callback) {
        if (!this.data.showAuth) {
            var that = this;
            order.getOrders(this.data.pageIndex, (res) => {
                var data = res.data;
                if (data.length > 0) {
                    this.data.orderArr = this.data.orderArr.concat(data);
                    that.setData({
                        orderArr: this.data.orderArr
                    });
                } else {
                    this.data.isLoadedAll = true;
                    this.data.pageIndex = 1;
                }
                callback && callback();
            });
        }
    },

    onReachBottom: function() {
        if (!this.data.isLoadedAll) {
            this.data.pageIndex++
                this._getOrders();
        }
    },

    /**地址信息**/
    _getAddressInfo: function() {
        var that = this;
        address.getAddress((addressInfo) => {
            that._bindAddressInfo(addressInfo);
        });
    },

    /*绑定地址信息*/
    _bindAddressInfo: function(addressInfo) {
        this.setData({
            addressInfo: addressInfo
        });
    },

    /*显示订单的具体信息*/
    showOrderDetailInfo: function(event) {
        var id = order.getDataSet(event, 'id');
        wx.navigateTo({
            url: '../order/order?from=order&id=' + id
        });
    },

    /*未支付订单再次支付*/
    rePay: function(event) {
        var id = order.getDataSet(event, 'id'),
            index = order.getDataSet(event, 'index');

        //online 上线实例，屏蔽支付功能
        if (Config.onPay) {
            this._execPay(id, index);
        } else {
            if (this.data.showTip) {
                this.showTips('支付提示', '本产品仅用于演示，支付系统已屏蔽');
            } else {
                const flag = this.data.paySuccess;
                if (flag) {
                    const params = {
                        url: '/order/changeStatus/' + id,
                        sCallback: (res) => {
                            // console.log(res)
                        }
                    };
                    order.request(params);
                    // 模拟支付成功后, 修改订单状态为status=2
                    // /order/changeStatus/:id
                    this.data.orderArr[index].status = 2;
                    this.setData({
                        orderArr: this.data.orderArr
                    });
                }
                wx.navigateTo({
                    url: '../pay-result/pay-result?id=' + id + '&flag=' + flag + '&from=order'
                });
                return;
            }
        }
    },

    /*支付*/
    _execPay: function(id, index) {
        var that = this;
        order.execPay(id, (statusCode) => {
            if (statusCode > 0) {
                var flag = statusCode == 2;

                //更新订单显示状态
                if (flag) {
                    that.data.orderArr[index].status = 2;
                    that.setData({
                        orderArr: that.data.orderArr
                    });
                }

                //跳转到 成功页面
                wx.navigateTo({
                    url: '../pay-result/pay-result?id=' + id + '&flag=' + flag + '&from=my'
                });
            } else {
                that.showTips('支付失败', '商品已下架或库存不足');
            }
        });
    },

    /*
     * 提示窗口
     * params:
     * title - {string}标题
     * content - {string}内容
     * flag - {bool}是否跳转到 "我的页面"
     */
    showTips: function(title, content) {
        wx.showModal({
            title: title,
            content: content,
            showCancel: false,
            success: function(res) {

            }
        });
    },

    /*修改或者添加地址信息*/
    editAddress: function() {
        var that = this;
        wx.chooseAddress({
            success: function(res) {
                var addressInfo = {
                    name: res.userName,
                    mobile: res.telNumber,
                    totalDetail: address.setAddressInfo(res)
                };
                if (res.telNumber) {
                    that._bindAddressInfo(addressInfo);
                    //保存地址
                    address.submitAddress(res, (flag) => {
                        if (!flag) {
                            that.showTips('操作提示', '地址信息更新失败！');
                        }
                    });
                }
                //模拟器上使用
                else {
                    that.showTips('操作提示', '地址信息更新失败,手机号码信息为空！');
                }
            }
        })
    },

    // 获取滚动条当前位置
    onPageScroll: function(e) {
        if (e.scrollTop > 100) {
            this.setData({
                floorstatus: true
            });
        } else {
            this.setData({
                floorstatus: false
            });
        }
    },

    //回到顶部
    goTop: function(e) { // 一键回到顶部
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                scrollTop: 0
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }
    },

    // changeModel: function(e) {
    //     this.setData({
    //         payButton: !this.data.payButton,
    //         showTip: !this.data.showTip,
    //         mockPay: !this.data.mockPay
    //     })
    // },

    isMockPay: function(e) {
        this.setData({
            mockPaySwitch: !this.data.mockPaySwitch,
            showTip: !this.data.showTip,
        })
    },

    isPaySuccess: function() {
        this.setData({
            paySuccess: !this.data.paySuccess
        })
    }
})