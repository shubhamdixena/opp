import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { CategoryPage } from '@/pages/CategoryPage'
import { OpportunityDetailPage } from '@/pages/OpportunityDetailPage'
import { SignupPage } from '@/pages/SignupPage'
import { LoginPage as UserLoginPage } from '@/pages/LoginPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { Navigation } from '@/components/Navigation'
import { LoginPage } from '@/pages/admin/LoginPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { ListingsPage } from '@/pages/admin/ListingsPage'
import { AddOpportunityPage } from '@/pages/admin/AddOpportunityPage'
import { BulkUploadPage } from '@/pages/admin/BulkUploadPage'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />

        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="listings" element={<ListingsPage />} />
              <Route path="add" element={<AddOpportunityPage />} />
              <Route path="bulk-upload" element={<BulkUploadPage />} />
              <Route path="edit/:id" element={<AddOpportunityPage />} />
            </Routes>
          </AdminLayout>
        } />

        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<UserLoginPage />} />

        <Route path="/*" element={
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navigation />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/opportunity/:slug" element={<OpportunityDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
      <Toaster />
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
