import Image from "next/image";
import EmptyTableImage from '@/public/images/pairing_empty.svg';

export default function EmptyTable() {
  return (
    <>
      <div className="flex flex-col items-center bg-white w-auto h-auto py-[120px] rounded-bl rounded-br">
        <Image
          src={EmptyTableImage.src}
          alt="EmptyTable"
          width={100}
          height={100}
          className="bg-[#F4F5FC] p-[20px] rounded-[60px]"
        />
        <span className="font-semibold text-[#181B32] text-[18px] mt-[24px]">
            You do not have patient for today.
        </span>
        {/* <span className="font-regular text-[14px] text-[#767882]">
          Silahkan mulai mengisi daftar schedule
        </span> */}
      </div>
    </>
  );
}