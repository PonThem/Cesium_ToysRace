/**
 * Cesium-related utility functions
 */

export function timeToGregorianDate(time) {
  // time format: "2020-03-09T23:10:00Z"
  const result = {}
  const splitTimeByDateAndTime = time.split('T')
  result.year = Number(splitTimeByDateAndTime[0].split('-')[0].slice(2))
  result.month = Number(splitTimeByDateAndTime[0].split('-')[1])
  result.day = Number(splitTimeByDateAndTime[0].split('-')[2])
  result.hour = Number(splitTimeByDateAndTime[1].split(':')[0])
  result.minute = Number(splitTimeByDateAndTime[1].split(':')[1])
  result.second = Number(splitTimeByDateAndTime[1].split(':')[2].split('Z')[0])
  return result
}

export function modelSizeSetByFileSize(size) {
  if (size === 0) return 0
  return (4 / size) * 2000.0
}

export function flightDataSingleNearPoints(flightData) {
  for (let i = 0; i < flightData.length; ) {
    if (flightData[i].distance < 1000) {
      flightData.splice(i, 1)
    } else {
      i++
    }
  }
  return flightData
}
