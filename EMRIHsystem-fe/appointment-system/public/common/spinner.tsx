import spinner from '@/public/common/spinner.gif';

function Spinner() {
  return (
    <div>
      <img
        src={spinner.src}
        style={{ width: '200px', margin: 'auto', display: 'block' }}
        alt="Loading..."
      />
    </div>
  );
};

export default Spinner;