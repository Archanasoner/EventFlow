"use client";

import { FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Armchair,
  CalendarDays,
  CircleDollarSign,
  Download,
  Grid2X2,
  Hand,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import clsx from "clsx";

type LayoutItem = {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  cost: number;
};

type Guest = {
  id: string;
  name: string;
  group: string;
  status: string;
  seatItem?: string | null;
};

type Vendor = {
  id: string;
  name: string;
  category: string;
  cost: number;
  status: string;
};

type EventData = {
  id: string;
  title: string;
  venue: string;
  date: string;
  budgetLimit: number;
  layoutItems: LayoutItem[];
  guests: Guest[];
  vendors: Vendor[];
};

const palette = [
  { type: "table", label: "Round Table", width: 120, height: 96, color: "#2563eb", cost: 420 },
  { type: "stage", label: "Stage", width: 220, height: 86, color: "#0f766e", cost: 1800 },
  { type: "bar", label: "Bar", width: 150, height: 84, color: "#ea580c", cost: 1200 },
  { type: "booth", label: "Photo Booth", width: 132, height: 96, color: "#db2777", cost: 900 },
  { type: "dance", label: "Dance Floor", width: 220, height: 132, color: "#0891b2", cost: 1500 },
  { type: "food", label: "Food Station", width: 164, height: 92, color: "#65a30d", cost: 1350 },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDateInput = (date: string) => new Date(date).toISOString().slice(0, 10);

async function readApiResponse(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error ?? "Request failed");
  }

  return data;
}

