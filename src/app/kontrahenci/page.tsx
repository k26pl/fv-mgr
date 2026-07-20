import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

export default function Kontrahenci() {
  return (
    <Box>
      <TextField size='small' label='NIP'></TextField>
      <Button variant='contained' sx={{ margin: "1px" }}>
        Dodaj
      </Button>
    </Box>
  );
}
