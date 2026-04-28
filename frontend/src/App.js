import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, TextField, Button, Table, TableBody, TableCell,
  TableHead, TableRow, Paper, Select, MenuItem, FormControl,
  InputLabel, Typography, Box, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const BASE = "http://localhost:5000/employees";

const blank = {
  first_name: "", last_name: "", middle_name: "",
  birthdate: "", gender: "", address: "",
  mobile_number: "", job_title: ""
};

export default function App() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [phoneError, setPhoneError] = useState("");

  const load = async () => {
    const res = await axios.get(`${BASE}?search=${search}`);
    setList(res.data);
  };

  useEffect(() => { load(); }, [search]);

  const checkFields = () => {
    const found = {};
    Object.keys(blank).forEach(k => {
      if (!form[k]) found[k] = "Required";
    });
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handlePhone = (val) => {
    if (val.length > 11) return;
    setForm({ ...form, mobile_number: val });
    setPhoneError(val && val.length < 11 ? "Must be 11 digits" : "");
  };

  const canSave = Object.values(form).every(v => v !== "") && !phoneError;

  const submit = async () => {
    if (!checkFields()) return;
    editId
      ? await axios.put(`${BASE}/${editId}`, form)
      : await axios.post(BASE, form);
    setForm(blank);
    setEditId(null);
    load();
  };

  const startEdit = (emp) => {
    setForm({ ...emp });
    setEditId(emp.id);
  };

  const remove = async (id) => {
    await axios.delete(`${BASE}/${id}`);
    load();
  };

  const field = (label, key, extra = {}) => (
    <TextField
      label={label} value={form[key]} fullWidth
      onChange={e => setForm({ ...form, [key]: e.target.value })}
      error={!!errors[key]} helperText={errors[key]}
      {...extra}
    />
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Employee Records
      </Typography>

      <TextField fullWidth label="Search by name or job title" value={search}
        onChange={e => setSearch(e.target.value)} sx={{ mb: 3 }} />

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {editId ? "Edit Employee" : "New Employee"}
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
          {field("First Name", "first_name")}
          {field("Last Name", "last_name")}
          {field("Middle Name", "middle_name")}
          {field("Birthday", "birthdate", { type: "date", InputLabelProps: { shrink: true } })}
          <FormControl error={!!errors.gender}>
            <InputLabel>Gender</InputLabel>
            <Select value={form.gender} label="Gender"
              onChange={e => setForm({ ...form, gender: e.target.value })}>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
            </Select>
            {errors.gender && <Typography variant="caption" color="error">{errors.gender}</Typography>}
          </FormControl>
          <TextField label="Mobile Number" value={form.mobile_number}
            onChange={e => handlePhone(e.target.value)}
            error={!!phoneError || !!errors.mobile_number}
            helperText={phoneError || errors.mobile_number} />
          {field("Job Title", "job_title")}
          {field("Address", "address", { sx: { gridColumn: "span 3" } })}
        </Box>
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={submit} disabled={!canSave}>
            {editId ? "Update" : "Save"}
          </Button>
          {editId && (
            <Button variant="outlined" onClick={() => { setForm(blank); setEditId(null); }}>
              Cancel
            </Button>
          )}
        </Box>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              {["First Name","Last Name","Middle Name","Birthday","Gender","Mobile","Address","Job Title",""].map(h => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map(emp => (
              <TableRow key={emp.id} hover>
                <TableCell>{emp.first_name}</TableCell>
                <TableCell>{emp.last_name}</TableCell>
                <TableCell>{emp.middle_name}</TableCell>
                <TableCell>{emp.birthdate}</TableCell>
                <TableCell>{emp.gender}</TableCell>
                <TableCell>{emp.mobile_number}</TableCell>
                <TableCell>{emp.address}</TableCell>
                <TableCell>{emp.job_title}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => startEdit(emp)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => remove(emp.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}