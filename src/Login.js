import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(); // notificăm App.js că userul e logat
    } catch (err) {
      alert("Autentificare eșuată. Verifică emailul și parola.");
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>Autentificare Admin</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Parolă"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <button type="submit" style={buttonStyle}>
        Login
      </button>
    </form>
  );
}

const inputStyle = {
  width: "100%",
  marginBottom: 12,
  padding: 10,
  fontSize: 16,
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: 16,
  backgroundColor: "#003366",
  color: "white",
  border: "none",
  cursor: "pointer",
};