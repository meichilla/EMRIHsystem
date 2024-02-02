'use client'
import { useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import Link from "next/link";
import EmptyTable from "./empty_table";
import axios from "axios";
import { decrypt, encrypt } from "@/components/utils/crypto";

interface Session {
  scheduleid: number,
  docid: number;
  title: string,
  scheduledate: string,
  scheduletime: string,
  nop: number,
  hospitalid: number,
  price: string,
  totalpatients: number,
  docname: string,
  specialties: string,
  status: string,
}

const SessionPage: React.FC = () => {
  const { hospital, doctorData, setMenu, setSearchKeySession } = useAuth();
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [ongoingSessionList, setOngoingSessionList] = useState<Session[]>([]);
  const [historySessionList, setHistorySessionList] = useState<Session[]>([]);
  const [upcomingSessionList, setUpcomingSessionList] = useState<Session[]>([]);

  const fetchDataSession = async () => {
    try {
      const encryptedData = encrypt(JSON.stringify({
        docid: doctorData?.docid,
        hospitalid: hospital?.id
      }));
      const response = await axios.post(`http://localhost:3000/emr/sessions`, { data: encryptedData });

      const resp = await JSON.parse(decrypt(response.data));
      console.log(resp);
      setOngoingSessionList(resp.sessions.inProgressSessions);
      setHistorySessionList(resp.sessions.doneSessions);
      setUpcomingSessionList(resp.sessions.waitingSessions);
      const ongoing = resp.sessions.inProgressSessions.length;
      const history = resp.sessions.doneSessions.length;
      const upcoming = resp.sessions.waitingSessions.length;
      setSessionCount(ongoing+history+upcoming)
    } catch (error) {
      console.error('Error during get session list:', error);
    }
  };

  useEffect(() => {
    fetchDataSession();

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
  }, []);

  const handleCheckPatientList = async (title : string) => {
    setMenu(0);
    setSearchKeySession(title);
  }

  return (
      <div className="flex min-h-screen">
        <Menu/>
        <h5 className="text-lg absolute top-0 right-0 mx-auto mr-8 p-2 font-semibold">
          {currentDayAndDate}
        </h5>
        <div className="border-l border max-w-8xl mx-auto min-h-screen w-full">
          <h4 className="h4 mt-5 ml-8 ">All Sessions ({sessionCount})</h4>
          <div className="grid grid-cols-2 py-16">

            <div className="col-1 row-span-1 px-8 mr-8">
              <h4 className="h4">Ongoing</h4>
              <div className="mx-auto pr-8 pb-2"
                style={{
                  overflow: 'auto',
                  maxHeight: '800px',
                }}
                >
                { ongoingSessionList.length > 0 ? (
                  <div className="mt-5 items-center">
                    {ongoingSessionList.map((session, index) => (
                    <div className="w-full border mr-40 mt-5"
                    key={index}
                    style={{
                      background: 'white',
                      borderRadius: '20px',
                      padding: '30px',
                    }}
                  >
                    <h4 className="h4 py-2 text-blue-500 text-left font-semibold">{session.title}</h4>
                    <h5 className="h5 mb-2 text-left font-semibold">Total patients : {session.totalpatients}/{session.nop}</h5>
                    {/* <h5 className="h5 mb-2 text-right font-semibold">{session.scheduledate}</h5> */}
                    <h5 className="h5 text-right font-semibold">{session.scheduletime.split(':')[0]}:{session.scheduletime.split(':')[1]} WIB</h5>
                    <button
                      disabled={session.totalpatients == 0}
                      className={`border btn-sm text-gray-100 bg-blue-500
                      ${session.totalpatients == 0 ? 'bg-gray-400' : 'hover:bg-blue-700'}
                      `}
                      onClick={() => handleCheckPatientList(session.title)}
                      >
                      <Link href={`${session.totalpatients !== 0 && '/doctor/patient'} `}>
                          <span>See Patients</span>
                      </Link>
                    </button>
                    {/* <button
                      disabled={session.totalpatients !== 10}
                      className={`ml-4 border btn-sm text-gray-100 bg-blue-500
                      ${session.totalpatients !== 10 ? 'bg-gray-400' : 'hover:bg-blue-700'}
                      `}
                      // onClick={() => handleCheckPatientList(session.title)}
                      >
                        <span>End Session</span>
                    </button> */}
                  </div>
                  ))}
                </div>
                ) : (
                  <>
                  <EmptyTable/>
                  </>
                )}
              </div>
            </div>
            <div className="col-1 row-2 row-span-1 px-8 mr-8">
              <h4 className="h4">Upcoming</h4>
              <div className="mx-auto h-full pr-8 pb-2"
                style={{
                  overflow: 'auto',
                  maxHeight: '800px',
                }}
                >
                {upcomingSessionList.length > 0 ? (
                  <div className="mt-5 items-center">
                    {upcomingSessionList.map((session, index) => (
                    <div className="w-full border"
                    key={index}
                    style={{
                      background: 'white',
                      borderRadius: '20px',
                      padding: '32px',
                    }}
                  >
                    <h4 className="h4 text-blue-500 text-left font-semibold">{session.title}</h4>
                    <h5 className="h5 text-left font-semibold">Total patients : {session.totalpatients}/{session.nop}</h5>
                    <h5 className="h5 text-right font-semibold">{session.scheduledate}</h5>
                    {/* <h5 className="h5 text-right font-semibold">{session.scheduletime.split(':')[0]}:{session.scheduletime.split(':')[1]} WIB</h5> */}
                  </div>
                  ))}
                </div>
                ) : (
                  <>
                  <EmptyTable/>
                  </>
                )}

                <h4 className="h4 pt-8">History</h4>
                {historySessionList.length > 0 ? (
                  <div className="mt-5 items-center">
                    {historySessionList.map((session, index) => (
                    <div className="w-full border mr-40 mt-5"
                    key={index}
                    style={{
                      background: 'white',
                      borderRadius: '20px',
                      padding: '32px',
                    }}
                  >
                    <h4 className="h4 text-blue-500 text-left font-semibold">{session.title}</h4>
                    <h5 className="h5 text-left font-semibold">Total patients : {session.totalpatients}/{session.nop}</h5>
                    <h5 className="h5 text-right font-semibold">{session.scheduledate}</h5>
                    {/* <h5 className="h5 text-left font-semibold">{session.scheduletime.split(':')[0]}:{session.scheduletime.split(':')[1]} WIB</h5> */}
                  </div>
                  ))}
                </div>
                ) : (
                  <>
                  <EmptyTable/>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SessionPage
