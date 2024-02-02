import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { JwtService } from 'src/api/jwt/services/jwt.service';
import { Patient } from 'src/entities/patient/patient.entity';
import { User } from 'src/entities/user/user.entity';
import Web3 from 'web3';
import { v4 as uuidv4 } from 'uuid';
import { LogChanges } from 'src/entities/logchanges/logchanges.entity';
import { LogHistory } from 'src/entities/loghistory/loghistory.entity';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { decrypt, encrypt } from 'src/common/utils/crypto';
import { DoctorAssociationService } from './doctorassociation.service';
import { HospitalService } from 'src/api/hospital/services/hospital.service';
import { NotificationService } from 'src/api/notifications/services/notification.service';
import { AppointmentService } from 'src/api/appointment/services/appointment.service';
import { ScheduleService } from 'src/api/schedule/services/schedule.service';
import { Walkinpatient } from 'src/entities/walkinpatient/walkinpatient.entity';
import { Appointment } from 'src/entities/appointment/appointment.entity';

dotenv.config();

interface SoapNote {
  timestamp: Date;
  doctor: string;
  hospital: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  appointmentId: number;
}

interface IllnessDiagnosis {
  code: string;
  name: string;
  date: Date;
  doctor: string;
  treatment: string;
  appointmentId: number;
}

interface Prescription {
  appointmentId: number;
  isDoctorPrescription: boolean;
  timestamp: Date;
  medication: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

interface Document {
  name: string;
  timestamp: Date;
  documentType: string;
  description: string;
  appointmentId: number;
  url: string;
}

interface AppointmentHistory {
  session: string;
  appointmentId: number;
  timestamp: Date;
  doctor: string;
  hospital: string;
  status: string;
}

@Injectable()
export class PatientEMRService {
  private web3: any;
  private contract: any;

  private ganacheEndpoint: string;
  private privateKey: string;
  private contractAddress: string;
  private defaultAccount: string;
  private readonly contractAbi: any[] = [];

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: EntityRepository<Patient>,
    @InjectRepository(Walkinpatient)
    private readonly walkinPatientRepository: EntityRepository<Walkinpatient>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: EntityRepository<Doctor>,
    @InjectRepository(LogChanges)
    private readonly logChangesRepository: EntityRepository<LogChanges>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: EntityRepository<Appointment>,
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService,
    private readonly hospitalService: HospitalService,
    private readonly doctorAssociationService: DoctorAssociationService,
    private readonly notificationService: NotificationService,
    private readonly appointmentService: AppointmentService,
    private readonly scheduleService: ScheduleService,
  ) {
    this.ganacheEndpoint = process.env.GANACHE_ENDPOINT;
    this.contractAddress = process.env.CONTRACT_ADDRESS_PATIENTEMR;
    this.defaultAccount = process.env.DEFAULT_ACCOUNT_ADDRESS;
    this.privateKey = process.env.PRIVATE_KEY_OWNER;
    this.web3 = new Web3(this.ganacheEndpoint);
    // Read the ABI from the external file
    const abiFilePath = process.env.ABI_FILE_PATH_PATIENTEMR;
    try {
      const abiFileContent = fs.readFileSync(abiFilePath, 'utf8');
      // Parse the ABI file as JSON
      const abiFile = JSON.parse(abiFileContent);

      this.contractAbi = abiFile.abi;

      this.contract = new this.web3.eth.Contract(
        this.contractAbi,
        this.contractAddress,
      );
    } catch (error) {
      console.error('Error reading or parsing ABI file:', error);
      throw new Error('Failed to initialize BlockchainService');
    }
  }

