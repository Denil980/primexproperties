import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ADMIN_ROLES, SALES_ROLES, CONTENT_ROLES } from './contexts/AuthContext';
import { FavoritesProvider } from './components/FavoritesContext';
import { handleGoogleRedirect } from './lib/googleAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Developers from './pages/Developers';
import DeveloperDetail from './pages/DeveloperDetail';
import Localities from './pages/Localities';
import LocalityDetail from './pages/LocalityDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import AdminProperties from './admin/Properties';
import PropertyForm from './admin/PropertyForm';
import AdminProjects from './admin/Projects';
import AdminDevelopers from './admin/Developers';
import AdminLeads from './admin/Leads';
import AdminVisits from './admin/Visits';
import AdminRera from './admin/Rera';
import AdminTestimonials from './admin/Testimonials';
import AdminBlog from './admin/Blog';
import AdminSeo from './admin/Seo';
import AdminAnalytics from './admin/Analytics';
import AdminUsers from './admin/Users';
import AdminAuditLogs from './admin/AuditLogs';

import { ModalProvider } from './contexts/ModalContext';

handleGoogleRedirect();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!pathname.startsWith('/properties')) window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <BrowserRouter>
          <FavoritesProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<PublicShell><Home /></PublicShell>} />
            <Route path="/properties" element={<PublicShell><Properties /></PublicShell>} />
            <Route path="/properties/:slug" element={<PublicShell><PropertyDetail /></PublicShell>} />
            <Route path="/projects" element={<PublicShell><Projects /></PublicShell>} />
            <Route path="/projects/:slug" element={<PublicShell><ProjectDetail /></PublicShell>} />
            <Route path="/developers" element={<PublicShell><Developers /></PublicShell>} />
            <Route path="/developers/:slug" element={<PublicShell><DeveloperDetail /></PublicShell>} />
            <Route path="/localities" element={<PublicShell><Localities /></PublicShell>} />
            <Route path="/localities/:slug" element={<PublicShell><LocalityDetail /></PublicShell>} />
            <Route path="/blog" element={<PublicShell><Blog /></PublicShell>} />
            <Route path="/blog/:slug" element={<PublicShell><BlogDetail /></PublicShell>} />
            <Route path="/about" element={<PublicShell><About /></PublicShell>} />
            <Route path="/contact" element={<PublicShell><Contact /></PublicShell>} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><PublicShell><Dashboard /></PublicShell></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><PublicShell><Favorites /></PublicShell></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute staffOnly><AdminLayout /></ProtectedRoute>}>
              <Route index element={<ProtectedRoute staffOnly allow={SALES_ROLES}><AdminDashboard /></ProtectedRoute>} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="properties/new" element={<PropertyForm />} />
              <Route path="properties/:id" element={<PropertyForm />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="developers" element={<AdminDevelopers />} />
              <Route path="leads" element={<ProtectedRoute staffOnly allow={SALES_ROLES}><AdminLeads /></ProtectedRoute>} />
              <Route path="visits" element={<ProtectedRoute staffOnly allow={SALES_ROLES}><AdminVisits /></ProtectedRoute>} />
              <Route path="rera" element={<AdminRera />} />
              <Route path="testimonials" element={<ProtectedRoute staffOnly allow={CONTENT_ROLES}><AdminTestimonials /></ProtectedRoute>} />
              <Route path="blog" element={<ProtectedRoute staffOnly allow={CONTENT_ROLES}><AdminBlog /></ProtectedRoute>} />
              <Route path="seo" element={<ProtectedRoute staffOnly allow={CONTENT_ROLES}><AdminSeo /></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute staffOnly allow={[...ADMIN_ROLES, 'sales_manager']}><AdminAnalytics /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute staffOnly allow={ADMIN_ROLES}><AdminUsers /></ProtectedRoute>} />
              <Route path="audit-logs" element={<ProtectedRoute staffOnly allow={[...ADMIN_ROLES, 'sales_manager']}><AdminAuditLogs /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<PublicShell><div className="min-h-[60vh] flex flex-col items-center justify-center px-5 pt-24"><div className="font-serif text-5xl text-ink">404</div><p className="text-ink/55 mt-2">This address doesn't exist — let's find one that does.</p><a href="/" className="mt-6 bg-ink text-gold px-8 py-3 text-sm tracking-[0.18em] uppercase">Back Home</a></div></PublicShell>} />
          </Routes>
        </FavoritesProvider>
      </BrowserRouter>
    </ModalProvider>
  </AuthProvider>
  );
}
