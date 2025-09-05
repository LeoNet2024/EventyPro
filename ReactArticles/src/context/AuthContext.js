import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

axios.defaults.baseURL = "http://localhost:8801";
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    axios
      .get("/check-auth")
      .then((res) => {
        if (res.data.user !== null)
          setUser(res.data); // If user exists, set the state
        else setUser(null); // If the user doesn't exist, set the state to null
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>; // או סקרין ריק/ספינר

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
