import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard.jsx";
import ScanNow from "./pages/ScanNow.jsx";
import UploadPolicy from "./pages/UploadPolicy.jsx";
import Login from "./pages/Auth/Login.jsx";
// import Register from "./pages/Register.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound/NotFound.jsx";
import Config from "./pages/Config.jsx";
import DatasetManager from "./pages/UploadAndScan.jsx";
function App() {
  return (
    <div>

    <Routes>
      {/* Unprotected Routes */}
      <Route path="/login" element={<Login />} />
      {/* <Route path="/register" element={<Register />} /> */}

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scan-now" element={<ScanNow />} />
        <Route path="/policy-vault" element={<UploadPolicy />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/config" element={<Config />} />
          <Route path="/upload-scan" element={<DatasetManager />} />

          

          
      </Route>

      {/* Catch all */}
        <Route path="*" element={<NotFound/>} />
    </Routes>
      <Toaster />
    </div>

  );
}

export default App;
