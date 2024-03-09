// SPDX-License-Identifier: MIT 
pragma solidity 0.8.20;

import "./PatientEMRStorage.sol";
import "./DoctorRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AuthorityRegistry.sol";

contract DoctorAssociationRegistry is Ownable {

    PatientEMRStorage public patientEMRContract;
    DoctorRegistry public doctorStorageContract;    
    AuthorityRegistry public authorityRegistry;

    modifier onlyAuthority() {
        require(authorityRegistry.isAuthority(msg.sender), "Caller is not an authority");
        _;
    }

    constructor(address _patientEMRContract, address _doctorStorageContract, address _authorityRegistryAddress) Ownable(_authorityRegistryAddress) {
        patientEMRContract = PatientEMRStorage(_patientEMRContract);
        doctorStorageContract = DoctorRegistry(_doctorStorageContract);
        authorityRegistry = AuthorityRegistry(_authorityRegistryAddress);
    }

    struct DoctorAssociation {
        string patientNic;
        string doctorNic;
        string appointmentId;
        string token;
        string validateDate;
        string doctorWalletAddress;
    }

    mapping(string => DoctorAssociation[]) public patientDoctorAssociations;
    event DoctorAssociated(string patientNic, string doctorNic, string token);

    function associateDoctorWithPatient(
        string memory patientNic,
        string memory doctorNic,
        string memory appointmentId,
        string memory token,
        string memory validateDate,
        string memory doctorWalletAddress
    ) public onlyAuthority {
        require(doctorStorageContract.isNICAlreadyRegistered(doctorNic), "Doctor NIC is not registered");

        DoctorAssociation memory newAssociation = DoctorAssociation({
            patientNic: patientNic,
            doctorNic: doctorNic,
            appointmentId: appointmentId,
            token: token,
            validateDate: validateDate,
            doctorWalletAddress: doctorWalletAddress
        });

        patientDoctorAssociations[patientNic].push(newAssociation);

        emit DoctorAssociated(patientNic, doctorNic, token);
    }

    function getDoctorAssociationsByDoctorNicAndWallet(string memory doctorNic, string memory doctorWalletAddress) public view returns (DoctorAssociation[] memory) {
        require(doctorStorageContract.isNICAlreadyRegistered(doctorNic), "Doctor NIC is not registered");

        uint256 count = 0;
        DoctorAssociation[] memory doctorAssociations;

        for (uint256 i = 0; i < patientEMRContract.getRegisteredNICsCount(); i++) {
            string memory patientNic = patientEMRContract.getRegisteredNICAtIndex(i);
            DoctorAssociation[] storage associations = patientDoctorAssociations[patientNic];
            for (uint256 j = 0; j < associations.length; j++) {
                if (keccak256(abi.encodePacked(associations[j].doctorNic)) == keccak256(abi.encodePacked(doctorNic))) {
                    count++;
                }
            }
        }

        if (count > 0) {
            doctorAssociations = new DoctorAssociation[](count);
            uint256 index = 0;

            for (uint256 i = 0; i < patientEMRContract.getRegisteredNICsCount(); i++) {
                string memory patientNic = patientEMRContract.getRegisteredNICAtIndex(i);
                DoctorAssociation[] storage associations = patientDoctorAssociations[patientNic];
                for (uint256 j = 0; j < associations.length; j++) {
                    if (keccak256(abi.encodePacked(associations[j].doctorNic)) == keccak256(abi.encodePacked(doctorNic))) {
                        if (keccak256(abi.encodePacked(associations[j].doctorWalletAddress)) == keccak256(abi.encodePacked(doctorWalletAddress))) {
                            doctorAssociations[index] = associations[j];
                            index++;
                        }
                    }
                }
            }
        }

        return doctorAssociations;
    }

    function getPatientsForTodayByDoctorNic(string memory doctorNic, string memory todayDate) public view returns (DoctorAssociation[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < patientEMRContract.getRegisteredNICsCount(); i++) {
            string memory patientNic = patientEMRContract.getRegisteredNICAtIndex(i);
            DoctorAssociation[] storage associations = patientDoctorAssociations[patientNic];
            for (uint256 j = 0; j < associations.length; j++) {
                if (keccak256(abi.encodePacked(associations[j].doctorNic)) == keccak256(abi.encodePacked(doctorNic)) &&
                    keccak256(abi.encodePacked(associations[j].validateDate)) == keccak256(abi.encodePacked(todayDate))) {
                    count++;
                }
            }
        }

        DoctorAssociation[] memory patientAssociations = new DoctorAssociation[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < patientEMRContract.getRegisteredNICsCount(); i++) {
            string memory patientNic = patientEMRContract.getRegisteredNICAtIndex(i);
            DoctorAssociation[] storage associations = patientDoctorAssociations[patientNic];
            for (uint256 j = 0; j < associations.length; j++) {
                if (keccak256(abi.encodePacked(associations[j].doctorNic)) == keccak256(abi.encodePacked(doctorNic)) &&
                    keccak256(abi.encodePacked(associations[j].validateDate)) == keccak256(abi.encodePacked(todayDate))) {
                    patientAssociations[index] = associations[j];
                    index++;
                }
            }
        }

        return patientAssociations;
    }

    function isCallerAssociatedWithPatient(string memory patientNic, string memory walletAddress, string memory token, string memory todayDate) public view returns (bool) {
        DoctorAssociation[] memory doctorAssociationsList = patientDoctorAssociations[patientNic];
        
        for (uint256 i = 0; i < doctorAssociationsList.length; i++) {
            if (
                keccak256(abi.encodePacked(doctorAssociationsList[i].doctorWalletAddress)) == keccak256(abi.encodePacked(walletAddress)) &&
                keccak256(abi.encodePacked(doctorAssociationsList[i].token)) == keccak256(abi.encodePacked(token)) &&
                keccak256(abi.encodePacked(doctorAssociationsList[i].validateDate)) == keccak256(abi.encodePacked(todayDate))
            ) {
                return true;
            }
        }

        return false;
    }

    function getEMRData(string memory patientNic, string memory token, string memory todayDate, string memory walletAddress) public view returns (PatientEMRStorage.EMR memory) {
        require(patientEMRContract.isNICRegistered(patientNic), "Patient NIC is not registered");
        require(isCallerAssociatedWithPatient(patientNic, walletAddress, token, todayDate), "Invalid caller address or token");
        return patientEMRContract.doctorGetEMRData(patientNic);
    }
}