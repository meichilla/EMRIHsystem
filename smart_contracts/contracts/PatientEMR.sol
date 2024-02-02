// SPDX-License-Identifier: MIT 
pragma solidity 0.8.0;

contract PatientEMR {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
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
        
        // Check if EMR data already exists for the given NIC and dob
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

        emit PatientRegistered(nic, name, walletAddress);
    }

    function updatePatientData(
        string memory nic,
        string memory newName,
        string memory newHomeAddress,
        string memory newTelephone,
        string memory newEmail,
        string memory newPassword,
        string memory patientWalletAddress
    ) public {
        require(isNICRegistered[nic], "NIC is not registered");
        require(
            keccak256(abi.encodePacked(patientWalletAddress)) == keccak256(abi.encodePacked(patients[nic].walletAddress)),
            "Not authorized to update patient data"
        );

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

    function updatePatientToken(string memory nic, string memory newToken, string memory patientWalletAddress) public {
        require(isNICRegistered[nic], "NIC is not registered");
        require(
            keccak256(abi.encodePacked(patientWalletAddress)) == keccak256(abi.encodePacked(patients[nic].walletAddress)),
            "Not authorized to update patient data"
        );

        patients[nic].token = newToken;

        emit PatientTokenUpdated(nic, newToken);
    }

    function getPatientDetails(string memory nic) public view returns (Patient memory) {
        require(isNICRegistered[nic], "NIC is not registered");
        Patient memory patient = patients[nic];
        return patient;
    }

    function getAllPatients() public view returns (Patient[] memory) {
        Patient[] memory allPatients = new Patient[](registeredNICs.length);
        uint256 validPatientsCount = 0;

        for (uint256 i = 0; i < registeredNICs.length; i++) {
            string memory nic = registeredNICs[i];
            Patient memory patient = patients[nic];

            if (
                bytes(patient.name).length == 0 ||
                bytes(patient.homeAddress).length == 0 ||
                bytes(patient.dob).length == 0 ||
                bytes(patient.email).length == 0 ||
                bytes(patient.telephone).length == 0 ||
                bytes(patient.password).length == 0 ||
                bytes(patient.walletAddress).length == 0 ||
                bytes(patient.noRekamMedis).length == 0 ||
                bytes(patient.urlKTP).length == 0
            ) {
                continue;
            }

            allPatients[validPatientsCount] = patient;
            validPatientsCount++;
        }

        assembly {
            mstore(allPatients, validPatientsCount)
        }

        return allPatients;
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
        string memory patientWalletAddress
    ) public {  
        require(
            msg.sender == owner || keccak256(abi.encodePacked(patientWalletAddress)) == keccak256(abi.encodePacked(patients[patientNic].walletAddress)),
            "Not authorized to update patient data"
        );
        // Check if EMR data already exists for the given NIC and dob
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
        string memory patientWalletAddress
    ) public {

        if (isValidated)
        {
            // Check if EMR data already exists for the given NIC and dob
            string memory existingNoRekamMedis = getEMRNoRekamMedis(patientNic, dob);

            if (bytes(existingNoRekamMedis).length == 0) {
                // No existing EMR data, create a new one
                EMR memory newEMR = EMR({
                    patientNic: patientNic,
                    dob: dob,
                    noRekamMedis: noRekamMedis,
                    medicalRecord: medicalRecord
                });
                emrRecords[patientNic] = newEMR;
            } else {
                // Update existing EMR data
                emrRecords[patientNic].medicalRecord = medicalRecord;
            }

            emit EMRRecordUpdated(patientNic, noRekamMedis);
        }
        else 
        {
            require(isNICRegistered[patientNic], "Patient NIC is not registered");
            // Check if the caller is the patient
            if (keccak256(abi.encodePacked(patientWalletAddress)) == keccak256(abi.encodePacked(patients[patientNic].walletAddress))) {
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

    // Helper function to get EMR NoRekamMedis for the given NIC and dob
    function getEMRNoRekamMedis(string memory nic, string memory dob) internal view returns (string memory) {
        if (compareStrings(emrRecords[nic].dob, dob)) {
            return emrRecords[nic].noRekamMedis;
        }
        return "";
    }

    // Helper function to compare strings
    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
    
}