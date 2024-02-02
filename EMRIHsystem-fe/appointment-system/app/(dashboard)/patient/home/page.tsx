'use client'
import Menu from "@/components/ui/menu";
import Link from "next/link";
import HomepageBg from '@/public/images/homepage-bg.jpg';
import { useEffect, useState } from "react";

import DoctorImage from '@/public/images/doctor.png';
import TodaySessionImage from '@/public/images/calendar.svg';
import CalendarImage from '@/public/images/calendar.png';
import SessionImage from '@/public/images/my-booking.png';
import { useAuth } from "@/app/(auth)/AuthContext";

// const Homepage: React.FC<{ patientData: PatientData }> = ({ patientData }) => {
const Homepage: React.FC = () => {
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const { patientData, hospital, searchKeySession, setSearchKeySession } = useAuth();
  const hospitalId = hospital?.id
  const [doctorCount, setDoctorCount] = useState<number>(0);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [newBookingCount, setNewBookingCount] = useState<number>(0);
  const [todaySessionCount, setTodaySessionCount] = useState<number>(0);
  const [upcomingBookingData, setUpcomingBookingData] = useState<{
    appointmentNumber: string;
    sessionTitle: string;
    doctor: string;
    scheduleDate: string;
    scheduleTime: string;
  }[]>([]);

  useEffect(() => {
    const fetchDataAppointment = async () => {
      try {
        const response = await fetch(`http://localhost:3000/appointments/upcoming/${hospitalId}/${patientData?.id}`);

        if (response.ok) {
          const data = await response.json();
          setUpcomingBookingData(data.appointmentList);
          if (data.newBooking > 0) {
            setNewBookingCount(data.newBooking);
          }
        }
      } catch (error) {
        console.error('Error during get upcoming booking list:', error);
      }
    };

    const fetchDataDoctor = async () => {
      try {
        const response = await fetch(`http://localhost:3000/doctors/list/${hospitalId}`);

        if (response.ok) {
          const data = await response.json();
          setDoctorCount(data.doctors.length);
        }
      } catch (error) {
        console.error('Error during get doctor list:', error);
      }
    };

    const fetchDataSession = async () => {
      try {
        const response = await fetch(`http://localhost:3000/sessions/${hospitalId}`);

        if (response.ok) {
          const data = await response.json();
          setSessionCount(data.length);
        }
      } catch (error) {
        console.error('Error during get sessions list:', error);
      }
    };

    const fetchTodaySession = async () => {
      try {
        const response = await fetch(`http://localhost:3000/sessions/today/${hospitalId}`);

        if (response.ok) {
          const data = await response.json();
          setTodaySessionCount(data.length);
        }
      } catch (error) {
        console.error('Error during get today sessions list:', error);
      }
    };

    fetchDataAppointment();
    fetchDataDoctor();
    fetchDataSession();
    fetchTodaySession();
  
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
        <Menu />
        <h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
          {currentDayAndDate}
        </h5>
        <div className="max-w-8xl mx-auto min-h-screen w-full ml-8">
          <h4 className="h4">Home</h4>
          <div
            className="max-w-8xl text-left pb-12 md:pb-20 mt-4"
            style={{
              backgroundImage: `url(${HomepageBg.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '10px',
              width: '97%',
              padding: '30px',
            }}
          >
            <h4 className="h4">Welcome to {hospital?.name},</h4>
            <h3 className="h3 mt-4">{patientData?.name}.</h3>
            <p className="mt-4">
              Haven't any idea about doctors?
              No problem, let's jump to{' '}
              <Link href="/doctors" className="text-blue-600 hover:underline">
                <b>"All Doctors"</b>
              </Link>{' '}
              section or{' '}
              <Link href="/schedule" className="text-blue-600 hover:underline">
                <b>"Sessions"</b>
              </Link>
              <br />
              Track your past and future appointments history.
              <br />
              Also find out the expected arrival time of your doctor or medical consultant.
            </p>
            <br />
            <h2 className="h4">Channel a Doctor Here</h2>
            <form className="flex mt-4">
              <input
                type="search"
                name="search"
                className="input-text"
                placeholder="Search Doctor and We will Find The Session Available"
                list="doctors"
                onChange={(e) => setSearchKeySession(e.target.value)}
                style={{ width: '45%' }}
              />
              <datalist id="doctors">{/* Fetch and render doctor options dynamically */}</datalist>
               <Link href="/patient/allsession" style={{ padding: '10px 25px' }} className="btn text-white bg-blue-600 hover:bg-blue-700 w-full ml-2 mb-4 sm:w-auto sm:mb-0">
                  <span>Search</span>
              </Link>
            </form>
          </div>
          <div className="grid grid-cols-2 max-w-8xl mt-5 mr-16">
            <div>
              <h5 className="h5 font-semibold">Status</h5>
              <div className="grid grid-cols-2 grid-rows-2 max-w-8xl mr-16">
                <div className="col-span-1 row-span-1 mt-5 border p-5 mr-8">
                  <div className="grid grid-cols-2 items-center">
                    <div>
                      <h5 className="h5 font-semibold text-blue-500" style={{ fontSize: '32px'}}>{doctorCount}</h5>
                      <h5 className="h5 font-semibold">All Doctors</h5>
                    </div>
                    <img src={DoctorImage.src} alt="Doctor" width={150} height={150} className="mt-4" />
                    </div>
                </div>
                <div className="col-span-1 row-span-1 mt-5 border p-5 mr-8">
                  <div className="grid grid-cols-2 items-center">
                    <div>
                      <h5 className="h5 font-semibold text-blue-500" style={{ fontSize: '32px'}}>{sessionCount}</h5>
                      <h5 className="h5 font-semibold">All Sessions</h5>
                    </div>
                    <img src={CalendarImage.src} alt="Patient" width={80} height={80} className="ml-4" />
                  </div>
                </div>
                <div className="col-span-1 row-span-1 mt-5 border px-5 py-2 mr-8">
                  <div className="grid grid-cols-2 items-center">
                    <div>
                      <h5 className="h5 font-semibold text-blue-500" style={{ fontSize: '32px'}}>{newBookingCount}</h5>
                      <h5 className="h5 font-semibold">New Booking</h5>
                    </div>
                    <img src={SessionImage.src} alt="Booking" width={80} height={80}  className="ml-4 mt-5" />
                  </div>
                </div>
                <div className="col-span-1 row-span-1 mt-5 border p-5 mr-8">
                  <div className="grid grid-cols-2 items-center">
                    <div>
                      <h5 className="h5 font-semibold text-blue-500" style={{ fontSize: '32px'}}>{todaySessionCount}</h5>
                      <h5 className="h5 font-semibold">Today Sessions</h5>
                    </div>
                    <img src={TodaySessionImage.src} alt="Session" width={80} height={80} className="ml-4" />
                  </div>
                </div>
              </div>
            </div>
            <div>
            <h5 className="h5 font-semibold">Your Upcoming Booking</h5>
            <div className="mt-5">
              {upcomingBookingData.length > 0 ? (
                <table className="mt-5 w-full border">
                  <thead>
                    <tr>
                      <th className="border-b-2 border-blue-500 p-3">Appointment Number</th>
                      <th className="border-b-2 border-blue-500 p-3">Session Title</th>
                      <th className="border-b-2 border-blue-500 p-3">Doctor</th>
                      <th className="border-b-2 border-blue-500 p-3">Schedule Date</th>
                      <th className="border-b-2 border-blue-500 p-3">Schedule Time</th>
                    </tr>
                  </thead>
                  <tbody className="text-center border p-3">
                    {upcomingBookingData.map((booking, index) => (
                      <tr key={index}>
                        <td className="p-3">{booking.appointmentNumber}</td>
                        <td className="p-3">{booking.sessionTitle}</td>
                        <td className="p-3">{booking.doctor}</td>
                        <td className="p-3">{booking.scheduleDate}</td>
                        <td className="p-3">{booking.scheduleTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                ) : (
                  <div className="border border-grey-500 p-10 text-center" style={{ fontSize: '24px'}}>
                    <p className="font-semibold">No upcoming bookings.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Homepage
