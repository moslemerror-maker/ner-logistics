import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Key } from 'lucide-react';
import api from '@/lib/axios';
import { fmtDate } from '@/lib/fmt';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { InputField, SelectField } from '@/components/ui/Fields';
import Badge from '@/components/ui/Badge';
import DataTable, { Column } from '@/components/DataTable';

interface User { id: number; username: string; name: string; role: string; isActive: boolean; createdAt: string; }

const EMPTY = { username: '', name: '', password: '', role: 'OPERATOR', isActive: true };

export default function UsersPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [pwdId, setPwdId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [newPwd, setNewPwd] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/api/users').then(r => r.data.users) });

  const save = useMutation({
    mutationFn: (d: typeof form) => editId
      ? api.put(`/api/users/${editId}`, d).then(r => r.data)
      : api.post('/api/users', d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setOpen(false); },
  });

  const changePwd = useMutation({
    mutationFn: () => api.put(`/api/users/${pwdId}/password`, { password: newPwd }),
    onSuccess: () => { setPwdOpen(false); setNewPwd(''); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/api/users/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  function openCreate() { setForm(EMPTY); setEditId(null); setOpen(true); }
  function openEdit(row: User) {
    setForm({ username: row.username, name: row.name, password: '', role: row.role, isActive: row.isActive });
    setEditId(row.id);
    setOpen(true);
  }

  const columns: Column<User>[] = [
    { header: 'Username', render: r => <span className="font-medium">{r.username}</span> },
    { header: 'Name', render: r => r.name },
    { header: 'Role', render: r => <Badge label={r.role} color={r.role === 'SUPER_ADMIN' ? 'purple' : r.role === 'ADMIN' ? 'blue' : 'slate'} /> },
    { header: 'Status', render: r => <Badge label={r.isActive ? 'Active' : 'Inactive'} color={r.isActive ? 'green' : 'red'} /> },
    { header: 'Created', render: r => fmtDate(r.createdAt) },
    {
      header: 'Password', render: r => (
        <button onClick={() => { setPwdId(r.id); setPwdOpen(true); }} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors">
          <Key className="w-3 h-3" /> Change
        </button>
      )
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">{data?.length ?? 0} users</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add User</Button>
      </div>

      <DataTable columns={columns} data={data ?? []} isLoading={isLoading}
        onEdit={openEdit} onDelete={(r) => remove.mutate(r.id)} />

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? 'Edit User' : 'Add User'}>
        <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Username" required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} disabled={!!editId} />
            <InputField label="Full Name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            {!editId && <InputField label="Password" required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />}
            <SelectField label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="OPERATOR">Operator</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </SelectField>
            {editId && (
              <SelectField label="Status" value={String(form.isActive)} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </SelectField>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={pwdOpen} onClose={() => setPwdOpen(false)} title="Change Password" size="sm">
        <form onSubmit={e => { e.preventDefault(); changePwd.mutate(); }} className="space-y-4">
          <InputField label="New Password" required type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setPwdOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={changePwd.isPending}>{changePwd.isPending ? 'Saving…' : 'Update Password'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
