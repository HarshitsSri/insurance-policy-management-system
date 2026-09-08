import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        toastClassName="!rounded-xl !font-sans !text-sm !shadow-panel"
      />
    </AuthProvider>
  );
}

export default App;
