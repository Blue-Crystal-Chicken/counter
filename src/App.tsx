import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/pages/login";
import { Home } from "./components/pages/home";
import { Order } from "./components/pages/order";
import { MainLayout } from "./components/layout/MainLayout";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

export function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order/:code"
        element={
          <ProtectedRoute>
            <Order />
          </ProtectedRoute>
        }
      />
      
      {/* Fallback Redirections */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
