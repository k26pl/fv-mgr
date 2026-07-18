"use client";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import sort_categories from "@/utils/sort_categories";
import type { Category } from "@/utils/sort_categories";

export default function Kategorie() {
  let [categories, setCategories] = useState<Category[]>([]);
  let [parent, setParent] = useState<string | null>(null);
  let [name, setName] = useState("");

  useEffect(() => {
    fetch(`/api/category`)
      .then((e) => e.json())
      .then((data) => {
        console.log(data);
        setCategories(sort_categories(data.c));
      });
  }, []);
  //@TODO: this function should be debounced to prevent same request twice
  //       Database enforce name to be unique, so this will be only minor ux fix
  let send = () => {
    fetch(`/api/category`, {
      method: "POST",
      body: JSON.stringify({
        name,
        parent,
      }),
    })
      .then((e) => e.json())
      .then((data) => {
        if (data.err) {
          console.error(data.err);
        }
        console.log(data);
        setCategories(sort_categories(data.c));
      });
  };
  return (
    <>
      <Box
        sx={{
          display: "flex",
        }}>
        <TextField
          sx={{ width: "45%" }}
          value={name}
          onChange={(e) => setName(e.target.value)}></TextField>
        <Autocomplete
          options={categories.map((e) => e.name)}
          clearOnEscape={true}
          noOptionsText='Brak kategorii'
          sx={{ width: "45%" }}
          onChange={(_, v) => setParent(v)}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth={true}
              label='Kategoria nadrzędna'
            />
          )}
        />
        <Button onClick={send} variant='contained' sx={{ width: "10%" }}>
          Dodaj
        </Button>
      </Box>
      <Box>
        {categories.map((c) => (
          <p
            key={c.name}
            style={{ marginLeft: 10 + (c.indent || 0) * 15 + "px" }}>
            {c.name}
          </p>
        ))}
      </Box>
    </>
  );
}