  async validateWalletAddress(walletAddress: string): Promise<void> {
    // Validate if the provided wallet address is a valid Ethereum address
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid wallet address');
    }
  }

  private async getContract(): Promise<any> {
    const contract = new this.web3.eth.Contract(
      this.contractAbi,
      this.contractAddress,
    );
    return contract;
  }

  private async getGasPrice(): Promise<string> {
    return this.web3.eth.getGasPrice();
  }

  private async signTransaction(
    transactionObject: any,
    privateKey: string,
  ): Promise<any> {
    return this.web3.eth.accounts.signTransaction(
      transactionObject,
      privateKey,
    );
  }

  private async sendSignedTransaction(signedTransaction: string): Promise<any> {
    return this.web3.eth.sendSignedTransaction(signedTransaction);
  }

  private async getNonce(walletAddress: string): Promise<number> {
    return this.web3.eth.getTransactionCount(walletAddress, 'pending');
  }

  async registerPatient(decryptedData: string) {
    try {
      const dataDetails = JSON.parse(decryptedData);
      const name = dataDetails['name'];
      const homeAddress = dataDetails['homeAddress'];
      const dob = dataDetails['dob'];
      const email = dataDetails['email'];
      const telephone = dataDetails['telephone'];
      const password = dataDetails['password'];
      const nic = dataDetails['nic'];
      const walletAddress = dataDetails['walletAddress'];
      const pk = dataDetails['pk'];
      const gender = dataDetails['gender'];

      const checkPatientExistByNIC = await this.patientRepository.findOne({
        pnic: nic,
      });
      if (checkPatientExistByNIC) return new Error('NIC is already registered');

      const checkEmailExist = await this.userRepository.findOne({
        email: email,
      });
      if (checkEmailExist) return new Error('Email is already registered');

      const checkWalkinPatientExistByNIC =
        await this.walkinPatientRepository.findOne({
          pnic: nic,
        });

      console.log(checkWalkinPatientExistByNIC);
      if (checkWalkinPatientExistByNIC) {
        const pdob = checkWalkinPatientExistByNIC.pdob
          .toISOString()
          .split('T')[0];
        const dobMatch = pdob === dob;
        const nameMatch = checkWalkinPatientExistByNIC.pname === name;
        console.log(dobMatch);
        console.log(nameMatch);

        if (!dobMatch || !nameMatch)
          return new Error('NIC is already registered');
      }

      // Validate if the provided wallet address is a valid Ethereum address
      await this.validateWalletAddress(walletAddress);

      // Dynamically calculate gas price
      const contract = await this.getContract();
      const gasPrice = await this.getGasPrice();
      const nonce = await this.getNonce(walletAddress);
      const token = await this.generateToken(email);

      const checkEMRExist = await this.isEMRDataExist(nic, dob);
      console.log(checkEMRExist);

      let noMR;
      if (checkEMRExist.exists) {
        noMR = checkEMRExist.existingNoRekamMedis;
      } else {
        noMR = await this.generateNoRekamMedis();
      }

      console.log(noMR);

      const urlKTP = 'http://localhost:3002';

      const data = contract.methods
        .registerPatient(
          name,
          homeAddress,
          dob,
          email,
          telephone,
          password,
          nic,
          walletAddress,
          token,
          noMR,
          urlKTP,
        )
        .encodeABI();

      const transactionObject = {
        from: walletAddress,
        to: this.contractAddress,
        gas: '3000000',
        gasPrice: gasPrice,
        data: data,
        nonce: nonce,
      };

      console.log('transactionObject:', transactionObject);

      const signedTransaction = await this.signTransaction(
        transactionObject,
        pk,
      );

      console.log('Before sending transaction:', new Date());
      const result = await this.sendSignedTransaction(
        signedTransaction.rawTransaction,
      );
      console.log('After sending transaction:', new Date());

      if (result) {
        const patientData: Partial<Patient> = {
          pemail: email,
          pname: name,
          ppassword: password,
          pnic: nic,
          paddress: homeAddress,
          pdob: new Date(dob),
          ptel: telephone,
          pwa: walletAddress,
          token: token,
          url_ktp: `http:localhost:3002`,
          no_rm: noMR,
          pk: pk,
        };

        const userDetail: Partial<User> = {
          email: email,
          usertype: 'p',
        };

        const newPatient = this.entityManager.create(Patient, patientData);
        await this.entityManager.persistAndFlush(newPatient);

        const newUser = this.entityManager.create(User, userDetail);
        await this.entityManager.persistAndFlush(newUser);

        await this.logHistory(nic, 'Register Patient', name, 0);

        const medicalRecord = {
          noMR: noMR,
          personalData: {
            fullName: name,
            dob: dob,
            gender: gender,
            address: homeAddress,
            phoneNumber: telephone,
            email: email,
            bloodType: '',
            bloodPressure: '',
            heartRate: '',
            glucoseLevel: '',
            hemoglobin: '',
            weight: '',
            height: '',
          },
          medicalRecord: {
            soapNotes: [],
            illnessDiagnosis: {},
          },
          prescription: {
            doctorPrescriptions: [],
            patientAdditions: [],
          },
          appointmentHistory: [],
          documents: [],
        };

        if (!checkEMRExist.exists) {
          const medRec = JSON.stringify(medicalRecord, null, 1);
          await this.addEMR(nic, dob, noMR, medRec);
        }
      }

      return 'Patient registered successfully';
    } catch (error) {
      console.error('Error registering patient:', error);
      throw new Error(error.message);
    }
  }

  async addEMRNonRegisteredPatient(decryptedData: string) {
    try {
      const dataDetails = JSON.parse(decryptedData);
      const name = dataDetails['name'];
      const homeAddress = dataDetails['homeAddress'];
      const dob = dataDetails['dob'];
      const telephone = dataDetails['telephone'];
      const nic = dataDetails['nic'];
      const gender = dataDetails['gender'];
      const noMR = await this.generateNoRekamMedis();

      const medicalRecord = {
        noMR: noMR,
        personalData: {
          fullName: name,
          dob: dob,
          gender: gender,
          address: homeAddress,
          phoneNumber: telephone,
          email: '',
          bloodType: '',
          bloodPressure: '',
          heartRate: '',
          glucoseLevel: '',
          hemoglobin: '',
          weight: '',
          height: '',
        },
        medicalRecord: {
          soapNotes: [],
          illnessDiagnosis: {},
        },
        prescription: {
          doctorPrescriptions: [],
          patientAdditions: [],
        },
        appointmentHistory: [],
        documents: [],
      };

      const medRec = JSON.stringify(medicalRecord, null, 1);
      await this.addEMR(nic, dob, noMR, medRec);

      return 'Patient registered successfully';
    } catch (error) {
      console.error('Error registering patient:', error);
      throw new Error(error.message);
    }
  }

  async updatePatientData(
    nic: string,
    name: string,
    homeAddress: string,
    telephone: string,
    email: string,
    password: string,
  ) {
    try {
      const patient = await this.patientRepository.findOne({
        pnic: nic,
      });
      if (!patient) return new Error('Patient not found');

      // Dynamically calculate gas price
      const contract = await this.getContract();
      const gasPrice = await this.getGasPrice();
      const nonce = await this.getNonce(patient.pwa);

      const data = contract.methods
        .updatePatientData(
          nic,
          name,
          homeAddress,
          telephone,
          email,
          password,
          patient.pwa,
        )
        .encodeABI();

      const transactionObject = {
        from: patient.pwa,
        to: this.contractAddress,
        gas: '3000000',
        gasPrice: gasPrice,
        data: data,
        nonce: nonce,
      };

      console.log('transactionObject:', transactionObject);

      const signedTransaction = await this.signTransaction(
        transactionObject,
        patient.pk,
      );

      console.log('Before sending transaction:', new Date());
      const result = await this.sendSignedTransaction(
        signedTransaction.rawTransaction,
      );
      console.log('After sending transaction:', new Date());

      if (result) {
        const patientData: Partial<Patient> = {
          pemail: email,
          pname: name,
          ppassword: password,
          pnic: nic,
          paddress: homeAddress,
          pdob: new Date(patient.pdob),
          ptel: telephone,
          pwa: patient.pwa,
          token: patient.token,
          no_rm: patient.no_rm,
          url_ktp: `http:localhost:3002`,
          pk: patient.pk,
        };

        Object.assign(patient, patientData);

        if (email !== patient.pemail) {
          const user = await this.userRepository.findOne({
            email: patient.pemail,
          });
          const userDetail: Partial<User> = {
            email: email,
            usertype: 'p',
          };

          Object.assign(user, userDetail);
          await this.entityManager.persistAndFlush(user);
        }

        await this.entityManager.persistAndFlush(patient);
      }

      return {
        name: name,
        dob: patient.pdob,
        email: email,
        homeAddress: homeAddress,
        nic: nic,
        telephone: telephone,
        userType: 'p',
      };
    } catch (error) {
      console.error('Error update patient data:', error);
      throw new Error(error.message);
    }
  }

  async updateTokenPatient(patientId: number) {
    try {
      const patient = await this.patientRepository.findOne({
        pid: patientId,
      });
      if (!patient) return new Error('Patient not found');

      // Dynamically calculate gas price
      const contract = await this.getContract();
      const gasPrice = await this.getGasPrice();
      const nonce = await this.getNonce(patient.pwa);
      const token = `${await this.generateToken(patient.pnic)}`;

      const data = contract.methods
        .updatePatientToken(patient.pnic, token, patient.pwa)
        .encodeABI();

      const transactionObject = {
        from: patient.pwa,
        to: this.contractAddress,
        gas: '3000000',
        gasPrice: gasPrice,
        data: data,
        nonce: nonce,
      };

      console.log('transactionObject:', transactionObject);

      const signedTransaction = await this.signTransaction(
        transactionObject,
        patient.pk,
      );

      console.log('Before sending transaction:', new Date());
      const result = await this.sendSignedTransaction(
        signedTransaction.rawTransaction,
      );
      console.log('After sending transaction:', new Date());

      if (result) {
        const patientData: Partial<Patient> = {
          token: token,
        };

        Object.assign(patient, patientData);
        await this.entityManager.persistAndFlush(patient);
      }

      return 'token updated';
    } catch (error) {
      console.error('Error update patient data:', error);
      throw new Error(error.message);
    }
  }

  async getPatientDetails(nic: string) {
    try {
      const data = await this.contract.methods.getPatientDetails(nic).call();

      return {
        name: data.name,
        dob: data.dob,
        email: data.email,
        homeAddress: data.homeAddress,
        nic: data.nic,
        telephone: data.telephone,
        walletAddress: data.walletAddress,
      };
    } catch (error) {
      throw new Error(
        `Error checking patient existence by NIC: ${error.message}`,
      );
    }
  }

  async isNICAlreadyRegistered(decryptedData: string): Promise<boolean> {
    try {
      const nic = JSON.parse(decryptedData);
      const result = await this.contract.methods
        .isNICAlreadyRegistered(nic)
        .call();
      return result;
    } catch (error) {
      throw new Error(
        `Error checking patient existence by NIC: ${error.message}`,
      );
    }
  }

  async validateLoginCredentials(decryptedData: string, isFromEMR: boolean) {
    try {
      const dataDetails = JSON.parse(decryptedData);
      const email = dataDetails['email'];
      const password = dataDetails['password'];

      const patient = await this.patientRepository.findOne({
        $and: [{ pemail: email }, { ppassword: password }],
      });

      if (!patient) return new Error('Email is not registered');

      // Call the view function directly
      const result = await this.contract.methods
        .validateLogin(patient.pnic, password, patient.pwa)
        .call();

      console.log(result);
      const patientDetail = {
        id: patient.pid,
        name: result.patientData.name,
        dob: result.patientData.dob,
        email: result.patientData.email,
        homeAddress: result.patientData.homeAddress,
        nic: result.patientData.nic,
        telephone: result.patientData.telephone,
        walletAddress: result.patientData.walletAddress,
      };

      let patientData;
      if (isFromEMR) {
        await this.updateTokenPatient(patient.pid);
        const accessToken = this.jwtService.generateAccessToken(patient.pemail);
        const refreshToken = this.jwtService.generateRefreshToken(
          patient.pemail,
        );
        patientData = encrypt(
          JSON.stringify({
            patientDetail: patientDetail,
            accessToken: accessToken,
            refreshToken: refreshToken,
          }),
        );
      } else {
        patientData = encrypt(JSON.stringify(patientDetail));
      }
      await this.logHistory(patient.pnic, 'Auth Login', patient.pname, 0);

      return patientData;
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  async addEMR(
    patientNIC: string,
    dob: string,
    noMR: string,
    medicalRecord: string,
  ) {
    try {
      const patientExist = await this.patientRepository.findOne({
        pnic: patientNIC,
      });

      if (patientExist) {
        console.log('add emr patient exist', patientExist);
        const contract = await this.getContract();
        const gasPrice = await this.getGasPrice();
        const nonce = await this.getNonce(patientExist.pwa);

        const data = contract.methods
          .addEMRData(patientNIC, dob, noMR, medicalRecord, patientExist.pwa)
          .encodeABI();

        const transactionObject = {
          from: patientExist.pwa,
          to: this.contractAddress,
          gas: '3000000',
          gasPrice: gasPrice,
          data: data,
          nonce: nonce,
        };

        console.log('transactionObject:', transactionObject);

        const signedTransaction = await this.signTransaction(
          transactionObject,
          patientExist.pk,
        );

        console.log('Before sending transaction:', new Date());
        await this.sendSignedTransaction(signedTransaction.rawTransaction);
        console.log('After sending transaction:', new Date());

        await this.logHistory(patientNIC, 'Add EMR', patientExist.pname, 0);
        await this.logChanges(
          patientNIC,
          'Personal Data',
          patientExist.pname,
          '',
          0,
          `${medicalRecord}`,
          0,
        );
      } else {
        const contract = await this.getContract();
        const gasPrice = await this.getGasPrice();
        const nonce = await this.getNonce(this.defaultAccount);

        const data = contract.methods
          .addEMRData(patientNIC, dob, noMR, medicalRecord, '')
          .encodeABI();

        const transactionObject = {
          from: this.defaultAccount,
          to: this.contractAddress,
          gas: '3000000',
          gasPrice: gasPrice,
          data: data,
          nonce: nonce,
        };

        console.log('transactionObject:', transactionObject);

        const signedTransaction = await this.signTransaction(
          transactionObject,
          this.privateKey,
        );

        console.log('Before sending transaction:', new Date());
        await this.sendSignedTransaction(signedTransaction.rawTransaction);
        console.log('After sending transaction:', new Date());

        await this.logHistory(patientNIC, 'Add EMR', 'System', 0);
        await this.logChanges(
          patientNIC,
          'Personal Data',
          'System',
          '',
          0,
          `${medicalRecord}`,
          0,
        );
      }

      return 'Add EMR data Successfully';
    } catch (error) {
      console.error('Error add EMR data patient:', error);
      throw new Error(error.message);
    }
  }

  async isEMRDataExist(
    patientNic: string,
    dob: string,
  ): Promise<{ exists: boolean; existingNoRekamMedis: string }> {
    try {
      const result = await this.contract.methods
        .isEMRDataExist(patientNic, dob)
        .call();

      // Handle the result as needed
      const exists = result[0];
      const existingNoRekamMedis = result[1];

      return { exists, existingNoRekamMedis };
    } catch (error) {
      console.error('Error calling isEMRDataExist:', error);
      throw error;
    }
  }

  async registerPatientWalkIn(decryptedData: string, hospitalid: number) {
    try {
      const dataDetails = JSON.parse(decryptedData);
      const name = dataDetails['name'];
      const homeAddress = dataDetails['homeAddress'];
      const dob = dataDetails['dob'];
      const telephone = dataDetails['telephone'];
      const nic = dataDetails['nic'];
      const gender = dataDetails['gender'];

      const checkPatientExistByNIC = await this.patientRepository.findOne({
        pnic: nic,
      });

      console.log(checkPatientExistByNIC);
      if (checkPatientExistByNIC) {
        const patientData: Partial<Walkinpatient> = {
          pname: checkPatientExistByNIC.pname,
          pnic: checkPatientExistByNIC.pnic,
          paddress: checkPatientExistByNIC.paddress,
          pdob: checkPatientExistByNIC.pdob,
          ptel: checkPatientExistByNIC.ptel,
          url_ktp: `http:localhost:3002`,
          no_rm: checkPatientExistByNIC.no_rm,
          gender: gender,
          hospitalid: hospitalid,
        };

        const newPatient = this.entityManager.create(
          Walkinpatient,
          patientData,
        );
        await this.entityManager.persistAndFlush(newPatient);
      } else {
        const checkEMRExist = await this.isEMRDataExist(nic, dob);

        let noMR;
        if (checkEMRExist.exists) {
          noMR = checkEMRExist.existingNoRekamMedis;
        } else {
          noMR = await this.generateNoRekamMedis();
        }

        const patientData: Partial<Walkinpatient> = {
          pname: name,
          pnic: nic,
          paddress: homeAddress,
          pdob: new Date(dob),
          ptel: telephone,
          url_ktp: `http:localhost:3002`,
          no_rm: noMR,
          gender: gender,
          hospitalid: hospitalid,
        };

        const newPatient = this.entityManager.create(
          Walkinpatient,
          patientData,
        );
        await this.entityManager.persistAndFlush(newPatient);

        if (!checkEMRExist.exists) {
          const medicalRecord = {
            noMR: noMR,
            personalData: {
              fullName: name,
              dob: dob,
              gender: gender,
              address: homeAddress,
              phoneNumber: telephone,
              email: '',
              bloodType: '',
              bloodPressure: '',
              heartRate: '',
              glucoseLevel: '',
              hemoglobin: '',
              weight: '',
              height: '',
            },
            medicalRecord: {
              soapNotes: [],
              illnessDiagnosis: {},
            },
            prescription: {
              doctorPrescriptions: [],
              patientAdditions: [],
            },
            appointmentHistory: [],
            documents: [],
          };

          const medRec = JSON.stringify(medicalRecord, null, 1);
          await this.addEMR(nic, dob, noMR, medRec);
        }
      }

      return 'Patient registered successfully';
    } catch (error) {
      console.error('Error registering patient:', error);
      throw new Error(error.message);
    }
  }

  async getEMRData(pid: number) {
    try {
      const patient = await this.patientRepository.findOne({
        pid: pid,
      });
      if (!patient) return new Error('Patient not found');
      // Call the view function directly
      const result = await this.contract.methods
        .getEMRData(patient.pnic, patient.token, patient.pwa)
        .call();

      console.log(result.medicalRecord);
      return {
        patientNic: result.patientNic,
        dob: result.dob,
        noMR: result.noRekamMedis,
        medicalRecord: JSON.parse(result.medicalRecord),
      };
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  async doctorGetEMRData(
    appointmentId: number,
    docid: number,
    token: string,
    walkin: boolean,
  ) {
    try {
      let result;
      const decoded = this.jwtService.verifyToken(token);
      console.log('decoded token', decoded);
      if (decoded.valid) {
        const decryptedData = JSON.parse(decrypt(decoded.decoded.payloadValue));
        console.log('decryptedData', decryptedData);

        const appointment = await this.appointmentRepository.findOne({
          appoid: appointmentId,
        });

        if (parseInt(decryptedData.scheduleid, 10) === appointment.scheduleid) {
          let patient;
          let isRegisteredPatient = true;
          if (walkin === true) {
            patient = await this.patientRepository.findOne({
              pid: appointment.pid,
            });

            if (!patient) {
              patient = await this.walkinPatientRepository.findOne({
                pid: appointment.pid,
              });
              isRegisteredPatient = false;
            }
          } else {
            patient = await this.patientRepository.findOne({
              pid: appointment.pid,
            });
          }
          if (!patient) return;

          console.log('patient', patient);
          const doctor = await this.doctorRepository.findOne({
            docid: docid,
          });
          if (!doctor) return;

          const hospital = await this.hospitalService.findOne(
            appointment.hospitalid,
          );

          const result = await this.contract.methods
            .doctorGetEMRData(patient.pnic)
            .call();
          console.log(result);

          await this.logHistory(
            patient.pnic,
            `Doctor fetch patient EMR Data`,
            doctor.docname,
            appointment.hospitalid,
          );

          if (isRegisteredPatient) {
            await this.notificationService.addNotification(
              patient.pid,
              `Doctor ${doctor.docname} from ${hospital} access your EMR Data.`,
            );
          }

          console.log({
            pid: patient.pid,
            dob: result.dob,
            noMR: result.noRekamMedis,
            medicalRecord: JSON.parse(result.medicalRecord),
          });

          return {
            pid: patient.pid,
            dob: result.dob,
            noMR: result.noRekamMedis,
            medicalRecord: JSON.parse(result.medicalRecord),
          };
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Error get EMR: ${error.message}`);
    }
  }

  async updateEMRData(pid: number, decryptedData: string) {
    try {
      const dataDetails = JSON.parse(decryptedData);
      const medicalRecord = dataDetails['medicalRecord'];
      const changesField = dataDetails['changesField'];

      const patient = await this.patientRepository.findOne({
        pid: pid,
      });
      if (!patient) return new Error('Patient not found');

      const latestMedRec = await this.getLatestUpdate(patient.pid, false);

      const medRec = JSON.stringify(medicalRecord);
      console.log(medRec);

      const contract = await this.getContract();
      const gasPrice = await this.getGasPrice();
      const nonce = await this.getNonce(patient.pwa);

      const data = contract.methods
        .updateEMRData(
          patient.pnic,
          patient.pdob.toISOString().split('T')[0],
          patient.no_rm,
          medRec,
          patient.token,
          false,
          patient.pwa,
        )
        .encodeABI();

      const transactionObject = {
        from: patient.pwa,
        to: this.contractAddress,
        gas: '3000000',
        gasPrice: gasPrice,
        data: data,
        nonce: nonce,
      };

      console.log('transactionObject:', transactionObject);

      const signedTransaction = await this.signTransaction(
        transactionObject,
        patient.pk,
      );

      console.log('Before sending transaction:', new Date());
      await this.sendSignedTransaction(signedTransaction.rawTransaction);
      console.log('After sending transaction:', new Date());
      await this.logHistory(
        patient.pnic,
        'Update Patient EMR Data',
        patient.pname,
        0,
      );
      await this.logChanges(
        patient.pnic,
        changesField,
        patient.pname,
        '',
        latestMedRec.id,
        medRec,
        0,
      );
      await this.notificationService.addNotification(
        patient.pid,
        `You have successfully updated your ${changesField}`,
      );

      const personalData = medicalRecord['personalData'];
      const fullName = personalData['fullName'];
      const address = personalData['address'];
      const phoneNumber = personalData['phoneNumber'];
      const email = personalData['email'];

      await this.updatePatientData(
        patient.pnic,
        fullName,
        address,
        phoneNumber,
        email,
        patient.ppassword,
      );

      return 'Update EMR data successfully';
    } catch (error) {
      console.error('Error update patient data:', error);
      throw new Error(error.message);
    }
  }

  async submitSOAP(decryptedData: string) {
    try {
      const dataDetails = JSON.parse(decryptedData);
      console.log('dataDetails', dataDetails);
      const oldEmr = JSON.parse(dataDetails['previousEmr']);
      const previousMedRec = oldEmr['emr'];
      const previousEmr = previousMedRec['medicalRecord'];
      const personalData = dataDetails['personalData'];
      const illnessDiagnosis = dataDetails['illnessDiagnosis'];
      const doctorPrescriptions: Prescription[] =
        dataDetails['doctorPrescriptions'];
      const soapNotes = dataDetails['soapNotes'];
      const walkin = dataDetails['walkin'];
      const pid = parseInt(dataDetails['pid'], 10);
      const doctorId = parseInt(dataDetails['doctorId'], 10);
      const appointmentId = parseInt(dataDetails['appointmentId'], 10);
      const changesField =
        'SOAP, Illness Diagnosis, Prescriptions, Personal Data';

      const today = new Date();
      const indonesiaDate = today.toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const date = new Date(indonesiaDate);

      let patient;
      let isRegisteredPatient = true;
      if (walkin === true) {
        patient = await this.patientRepository.findOne({
          pid: pid,
        });
        if (!patient) {
          patient = await this.walkinPatientRepository.findOne({
            pid: pid,
          });
          isRegisteredPatient = false;
        }
      } else {
        patient = await this.patientRepository.findOne({
          pid: pid,
        });
      }
      if (!patient) return new Error('Patient not found');

      let result: any;
      let message: string;
      const isValidated =
        await this.doctorAssociationService.isDoctorAssociatedWithPatient(
          appointmentId,
          doctorId,
          walkin,
        );

      const doctor = await this.doctorRepository.findOne({ docid: doctorId });
      const hospital = await this.hospitalService.findOne(doctor.hospitalid);
      const appointment = await this.appointmentService.findOne(appointmentId);
      const schedule = await this.scheduleService.findOne(
        appointment.scheduleid,
      );

      const latestMedRec = await this.getLatestUpdate(patient.pid, walkin);
      const notes_SOAP: SoapNote[] = previousEmr.medicalRecord.soapNotes || [];

      const newSoapNotes: SoapNote = {
        timestamp: date,
        doctor: doctor.docname,
        hospital: hospital,
        subjective: soapNotes.subjective,
        objective: soapNotes.objective,
        assessment: soapNotes.assessment,
        plan: soapNotes.plan,
        appointmentId: appointment.appoid,
      };
      notes_SOAP.push(newSoapNotes);

      const illness_diagnosis: IllnessDiagnosis = {
        code: illnessDiagnosis.code,
        name: illnessDiagnosis.name,
        date: date,
        doctor: doctor.docname,
        treatment: illnessDiagnosis.treatment,
        appointmentId: appointmentId,
      };

      const doctor_prescriptions: Prescription[] =
        previousEmr.prescription.doctorPrescriptions || [];

      const doc_prescriptions = doctorPrescriptions.map((value) => {
        const new_prescriptions: Prescription = {
          appointmentId: appointment.appoid,
          isDoctorPrescription: true,
          timestamp: date,
          medication: value.medication,
          dosage: value.dosage,
          frequency: value.frequency,
          instructions: value.instructions,
        };
        return new_prescriptions;
      });
      doctor_prescriptions.push(...doc_prescriptions);

      const patientAdditions: Prescription[] =
        previousEmr.prescription.patientAdditions || [];

      const documents: Document[] = previousEmr.documents || [];

      const appointmentHistory: AppointmentHistory[] =
        previousEmr.appointmentHistory || [];

      if (appointmentHistory) {
        const appointmentHis = appointmentHistory.find(
          (appointment) => appointment.appointmentId === appointmentId,
        );

        if (!appointmentHis) {
          const new_appointment_history: AppointmentHistory = {
            session: schedule.title,
            appointmentId: appointment.appoid,
            timestamp: date,
            doctor: doctor.docname,
            hospital: hospital,
            status: 'COMPLETED',
          };
          appointmentHistory.push(new_appointment_history);
        } else {
          appointmentHis.session = schedule.title;
          appointmentHis.timestamp = date;
        }
      } else {
        const new_appointment_history: AppointmentHistory = {
          session: schedule.title,
          appointmentId: appointment.appoid,
          timestamp: date,
          doctor: doctor.docname,
          hospital: hospital,
          status: 'COMPLETED',
        };
        appointmentHistory.push(new_appointment_history);
      }

      const medRec = JSON.stringify({
        noMR: previousEmr.noMR,
        personalData: personalData,
        medicalRecord: {
          soapNotes: notes_SOAP,
          illnessDiagnosis: illness_diagnosis,
        },
        prescription: {
          doctorPrescriptions: doctor_prescriptions,
          patientAdditions: patientAdditions,
        },
        appointmentHistory: appointmentHistory,
        documents: documents,
      });

      console.log('medRec', medRec);

      if (isValidated) {
        console.log('isValidated', isValidated);
        const contract = await this.getContract();
        const gasPrice = await this.getGasPrice();
        const nonce = await this.getNonce(doctor.dwa);

        const data = contract.methods
          .updateEMRData(
            patient.pnic,
            patient.pdob.toISOString().split('T')[0],
            patient.no_rm,
            medRec,
            appointment.token,
            true,
            `${patient.pwa ?? ''}`,
          )
          .encodeABI();

        const transactionObject = {
          from: doctor.dwa,
          to: this.contractAddress,
          gas: '3000000',
          gasPrice: gasPrice,
          data: data,
          nonce: nonce,
        };

        console.log('transactionObject:', transactionObject);

        const signedTransaction = await this.signTransaction(
          transactionObject,
          doctor.pk,
        );

        console.log('Before sending transaction:', new Date());
        result = await this.sendSignedTransaction(
          signedTransaction.rawTransaction,
        );
        console.log('After sending transaction:', new Date());

        await this.logHistory(
          patient.pnic,
          'Update Patient EMR Data',
          doctor.docname,
          doctor.hospitalid,
        );
        await this.logChanges(
          patient.pnic,
          'Medical Record',
          doctor.docname,
          changesField,
          latestMedRec.id,
          medRec,
          doctor.hospitalid,
        );
        if (isRegisteredPatient) {
          await this.notificationService.addNotification(
            patient.pid,
            `Your medical record - ${changesField} has been updated by Dr. ${doctor.docname} from ${hospital}`,
          );
        }

        appointment.status_done = true;
        await this.entityManager.persistAndFlush(appointment);

        message = 'Update EMR data successfully';
      } else {
        message = 'No authorization';
      }
      return {
        data: result,
        message: message,
      };
    } catch (error) {
      console.error('Error update patient data:', error);
      throw new Error(error.message);
    }
  }

  async getLatestUpdate(pid: number, walkin: boolean) {
    let patient;
    if (walkin === true) {
      patient = await this.walkinPatientRepository.findOne({
        pid: pid,
      });

      if (!patient) {
        patient = await this.patientRepository.findOne({
          pid: pid,
        });
      } else {
        const patientRegistered = await this.patientRepository.findOne({
          pnic: patient.pnic,
        });
        if (patientRegistered) patient = patientRegistered;
      }
    } else {
      patient = await this.patientRepository.findOne({
        pid: pid,
      });
    }

    const nic = patient.pnic;
    const latestMedRec = await this.logChangesRepository.findOne(
      { nic: nic },
      { orderBy: { timestamp: 'DESC' } },
    );

    const date = latestMedRec.timestamp.toDateString();
    const time = latestMedRec.timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      timeZone: 'Asia/Jakarta',
    });

    let hospital = '';
    if (latestMedRec.hospital_id !== 0) {
      hospital = await this.hospitalService.findOne(latestMedRec.hospital_id);
    }

    const latestMedRecDetail = {
      id: latestMedRec.id,
      date: date,
      time: time,
      changedBy: latestMedRec.changed_by,
      hospital: hospital,
    };

    return latestMedRecDetail;
  }

  async generateToken(pnic: string) {
    const payload = { pnic: pnic };

    const expiresIn = '1d';

    const token = this.jwtService.generateTokenWithExpiration(
      payload,
      expiresIn,
    );
    return token;
  }

  generateNoRekamMedis(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, ''); // Use timestamp as a string without non-numeric characters
    const uniqueId = uuidv4().split('-').join(''); // Remove dashes from UUID
    return `RM-${timestamp}-${uniqueId}`;
  }

  async logHistory(
    nic: string,
    description: string,
    accessedBy: string,
    hospitalId: number,
  ) {
    const today = new Date();
    const indonesiaDate = today.toLocaleString('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const date = new Date(indonesiaDate);
    const loghistory: Partial<LogHistory> = {
      nic: nic,
      description: description,
      accessed_by: accessedBy,
      timestamp: date,
      hospital_id: hospitalId,
    };

    const newLog = this.entityManager.create(LogHistory, loghistory);
    await this.entityManager.persistAndFlush(newLog);
  }

  async logChanges(
    nic: string,
    type: string,
    changedBy: string,
    field: string,
    previousValueId: number,
    newValue: string,
    hospitalId: number,
  ) {
    const today = new Date();
    const indonesiaDate = today.toLocaleString('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const date = new Date(indonesiaDate);
    const logChanges: Partial<LogChanges> = {
      nic: nic,
      type: type,
      changed_by: changedBy,
      field: field,
      previous_value_id: previousValueId,
      value: newValue,
      timestamp: date,
      hospital_id: hospitalId,
    };

    const newLog = this.entityManager.create(LogChanges, logChanges);
    await this.entityManager.persistAndFlush(newLog);
  }

  async getLatestSOAP(appointmentId: number) {
    const appointment = await this.appointmentService.findOne(appointmentId);
    const schedule = await this.scheduleService.findOne(appointment.scheduleid);
    let patient;
    patient = await this.patientRepository.findOne({
      pid: appointment.pid,
    });
    if (!patient) {
      patient = await this.walkinPatientRepository.findOne({
        pid: appointment.pid,
      });
    }
    const doctor = await this.doctorRepository.findOne({
      docid: schedule.docid,
    });
    const changes = await this.logChangesRepository.findOne(
      {
        $and: [
          { changed_by: doctor.docname },
          { nic: patient.pnic },
          {
            timestamp: {
              $gte: appointment.appodate,
              // $lte: appointment.appodate,
            },
          },
        ],
      },
      {
        orderBy: { timestamp: 'DESC' },
      },
    );

    const soap = await JSON.parse(changes.value);
    const medicalRecord = soap['medicalRecord'];
    const soapNotes = medicalRecord['soapNotes'];
    let illnessDiagnosis = medicalRecord['illnessDiagnosis'];
    if (!illnessDiagnosis) {
      const illness_Diagnosis = medicalRecord['ilnessDiagnosis'];
      illnessDiagnosis = {
        appointmentId: illness_Diagnosis[0].appointmentId,
        code: illness_Diagnosis[0].code,
        date: illness_Diagnosis[0].date,
        doctor: illness_Diagnosis[0].doctor,
        name: illness_Diagnosis[0].name,
        treatment: illness_Diagnosis[0].treatment,
      };
    }

    console.log(soap.prescription.doctorPrescriptions);
    console.log(appointmentId);

    const filteredDoctorPrescriptions =
      soap.prescription.doctorPrescriptions.filter(
        (prescription) => prescription.appointmentId == appointmentId,
      );

    console.log(filteredDoctorPrescriptions);

    return {
      personalData: soap.personalData,
      soapNotes: soapNotes,
      illnessDiagnosis: illnessDiagnosis,
      doctorPrescriptions: filteredDoctorPrescriptions,
    };
  }
}
