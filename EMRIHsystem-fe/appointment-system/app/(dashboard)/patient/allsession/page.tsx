'use client'
import { useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import Spinner from "@/public/common/spinner";
import { encrypt } from "@/components/utils/crypto";
import axios from "axios";

const SessionPage: React.FC = () => {
  const { hospital, patientData, searchKeySession, setSearchKeySession, setMenu } = useAuth();
  const hospitalId = hospital?.id
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [scheduleData, setSceduleData] = useState<{
    scheduleid: number,
    docid: number,
    title: string,
    scheduledate: string,
    scheduletime: string,
    nop: string,
    slotLeft: string,
    docname: string,
    specialties: string,
    price: string,
  }[]>([]);
  const [searchKey, setSearchKey] = useState('');
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isAlreadyBookedPopupOpen, setIsAlreadyBookedPopupOpen] = useState(false);
  const [isSuccessfullyBooked, setIsSuccessfullyBooked] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{
    scheduleid: number,
    title: string,
    docname: string,
    scheduledate: string,
    scheduletime: string,
    specialties: string,
    nop: string,
    price: string,
  } | null>(null);

  const searchSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (searchKey) getSessionByDoctorName(searchKey)
    else fetchData();
  }

  useEffect(() => {
    setMenu(2);

    refreshData();

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

  const refreshData = () => {
    if (searchKeySession) {
      setSearchKey(searchKeySession);
      getSessionByDoctorName(searchKeySession);
    }
    else if (searchKey !== '')
    {
      getSessionByDoctorName(searchKey);
    }
    else {
      fetchData();
    }
  };


  const handleBookNowClick = (session: typeof scheduleData[number]) => {
    checkBookingSession(session)
  };

  const closePopup = () => {
    setIsSuccessfullyBooked(false);
    refreshData();
  };

  const closePopupAlreadyBooked = () => {
    setIsAlreadyBookedPopupOpen(false);
  };

  const closePopupConfirmation = () => {
    setPopupOpen(false);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/sessions/${hospitalId}`);

      if (response.ok) {
        const data = await response.json();
        setSessionCount(data.length);
        setSceduleData(data);
      }
    } catch (error) {
      console.error('Error during get session list:', error);
    }
  };

  const getSessionByDoctorName = async (searchKey: string) => {
    try {
      const response = await fetch(`http://localhost:3000/sessions/search/${hospitalId}/${searchKey}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      setSessionCount(data.length);
      setSceduleData(data);
      setSearchKeySession('');
    } catch (error: any) {
      console.error('Check patient existence error:', error);
      throw new Error(`Failed to check patient existence: ${error.message}`);
    }
  };

  const checkBookingSession = async (session: typeof scheduleData[number]) => {
    try {   
      const response = await fetch('http://localhost:3000/appointments/check-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pnic: patientData?.nic,
          scheduleId: session.scheduleid
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if(data.message === 'Patient can booked this session')
        {
          setSelectedSession(session);
          setPopupOpen(true);
        }
        else {
          setSelectedSession(null);
          setPopupOpen(false);
          setIsAlreadyBookedPopupOpen(true);
        }
      } else {
        console.error('Error checking appointment:', await response.text());
      }

    } catch (error: any) {
      console.error('Error booking', error);
      throw new Error(`Failed to booking the session: ${error.message}`);
    }
  };

  const bookingSession = async (sessionId: number) => {
    try {   
      const encryptedData = encrypt(JSON.stringify({
          pid: patientData?.id,
          scheduleId: sessionId
      }));
      const response = await axios.post('http://localhost:3000/appointments/create-appointment', { data: encryptedData });

      setLoading(false);
      closePopupConfirmation();
      setIsSuccessfullyBooked(true);
    } catch (error: any) {
      setLoading(false);
      console.error('Error booking', error);
      throw new Error(`Failed to booking the session: ${error.message}`);
    }
  };

  const handleContinueBooking = (sessionId: number) => {
    setLoading(true);
    bookingSession(sessionId);
  };

  return (
      <div className="flex min-h-screen">
        <Menu/>
        <h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
          {currentDayAndDate}
        </h5>
        <div className="max-w-8xl mx-auto min-h-screen w-full ml-8">
          <h4 className="h4 mt-5 ml-16 ">All Session ({sessionCount})</h4>

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
        <div className="max-w-6xl mx-auto h-full w-full ml-96 mt-36 absolute pr-16 pb-8"
        style={{
          overflow: 'auto',
          maxHeight: '650px',
        }}
        >
        {scheduleData.length > 0 ? (
          <div className="mt-5 items-center">
            {scheduleData.map((session, index) => (
              <div className="w-full border mr-40 mt-5"
              key={index}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
              }}
            >
              <h4 className="h4 py-2 text-blue-500 text-left font-semibold mb-4">{session.title}</h4>
              <div className="grid grid-cols-2 max-w-8xl mt-5 mr-16">
              <h5 className="h5 text-left font-semibold">{session.docname}</h5>
              <h5 className="h5 text-left">Date : <span className="font-semibold">{session.scheduledate}</span></h5>
              <h5 className="h5 text-left">Specialization : <span className="font-semibold">{session.specialties}</span></h5>
              <h5 className="h5 text-left">Starts : <span className="font-semibold">{session.scheduletime} WIB</span></h5>
              <h5></h5>
              <h5 className="h5 text-left mb-4">Slots : <span className={`font-semibold
              ${ session.slotLeft === 'Fully Booked' || session.slotLeft.includes('Left') ? 'text-red-400' : ''}
              `}>{session.slotLeft}</span></h5>
              <h5 className="h5 text-left mb-4">Price : <span className="font-semibold">IDR {session?.price}</span></h5>
              </div>
              <input
                type="Submit"
                value="Book Now"
                disabled={session.slotLeft === 'Fully Booked'}
                onClick={() => handleBookNowClick(session)}
                className={`btn text-white text-center mb-4 sm:w-auto sm:mb-0
                ${ session.slotLeft === 'Fully Booked' ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'
                }`}
                style={{ padding: '10px 25px' }}
              />
            </div>
            ))}
          </div>
          ) : (
            <div className="border border-grey-500 p-10 text-center max-h-screen w-full mt-16" style={{ fontSize: '24px'}}>
              <p className="font-semibold">No Sessions Scheduled.</p>
            </div>
          )}
        </div>
          {isPopupOpen && selectedSession && (
          <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
            // onClick={closePopup}
          >
            {loading && (
              <div className="absolute"> 
              <Spinner/>
            </div>
            )};
            <div
              className="bg-white p-8 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-center mb-8">
              Confirmation Page
              </h2>
              <h2 className="text-1xl font-bold mb-4 text-center">
                Session Details :
              </h2>
              <div className="border shadow-md pt-4 pl-4 pb-4 pr-4">
                <h2 className="text-1xl font-semibold mb-2">
                  {selectedSession?.title}
                </h2>
                <p>Doctor: {selectedSession?.docname}</p>
                <p>Specialties: {selectedSession?.specialties}</p>
                <p>Date: {selectedSession?.scheduledate}</p>
                <p>Time: {selectedSession?.scheduletime}</p>
              </div>

              <h2 className="text-1xl font-bold mb-4 mt-8 text-center">
                Patient Details :
              </h2>

              <div className="border shadow-md pt-4 pl-4 pb-4 pr-4">
                <p>Name: {patientData?.name}</p>
                <p>DOB: {patientData?.dob}</p>
                <p>NIC: {patientData?.nic}</p>
                <p>Email: {patientData?.email}</p>
                <p>Telephone: {patientData?.telephone}</p>
                <p>Address: {patientData?.homeAddress}</p>
              </div>

              <div className="text-center">
              <h2 className="h5 text-1xl font-semibold mt-16">
              Are you sure you want to continue booking this session?
              </h2>
              <h5 className="h5 text-center font-semibold mb-4">Price : IDR {selectedSession?.price}</h5>
              <button
                className="btn bg-gray-300 text-blue mt-4"
                onClick={closePopupConfirmation}
                disabled={loading}
              >
                Cancel
              </button>

              {loading ? (
                <>
                <button className="btn bg-gray-500 text-white mt-4 ml-16" disabled={true} >Please wait...</button>
                </>
              ) : (
                <>
                <button className="btn bg-blue-500 text-white mt-4 ml-16" disabled={loading} onClick={() => handleContinueBooking(selectedSession.scheduleid)}>Continue Booking</button>
                </>
              )}
              </div>
            </div>
          </div>
        )};

        {isSuccessfullyBooked && (
          <div
              className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
              onClick={closePopup}
            >
              <div
                className="bg-white p-8 rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-4 text-center mb-8 text-green-700">
                Hello {patientData?.name}, your session is successfully booked.
                </h2>
                <h2 className="text-1xl font-bold mb-4 text-center">
                  Please check the details below:
                </h2>
                <div className="border shadow-md pt-4 pl-4 pb-4 pr-4">
                  <h2 className="text-1xl font-semibold mb-2">
                    {selectedSession?.title}
                  </h2>
                  <p>Doctor: {selectedSession?.docname}</p>
                  <p>Specialties: {selectedSession?.specialties}</p>
                  <p>Date: {selectedSession?.scheduledate}</p>
                  <p>Time: {selectedSession?.scheduletime}</p>
                  <p className="h5 font-semibold mb-4 my-4">Price : IDR {selectedSession?.price}</p>
                </div>

                <div className="text-center">
                <h2 className="h5 text-1xl font-semibold mt-16">
                  Please check on My Booking menu / upcoming booking.
                </h2>
                <h2 className="h5 text-1xl font-semibold mt-4 text-green-700">
                  Thank You.
                </h2>
                <button
                  className="btn bg-gray-300 text-blue mt-4"
                  onClick={closePopup}
                >
                  Close
                </button>
                </div>
              </div>
            </div>
          )};

          {isAlreadyBookedPopupOpen && (
          <div
              className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
              onClick={closePopupAlreadyBooked}
            >
              <div
                className="bg-white p-8 rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-center mb-8 text-red-700">
                Sorry.
                </h2>
                <h2 className="text-1xl font-bold text-center ">
                You can not continue to book this session,
                </h2>
                <h2 className="text-1xl font-bold text-center mb-8">
                because you already have the appointment for this session.
                </h2>
                <h2 className="text-1xl font-bold mb-4 text-center text-red-700">
                  Please check on My Booking menu / upcoming booking.
                </h2>
                <div className="text-center">
                <button
                  className="btn bg-gray-300 text-white-900 mt-4"
                  onClick={closePopupAlreadyBooked}
                >
                  Close
                </button>
                </div>
              </div>
            </div>
          )};

      </div>
  );
};

export default SessionPage
