import {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ZoomControl,
  Polyline,
  CircleMarker,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

// ========================================
// CALCULATE DISTANCE
// ========================================

function getDistanceInKm(point1, point2) {
  const R = 6371;

  const lat1 =
    (point1[0] * Math.PI) / 180;

  const lat2 =
    (point2[0] * Math.PI) / 180;

  const dLat =
    ((point2[0] - point1[0]) *
      Math.PI) /
    180;

  const dLon =
    ((point2[1] - point1[1]) *
      Math.PI) /
    180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

// ========================================
// MAP CONTROLLER
// ========================================

function MapController({
  position,
  destination,
  route,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      route &&
      route.length > 0
    ) {
      map.fitBounds(route, {
        padding: [40, 40],
      });
    } else if (destination) {
      map.flyTo(destination, 14);
    } else if (position) {
      map.flyTo(position, 14);
    }
  }, [
    position,
    destination,
    route,
    map,
  ]);

  return null;
}

// ========================================
// MAIN MAP COMPONENT
// ========================================

function Map({ onRiskChange, onStatsChange }) {

  // ========================================
  // LOCATION
  // ========================================

  const [position, setPosition] =
    useState([
      17.3850,
      78.4867,
    ]);

  const [destination, setDestination] =
    useState(null);

  const [locationMessage, setLocationMessage] =
    useState("");

  const watchIdRef =
    useRef(null);

  // ========================================
  // ROUTING
  // ========================================

  const [route, setRoute] =
    useState([]);

  const [searchText, setSearchText] =
    useState("");

  const [searchMessage, setSearchMessage] =
    useState("");

  const [routeMessage, setRouteMessage] =
    useState("");

  const [loadingRoute, setLoadingRoute] =
    useState(false);

  const [routeRisk, setRouteRisk] =
    useState(null);

  const [routeOptions, setRouteOptions] =
    useState([]);

  const [selectedRouteIndex, setSelectedRouteIndex] =
    useState(0);

  // ========================================
  // LIVE WEATHER
  // ========================================

  const [weather, setWeather] =
    useState(null);

  const [weatherLoading, setWeatherLoading] =
    useState(false);

  const [weatherMessage, setWeatherMessage] =
    useState("");

  // ========================================
  // SAMPLE ACCIDENT HOTSPOTS
  // ========================================

  const hotspots = [

    {
      id: 1,

      position: [
        17.4100,
        78.4500,
      ],

      risk: "HIGH",

      accidents: 52,

      factors: [
        "Sharp Curve",
        "Overspeeding",
        "Poor Lighting",
      ],

      recommendation:
        "Reduce speed and avoid overtaking.",
    },

    {
      id: 2,

      position: [
        17.3950,
        78.4750,
      ],

      risk: "MEDIUM",

      accidents: 34,

      factors: [
        "Heavy Traffic",
        "Poor Road Condition",
      ],

      recommendation:
        "Maintain safe distance from other vehicles.",
    },

    {
      id: 3,

      position: [
        17.3650,
        78.4900,
      ],

      risk: "LOW",

      accidents: 15,

      factors: [
        "Moderate Traffic",
        "Night Visibility",
      ],

      recommendation:
        "Drive carefully and follow the speed limit.",
    },

    {
      id: 4,

      position: [
        17.4300,
        78.5000,
      ],

      risk: "HIGH",

      accidents: 67,

      factors: [
        "Overspeeding",
        "Heavy Traffic",
        "Poor Lighting",
      ],

      recommendation:
        "Reduce speed and avoid sudden lane changes.",
    },

  ];

  // ========================================
  // SEND DASHBOARD STATISTICS
  // ========================================

  const sendDashboardStats = (routes = []) => {
    const highRiskHotspots =
      hotspots.filter(
        (hotspot) =>
          hotspot.risk === "HIGH"
      ).length;

    const mediumRiskHotspots =
      hotspots.filter(
        (hotspot) =>
          hotspot.risk === "MEDIUM"
      ).length;

    const accidentsAnalyzed =
      hotspots.reduce(
        (total, hotspot) =>
          total + hotspot.accidents,
        0
      );

    let saferRoutes = 0;

    if (routes.length > 0) {
      const fastestRoute =
        routes.reduce(
          (fastest, current) =>
            current.durationMin <
            fastest.durationMin
              ? current
              : fastest,
          routes[0]
        );

      saferRoutes =
        routes.filter(
          (routeOption) =>
            routeOption.index !==
              fastestRoute.index &&
            routeOption.totalRiskScore <
              fastestRoute.totalRiskScore
        ).length;
    }

    if (onStatsChange) {
      onStatsChange({
        highRiskHotspots,
        mediumRiskHotspots,
        accidentsAnalyzed,
        saferRoutes,
      });
    }
  };

  // ========================================
  // WEATHER RISK
  // ========================================

  const getWeatherRisk = (
    weatherData
  ) => {

    if (!weatherData) {
      return "NORMAL";
    }

    const rain =
      Number(weatherData.rain) || 0;

    const precipitation =
      Number(
        weatherData.precipitation
      ) || 0;

    const visibility =
      Number(
        weatherData.visibility
      );

    const wind =
      Number(
        weatherData.wind_speed_10m
      ) || 0;

    const humidity =
      Number(
        weatherData.relative_humidity_2m
      ) || 0;

    if (
      rain > 0 ||
      precipitation > 0 ||
      (
        Number.isFinite(
          visibility
        ) &&
        visibility < 1000
      )
    ) {
      return "HIGH";
    }

    if (
      humidity > 85 ||
      wind > 30 ||
      (
        Number.isFinite(
          visibility
        ) &&
        visibility < 3000
      )
    ) {
      return "MEDIUM";
    }

    return "LOW";
  };

  const weatherRisk =
    getWeatherRisk(weather);

  // ========================================
  // WEATHER RECOMMENDATION
  // ========================================

  const getWeatherRecommendation =
    () => {

      if (!weather) {
        return "Weather information is not available.";
      }

      if (
        weatherRisk === "HIGH"
      ) {
        return "Reduce speed, avoid sudden braking, and maintain extra distance.";
      }

      if (
        weatherRisk === "MEDIUM"
      ) {
        return "Drive carefully and maintain a safe distance.";
      }

      return "Weather conditions are currently suitable for normal driving.";
    };

  // ========================================
  // FETCH LIVE WEATHER
  // ========================================

  const fetchLiveWeather =
    async (
      latitude,
      longitude
    ) => {

      try {

        setWeatherLoading(true);

        setWeatherMessage(
          "Updating live weather..."
        );

        const response =
          await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,visibility&timezone=auto`
          );

        if (!response.ok) {
          throw new Error(
            "Weather request failed"
          );
        }

        const data =
          await response.json();

        if (data.current) {

          setWeather(
            data.current
          );

          setWeatherMessage(
            "Live weather updated."
          );

        } else {

          setWeatherMessage(
            "Weather data unavailable."
          );
        }

      } catch (error) {

        console.error(
          "Weather fetch failed:",
          error
        );

        setWeatherMessage(
          "Unable to update weather."
        );

      } finally {

        setWeatherLoading(false);

      }
    };

  // ========================================
  // WEATHER UPDATE
  // ========================================

  useEffect(() => {

    if (!position) {
      return;
    }

    fetchLiveWeather(
      position[0],
      position[1]
    );

    const interval =
      setInterval(() => {

        fetchLiveWeather(
          position[0],
          position[1]
        );

      }, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };

  }, [position]);

  // ========================================
  // CURRENT LOCATION
  // ========================================

  const getCurrentLocation =
    () => {

      if (
        !navigator.geolocation
      ) {

        setLocationMessage(
          "Location is not supported by this browser."
        );

        return;
      }

      setLocationMessage(
        "Getting your live location..."
      );

      if (
        watchIdRef.current !== null
      ) {

        navigator.geolocation.clearWatch(
          watchIdRef.current
        );
      }

      watchIdRef.current =
        navigator.geolocation.watchPosition(

          (location) => {

            const latitude =
              location.coords.latitude;

            const longitude =
              location.coords.longitude;

            setPosition([
              latitude,
              longitude,
            ]);

            setLocationMessage(
              "Live location tracking active."
            );
          },

          (error) => {

            console.error(
              "Location error:",
              error
            );

            setLocationMessage(
              "Unable to get your location. Please allow location access."
            );
          },

          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 15000,
          }
        );
    };

  // ========================================
  // CLEAN GPS WATCHER
  // ========================================

  useEffect(() => {

    return () => {

      if (
        watchIdRef.current !== null
      ) {

        navigator.geolocation.clearWatch(
          watchIdRef.current
        );
      }
    };

  }, []);

  // ========================================
  // SEARCH DESTINATION
  // ========================================

  const searchDestination =
    async () => {

      if (!searchText.trim()) {

        setSearchMessage(
          "Please enter a destination."
        );

        return;
      }

      setSearchMessage(
        "Searching destination..."
      );

      setRouteMessage("");

      setRoute([]);

      setRouteOptions([]);

      setSelectedRouteIndex(0);

      setRouteRisk(null);

      try {

        const response =
          await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              searchText
            )}&limit=1`
          );

        if (!response.ok) {
          throw new Error(
            "Destination search failed"
          );
        }

        const data =
          await response.json();

        if (
          data.length === 0
        ) {

          setSearchMessage(
            "Destination not found."
          );

          return;
        }

        const latitude =
          parseFloat(
            data[0].lat
          );

        const longitude =
          parseFloat(
            data[0].lon
          );

        const destinationPosition =
          [
            latitude,
            longitude,
          ];

        setDestination(
          destinationPosition
        );

        setSearchMessage(
          `Destination found: ${data[0].display_name}`
        );

        await calculateRoute(
          position,
          destinationPosition
        );

      } catch (error) {

        console.error(error);

        setSearchMessage(
          "Unable to search destination."
        );
      }
    };

  // ========================================
  // CALCULATE MULTIPLE ROUTES
  // ========================================

  const calculateRoute =
    async (
      start,
      end
    ) => {

      setLoadingRoute(true);

      setRouteMessage(
        "Calculating routes..."
      );

      setRouteRisk(null);

      setRouteOptions([]);

      setSelectedRouteIndex(0);

      try {

        const startLongitude =
          start[1];

        const startLatitude =
          start[0];

        const endLongitude =
          end[1];

        const endLatitude =
          end[0];

        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${startLongitude},${startLatitude};` +
          `${endLongitude},${endLatitude}` +
          `?overview=full&geometries=geojson&alternatives=true`;

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Routing request failed"
          );
        }

        const data =
          await response.json();

        if (
          data.code !== "Ok" ||
          !data.routes ||
          data.routes.length === 0
        ) {

          setRouteMessage(
            "Unable to find a route."
          );

          setLoadingRoute(false);

          return;
        }

        // ========================================
        // ANALYZE ROUTES
        // ========================================

        const analyzedRoutes =
          data.routes.map(
            (
              osrmRoute,
              index
            ) => {

              const leafletRoute =
                osrmRoute.geometry.coordinates.map(
                  ([
                    longitude,
                    latitude,
                  ]) => [
                    latitude,
                    longitude,
                  ]
                );

              const nearbyHotspots =
                [];

              // Find nearby hotspots

              hotspots.forEach(
                (hotspot) => {

                  let minimumDistance =
                    Infinity;

                  leafletRoute.forEach(
                    (routePoint) => {

                      const distance =
                        getDistanceInKm(
                          hotspot.position,
                          routePoint
                        );

                      if (
                        distance <
                        minimumDistance
                      ) {

                        minimumDistance =
                          distance;
                      }
                    }
                  );

                  if (
                    minimumDistance <= 1
                  ) {

                    nearbyHotspots.push({
                      ...hotspot,

                      distance:
                        minimumDistance,
                    });
                  }
                }
              );

              // ========================================
              // HOTSPOT RISK
              // ========================================

              let hotspotRiskScore =
                0;

              nearbyHotspots.forEach(
                (hotspot) => {

                  const riskValue =
                    hotspot.risk ===
                    "HIGH"
                      ? 3
                      : hotspot.risk ===
                        "MEDIUM"
                      ? 2
                      : 1;

                  const proximityWeight =
                    Math.max(
                      0.25,
                      1 -
                        hotspot.distance
                    );

                  hotspotRiskScore +=
                    riskValue *
                    proximityWeight;
                }
              );

              // ========================================
              // WEATHER RISK
              // ========================================

              let weatherRiskScore =
                0;

              if (
                weatherRisk ===
                "HIGH"
              ) {

                weatherRiskScore =
                  3;

              } else if (
                weatherRisk ===
                "MEDIUM"
              ) {

                weatherRiskScore =
                  1.5;

              } else {

                weatherRiskScore =
                  0;
              }

              // ========================================
              // TOTAL RISK
              // ========================================

              const totalRiskScore =
                hotspotRiskScore +
                weatherRiskScore;

              // ========================================
              // RISK LEVEL
              // ========================================

              let riskLevel =
                "LOW";

              if (
                totalRiskScore >= 3
              ) {

                riskLevel =
                  "HIGH";

              } else if (
                totalRiskScore > 0
              ) {

                riskLevel =
                  "MEDIUM";
              }

              return {

                index,

                route:
                  leafletRoute,

                distanceKm:
                  osrmRoute.distance /
                  1000,

                durationMin:
                  osrmRoute.duration /
                  60,

                nearbyHotspots,

                hotspotRiskScore,

                weatherRiskScore,

                totalRiskScore,

                riskLevel,
              };
            }
          );

        // ========================================
        // FASTEST ROUTE
        // ========================================

        const fastestRoute =
          analyzedRoutes[0];

        // ========================================
        // SAFER ROUTE
        // ========================================

        const saferRoute =
          [
            ...analyzedRoutes,
          ].sort(
            (a, b) => {

              if (
                a.totalRiskScore !==
                b.totalRiskScore
              ) {

                return (
                  a.totalRiskScore -
                  b.totalRiskScore
                );
              }

              return (
                a.durationMin -
                b.durationMin
              );
            }
          )[0];

        // ========================================
        // INITIAL ROUTE
        // ========================================

        const initialIndex =
          saferRoute.index !==
            fastestRoute.index &&
          saferRoute.totalRiskScore <
            fastestRoute.totalRiskScore
            ? saferRoute.index
            : fastestRoute.index;

        setRouteOptions(
          analyzedRoutes
        );

        sendDashboardStats(
          analyzedRoutes
        );

        setSelectedRouteIndex(
          initialIndex
        );

        setRoute(
          analyzedRoutes[
            initialIndex
          ].route
        );

        updateRouteRisk(
          analyzedRoutes[
            initialIndex
          ]
        );

        const selected =
          analyzedRoutes[
            initialIndex
          ];

        const label =
          initialIndex ===
            saferRoute.index &&
          saferRoute.index !==
            fastestRoute.index
            ? "Safer route selected"
            : "Fastest route selected";

        setRouteMessage(
          `${label} • ${selected.distanceKm.toFixed(
            1
          )} km • ${Math.round(
            selected.durationMin
          )} min`
        );

      } catch (error) {

        console.error(error);

        setRouteMessage(
          "Unable to calculate route."
        );

      } finally {

        setLoadingRoute(false);
      }
    };

  // ========================================
  // UPDATE ROUTE RISK
  // ========================================

  const updateRouteRisk =
    (selected) => {

      if (!selected) {
        return;
      }

      const highestRiskHotspot =
        selected.nearbyHotspots.find(
          (hotspot) =>
            hotspot.risk ===
            "HIGH"
        );

      const mediumRiskHotspot =
        selected.nearbyHotspots.find(
          (hotspot) =>
            hotspot.risk ===
            "MEDIUM"
        );

      const nearestHotspot =
        selected.nearbyHotspots.length >
        0
          ? [
              ...selected.nearbyHotspots,
            ].sort(
              (a, b) =>
                a.distance -
                b.distance
            )[0]
          : null;

      let riskData;

      // ========================================
      // HIGH RISK
      // ========================================

      if (
        selected.riskLevel ===
        "HIGH"
      ) {

        const hotspot =
          highestRiskHotspot ||
          mediumRiskHotspot ||
          nearestHotspot;

        riskData = {

          level: "HIGH",

          location: hotspot
            ? `Accident Hotspot ${hotspot.id}`
            : "Current Route",

          factors: [
            ...(hotspot
              ? hotspot.factors
              : []),

            ...(weatherRisk ===
            "HIGH"
              ? [
                  "Poor Weather Conditions",
                ]
              : []),
          ],

          recommendation:
            hotspot
              ? hotspot.recommendation
              : getWeatherRecommendation(),

          distance: hotspot
            ? hotspot.distance
            : null,

          hotspot: hotspot || null,
        };

      }

      // ========================================
      // MEDIUM RISK
      // ========================================

      else if (
        selected.riskLevel ===
        "MEDIUM"
      ) {

        const hotspot =
          mediumRiskHotspot ||
          nearestHotspot;

        riskData = {

          level: "MEDIUM",

          location: hotspot
            ? `Accident Hotspot ${hotspot.id}`
            : "Current Route",

          factors: [
            ...(hotspot
              ? hotspot.factors
              : []),

            ...(weatherRisk ===
            "MEDIUM"
              ? [
                  "Moderate Weather Risk",
                ]
              : []),
          ],

          recommendation:
            hotspot
              ? hotspot.recommendation
              : getWeatherRecommendation(),

          distance: hotspot
            ? hotspot.distance
            : null,

          hotspot: hotspot || null,
        };

      }

      // ========================================
      // LOW RISK
      // ========================================

      else {

        riskData = {

          level: "LOW",

          location:
            "Current Route",

          factors: [
            "No major accident hotspot",

            ...(weatherRisk ===
            "LOW"
              ? [
                  "Normal Weather Conditions",
                ]
              : []),
          ],

          recommendation:
            "No major accident hotspots or significant weather risks detected on this route.",

          distance: null,

          hotspot: null,
        };
      }

      // ========================================
      // UPDATE MAP
      // ========================================

      setRouteRisk(
        riskData
      );

      // ========================================
      // SEND RISK TO APP.JSX
      // ========================================

      if (onRiskChange) {

        onRiskChange(
          riskData
        );
      }
    };

  // ========================================
  // SELECT ROUTE
  // ========================================

  const selectRoute =
    (index) => {

      const selected =
        routeOptions[index];

      if (!selected) {
        return;
      }

      setSelectedRouteIndex(
        index
      );

      setRoute(
        selected.route
      );

      updateRouteRisk(
        selected
      );

      const fastestIndex =
        routeOptions.reduce(
          (
            bestIndex,
            item,
            currentIndex,
            array
          ) =>
            item.durationMin <
            array[bestIndex]
              .durationMin
              ? currentIndex
              : bestIndex,
          0
        );

      setRouteMessage(
        `${
          index === fastestIndex
            ? "Fastest route selected"
            : "Alternative route selected"
        } • ${selected.distanceKm.toFixed(
          1
        )} km • ${Math.round(
          selected.durationMin
        )} min`
      );
    };

  // ========================================
  // WEATHER ICON
  // ========================================

  const getWeatherIcon =
    () => {

      if (!weather) {
        return "🌦️";
      }

      const code =
        Number(
          weather.weather_code
        );

      if (
        code >= 51 &&
        code <= 67
      ) {
        return "🌧️";
      }

      if (
        code >= 71 &&
        code <= 77
      ) {
        return "❄️";
      }

      if (
        code >= 80 &&
        code <= 82
      ) {
        return "🌧️";
      }

      if (code >= 95) {
        return "⛈️";
      }

      if (
        code >= 1 &&
        code <= 3
      ) {
        return "⛅";
      }

      if (code === 0) {
        return "☀️";
      }

      return "🌦️";
    };

  // ========================================
  // DISPLAY MAP
  // ========================================

  return (

    <div className="map-wrapper">

      {/* ==================================
          DESTINATION SEARCH
      ================================== */}

      <div className="destination-search">

        <input
          type="text"
          placeholder="🔎 Enter destination..."
          value={searchText}
          onChange={(e) =>
            setSearchText(
              e.target.value
            )
          }
          onKeyDown={(e) => {

            if (
              e.key === "Enter"
            ) {
              searchDestination();
            }

          }}
        />

        <button
          onClick={
            searchDestination
          }
          disabled={
            loadingRoute
          }
        >
          {loadingRoute
            ? "..."
            : "Search"}
        </button>

      </div>

      {/* ==================================
          LOCATION BUTTON
      ================================== */}

      <button
        className="location-button"
        onClick={
          getCurrentLocation
        }
      >
        📍 Use My Location
      </button>

      {/* ==================================
          LOCATION MESSAGE
      ================================== */}

      {locationMessage && (

        <div className="location-message">

          {locationMessage}

        </div>

      )}

      {/* ==================================
          SEARCH MESSAGE
      ================================== */}

      {searchMessage && (

        <div className="search-message">

          {searchMessage}

        </div>

      )}

      {/* ==================================
          ROUTE MESSAGE
      ================================== */}

      {routeMessage && (

        <div className="route-message">

          🛣️ {routeMessage}

        </div>

      )}

      {/* ==================================
          LIVE WEATHER
      ================================== */}

      <div className="live-weather-card">

        <div className="weather-header">

          <h3>
            {getWeatherIcon()} Live Weather
          </h3>

          <span
            className={`weather-risk-badge ${weatherRisk.toLowerCase()}`}
          >
            {weatherRisk}
          </span>

        </div>

        {weatherLoading ? (

          <p>
            Updating live weather...
          </p>

        ) : weather ? (

          <>

            <div className="weather-grid">

              <div>

                <span>
                  🌡️ Temperature
                </span>

                <strong>
                  {
                    weather.temperature_2m
                  }
                  °C
                </strong>

              </div>

              <div>

                <span>
                  💧 Humidity
                </span>

                <strong>
                  {
                    weather.relative_humidity_2m
                  }%
                </strong>

              </div>

              <div>

                <span>
                  🌧️ Rain
                </span>

                <strong>
                  {weather.rain ??
                    0}{" "}
                  mm
                </strong>

              </div>

              <div>

                <span>
                  💨 Wind
                </span>

                <strong>
                  {
                    weather.wind_speed_10m
                  }{" "}
                  km/h
                </strong>

              </div>

              <div>

                <span>
                  👁️ Visibility
                </span>

                <strong>

                  {Number.isFinite(
                    Number(
                      weather.visibility
                    )
                  )
                    ? `${Math.round(
                        weather.visibility
                      )} m`
                    : "N/A"}

                </strong>

              </div>

            </div>

            <div className="weather-recommendation">

              💡{" "}
              {getWeatherRecommendation()}

            </div>

            <div className="weather-update-time">

              {weatherMessage}

            </div>

          </>

        ) : (

          <p>
            Weather data unavailable.
          </p>

        )}

      </div>

      {/* ==================================
          ROUTE OPTIONS
      ================================== */}

      {routeOptions.length >
        1 && (

        <div className="route-options-panel">

          <div className="route-options-title">
            🛣️ Route Options
          </div>

          {routeOptions.map(
            (
              option,
              index
            ) => (

              <button
                key={index}
                className={`route-option ${
                  selectedRouteIndex ===
                  index
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  selectRoute(
                    index
                  )
                }
              >

                <div className="route-option-top">

                  <strong>

                    {index === 0
                      ? "Fastest Route"
                      : `Alternative Route ${index}`}

                  </strong>

                  {selectedRouteIndex ===
                    index && (

                    <span className="route-selected-badge">

                      Selected

                    </span>

                  )}

                </div>

                <div className="route-option-details">

                  {option.distanceKm.toFixed(
                    1
                  )}{" "}
                  km •{" "}
                  {Math.round(
                    option.durationMin
                  )}{" "}
                  min

                </div>

                <div
                  className={`route-option-risk ${option.riskLevel.toLowerCase()}`}
                >

                  {option.riskLevel ===
                  "HIGH"
                    ? "🔴 High risk"
                    : option.riskLevel ===
                      "MEDIUM"
                    ? "🟠 Medium risk"
                    : "🟢 Low risk"}

                </div>

                {option.nearbyHotspots
                  .length > 0 && (

                  <div className="route-hotspot-count">

                    {
                      option
                        .nearbyHotspots
                        .length
                    }{" "}
                    hotspot
                    {option
                      .nearbyHotspots
                      .length >
                    1
                      ? "s"
                      : ""}{" "}
                    near route

                  </div>

                )}

              </button>

            )
          )}

        </div>

      )}

      {/* ==================================
          ROUTE RISK WARNING
      ================================== */}

      {routeRisk && (

        <div
          className={`route-risk-message ${routeRisk.level.toLowerCase()}`}
        >

          {routeRisk.level ===
          "HIGH" ? (

            <>

              🚨{" "}
              <strong>
                HIGH RISK ROUTE
              </strong>

              <br />

              {routeRisk.hotspot
                ? "Accident hotspot detected near your route."
                : "Current weather conditions are increasing road risk."}

              <br />

              💡{" "}
              {routeRisk.hotspot
                ? routeRisk.hotspot
                    .recommendation
                : getWeatherRecommendation()}

              {routeRisk.hotspot &&
                routeRisk.hotspot.distance !==
                  undefined && (
                  <>
                    <br />
                    📍 Hotspot distance:{" "}
                    {Math.round(
                      routeRisk.hotspot.distance * 1000
                    )}{" "}
                    meters
                  </>
                )}

              {routeRisk.hotspot &&
                routeRisk.hotspot.distance !==
                  undefined && (
                  <>
                    <br />
                    📍 Hotspot distance:{" "}
                    {Math.round(
                      routeRisk.hotspot.distance * 1000
                    )}{" "}
                    meters
                  </>
                )}

            </>

          ) : routeRisk.level ===
            "MEDIUM" ? (

            <>

              ⚠️{" "}
              <strong>
                MEDIUM RISK ROUTE
              </strong>

              <br />

              {routeRisk.hotspot
                ? "Accident hotspot detected near your route."
                : "Current weather conditions require additional driving caution."}

              <br />

              💡{" "}
              {routeRisk.hotspot
                ? routeRisk.hotspot
                    .recommendation
                : getWeatherRecommendation()}

            </>

          ) : (

            <>

              ✅{" "}
              <strong>
                LOW RISK ROUTE
              </strong>

              <br />

              No major accident
              hotspots or significant
              weather risks detected.

            </>

          )}

        </div>

      )}

      {/* ==================================
          MAP
      ================================== */}

      <MapContainer
        center={position}
        zoom={13}
        zoomControl={false}
        style={{
          height: "100%",
          width: "100%",
        }}
      >

        {/* ZOOM */}

        <ZoomControl
          position="bottomleft"
        />

        {/* MAP CONTROLLER */}

        <MapController
          position={position}
          destination={
            destination
          }
          route={route}
        />

        {/* OPEN STREET MAP */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ==================================
            CURRENT LOCATION
        ================================== */}

        <Marker
          position={position}
        >

          <Popup>

            <b>
              📍 Your Live Location
            </b>

            <br />

            Accident Safety AI

            <br />

            <small>
              Latitude:{" "}
              {position[0].toFixed(
                5
              )}
            </small>

            <br />

            <small>
              Longitude:{" "}
              {position[1].toFixed(
                5
              )}
            </small>

          </Popup>

        </Marker>

        {/* ==================================
            DESTINATION
        ================================== */}

        {destination && (

          <Marker
            position={
              destination
            }
          >

            <Popup>

              <b>
                🎯 Destination
              </b>

              <br />

              {searchText}

            </Popup>

          </Marker>

        )}

        {/* ==================================
            ROUTES
        ================================== */}

        {routeOptions.length >
          0 &&
          routeOptions.map(
            (
              option,
              index
            ) => (

              <Polyline
                key={`route-${index}`}
                positions={
                  option.route
                }
                pathOptions={{

                  color:
                    index ===
                    selectedRouteIndex
                      ? "#2563eb"
                      : "#64748b",

                  weight:
                    index ===
                    selectedRouteIndex
                      ? 6
                      : 4,

                  opacity:
                    index ===
                    selectedRouteIndex
                      ? 0.9
                      : 0.45,

                  dashArray:
                    index ===
                    selectedRouteIndex
                      ? undefined
                      : "10 10",
                }}
              />

            )
          )}

        {routeOptions.length ===
          0 &&
          route.length > 0 && (

            <Polyline
              positions={route}
              pathOptions={{
                color: "#2563eb",
                weight: 6,
                opacity: 0.8,
              }}
            />

          )}

        {/* ==================================
            ACCIDENT HOTSPOTS
        ================================== */}

        {hotspots.map(
          (hotspot) => {

            let color =
              "#facc15";

            if (
              hotspot.risk ===
              "HIGH"
            ) {

              color =
                "#dc2626";
            }

            if (
              hotspot.risk ===
              "MEDIUM"
            ) {

              color =
                "#f97316";
            }

            return (

              <CircleMarker
                key={
                  hotspot.id
                }
                center={
                  hotspot.position
                }
                radius={12}
                pathOptions={{
                  color,
                  fillColor:
                    color,
                  fillOpacity:
                    0.9,
                  weight: 4,
                }}
              >

                <Popup>

                  <div
                    style={{
                      minWidth:
                        "220px",
                    }}
                  >

                    <h3>

                      {hotspot.risk ===
                      "HIGH"
                        ? "🔴"
                        : hotspot.risk ===
                          "MEDIUM"
                        ? "🟠"
                        : "🟡"}{" "}

                      {
                        hotspot.risk
                      }{" "}

                      RISK HOTSPOT

                    </h3>

                    <p>

                      <strong>
                        Accidents:
                      </strong>{" "}

                      {
                        hotspot.accidents
                      }

                    </p>

                    <p>

                      <strong>
                        Contributing
                        Factors:
                      </strong>

                    </p>

                    <ul>

                      {hotspot.factors.map(
                        (
                          factor,
                          index
                        ) => (

                          <li
                            key={
                              index
                            }
                          >
                            {
                              factor
                            }
                          </li>

                        )
                      )}

                    </ul>

                    <p>

                      <strong>
                        💡 Recommendation:
                      </strong>

                      <br />

                      {
                        hotspot.recommendation
                      }

                    </p>

                  </div>

                </Popup>

              </CircleMarker>

            );
          }
        )}

      </MapContainer>

    </div>
  );
}

export default Map;