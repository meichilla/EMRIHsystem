'use client'
import { ChangeEvent, useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import EmptyTable from "./empty_table";
import { decrypt, encrypt } from "@/components/utils/crypto";
import axios from "axios";
import { isPasswordValid } from "@/public/common/hashedpassword";
import { CgSoftwareDownload } from "react-icons/cg";
import { FaRegSmileBeam } from "react-icons/fa";
import PatientImage from '@/public/images/patient.png';
import BloodImage from '@/public/images/blood.png';
import BloodPressureImage from '@/public/images/blood-pressure.png';
import HemoglobinImage from '@/public/images/hemoglobin1.jpg';
import HeartRateImage from '@/public/images/heart-rate.jpg';
import GlucoseLevelImage from '@/public/images/glucose-level.jpg';
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import EmptyTableData from "./empty_table_data";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Spinner from "@/public/common/spinner";
import { uploadFiles } from "@/components/utils/filestorage";

interface IllnessDiagnosis {
  code: string;
  name: string;
  treatment: string;
}

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
  appointmentId: number,
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

type Document = {
  appointmentid: number,
  filename: string,
  filesize: number,
  filetype: string,
  date: Date,
  fileUrl: string,
}

type FileWithPreview = {
  file: File;
  dataUrl: string;
};

const PatientPage: React.FC = () => {
  const [warningMessage, setWarningMessage] = useState('');
  const { hospital, doctorData, searchKeySession, emr, setSearchKeySession, setEMRData, setAuthData, appointmentHistory, patientAdditions, doctorPrescriptions, documents, soapNotes, noMR, dob, personalData, illnessDiagnosis} = useAuth();
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const [patientList, setPatientList] = useState<{
    pname: string,
    paddress: string,
    pdob: string,
    pid: number,
    pemail: string,
    ptel: string,
    session: string,
    sessionid: number,
    apponumber: number,
    appoid: number,
    status: boolean,
    walkin: boolean,
  }[]>([]);
  const [searchKey, setSearchKey] = useState('');
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [inputToken, setInputToken] = useState('');
  const [patientId, setPatientId] = useState(0);
  const [inputPassword, setInputPassword] = useState('');
  const [hashedPassword, setHashedPassword] = useState('');
  const [appoid, setAppoId] = useState(0);
  const [walkin, setWalkin] = useState(false);
  const [historyAppoid, setHistoryAppoId] = useState(0);
  const [historySession, setHistorySession] = useState('');
  const [historyDoctor, setHistoryDoctor] = useState('');
  const [historyHospital, setHistoryHospital] = useState('');
  const [loading, setLoading] = useState(false);
  const [getEMRError, setError] = useState(false);
  const [isMedRecReady, setMedRecReady] = useState(false); 
  const [isSubmitSOAP, setSubmitSOAP] = useState(false);  
  const [isOpenHistorySOAP, setOpenHistory] = useState(false);  
  const [isHeartRateLow, setIsHeartLow] = useState(false);
  const [isHeartRateNormal, setIHeartRateNormal] = useState(false);
  const [isHbLow, setIsHbLow] = useState(false);
  const [isHbNormal, setIsHbNormal] = useState(false);
  const [isBloodPressureNormal, setIsBloodPressureNormal] = useState(false);
  const [isBloodPressureLow, setIsBloodPressureLow] = useState(false);
  const [isGlucoseLow, setIsGlucoseLow] = useState(false);
  const [isGlucoseNormal, setIsGlucoseNormal] = useState(false);
  const [age, setAge] = useState('0 Tahun');

  const [bloodType, setBloodType] = useState<string>('');
  const [sistolik, setSistolik] = useState<string>('');
  const [diastolik, setDiastolik] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [glucoseLevel, setGlucoseLevel] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [subjective, setSubjective] = useState<string>('');
  const [assessment, setAssessment] = useState<string>('');
  const [planning, setPlanning] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [hemoglobin, setHemoglobin] = useState<string>('');
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(true);
  const [historyPrescriptions, setHistoryPrescriptions] = useState<Prescription[]>([]);
  const [historyDiagnose, setHistoryDiagnose] = useState<HistoryIllnessDiagnosis | null>(null);
  const [historyPersonalData, setHistoryPersonalData] = useState<PersonalData | null>(null);
  const [historySOAP, setHistorySOAP] = useState<SOAPNotes | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [newPrescription, setNewPrescription] = useState<Prescription>({
    appointmentId: appoid,
    isDoctorPrescription: true,
    medication: '',
    dosage: '',
    frequency: '',
    instructions: '',
  });
  const [illnessDiagnoses, setIllnessDiagnoses] = useState<IllnessDiagnosis | null>();
  const [newIllnessDiagnosis, setNewIllnessDiagnosis] = useState<IllnessDiagnosis>({
    code: '',
    name: '',
    treatment: '',
  });

  const handleNewIllnessDiagnosisChange = (field: keyof IllnessDiagnosis, value: string) => {
    setNewIllnessDiagnosis((prevIllnessDiagnosis) => ({
      ...prevIllnessDiagnosis,
      [field]: value,
    }));
  };

  const handleAddIllnessDiagnosis = () => {
    setIllnessDiagnoses(newIllnessDiagnosis);
    setNewIllnessDiagnosis({
      code: '',
      name: '',
      treatment: '',
    });
  };

  const handleRemoveDiagnoses = () => {
    setIllnessDiagnoses(null);
  };

  const handleNewPrescriptionChange = (field: keyof Prescription, value: string) => {
    setNewPrescription((prevPrescription) => ({
      ...prevPrescription,
      [field]: value,
    }));
    setIsAddButtonDisabled(!value.trim());
  };

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, newPrescription]);
    setNewPrescription({
      appointmentId: appoid,
      isDoctorPrescription: true,
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

  const [latestUpdate, setLatestUpdate] = useState<{
    id: number,
    date: string,
    time: string,
    changedBy: string,
    hospital: string,
  }>();  
  const [documentData, setDocumentData] = useState<Document[]>([]);

  const handleSeeEMR = (appoid: number, walkin: boolean) => {
    // Show the dialog when "See EMR" is clicked
    setError(false);
    setAppoId(appoid);
    setWalkin(walkin);
    getToken();
  };

  const [filesWithPreviews, setFilesWithPreviews] = useState<FileWithPreview[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const filesArray = Array.from(fileList);
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFilesWithPreviews((prev) => [
          ...prev,
          { file, dataUrl: reader.result as string },
        ]);
      };
    });
  };

  const handleRemoveFile = (index: number) => {
    setFilesWithPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const submitFilesToStorage = async (filesWithPreviews: FileWithPreview[]): Promise<Document[]> => {
    try {
      const downloadURLs = await uploadFiles(noMR, appoid, filesWithPreviews);
      const documents = await Promise.all(
        filesWithPreviews.map(async ({ file }) => {
          const matchingDownload = downloadURLs.find((val) => val.filename === file.name);
      
          if (matchingDownload) {
            return {
              appointmentid: appoid,
              filename: file.name,
              filesize: file.size,
              filetype: file.type,
              date: new Date(),
              fileUrl: matchingDownload.fileUrl,
            };
          }
          return undefined;
        })
      );

      setDocumentData(documents.filter((doc) => doc !== undefined) as Document[])
      return documents.filter((doc) => doc !== undefined) as Document[];
    } catch (error) {
      console.error('Error submitting files:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setError(false);
    setLoading(false);
    setInputPassword('');;
    setInputToken('');
    setShowTokenDialog(false);
  };

  const handleCloseHistory = async () => {
    setHistoryAppoId(0)
    setHistorySession('')
    setHistoryDoctor('')
    setHistoryHospital('')
    setHistoryPersonalData(null);
    setHistoryDiagnose(null);
    setHistorySOAP(null);
    setHistoryPrescriptions([]);
    setSubmitSOAP(false);
    setOpenHistory(false);
  };

  const handleOpenHistory = async (appointmendId : number, session: string, doctor: string, hospital: string) => {
    setHistoryAppoId(appointmendId);
    setHistorySession(session)
    setHistoryDoctor(doctor)
    setHistoryHospital(hospital)
    const response = await axios.get(`http://localhost:3000/emr/latest-soap/${appointmendId}`)

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

    setSubmitSOAP(true);
    setOpenHistory(true);
  }

  useEffect(() => {

  }, [historyPersonalData, historyDiagnose, historySOAP, historyPrescriptions, historySession, historyAppoid, historyDoctor, historyHospital]);

  const handleSubmitToken = async () => {
    // Handle the token submission logic here
    setError(false);
    setLoading(true);
    const isPassValid = await isPasswordValid(inputPassword, hashedPassword);
    if (isPassValid) getEMR();
    else {
      console.log(isPassValid);
      setLoading(false);
      setError(true);
    }
  };

  const getEMR = async () => {
    try {
      const encryptedData = encrypt(JSON.stringify({
        appoid: appoid,
        docid: doctorData?.docid,
        token: inputToken,
        walkin: walkin,
      }));
      const response = await axios.post(`http://localhost:3000/emr/get-emr`, { data: encryptedData });
      const emr = decrypt(response.data);
      const resp = await JSON.parse(emr);
      const data = resp.emr;
      console.log('data emr:', data);
      if(data)
      {
        setPatientId(data.pid);
        console.log('id', data.pid);
        await fetchLatestUpdate(data.pid);
        let illness_Diagnosis : HistoryIllnessDiagnosis | null = data.medicalRecord.medicalRecord.illnessDiagnosis;
        if(!illness_Diagnosis) 
        {
          illness_Diagnosis = data.medicalRecord.medicalRecord.ilnessDiagnosis[0];
          console.log(illness_Diagnosis);
        }
        const illnessDiagnosis = {
          appointmentId: illness_Diagnosis?.appointmentId ?? 0,
          code: illness_Diagnosis?.code ?? '',
          date: illness_Diagnosis?.date ?? new Date(),
          doctor: illness_Diagnosis?.doctor ?? '',
          name: illness_Diagnosis?.name ?? '',
          treatment: illness_Diagnosis?.treatment ?? '',
        }
        await setAuthData(
          false,
          '',
          '',
          null,
          data.noMR,
          data.dob,
          data.medicalRecord.personalData,
          data.medicalRecord.documents,
          data.medicalRecord.appointmentHistory,
          illnessDiagnosis,
          data.medicalRecord.medicalRecord.soapNotes,
          data.medicalRecord.prescription.doctorPrescriptions,
          data.medicalRecord.prescription.patientAdditions,
          );
        
        setEMRData(emr);
        refreshPersonalData();
        setLoading(false);
        setShowTokenDialog(false);
        setInputToken('');
        setInputPassword('');
        setMedRecReady(true);
      }
    } catch (error) {
      console.error('Error during get session list:', error);
      setLoading(false);
      setError(true);
    }
  };
  const fetchData = async () => {
    try {
      const encryptedData = encrypt(JSON.stringify({
        docid: doctorData?.docid,
        hospitalid: hospital?.id
      }));
      const response = await axios.post(`http://localhost:3000/emr/my-patients`, { data: encryptedData });

      const resp = await JSON.parse(decrypt(response.data));
      setPatientList(resp.patients);
    } catch (error) {
      console.error('Error during get session list:', error);
    }
  };

  const calculateAge = () => {
    if (personalData?.dob) {
      const birthDate = new Date(personalData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // Check if birthday has occurred this year
      if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        setAge(`${age - 1} Tahun`); // Subtract 1 if birthday hasn't occurred yet
      } else {
        setAge(`${age} Tahun`);
      }
    } else {
      setAge('0 Tahun');
    }
  };

  const refreshData = async () => {
    if (searchKeySession && searchKeySession != '') setSearchKey(searchKeySession)
    setSearchKeySession('')
    await fetchData()
  }

  const getToken = async () => {
    try {
      const encryptedData = encrypt(JSON.stringify({
        appoid: appoid,
        walkin: walkin,
        docid: doctorData?.docid
      }));
      const response = await axios.post(`http://localhost:3000/emr/get-token`, { data: encryptedData });

      const resp = await JSON.parse(decrypt(response.data));
      const data = resp.results;
      if(data.token)
      {
        setInputToken(data.token);
        setHashedPassword(data.password);
        setShowTokenDialog(true);
        console.log('hashedpassword', hashedPassword);
      }
    } catch (error) {
      console.error('Error during get session list:', error);
      setLoading(false);
    }
  };
  
  const fetchLatestUpdate = async (patientId: number) => {
    try {
      console.log(patientId)
      console.log(walkin)
      const response = await axios.get(`http://localhost:3000/emr/doctor/latest-update/${patientId}/${walkin}`)

      const data = await JSON.parse(decrypt(response.data));
      console.log('latest update', data);
      setLatestUpdate(data);
      setIsBloodPressureNormal(true);
      setIsHbLow(true);
      setIsHeartLow(true);
      setIsGlucoseLow(false);
    } catch (error) {
      console.error('Error during get notification:', error);
    }
  }

  const refreshPersonalData = async () => {
    setBloodType(personalData?.bloodType ?? '');
    setSistolik(personalData?.bloodPressure.split('/')[0] ?? '');
    setDiastolik(personalData?.bloodPressure.split('/')[1] ?? '');
    setGlucoseLevel(personalData?.glucoseLevel.split('-')[0] ?? '');
    setHeartRate(personalData?.heartRate ?? '');
    setHemoglobin(personalData?.hemoglobin ?? '' );
    setWeight(personalData?.weight.split('kg')[0] ?? '' );
    setHeight(personalData?.height.split('cm')[0] ?? '' );
  }

  useEffect(() => {
    refreshData()
    if(!isSubmitSOAP)
    {
      console.log('refresh data')
      refreshPersonalData();
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
    calculateAge();
  }, [dob, personalData, emr, latestUpdate, appointmentHistory, illnessDiagnosis, soapNotes]);
illnessDiagnosis
  const filterPatients = () => {
    return patientList.filter(patient => {
      const title = searchKey === '' || patient.session === searchKey;
      const nameCondition = searchKey === '' || patient.pname.toLowerCase().includes(searchKey.toLowerCase());
      return title || nameCondition;
    });
  };

  const handleInputChangeHb = (hb: string) => {
    // Use a regular expression to allow only numbers and dot
    const isValidInput = /^[\d.]*$/.test(hb);
    if (isValidInput) {
      setHemoglobin(hb);
    }
  };

  const handleSubmitSOAP = async () => {
    try {
      setIsLoadingSubmit(true);
      const documents = await submitFilesToStorage(filesWithPreviews);
      console.log(documents);
      const personalDetails = {
        id: patientId,
        fullName: personalData?.fullName,
        dob: personalData?.dob,
        gender: personalData?.gender,
        address: personalData?.address,
        phoneNumber: personalData?.phoneNumber,
        email: personalData?.email,
        bloodType: personalData?.bloodType,
        bloodPressure: `${sistolik}/${diastolik}`,
        heartRate: heartRate,
        glucoseLevel: glucoseLevel,
        hemoglobin: hemoglobin,
        weight: weight,
        height: height,
      }
      
      const encryptedData = encrypt(JSON.stringify({
        previousEmr: emr,
        walkin: walkin,
        pid: patientId,
        appointmentId: appoid,
        doctorId: doctorData?.docid,
        personalData: personalDetails,
        illnessDiagnosis: illnessDiagnoses,
        soapNotes: {
          subjective: subjective,
          objective: objective,
          assessment: assessment,
          plan: planning,
          appointmentid: appoid,
        },
        doctorPrescriptions: prescriptions,
        documents: documents,
      }));
      console.log({
        previousEmr: emr,
        walkin: walkin,
        pid: patientId,
        appointmentId: appoid,
        doctorId: doctorData?.docid,
        personalData: personalDetails,
        illnessDiagnosis: illnessDiagnoses,
        soapNotes: {
          subjective: subjective,
          objective: objective,
          assessment: assessment,
          plan: planning,
          appointmentid: appoid,
        },
        doctorPrescriptions: prescriptions,
        documents: documents,
      })
      
      setIsLoadingSubmit(false);
      const response = await axios.post('http://localhost:3000/emr/soap', { data: encryptedData });
      if (response.data == 'No authorization')
      {
        setWarningMessage('You are not authorized to perform this action');

        // Optionally, clear the warning message after a certain time
        setTimeout(() => {
          setWarningMessage('');
        }, 7000);
      }
      else
      {
        await getEMR();
        await fetchData();
        setWalkin(false);
        setSubjective('');
        setObjective('');
        setPlanning('');
        setAssessment('');
        setPrescriptions([]);
        setFilesWithPreviews([]);
        setIllnessDiagnoses(null);
        setIsLoadingSubmit(false);
        setSubmitSOAP(false);
        setMedRecReady(false);
      }
    } catch (error) {
      setIsLoadingSubmit(false);
    }
    
  };

  const isSubmitSoapDisabled = !weight || !height || !sistolik || !diastolik || !heartRate || !glucoseLevel || !hemoglobin || !subjective || !objective || !planning || !assessment || !illnessDiagnoses

  return (
      <div className="flex min-h-screen">
        <Menu/>
        {isMedRecReady ? (
          <>
          {isSubmitSOAP ? (
            <>
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

                {/* First Section: Health Measurements */}
                <div className="bg-white rounded p-16 mt-4"
                  style={{
                    overflow: 'auto',
                    maxHeight: '850px',
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
                    <div className="mb-4 rounded rounded-[10px] border-gray-600 border w-2/3 bg-white shadow-lg p-4">
                      <div className="mr-4 w-full">
                        <label className="block text-gray-700">S</label>
                        <textarea name="subjective" disabled={true} value={historySOAP.subjective} className="border rounded px-3 py-2 mt-1 mr-2 w-full" />
                      </div>
                      <div className="mr-4 w-full">
                        <label className="block text-gray-700">O</label>
                        <textarea name="objective" disabled={true} value={historySOAP.objective} className="border rounded px-3 py-2 mt-1 mr-2 w-full" />
                      </div>
                      <div className="mr-4 w-full">
                        <label className="block text-gray-700">A</label>
                        <textarea name="assessment" disabled={true} value={historySOAP.assessment} className="border rounded px-3 py-2 mt-1 mr-2 h-auto w-full" />
                      </div>
                      <div className="mr-4 w-full">
                        <label className="block text-gray-700">P</label>
                        <textarea name="planning" disabled={true} value={historySOAP.plan} className="border rounded px-3 py-2 mt-1 mr-2 w-full" />
                      </div>
                      <div className="mr-4 w-full">
                        <label className="block text-gray-700">Date</label>
                        <p>{`${historySOAP.timestamp}`.split('T')[0]} {`${`${historySOAP.timestamp}`.split('T')[1]}`.split(':')[0]}:{`${`${historySOAP.timestamp}`.split('T')[1]}`.split(':')[1]}</p>
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
                  <h4 className="h4 mb-8 text-gray-800">Document</h4>
                    <div className="mt-4">
                      {documents.map((doc, index) => (
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
                </div>
              </div>
            </div>
          </>
            ) : (
              <>
            <div className="flex mx-auto min-h-screen w-full py-4 bg-[#030e33]">
            {warningMessage && (
              <div style={{ color: 'red', marginTop: '10px' }}>
                {warningMessage}
              </div>
            )}
            {isLoadingSubmit && 
            <div className="absolute h-full w-2/3 ml-40 mt-40 pt-96 items-center"> 
              <Spinner/>
            </div>
            }
              <IoArrowBackCircleOutline 
                onClick={() => setSubmitSOAP(false)}
                className="bg-white ml-4 w-12 h-10 rounded-full hover:cursor-pointer"
              />
              <div className="flex flex-col ml-8 mr-16">
                <h3 className="h3 text-white">S O A P - {personalData?.fullName}.</h3>
                <h5 className="h5 py-2 text-white">No Rekam Medis: {noMR}</h5>

                {/* First Section: Health Measurements */}
                <div className="bg-white rounded p-8 mt-4"
                  style={{
                    overflow: 'auto',
                    maxHeight: '1200px',
                  }}
                >
                <h4 className="h4 mb-8 text-gray-800">VITAL SIGN</h4>

                  <div className="grid grid-cols-4 text-[24px]">
                    <div className="flex flex-col w-2/3 mr-4">
                      <label className="block text-gray-700">Weight:</label>
                      <div className="flex items-center mt-1">
                        <input onChange={(e) => setWeight(e.target.value)} type="number" name="weight" value={weight} className="border rounded px-3 py-2 mt-1 w-36 mr-2" />
                        <span className="text-gray-500">kg</span>
                      </div>
                    </div>

                    <div className="flex flex-col w-2/3 mr-4">
                      <label className="block text-gray-700">Height:</label>
                      <div className="flex items-center mt-1">
                        <input onChange={(e) => setHeight(e.target.value)} type="number" name="height" value={height} className="border rounded px-3 py-2 mt-1 w-36 mr-2" />
                        <span className="text-gray-500">cm</span>
                      </div>
                    </div>

                    <div className="flex flex-col w-2/3 mr-4">
                      <label className="block text-gray-700">Heart Rate:</label>
                      <div className="flex items-center mt-1">
                        <input onChange={(e) => setHeartRate(e.target.value)} type="number" name="heartRate" value={heartRate} className="border rounded px-3 py-2 mt-1 w-36 mr-2" />
                        <span className="text-gray-500">bpm</span>
                      </div>
                    </div>

                    <div className="flex flex-col w-2/3">
                      <label className="block text-gray-700">Blood Pressure:</label>
                      <div className="flex items-center mt-1">
                          <input  onChange={(e) => setSistolik(e.target.value)} type="number" name="sistolik" value={sistolik} className="border rounded px-3 py-2 mr-2 w-36" />
                          <span className="text-[24px]">/</span>
                          <input onChange={(e) => setDiastolik(e.target.value)} type="number" name="diastolik" value={diastolik} className="border rounded px-3 py-2 ml-3 mr-2 w-36" />
                          <span className="text-gray-500">mmHg</span>
                        </div>
                    </div>

                    <div className="flex flex-col w-2/3 mr-4 mt-8">
                      <label className="block text-gray-700">Hemoglobin:</label>
                      <div className="flex items-center mt-1">
                        <input onChange={(e) => handleInputChangeHb(e.target.value)} type="number" name="hemoglobin" value={hemoglobin} className="border rounded px-3 py-2 mt-1 mr-2 w-36" />
                        <span className="text-gray-500">g/dl</span>
                      </div>
                    </div>

                    <div className="flex flex-col w-2/3 mt-8">
                      <label className="block text-gray-700">Glucose Level:</label>
                      <div className="flex items-center mt-1">
                        <input onChange={(e) => setGlucoseLevel(e.target.value)} type="number" name="glucoseLevel" value={glucoseLevel} className="border rounded px-3 py-2 mt-1 mr-2 w-36" />
                      </div>
                    </div>
                  </div>

                  <h4 className="h4 mt-12 mb-8 text-gray-800">ILLNESS DIAGNOSIS</h4>
                  <div className="text-[24px]">
                    {illnessDiagnoses ? (
                      <div className="mb-4">
                        <p>Code: {illnessDiagnoses?.code}</p>
                        <p>Name: {illnessDiagnoses?.name}</p>
                        <p>Treatment: {illnessDiagnoses?.treatment}</p>
                        <button onClick={() => handleRemoveDiagnoses()} className="bg-red-500 text-white px-2 py-1 rounded">
                          Remove
                        </button>
                      </div>
                    ) :
                  (
                    <div>
                      <input
                        type="text"
                        value={newIllnessDiagnosis.code}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleNewIllnessDiagnosisChange('code', e.target.value)}
                        placeholder="ICD-10"
                        className="border rounded px-3 py-2 mr-2"
                      />
                      <input
                        type="text"
                        value={newIllnessDiagnosis.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleNewIllnessDiagnosisChange('name', e.target.value)}
                        placeholder="Name"
                        className="border rounded px-3 py-2 mr-2"
                      />
                      <input
                        type="text"
                        value={newIllnessDiagnosis.treatment}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleNewIllnessDiagnosisChange('treatment', e.target.value)}
                        placeholder="Treatment"
                        className="border rounded px-3 py-2 mr-2"
                      />
                      <button
                        onClick={handleAddIllnessDiagnosis}
                        className="bg-blue-900 text-white text-[18px] px-4 py-2 rounded"
                      >
                        Add Diagnosis
                      </button>
                    </div>
                  )}
                  </div>

                  <h4 className="h4 mt-12 mb-8 text-gray-800">SOAP</h4>
                  <div className="text-[24px]">
                    <div className="mr-4 w-full">
                      <label className="block text-gray-700">S<span className="text-red-600">*</span></label>
                      <textarea onChange={(e) => setSubjective(e.target.value)} name="subjective" placeholder="Type here ..." value={subjective} className="border rounded px-3 py-2 mt-1 mr-2 w-2/3" />
                    </div>
                    <div className="mr-4 w-full">
                      <label className="block text-gray-700">O<span className="text-red-600">*</span></label>
                      <textarea onChange={(e) => setObjective(e.target.value)} name="objective" placeholder="Type here ..." value={objective} className="border rounded px-3 py-2 mt-1 mr-2 w-2/3" />
                    </div>
                    <div className="mr-4 w-full">
                      <label className="block text-gray-700">A<span className="text-red-600">*</span></label>
                      <textarea onChange={(e) => setAssessment(e.target.value)} name="assessment" placeholder="Type here ..." value={assessment} className="border rounded px-3 py-2 mt-1 mr-2 w-2/3" />
                    </div>
                    <div className="mr-4 w-full">
                      <label className="block text-gray-700">P<span className="text-red-600">*</span></label>
                      <textarea onChange={(e) => setPlanning(e.target.value)} name="planning" placeholder="Type here ..." value={planning} className="border rounded px-3 py-2 mt-1 mr-2 w-2/3" />
                    </div>
                  </div>

                  <h4 className="h4 mt-12 mb-8 text-gray-800">PRESCRIPTION</h4>
                  <div className="text-[24px]">
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
                    <div>
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
                      <button onClick={handleAddPrescription} disabled={isAddButtonDisabled} className="mb-16 bg-blue-900 text-white text-[18px] px-4 py-2 rounded">
                        Add Prescription
                      </button>
                    </div>

                    {/* File Upload Section */}
                    <h4 className="h4 mb-8 text-gray-800">Document</h4>
                    <div className="mt-4">
                      {filesWithPreviews.map((fileWithPreview, index) => (
                        <div className="flex items-center mt-4 max-w-4xl" key={index}>
                          {fileWithPreview.file.type === 'application/pdf' ? (
                            <iframe
                              src={fileWithPreview.dataUrl}
                              frameBorder="0"
                              scrolling="no"
                              width="100%"
                              height="500px"
                            ></iframe>
                          ) : (
                            <img src={fileWithPreview.dataUrl} alt={fileWithPreview.file.name} style={{ width: '100px' }} />
                          )}
                          <h4 className="ml-4">{fileWithPreview.file.name}</h4>
                          <button className="m-4 bg-blue-900 rounded text-white p-2" type="button" onClick={() => handleRemoveFile(index)}>Remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
                      <div className="border p-4 rounded border-gray-600 w-2/3">
                        <input type="file" multiple onChange={handleFileChange} />
                      </div>
                    </div>


                    <div className="my-8">
                      <button onClick={handleSubmitSOAP} disabled={isLoadingSubmit || isSubmitSoapDisabled} className={`w-auto bg-blue-900 text-white text-[24px] px-4 py-2 rounded
                      ${isLoadingSubmit || isSubmitSoapDisabled ? 'bg-gray-500' : '' }`}>
                        Submit SOAP
                      </button>
                    </div>
                  </div>
                </div>
            
              {/* <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Submit</button> */}
              </div>
            </div>
          </>
            )};
            </>
          ) : (
            <div className="mx-auto min-h-screen w-full py-4 bg-[#030e33]">
            <button>
              <IoArrowBackCircleOutline 
              onClick={() => setMedRecReady(false)}
              className="bg-white ml-4 w-12 h-10 rounded-full"/>
            </button>
            <div className="grid grid-cols-2 max-w-8xl mx-8">  
              <div className="col-span-1 row-span-1 rounded ml-4">
                <h3 className="h3 px-8 text-white">EMR Data - {personalData?.fullName}.</h3>
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
                          {!latestUpdate?.hospital? (
                          <>
                          <h5 className="h5 font-semibold mt-4 text-[14px]">Updated By :</h5>
                          <h5 className="h5 font-semibold text-blue-500 text-[16px]">{latestUpdate?.changedBy}</h5></>
                          ) :(
                          <><h5 className="h5 font-semibold mt-2 text-[14px]">Hospital :</h5>
                          <h5 className="h5 font-semibold text-blue-500 text-[16px]">{latestUpdate?.hospital}</h5>
                          <h5 className="h5 font-semibold mt-2 text-[14px]">Doctor :</h5>
                          <h5 className="h5 font-semibold text-blue-500 text-[16px]">Dr. {latestUpdate?.changedBy}</h5></>
                          )}
                        </div>
                  </div>
                  <div className="grid grid-cols-2 ml-8">
                    <div className="col-span-1 row-span-1 mt-5 border px-5 py-4 mr-4 bg-white rounded-[10px]">
                        <div>
                          <h5 className="h5 font-semibold">Illness Diagnosis</h5>
                          <div className="grid grid-cols-2 grid-rows-2 mt-2">
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
                                {illnessDiagnosis?.name ? (
                                  <h5 className="h5 font-semibold text-blue-500 mr-2">{`${illnessDiagnosis?.date}`.split('T')[0]}</h5>
                                ): (
                                  <h5 className="h5 font-semibold text-blue-500 mr-2">{''}</h5>
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
                    <div className="col-span-1 row-span-1 mt-5 border px-5 py-4 mr-4 bg-white rounded-[10px]">
                      <div>
                        <h5 className="h5 font-semibold mb-1">Documents</h5>
                        {documents.length > 0 ? (
                          <div className="grid grid-cols-2">
                            {documents
                            .map((doc, index) => (
                              <div key={index} className="mt-2 mr-4 px-2 py-1 border rounded-[8px]">
                                <h5 className="text-blue-500 font-semibold text-[12px]">{doc.filename}</h5>
                                <h5 className="text-left font-semibold text-gray-400 text-[10px]">{doc.filetype} </h5>
                                <CgSoftwareDownload className="h-4 w-5 ml-28 hover:cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                          ) : 
                            (
                              <>
                                <EmptyTableData />
                              </>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div> 
              <div className="col-span-1 row-span-1 mx-8">
                <div className="grid grid-cols-2 h-full">
                  <div className="col-span-1 row-span-1 border p-5 bg-white rounded-[8px]">
                    <div className="text-center border-b pb-6 px-24 border-blue-900">
                      <img
                        src={PatientImage.src}
                        className="w-auto h-40 rounded-full border border-[8px] border-blue-900 p-2 shadow-lg"
                      />
                      <h4 className="h4 mt-4 font-semibold">{personalData?.fullName}</h4>
                    </div>
                    <div className="grid grid-cols-1 grid-rows-2 pt-4 text-center">
                      <div className="col-span-1 row-span-1 mt-2">
                        <p>Gender: </p>
                        <h5 className="h5 font-semibold text-blue-500">{personalData?.gender}</h5>
                      </div>
                      <div className="col-span-1 row-span-1 mt-6">
                        <p>Height: </p>
                        <h5 className="h5 font-semibold text-blue-500">{personalData?.height}</h5>
                      </div>
                      <div className="col-span-1 row-span-1 mt-6">
                        <p>Age: </p>
                        <h5 className="h5 font-semibold text-blue-500">{age}</h5>
                      </div>
                      <div className="col-span-1 row-span-1 mt-6">
                        <p>Weight: </p>
                        <h5 className="h5 font-semibold text-blue-500">{personalData?.weight}</h5>
                      </div>
                      <div className="col-span-1 row-span-1 mt-6">
                        <p>DOB: </p>
                        <h5 className="h5 font-semibold text-blue-500">{personalData?.dob}</h5>
                      </div>
                    </div>
                    <div className="py-6 text-center">
                      <button 
                      onClick={() => setSubmitSOAP(true)}
                      className="btn-sm text-white rounded-[16px] text-[24px] mt-8 bg-blue-700 border-blue-900 hover:bg-blue-900">
                        Submit SOAP
                      </button>
                    </div>
                  </div>
                  <div className="col-span-1 row-span-1 p-5 ml-8 bg-white rounded-[8px]">
                    <div>
                      <h4 className="h4 font-semibold text-center mb-4">Appointment History</h4>
                          <div>
                            {appointmentHistory.length > 0 ? (
                            <div className="mt-8 w-full justify-between">
                            {appointmentHistory
                            .map((appointment, index) => (
                              <div key={index} className="mt-2 mr-4 px-2 py-1 border border-blue-900 rounded-[8px]">
                                <h5 className="text-blue-500 font-semibold text-[24px]">{appointment.session ?? 'Facial Charcoal'}</h5>
                                <h5 className="font-semibold mt-2 text-[14px]">{appointment.hospital} - Dr.{appointment.doctor}</h5>
                                <h5 className="font-semibold mt-2 text-[14px]">{`${`${appointment.timestamp}`.split('T')[0]}`}</h5>
                                <IoMdArrowDropdown 
                                onClick={() => handleOpenHistory(appointment.appointmentId, appointment.session, appointment.doctor, appointment.hospital)}
                                className="h-8 w-8 hover:cursor-pointer"/>
                                <div>

                                </div>
                              </div>
                            ))}
                            </div>
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
          </>
        ): (
          <><h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
            {currentDayAndDate}
          </h5><div className="border-l border max-w-8xl mx-auto min-h-screen w-full">
              <h4 className="h4 mt-5 ml-24 ">Patient List ({filterPatients().length})</h4>

              <form className="ml-24 flex mt-8">
                <input
                  type="search"
                  name="search"
                  className="input-text"
                  placeholder="Search Patient by Patient Name or Session Title"
                  list="patients"
                  onChange={(e) => setSearchKey(e.target.value)}
                  style={{ width: '65%' }} />
                <datalist id="patients">{/* Fetch and render doctor options dynamically */}</datalist>
              </form>
            </div><div className="max-w-4xl mx-auto h-full w-full ml-96 mt-36 absolute pr-16 pb-6"
              style={{
                overflow: 'auto',
                maxHeight: '800px',
              }}
            >
              {filterPatients().length > 0 ? (
                <div className="mt-5 items-center">
                  {filterPatients()
                    .map((patient, index) => (
                      <div className="w-full border mr-40 mt-5"
                        key={index}
                        style={{
                          background: 'white',
                          borderRadius: '20px',
                          padding: '30px',
                        }}
                      >
                        <h4 className="h4 py-2 text-blue-500 text-left font-semibold">{patient.pname}</h4>
                        <h5 className="h5 text-left font-semibold">{patient.pemail}</h5>
                        <h5 className="h5 text-right font-semibold">{patient.session}</h5>
                        <h5 className="h5 text-right font-semibold">apponum : {patient.apponumber}</h5>
                        <h5 className="h5 text-right font-semibold">book : {!patient.walkin ? 'Online' : 'Walk In'}</h5>
                        {patient.status && (
                          <h5 className="h5 text-left mb-2 text-green-600 font-semibold">SOAP SUBMITTED</h5>
                        )}
                        <button className="border btn-sm text-gray-100 bg-blue-500 hover:bg-blue-700"
                          onClick={() => handleSeeEMR(patient.appoid, patient.walkin)}
                        >
                          <span>See EMR</span>
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <>
                  <EmptyTable />
                </>
              )}
            </div>
                    {/* Token Dialog */}
        {showTokenDialog && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            {loading ? (
              <div className="absolute"> 
                <Spinner/>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-md">
              <label className="block mb-2 text-gray-800 font-semibold">Enter Token:</label>
              <input required
                type="password"
                value={inputToken}
                // onChange={(e) => setInputToken(e.target.value)}
                disabled={true}
                className="border rounded-md p-2 w-full mb-4"
              />
              <label className="block mb-2 text-gray-800 font-semibold">Enter Password:</label>
              <input required
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="border rounded-md p-2 w-full mb-4"
              />
               <button
                onClick={handleSubmitToken}
                className="bg-blue-500 text-white rounded-md px-4 py-2"
              >
                Submit
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-600 ml-8 underline"
              >
                Cancel
              </button>
              {getEMRError && <p className="mt-4 text-red-600 text-center">Invalid Password</p>}
            </div>
            )};
          </div>
        )}
            </>
        )}
        </div>
  );
};

export default PatientPage
