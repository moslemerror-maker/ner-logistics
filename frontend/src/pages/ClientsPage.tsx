import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { InputField, CheckboxField } from '@/components/ui/Fields';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/DataTable';

interface Client { id: number; name: string; gstin: string | null; pan: string | null; plantName: string | null; stateCode: string | null; isInterstate: boolean; }

const EMPTY = { name: '', gstin: '', pan: '', address: '', plantName: '', stateCode: '', isInterstate: false };

export default function ClientsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const { data, isLoading } = useQuery({ queryKey: ['clients'], queryFn: () => api.get('/api/clients').then(r => r.data.clients) });

  const save = useMutation({
    mutationFn: (d: typeof form) => editId ? api.put(`/api/clients/${editId}`, d) : api.post('/api/clients', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setOpen(false); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/api/clients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });

  function openCreate() { setForm(EMPTY); setEditId(null); setOpen(true); }
  function openEdit(row: Client) {
    setForm({ name: row.name, gstin: row.gstin || '', pan: row.pan || '', address: '', plantName: row.plantName || '', stateCode: row.stateCode || '', isInterstate: row.isInterstate });
    setEditId(row.id); setOpen(true);
  }

  const columns: Column<Client>[] = [
    { header: 'Name', render: r => <span className="font-medium">{r.name}</span> },
    { header: 'GSTIN', render: r => r.gstin || '—' },
    { header: 'PAN', render: r => r.pan || '—' },
    { header: 'Plant', render: r => r.plantName || '—' },
    { header: 'State', render: r => r.stateCode || '—' },
    { header: 'Type', render: r => <Badge label={r.isInterstate ? 'Interstate' : 'Local'} color={r.isInterstate ? 'orange' : 'blue'} /> },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data?.length ?? 0} clients</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Client</Button>
      </div>

      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} onEdit={openEdit} onDelete={r => remove.mutate(r.id)} />

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Client' : 'Add Client'}>
        <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Client Name" required value={form.name} onChange={f('name')} className="col-span-2" />
            <InputField label="GSTIN" value={form.gstin} onChange={f('gstin')} />
            <InputField label="PAN" value={form.pan} onChange={f('pan')} />
            <InputField label="Plant Name" value={form.plantName} onChange={f('plantName')} />
            <InputField label="State Code" value={form.stateCode} onChange={f('stateCode')} />
            <InputField label="Address" value={form.address} onChange={f('address')} className="col-span-2" />
            <CheckboxField label="Interstate Client" checked={form.isInterstate} onChange={e => setForm(p => ({ ...p, isInterstate: e.target.checked }))} className="col-span-2" />
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
