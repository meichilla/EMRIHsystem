'use client'
import Menu from "@/components/ui/menu";
import Link from "next/link";
import HomepageBg from '@/public/images/homepage-bg.jpg';
import { useEffect, useState } from "react";

import DoctorImage from '@/public/images/doctor.png';
import PatientImage from '@/public/images/profile-image.png';
import CalendarImage from '@/public/images/calendar.png';
import SessionImage from '@/public/images/my-booking.png';
import { useAuth } from "@/app/(auth)/AuthContext";

interface PatientData {
  name: string;
  dob: string;
  email: string;
  homeAddress: string;
  password: string;
  telephone: string;
  walletAddress: string;
}

// const Homepage: React.FC<{ patientData: PatientData }> = ({ patientData }) => {
const Homepage: React.FC = () => {
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const { adminData, hospital } = useAuth();
  const [doctorCount, setDoctorCount] = useState<number>(0);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [newBookingCount, setNewBookingCount] = useState<number>(0);
  const [todaySessionCount, setTodaySessionCount] = useState<number>(0);

  useEffect(() => {
    const fetchDataDoctor = async () => {
      try {
        const response = await fetch(`http://localhost:3000/doctors/list/${hospital?.id}`);

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
        const response = await fetch(`http://localhost:3000/sessions/${hospital?.id}`);

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
        const response = await fetch(`http://localhost:3000/sessions/today/${hospital?.id}`);

        if (response.ok) {
          const data = await response.json();
          setTodaySessionCount(data.length);
        }
      } catch (error) {
        console.error('Error during get today sessions list:', error);
      }
    };

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
        <h5 className="text-lg absolute top-0 right-0 max-w-8xl mr-8 py-8 font-semibold">
          {currentDayAndDate}
        </h5>
        <div className="max-w-8xl mx-auto min-h-screen w-full ml-8">
          <h5 className="text-2xl py-8 font-semibold">Status</h5>
          <div className="grid grid-cols-4 max-w-6xl">
            <div className="grid grid-cols-2 items-center text-center border rounded-[16px] py-8">
              <div>
                <h5 className="h5 font-semibold text-blue-500" style={{ fontSize: '32px'}}>{doctorCount}</h5>
                <h5 className="h5 font-semibold">Doctors</h5>
              </div>
              <img src={DoctorImage.src} alt="Doctor" width={150} height={150} className="mt-4" />
            </div>
            <div className="grid grid-cols-2 items-center text-center border rounded-[16px] px-4 mx-4">
              <div>
                <h5 className="h5 font-semibold text-blue-500" style={{ fontSize: '32px'}}>{sessionCount}</h5>
                <h5 className="h5 font-semibold">All Sessions</h5>
              </div>
              <img src={SessionImage.src} alt="Doctor" width={72} height={72} className="mt-4 ml-4" />
            </div>
            <div className="grid grid-cols-2 items-center text-center border rounded-[16px] px-4 mx-4">
              <div>
                <h5 className="h5 font-semibold text-blue-500" style={{ fontSize: '32px'}}>{todaySessionCount}</h5>
                <h5 className="h5 font-semibold">Today Sessions</h5>
              </div>
              <img src={CalendarImage.src} alt="Doctor" width={72} height={72} className="mt-4" />
            </div>

            {/* <div>
              <h5 className="h5 font-semibold">Status</h5>
              <div className="grid grid-cols-2 grid-rows-2 max-w-8xl mr-16">
                <div className="col-span-1 row-span-1 mt-5 border p-5 mr-8">
                  <div className="grid grid-cols-2 items-center">
                    <div>
                      <h5 className="h5 font-semibold text-blue-500" style={{ fontSize: '32px'}}>1</h5>
                      <h5 className="h5 font-semibold">All Doctors</h5>
                    </div>
                    <img src={DoctorImage.src} alt="Doctor" width={150} height={150} className="mt-4" />
                    </div>
                </div>
                <div className="col-span-1 row-span-1 mt-5 border p-5 mr-8">
                  <div className="grid grid-cols-2 items-center">
                    <div>
                      <h5 className="h5 font-semibold text-blue-500" style={{ fontSize: '32px'}}>2</h5>
                      <h5 className="h5 font-semibold">All Patients</h5>
                    </div>
                    <img src={PatientImage.src} alt="Patient" width={80} height={80} className="ml-4" />
                  </div>
                </div>
                <div className="col-span-1 row-span-1 mt-5 border p-5 mr-8">
                  <div className="grid grid-cols-2 items-center">
                    <div>
                      <h5 className="h5 font-semibold text-blue-500" style={{ fontSize: '32px'}}>1</h5>
                      <h5 className="h5 font-semibold">New Booking</h5>
                    </div>
                    <img src={SessionImage.src} alt="Booking" width={80} height={80}  className="ml-4 mt-5" />
                  </div>
                </div>
                <div className="col-span-1 row-span-1 mt-5 border p-5 mr-8">
                  <div className="grid grid-cols-2 items-center">
                    <div>
                      <h5 className="h5 font-semibold text-blue-500" style={{ fontSize: '32px'}}>0</h5>
                      <h5 className="h5 font-semibold">Today Sessions</h5>
                    </div>
                    <img src={CalendarImage.src} alt="Session" width={80} height={80} className="ml-4" />
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
                      <th className="border-b-2 border-blue-500 p-3">Schedule Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="text-center border p-3">
                    {upcomingBookingData.map((booking, index) => (
                      <tr key={index}>
                        <td className="p-3">{booking.appointmentNumber}</td>
                        <td className="p-3">{booking.sessionTitle}</td>
                        <td className="p-3">{booking.doctor}</td>
                        <td className="p-3">{booking.scheduleDateTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                ) : (
                  <div className="border border-grey-500 p-10 text-center" style={{ fontSize: '24px'}}>
                    <p className="font-semibold">No upcoming bookings.</p>
                  </div>
                )} */}
              {/* </div> */}
            {/* </div> */}
          </div>
        </div>
      </div>
  );
};

export default Homepage
