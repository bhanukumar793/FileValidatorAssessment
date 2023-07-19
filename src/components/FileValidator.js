/*
  - This is the main component of the application.
  - This module will interact with users to take input.
  - It will accept 2 types of files as input ( csv and xml ).
  - Depending on file type application will process the application and validatinon rules,
    1. Uniqueness in Transaction References.
    2. End balance should be verified based on Start Balance and Mutation.
  - After validation, if any of the validation fails, then the user will be able to download the report with the list of records reference number, description and error message else completes the validation.
*/
import React, { useState } from "react";
import Papa from "papaparse";
import { XMLParser } from "fast-xml-parser";
import ExportToExcel from "./ExportToExcel";
import "../css/FileValidator.css";

const FileValidator = () => {
  const allowedExtensions = ["csv", "xml"];
  const [file, setFile] = useState();
  const [message, setMessage] = useState({
    status: "",
    message: "",
  });
  const [viewDownload, setViewDownload] = useState(false);
  const [dataForExcel, setDataForExcel] = useState([]);
  const [disableValidateBtn, setDisableValidateBtn] = useState(true);
  var createdExcelData = [];

  const validateFile = (event) => {
    setMessage({ status: "", message: "" });
    setDataForExcel([]);
    setViewDownload(false);
    setDisableValidateBtn(true);
    if (event.target.files.length) {
      setFile(event.target.files[0]);
      let uploadedFileExtension = event.target.files[0].name.split(".")[1];
      if (!allowedExtensions.includes(uploadedFileExtension)) {
        setMessage({
          status: "error",
          message: "Please upload only supported file.",
        });
        return;
      } else {
        setDisableValidateBtn(false);
      }
    }
  };

  const parseFile = () => {
    if (!file)
      return setMessage({
        status: "error",
        message: "Enter a valid csv or xml file",
      });
    setViewDownload(false);
    let reader = new FileReader();
    let referenceArray = [];

    // Common function to be used for csv and xml for validation ( Unique reference number and end balance ).
    const HandleValidationCheck = (data) => {
      if (referenceArray.includes(data.reference)) {
        setViewDownload(true);
        createdExcelData.push({
          Reference: data.reference,
          Description: data.description,
          Error: "Duplicate Reference Number",
        });
      } else {
        referenceArray.push(data.reference);
      }
      /* eslint-disable */
      if (
        data.startBalance &&
        data.startBalance != "" &&
        data.mutation &&
        data.mutation != "" &&
        data.endBalance &&
        data.endBalance != ""
      ) {
        if (
          Number(Number(data.startBalance) + Number(data.mutation)).toFixed(
            2
          ) != Number(data.endBalance)
        ) {
          setViewDownload(true);
          createdExcelData.push({
            Reference: data.reference,
            Description: data.description,
            Error: "Mismatch in End Balance",
          });
        }
      } else {
        setViewDownload(true);
        createdExcelData.push({
          Reference: data.reference,
          Description: data.description,
          Error: "Start/Mutation/End field is empty",
        });
      }
      setDataForExcel(createdExcelData);
      if (createdExcelData.length > 0) {
        setMessage({
          status: "success",
          message:
            "Validation is completed. Please click on Download report for details.",
        });
      } else {
        setMessage({
          status: "success",
          message:
            "Validation is completed. No errors found to download the report.",
        });
      }
    };

    // It will check if there is any data in the file.
    const HanldeParsedData = (parsedData) => {
      if (parsedData.length > 0) {
        // eslint-disable-next-line
        parsedData.map((data) => {
          HandleValidationCheck(data);
        });
      } else if (parsedData.length == 0) {
        setMessage({
          status: "error",
          message: "File does not contain data.",
        });
      } else {
        setMessage({
          status: "error",
          message: "Failed to upload the file. Please try again.",
        });
      }
    };

    if (file.type === "text/csv") {
      reader.onload = async ({ target }) => {
        let csv = Papa.parse(target.result, {
          header: true,
          encoding: "ISO-8859-1",
          skipEmptyLines: true,
          transformHeader: (header) =>
            header
              .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
                index === 0 ? word.toLowerCase() : word.toUpperCase()
              )
              .replace(/\s+/g, ""),
        });
        const parsedData = csv?.data || [];
        HanldeParsedData(parsedData);
      };
    } else if (file.type === "text/xml") {
      reader.onload = async ({ target }) => {
        var xml = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "",
        }).parse(target.result);
        let parsedData = xml?.records?.record || [];
        HanldeParsedData(parsedData);
      };
    }
    file.type === "text/csv"
      ? reader.readAsText(file, "ISO-8859-1")
      : reader.readAsText(file);
  };
  return (
    <div className="container containerDiv">
      <h1 className="page-title">Welcome to File Validator</h1>
      <p className="upload-title">Please upload a file for validation</p>
      <div className="container-upload-parent-div">
        <input
          type="file"
          onChange={validateFile}
          multiple={false}
          data-testid="input-upload-btn"
        ></input>

        <div className="file-type-info-div">
          <p className="file-type-info-text-header">Supported files</p>
          <p className="file-type-info-text-info">CSV, XML</p>
        </div>
        <div>
          {message.message != "" && (
            <p
              style={{
                color: message.status === "success" ? "green" : "red",
                fontSize: "13px",
              }}
            >
              {message.message}
            </p>
          )}
        </div>
      </div>

      <div className="validate-download-div">
        <button
          type="button"
          onClick={parseFile}
          disabled={disableValidateBtn}
          className="validate-download-btn"
          data-testid="validate-file-btn"
        >
          Validate File
        </button>
        {viewDownload && !disableValidateBtn && dataForExcel.length > 0 ? (
          <ExportToExcel
            excelData={dataForExcel}
            fileName="Validation Report"
          />
        ) : null}
      </div>
    </div>
  );
};

export default FileValidator;
