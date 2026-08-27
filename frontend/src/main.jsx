import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const statusOptions = [
    ["Åpen", "Åpen"],
    ["Under arbeid", "Under arbeid"],
    ["Til verifisering", "Til verifisering"],
    ["Lukket", "Lukket"]
];

const initialForm = {
    domain: "hms",
    title: "",
    description: "",
    severity: "Medium"
};

async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
        ...options
    });

    if (!response.ok) {
        throw new Error(`API-feil ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
}

function App() {
    const [items, setItems] = useState([]);
    const [domain, setDomain] = useState("alle");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState(initialForm);

    async function loadItems() {
        setLoading(true);
        setError("");

        try {
            setItems(await request("/records"));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadItems();
    }, []);

    async function createItem(event) {
        event.preventDefault();

        if (!form.title.trim()) {
            setError("Tittel må fylles ut.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            await request("/records", {
                method: "POST",
                body: JSON.stringify({
                    domain: form.domain,
                    title: form.title.trim(),
                    description: form.description.trim(),
                    severity: form.severity,
                    status: "Åpen"
                })
            });

            setForm({ ...initialForm });
            await loadItems();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function updateStatus(id, status) {
        setError("");

        try {
            await request(`/records/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status })
            });

            setItems(current =>
                current.map(item =>
                    item.id === id ? { ...item, status } : item
                )
            );
        } catch (err) {
            setError(err.message);
        }
    }

    const filtered = useMemo(() => {
        if (domain === "alle") return items;
        return items.filter(item => item.domain === domain);
    }, [items, domain]);

    const summary = {
        total: items.length,
        open: items.filter(x => x.status === "Åpen").length,
        progress: items.filter(x => x.status === "Under arbeid").length,
        verification: items.filter(x => x.status === "Til verifisering").length,
        closed: items.filter(x => x.status === "Lukket").length,
        critical: items.filter(x => x.severity === "Kritisk" || x.severity === "Critical").length
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
                    SYSTEM ACTIVE
                </div>
            </header>

            {error && <div className="notice error">{error}</div>}

            <section className="kpis">
                <Kpi label="Totalt" value={summary.total} />
                <Kpi label="Åpne" value={summary.open} />
                <Kpi label="Under arbeid" value={summary.progress} />
                <Kpi label="Verifisering" value={summary.verification} />
                <Kpi label="Lukket" value={summary.closed} />
                <Kpi label="Kritiske" value={summary.critical} />
            </section>

            <section className="grid">
                <div className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>Ny registrering</h2>
                            <span>Registrer HMS- eller Security-forhold</span>
                        </div>
                    </div>

                    <form onSubmit={createItem}>
                        <label>
                            Område
                            <select
                                value={form.domain}
                                onChange={e => setForm({ ...form, domain: e.target.value })}
                            >
                                <option value="hms">HMS</option>
                                <option value="security">Security</option>
                            </select>
                        </label>

                        <label>
                            Tittel
                            <input
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="Hva skal registreres?"
                            />
                        </label>

                        <label>
                            Beskrivelse
                            <textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Kort beskrivelse"
                                rows="4"
                            />
                        </label>

                        <label>
                            Alvorlighet
                            <select
                                value={form.severity}
                                onChange={e => setForm({ ...form, severity: e.target.value })}
                            >
                                <option>Lav</option>
                                <option>Medium</option>
                                <option>Høy</option>
                                <option>Kritisk</option>
                            </select>
                        </label>

                        <button type="submit" disabled={saving}>
                            {saving ? "Lagrer..." : "+ Registrer"}
                        </button>
                    </form>
                </div>

                <div className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>Kontrolloversikt</h2>
                            <span>Registrering → risiko → tiltak → verifisering → lukking</span>
                        </div>

                        <div className="filters">
                            {[
                                ["alle", "Alle"],
                                ["hms", "HMS"],
                                ["security", "Security"]
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    className={domain === value ? "active" : ""}
                                    onClick={() => setDomain(value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading && <div className="notice">Laster registreringer...</div>}

                    {!loading && !filtered.length && (
                        <div className="empty">Ingen registreringer.</div>
                    )}

                    <div className="records">
                        {filtered.map(item => (
                            <article className="record" key={item.id}>
                                <div className="record-main">
                                    <div className="record-top">
                                        <span className={`badge ${item.domain}`}>
                                            {item.domain === "hms" ? "HMS" : "Security"}
                                        </span>
                                        <span>{item.severity}</span>
                                    </div>

                                    <strong>{item.title}</strong>

                                    {item.description && <p>{item.description}</p>}

                                    <small>
                                        Opprettet {new Date(item.createdAtUtc).toLocaleString("nb-NO")}
                                    </small>
                                </div>

                                <select
                                    value={item.status}
                                    onChange={e => updateStatus(item.id, e.target.value)}
                                >
                                    {statusOptions.map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="modules">
                <Module title="HMS" items={[
                    "Avvik", "Hendelser", "Risiko", "Tiltak", "Inspeksjoner",
                    "Undersøkelser", "Kompetanse", "Dokumentasjon", "Revisjon", "Analyse"
                ]} />

                <Module title="Security" items={[
                    "Sikkerhetshendelser", "Trusler", "Sårbarheter", "Risiko",
                    "Sikkerhetstiltak", "Evidens", "Vurderinger", "Compliance", "Audit trail"
                ]} />
            </section>

            <footer>RAVENTA Control Center · HMS + Security</footer>
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
                {items.map(item => <span key={item}>{item}</span>)}
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
);
