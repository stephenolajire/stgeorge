import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { adminLoginRoute, adminRoutes } from './routes/adminRoute'
import { publicRoutes } from './routes/publicRoute'

const router = createBrowserRouter([publicRoutes, adminLoginRoute, adminRoutes])

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
