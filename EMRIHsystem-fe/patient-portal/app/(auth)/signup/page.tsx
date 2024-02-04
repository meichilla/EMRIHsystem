'use client'

import Link from 'next/link'
import { ChangeEvent, useState } from 'react';
import { AuthProvider } from '../AuthContext';
import LogoImage from '@/public/images/logo.png';
import { hashPassword } from '@/public/common/hashedpassword';
import axios from 'axios';
import { encrypt } from '@/components/utils/crypto';
import { uploadFileKTP, uploadFiles } from '@/components/utils/filestorage';

type Document = {
  pnic: string,
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

const SignUp = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState('');
  const [nic, setNic] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [pk, setPK] = useState('');
  const [gender, setGender] = useState('');
  const [patientExist, setPatientExist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isShowKtpOcr, setShowKtpOcr] = useState(false);
  const [isRegisteredSuccessfuly, setSuccessRegister] = useState(false);
  const [isRegisterFailed, setRegisterFailed] = useState(false);
  const [image, setImage] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [fileWithPreview, setFilesWithPreview] = useState<FileWithPreview | null>(null);

  const handleFileKTPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file)
    {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
      setFilesWithPreview(
        { file, dataUrl: reader.result as string },
      );
      };
    }
  };

  const [documentData, setDocumentData] = useState<Document | null>(null);
  const submitFileKTPToStorage = async (): Promise<string> => {
    try {
      
      if(fileWithPreview !== null)
      {
        const downloadURL = await uploadFileKTP(nic, fileWithPreview);
        return downloadURL;
      }
      return '';
    } catch (error) {
      console.error('Error submitting files:', error);
      throw error;
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
  
    if (file) {
      try {
        const base64String = await readFileAsBase64(file);
        setImage(base64String);
      } catch (error) {
        console.error('Error reading file as base64:', error);
        setImage('');
      }
    }
  };
  

// Function to read a file as a base64 string
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Invalid result type'));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

  const handleOCR = async () => {
    if (image) {
      try {

        const response = await axios.post('http://localhost:3000/ktp/ocr', { image }, {
          // maxContentLength: 10000000,
        });

        const data= response.data;
        const nama = data.name;
        const nik = data.nik
        const dob = data.dob
        if (response.data) {
          setResult(`${nama} ${nik} ${dob}`);
        } else {
          setResult('Error processing OCR');
        }
      } catch (error) {
        console.error(error);
        setResult('Error processing OCR');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    setRegisterFailed(false);
    setSuccessRegister(false);
    setLoading(true);
    const fullName = `${name} ${surname}`;
    // Check if the patient already exists
    const patientExists = await checkPatientExistence(nic);
    console.log("Patient Exists : ", patientExists);
    if (patientExists) {
      console.log('Patient already exists!');
      setLoading(false);
      return;
    }

    try {
      const downloadURL = await submitFileKTPToStorage();
      const normalizedNIC = nic.toLowerCase();
      const hashedPassword = await hashPassword(password);
      const encryptedData = encrypt(
        JSON.stringify({
        name: fullName,
        homeAddress: address,
        dob: dob,
        email: email,
        telephone: phoneNumber,
        password: hashedPassword,
        nic: normalizedNIC,
        walletAddress: walletAddress,
        pk: pk,
        gender: gender,
        urlKtp: downloadURL,
      }));
      const response = await axios.post('http://localhost:3000/patients/register', { data: encryptedData });
      const data = await response.data;
      if (data === 'Patient registered successfully')
      {
        setSuccessRegister(true);
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      setRegisterFailed(false);
      console.error('Error registering patient :', error);
    }
  };

    // Function to handle password and confirmPassword changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordMatch(true);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(true);
  };

  const checkPatientExistence = async (nic: string) => {  
    try {
      const normalizedNIC = nic.toLowerCase();
      const encryptedData = encrypt(JSON.stringify(normalizedNIC));

      const response = await axios.post('http://localhost:3000/patients/isRegistered', { data: encryptedData });
      const data = await response.data;
      setPatientExist(data);
      return data;
    } catch (error: any) {
      setLoading(false);
      setSuccessRegister(false);
      console.error('Check patient existence error:', error);
      throw new Error(`Failed to check patient existence: ${error.message}`);
    }
  };

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

  return (
    <AuthProvider>
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link href="/" className="flex items-center justify-center mt-16" aria-label="Cruip">
              <div className="flex items-center">
                <img
                  src={LogoImage.src}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <div className="mx-2">EMR-IH | </div>
                <div className="left-0 mt-1 text-sm text-blue-500">Patient Portal</div>
              </div>
            </Link>
          <div className="pt-16 pb-12 md:pt-8 md:pb-20">

            {/* Page header */}
            <div className="max-w-3xl mx-auto text-center pb-12 md:pb-8">
              {/* <h2 className="h2">Welcome, please register.</h2> */}
              <h6 className="h3">Create Your EMR-IH Account.</h6>
            </div>

            {/* Form */}
            {isShowKtpOcr ? (
            <div>
              <h1>KTP OCR Demo</h1>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <button onClick={handleOCR}>Process OCR</button>
              {result && <div>OCR Result: {result}</div>}
            </div>
            ) : (
              <form onSubmit={handleSubmit}>
              <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="name">Name <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="name" type="text" className="form-input w-full text-gray-800" placeholder="Enter your name" onChange={(e) => setName(e.target.value)}
                    value={name} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="surname">Surname <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="surname" type="text" className="form-input w-full text-gray-800" placeholder="Enter your surname" onChange={(e) => setSurname(e.target.value)}
                    value={surname} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="dob">Date of Birth <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="dob" type="date" className="form-input w-full text-gray-800" placeholder="Enter your dob" onChange={(e) => setDob(e.target.value)}
                    value={dob} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <label className="block text-gray-800 text-sm font-medium mb-1">Gender<span className="text-red-600">*</span></label>
                  <div className="flex items-center space-x-4 mt-2">
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
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="nic">NIC <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="nic" type="text" className="form-input w-full text-gray-800" placeholder="Enter your nic" onChange={(e) => setNic(e.target.value)}
                    value={nic} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="nic">ID Card <span className="text-red-600">*</span></label>
                    <div className="border p-4 rounded border-gray-300 items-center flex">
                      <input type="file" onChange={handleFileKTPChange} />
                      <img src={fileWithPreview?.dataUrl} alt={fileWithPreview?.file.name} style={{ width: '300px' }} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="phoneNumber">Phone Number <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="phoneNumber" type="text" className="form-input w-full text-gray-800" placeholder="Enter your phone number" 
                    onChange={(e) => handleInputChangePhoneNumber(e)}
                    value={phoneNumber} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="address">Address <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="address" type="text" className="form-input w-full text-gray-800" placeholder="Enter your address" onChange={(e) => setAddress(e.target.value)}
                    value={address} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">Email <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="email" type="email" className="form-input w-full text-gray-800" placeholder="Enter your email address" onChange={(e) => setEmail(e.target.value)}
                    value={email} required />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="walletAddress">Wallet Address <span className="text-red-600">*</span></label>
                  <input disabled={loading} id="walletAddress" type="password" className="form-input w-full text-gray-800" placeholder="Enter your ether wallet address" onChange={(e) => setWalletAddress(e.target.value)} 
                  value={walletAddress} required />
                </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="pk">Private Key<span className="text-red-600">*</span></label>
                  <input disabled={loading} id="pk" type="password" className="form-input w-full text-gray-800" placeholder="Enter your privateKey" onChange={(e) => setPK(e.target.value)} 
                  value={pk} required />
                </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="password">Password <span className="text-red-600">*</span></label>
                  <input disabled={loading} id="password" type="password" className="form-input w-full text-gray-800" placeholder="Enter your password" onChange={handlePasswordChange} required />
                </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="confirmPassword">Confirm Password <span className="text-red-600">*</span></label>
                    <input disabled={loading} id="confirmPassword" type="password" className="form-input w-full text-gray-800" placeholder="Enter your confirm password" onChange={handleConfirmPasswordChange} required />
                    {!passwordMatch && <p className="text-red-600">Passwords do not match</p>}
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mt-6">
                <div className="w-full px-3">
                  <button className="btn text-white bg-blue-600 hover:bg-blue-700 w-full" disabled={loading}>
                    {loading ? 'Signing up...' : 'Sign up'}
                  </button>
                  {patientExist && <p className="text-red-600 text-center py-4">Patient is already registered</p>}
                  {isRegisteredSuccessfuly && <p className="text-blue-600 text-center py-4">Patient registered successfully! Please Sign In</p>}
                  {isRegisterFailed && <p className="text-red-600 text-center py-4">Register patient failed, please try again.</p>}
                </div>
              </div>
                <div className="text-sm text-gray-500 text-center mt-3">
                  By creating an account, you agree to the <a className="underline" href="#0">terms & conditions</a>, and our <a className="underline" href="#0">privacy policy</a>.
                </div>
              </form>
            )}
            <div className="max-w-sm mx-auto">
              
              <div className="text-gray-600 text-center mt-6">
                Already have an account? <Link href="/signin" className="text-blue-600 hover:underline transition duration-150 ease-in-out">Sign in</Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </AuthProvider>
  )
}

export default SignUp