import "./styles.css";
import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const BASE = "https://q75ylp-8080.csb.app";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [tab, setTab] = useState(0); // 0=login, 1=register
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ===== LOGIN STATE =====
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");

  // ===== REGISTER STATE =====
  const [reg, setReg] = useState({
    login_name: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });

  const [fieldError, setFieldError] = useState({
    login_name: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          login_name: loginName,
          password,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Login failed");
        return;
      }

      const user = await res.json();
      // Save user to localStorage
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      onLoginSuccess(user);
      navigate(`/users/${user._id}`);
    } catch (err) {
      setError("Server error, try again");
    } finally {
      setLoading(false);
    }
  };

  // ===== REGISTER HANDLER =====
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // reset lỗi field
    setFieldError({
      login_name: "",
      password: "",
      password2: "",
      first_name: "",
      last_name: "",
    });

    // validate khi bấm nút
    let ok = true;
    const errs = {};

    if (!reg.login_name.trim()) {
      errs.login_name = "Login name is required";
      ok = false;
    }
    if (!reg.password.trim()) {
      errs.password = "Password is required";
      ok = false;
    }
    if (!reg.password2.trim()) {
      errs.password2 = "Confirm password is required";
      ok = false;
    }
    if (
      reg.password.trim() &&
      reg.password2.trim() &&
      reg.password !== reg.password2
    ) {
      errs.password2 = "Passwords do not match";
      ok = false;
    }
    if (!reg.first_name.trim()) {
      errs.first_name = "First name is required";
      ok = false;
    }
    if (!reg.last_name.trim()) {
      errs.last_name = "Last name is required";
      ok = false;
    }

    if (!ok) {
      setFieldError((prev) => ({ ...prev, ...errs }));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_name: reg.login_name,
          password: reg.password,
          first_name: reg.first_name,
          last_name: reg.last_name,
          location: reg.location,
          description: reg.description,
          occupation: reg.occupation,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Register failed");
        return;
      }

      // register OK -> chuyển về login + autofill
      setTab(0);
      setLoginName(reg.login_name);
      setPassword(reg.password);
      setError("Register success! Please login.");
    } catch {
      setError("Server error, try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Paper className="login-card">
        <Tabs
          value={tab}
          onChange={(e, v) => {
            setTab(v);
            setError("");
            setFieldError({
              login_name: "",
              password: "",
              password2: "",
              first_name: "",
              last_name: "",
            });
          }}
          centered
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {/* ========== LOGIN FORM ========== */}
        {tab === 0 && (
          <Box component="form" onSubmit={handleLogin} mt={2}>
            <TextField
              label="Login name"
              fullWidth
              margin="normal"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              autoFocus
              disabled={loading}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !loginName.trim() || !password.trim()}
              sx={{ mt: 2, height: 44 }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "LOGIN"
              )}
            </Button>
          </Box>
        )}

        {/* ========== REGISTER FORM ========== */}
        {tab === 1 && (
          <Box component="form" onSubmit={handleRegister} mt={2}>
            <TextField
              label="Login name *"
              fullWidth
              margin="dense"
              value={reg.login_name}
              onChange={(e) => {
                const v = e.target.value;
                setReg((p) => ({ ...p, login_name: v }));
                setFieldError((p) => ({ ...p, login_name: "" })); // ✅ sửa là ẩn lỗi
              }}
              disabled={loading}
              error={!!fieldError.login_name}
              helperText={fieldError.login_name}
            />

            <TextField
              label="Password *"
              type="password"
              fullWidth
              margin="dense"
              value={reg.password}
              onChange={(e) => {
                const v = e.target.value;
                setReg((p) => ({ ...p, password: v }));
                setFieldError((p) => ({ ...p, password: "" }));

                // nếu confirm đang báo không khớp thì check lại
                if (reg.password2 && v === reg.password2) {
                  setFieldError((p) => ({ ...p, password2: "" }));
                }
              }}
              disabled={loading}
              error={!!fieldError.password}
              helperText={fieldError.password}
            />

            <TextField
              label="Confirm password *"
              type="password"
              fullWidth
              margin="dense"
              value={reg.password2}
              onChange={(e) => {
                const v = e.target.value;
                setReg((p) => ({ ...p, password2: v }));

                // ✅ nếu khớp -> tắt lỗi luôn
                if (reg.password && reg.password === v) {
                  setFieldError((p) => ({ ...p, password2: "" }));
                } else {
                  // chỉ cần gõ là tắt lỗi required cũ
                  setFieldError((p) => ({ ...p, password2: "" }));
                }
              }}
              disabled={loading}
              error={!!fieldError.password2}
              helperText={fieldError.password2}
            />

            <TextField
              label="First name *"
              fullWidth
              margin="dense"
              value={reg.first_name}
              onChange={(e) => {
                const v = e.target.value;
                setReg((p) => ({ ...p, first_name: v }));
                setFieldError((p) => ({ ...p, first_name: "" }));
              }}
              disabled={loading}
              error={!!fieldError.first_name}
              helperText={fieldError.first_name}
            />

            <TextField
              label="Last name *"
              fullWidth
              margin="dense"
              value={reg.last_name}
              onChange={(e) => {
                const v = e.target.value;
                setReg((p) => ({ ...p, last_name: v }));
                setFieldError((p) => ({ ...p, last_name: "" }));
              }}
              disabled={loading}
              error={!!fieldError.last_name}
              helperText={fieldError.last_name}
            />

            {/* optional */}
            <TextField
              label="Location"
              fullWidth
              margin="dense"
              value={reg.location}
              onChange={(e) =>
                setReg((p) => ({ ...p, location: e.target.value }))
              }
              disabled={loading}
            />

            <TextField
              label="Description"
              fullWidth
              margin="dense"
              value={reg.description}
              onChange={(e) =>
                setReg((p) => ({ ...p, description: e.target.value }))
              }
              disabled={loading}
            />

            <TextField
              label="Occupation"
              fullWidth
              margin="dense"
              value={reg.occupation}
              onChange={(e) =>
                setReg((p) => ({ ...p, occupation: e.target.value }))
              }
              disabled={loading}
            />

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 2, height: 44 }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "REGISTER"
              )}
            </Button>
          </Box>
        )}
      </Paper>
    </div>
  );
}
