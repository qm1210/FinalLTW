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

// ✅ Link Backend của bạn
const BASE = "https://q75ylp-8080.csb.app";

function TopBar({ loggedInUser, setLoggedInUser, onUploadSuccess }) {
  const location = useLocation();
  const { userId } = useParams();
  const navigate = useNavigate();

  // Thêm icon bông tuyết vào tên
  const [rightText, setRightText] = React.useState("Phạm Nguyễn Quang Minh - B22DCAT193");

  // ✅ modal add photo
  const [openAdd, setOpenAdd] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);


  // ✅ upload trong modal
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

      // báo để UserPhotos tự hiện ảnh mới
      onUploadSuccess && onUploadSuccess();

      // đóng modal + reset
      setOpenAdd(false);
      setSelectedFile(null);
      alert("🎄 Upload ảnh thành công! Giáng sinh an lành! 🎄");
    } catch (err) {
      console.error(err);
      alert("Lỗi upload rồi :(");
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
    setLoggedInUser(null);
    navigate("/users");
  };

  return (
    <>
      <AppBar position="static" className="topbar-appBar">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" color="inherit" sx={{fontFamily: 'cursive'}}>
            {rightText}
          </Typography>

          {loggedInUser ? (
            <div className="topbar-right">

              {/* ✅ Nút Add Photo */}
              <Button
                className="topbar-add-btn"
                variant="contained"
                onClick={() => setOpenAdd(true)}
                startIcon={<span>📸</span>}
              >
                Thêm Ảnh
              </Button>
              
              <Typography
                className="topbar-greeting"
                variant="subtitle1"
              >
                Hi, {loggedInUser.first_name} 🎅
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
            <Typography variant="subtitle1" color="inherit">
              Please Login 🎄
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      {/* ✅ MODAL Giáng sinh */}
      <Dialog open={openAdd} onClose={() => !uploading && setOpenAdd(false)}>
        <DialogTitle>🎄 New Christmas Photo 🎄</DialogTitle>

        <DialogContent>
          <div style={{marginTop: '20px', textAlign: 'center'}}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{
                  padding: '10px', 
                  border: '1px dashed #1f4037', 
                  width: '100%',
                  borderRadius: '8px',
                  background: '#f0fff4'
              }}
            />
          </div>
          {!selectedFile && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
              Hãy chọn một bức ảnh kỷ niệm tuyệt đẹp nhé!
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
            style={{color: '#8e0e00'}}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            style={{backgroundColor: '#1f4037', color: 'white'}}
          >
            {uploading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Upload ✨"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TopBar;