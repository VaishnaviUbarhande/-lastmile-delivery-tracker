import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi, zoneApi, rateCardApi, userApi } from '../api/endpoints';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';

const TABS = ['Orders', 'Zones', 'Rate Cards', 'Agents'];
const ALL_STATUSES = [
  'Created',
  'Assigned',
  'Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Failed',
  'Rescheduled',
  'Cancelled',
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Orders');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              tab === t ? 'bg-brand-600 text-white' : 'bg-white border text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Orders' && <OrdersPanel />}
      {tab === 'Zones' && <ZonesPanel />}
      {tab === 'Rate Cards' && <RateCardsPanel />}
      {tab === 'Agents' && <AgentsPanel />}
    </div>
  );
}

// ---------------- Orders Panel ----------------
function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [zones, setZones] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filters, setFilters] = useState({ status: '', zone: '', agent: '' });
  const [selected, setSelected] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideNote, setOverrideNote] = useState('');

  const load = async () => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => v && (params[k] = v));
    const res = await orderApi.list(params);
    setOrders(res.data.data);
  };

  useEffect(() => {
    zoneApi.list().then((r) => setZones(r.data.data));
    userApi.list('agent').then((r) => setAgents(r.data.data));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const refreshSelected = async (id) => {
    const res = await orderApi.getById(id);
    setSelected(res.data.data);
  };

  const handleAutoAssign = async (id) => {
    try {
      await orderApi.autoAssign(id);
      toast.success('Agent auto-assigned');
      load();
      refreshSelected(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Auto-assign failed');
    }
  };

  const handleManualAssign = async (id, agentId) => {
    if (!agentId) return;
    try {
      await orderApi.assign(id, agentId);
      toast.success('Agent assigned');
      load();
      refreshSelected(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleOverride = async () => {
    if (!overrideStatus) return;
    try {
      await orderApi.override(selected._id, overrideStatus, overrideNote);
      toast.success('Status overridden');
      setOverrideStatus('');
      setOverrideNote('');
      load();
      refreshSelected(selected._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Override failed');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <div className="flex gap-2 mb-4">
          <select
            className="border rounded-md px-2 py-1.5 text-sm"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="border rounded-md px-2 py-1.5 text-sm"
            value={filters.zone}
            onChange={(e) => setFilters((f) => ({ ...f, zone: e.target.value }))}
          >
            <option value="">All zones</option>
            {zones.map((z) => (
              <option key={z._id} value={z._id}>
                {z.name}
              </option>
            ))}
          </select>
          <select
            className="border rounded-md px-2 py-1.5 text-sm"
            value={filters.agent}
            onChange={(e) => setFilters((f) => ({ ...f, agent: e.target.value }))}
          >
            <option value="">All agents</option>
            {agents.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {orders.map((o) => (
            <div
              key={o._id}
              onClick={() => setSelected(o)}
              className={`bg-white border rounded-lg p-4 cursor-pointer hover:border-brand-400 ${
                selected?._id === o._id ? 'border-brand-600 ring-1 ring-brand-200' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-sm">{o.orderNumber}</span>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-xs text-gray-500">
                {o.customer?.name} · {o.pickupAddress.city} → {o.dropAddress.city} · ₹{o.charge.totalCharge}
              </p>
              <p className="text-xs text-gray-400">
                Agent: {o.assignedAgent?.name || 'Unassigned'}
              </p>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-gray-400">No orders match these filters.</p>}
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 h-fit">
        {!selected ? (
          <p className="text-gray-400 text-sm">Select an order to manage assignment & status.</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{selected.orderNumber}</h3>
              <StatusBadge status={selected.status} />
            </div>

            <div className="mb-4 space-y-1 text-sm text-gray-600">
              <p>
                <strong>Customer:</strong> {selected.customer?.name} ({selected.customer?.phone})
              </p>
              <p>
                <strong>Route:</strong> {selected.pickupZone?.name} → {selected.dropZone?.name}
              </p>
              <p>
                <strong>Charge:</strong> ₹{selected.charge.totalCharge} ({selected.paymentType})
              </p>
            </div>

            <div className="border-t pt-3 mb-4">
              <h4 className="text-sm font-semibold mb-2">Assign Agent</h4>
              <div className="flex gap-2">
                <select
                  className="border rounded-md px-2 py-1.5 text-sm flex-1"
                  onChange={(e) => handleManualAssign(selected._id, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select agent to manually assign
                  </option>
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} {a.agentProfile?.isAvailable ? '(Available)' : '(Unavailable)'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAutoAssign(selected._id)}
                  className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-md whitespace-nowrap"
                >
                  Auto-Assign Nearest
                </button>
              </div>
            </div>

            <div className="border-t pt-3 mb-4">
              <h4 className="text-sm font-semibold mb-2">Override Status</h4>
              <div className="flex gap-2 mb-2">
                <select
                  className="border rounded-md px-2 py-1.5 text-sm flex-1"
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                >
                  <option value="">Select new status</option>
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <input
                placeholder="Reason / audit note"
                className="border rounded-md px-2 py-1.5 text-sm w-full mb-2"
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
              />
              <button
                onClick={handleOverride}
                className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-md"
              >
                Apply Override
              </button>
            </div>

            <div className="border-t pt-3">
              <h4 className="text-sm font-semibold mb-2">Tracking Timeline</h4>
              <OrderTimeline history={selected.trackingHistory} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------- Zones Panel ----------------
function ZonesPanel() {
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', pincodes: '', areas: '' });

  const load = () => zoneApi.list().then((r) => setZones(r.data.data));
  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    try {
      await zoneApi.create({
        name: form.name,
        description: form.description,
        pincodes: form.pincodes.split(',').map((p) => p.trim()).filter(Boolean),
        areas: form.areas.split(',').map((a) => a.trim()).filter(Boolean),
      });
      toast.success('Zone created');
      setForm({ name: '', description: '', pincodes: '', areas: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create zone');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Create Zone</h3>
        <input
          placeholder="Zone name"
          className="border rounded-md px-3 py-2 text-sm w-full mb-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Description"
          className="border rounded-md px-3 py-2 text-sm w-full mb-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="Pincodes (comma-separated)"
          className="border rounded-md px-3 py-2 text-sm w-full mb-2"
          value={form.pincodes}
          onChange={(e) => setForm({ ...form, pincodes: e.target.value })}
        />
        <input
          placeholder="Areas / cities (comma-separated)"
          className="border rounded-md px-3 py-2 text-sm w-full mb-3"
          value={form.areas}
          onChange={(e) => setForm({ ...form, areas: e.target.value })}
        />
        <button onClick={handleCreate} className="bg-brand-600 text-white text-sm px-4 py-2 rounded-md">
          Create Zone
        </button>
      </div>

      <div className="space-y-3">
        {zones.map((z) => (
          <div key={z._id} className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-sm">{z.name}</h4>
            <p className="text-xs text-gray-500">{z.description}</p>
            <p className="text-xs text-gray-400 mt-1">Pincodes: {z.pincodes.join(', ') || '—'}</p>
            <p className="text-xs text-gray-400">Areas: {z.areas.join(', ') || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Rate Cards Panel ----------------
function RateCardsPanel() {
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({
    orderType: 'B2C',
    baseFare: '',
    baseWeightKg: '',
    perKgIntraZone: '',
    perKgInterZone: '',
    codSurchargeType: 'flat',
    codSurchargeValue: '',
  });

  const load = () => rateCardApi.list().then((r) => setCards(r.data.data));
  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    try {
      await rateCardApi.upsert({
        ...form,
        baseFare: Number(form.baseFare),
        baseWeightKg: Number(form.baseWeightKg),
        perKgIntraZone: Number(form.perKgIntraZone),
        perKgInterZone: Number(form.perKgInterZone),
        codSurchargeValue: Number(form.codSurchargeValue),
      });
      toast.success('Rate card saved');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save rate card');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Configure Rate Card</h3>
        <select
          className="border rounded-md px-3 py-2 text-sm w-full mb-2"
          value={form.orderType}
          onChange={(e) => setForm({ ...form, orderType: e.target.value })}
        >
          <option value="B2C">B2C</option>
          <option value="B2B">B2B</option>
        </select>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            placeholder="Base fare (₹)"
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={form.baseFare}
            onChange={(e) => setForm({ ...form, baseFare: e.target.value })}
          />
          <input
            placeholder="Base weight (kg)"
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={form.baseWeightKg}
            onChange={(e) => setForm({ ...form, baseWeightKg: e.target.value })}
          />
          <input
            placeholder="₹/kg intra-zone"
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={form.perKgIntraZone}
            onChange={(e) => setForm({ ...form, perKgIntraZone: e.target.value })}
          />
          <input
            placeholder="₹/kg inter-zone"
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={form.perKgInterZone}
            onChange={(e) => setForm({ ...form, perKgInterZone: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={form.codSurchargeType}
            onChange={(e) => setForm({ ...form, codSurchargeType: e.target.value })}
          >
            <option value="flat">Flat COD surcharge</option>
            <option value="percentage">% COD surcharge</option>
          </select>
          <input
            placeholder="COD surcharge value"
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={form.codSurchargeValue}
            onChange={(e) => setForm({ ...form, codSurchargeValue: e.target.value })}
          />
        </div>
        <button onClick={handleSave} className="bg-brand-600 text-white text-sm px-4 py-2 rounded-md">
          Save Rate Card
        </button>
      </div>

      <div className="space-y-3">
        {cards.map((c) => (
          <div key={c._id} className="bg-white border rounded-lg p-4 text-sm">
            <h4 className="font-semibold">{c.orderType}</h4>
            <p className="text-gray-500">
              Base ₹{c.baseFare} for first {c.baseWeightKg}kg · ₹{c.perKgIntraZone}/kg intra ·
              ₹{c.perKgInterZone}/kg inter
            </p>
            <p className="text-gray-400 text-xs">
              COD surcharge: {c.codSurchargeType === 'flat' ? `₹${c.codSurchargeValue}` : `${c.codSurchargeValue}%`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Agents Panel ----------------
function AgentsPanel() {
  const [agents, setAgents] = useState([]);
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', zone: '' });

  const load = () => userApi.list('agent').then((r) => setAgents(r.data.data));
  useEffect(() => {
    load();
    zoneApi.list().then((r) => setZones(r.data.data));
  }, []);

  const handleCreate = async () => {
    try {
      await userApi.create({ ...form, role: 'agent' });
      toast.success('Agent created');
      setForm({ name: '', email: '', password: '', phone: '', zone: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create agent');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Add Delivery Agent</h3>
        {['name', 'email', 'phone', 'password'].map((f) => (
          <input
            key={f}
            placeholder={f}
            type={f === 'password' ? 'password' : 'text'}
            className="border rounded-md px-3 py-2 text-sm w-full mb-2"
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
          />
        ))}
        <select
          className="border rounded-md px-3 py-2 text-sm w-full mb-3"
          value={form.zone}
          onChange={(e) => setForm({ ...form, zone: e.target.value })}
        >
          <option value="">Assign to zone (optional)</option>
          {zones.map((z) => (
            <option key={z._id} value={z._id}>
              {z.name}
            </option>
          ))}
        </select>
        <button onClick={handleCreate} className="bg-brand-600 text-white text-sm px-4 py-2 rounded-md">
          Create Agent
        </button>
      </div>

      <div className="space-y-3">
        {agents.map((a) => (
          <div key={a._id} className="bg-white border rounded-lg p-4 text-sm flex justify-between items-center">
            <div>
              <p className="font-semibold">{a.name}</p>
              <p className="text-gray-500 text-xs">
                {a.email} · {a.agentProfile?.zone?.name || 'No zone'}
              </p>
              <p className="text-xs text-gray-400">Active orders: {a.agentProfile?.activeOrderCount ?? 0}</p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                a.agentProfile?.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {a.agentProfile?.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
