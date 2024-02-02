// SPDX-License-Identifier: MIT 
pragma solidity 0.8.0;

import "./PatientEMR.sol";
import "./DoctorStorage.sol";

contract DoctorAssociationContract {
    address public owner;
    PatientEMR public patientEMRContract;
    DoctorStorage public doctorStorageContract;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(address _patientEMRContract, address _doctorStorageContract) {
        owner = msg.sender;
        patientEMRContract = PatientEMR(_patientEMRContract);
        doctorStorageContract = DoctorStorage(_doctorStorageContract);
    }

    struct DoctorAssociation {
        string patientNic;
        string doctorNic;
        string appointmentId;
        string token;
        string validateDate;
        string doctorWalletAddress;
    }

    // Mapping to store associations for each patient
    mapping(string => DoctorAssociation[]) public patientDoctorAssociations;
    event DoctorAssociated(string patientNic, string doctorNic, string token);

    // Function to associate a doctor with a patient
    function associateDoctorWithPatient(
        string memory patientNic,
        string memory doctorNic,
        string memory appointmentId,
        string memory token,
        string memory validateDate,
        string memory doctorWalletAddress,
        string memory patientWalletAddress
    ) public {
        require(doctorStorageContract.isNICAlreadyRegistered(doctorNic), "Doctor NIC is not registered");
        require(
            msg.sender == owner || keccak256(abi.encodePacked(patientWalletAddress)) == keccak256(abi.encodePacked(patientEMRContract.getPatientWalletAddress(patientNic))),
            "Not authorized to add doctor association"
        );

        DoctorAssociation memory newAssociation = DoctorAssociation({
            patientNic: patientNic,
            doctorNic: doctorNic,
            appointmentId: appointmentId,
            token: token,
            validateDate: validateDate,
            doctorWalletAddress: doctorWalletAddress
        });

        // Add the new association to the array
        patientDoctorAssociations[patientNic].push(newAssociation);

        emit DoctorAssociated(patientNic, doctorNic, token);
    }

    // Doctor Association
    function getDoctorAssociationsByDoctorNicAndWallet(string memory doctorNic, string memory doctorWalletAddress) public view returns (DoctorAssociation[] memory) {
        require(doctorStorageContract.isNICAlreadyRegistered(doctorNic), "Doctor NIC is not registered");

        uint256 count = 0;
        DoctorAssociation[] memory doctorAssociations;

        // Count the number of associations associated with the doctor
        for (uint256 i = 0; i < patientEMRContract.getRegisteredNICsCount(); i++) {
            string memory patientNic = patientEMRContract.getRegisteredNICAtIndex(i);
            DoctorAssociation[] storage associations = patientDoctorAssociations[patientNic];
            for (uint256 j = 0; j < associations.length; j++) {
                if (keccak256(abi.encodePacked(associations[j].doctorNic)) == keccak256(abi.encodePacked(doctorNic))) {
                    count++;
                }
            }
        }

        // Check if there are associations
        if (count > 0) {
            doctorAssociations = new DoctorAssociation[](count);
            uint256 index = 0;

            // Retrieve doctor associations
            for (uint256 i = 0; i < patientEMRContract.getRegisteredNICsCount(); i++) {
                string memory patientNic = patientEMRContract.getRegisteredNICAtIndex(i);
                DoctorAssociation[] storage associations = patientDoctorAssociations[patientNic];
                for (uint256 j = 0; j < associations.length; j++) {
                    if (keccak256(abi.encodePacked(associations[j].doctorNic)) == keccak256(abi.encodePacked(doctorNic))) {
                        // Check if the wallet address matches
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

        // Count the number of patients associated with the doctor for the given date
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

        // Create an array to store patient associations
        DoctorAssociation[] memory patientAssociations = new DoctorAssociation[](count);
        uint256 index = 0;

        // Retrieve patient associations for the given date
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

    function getEMRData(string memory patientNic, string memory token, string memory todayDate, string memory walletAddress) public view returns (PatientEMR.EMR memory) {
        require(patientEMRContract.isNICRegistered(patientNic), "Patient NIC is not registered");
        require(isCallerAssociatedWithPatient(patientNic, walletAddress, token, todayDate), "Invalid caller address or token");
        return patientEMRContract.doctorGetEMRData(patientNic);
    }
}