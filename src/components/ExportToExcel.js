import React, { useState } from "react";
import * as FileSaver from "file-saver";
import XLSX from "sheetjs-style";
import "../css/FileValidator.css";

const ExportToExcel = ({ excelData }) => {
  const [error, setError] = useState("");
  const fileType = "text/plain;charset=utf-8";
  const fileExtension = ".xlsx";
  // let currentDate = new Date().toISOString();
  // let formattedTimeStamp = currentDate.replace(/[-:T]/g, "").split(".")[0];
  const HandleExportToExcel = () => {
    let formattedTimeStamp = new Date()
      .toLocaleString("af-ZA", { hour12: false })
      .replace(/[-: ]/g, "");
    setError("");
    try {
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: fileType });
      FileSaver.saveAs(data, `Report-${formattedTimeStamp}` + fileExtension);
    } catch (error) {
      setError(
        `Failed to generate report. Please try to download report again.`
      );
    }
  };
  return (
    <>
      <button
        onClick={HandleExportToExcel}
        className="validate-download-btn"
        style={{ margin: "0 10px" }}
        data-testid="download-report-btn"
      >
        Download Report
      </button>
      {error && error !== "" ? (
        <span className="download-excel-report-error">{error}</span>
      ) : (
        ""
      )}
    </>
  );
};

export default ExportToExcel;
