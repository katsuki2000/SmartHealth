import React, { useState, useEffect } from 'react';
import './UserManagement.css';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  practitioner?: {
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'DOCTOR',
    firstName: '',
    lastName: '',
    specialty: '',
  });

  const [editData, setEditData] = useState({
    email: '',
    password: '',
    role: 'DOCTOR',
    firstName: '',
    lastName: '',
    specialty: '',
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('smarthealth_token');
      const res = await fetch('http://localhost:3000/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('smarthealth_token');
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de la création');
      }

      await fetchUsers();
      setIsAdding(false);
      setFormData({
        email: '',
        password: '',
        role: 'DOCTOR',
        firstName: '',
        lastName: '',
        specialty: '',
      });
      showSuccess('Utilisateur créé avec succès !');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (u: User) => {
    setEditingUser(u);
    setEditData({
      email: u.email,
      password: '',
      role: u.role,
      firstName: u.practitioner?.firstName || '',
      lastName: u.practitioner?.lastName || '',
      specialty: u.practitioner?.specialty || '',
    });
    setIsAdding(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('smarthealth_token');
      // Only send changed fields
      const payload: any = {};
      if (editData.email !== editingUser.email) payload.email = editData.email;
      if (editData.role !== editingUser.role) payload.role = editData.role;
      if (editData.password) payload.password = editData.password;
      if (editData.firstName !== (editingUser.practitioner?.firstName || '')) payload.firstName = editData.firstName;
      if (editData.lastName !== (editingUser.practitioner?.lastName || '')) payload.lastName = editData.lastName;
      if (editData.specialty !== (editingUser.practitioner?.specialty || '')) payload.specialty = editData.specialty;

      const res = await fetch(`http://localhost:3000/auth/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de la modification');
      }

      await fetchUsers();
      setEditingUser(null);
      showSuccess('Utilisateur modifié avec succès !');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      const token = localStorage.getItem('smarthealth_token');
      const res = await fetch(`http://localhost:3000/auth/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      await fetchUsers();
      showSuccess('Utilisateur supprimé.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading && users.length === 0) return <div className="admin-loading">Chargement des utilisateurs...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <p className="admin-subtitle">Gérez les accès des praticiens et des administrateurs système.</p>
        <button className="admin-add-btn" onClick={() => { setIsAdding(!isAdding); setEditingUser(null); }}>
          {isAdding ? 'Annuler' : '+ Nouvel Utilisateur'}
        </button>
      </div>

      {error && <div className="admin-error">⚠️ {error}</div>}
      {successMsg && <div className="admin-success">✅ {successMsg}</div>}

      {/* ── Formulaire de création ── */}
      {isAdding && (
        <form className="admin-form card" onSubmit={handleCreateUser}>
          <h3 className="form-title">Créer un nouveau compte</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Email Professionnel</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
                placeholder="ex: dr.smith@smarthealth.com"
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                required 
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label>Rôle</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="DOCTOR">Médecin</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            {formData.role === 'DOCTOR' && (
              <>
                <div className="form-group">
                  <label>Nom</label>
                  <input 
                    type="text" 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                    required 
                    placeholder="Nom de famille"
                  />
                </div>
                <div className="form-group">
                  <label>Prénom</label>
                  <input 
                    type="text" 
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})} 
                    required 
                    placeholder="Prénom"
                  />
                </div>
                <div className="form-group">
                  <label>Spécialité</label>
                  <input 
                    type="text" 
                    value={formData.specialty} 
                    onChange={e => setFormData({...formData, specialty: e.target.value})} 
                    required 
                    placeholder="ex: Cardiologue"
                  />
                </div>
              </>
            )}
          </div>
          <button type="submit" className="form-submit-btn" disabled={loading}>
            {loading ? 'Création...' : 'Valider la création'}
          </button>
        </form>
      )}

      {/* ── Formulaire d'édition ── */}
      {editingUser && (
        <form className="admin-form card edit-form" onSubmit={handleUpdateUser}>
          <h3 className="form-title">✏️ Modifier : {editingUser.email}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={editData.email} 
                onChange={e => setEditData({...editData, email: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe (laisser vide pour ne pas changer)</label>
              <input 
                type="password" 
                value={editData.password} 
                onChange={e => setEditData({...editData, password: e.target.value})} 
                placeholder="Laisser vide si inchangé"
              />
            </div>
            <div className="form-group">
              <label>Rôle</label>
              <select value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})}>
                <option value="DOCTOR">Médecin</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            {editData.role === 'DOCTOR' && (
              <>
                <div className="form-group">
                  <label>Nom</label>
                  <input 
                    type="text" 
                    value={editData.lastName} 
                    onChange={e => setEditData({...editData, lastName: e.target.value})} 
                    placeholder="Nom de famille"
                  />
                </div>
                <div className="form-group">
                  <label>Prénom</label>
                  <input 
                    type="text" 
                    value={editData.firstName} 
                    onChange={e => setEditData({...editData, firstName: e.target.value})} 
                    placeholder="Prénom"
                  />
                </div>
                <div className="form-group">
                  <label>Spécialité</label>
                  <input 
                    type="text" 
                    value={editData.specialty} 
                    onChange={e => setEditData({...editData, specialty: e.target.value})} 
                    placeholder="ex: Cardiologue"
                  />
                </div>
              </>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="form-cancel-btn" onClick={() => setEditingUser(null)}>
              Annuler
            </button>
            <button type="submit" className="form-submit-btn" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      )}

      <div className="admin-table-wrapper card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Détails Praticien</th>
              <th>Date Création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className={editingUser?.id === u.id ? 'row-editing' : ''}>
                <td>
                  <div className="user-info">
                    <span className="user-email">{u.email}</span>
                    <span className="user-id">{u.id.slice(0, 8)}...</span>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${u.role.toLowerCase()}`}>
                    {u.role === 'ADMIN' ? '🛡️ Admin' : '👨‍⚕️ Médecin'}
                  </span>
                </td>
                <td>
                  {u.practitioner ? (
                    <div className="pract-info">
                      <strong>{u.practitioner.firstName} {u.practitioner.lastName}</strong>
                      <span>{u.practitioner.specialty}</span>
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="edit-btn" 
                      onClick={() => startEditing(u)}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.email === 'admin@smarthealth.com'}
                      title={u.email === 'admin@smarthealth.com' ? "L'admin principal ne peut pas être supprimé" : "Supprimer"}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
