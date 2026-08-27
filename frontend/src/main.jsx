import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const API = "http://localhost:5000/api";

const initialItems = [
    {
        id: "demo-1",
        area: "HMS",
        type: "Avvik",
        title: "Eksempel på HMS-avvik",
        severity: "Medium",
        status: "Open"
    },
    {
        id: "demo-2",
        area: "Security",
        type: "Sikkerhetshendelse",
        title: "Eksempel på sikkerhetshendelse",
        severity: "High",
        status: "InProgress"
    }
];

const statuses = [
    ["Open", "Åpen"],
    ["InProgress", "Pågår"],
    ["PendingVerification", "Til verifisering"],
    ["Closed", "Lukket"]
];

function App() {
    const [items, setItems] = useState(initialItems);
    const [area, setArea] = useState("Alle");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        area: "HMS",
        type: "Avvik",
        title: "",
        severity: "Medium"
    });

    async function loadItems() {
        try {
            setLoading(true);
            const response = await fetch(`${API}/control`);

            if (!response.ok) throw new Error();

            setItems(await response.json());
            setError("");
        } catch {
            setError("API ikke tilgjengelig – viser lokal visning.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadItems();
    }, []);

    async function createItem(event) {
        event.preventDefault();

        if (!form.title.trim()) return;

        try {
            const response = await fetch(`${API}/control`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!response.ok) throw new Error();

            const created = await response.json();
            setItems(current => [created, ...current]);
            setForm(current => ({ ...current, title: "" }));
        } catch {
            setItems(current => [
                {
                    ...form,
                    id: crypto.randomUUID(),
                    status: "Open"
                },
                ...current
            ]);
            setForm(current => ({ ...current, title: "" }));
        }
    }

    async function updateStatus(id, status) {
        try {
            const response = await fetch(`${API}/control/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error();
        } catch {
            // Lokal fallback
        }

        setItems(current =>
            current.map(item =>
                item.id === id ? { ...item, status } : item
            )
        );
    }

    const filtered = useMemo(() => {
        if (area === "Alle") return items;
        return items.filter(item => item.area === area);
    }, [items, area]);

    const summary = {
        total: items.length,
        open: items.filter(x => x.status === "Open").length,
        progress: items.filter(x => x.status === "InProgress").length,
        verification: items.filter(x => x.status === "PendingVerification").length,
        closed: items.filter(x => x.status === "Closed").length,
        critical: items.filter(x => x.severity === "Critical").length
    };

    return (
        <main className="app">
            <header className="header">
                <div>
                    <div className="eyebrow">RAVENTA ENTERPRISE</div>
                    <h1>Control Center</h1>
                    <p>HMS + Security i én samlet kontrollsløyfe</p>
                </div>

                <div className="status">
                    <span className="dot" />
                    System
                </div>
            </header>

            <section className="kpis">
                <Kpi label="Totalt" value={summary.total} />
                <Kpi label="Åpne" value={summary.open} />
                <Kpi label="Pågår" value={summary.progress} />
                <Kpi label="Verifisering" value={summary.verification} />
                <Kpi label="Lukket" value={summary.closed} />
                <Kpi label="Kritiske" value={summary.critical} />
            </section>

            <section className="grid">
                <div className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>Ny registrering</h2>
                            <span>HMS eller Security</span>
                        </div>
                    </div>

                    <form onSubmit={createItem}>
                        <label>
                            Område
                            <select
                                value={form.area}
                                onChange={e =>
                                    setForm({ ...form, area: e.target.value })
                                }
                            >
                                <option>HMS</option>
                                <option>Security</option>
                            </select>
                        </label>

                        <label>
                            Type
                            <input
                                value={form.type}
                                onChange={e =>
                                    setForm({ ...form, type: e.target.value })
                                }
                            />
                        </label>

                        <label>
                            Tittel
                            <input
                                value={form.title}
                                onChange={e =>
                                    setForm({ ...form, title: e.target.value })
                                }
                                placeholder="Hva skal registreres?"
                            />
                        </label>

                        <label>
                            Alvorlighet
                            <select
                                value={form.severity}
                                onChange={e =>
                                    setForm({ ...form, severity: e.target.value })
                                }
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </label>

                        <button type="submit">+ Registrer</button>
                    </form>
                </div>

                <div className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>Kontrolloversikt</h2>
                            <span>
                                Registrering → risiko → tiltak → verifisering → lukking
                            </span>
                        </div>

                        <div className="filters">
                            {["Alle", "HMS", "Security"].map(value => (
                                <button
                                    key={value}
                                    className={area === value ? "active" : ""}
                                    onClick={() => setArea(value)}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className="notice">{error}</div>}
                    {loading && <div className="notice">Laster...</div>}

                    <div className="records">
                        {filtered.map(item => (
                            <article className="record" key={item.id}>
                                <div className="record-main">
                                    <div className="record-top">
                                        <span className={`badge ${item.area.toLowerCase()}`}>
                                            {item.area}
                                        </span>
                                        <span>{item.type}</span>
                                    </div>

                                    <strong>{item.title}</strong>

                                    <small>
                                        Alvorlighet: {item.severity}
                                    </small>
                                </div>

                                <select
                                    value={item.status}
                                    onChange={e =>
                                        updateStatus(item.id, e.target.value)
                                    }
                                >
                                    {statuses.map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </article>
                        ))}

                        {!filtered.length && (
                            <div className="empty">
                                Ingen registreringer.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="modules">
                <Module title="HMS" items={[
                    "Avvik",
                    "Hendelser",
                    "Risiko",
                    "Tiltak",
                    "Inspeksjoner",
                    "Undersøkelser",
                    "Kompetanse",
                    "Dokumentasjon",
                    "Revisjon",
                    "Analyse"
                ]} />

                <Module title="Security" items={[
                    "Sikkerhetshendelser",
                    "Trusler",
                    "Sårbarheter",
                    "Risiko",
                    "Sikkerhetstiltak",
                    "Evidens",
                    "Vurderinger",
                    "Compliance",
                    "Audit trail"
                ]} />
            </section>

            <footer>
                RAVENTA Control Center · HMS + Security
            </footer>
        </main>
    );
}

function Kpi({ label, value }) {
    return (
        <div className="kpi">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

function Module({ title, items }) {
    return (
        <div className="module">
            <h2>{title}</h2>
            <div className="module-list">
                {items.map(item => (
                    <span key={item}>{item}</span>
                ))}
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
