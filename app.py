from flask import Flask, render_template
from importlib import import_module
import git


app = Flask(__name__)
module = import_module('home.routes'.format('home'))
app.register_blueprint(module.blueprint)

@app.route('/app_update', methods=['POST'])
def app_update():
    repo = git.Repo('./FA_T2')
    origin = repo.remotes.origin
    repo.create_head('main', origin.refs.main).set_tracking_branch(origin.refs.main).checkout()
    origin.pull()
    return '', 200

@app.route("/")
def home():
    return render_template('home/index.html')

