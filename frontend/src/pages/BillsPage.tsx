import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, PlusCircle, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { fmtNum, fmtDate, fmtDateInput } from '@/lib/fmt';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { InputField, SelectField, SectionHeader } from '@/components/ui/Fields';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/DataTable';

interface Client { id: number; name: string; }
interface Bill { id: number; billNumber: string; billDate: string; client: { name: string }; financialYear: string; grandTotal: string; status: string; }

type ItemForm = { slNo: string; consignmentNote: string; loadingDate: string; loadingStation: string; deliveryStation: string; challanNo: string; contents: string; packageType: string; truckNumber: string; deliveryDate: string; chargedWeightMt: string; ratePerMt: string; freightAmount: string; };

const EMPTY_ITEM: ItemForm = { slNo: '', consignmentNote: '', loadingDate: '', loadingStation: '', deliveryStation: '', challanNo: '', contents: '', packageType: '', truckNumber: '', deliveryDate: '', chargedWeightMt: '', ratePerMt: '', freightAmount: '' };

const EMPTY_BILL = { billNumber: '', billDate: '', clientId: '', financialYear: '', totalFreight: '', igst: '0', sgst: '0', cgst: '0', grandTotal: '', status: 'DRAFT', items: [{ ...EMPTY_ITEM, slNo: '1' }] };

const statusColor: Record<string, 'slate' | 'blue' | 'green'> = { DRAFT: 'slate', SENT: 'blue', PAID: 'green' };

