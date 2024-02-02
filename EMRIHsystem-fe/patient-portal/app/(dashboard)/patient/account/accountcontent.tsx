'use client'
import { useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import { decrypt, encrypt } from "@/components/utils/crypto";
import axios from "axios";

interface PersonalData {
    id: number;
    fullName: string;
    dob: string;
    gender: string;
    address: string;
    phoneNumber: string;
    email: string;
    bloodType: string;
    bloodPressure: string;
    heartRate: string;
    glucoseLevel: string;
    hemoglobin: string;
    weight: string;
    height: string;
  }

const AccountContentPage: React.FC = () => {
  const { accessToken, personalData, patientData, noMR, soapNotes, illnessDiagnosis, doctorPrescriptions, patientAdditions,appointmentHistory, documents, setNewPersonalData } = useAuth();
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const [isChangesNeeded, setChangesNeeded] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [submitDataError, setSubmitDataError] = useState(false);
  const [isUpdateDataSuccessfully, setUpdateDataSuccessfully] = useState(false);

  const [nama, setNama] = useState<string>('');
  const [dob, setDOB] = useState<string>('');  
  const [address, setAddress] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [bloodType, setBloodType] = useState<string>('');
  const [sistolik, setSistolik] = useState<string>('');
  const [diastolik, setDiastolik] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [glucoseLevel, setGlucoseLevel] = useState<string>('');
  const [hemoglobin, setHemoglobin] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [isPopupOpen, setPopupOpen] = useState(false);
  const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'n/a'];

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
    refreshData();
  }, []);
  
  const updateMedicalRecord = async () => {
    setSubmitDataError(false);
    setUpdateDataSuccessfully(false);
    try {
        const normalizedEmail = email.toLowerCase();
        const personalDetails : PersonalData = {
            id: patientData?.id ?? 0,
            fullName: nama,
            dob: dob,
            gender: personalData?.gender ?? '',
            address: address,
            phoneNumber: phoneNumber,
            email: normalizedEmail,
            bloodType: bloodType,
            bloodPressure: `${sistolik}/${diastolik}`,
            heartRate: heartRate,
            glucoseLevel: glucoseLevel,
            hemoglobin: hemoglobin,
            weight: weight,
            height: height
            };

        const encryptedData = await encrypt(JSON.stringify({
            doctorId: 0,
            appointmentId: 0,
            changesField: 'personal data',
            medicalRecord: {
                noMR : noMR,
                personalData: personalDetails,
                medicalRecord: {
                    soapNotes: soapNotes,
                    illnessDiagnosis: illnessDiagnosis,
                },
                prescription: {
                    doctorPrescriptions: doctorPrescriptions,
                    patientAdditions: patientAdditions,
                },
                appointmentHistory: appointmentHistory,
                documents: documents
            }
        }));
                
        const response = await axios.post(`http://localhost:3000/emr/update/${patientData?.id}`, { data: encryptedData }, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              },
            });
      
        const resp = (response.data);
        console.log('response :', resp)
            if(resp === 'No authorization')
            {
                setLoading(false);
                setSubmitDataError(true);
                setUpdateDataSuccessfully(false);
            }
            else
            {
                setNewPersonalData(personalDetails);
                setUpdateDataSuccessfully(true);
                setLoading(false);
                setPopupOpen(false);
                setSubmitDataError(false);
                setChangesNeeded(false);
                refreshData();
            }
    } catch (error) {
      console.error('Error during submit personal data:', error);
      setLoading(false);
      setSubmitDataError(true);
      setUpdateDataSuccessfully(false);
    }
  };

  const refreshData = () => {
    setNama(personalData?.fullName ?? '');
    setDOB(personalData?.dob ?? '');
    setAddress(personalData?.address ?? '');
    setPhoneNumber(personalData?.phoneNumber ?? '');
    setEmail(personalData?.email ?? '');
    setBloodType(personalData?.bloodType ?? '');
    setSistolik(personalData?.bloodPressure.split('/')[0] ?? '');
    setDiastolik(personalData?.bloodPressure.split('/')[1] ?? '');
    setGlucoseLevel(personalData?.glucoseLevel.split('-')[0] ?? '');
    setHeartRate(personalData?.heartRate ?? '');
    setHemoglobin(personalData?.hemoglobin ?? '' );
    setWeight(personalData?.weight.split('kg')[0] ?? '' );
    setHeight(personalData?.height.split('cm')[0] ?? '' );
  }

  const handleInputChangePhoneNumber = (e: { target: { value: any; }; }) => {
    let value = e.target.value;

    // Remove any characters that are not digits
    const cleanedValue = value.replace(/\D/g, '');

    // Check if the value starts with a '+'
    if (value.startsWith('+')) {
      // If it starts with '+', keep the '+' and add the cleaned digits
      value = '+' + cleanedValue;
    } else {
      // If it doesn't start with '+', just use the cleaned digits
      value = cleanedValue;
    }

    setPhoneNumber(value);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setLoading(false);
    setSubmitDataError(false);
  };

  const handleClickSave = () => {
    setLoading(true)
    setPopupOpen(true)
  };

  const isButtonDisabled = !nama || !phoneNumber || !email || !address || !bloodType
  
  return (
      <div className="flex min-h-screen">
        <Menu/>
        {/* <h5 className="text-lg absolute top-0 right-0 text-white mr-8 px-2 pt-8 font-semibold">
          {currentDayAndDate}
        </h5> */}
        <div className="mx-auto min-h-screen w-full py-4 bg-[#030e33] text-white">
            <h5 className="h5 px-16 pt-2 text-right">{currentDayAndDate}</h5>
            <h4 className="h4 px-16 ">My Personal Data</h4>
            <div className="grid grid-cols-1 border text-[#030e33] bg-white max-w-8xl mx-16 my-8 p-8 rounded"
                // style={{
                //     overflow: 'auto',
                //     maxHeight: '750px',
                // }}
                >
                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="nama">
                        Full Name
                        </label>
                    </div>
                    <div className="w-2/3">
                        <input
                        className={`shadow appearance-none border rounded w-full p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="nama"
                        name="nama"
                        type="text"
                        placeholder="Enter your full name"
                        value={nama}
                        disabled={!isChangesNeeded}
                        onChange={(e) => setNama(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="dob">
                        Date of Birth
                        </label>
                    </div>
                    <div className="w-2/3">
                        <input
                        className={`shadow appearance-none border rounded w-full p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="dob"
                        name="dob"
                        type="date"
                        placeholder="Enter your date of birth"
                        value={dob}
                        disabled={true}
                        onChange={(e) => setDOB(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="gender">
                        Gender
                        </label>
                    </div>
                    <div className="w-2/3">
                        <input
                        className={` bg-[#5190CA0D] shadow appearance-none border rounded w-full p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        `}
                        id="gender"
                        name="gender"
                        type="text"
                        value={personalData?.gender}
                        disabled={true}
                        />
                    </div>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="address">
                            Address
                        </label>
                    </div>
                    <div className="w-2/3">
                        <input
                        className={`shadow appearance-none border rounded w-full p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="address"
                        name="address"
                        type="text"
                        placeholder="Enter your address"
                        value={address}
                        disabled={!isChangesNeeded}
                        onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="phone">
                            Phone Number
                        </label>
                    </div>
                    <div className="w-2/3">
                        <input
                        className={`shadow appearance-none border rounded w-full p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="phone"
                        name="phone"
                        placeholder="Enter your phone number"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => handleInputChangePhoneNumber(e)}
                        disabled={!isChangesNeeded}
                        />
                    </div>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="email">
                            Email
                        </label>
                    </div>
                    <div className="w-2/3">
                        <input
                        className={`shadow appearance-none border rounded w-full p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="email"
                        name="email"
                        placeholder="Enter your email address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isChangesNeeded}
                        />
                    </div>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="bloodType">
                        Blood Type
                        </label>
                    </div>
                    <div className="w-2/3">
                        <select
                        className={`shadow appearance-none border rounded w-full p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="bloodType"
                        name="bloodType"
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        disabled={!isChangesNeeded}
                        >
                        <option value="" disabled>Select your blood type</option>
                        {bloodTypeOptions.map((type) => (
                            <option key={type} value={type}>
                            {type}
                            </option>
                        ))}
                        </select>
                    </div>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="bloodPressure">
                            Blood Pressure
                        </label>
                    </div>
                    <div className="w-2/3 flex items-center">
                        <input
                        className={`shadow appearance-none border rounded p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="sistolik"
                        name="sistolik"
                        placeholder="Enter your sistolik"
                        type="number"
                        value={sistolik}
                        onChange={(e) => setSistolik(e.target.value)}
                        disabled={!isChangesNeeded}
                        />
                        <span className="text-[#030e33] text-[24px] px-4">/</span>
                        <input
                        className={`shadow appearance-none border rounded p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="diastolik"
                        name="diastolik"
                        placeholder="Enter your diastolik"
                        type="number"
                        value={diastolik}
                        onChange={(e) => setDiastolik(e.target.value)}
                        disabled={!isChangesNeeded}
                        />
                        <span className="text-[#030e33] text-[18px] px-4">mmHg</span>
                    </div>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="heartRate">
                            Heart Rate
                        </label>
                    </div>
                    <div className="w-2/3 flex items-center">
                        <input
                        className={`shadow appearance-none border rounded p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="heartRate"
                        name="heartRate"
                        placeholder="Enter your heart rate"
                        type="number"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                        disabled={!isChangesNeeded}
                        />
                        <span className="text-[#030e33] text-[18px] px-4">bpm</span>
                    </div>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="glucoseLevel">
                            Glucose Level
                        </label>
                    </div>
                    <div className="w-2/3 flex items-center">
                        <input
                        className={`shadow appearance-none border rounded p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="glucoseLevel"
                        name="glucoseLevel"
                        placeholder="Enter your glucose level"
                        type="number"
                        value={glucoseLevel}
                        onChange={(e) => setGlucoseLevel(e.target.value)}
                        disabled={!isChangesNeeded}
                        />
                        <span className="text-[#030e33] text-[18px] px-4">cm</span>
                    </div>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="hemoglobin">
                            Hemoglobin
                        </label>
                    </div>
                    <div className="w-2/3 flex items-center">
                        <input
                        className={`shadow appearance-none border rounded p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="hemoglobin"
                        name="hemoglobin"
                        placeholder="Enter your hb"
                        type="number"
                        value={hemoglobin}
                        onChange={(e) => setHemoglobin(e.target.value)}
                        disabled={!isChangesNeeded}
                        />
                        <span className="text-[#030e33] text-[18px] px-4">g/dl</span>
                    </div>
                </div>

                <div className="mb-4 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="weight">
                            Weight
                        </label>
                    </div>
                    <div className="w-2/3 flex items-center">
                        <input
                        className={`shadow appearance-none border rounded p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="weight"
                        name="weight"
                        placeholder="Enter your weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        disabled={!isChangesNeeded}
                        />
                        <span className="text-[#030e33] text-[18px] px-4">kg</span>
                    </div>
                </div>

                <div className="mb-10 flex items-center">
                    <div className="w-1/3">
                        <label className="block text-[#030e33] text-[20px] mb-2" htmlFor="height">
                            Height
                        </label>
                    </div>
                    <div className="w-2/3 flex items-center">
                        <input
                        className={`shadow appearance-none border rounded p-3 text-[#030e33] leading-tight focus:outline-none focus:shadow-outline
                        ${!isChangesNeeded && 'bg-[#5190CA0D]'}
                        `}
                        id="height"
                        name="height"
                        placeholder="Enter your height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        disabled={!isChangesNeeded}
                        />
                        <span className="text-[#030e33] text-[18px] px-4">cm</span>
                    </div>
                </div>
                
                <div className="my-4 px-4">
                    <div className="flex items-center justify-end">
                    {isChangesNeeded ? (
                    <button
                    onClick={handleClickSave}
                    disabled={isButtonDisabled || isLoading}
                    className={`${isButtonDisabled ? 'bg-gray-300 text-[030e33]' : ''}
                    text-white bg-[#030e33] hover:cursor-pointer text-[16px] font-bold py-3 px-8 rounded focus:outline-none focus:shadow-outline`}
                    >Save Data
                    </button>
                    ): (
                        <button
                        onClick={() => setChangesNeeded(true)}
                        className='text-[#030e33] bg-white border border-[#030e33] hover:bg-[#030e33] hover:text-white text-[16px] font-bold py-3 px-8 rounded focus:outline-none focus:shadow-outline'
                        >Edit Data
                        </button>
                    )}
                    </div>
                </div>

                <div>
                    {submitDataError && <p className="mt-4 text-red-600 text-center">Update data failed, no authorization.</p>}            
                    {isUpdateDataSuccessfully && <p className="mt-4 text-center text-blue-600">You have successfully update your personal data.</p>}
                </div>
            </div>
        </div>

        {isPopupOpen && (
        <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
            onClick={closePopup}
        >
            <div
            className="bg-white p-8 rounded-lg"
            onClick={(e) => e.stopPropagation()}
            >
            <h3 className="h3 font-bold text-center mb-8 text-blue-700">
            Confirmation
            </h3>
            <h4 className="h4 font-bold text-center mb-4">
            Do you want to save the changes?
            </h4>
            <h5 className="h5 text-center mb-8 ">
            Please check your information before submitting.
            </h5>
            <div className="text-center mt-16">
            <button
                className="btn text-gray-800 bg-gray-300 hover:bg-gray-500 w-full ml-2 px-10 mb-4 sm:w-auto sm:mb-0"
                onClick={closePopup}
            >
                Cancel
            </button>
            <button
                className="btn text-white bg-blue-600 hover:bg-blue-900 w-full ml-2 mb-4 ml-8 sm:w-auto sm:mb-0"
                onClick={updateMedicalRecord}
            >
                Confirm
            </button>
            </div>
            </div>
        </div>
        )};
      </div>
  );
};

export default AccountContentPage
