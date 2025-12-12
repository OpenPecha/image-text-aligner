import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout, MainLayout } from '@/components/layout'
import { ProtectedRoute } from './protected-route'
import { UserRole } from '@/types'

// Pages - lazy loaded for better performance
import { LoginPage } from '@/pages/auth/login-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { TranscriberTasksPage } from '@/pages/transcriber/transcriber-tasks-page'
import { ReviewerQueuePage } from '@/pages/reviewer/reviewer-queue-page'
import { FinalReviewerQueuePage } from '@/pages/final-reviewer/final-reviewer-queue-page'
import { AdminUsersPage } from '@/pages/admin/admin-users-page'
import { AdminTasksPage } from '@/pages/admin/admin-tasks-page'
import { EditorPage } from '@/pages/workspace/editor-page'
import { NotFoundPage } from '@/pages/not-found'

export const router = createBrowserRouter([
  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },

  // Protected routes
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Default redirect
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },

      // Dashboard - accessible by all roles
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },

      // Transcriber routes
      {
        path: '/tasks',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.Transcriber, UserRole.Admin]}>
            <TranscriberTasksPage />
          </ProtectedRoute>
        ),
      },

      // Reviewer routes
      {
        path: '/review',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.Reviewer, UserRole.Admin]}>
            <ReviewerQueuePage />
          </ProtectedRoute>
        ),
      },

      // Final Reviewer routes
      {
        path: '/final-review',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.FinalReviewer, UserRole.Admin]}>
            <FinalReviewerQueuePage />
          </ProtectedRoute>
        ),
      },

      // Admin routes
      {
        path: '/admin/users',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.Admin]}>
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/tasks',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.Admin]}>
            <AdminTasksPage />
          </ProtectedRoute>
        ),
      },

      // Editor workspace - accessible by all roles with tasks
      {
        path: '/editor/:taskId',
        element: <EditorPage />,
      },

      // Settings placeholder
      {
        path: '/settings',
        element: (
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-muted-foreground">Settings page coming soon...</p>
          </div>
        ),
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

