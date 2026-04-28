from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

def connect_db():
    return mysql.connector.connect(
        
        host="localhost",
        port="3308",
        user="root",
        password="@DOST2026",
        database="employee_db"
    )

def format_number(num):
    num = num.strip()
    if num.startswith("09") and len(num) == 11:
        return "63" + num[1:]
    return num

@app.route("/employees", methods=["GET"])
def list_employees():
    keyword = request.args.get("search", "")
    db = connect_db()
    cur = db.cursor(dictionary=True)
    like = f"%{keyword}%"
    cur.execute(
        "SELECT * FROM employees WHERE first_name LIKE %s OR last_name LIKE %s OR job_title LIKE %s",
        (like, like, like)
    )
    data = cur.fetchall()
    db.close()
    return jsonify(data)

@app.route("/employees", methods=["POST"])
def add_employee():
    body = request.json
    body["mobile_number"] = format_number(body["mobile_number"])
    db = connect_db()
    cur = db.cursor()
    cur.execute(
        """INSERT INTO employees (first_name, last_name, middle_name, birthdate, gender, address, mobile_number, job_title)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (body["first_name"], body["last_name"], body["middle_name"], body["birthdate"],
         body["gender"], body["address"], body["mobile_number"], body["job_title"])
    )
    db.commit()
    db.close()
    return jsonify({"message": "Added"}), 201

@app.route("/employees/<int:id>", methods=["PUT"])
def edit_employee(id):
    body = request.json
    body["mobile_number"] = format_number(body["mobile_number"])
    db = connect_db()
    cur = db.cursor()
    cur.execute(
        """UPDATE employees SET first_name=%s, last_name=%s, middle_name=%s, birthdate=%s,
           gender=%s, address=%s, mobile_number=%s, job_title=%s WHERE id=%s""",
        (body["first_name"], body["last_name"], body["middle_name"], body["birthdate"],
         body["gender"], body["address"], body["mobile_number"], body["job_title"], id)
    )
    db.commit()
    db.close()
    return jsonify({"message": "Updated"})

@app.route("/employees/<int:id>", methods=["DELETE"])
def remove_employee(id):
    db = connect_db()
    cur = db.cursor()
    cur.execute("DELETE FROM employees WHERE id=%s", (id,))
    db.commit()
    db.close()
    return jsonify({"message": "Deleted"})

if __name__ == "__main__":
    app.run(debug=True)