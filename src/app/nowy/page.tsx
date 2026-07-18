"use client";
import Button from "@mui/material/Button";
import ButtonLink from "@/components/ButtonLink";
import Box from "@mui/material/Box";
import { useUploadFiles, UploadStatus, FileType } from "./fileUploader";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import ErrorIcon from "@mui/icons-material/Error";
import CodeIcon from "@mui/icons-material/Code";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

type SentInvoice = {
  name: string;
  link: string;
  id: string;
  date: string;
};

export default function NowyDokument() {
  const { start, errors, inUpload, finished, uploading } = useUploadFiles();
  const [sentLoading, setSentLoading] = useState(true);
  const [sentOk, setSentOk] = useState(false);
  const [invoices, setInvoices] = useState<SentInvoice[]>([]);
  useEffect(() => {
    fetch("/api/uploaded").then((res) => {
      if (res.ok) {
        setSentOk(true);
        res.json().then((j: SentInvoice[]) => {
          setInvoices(j);
        });
      } else {
        setSentLoading(false);
        setSentOk(false);
      }
    });
  }, [finished]);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          paddingTop: "16px",
        }}>
        <ButtonLink
          sx={{ margin: "7px" }}
          variant='contained'
          color='primary'
          href='/rejestr#akceptacja'>
          Zaakceptuj faktury pobrane z KSEF
        </ButtonLink>
        <Button
          sx={{ margin: "7px" }}
          variant='contained'
          disabled={uploading}
          color={
            finished ? (errors.length > 0 ? "error" : "success") : "primary"
          }
          onClick={start}>
          Wgraj faktury
        </Button>
      </Box>
      <Box sx={{ textAlign: "center", color: "#ff4646", fontSize: "20px" }}>
        {errors.map((er, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {er}
          </span>
        ))}
      </Box>
      <Box>
        {inUpload.map((file, i) => {
          let color = "primary";
          let status;
          switch (file.status) {
            case UploadStatus.WaitngForLink:
              status = "Oczekiwanie na odpowiedź serwera";
              break;
            case UploadStatus.Uploading:
              status = "Wysyłanie";
              break;
            case UploadStatus.Done:
              color = "success";
              status = "Wysłano";
              break;
            case UploadStatus.Error:
              color = "error";
              status = "Wystąpił błąd";
              break;
            case UploadStatus.InvalidType:
              color = "error";
              status = "Nieprawidłowy typ pliku";
              break;
          }
          return (
            <Box
              key={file.name}
              sx={{
                backgroundColor: `var(--mui-palette-${color}-main)`,
                borderRadius: "10px",
                margin: "9px",
                padding: "4px",
              }}>
              {file.type == FileType.Pdf && <FilePresentIcon></FilePresentIcon>}
              {file.type == FileType.Invalid && <ErrorIcon></ErrorIcon>}
              {file.type == FileType.Xml && <CodeIcon></CodeIcon>}
              {file.name}: {status}
            </Box>
          );
        })}
      </Box>
      <Box>
        l: {sentLoading}
        ok:{sentOk}
        {invoices.map((inv) => (
          <div style={{ display: "flex", flexDirection: "row" }} key={inv.id}>
            <div
              style={{
                width: "50%",
              }}>
              {inv.date}
              <br />
              {inv.id}
              <br />
              {inv.name}
              <br />
              <TextField fullWidth={true} label='asdf'></TextField>
              <Autocomplete
                options={["a", "b", "c"]}
                renderInput={(params) => {
                  console.log(params);
                  return <TextField {...params} label='Movie' />;
                }}></Autocomplete>
            </div>

            <iframe
              src={inv.link}
              style={{
                width: "50%",
                minHeight: "500px",
              }}></iframe>
          </div>
        ))}
      </Box>
    </>
  );
}
