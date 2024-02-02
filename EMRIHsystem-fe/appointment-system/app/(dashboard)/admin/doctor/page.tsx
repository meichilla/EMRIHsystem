'use client'
import { useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import Link from "next/link";
import Spinner from "@/public/common/spinner";
import { spec } from "node:test/reporters";
import { hashPassword } from "@/public/common/hashedpassword";
import EmptyTable from "./empty_table";
import Pagination from "@/components/utils/pagination";

const DoctorPage: React.FC = () => {
  const { hospital, adminData, setSearchKeySession} = useAuth();
  const hospitalId = hospital?.id
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [pk, setPK] = useState('');
  const [specialization, setSpecialization] = useState('');

  const [doctorCount, setDoctorCount] = useState<number>(0);
  const [doctorList, setDoctorList] = useState<{
    docid: number,
    docname: string;
    docemail: string,
    specialties: string,
    docnic: string,
    doctel: string,
    hospital: string,
  }[]>([]);
  const [specialties, setSpecialties] = useState<{
    id: number,
    sname: string;
  }[]>([]);
  const [searchKey, setSearchKey] = useState('');

  const searchDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    getDoctorBySearchKey(searchKey)
  }

  const [isPopupOpen, setPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegisteredSuccessfuly, setSuccessRegister] = useState(false);
  const [isRegisterFailed, setRegisterFailed] = useState(false);
  const [doctorExist, setDoctorExist] = useState(false);
  
  const [passwordMatch, setPasswordMatch] = useState(true);
  
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
    setSuccessRegister(false);
    setPopupOpen(true);
  };

  const closeModal = () => {
    setName('');
    setPhoneNumber('');
    setWalletAddress('');
    setPK('');
    setNic('');
    setEmail('')
    setSpecialization('');
    setPassword('');
    setConfirmPassword('');
    setPopupOpen(false);
  };

  const fetchDataDoctor = async () => {
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

  useEffect(() => {

    const fetchDataSpecialization = async () => {
      try {
        const response = await fetch(`http://localhost:3000/specialties`);

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setSpecialties(data)
        }
      } catch (error) {
        console.error('Error during get session list:', error);
      }
    };

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
    fetchDataDoctor();
    fetchDataSpecialization();
    setCurrentPage(1); 
    const totalPatients = doctorCount;
    const totalPages = Math.ceil(totalPatients / rowsPerPage);
    if (totalPages > 0) setTotalPages(totalPages)
  }, [rowsPerPage, totalPages]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordMatch(true);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(true);
  };
  
  const handleSubmitSpecialization = async (specializationValue: string) => {
    if (specialization !== '')
    {
      const selectedSpecialization = specialties.find((spec) => spec.sname === specializationValue);

      if (selectedSpecialization) {
        setSpecialization(specializationValue);
      }
    }
    else
    {
      setSpecialization(specializationValue);
    }
  };

  const getDoctorBySearchKey = async (searchKey: string) => {
    try {
      const response = await fetch(`http://localhost:3000/doctors/${hospitalId}/${searchKey}`);
      
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

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    
    setSearchKey('');
    setDoctorExist(false);
    setSearchKeySession('');
    setRegisterFailed(false);
    setSuccessRegister(false);
    setLoading(true);

    const doctorExists = await checkDoctorExistence(nic);
    console.log("Doctor Exists : ", doctorExists);
    if (doctorExists) {
      console.log('Doctor already exists!');
      setLoading(false);
      return;
    }

    const hospitalId = hospital?.id;
    const normalizedNIC = nic.toLowerCase();
    const normalizedEmail = email.toLowerCase();
    const hashedPassword = await hashPassword(password);
    // Make a request to your NestJS API to register the patient
    const response = await fetch('http://localhost:3000/doctors/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: normalizedEmail,
        name: name,
        password: hashedPassword,
        nic: normalizedNIC,
        telephone: phoneNumber,
        walletAddress: walletAddress,
        specialties: specialization,
        hospitalId,
        pk: pk
      }),
    });

    if (response.ok) {
      setSuccessRegister(true);
      setName('');
      setPhoneNumber('');
      setWalletAddress('');
      setPK('');
      setNic('');
      setEmail('')
      setSpecialization('');
      setPassword('');
      setConfirmPassword('');
      fetchDataDoctor();
      setLoading(false);
      setSuccessRegister(false);
    } else {
      console.error('Error registering doctor:', await response.text());
      setLoading(false);
      setRegisterFailed(false);
    }

  }

  const checkDoctorExistence = async (nic: string) => {
    try {
      const response = await fetch(`http://localhost:3000/doctors/isRegistered/${hospital?.id}/${nic}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log('data', data);
      setDoctorExist(data);
      return data;
    } catch (error: any) {
      setLoading(false);
      setSuccessRegister(false);
      console.error('Check doctor existence error:', error);
      throw new Error(`Failed to check doctor existence: ${error.message}`);
    }
  };

  const isButtonDisabled = !name || !email || !password || !confirmPassword || !nic || !phoneNumber || !specialization || !walletAddress;

  return (
      <div className="flex min-h-screen">
        <Menu/>
        <h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
          {currentDayAndDate}
        </h5>
        <div className="max-w-8xl mx-auto min-h-screen w-full">
          <h4 className="h4 mt-5 ml-8 ">Doctor List ({doctorCount})</h4>
          <div className="grid grid-cols-2 mt-5 mr-16 items-top">
            <div>
              <form className="ml-8">
                <input
                  type="search"
                  name="search"
                  className="input-text"
                  placeholder="Search Doctor or Specialization"
                  list="doctors"
                  onChange={(e) => setSearchKey(e.target.value)}
                  style={{ width: '60%' }}
                />
                <datalist id="doctors">{/* Fetch and render doctor options dynamically */}</datalist>
                <input
                  type="Submit"
                  value="Search"
                  onClick={(e) => searchDoctor}
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
              Add Doctor
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
                  <th className="py-2">Doctor Id</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Specialties</th>
                  <th className="py-2">Telephone</th>
                  <th className="rounded-tr-[4px] py-2">Actions</th>
              </tr>
            </thead>
            {doctorList.length === 0 ? null : (
            <tbody className="text-center text-[16px]">
                {doctorList
                .slice(startIdx, endIdx)
                .map((doctor, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9FF]'}`}>
                    <td className="py-6 px-8">{index + 1}</td>
                    <td className="py-2 px-8">{doctor.docname}</td>
                    <td className="py-2 px-8">{doctor.docnic.toUpperCase()}</td>
                    <td className="py-2 px-8">{doctor.docemail}</td>
                    <td className="py-2 px-8">{doctor.specialties}</td>
                    <td className="py-2 px-8">{doctor.doctel}</td>
                    <td className="py-2">
                    <button
                    className="btn bg-blue-700 text-white w-16 py-2 mr-2"
                    onClick={openModal}
                  >
                    View
                  </button>
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
            {doctorList.length === 0 ? (
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
                  Add New Doctor
                  </h2>

                  <div className="flex flex-wrap mb-4">
                      <div className="px-4 py-4 w-1/3">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="name">Name <span className="text-red-600">*</span></label>
                        <input
                          id="name"
                          type="text"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter doctor name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">Email <span className="text-red-600">*</span></label>
                        <input
                          id="email"
                          type="text"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter doctor email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="nic">Doctor Id <span className="text-red-600">*</span></label>
                        <input
                          id="nic"
                          type="text"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter doctor id"
                          value={nic}
                          onChange={(e) => setNic(e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="password">Password <span className="text-red-600">*</span></label>
                        <input
                          id="password"
                          type="password"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter doctor password"
                          value={password}
                          onChange={handlePasswordChange}
                          required
                        />
                      </div>                      
                      <div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="confirmPassword">Confirm Password <span className="text-red-600">*</span></label>
                        <input
                          id="confirmPassword"
                          type="password"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter confirm password"
                          value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          required
                        />
                        {!passwordMatch && <p className="text-red-600">Passwords do not match</p>}
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

                      <div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="specialties">Specialization <span className="text-red-600">*</span></label>
                        <select id="specialties" 
                        // placeholder="Select specialization"
                        className="w-full py-3 text-gray-800 rounded border-gray-300"
                        value={specialization} 
                        onChange={(e) => handleSubmitSpecialization(e.target.value)}
                        >
                          <option value="" defaultChecked>Select specialization</option>
                          {specialties.map((option) => (
                            <option key={option.id} value={option.sname}>
                              {option.sname}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="wa">Wallet Address <span className="text-red-600">*</span></label>
                        <input
                          id="wa"
                          type="password"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter doctor wallet address"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          required
                        />
                      </div><div className="w-1/3 px-4 py-4">
                        <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="pk">Private Key<span className="text-red-600">*</span></label>
                        <input
                          id="pk"
                          type="password"
                          className="form-input w-full text-gray-800"
                          placeholder="Enter private key"
                          value={pk}
                          onChange={(e) => setPK(e.target.value)}
                          required
                        />
                      </div>
                    </div>
  
                    <div className="text-center">
                    {doctorExist && <p className="text-red-600">Doctor NIC is already registered</p>}
                    {isRegisteredSuccessfuly && <p className="text-blue-600">Doctor registered successfully!</p>}
                    {isRegisterFailed && <p className="text-red-600">Register Doctor failed, please try again.</p>}
                  
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

export default DoctorPage
