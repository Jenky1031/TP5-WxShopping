import {
    Category
} from './category-model.js'
const category = new Category()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        transClassArr: ['tanslate0', 'tanslate1', 'tanslate2', 'tanslate3', 'tanslate4', 'tanslate5'],
        selectedIndex: 0,
        loadedData: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this._loadData()
    },

    onReady: function() {},

    _loadData: function() {
        category.getCategoryType((categoryData) => {
            this.setData({
                categoryTypeArr: categoryData
            })
            category.getProductsByCategory(categoryData[0].id, (data) => {
                const dataObj = {
                    products: data,
                    topImgUrl: categoryData[0].img.url,
                    title: categoryData[0].name
                }
                this.setData({
                    categoryProducts: dataObj
                })
                this.data.loadedData[0] = dataObj
            })
        })
    },

    /* 判断当前分类商品数据是否已被加载 */
    isLoadedData: function(index) {
        if (this.data.loadedData[index]) {
            return true;
        }
        return false
    },

    changeCategory: function(event) {
        console.log(event)
        const id = category.getDataSet(event, 'id')
        const index = category.getDataSet(event, 'index')
        if (!this.isLoadedData(index)) {
            category.getProductsByCategory(id, (data) => {
                const categoryData = this.data.categoryTypeArr
                const dataObj = {
                    products: data,
                    topImgUrl: categoryData[index].img.url,
                    title: categoryData[index].name
                }
                this.setData({
                    categoryProducts: dataObj,
                    selectedIndex: index,
                })
                this.data.loadedData[index] = dataObj
            })
        } else {
            this.setData({
                categoryProducts: this.data.loadedData[index],
                selectedIndex: index,
            })
        }
    },

    /* 跳转到商品详情页面 */
    onProductsItemTap: function(event) {
        const id = category.getDataSet(event, 'id')
        wx.navigateTo({
            url: '../product/product?id=' + id,
        })
    },
})