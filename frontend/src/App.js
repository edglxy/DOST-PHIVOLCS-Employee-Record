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

const Required = () => <span style={{ color: "red", marginLeft: 2 }}>*</span>;

const validate = (form) => {
  const err = {};
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // First Name
  if (!form.first_name.trim()) {
    err.first_name = "First name is required";
  } else if (!nameRegex.test(form.first_name)) {
    err.first_name = "First name must contain letters only";
  } else if (form.first_name.trim().length < 2) {
    err.first_name = "First name must be at least 2 characters";
  }

  // Last Name
  if (!form.last_name.trim()) {
    err.last_name = "Last name is required";
  } else if (!nameRegex.test(form.last_name)) {
    err.last_name = "Last name must contain letters only";
  } else if (form.last_name.trim().length < 2) {
    err.last_name = "Last name must be at least 2 characters";
  }

  // Middle Name — optional, validate format only if filled
  if (form.middle_name.trim() && !nameRegex.test(form.middle_name)) {
    err.middle_name = "Middle name must contain letters only";
  }

  // Birthday
  if (!form.birthdate) {
    err.birthdate = "Birthday is required";
  } else {
    const birth = new Date(form.birthdate);
    const minDate = new Date("1900-01-01");
    const age = today.getFullYear() - birth.getFullYear();
    if (isNaN(birth.getTime())) {
      err.birthdate = "Enter a valid date";
    } else if (birth >= today) {
      err.birthdate = "Birthday must be in the past";
    } else if (birth < minDate) {
      err.birthdate = "Enter a realistic birth date";
    } else if (age < 18) {
      err.birthdate = "Employee must be at least 18 years old";
    }
  }

  // Gender
  if (!form.gender) {
    err.gender = "Please select a gender";
  }

  // Mobile Number
  if (!form.mobile_number.trim()) {
    err.mobile_number = "Mobile number is required";
  } else if (!/^\d+$/.test(form.mobile_number)) {
    err.mobile_number = "Mobile number must contain digits only";
  } else if (form.mobile_number.length !== 11) {
    err.mobile_number = "Mobile number must be exactly 11 digits";
  } else if (!form.mobile_number.startsWith("09")) {
    err.mobile_number = "Mobile number must start with 09";
  }

  // Job Title
  if (!form.job_title.trim()) {
    err.job_title = "Job title is required";
  } else if (form.job_title.trim().length < 2) {
    err.job_title = "Job title must be at least 2 characters";
  } else if (form.job_title.trim().length > 100) {
    err.job_title = "Job title must not exceed 100 characters";
  }

  // Address
  if (!form.address.trim()) {
    err.address = "Address is required";
  } else if (form.address.trim().length < 10) {
    err.address = "Please enter a complete address";
  } else if (form.address.trim().length > 255) {
    err.address = "Address must not exceed 255 characters";
  }

  return err;
};

