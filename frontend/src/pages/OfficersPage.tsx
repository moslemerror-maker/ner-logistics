import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { InputField } from '@/components/ui/Fields';
import DataTable, { Column } from '@/components/DataTable';

interface Officer { id: number; name: string; role: string | null; accountReference: string | null; }

const EMPTY = { name: '', role: '', accountReference: '' };

export default function OfficersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const { data, isLoading } = useQuery({ queryKey: ['officers'], queryFn: () => api.get('/api/officers').then(r => r.data.officers) });

  const save = useMutation({
    mutationFn: (d: typeof form) => editId ? api.put(`/api/officers/${editId}`, d) : api.post('/api/officers', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['officers'] }); setOpen(false); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/api/officers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['officers'] }),
  });

  function openCreate() { setForm(EMPTY); setEditId(null); setOpen(true); }
  function openEdit(row: Officer) {
    setForm({ name: row.name, role: row.role || '', accountReference: row.accountReference || '' });
    setEditId(row.id); setOpen(true);
  }

  const columns: Column<Officer>[] = [
    { header: 'Name', render: r => <span className="font-medium">{r.name}</span> },
    { header: 'Role / Designation', render: r => r.role || '—' },
    { header: 'Account Reference', render: r => r.accountReference || '—' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Officers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data?.length ?? 0} officers</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Officer</Button>
      </div>

      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} onEdit={openEdit} onDelete={r => remove.mutate(r.id)} />

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit Officer' : 'Add Officer'} size="sm">
        <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <InputField label="Name" required value={form.name} onChange={f('name')} />
          <InputField label="Role / Designation" value={form.role} onChange={f('role')} />
          <InputField label="Account Reference" value={form.accountReference} onChange={f('accountReference')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
