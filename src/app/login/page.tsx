"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login</h1>
      <div>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ padding: "8px", width: "200px", marginBottom: "10px" }}
        />
      </div>
      <div>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          style={{ padding: "8px", width: "200px", marginBottom: "10px" }}
        />
      </div>
      <button style={{ padding: "8px 16px" }}>
        Entrar
      </button>
      <a href="/" style={{ display: "block", marginTop: "20px" }}>
        ← Voltar para home
      </a>
    </div>
  );
}
