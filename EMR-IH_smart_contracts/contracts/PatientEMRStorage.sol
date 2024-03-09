// SPDX-License-Identifier: MIT 
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AuthorityRegistry.sol";

contract PatientEMRStorage is Ownable {
    AuthorityRegistry public authorityRegistry;
    uint256 public difficulty = 5;

    constructor(address _authorityRegistryAddress) Ownable(_authorityRegistryAddress) {
        authorityRegistry = AuthorityRegistry(_authorityRegistryAddress);
    }

    modifier onlyAuthority() {
        require(authorityRegistry.isAuthority(msg.sender), "Caller is not an authority");
        _;
    }

    struct Patient {
        string name;
        string homeAddress;
        string dob;
        string telephone;
        string email;
        string password;
        string nic;
        string walletAddress;
        string token;
        string noRekamMedis;
        string urlKTP;
    }

    struct EMR {
        string patientNic;
        string dob;
        string noRekamMedis;
        string medicalRecord;
    }

    mapping(string => Patient) public patients;
    mapping(string => EMR) public emrRecords;
    mapping(string => bool) public isNICRegistered;
    mapping(string => bool) public isWalletRegistered;
    string[] public registeredNICs;

    event PatientRegistered(string nic, string name, string walletAddress);
    event EMRRecordUpdated(string patientNic, string noRekamMedis);
    event PatientTokenUpdated(string nic, string newToken);

    function mine(uint256 nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(nonce));
    }

    function checkProofOfWork(uint256 nonce) internal view returns (bool) {
        bytes32 hash = mine(nonce);
        bytes32 target = bytes32(uint256(1) << (256 - difficulty));

        return hash < target;
    }

    function setDifficulty(uint256 _difficulty) external onlyOwner {
        difficulty = _difficulty;
    }
    
    //Patient
    function registerPatient(
        string memory name,
        string memory homeAddress,
        string memory dob,
        string memory email,
        string memory telephone,
        string memory password,
        string memory nic,
        string memory walletAddress,
        string memory token,
        string memory noRekamMedis,
        string memory urlKTP
    ) public {
        require(!isNICRegistered[nic], "NIC is already registered");
        require(!isWalletRegistered[walletAddress], "Wallet address is already registered");
        
        string memory existingNoRekamMedis = getEMRNoRekamMedis(nic, dob);
        if (bytes(existingNoRekamMedis).length > 0) {
            noRekamMedis = existingNoRekamMedis;
        }

        Patient memory newPatient = Patient({
            name: name,
            homeAddress: homeAddress,
            dob: dob,
            email: email,
            telephone: telephone,
            password: password,
            nic: nic,
            walletAddress: walletAddress,
            token: token,
            noRekamMedis: noRekamMedis,
            urlKTP: urlKTP
        });

        patients[nic] = newPatient;
        isNICRegistered[nic] = true;
        isWalletRegistered[walletAddress] = true;
        registeredNICs.push(nic);

        authorityRegistry.addAuthority(msg.sender);
        emit PatientRegistered(nic, name, walletAddress);

    }

    function updatePatientData(
        string memory nic,
        string memory newName,
        string memory newHomeAddress,
        string memory newTelephone,
        string memory newEmail,
        string memory newPassword,
        uint256 nonce
    ) public onlyAuthority {
        require(isNICRegistered[nic], "NIC is not registered");
        require(checkProofOfWork(nonce), "PoW validation failed");

        Patient storage patient = patients[nic];
        if (bytes(newName).length > 0) {
            patient.name = newName;
        }
        if (bytes(newHomeAddress).length > 0) {
            patient.homeAddress = newHomeAddress;
        }
        if (bytes(newTelephone).length > 0) {
            patient.telephone = newTelephone;
        }
        if (bytes(newEmail).length > 0) {
            patient.email = newEmail;
        }
        if (bytes(newPassword).length > 0) {
            patient.password = newPassword;
        }

        emit PatientRegistered(nic, newName, patient.walletAddress);
    }

    function updatePatientToken(string memory nic, string memory newToken) public onlyAuthority {
        require(isNICRegistered[nic], "NIC is not registered");
        patients[nic].token = newToken;
        emit PatientTokenUpdated(nic, newToken);
    }

    function getPatientDetails(string memory nic) public view returns (Patient memory) {
        require(isNICRegistered[nic], "NIC is not registered");
        Patient memory patient = patients[nic];
        return patient;
    }

    function isNICAlreadyRegistered(string memory nic) public view returns (bool) {
        return isNICRegistered[nic];
    }

    function validateLogin(
        string memory nic,
        string memory password,
        string memory walletAddress
    ) public view returns (string memory message, Patient memory patientData) {
        if (isNICRegistered[nic]) {
            Patient memory patient = patients[nic];

        require(
            keccak256(abi.encodePacked(password)) == keccak256(abi.encodePacked(patient.password)),
            "Invalid password"
        );
        require(
            keccak256(abi.encodePacked(walletAddress)) == keccak256(abi.encodePacked(patient.walletAddress)),
            "Invalid wallet address"
        );

        message = "Login Successfully";
        patientData = Patient({
            name: patient.name,
            homeAddress: patient.homeAddress,
            dob: patient.dob,
            email: patient.email,
            telephone: patient.telephone,
            password: patient.password,
            nic: patient.nic,
            walletAddress: patient.walletAddress,
            token: patient.token,
            noRekamMedis: patient.noRekamMedis,
            urlKTP: patient.urlKTP
        });
        } else {
            message = "NIC not registered";
            patientData = Patient("", "", "", "", "", "", "", "", "", "", "");
        }
    }

    // EMR
    function addEMRData(
        string memory patientNic,
        string memory dob,
        string memory noRekamMedis,
        string memory medicalRecord,
        uint256 nonce
    ) public onlyAuthority{  
        require(checkProofOfWork(nonce), "PoW validation failed");
        string memory existingNoRekamMedis = getEMRNoRekamMedis(patientNic, dob);
        require(bytes(existingNoRekamMedis).length == 0, "EMR data already exists");

        EMR memory newEMR = EMR({
            patientNic: patientNic,
            dob: dob,
            noRekamMedis: noRekamMedis,
            medicalRecord: medicalRecord
        });

        emrRecords[patientNic] = newEMR;

        emit EMRRecordUpdated(patientNic, noRekamMedis);
    }

    function isEMRDataExist(string memory patientNic, string memory dob) public view returns (bool, string memory) {
        string memory existingNoRekamMedis = getEMRNoRekamMedis(patientNic, dob);
        if (bytes(existingNoRekamMedis).length > 0) {
            return (true, existingNoRekamMedis);
        } else {
            return (false, "");
        }
    }
    
    function getEMRData(string memory patientNic, string memory token, string memory patientWalletAddress) public view returns (EMR memory) {
        require(isNICRegistered[patientNic], "Patient NIC is not registered");
        require(keccak256(abi.encodePacked(patientWalletAddress)) == keccak256(abi.encodePacked(patients[patientNic].walletAddress)), "Not authorized to add EMR data");
        require(keccak256(abi.encodePacked(token)) == keccak256(abi.encodePacked(patients[patientNic].token)),"Invalid token");

        return emrRecords[patientNic];
    }

    function doctorGetEMRData(string memory patientNic) public view returns (EMR memory) {
        return emrRecords[patientNic];
    }

    function updateEMRData(
        string memory patientNic,
        string memory dob,
        string memory noRekamMedis,
        string memory medicalRecord,
        string memory token,
        bool isValidated,
        uint256 nonce
    ) public onlyAuthority {
        require(checkProofOfWork(nonce), "PoW validation failed");

        if (isValidated)
        {
            string memory existingNoRekamMedis = getEMRNoRekamMedis(patientNic, dob);

            if (bytes(existingNoRekamMedis).length == 0) {
                EMR memory newEMR = EMR({
                    patientNic: patientNic,
                    dob: dob,
                    noRekamMedis: noRekamMedis,
                    medicalRecord: medicalRecord
                });
                emrRecords[patientNic] = newEMR;
            } else {
                emrRecords[patientNic].medicalRecord = medicalRecord;
            }

            emit EMRRecordUpdated(patientNic, noRekamMedis);
        }
        else 
        {
            require(isNICRegistered[patientNic], "Patient NIC is not registered");
            require(
                    keccak256(abi.encodePacked(token)) == keccak256(abi.encodePacked(patients[patientNic].token)),
                    "Invalid token"
                );
                require(
                    keccak256(abi.encodePacked(emrRecords[patientNic].dob)) == keccak256(abi.encodePacked(dob)) &&
                    keccak256(abi.encodePacked(emrRecords[patientNic].noRekamMedis)) == keccak256(abi.encodePacked(noRekamMedis)),
                    "Invalid data"
                );
            emrRecords[patientNic].medicalRecord = medicalRecord;
            emit EMRRecordUpdated(patientNic, noRekamMedis);
        }
    }

    function getPatientWalletAddress(string memory patientNic) external view returns (string memory) {
        require(isNICRegistered[patientNic], "Patient NIC is not registered");
        return patients[patientNic].walletAddress;
    }

    function getRegisteredNICsCount() public view returns (uint256) {
        return registeredNICs.length;
    }

    function getRegisteredNICAtIndex(uint256 index) public view returns (string memory) {
        require(index < registeredNICs.length, "Index out of bounds");
        return registeredNICs[index];
    }

    function getEMRNoRekamMedis(string memory nic, string memory dob) internal view returns (string memory) {
        if (compareStrings(emrRecords[nic].dob, dob)) {
            return emrRecords[nic].noRekamMedis;
        }
        return "";
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
    
}