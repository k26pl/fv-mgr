"use client";

import { useCallback, useState } from "react";

export enum UploadStatus {
  WaitngForLink,
  Uploading,
  Done,
  Error,
  InvalidType,
}
export enum FileType {
  Pdf = "pdf",
  Xml = "xml",
  Invalid = "",
}

export function useUploadFiles() {
  const [errors, setErrors] = useState<string[]>([]);
  const [inUpload, setInUpload] = useState<
    Array<{ status: UploadStatus; file: File; name: string; type: FileType }>
  >([]);
  const [finished, setFinished] = useState(false);
  const [uploading, setUploading] = useState(false);

  const start = useCallback(() => {
    if (uploading) return;
    setUploading(true);
    setFinished(false);
    setErrors([]);
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    const errs: string[] = [];
    const add_err = (err: string) => {
      errs.push(err);
      setErrors([...errs]);
    };
    const in_upload = new Map<
      string,
      {
        status: UploadStatus;
        file: File;
        name: string;
        type: FileType;
      }
    >();
    const update_upload = () => {
      setInUpload([...in_upload.values()]);
    };
    input.addEventListener("cancel", () => {
      console.log("cancel");
      setUploading(false);
    });
    input.addEventListener("change", async () => {
      if (!input.files || input.files.length == 0) {
        add_err("Nie wybrano żadnego pliku");
        setUploading(false);

        return;
      }

      const sent = [];
      const files = [...input.files];

      for (const file of files) {
        console.log(file);

        let file_type = FileType.Invalid;
        switch (file.type) {
          case "application/pdf":
            file_type = FileType.Pdf;
            break;
          case "text/xml":
            file_type = FileType.Xml;
            break;
          default:
            // This file wont be processed further,
            // but it is still added to show feedback to user
            in_upload.set(file.name, {
              file,
              status: UploadStatus.InvalidType,
              name: file.name,
              type: FileType.Invalid,
            });
            update_upload();
            add_err(
              `${file.name} ma niepoprawny format. Obsługiwane formaty to PDF oraz XML.`,
            );
            continue;
        }
        in_upload.set(file.name, {
          file,
          status: UploadStatus.WaitngForLink,
          name: file.name,
          type: file_type,
        });
        update_upload();
        sent.push({ name: file.name, type: file_type, size: file.size });
      }
      console.log(sent);
      if (sent.length === 0) {
        setFinished(true);
        setUploading(false);
        add_err("Brak plików do wysłąnia");
        return;
      }
      const resp = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          files: sent,
        }),
      });
      const json:
        | Array<{ id: string; link: string; name: string }>
        | { err: string }
        | null = await resp
        .json()
        .catch((err) => (console.error("cannot get body: ", err), null));
      if (!resp.ok) {
        if (json) {
          if (Array.isArray(json)) {
            console.error(json);
            add_err("Nieoczekiwana odpowiedź serwera");
          } else {
            if (json.err) {
              add_err(`Błąd serwera: ${json.err}`);
            } else {
              console.error(json);
              add_err("Wystąpił błąd w komunikacji z serwerem");
            }
          }
        } else {
          add_err("Wystąpił błąd w komunikacji z serwerem");
        }
        setUploading(false);
        return;
      }
      if (!Array.isArray(json)) {
        console.error(json);
        add_err("Nieoczekiwana odpowiedź serwera");
        setUploading(false);
        return;
      }
      await Promise.all(
        json.map(async (f) => {
          const file = in_upload.get(f.name);
          if (file) {
            in_upload.set(f.name, { ...file, status: UploadStatus.Uploading });
            update_upload();
            const res = await fetch(f.link, {
              method: "PUT",
              body: file.file,
            });
            if (!res.ok) {
              console.error("b2 sent an error: ", res, await res.text());
              add_err(`Nie udało się przesłać pliku ${f.name}`);
              in_upload.set(f.name, {
                ...file,
                status: UploadStatus.Error,
              });

              update_upload();
            } else {
              in_upload.set(f.name, {
                ...file,
                status: UploadStatus.Done,
              });
              update_upload();
            }
          } else {
            console.error(
              `server sent link for ${f.name} but it does not appear to exist.`,
              f,
              in_upload,
            );
            add_err("Serwer wysłał nieprawidłową odpowiedź");
          }
        }),
      );
      const resp_finalise = await fetch("/api/upload/finalise", {
        method: "POST",
        body: JSON.stringify({
          files: json.map((f) => ({ id: f.id })),
        }),
      });
      const finalise_out: { ok: true } | { ok: false; err: string } | null =
        await resp_finalise
          .json()
          .catch((err) => (console.error("cannot get body: ", err), null));

      if (!resp_finalise.ok) {
        console.error(resp_finalise, finalise_out);
        if (finalise_out && finalise_out.ok === false) {
          add_err(`Błąd serwera: ${finalise_out.err}`);
        } else {
          add_err("Wystąpił błąd w komunikacji z serwerem");
        }
        setUploading(false);
        return;
      }

      setFinished(true);
      setUploading(false);
    });

    input.click();
  }, [uploading]);
  return {
    errors,
    inUpload,
    finished,
    start,
    uploading,
  };
}
