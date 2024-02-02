'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/(auth)/AuthContext';
import PatientImage from '@/public/images/patient.png';
import HomeImage from '@/public/images/home.svg';
import DoctorImage from '@/public/images/doctor.svg';
import CalendarImage from '@/public/images/calendar.svg';
import SessionImage from '@/public/images/calendar.png';
import SettingImage from '@/public/images/setting.svg';

interface PatientData {
  name: string;
  dob: string;
  email: string;
  homeAddress: string;
  password: string;
  telephone: string;
  walletAddress: string;
}

// const Menu: React.FC<{ patientData: PatientData }> = ({ patientData }) => {
const Menu = () => {
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const { logout, patientData, adminData, selectedMenu, isLoggedIn, setMenu } = useAuth();

    const handleLogout = () => {
      logout();
    };

    useEffect(() => {
      const getCurrentDayAndDate = () => {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
        const currentDate = new Date();
        const dayOfWeek = daysOfWeek[currentDate.getDay()];
        const dayOfMonth = currentDate.getDate();
        const month = monthsOfYear[currentDate.getMonth()];
        const year = currentDate.getFullYear();
  
        const formattedDate = `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;
  
        setCurrentDayAndDate(formattedDate);
      };
  
      getCurrentDayAndDate();
    }, []);

    return (
      <div className="min-h-screen flex">
       <div className="max-w-8xl mx-auto px-4 sm:px-6 border-r w-72">
          {patientData != null ? (
            <>
              <div className="absolute mt-8 ml-16 mr-4">
              <img
                src={PatientImage.src}
                className="w-20 h-20 rounded-full"
              />
              </div>
              <div className="mt-32 text-center ">
              <h5 className="h5 font-semibold items-center">
                <span>{patientData?.name}</span>
              </h5>
              <span>{patientData?.email}</span>
              </div>
            </>
          ) : (
            <>
              <div className="absolute mt-8 ml-20">
              <img
                src={DoctorImage.src}
                className="w-20 h-20 rounded-full"
              />
              </div>
              <span className="mt-32 ml-12 items-center flex">{adminData?.email}</span>
            </>
          )}
          {patientData !== null && (
            <Link onClick={handleLogout} href="//localhost:3002/signin" className="border w-48 btn-sm ml-8 mt-8 text-gray-200 bg-blue-500 hover:bg-gray-800">
            <span>Patient Portal</span>
            </Link>
          )}
          <Link 
          // onClick={handleLogout} 
          href="/" className="border w-48 btn-sm ml-8 mt-8 text-gray-200 bg-gray-500 hover:bg-gray-800">
                  <span>Log out</span>
          </Link>
          <ul className="flex pt-10 pb-5">
            <div className="flex flex-col h-full bg-white border-t">
              <nav className="flex-1">
                <ul className="py-8">
                {patientData != null ? (
                  <>
                  <li className="mb-5">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 0 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}`}
                       href="/patient/home"
                       onClick={() => setMenu(0)}>
                        <img src={HomeImage.src} alt="Home" className='w-5 h-10 mr-4 ml-4'/>
                        Home
                    </Link>
                  </li>
                  <li className="mb-5">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 1 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}
                      `}
                       href="/patient/doctor"
                       onClick={() => setMenu(1)}>
                      <img src={DoctorImage.src} alt="Doctor" className='w-5 h-10 mr-4 ml-4'/>
                        All Doctors
                    </Link>
                  </li>
                  <li className="mb-5">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 2 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}`}
                       href="/patient/allsession"
                       onClick={() => setMenu(2)}>
                        <img src={CalendarImage.src} alt="Session" className='w-5 h-10 mr-4 ml-4'/>
                        Schedule Sessions
                    </Link>
                  </li>
                  <li className="mb-5">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 3 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}`}
                       href="/patient/mybooking"
                       onClick={() => setMenu(3)}>
                        <img src={SessionImage.src} alt="My Booking" className='w-5 h-6 mr-4 ml-4'/>
                        My Bookings
                    </Link>
                  </li>
                  <li className="mb-1">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 4 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}`}
                       href="#"
                       onClick={() => setMenu(4)}>
                        <img src={SettingImage.src} alt="Setting" className='w-5 h-10 mr-4 ml-4'/>
                        Setting
                    </Link>
                  </li>
                  </>
                ) :
                (
                  <>
                  <li className="mb-4 px-4">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 0 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}
                      `}
                       href="/admin/home"
                       onClick={() => setMenu(0)}>
                      <img src={HomeImage.src} alt="Home" className='w-5 h-10 mr-4 ml-4'/>
                        Dashboard
                    </Link>
                  </li>
                  <li className="mb-4 px-4">
                    <Link className={`flex items-center pt-1 pb-2 px-4 font-semibold
                      ${ selectedMenu === 1 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}
                      `}
                       href="/admin/doctor"
                       onClick={() => setMenu(1)}>
                      <img src={DoctorImage.src} alt="Doctor" className='w-5 h-10 mr-4 ml-4'/>
                      Doctors
                    </Link>
                  </li>
                  <li className="mb-4 px-4">
                    <Link className={`flex items-center pt-1 pb-2 px-4 font-semibold
                      ${ selectedMenu === 2 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}
                      `}
                       href="/admin/schedule"
                       onClick={() => setMenu(2)}>
                      <img src={CalendarImage.src} alt="Schedule" className='w-5 h-10 mr-4 ml-4'/>
                      Schedule
                    </Link>
                  </li>
                  <li className="mb-4 px-4">
                    <Link className={`flex items-center py-3 px-4 font-semibold
                      ${ selectedMenu === 3 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}
                      `}
                       href="/admin/appointment"
                       onClick={() => setMenu(3)}>
                      <img src={SessionImage.src} alt="Appointment" className='w-5 h-6 mr-4 ml-4'/>
                      Appointment
                    </Link>
                  </li>
                  <li className="mb-1 px-4">
                    <Link className={`flex items-center py-4 px-4 font-semibold
                      ${ selectedMenu === 4 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}
                      `}
                       href="/admin/patient"
                       onClick={() => setMenu(4)}>
                      <img src={PatientImage.src} alt="Patients" className='w-5 h-6 mr-4 ml-4'/>
                      Patients
                    </Link>
                  </li>
                  </>
                )}
                </ul>
              </nav>
            </div>
          </ul>
        </div>
      </div>
    );

}

export default Menu