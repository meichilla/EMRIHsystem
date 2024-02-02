'use client'
import { useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import Link from "next/link";

interface PatientData {
  name: string;
  dob: string;
  email: string;
  homeAddress: string;
  password: string;
  telephone: string;
  walletAddress: string;
}

const DoctorPage: React.FC = () => {
  const { hospital, setSearchKeySession} = useAuth();
  const hospitalId = hospital?.id
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const [doctorCount, setDoctorCount] = useState<number>(0);
  const [doctorList, setDoctorList] = useState<{
    docid: number,
    docname: string;
    docemail: string,
    specialties: string,
    docnic: string,
    doctel: string,
  }[]>([]);
  const [searchKey, setSearchKey] = useState('');

  const searchDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    getDoctorBySearchKey(searchKey)
  }

  const handleCheckAvailableSessions = async (docname: string) => {
    setSearchKeySession(docname);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/doctors/list/${hospitalId}`);

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setDoctorCount(data.doctors.length);
          setDoctorList(data.doctors);
        }
      } catch (error) {
        console.error('Error during get session list:', error);
      }
    };

    fetchData();

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

  const getDoctorBySearchKey = async (searchKey: string) => {
    try {
      const response = await fetch(`http://localhost:3000/doctors/search-doctor/${hospitalId}/${searchKey}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      setDoctorCount(data.doctors.length);
      setDoctorList(data.doctors);
    } catch (error: any) {
      console.error('Check patient existence error:', error);
      throw new Error(`Failed to check patient existence: ${error.message}`);
    }
  };

  return (
      <div className="flex min-h-screen">
        <Menu/>
        <h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
          {currentDayAndDate}
        </h5>
        <div className="max-w-8xl mx-auto min-h-screen w-full ml-8">
          <h4 className="h4 mt-5 ml-16 ">Doctor List ({doctorCount})</h4>

          <form onSubmit={searchDoctor} className="ml-16 flex mt-8">
              <input
                type="search"
                name="search"
                className="input-text"
                placeholder="Search Doctor or Specialization"
                list="doctors"
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
        <div className="max-w-6xl mx-auto h-full w-full ml-96 mt-36 absolute pr-16 pb-6"
        style={{
          overflow: 'auto',
          maxHeight: '650px',
        }}
        >
        {doctorList.length > 0 ? (
          <div className="mt-5 items-center">
            {doctorList.map((doctor, index) => (
              <div className="w-full border mr-40 mt-5"
              key={index}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
              }}
            >
              <h4 className="h4 py-2 text-blue-500 text-left font-semibold">{doctor.docname}</h4>
              <h5 className="h5 mb-5 text-left font-semibold">{doctor.specialties}</h5>
              <Link href="/patient/allsession" className="border btn-sm text-gray-100 bg-blue-500 hover:bg-blue-700"
              onClick={() => handleCheckAvailableSessions(doctor.docname)}>
                  <span>Check Available Sessions</span>
              </Link>
            </div>
            ))}
          </div>
          ) : (
            <div className="border border-grey-500 p-10 text-center max-h-screen w-full mt-16" style={{ fontSize: '24px'}}>
              <p className="font-semibold">Doctor not found.</p>
            </div>
          )}
        </div>
      </div>
  );
};

export default DoctorPage