export default function App() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const load = async () => {
    try {
      const res = await axios.get(`${BASE}?search=${search}`);
      setList(res.data);
    } catch (err) {
      console.error("Failed to load:", err);
    }
  };

  useEffect(() => { load(); }, [search]);

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate(form));
    }
  }, [form]);

  const touch = (key) => setTouched(prev => ({ ...prev, [key]: true }));

  const handlePhone = (val) => {
    if (!/^\d*$/.test(val)) return;
    if (val.length > 11) return;
    setForm({ ...form, mobile_number: val });
    touch("mobile_number");
  };

  const allErrors = validate(form);
  const canSave = Object.keys(allErrors).length === 0;

  const submit = async () => {
    const allTouched = Object.keys(blank).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const currentErrors = validate(form);
    setErrors(currentErrors);
    if (Object.keys(currentErrors).length > 0) return;

    try {
      if (editId) {
        await axios.put(`${BASE}/${editId}`, form);
      } else {
        await axios.post(BASE, form);
      }
      setForm(blank);
      setEditId(null);
      setErrors({});
      setTouched({});
      load();
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  const startEdit = (emp) => {
    setForm({
      first_name: emp.first_name,
      last_name: emp.last_name,
      middle_name: emp.middle_name,
      birthdate: emp.birthdate,
      gender: emp.gender,
      address: emp.address,
      mobile_number: emp.mobile_number.startsWith("63")
        ? "0" + emp.mobile_number.slice(2)
        : emp.mobile_number,
      job_title: emp.job_title
    });
    setEditId(emp.id);
    setErrors({});
    setTouched({});
  };

  const remove = async (id) => {
    try {
      await axios.delete(`${BASE}/${id}`);
      load();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const cancel = () => {
    setForm(blank);
    setEditId(null);
    setErrors({});
    setTouched({});
  };

  const field = (label, key, required = true, extra = {}) => {
    const { sx, ...rest } = extra;
    return (
      <TextField
        label={
          <span>
            {label}{required && <Required />}
          </span>
        }
        value={form[key]}
        fullWidth
        onChange={e => {
          setForm({ ...form, [key]: e.target.value });
          touch(key);
        }}
        onBlur={() => touch(key)}
        error={!!touched[key] && !!errors[key]}
        helperText={touched[key] && errors[key]}
        {...(sx && { sx })}
        {...rest}
      />
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Employee Records
      </Typography>

      {/* SEARCH */}
      <TextField
        fullWidth
        label="Search by name or job title"
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* FORM */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {editId ? "Edit Employee" : "New Employee"}
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>

          {field("First Name", "first_name", true)}
          {field("Last Name", "last_name", true)}
          {field("Middle Name", "middle_name", false)}

          {/* Birthday */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Typography variant="caption" color="text.secondary" sx={{ ml: "14px" }}>
              Birthday <Required />
            </Typography>
            <TextField
              type="date"
              value={form.birthdate}
              fullWidth
              onChange={e => {
                setForm({ ...form, birthdate: e.target.value });
                touch("birthdate");
              }}
              onBlur={() => touch("birthdate")}
              error={!!touched.birthdate && !!errors.birthdate}
              helperText={touched.birthdate && errors.birthdate}
              inputProps={{ style: { textAlign: "center" } }}
            />
          </Box>

          {/* Gender */}
          <FormControl
            error={!!touched.gender && !!errors.gender}
            sx={{ mt: "22px" }}
          >
            <InputLabel>
              Gender <Required />
            </InputLabel>
            <Select
              value={form.gender}
              label="Gender *"
              onChange={e => {
                setForm({ ...form, gender: e.target.value });
                touch("gender");
              }}
              onBlur={() => touch("gender")}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
            </Select>
            {touched.gender && errors.gender && (
              <Typography variant="caption" color="error" sx={{ ml: "14px", mt: "3px" }}>
                {errors.gender}
              </Typography>
            )}
          </FormControl>

          {/* Mobile */}
          <TextField
            label={<span>Mobile Number <Required /></span>}
            value={form.mobile_number}
            fullWidth
            onChange={e => handlePhone(e.target.value)}
            onBlur={() => touch("mobile_number")}
            error={!!touched.mobile_number && !!errors.mobile_number}
            helperText={
              touched.mobile_number && errors.mobile_number
                ? errors.mobile_number
                : "Format: 09XXXXXXXXX"
            }
            sx={{ mt: "22px" }}
            inputProps={{ maxLength: 11 }}
          />

          {field("Job Title", "job_title", true)}
          {field("Address", "address", true, { sx: { gridColumn: "span 3" } })}

        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
          <Button variant="contained" onClick={submit} disabled={!canSave}>
            {editId ? "Update" : "Save"}
          </Button>
          {editId && (
            <Button variant="outlined" onClick={cancel}>
              Cancel
            </Button>
          )}
          {!canSave && Object.keys(touched).length > 0 && (
            <Typography variant="caption" color="error">
              Please fix all errors before saving
            </Typography>
          )}
        </Box>
      </Paper>

      {/* TABLE */}
      <Paper>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              {["First Name","Last Name","Middle Name","Birthday","Gender","Mobile","Address","Job Title",""].map(h => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              list.map(emp => (
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
                    <IconButton size="small" onClick={() => startEdit(emp)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => remove(emp.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}