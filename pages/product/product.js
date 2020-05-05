import { Product } from "./product-model.js";
import { Cart } from "../cart/cart-model.js";

const product = new Product();
const cart = new Cart();

Page({
	data: {
		id: 0,
		product: "",
		countsArray: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		// picker选择器初始值
		index: 0,
		productCount: 1,
		currentTabsIndex: 0,
		hiddenSmallImg: true,
	},

	onLoad: function (options) {
		const id = options.id;
		this.setData({
			id,
		});
		this._loadData();
	},

	_loadData: function () {
		product.getDetailInfo(this.data.id, (data) => {
			this.setData({
				/* 获取购物车商品总件数 cartTotalCounts */
				cartTotalCounts: cart.getCartTotalCounts(),
				/* 获取商品所有详情 */
				product: data,
			});
		});
	},

	/* 获取选择的商品件数 productCount */
	bindPickerChange: function (event) {
		const index = event.detail.value;
		const selectedCount = this.data.countsArray[index];
		this.setData({
			productCount: selectedCount,
		});
	},

	/* 点击tab栏, 获取当前点击的tab下标  currentTabsIndex */
	onTabsItemTap: function (event) {
		const index = product.getDataSet(event, "index");
		this.setData({
			currentTabsIndex: index,
		});
	},

	/*点击加入购物车, 添加到购物车*/
	onAddingToCartTap: function (events) {
		//防止快速点击
		if (this.data.isFly) {
			return;
		}
		this.setData({
			cartTotalCounts: cart.getCartTotalCounts(),
		});
		this._flyToCartEffect(events);
		this.addToCart();
	},

	/*将商品数据添加到内存中*/
	addToCart: function () {
		// 获取当前商品的数据
		let temObj = {};
		const keys = ["id", "name", "main_img_url", "price"];
		// 遍历product,  获取keys对应值
		for (let key in this.data.product) {
			if (keys.indexOf(key) >= 0) {
				temObj[key] = this.data.product[key];
			}
		}

		// 加入到购物车
		cart.add(temObj, this.data.productCount);
	},

	/*加入购物车动效*/
	_flyToCartEffect: function (events) {
		//获得当前点击的位置，距离可视区域左上角
		var touches = events.touches[0];
		var diff = {
				x: "25px",
				y: 25 - touches.clientY + "px",
			},
			style =
				"display: block;-webkit-transform:translate(" +
				diff.x +
				"," +
				diff.y +
				") rotate(350deg) scale(0)"; //移动距离
		this.setData({
			isFly: true,
			translateStyle: style,
		});
		var that = this;
		setTimeout(() => {
			that.setData({
				isFly: false,
				translateStyle: "-webkit-transform: none;", //恢复到最初状态
				isShake: true,
			});
			setTimeout(() => {
				var counts = that.data.cartTotalCounts + that.data.productCount;
				that.setData({
					isShake: false,
					cartTotalCounts: counts,
				});
			}, 200);
		}, 1000);
	},

	onCartTap: function (event) {
		wx.switchTab({
			url: "/pages/cart/cart",
		});
	},

	// 获取滚动条当前位置
	onPageScroll: function (e) {
		// console.log(e)
		if (e.scrollTop > 100) {
			this.setData({
				floorstatus: true,
			});
		} else {
			this.setData({
				floorstatus: false,
			});
		}
	},

	//回到顶部
	goTop: function (e) {
		// 一键回到顶部
		if (wx.pageScrollTo) {
			wx.pageScrollTo({
				scrollTop: 0,
			});
		} else {
			wx.showModal({
				title: "提示",
				content:
					"当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。",
			});
		}
	},
});
