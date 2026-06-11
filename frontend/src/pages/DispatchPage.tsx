import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '@/lib/axios';
import { fmtNum, fmtDate, fmtDateInput } from '@/lib/fmt';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { InputField, SelectField, TextareaField, SectionHeader } from '@/components/ui/Fields';
import DataTable, { Column } from '@/components/DataTable';

interface Officer { id: number; name: string; }
interface DR { id: number; lrNumber: string | null; dispatchDate: string | null; truckNumber: string | null; loadingPoint: string | null; destination: string | null; weightMt: string | null; totalFreight: string | null; balance: string | null; officer: { name: string } | null; }

const EMPTY = { biltySLNo: '', lrNumber: '', billNumber: '', billDate: '', dispatchDate: '', truckNumber: '', loadingPoint: '', destination: '', weightMt: '', freightRate: '', totalFreight: '', cashAdvance: '', dieselAdvance: '', onlineAdvance: '', totalAdvance: '', balance: '', billingRate: '', portalBilling: '', margin: '', pumpName: '', officerId: '', paymentOfficer: '', bpDate: '', remarks: '' };

type F = typeof EMPTY;

export default function DispatchPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<F>(EMPTY);

  const { data: records, isLoading } = useQuery({ queryKey: ['dispatch'], queryFn: () => api.get('/api/dispatch').then(r => r.data.records) });
  const { data: officers } = useQuery<Officer[]>({ queryKey: ['officers'], queryFn: () => api.get('/api/officers').then(r => r.data.officers) });

  const save = useMutation({
    mutationFn: (d: F) => editId ? api.put(`/api/dispatch/${editId}`, d) : api.post('/api/dispatch', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dispatch'] }); setOpen(false); },
  });
  const remove = useMutation({ mutationFn: (id: number) => api.delete(`/api/dispatch/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['dispatch'] }) });

  function s(k: keyof F) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setForm(p => { const n = { ...p, [k]: e.target.value }; const ta = (parseFloat(n.cashAdvance) || 0) + (parseFloat(n.dieselAdvance) || 0) + (parseFloat(n.onlineAdvance) || 0); n.totalAdvance = ta > 0 ? String(ta.toFixed(2)) : ''; n.balance = String(((parseFloat(n.totalFreight) || 0) - ta).toFixed(2)); if (n.weightMt && n.freightRate) n.totalFreight = String(((parseFloat(n.weightMt) || 0) * (parseFloat(n.freightRate) || 0)).toFixed(2)); return n; }); }; }

  function openCreate() { setForm(EMPTY); setEditId(null); setOpen(true); }
  function openEdit(row: DR) {
    const r = row as unknown as Record<string, unknown>;
    setForm({ biltySLNo: String(r.biltySLNo ?? ''), lrNumber: String(r.lrNumber ?? ''), billNumber: String(r.billNumber ?? ''), billDate: fmtDateInput(r.billDate as string), dispatchDate: fmtDateInput(r.dispatchDate as string), truckNumber: String(r.truckNumber ?? ''), loadingPoint: String(r.loadingPoint ?? ''), destination: String(r.destination ?? ''), weightMt: String(r.weightMt ?? ''), freightRate: String(r.freightRate ?? ''), totalFreight: String(r.totalFreight ?? ''), cashAdvance: String(r.cashAdvance ?? ''), dieselAdvance: String(r.dieselAdvance ?? ''), onlineAdvance: String(r.onlineAdvance ?? ''), totalAdvance: String(r.totalAdvance ?? ''), balance: String(r.balance ?? ''), billingRate: String(r.billingRate ?? ''), portalBilling: String(r.portalBilling ?? ''), margin: String(r.margin ?? ''), pumpName: String(r.pumpName ?? ''), officerId: r.officerId ? String(r.officerId) : '', paymentOfficer: String(r.paymentOfficer ?? ''), bpDate: fmtDateInput(r.bpDate as string), remarks: String(r.remarks ?? '') });
    setEditId(row.id); setOpen(true);
  }

  const columns: Column<DR>[] = [
    { header: 'LR #', render: r => <span className="font-medium">{r.lrNumber || '—'}</span> },
    { header: 'Dispatch Date', render: r => fmtDate(r.dispatchDate) },
    { header: 'Truck', render: r => r.truckNumber || '—' },
    { header: 'Route', render: r => r.loadingPoint && r.destination ? `${r.loadingPoint} → ${r.destination}` : '—' },
    { header: 'Weight (MT)', render: r => <span className="tabular-nums">{fmtNum(r.weightMt)}</span> },
    { header: 'Total (₹)', render: r => <span className="tabular-nums">{fmtNum(r.totalFreight)}</span> },
    { header: 'Balance (₹)', render: r => <span className="tabular-nums">{fmtNum(r.balance)}</span> },
    { header: 'Officer', render: r => r.officer?.name || '—' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dispatch Records</h1>
          <p className="text-slate-500 text-sm mt-0.5">{records?.length ?? 0} records</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> New Dispatch</Button>
      </div>

      <DataTable columns={columns} data={records ?? []} isLoading={isLoading} onEdit={openEdit} onDelete={r => remove.mutate(r.id)} />

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Dispatch' : 'New Dispatch'} size="2xl">
        <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <SectionHeader title="Document Info" />
            <InputField label="Bilty SL No" value={form.biltySLNo} onChange={s('biltySLNo')} />
            <InputField label="LR Number" value={form.lrNumber} onChange={s('lrNumber')} />
            <InputField label="Bill Number" value={form.billNumber} onChange={s('billNumber')} />
            <InputField label="Bill Date" type="date" value={form.billDate} onChange={s('billDate')} />
            <InputField label="Dispatch Date" type="date" value={form.dispatchDate} onChange={s('dispatchDate')} />

            <SectionHeader title="Route & Cargo" />
            <InputField label="Truck Number" value={form.truckNumber} onChange={s('truckNumber')} />
            <InputField label="Loading Point" value={form.loadingPoint} onChange={s('loadingPoint')} />
            <InputField label="Destination" value={form.destination} onChange={s('destination')} />
            <InputField label="Weight (MT)" type="number" step="0.001" value={form.weightMt} onChange={s('weightMt')} />
            <InputField label="Freight Rate" type="number" step="0.01" value={form.freightRate} onChange={s('freightRate')} />
            <InputField label="Total Freight (₹)" type="number" step="0.01" value={form.totalFreight} onChange={s('totalFreight')} />

            <SectionHeader title="Advances & Financials" />
            <InputField label="Cash Advance (₹)" type="number" step="0.01" value={form.cashAdvance} onChange={s('cashAdvance')} />
            <InputField label="Diesel Advance (₹)" type="number" step="0.01" value={form.dieselAdvance} onChange={s('dieselAdvance')} />
            <InputField label="Online Advance (₹)" type="number" step="0.01" value={form.onlineAdvance} onChange={s('onlineAdvance')} />
            <InputField label="Total Advance (₹)" type="number" step="0.01" value={form.totalAdvance} onChange={s('totalAdvance')} disabled />
            <InputField label="Balance (₹)" type="number" step="0.01" value={form.balance} onChange={s('balance')} disabled />
            <InputField label="Billing Rate" type="number" step="0.01" value={form.billingRate} onChange={s('billingRate')} />
            <InputField label="Portal Billing (₹)" type="number" step="0.01" value={form.portalBilling} onChange={s('portalBilling')} />
            <InputField label="Margin (₹)" type="number" step="0.01" value={form.margin} onChange={s('margin')} />

            <SectionHeader title="Payment & Remarks" />
            <InputField label="Pump Name" value={form.pumpName} onChange={s('pumpName')} />
            <SelectField label="Officer" value={form.officerId} onChange={s('officerId')}>
              <option value="">None</option>
              {officers?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </SelectField>
            <InputField label="Payment Officer" value={form.paymentOfficer} onChange={s('paymentOfficer')} />
            <InputField label="BP Date" type="date" value={form.bpDate} onChange={s('bpDate')} />
          </div>
          <TextareaField label="Remarks" value={form.remarks} onChange={s('remarks')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
