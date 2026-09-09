import { useState, useEffect } from "react";

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

// --------------------------------
// CALCULATE DISTANCE BETWEEN TWO LOCATIONS
// --------------------------------

function getDistanceInKm(point1, point2) {
  const R = 6371;

  const lat1 = point1[0] * Math.PI / 180;
  const lat2 = point2[0] * Math.PI / 180;

  const dLat =
    (point2[0] - point1[0]) * Math.PI / 180;

  const dLon =
    (point2[1] - point1[1]) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
    Math.cos(lat2) *
    Math.sin(dLon / 2) ** 2;

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}
// --------------------------------
// MAP CONTROLLER
// --------------------------------

function MapController({ position, destination, route }) {
  const map = useMap();

  useEffect(() => {

    if (route && route.length > 0) {

      map.fitBounds(route, {
        padding: [40, 40],
      });

    } else if (destination) {

      map.flyTo(destination, 14);

    } else if (position) {

      map.flyTo(position, 14);

    }

  }, [position, destination, route, map]);

  return null;
}


// --------------------------------
// MAIN MAP COMPONENT
// --------------------------------

function Map() {

  const [position, setPosition] = useState([
    17.3850,
    78.4867,
  ]);

  const [destination, setDestination] = useState(null);

  const [route, setRoute] = useState([]);

  const [searchText, setSearchText] = useState("");

  const [locationMessage, setLocationMessage] = useState("");

  const [searchMessage, setSearchMessage] = useState("");

  const [routeMessage, setRouteMessage] = useState("");

  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeRisk, setRouteRisk] = useState(null);


  // --------------------------------
  // TEMPORARY ACCIDENT HOTSPOTS
  // --------------------------------

  const hotspots = [

    {
      id: 1,

      position: [17.4100, 78.4500],

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

      position: [17.3950, 78.4750],

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

      position: [17.3650, 78.4900],

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

      position: [17.4300, 78.5000],

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


  // --------------------------------
  // GET CURRENT LOCATION
  // --------------------------------

  const getCurrentLocation = () => {

    if (!navigator.geolocation) {

      setLocationMessage(
        "Location is not supported by this browser."
      );

      return;
    }


    setLocationMessage(
      "Getting your location..."
    );


    navigator.geolocation.getCurrentPosition(

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
          "Your current location is detected."
        );

      },


      () => {

        setLocationMessage(
          "Unable to get your location. Please allow location access."
        );

      }

    );

  };


  // --------------------------------
  // SEARCH DESTINATION
  // --------------------------------

  const searchDestination = async () => {

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


    try {

      const response = await fetch(

        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchText
        )}&limit=1`

      );


      const data =
        await response.json();


      if (data.length === 0) {

        setSearchMessage(
          "Destination not found."
        );

        return;
      }


      const latitude =
        parseFloat(data[0].lat);

      const longitude =
        parseFloat(data[0].lon);


      const destinationPosition = [
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


  // --------------------------------
  // CALCULATE ROUTE USING OSRM
  // --------------------------------

  const calculateRoute = async (
    start,
    end
  ) => {

    setLoadingRoute(true);

    setRouteMessage(
      "Calculating route..."
    );


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
        `?overview=full&geometries=geojson`;


      const response =
        await fetch(url);


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


      const coordinates =
        data.routes[0].geometry.coordinates;


      const leafletRoute =
        coordinates.map(
          ([longitude, latitude]) => [
            latitude,
            longitude,
          ]
        );


      setRoute(
        leafletRoute
      );
      // --------------------------------
// ANALYZE ROUTE FOR ACCIDENT HOTSPOTS
// --------------------------------

const nearbyHotspots = [];

hotspots.forEach((hotspot) => {

  let minimumDistance = Infinity;

  leafletRoute.forEach((routePoint) => {

    const distance = getDistanceInKm(
      hotspot.position,
      routePoint
    );

    if (distance < minimumDistance) {
      minimumDistance = distance;
    }

  });


  // Consider hotspot dangerous if
  // it is within 1 km of the route

  if (minimumDistance <= 1) {

    nearbyHotspots.push({
      ...hotspot,
      distance: minimumDistance,
    });

  }

});


if (nearbyHotspots.length > 0) {

  // Find highest-risk hotspot

  const highRiskHotspot =
    nearbyHotspots.find(
      (hotspot) => hotspot.risk === "HIGH"
    );


  if (highRiskHotspot) {

    setRouteRisk({
      level: "HIGH",
      hotspot: highRiskHotspot,
    });

  } else {

    setRouteRisk({
      level: "MEDIUM",
      hotspot: nearbyHotspots[0],
    });

  }

} else {

  setRouteRisk({
    level: "LOW",
    hotspot: null,
  });

}


      const distance =
        data.routes[0].distance / 1000;


      const duration =
        data.routes[0].duration / 60;


      setRouteMessage(
        `Route found • ${distance.toFixed(
          1
        )} km • ${Math.round(
          duration
        )} min`
      );


    } catch (error) {

      console.error(error);

      setRouteMessage(
        "Unable to calculate route."
      );

    }


    setLoadingRoute(false);

  };


  // --------------------------------
  // DISPLAY MAP
  // --------------------------------

  return (

    <div className="map-wrapper">


      {/* DESTINATION SEARCH */}

      <div className="destination-search">

        <input
          type="text"

          placeholder="🔎 Enter destination..."

          value={searchText}

          onChange={(e) =>
            setSearchText(e.target.value)
          }

          onKeyDown={(e) => {

            if (e.key === "Enter") {

              searchDestination();

            }

          }}

        />


        <button
          onClick={searchDestination}

          disabled={loadingRoute}
        >

          {loadingRoute
            ? "..."
            : "Search"}

        </button>

      </div>


      {/* CURRENT LOCATION BUTTON */}

      <button
        className="location-button"

        onClick={getCurrentLocation}
      >

        📍 Use My Location

      </button>


      {/* LOCATION MESSAGE */}

      {locationMessage && (

        <div className="location-message">

          {locationMessage}

        </div>

      )}


      {/* SEARCH MESSAGE */}

      {searchMessage && (

        <div className="search-message">

          {searchMessage}

        </div>

      )}


      {/* ROUTE MESSAGE */}

      {routeMessage && (

        <div className="route-message">

          🛣️ {routeMessage}

        </div>

      )}
      {/* ROUTE RISK WARNING */}

{routeRisk && (

  <div className="route-risk-message">

    {routeRisk.level === "HIGH" ? (
      <>
        🚨 <strong>HIGH RISK ROUTE</strong>
        <br />

        Accident hotspot detected near your route.

        <br />

        💡 {routeRisk.hotspot.recommendation}
      </>
    ) : routeRisk.level === "MEDIUM" ? (
      <>
        ⚠️ <strong>MEDIUM RISK ROUTE</strong>
        <br />

        Accident hotspot detected near your route.

        <br />

        💡 {routeRisk.hotspot.recommendation}
      </>
    ) : (
      <>
        ✅ <strong>LOW RISK ROUTE</strong>
        <br />

        No major accident hotspots detected near this route.
      </>
    )}

  </div>

)}


      {/* --------------------------------
          MAP
      -------------------------------- */}

      <MapContainer

        center={position}

        zoom={13}

        zoomControl={false}

        style={{
          height: "100%",
          width: "100%",
        }}

      >


        {/* ZOOM CONTROLS */}

        <ZoomControl
          position="bottomleft"
        />


        {/* MAP CONTROLLER */}

        <MapController
          position={position}
          destination={destination}
          route={route}
        />


        {/* OPENSTREETMAP */}

        <TileLayer

          attribution="&copy; OpenStreetMap contributors"

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        />


        {/* --------------------------------
            CURRENT LOCATION
        -------------------------------- */}

        <Marker
          position={position}
        >

          <Popup>

            <b>📍 Your Location</b>

            <br />

            Accident Safety AI

          </Popup>

        </Marker>


        {/* --------------------------------
            DESTINATION
        -------------------------------- */}

        {destination && (

          <Marker
            position={destination}
          >

            <Popup>

              <b>🎯 Destination</b>

              <br />

              {searchText}

            </Popup>

          </Marker>

        )}


        {/* --------------------------------
            ROUTE
        -------------------------------- */}

        {route.length > 0 && (

          <Polyline

            positions={route}

            pathOptions={{
              color: "#2563eb",
              weight: 6,
              opacity: 0.8,
            }}

          />

        )}


        {/* --------------------------------
            ACCIDENT HOTSPOTS
        -------------------------------- */}

        {hotspots.map((hotspot) => {

          let color = "#facc15";


          if (hotspot.risk === "HIGH") {

            color = "#dc2626";

          }


          if (hotspot.risk === "MEDIUM") {

            color = "#f97316";

          }


          return (

            <CircleMarker

              key={hotspot.id}

              center={hotspot.position}

              radius={12}

              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: 4,
              }}

            >

              <Popup>

                <div
                  style={{
                    minWidth: "220px",
                  }}
                >

                  <h3>

                    {hotspot.risk === "HIGH"
                      ? "🔴"
                      : hotspot.risk === "MEDIUM"
                      ? "🟠"
                      : "🟡"}

                    {" "}

                    {hotspot.risk} RISK HOTSPOT

                  </h3>


                  <p>

                    <strong>
                      Accidents:
                    </strong>

                    {" "}

                    {hotspot.accidents}

                  </p>


                  <p>

                    <strong>
                      Contributing Factors:
                    </strong>

                  </p>


                  <ul>

                    {hotspot.factors.map(
                      (factor, index) => (

                        <li key={index}>

                          {factor}

                        </li>

                      )
                    )}

                  </ul>


                  <p>

                    <strong>
                      💡 Recommendation:
                    </strong>

                    <br />

                    {hotspot.recommendation}

                  </p>


                </div>

              </Popup>


            </CircleMarker>

          );

        })}


      </MapContainer>

    </div>

  );

}


export default Map;