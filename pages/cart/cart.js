import {
    Cart
} from 'cart-model.js'

const cart = new Cart();

Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    onLoad: function(options) {

    },

    onHide: function() {
        cart.execSetStorageSync(this.data.cartData);
    },

    onShow: function() {
        const cartData = cart.getCartDataFromLocal();
        // const countsInfo = cart.getCartTotalCounts(true);
        const cal = this._calcTotalAccountAndCounts(cartData);
        this.setData({
            selectedCounts: cal.selectedCounts,
            selectedTypeCounts: cal.selectedTypeCounts,
            account: cal.account,
            cartData
        });
    },

    /* 修改单个商品的选中状态 */
    toggleSelect: function(event) {
        const status = cart.getDataSet(event, 'status');
        const index = cart.getDataSet(event, 'index');
        this.data.cartData[index].selectStatus = !status;
        this._resetCartData();
    },

    /* 修改全选状态 */
    toggleSelectAll: function(event) {
        const status = cart.getDataSet(event, 'status') === 'true';
        const data = this.data.cartData;
        const len = data.length;
        for (let i = 0; i < len; i++) {
            data[i].selectStatus = !status;
        }
        this._resetCartData();
        this.setData({
            cartData: data
        });
    },

    /* 修改商品件数 */
    changeCounts: function(event) {
        const id = cart.getDataSet(event, 'id');
        const type = cart.getDataSet(event, 'type');
        const index = cart.getDataSet(event, 'index');
        let counts = 1;
        if (type === 'add') {
            cart.addCounts(id);
        } else {
            counts = -1;
            cart.cutCounts(id);
        }
        this.data.cartData[index].counts += counts;
        this._resetCartData();
    },

    // 删除某一项商品
    delete: function(event) {
        const id = cart.getDataSet(event, 'id');
        const index = cart.getDataSet(event, 'index');
        // UI删除
        this.data.cartData.splice(index, 1);
        this._resetCartData(); // 重置全选数量和金额
        // 缓存删除
        cart.delete(id)
    },

    /*更新购物车商品数据*/
    _resetCartData: function() {
        const newData = this._calcTotalAccountAndCounts(this.data.cartData); /*重新计算总金额和商品总数*/
        this.setData({
            account: newData.account,
            selectedCounts: newData.selectedCounts,
            selectedTypeCounts: newData.selectedTypeCounts,
            cartData: this.data.cartData
        });
    },

    /* 计算被选中的商品总金额 
			account: 被选中的商品总金额
            selectedCounts: 被选中商品的总件数
            selectedTypeCounts: 被选中商品的种类数
	*/
    _calcTotalAccountAndCounts: function(data) {
        const len = data.length;
        let account = 0,
            selectedCounts = 0,
            selectedTypeCounts = 0,
            multiple = 100;
        for (let i = 0; i < len; i++) {
            //避免 0.05 + 0.01 = 0.060 000 000 000 000 005 的问题，乘以 100 *100
            if (data[i].selectStatus) {
                account += data[i].counts * multiple * Number(data[i].price) * multiple;
                selectedCounts += data[i].counts;
                selectedTypeCounts++;
            }
        }
        return {
            selectedCounts,
            selectedTypeCounts,
            account: account / (multiple * multiple)
        }
    },

    /*根据商品id得到 商品所在下标*/
    _getProductIndexById: function(id) {
        var data = this.data.cartData,
            len = data.length;
        for (let i = 0; i < len; i++) {
            if (data[i].id == id) {
                return i;
            }
        }
    },

	submitOrder: function (event) {
		wx.navigateTo({
			url: '../order/order?account=' + this.data.account + '&from=cart',
		})
	},

	onProductsItemTap: function (event) {
		const id = cart.getDataSet(event, 'id')
		wx.navigateTo({
			url: '../product/product?id=' + id,
		})
	},

	// 获取滚动条当前位置
	onPageScroll: function (e) {
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
	goTop: function (e) {  // 一键回到顶部
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
})