'use client'
// export const metadata = {
//   title: 'Sign In - dAppointment',
//   description: 'Page description',
// }

import Link from 'next/link'
import { useAuth } from '../AuthContext';
import { useState, useEffect } from 'react';
import LogoImage from '@/public/images/logo.png';
import Homepage from '@/app/(dashboard)/admin/home/page';
import { hashPassword, isPasswordValid } from '@/public/common/hashedpassword';
import { encrypt, decrypt } from '@/components/utils/crypto';
import axios from 'axios';

interface AdminData {
  username: string;
  email: string;
}

const SignInAdmin = () => {
  const [hospitalValue, setSelectedHospital] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { setAuthAdminData, adminData, hospital, setHospital } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
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

  const handleChangeHospital = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSelectedHospital('');
    setHospital({id: 0, name: ''});
    setShowWarning(false);
    setShowLogin(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoginError(false);
    setLoading(true);

      try {
        const encryptedData = encrypt(JSON.stringify(username));
        const response = await axios.post('http://localhost:3000/auth/admin', { data: encryptedData });
        const data = await response.data;
        const resp = JSON.parse(decrypt(data))
        const isPassValid = await isPasswordValid(password, resp.password);
        if (isPassValid)
        {
          const adminData: AdminData = {
            username: resp.username,
            email: resp.email
          }
          setLoading(false);
          setLoginError(false);
          setAuthAdminData(adminData);
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
      {adminData ? (
        <Homepage/>
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
                <div className="ml-2">ezAppointment|</div>
                <div className="left-0 mt-1 text-sm text-blue-500">{hospital?.name}</div>
              </div>
            </Link>
            <div className="pt-16 pb-12 md:pt-8 md:pb-20">
              {!showLogin ? (
                <div>
                  <div className="max-w-3xl mx-auto text-center pb-12 md:pb-2">
                    <h4 className="h4">Hello admin, please login.</h4>
                  </div>
                  <div className="max-w-3xl mx-auto text-center pb-12 md:pb-2">
                    <h5 className="text-md font-medium my-8">Please selecting the hospital where you want to manage the data. Choose from the options below.</h5>
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
                          Want to change hospital? <button onClick={handleChangeHospital} className="text-blue-600 hover:underline transition duration-150 ease-in-out">Change</button>
                        </div>

                    <div className="max-w-sm mx-auto my-8">
                      <form onSubmit={handleSubmit}>
                        <div className="flex flex-wrap -mx-3 mb-4">
                            <div className="w-full px-3">
                              <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="username">Username <span className="text-red-600">*</span></label>
                              <input
                                id="username"
                                type="text"
                                className="form-input w-full text-gray-800"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                              {loginError && <p className="mt-4 text-red-600 text-center">Invalid username or password</p>}
                            </div>
                        </div>
                        </form>
                        <div className="text-gray-600 text-center mt-6">
                          Don't you have an account? <Link href="/signup" className="text-blue-600 hover:underline transition duration-150 ease-in-out">Sign up</Link>
                        </div>
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

export default SignInAdmin