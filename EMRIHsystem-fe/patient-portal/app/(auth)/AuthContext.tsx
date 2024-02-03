'use client';

import axios from 'axios';
import { getAuth, signOut } from 'firebase/auth';
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

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

interface DoctorData {
  docid: number;
  docemail: string;
  docname: string;
  docpassword: string;
  docnic: string;
  doctel: string;
  specialties: string;
  dwa: string;
}

interface Hospital {
  id: number;
  name: string;
}

interface PersonalData {
  id: number;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  phoneNumber: string;
  email: string;
  bloodType: string;
  bloodPressure: string;
  heartRate: string;
  glucoseLevel: string;
  hemoglobin: string;
  weight: string;
  height: string;
}

interface Document {
  appointmentid: number,
  filename: string,
  filesize: number,
  filetype: string,
  date: Date,
  fileUrl: string,
}

interface IllnessDiagnosis {
  code: string;
  date: Date;
  doctor: string;
  name: string;
  treatment: string;
  appointmentId: number;
}

interface SOAPNotes {
  timestamp: Date;
  doctor: string;
  hospital: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  appointmentId: number;
}

interface AppointmentHistory {
  session: string,
  appointmentId: number;
  timestamp: Date;
  doctor: string;
  hospital: string;
  status: string;
}

interface Prescription {
  appointmentId: number;
  isDoctorPrescription: boolean;
  timestamp: Date;
  medication: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

type AuthContextProps = {
  isLoggedIn: boolean;
  isDoctor: boolean;
  patientData: PatientData | null;
  doctorData: DoctorData | null;
  hospital: Hospital | null;
  selectedMenu: number | null;
  noMR: string | '';
  dob: string | '';
  searchKeySession: string | null;
  expirationTimestamp: number| null;
  accessToken: string | null;
  storedRefreshToken: string | null;
  documents: Document[] | [];
  appointmentHistory: AppointmentHistory[] | [];
  illnessDiagnosis: IllnessDiagnosis | null;
  soapNotes: SOAPNotes[] | [];
  doctorPrescriptions: Prescription[] | [];
  patientAdditions: Prescription[] | [];
  personalData: PersonalData | null;
  emr: string | null;  
  setEMRData: (emr: string) => void;
  setSearchKeySession: (searchKeySession: string) => void;
  setMenu: (selectedMenu: number) => void;
  setHospital: (hospital: Hospital) => void;
  setNewPersonalData: (personalData: PersonalData | null) => void;  
  setNewPatientAdditions: (prescriptions: Prescription[] | []) => void;  
  setAuthDoctorData: (doctorData: DoctorData) => void;
  login: () => void;
  logout: () => void;
  refreshToken: () => void;
  setAuthData: (
    isDoctor: boolean,
    accessToken: string,
    refreshToken: string,
    patientData: PatientData | null,
    noMR: string,
    dob: string,
    personalData: PersonalData,
    documents: Document[],
    appointmentHistory: AppointmentHistory[],
    illnessDiagnosis: IllnessDiagnosis,
    soapNotes: SOAPNotes[],
    doctorPrescriptions: Prescription[],
    patientAdditions: Prescription[],
    ) => void;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [noMR, setNoMR] = useState<string | ''>('');
  const [dob, setDOB] = useState<string | ''>('');
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isDoctor, setIsDoctor] = useState<boolean>(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [hospital, setSelectedHospital] = useState<Hospital | null>(null);

  const [documents, setDocuments] = useState<Document[] | []>([]);
  const [appointmentHistory, setAppointmentHistory] = useState<AppointmentHistory[] | []>([]);
  const [illnessDiagnosis, setIllnessDiagnosis] = useState<IllnessDiagnosis | null>(null);
  const [soapNotes, setSOAPNotes] = useState<SOAPNotes[] | []>([]);
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [doctorPrescriptions, setDoctorPrescription] = useState<Prescription[] | []>([]);
  const [patientAdditions, setPatientAdditions] = useState<Prescription[] | []>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [storedRefreshToken, setStoredRefreshToken] = useState<string | null>(null);
  const [expirationTimestamp, setExpirationTimestamp] = useState<number | null>(null);
  const [searchKeySession, setSearchSession] = useState<string | null>(null);
  const [emr, setEMR] = useState<string | null>(null);

  const setSearchKeySession = (searchKey: string) => {
    setSearchSession(searchKey);
  };

  const setEMRData = (emr: string) => {
    setEMR(emr);
  };

  const setMenu = (selectedMenu: number) => {
    setSelectedMenu(selectedMenu);
  };

  const setHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
  };

