import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Typography, Box, Button, Paper, CircularProgress } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import "./styles.css";

// Backend URL
const BASE = "https://q75ylp-8080.csb.app";

const UserDetail = forwardRef((props, ref) => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  const getUser = async () => {
    setLoading(true);
    try {
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

  useEffect(() => {
    getUser();
  }, [userId]);

  // Expose refresh function to parent
  useImperativeHandle(ref, () => ({
    refresh: getUser,
  }));

  if (loading) 
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress className="loading-spinner" />
      </Box>
    );

  if (!user) 
    return <div className="error-text">User not found</div>;

  return (
    <div className="user-detail-container">
      <Paper elevation={6} className="christmas-card">
        <Typography variant="h4" className="user-name">
          {user.first_name} {user.last_name}
        </Typography>

        <Box>
          <div className="info-row">
            <Typography variant="h6" className="info-label">
              Occupation:
            </Typography>
            <Typography variant="body1" className="info-value">
              {user.occupation}
            </Typography>
          </div>

          <div className="info-row">
            <Typography variant="h6" className="info-label">
              Location:
            </Typography>
            <Typography variant="body1" className="info-value">
              {user.location}
            </Typography>
          </div>

          <div className="description-section">
            <Typography variant="h6" className="info-label" style={{ marginBottom: '8px' }}>
              Description:
            </Typography>
            <div className="description-box">
              "{user.description}"
            </div>
          </div>
        </Box>

        <div className="view-photos-container">
          <Link to={`/photos/${user._id}`} style={{ textDecoration: "none" }}>
            <Button variant="contained" className="view-photos-btn">
              View Photos
            </Button>
          </Link>
        </div>
      </Paper>
    </div>
  );
});

export default UserDetail;