import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import Web3 from 'web3';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Patient } from 'src/entities/patient/patient.entity';
import { User } from 'src/entities/user/user.entity';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { Specialties } from 'src/entities/specialties/specialties.entity';

dotenv.config();

export interface PatientData {
  name: string;
  homeAddress: string;
  dob: string;
  email: string;
  telephone: string;
  nic: string;
  walletAddress: string;
  userType: string;
}

export interface DoctorData {
  email: string;
  name: string;
  nic: string;
  telephone: string;
  walletAddress: string;
  specialties: number;
}

@Injectable()
export class EthereumService {
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
    @InjectRepository(Doctor)
    private readonly doctorRepository: EntityRepository<Doctor>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Specialties)
    private readonly specialtiesRepository: EntityRepository<Specialties>,
    private readonly entityManager: EntityManager,
  ) {
    this.ganacheEndpoint = process.env.GANACHE_ENDPOINT;
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.defaultAccount = process.env.DEFAULT_ACCOUNT_ADDRESS;
    this.privateKey = process.env.PRIVATE_KEY_OWNER;
    this.web3 = new Web3(this.ganacheEndpoint);

    // Read the ABI from the external file
    const abiFilePath = process.env.ABI_FILE_PATH;
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

  private async signTransaction(transactionObject: any): Promise<any> {
    return this.web3.eth.accounts.signTransaction(
      transactionObject,
      process.env.PRIVATE_KEY,
    );
  }

  private async sendSignedTransaction(signedTransaction: string): Promise<any> {
    return this.web3.eth.sendSignedTransaction(signedTransaction);
  }

  private async getNonce(): Promise<number> {
    return this.web3.eth.getTransactionCount(this.defaultAccount, 'pending');
  }

  async registerPatient(
    name: string,
    homeAddress: string,
    dob: string,
    email: string,
    telephone: string,
    password: string,
    nic: string,
    walletAddress: string,
  ) {
    try {
      const checkPatientExistByNIC = await this.patientRepository.findOne({
        pnic: nic,
      });
      if (checkPatientExistByNIC)
        return {
          error: new Error('NIC is already registered'),
        };

      const checkEmailExist = await this.userRepository.findOne({
        email: email,
      });
      if (checkEmailExist)
        return {
          error: new Error('Email is already registered'),
        };
      // Validate if the provided wallet address is a valid Ethereum address
      await this.validateWalletAddress(walletAddress);

      // Dynamically calculate gas price
      const contract = await this.getContract();
      const gasPrice = await this.getGasPrice();
      const nonce = await this.getNonce();

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
          'p',
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

      const signedTransaction = await this.signTransaction(transactionObject);

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
        };

        const userDetail: Partial<User> = {
          email: email,
          usertype: 'p',
        };

        const newPatient = this.entityManager.create(Patient, patientData);
        await this.entityManager.persistAndFlush(newPatient);

        const newUser = this.entityManager.create(User, userDetail);
        await this.entityManager.persistAndFlush(newUser);
      }

      return {
        name: name,
        dob: dob,
        email: email,
        homeAddress: homeAddress,
        nic: nic,
        telephone: telephone,
        walletAddress: walletAddress,
        userType: 'p',
      };
    } catch (error) {
      console.error('Error registering patient:', error);
      throw new Error(error.message);
    }
  }

  async isNICAlreadyRegistered(nic: string): Promise<boolean> {
    try {
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
        usertype: data.userType,
      };
    } catch (error) {
      throw new Error(
        `Error checking patient existence by NIC: ${error.message}`,
      );
    }
  }

  async getAllPatients(): Promise<PatientData[]> {
    try {
      const patientList = await this.contract.methods.getAllPatients().call();

      // Create an array to store patient data
      const allPatientsData: PatientData[] = [];

      for (let i = 0; i < patientList.length; i++) {
        const patientData = patientList[i];

        // Add patient data to the array
        allPatientsData.push({
          name: patientData.name,
          dob: patientData.dob,
          email: patientData.email,
          homeAddress: patientData.homeAddress,
          nic: patientData.nic,
          telephone: patientData.telephone,
          walletAddress: patientData.walletAddress,
          userType: patientData.userType,
        });
      }

      let listPatient: PatientData[] = allPatientsData;
      if (allPatientsData.length === 0) listPatient = [];

      return listPatient;
    } catch (error) {
      console.error('Error getting all patient data:', error);
      throw new Error(`Error getting all patient data: ${error.message}`);
    }
  }

  async validateLoginCredentials(
    pid: number,
    nic: string,
    password: string,
    walletAddress: string,
  ) {
    try {
      // Validate if the provided wallet address is a valid Ethereum address
      await this.validateWalletAddress(walletAddress);

      // Call the view function directly
      const result = await this.contract.methods
        .validateLogin(nic, password, walletAddress)
        .call();

      const patientDetail = {
        id: pid,
        name: result.patientData.name,
        dob: result.patientData.dob,
        email: result.patientData.email,
        homeAddress: result.patientData.homeAddress,
        nic: result.patientData.nic,
        telephone: result.patientData.telephone,
        walletAddress: result.patientData.walletAddress,
        userType: result.patientData.userType,
      };

      console.log(patientDetail);

      return {
        message: result.message,
        patientData: patientDetail,
      };
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  // async bookAppointment(doctorNic: string, patientNic: string, token: string) {
  //   try {
  //     const patient = await this.patientRepository.findOne({
  //       pnic: patientNic,
  //     });

  //     await this.getLatestNonce();
  //     // Validate if the provided wallet address is a valid Ethereum address
  //     await this.validateWalletAddress(patient.pwa);

  //     // Dynamically calculate gas price
  //     const gasPrice = await this.web3.eth.getGasPrice();

  //     const data = this.contract.methods
  //       .associateDoctor(doctorNic, patientNic, token)
  //       .encodeABI();

  //     const transactionObject = {
  //       from: patient.pwa,
  //       to: this.contractAddress,
  //       gas: '3000000',
  //       gasPrice: gasPrice,
  //       data: data,
  //       nonce: this.nonce,
  //     };

  //     console.log('transactionObject:', transactionObject);

  //     const signedTransaction = await this.web3.eth.accounts.signTransaction(
  //       transactionObject,
  //       process.env.PRIVATE_KEY,
  //     );

  //     console.log('Before sending transaction:', new Date());
  //     await this.web3.eth.sendSignedTransaction(
  //       signedTransaction.rawTransaction,
  //     );
  //     console.log('After sending transaction:', new Date());

  //     const updateNonce = this.entityManager.create(Nonce, patient);
  //     updateNonce.nonce = this.nonce++;
  //     updateNonce.created_at = new Date();
  //     updateNonce.email = patient.pemail;
  //     updateNonce.created_by = patient.pwa;
  //     updateNonce.detail = 'book session';
  //     await this.entityManager.persistAndFlush(updateNonce);

  //     return {
  //       message: 'Session successfully booked',
  //     };
  //   } catch (error) {
  //     console.error('Error book session:', error);
  //     throw new Error(error.message);
  //   }
  // }

  private async getSpecialtiesIds(searchkey: string): Promise<number> {
    const specialties = await this.specialtiesRepository.findOne(
      {
        sname: { $like: `%${searchkey}%` },
      },
      { fields: ['id'] },
    );

    return specialties.id;
  }

  async registerDoctor(
    email: string,
    name: string,
    password: string,
    nic: string,
    telephone: string,
    walletAddress: string,
    specialties: string,
    hospitalId: number,
  ) {
    try {
      const checkDoctorExistByNIC = await this.doctorRepository.findOne({
        docnic: nic,
      });
      if (checkDoctorExistByNIC) throw new Error('NIC is already registered');

      const checkEmailExist = await this.userRepository.findOne({
        email: email,
      });
      if (checkEmailExist) throw new Error('Email is already registered');

      await this.validateWalletAddress(walletAddress);

      const contract = await this.getContract();
      const gasPrice = await this.getGasPrice();
      const nonce = await this.getNonce();

      const data = contract.methods
        .addDoctor(
          email,
          name,
          password,
          nic,
          telephone,
          walletAddress,
          specialties,
        )
        .encodeABI();

      const transactionObject = {
        from: this.web3.eth.defaultAccount,
        to: this.contractAddress,
        gas: '3000000',
        gasPrice: gasPrice,
        data: data,
        nonce: nonce,
      };

      console.log('transactionObject:', transactionObject);

      const signedTransaction = await this.signTransaction(transactionObject);

      console.log('Before sending transaction:', new Date());
      await this.sendSignedTransaction(signedTransaction.rawTransaction);
      console.log('After sending transaction:', new Date());

      const specialtiesId = await this.getSpecialtiesIds(specialties);
      const doctor: Partial<Doctor> = {
        docemail: email,
        docname: name,
        docpassword: password,
        docnic: nic,
        doctel: telephone,
        dwa: walletAddress,
        specialties: specialtiesId,
        hospitalid: hospitalId,
      };

      const userDetail: Partial<User> = {
        email: email,
        usertype: 'd',
      };

      const newDoctor = this.entityManager.create(Doctor, doctor);
      await this.entityManager.persistAndFlush(newDoctor);

      const newUser = this.entityManager.create(User, userDetail);
      await this.entityManager.persistAndFlush(newUser);

      return {
        name: name,
        email: email,
        password: password,
        nic: nic,
        telephone: telephone,
        walletAddress: walletAddress,
      };
    } catch (error) {
      console.error('Error registering patient:', error);
      throw new Error(error.message);
    }
  }

  async getDoctorByNic(nic: string): Promise<boolean> {
    try {
      const result = await this.contract.methods.getDoctor(nic).call();
      return result;
    } catch (error) {
      throw new Error(`Error get doctor detail by NIC: ${error.message}`);
    }
  }
}
