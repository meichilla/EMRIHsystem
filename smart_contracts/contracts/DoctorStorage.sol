// SPDX-License-Identifier: MIT 
pragma solidity 0.8.0;

import "./PatientEMR.sol";

contract DoctorStorage {
    address public owner;
    PatientEMR public patientEMRContract;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(address _patientEMRContract) {
        owner = msg.sender;
        patientEMRContract = PatientEMR(_patientEMRContract);
    }

    struct Doctor {
        string email;
        string name;
        string password;
        string nic;
        string telephone;
        string walletAddress;
        string specialties;
        string hospital;
    }

    struct DoctorAssociation {
        string patientNic;
        string doctorNic;
        string token;
        string validateDate;
        string doctorWalletAddress;
    }

    mapping(string => Doctor) public doctors;
    mapping(string => bool) public isNICRegistered;
    mapping(string => bool) public isWalletRegistered;
    string[] public registeredNICs;
    string[] public doctorRegisteredNICs;

    event DoctorAdded(string email, string name, string nic, string hospital);
    event DoctorAssociated(string patientNic, string doctorNic, string token);
    event DoctorDeleted(string doctorNic);
    event DoctorUpdated(string email, string name, string telephone, string specialties);

    // Doctor
    function addDoctor(
        string memory email,
        string memory name,
        string memory password,
        string memory nic,
        string memory telephone,
        string memory walletAddress,
        string memory specialties,
        string memory hospital
    ) public onlyOwner {
        require(!isNICRegistered[nic], "NIC is already registered");

        Doctor memory newDoctor = Doctor({
            email: email,
            name: name,
            password: password,
            nic: nic,
            telephone: telephone,
            walletAddress: walletAddress,
            specialties: specialties,
            hospital: hospital
        });

        doctors[nic] = newDoctor;
        isNICRegistered[nic] = true;
        doctorRegisteredNICs.push(nic);

        emit DoctorAdded(email, name, nic, hospital);
    }

    function updateDoctorData(
        string memory doctorNic,
        string memory newEmail,
        string memory newName,
        string memory newTelephone,
        string memory newSpecialties
    ) public onlyOwner {
        require(isNICRegistered[doctorNic], "Doctor NIC is not registered");

        Doctor storage doctor = doctors[doctorNic];
        if (bytes(newEmail).length > 0) {
            doctor.email = newEmail;
        }
        if (bytes(newName).length > 0) {
            doctor.name = newName;
        }
        if (bytes(newTelephone).length > 0) {
            doctor.telephone = newTelephone;
        }
        if (bytes(newSpecialties).length > 0) {
            doctor.specialties = newSpecialties;
        }

        emit DoctorUpdated(newEmail, newName, newTelephone, newSpecialties);
    }

    
    function isNICAlreadyRegistered(string memory nic) public view returns (bool) {
        return isNICRegistered[nic];
    }

    function getDoctorDetails(string memory doctorNic) public view returns (Doctor memory) {
        require(isNICRegistered[doctorNic], "Doctor NIC is not registered");
        return doctors[doctorNic];
    }

    function validateDoctorLogin(string memory email, string memory password, string memory doctorNic, string memory hospital) public view returns (string memory message, Doctor memory doctorData) {
        
        if (isNICRegistered[doctorNic]) {
            Doctor memory doctor = doctors[doctorNic];

            require(
                keccak256(abi.encodePacked(email)) == keccak256(abi.encodePacked(doctor.email)),
                "Invalid email"
            );
            require(
                keccak256(abi.encodePacked(password)) == keccak256(abi.encodePacked(doctor.password)),
                "Invalid password"
            );
            require(
                keccak256(abi.encodePacked(hospital)) == keccak256(abi.encodePacked(doctor.hospital)),
                "Invalid hospital"
            );

            message = "Login Successfully";
            doctorData = Doctor({
                email: doctor.email,
                name: doctor.name,
                password: doctor.password,
                nic: doctor.nic,
                telephone: doctor.telephone,
                walletAddress: doctor.walletAddress,
                specialties: doctor.specialties,
                hospital: doctor.hospital
            });
        } else {
            message = "Doctor NIC not registered";
            doctorData = Doctor("", "", "", "", "", "", "", "");
        }
    }

    function deleteDoctor(string memory doctorNic) public onlyOwner {
        require(bytes(doctors[doctorNic].name).length > 0, "Doctor not found");
        delete doctors[doctorNic];
        emit DoctorDeleted(doctorNic);
    }

    // Helper function to compare strings
    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
    
}
