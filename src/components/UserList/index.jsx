import React, { useEffect, useState } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  CircularProgress,
  Box
} from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";

// Backend URL
const BASE = "https://q75ylp-8080.csb.app";

const UserList = React.forwardRef(({ loggedInUser }, ref) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({});

  const getUsers = async () => {
    if (!loggedInUser) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/user/list`, {
         credentials: "include" 
      });

      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
      
      // Fetch stats for each user
      fetchUserStats(data);
    } catch (err) {
      console.error("Error fetching user list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, [loggedInUser]);

  const fetchUserStats = async (users) => {
    const stats = {};
    
    for (const user of users) {
      try {
        // Get photo count
        const photoRes = await fetch(`${BASE}/api/photo/${user._id}`, {
          credentials: "include"
        });
        const photos = photoRes.ok ? await photoRes.json() : [];
        
        // Count comments from all photos
        let commentCount = 0;
        for (const photo of photos) {
          if (photo.comments && Array.isArray(photo.comments)) {
            commentCount += photo.comments.filter(c => c.user && c.user._id === user._id).length;
          }
        }
        
        stats[user._id] = {
          photoCount: photos.length,
          commentCount: commentCount
        };
      } catch (err) {
        console.error(`Error fetching stats for user ${user._id}:`, err);
        stats[user._id] = { photoCount: 0, commentCount: 0 };
      }
    }
    
    setUserStats(stats);
  };

  // Expose refresh functions to parent via ref
  React.useImperativeHandle(ref, () => ({
    refreshStats: () => {
      fetchUserStats(users);
    },
    refresh: () => {
      getUsers();
    }
  }), [users, loggedInUser]);

  // Not logged in - don't show anything
  if (!loggedInUser) return null;

  return (
    <Paper className="user-list-card" elevation={3}>
      <Typography variant="h5" className="list-header">
        Users ({users.length})
      </Typography>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <CircularProgress style={{ color: '#1976d2' }} />
        </div>
      ) : (
        <List component="nav">
          {users.map((user, index) => (
            <React.Fragment key={user._id}>
              <ListItem className="christmas-list-item">
                <Link
                  to={`/users/${user._id}`}
                  className="user-link"
                >
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                    primaryTypographyProps={{ className: "user-name-text" }}
                  />
                </Link>
                
                {/* Count bubbles */}
                <Box className="count-bubbles">
                  <span className="count-bubble photo-count">
                    {userStats[user._id]?.photoCount || 0}
                  </span>
                  <Link 
                    to={`/comments/${user._id}`} 
                    className="count-bubble-link"
                  >
                    <span className="count-bubble comment-count">
                      {userStats[user._id]?.commentCount || 0}
                    </span>
                  </Link>
                </Box>
              </ListItem>
              
              {index < users.length - 1 && (
                <Divider className="christmas-divider" variant="middle" />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
});

UserList.displayName = 'UserList';
export default UserList;