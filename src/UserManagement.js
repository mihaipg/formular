import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [loading, setLoading] = useState(true);

  const db = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = cred.user;

      await setDoc(doc(db, "users", newUser.uid), {
        email: newUser.email,
        role: role,
        createdAt: new Date(),
      });

      alert("Utilizator creat cu succes!");
      setEmail("");
      setPassword("");
      setRole("User");
      fetchUsers();
    } catch (error) {
      alert("Eroare la creare: " + error.message);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Sigur vrei să ștergi acest utilizator?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        fetchUsers();
      } catch (error) {
        alert("Eroare la ștergere: " + error.message);
      }
    }
  };

  const updateRole = async (id, newRole) => {
    try {
      await setDoc(doc(db, "users", id), { ...users.find(u => u.id === id), role: newRole });
      fetchUsers();
    } catch (error) {
      alert("Eroare la actualizarea rolului: " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h2>Utilizatori existenți</h2>
      {loading ? (
        <p>Se încarcă...</p>
      ) : (
        <table style={{ width: "100%", marginBottom: 30 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Email</th>
              <th>Rol</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => deleteUser(u.id)}
                    style={{
                      padding: "6px 12px",
                      background: "#cc0000",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Adaugă utilizator nou</h2>
      <form onSubmit={createUser}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Parolă"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ ...inputStyle, marginBottom: 20 }}
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: 16,
            background: "#003366",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Creează utilizator
        </button>
      </form>

      <div style={{ marginTop: 40 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 16px",
            background: "#666",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Înapoi la dashboard
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: 12,
  padding: 10,
  fontSize: 16,
};