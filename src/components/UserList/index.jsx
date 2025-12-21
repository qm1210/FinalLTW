import React, { useEffect, useState } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  CircularProgress
} from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css"; // ✅ Import CSS

// ✅ Link Backend chuẩn
const BASE = "https://q75ylp-8080.csb.app";

function UserList({ loggedInUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Nếu chưa login thì không fetch
    if (!loggedInUser) {
      setUsers([]);
      return;
    }

    const getUsers = async () => {
      setLoading(true);
      try {
        // ✅ THÊM DÒNG NÀY: { credentials: "include" }
        // Để trình duyệt gửi kèm cookie session lên server
        const res = await fetch(`${BASE}/api/user/list`, {
           credentials: "include" 
        });

        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching user list:", err);
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, [loggedInUser]);

  // Chưa login -> Không hiện gì
  if (!loggedInUser) return null;

  return (
    <Paper className="user-list-card" elevation={3}>
      {/* 🎄 TIÊU ĐỀ 🎄 */}
      <Typography variant="h5" className="list-header">
        📜 Danh Sách ({users.length})
      </Typography>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <CircularProgress style={{ color: '#1f4037' }} />
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
                  {/* Icon thay đổi ngẫu nhiên theo chẵn lẻ */}
                  <span className="list-icon">
                    {index % 2 === 0 ? "🦌" : "🔔"}
                  </span>
                  
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                    primaryTypographyProps={{ className: "user-name-text" }}
                  />
                </Link>
              </ListItem>
              
              {/* Chỉ hiện divider nếu không phải phần tử cuối */}
              {index < users.length - 1 && (
                <Divider className="christmas-divider" variant="middle" />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
}

export default UserList;