import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle
} from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  CircularProgress,
  Box,
  TextField
} from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";

// Backend URL
const BASE = "https://q75ylp-8080.csb.app";

const UserList = forwardRef(({ loggedInUser }, ref) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

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
    const allPhotos = [];

    // Fetch all photos from all users
    for (const user of users) {
      try {
        const photoRes = await fetch(`${BASE}/api/photo/${user._id}`, {
          credentials: "include"
        });
        if (photoRes.ok) {
          const photos = await photoRes.json();
          allPhotos.push(...photos);
        }
      } catch (err) {
        console.error(
          `Error fetching photos for user ${user._id}:`,
          err
        );
      }
    }

    // Calculate stats
    for (const user of users) {
      const userPhotos = allPhotos.filter(
        (p) => p.user_id === user._id
      );

      let commentCount = 0;
      for (const photo of allPhotos) {
        if (Array.isArray(photo.comments)) {
          commentCount += photo.comments.filter(
            (c) => c.user && c.user._id === user._id
          ).length;
        }
      }

      stats[user._id] = {
        photoCount: userPhotos.length,
        commentCount
      };
    }

    setUserStats(stats);
  };

  // Expose functions to parent
  useImperativeHandle(
    ref,
    () => ({
      refresh: () => getUsers(),
      refreshStats: () => fetchUserStats(users)
    }),
    [users, loggedInUser]
  );

  // Filter users by search term
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (!loggedInUser) return null;

  return (
    <Paper className="user-list-card" elevation={3}>
      <Typography variant="h5" className="list-header">
        Users ({filteredUsers.length})
      </Typography>

      {/* Search box */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List component="nav">
          {filteredUsers.map((user, index) => (
            <React.Fragment key={user._id}>
              <ListItem className="christmas-list-item">
                <Link
                  to={`/users/${user._id}`}
                  className="user-link"
                >
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                    primaryTypographyProps={{
                      className: "user-name-text"
                    }}
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

              {index < filteredUsers.length - 1 && (
                <Divider
                  className="christmas-divider"
                  variant="middle"
                />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
});

UserList.displayName = "UserList";
export default UserList;
