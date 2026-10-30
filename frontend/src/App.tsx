import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { ADMIN_PATHS, adminLoginRoute, adminRoutes } from './routes/adminRoute'

const router = createBrowserRouter([
  // Temporary: send "/" to the admin until the public pages are built.
  { path: '/', element: <Navigate to={ADMIN_PATHS.dashboard} replace /> },
  adminLoginRoute,
  adminRoutes,
])

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </QueryClientProvider>
  )
}
