import React from 'react';

const UploadCSV = ({ onUploadCSV }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      onUploadCSV(file);
    } else {
      alert('Please upload a CSV file');
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
    </div>
  );
};

export default UploadCSV;
