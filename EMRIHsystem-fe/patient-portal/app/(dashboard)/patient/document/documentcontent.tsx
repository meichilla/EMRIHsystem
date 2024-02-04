'use client'
import { ChangeEvent, useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import EmptyTable from "./empty_table";
import { encrypt } from "@/components/utils/crypto";
import axios from "axios";
import { CgSoftwareDownload } from "react-icons/cg";

interface Document {
  appointmentid: number,
  filename: string,
  filesize: number,
  filetype: string,
  date: Date,
  fileUrl: string,
}

const DocumentContent: React.FC = () => {
  const { personalData, patientData, appointmentHistory, documents, accessToken, doctorPrescriptions, patientAdditions } = useAuth();
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');

  useEffect(() => {
    
  },[personalData, appointmentHistory, documents])


  useEffect(() => {

    const getCurrentDayAndDate = () => {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const currentDate = new Date();
      const dayOfWeek = daysOfWeek[currentDate.getDay()];
      const dayOfMonth = currentDate.getDate();
      const month = monthsOfYear[currentDate.getMonth()];
      const year = currentDate.getFullYear();

      const formattedDate = `${dayOfWeek}, ${dayOfMonth} ${month} ${year}`;

      setCurrentDayAndDate(formattedDate);
    };

    getCurrentDayAndDate();
  }, [personalData]);

  const handleDownloadClick = (doc: Document) => {
    const downloadLink = document.createElement('a');
    downloadLink.href = doc.fileUrl;
    console.log(doc.fileUrl);
    downloadLink.download = doc.filename;
    downloadLink.target = '_blank';
    downloadLink.click();
  };

  return (
      <div className="flex min-h-screen">
        <Menu/>
        <><h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
            {currentDayAndDate}
          </h5>
          <div className="max-w-7xl">
            <div className="mx-auto max-h-screen my-16 px-8"
              style={{
                overflow: 'auto',
                maxHeight: '850px',
              }}
            >
              <h4 className="h4 mt-5">Documents ({documents.length})</h4>
              {documents.length > 0 ? (
                <div className="mt-5 pb-16 items-center border border-blue-900 rounded rounded-[20px] px-8">
                    {/* Group prescriptions by appointment session */}
                    {Array.from(new Set(documents.map((doc) => doc.appointmentid))).map((appointmentId, index) => {
                    const documentForAppointments = documents.filter((doc) => doc.appointmentid === appointmentId);
                    const appointment = appointmentHistory.find((appointment) => appointment.appointmentId === appointmentId);
                    console.log(appointment)

                    return (
                        <><h4 className="m-2 h4 pt-2 text-blue-500 text-left font-semibold">{appointment?.session ?? 'Facial Charcoal'} at {appointment?.hospital} ({documentForAppointments.length})</h4><div
                            key={index}
                            className="w-full grid grid-cols-2"
                            style={{
                                background: 'white',
                                borderRadius: '10px',
                            }}
                        >
                            {documentForAppointments.map((doc, index) => (
                                <div key={index} className="m-2 flex border border-blue-900 rounded items-center">
                                  {doc.filetype === 'application/pdf' ? (
                                      <iframe
                                        src={doc.fileUrl}
                                        frameBorder="0"
                                        scrolling="no"
                                        width="100%"
                                        height="400px"
                                      ></iframe>
                                    ) : (
                                      <img src={doc.fileUrl} alt={doc.filename} style={{ width: '200px', height: '200px' }} />
                                    )}
                                    <h4 className="px-4">{doc.filename}</h4>
                                    <div className="mx-4 flex">
                                      <span>Download</span>
                                      <CgSoftwareDownload className="ml-2 h-6 w-6 hover:cursor-pointer"
                                      onClick={() => handleDownloadClick(doc)}
                                      />
                                    </div>
                                </div>
                            ))}
                        </div></>
                    );
                    })}
                </div>
                ) : (
                <div className="py-16">
                    <EmptyTable />
                </div>
                )}
            </div>
          </div>
        </>
      </div>
  );
};

export default DocumentContent
