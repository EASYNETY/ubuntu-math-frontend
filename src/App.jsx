import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StoriesPage from './pages/StoriesPage';
import StoryPage from './pages/StoryPage';
import SimulatorPage from './pages/SimulatorPage';
import LMSPage from './pages/LMSPage';
import CoursePage from './pages/CoursePage';
import PricingPage from './pages/PricingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import EssaysPage from './pages/EssaysPage';
import ProcessesPage from './pages/ProcessesPage';
import ProcessDetailPage from './pages/ProcessDetailPage';
import CommunityPage from './pages/CommunityPage';
import MarketplacePage from './pages/MarketplacePage';
import PatentDossierPage from './pages/PatentDossierPage';
import CustomerLibraryPage from './pages/CustomerLibraryPage';
import CookbookPage from './pages/CookbookPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/stories" element={<StoriesPage />} />
      <Route path="/story/:slug" element={<StoryPage />} />
      <Route path="/simulator" element={<SimulatorPage />} />
      <Route path="/courses" element={<LMSPage />} />
      <Route path="/courses/:slug" element={<CoursePage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />

      {/* Knowledge & Commerce */}
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/patent-dossier" element={<PatentDossierPage />} />
      <Route path="/cookbook" element={<CookbookPage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/books/:slug" element={<BookDetailPage />} />
      <Route path="/essays" element={<EssaysPage />} />
      <Route path="/processes" element={<ProcessesPage />} />
      <Route path="/processes/:slug" element={<ProcessDetailPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/library" element={<ProtectedRoute><CustomerLibraryPage /></ProtectedRoute>} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute adminOnly><AdminPaymentsPage /></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
