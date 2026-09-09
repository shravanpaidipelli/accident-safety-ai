import Map from "./components/map";
function App() {
  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          🚗 <span>Accident Safety AI</span>
        </div>

        <nav>
          <a className="active">Dashboard</a>
          <a>Live Map</a>
          <a>Analytics</a>
          <a>Safety Alerts</a>
          <a>Settings</a>
        </nav>

        <div className="sidebar-bottom">
          <p>AI Road Safety System</p>
          <small>ML Powered</small>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">

        {/* Header */}
        <header className="header">
          <div>
            <h1>Accident Safety Dashboard</h1>
            <p>Monitor accident hotspots and road risk in real time.</p>
          </div>

          <div className="status">
            ● System Online
          </div>
        </header>

        {/* Statistics */}
        <section className="stats">

          <div className="card">
            <div className="card-icon">🔴</div>
            <div>
              <p>High Risk Hotspots</p>
              <h2>24</h2>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">🟠</div>
            <div>
              <p>Medium Risk Hotspots</p>
              <h2>38</h2>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">🚨</div>
            <div>
              <p>Accidents Analyzed</p>
              <h2>1,248</h2>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">🛣️</div>
            <div>
              <p>Safer Routes</p>
              <h2>86</h2>
            </div>
          </div>

        </section>

        {/* Main Dashboard */}
        <section className="dashboard-grid">

          {/* Map */}
          <div className="map-box">
            <div className="section-title">
              <h2>Accident Hotspot Map</h2>
              <button>View Full Map</button>
            </div>

            <div className="map-placeholder">
  <Map />
</div>
          </div>

          {/* Risk Analysis */}
          <div className="risk-box">

            <div className="section-title">
              <h2>Current Risk</h2>
            </div>

            <div className="risk-level">
              <span>HIGH</span>
              <p>Accident Risk</p>
            </div>

            <div className="risk-info">
              <p><strong>Location</strong></p>
              <p>Road Junction - Area 24</p>

              <p><strong>Contributing Factors</strong></p>

              <ul>
                <li>Sharp Curve</li>
                <li>Heavy Traffic</li>
                <li>Poor Lighting</li>
                <li>Overspeeding</li>
              </ul>
            </div>

          </div>

        </section>

        {/* Alert */}
        <section className="alert-box">
          <div>
            <h2>⚠️ Accident Hotspot Ahead</h2>
            <p>
              High-risk location detected 350 meters ahead.
              Reduce speed and avoid overtaking.
            </p>
          </div>

          <button>View Details</button>
        </section>

      </main>

    </div>
  )
}

export default App