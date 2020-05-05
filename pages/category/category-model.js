import {
    Base
} from '../../utils/Base.js'

class Category extends Base {
    /* 获取所有分类 */
    getCategoryType(callback) {
        const params = {
            url: '/category/all',
            sCallback: function(data) {
                callback && callback(data)
            }
        }
        this.request(params)
    }

    /*获得某种分类的商品*/
    getProductsByCategory(id, callback) {
        var param = {
            url: '/product/by_category?id=' + id,
            sCallback: function(data) {
                callback && callback(data)
            }
        };
        this.request(param)
    }
}

export {
    Category
}