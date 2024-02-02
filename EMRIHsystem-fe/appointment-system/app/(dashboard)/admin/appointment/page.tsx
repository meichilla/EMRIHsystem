'use client'
import { useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import Spinner from "@/public/common/spinner";
import Pagination from "@/components/utils/pagination";
import EmptyTable from "../schedule/empty_table";

const AppointmentPage: React.FC = () => {
  const { hospital } = useAuth();
  const hospitalId = hospital?.id
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [upcomingBookingData, setUpcomingBookingData] = useState<{
    patientName: string,
    patientId: number,
    noRM: string,
    appointmentNumber: string;
    sessionTitle: string;
    doctor: string;
    scheduleDate: string;
    scheduleTime: string;
    statusDone: boolean;
  }[]>([]);    
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;

  const handlePageChange = (direction: string) => {
    // Handle page change logic based on the direction (prev/next)
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    setCurrentPage(newPage);
    // Fetch data for the new page or update the displayed data accordingly
  };

  const handlePageClick = (pageNumber: number) => {
    // Handle page click logic
    setCurrentPage(pageNumber);
    // Fetch data for the clicked page or update the displayed data accordingly
  };

  const handleChangeRowPerPage = (rowsPerPage: string) => {
    // Handle change rows per page logic
    setRowsPerPage(parseInt(rowsPerPage, 10));
    // Fetch data or update the displayed data accordingly
  };

  useEffect(() => {
    fetchDataAppointment();

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
    setCurrentPage(1); 
    const totalSessions = upcomingBookingData.length;
    const totalPages = Math.ceil(totalSessions / rowsPerPage);
    if (totalPages > 0) setTotalPages(totalPages)
  }, [totalPages, rowsPerPage]);

  const fetchDataAppointment = async () => {
    try {
      const response = await fetch(`http://localhost:3000/appointments/allpatients/${hospitalId}`);

      if (response.ok) {
        const data = await response.json();
        setSessionCount(data.length);
        setUpcomingBookingData(data);
      }
    } catch (error) {
      console.error('Error during get session list:', error);
    }
  };

  return (
      <div className="flex min-h-screen">
        <Menu/>
        <h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
          {currentDayAndDate}
        </h5>
        <div className="max-w-8xl mx-auto min-h-screen w-full">
          <h4 className="h4 mt-5 ml-8 ">All Sessions ({sessionCount})</h4>
        </div>


       <div className="max-w-7xl mx-auto max-h-screen w-full ml-80 mt-24 absolute"
        style={{
          overflow: 'auto',
          maxHeight: '650px',
        }}
        >
                  <table className="w-full py-4">
            <thead className="bg-[#ecebfa] text-center text-[20px]">
              <tr>
                  <th className="rounded-tl-[4px] py-4 px-2">No.</th>
                  <th className="py-2 px-2">Title</th>
                  <th className="py-2">Doctor Name</th>
                  <th className="py-2">Patient Name</th>
                  <th className="py-2">No-RM</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Time</th>
                  <th className="py-2">Status</th>
              </tr>
            </thead>
            {upcomingBookingData.length === 0 ? null : (
            <tbody className="text-center text-[16px]">
                {upcomingBookingData
                .slice(startIdx, endIdx)
                .map((appointment, index) => (
                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9FF]'}`}>
                    <td className="py-6">{index + 1}</td>
                    <td>{appointment.sessionTitle}</td>
                    <td>{appointment.doctor}</td>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.noRM}</td>
                    <td>{appointment.scheduleDate}</td>
                    <td>{appointment.scheduleTime}</td>
                    <td>{appointment.statusDone}</td>
                </tr>
                ))}
            </tbody>
                )}
            </table>
            {upcomingBookingData.length === 0 ? (
              <EmptyTable/>
            ) : (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              handlePageChange={handlePageChange}
              handlePageClick={handlePageClick}
              handleChangeRowPerPage={handleChangeRowPerPage}
            />
            )} 

        </div>
      </div>
  );
};

export default AppointmentPage
