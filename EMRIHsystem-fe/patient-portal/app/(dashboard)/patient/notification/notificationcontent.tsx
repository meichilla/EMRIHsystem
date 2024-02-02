'use client'
import { useEffect, useState } from "react";
import Menu from "@/components/ui/menu";
import { useAuth } from "@/app/(auth)/AuthContext";
import EmptyTable from "./empty_table";
import axios from "axios";

const NotificationContentPage: React.FC = () => {
  const { accessToken, patientData } = useAuth();
  const [currentDayAndDate, setCurrentDayAndDate] = useState<string>('');
  const [notifications, setNotification] = useState<{
    id: number,
    message: string,
    date: string,
    time: string,
  }[]>([]);

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
    fetchNotifications();
  }, []);

  const deleteNotification = async (notifId : number) => {
    try {
      const response = await axios.get(`http://localhost:3000/notif/delete/${notifId}`,{
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          },
        });

      const data = await response.data;
      fetchNotifications();
    } catch (error) {
      console.error('Error during get notification:', error);
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/notif/all/${patientData?.id}`,{
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          },
        }); 

      const data = await response.data;
      setNotification(data);
    } catch (error) {
      console.error('Error during get notification:', error);
    }
  }

  return (
      <div className="flex min-h-screen">
        <Menu/>
        <h5 className="text-lg absolute top-0 right-0 max-w-8xl mx-auto mr-8 p-2 font-semibold">
          {currentDayAndDate}
        </h5>
        <div className="max-w-8xl mx-auto min-h-screen w-full ml-8 mt-8">
        <h4 className="h4 mt-5 ml-16 ">Notifications ({notifications.length})</h4>
        </div>
        <div className="max-w-7xl h-full w-full ml-96 mt-24 absolute pr-16"
        style={{
          overflow: 'auto',
          maxHeight: '850px',
        }}
        >
        {notifications.length > 0 ? (
          <div className="items-center">
            {notifications.map((notif, index) => (
              <div className="w-full border mr-40 mt-5"
              key={index}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '30px',
              }}
            >
              <p className="text-24 text-blue-500 text-left font-semibold">{notif.message}</p>
              <p className="text-24 text-left">Date : <span className="font-semibold">{notif.date}</span></p>
              <p className="text-24 text-right">{notif.time.split(':')[0]}:{notif.time.split(':')[1]} WIB</p>
              <input
                type="Submit"
                value="Clear"
                onClick={() => deleteNotification(notif.id)}
                className='btn text-white text-right sm:w-auto sm:mb-0 bg-blue-500 hover:bg-blue-700'
                style={{ padding: '8px 20px' }}
              />
            </div>
            ))}
          </div>
          ) : (
            <div className="py-16">
              <EmptyTable/>
            </div>
          )}
        </div>
      </div>
  );
};

export default NotificationContentPage
