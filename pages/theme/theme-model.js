import {
    Base
} from '../../utils/Base.js'

class Theme extends Base {
    // constructor() {
    //     super()
    // }

    /* 获取主题下的商品列表 */
    /* 对应主题的id号 */
    getProductsData(id, callback) {
        const params = {
            url: '/theme/' + id,
			sCallback: function (data) {
				callback && callback(data)
			}
        }
        this.request(params)
    }
}

export {
    Theme
}