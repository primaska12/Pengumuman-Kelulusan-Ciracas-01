import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Admin from './Admin';
import { Toaster } from 'lucide-react'; // Wait, lucide-react doesn't have Toaster. I'll just use standard alerts or simple state for notifications.

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
