import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import {useAuthStore} from "../store/authstore.js"
// Example auth check
// const isAuthenticated = () => {
//     // Replace this with real auth logic
//     return localStorage.getItem("token") ? true : false;
// };
// const isAuthenticated=true
export default function ProtectedRoute() {
    const { user } = useAuthStore()
    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ flex: 1,  }}>
                <Outlet /> {/* nested protected page renders here */}
            </div>
        </div>
    );
}
