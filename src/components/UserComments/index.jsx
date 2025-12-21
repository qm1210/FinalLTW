import React, { useState, useEffect } from "react";
import { Typography, Box, Paper, CircularProgress, Grid } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import "./styles.css";

const BASE = "https://q75ylp-8080.csb.app";

function UserComments({ loggedInUser }) {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user info
        const userRes = await fetch(`${BASE}/api/user/${userId}`, {
          credentials: "include"
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        // Fetch all photos for the user
        const photosRes = await fetch(`${BASE}/api/photo/${userId}`, {
          credentials: "include"
        });
        if (!photosRes.ok) throw new Error("Failed to fetch photos");
        const photos = await photosRes.json();

        // Aggregate all comments authored by this user from all photos in system
        const allComments = [];
        for (const photo of photos) {
          if (photo.comments && Array.isArray(photo.comments)) {
            for (const comment of photo.comments) {
              if (comment.user && comment.user._id === userId) {
                allComments.push({
                  ...comment,
                  photoId: photo._id,
                  photoFileName: photo.file_name,
                  photoDate: photo.date_time
                });
              }
            }
          }
        }

        setComments(allComments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress style={{ color: '#1976d2' }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Typography align="center" mt={4} color="error">
        User not found
      </Typography>
    );
  }

  return (
    <Box className="user-comments-container">
      <Paper elevation={2} className="comments-header">
        <Typography variant="h5" className="comments-title">
          Comments by {user.first_name} {user.last_name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
        </Typography>
      </Paper>

      {comments.length === 0 ? (
        <Paper elevation={2} className="no-comments">
          <Typography align="center" color="textSecondary">
            No comments yet
          </Typography>
        </Paper>
      ) : (
        <Box className="comments-list">
          {comments.map((comment) => (
            <Paper key={comment._id} elevation={1} className="comment-card">
              <Grid container spacing={2}>
                {/* Photo thumbnail */}
                <Grid item xs={3} sm={2}>
                  <Link 
                    to={`/photos/${userId}?photoId=${comment.photoId}`}
                    className="photo-thumbnail-link"
                  >
                    <img 
                      src={`${BASE}/images/${comment.photoFileName}`}
                      alt="photo"
                      className="photo-thumbnail"
                    />
                  </Link>
                </Grid>

                {/* Comment content */}
                <Grid item xs={9} sm={10}>
                  <Box className="comment-content">
                    <Typography variant="body2" color="textSecondary" className="photo-date">
                      {new Date(comment.photoDate).toLocaleString()}
                    </Typography>
                    
                    <Link 
                      to={`/photos/${userId}?photoId=${comment.photoId}`}
                      className="comment-text-link"
                    >
                      <Typography variant="body1" className="comment-text">
                        {comment.comment}
                      </Typography>
                    </Link>

                    <Typography variant="caption" color="textSecondary" className="comment-date">
                      {new Date(comment.date_time).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default UserComments;
