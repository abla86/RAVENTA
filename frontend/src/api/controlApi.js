const API = "http://localhost:5000/api";

async function request(url, options = {}) {
    const response = await fetch(`${API}${url}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API-feil ${response.status}`);
    }

    return response.json();
}

export const getControls = () => request("/control");
export const getSummary = () => request("/control/summary");

export const createControl = (data) =>
    request("/control", {
        method: "POST",
        body: JSON.stringify(data)
    });

export const updateControlStatus = (id, status) =>
    request(`/control/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
    });
