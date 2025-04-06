import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import UserManagement from "./UserManagement";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCUvH7xGofNZdGb82oqFYKgb74m4Q8QMFc",
  authDomain: "formular-procese-nord.firebaseapp.com",
  projectId: "formular-procese-nord",
  storageBucket: "formular-procese-nord.firebasestorage.app",
  messagingSenderId: "933021707394",
  appId: "1:933021707394:web:ec050d5feb9511f9ae989b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [esteAdmin, setEsteAdmin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [formData, setFormData] = useState({
    proces: "",
    procedura_nr: "",
    procedura_denumire: "",
    owner_de_proces: "",
    entitati_implicate: "",
    tools: "",
    flux: "",
    sugestii: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setEsteAdmin(data.role === "Admin");
        } else {
          console.warn("⚠️ Utilizator fără document Firestore.");
          setEsteAdmin(false);
        }
      } else {
        setEsteAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "formulare"), {
        ...formData,
        createdAt: new Date(),
      });
      alert("Formularul a fost trimis cu succes.");
      setFormData({
        proces: "",
        procedura_nr: "",
        procedura_denumire: "",
        owner_de_proces: "",
        entitati_implicate: "",
        tools: "",
        flux: "",
        sugestii: "",
      });
    } catch (err) {
      alert("Eroare la trimiterea formularului: " + err.message);
    }
  };

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <Router>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: 20,
          alignItems: "center",
        }}
      >
        <div>
          <strong>{esteAdmin ? "Admin" : "Utilizator"}:</strong>{" "}
          {user.email}
          {esteAdmin && (
            <Link to="/user-management" style={{ marginLeft: 20 }}>
              Gestionează Utilizatori
            </Link>
          )}
        </div>
        <div>
          <button
            onClick={() => setShowDashboard((prev) => !prev)}
            style={{
              marginRight: 10,
              padding: "6px 12px",
              background: "#006699",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            {showDashboard ? "Vezi Formular" : "Vezi Dashboard"}
          </button>
          <button
            onClick={() => signOut(auth)}
            style={{
              padding: "6px 12px",
              background: "#990000",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <Routes>
        <Route
          path="/"
          element={
            showDashboard ? (
              <Dashboard key="dashboard" />
            ) : (
              <div key="formular" style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={styles.label}>PROCES:</label>
                    <input
                      value={formData.proces}
                      onChange={handleChange("proces")}
                      style={styles.input}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={styles.label}>PROCEDURA:</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        placeholder="Nr."
                        value={formData.procedura_nr}
                        onChange={handleChange("procedura_nr")}
                        style={{ ...styles.input, width: "80px" }}
                      />
                      <input
                        placeholder="Denumire procedură"
                        value={formData.procedura_denumire}
                        onChange={handleChange("procedura_denumire")}
                        style={{ ...styles.input, flex: 1 }}
                      />
                    </div>
                  </div>

                  <input
                    placeholder="Owner de proces"
                    value={formData.owner_de_proces}
                    onChange={handleChange("owner_de_proces")}
                    style={styles.input}
                  />
                  <textarea
                    placeholder="Entități implicate"
                    value={formData.entitati_implicate}
                    onChange={handleChange("entitati_implicate")}
                    style={styles.textarea}
                  />
                  <textarea
                    placeholder="Tools"
                    value={formData.tools}
                    onChange={handleChange("tools")}
                    style={styles.textarea}
                  />
                  <textarea
                    placeholder="FLUX (pașii numerotați)"
                    value={formData.flux}
                    onChange={handleChange("flux")}
                    style={styles.textarea}
                  />
                  <textarea
                    placeholder="Sugestii / Propuneri / Comentarii"
                    value={formData.sugestii}
                    onChange={handleChange("sugestii")}
                    style={styles.textarea}
                  />
                  <button type="submit" style={styles.button}>
                    Trimite formularul
                  </button>
                </form>
              </div>
            )
          }
        />
        <Route path="/user-management" element={<UserManagement />} />
      </Routes>
    </Router>
  );
}

const styles = {
  label: {
    fontWeight: "bold",
    display: "block",
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    display: "block",
    width: "100%",
    marginBottom: 12,
    padding: 8,
    fontSize: 16,
  },
  textarea: {
    display: "block",
    width: "100%",
    height: 100,
    marginBottom: 12,
    padding: 8,
    fontSize: 16,
  },
  button: {
    padding: "10px 20px",
    fontSize: 16,
    background: "#003366",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};