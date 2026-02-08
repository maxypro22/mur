import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { UserPlus, UserCheck, UserX, Edit2, Trash2, X, Save } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Lawyer' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const { data } = await api.get('/users');
        setUsers(data);
    };

    const handleOpenCreate = () => {
        setEditingUserId(null);
        setFormData({ name: '', email: '', password: '', role: 'Lawyer' });
        setShowForm(true);
    };

    const handleOpenEdit = (user) => {
        setEditingUserId(user._id);
        setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUserId) {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await api.put(`/users/${editingUserId}`, updateData);
            } else {
                await api.post('/users', formData);
            }
            setShowForm(false);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.error || 'فشل حفظ البيانات');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العضو؟ لا يمكن التراجع عن هذا الإجراء.')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                alert(error.response?.data?.error || 'فشل حذف المستخدم');
            }
        }
    };

    return (
        <div>
            <div className="header-bar">
                <div>
                    <h1 style={{ margin: 0 }}>إدارة فريق العمل</h1>
                    <p style={{ color: '#9CA3AF', margin: '5px 0 0 0' }}>إدارة المحامين وصلاحيات الوصول</p>
                </div>
                <button onClick={handleOpenCreate} className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserPlus size={18} />
                    إضافة عضو جديد
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem', border: `1px solid ${editingUserId ? '#F59E0B' : '#3B82F6'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>{editingUserId ? 'تعديل بيانات العضو' : 'تفاصيل الحساب الجديد'}</h3>
                        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input placeholder="الاسم الكامل" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" required />
                        <input placeholder="البريد الإلكتروني" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="input-field" required />
                        <input placeholder={editingUserId ? "كلمة المرور (اتركها فارغة للتغيير)" : "كلمة المرور"} type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="input-field" required={!editingUserId} />
                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="input-field" required>
                            <option value="Lawyer">محامي</option>
                            <option value="Admin">مدير نظام (Admin)</option>
                        </select>
                        <button type="submit" className="button-primary" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            {editingUserId ? <Save size={18} /> : <UserPlus size={18} />}
                            <span>{editingUserId ? 'تحديث البيانات' : 'إنشاء الحساب'}</span>
                        </button>
                    </form>
                </div>
            )}

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>البريد الإلكتروني</th>
                                <th>الدور</th>
                                <th>التاريخ</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`badge ${u.role === 'Admin' ? 'badge-success' : 'badge-warning'}`}>
                                            {u.role === 'Admin' ? 'مدير' : 'محامي'}
                                        </span>
                                    </td>
                                    <td>{new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <button onClick={() => handleOpenEdit(u)} style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer', padding: 0 }} title="تعديل">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(u._id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }} title="حذف">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
