'use client';

import { useEffect, useMemo, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { WaterBody } from '@/types';

type MapSelectorProps = {
  waterBodies: WaterBody[];
  selectedId?: string;
  onSelect: (waterBodyId: string) => void;
  isSidebarOpen?: boolean;
};

const DEFAULT_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const PETROPAVLOVSK = {
  name: 'Петропавловск',
  lng: 69.143,
  lat: 54.8739,
};

export function MapSelector({
  waterBodies,
  selectedId,
  onSelect,
  isSidebarOpen,
}: MapSelectorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const isUnmountedRef = useRef(false);

  const validBodies = useMemo(() => {
    return waterBodies.filter(
      (item) => item.latitude != null && item.longitude != null,
    );
  }, [waterBodies]);

  const selectedBody = useMemo(() => {
    return validBodies.find((item) => item.id === selectedId) ?? null;
  }, [validBodies, selectedId]);

  const formatArea = (value?: number | null) => {
    if (value == null) {
      return 'Не указана';
    }

    return `${(value / 100).toLocaleString('ru-RU', {
      maximumFractionDigits: 2,
    })} км²`;
  };

  const formatDepth = (value?: number | null) => {
    if (value == null) {
      return 'Не указана';
    }

    return `${value} м`;
  };

  const isMapReady = (map: maplibregl.Map | null) => {
    if (!map) {
      return false;
    }

    if (isUnmountedRef.current) {
      return false;
    }

    return map.loaded() && map.isStyleLoaded();
  };

  const runWhenMapReady = (callback: (map: maplibregl.Map) => void) => {
    const map = mapRef.current;

    if (!map || isUnmountedRef.current) {
      return;
    }

    if (isMapReady(map)) {
      callback(map);
      return;
    }

    const handleIdle = () => {
      if (!isUnmountedRef.current && isMapReady(map)) {
        callback(map);
      }
      map.off('idle', handleIdle);
    };

    map.on('idle', handleIdle);
  };

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  };

  const closePopup = () => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  };

  const createPopupHtml = (lake: WaterBody) => {
    return `
      <div class="wb-mini-card">
        <div class="wb-mini-card__image-wrap">
          <img
            src="${lake.imageUrl || '/images/lakes/Blue-Lake-Clipart.webp'}"
            alt="${lake.name}"
            class="wb-mini-card__image"
          />
        </div>

        <div class="wb-mini-card__body">
          <h4 class="wb-mini-card__title">${lake.name}</h4>

          <div class="wb-mini-card__row">
            <span class="wb-mini-card__label">Район:</span>
            <span class="wb-mini-card__value">${lake.district || 'Не указан'}</span>
          </div>

          <div class="wb-mini-card__row">
            <span class="wb-mini-card__label">Площадь:</span>
            <span class="wb-mini-card__value">${formatArea(lake.passport?.area)}</span>
          </div>

          <div class="wb-mini-card__row">
            <span class="wb-mini-card__label">Глубина:</span>
            <span class="wb-mini-card__value">${formatDepth(lake.passport?.maxDepth)}</span>
          </div>

          <a class="wb-mini-card__button" href="/water-bodies/${lake.id}">
            Дашборд водоёма
          </a>
        </div>
      </div>
    `;
  };

  const createCityPopupHtml = () => {
    return `
      <div class="wb-mini-card wb-mini-card--city">
        <div class="wb-mini-card__body">
          <h4 class="wb-mini-card__title">${PETROPAVLOVSK.name}</h4>

          <div class="wb-mini-card__row">
            <span class="wb-mini-card__label">Координаты:</span>
            <span class="wb-mini-card__value">${PETROPAVLOVSK.lat}, ${PETROPAVLOVSK.lng}</span>
          </div>
        </div>
      </div>
    `;
  };

  const openLakePopup = (lake: WaterBody) => {
    if (lake.latitude == null || lake.longitude == null) {
      return;
    }

    runWhenMapReady((map) => {
      closePopup();

      const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
        offset: 22,
        className: 'wb-maplibre-popup',
      })
        .setLngLat([Number(lake.longitude), Number(lake.latitude)])
        .setHTML(createPopupHtml(lake))
        .addTo(map);

      popupRef.current = popup;
    });
  };

  const openCityPopup = () => {
    runWhenMapReady((map) => {
      closePopup();

      const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: false,
        offset: 22,
        className: 'wb-maplibre-popup',
      })
        .setLngLat([PETROPAVLOVSK.lng, PETROPAVLOVSK.lat])
        .setHTML(createCityPopupHtml())
        .addTo(map);

      popupRef.current = popup;
    });
  };

  const createLakeMarkerElement = (isSelected: boolean) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = isSelected
      ? 'wb-map-pin wb-map-pin--active'
      : 'wb-map-pin';
    el.setAttribute('aria-label', 'Маркер озера');
    return el;
  };

  const createCityMarkerElement = () => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'wb-city-pin';
    el.setAttribute('aria-label', 'Петропавловск');
    return el;
  };

  const syncMarkers = () => {
    runWhenMapReady((map) => {
      clearMarkers();

      const cityMarkerElement = createCityMarkerElement();

      cityMarkerElement.addEventListener('click', (event) => {
        event.stopPropagation();

        runWhenMapReady((readyMap) => {
          readyMap.flyTo({
            center: [PETROPAVLOVSK.lng, PETROPAVLOVSK.lat],
            zoom: 11,
            essential: true,
          });
        });

        openCityPopup();
      });

      const cityMarker = new maplibregl.Marker({
        element: cityMarkerElement,
      })
        .setLngLat([PETROPAVLOVSK.lng, PETROPAVLOVSK.lat])
        .addTo(map);

      markersRef.current.push(cityMarker);

      validBodies.forEach((lake) => {
        const el = createLakeMarkerElement(lake.id === selectedId);
        el.setAttribute('title', lake.name);

        el.addEventListener('click', (event) => {
          event.stopPropagation();
          onSelect(lake.id);
          openLakePopup(lake);
        });

        const marker = new maplibregl.Marker({
          element: el,
        })
          .setLngLat([Number(lake.longitude), Number(lake.latitude)])
          .addTo(map);

        markersRef.current.push(marker);
      });
    });
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    isUnmountedRef.current = false;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DEFAULT_STYLE,
      center: [PETROPAVLOVSK.lng, PETROPAVLOVSK.lat],
      zoom: 10,
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        visualizePitch: true,
      }),
      'top-right',
    );

    map.on('load', () => {
      runWhenMapReady((readyMap) => {
        readyMap.jumpTo({
          center: [PETROPAVLOVSK.lng, PETROPAVLOVSK.lat],
          zoom: 10,
        });

        syncMarkers();
      });
    });

    map.on('error', (event) => {
      console.error('MapLibre error:', event);
    });

    return () => {
      isUnmountedRef.current = true;
      closePopup();
      clearMarkers();

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    syncMarkers();
  }, [selectedId, validBodies]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      runWhenMapReady((map) => {
        map.resize();
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      runWhenMapReady((map) => {
        map.resize();
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!selectedBody) {
        runWhenMapReady((map) => {
          map.resize();
          map.flyTo({
            center: [PETROPAVLOVSK.lng, PETROPAVLOVSK.lat],
            zoom: 10,
            essential: true,
          });
        });

        return;
      }

      runWhenMapReady((map) => {
        map.resize();
        map.flyTo({
          center: [Number(selectedBody.longitude), Number(selectedBody.latitude)],
          zoom: 12,
          essential: true,
        });
      });

      openLakePopup(selectedBody);
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedBody]);

  return (
    <div
      ref={containerRef}
      className="wb-map-surface wb-map-surface--maplibre"
    />
  );
}