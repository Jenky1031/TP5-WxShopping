//MVC的M

import {
	Base
} from '../../utils/Base.js'

class Home extends Base {
    // constructor() {
    //     super()
    // }

    getBannerData(id, callback) {
        const params = {
            url: '/banner/' + id,
            sCallback: function(res) {
                callback && callback(res.items)
            }
        }
        this.request(params)
    }
    getThemeData(callback) {
        const params = {
            url: '/theme?ids=1,2,3',
            sCallback: function(data) {
                callback && callback(data)
            }
        }
        this.request(params)
    }
	getProductsData(callback) {
		const params = {
			url: '/product/recent?count=15',
			sCallback: function (data) {
				callback && callback(data)
			}
		}
		this.request(params)
	}
}

export {
    Home
}