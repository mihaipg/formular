import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import jsPDF from "jspdf";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [formulare, setFormulare] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    proces: "",
    procedura_nr: "",
    procedura_denumire: "",
    owner_de_proces: "",
    entitati_implicate: "",
    tools: "",
    flux: "",
    sugestii: "",
    status: "",
    comentarii: "",
  });
  const [filtruStatus, setFiltruStatus] = useState("");
  const [cautareText, setCautareText] = useState("");
  const [esteAdmin, setEsteAdmin] = useState(false);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "formulare"));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFormulare(lista);
    };
    fetchData();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setEsteAdmin(userData.role === "Admin");
        } else {
          setEsteAdmin(false);
        }
      } else {
        setEsteAdmin(false);
      }
    });
  }, []);

  useEffect(() => {
    if (selected) {
      setFormData({
        proces: selected.proces || "",
        procedura_nr: selected.procedura_nr || "",
        procedura_denumire: selected.procedura_denumire || "",
        owner_de_proces: selected.owner_de_proces || "",
        entitati_implicate: selected.entitati_implicate || "",
        tools: selected.tools || "",
        flux: selected.flux || "",
        sugestii: selected.sugestii || "",
        status: selected.status || "",
        comentarii: selected.comentarii || "",
      });
    }
  }, [selected]);

  const rezultateFiltrate = formulare.filter((f) => {
    const potrivesteStatus =
      !filtruStatus || (f.status && f.status === filtruStatus);
    const potrivesteCautare =
      !cautareText ||
      (f.proces &&
        f.proces.toLowerCase().includes(cautareText.toLowerCase())) ||
      (f.procedura_denumire &&
        f.procedura_denumire.toLowerCase().includes(cautareText.toLowerCase())) ||
      (f.owner_de_proces &&
        f.owner_de_proces.toLowerCase().includes(cautareText.toLowerCase()));
    return potrivesteStatus && potrivesteCautare;
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const salveazaModificari = async () => {
    try {
      const ref = doc(db, "formulare", selected.id);
      await updateDoc(ref, formData);
      alert("Modificări salvate cu succes.");
      setFormulare(
        formulare.map((f) =>
          f.id === selected.id ? { id: f.id, ...formData } : f
        )
      );
      setSelected(null);
    } catch (error) {
      alert("Eroare la salvare: " + error.message);
    }
  };

  const stergeFormular = async (id) => {
    if (window.confirm("Sigur vrei să ștergi acest formular?")) {
      try {
        await deleteDoc(doc(db, "formulare", id));
        setFormulare(formulare.filter((f) => f.id !== id));
        setSelected(null);
        alert("Formular șters cu succes!");
      } catch (error) {
        alert("Eroare la ștergere: " + error.message);
      }
    }
  };

  const exportaPDF = () => {
    const doc = new jsPDF();
    const lineHeight = 10;
    const sectionSpacing = 6;
    let y = 10;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`PROCES: ${formData.proces}`, 10, y);
    y += lineHeight + sectionSpacing;

    doc.text(
      `PROCEDURA NR: ${formData.procedura_nr} - ${formData.procedura_denumire}`,
      10,
      y
    );
    y += lineHeight + sectionSpacing;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`OWNER DE PROCES: ${formData.owner_de_proces}`, 10, y);
    y += lineHeight + sectionSpacing;

    doc.text(`ENTITATI IMPLICATE:`, 10, y);
    doc.setFont("helvetica", "normal");
    y += lineHeight;
    doc.text(`${formData.entitati_implicate}`, 10, y);
    y += lineHeight + sectionSpacing;

    doc.setFont("helvetica", "bold");
    doc.text(`TOOLS:`, 10, y);
    doc.setFont("helvetica", "normal");
    y += lineHeight;
    doc.text(`${formData.tools}`, 10, y);
    y += lineHeight + sectionSpacing;

    doc.setFont("helvetica", "bold");
    doc.text(`FLUX:`, 10, y);
    doc.setFont("helvetica", "normal");
    y += lineHeight;
    doc.text(`${formData.flux}`, 10, y);
    y += lineHeight + sectionSpacing;

    doc.setFont("helvetica", "bold");
    doc.text(`SUGESTII:`, 10, y);
    doc.setFont("helvetica", "normal");
    y += lineHeight;
    doc.text(`${formData.sugestii}`, 10, y);
    y += lineHeight + sectionSpacing;

    doc.setFont("helvetica", "bold");
    doc.text(`STATUS: ${formData.status}`, 10, y);
    y += lineHeight + sectionSpacing;

    doc.setFont("helvetica", "bold");
    doc.text(`COMENTARII:`, 10, y);
    doc.setFont("helvetica", "normal");
    y += lineHeight;
    doc.text(`${formData.comentarii}`, 10, y);
    y += lineHeight + sectionSpacing;

    const fileName = `${formData.proces}_${formData.procedura_nr}_${formData.procedura_denumire}.pdf`;
    doc.save(fileName);
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h2>Formulare primite</h2>

      {!selected && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ marginRight: 10 }}>Filtru status:</label>
          <select
            value={filtruStatus}
            onChange={(e) => setFiltruStatus(e.target.value)}
            style={{ padding: 6, marginRight: 20 }}
          >
            <option value="">Toate</option>
            <option value="în lucru">În lucru</option>
            <option value="de corectat">De corectat</option>
            <option value="finalizat">Finalizat</option>
          </select>

          <label style={{ marginRight: 10 }}>Căutare:</label>
          <input
            type="text"
            value={cautareText}
            onChange={(e) => setCautareText(e.target.value)}
            style={{ padding: 6, width: 200 }}
          />
        </div>
      )}
      {selected ? (
        <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
          <h2>Editează formular</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Proces:</label>
            <input
              value={formData.proces}
              onChange={handleChange("proces")}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Procedura:</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                placeholder="Nr."
                value={formData.procedura_nr}
                onChange={handleChange("procedura_nr")}
                style={{ ...inputStyle, width: "80px" }}
              />
              <input
                placeholder="Denumire procedură"
                value={formData.procedura_denumire}
                onChange={handleChange("procedura_denumire")}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Owner:</label>
            <input
              value={formData.owner_de_proces}
              onChange={handleChange("owner_de_proces")}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Entități implicate:</label>
            <textarea
              value={formData.entitati_implicate}
              onChange={handleChange("entitati_implicate")}
              style={{ ...inputStyle, height: 100 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Tools:</label>
            <textarea
              value={formData.tools}
              onChange={handleChange("tools")}
              style={{ ...inputStyle, height: 100 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Flux:</label>
            <textarea
              value={formData.flux}
              onChange={handleChange("flux")}
              style={{ ...inputStyle, height: 100 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Sugestii:</label>
            <textarea
              value={formData.sugestii}
              onChange={handleChange("sugestii")}
              style={{ ...inputStyle, height: 100 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Status:</label>
            <select
              value={formData.status}
              onChange={handleChange("status")}
              style={inputStyle}
            >
              <option value="">Selectează</option>
              <option value="în lucru">În lucru</option>
              <option value="de corectat">De corectat</option>
              <option value="finalizat">Finalizat</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold" }}>Comentarii:</label>
            <textarea
              value={formData.comentarii}
              onChange={handleChange("comentarii")}
              style={{ ...inputStyle, height: 100 }}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <button onClick={salveazaModificari} style={buttonStyle}>
              Salvează modificările
            </button>
            <button
              onClick={exportaPDF}
              style={{ ...buttonStyle, background: "#4CAF50", marginLeft: 10 }}
            >
              Export PDF
            </button>
            <button
              onClick={() => setSelected(null)}
              style={{ ...buttonStyle, background: "#777", marginLeft: 10 }}
            >
              Înapoi la listă
            </button>
          </div>
        </div>
      ) : (
        <>
          {rezultateFiltrate.map((f) => (
            <div
              key={f.id}
              style={{
                border: "1px solid #ccc",
                padding: 12,
                marginBottom: 12,
              }}
            >
              <strong>{f.proces}</strong> – Procedura {f.procedura_nr}: {f.procedura_denumire}
              <div>
                <small>Owner: {f.owner_de_proces}</small>
              </div>
              {f.status && (
                <div>
                  <em>Status: {f.status}</em>
                </div>
              )}
              {f.comentarii && (
                <div>
                  <small>Comentarii: {f.comentarii}</small>
                </div>
              )}
              <button onClick={() => setSelected(f)} style={buttonStyle}>
                Vezi detalii
              </button>
              {esteAdmin && (
                <button
                  onClick={() => stergeFormular(f.id)}
                  style={{
                    ...buttonStyle,
                    background: "#ff0000",
                    marginLeft: 10,
                  }}
                >
                  Șterge formularul
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: "6px 12px",
  background: "#003366",
  color: "white",
  border: "none",
  cursor: "pointer",
  marginTop: 10,
};

const inputStyle = {
  padding: 10,
  fontSize: 16,
  marginBottom: 10,
  width: "100%",
};