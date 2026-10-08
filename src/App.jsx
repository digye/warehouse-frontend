import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Inventory from './pages/Inventory.jsx';
import Products from './pages/Products.jsx';
import Orders from './pages/Orders.jsx';
import Locations from './pages/Locations.jsx';
import MaterialRequest from './pages/MaterialRequest.jsx';
import MaterialRequests from './pages/MaterialRequests.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/request" element={<MaterialRequest />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/material-requests" element={<MaterialRequests />} />
      </Route>
    </Routes>
  );
}
