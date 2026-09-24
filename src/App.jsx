import { useState } from "react";
import Map from "./components/map";

function App() {
  // ========================================
  // ACTIVE SIDEBAR PAGE
  // ========================================

  const [activePage, setActivePage] = useState("Dashboard");

  // ========================================
  // CURRENT RISK FROM MAP
  // ========================================

  const [currentRisk, setCurrentRisk] = useState({
    level: "LOW",
    location: "Waiting for route analysis...",
    factors: ["Waiting for live route data"],
    recommendation:
      "Search a destination to analyze the route risk.",
    distance: null,
    hotspot: null,
  });

  // ========================================
  // DASHBOARD STATISTICS
  // ========================================

  const [stats, setStats] = useState({
    highRiskHotspots: 2,
    mediumRiskHotspots: 1,
    accidentsAnalyzed: 168,
    saferRoutes: 0,
  });

  // ========================================
  // MAP → APP RISK DATA
  // ========================================

  const handleRiskChange = (riskData) => {
    if (!riskData) {
      return;
    }

    setCurrentRisk(riskData);
  };

  // ========================================
  // MAP → APP STATISTICS
  // ========================================

  const handleStatsChange = (statsData) => {
    if (!statsData) {
      return;
    }

    setStats(statsData);
  };

  // ========================================
  // RISK CLASS
  // ========================================

  const getRiskClass = () => {
    return currentRisk.level.toLowerCase();
  };

  // ========================================
  // RISK ICON
  // ========================================

  const getRiskIcon = () => {
    if (currentRisk.level === "HIGH") {
      return "🔴";
    }

    if (currentRisk.level === "MEDIUM") {
      return "🟠";
    }

    return "🟢";
  };

  // ========================================
  // ALERT TITLE
  // ========================================

  const getAlertTitle = () => {
    if (currentRisk.level === "HIGH") {
      return "🚨 High Risk Route";
    }

    if (currentRisk.level === "MEDIUM") {
      return "⚠️ Medium Risk Route";
    }

    return "✅ Low Risk Route";
  };

  // ========================================
  // SIDEBAR
  // ========================================

  const renderSidebar = () => {
    const menuItems = [
      {
        name: "Dashboard",
        icon: "🏠",
      },
      {
        name: "Live Map",
        icon: "🗺️",
      },
      {
        name: "Analytics",
        icon: "📊",
      },
      {
        name: "Safety Alerts",
        icon: "🚨",
      },
      {
        name: "Settings",
        icon: "⚙️",
      },
    ];

    return (
      <aside className="sidebar">

        {/* LOGO */}

        <div className="logo">
          🚗{" "}
          <span>
            Accident Safety AI
          </span>
        </div>

        {/* NAVIGATION */}

        <nav>

          {menuItems.map((item) => (

            <a
              key={item.name}
              className={
                activePage === item.name
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage(item.name)
              }
              style={{
                cursor: "pointer",
              }}
            >

              <span>
                {item.icon}{" "}
              </span>

              {item.name}

            </a>

          ))}

        </nav>

        {/* SIDEBAR FOOTER */}

        <div className="sidebar-bottom">

          <p>
            AI Road Safety System
          </p>

          <small>
            ML Powered
          </small>

        </div>

      </aside>
    );
  };

  // ========================================
  // HEADER
  // ========================================

  const renderHeader = (
    title,
    description
  ) => {
    return (
      <header className="header">

        <div>

          <h1>
            {title}
          </h1>

          <p>
            {description}
          </p>

        </div>

        <div className="status">
          ● System Online
        </div>

      </header>
    );
  };

  // ========================================
  // STATISTICS CARDS
  // ========================================

  const renderStatistics = () => {
    return (
      <section className="stats">

        {/* HIGH RISK */}

        <div className="card">

          <div className="card-icon">
            🔴
          </div>

          <div>

            <p>
              High Risk Hotspots
            </p>

            <h2>
              {stats.highRiskHotspots}
            </h2>

          </div>

        </div>

        {/* MEDIUM RISK */}

        <div className="card">

          <div className="card-icon">
            🟠
          </div>

          <div>

            <p>
              Medium Risk Hotspots
            </p>

            <h2>
              {stats.mediumRiskHotspots}
            </h2>

          </div>

        </div>

        {/* ACCIDENTS */}

        <div className="card">

          <div className="card-icon">
            🚨
          </div>

          <div>

            <p>
              Accidents Analyzed
            </p>

            <h2>
              {stats.accidentsAnalyzed.toLocaleString()}
            </h2>

          </div>

        </div>

        {/* SAFER ROUTES */}

        <div className="card">

          <div className="card-icon">
            🛣️
          </div>

          <div>

            <p>
              Safer Routes
            </p>

            <h2>
              {stats.saferRoutes}
            </h2>

          </div>

        </div>

      </section>
    );
  };

  // ========================================
  // MAP COMPONENT
  // ========================================

  const renderMap = () => {
    return (
      <Map
        onRiskChange={handleRiskChange}
        onStatsChange={handleStatsChange}
      />
    );
  };

  // ========================================
  // DASHBOARD PAGE
  // ========================================

  const renderDashboard = () => {
    return (
      <>
        {renderHeader(
          "Accident Safety Dashboard",
          "Monitor accident hotspots and road risk in real time."
        )}

        {renderStatistics()}

        <section className="dashboard-grid">

          {/* MAP */}

          <div className="map-box">

            <div className="section-title">

              <h2>
                Accident Hotspot Map
              </h2>

              <button
                onClick={() =>
                  setActivePage("Live Map")
                }
              >
                View Full Map
              </button>

            </div>

            <div className="map-placeholder">
              {renderMap()}
            </div>

          </div>

          {/* CURRENT RISK */}

          <div className="risk-box">

            <div className="section-title">

              <h2>
                Current Risk
              </h2>

            </div>

            <div
              className={`risk-level ${getRiskClass()}`}
            >

              <span>
                {getRiskIcon()}{" "}
                {currentRisk.level}
              </span>

              <p>
                Accident Risk
              </p>

            </div>

            <div className="risk-info">

              <p>
                <strong>
                  Location
                </strong>
              </p>

              <p>
                {currentRisk.location}
              </p>

              <p>
                <strong>
                  Contributing Factors
                </strong>
              </p>

              <ul>

                {currentRisk.factors.map(
                  (factor, index) => (

                    <li key={index}>
                      {factor}
                    </li>

                  )
                )}

              </ul>

              <p>
                <strong>
                  💡 Recommendation
                </strong>
              </p>

              <p>
                {currentRisk.recommendation}
              </p>

              {currentRisk.distance !== null && (

                <p>

                  <strong>
                    📍 Hotspot Distance
                  </strong>

                  <br />

                  {Math.round(
                    currentRisk.distance *
                      1000
                  )}{" "}
                  meters

                </p>

              )}

            </div>

          </div>

        </section>

        {/* ALERT */}

        <section
          className={`alert-box ${getRiskClass()}`}
        >

          <div>

            <h2>
              {getAlertTitle()}
            </h2>

            <p>
              {currentRisk.recommendation}
            </p>

          </div>

          <button
            onClick={() =>
              setActivePage(
                "Safety Alerts"
              )
            }
          >
            View Details
          </button>

        </section>
      </>
    );
  };

  // ========================================
  // LIVE MAP PAGE
  // ========================================

  const renderLiveMap = () => {
    return (
      <>
        {renderHeader(
          "Live Accident Map",
          "Monitor your live location, accident hotspots, weather and route risk."
        )}

        <div
          className="map-box"
          style={{
            width: "100%",
          }}
        >

          <div className="section-title">

            <h2>
              🗺️ Live Road Safety Map
            </h2>

            <div className="status">
              ● GPS Ready
            </div>

          </div>

          <div
            style={{
              height: "650px",
              width: "100%",
            }}
          >
            {renderMap()}
          </div>

        </div>
      </>
    );
  };

  // ========================================
  // ANALYTICS PAGE
  // ========================================

  const renderAnalytics = () => {
    return (
      <>
        {renderHeader(
          "Road Safety Analytics",
          "Overview of accident hotspots and current safety statistics."
        )}

        {renderStatistics()}

        <section className="dashboard-grid">

          {/* HOTSPOT ANALYSIS */}

          <div className="risk-box">

            <div className="section-title">

              <h2>
                📊 Hotspot Analysis
              </h2>

            </div>

            <div className="risk-info">

              <p>
                <strong>
                  Total High-Risk Hotspots
                </strong>
              </p>

              <h2>
                {stats.highRiskHotspots}
              </h2>

              <p>
                Locations classified as high
                accident-risk areas.
              </p>

              <p>
                <strong>
                  Total Medium-Risk Hotspots
                </strong>
              </p>

              <h2>
                {stats.mediumRiskHotspots}
              </h2>

              <p>
                Locations requiring additional
                driving caution.
              </p>

            </div>

          </div>

          {/* ACCIDENT ANALYSIS */}

          <div className="risk-box">

            <div className="section-title">

              <h2>
                🚨 Accident Data
              </h2>

            </div>

            <div className="risk-info">

              <p>
                <strong>
                  Accidents Currently Analyzed
                </strong>
              </p>

              <h2>
                {stats.accidentsAnalyzed.toLocaleString()}
              </h2>

              <p>
                Accident records represented by
                the current hotspot dataset.
              </p>

              <p>
                <strong>
                  Safer Alternative Routes
                </strong>
              </p>

              <h2>
                {stats.saferRoutes}
              </h2>

              <p>
                Alternative routes currently
                calculated with lower risk than
                the fastest route.
              </p>

            </div>

          </div>

        </section>

        <section
          className="alert-box low"
        >

          <div>

            <h2>
              💡 Analytics Status
            </h2>

            <p>
              The current statistics are based
              on the application's hotspot dataset.
              The next stage will connect the
              system to a real accident dataset
              and Machine Learning model.
            </p>

          </div>

        </section>
      </>
    );
  };

  // ========================================
  // SAFETY ALERTS PAGE
  // ========================================

  const renderSafetyAlerts = () => {
    return (
      <>
        {renderHeader(
          "Safety Alerts",
          "Review the current route risk and recommended driving precautions."
        )}

        <section className="dashboard-grid">

          {/* CURRENT ALERT */}

          <div className="risk-box">

            <div className="section-title">

              <h2>
                🚨 Current Route Alert
              </h2>

            </div>

            <div
              className={`risk-level ${getRiskClass()}`}
            >

              <span>
                {getRiskIcon()}{" "}
                {currentRisk.level}
              </span>

              <p>
                Accident Risk
              </p>

            </div>

            <div className="risk-info">

              <p>
                <strong>
                  Location
                </strong>
              </p>

              <p>
                {currentRisk.location}
              </p>

              <p>
                <strong>
                  Contributing Factors
                </strong>
              </p>

              <ul>

                {currentRisk.factors.map(
                  (factor, index) => (

                    <li key={index}>
                      {factor}
                    </li>

                  )
                )}

              </ul>

            </div>

          </div>

          {/* RECOMMENDATION */}

          <div className="risk-box">

            <div className="section-title">

              <h2>
                💡 Driver Recommendation
              </h2>

            </div>

            <div className="risk-info">

              <p>
                <strong>
                  Recommended Action
                </strong>
              </p>

              <p>
                {currentRisk.recommendation}
              </p>

              {currentRisk.distance !== null && (

                <p>

                  <strong>
                    📍 Hotspot Distance
                  </strong>

                  <br />

                  {Math.round(
                    currentRisk.distance *
                      1000
                  )}{" "}
                  meters

                </p>

              )}

            </div>

          </div>

        </section>

        <section
          className={`alert-box ${getRiskClass()}`}
        >

          <div>

            <h2>
              {getAlertTitle()}
            </h2>

            <p>
              {currentRisk.recommendation}
            </p>

          </div>

        </section>
      </>
    );
  };

  // ========================================
  // SETTINGS PAGE
  // ========================================

  const renderSettings = () => {
    return (
      <>
        {renderHeader(
          "Settings",
          "Configure Accident Safety AI application preferences."
        )}

        <div className="risk-box">

          <div className="section-title">

            <h2>
              ⚙️ Application Settings
            </h2>

          </div>

          <div className="risk-info">

            <p>
              <strong>
                System Status
              </strong>
            </p>

            <p>
              🟢 Accident Safety AI is online
            </p>

            <p>
              <strong>
                Map Provider
              </strong>
            </p>

            <p>
              OpenStreetMap
            </p>

            <p>
              <strong>
                Routing Service
              </strong>
            </p>

            <p>
              OSRM
            </p>

            <p>
              <strong>
                Weather Service
              </strong>
            </p>

            <p>
              Open-Meteo
            </p>

            <p>
              <strong>
                Risk Analysis
              </strong>
            </p>

            <p>
              Hotspot proximity + weather
              conditions
            </p>

            <p>
              <strong>
                Machine Learning
              </strong>
            </p>

            <p>
              🔄 ML integration will be added
              in the next project stage.
            </p>

          </div>

        </div>
      </>
    );
  };

  // ========================================
  // SELECT PAGE
  // ========================================

  const renderPage = () => {

    if (activePage === "Live Map") {
      return renderLiveMap();
    }

    if (activePage === "Analytics") {
      return renderAnalytics();
    }

    if (activePage === "Safety Alerts") {
      return renderSafetyAlerts();
    }

    if (activePage === "Settings") {
      return renderSettings();
    }

    return renderDashboard();
  };

  // ========================================
  // MAIN APPLICATION
  // ========================================

  return (
    <div className="app">

      {renderSidebar()}

      <main className="main">

        {renderPage()}

      </main>

    </div>
  );
}

export default App;