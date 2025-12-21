import "./App.css";

import React, { useState } from "react";
import { Grid, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import Login from "./components/Login";

const App = (props) => {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <Router>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar
              loggedInUser={loggedInUser}
              setLoggedInUser={setLoggedInUser}
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
                  <UserList loggedInUser={loggedInUser} />
                </Paper>
              </Grid>

              <Grid item sm={9} className="main-content">
                <Paper className="main-grid-item">
                  <Routes>
                    <Route
                      path="/users/:userId"
                      element={<UserDetail />}
                    />
                    <Route
                      path="/photos/:userId"
                      element={<UserPhotos loggedInUser={loggedInUser} />}
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
