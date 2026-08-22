import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../api/endpoints';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';

const emptyForm = {
  pickupAddress: { line1: '', city: '', state: '', pincode: '' },
  dropAddress: { line1: '', city: '', state: '', pincode: '' },
  dimensions: { lengthCm: '', breadthCm: '', heightCm: '', actualWeightKg: '' },
  orderType: 'B2C',
  paymentType: 'Prepaid',
  codAmount: '',
};

export default function CustomerDashboard() {
  const [tab, setTab] = useState('new');
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const loadOrders = async () => {
    const res = await orderApi.list({});
    setOrders(res.data.data);
  };

  useEffect(() => {
    if (tab === 'orders') loadOrders();
  }, [tab]);

  const updateField = (section, field, value) => {
    setForm((f) => ({ ...f, [section]: { ...f[section], [field]: value } }));
    setPreview(null);
  };

  const buildDimensions = () => ({
    lengthCm: Number(form.dimensions.lengthCm),
    breadthCm: Number(form.dimensions.breadthCm),
    heightCm: Number(form.dimensions.heightCm),
    actualWeightKg: Number(form.dimensions.actualWeightKg),
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
      toast.error(err.response?.data?.message || 'Could not calculate price');
    } finally {
      setPreviewing(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await orderApi.create({
        pickupAddress: form.pickupAddress,
        dropAddress: form.dropAddress,
        dimensions: buildDimensions(),
        orderType: form.orderType,
        paymentType: form.paymentType,
        codAmount: form.paymentType === 'COD' ? Number(form.codAmount) : undefined,
      });
      toast.success('Order placed!');
      setForm(emptyForm);
      setPreview(null);
      setTab('orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order creation failed');
    } finally {
      setCreating(false);
    }
  };

  const handleReschedule = async (orderId) => {
    if (!rescheduleDate) {
      toast.error('Pick a date first');
      return;
    }
    try {
      await orderApi.reschedule(orderId, rescheduleDate);
      toast.success('Delivery rescheduled');
      setRescheduleDate('');
      const res = await orderApi.getById(orderId);
      setSelectedOrder(res.data.data);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reschedule failed');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex gap-2 mb-6">
        <TabButton active={tab === 'new'} onClick={() => setTab('new')}>
          New Order
        </TabButton>
        <TabButton active={tab === 'orders'} onClick={() => setTab('orders')}>
          My Orders
        </TabButton>
      </div>

      {tab === 'new' && (
        <div className="bg-white border rounded-xl p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <AddressFields section="pickupAddress" label="Pickup Address" form={form} updateField={updateField} />
            <AddressFields section="dropAddress" label="Drop Address" form={form} updateField={updateField} />
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">Package Details</h3>
            <div className="grid grid-cols-4 gap-2">
              {['lengthCm', 'breadthCm', 'heightCm', 'actualWeightKg'].map((f) => (
                <input
                  key={f}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={f}
                  className="border rounded-md px-3 py-2 text-sm"
                  value={form.dimensions[f]}
                  onChange={(e) => updateField('dimensions', f, e.target.value)}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">L, B, H in cm · Weight in kg</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-sm mb-2">Order Type</h3>
              <select
                className="border rounded-md px-3 py-2 text-sm w-full"
                value={form.orderType}
                onChange={(e) => {
                  setForm((f) => ({ ...f, orderType: e.target.value }));
                  setPreview(null);
                }}
              >
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-2">Payment Type</h3>
              <select
                className="border rounded-md px-3 py-2 text-sm w-full"
                value={form.paymentType}
                onChange={(e) => {
                  setForm((f) => ({ ...f, paymentType: e.target.value }));
                  setPreview(null);
                }}
              >
                <option value="Prepaid">Prepaid</option>
                <option value="COD">COD</option>
              </select>
            </div>
          </div>

          {form.paymentType === 'COD' && (
            <input
              type="number"
              placeholder="Amount to collect (COD)"
              className="border rounded-md px-3 py-2 text-sm w-full"
              value={form.codAmount}
              onChange={(e) => setForm((f) => ({ ...f, codAmount: e.target.value }))}
            />
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={handlePreview}
              disabled={previewing}
              className="border border-brand-600 text-brand-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-50"
            >
              {previewing ? 'Calculating...' : 'Preview Price'}
            </button>
            {preview && (
              <div className="text-sm">
                <span className="text-gray-500 mr-2">
                  {preview.isIntraZone ? 'Intra-zone' : 'Inter-zone'} · billable {preview.billableWeightKg}kg
                </span>
                <span className="font-bold text-lg text-brand-700">₹{preview.charge.totalCharge}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={!preview || creating}
            className="w-full bg-brand-600 text-white py-2.5 rounded-md font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {creating ? 'Placing order...' : 'Confirm & Place Order'}
          </button>
        </div>
      )}

      {tab === 'orders' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {orders.length === 0 && <p className="text-gray-400 text-sm">No orders yet.</p>}
            {orders.map((o) => (
              <div
                key={o._id}
                onClick={() => setSelectedOrder(o)}
                className={`bg-white border rounded-lg p-4 cursor-pointer hover:border-brand-400 ${
                  selectedOrder?._id === o._id ? 'border-brand-600 ring-1 ring-brand-200' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-xs text-gray-500">
                  {o.pickupAddress.city} → {o.dropAddress.city} · ₹{o.charge.totalCharge}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white border rounded-lg p-4">
            {!selectedOrder ? (
              <p className="text-gray-400 text-sm">Select an order to view its tracking timeline.</p>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">{selectedOrder.orderNumber}</h3>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <OrderTimeline history={selectedOrder.trackingHistory} />

                {selectedOrder.status === 'Failed' && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">Reschedule Delivery</h4>
                    <input
                      type="date"
                      className="border rounded-md px-3 py-2 text-sm mr-2"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                    />
                    <button
                      onClick={() => handleReschedule(selectedOrder._id)}
                      className="bg-brand-600 text-white text-sm px-4 py-2 rounded-md hover:bg-brand-700"
                    >
                      Reschedule
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddressFields({ section, label, form, updateField }) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-2">{label}</h3>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          placeholder="Address line"
          className="border rounded-md px-3 py-2 text-sm col-span-2"
          value={form[section].line1}
          onChange={(e) => updateField(section, 'line1', e.target.value)}
        />
        <input
          placeholder="City"
          className="border rounded-md px-3 py-2 text-sm"
          value={form[section].city}
          onChange={(e) => updateField(section, 'city', e.target.value)}
        />
        <input
          placeholder="State"
          className="border rounded-md px-3 py-2 text-sm"
          value={form[section].state}
          onChange={(e) => updateField(section, 'state', e.target.value)}
        />
        <input
          placeholder="Pincode"
          className="border rounded-md px-3 py-2 text-sm col-span-2"
          value={form[section].pincode}
          onChange={(e) => updateField(section, 'pincode', e.target.value)}
        />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium ${
        active ? 'bg-brand-600 text-white' : 'bg-white border text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
