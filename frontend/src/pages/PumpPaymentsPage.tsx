import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '@/lib/axios';
import { fmtNum, fmtDate, fmtDateInput } from '@/lib/fmt';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { InputField } from '@/components/ui/Fields';
import DataTable, { Column } from '@/components/DataTable';

interface PP { id: number; paymentDate: string | null; pumpName: string | null; amount: string | null; bankName: string | null; location: string | null; }

const EMPTY = { paymentDate: '', accountNumber: '', pumpName: '', amount: '', ifscCode: '', bankName: '', location: '', billDated: '' };

export default function PumpPaymentsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const s = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const { data: payments, isLoading } = useQuery({ queryKey: ['pump'], queryFn: () => api.get('/api/pump').then(r => r.data.payments) });

  const save = useMutation({
    mutationFn: (d: typeof form) => editId ? api.put(`/api/pump/${editId}`, d) : api.post('/api/pump', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pump'] }); setOpen(false); },
  });
  const remove = useMutation({ mutationFn: (id: number) => api.delete(`/api/pump/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['pump'] }) });

  function openCreate() { setForm(EMPTY); setEditId(null); setOpen(true); }
  function openEdit(row: PP) {
    const r = row as unknown as Record<string, unknown>;
    setForm({ paymentDate: fmtDateInput(r.paymentDate as string), accountNumber: String(r.accountNumber ?? ''), pumpName: String(r.pumpName ?? ''), amount: String(r.amount ?? ''), ifscCode: String(r.ifscCode ?? ''), bankName: String(r.bankName ?? ''), location: String(r.location ?? ''), billDated: fmtDateInput(r.billDated as string) });
    setEditId(row.id); setOpen(true);
  }

  const columns: Column<PP>[] = [
    { header: 'Date', render: r => fmtDate(r.paymentDate) },
    { header: 'Pump Name', render: r => <span className="font-medium">{r.pumpName || '—'}</span> },
    { header: 'Amount (₹)', render: r => <span className="tabular-nums">{fmtNum(r.amount)}</span> },
    { header: 'Bank', render: r => r.bankName || '—' },
    { header: 'Location', render: r => r.location || '—' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pump Payments</h1>
          <p className="text-slate-500 text-sm mt-0.5">{payments?.length ?? 0} records</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Payment</Button>
      </div>

      <DataTable columns={columns} data={payments ?? []} isLoading={isLoading} onEdit={openEdit} onDelete={r => remove.mutate(r.id)} />

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Pump Payment' : 'Add Pump Payment'} size="md">
        <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Payment Date" type="date" value={form.paymentDate} onChange={s('paymentDate')} />
            <InputField label="Bill Dated" type="date" value={form.billDated} onChange={s('billDated')} />
            <InputField label="Pump Name" value={form.pumpName} onChange={s('pumpName')} />
            <InputField label="Location" value={form.location} onChange={s('location')} />
            <InputField label="Account Number" value={form.accountNumber} onChange={s('accountNumber')} />
            <InputField label="Amount (₹)" type="number" step="0.01" value={form.amount} onChange={s('amount')} />
            <InputField label="IFSC Code" value={form.ifscCode} onChange={s('ifscCode')} />
            <InputField label="Bank Name" value={form.bankName} onChange={s('bankName')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
