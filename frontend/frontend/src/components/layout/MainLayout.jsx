// layout/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Header';
import { useAuth } from '../../context/AuthContext';

const MainLayout = () => {
  const {user,loading} = useAuth()
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return(
  <>
    <Navbar />
    <Outlet />
  </>
  )
};

export default MainLayout;