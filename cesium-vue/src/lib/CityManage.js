/**
 * City management - filters and scales cities to flight bounds
 */
export class CityManage {
  constructor(citys, flyDatas) {
    this._scale_fly = this._citysScaleLines(flyDatas)
    this._scale_citys(citys)
  }

  _citysScaleLines(flyDatas) {
    const result = {
      longitude_min: flyDatas[0][0].longitude,
      longitude_max: flyDatas[0][0].longitude,
      latitude_min: flyDatas[0][0].latitude,
      latitude_max: flyDatas[0][0].latitude
    }
    for (let i = 0; i < flyDatas.length; i++) {
      for (let j = 0; j < flyDatas[i].length; j++) {
        const p = flyDatas[i][j]
        if (result.longitude_min > p.longitude) result.longitude_min = p.longitude
        if (result.longitude_max < p.longitude) result.longitude_max = p.longitude
        if (result.latitude_min > p.latitude) result.latitude_min = p.latitude
        if (result.latitude_max < p.latitude) result.latitude_max = p.latitude
      }
    }
    return result
  }

  _scale_citys(citys) {
    this._result = []
    for (let i = 0; i < citys.length; i++) {
      const c = citys[i]
      const lng = Number(c.longitude)
      const lat = Number(c.latitude)
      if (
        lng > this._scale_fly.longitude_min &&
        lng < this._scale_fly.longitude_max &&
        lat > this._scale_fly.latitude_min &&
        lat < this._scale_fly.latitude_max
      ) {
        this._result.push(c)
      }
    }
  }

  getCitysToShow() {
    return this._result
  }
}
