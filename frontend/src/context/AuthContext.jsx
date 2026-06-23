import { createContext, useEffect, useState } from "react";
import { makeRequest } from "../axios";

export const AuthContext = createContext();

const getStoredUser = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("user"));
    return stored?.id ? stored : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

// eslint-disable-next-line react/prop-types
export const AuthContextProvider = ({ children }) => {
  
    const [currentUser, setCurrentUser] = useState(getStoredUser);

  const login = async (inputs) => {
    const res = await makeRequest.post("/auth/login", inputs);
    setCurrentUser(res.data);
  };

  const logoutLocal = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem("user", JSON.stringify(currentUser));
      return;
    }
    localStorage.removeItem("user");
    //console.log('currentUser:', currentUser);
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logoutLocal }}>
      {children}
    </AuthContext.Provider>
  );
};
