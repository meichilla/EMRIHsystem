import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { User } from 'src/entities/user/user.entity';
import Web3 from 'web3';
import { LogChanges } from 'src/entities/logchanges/logchanges.entity';
import { LogHistory } from 'src/entities/loghistory/loghistory.entity';
import { Doctor } from 'src/entities/doctor/doctor.entity';
import { DoctorService } from 'src/api/doctor/services/doctor.service';
import { HospitalService } from 'src/api/hospital/services/hospital.service';

dotenv.config();

@Injectable()
export class DoctorStorageService {
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
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly entityManager: EntityManager,
    private readonly doctorService: DoctorService,
    private readonly hospitalService: HospitalService,
  ) {
    this.ganacheEndpoint = process.env.GANACHE_ENDPOINT;
    this.contractAddress = process.env.CONTRACT_ADDRESS_DOCTORSTORAGE;
    this.defaultAccount = process.env.DEFAULT_ACCOUNT_ADDRESS;
    this.privateKey = process.env.PRIVATE_KEY_OWNER;
    this.web3 = new Web3(this.ganacheEndpoint);
    // Read the ABI from the external file
    const abiFilePath = process.env.ABI_FILE_PATH_DOCTORSTORAGE;
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

  async registerDoctor(
    email: string,
    name: string,
    password: string,
    nic: string,
    telephone: string,
    walletAddress: string,
    specialties: string,
    hospitalid: number,
    docPrivateKey: string,
  ) {
    try {
      const checkDoctorByNic = await this.doctorRepository.findOne({
        $or: [{ docnic: nic }, { docemail: email }],
      });
      if (checkDoctorByNic)
        return new Error('Doctor NIC or Email is already registered');

      // Validate if the provided wallet address is a valid Ethereum address
      await this.validateWalletAddress(walletAddress);

      // Dynamically calculate gas price
      const contract = await this.getContract();
      const gasPrice = await this.getGasPrice();
      const nonce = await this.getNonce(this.defaultAccount);

      const hospital = await this.hospitalService.findOne(hospitalid);

      const data = contract.methods
        .addDoctor(
          email,
          name,
          password,
          nic,
          telephone,
          walletAddress,
          specialties,
          hospital,
        )
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

      const specialtiesId =
        await this.doctorService.getSpecialtiesId(specialties);
      const doctor: Partial<Doctor> = {
        docemail: email,
        docname: name,
        docpassword: password,
        docnic: nic,
        doctel: telephone,
        dwa: walletAddress,
        specialties: specialtiesId,
        hospitalid: hospitalid,
        pk: docPrivateKey,
        is_active: true,
      };

      const userDetail: Partial<User> = {
        email: email,
        usertype: 'd',
      };

      const newDoctor = this.entityManager.create(Doctor, doctor);
      await this.entityManager.persistAndFlush(newDoctor);

      const newUser = this.entityManager.create(User, userDetail);
      await this.entityManager.persistAndFlush(newUser);

      await this.logHistory(nic, 'Add Doctor', 'System', hospitalid);

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

  async updateDoctorData(
    nic: string,
    email: string,
    name: string,
    telephone: string,
    specialties: string,
  ) {
    try {
      const checkDoctorByNic = await this.doctorRepository.findOne({
        $or: [{ docnic: nic }, { docemail: email }],
      });
      if (!checkDoctorByNic) return new Error('Doctor is not registered');

      // Dynamically calculate gas price
      const contract = await this.getContract();
      const gasPrice = await this.getGasPrice();
      const nonce = await this.getNonce(this.defaultAccount);

      const data = contract.methods
        .updateDoctorData(nic, email, name, telephone, specialties)
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
      const result = await this.sendSignedTransaction(
        signedTransaction.rawTransaction,
      );
      console.log('After sending transaction:', new Date());

      if (result) {
        const specialtiesId =
          await this.doctorService.getSpecialtiesId(specialties);

        const doctorData: Partial<Doctor> = {
          docemail: email,
          docname: name,
          docpassword: checkDoctorByNic.docpassword,
          docnic: nic,
          doctel: telephone,
          dwa: checkDoctorByNic.dwa,
          specialties: specialtiesId,
          pk: checkDoctorByNic.pk,
        };

        Object.assign(checkDoctorByNic, doctorData);

        if (email !== checkDoctorByNic.docemail) {
          const user = await this.userRepository.findOne({
            email: checkDoctorByNic.docemail,
          });
          const userDetail: Partial<User> = {
            email: email,
            usertype: 'd',
          };

          Object.assign(user, userDetail);
          await this.entityManager.persistAndFlush(user);
        }

        await this.entityManager.persistAndFlush(doctorData);
      }

      return {
        name: name,
        email: email,
        nic: nic,
        specialties: specialties,
        hospitalid: checkDoctorByNic.hospitalid,
        telephone: telephone,
        userType: 'p',
      };
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

  async validateDoctorLogin(email: string, password: string) {
    try {
      const doctor = await this.doctorRepository.findOne({
        $and: [{ docemail: email }, { docpassword: password }],
      });

      if (!doctor) return new Error('Credentials invalid');
      console.log(doctor);

      const hospital = await this.hospitalService.findOne(doctor.hospitalid);

      // Call the view function directly
      const result = await this.contract.methods
        .validateDoctorLogin(
          doctor.docemail,
          doctor.docpassword,
          doctor.docnic,
          hospital,
        )
        .call();

      console.log(result);
      const doctorDetail = {
        id: doctor.docid,
        email: result.doctorData.email,
        name: result.doctorData.name,
        password: result.doctorData.password,
        nic: result.doctorData.nic,
        telephone: result.doctorData.telephone,
        walletAddress: result.doctorData.walletAddress,
        specialties: result.doctorData.specialties,
        hospital: result.doctorData.hospital,
      };

      console.log(doctorDetail);
      await this.logHistory(
        doctor.docnic,
        'Auth Login',
        doctor.docname,
        doctor.hospitalid,
      );

      return {
        message: result.message,
        doctorData: doctorDetail,
      };
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  async deleteDoctor(doctorId: number) {
    try {
      const doctor = await this.doctorRepository.findOne({
        docid: doctorId,
      });

      const contract = await this.getContract();
      const gasPrice = await this.getGasPrice();
      const nonce = await this.getNonce(this.defaultAccount);

      const data = contract.methods.deleteDoctor(doctor.docnic).encodeABI();

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

      await this.entityManager.removeAndFlush(doctor);

      await this.logHistory(
        doctor.docnic,
        `Delete Doctor ${doctor.docname}`,
        'System',
        doctor.hospitalid,
      );

      return 'Delete Doctor Successfully';
    } catch (error) {
      console.error('Error add EMR data patient:', error);
      throw new Error(error.message);
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
