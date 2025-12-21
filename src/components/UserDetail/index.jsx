import React, { useEffect, useState } from "react";
import { Typography, Box, Button, Paper, CircularProgress } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import "./styles.css"; // ✅ Import file CSS vừa tạo

// ✅ Link Backend chuẩn
const BASE = "https://q75ylp-8080.csb.app";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gọi API
  useEffect(() => {
    const getUser = async () => {
      try {
        // ✅ THÊM DÒNG NÀY
        const res = await fetch(`${BASE}/api/user/${userId}`, {
           credentials: "include" 
        });

        if (!res.ok) throw new Error("Could not fetch user");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [userId]);

  if (loading) 
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress className="loading-spinner" />
      </Box>
    );

  if (!user) 
    return <div className="error-text">Không tìm thấy người dùng ☃️</div>;

  return (
    <div className="user-detail-container">
      {/* 🎄 TẤM THIỆP USER DETAIL 🎄 */}
      <Paper elevation={6} className="christmas-card">
        
        {/* Dải ruy băng trang trí */}
        <div className="christmas-ribbon" />

        {/* --- TIÊU ĐỀ TÊN --- */}
        <Typography variant="h4" className="user-name">
          🎅 {user.first_name} {user.last_name} 🎄
        </Typography>

        {/* --- THÔNG TIN CHI TIẾT --- */}
        <Box>
          {/* Nghề nghiệp */}
          <div className="info-row">
            <Typography variant="h6" className="info-label">
              🛠 Nghề nghiệp:
            </Typography>
            <Typography variant="body1" className="info-value">
              {user.occupation}
            </Typography>
          </div>

          {/* Địa điểm */}
          <div className="info-row">
            <Typography variant="h6" className="info-label">
              📍 Địa điểm:
            </Typography>
            <Typography variant="body1" className="info-value">
              {user.location}
            </Typography>
          </div>

          {/* Mô tả */}
          <div className="description-section">
            <Typography variant="h6" className="info-label" style={{ marginBottom: '8px' }}>
              📝 Giới thiệu:
            </Typography>
            <div className="description-box">
              "{user.description}"
            </div>
          </div>
        </Box>

        {/* --- NÚT XEM ẢNH --- */}
        <div className="view-photos-container">
          <Link to={`/photos/${user._id}`} style={{ textDecoration: "none" }}>
            <Button variant="contained" className="view-photos-btn">
               Xem bộ sưu tập ảnh 🎁
            </Button>
          </Link>
        </div>

      </Paper>
    </div>
  );
}

export default UserDetail;