import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import axios from 'axios'; 
import { Toaster } from 'react-hot-toast'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';

import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import ProductDetails from './pages/ProductDetails';
import ChatBot from './components/ChatBot';

import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';
import ManageProducts from './pages/admin/ManageProducts';
import EditProduct from './pages/admin/EditProduct';
import AdminOrders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail'; 
import Checkout from './components/Checkout';
import ManageReviews from './pages/admin/ManageReviews';
import ManageContacts from './pages/admin/ManageContacts';

import './App.css';

const BASE_URL = `https://greenworld-com.onrender.com/api`;
axios.defaults.baseURL = BASE_URL;

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.startsWith('/')) {
    resource = `${BASE_URL}${resource}`;
  }
  return originalFetch(resource, config);
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          
          {/* Extremely Fast Toaster Configuration */}
          <Toaster 
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
              top: 20,
              right: 20,
            }}
            toastOptions={{
              duration: 1500, // Duration reduced further
              // Instant animation settings
              style: {
                animation: 'none', // Remove default heavy animation
                background: '#fffcf5',
                color: '#2c3e50',
                fontFamily: 'Quicksand, sans-serif',
                border: '2px solid #5d6d36',
                borderRadius: '12px',
                boxShadow: '6px 6px 0px rgba(93, 109, 54, 0.2)',
                fontSize: '14px',
                fontWeight: '600',
              },
            }}
          />

          <div className="App">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                
                <Route path="/checkout" element={<Checkout />} />

                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failure" element={<PaymentFailure />} />

                <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                <Route path="/orders" element={<Orders />} />

                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/add-product" element={<AddProduct />} />
                <Route path="/admin/manage-products" element={<ManageProducts />} />
                <Route path="/admin/edit-product/:id" element={<EditProduct />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/order/:id" element={<OrderDetail />} /> 
                <Route path="/admin/reviews" element={<ManageReviews />} />
                <Route path="/admin/contacts" element={<ManageContacts />} />
              </Routes>
            </main>
            <Footer />
            <ChatBot />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
