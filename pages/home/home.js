// MVC的C
import {
    Home
} from './home-model.js'
const home = new Home()
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    onLoad: function() {
        this._loadData()
    },

    _loadData: function() {
        const id = 1
        home.getBannerData(id, (data) => {
            this.setData({
                'bannerArr': data
            })
        })
        home.getThemeData((data) => {
            this.setData({
                'themeArr': data
            })
        })
        home.getProductsData((data) => {
            this.setData({
                'productsArr': data
            })
        })
    },

    onProductsItemTap: function(event) {
        const id = home.getDataSet(event, 'id')
        wx.navigateTo({
            url: '../product/product?id=' + id,
        })
    },

    onThemesItemTap: function(event) {
        const id = home.getDataSet(event, 'id')
        const name = home.getDataSet(event, 'name')
        wx.navigateTo({
            url: '../theme/theme?id=' + id + '&name=' + name,
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