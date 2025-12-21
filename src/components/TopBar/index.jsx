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

  const [rightText, setRightText] = React.useState("Phạm Nguyễn Quang Minh - B22DCAT193");

  // Modal add photo
  const [openAdd, setOpenAdd] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);


  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("photo", selectedFile);

    setUploading(true);
    try {
      const res = await fetch(
        `${BASE}/api/photo/photos/new`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

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
    localStorage.removeItem('loggedInUser');
    setLoggedInUser(null);
    navigate("/users");
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
              
              <Typography
                className="topbar-greeting"
                variant="subtitle1"
              >
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
          <div style={{marginTop: '20px', textAlign: 'center'}}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{
                  padding: '10px', 
                  border: '1px solid #1976d2', 
                  width: '100%',
                  borderRadius: '6px',
                  background: '#f5f5f5'
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
    </>
  );
}

export default TopBar;