export default function Home() {
  const [event, setEvent] = useState<EventData | null>(null);
  const [items, setItems] = useState<LayoutItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [mode, setMode] = useState<"move" | "grid">("move");
  const [status, setStatus] = useState("Loading planner");
  const [guestName, setGuestName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorCost, setVendorCost] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventBudget, setEventBudget] = useState("");
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then(readApiResponse)
      .then((data: EventData) => {
        setEvent(data);
        setItems(data.layoutItems);
        setEventTitle(data.title);
        setEventVenue(data.venue);
        setEventDate(formatDateInput(data.date));
        setEventBudget(String(data.budgetLimit));
        setSelectedId(data.layoutItems[0]?.id ?? null);
        setStatus("Synced");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : "Could not load event"));
  }, []);

  const selected = items.find((item) => item.id === selectedId) ?? null;

  const layoutCost = useMemo(() => items.reduce((sum, item) => sum + item.cost, 0), [items]);
  const vendorCostTotal = useMemo(
    () => event?.vendors.reduce((sum, vendor) => sum + vendor.cost, 0) ?? 0,
    [event],
  );
  const spent = layoutCost + vendorCostTotal;
  const budgetPercent = event ? Math.min(100, Math.round((spent / event.budgetLimit) * 100)) : 0;

  function addItem(template: (typeof palette)[number]) {
    const id = crypto.randomUUID();
    const next = {
      ...template,
      id,
      x: 90 + items.length * 18,
      y: 90 + items.length * 12,
      rotation: 0,
    };
    setItems((current) => [...current, next]);
    setSelectedId(id);
    setStatus("Unsaved changes");
  }

  function updateSelected(patch: Partial<LayoutItem>) {
    if (!selectedId) return;
    setItems((current) => current.map((item) => (item.id === selectedId ? { ...item, ...patch } : item)));
    setStatus("Unsaved changes");
  }

  function removeSelected() {
    if (!selectedId) return;
    setItems((current) => current.filter((item) => item.id !== selectedId));
    setSelectedId(null);
    setStatus("Unsaved changes");
  }

  function startDrag(pointerEvent: PointerEvent, item: LayoutItem) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSelectedId(item.id);
    setDrag({
      id: item.id,
      offsetX: pointerEvent.clientX - rect.left - item.x,
      offsetY: pointerEvent.clientY - rect.top - item.y,
    });
  }

  function moveDrag(pointerEvent: PointerEvent) {
    if (!drag) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const snap = mode === "grid" ? 20 : 1;
    const x = Math.max(0, Math.round((pointerEvent.clientX - rect.left - drag.offsetX) / snap) * snap);
    const y = Math.max(0, Math.round((pointerEvent.clientY - rect.top - drag.offsetY) / snap) * snap);
    setItems((current) => current.map((item) => (item.id === drag.id ? { ...item, x, y } : item)));
    setStatus("Unsaved changes");
  }

  async function saveLayout() {
    if (!event) {
      setStatus("Event not loaded");
      return;
    }
    setStatus("Saving");
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutItems: items }),
      });
      const data = await readApiResponse(response);
      setEvent(data);
      setItems(data.layoutItems);
      setStatus("Saved");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed");
    }
  }

  async function saveEventDetails(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!event) return;
    setStatus("Saving details");
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventTitle.trim() || event.title,
          venue: eventVenue.trim() || event.venue,
          date: eventDate,
          budgetLimit: Number(eventBudget || event.budgetLimit),
        }),
      });
      const updatedEvent = await readApiResponse(response);
      setEvent(updatedEvent);
      setEventTitle(updatedEvent.title);
      setEventVenue(updatedEvent.venue);
      setEventDate(formatDateInput(updatedEvent.date));
      setEventBudget(String(updatedEvent.budgetLimit));
      setStatus("Details saved");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Details save failed");
    }
  }

  async function addGuest(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!event) {
      setStatus("Event still loading");
      return;
    }
    if (!guestName.trim()) {
      setStatus("Enter guest name");
      return;
    }
    setIsAddingGuest(true);
    setStatus("Adding guest");
    try {
      const response = await fetch(`/api/events/${event.id}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: guestName.trim(), group: selected?.label ?? "General", seatItem: selected?.label }),
      });
      const updatedEvent = await readApiResponse(response);
      setEvent(updatedEvent);
      setGuestName("");
      setStatus("Guest added");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Guest add failed");
    } finally {
      setIsAddingGuest(false);
    }
  }

  async function addVendor(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!event) {
      setStatus("Event still loading");
      return;
    }
    if (!vendorName.trim()) {
      setStatus("Enter vendor name");
      return;
    }
    setIsAddingVendor(true);
    setStatus("Adding vendor");
    try {
      const response = await fetch(`/api/events/${event.id}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: vendorName.trim(), category: "Custom", cost: Number(vendorCost || 0) }),
      });
      const updatedEvent = await readApiResponse(response);
      setEvent(updatedEvent);
      setVendorName("");
      setVendorCost("");
      setStatus("Vendor added");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Vendor add failed");
    } finally {
      setIsAddingVendor(false);
    }
  }

  function exportJson() {
    const payload = JSON.stringify({ event, layoutItems: items }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "event-layout.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Sparkles size={26} />
          <div>
            <h1>EventFlow Studio</h1>
            <span>{status}</span>
          </div>
        </div>

        <section className="panel">
          <div className="panelTitle">
            <Grid2X2 size={18} />
            <h2>Objects</h2>
          </div>
          <div className="palette">
            {palette.map((template) => (
              <button key={template.type} onClick={() => addItem(template)} style={{ borderColor: template.color }}>
                <Plus size={15} />
                {template.label}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panelTitle">
            <Hand size={18} />
            <h2>Inspector</h2>
          </div>
          {selected ? (
            <div className="inspector">
              <label>
                Label
                <input value={selected.label} onChange={(event) => updateSelected({ label: event.target.value })} />
              </label>
              <div className="split">
                <label>
                  Width
                  <input
                    type="number"
                    value={selected.width}
                    onChange={(event) => updateSelected({ width: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Height
                  <input
                    type="number"
                    value={selected.height}
                    onChange={(event) => updateSelected({ height: Number(event.target.value) })}
                  />
                </label>
              </div>
              <label>
                Cost
                <input
                  type="number"
                  value={selected.cost}
                  onChange={(event) => updateSelected({ cost: Number(event.target.value) })}
                />
              </label>
              <div className="toolbar">
                <button onClick={() => updateSelected({ rotation: (selected.rotation + 15) % 360 })}>
                  <RotateCcw size={16} />
                </button>
                <button className="danger" onClick={removeSelected}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <p className="muted">Select an object</p>
          )}
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              <CalendarDays size={16} />
              {event ? new Date(event.date).toLocaleDateString() : "Loading"}
            </p>
            <h2>{event?.title ?? "Event planner"}</h2>
            <span>{event?.venue ?? "Venue"}</span>
          </div>
          <div className="actions">
            <button className={clsx(mode === "grid" && "active")} onClick={() => setMode(mode === "grid" ? "move" : "grid")}>
              <Grid2X2 size={17} />
              Grid
            </button>
            <button onClick={exportJson}>
              <Download size={17} />
              Export
            </button>
            <button className="primary" onClick={saveLayout}>
              <Save size={17} />
              Save
            </button>
          </div>
        </header>

        <div
          ref={canvasRef}
          className={clsx("canvas", mode === "grid" && "showGrid")}
          onPointerMove={moveDrag}
          onPointerUp={() => setDrag(null)}
          onPointerLeave={() => setDrag(null)}
        >
          <div className="entrance">Entrance</div>
          {items.map((item) => (
            <button
              key={item.id}
              className={clsx("layoutItem", selectedId === item.id && "selected")}
              onPointerDown={(event) => startDrag(event, item)}
              style={{
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
                backgroundColor: item.color,
                transform: `rotate(${item.rotation}deg)`,
              }}
            >
              <span>{item.label}</span>
              <small>{formatCurrency(item.cost)}</small>
            </button>
          ))}
        </div>
      </section>

      <aside className="rightRail">
        <section className="panel">
          <div className="panelTitle">
            <MapPin size={18} />
            <h2>Event Details</h2>
          </div>
          <form className="detailsForm" onSubmit={saveEventDetails}>
            <label>
              Title
              <input value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} placeholder="Event title" />
            </label>
            <label>
              Venue
              <input value={eventVenue} onChange={(event) => setEventVenue(event.target.value)} placeholder="Venue name" />
            </label>
            <div className="split">
              <label>
                Date
                <input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
              </label>
              <label>
                Budget
                <input
                  type="number"
                  value={eventBudget}
                  onChange={(event) => setEventBudget(event.target.value)}
                  placeholder="Budget"
                />
              </label>
            </div>
            <button className="wideButton" type="submit">
              <Save size={16} />
              Save Details
            </button>
          </form>
        </section>

        <section className="metric">
          <div className="panelTitle">
            <CircleDollarSign size={18} />
            <h2>Budget</h2>
          </div>
          <strong>{formatCurrency(spent)}</strong>
          <span>of {formatCurrency(event?.budgetLimit ?? 0)}</span>
          <div className="meter">
            <i style={{ width: `${budgetPercent}%` }} />
          </div>
        </section>

        <section className="panel">
          <div className="panelTitle">
            <Users size={18} />
            <h2>Guests</h2>
          </div>
          <form className="inlineForm" onSubmit={addGuest}>
            <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Guest name" />
            <button type="submit" disabled={isAddingGuest}>
              <Plus size={16} />
              <span>Add</span>
            </button>
          </form>
          <div className="list">
            {event?.guests.map((guest) => (
              <div key={guest.id} className="row">
                <Armchair size={15} />
                <div>
                  <strong>{guest.name}</strong>
                  <span>{guest.seatItem ?? guest.group}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panelTitle">
            <CircleDollarSign size={18} />
            <h2>Vendors</h2>
          </div>
          <form className="vendorForm" onSubmit={addVendor}>
            <input value={vendorName} onChange={(event) => setVendorName(event.target.value)} placeholder="Vendor" />
            <input value={vendorCost} onChange={(event) => setVendorCost(event.target.value)} placeholder="Cost" type="number" />
            <button type="submit" disabled={isAddingVendor}>
              <Plus size={16} />
              <span>Add</span>
            </button>
          </form>
          <div className="list">
            {event?.vendors.map((vendor) => (
              <div key={vendor.id} className="row">
                <div>
                  <strong>{vendor.name}</strong>
                  <span>{vendor.category}</span>
                </div>
                <b>{formatCurrency(vendor.cost)}</b>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}
