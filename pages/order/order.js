import {
    Order
} from "../order/order-model.js";
import {
    Cart
} from "../cart/cart-model.js";
import {
    Address
} from "../../utils/address.js";
import * as Config from '../../utils/Config.js'

var order = new Order();
var cart = new Cart();
var address = new Address();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        id: null,
        openSrc: "/imgs/icon/open.png",
        closeSrc: "/imgs/icon/close.png",
        mockPaySwitch: false,
        paySuccess: false,
        showTip: true,
        // mockPay: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const {
            from,
            id
        } = options;
        this.setData({
            from,
            id
        })
        if (from === "cart") {
            this._fromCart(options.account);
        } else if (from === "order") {
            this._fromOrder(options.id);
        }
    },

    /* 支付后, 刷新订单页面 */
    onShow: function() {
        if (this.data.id) {
            this._fromOrder(this.data.id);
        }
    },

    /* 从购物车点击去付款后, 跳到订单详情 */
    _fromCart: function(account) {
        // 从缓存中获取选中商品列表
        const productsArr = cart.getCartDataFromLocal(true);
        this.setData({
            productsArr,
            account,
            orderStatus: 0,
        });

        /* 显示收货地址 */
        address.getAddress((res) => {
            this._bindAddressInfo(res);
        });
    },

    /* 下单后返回订单详情 或 从我的订单中访问订单详情 */
    _fromOrder: function(id) {
        // id  订单号
        if (id) {
            //下单后，支付成功或者失败后，点左上角返回时能够更新订单状态 所以放在onshow中
            // 从数据库中加载订单信息
            order.getOrderInfoById(id, (data) => {
                this.setData({
                    orderStatus: data.status,
                    productsArr: data.snap_items,
                    account: data.total_price,
                    basicInfo: {
                        orderTime: data.create_time,
                        orderNo: data.order_no,
                    },
                });

                // 快照地址
                var addressInfo = data.snap_address;
                addressInfo.totalDetail = address.setAddressInfo(addressInfo);
                this._bindAddressInfo(addressInfo);
            });
        }
    },

    /* 编辑地址 */
    editAddress: function(event) {
        // 调用用户编辑收货地址原生界面, 编辑完成后返回用户选择的地址
        wx.chooseAddress({
            success: (res) => {
                const addressInfo = {
                    name: res.userName,
                    mobile: res.telNumber,
                    totalDetail: address.setAddressInfo(res),
                };
                // 绑定地址信息到本页面的data
                this._bindAddressInfo(addressInfo);

                address.submitAddress(res, (flag) => {
                    if (!flag) {
                        this.showTips("操作提示", "地址信息更新失败!");
                    }
                });
            },
        });
    },

    /*
     * 提示窗口
     * params:
     * title - {string}标题
     * content - {string}内容
     * flag - {bool}是否跳转到 "我的页面"
     */
    showTips: function(title, content, flag) {
        wx.showModal({
            title: title,
            content: content,
            showCancel: false,
            success: function(res) {
                if (flag) {
                    wx.switchTab({
                        url: "/pages/my/my",
                    });
                }
            },
        });
    },

    /*绑定地址信息*/
    _bindAddressInfo: function(addressInfo) {
        this.setData({
            addressInfo: addressInfo,
        });
    },

    /*下单和付款 事件*/
    pay: function() {
        if (!this.data.addressInfo) {
            this.showTips("下单提示", "请填写您的收货地址");
            return;
        }
        if (this.data.orderStatus == 0) {
            this._firstTimePay();
        } else {
            this._oneMoresTimePay();
        }
    },

    /*第一次支付  检测库存*/
    _firstTimePay: function() {
        // 准备订单参数
        var orderInfo = [],
            productInfo = this.data.productsArr,
            order = new Order();
        for (let i = 0; i < productInfo.length; i++) {
            orderInfo.push({
                product_id: productInfo[i].id,
                count: productInfo[i].counts,
            });
        }

        var that = this;
        //支付分两步，第一步是生成订单号，然后根据订单号支付
        order.doOrder(orderInfo, (data) => {
            //订单生成成功
            if (data.pass) {
                //更新订单状态
                var id = data.order_id;
                that.setData({
                    id,
                });
                // that.data.fromCartFlag = false;

                //开始支付
                that._execPay(id);
            } else {
                that._orderFail(data); // 下单失败, 可能是库存量检测失败了
            }
        });
    },

    /*
     *开始支付
     * params:
     * id - {int}订单id
     */
    _execPay: function(id) {
        if (!Config.onPay) {
            this.deleteProducts(); //将已经下单的商品从购物车删除
            if (this.data.showTip) {
                // 屏蔽支付，提示
                this.showTips(
                    "支付提示",
                    "本产品仅用于演示，支付系统已屏蔽",
                    true
                );
            } else {
                // 模拟支付成功后, 修改订单状态为status=2
                // /order/changeStatus/:id
                const flag = this.data.paySuccess;
                if (flag) {
                    const params = {
                        url: "/order/changeStatus/" + this.data.id,
                        sCallback: (res) => {
                            // console.log(res)
                        },
                    };
                    order.request(params);
                }
                if (this.data.orderStatus === 1) {
                    order.execSetStorageSync(true)
                }
                wx.navigateTo({
                    url: "../pay-result/pay-result?id=" +
                        id +
                        "&flag=" +
                        flag +
                        "&from=" + this.data.from,
                });
            }
            return;
        }
        var that = this;
        order.execPay(id, (statusCode) => {
            if (statusCode != 0) {
                that.deleteProducts(); //将已经下单的商品从购物车删除   当状态为0时，表示

                var flag = statusCode == 2;
                wx.navigateTo({
                    url: "../pay-result/pay-result?id=" +
                        id +
                        "&flag=" +
                        flag +
                        "&from=" + this.data.from
                });
            }
        });
    },

    /*
     *下单失败
     * params:
     * data - {obj} 订单结果信息
     * */
    _orderFail: function(data) {
        var nameArr = [],
            name = "",
            str = "",
            pArr = data.pStatusArray;
        for (let i = 0; i < pArr.length; i++) {
            if (!pArr[i].haveStock) {
                name = pArr[i].name;
                if (name.length > 15) {
                    name = name.substr(0, 12) + "...";
                }
                nameArr.push(name);
                if (nameArr.length >= 2) {
                    break;
                }
            }
        }
        str += nameArr.join("、");
        if (nameArr.length > 2) {
            str += " 等";
        }
        str += " 缺货";
        wx.showModal({
            title: "下单失败",
            content: str,
            showCancel: false,
            success: function(res) {},
        });
    },

    /* 再次次支付*/
    _oneMoresTimePay: function() {
        this._execPay(this.data.id);
    },

    //将已经下单的商品从购物车删除
    // this.data.productsArr 下单的商品
    deleteProducts: function() {
        var ids = [],
            arr = this.data.productsArr;
        for (let i = 0; i < arr.length; i++) {
            ids.push(arr[i].id);
        }
        cart.delete(ids);
    },

    onProductsItemTap: function(event) {
        const id = order.getDataSet(event, "id");
        wx.navigateTo({
            url: "../product/product?id=" + id,
        });
    },

    /* 是否模拟支付,默认支付失败 */
    isMockPay: function(e) {
        this.setData({
            mockPaySwitch: !this.data.mockPaySwitch,
            showTip: !this.data.showTip,
        });
    },

    /* 是否模拟支付成功 */
    isPaySuccess: function() {
        this.setData({
            paySuccess: !this.data.paySuccess,
            // mockPay: this.data.mockPay
        });
    },
});