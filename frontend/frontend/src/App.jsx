import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import DashboardLayout from './components/dashboard/DashboardLayout';
import TicketDetail from './components/pages/tickets/TicketDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardLayout />} />
          <Route path='/tickets/:id' element={<TicketDetail/>}/>
        </Route>

        <Route element={<AdminLayout />}>
          {/* admin routes here later */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;