import { Base } from "./Base.js";

import * as Config from "./Config.js";

class Address extends Base {
	/*从服务器中获得我自己的收货地址*/
	getAddress(callback) {
		var param = {
			url: "/address",
			sCallback: (res) => {
				if (res) {
					res.totalDetail = this.setAddressInfo(res);
					callback && callback(res);
				}
			},
		};
		this.request(param);
	}
	/* 设置地址信息 */
	setAddressInfo(res) {
		// res的来源: 小程序/数据库
		const province = res.provinceName || res.province,
			city = res.cityName || res.city,
			county = res.countyName || res.county,
			detail = res.detailInfo || res.detail;
		let totalDetail = city + county + detail;
		// 拼接时考虑直辖市
		if (!this.isCenterCity(province)) {
			totalDetail = province + totalDetail;
		}
		return totalDetail;
	}

	/*是否为直辖市*/
	isCenterCity(name) {
		const centerCitys = ["北京市", "天津市", "上海市", "重庆市"];
		const flag = centerCitys.indexOf(name) >= 0;
		return flag;
	}

	/*保存或更新地址*/
	submitAddress(data, callback) {
		data = this._setUpAddress(data);
		var param = {
			url: "/address",
			type: "post",
			data: data,
			sCallback: function (res) {
				callback && callback(true, res);
			},
			eCallback(res) {
				callback && callback(false, res);
			},
		};
		this.request(param);
	}

	/*保存地址*/
	_setUpAddress(res, callback) {
		var formData = {
			name: res.userName,
			province: res.provinceName,
			city: res.cityName,
			county: res.countyName,
			mobile: res.telNumber,
			detail: res.detailInfo,
		};
		return formData;
	}
}

export { Address };
