from flask import Flask, send_from_directory, render_template, request
from importlib import import_module
from flask_paginate import Pagination, get_page_args
from pathlib import Path
from datetime import datetime, timedelta
from math import ceil
import git
import csv
THIS_FOLDER = Path(__file__).parent.resolve()

app = Flask(__name__)
module = import_module("home.routes".format("home"))
app.register_blueprint(module.blueprint)

@app.route('/static/<path:filename>')
def send_static(filename):
    return send_from_directory('static', filename)



@app.route("/app_update", methods=["POST"])
def app_update():
    repo = git.Repo("./FA_T2")
    origin = repo.remotes.origin
    repo.create_head("main", origin.refs.main).set_tracking_branch(
        origin.refs.main
    ).checkout()
    origin.pull()
    return "", 200

if __name__ == '__main__':
    app.run()

@app.route("/")
def home():
    return render_template("home/index.html")


@app.route("/visualization", methods=["GET", "POST"])
def visualization():
    with open(THIS_FOLDER/"src/DatosHistoricos.csv", mode="r", newline="", encoding="utf-8") as file:
        csv_reader = csv.DictReader(file)
        data = [row for row in csv_reader]

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    accident_type = request.args.get("accident_type")

    filtered_data = filter_data(data, start_date, end_date, accident_type)
    total_data = len(filtered_data)

    page, per_page, offset = get_page_args(
        page_parameter="page", per_page_parameter="per_page"
    )
    try:
        per_page = int(request.args.get("per_page", 20))
    except ValueError:
        per_page = 20
    total = ceil(total_data / per_page)
    pagination_data = filtered_data[offset : offset + per_page]

    pagination = Pagination(
        page=page, per_page=per_page, total=total, css_framework="bootstrap4"
    )

    return render_template(
        "home/visualization.html",
        data=pagination_data,
        page=page,
        per_page=per_page,
        total_data=total_data,
        pagination=pagination,
    )

def filter_data(data, start_date, end_date, accident_type):
    filtered_data = data

    if accident_type:
        filtered_data = [row for row in filtered_data if row["Tipo"] == accident_type]

    if start_date and end_date:
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
        filtered_data = [
            row
            for row in filtered_data
            if is_within_date_range(row, start_date, end_date)
        ]

    return filtered_data

def is_within_date_range(row, start_date, end_date):
    row_date = datetime(
        year=int(row["Anio"]), month=int(row["Mes"]), day=int(row["Dia"])
    )
    return start_date <= row_date <= end_date

@app.route("/prediction", methods=["GET", "POST"])
def prediction():
    with open(THIS_FOLDER/"src/Predicciones2019-2023.csv", mode="r", newline="", encoding="utf-8") as file:
        csv_reader = csv.DictReader(file)
        data = [row for row in csv_reader]
    
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    accident_type = request.args.get("accident_type")

    filtered_data = filter_data(data, start_date, end_date, None)
    total_data = len(filtered_data)

    page, per_page, offset = get_page_args(
        page_parameter="page", per_page_parameter="per_page"
    )
    try:
        per_page = int(request.args.get("per_page", 20))
    except ValueError:
        per_page = 20
    total = ceil(total_data / per_page)
    pagination_data = filtered_data[offset : offset + per_page]

    pagination = Pagination(
        page=page, per_page=per_page, total=total, css_framework="bootstrap4"
    )

    return render_template(
        "home/prediction.html",
        data=pagination_data,
        page=page,
        per_page=per_page,
        total_data=total_data,
        pagination=pagination,
        filtered_data=filtered_data,
        accident_type=accident_type
    )

def get_days_in_week(year, week):
    first_day = datetime.fromisocalendar(year, week, 1)
    days_in_week = [first_day + timedelta(days=i) for i in range(7)]
    return days_in_week


