import { useEffect, useMemo, useState } from "react";
import {
    getControls,
    getSummary,
    createControl,
    updateControlStatus
} from "./api/controlApi";
import "./App.css";

const statuses = [
    "Open",
    "InProgress",
    "PendingVerification",
    "Closed"
];

function App() {
    const [items, setItems] = useState([]);
    const [summary, setSummary] = useState({});
    const [area, setArea] = useState("Alle");
    const [type, setType] = useState("Alle");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        area: "HMS",
        type: "Avvik",
        title: "",
        severity: "Medium"
    });

    async function load() {
        try {
            setLoading(true);
            setError("");

            const [controlData, summaryData] = await Promise.all([
                getControls(),
                getSummary()
            ]);

            setItems(controlData);
            setSummary(summaryData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCreate(event) {
        event.preventDefault();

        if (!form.title.trim()) return;

        await createControl(form);

        setForm({
            area: form.area,
            type: form.type,
            title: "",
            severity: form.severity
        });

        await load();
    }

    async function handleStatus(id, status) {
        await updateControlStatus(id, status);
        await load();
    }

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const areaMatch =
                area === "Alle" || item.area === area;

            const typeMatch =
                type === "Alle" || item.type === type;

            return areaMatch && typeMatch;
        });
    }, [items, area, type]);

    return (
        <main className="app">
            <header className="hero">
                <div>
                    <span className="eyebrow">RAVENTA ENTERPRISE CONTROL</span>
                    <h1>Control Center</h1>
                    <p>
                        Én samlet kontrollsløyfe for HMS og Security.
                    </p>
                </div>

                <div className="system-status">
                    <span className="status-dot"></span>
                    SYSTEM ACTIVE
                </div>
            </header>

            {error && (
                <div className="error">
                    {error}
                </div>
            )}

            <section className="kpis">
                <div className="kpi">
                    <span>Totalt</span>
                    <strong>{summary.total ?? 0}</strong>
                </div>

                <div className="kpi">
                    <span>Åpne</span>
                    <strong>{summary.open ?? 0}</strong>
                </div>

                <div className="kpi">
                    <span>Under behandling</span>
                    <strong>{summary.inProgress ?? 0}</strong>
                </div>

                <div className="kpi">
                    <span>Til verifisering</span>
                    <strong>{summary.pendingVerification ?? 0}</strong>
                </div>

                <div className="kpi">
                    <span>Lukket</span>
                    <strong>{summary.closed ?? 0}</strong>
                </div>

                <div className="kpi critical">
                    <span>Kritiske</span>
                    <strong>{summary.critical ?? 0}</strong>
                </div>
            </section>

            <section className="workspace">
                <div className="panel">
                    <div className="panel-header">
                        <div>
                            <span className="section-label">REGISTRERING</span>
                            <h2>Ny kontrollregistrering</h2>
                        </div>
                    </div>

                    <form onSubmit={handleCreate} className="form">
                        <label>
                            Område
                            <select
                                value={form.area}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        area: e.target.value
                                    })
                                }
                            >
                                <option>HMS</option>
                                <option>Security</option>
                            </select>
                        </label>

                        <label>
                            Type
                            <select
                                value={form.type}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        type: e.target.value
                                    })
                                }
                            >
                                <option>Avvik</option>
                                <option>Hendelse</option>
                                <option>Risiko</option>
                                <option>Trussel</option>
                                <option>Sårbarhet</option>
                                <option>Forbedring</option>
                            </select>
                        </label>

                        <label className="wide">
                            Beskrivelse / tittel
                            <input
                                value={form.title}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        title: e.target.value
                                    })
                                }
                                placeholder="Hva har skjedd eller hva skal vurderes?"
                            />
                        </label>

                        <label>
                            Alvorlighet
                            <select
                                value={form.severity}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        severity: e.target.value
                                    })
                                }
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </label>

                        <button type="submit">
                            + Registrer
                        </button>
                    </form>
                </div>

                <div className="panel">
                    <div className="panel-header">
                        <div>
                            <span className="section-label">CONTROL LOOP</span>
                            <h2>Kontrollposter</h2>
                        </div>

                        <button
                            className="secondary"
                            onClick={load}
                        >
                            Oppdater
                        </button>
                    </div>

                    <div className="filters">
                        <select
                            value={area}
                            onChange={e => setArea(e.target.value)}
                        >
                            <option>Alle</option>
                            <option>HMS</option>
                            <option>Security</option>
                        </select>

                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                        >
                            <option>Alle</option>
                            <option>Avvik</option>
                            <option>Hendelse</option>
                            <option>Risiko</option>
                            <option>Trussel</option>
                            <option>Sårbarhet</option>
                            <option>Forbedring</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="empty">
                            Laster kontrollposter...
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="empty">
                            Ingen kontrollposter funnet.
                        </div>
                    ) : (
                        <div className="items">
                            {filteredItems.map(item => (
                                <article
                                    className="control-item"
                                    key={item.id}
                                >
                                    <div className="item-main">
                                        <div className="item-meta">
                                            <span className="badge">
                                                {item.area}
                                            </span>

                                            <span className="badge muted">
                                                {item.type}
                                            </span>

                                            <span
                                                className={`severity ${item.severity.toLowerCase()}`}
                                            >
                                                {item.severity}
                                            </span>
                                        </div>

                                        <h3>{item.title}</h3>

                                        <small>
                                            ID: {item.id}
                                        </small>
                                    </div>

                                    <select
                                        value={item.status}
                                        onChange={e =>
                                            handleStatus(
                                                item.id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        {statuses.map(status => (
                                            <option
                                                key={status}
                                                value={status}
                                            >
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <footer>
                <span>RAVENTA</span>
                <span>HMS + SECURITY</span>
                <span>CONTROL → RISK → ACTION → VERIFICATION → CLOSURE</span>
            </footer>
        </main>
    );
}

export default App;
