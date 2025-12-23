import "./App.css";

import React, { useState } from "react";
import { Grid, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";
import Login from "./components/Login";

const App = (props) => {
  const [loggedInUser, setLoggedInUser] = useState(() => {
    // Restore user from localStorage on app load
    const saved = localStorage.getItem('loggedInUser');
    return saved ? JSON.parse(saved) : null;
  });
  const userPhotosRef = React.useRef(null);
  const userListRef = React.useRef(null);
  const userDetailRef = React.useRef(null);

  const handleUploadSuccess = () => {
    if (userPhotosRef.current) {
      userPhotosRef.current.refetch();
    }
    // Refresh bubble stats
    if (userListRef.current) {
      userListRef.current.refreshStats();
    }
  };

  const handleCommentChange = () => {
    // Refresh bubble stats when comment is added/edited/deleted
    if (userListRef.current) {
      userListRef.current.refreshStats();
    }
  };

  const handlePhotoChange = () => {
    // Refresh bubble stats when photo is deleted
    if (userListRef.current) {
      userListRef.current.refreshStats();
    }
  };

  const handleProfileUpdate = () => {
    // Refresh UserDetail if viewing the logged-in user's profile
    if (userDetailRef.current && loggedInUser) {
      userDetailRef.current.refresh();
    }
    // Refresh UserList to update user names
    if (userListRef.current) {
      userListRef.current.refresh();
    }
  };

  return (
    <Router>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar
              loggedInUser={loggedInUser}
              setLoggedInUser={setLoggedInUser}
              onUploadSuccess={handleUploadSuccess}
              onProfileUpdate={handleProfileUpdate}
            />
          </Grid>

          <div className="main-topbar-buffer" />

          {!loggedInUser ? (
            <Grid item xs={12}>
              <Login onLoginSuccess={setLoggedInUser} />
            </Grid>
          ) : (
            
            <>
              <Grid item sm={3}>
                <Paper className="main-grid-item">
                  <UserList ref={userListRef} loggedInUser={loggedInUser} />
                </Paper>
              </Grid>

              <Grid item sm={9} className="main-content">
                <Paper className="main-grid-item">
                  <Routes>
                    <Route
                      path="/users/:userId"
                      element={<UserDetail ref={userDetailRef} />}
                    />
                    <Route
                      path="/photos/:userId"
                      element={
                        <UserPhotos 
                          ref={userPhotosRef} 
                          loggedInUser={loggedInUser}
                          onCommentChange={handleCommentChange}
                          onPhotoChange={handlePhotoChange}
                        />
                      }
                    />
                    <Route
                      path="/comments/:userId"
                      element={<UserComments loggedInUser={loggedInUser} />}
                    />
                    <Route
                      path="*"
                      element={<Navigate to={`/users/${loggedInUser._id}`} />}
                    />
                  </Routes>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      </div>
    </Router>
  );
};

export default App;