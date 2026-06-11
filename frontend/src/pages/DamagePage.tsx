import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '@/lib/axios';
import { fmtNum, fmtDate, fmtDateInput } from '@/lib/fmt';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { InputField, SelectField, TextareaField, SectionHeader } from '@/components/ui/Fields';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/DataTable';

interface DR { id: number; incidentDate: string | null; truckNumber: string | null; loadingPoint: string | null; destination: string | null; damagedQty: string | null; claimStatus: string; incidentType: string | null; }

const EMPTY = { incidentDate: '', truckNumber: '', loadingPoint: '', destination: '', totalQty: '', damagedQty: '', advanceLoss: '', damageCost: '', otherExpenses: '', materialTranship: '', cementSale: '', balance: '', claimReceived: '', recoveredFromOfficials: '', lossToRecover: '', dispatchOfficer: '', incidentType: '', claimStatus: 'PENDING', remarks: '' };

const claimColors: Record<string, 'yellow' | 'blue' | 'green' | 'red'> = { PENDING: 'yellow', FILED: 'blue', SETTLED: 'green', REJECTED: 'red' };

export default function DamagePage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const s = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const { data: records, isLoading } = useQuery({ queryKey: ['damage'], queryFn: () => api.get('/api/damage').then(r => r.data.records) });

  const save = useMutation({
    mutationFn: (d: typeof form) => editId ? api.put(`/api/damage/${editId}`, d) : api.post('/api/damage', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['damage'] }); setOpen(false); },
  });
  const remove = useMutation({ mutationFn: (id: number) => api.delete(`/api/damage/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['damage'] }) });

  function openCreate() { setForm(EMPTY); setEditId(null); setOpen(true); }
  function openEdit(row: DR) {
    const r = row as unknown as Record<string, unknown>;
    setForm({ incidentDate: fmtDateInput(r.incidentDate as string), truckNumber: String(r.truckNumber ?? ''), loadingPoint: String(r.loadingPoint ?? ''), destination: String(r.destination ?? ''), totalQty: String(r.totalQty ?? ''), damagedQty: String(r.damagedQty ?? ''), advanceLoss: String(r.advanceLoss ?? ''), damageCost: String(r.damageCost ?? ''), otherExpenses: String(r.otherExpenses ?? ''), materialTranship: String(r.materialTranship ?? ''), cementSale: String(r.cementSale ?? ''), balance: String(r.balance ?? ''), claimReceived: String(r.claimReceived ?? ''), recoveredFromOfficials: String(r.recoveredFromOfficials ?? ''), lossToRecover: String(r.lossToRecover ?? ''), dispatchOfficer: String(r.dispatchOfficer ?? ''), incidentType: String(r.incidentType ?? ''), claimStatus: String(r.claimStatus ?? 'PENDING'), remarks: String(r.remarks ?? '') });
    setEditId(row.id); setOpen(true);
  }

  const columns: Column<DR>[] = [
    { header: 'Date', render: r => fmtDate(r.incidentDate) },
    { header: 'Truck', render: r => <span className="font-medium">{r.truckNumber || '—'}</span> },
    { header: 'Route', render: r => r.loadingPoint && r.destination ? `${r.loadingPoint} → ${r.destination}` : '—' },
    { header: 'Damaged Qty', render: r => fmtNum(r.damagedQty) },
    { header: 'Type', render: r => r.incidentType || '—' },
    { header: 'Claim Status', render: r => <Badge label={r.claimStatus} color={claimColors[r.claimStatus] ?? 'slate'} /> },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Damage & Insurance</h1>
          <p className="text-slate-500 text-sm mt-0.5">{records?.length ?? 0} records</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Record</Button>
      </div>

      <DataTable columns={columns} data={records ?? []} isLoading={isLoading} onEdit={openEdit} onDelete={r => remove.mutate(r.id)} />

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Damage Record' : 'New Damage Record'} size="2xl">
        <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <SectionHeader title="Incident Details" />
            <InputField label="Incident Date" type="date" value={form.incidentDate} onChange={s('incidentDate')} />
            <InputField label="Truck Number" value={form.truckNumber} onChange={s('truckNumber')} />
            <InputField label="Incident Type" value={form.incidentType} onChange={s('incidentType')} />
            <InputField label="Loading Point" value={form.loadingPoint} onChange={s('loadingPoint')} />
            <InputField label="Destination" value={form.destination} onChange={s('destination')} />
            <InputField label="Dispatch Officer" value={form.dispatchOfficer} onChange={s('dispatchOfficer')} />

            <SectionHeader title="Quantities" />
            <InputField label="Total Qty" type="number" step="0.001" value={form.totalQty} onChange={s('totalQty')} />
            <InputField label="Damaged Qty" type="number" step="0.001" value={form.damagedQty} onChange={s('damagedQty')} />

            <SectionHeader title="Financial Details (₹)" />
            <InputField label="Advance Loss" type="number" step="0.01" value={form.advanceLoss} onChange={s('advanceLoss')} />
            <InputField label="Damage Cost" type="number" step="0.01" value={form.damageCost} onChange={s('damageCost')} />
            <InputField label="Other Expenses" type="number" step="0.01" value={form.otherExpenses} onChange={s('otherExpenses')} />
            <InputField label="Material Tranship" type="number" step="0.01" value={form.materialTranship} onChange={s('materialTranship')} />
            <InputField label="Cement Sale" type="number" step="0.01" value={form.cementSale} onChange={s('cementSale')} />
            <InputField label="Balance" type="number" step="0.01" value={form.balance} onChange={s('balance')} />
            <InputField label="Claim Received" type="number" step="0.01" value={form.claimReceived} onChange={s('claimReceived')} />
            <InputField label="Recovered from Officials" type="number" step="0.01" value={form.recoveredFromOfficials} onChange={s('recoveredFromOfficials')} />
            <InputField label="Loss to Recover" type="number" step="0.01" value={form.lossToRecover} onChange={s('lossToRecover')} />

            <SectionHeader title="Claim Status" />
            <SelectField label="Claim Status" value={form.claimStatus} onChange={s('claimStatus')}>
              <option value="PENDING">Pending</option>
              <option value="FILED">Filed</option>
              <option value="SETTLED">Settled</option>
              <option value="REJECTED">Rejected</option>
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
