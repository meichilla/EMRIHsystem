'use client'

import Link from 'next/link'
import { useAuth } from '../AuthContext';
import { useState } from 'react';
import LogoImage from '@/public/images/logo.png';
import Homepage from '@/app/(dashboard)/patient/home/page';
import { isPasswordValid } from '@/public/common/hashedpassword';
import { decrypt, encrypt } from '@/components/utils/crypto';
import axios from 'axios';

interface IllnessDiagnosis {
  appointmentId: number;
  code: string;
  date: Date;
  doctor: string;
  name: string;
  treatment: string;
}

const SignIn = () => {
  const {setAuthData, patientData} = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const authLogin = async (hashPassword: string) => {
    try {
      const normalizedEmail = email.toLowerCase();
      const encryptedData = await encrypt(JSON.stringify({
        email: normalizedEmail,
        password: hashPassword
      }));
      const response = await axios.post('http://localhost:3000/emr/validate-login', { data: encryptedData });

      const resp = await JSON.parse(decrypt(response.data));
      console.log('access Token', resp.accessToken);
      console.log('refresh Token', resp.refreshToken);
      await fetchDataEMR(resp.patientDetail, resp.accessToken, resp.refreshToken);
    } catch (error) {
      console.error('Error during login:', error);
      setLoading(false);
      setLoginError(true);
    }
  };

  const fetchDataEMR = async (patientData: any, accessToken: string, refreshToken: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/emr/patient-emr/${patientData?.id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log(response.headers)
      console.log(response.request)

      const resp = await JSON.parse(decrypt(response.data));
      const data = resp.emr;
      console.log('data EMR', data);
      let illness_Diagnosis : IllnessDiagnosis | null = data.medicalRecord.medicalRecord.illnessDiagnosis;
      if(!illness_Diagnosis) 
      {
        illness_Diagnosis = data.medicalRecord.medicalRecord.ilnessDiagnosis[0];
        console.log(illness_Diagnosis);
      }
      const illnessDiagnosis = {
        appointmentId: illness_Diagnosis?.appointmentId ?? 0,
        code: illness_Diagnosis?.code ?? '',
        date: illness_Diagnosis?.date ?? new Date(),
        doctor: illness_Diagnosis?.doctor ?? '',
        name: illness_Diagnosis?.name ?? '',
        treatment: illness_Diagnosis?.treatment ?? '',
      }
      setAuthData(
        false,
        accessToken,
        refreshToken,
        patientData,
        data.noMR,
        data.dob,
        data.medicalRecord.personalData,
        data.medicalRecord.documents,
        data.medicalRecord.appointmentHistory,
        illnessDiagnosis,
        data.medicalRecord.medicalRecord.soapNotes,
        data.medicalRecord.prescription.doctorPrescriptions,
        data.medicalRecord.prescription.patientAdditions,
        );
        setLoading(false);
        setLoginError(false);
    } catch (error) {
      console.error('Error during get emr data:', error);
      setLoading(false);
      setLoginError(true);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoginError(false);
    setLoading(true);
    
    try {
      const normalizedEmail = email.toLowerCase();
      const encryptedData = encrypt(JSON.stringify(normalizedEmail));
      const response = await axios.post('http://localhost:3000/emr/login', { data: encryptedData });
      const data = await response.data;
      const hashedPassword = JSON.parse(decrypt(data))
      const isPassValid = await isPasswordValid(password, hashedPassword);
      if (isPassValid)
      {
        await authLogin(hashedPassword);
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

  return (
    <div>
      {patientData ? (
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
                <div className="ml-2">dApp|</div>
                <div className="left-0 mt-1 text-sm text-blue-500">Patient Portal</div>
              </div>
            </Link>
            <div className="pt-16 pb-12 md:pt-8 md:pb-20">
                <div className="pt-16 pb-12 md:pt-8 md:pb-20">
                    {/* Form */}
                    <div className="max-w-3xl mx-auto text-center pb-12 md:pb-2">
                      <h4 className="h4">Welcome back to Patient Portal</h4>
                      <p className="mt-24">Please login to see your medical record.</p>
                    </div>

                    <div className="max-w-sm mx-auto mt-8">
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
                              <button className="btn text-white bg-blue-600 hover:bg-blue-700 w-full" disabled={loading}>
                                {loading ? 'Loading...' : 'Sign in'}
                              </button>
                              {loginError && <p className="mt-4 text-red-600 text-center">Invalid nic or password</p>}
                            </div>
                        </div>
                        </form>
                        <div className="text-gray-600 text-center mt-6">
                          Don't you have an account? <Link href="/signup" className="text-blue-600 hover:underline transition duration-150 ease-in-out">Sign up</Link>
                        </div>
                      </div>
                </div>
              </div>
          </div>
        </section>
     )};
    </div>
  )
}

export default SignIn