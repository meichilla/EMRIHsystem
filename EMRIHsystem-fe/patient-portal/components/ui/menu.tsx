'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/(auth)/AuthContext';
import PatientImage from '@/public/images/patient.png';
import HomeImage from '@/public/images/home.svg';
import DoctorImage from '@/public/images/doctor.svg';
import SettingImage from '@/public/images/setting.svg';
import LogoImage from '@/public/images/logo.png';
import { IoIosNotificationsOutline } from "react-icons/io";
import { MdHistoryEdu } from "react-icons/md";
import { FaPrescriptionBottleMedical } from "react-icons/fa6";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { FaRegCalendarAlt } from 'react-icons/fa';

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
  const { logout, patientData, doctorData, selectedMenu, isLoggedIn, setMenu } = useAuth();

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
      <div className="min-h-screen">
      {isLoggedIn && (
        <div className="mx-auto px-4 sm:px-6 border-r w-72">
        <Link href="#" className="flex items-center justify-center border-b py-8 " aria-label="Cruip">
          <div className="flex items-center">
            <img
              src={LogoImage.src}
              alt="Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div className="mx-2">EMR-IH | </div>
            <div className="left-0 mt-1 text-sm text-blue-500">Patient Portal</div>
          </div>
        </Link>
          {doctorData != null && (
            <>
              <div className="absolute mt-8 ml-16 mr-4">
              <img
                src={DoctorImage.src}
                className="w-20 h-20 rounded-full"
              />
              </div>
              <span className="mt-32 ml-16 flex">{doctorData?.docname}</span>
              <span className="mt-2 ml-8 flex">{doctorData?.docemail}</span>
              <Link 
              onClick={handleLogout} 
              href="#" className="border flex w-auto btn-sm mt-4 text-gray-200 bg-gray-500 hover:bg-gray-800">
                <span>Log out</span>
              </Link>
            </>
          )}
          <ul className="flex pt-8 pb-4">
            <div className="flex flex-col h-full bg-white">
              <nav className="flex-1">
                <ul>
                {patientData != null ? (
                  <>
                  <li className="mb-5">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 0 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}`}
                       href="/patient/home"
                       onClick={() => setMenu(0)}>
                        <img src={HomeImage.src} alt="Home" className='w-6 h-8 mr-4'/>
                        Dashboard
                    </Link>
                  </li>
                  <li className="mb-5">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 1 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}
                      `}
                       href="/patient/prescription"
                       onClick={() => setMenu(1)}>
                      <FaPrescriptionBottleMedical className='w-6 h-6 mr-4'/>
                        Prescriptions
                    </Link>
                  </li>
                  <li className="mb-5">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 2 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}
                      `}
                       href="/patient/document"
                       onClick={() => setMenu(2)}>
                      <IoDocumentAttachOutline  className="w-6 h-8 mr-4"/>
                        Documents
                    </Link>
                  </li>
                  <li className="mb-5">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 3 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}
                      `}
                       href="/patient/appointmenthistory"
                       onClick={() => setMenu(3)}>
                        <MdHistoryEdu className="w-6 h-8 mr-4"/>
                        Appointment History
                    </Link>
                  </li>
                  <li className="mb-5">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 4 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}
                      `}
                       href="/patient/notification"
                       onClick={() => setMenu(4)}>
                        <IoIosNotificationsOutline className="w-6 h-8 mr-4"/>
                        Notifications
                    </Link>
                  </li>
                  <li className="mb-1">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 5 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}`}
                       href="/patient/account"
                       onClick={() => setMenu(5)}>
                        <img src={SettingImage.src} alt="Setting" className='w-6 h-8 mr-4'/>
                        Account
                    </Link>
                  </li>
                  </>
                ) :
                (
                  <>
                  <li className="mb-5">
                    <Link className={`flex items-center py-2 px-3 font-semibold
                      ${ selectedMenu === 0? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}`}
                       href="/doctor/patient"
                       onClick={() => setMenu(0)}>
                        <img src={PatientImage.src} alt="patients" className='w-8 h-8 mr-3'/>
                        My Patients
                    </Link>
                  </li>
                  <li className="mb-5">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 1 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}
                      `}
                       href="/doctor/session"
                       onClick={() => setMenu(1)}>
                        <FaRegCalendarAlt className="w-6 h-8 mr-4"/>
                        Sessions
                    </Link>
                  </li>
                  <li className="mb-1">
                    <Link className={`flex items-center py-2 px-4 font-semibold
                      ${ selectedMenu === 2 ? 'text-blue-900 underline' : 'hover:bg-gray-200 hover:text-blue-900'}`}
                       href="#"
                       onClick={() => setMenu(2)}>
                        <img src={SettingImage.src} alt="Setting" className='w-6 h-8 mr-4'/>
                        Account
                    </Link>
                  </li>
                  </>
                )}
                </ul>
              </nav>
            </div>
          </ul>
          {patientData !== null && (
            <>
            <div className="grid grid-cols-2 w-16 my-3 flex">
              <img
                src={PatientImage.src}
                className="w-6 h-6 rounded-full"
              />
              <h5 className="h5 font-semibold text-[#04176b]">
                <span>{patientData?.email}</span>
              </h5>
            </div>
            <Link 
            onClick={handleLogout} 
            href="#" className="border flex w-auto btn-sm mt-4 text-gray-200 bg-gray-500 hover:bg-gray-800">
                <span>Log out</span>
            </Link>
            </>
          )}
        </div>
      )}
      </div>
    );

}

export default Menu