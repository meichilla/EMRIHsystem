'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';

interface AdminData {
  username: string;
  email: string;
}

interface PatientData {
  id: number;
  name: string;
  dob: string;
  email: string;
  homeAddress: string;
  password: string;
  telephone: string;
  nic:string;
  walletAddress: string;
  userType: string;
}

interface Hospital {
  id: number;
  name: string;
}

type AuthContextProps = {
  nic: string | null;
  password: string | null;
  walletAddress: string | null;
  isLoggedIn: boolean;
  patientData: PatientData | null;
  adminData: AdminData | null;
  hospital: Hospital | null;
  searchKeySession: string | null;
  selectedMenu: number | null;
  setSearchKeySession: (searchKeySession: string) => void;
  setMenu: (selectedMenu: number) => void;
  setHospital: (hospital: Hospital) => void;
  setAuthData: (patientData: PatientData) => void;
  setAuthAdminData: (adminData: AdminData) => void;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nic, setNic] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [hospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [searchKeySession, setSearchSession] = useState<string | null>(null);

  const setMenu = (selectedMenu: number) => {
    setSelectedMenu(selectedMenu);
  };

  const setSearchKeySession = (searchKey: string) => {
    setSearchSession(searchKey);
  };

  const setHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
  };

  const setAuthData = (patientDetails: PatientData) => {
    setPatientData(patientDetails);
    setIsLoggedIn(true);
  };

  const setAuthAdminData = (adminDetails: AdminData) => {
    setAdminData(adminDetails);
    login();
  };

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    // setNic(null);
    // setPassword(null);
    // setWalletAddress(null);
    setMenu(0);
    setAdminData(null);
    setPatientData(null);
    setIsLoggedIn(false);
    setSelectedHospital(null);
    setSearchKeySession('');
  };

  return (
    <AuthContext.Provider value={{ nic, password, walletAddress, isLoggedIn, patientData, adminData, hospital, searchKeySession, selectedMenu, setSearchKeySession, setHospital, setAuthData, setAuthAdminData, setMenu, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
