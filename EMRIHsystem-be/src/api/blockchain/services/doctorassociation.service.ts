import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import Web3 from 'web3';
import { LogChanges } from 'src/entities/logchanges/logchanges.entity';
import { LogHistory } from 'src/entities/loghistory/loghistory.entity';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { Patient } from 'src/entities/patient/patient.entity';
import { Schedule } from 'src/entities/schedule/schedule.entity';
import { Appointment } from 'src/entities/appointment/appointment.entity';
import { Hospital } from 'src/entities/hospital/hospital.entity';
import { NotificationService } from 'src/api/notifications/services/notification.service';
import { JwtService } from 'src/api/jwt/services/jwt.service';
import { decrypt } from 'src/common/utils/crypto';
import { Walkinpatient } from 'src/entities/walkinpatient/walkinpatient.entity';

dotenv.config();

@Injectable()
export class DoctorAssociationService {
  private web3: any;
  private contract: any;

  private ganacheEndpoint: string;
  private privateKey: string;
  private contractAddress: string;
  private defaultAccount: string;
  private readonly contractAbi: any[] = [];

  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: EntityRepository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: EntityRepository<Patient>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: EntityRepository<Schedule>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: EntityRepository<Appointment>,
    @InjectRepository(Hospital)
    private readonly hospitalRepository: EntityRepository<Hospital>,
    @InjectRepository(Walkinpatient)
    private readonly walkinPatientRepository: EntityRepository<Walkinpatient>,
    private readonly notificationService: NotificationService,
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService,
  ) {
    this.ganacheEndpoint = process.env.GANACHE_ENDPOINT;
    this.contractAddress = process.env.CONTRACT_ADDRESS_DOCTORASSOCIATION;
    this.defaultAccount = process.env.DEFAULT_ACCOUNT_ADDRESS;
    this.privateKey = process.env.PRIVATE_KEY_OWNER;
    this.web3 = new Web3(this.ganacheEndpoint);
    // Read the ABI from the external file
    const abiFilePath = process.env.ABI_FILE_PATH_DOCTORASSOCIATION;
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

  async associateDoctorWithPatient(
    appointmentid: number,
    token: string,
    validateDate: string,
  ) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        appoid: appointmentid,
      });
      if (!appointment) return new Error('Appointment not found');

      const patient = await this.patientRepository.findOne({
        pid: appointment.pid,
      });
      if (!patient) return new Error('Patient not found');

      const schedule = await this.scheduleRepository.findOne({
        scheduleid: appointment.scheduleid,
      });
      if (!schedule) return new Error('Schedule not found');

      const doctor = await this.doctorRepository.findOne({
        docid: schedule.docid,
      });
      if (!schedule) return new Error('Doctor not found');

      // Dynamically calculate gas price
      const contract = await this.getContract();
      const gasPrice = await this.getGasPrice();
      const nonce = await this.getNonce(patient.pwa);

      const data = contract.methods
        .associateDoctorWithPatient(
          patient.pnic,
          doctor.docnic,
          `${appointmentid}`,
          token,
          validateDate,
          doctor.dwa,
          patient.pwa,
        )
        .encodeABI();

      console.log('data', data);

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
        'Add Doctor Association',
        patient.pname,
        schedule.hospitalid,
      );

      return 'Create appointment successfull';
    } catch (error) {
      console.error('Error registering patient:', error);
      throw new Error(error.message);
    }
  }

  async associateDoctorWithPatientWalkin(
    appointmentid: number,
    token: string,
    validateDate: string,
  ) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        appoid: appointmentid,
      });
      if (!appointment) return new Error('Appointment not found');

      const patient = await this.walkinPatientRepository.findOne({
        pid: appointment.pid,
      });
      if (!patient) return new Error('Patient not found');

      const schedule = await this.scheduleRepository.findOne({
        scheduleid: appointment.scheduleid,
      });
      if (!schedule) return new Error('Schedule not found');

      const doctor = await this.doctorRepository.findOne({
        docid: schedule.docid,
      });
      if (!schedule) return new Error('Doctor not found');

      // Dynamically calculate gas price
      const contract = await this.getContract();
      const gasPrice = await this.getGasPrice();
      const nonce = await this.getNonce(this.defaultAccount);

      const data = contract.methods
        .associateDoctorWithPatient(
          patient.pnic,
          doctor.docnic,
          `${appointmentid}`,
          token,
          validateDate,
          doctor.dwa,
          '',
        )
        .encodeABI();

      console.log('data', data);

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

      await this.logHistory(
        patient.pnic,
        'Add Doctor Association',
        'System',
        schedule.hospitalid,
      );

      return 'Create appointment successfull';
    } catch (error) {
      console.error('Error registering patient:', error);
      throw new Error(error.message);
    }
  }

  async getAllPatientsForTodayByDoctorNic(doctorNic: string) {
    try {
      const today = new Date();
      const year = today.toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
      });
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');

      const indonesiaDate = `${year}-${month}-${day}`;
      const data = await this.contract.methods
        .getPatientsForTodayByDoctorNic(doctorNic, indonesiaDate)
        .call();

      return data.patientAssociations;
    } catch (error) {
      throw new Error(
        `Error checking patient existence by NIC: ${error.message}`,
      );
    }
  }

  async isDoctorAssociatedWithPatient(
    appointmentId: number,
    docid: number,
    walkin: boolean,
  ) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        appoid: appointmentId,
      });
      if (!appointment) return false;

      let patient;
      if (walkin === true) {
        patient = await this.walkinPatientRepository.findOne({
          pid: appointment.pid,
        });
      } else {
        patient = await this.patientRepository.findOne({
          pid: appointment.pid,
        });
      }
      if (!patient) return false;

      const doctor = await this.doctorRepository.findOne({
        docid: docid,
      });
      if (!doctor) return false;

      const today = new Date();
      const year = today.toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
      });
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');

      const indonesiaDate = `${year}-${month}-${day}`;

      const result = await this.contract.methods
        .isCallerAssociatedWithPatient(
          patient.pnic,
          doctor.dwa,
          appointment.token,
          indonesiaDate,
        )
        .call();
      return result;
    } catch (error) {
      throw new Error(
        `Error checking is doctor associated or not: ${error.message}`,
      );
    }
  }

  async getToken(appointmentId: number) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        appoid: appointmentId,
      });
      const schedule = await this.scheduleRepository.findOne({
        scheduleid: appointment.scheduleid,
      });
      const doctor = await this.doctorRepository.findOne({
        docid: schedule.docid,
      });

      return {
        token: appointment.token,
        password: doctor.docpassword,
      };
    } catch (error) {
      throw new Error(`Error getting appointment token: ${error.message}`);
    }
  }

  async getEMRData(
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

          const doctor = await this.doctorRepository.findOne({
            docid: docid,
          });
          if (!doctor) return;

          const hospital = await this.hospitalRepository.findOne({
            id: appointment.hospitalid,
          });

          const today = new Date();
          const year = today.toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
          });
          const month = (today.getMonth() + 1).toString().padStart(2, '0');
          const day = today.getDate().toString().padStart(2, '0');

          const indonesiaDate = `${year}-${month}-${day}`;

          const result = await this.contract.methods
            .getEMRData(
              patient.pnic,
              appointment.token,
              indonesiaDate,
              doctor.dwa,
            )
            .call();

          await this.logHistory(
            patient.pnic,
            `Doctor fetch patient EMR Data`,
            doctor.docname,
            hospital.id,
          );

          if (isRegisteredPatient) {
            await this.notificationService.addNotification(
              patient.pid,
              `Doctor ${doctor.docname} from ${hospital.hospital_name} access your EMR Data.`,
            );
          }

          console.log({
            pid: patient.pid,
            dob: result.dob,
            noMR: result.noMR,
            medicalRecord: JSON.parse(result.medicalRecord),
          });

          return {
            pid: patient.pid,
            dob: result.dob,
            noMR: result.noMR,
            medicalRecord: JSON.parse(result.medicalRecord),
          };
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Error get EMR: ${error.message}`);
    }
  }

  async getDoctorAssociationsByDoctorNic(doctorId: number): Promise<boolean> {
    try {
      const doctor = await this.doctorRepository.findOne({
        docid: doctorId,
      });
      if (!doctor) return false;

      const contract = await this.getContract();
      const result = await contract.methods
        .getDoctorAssociationsByDoctorNic(doctor.docnic, doctor.dwa)
        .call();

      return result;
    } catch (error) {
      throw new Error(`Error get doctor association by NIC: ${error.message}`);
    }
  }

  async logHistory(
    nic: string,
    description: string,
    accessedBy: string,
    hospitalId: number,
  ) {
    const loghistory: Partial<LogHistory> = {
      nic: nic,
      description: description,
      accessed_by: accessedBy,
      timestamp: new Date(),
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
    const logChanges: Partial<LogChanges> = {
      nic: nic,
      type: type,
      changed_by: changedBy,
      field: field,
      previous_value_id: previousValueId,
      value: newValue,
      timestamp: new Date(),
      hospital_id: hospitalId,
    };

    const newLog = this.entityManager.create(LogChanges, logChanges);
    await this.entityManager.persistAndFlush(newLog);
  }
}