export default function BillsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_BILL);

  const { data: bills, isLoading } = useQuery({ queryKey: ['bills'], queryFn: () => api.get('/api/bills').then(r => r.data.bills) });
  const { data: clients } = useQuery<Client[]>({ queryKey: ['clients'], queryFn: () => api.get('/api/clients').then(r => r.data.clients) });

  const save = useMutation({
    mutationFn: (d: typeof form) => editId ? api.put(`/api/bills/${editId}`, d) : api.post('/api/bills', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bills'] }); setOpen(false); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/api/bills/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bills'] }),
  });

  function set(k: string, v: string) { setForm(p => { const n = { ...p, [k]: v }; n.grandTotal = String((parseFloat(n.totalFreight) || 0) + (parseFloat(n.igst) || 0) + (parseFloat(n.sgst) || 0) + (parseFloat(n.cgst) || 0)); return n; }); }

  function setItem(i: number, k: keyof ItemForm, v: string) {
    setForm(p => {
      const items = p.items.map((item, idx) => {
        if (idx !== i) return item;
        const updated = { ...item, [k]: v };
        if (k === 'chargedWeightMt' || k === 'ratePerMt') {
          const fa = (parseFloat(updated.chargedWeightMt) || 0) * (parseFloat(updated.ratePerMt) || 0);
          updated.freightAmount = fa > 0 ? String(fa.toFixed(2)) : '';
        }
        return updated;
      });
      const totalFreight = String(items.reduce((s, it) => s + (parseFloat(it.freightAmount) || 0), 0).toFixed(2));
      const grandTotal = String((parseFloat(totalFreight) || 0) + (parseFloat(p.igst) || 0) + (parseFloat(p.sgst) || 0) + (parseFloat(p.cgst) || 0));
      return { ...p, items, totalFreight, grandTotal };
    });
  }

  function addItem() { setForm(p => ({ ...p, items: [...p.items, { ...EMPTY_ITEM, slNo: String(p.items.length + 1) }] })); }
  function removeItem(i: number) { setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) })); }

  async function openEdit(row: Bill) {
    const { data } = await api.get(`/api/bills/${row.id}`);
    const b = data.bill;
    setForm({
      billNumber: b.billNumber, billDate: fmtDateInput(b.billDate),
      clientId: String(b.clientId), financialYear: b.financialYear,
      totalFreight: String(b.totalFreight), igst: String(b.igst),
      sgst: String(b.sgst), cgst: String(b.cgst),
      grandTotal: String(b.grandTotal), status: b.status,
      items: b.items.length > 0 ? b.items.map((it: Record<string, unknown>) => ({
        slNo: String(it.slNo), consignmentNote: String(it.consignmentNote ?? ''), loadingDate: fmtDateInput(it.loadingDate as string),
        loadingStation: String(it.loadingStation ?? ''), deliveryStation: String(it.deliveryStation ?? ''),
        challanNo: String(it.challanNo ?? ''), contents: String(it.contents ?? ''), packageType: String(it.packageType ?? ''),
        truckNumber: String(it.truckNumber ?? ''), deliveryDate: fmtDateInput(it.deliveryDate as string),
        chargedWeightMt: String(it.chargedWeightMt ?? ''), ratePerMt: String(it.ratePerMt ?? ''), freightAmount: String(it.freightAmount ?? ''),
      })) : [{ ...EMPTY_ITEM, slNo: '1' }],
    });
    setEditId(row.id); setOpen(true);
  }

  function openCreate() { setForm(EMPTY_BILL); setEditId(null); setOpen(true); }

  const columns: Column<Bill>[] = [
    { header: 'Bill #', render: r => <span className="font-medium">{r.billNumber}</span> },
    { header: 'Date', render: r => fmtDate(r.billDate) },
    { header: 'Client', render: r => r.client?.name ?? '—' },
    { header: 'Fin. Year', render: r => r.financialYear },
    { header: 'Total (₹)', render: r => <span className="tabular-nums">{fmtNum(r.grandTotal)}</span> },
    { header: 'Status', render: r => <Badge label={r.status} color={statusColor[r.status] ?? 'slate'} /> },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bills</h1>
          <p className="text-slate-500 text-sm mt-0.5">{bills?.length ?? 0} bills</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> New Bill</Button>
      </div>

      <DataTable columns={columns} data={bills ?? []} isLoading={isLoading}
        onEdit={openEdit} onDelete={r => remove.mutate(r.id)} />

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Bill' : 'New Bill'} size="2xl">
        <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-5">
          {/* Header fields */}
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Bill Number" required value={form.billNumber} onChange={e => set('billNumber', e.target.value)} />
            <InputField label="Bill Date" required type="date" value={form.billDate} onChange={e => set('billDate', e.target.value)} />
            <InputField label="Financial Year" required placeholder="2024-25" value={form.financialYear} onChange={e => set('financialYear', e.target.value)} />
            <SelectField label="Client" required value={form.clientId} onChange={e => set('clientId', e.target.value)} className="col-span-2">
              <option value="">Select client…</option>
              {clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </SelectField>
            <SelectField label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
            </SelectField>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Consignment Items</p>
              <button type="button" onClick={addItem} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                <PlusCircle className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {form.items.map((item, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50 relative">
                  <button type="button" onClick={() => removeItem(i)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  <div className="grid grid-cols-4 gap-2">
                    <InputField label="SL#" value={item.slNo} onChange={e => setItem(i, 'slNo', e.target.value)} />
                    <InputField label="Consignment Note" value={item.consignmentNote} onChange={e => setItem(i, 'consignmentNote', e.target.value)} />
                    <InputField label="Truck #" value={item.truckNumber} onChange={e => setItem(i, 'truckNumber', e.target.value)} />
                    <InputField label="Challan No" value={item.challanNo} onChange={e => setItem(i, 'challanNo', e.target.value)} />
                    <InputField label="Loading Station" value={item.loadingStation} onChange={e => setItem(i, 'loadingStation', e.target.value)} />
                    <InputField label="Delivery Station" value={item.deliveryStation} onChange={e => setItem(i, 'deliveryStation', e.target.value)} />
                    <InputField label="Loading Date" type="date" value={item.loadingDate} onChange={e => setItem(i, 'loadingDate', e.target.value)} />
                    <InputField label="Delivery Date" type="date" value={item.deliveryDate} onChange={e => setItem(i, 'deliveryDate', e.target.value)} />
                    <InputField label="Contents" value={item.contents} onChange={e => setItem(i, 'contents', e.target.value)} />
                    <InputField label="Package Type" value={item.packageType} onChange={e => setItem(i, 'packageType', e.target.value)} />
                    <InputField label="Weight (MT)" type="number" step="0.001" value={item.chargedWeightMt} onChange={e => setItem(i, 'chargedWeightMt', e.target.value)} />
                    <InputField label="Rate/MT (₹)" type="number" step="0.01" value={item.ratePerMt} onChange={e => setItem(i, 'ratePerMt', e.target.value)} />
                    <InputField label="Freight Amt (₹)" type="number" step="0.01" value={item.freightAmount} onChange={e => setItem(i, 'freightAmount', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-4 gap-4 bg-blue-50 p-4 rounded-lg">
            <SectionHeader title="Freight & Taxes" />
            <InputField label="Total Freight (₹)" type="number" step="0.01" value={form.totalFreight} onChange={e => set('totalFreight', e.target.value)} />
            <InputField label="IGST (₹)" type="number" step="0.01" value={form.igst} onChange={e => set('igst', e.target.value)} />
            <InputField label="SGST (₹)" type="number" step="0.01" value={form.sgst} onChange={e => set('sgst', e.target.value)} />
            <InputField label="CGST (₹)" type="number" step="0.01" value={form.cgst} onChange={e => set('cgst', e.target.value)} />
            <div className="col-span-full flex justify-end items-center gap-2 pt-1">
              <span className="text-sm text-slate-500">Grand Total:</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">₹{fmtNum(form.grandTotal)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save Bill'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
