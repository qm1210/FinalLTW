import React, { useState, useEffect } from "react";
import { Typography, Box, TextField, Button, CircularProgress } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import "./styles.css"; // ✅ Import CSS Giáng sinh

// ✅ Link Backend chuẩn
const BASE = "https://q75ylp-8080.csb.app";

function UserPhotos({ loggedInUser }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lưu text comment theo từng photo
  const [newComments, setNewComments] = useState({});

  // ✅ Fetch Photos từ API thật
  useEffect(() => {
    const getPhotos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE}/api/photo/${userId}`, {
           credentials: "include"
        });
        if (!res.ok) throw new Error("Failed to fetch photos");
        const data = await res.json();
        setPhotos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getPhotos();
  }, [userId]);

  // ✅ Submit Comment
  const handleAddComment = async (photoId) => {
    const text = (newComments[photoId] || "").trim();
    if (!text) return;

    try {
      const res = await fetch(
        `${BASE}/api/photo/commentsOfPhoto/${photoId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ comment: text }),
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      const createdComment = await res.json(); 

      // Update UI ngay lập tức
      setPhotos((prevPhotos) =>
        prevPhotos.map((p) =>
          p._id === photoId
            ? {
                ...p,
                comments: [
                  ...(p.comments || []),
                  {
                    _id: createdComment._id || `${Date.now()}`,
                    comment: createdComment.comment,
                    date_time: createdComment.date_time,
                    user: {
                      _id: loggedInUser._id,
                      first_name: loggedInUser.first_name,
                      last_name: loggedInUser.last_name,
                    },
                  },
                ],
              }
            : p
        )
      );

      // Clear input
      setNewComments((prev) => ({ ...prev, [photoId]: "" }));
    } catch (e) {
      console.error(e);
      alert("Không thể gửi bình luận 😔");
    }
  };

  if (loading) return <Box p={3} textAlign="center"><CircularProgress style={{color: '#8e0e00'}} /></Box>;

  if (!photos.length)
    return (
      <Typography align="center" mt={4} style={{color: '#8e0e00', fontStyle: 'italic'}}>
        Chưa có tấm ảnh nào trong album Giáng sinh này ❄️
      </Typography>
    );

  return (
    <div className="photo-feed-container">
      {photos.map((photo) => (
        <div key={photo._id} className="christmas-photo-card">
          
          {/* --- NGÀY GIỜ --- */}
          <Typography className="photo-date">
            📅 {new Date(photo.date_time).toLocaleString()} ❄️
          </Typography>

          {/* --- HIỂN THỊ ẢNH --- */}
          <img 
            src={`${BASE}/images/${photo.file_name}`}
            alt={photo.file_name}
            className="photo-frame"
          />

          {/* --- PHẦN BÌNH LUẬN --- */}
          <div className="comments-section">
            
            {/* Danh sách comment */}
            <Box mb={2}>
              {photo.comments && photo.comments.length > 0 ? (
                photo.comments.map((c) => (
                  <div key={c._id} className="comment-bubble">
                    <Typography variant="body2">
                      {/* Tên người comment */}
                      {c.user ? (
                        <Link to={`/users/${c.user._id}`} className="comment-author">
                          🎄 {c.user.first_name} {c.user.last_name}:
                        </Link>
                      ) : (
                        <span style={{ color: "gray", fontWeight: "bold" }}>Unknown: </span>
                      )}
                      
                      {/* Nội dung comment */}
                      {c.comment}
                    </Typography>
                    
                    <span className="comment-time">
                      {new Date(c.date_time).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  Chưa có lời cmt nào... Hãy là người đầu tiên! 
                </Typography>
              )}
            </Box>

            {/* Ô nhập comment mới */}
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="cmt gì đi chứ... 🎁"
                value={newComments[photo._id] || ""}
                onChange={(e) =>
                  setNewComments((prev) => ({
                    ...prev,
                    [photo._id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddComment(photo._id);
                }}
                sx={{
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1f4037', // Viền xanh khi focus
                    }
                }}
              />

              <Button
                variant="contained"
                className="post-comment-btn"
                onClick={() => handleAddComment(photo._id)}
                disabled={!(newComments[photo._id] || "").trim()}
              >
                Gửi 🎅
              </Button>
            </Box>

          </div>
        </div>
      ))}
    </div>
  );
}

export default UserPhotos;