import { ref, reactive, computed } from 'vue'
import { test_demo_data, test_demo_data_citys } from '@/data/demoData'
import { CityManage } from '@/lib/CityManage'
import { timeToGregorianDate, modelSizeSetByFileSize } from '@/utils/cesiumUtils'
import {
  THREE_D_MODELS,
  VIEW_FROM_BY_RELIVE,
  getColorPathAlpha
} from '@/config/constants'

const DEBUG = false
const log = (msg, ...args) => DEBUG && console.log('[useToyRace]', msg, ...args)

export function useToyRace() {
  const loading = ref(false)
  const error = ref(null)
  log('useToyRace() called')

  // Process demo data
  const demoData = []
  const demoFakeDataToys = []
  for (let i = 0; i < test_demo_data.length; i++) {
    demoData.push(test_demo_data[i])
    demoFakeDataToys.push({
      number: '100' + (i + 1).toString(),
      rank: (i + 1).toString()
    })
  }

  // Update speed to meter/minute
  for (let i = 0; i < demoData.length; i++) {
    for (let j = 0; j < demoData[i].length; j++) {
      demoData[i][j].speed = demoData[i][j].speed * 60
    }
  }

  const demoDataCitys = test_demo_data_citys

  let raceGoalMulti = new Map()

  // Reactive UI state
  const uiState = reactive({
    sortedRanks: [],
    currentToyNumber: '',
    toyInfosMap: new Map(),
    toysLeftDistance: new Map(),
    toysLeftDistanceRanks: [],
    toysLeftDistanceDashBoard: new Map(),
    chartToyData: [],
    chartCurrentIndex: 0,
    dashboardSpeed: 0,
    dashboardElevation: 0,
    dashboardFlyDistance: 0,
    dashboardLeftDistance: 0,
    pointInfo: '',
    map_toyNumber_ranksId: new Map()
  })

  let viewer = null
  let initInProgress = false
  let smallMapApi = null
  let toyModels = []
  let entityCollectionToTrack = new Map()
  let cityEntitys = []
  let timestampToyNumbers = new Map()
  let timestampPointEntitys = new Map()
  let mapPointIdPointEntity = new Map()
  let curPickedToyEntity = null
  let flightData = demoData

  async function loadModels() {
    log('loadModels() start')
    const Cesium = window.Cesium
    for (let i = 0; i < THREE_D_MODELS.length; i++) {
      try {
        const uri = await Cesium.IonResource.fromAssetId(THREE_D_MODELS[i].id)
        toyModels.push(uri)
        log(`loadModels() model ${i} loaded`, THREE_D_MODELS[i].id)
      } catch (e) {
        log('loadModels() ERROR', i, THREE_D_MODELS[i].id, e)
        throw e
      }
    }
    log('loadModels() done', toyModels.length)
  }

  function initToyRankState() {
    log('initToyRankState() start', {
      flightDataLength: flightData.length,
      raceGoalMultiSize: raceGoalMulti.size
    })
    const Cesium = window.Cesium
    for (let i = 0; i < flightData.length; i++) {
      const point = Cesium.Cartesian3.fromDegrees(
        flightData[i][0].longitude,
        flightData[i][0].latitude,
        flightData[i][0].elevation
      )
        uiState.toysLeftDistance.set(
        demoFakeDataToys[i].number,
        Cesium.Cartesian3.distance(raceGoalMulti.get(demoFakeDataToys[i].number), point)
      )
    }

    let leftDistances = []
    for (let i = 0; i < flightData.length; i++) {
      let d = 0
      for (let j = 0; j < flightData[i].length; j++) d += flightData[i][j].distance
      uiState.toysLeftDistanceDashBoard.set(demoFakeDataToys[i].number, {
        distance: 0,
        leftDistance: d
      })
    }

    uiState.toysLeftDistanceRanks = Array.from(uiState.toysLeftDistance.keys()).sort(
      (a, b) =>
        uiState.toysLeftDistance.get(a) - uiState.toysLeftDistance.get(b)
    )
    demoFakeDataToys.forEach((p, i) => {
      uiState.toyInfosMap.set(p.number, p.rank)
    })
    uiState.currentToyNumber = demoFakeDataToys[0].number
    updateSortedRanks()
    log('initToyRankState() done', {
      sortedRanks: uiState.sortedRanks?.length,
      dashBoardKeys: Array.from(uiState.toysLeftDistanceDashBoard.keys())
    })
  }

  function updateSortedRanks() {
    uiState.sortedRanks = uiState.toysLeftDistanceRanks.map((num) => ({
      number: num,
      position: uiState.toyInfosMap.get(num) || ''
    }))
  }

  function updateToysLeftDistance(toysPoint) {
    log('updateToysLeftDistance()', toysPoint?.length, toysPoint?.map((p) => p.number))
    const Cesium = window.Cesium
    for (const pp of toysPoint) {
      if (uiState.toysLeftDistance.has(pp.number)) {
        const goal = raceGoalMulti.get(pp.number)
        const carto = Cesium.Cartographic.fromCartesian(pp.point)
        const goalCarto = Cesium.Cartographic.fromCartesian(goal)
        const tmp = Cesium.Cartesian3.fromRadians(
          carto.longitude,
          carto.latitude,
          goalCarto.height
        )
        uiState.toysLeftDistance.set(
          pp.number,
          Cesium.Cartesian3.distance(goal, tmp)
        )
      }
      if (uiState.toysLeftDistanceDashBoard.has(pp.number)) {
        const v = uiState.toysLeftDistanceDashBoard.get(pp.number)
        v.distance += pp.distance
        v.leftDistance -= pp.distance
      }
    }

    uiState.toysLeftDistanceRanks = Array.from(uiState.toysLeftDistance.keys()).sort(
      (a, b) =>
        uiState.toysLeftDistance.get(a) - uiState.toysLeftDistance.get(b)
    )
    updateSortedRanks()

    if (smallMapApi) {
      for (const pp of toysPoint) {
        const carto = Cesium.Cartographic.fromCartesian(pp.point)
        const lat = Cesium.Math.toDegrees(carto.latitude)
        const lng = Cesium.Math.toDegrees(carto.longitude)
        smallMapApi.setCenter(lat, lng)
        smallMapApi.updatePoint(pp.number, lat, lng)
      }
    }
  }

  function addCityLabels(citys) {
    const Cesium = window.Cesium
    for (const c of citys) {
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          Number(c.longitude),
          Number(c.latitude)
        ),
        label: {
          text: c.county,
          font: '14px Helvetica',
          fillColor: Cesium.Color.WHITE,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 4.0e5, 0.0)
        }
      })
      cityEntitys.push(entity)
    }
  }

  function setupShowData(smallMapRef) {
    log('setupShowData() start', { hasSmallMapApi: !!smallMapRef })
    smallMapApi = smallMapRef
    const Cesium = window.Cesium
    const colorPathAlpha = getColorPathAlpha(Cesium)

    const cityManage = new CityManage(demoDataCitys, flightData)
    addCityLabels(cityManage.getCitysToShow())

    const timeStartG = timeToGregorianDate(flightData[0][0].time)
    const timeStart = Cesium.JulianDate.fromGregorianDate(
      new Cesium.GregorianDate(
        timeStartG.year,
        timeStartG.month,
        timeStartG.day,
        timeStartG.hour,
        timeStartG.minute,
        timeStartG.second,
        0,
        false
      )
    )
    const timeStopG = timeToGregorianDate(
      flightData[0][flightData[0].length - 1].time
    )
    const timeStop = Cesium.JulianDate.fromGregorianDate(
      new Cesium.GregorianDate(
        timeStopG.year,
        timeStopG.month,
        timeStopG.day,
        timeStopG.hour,
        timeStopG.minute,
        timeStopG.second,
        0,
        false
      )
    )

    viewer.clock.startTime = timeStart.clone()
    viewer.clock.stopTime = timeStop.clone()
    viewer.clock.currentTime = timeStart.clone()
    viewer.clock.multiplier = 100
    viewer.clock.shouldAnimate = false

    for (let i = 0; i < flightData.length; i++) {
      for (let j = 0; j < flightData[i].length; j++) {
        const dp = flightData[i][j]
        const timeG = timeToGregorianDate(dp.time)
        const time = Cesium.JulianDate.fromGregorianDate(
          new Cesium.GregorianDate(
            timeG.year,
            timeG.month,
            timeG.day,
            timeG.hour,
            timeG.minute,
            timeG.second,
            0,
            false
          )
        )

        if (!timestampToyNumbers.has(time)) {
          timestampToyNumbers.set(time, [])
        }
        timestampToyNumbers.get(time).push({
          number: demoFakeDataToys[i].number,
          point: Cesium.Cartesian3.fromDegrees(dp.longitude, dp.latitude, dp.elevation),
          distance: dp.distance
        })

        const pos = Cesium.Cartesian3.fromDegrees(
          dp.longitude,
          dp.latitude,
          dp.elevation
        )
        const pointEntity = viewer.entities.add({
          description: `公環號碼:${demoFakeDataToys[i].number}<br>坐標: (${dp.longitude}, ${dp.latitude}, ${dp.elevation})<br/>時間:${dp.time}<br/>速度:${dp.speed}<br/>方位角:${dp.heading}`,
          position: pos,
          point: {
            pixelSize: 10,
            color: Cesium.Color.WHITE,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e5, 0.0)
          },
          show: false
        })
        mapPointIdPointEntity.set(pointEntity.id, pointEntity)
        if (!timestampPointEntitys.has(time)) {
          timestampPointEntitys.set(time, [])
        }
        timestampPointEntitys.get(time).push(pointEntity)
      }
    }

    const toyInfosChartNumberIndex = new Map()

    viewer.clock.onTick.addEventListener(() => {
      for (const [ts, toysPoint] of timestampToyNumbers) {
        const diff = Cesium.JulianDate.compare(ts, viewer.clock.currentTime)
        if (diff > -10 && diff < 10) {
          updateToysLeftDistance(toysPoint)
          timestampToyNumbers.delete(ts)

          for (const pp of toysPoint) {
            const cur = toyInfosChartNumberIndex.get(pp.number) || 0
            const nextIdx = cur + 1
            toyInfosChartNumberIndex.set(pp.number, nextIdx)
            if (pp.number === uiState.currentToyNumber) {
              uiState.chartCurrentIndex = nextIdx
              const dash = uiState.toysLeftDistanceDashBoard.get(pp.number)
              const idx = demoFakeDataToys.findIndex((p) => p.number === pp.number)
              const ptData = idx >= 0 && flightData[idx][nextIdx] ? flightData[idx][nextIdx] : null
              if (dash) {
                uiState.dashboardSpeed = ptData?.speed ?? 0
                uiState.dashboardElevation = ptData?.elevation ?? 0
                uiState.dashboardFlyDistance = dash.distance
                uiState.dashboardLeftDistance = dash.leftDistance
                log('clock tick: dashboard update', {
                  toy: pp.number,
                  nextIdx,
                  speed: uiState.dashboardSpeed,
                  elevation: uiState.dashboardElevation,
                  flyDist: dash.distance,
                  leftDist: dash.leftDistance,
                  ptData
                })
              }
            }
          }

          const pointEntitys = timestampPointEntitys.get(ts)
          if (pointEntitys) {
            pointEntitys.forEach((e) => (e.show = true))
          }
        }
      }
    })

    viewer.clock.onStop.addEventListener(() => {
      viewer.flyTo(cityEntitys, { duration: 3 })
    })

    const timeStart2 = timeStart
    const timeStop2 = timeStop

    for (let i = 0; i < flightData.length; i++) {
      const positionProperty = new Cesium.SampledPositionProperty()
      for (let j = 0; j < flightData[i].length; j++) {
        const dp = flightData[i][j]
        const timeG = timeToGregorianDate(dp.time)
        const time = Cesium.JulianDate.fromGregorianDate(
          new Cesium.GregorianDate(
            timeG.year,
            timeG.month,
            timeG.day,
            timeG.hour,
            timeG.minute,
            timeG.second,
            0,
            false
          )
        )
        const pos = Cesium.Cartesian3.fromDegrees(
          dp.longitude,
          dp.latitude,
          dp.elevation
        )
        positionProperty.addSample(time, pos)
      }

      const modelInfo =
        i < THREE_D_MODELS.length
          ? THREE_D_MODELS[i]
          : THREE_D_MODELS[THREE_D_MODELS.length - 1]
      const uri = toyModels[i] || toyModels[toyModels.length - 1]
      const scale = modelSizeSetByFileSize(modelInfo.size)

      const airplaneEntity = viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({ start: timeStart2, stop: timeStop2 })
        ]),
        position: positionProperty,
        model: {
          uri,
          scale
        },
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        path: new Cesium.PathGraphics({
          width: 3,
          material: colorPathAlpha[i] || colorPathAlpha[0],
          leadTime: 1,
          trailTime: 100000
        }),
        viewFrom: new Cesium.Cartesian3(
          VIEW_FROM_BY_RELIVE.from_back[0],
          VIEW_FROM_BY_RELIVE.from_back[1],
          VIEW_FROM_BY_RELIVE.from_back[2]
        )
      })
      entityCollectionToTrack.set(demoFakeDataToys[i].number, airplaneEntity)
    }

    viewer.selectedEntity = entityCollectionToTrack.get(demoFakeDataToys[0].number)
    viewer.trackedEntity = entityCollectionToTrack.get(demoFakeDataToys[0].number)
    viewer.clock.shouldAnimate = true

    const firstToyData = flightData[0].map((p) => ({
      elevation: p.elevation,
      speed: p.speed
    }))
    uiState.chartToyData = firstToyData
    toyInfosChartNumberIndex.set(demoFakeDataToys[0].number, 0)

    const firstDash = uiState.toysLeftDistanceDashBoard.get(
      demoFakeDataToys[0].number
    )
    uiState.dashboardSpeed = firstToyData[0]?.speed || 0
    uiState.dashboardElevation = firstToyData[0]?.elevation || 0
    uiState.dashboardFlyDistance = firstDash?.distance || 0
    uiState.dashboardLeftDistance = firstDash?.leftDistance || 0
    log('setupShowData: initial dashboard', {
      speed: uiState.dashboardSpeed,
      elevation: uiState.dashboardElevation,
      flyDist: uiState.dashboardFlyDistance,
      leftDist: uiState.dashboardLeftDistance,
      firstDash
    })

    if (smallMapApi && smallMapApi.initToyPoints) {
      smallMapApi.initToyPoints(
        flightData,
        demoFakeDataToys,
        uiState.currentToyNumber
      )
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((click) => {
      const picked = viewer.scene.pick(click.position)
      log('map click', { picked: !!picked, hasId: picked?.id })
      if (!Cesium.defined(picked)) return

      const pickedEntity = picked.id
      const toyNum = Array.from(entityCollectionToTrack.entries()).find(
        ([, e]) => e === pickedEntity
      )?.[0]

      if (toyNum) {
        const tmpEntity = entityCollectionToTrack.get(toyNum)
        if (tmpEntity && tmpEntity.model) {
          const curScale = typeof tmpEntity.model.scale === 'object' ? tmpEntity.model.scale.getValue() : tmpEntity.model.scale
          tmpEntity.model.scale = curScale * 2
        }
        if (curPickedToyEntity && curPickedToyEntity.model) {
          const s = typeof curPickedToyEntity.model.scale === 'object' ? curPickedToyEntity.model.scale.getValue() : curPickedToyEntity.model.scale
          curPickedToyEntity.model.scale = s / 2
        }
        curPickedToyEntity = tmpEntity

        viewer.trackedEntity = tmpEntity
        smallMapApi?.changeToyColor(uiState.currentToyNumber, toyNum)
        uiState.currentToyNumber = toyNum

        const idx = demoFakeDataToys.findIndex((p) => p.number === toyNum)
        if (idx >= 0) {
          uiState.chartToyData = flightData[idx].map((p) => ({
            elevation: p.elevation,
            speed: p.speed
          }))
          uiState.chartCurrentIndex = toyInfosChartNumberIndex.get(toyNum) || 0
          const dash = uiState.toysLeftDistanceDashBoard.get(toyNum)
          if (dash) {
            uiState.dashboardFlyDistance = dash.distance
            uiState.dashboardLeftDistance = dash.leftDistance
          }
        }
      }

      const pointEntity = mapPointIdPointEntity.get(pickedEntity.id)
      if (pointEntity && pointEntity.description) {
        const desc = pointEntity.description
        uiState.pointInfo = typeof desc === 'string' ? desc : (desc.getValue ? desc.getValue() : String(desc))
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  const INIT_TIMEOUT_MS = 25000

  async function init(cesiumViewerRef, smallMapRef) {
    if (initInProgress) return
    initInProgress = true
    log('init() start', { hasViewer: !!cesiumViewerRef, hasSmallMap: !!smallMapRef })
    loading.value = true
    error.value = null
    const timeoutId = setTimeout(() => {
      if (loading.value) {
        loading.value = false
        error.value = 'Initialization timed out'
        console.error('[useToyRace] init timed out after', INIT_TIMEOUT_MS, 'ms')
      }
    }, INIT_TIMEOUT_MS)
    try {
      const Cesium = window.Cesium
      if (!Cesium) throw new Error('Cesium not loaded')
      raceGoalMulti = new Map()
      for (let i = 0; i < demoData.length && i < demoFakeDataToys.length; i++) {
        const last = demoData[i][demoData[i].length - 1]
        raceGoalMulti.set(
          demoFakeDataToys[i].number,
          Cesium.Cartesian3.fromDegrees(last.longitude, last.latitude, last.elevation)
        )
      }
      await loadModels()
      viewer = cesiumViewerRef
      if (!viewer) {
        throw new Error('Cesium viewer not ready')
      }
      initToyRankState()
      setupShowData(smallMapRef)
    } catch (e) {
      error.value = e.message
      log('init() ERROR', e.message, e)
      console.error('[useToyRace] init error:', e)
    } finally {
      clearTimeout(timeoutId)
      loading.value = false
      initInProgress = false
      log('init() done', { loading: loading.value, error: error.value })
    }
  }

  function onSelectToy(toyNumber) {
    log('onSelectToy()', toyNumber)
    const tmpEntity = entityCollectionToTrack.get(toyNumber)
    if (!tmpEntity) {
      log('onSelectToy() entity not found', toyNumber)
      return
    }

    if (tmpEntity.model) {
      tmpEntity.model.scale = tmpEntity.model.scale * 2
    }
    if (curPickedToyEntity?.model) {
      curPickedToyEntity.model.scale = curPickedToyEntity.model.scale / 2
    }
    curPickedToyEntity = tmpEntity

    viewer.trackedEntity = tmpEntity
    smallMapApi?.changeToyColor(uiState.currentToyNumber, toyNumber)
    uiState.currentToyNumber = toyNumber

    const idx = demoFakeDataToys.findIndex((p) => p.number === toyNumber)
    if (idx >= 0) {
      uiState.chartToyData = flightData[idx].map((p) => ({
        elevation: p.elevation,
        speed: p.speed
      }))
      uiState.chartCurrentIndex = 0
      const dash = uiState.toysLeftDistanceDashBoard.get(toyNumber)
      if (dash) {
        uiState.dashboardSpeed = flightData[idx][0]?.speed || 0
        uiState.dashboardElevation = flightData[idx][0]?.elevation || 0
        uiState.dashboardFlyDistance = dash.distance
        uiState.dashboardLeftDistance = dash.leftDistance
      }
    }
  }

  return {
    loading,
    error,
    uiState,
    init,
    onSelectToy,
    demoFakeDataToys,
    flightData
  }
}
