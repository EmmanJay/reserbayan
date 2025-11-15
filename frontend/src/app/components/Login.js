// src/app/components/Login.js
"use client";

import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (username === "user" && password === "pass") {
      setMessage("Login successful! 🎉");
    } else {
      setMessage("Invalid username or password. 😞");
    }
  };

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="username" style={{ display: "block" }}>
            Username:
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="password" style={{ display: "block" }}>
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button
          type="submit"
          style={{ padding: "10px 15px", cursor: "pointer" }}
        >
          Submit
        </button>
      </form>
      {message && (
        <p
          style={{
            marginTop: "10px",
            color: message.includes("successful") ? "green" : "red",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
