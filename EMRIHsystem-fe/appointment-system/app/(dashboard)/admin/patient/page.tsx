'use client'
import { useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import Spinner from "@/public/common/spinner";
import EmptyTable from "./empty_table";
import Pagination from "@/components/utils/pagination";
import { encrypt } from "@/components/utils/crypto";
import axios from "axios";

const PatientPage: React.FC = () => {
  const { hospital, setSearchKeySession} = useAuth();
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [nic, setNic] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [pnic, setPnic] = useState('');
  const [gender, setGender] = useState('');

  const [isAlreadyBookedPopupOpen, setIsAlreadyBookedPopupOpen] = useState(false);
  const [isSuccessfullyBooked, setIsSuccessfullyBooked] = useState(false);
  const [doctor, setDoctor] = useState('');
  const [sessionId, setSessionId] = useState(0);
  const [session, setSession] = useState('');
  const [patientCount, setPatientCount] = useState<number>(0);
  const [patientList, setPatientList] = useState<{
    pid: number;
    pname: string,
    pnic: string,
    paddress: string,
    pdob: Date,
    ptel: string,
    url_ktp: string,
    no_rm: string,
    gender: string,
    hospitalid: number,
  }[]>([]);
  const [searchKey, setSearchKey] = useState('');

  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isBookingOpen, setBookingOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegisteredSuccessfuly, setSuccessRegister] = useState(false);
  const [isRegisterFailed, setRegisterFailed] = useState(false);
  const [patientNotExist, setPatientNotExist] = useState(false);
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
  const [doctorList, setDoctorList] = useState<{
    docid: number,
    docname: string;
    docemail: string,
    specialties: string,
    docnic: string,
    doctel: string,
    hospital: string,
  }[]>([]);
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;

  const handlePageChange = (direction: string) => {
    // Handle page change logic based on the direction (prev/next)
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    setCurrentPage(newPage);
    // Fetch data for the new page or update the displayed data accordingly
  };

  const handlePageClick = (pageNumber: number) => {
    // Handle page click logic
    setCurrentPage(pageNumber);
    // Fetch data for the clicked page or update the displayed data accordingly
  };

  const handleChangeRowPerPage = (rowsPerPage: string) => {
    // Handle change rows per page logic
    setRowsPerPage(parseInt(rowsPerPage, 10));
    // Fetch data or update the displayed data accordingly
  };
  
  const closePopupAlreadyBooked = () => {
    setIsAlreadyBookedPopupOpen(false);
  };

  const openModal = () => {
    setPopupOpen(true);
  };

  const closeModal = () => {
    setName('')
    setNic('')
    setDob('')
    setPhoneNumber('')
    setGender('')
    setAddress('')
    setPopupOpen(false);
  };

  const fetchDataPatients = async () => {
    try {
      const response = await fetch(`http://localhost:3000/patients/patient-list/${hospital?.id}`);

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setPatientCount(data.length);
        setPatientList(data);
      }
    } catch (error) {
      console.error('Error during get patient list:', error);
    }
  };

  const getSessionByDoctorName = async (searchKey: string) => {
    try {
      const response = await fetch(`http://localhost:3000/sessions/search/${hospital?.id}/${searchKey}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      setSceduleData(data);
      setSearchKeySession('');
    } catch (error: any) {
      console.error('Get session by doctor name error:', error);
    }
  };

  useEffect(() => {
    if(doctor) getSessionByDoctorName(doctor)

  }, [doctor]);

  useEffect(() => {

    const fetchDataDoctor = async () => {
      try {
        const response = await fetch(`http://localhost:3000/doctors/list/${hospital?.id}`);
  
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setDoctorList(data.doctors);
        }
      } catch (error) {
        console.error('Error during get session list:', error);
      }
    };
  
    fetchDataDoctor();
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
    fetchDataPatients();
    setCurrentPage(1); 
    const totalPatients = patientCount;
    const totalPages = Math.ceil(totalPatients / rowsPerPage);
    if (totalPages > 0) setTotalPages(totalPages)
  }, [rowsPerPage, totalPages]);


  const openModalBooking = (pnic: string) => {
    setPnic(pnic);
    setBookingOpen(true);
  };

  const closeModalBooking = () => {
    setPnic('');
    setDoctor('')
    setSession('')
    setSessionId(0)
    setBookingOpen(false);
  };

  const handleSubmit = async () => {
    
    setSearchKey('');
    setPatientNotExist(false);
    setSearchKeySession('');

    try {
      const normalizedNIC = nic.toLowerCase();
      const encryptedData = encrypt(
        JSON.stringify({
        name: name,
        homeAddress: address,
        dob: dob,
        telephone: phoneNumber,
        nic: normalizedNIC,
        gender: gender,
      }));
      const response = await axios.post(`http://localhost:3000/patients/register-walkin/${hospital?.id}`, { data: encryptedData });
      const data = await response.data;
      if (data === 'Patient registered successfully')
      {
        closeModal()
        fetchDataPatients()
      }
      else
      {  
        setLoading(false);
        setRegisterFailed(false);
      }
    } catch (error: any) {
      setLoading(false);
      setRegisterFailed(false);
      console.error('Error registering patient :', error);
    }

  }

  const bookingSession = async (sessionId: number) => {
    try {   
      const encryptedData = encrypt(JSON.stringify({
          pnic: pnic,
          scheduleId: sessionId
      }));
      const response = await axios.post('http://localhost:3000/appointments/walkin/create-appointment', { data: encryptedData });

      setIsSuccessfullyBooked(true)
      setPnic('');
      setDoctor('');
      setSession('');
      setSessionId(0);
      setLoading(false);
      setBookingOpen(false)
      setIsSuccessfullyBooked(false);
    } catch (error: any) {
      setLoading(false);
      console.error('Error booking', error);
      throw new Error(`Failed to booking the session: ${error.message}`);
    }
  };

  const checkBookingSession = async () => {
    try {   
      setLoading(true)
      console.log(sessionId)
      console.log(pnic)
      const response = await fetch('http://localhost:3000/appointments/check-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pnic: pnic,
          scheduleId: sessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if(data.message === 'Patient can booked this session')
        {
          bookingSession(sessionId);
        }
        else {
          setLoading(false)
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

  const checkPatientExistence = async () => {  
    try {
      const normalizedNIC = nic.toLowerCase();
      const encryptedData = encrypt(JSON.stringify(normalizedNIC));

      const response = await axios.post('http://localhost:3000/patients/isRegistered', { data: encryptedData });
      const exist = await response.data;
      if(exist)
      {
        const response = await fetch(`http://localhost:3000/patients/patient-details/${normalizedNIC}`);
        if (response.ok) {
          const data = await response.json();
          setName(data.name);
          setDob(data.dob);
          setAddress(data.homeAddress);
          setPhoneNumber(data.telephone);
        }
      }
      else{
        setPatientNotExist(exist);
      }
    } catch (error: any) {
      setLoading(false);
      setSuccessRegister(false);
      console.error('Check patient existence error:', error);
      throw new Error(`Failed to check patient existence: ${error.message}`);
    }
  };

  const handleSubmitDoctor = async (doctorValue: string) => {
    if (doctor !== '')
    {
      const selectedDoctor = doctorList.find((doc) => doc.docname === doctorValue);

      if (selectedDoctor) {
        setDoctor(doctorValue);    
        getSessionByDoctorName(doctorValue)
      }
    }
    else
    {
      setDoctor(doctorValue);
    }
  };

  const handleSubmitSession = async (session: string) => {
    if (doctor !== '')
    {
      const selectedSession = scheduleData.find((sche) => sche.title === session);

      if (selectedSession) {
        setSession(session);
        setSessionId(selectedSession.scheduleid)
      }
    }
    else
    {
      setSession(session);
      setSessionId(0)
    }
  };



  const isButtonDisabled = !name || !dob || !address || !gender || !nic || !phoneNumber;
  const isButtonCheckNICDisabled = !nic ;
  const isButtonBookDisabled = !doctor || !session

  return (
      <div className="flex min-h-screen">
        <Menu/>
        <h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
          {currentDayAndDate}
        </h5>
        <div className="max-w-8xl mx-auto min-h-screen w-full">
          <h4 className="h4 mt-5 ml-8 ">Walk In Patient ({patientCount})</h4>
          <div className="grid grid-cols-2 mt-5 mr-16 items-top">
            <div>
              <form className="ml-8">
                <input
                  type="search"
                  name="search"
                  className="input-text"
                  placeholder="Search Patient"
                  list="doctors"
                  onChange={(e) => setSearchKey(e.target.value)}
                  style={{ width: '60%' }}
                />
                <datalist id="doctors">{/* Fetch and render doctor options dynamically */}</datalist>
              </form>
            </div>

              <button
              onClick={openModal}
              className="btn text-white bg-blue-600 hover:bg-blue-700 ml-96 pl-16 w-40 h-11"
              style={{ padding: '10px 25px' }}
            >
              Add Patient
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto max-h-screen w-full ml-80 mt-40 absolute"
        style={{
          overflow: 'auto',
          maxHeight: '650px',
        }}
        >

          <table className="w-full py-4">
            <thead className="bg-[#ecebfa] text-center text-[20px]">
              <tr>
                  <th className="rounded-tl-[4px] py-2">No.</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Nic</th>
                  <th className="py-2">DOB</th>
                  <th className="py-2">Telephone</th>
                  <th className="py-2">Gender</th>
                  <th className="rounded-tr-[4px] py-2">Actions</th>
              </tr>
            </thead>
            {patientList.length === 0 ? null : (
            <tbody className="text-center text-[16px]">
                {patientList
                .slice(startIdx, endIdx)
                .map((patient, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9FF]'}`}>
                    <td className="py-6 px-8">{index + 1}</td>
                    <td className="py-2 px-8">{patient.pname}</td>
                    <td className="py-2 px-8">{patient.pnic}</td>
                    <td className="py-2 px-8">{`${patient.pdob}`.split('T')[0]}</td>
                    <td className="py-2 px-8">{patient.ptel}</td>
                    <td className="py-2 px-8">{patient.gender}</td>
                    <td className="py-2">
                  <button
                    className="btn bg-blue-700 text-white w-32 py-2 px-4"
                    onClick={() => openModalBooking(patient.pnic)}
                  >
                    Book Session
                  </button>
                    </td>
                </tr>
                ))}
            </tbody>
                )}
            </table>
            {patientList.length === 0 ? (
              <EmptyTable/>
            ) : (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              handlePageChange={handlePageChange}
              handlePageClick={handlePageClick}
              handleChangeRowPerPage={handleChangeRowPerPage}
            />
            )} 
        
        </div>

        {isBookingOpen && (
                <div
                className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
              >
                {loading && (
                  <div className="absolute"> 
                  <Spinner/>
                </div>
                )};
                <div
                  className="w-2/3 bg-white p-8 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl font-bold text-center mb-4 items-center">
                  Booking Session
                  </h2>

                  <div className="flex flex-wrap mb-4 ">
                      <div className="w-full px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="specialties">Doctor <span className="text-red-600">*</span></label>
                        <select id="doctors" 
                        className="w-full py-3 text-gray-800 rounded border-gray-300"
                        value={doctor} 
                        onChange={(e) => handleSubmitDoctor(e.target.value)}
                        >
                          <option value="" defaultChecked>Choose Doctor</option>
                          {doctorList.map((option) => (
                            <option key={option.docid} value={option.docname}>
                              {option.docname}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="session">Session <span className="text-red-600">*</span></label>
                        <select id="session" 
                        className="w-full py-3 text-gray-800 rounded border-gray-300"
                        value={session} 
                        onChange={(e) => handleSubmitSession(e.target.value)}
                        >
                          <option value="" defaultChecked>Choose Session</option>
                          {scheduleData.map((option) => (
                            <option key={option.scheduleid} value={option.title}>
                              {option.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
  
                    <div className="text-center">
                    {isRegisteredSuccessfuly && <p className="text-blue-600">Appointment booked successfully!</p>}
                    {isRegisterFailed && <p className="text-red-600">Appointment booked failed, please try again.</p>}
                  
                  <button
                    className="btn bg-gray-300 text-blue mt-4"
                    onClick={closeModalBooking}
                    disabled={loading}
                  >
                    {isRegisteredSuccessfuly ? `Close` : `Cancel`}
                  </button>
    
                  {loading ? (
                    <button className="btn bg-gray-500 text-white mt-4 ml-16" disabled={loading} >Please wait...</button>
                  ) : (
                    <button className={`btn mt-4 ml-16
                    ${isButtonBookDisabled ? 'bg-gray-300 text-blue' : 'bg-blue-500 text-white'}
                    ${isSuccessfullyBooked ? 'hidden' : ''}
                    `} disabled={isButtonBookDisabled} onClick={checkBookingSession}>Booking</button>
                  )}
                </div>
              </div>
            </div>
            )}   


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
                    because the patient already have the appointment for this session.
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

        {isPopupOpen && (
                <div
                className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
              >
                {loading && (
                  <div className="absolute"> 
                  <Spinner/>
                </div>
                )};
                <div
                  className="w-3/5 bg-white p-8 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl font-bold text-center mb-4 items-center">
                  Add New Patient
                  </h2>

                  <div className="grid grid-cols-2 items-center">
                  <div className="w-2/3 px-4 py-4 w-auto">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="nic">NIC <span className="text-red-600">*</span></label>
                        <input
                          id="nic"
                          type="text"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter patient nic"
                          value={nic}
                          onChange={(e) => setNic(e.target.value)}
                          required
                        />
                  </div>
                  <div className="mt-6">
                    <button
                      className={`btn bg-blue-500 text-white
                      ${isButtonCheckNICDisabled && 'bg-gray-200 text-black'}
                      `}
                      disabled={isButtonCheckNICDisabled}
                      onClick={checkPatientExistence}
                    >
                      Check NIC
                    </button>
                  </div>
                  </div>
                  
                  {patientNotExist && <p className="text-green-600 ml-4">Patient NIC not registered, you can continue register the patient.</p>}

                  <div className="flex flex-wrap mb-4">
                      <div className="px-4 py-4 w-1/3">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="name">Name <span className="text-red-600">*</span></label>
                        <input
                          id="name"
                          type="text"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter patient name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="address">Address <span className="text-red-600">*</span></label>
                        <input
                          id="address"
                          type="text"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter patient address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="dob">DOB <span className="text-red-600">*</span></label>
                        <input
                          id="dob"
                          type="date"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter patient dob"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          required
                        />
                      </div>     
                      <div className="w-1/3 px-4 py-4">
                      <div className="w-full px-3">
                        <label className="block text-gray-800 text-sm font-medium mb-1">Gender<span className="text-red-600">*</span></label>
                        <div className="flex items-center space-x-8 mt-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="form-radio"
                              value="Male"
                              checked={gender === 'Male'}
                              onChange={() => setGender('Male')}
                              disabled={loading}
                            />
                            <span className="ml-2">Male</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              className="form-radio"
                              value="Female"
                              checked={gender === 'Female'}
                              onChange={() => setGender('Female')}
                              disabled={loading}
                            />
                            <span className="ml-2">Female</span>
                          </label>
                        </div>
                      </div>
                      </div>                 
                      <div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="tel">Telephone <span className="text-red-600">*</span></label>
                        <input
                          id="tel"
                          type="phone"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter doctor telephone"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>
  
                    <div className="text-center">
                    {isRegisteredSuccessfuly && <p className="text-blue-600">Patient registered successfully!</p>}
                    {isRegisterFailed && <p className="text-red-600">Register Patient failed, please try again.</p>}
                  
                  <button
                    className="btn bg-gray-300 text-blue mt-4"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    {isRegisteredSuccessfuly ? `Close` : `Cancel`}
                  </button>
    
                  {loading ? (
                    <button className="btn bg-gray-500 text-white mt-4 ml-16" disabled={loading} >Please wait...</button>
                  ) : (
                    <button className={`btn mt-4 ml-16
                    ${isButtonDisabled ? 'bg-gray-300 text-blue' : 'bg-blue-500 text-white'}
                    ${isRegisteredSuccessfuly ? 'hidden' : ''}
                    `} disabled={isButtonDisabled} onClick={() => handleSubmit()}>Register Walk In</button>
                  )}
                </div>
              </div>
            </div>
            )}   
      </div>
  );
};

export default PatientPage
