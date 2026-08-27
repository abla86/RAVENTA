import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

const API = "http://localhost:5000/api";

function App() {
  const [area, setArea] = useState("hms");
  const [records, setRecords] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [status, setStatus] = useState("Kobler til API...");

  const refresh = () => {
    fetch(`${API}/records?domain=${area}`)
      .then(r => r.json())
      .then(data => {
        setRecords(data);
        setStatus("Tilkoblet API (SQLite DB Aktiv)");
      })
      .catch(() => {
        setStatus("Frakoblet: Backend starter opp...");
      });
  };

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [area]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    fetch(`${API}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: area,
        title,
        description: desc,
        severity,
        status: "Åpen",
        responsible: "Bruker"
      })
    }).then(() => {
      setTitle("");
      setDesc("");
      refresh();
    });
  };

  const updateStatus = (id, newStatus) => {
    fetch(`${API}/records/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    }).then(() => refresh());
  };

  return (
    <div style={{ maxWidth: 960, margin: "30px auto", padding: "0 20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, color: "#38bdf8", fontSize: 26, letterSpacing: "1px" }}>RAVENTA</h1>
          <span style={{ fontSize: 13, color: status.includes("Tilkoblet") ? "#4ade80" : "#f87171" }}>
            ● {status}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {["hms", "security"].map((d) => (
            <button
              key={d}
              onClick={() => setArea(d)}
              style={{
                padding: "8px 20px",
                background: area === d ? "#0284c7" : "#1e293b",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: "bold",
                cursor: "pointer",
                textTransform: "uppercase"
              }}>
              {d}
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24, marginTop: 24 }}>
        <form onSubmit={handleCreate} style={{ background: "#0f172a", padding: 20, borderRadius: 8, border: "1px solid #1e293b", height: "fit-content" }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: 16 }}>Ny {area.toUpperCase()}-registrering</h3>
          
          <label style={{ fontSize: 12, color: "#94a3b8" }}>Tittel</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Kort tittel..."
            style={{ width: "100%", padding: 9, boxSizing: "border-box", margin: "4px 0 12px 0", background: "#1e293b", border: "1px solid #334155", color: "#fff", borderRadius: 4 }}
          />

          <label style={{ fontSize: 12, color: "#94a3b8" }}>Beskrivelse</label>
          <textarea
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Hva har skjedd?"
            style={{ width: "100%", padding: 9, boxSizing: "border-box", margin: "4px 0 12px 0", background: "#1e293b", border: "1px solid #334155", color: "#fff", borderRadius: 4 }}
          />

          <label style={{ fontSize: 12, color: "#94a3b8" }}>Alvorlighetsgrad</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            style={{ width: "100%", padding: 9, margin: "4px 0 18px 0", background: "#1e293b", border: "1px solid #334155", color: "#fff", borderRadius: 4 }}>
            <option value="Lav">Lav</option>
            <option value="Medium">Medium</option>
            <option value="Høy">Høy</option>
            <option value="Kritisk">Kritisk</option>
          </select>

          <button type="submit" style={{ width: "100%", padding: 10, background: "#0284c7", border: "none", borderRadius: 4, color: "#fff", fontWeight: "bold", cursor: "pointer" }}>
            Lagre i database
          </button>
        </form>

        <div>
          <h3 style={{ margin: "0 0 14px 0", fontSize: 16 }}>Aktive saker ({records.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {records.map((r) => (
              <div key={r.id} style={{ background: "#0f172a", padding: 16, borderRadius: 8, border: "1px solid #1e293b", borderLeft: "4px solid #38bdf8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <h4 style={{ margin: 0, fontSize: 16 }}>{r.title}</h4>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: r.severity === "Kritisk" ? "#881337" : "#0369a1", color: "#fff", fontWeight: "bold" }}>
                    {r.severity}
                  </span>
                </div>
                <p style={{ margin: "0 0 12px 0", color: "#94a3b8", fontSize: 14 }}>{r.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1e293b", paddingTop: 10 }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Status: <strong style={{ color: "#cbd5e1" }}>{r.status}</strong></span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {r.status !== "Under arbeid" && (
                      <button onClick={() => updateStatus(r.id, "Under arbeid")} style={{ background: "#1e293b", border: "1px solid #334155", color: "#38bdf8", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                        Igangsett
                      </button>
                    )}
                    {r.status !== "Lukket" && (
                      <button onClick={() => updateStatus(r.id, "Lukket")} style={{ background: "#064e3b", border: "none", color: "#4ade80", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                        Lukk
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
