'use client'

import Link from 'next/link'
import { useAuth } from '../AuthContext';
import { useState, useEffect, MouseEvent } from 'react';
import LogoImage from '@/public/images/logo.png';
import MySessionPage from '@/app/(dashboard)/doctor/session/page';
import { isPasswordValid } from '@/public/common/hashedpassword';
import { decrypt, encrypt } from '@/components/utils/crypto';
import axios from 'axios';
import { auth, db, storage } from '@/components/utils/firebase';
import { signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';

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

const SignInDoctor = () => {
  const [hospitalValue, setSelectedHospital] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const {setAuthDoctorData, hospital, doctorData, setHospital } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [hospitalList, setHospitalList] = useState<{
    id: number,
    hospital_name: string;
  }[]>([]);

  const handleSubmitHospital = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setShowWarning(false);
    const selectedHospital = hospitalList.find((hosp) => hosp.hospital_name === hospitalValue);

    if (selectedHospital) {
      setHospital({
        id: selectedHospital.id,
        name: selectedHospital.hospital_name,
      });
      setShowLogin(true);
    } else {
      setShowWarning(true);
      setShowLogin(false);
    }
  };

  const handleChangeHospital = async (e: MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    setShowWarning(false);
    setLoginError(false);
    setShowLogin(false);
    setSelectedHospital('');
    setHospital({id: 0, name: ''});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoginError(false);
    setLoading(true);
    
    try {
      const normalizedEmail = email.toLowerCase();
      const encryptedData = encrypt(JSON.stringify({
        email: normalizedEmail,
        hospitalid: hospital?.id
      }));

      const response = await axios.post(`http://localhost:3000/emr/doctor-login/${hospital?.id}`, { data: encryptedData });
      const data = await response.data;
      const resp = JSON.parse(decrypt(data))
      const docData = resp.doctorData;
      console.log('docData', docData);
      const isPassValid = await isPasswordValid(password, docData.docpassword);
      if (isPassValid)
        {
          const doctorData: DoctorData = {
            docid: docData.docid,
            docemail: docData.docemail,
            docname: docData.docname,
            docpassword: docData.docpassword,
            docnic: docData.docnic,
            doctel: docData.doctel,
            specialties: docData.specialties,
            dwa: docData.dwa,
          }
          console.log('data:', doctorData);
          setLoading(false);
          setLoginError(false);
          setAuthDoctorData(doctorData);
        }
        else
        {
          setLoading(false);
          setLoginError(true);
        }
    } catch (error) {
      console.error('Error during login:', error);
      setLoading(false);
      setLoginError(true);
    }
    
  };

  useEffect(() => {
    const fetchDataHospital = async () => {
      try {
        const response = await fetch('http://localhost:3000/hospitals', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setHospitalList(data);
        }
      } catch (error) {
        console.error('Error during get doctor list:', error);
      }
    };

    fetchDataHospital();
  }, []);

  return (
    <div>
      {doctorData ? (
        <MySessionPage/>
      ) : (
        <section > 
          {/* className="bg-gradient-to-b from-gray-100 to-white" */}
          <div className="max-w-8xl mx-auto px-4 sm:px-6">
          <Link href="/" className="flex items-center justify-center mt-16" aria-label="Cruip">
              <div className="flex items-center">
                <img
                  src={LogoImage.src}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <div className="ml-2">dApp|</div>
                <div className="left-0 mt-1 text-sm text-blue-500">Patient Portal</div>
              </div>
            </Link>
            <div className="pt-16 pb-12 md:pt-8 md:pb-20">
              {!showLogin ? (
                <div>
                  <div className="max-w-3xl mx-auto text-center mt-8 pb-12 md:pb-2">
                    <h4 className="h4">Welcome Doctor</h4>
                  </div>
                  <div className="max-w-4xl mx-auto text-center pb-12">
                    <h5 className="text-md font-medium mt-16">Prioritize your patient's health by selecting the desired hospital before reviewing and submitting their medical records.
                    Choose from the options below.</h5>
                  </div>
    
                  {/* Form */}
                  <div className="max-w-2xl mx-auto ">
                      <div className="flex flex-wrap -mx-3 mt-2">
                        <div className="w-full px-3">
                          <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="hospital">Hospital <span className="text-red-600">*</span></label>
                          <form onSubmit={handleSubmitHospital} className="flex mt-4">
                          <select id="hospital" 
                              placeholder="Select hospital"
                              className="w-full py-3 text-gray-800 rounded border-gray-300"
                              value={hospitalValue} 
                              onChange={(e) => setSelectedHospital(e.target.value)}
                              >
                                <option value="" disabled>Select hospital</option>
                                {hospitalList.map((hosp) => (
                                  <option key={hosp.id} value={hosp.hospital_name}>
                                    {hosp.hospital_name}
                                  </option>
                                ))}
                              </select>
                            <input
                              type="Submit"
                              defaultValue="Submit"
                              className="btn text-white bg-blue-600 hover:bg-blue-700 w-full ml-2 sm:w-auto sm:mb-0"
                              style={{ padding: '10px 25px' }}
                            />
                          </form>
                          {showWarning && <p className="text-red-600 mt-4 ">Hospital not found. Please check your input and try again.</p>}
                        </div>
                      </div>
                    </div>
                </div>
                  
                ) : (
                <div className="pt-16 pb-12 md:pt-8 md:pb-20">
                    {/* Form */}
                    <div className="max-w-3xl mx-auto text-center pb-12 md:pb-2">
                      <h4 className="h4">Welcome back to {hospital?.name}, please login.</h4>
                    </div>
                    <div className="text-gray-600 text-center mt-6">
                        Want to change hospital? <button onClick={() => handleChangeHospital} className="text-blue-600 hover:underline transition duration-150 ease-in-out">Change</button>
                    </div>

                    <div className="max-w-sm mx-auto mt-16">
                      <form onSubmit={handleSubmit}>
                        <div className="flex flex-wrap -mx-3 mb-4">
                            <div className="w-full px-3">
                              <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">Email <span className="text-red-600">*</span></label>
                              <input
                                id="email"
                                type="text"
                                className="form-input w-full text-gray-800"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap -mx-3 mb-4">
                            <div className="w-full px-3">
                              <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="password">Password <span className="text-red-600">*</span></label>
                              <input
                                id="password"
                                type="password"
                                className="form-input w-full text-gray-800"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap -mx-3 mt-6">
                            <div className="w-full px-3">
                              <button className="btn text-white bg-blue-600 hover:bg-blue-700 w-full" disabled={loading && !hospital}>
                                {loading ? 'Loading...' : 'Sign in'}
                              </button>
                              {loginError && <p className="mt-4 text-red-600 text-center">Invalid email or password</p>}
                            </div>
                        </div>
                        </form>
                      </div>
                </div>
                )};
              </div>
          </div>
        </section>
     )};
    </div>
  )
}

export default SignInDoctor