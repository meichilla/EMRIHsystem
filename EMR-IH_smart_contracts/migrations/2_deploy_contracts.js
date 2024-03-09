const AuthorityRegistry = artifacts.require('AuthorityRegistry');
const PatientEMRStorage = artifacts.require('PatientEMRStorage');
const DoctorRegistry = artifacts.require('DoctorRegistry');
const DoctorAssociationRegistry = artifacts.require('DoctorAssociationRegistry');

module.exports = function (deployer) {
    deployer.deploy(AuthorityRegistry)
        .then(() => {
            return deployer.deploy(PatientEMRStorage, AuthorityRegistry.address);
        })
        .then(() => {
            return deployer.deploy(DoctorRegistry, PatientEMRStorage.address, AuthorityRegistry.address);
        })
        .then(() => {
            return deployer.deploy(
                DoctorAssociationRegistry,
                PatientEMRStorage.address,
                DoctorRegistry.address,
                AuthorityRegistry.address
            );
        })
        .then(() => {
            console.log("All contracts deployed successfully.");
        })
        .catch((error) => {
            console.error("Error deploying contracts:", error.message);
        });
};
