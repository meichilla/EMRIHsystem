'use client'
import Menu from "@/components/ui/menu";
import { useEffect, useState } from "react";
import PatientImage from '@/public/images/patient.png';
import BloodImage from '@/public/images/blood.png';
import BloodPressureImage from '@/public/images/blood-pressure.png';
import HemoglobinImage from '@/public/images/hemoglobin1.jpg';
import HeartRateImage from '@/public/images/heart-rate.jpg';
import GlucoseLevelImage from '@/public/images/glucose-level.jpg';
import { CgSoftwareDownload } from "react-icons/cg";
import { useAuth } from "@/app/(auth)/AuthContext";
import { IoMdArrowDropup, IoMdArrowDropdown, IoIosNotificationsOutline  } from "react-icons/io";
import { FaRegSmileBeam } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import EmptyTableData from "../../doctor/patient/empty_table_data";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { decrypt } from "@/components/utils/crypto";

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

interface Prescription {
  isDoctorPrescription: boolean;
  medication: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

interface SOAPNotes {
  timestamp: Date;
  doctor: string;
  hospital: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  appointmentId: number;
}

interface HistoryIllnessDiagnosis {
  appointmentId: number;
  code: string;
  date: Date;
  doctor: string;
  name: string;
  treatment: string;
}

interface Document {
  appointmentid: number,
  filename: string,
  filesize: number,
  filetype: string,
  date: Date,
  fileUrl: string,
}

// const Homepage: React.FC<{ patientData: PatientData }> = ({ patientData }) => {
const HomeContentPage: React.FC = () => {
  const {patientData, noMR, dob, appointmentHistory, accessToken, personalData, illnessDiagnosis, documents, soapNotes, setMenu} = useAuth();
  const [isHeartRateLow, setIsHeartLow] = useState(false);
  const [isHeartRateNormal, setIHeartRateNormal] = useState(false);
  const [isHbLow, setIsHbLow] = useState(false);
  const [isHbNormal, setIsHbNormal] = useState(false);
  const [isBloodPressureNormal, setIsBloodPressureNormal] = useState(false);
  const [isBloodPressureLow, setIsBloodPressureLow] = useState(false);
  const [isGlucoseLow, setIsGlucoseLow] = useState(false);
  const [isGlucoseNormal, setIsGlucoseNormal] = useState(false);
  const [isOpenHistorySOAP, setOpenHistory] = useState(false);  
  const [historyPrescriptions, setHistoryPrescriptions] = useState<Prescription[]>([]);
  const [historyDocuments, setHistoryDocuments] = useState<Document[]>([]);
  const [historyDiagnose, setHistoryDiagnose] = useState<HistoryIllnessDiagnosis | null>(null);
  const [historyPersonalData, setHistoryPersonalData] = useState<PersonalData | null>(null);
  const [historyAppoid, setHistoryAppoId] = useState(0);
  const [historySession, setHistorySession] = useState('');
  const [historyDoctor, setHistoryDoctor] = useState('');
  const [historyHospital, setHistoryHospital] = useState('');
  const [historySOAP, setHistorySOAP] = useState<SOAPNotes | null>(null);
  const [notifications, setNotification] = useState<{
    id: number,
    message: string,
    date: string,
    time: string,
  }[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<{
    id: number,
    date: string,
    time: string,
    changedBy: string,
    hospital: string,
  }>();

  const [age, setAge] = useState('0 Tahun');

  const handleDownloadClick = (doc: Document) => {
    const downloadLink = document.createElement('a');
    downloadLink.href = doc.fileUrl;
    console.log(doc.fileUrl);
    downloadLink.download = doc.filename;
    downloadLink.target = '_blank';
    downloadLink.click();
  };

  const handleCloseHistory = async () => {
    setHistoryAppoId(0)
    setHistorySession('')
    setHistoryDoctor('')
    setHistoryHospital('')
    setHistoryPersonalData(null);
    setHistoryDiagnose(null);
    setHistorySOAP(null);
    setHistoryDocuments([]);
    setHistoryPrescriptions([]);
    setOpenHistory(false);
  };

  const handleOpenHistory = async (appointmendId : number, session: string, doctor: string, hospital: string) => {
    setHistoryAppoId(appointmendId);
    setHistorySession(session)
    setHistoryDoctor(doctor)
    setHistoryHospital(hospital)
    const response = await axios.get(`http://localhost:3000/emr/patient/latest-soap/${appointmendId}`,  {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        },
      });

    const resp = await decrypt(response.data)
    const data = await JSON.parse(resp);
    const latestSOAP = data.result;
    
    const l_soap = latestSOAP.soapNotes;
    const filteredSOAP: SOAPNotes[] = l_soap.filter(
      (notes: { appointmentId: number; }) => notes.appointmentId === appointmendId
    );
    
    let latestSoapNote = null;
    if (filteredSOAP.length > 0 ) {
      latestSoapNote = filteredSOAP.reduce((latest, note) => {
        return latest.timestamp > note.timestamp ? latest : note;
      });
    }

    setHistoryPersonalData(latestSOAP.personalData);
    setHistoryDiagnose(latestSOAP.illnessDiagnosis);
    setHistorySOAP(latestSoapNote);
    setHistoryPrescriptions(latestSOAP.doctorPrescriptions);
    setHistoryDocuments(latestSOAP.documents);

    setOpenHistory(true);
  }

  useEffect(() => {
    
  },[personalData, latestUpdate, appointmentHistory, illnessDiagnosis, soapNotes, historyPersonalData, historyDiagnose, historySOAP, historyDocuments, historyPrescriptions, historySession, historyAppoid, historyDoctor, historyHospital])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/notif/all/${patientData?.id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            },
          });
        const data = await response.data;
        setNotification(data);
      } catch (error) {
        console.error('Error during get notification:', error);
      }
    }
  
    const fetchLatestUpdate = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/emr/latest-update/${patientData?.id}`,{
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            },
          });
  
        const data = await response.data;
        setLatestUpdate(data);
      } catch (error) {
        console.error('Error during get notification:', error);
      }
    }

    fetchNotifications();
    fetchLatestUpdate();
    setIsBloodPressureNormal(true);
    setIsHbLow(true);
    setIsHeartLow(true);
    setIsGlucoseLow(false);

    calculateAge()
  }, [dob ]);

  const calculateAge = () => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // Check if birthday has occurred this year
      if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        setAge(`${age - 1} Tahun`); // Subtract 1 if birthday hasn't occurred yet
      } else {
        setAge(`${age} Tahun`);
      }
    } else {
      setAge('-');
    }
  };

  return (
      <div className="flex min-h-screen">
        <Menu />
        {isOpenHistorySOAP ? (
          <>
            <div className="flex mx-auto min-h-screen w-full py-4 bg-[#030e33]">
              <IoArrowBackCircleOutline 
                onClick={handleCloseHistory}
                className="bg-white ml-4 w-12 h-10 rounded-full hover:cursor-pointer"
              />
              <div className="flex flex-col ml-8 mr-16">
                <h3 className="h3 text-white">S O A P - {personalData?.fullName} | {historySession ?? 'Facial Charcoal'} at {historyHospital}</h3>
                <h5 className="h5 py-2 text-white">No Rekam Medis: {noMR}</h5>
                <h5 className="h5 text-white">Submitted By - Dr. {historyDoctor} </h5>

                <div className="bg-white rounded py-8 pl-8 pr-24 mt-4"
                  style={{
                    overflow: 'auto',
                    maxHeight: '800px',
                  }}
                >
                <h4 className="h4 mb-8 text-gray-800">VITAL SIGN</h4>

                  <div className="grid grid-cols-4 text-[20px]">
                    <div className="flex flex-col w-2/3 mr-4">
                      <label className="block text-gray-700">Weight:</label>
                      <div className="flex items-center mt-1">
                        <input disabled={true} type="number" name="weight" value={historyPersonalData?.weight} className="border rounded px-3 py-2 mt-1 w-36 mr-2" />
                        <span className="text-gray-500">kg</span>
                      </div>
                    </div>

                    <div className="flex flex-col w-2/3 mr-4">
                      <label className="block text-gray-700">Height:</label>
                      <div className="flex items-center mt-1">
                        <input disabled={true} type="number" name="height" value={historyPersonalData?.height} className="border rounded px-3 py-2 mt-1 w-36 mr-2" />
                        <span className="text-gray-500">cm</span>
                      </div>
                    </div>

                    <div className="flex flex-col w-2/3 mr-4">
                      <label className="block text-gray-700">Heart Rate:</label>
                      <div className="flex items-center mt-1">
                        <input disabled={true} type="number" name="heartRate" value={historyPersonalData?.heartRate} className="border rounded px-3 py-2 mt-1 w-36 mr-2" />
                        <span className="text-gray-500">bpm</span>
                      </div>
                    </div>

                    <div className="flex flex-col w-2/3">
                      <label className="block text-gray-700">Blood Pressure:</label>
                      <div className="flex items-center mt-1">
                          <input disabled={true} type="number" name="sistolik" value={historyPersonalData?.bloodPressure.split('/')[0]} className="border rounded px-3 py-2 mr-2 w-36" />
                          <span className="text-[24px]">/</span>
                          <input disabled={true} type="number" name="diastolik" value={historyPersonalData?.bloodPressure.split('/')[1]} className="border rounded px-3 py-2 ml-3 mr-2 w-36" />
                          <span className="text-gray-500">mmHg</span>
                        </div>
                    </div>

                    <div className="flex flex-col w-2/3 mr-4 mt-8">
                      <label className="block text-gray-700">Hemoglobin:</label>
                      <div className="flex items-center mt-1">
                        <input disabled={true} type="number" name="hemoglobin" value={historyPersonalData?.hemoglobin} className="border rounded px-3 py-2 mt-1 mr-2 w-36" />
                        <span className="text-gray-500">g/dl</span>
                      </div>
                    </div>

                    <div className="flex flex-col w-2/3 mt-8">
                      <label className="block text-gray-700">Glucose Level:</label>
                      <div className="flex items-center mt-1">
                        <input disabled={true} type="number" name="glucoseLevel" value={historyPersonalData?.glucoseLevel} className="border rounded px-3 py-2 mt-1 mr-2 w-36" />
                      </div>
                    </div>
                  </div>

                  <h4 className="h4 mt-12 mb-8 text-gray-800">ILLNESS DIAGNOSIS</h4>
                  <div className="text-[20px]">
                  {historyDiagnose && (
                      <div className="mb-4 rounded rounded-[10px] border-gray-600 border w-2/3 bg-white shadow-lg p-4">
                        <p>ICD-10 Code: {historyDiagnose.code}</p>
                        <p>Name: {historyDiagnose.name}</p>
                        <p>Treatment: {historyDiagnose.treatment}</p>
                      </div>
                    )}
                  </div>

                  <h4 className="h4 mt-12 mb-8 text-gray-800">SOAP</h4>
                  <div className="text-[20px]">
                  {/* {historySOAP?.map((soap, index) => ( */}
                  {historySOAP && (
                    <div 
                    // key={index} 
                    className="mb-4 rounded rounded-[10px] border-gray-600 border w-2/3 bg-white shadow-lg p-4">
                      <div className="mr-4 w-full">
                        <label className="block text-gray-700">S</label>
                        <textarea name="subjective" disabled={true} value={historySOAP.subjective} className="border rounded px-3 py-2 mt-1 mr-2 h-40 w-full" />
                      </div>
                      <div className="mr-4 w-full">
                        <label className="block text-gray-700">O</label>
                        <textarea name="objective" disabled={true} value={historySOAP.objective} className="border rounded px-3 py-2 mt-1 mr-2 h-40 w-full" />
                      </div>
                      <div className="mr-4 w-full">
                        <label className="block text-gray-700">A</label>
                        <textarea name="assessment" disabled={true} value={historySOAP.assessment} className="border rounded px-3 py-2 mt-1 mr-2 h-40 w-full" />
                      </div>
                      <div className="mr-4 w-full">
                        <label className="block text-gray-700">P</label>
                        <textarea name="planning" disabled={true} value={historySOAP.plan} className="border rounded px-3 py-2 mt-1 mr-2 h-40 w-full" />
                      </div>
                      <div className="mr-4 w-full">
                        <label className="block text-gray-700">Date</label>
                        <p>{`${historySOAP.timestamp}`.split('T')[0]} {`${`${historySOAP.timestamp}`.split('T')[1]}`.split(':')[0]}:{`${`${historySOAP.timestamp}`.split('T')[1]}`.split(':')[1]} WIB</p>
                      </div>
                    </div>
                  )}
                  </div>

                  <h4 className="h4 mt-12 mb-8 text-gray-800">PRESCRIPTION</h4>
                  <div className="text-[20px]">
                    {historyPrescriptions?.map((prescription, index) => (
                      <div key={index} className="mb-4 rounded rounded-[10px] border-gray-600 border w-2/3 bg-white shadow-lg p-4">
                        <p><span className="font-bold">Medication: </span>{prescription.medication}</p>
                        <p><span className="font-bold">Dosage: </span>{prescription.dosage}</p>
                        <p><span className="font-bold">Frequency: </span>{prescription.frequency}</p>
                        <p><span className="font-bold">Instructions: </span>{prescription.instructions}</p>
                      </div>
                    ))}
                  </div>

                  {/* File Upload Section */}
                  <h4 className="h4 my-8 text-gray-800">Document</h4>
                  { historyDocuments.length > 0 ? (
                    <div className="mt-4">
                      {historyDocuments.map((doc, index) => (
                        <div className="flex items-center mt-4 max-w-4xl" key={index}>
                          {doc.filetype === 'application/pdf' ? (
                            <iframe
                              src={doc.fileUrl}
                              frameBorder="0"
                              scrolling="no"
                              width="100%"
                              height="500px"
                            ></iframe>
                          ) : (
                            <img src={doc.fileUrl} alt={doc.filename} style={{ width: '100px' }} />
                          )}
                          <h4 className="ml-4">{doc.filename}</h4>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border w-2/3 border-gray-600">
                    <EmptyTableData/>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
        <div className="mx-auto min-h-screen w-full py-4 bg-[#030e33]">
          <div className="grid grid-cols-2 max-w-8xl mx-8">  
            <div className="col-span-1 row-span-1 rounded ml-4">
              <h3 className="h3 px-8 text-white">Welcome back, {personalData?.fullName}.</h3>
              <h5 className="h5 px-8 py-2 text-white">No Rekam Medis: {noMR}</h5>
              <div>
                <div className="grid grid-cols-3 ml-8">
                  <div className="col-span-1 row-span-1 border px-5 pt-7 pb-8 mr-4 my-auto bg-white rounded-[10px]">
                    <div>
                      <img src={BloodImage.src} alt="blood" width={50} height={50} />
                      <h5 className="h5 font-semibold mt-2">Blood Type</h5>
                      <h4 className="h4 text-[40px] font-semibold text-blue-500">{personalData?.bloodType ? personalData.bloodType : '-'}</h4>
                    </div>
                  </div>
                  <div className="col-span-1 row-span-1 border px-5 py-4 mr-4 my-auto bg-white rounded-[10px]">
                    <div>
                      <img src={HeartRateImage.src} alt="blood" width={75} height={50}/>
                      <h5 className="h5 font-semibold mt-2">Heart Rate</h5>
                      <h4 className="h4 font-semibold text-blue-500">{personalData?.heartRate ? personalData.heartRate : '-'} bpm</h4>
                      <p className="text-[14px] mt-4">
                        {isHeartRateNormal ? (
                      <div className="text-green-600">
                        <FaRegSmileBeam/> 
                        <span>Normal</span>
                      </div>
                      ) :(
                      <>
                        {isHeartRateLow ? (
                        <div className="text-yellow-600">
                        <IoMdArrowDropdown/> 
                        <span className="text-yellow-600">Lower than average</span>
                        </div>
                        ) :(
                        <div className="text-red-600">
                        <IoMdArrowDropup />
                        <span className="text-red-600">Higher than average</span>
                          </div>
                        )}
                      </>
                      )}</p>
                    </div>
                  </div>
                  <div className="col-span-1 row-span-1 border px-5 py-4 mr-4 my-auto bg-white rounded-[10px]">
                    <div>
                      <img src={GlucoseLevelImage.src} alt="blood" width={75} height={50}/>
                      <h5 className="h5 font-semibold mt-2">Glucose Level</h5>
                      <h4 className="h4 font-semibold text-blue-500">{personalData?.glucoseLevel ? personalData?.glucoseLevel : '-'}</h4>
                      <p className="text-[14px] mt-4">
                      {isGlucoseNormal ? (
                      <div className="text-green-600">
                        <FaRegSmileBeam/> 
                        <span>Normal</span>
                      </div>
                      ) :(
                      <>
                        {isGlucoseLow ? (
                        <div className="text-yellow-600">
                        <IoMdArrowDropdown/> 
                        <span className="text-yellow-600">Lower than average</span>
                        </div>
                        ) :(
                        <div className="text-red-600">
                        <IoMdArrowDropup />
                        <span className="text-red-600">Higher than average</span>
                          </div>
                        )}
                      </>
                      )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 ml-8">
                  <div className="col-span-1 row-span-1 mt-5 border px-5 py-4 mr-4 my-auto bg-white rounded-[10px]">
                    <div>
                      <img src={BloodPressureImage.src} alt="blood" width={75} height={50} />
                      <h5 className="h5 font-semibold mt-2">Blood Pressure</h5>
                      <h4 className="h4 font-semibold text-blue-500">{personalData?.bloodPressure ? personalData.bloodPressure : '-/-'} mmHg</h4>
                      <p className="text-[14px] mt-4">{isBloodPressureNormal ? (
                      <div className="text-green-600">
                        <FaRegSmileBeam/>
                        <span>Normal</span>
                      </div>
                      ) :(
                      <>
                        {isBloodPressureLow ? (
                        <div className="text-yellow-600">
                        <IoMdArrowDropdown/> 
                        <span className="text-yellow-600">Lower than average</span>
                        </div>
                        ) :(
                        <div className="text-red-600">
                        <IoMdArrowDropup />
                        <span className="text-red-600">Higher than average</span>
                          </div>
                        )}
                      </>
                      )}</p>
                    </div>
                  </div>
                  <div className="col-span-1 row-span-1 mt-5 border px-5 py-4 mr-4 my-auto bg-white rounded-[10px]">
                    <img src={HemoglobinImage.src} alt="blood" width={64} height={50} />
                        <h5 className="h5 font-semibold mt-2">Hemoglobin</h5>
                        <h4 className="h4 font-semibold text-blue-500">{personalData?.hemoglobin ? personalData.hemoglobin : '-'} g/dl</h4>
                        <p className="text-[14px] mt-4">{isHbNormal ? (
                        <div className="text-green-600">
                          <FaRegSmileBeam/>
                          <span>Normal</span>
                        </div>
                        ) :(
                        <>
                          {isHbLow ? (
                          <div className="text-yellow-600">
                          <IoMdArrowDropdown/> 
                          <span className="text-yellow-600">Lower than average</span>
                          </div>
                          ) :(
                          <div className="text-red-600">
                          <IoMdArrowDropup />
                          <span className="text-red-600">Higher than average</span>
                            </div>
                          )}
                        </>
                        )}</p>
                  </div>
                  <div className="col-span-1 row-span-1 mt-5 border px-5 mr-4 py-6 bg-white rounded-[10px]">
                        <h5 className="h5 font-semibold mt-2 text-[14px]">Last update :</h5>
                        <h5 className="h5 font-semibold text-blue-500 text-[16px]">{latestUpdate?.date}</h5>
                        <h5 className="h5 font-semibold text-blue-500 text-[16px]">{latestUpdate?.time}</h5>
                        {latestUpdate?.hospital === '' ? (
                        <>
                        <h5 className="h5 font-semibold mt-4 text-[14px]">Updated By :</h5>
                        <h5 className="h5 font-semibold text-blue-500 text-[16px]">{latestUpdate?.changedBy}</h5></>
                        ) :(
                        <><h5 className="h5 font-semibold mt-2 text-[14px]">Hospital :</h5>
                        <h5 className="h5 font-semibold text-blue-500 text-[16px]">{latestUpdate?.hospital ? latestUpdate?.hospital : 'Hospital ABC' }</h5>
                        <h5 className="h5 font-semibold mt-2 text-[14px]">Doctor :</h5>
                        <h5 className="h5 font-semibold text-blue-500 text-[16px]">Dr. {latestUpdate?.changedBy}</h5></>
                        )}
                      </div>
                </div>
                <div className="grid grid-cols-2 ml-8">
                  <div className="col-span-1 row-span-1 mt-5 border px-5 py-2 mr-4  bg-white rounded-[10px]">
                      <div>
                        <h5 className="h5 font-semibold">Illness Diagnosis</h5>
                        <div className="grid grid-cols-2 grid-rows-2 my-4 text-[14px]">
                          {illnessDiagnosis && (
                            <>
                            <div className="col-span-2 row-span-1">
                                <p>Name: </p>
                                <h5 className="h5 font-semibold text-blue-500">{illnessDiagnosis?.name}</h5>
                              </div>
                            <div className="col-span-1 row-span-1 mt-1">
                              <p>Code: </p>
                              <h5 className="h5 font-semibold text-blue-500">{illnessDiagnosis?.code}</h5>
                            </div><div className="col-span-1 row-span-1 mt-1">
                                <p>Diagnozed: </p>
                                {illnessDiagnosis?.name &&
                                (
                                  <h5 className="h5 font-semibold text-blue-500 mr-2">{`${`${illnessDiagnosis?.date}`.split('T')[0]}`}</h5>
                                )}
                              </div><div className="col-span-1 row-span-1 mt-1">
                                <p>Doctor: </p>
                                <h5 className="h5 font-semibold text-blue-500">{illnessDiagnosis?.doctor}</h5>
                              </div><div className="col-span-1 row-span-1 mt-1">
                                <p>Treatment: </p>
                                <h5 className="h5 font-semibold text-blue-500">{illnessDiagnosis?.treatment}</h5>
                              </div>
                            </>
                            )}
                        </div>
                      </div>
                    </div>
                  <div className="col-span-1 row-span-1 mt-5 border px-5 py-2 mr-4 bg-white rounded-[10px]">
                    <div>
                      <h5 className="h5 font-semibold mb-1">Documents</h5>
                      {documents.length > 0 ? (
                        <div className="grid grid-cols-2 pb-3">
                          {documents
                          .map((doc, index) => (
                            <div key={index} className="mt-2 mr-4 px-2 py-1 border rounded-[8px]">
                              <h5 className="text-blue-500 font-semibold text-[12px]">{doc.filename}</h5>
                              <h5 className="text-left font-semibold text-gray-400 text-[10px]">{doc.filetype} </h5>
                              <CgSoftwareDownload className="h-4 w-5 ml-20 hover:cursor-pointer"
                              onClick={() => handleDownloadClick(doc)}
                              />
                            </div>
                          ))}
                        </div>
                        ) : (
                          <EmptyTableData/>
                      )}

                      {/* {selectedFile && (
                        <div>
                          <h2>{selectedFile.filename}</h2>
                          <p>File content: {selectedFile.content}</p>
                          Add additional rendering logic based on your file type
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              </div>
            </div> 
            <div className="col-span-1 row-span-1 mx-8">
              <div className="grid grid-cols-2 h-full">
                <div className="col-span-1 row-span-1 border px-5 bg-white rounded-[8px]">
                  <div className="text-center border-b pb-2 border-blue-900">
                    <img
                      src={PatientImage.src}
                      className="w-auto h-36 my-4 mx-16 rounded-full border border-[8px] border-blue-900 p-2 shadow-lg"
                    />
                    <h4 className="h4 font-semibold">{personalData?.fullName}</h4>
                  </div>
                  <div className="grid grid-cols-2 grid-rows-2 pt-4">
                    <div className="col-span-1 row-span-1 ml-8">
                      <p>Gender: </p>
                      <h5 className="h5 font-semibold text-blue-500">{personalData?.gender}</h5>
                    </div>
                    <div className="col-span-1 row-span-1 ml-8">
                      <p>Height: </p>
                      <h5 className="h5 font-semibold text-blue-500">{personalData?.height}</h5>
                    </div>
                    <div className="col-span-1 row-span-1 ml-8 mt-2">
                      <p>Age: </p>
                      <h5 className="h5 font-semibold text-blue-500 mr-2">{age}</h5>
                    </div>
                    <div className="col-span-1 row-span-1 ml-8 mt-2">
                      <p>Weight: </p>
                      <h5 className="h5 font-semibold text-blue-500">{personalData?.weight}</h5>
                    </div>
                  </div>
                  <div className="py-6 text-center">
                    <Link 
                    onClick={() => setMenu(5)}
                    href="/patient/account" 
                    className="btn-sm text-blue-900 rounded-[16px] border-blue-900 hover:bg-blue-900 hover:text-white">
                      Show all Informations
                    </Link>
                  </div>
                  <div className="border-t border-blue-900 pt-4 px-1 h-56">
                    <h5 className="h5 font-semibold pb-2"><IoIosNotificationsOutline className="w-6 h-6 mb-1"/>Today Notifications
                    <Link 
                    onClick={() => setMenu(4)}
                    href="/patient/notification" 
                    className="h5 text-[14px] ml-32 text-gray-400 items-right hover:cursor-pointer hover:underline">
                        See all &gt;
                      </Link>
                    </h5>
                    {notifications.length > 0 ? (
                      <div>
                        {notifications
                        .slice(0,2)
                        .map((notif, index) => (
                          <div key={index} className="mt-2 p-2 border rounded-[8px]">
                            <h5 className="text-blue-500 font-semibold text-[14px]">{notif.message}</h5>
                            <h5 className="text-gray-500 font-semibold text-[12px] text-right">{notif.time.split(':')[0]}:{notif.time.split(':')[1]} WIB</h5>
                          </div>
                        ))}
                      </div>
                      ) :
                      (
                        <div className="text-center text-[16px] mt-8 p-8">
                          You do not have any notifications for today.
                        </div>
                      )}
                  </div>
                </div>
                <div className="col-span-1 row-span-1 p-5 ml-8 bg-white rounded-[8px]">
                  <div>
                    <h4 className="h4 font-semibold text-center mb-4">Appointment History</h4>
                    <div>
                      {appointmentHistory.length > 0 ? (
                      <><div className="mt-8 ml-2 w-full items-center">
                            {appointmentHistory
                              .slice(0,4)
                              .map((appointment, index) => (
                                <div key={index} className="mt-2 mr-4 px-2 py-1 border border-blue-900 rounded-[8px]">
                                  <h5 className="text-blue-500 font-semibold text-[24px]">{appointment.session ?? 'Facial Charcoal'}</h5>
                                  <h5 className="font-semibold mt-2 text-[14px]">{appointment.hospital} - Dr.{appointment.doctor}</h5>
                                  <h5 className="font-semibold mt-2 text-[14px]">{`${`${appointment.timestamp}`.split('T')[0]}`}</h5>
                                  <IoMdArrowDropdown
                                    onClick={() => handleOpenHistory(appointment.appointmentId, appointment.session, appointment.doctor, appointment.hospital)}
                                    className="h-8 w-8 hover:cursor-pointer" />
                                </div>
                              ))}
                          </div><div className="pt-6 text-center">
                              <Link
                                onClick={() => setMenu(5)}
                                href="/patient/appointmenthistory"
                                className="btn-sm text-blue-900 rounded-[16px] border-blue-900 hover:bg-blue-900 hover:text-white">
                                Show all Appointment History
                              </Link>
                            </div></>
                      ) : (
                      <div className="text-center text-[18px] border-t border-blue-900 px-8 pt-72 pb-40">
                        <EmptyTableData />
                      </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        )}
      </div>
  );
};

export default HomeContentPage
