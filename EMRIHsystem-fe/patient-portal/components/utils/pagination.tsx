import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
    handlePageChange: (direction: string) => void;
    handlePageClick: (pageNumber: number) => void;
    handleChangeRowPerPage: (pageNumber: string) => void;
  }
  
const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    rowsPerPage,
    handlePageChange,
    handlePageClick,
    handleChangeRowPerPage,
  }) => {

  // Function to generate an array of page numbers
  const generatePageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // Function to handle clicking on a specific page number
  const handleClick = (pageNumber: number) => {
    handlePageClick(pageNumber);
  };

  // Function to handle changing the page (prev/next)
  const handleNavigation = (direction: string) => {
    handlePageChange(direction);
  };

  const handleRowPerPage = (rowsPerPage: string) => {
    handleChangeRowPerPage(rowsPerPage);
  };

  // Generate an array of page numbers
  const pageNumbers = generatePageNumbers();

  // Determine the range of page numbers to display
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  return (
    <div className="flex justify-between text-sm bg-[#F9F9FF] p-4 mt-4">
      <div>
        <span className="mr-4 text-[12px]">Halaman</span>
        <input
            disabled= {true}
            className="border rounded px-2 py-1 text-[12px] bg-white mr-4"
            value={`${currentPage} dari ${totalPages}`}
            style={{ width: '20%' }}
        >

        </input>
        <span className="mr-4 text-[12px]">Jumlah Baris</span>
        <select
          className="border rounded px-2 py-1 text-[12px] w-16"
          value={rowsPerPage}
          onChange={(e) => handleRowPerPage(e.target.value)}
        >
          <option value="2">2</option>       
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>


      <div className="flex items-center">
        <button
          className="mr-2 text-[12px]"
          disabled={currentPage === 1}
          onClick={() => handleNavigation('prev')}
        >
          &#8592; {/* Left Arrow */}
        </button>

        {/* Display page numbers dynamically */}
        {pageNumbers.slice(start - 1, end).map((pageNumber) => (
          <button
            key={pageNumber}
            className={`text-[12px] mx-1 p-2 border rounded ${
              pageNumber === currentPage ? 'bg-blue-500 text-white' : ''
            }`}
            onClick={() => handleClick(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}

        <button
          className="ml-2 text-[12px]"
          disabled={currentPage === totalPages}
          onClick={() => handleNavigation('next')}
        >
          &#8594; {/* Right Arrow */}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
