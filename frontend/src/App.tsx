import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AppLayout } from '@/layouts/AppLayout';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { WebsiteAssessment } from '@/pages/WebsiteAssessment';
import { NetworkAssessment } from '@/pages/NetworkAssessment';
import { Reports } from '@/pages/Reports';
import { NotFound } from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/app" element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="website-assessment" element={<WebsiteAssessment />} />
            <Route path="network-assessment" element={<NetworkAssessment />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App
