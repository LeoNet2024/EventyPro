// Engineers: Leon Gitelman and Neo Zino

import { BrowserRouter } from "react-router-dom";
import MyRoutes from "./components/MyRoutes";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <MyRoutes />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
