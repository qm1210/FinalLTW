import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import { Typography, Box, TextField, Button, CircularProgress } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import "./styles.css";

// Backend URL
const BASE = "https://q75ylp-8080.csb.app";

const UserPhotos = React.forwardRef(({ loggedInUser }, ref) => {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Store comments by photo ID
  const [newComments, setNewComments] = useState({});
  
  // Track deleting photos
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);

  // Fetch Photos
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

  useEffect(() => {
    getPhotos();
  }, [userId]);

  // Expose refetch function to parent
  useImperativeHandle(ref, () => ({
    refetch: getPhotos,
  }));

  // Submit comment
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

      // Update UI
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
      alert("Failed to post comment");
    }
  };

  // Delete photo
  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    setDeletingPhotoId(photoId);
    try {
      const res = await fetch(`${BASE}/api/photo/${photoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      // Remove photo from state
      setPhotos((prevPhotos) => prevPhotos.filter((p) => p._id !== photoId));
      alert("Photo deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete photo");
    } finally {
      setDeletingPhotoId(null);
    }
  };

  if (loading) return <Box p={3} textAlign="center"><CircularProgress style={{color: '#1976d2'}} /></Box>;

  if (!photos.length)
    return (
      <Typography align="center" mt={4} style={{color: '#666'}}>
        No photos yet
      </Typography>
    );

  return (
    <div className="photo-feed-container">
      {photos.map((photo) => (
        <div key={photo._id} className="christmas-photo-card">
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography className="photo-date">
              {new Date(photo.date_time).toLocaleString()}
            </Typography>
            
            {loggedInUser && loggedInUser._id === userId && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={() => handleDeletePhoto(photo._id)}
                disabled={deletingPhotoId === photo._id}
              >
                {deletingPhotoId === photo._id ? (
                  <CircularProgress size={16} />
                ) : (
                  "Delete"
                )}
              </Button>
            )}
          </Box>

          <img 
            src={`${BASE}/images/${photo.file_name}`}
            alt={photo.file_name}
            className="photo-frame"
          />

          <div className="comments-section">
            
            <Box mb={2}>
              {photo.comments && photo.comments.length > 0 ? (
                photo.comments.map((c) => (
                  <div key={c._id} className="comment-bubble">
                    <Typography variant="body2">
                      {c.user ? (
                        <Link to={`/users/${c.user._id}`} className="comment-author">
                          {c.user.first_name} {c.user.last_name}:
                        </Link>
                      ) : (
                        <span style={{ color: "gray", fontWeight: "bold" }}>Unknown: </span>
                      )}
                      
                      {c.comment}
                    </Typography>
                    
                    <span className="comment-time">
                      {new Date(c.date_time).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No comments yet. Be the first!
                </Typography>
              )}
            </Box>

            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add a comment..."
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
                        borderColor: '#1976d2',
                    }
                }}
              />

              <Button
                variant="contained"
                className="post-comment-btn"
                onClick={() => handleAddComment(photo._id)}
                disabled={!(newComments[photo._id] || "").trim()}
              >
                Post
              </Button>
            </Box>

          </div>
        </div>
      ))}
    </div>
  );
});

UserPhotos.displayName = 'UserPhotos';
export default UserPhotos;