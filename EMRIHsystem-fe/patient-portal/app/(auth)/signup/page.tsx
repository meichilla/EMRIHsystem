'use client'
// export const metadata = {
//   title: 'Sign Up - dAppointment',
//   description: 'Page description',
// }

import Link from 'next/link'
import { useState } from 'react';
import { AuthProvider, useAuth } from '../AuthContext';
import LogoImage from '@/public/images/logo.png';

const SignUp = () => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState('');
  const [nic, setNic] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nonce, setNonce] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [patientExist, setPatientExist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegisteredSuccessfuly, setSuccessRegister] = useState(false);
  const [isRegisterFailed, setRegisterFailed] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
        // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    setRegisterFailed(false);
    setSuccessRegister(false);
    setLoading(true);
    const fullName = `${name} ${surname}`;

    console.log("NIC", nic);
    // Check if the patient already exists
    const patientExists = await checkPatientExistence(nic);
    console.log("Patient Exists : ", patientExists);
    if (patientExists) {
      console.log('Patient already exists!');
      setLoading(false);
      return;
    }

    const normalizedNIC = nic.toLowerCase();
    // Make a request to your NestJS API to register the patient
    const response = await fetch('http://localhost:3000/patients/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fullName,
        homeAddress: address,
        dob: dob,
        email: email,
        telephone: phoneNumber,
        password: password,
        nic: normalizedNIC,
        walletAddress: walletAddress,
        // nonce: nonce,
      }),
    });

    if (response.ok) {
      console.log('Patient registered successfully!');
      setSuccessRegister(true);
      setLoading(false);
      login();
    } else {
      console.error('Error registering patient:', await response.text());
      setLoading(false);
      setRegisterFailed(false);
    }
  };

    // Function to handle password and confirmPassword changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordMatch(true);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(true);
  };
  
  const checkPatientExistence = async (nic: string) => {
    try {
      const response = await fetch(`http://localhost:3000/patients/isRegistered/${nic}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      setPatientExist(data);
      return data;
    } catch (error: any) {
      setLoading(false);
      setSuccessRegister(false);
      console.error('Check patient existence error:', error);
      throw new Error(`Failed to check patient existence: ${error.message}`);
    }
  };

  return (
    <AuthProvider>
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
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
                <div className="left-0 mt-1 text-sm text-blue-500">Hospital</div>
              </div>
            </Link>
          <div className="pt-16 pb-12 md:pt-8 md:pb-20">

            {/* Page header */}
            <div className="max-w-3xl mx-auto text-center pb-12 md:pb-8">
              <h2 className="h2">Welcome, please register.</h2>
              <h6 className="h3">We exist to make your online booking easier.</h6>
            </div>

            {/* Form */}
            <div className="max-w-sm mx-auto">
              <form onSubmit={handleSubmit}>
              <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="name">Name <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="name" type="text" className="form-input w-full text-gray-800" placeholder="Enter your name" onChange={(e) => setName(e.target.value)}
                    value={name} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="surname">Surname <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="surname" type="text" className="form-input w-full text-gray-800" placeholder="Enter your surname" onChange={(e) => setSurname(e.target.value)}
                    value={surname} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="dob">Date of Birth <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="dob" type="date" className="form-input w-full text-gray-800" placeholder="Enter your dob" onChange={(e) => setDob(e.target.value)}
                    value={dob} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="nic">NIC <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="nic" type="text" className="form-input w-full text-gray-800" placeholder="Enter your nic" onChange={(e) => setNic(e.target.value)}
                    value={nic} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="phoneNumber">Phone Number <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="phoneNumber" type="text" className="form-input w-full text-gray-800" placeholder="Enter your phone number" onChange={(e) => setPhoneNumber(e.target.value)}
                    value={phoneNumber} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="address">Address <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="address" type="text" className="form-input w-full text-gray-800" placeholder="Enter your address" onChange={(e) => setAddress(e.target.value)}
                    value={address} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">Email <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="email" type="email" className="form-input w-full text-gray-800" placeholder="Enter your email address" onChange={(e) => setEmail(e.target.value)}
                    value={email} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="walletAddress">Wallet Address <span className="text-red-600">*</span></label>
                  <input disabled={loading} id="walletAddress" type="text" className="form-input w-full text-gray-800" placeholder="Enter your ether wallet address" onChange={(e) => setWalletAddress(e.target.value)} 
                  value={walletAddress} required />
                </div>
                </div>
                {/* <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="nonce">Nonce <span className="text-red-600">*</span></label>
                    <input id="nonce" type="number" className="form-input w-full text-gray-800" placeholder="Enter your nonce" onChange={(e) => setNonce(e.target.value)}
                    value={nonce} required />
                  </div>
                </div> */}
                <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="password">Password <span className="text-red-600">*</span></label>
                  <input disabled={loading} id="password" type="password" className="form-input w-full text-gray-800" placeholder="Enter your password" onChange={handlePasswordChange} required />
                </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="confirmPassword">Confirm Password <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="confirmPassword" type="password" className="form-input w-full text-gray-800" placeholder="Enter your confirm password" onChange={handleConfirmPasswordChange} required />
                    {!passwordMatch && <p className="text-red-600">Passwords do not match</p>}
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mt-6">
                <div className="w-full px-3">
                  <button className="btn text-white bg-blue-600 hover:bg-blue-700 w-full" disabled={loading}>
                    {loading ? 'Signing up...' : 'Sign up'}
                  </button>
                  {patientExist && <p className="text-red-600">Patient is already registered</p>}
                  {isRegisteredSuccessfuly && <p className="text-blue-600">Patient registered successfully! Please Login</p>}
                  {isRegisterFailed && <p className="text-red-600">Register patient failed, please try again.</p>}
                </div>
              </div>
                <div className="text-sm text-gray-500 text-center mt-3">
                  By creating an account, you agree to the <a className="underline" href="#0">terms & conditions</a>, and our <a className="underline" href="#0">privacy policy</a>.
                </div>
              </form>
              <div className="text-gray-600 text-center mt-6">
                Already have an account? <Link href="/hospital" className="text-blue-600 hover:underline transition duration-150 ease-in-out">Sign in</Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </AuthProvider>
  )
}

export default SignUp