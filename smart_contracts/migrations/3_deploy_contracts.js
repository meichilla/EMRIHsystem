const PatientEMR = artifacts.require('PatientEMR');
const DoctorStorage = artifacts.require('DoctorStorage');
const DoctorAssociationContract = artifacts.require('DoctorAssociationContract');

module.exports = async function (deployer) {
    await deployer.deploy(PatientEMR);
    const patientEMRInstance = await PatientEMR.deployed();
  
    await deployer.deploy(DoctorStorage, patientEMRInstance.address);
    const doctorStorageInstance = await DoctorStorage.deployed();

    await deployer.deploy(DoctorAssociationContract, patientEMRInstance.address, doctorStorageInstance.address);
    const doctorAssociationContractInstance = await DoctorAssociationContract.deployed();

};
