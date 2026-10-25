import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AppLayout } from './components/common/Layout'
import { Loader } from './components/common/Loader'
import { RequireAuth } from './components/common/RequireAuth'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'

// Route-level code splitting — every page is its own chunk.
const HomePage = lazy(() => import('./pages/HomePage'))
const MenuPage = lazy(() => import('./pages/MenuPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminLayout = lazy(() =>
  import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const MenuManagerPage = lazy(() => import('./pages/admin/MenuManagerPage'))
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'))

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Suspense fallback={<Loader label="Loading page…" />}>
                <Routes>
                  {/* Public storefront */}
                  <Route element={<AppLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="menu" element={<MenuPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  {/* Admin */}
                  <Route path="admin/login" element={<AdminLoginPage />} />
                  <Route element={<RequireAuth />}>
                    <Route path="admin" element={<AdminLayout />}>
                      <Route index element={<DashboardPage />} />
                      <Route path="menu" element={<MenuManagerPage />} />
                      <Route path="orders" element={<OrdersPage />} />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
