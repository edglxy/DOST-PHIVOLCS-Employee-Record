App Installed:
Node
Python
MySQL/Workbench
Git

Commands Used to create this system:

To create directory for this project run:

mkdir employee-system
cd employee-system
mkdir backend
mkdir frontend


To create the database run this on MySQL Workbench:

CREATE DATABASE employee_db;
USE employee_db;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  birthdate DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  mobile_number VARCHAR(15) NOT NULL,
  job_title VARCHAR(100) NOT NULL
);


To create the backend directory run:

cd employee-system/backend
python -m venv venv
venv\Scripts\activate
pip install flask flask-cors mysql-connector-python


To create the frontend directory run: 
cd employee-system/frontend
npx create-react-app .
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled axios


To run the application:

To run backend on separate bash run:
cd backend
python -m venv venv
venv\Scripts\activate
pip install flask flask-cors mysql-connector-python
python app.py


to run frontend

cd frontend
npm install
npm start
