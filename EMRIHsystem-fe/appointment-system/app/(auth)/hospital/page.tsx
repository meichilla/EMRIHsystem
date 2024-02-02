'use client'
// export const metadata = {
//   title: 'Sign In - dAppointment',
//   description: 'Page description',
// }

import Link from 'next/link'
import { useAuth } from '../AuthContext';
import { useState, useEffect } from 'react';
import SignInPage from '@/app/(auth)/signin/page';
import LogoImage from '@/public/images/logo.png';
import { useRouter } from 'next/router';

const dummyHospitals = [
  { id: 1, name: 'Hospital ABC' },
  { id: 2, name: 'Hospital XYZ' },
  { id: 3, name: 'Hospital DEF' },
  // Add more hospitals as needed
];


const Hospital = () => {
  const { setHospital } = useAuth();
  const [hospital, setSelectedHospital] = useState('');
  const [login, setLogin] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setShowWarning(false);
    const selectedHospital = dummyHospitals.find((hosp) => hosp.name === hospital);

    if (selectedHospital) {
      // Hospital exists, proceed with the necessary actions
      setHospital(hospital);
      setLogin(true);
      router.push('/signin');
    } else {
      // Hospital doesn't exist, handle accordingly (show an error message, for example)
      setShowWarning(true);
    }
    
  };

  return (
    <div>
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
                <div className="left-0 mt-1 text-sm text-blue-500">Hospital</div>
              </div>
            </Link>
            <div className="pt-16 pb-12 md:pt-8 md:pb-20">
              {/* Page header */}
              <div className="max-w-3xl mx-auto text-center pb-12 md:pb-8">
                {/* <h2 className="h2">Welcome back, please select hospital.</h2> */}
                <h5 className="text-md font-medium mt-16">Begin your appointment booking by selecting the hospital where you wish to consult with the doctor. Choose from the options below.</h5>
              </div>

              {/* Form */}
              <div className="max-w-2xl mx-auto ">
                  <div className="flex flex-wrap -mx-3 mb-4 mt-2">
                    <div className="w-full px-3">
                      <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="hospital">Hospital <span className="text-red-600">*</span></label>
                      <form onSubmit={handleSubmit} className="flex mt-4">
                        <input
                          type="search"
                          name="search"
                          className="input-text"
                          placeholder="Search Hospital"
                          list="hospitals"
                          value={hospital}
                          onChange={(e) => setSelectedHospital(e.target.value)}
                          style={{ width: '80%' }}
                        />
                        <datalist id="hospitals">
                          {dummyHospitals.map((hospital) => (
                            <option key={hospital.id} value={hospital.name} />
                          ))}
                        </datalist>
                        <input
                          type="Submit"
                          defaultValue="Search"
                          className="btn text-white bg-blue-600 hover:bg-blue-700 w-full ml-2 mb-4 sm:w-auto sm:mb-0"
                          style={{ padding: '10px 25px' }}
                        />
                      </form>
                      {showWarning && <p className="text-red-600 mt-4 ">Hospital not found. Please check your input and try again.</p>}
                    </div>
                  </div>
                <div className="text-gray-600 text-center mt-16 mb-5">
                  Don't you have an account? <Link href="/signup" className="text-blue-600 hover:underline transition duration-150 ease-in-out">Sign up</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
    </div>
  )
}

export default Hospital