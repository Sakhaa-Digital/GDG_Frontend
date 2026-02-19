
import { create } from "zustand";
import { persist } from "zustand/middleware";
  import { toast } from "react-hot-toast";

export const API_URL = "http://localhost:8000";
// export const API_URL="https://bishal7-com-np.onrender.com"
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
      unreadNotifications: 0,
      isCheckingAuth: false,

      continuewithGoogle: async (token) => {
        set({ isLoading: true, error: null, isCheckingAuth: true });

        try {
          const res = await fetch(`${API_URL}/auth/googleauth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          const data = await res.json();
          console.log("data", data);

          if (!res.ok || !data.user) {
            set({
              isLoading: false,
              error: data.message || "Login failed",
              isCheckingAuth: false,
            });
            toast.error(data.message || "Error occurred, please try again later");
            return null;
          }

          set({
            isLoading: false,
            user: data.user,
            isAuthenticated: true,
            error: null,
            isCheckingAuth: false,
          });
          toast.success(`Welcome ${data.user.name || "User"}`);

          return data;
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
            isCheckingAuth: false,
            user: null,
          });
          toast.error("Error occurred, please try again later");
          console.error(error);
          return null;
        }
      },
      logout: () => {
  set({ user: null, isAuthenticated: false });
  localStorage.removeItem("user-auth-storage");
  toast.success("Logged out successfully!");
          },
        

    }),
    {
      name: "user-auth-storage", // storage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // store only these
    }
  )
);