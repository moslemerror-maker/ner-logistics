import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '@/lib/axios';
import { fmtNum, fmtDate, fmtDateInput } from '@/lib/fmt';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { InputField, SelectField, TextareaField } from '@/components/ui/Fields';
import DataTable, { Column } from '@/components/DataTable';

interface Officer { id: number; name: string; }
interface NP { id: number; paymentDate: string | null; biltyNumber: string | null; vehicleNumber: string | null; beneficiaryName: string | null; amount: string | null; bankName: string | null; officer: { name: string } | null; }

const EMPTY = { paymentDate: '', biltyNumber: '', vehicleNumber: '', accountNumber: '', beneficiaryName: '', amount: '', ifscCode: '', bankName: '', branchName: '', phoneNumber: '', officerId: '', remarks: '' };

export default function NeftPaymentsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const s = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const { data: payments, isLoading } = useQuery({ queryKey: ['neft'], queryFn: () => api.get('/api/neft').then(r => r.data.payments) });
  const { data: officers } = useQuery<Officer[]>({ queryKey: ['officers'], queryFn: () => api.get('/api/officers').then(r => r.data.officers) });

  const save = useMutation({
    mutationFn: (d: typeof form) => editId ? api.put(`/api/neft/${editId}`, d) : api.post('/api/neft', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['neft'] }); setOpen(false); },
  });
  const remove = useMutation({ mutationFn: (id: number) => api.delete(`/api/neft/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['neft'] }) });

  function openCreate() { setForm(EMPTY); setEditId(null); setOpen(true); }
  function openEdit(row: NP) {
    const r = row as unknown as Record<string, unknown>;
    setForm({ paymentDate: fmtDateInput(r.paymentDate as string), biltyNumber: String(r.biltyNumber ?? ''), vehicleNumber: String(r.vehicleNumber ?? ''), accountNumber: String(r.accountNumber ?? ''), beneficiaryName: String(r.beneficiaryName ?? ''), amount: String(r.amount ?? ''), ifscCode: String(r.ifscCode ?? ''), bankName: String(r.bankName ?? ''), branchName: String(r.branchName ?? ''), phoneNumber: String(r.phoneNumber ?? ''), officerId: r.officerId ? String(r.officerId) : '', remarks: String(r.remarks ?? '') });
    setEditId(row.id); setOpen(true);
  }

  const columns: Column<NP>[] = [
    { header: 'Date', render: r => fmtDate(r.paymentDate) },
    { header: 'Bilty #', render: r => r.biltyNumber || '—' },
    { header: 'Vehicle #', render: r => r.vehicleNumber || '—' },
    { header: 'Beneficiary', render: r => <span className="font-medium">{r.beneficiaryName || '—'}</span> },
    { header: 'Amount (₹)', render: r => <span className="tabular-nums">{fmtNum(r.amount)}</span> },
    { header: 'Bank', render: r => r.bankName || '—' },
    { header: 'Officer', render: r => r.officer?.name || '—' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">NEFT Payments</h1>
          <p className="text-slate-500 text-sm mt-0.5">{payments?.length ?? 0} records</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Payment</Button>
      </div>

      <DataTable columns={columns} data={payments ?? []} isLoading={isLoading} onEdit={openEdit} onDelete={r => remove.mutate(r.id)} />

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit NEFT Payment' : 'Add NEFT Payment'} size="lg">
        <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Payment Date" type="date" value={form.paymentDate} onChange={s('paymentDate')} />
            <InputField label="Bilty Number" value={form.biltyNumber} onChange={s('biltyNumber')} />
            <InputField label="Vehicle Number" value={form.vehicleNumber} onChange={s('vehicleNumber')} />
            <InputField label="Account Number" value={form.accountNumber} onChange={s('accountNumber')} />
            <InputField label="Beneficiary Name" value={form.beneficiaryName} onChange={s('beneficiaryName')} className="col-span-2" />
            <InputField label="Amount (₹)" type="number" step="0.01" value={form.amount} onChange={s('amount')} />
            <InputField label="IFSC Code" value={form.ifscCode} onChange={s('ifscCode')} />
            <InputField label="Bank Name" value={form.bankName} onChange={s('bankName')} />
            <InputField label="Branch Name" value={form.branchName} onChange={s('branchName')} />
            <InputField label="Phone Number" value={form.phoneNumber} onChange={s('phoneNumber')} />
            <SelectField label="Officer" value={form.officerId} onChange={s('officerId')}>
              <option value="">None</option>
              {officers?.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </SelectField>
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
