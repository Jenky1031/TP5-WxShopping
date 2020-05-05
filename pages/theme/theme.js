import {
    Theme
} from './theme-model.js'

const theme = new Theme()

Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        const id = options.id
        const name = options.name
        this.setData({
            id,
            name
        })
        this._loadData()
    },

    onReady: function() {
        wx.setNavigationBarTitle({
            title: this.data.name
        })
    },

    _loadData() {
        theme.getProductsData(this.data.id, (data) => {
            this.setData({
                'themeInfo': data
            })
        })
    },

	onProductsItemTap: function (event) {
		const id = theme.getDataSet(event, 'id')
		wx.navigateTo({
			url: '../product/product?id=' + id,
		})
	},

})