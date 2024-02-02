'use client'
import { useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import Spinner from "@/public/common/spinner";
import Pagination from "@/components/utils/pagination";
import EmptyTable from "../schedule/empty_table";

const SchedulePage: React.FC = () => {
  const { hospital, patientData, searchKeySession, setSearchKeySession } = useAuth();
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
  const [doctor, setDoctor] = useState('');
  const [doctorId, setDoctorId] = useState(0);
  const [title, setTitle] = useState('');
  const [nop, setNop] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isRegisteredSuccessfuly, setSuccessRegister] = useState(false);
  const [isRegisterFailed, setRegisterFailed] = useState(false);
    
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

  const openModal = () => {
    setSuccessRegister(false)
    setPopupOpen(true);
  };

  const closeModal = () => {
    setDoctor('');
    setTitle('');
    setNop('');
    setPrice('');
    setDate('');
    setTime('');
    setSuccessRegister(false)
    setPopupOpen(false);
  };

  const searchSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (searchKey) getSessionByDoctorName(searchKey)
    else fetchData();
  }

  useEffect(() => {

    refreshData();
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
    setCurrentPage(1); 
    const totalSessions = scheduleData.length;
    const totalPages = Math.ceil(totalSessions / rowsPerPage);
    if (totalPages > 0) setTotalPages(totalPages)
  }, [totalPages, rowsPerPage]);

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

  const fetchDataDoctor = async () => {
    try {
      const response = await fetch(`http://localhost:3000/doctors/list/${hospitalId}`);

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setDoctorList(data.doctors);
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
  
  const handleSubmitDoctor = async (doctorValue: string) => {
    if (doctorValue !== '')
    {
      const selectedDoctor = doctorList.find((doc) => doc.docname === doctorValue);

      if (selectedDoctor) {
        setDoctor(doctorValue);
        setDoctorId(selectedDoctor.docid);
      }
    }
    else
    {
      setDoctor(doctorValue);
    }
  };
  
  const handleSubmit = async () => {
   
    setSearchKey('');
    setSearchKeySession('');
    setRegisterFailed(false);
    setSuccessRegister(false);
    setLoading(true);

    const hospitalId = hospital?.id;
    const response = await fetch('http://localhost:3000/sessions/add-schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        title: title,
        docid: doctorId,
        nop: nop,
        date: date,
        time: time,
        price: price,
        hospitalid: hospitalId,
      }),
    });

    if (response.ok) {
      setSuccessRegister(true);
      setDoctor('');
      setTitle('');
      setNop('');
      setPrice('');
      setDate('');
      setTime('');
      refreshData();
      setLoading(false);
      setSuccessRegister(false);
    } else {
      console.error('Error registering doctor:', await response.text());
      setLoading(false);
      setRegisterFailed(false);
    }

  }

  const isButtonDisabled = !title || !doctorId || !date || !time || !nop || !price;


  return (
      <div className="flex min-h-screen">
        <Menu/>
        <h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
          {currentDayAndDate}
        </h5>
        <div className="max-w-8xl mx-auto min-h-screen w-full">
          <h4 className="h4 mt-5 ml-8 ">All Sessions ({sessionCount})</h4>
            <div className="grid grid-cols-2 mt-5 mr-16 items-top">
              <div>

            <form onSubmit={searchSession} className="ml-8 flex">
                <input
                  type="search"
                  name="search"
                  className="input-text"
                  placeholder="Search Doctor and We will Find The Session Available"
                  list="doctors"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  style={{ width: '85%' }}
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
            <button
              onClick={openModal}
              className="btn text-white bg-blue-600 hover:bg-blue-700 ml-96 pl-16 w-40 h-11"
              style={{ padding: '10px 25px' }}
            >
              Add Schedule
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
                  <th className="rounded-tl-[4px] py-4 px-2">No.</th>
                  <th className="py-2 px-2">Title</th>
                  <th className="py-2">Doctor</th>
                  <th className="py-2">Specialties</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Time</th>
                  <th className="py-2">NOP</th>
                  <th className="py-2">Price</th>
                  <th className="rounded-tr-[4px] py-2">Actions</th>
              </tr>
            </thead>
            {scheduleData.length === 0 ? null : (
            <tbody className="text-center text-[16px]">
                {scheduleData
                .slice(startIdx, endIdx)
                .map((schedule, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9FF]'}`}>
                    <td className="py-6">{index + 1}</td>
                    <td>{schedule.title}</td>
                    <td>{schedule.docname}</td>
                    <td>{schedule.specialties}</td>
                    <td>{schedule.scheduledate}</td>
                    <td>{schedule.scheduletime}</td>
                    <td>{schedule.nop}</td>
                    <td>{schedule.price}</td>
                    <td>
                      <button
                        className="btn bg-blue-700 text-white w-16 py-2 mr-2"
                        onClick={openModal}
                      >
                        Edit
                      </button>
                      <button
                        className="btn bg-blue-700 text-white w-16 py-2"
                        // onClick={closeModal}
                      >
                        Remove
                      </button>
                    </td>
                </tr>
                ))}
            </tbody>
                )}
            </table>
            {scheduleData.length === 0 ? (
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
                  Add New Schedule
                  </h2>

                  <div className="flex flex-wrap mb-4">
                      <div className="px-4 py-4 w-1/3">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="title">Title <span className="text-red-600">*</span></label>
                        <input
                          id="title"
                          type="text"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter session title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="doctor">Doctor <span className="text-red-600">*</span></label>
                        <select id="doctor" 
                        placeholder="Select doctor"
                        className="w-full py-3 text-gray-800 rounded border-gray-300"
                        value={doctor} 
                        onChange={(e) => handleSubmitDoctor(e.target.value)}
                        >
                          <option value="">Select doctor</option>
                          {doctorList.map((doc) => (
                            <option key={doc.docid} value={doc.docname}>
                              {doc.docname}
                            </option>
                          ))}
                        </select>
                      </div>           
                      <div className="px-4 py-4 w-1/3">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="nop">Number of Patients <span className="text-red-600">*</span></label>
                        <input
                          id="nop"
                          type="number"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter max nop"
                          value={nop}
                          onChange={(e) => setNop(e.target.value)}
                          required
                        />
                      </div>
                      <div className="px-4 py-4 w-1/3">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="date">Date <span className="text-red-600">*</span></label>
                        <input
                          id="date"
                          type="date"
                          className="form-input w-full text-gray-800"
                          placeholder="Choose schedule date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="px-4 py-4 w-1/3">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="time">Time <span className="text-red-600">*</span></label>
                        <input
                          id="time"
                          type="time"
                          className="form-input w-full text-gray-800"
                          placeholder="Choose schedule date"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          required
                        />
                      </div>
                    <div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="price">Price <span className="text-red-600">*</span></label>
                        <input
                          id="price"
                          type="text"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter price"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                        />
                      </div>    
                    </div>  
                    <div className="text-center">
                    {isRegisteredSuccessfuly && <p className="text-blue-600">Add Schedule successfully!</p>}
                    {isRegisterFailed && <p className="text-red-600">Add Schedule failed, please try again.</p>}
                  
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
                    `} disabled={isButtonDisabled} onClick={() => handleSubmit()}>Save Data</button>
                  )}
                </div>
              </div>
            </div>
            )}
      </div>
  );
};

export default SchedulePage