  const setNewPatientAdditions = (prescriptions: Prescription[] | []) => {
    setPatientAdditions(prescriptions);
  }

  const setNewPersonalData = (personalData: PersonalData | null) => {
    setPersonalData(personalData);
  }

  const setAuthData = (
    isDoctor: boolean,
    accessToken: string,
    refreshToken: string,
    patientDetails: PatientData|null,
    noMR: string,
    dob: string,
    personalData: PersonalData,
    documents: Document[],
    appointmentHistory: AppointmentHistory[],
    illnessDiagnosis: IllnessDiagnosis,
    soapNotes: SOAPNotes[],
    doctorPrescriptions: Prescription[],
    patientAdditions: Prescription[]
    ) => {
      setNoMR(noMR);
      setDOB(dob);
      setPersonalData(personalData);
      setDocuments(documents);
      setAppointmentHistory(appointmentHistory);
      setIllnessDiagnosis(illnessDiagnosis);
      setSOAPNotes(soapNotes);
      setDoctorPrescription(doctorPrescriptions);
      setPatientAdditions(patientAdditions);
      if (!isDoctor)
      {
        const expirationTimestamp = Date.now() + 5 * 60 * 1000;
        setExpirationTimestamp(expirationTimestamp);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);    
        setAccessToken(accessToken);
        setStoredRefreshToken(refreshToken);
        setPatientData(patientDetails);      
        login();
      }
  };

  const setAuthDoctorData = (doctorDetails: DoctorData) => {
    setIsDoctor(true);
    setDoctorData(doctorDetails);
    setMenu(1);
    login();
  };

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setMenu(0);
    setIsDoctor(false);
    setDoctorData(null);
    setPatientData(null);
    setSelectedHospital(null);
    setAccessToken(null);
    setStoredRefreshToken(null);
    setPatientData(null);
    setNoMR('');
    setDOB('');
    setPersonalData(null);
    setDocuments([]);
    setAppointmentHistory([]);
    setIllnessDiagnosis(null);
    setSOAPNotes([]);
    setDoctorPrescription([]);
    setPatientAdditions([]);
    setIsLoggedIn(false);
    window.location.href = '/signin';
  };

  const refreshToken = async () => {
    const response = await axios.post('http://localhost:3000/auth/refresh-token', { refreshToken: storedRefreshToken });
    const { accessToken } = response.data;
    const newExpirationTimestamp = Date.now() + 5 * 60 * 1000;
    setExpirationTimestamp(newExpirationTimestamp);
    setAccessToken(accessToken);
    setNoMR(noMR);
    setDOB(dob);
    setPersonalData(personalData);
    setDocuments(documents);
    setAppointmentHistory(appointmentHistory);
    setIllnessDiagnosis(illnessDiagnosis);
    setSOAPNotes(soapNotes);
    setDoctorPrescription(doctorPrescriptions);
    setPatientAdditions(patientAdditions);
  };


  useEffect(() => {
    // Check local storage for saved tokens on initial load
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setStoredRefreshToken(storedRefreshToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, patientData, doctorData, hospital, selectedMenu, personalData, dob, noMR, expirationTimestamp, documents, appointmentHistory, soapNotes, illnessDiagnosis, doctorPrescriptions, patientAdditions, accessToken, storedRefreshToken, isDoctor, searchKeySession, emr, setNewPatientAdditions, setEMRData, setSearchKeySession, setNewPersonalData, refreshToken, setHospital, setAuthData, setAuthDoctorData, setMenu, login, logout }}>
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
