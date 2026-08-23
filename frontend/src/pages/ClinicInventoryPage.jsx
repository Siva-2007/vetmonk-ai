import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Pill,
  AlertTriangle,
  Clock,
  Plus,
  ArrowUpDown,
  Search,
  Calendar,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import api from '../services/api';

export const ClinicInventoryPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // =========================================================
  // ADD BATCH MODAL
  // =========================================================

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    medicineId: '',
    batchNumber: '',
    quantity: 50,
    unit: 'Tablets',
    lowStockThreshold: 15,
    unitCost: 2.5,
    expiryDate: new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split('T')[0],
    supplier: 'Apex Med Distribution',
  });

  // =========================================================
  // ADJUST STOCK MODAL
  // =========================================================

  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(10);
  const [adjustReason, setAdjustReason] =
    useState('Stock replenishment');

  // =========================================================
  // FETCH INVENTORY DATA
  // =========================================================

  const fetchInventoryData = async () => {
    try {
      setLoading(true);

      const [
        inventoryResponse,
        lowStockResponse,
        expiringResponse,
        medicinesResponse,
      ] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/low-stock'),
        api.get('/inventory/expiring-soon'),
        api.get('/medicines'),
      ]);

      const inventoryData = Array.isArray(inventoryResponse.data)
        ? inventoryResponse.data
        : [];

      const lowStockData = Array.isArray(lowStockResponse.data)
        ? lowStockResponse.data
        : [];

      const expiringData = Array.isArray(expiringResponse.data)
        ? expiringResponse.data
        : [];

      const medicinesData = Array.isArray(medicinesResponse.data)
        ? medicinesResponse.data
        : [];

      setInventory(inventoryData);
      setLowStock(lowStockData);
      setExpiring(expiringData);
      setMedicines(medicinesData);

      // Automatically select first medicine
      // when the form doesn't already have one selected.
      if (
        medicinesData.length > 0 &&
        !formData.medicineId
      ) {
        setFormData((previous) => ({
          ...previous,
          medicineId: medicinesData[0].id,
        }));
      }
    } catch (err) {
      console.error(
        'Failed to load inventory data:',
        err
      );

      error(
        err.response?.data?.message ||
          'Failed to load inventory data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // =========================================================
  // CREATE NEW INVENTORY BATCH
  // =========================================================

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    // Clinic ID comes from authenticated user.
    // Never hardcode clinic ID.
    if (!user?.clinicId) {
      error(
        'Clinic information is missing for this account.'
      );
      return;
    }

    if (!formData.medicineId) {
      error('Please select a medicine.');
      return;
    }

    if (!formData.batchNumber.trim()) {
      error('Please provide a batch number.');
      return;
    }

    if (Number(formData.quantity) < 0) {
      error('Quantity cannot be negative.');
      return;
    }

    if (Number(formData.lowStockThreshold) < 0) {
      error('Low stock threshold cannot be negative.');
      return;
    }

    if (Number(formData.unitCost) < 0) {
      error('Unit cost cannot be negative.');
      return;
    }

    if (!formData.expiryDate) {
      error('Expiry date is required.');
      return;
    }

    try {
      const payload = {
        // IMPORTANT:
        // Backend InventoryDto requires clinicId.
        clinicId: Number(user.clinicId),

        medicineId: Number(formData.medicineId),

        batchNumber: formData.batchNumber.trim(),

        quantity: Number(formData.quantity),

        unit: formData.unit,

        // InventoryDto accepts this through:
        // @JsonAlias("lowStockThreshold")
        lowStockThreshold: Number(
          formData.lowStockThreshold
        ),

        // InventoryDto accepts this through:
        // @JsonAlias("unitCost")
        unitCost: Number(formData.unitCost),

        expiryDate: formData.expiryDate,

        supplier: formData.supplier?.trim() || null,
      };

      console.log(
        'Creating inventory batch:',
        payload
      );

      await api.post('/inventory', payload);

      success(
        'New inventory batch registered successfully!'
      );

      // Close modal
      setIsAddOpen(false);

      // Reset form
      setFormData({
        medicineId:
          medicines.length > 0
            ? medicines[0].id
            : '',
        batchNumber: '',
        quantity: 50,
        unit: 'Tablets',
        lowStockThreshold: 15,
        unitCost: 2.5,
        expiryDate: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split('T')[0],
        supplier: 'Apex Med Distribution',
      });

      // Reload inventory
      await fetchInventoryData();
    } catch (err) {
      console.error(
        'Failed to add inventory batch:',
        err
      );

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail;

      error(
        backendMessage ||
          'Failed to add inventory batch.'
      );
    }
  };

  // =========================================================
  // ADJUST STOCK
  // =========================================================

  const handleAdjustStock = async (e) => {
    e.preventDefault();

    if (!adjustingItem) {
      return;
    }

    const delta = Number(adjustDelta);

    if (!Number.isInteger(delta)) {
      error('Please enter a valid whole number.');
      return;
    }

    const projectedQuantity =
      Number(adjustingItem.quantity) + delta;

    if (projectedQuantity < 0) {
      error(
        `Stock cannot go below zero. Current quantity is ${adjustingItem.quantity}.`
      );
      return;
    }

    if (!adjustReason.trim()) {
      error('Please provide a reason for adjustment.');
      return;
    }

    try {
      await api.patch(
        `/inventory/${adjustingItem.id}/adjust`,
        {
          delta,
          reason: adjustReason.trim(),
        }
      );

      success(
        `Stock updated for ${adjustingItem.medicineName}`
      );

      setAdjustingItem(null);

      setAdjustDelta(10);
      setAdjustReason('Stock replenishment');

      await fetchInventoryData();
    } catch (err) {
      console.error(
        'Failed to adjust stock:',
        err
      );

      error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to adjust stock.'
      );
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filtered = inventory.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      item.medicineName
        ?.toLowerCase()
        .includes(searchText) ||
      item.batchNumber
        ?.toLowerCase()
        .includes(searchText) ||
      item.supplier
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">

            <Pill className="w-8 h-8 text-teal-700" />

            <span>
              Pharmacy Stock & Inventory Control
            </span>

          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time batch tracking, expiration monitoring,
            stock reordering thresholds, and dispensing
            adjustments.
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* SEARCH */}

          <div className="relative">

            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search batch or drug..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
            />

          </div>

          {/* ADD BATCH */}

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition"
          >

            <Plus className="w-4 h-4" />

            <span>
              Add Batch
            </span>

          </button>

        </div>

      </div>


      {/* =====================================================
          ALERTS
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* LOW STOCK */}

        {lowStock.length > 0 && (

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">

            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />

            <div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Low Stock Threshold Alerts (
                {lowStock.length}
                )
              </h4>

              <p className="text-xs text-amber-700 mt-0.5">
                {lowStock
                  .map(
                    (item) =>
                      `${item.medicineName} (${item.quantity} ${item.unit} remaining)`
                  )
                  .join(', ')}
              </p>

            </div>

          </div>

        )}


        {/* EXPIRING */}

        {expiring.length > 0 && (

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-xs">

            <Clock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />

            <div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Expiring Medications Within 30 Days (
                {expiring.length}
                )
              </h4>

              <p className="text-xs text-rose-700 mt-0.5">
                {expiring
                  .map(
                    (item) =>
                      `${item.medicineName} (Expires: ${item.expiryDate})`
                  )
                  .join(', ')}
              </p>

            </div>

          </div>

        )}

      </div>


      {/* =====================================================
          INVENTORY TABLE
      ====================================================== */}

      {loading ? (

        <LoadingSpinner
          message="Auditing pharmacy inventory items..."
        />

      ) : filtered.length === 0 ? (

        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">

          <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />

          <h3 className="text-base font-bold text-slate-800">
            No Inventory Batches Found
          </h3>

          <p className="text-xs text-slate-500 mt-1 mb-6">
            Register your clinic's pharmacy stock batches
            to track levels and prevent shortages.
          </p>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm hover:bg-teal-800 transition"
          >

            <Plus className="w-4 h-4" />

            <span>
              Add First Batch
            </span>

          </button>

        </div>

      ) : (

        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs text-slate-600">

              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">

                <tr>

                  <th className="px-6 py-4">
                    Medication & Formulary
                  </th>

                  <th className="px-6 py-4">
                    Batch Number
                  </th>

                  <th className="px-6 py-4">
                    Available Quantity
                  </th>

                  <th className="px-6 py-4">
                    Threshold
                  </th>

                  <th className="px-6 py-4">
                    Expiry Date
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100 font-medium">

                {filtered.map((item) => {

                  /*
                   * Backend response uses minThreshold.
                   *
                   * Older frontend code used lowStockThreshold.
                   * Support both to make the UI robust.
                   */
                  const threshold =
                    item.minThreshold ??
                    item.lowStockThreshold ??
                    0;

                  const isLow =
                    Number(item.quantity) <=
                    Number(threshold);

                  return (

                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition"
                    >

                      {/* MEDICINE */}

                      <td className="px-6 py-4">

                        <div className="font-bold text-slate-900 text-sm">
                          {item.medicineName}
                        </div>

                        <div className="text-[11px] text-slate-400">
                          Supplier:{' '}
                          {item.supplier || 'Direct'}
                        </div>

                      </td>


                      {/* BATCH */}

                      <td className="px-6 py-4 font-mono text-slate-700">
                        {item.batchNumber}
                      </td>


                      {/* QUANTITY */}

                      <td className="px-6 py-4">

                        <span
                          className={`text-base font-extrabold ${
                            isLow
                              ? 'text-rose-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.quantity}
                        </span>{' '}

                        <span className="text-xs text-slate-500">
                          {item.unit}
                        </span>

                      </td>


                      {/* THRESHOLD */}

                      <td className="px-6 py-4 text-slate-500">

                        {threshold}{' '}
                        {item.unit}

                      </td>


                      {/* EXPIRY */}

                      <td className="px-6 py-4">

                        <span className="flex items-center gap-1">

                          <Calendar className="w-3.5 h-3.5 text-slate-400" />

                          {item.expiryDate}

                        </span>

                      </td>


                      {/* STATUS */}

                      <td className="px-6 py-4">

                        {isLow ? (

                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                            LOW STOCK
                          </span>

                        ) : (

                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            OPTIMAL
                          </span>

                        )}

                      </td>


                      {/* ACTION */}

                      <td className="px-6 py-4 text-right">

                        <button
                          onClick={() =>
                            setAdjustingItem(item)
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-lg text-xs font-bold transition border border-slate-200"
                        >

                          <ArrowUpDown className="w-3.5 h-3.5" />

                          <span>
                            Adjust Stock
                          </span>

                        </button>

                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* =====================================================
          ADD BATCH MODAL
      ====================================================== */}

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Pharmacy Stock Batch"
      >

        <form
          onSubmit={handleCreateBatch}
          className="space-y-4"
        >

          {/* MEDICINE */}

          <div>

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Medication from Formulary *
            </label>

            <select
              value={formData.medicineId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medicineId: e.target.value,
                })
              }
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            >

              {medicines.map((medicine) => (

                <option
                  key={medicine.id}
                  value={medicine.id}
                >
                  {medicine.name}{' '}
                  (
                  {medicine.brandName ||
                    medicine.category ||
                    'Medicine'}
                  )
                </option>

              ))}

            </select>

          </div>


          {/* BATCH + SUPPLIER */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch Number *
              </label>

              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    batchNumber: e.target.value,
                  })
                }
                placeholder="e.g. BAT-2026-088"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />

            </div>


            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supplier Name
              </label>

              <input
                type="text"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supplier: e.target.value,
                  })
                }
                placeholder="e.g. Apex Med Distribution"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />

            </div>

          </div>


          {/* QUANTITY + UNIT + THRESHOLD */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Quantity *
              </label>

              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: e.target.value,
                  })
                }
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />

            </div>


            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Unit
              </label>

              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unit: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              >

                <option value="Tablets">
                  Tablets
                </option>

                <option value="Vials">
                  Vials
                </option>

                <option value="Boxes">
                  Boxes
                </option>

                <option value="Bottles">
                  Bottles
                </option>

                <option value="Tubes">
                  Tubes
                </option>

              </select>

            </div>


            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Low Stock Alert Limit *
              </label>

              <input
                type="number"
                min="1"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowStockThreshold:
                      e.target.value,
                  })
                }
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />

            </div>

          </div>


          {/* COST + EXPIRY */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Unit Cost ($)
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitCost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitCost: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />

            </div>


            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Batch Expiry Date *
              </label>

              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expiryDate: e.target.value,
                  })
                }
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />

            </div>

          </div>


          {/* BUTTONS */}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">

            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              Register Batch
            </button>

          </div>

        </form>

      </Modal>


      {/* =====================================================
          ADJUST STOCK MODAL
      ====================================================== */}

      <Modal
        isOpen={!!adjustingItem}
        onClose={() => setAdjustingItem(null)}
        title={`Adjust Stock: ${
          adjustingItem?.medicineName || ''
        }`}
      >

        {adjustingItem && (

          <form
            onSubmit={handleAdjustStock}
            className="space-y-4"
          >

            {/* CURRENT STOCK */}

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">

              <p>
                <strong>Batch:</strong>{' '}
                {adjustingItem.batchNumber}
              </p>

              <p>
                <strong>Current In Stock:</strong>{' '}
                {adjustingItem.quantity}{' '}
                {adjustingItem.unit}
              </p>

            </div>


            {/* DELTA */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Quantity Delta (Use negative to
                dispense/deduct, positive to restock) *
              </label>

              <input
                type="number"
                value={adjustDelta}
                onChange={(e) =>
                  setAdjustDelta(e.target.value)
                }
                placeholder="e.g. -5 to dispense, +20 to restock"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />

              <p className="text-[11px] text-slate-500 mt-1">
                Projected New Total:{' '}
                <strong>
                  {Number(adjustingItem.quantity) +
                    Number(adjustDelta || 0)}{' '}
                  {adjustingItem.unit}
                </strong>
              </p>

            </div>


            {/* REASON */}

            <div>

              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Adjustment *
              </label>

              <input
                type="text"
                value={adjustReason}
                onChange={(e) =>
                  setAdjustReason(e.target.value)
                }
                placeholder="e.g. Dispensed via Prescription #12, Supplier Restock, Damaged"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />

            </div>


            {/* BUTTONS */}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">

              <button
                type="button"
                onClick={() =>
                  setAdjustingItem(null)
                }
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                Commit Adjustment
              </button>

            </div>

          </form>

        )}

      </Modal>

    </div>
  );
};