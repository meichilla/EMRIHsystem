'use client'
import { useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import EmptyTable from "./empty_table";
import axios from "axios";
import { decrypt } from "@/components/utils/crypto";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import EmptyTableData from "../../doctor/patient/empty_table_data";

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

interface AppointmentHistory {
  session: string,
  appointmentId: number;
  timestamp: Date;
  doctor: string;
  hospital: string;
  status: string;
}

interface Document {
  appointmentid: number,
  filename: string,
  filesize: number,
  filetype: string,
  date: Date,
  fileUrl: string,
}

const AppointmentHistoryPage: React.FC = () => {
  const { hospital, accessToken, patientData, personalData, appointmentHistory, noMR } = useAuth();
  const hospitalId = hospital?.id
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const [searchKey, setSearchKey] = useState('');
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
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentHistory[]>([]);

  const handleSearchBy = (searchKey: string) => {
    setSearchKey(searchKey);

    // Filter appointment history based on session, doctor, and hospital
    const filteredAppointments = appointmentHistory.filter((appointment) => {
      const normalizedSearchKey = searchKey.toLowerCase();
      const normalizedSession = appointment.session?.toLowerCase() || '';
      const normalizedDoctor = appointment.doctor.toLowerCase();
      const normalizedHospital = appointment.hospital.toLowerCase();

      return (
        normalizedSession.includes(normalizedSearchKey) ||
        normalizedDoctor.includes(normalizedSearchKey) ||
        normalizedHospital.includes(normalizedSearchKey)
      );
    });

    // Update filtered appointments in the state
    setFilteredAppointments(filteredAppointments);
  };
  
  useEffect(() => {
    
  },[personalData, appointmentHistory, historyPersonalData, historyDiagnose, historySOAP, historyPrescriptions, historySession, historyAppoid, historyDoctor, historyHospital])

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

    if(searchKey.trim() === '')
    {
      setFilteredAppointments(appointmentHistory);
    }

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
  }, [personalData]);

  return (
      <div className="flex min-h-screen">
        <Menu/>
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
                  {historySOAP && (
                    <div 
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
        <><h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
            {currentDayAndDate}
          </h5><div className="max-w-8xl mx-auto min-h-screen w-full ml-8">
              <h4 className="h4 mt-5 ml-16 ">Appointment History ({appointmentHistory.length})</h4>

              <form className="ml-16 flex mt-8">
                <input
                  type="search"
                  name="search"
                  className="input-text"
                  placeholder="Search Appointment History by Session / Doctor / Hospital"
                  list="appointments"
                  value={searchKey}
                  onChange={(e) => handleSearchBy(e.target.value)}
                  style={{ width: '57%' }} />
              </form>
            </div><div className="max-w-7xl mx-auto max-h-screen w-full ml-96 mt-36 absolute pr-16"
              style={{
                overflow: 'auto',
                maxHeight: '750px',
              }}
            >
              {filteredAppointments.length > 0 ? (
                <div className="mt-5 items-center">
                  {filteredAppointments.map((appointment, index) => (
                    <div className="w-2/3 border mt-5 border-blue-900"
                      key={index}
                      style={{
                        background: 'white',
                        borderRadius: '10px',
                        padding: '20px',
                      }}
                    >
                      <h4 className="h4 pt-2 text-blue-500 text-left font-semibold mb-2">{appointment.session ?? 'Facial Charcoal'} at {appointment.hospital}</h4>
                      <h5 className="h5 text-left font-semibold">Dr. {appointment.doctor}</h5>
                      <h5 className="h5 text-right">{`${appointment.timestamp}`.split('T')[0]}</h5>
                      <h5 className="h5 text-right">{`${`${appointment.timestamp}`.split('T')[1]}`.split(':')[0]}:{`${`${appointment.timestamp}`.split('T')[1]}`.split(':')[1]} WIB</h5>
                      <input
                        type="Submit"
                        value="See Result"
                        onClick={() => handleOpenHistory(appointment.appointmentId, appointment.session, appointment.doctor, appointment.hospital)}
                        disabled={!appointment.status}
                        className={`btn text-white text-center mb-4 sm:w-auto sm:mb-0
                        ${!appointment.status ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'}`}
                        style={{ padding: '10px 25px' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16">
                  <EmptyTable />
                </div>
              )}
            </div></>
        )};
      </div>
  );
};

export default AppointmentHistoryPage
