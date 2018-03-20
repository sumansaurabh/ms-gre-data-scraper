import os

from flask import Flask, request, Response
from flask import render_template, url_for, redirect, send_from_directory
from flask import send_file, make_response, abort
from angular_flask import app
import gradCafeHelper
from flask import jsonify


# routing for basic pages (pass routing onto the Angular app)
@app.route('/')
@app.route('/about')
@app.route('/blog')
def basic_pages(**kwargs):
    return make_response(open('angular_flask/templates/index.html').read())



# special file handlers and error handlers@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'img/favicon.ico')

@app.route('/gradscraper', methods=['POST'])
def grad_scraper(**kwargs):
    content = request.get_json(silent=True)
    search_key = content['search_key']
    page_limit = content['page']
    all_college_list = gradCafeHelper.get_all_pages(page_limit, search_key)

    return jsonify({
        "data" : all_college_list
    })
    



@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404
