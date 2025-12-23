import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useLocation, useParams, useNavigate } from "react-router-dom";
// import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

// ✅ Link Backend
const BASE = "https://q75ylp-8080.csb.app";

function TopBar({ loggedInUser, setLoggedInUser, onUploadSuccess }) {
  const location = useLocation();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [rightText, setRightText] = React.useState(
    "Phạm Nguyễn Quang Minh - B22DCAT193"
  );

  // Modal add photo
  const [openAdd, setOpenAdd] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  // Modal change password
  const [openChangePassword, setOpenChangePassword] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("photo", selectedFile);

    setUploading(true);
    try {
      const res = await fetch(`${BASE}/api/photo/photos/new`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      // Notify UserPhotos to refresh
      onUploadSuccess && onUploadSuccess();

      // Close modal and reset
      setOpenAdd(false);
      setSelectedFile(null);
      alert("Photo uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BASE}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    // Clear localStorage
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    navigate("/users");
  };

  // Change password handler
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !newPasswordConfirm) {
      alert("Please fill all fields");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      alert("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(`${BASE}/api/admin/change-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        alert("Error: " + errorMsg);
        return;
      }

      alert("Password changed successfully!");
      setOpenChangePassword(false);
      setOldPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (err) {
      console.error(err);
      alert("Error changing password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      <AppBar position="static" className="topbar-appBar">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5" fontFamily="arial" color="black">
            {rightText}
          </Typography>

          {loggedInUser ? (
            <div className="topbar-right">
              <Button
                className="topbar-add-btn"
                variant="contained"
                onClick={() => setOpenAdd(true)}
              >
                Add Photo
              </Button>

              <Button
                className="topbar-change-password-btn"
                variant="contained"
                sx={{ textTransform: "none" }}
                onClick={() => setOpenChangePassword(true)}
              >
                Change Password
              </Button>

              <Typography className="topbar-greeting" variant="subtitle1">
                Hi, {loggedInUser.first_name}
              </Typography>

              <Button
                className="topbar-logout-btn"
                variant="outlined"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Typography variant="subtitle1" color="black">
              Please Login
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Dialog open={openAdd} onClose={() => !uploading && setOpenAdd(false)}>
        <DialogTitle>New Photo</DialogTitle>

        <DialogContent>
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{
                padding: "10px",
                border: "1px solid #1976d2",
                width: "100%",
                borderRadius: "6px",
                background: "#f5f5f5",
              }}
            />
          </div>
          {!selectedFile && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Select a photo to upload
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenAdd(false);
              setSelectedFile(null);
            }}
            disabled={uploading}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Upload"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openChangePassword}
        onClose={() => !changingPassword && setOpenChangePassword(false)}
      >
        <DialogTitle>Change Password</DialogTitle>

        <DialogContent>
          <TextField
            label="Old Password"
            type="password"
            fullWidth
            margin="normal"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            disabled={changingPassword}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={changingPassword}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            disabled={changingPassword}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenChangePassword(false);
              setOldPassword("");
              setNewPassword("");
              setNewPasswordConfirm("");
            }}
            disabled={changingPassword}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={changingPassword}
          >
            {changingPassword ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Change"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TopBar;