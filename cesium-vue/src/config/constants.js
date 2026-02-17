/**
 * Demo constants - 3D models, colors, view config
 */
export const CESIUM_ION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNzAyMWZhNS02MTk3LTRjYjYtOGMwYi1kOGEzYzg5ZmMxMjgiLCJpZCI6Nzg0MDUsImlhdCI6MTY0MjU3NzYyM30.ir47ZDuE5O8TYRJmEUeUgtHohabYGEUbO7HCJe8qjrI'

export const THREE_D_MODELS = [
  { id: 854046, size: 128 },
  { id: 853973, size: 50 },
  { id: 853981, size: 16 },
  { id: 780866, size: 4 },
  { id: 768016, size: 128 },
  { id: 900733, size: 32 },
  { id: 900750, size: 512 },
  { id: 900774, size: 1 },
  { id: 900783, size: 512 },
  { id: 900795, size: 32 }
]

export const VIEW_FROM_BY_RELIVE = {
  from_back: [2080 * 3, 1715 / 2, 7790 * 4],
  from_head: [-2080 * 3, -1715 / 2, 7790 * 4]
}

export function getColorPathAlpha(Cesium) {
  return [
    Cesium.Color.fromAlpha(Cesium.Color.RED, 0.5),
    Cesium.Color.fromAlpha(Cesium.Color.ORANGE, 0.5),
    Cesium.Color.fromAlpha(Cesium.Color.YELLOW, 0.5),
    Cesium.Color.fromAlpha(Cesium.Color.YELLOWGREEN, 0.5),
    Cesium.Color.fromAlpha(Cesium.Color.GREEN, 0.5),
    Cesium.Color.fromAlpha(Cesium.Color.BLUE, 0.5),
    Cesium.Color.fromAlpha(Cesium.Color.PURPLE, 0.5),
    Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.5),
    Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.5),
    Cesium.Color.fromAlpha(Cesium.Color.BROWN, 0.5)
  ]
}
