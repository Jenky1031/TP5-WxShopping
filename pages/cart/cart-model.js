import {
    Base
} from "../../utils/Base";

/* 购物车存储在缓存 */
class Cart extends Base {
    constructor() {
        super();
        this._storageKeyName = "cart";
    }

    /*
     * 加入到购物车
     * 如果之前没有这样的商品，则直接添加一条新的记录， 数量为 counts
     * 如果有，则只将相应数量 + counts
     * @params:
     * item - {obj} 商品对象,
     * counts - {int} 商品数目,
     * */
    add(item, counts) {
        // 获取缓存购物车数据
        let cartData = this.getCartDataFromLocal();
        // 购物车中是否有该商品
        let isHasInfo = this._isHasThatOne(item.id, cartData);
        if (isHasInfo.index == -1) {
            item.counts = counts;
            item.selectStatus = true; // 添加商品到购物车默认为选中状态
            cartData.push(item); // 添加到购物车列表
        } else {
            cartData[isHasInfo.index].counts += counts;
        }
        // 更新购物车缓存
        wx.setStorageSync(this._storageKeyName, cartData);
    }

	/*本地缓存 保存／更新*/
	execSetStorageSync(data) {
		wx.setStorageSync(this._storageKeyName, data);
	};

    /*
     * 从本地缓存中获取购物车
     * param
     * flag - {bool} 是否过滤掉不下单的商品
     */
    getCartDataFromLocal(flag) {
        let res = wx.getStorageSync(this._storageKeyName);
        if (!res) {
            res = [];
        }
        //在下单的时候过滤不下单的商品，
        if (flag) {
            let newRes = [];
            for (let i = 0; i < res.length; i++) {
                if (res[i].selectStatus) {
                    newRes.push(res[i]);
                }
            }
            res = newRes;
        }

        return res;
    }

    /* 
    	从缓存中读取购物车中商品总数量
		flag为true时, 考虑商品选择状态
     */
    getCartTotalCounts(flag) {
        const data = this.getCartDataFromLocal();
        let counts = 0;
        for (let i = 0; i < data.length; i++) {
            if (flag) {
                if (data[i].selectStatus) {
                    counts += data[i].counts
                }
            } else {
                counts += data[i].counts
            }

        }
        return counts;
    }

    /*购物车中是否已经存在该商品*/
    _isHasThatOne(id, arr) {
        let item;
        let result = {
            index: -1
        };
        for (let i = 0; i < arr.length; i++) {
            item = arr[i];
            if (item.id == id) {
                result = {
                    index: i,
                    data: item,
                };
                break;
            }
        }
        return result;
    }

    /*
     * 修改商品数目
     * params:
     * id - {int} 商品id
     * counts -{int} 数目
     * */
    _changeCounts(id, counts) {
        const cartData = this.getCartDataFromLocal(),
            hasInfo = this._isHasThatOne(id, cartData);
        if (hasInfo.index != -1) {
            // if (hasInfo.data.counts >= 1) {
			// 	console.log(1)
                cartData[hasInfo.index].counts += counts;
            // }
        }
		wx.setStorageSync(this._storageKeyName, cartData); //更新本地缓存
    }

    /*
     * 增加商品数目
     * */
    addCounts(id) {
        this._changeCounts(id, 1);
    }

    /*
     * 购物车减
     * */
    cutCounts(id) {
        this._changeCounts(id, -1);
    }

	/*
    * 删除某些商品
    */
	delete(ids) {
		if (!(ids instanceof Array)) {
			ids = [ids];
		}
		var cartData = this.getCartDataFromLocal();
		for (let i = 0; i < ids.length; i++) {
			var hasInfo = this._isHasThatOne(ids[i], cartData);
			if (hasInfo.index != -1) {
				cartData.splice(hasInfo.index, 1);  //删除数组某一项
			}
		}
		wx.setStorageSync(this._storageKeyName, cartData); 
	}
}

export {
    Cart
}