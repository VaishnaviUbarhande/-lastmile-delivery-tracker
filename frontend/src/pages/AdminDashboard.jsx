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
              tab === t
                ? 'bg-brand-600 text-white'
                : 'bg-white border text-gray-600'
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

// ============================================================
// ORDERS PANEL
// ============================================================

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [zones, setZones] = useState([]);
  const [agents, setAgents] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [filters, setFilters] = useState({
    status: '',
    zone: '',
    agent: '',
  });

  const [selected, setSelected] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const load = async () => {
    try {
      const params = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params[key] = value;
        }
      });

      const res = await orderApi.list(params);
      setOrders(res.data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to load orders'
      );
    }
  };

  useEffect(() => {
    const loadSupportingData = async () => {
      try {
        const [zoneRes, agentRes, customerRes] = await Promise.all([
          zoneApi.list(),
          userApi.list('agent'),
          userApi.list('customer'),
        ]);

        setZones(zoneRes.data.data || []);
        setAgents(agentRes.data.data || []);
        setCustomers(customerRes.data.data || []);
      } catch (err) {
        toast.error(
          err.response?.data?.message ||
            'Failed to load admin dashboard data'
        );
      }
    };

    loadSupportingData();
  }, []);

  useEffect(() => {
    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const refreshSelected = async (id) => {
    try {
      const res = await orderApi.getById(id);
      setSelected(res.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to refresh selected order'
      );
    }
  };

  const handleAutoAssign = async (id) => {
    try {
      await orderApi.autoAssign(id);

      toast.success('Agent auto-assigned');

      await load();
      await refreshSelected(id);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Auto-assign failed'
      );
    }
  };

  const handleManualAssign = async (id, agentId) => {
    if (!agentId) return;

    try {
      await orderApi.assign(id, agentId);

      toast.success('Agent assigned');

      await load();
      await refreshSelected(id);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Assignment failed'
      );
    }
  };

  const handleOverride = async () => {
    if (!selected?._id || !overrideStatus) {
      return;
    }

    try {
      await orderApi.override(
        selected._id,
        overrideStatus,
        overrideNote
      );

      toast.success('Status overridden');

      setOverrideStatus('');
      setOverrideNote('');

      await load();
      await refreshSelected(selected._id);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Override failed'
      );
    }
  };

  return (
    <div>
      {/* Create Order Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() =>
            setShowCreateForm((value) => !value)
          }
          className="text-sm bg-brand-600 text-white px-4 py-2 rounded-md font-medium"
        >
          {showCreateForm
            ? 'Close'
            : '+ New Order for Customer'}
        </button>
      </div>

      {/* Create Order Form */}
      {showCreateForm && (
        <CreateOrderForCustomer
          customers={customers}
          onCreated={async () => {
            setShowCreateForm(false);
            await load();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Orders + Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT SIDE */}
        <div>
          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <select
              className="border rounded-md px-2 py-1.5 text-sm"
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  status: e.target.value,
                }))
              }
            >
              <option value="">All statuses</option>

              {ALL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              className="border rounded-md px-2 py-1.5 text-sm"
              value={filters.zone}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  zone: e.target.value,
                }))
              }
            >
              <option value="">All zones</option>

              {zones.map((zone) => (
                <option key={zone._id} value={zone._id}>
                  {zone.name}
                </option>
              ))}
            </select>

            <select
              className="border rounded-md px-2 py-1.5 text-sm"
              value={filters.agent}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  agent: e.target.value,
                }))
              }
            >
              <option value="">All agents</option>

              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Orders List */}
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => setSelected(order)}
                className={`bg-white border rounded-lg p-4 cursor-pointer hover:border-brand-400 ${
                  selected?._id === order._id
                    ? 'border-brand-600 ring-1 ring-brand-200'
                    : ''
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">
                    {order.orderNumber}
                  </span>

                  <StatusBadge status={order.status} />
                </div>

                <p className="text-xs text-gray-500">
                  {order.customer?.name} ·{' '}
                  {order.pickupAddress?.city} →{' '}
                  {order.dropAddress?.city} · ₹
                  {order.charge?.totalCharge}
                </p>

                <p className="text-xs text-gray-400">
                  Agent:{' '}
                  {order.assignedAgent?.name ||
                    'Unassigned'}
                </p>
              </div>
            ))}

            {orders.length === 0 && (
              <p className="text-sm text-gray-400">
                No orders match these filters.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white border rounded-lg p-4 h-fit">
          {!selected ? (
            <p className="text-gray-400 text-sm">
              Select an order to manage assignment & status.
            </p>
          ) : (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">
                  {selected.orderNumber}
                </h3>

                <StatusBadge status={selected.status} />
              </div>

              {/* Order Information */}
              <div className="mb-4 space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Customer:</strong>{' '}
                  {selected.customer?.name} (
                  {selected.customer?.phone})
                </p>

                <p>
                  <strong>Route:</strong>{' '}
                  {selected.pickupZone?.name} →{' '}
                  {selected.dropZone?.name}
                </p>

                <p>
                  <strong>Charge:</strong> ₹
                  {selected.charge?.totalCharge}{' '}
                  ({selected.paymentType})
                </p>
              </div>

              {/* Assign Agent */}
              <div className="border-t pt-3 mb-4">
                <h4 className="text-sm font-semibold mb-2">
                  Assign Agent
                </h4>

                <div className="flex gap-2">
                  <select
                    className="border rounded-md px-2 py-1.5 text-sm flex-1"
                    onChange={(e) =>
                      handleManualAssign(
                        selected._id,
                        e.target.value
                      )
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select agent to manually assign
                    </option>

                    {agents.map((agent) => (
                      <option
                        key={agent._id}
                        value={agent._id}
                      >
                        {agent.name}{' '}
                        {agent.agentProfile?.isAvailable
                          ? '(Available)'
                          : '(Unavailable)'}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      handleAutoAssign(selected._id)
                    }
                    className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-md whitespace-nowrap"
                  >
                    Auto-Assign Nearest
                  </button>
                </div>
              </div>

              {/* Override Status */}
              <div className="border-t pt-3 mb-4">
                <h4 className="text-sm font-semibold mb-2">
                  Override Status
                </h4>

                <div className="flex gap-2 mb-2">
                  <select
                    className="border rounded-md px-2 py-1.5 text-sm flex-1"
                    value={overrideStatus}
                    onChange={(e) =>
                      setOverrideStatus(e.target.value)
                    }
                  >
                    <option value="">
                      Select new status
                    </option>

                    {ALL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  placeholder="Reason / audit note"
                  className="border rounded-md px-2 py-1.5 text-sm w-full mb-2"
                  value={overrideNote}
                  onChange={(e) =>
                    setOverrideNote(e.target.value)
                  }
                />

                <button
                  onClick={handleOverride}
                  className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-md"
                >
                  Apply Override
                </button>
              </div>

              {/* Timeline */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold mb-2">
                  Tracking Timeline
                </h4>

                <OrderTimeline
                  history={selected.trackingHistory}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CREATE ORDER FOR CUSTOMER
// ============================================================

const EMPTY_ADMIN_ORDER = {
  customerId: '',

  pickupAddress: {
    line1: '',
    city: '',
    state: '',
    pincode: '',
  },

  dropAddress: {
    line1: '',
    city: '',
    state: '',
    pincode: '',
  },

  dimensions: {
    lengthCm: '',
    breadthCm: '',
    heightCm: '',
    actualWeightKg: '',
  },

  orderType: 'B2C',
  paymentType: 'Prepaid',
  codAmount: '',
};

function CreateOrderForCustomer({
  customers,
  onCreated,
  onCancel,
}) {
  const [form, setForm] = useState(EMPTY_ADMIN_ORDER);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [creating, setCreating] = useState(false);

  const updateField = (section, field, value) => {
    setForm((current) => ({
      ...current,

      [section]: {
        ...current[section],
        [field]: value,
      },
    }));

    setPreview(null);
  };

  const buildDimensions = () => ({
    lengthCm: Number(form.dimensions.lengthCm),
    breadthCm: Number(form.dimensions.breadthCm),
    heightCm: Number(form.dimensions.heightCm),
    actualWeightKg: Number(
      form.dimensions.actualWeightKg
    ),
  });

  const handlePreview = async () => {
    setPreviewing(true);

    try {
      const res = await orderApi.preview({
        pickupAddress: form.pickupAddress,
        dropAddress: form.dropAddress,
        dimensions: buildDimensions(),
        orderType: form.orderType,
        paymentType: form.paymentType,
      });

      setPreview(res.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Could not calculate price'
      );
    } finally {
      setPreviewing(false);
    }
  };

  const handleCreate = async () => {
    if (!form.customerId) {
      toast.error('Select a customer first');
      return;
    }

    setCreating(true);

    try {
      await orderApi.create({
        customerId: form.customerId,

        pickupAddress: form.pickupAddress,

        dropAddress: form.dropAddress,

        dimensions: buildDimensions(),

        orderType: form.orderType,

        paymentType: form.paymentType,

        codAmount:
          form.paymentType === 'COD'
            ? Number(form.codAmount)
            : undefined,
      });

      toast.success(
        'Order created on behalf of customer'
      );

      onCreated();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Order creation failed'
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6 space-y-6 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold">
          Create Order on Behalf of Customer
        </h3>

        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      {/* Customer */}
      <div>
        <h4 className="font-semibold text-sm mb-2">
          Customer
        </h4>

        <select
          className="border rounded-md px-3 py-2 text-sm w-full"
          value={form.customerId}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              customerId: e.target.value,
            }))
          }
        >
          <option value="">Select customer</option>

          {customers.map((customer) => (
            <option
              key={customer._id}
              value={customer._id}
            >
              {customer.name} ({customer.email})
            </option>
          ))}
        </select>

        {customers.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            No customers found yet — a customer must
            register first before you can place an order
            on their behalf.
          </p>
        )}
      </div>

      {/* Addresses */}
      <div className="grid md:grid-cols-2 gap-6">
        <AdminAddressFields
          section="pickupAddress"
          label="Pickup Address"
          form={form}
          updateField={updateField}
        />

        <AdminAddressFields
          section="dropAddress"
          label="Drop Address"
          form={form}
          updateField={updateField}
        />
      </div>

      {/* Package Details */}
      <div>
        <h4 className="font-semibold text-sm mb-2">
          Package Details
        </h4>

        <div className="grid grid-cols-4 gap-2">
          {[
            'lengthCm',
            'breadthCm',
            'heightCm',
            'actualWeightKg',
          ].map((field) => (
            <input
              key={field}
              type="number"
              min="0"
              step="0.01"
              placeholder={field}
              className="border rounded-md px-3 py-2 text-sm"
              value={form.dimensions[field]}
              onChange={(e) =>
                updateField(
                  'dimensions',
                  field,
                  e.target.value
                )
              }
            />
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-1">
          L, B, H in cm · Weight in kg
        </p>
      </div>

      {/* Order Type / Payment */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-sm mb-2">
            Order Type
          </h4>

          <select
            className="border rounded-md px-3 py-2 text-sm w-full"
            value={form.orderType}
            onChange={(e) => {
              setForm((current) => ({
                ...current,
                orderType: e.target.value,
              }));

              setPreview(null);
            }}
          >
            <option value="B2C">B2C</option>
            <option value="B2B">B2B</option>
          </select>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2">
            Payment Type
          </h4>

          <select
            className="border rounded-md px-3 py-2 text-sm w-full"
            value={form.paymentType}
            onChange={(e) => {
              setForm((current) => ({
                ...current,
                paymentType: e.target.value,
              }));

              setPreview(null);
            }}
          >
            <option value="Prepaid">Prepaid</option>
            <option value="COD">COD</option>
          </select>
        </div>
      </div>

      {/* COD */}
      {form.paymentType === 'COD' && (
        <input
          type="number"
          placeholder="Amount to collect (COD)"
          className="border rounded-md px-3 py-2 text-sm w-full"
          value={form.codAmount}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              codAmount: e.target.value,
            }))
          }
        />
      )}

      {/* Preview */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePreview}
          disabled={previewing}
          className="border border-brand-600 text-brand-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-50 disabled:opacity-50"
        >
          {previewing
            ? 'Calculating...'
            : 'Preview Price'}
        </button>

        {preview && (
          <div className="text-sm">
            <span className="text-gray-500 mr-2">
              {preview.isIntraZone
                ? 'Intra-zone'
                : 'Inter-zone'}{' '}
              · billable {preview.billableWeightKg}kg
            </span>

            <span className="font-bold text-lg text-brand-700">
              ₹{preview.charge?.totalCharge}
            </span>
          </div>
        )}
      </div>

      {/* Create */}
      <button
        onClick={handleCreate}
        disabled={
          !preview ||
          creating ||
          !form.customerId
        }
        className="w-full bg-brand-600 text-white py-2.5 rounded-md font-medium hover:bg-brand-700 disabled:opacity-50"
      >
        {creating
          ? 'Placing order...'
          : 'Confirm & Place Order'}
      </button>
    </div>
  );
}

// ============================================================
// ADMIN ADDRESS FIELDS
// ============================================================

function AdminAddressFields({
  section,
  label,
  form,
  updateField,
}) {
  return (
    <div>
      <h4 className="font-semibold text-sm mb-2">
        {label}
      </h4>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          placeholder="Address line"
          className="border rounded-md px-3 py-2 text-sm col-span-2"
          value={form[section].line1}
          onChange={(e) =>
            updateField(
              section,
              'line1',
              e.target.value
            )
          }
        />

        <input
          placeholder="City"
          className="border rounded-md px-3 py-2 text-sm"
          value={form[section].city}
          onChange={(e) =>
            updateField(
              section,
              'city',
              e.target.value
            )
          }
        />

        <input
          placeholder="State"
          className="border rounded-md px-3 py-2 text-sm"
          value={form[section].state}
          onChange={(e) =>
            updateField(
              section,
              'state',
              e.target.value
            )
          }
        />

        <input
          placeholder="Pincode"
          className="border rounded-md px-3 py-2 text-sm col-span-2"
          value={form[section].pincode}
          onChange={(e) =>
            updateField(
              section,
              'pincode',
              e.target.value
            )
          }
        />
      </div>
    </div>
  );
}

// ============================================================
// ZONES PANEL
// ============================================================

function ZonesPanel() {
  const [zones, setZones] = useState([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    pincodes: '',
    areas: '',
  });

  const load = async () => {
    try {
      const response = await zoneApi.list();

      setZones(response.data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to load zones'
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    try {
      await zoneApi.create({
        name: form.name,
        description: form.description,

        pincodes: form.pincodes
          .split(',')
          .map((pincode) => pincode.trim())
          .filter(Boolean),

        areas: form.areas
          .split(',')
          .map((area) => area.trim())
          .filter(Boolean),
      });

      toast.success('Zone created');

      setForm({
        name: '',
        description: '',
        pincodes: '',
        areas: '',
      });

      load();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to create zone'
      );
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Create Zone */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">
          Create Zone
        </h3>

        <input
          placeholder="Zone name"
          className="border rounded-md px-3 py-2 text-sm w-full mb-2"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          placeholder="Description"
          className="border rounded-md px-3 py-2 text-sm w-full mb-2"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <input
          placeholder="Pincodes (comma-separated)"
          className="border rounded-md px-3 py-2 text-sm w-full mb-2"
          value={form.pincodes}
          onChange={(e) =>
            setForm({
              ...form,
              pincodes: e.target.value,
            })
          }
        />

        <input
          placeholder="Areas / cities (comma-separated)"
          className="border rounded-md px-3 py-2 text-sm w-full mb-3"
          value={form.areas}
          onChange={(e) =>
            setForm({
              ...form,
              areas: e.target.value,
            })
          }
        />

        <button
          onClick={handleCreate}
          className="bg-brand-600 text-white text-sm px-4 py-2 rounded-md"
        >
          Create Zone
        </button>
      </div>

      {/* Zone List */}
      <div className="space-y-3">
        {zones.map((zone) => (
          <div
            key={zone._id}
            className="bg-white border rounded-lg p-4"
          >
            <h4 className="font-semibold text-sm">
              {zone.name}
            </h4>

            <p className="text-xs text-gray-500">
              {zone.description}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Pincodes:{' '}
              {zone.pincodes?.join(', ') || '—'}
            </p>

            <p className="text-xs text-gray-400">
              Areas:{' '}
              {zone.areas?.join(', ') || '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// RATE CARDS PANEL
// ============================================================

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

  const load = async () => {
    try {
      const response = await rateCardApi.list();

      setCards(response.data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to load rate cards'
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    try {
      await rateCardApi.upsert({
        ...form,

        baseFare: Number(form.baseFare),

        baseWeightKg: Number(
          form.baseWeightKg
        ),

        perKgIntraZone: Number(
          form.perKgIntraZone
        ),

        perKgInterZone: Number(
          form.perKgInterZone
        ),

        codSurchargeValue: Number(
          form.codSurchargeValue
        ),
      });

      toast.success('Rate card saved');

      load();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to save rate card'
      );
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Configure */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">
          Configure Rate Card
        </h3>

        <select
          className="border rounded-md px-3 py-2 text-sm w-full mb-2"
          value={form.orderType}
          onChange={(e) =>
            setForm({
              ...form,
              orderType: e.target.value,
            })
          }
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
            onChange={(e) =>
              setForm({
                ...form,
                baseFare: e.target.value,
              })
            }
          />

          <input
            placeholder="Base weight (kg)"
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={form.baseWeightKg}
            onChange={(e) =>
              setForm({
                ...form,
                baseWeightKg: e.target.value,
              })
            }
          />

          <input
            placeholder="₹/kg intra-zone"
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={form.perKgIntraZone}
            onChange={(e) =>
              setForm({
                ...form,
                perKgIntraZone: e.target.value,
              })
            }
          />

          <input
            placeholder="₹/kg inter-zone"
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={form.perKgInterZone}
            onChange={(e) =>
              setForm({
                ...form,
                perKgInterZone: e.target.value,
              })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={form.codSurchargeType}
            onChange={(e) =>
              setForm({
                ...form,
                codSurchargeType: e.target.value,
              })
            }
          >
            <option value="flat">
              Flat COD surcharge
            </option>

            <option value="percentage">
              % COD surcharge
            </option>
          </select>

          <input
            placeholder="COD surcharge value"
            type="number"
            className="border rounded-md px-3 py-2 text-sm"
            value={form.codSurchargeValue}
            onChange={(e) =>
              setForm({
                ...form,
                codSurchargeValue: e.target.value,
              })
            }
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-brand-600 text-white text-sm px-4 py-2 rounded-md"
        >
          Save Rate Card
        </button>
      </div>

      {/* Rate Cards */}
      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card._id}
            className="bg-white border rounded-lg p-4 text-sm"
          >
            <h4 className="font-semibold">
              {card.orderType}
            </h4>

            <p className="text-gray-500">
              Base ₹{card.baseFare} for first{' '}
              {card.baseWeightKg}kg · ₹
              {card.perKgIntraZone}/kg intra · ₹
              {card.perKgInterZone}/kg inter
            </p>

            <p className="text-gray-400 text-xs">
              COD surcharge:{' '}
              {card.codSurchargeType === 'flat'
                ? `₹${card.codSurchargeValue}`
                : `${card.codSurchargeValue}%`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// AGENTS PANEL
// ============================================================

function AgentsPanel() {
  const [agents, setAgents] = useState([]);
  const [zones, setZones] = useState([]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    zone: '',
  });

  const load = async () => {
    try {
      const response = await userApi.list('agent');

      setAgents(response.data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to load agents'
      );
    }
  };

  useEffect(() => {
    load();

    zoneApi
      .list()
      .then((response) =>
        setZones(response.data.data || [])
      )
      .catch((err) => {
        toast.error(
          err.response?.data?.message ||
            'Failed to load zones'
        );
      });
  }, []);

  const handleCreate = async () => {
    try {
      await userApi.create({
        ...form,
        role: 'agent',
      });

      toast.success('Agent created');

      setForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        zone: '',
      });

      load();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to create agent'
      );
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Create Agent */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">
          Add Delivery Agent
        </h3>

        {[
          'name',
          'email',
          'phone',
          'password',
        ].map((field) => (
          <input
            key={field}
            placeholder={field}
            type={
              field === 'password'
                ? 'password'
                : 'text'
            }
            className="border rounded-md px-3 py-2 text-sm w-full mb-2"
            value={form[field]}
            onChange={(e) =>
              setForm({
                ...form,
                [field]: e.target.value,
              })
            }
          />
        ))}

        <select
          className="border rounded-md px-3 py-2 text-sm w-full mb-3"
          value={form.zone}
          onChange={(e) =>
            setForm({
              ...form,
              zone: e.target.value,
            })
          }
        >
          <option value="">
            Assign to zone (optional)
          </option>

          {zones.map((zone) => (
            <option
              key={zone._id}
              value={zone._id}
            >
              {zone.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleCreate}
          className="bg-brand-600 text-white text-sm px-4 py-2 rounded-md"
        >
          Create Agent
        </button>
      </div>

      {/* Agents */}
      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent._id}
            className="bg-white border rounded-lg p-4 text-sm flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {agent.name}
              </p>

              <p className="text-gray-500 text-xs">
                {agent.email} ·{' '}
                {agent.agentProfile?.zone?.name ||
                  'No zone'}
              </p>

              <p className="text-xs text-gray-400">
                Active orders:{' '}
                {agent.agentProfile
                  ?.activeOrderCount ?? 0}
              </p>
            </div>

            <span
              className={`text-xs px-2 py-1 rounded-full ${
                agent.agentProfile?.isAvailable
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {agent.agentProfile?.isAvailable
                ? 'Available'
                : 'Unavailable'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}