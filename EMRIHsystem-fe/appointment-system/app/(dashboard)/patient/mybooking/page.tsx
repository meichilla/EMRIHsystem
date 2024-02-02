'use client'
import { useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import Spinner from "@/public/common/spinner";
import { ToastContainer, toast } from 'react-toastify';

interface PatientData {
  name: string;
  dob: string;
  email: string;
  homeAddress: string;
  password: string;
  telephone: string;
  walletAddress: string;
}

const MyBookingPage: React.FC = () => {
  const { hospital, patientData, searchKeySession, setSearchKeySession } = useAuth();
  const hospitalId = hospital?.id
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const [searchKey, setSearchKey] = useState('');
  const [upcomingBookingData, setUpcomingBookingData] = useState<{
    appointmentNumber: string;
    sessionTitle: string;
    doctor: string;
    scheduleDate: string;
    scheduleTime: string;
    statusDone: boolean;
  }[]>([]);

  const searchSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // if (searchKey) getSessionByDoctorName(searchKey)
    // else fetchData();
  }

  useEffect(() => {

    const fetchDataAppointment = async () => {
      try {
        const response = await fetch(`http://localhost:3000/appointments/${hospitalId}/${patientData?.id}`);

        if (response.ok) {
          const data = await response.json();
          setUpcomingBookingData(data);
        }
      } catch (error) {
        console.error('Error during get upcoming booking list:', error);
      }
    };

    fetchDataAppointment();

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
      <div className="flex min-h-screen">
        <Menu/>
        <h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
          {currentDayAndDate}
        </h5>
        <div className="max-w-8xl mx-auto min-h-screen w-full ml-8">
          <h4 className="h4 mt-5 ml-16 ">My Booking ({upcomingBookingData.length})</h4>

          <form onSubmit={searchSession} className="ml-16 flex mt-8">
              <input
                type="search"
                name="search"
                className="input-text"
                placeholder="Search Doctor and We will Find The Session Available"
                list="doctors"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                style={{ width: '65%' }}
              />
              <datalist id="doctors">{/* Fetch and render doctor options dynamically */}</datalist>
              <input
                type="Submit"
                value="Search"
                className="btn text-white bg-blue-600 hover:bg-blue-700 w-full ml-2 mb-4 sm:w-auto sm:mb-0"
                style={{ padding: '10px 25px' }}
              />
            </form>
        </div>
        <div className="max-w-7xl mx-auto max-h-screen w-full ml-96 mt-36 absolute pr-16"
        style={{
          overflow: 'auto',
          maxHeight: '650px',
        }}
        >
        {upcomingBookingData.length > 0 ? (
          <div className="mt-5 items-center">
            {upcomingBookingData.map((booking, index) => (
              <div className="w-full border mr-40 mt-5"
              key={index}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
              }}
            >
              <h4 className="h4 py-2 text-blue-500 text-left font-semibold mb-4">{booking.sessionTitle}</h4>
              <div className="grid grid-cols-2 max-w-8xl mt-5 mr-16">
                <h5 className="h5 text-left font-semibold">{booking.doctor}</h5>
                <h5 className="h5 text-left">Date : <span className="font-semibold">{booking.scheduleDate}</span></h5>
                <h5 className="h5 text-left">Time : <span className="font-semibold">{booking.scheduleTime} WIB</span></h5>
                <h5 className="h5 text-left">Appointment Number : <span className="font-semibold">{booking.appointmentNumber}</span></h5>
              </div>
              <input
                type="Submit"
                value="Lihat Hasil Pemeriksaan"
                disabled={!booking.statusDone}
                // onClick={() => handleBookNowClick(session)}
                className={`btn text-white text-center my-6 sm:w-auto sm:mb-0
                ${ !booking.statusDone ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'
                }`}
                style={{ padding: '10px 25px' }}
              />
            </div>
            ))}
          </div>
          ) : (
            <div className="border border-grey-500 p-10 text-center max-h-screen w-full mt-16" style={{ fontSize: '24px'}}>
              <p className="font-semibold">No  Data Booking.</p>
            </div>
          )}
        </div>
      </div>
  );
};

export default MyBookingPage
