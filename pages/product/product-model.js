import {
    Base
} from '../../utils/Base.js'

class Product extends Base {
    getDetailInfo(id, callback) {
        const params = {
            url: '/product/' + id,
            sCallback: function(data) {
                callback && callback(data)
            }
        }
        this.request(params)
    }
}

export {
    Product
}