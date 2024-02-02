'use client'
import { ChangeEvent, useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import EmptyTable from "./empty_table";
import { encrypt } from "@/components/utils/crypto";
import axios from "axios";

interface Prescription {
  appointmentId: number;
  isDoctorPrescription: boolean;
  timestamp: Date;
  medication: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

const PrescriptionContent: React.FC = () => {
  const { personalData, patientData, appointmentHistory, illnessDiagnosis, soapNotes, documents, accessToken, doctorPrescriptions, patientAdditions, setNewPatientAdditions, noMR } = useAuth();
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const [warningMessage, setWarningMessage] = useState('');
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [newPrescription, setNewPrescription] = useState<Prescription>({
    appointmentId: 0,
    isDoctorPrescription: false,
    timestamp: new Date(),
    medication: '',
    dosage: '',
    frequency: '',
    instructions: '',
  });
  

  const handleNewPrescriptionChange = (field: keyof Prescription, value: string) => {
    setNewPrescription((prevPrescription) => ({
      ...prevPrescription,
      [field]: value,
    }));
    setIsAddButtonDisabled(!value.trim());
  };

  const handleAddPrescription = async () => {
    setPrescriptions([...prescriptions, newPrescription]);
    setNewPrescription({
      appointmentId: 0,
      isDoctorPrescription: false,
      timestamp: new Date(),
      medication: '',
      dosage: '',
      frequency: '',
      instructions: '',
    });
    setIsAddButtonDisabled(true);
  };

  const handleRemovePrescription = (index: number) => {
    const updatedPrescriptions = [...prescriptions];
    updatedPrescriptions.splice(index, 1);
    setPrescriptions(updatedPrescriptions);
  };

  const handleSubmitPrescription = async () => {
    setIsLoadingSubmit(true);

    const prescription_additions : Prescription[] = patientAdditions;
    prescriptions.map((prescription) => {
      prescription_additions.push(prescription)
    })

    try {
      const encryptedData = await encrypt(JSON.stringify({
          doctorId: 0,
          appointmentId: 0,
          changesField: 'prescription additions',
          medicalRecord: {
              noMR : noMR,
              personalData: personalData,
              medicalRecord: {
                  soapNotes: soapNotes,
                  illnessDiagnosis: illnessDiagnosis,
              },
              prescription: {
                  doctorPrescriptions: doctorPrescriptions,
                  patientAdditions: prescription_additions,
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
            setWarningMessage('You are not authorized to perform this action');
            setTimeout(() => {
              setWarningMessage('');
            }, 5000);
          }
          else
          {
            setPrescriptions([])
            setNewPatientAdditions(prescription_additions);
            setIsLoadingSubmit(false);
          }
    }catch (error) {
      console.error('Error during submit patient additions:', error);
    }
  };

  useEffect(() => {
    
  },[personalData, appointmentHistory, doctorPrescriptions])


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
  }, [personalData]);

  return (
      <div className="flex min-h-screen">
        <Menu/>
        <><h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
            {currentDayAndDate}
          </h5>
          <div className="max-w-7xl grid grid-cols-2">
            <div className="col-span-1 w-full mx-auto max-h-screen ml-16 border my-16 px-8 rounded-[20px]"
              style={{
                overflow: 'auto',
                maxHeight: '870px',
              }}
            >
              <h4 className="h4 mt-5">Doctor Prescriptions ({doctorPrescriptions.length})</h4>
              {doctorPrescriptions.length > 0 ? (
                <div className="mt-5 items-center">
                    {/* Group prescriptions by appointment session */}
                    {Array.from(new Set(doctorPrescriptions.map((prescription) => prescription.appointmentId))).map((appointmentId, index) => {
                    const prescriptionsForAppointment = doctorPrescriptions.filter((prescription) => prescription.appointmentId === appointmentId);
                    console.log(doctorPrescriptions);
                    console.log(prescriptionsForAppointment);
                    const appointment = appointmentHistory.find((appointment) => appointment.appointmentId === appointmentId);
                    console.log(appointment)

                    return (
                        <><h4 className="h4 pt-2 text-blue-500 text-left font-semibold my-4">{appointment?.session ?? 'Facial Charcoal'} at {appointment?.hospital} ({prescriptionsForAppointment.length})</h4><div
                            key={index}
                            className="w-full border border-blue-900"
                            style={{
                                background: 'white',
                                borderRadius: '10px',
                                padding: '20px',
                            }}
                        >
                            {prescriptionsForAppointment.map((prescription, index) => (
                                <div key={index} className="mt-2">
                                    <h5 className="h5 text-left font-semibold">{prescription.medication}</h5>
                                    <h5 className="h5 text-left">Dosage: {prescription.dosage}</h5>
                                    <h5 className="h5 text-left">Frequency: {prescription.frequency}</h5>
                                    <h5 className="h5 text-left">Instructions: {prescription.instructions}</h5>
                                </div>
                            ))}
                        </div></>
                    );
                    })}
                </div>
                ) : (
                <div className="py-16">
                    <EmptyTable />
                </div>
                )}
            </div>
            <div className="col-span-1 mx-auto max-h-screen w-full ml-32 rounded-[20px] border my-16 px-8"
              style={{
                overflow: 'auto',
                maxHeight: '870px',
              }}
            >
              <h4 className="h4 my-5">Patient Additions ({patientAdditions.length})</h4>
              <div className="text-[24px]">
              {patientAdditions.length > 0 ? (
                <>
                {patientAdditions.map((prescription, index) => (
                  <div key={index} className="mb-4">
                    <p>Medication: {prescription.medication}</p>
                    <p>Dosage: {prescription.dosage}</p>
                    <p>Frequency: {prescription.frequency}</p>
                    <p>Instructions: {prescription.instructions}</p>
                  </div>
                ))}
                </>
                ) : (
                  <EmptyTable />
                )}
                <h4 className="h4 my-5 border-t pt-8 border-blue-900">Add new additions</h4>

                {prescriptions.map((prescription, index) => (
                  <div key={index} className="mb-4">
                    <p>Medication: {prescription.medication}</p>
                    <p>Dosage: {prescription.dosage}</p>
                    <p>Frequency: {prescription.frequency}</p>
                    <p>Instructions: {prescription.instructions}</p>
                    <button onClick={() => handleRemovePrescription(index)} className="bg-red-500 text-white px-2 py-1 rounded">
                      Remove
                    </button>
                  </div>
                ))}

                <div className="mt-4 grid grid-rows-4">
                  <input
                    type="text"
                    value={newPrescription.medication}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleNewPrescriptionChange('medication', e.target.value)}
                    placeholder="Medication"
                    className="border rounded px-3 py-2 mr-2"
                  />
                  <input
                    type="text"
                    value={newPrescription.dosage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleNewPrescriptionChange('dosage', e.target.value)}
                    placeholder="Dosage"
                    className="border rounded px-3 py-2 mr-2"
                  />
                  <input
                    type="text"
                    value={newPrescription.frequency}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleNewPrescriptionChange('frequency', e.target.value)}
                    placeholder="Frequency"
                    className="border rounded px-3 py-2 mr-2"
                  />
                  <input
                    type="text"
                    value={newPrescription.instructions}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleNewPrescriptionChange('instructions', e.target.value)}
                    placeholder="Instructions"
                    className="border rounded px-3 py-2 mr-2"
                  />
                  <button onClick={handleAddPrescription} disabled={isAddButtonDisabled} className={`mt-2 mb-5 bg-blue-900 text-white text-[16px] px-1 py-2 rounded
                  ${isAddButtonDisabled && 'bg-gray-400'}
                  `}>
                    Add Prescription
                  </button>
                </div>
                <div>
                      <button onClick={handleSubmitPrescription} disabled={prescriptions.length === 0} className={`w-auto bg-blue-900 text-white text-[20px] px-4 py-2 mb-8 rounded
                      ${isLoadingSubmit || prescriptions.length === 0 ? 'bg-gray-500' : '' }`}>
                       Save Additional Prescriptions
                      </button>
                    </div>
              </div>
            </div>
          </div>
        </>
      </div>
  );
};

export default PrescriptionContent
