import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminProducts from "../pages/admin/Products";
import AdminPlans from "../pages/admin/Plans";
import AdminPolicies from "../pages/admin/Policies";
import AdminClaims from "../pages/admin/Claims";
import AdminPayments from "../pages/admin/Payments";
import AdminUsers from "../pages/admin/Users";

import AgentDashboard from "../pages/agent/Dashboard";
import AgentPolicies from "../pages/agent/Policies";
import AgentClaims from "../pages/agent/Claims";
import AgentPayments from "../pages/agent/Payments";
import AgentCustomers from "../pages/agent/Customers";

import CustomerDashboard from "../pages/customer/Dashboard";
import CustomerPlans from "../pages/customer/Plans";
import CustomerPolicies from "../pages/customer/Policies";
import CustomerPayments from "../pages/customer/Payments";
import CustomerClaims from "../pages/customer/Claims";
import CustomerProfile from "../pages/customer/Profile";

import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleRoute from "../components/common/RoleRoute";

import DashboardLayout from "../components/layout/DashboardLayout";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Layout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRole="ADMIN">
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RoleRoute allowedRole="ADMIN">
              <AdminProducts />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <RoleRoute allowedRole="ADMIN">
              <AdminPlans />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/policies"
          element={
            <RoleRoute allowedRole="ADMIN">
              <AdminPolicies />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/claims"
          element={
            <RoleRoute allowedRole="ADMIN">
              <AdminClaims />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <RoleRoute allowedRole="ADMIN">
              <AdminPayments />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute allowedRole="ADMIN">
              <AdminUsers />
            </RoleRoute>
          }
        />

        {/* Agent Routes */}
        <Route
          path="/agent/dashboard"
          element={
            <RoleRoute allowedRole="AGENT">
              <AgentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/agent/policies"
          element={
            <RoleRoute allowedRole="AGENT">
              <AgentPolicies />
            </RoleRoute>
          }
        />
        <Route
          path="/agent/claims"
          element={
            <RoleRoute allowedRole="AGENT">
              <AgentClaims />
            </RoleRoute>
          }
        />
        <Route
          path="/agent/payments"
          element={
            <RoleRoute allowedRole="AGENT">
              <AgentPayments />
            </RoleRoute>
          }
        />
        <Route
          path="/agent/customers"
          element={
            <RoleRoute allowedRole="AGENT">
              <AgentCustomers />
            </RoleRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <RoleRoute allowedRole="CUSTOMER">
              <CustomerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/customer/plans"
          element={
            <RoleRoute allowedRole="CUSTOMER">
              <CustomerPlans />
            </RoleRoute>
          }
        />
        <Route
          path="/customer/policies"
          element={
            <RoleRoute allowedRole="CUSTOMER">
              <CustomerPolicies />
            </RoleRoute>
          }
        />
        <Route
          path="/customer/payments"
          element={
            <RoleRoute allowedRole="CUSTOMER">
              <CustomerPayments />
            </RoleRoute>
          }
        />
        <Route
          path="/customer/claims"
          element={
            <RoleRoute allowedRole="CUSTOMER">
              <CustomerClaims />
            </RoleRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <RoleRoute allowedRole="CUSTOMER">
              <CustomerProfile />
            </RoleRoute>
          }
        />

      </Route>

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="flex h-screen flex-col items-center justify-center gap-2 bg-ink-50 text-center">
            <p className="font-display text-4xl font-bold text-ink-900">404</p>
            <p className="text-sm text-ink-400">This page doesn't exist.</p>
          </div>
        }
      />

    </Routes>
  );
}
