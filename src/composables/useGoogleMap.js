import { onMounted, onUnmounted, ref, watch } from 'vue'

const GOOGLE_MAPS_SCRIPT_ATTR = 'data-google-maps-loader'
const DEFAULT_CENTER = { lat: 25.038, lng: 121.5645 }
const DEFAULT_ZOOM = 12
const ACTIVE_SITE_ZOOM = 14

let googleMapsLoaderPromise = null

function getMapsApiKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyACfOxn7DJ9gdcb-XBx-R2X5pbHWeskzUg'
}

export function loadGoogleMaps() {
  if (typeof window !== 'undefined' && window.google?.maps) {
    return Promise.resolve(window.google)
  }

  if (googleMapsLoaderPromise) {
    return googleMapsLoaderPromise
  }

  googleMapsLoaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[${GOOGLE_MAPS_SCRIPT_ATTR}="true"]`)

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Google Maps API 載入失敗')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${getMapsApiKey()}`
    script.async = true
    script.defer = true
    script.setAttribute(GOOGLE_MAPS_SCRIPT_ATTR, 'true')
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error('Google Maps API 載入失敗'))
    document.head.appendChild(script)
  })

  return googleMapsLoaderPromise
}

function createLabelContent(documentRef, { siteName, assessedCountLabel, count, isActive }) {
  const wrapper = documentRef.createElement('div')
  wrapper.style.textAlign = 'center'

  const title = documentRef.createElement('strong')
  title.style.color = '#2563eb'
  title.textContent = siteName

  const lineBreak = documentRef.createElement('br')

  const countLine = documentRef.createElement('span')
  countLine.append(documentRef.createTextNode(`${assessedCountLabel} `))

  const countValue = documentRef.createElement('span')
  countValue.style.color = 'red'
  countValue.textContent = String(count)
  countLine.append(countValue)

  wrapper.append(title, lineBreak, countLine)

  return wrapper
}

function createLabelOverlayClass(google) {
  return class LabelOverlay extends google.maps.OverlayView {
    constructor(position, contentNode, map, isActive) {
      super()
      this.position = position
      this.contentNode = contentNode
      this.isActive = isActive
      this.div = null
      this.setMap(map)
    }

    onAdd() {
      this.div = document.createElement('div')
      this.div.style.position = 'absolute'
      this.div.style.background = 'rgba(255,255,255,0.95)'
      this.div.style.padding = '6px 10px'
      this.div.style.border = this.isActive ? '2px solid #2563eb' : '1px solid #333'
      this.div.style.borderRadius = '6px'
      this.div.style.fontSize = '13px'
      this.div.style.fontWeight = 'bold'
      this.div.style.boxShadow = this.isActive
        ? '0 0 0 3px rgba(37,99,235,0.25)'
        : '2px 2px 6px rgba(0,0,0,0.2)'
      this.div.style.whiteSpace = 'nowrap'
      this.div.style.zIndex = this.isActive ? '1100' : '1000'
      this.div.appendChild(this.contentNode)

      const panes = this.getPanes()
      panes.overlayLayer.appendChild(this.div)
    }

    draw() {
      const overlayProjection = this.getProjection()
      const pos = overlayProjection.fromLatLngToDivPixel(this.position)
      if (this.div && pos) {
        this.div.style.left = `${pos.x}px`
        this.div.style.top = `${pos.y - 45}px`
      }
    }

    onRemove() {
      if (this.div?.parentNode) {
        this.div.parentNode.removeChild(this.div)
      }
      this.div = null
    }
  }
}

/**
 * Google Maps lifecycle for dashboard location map.
 */
export function useGoogleMap({
  mapContainerRef,
  locationMap,
  locationMapReady,
  regionId,
  isOverviewMode,
  locale,
  translateSiteName,
  assessedCountLabel,
}) {
  const mapInstance = ref(null)
  const mapElements = ref([])
  const infoWindow = ref(null)
  const isReady = ref(false)
  const loadError = ref(null)

  function clearMapElements() {
    mapElements.value.forEach((item) => {
      if (item?.setMap) {
        item.setMap(null)
      }
    })
    mapElements.value = []

    if (infoWindow.value) {
      infoWindow.value.close()
    }
  }

  function disposeMap() {
    clearMapElements()
    mapInstance.value = null
    infoWindow.value = null
    isReady.value = false
  }

  function buildInfoContent(siteName, count) {
    return createLabelContent(document, {
      siteName,
      assessedCountLabel: assessedCountLabel.value,
      count,
      isActive: false,
    })
  }

  async function renderMap() {
    if (!mapContainerRef.value || !locationMapReady.value) {
      return
    }

    const locData = locationMap.value
    if (!locData || Object.keys(locData).length === 0) {
      clearMapElements()
      return
    }

    try {
      const google = await loadGoogleMaps()
      clearMapElements()

      if (!mapInstance.value) {
        mapInstance.value = new google.maps.Map(mapContainerRef.value, {
          zoom: DEFAULT_ZOOM,
          center: DEFAULT_CENTER,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })
      }

      if (!infoWindow.value) {
        infoWindow.value = new google.maps.InfoWindow()
      }

      const LabelOverlay = createLabelOverlayClass(google)
      const bounds = new google.maps.LatLngBounds()
      const entries = Object.entries(locData)

      entries.forEach(([code, loc]) => {
        const position = new google.maps.LatLng(loc.lat, loc.lng)
        const isActive = !isOverviewMode.value && regionId.value === code
        const siteName = translateSiteName(code, loc.name)
        const labelNode = createLabelContent(document, {
          siteName,
          assessedCountLabel: assessedCountLabel.value,
          count: loc.Count,
          isActive,
        })

        const marker = new google.maps.Marker({
          position,
          map: mapInstance.value,
          title: siteName,
          zIndex: isActive ? 1000 : 1,
          animation: isActive ? google.maps.Animation.BOUNCE : null,
        })

        marker.addListener('click', () => {
          infoWindow.value.setContent(buildInfoContent(siteName, loc.Count))
          infoWindow.value.open({
            anchor: marker,
            map: mapInstance.value,
          })
        })

        const label = new LabelOverlay(position, labelNode, mapInstance.value, isActive)

        mapElements.value.push(marker, label)
        bounds.extend(position)
      })

      if (isOverviewMode.value) {
        if (entries.length > 0) {
          mapInstance.value.fitBounds(bounds)
        }
      } else if (locData[regionId.value]) {
        const active = locData[regionId.value]
        mapInstance.value.setCenter({ lat: active.lat, lng: active.lng })
        mapInstance.value.setZoom(ACTIVE_SITE_ZOOM)
      } else if (entries.length > 0) {
        mapInstance.value.fitBounds(bounds)
      }

      isReady.value = true
      loadError.value = null
    } catch (error) {
      loadError.value = error
      console.error('[Map] init failed:', error)
    }
  }

  watch(
    [locationMapReady, locationMap, regionId, isOverviewMode, assessedCountLabel, locale],
    () => {
      void renderMap()
    },
    { deep: true },
  )

  watch(mapContainerRef, (element) => {
    if (element) {
      void renderMap()
    }
  })

  onMounted(() => {
    void renderMap()
  })

  onUnmounted(() => {
    disposeMap()
  })

  return {
    isReady,
    loadError,
    renderMap,
    disposeMap,
  }
}
