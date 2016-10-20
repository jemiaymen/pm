from eve import Eve
from eve.auth import TokenAuth
import jwt
import os
from flask import Flask, request, redirect, url_for
from werkzeug.utils import secure_filename
from cross import crossdomain
import uuid

app = Eve()

ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])

UPLOAD_FOLDER = 'd:\\pm\\client\\'



class RolesAuth(TokenAuth):

    def check_auth(self, token,  allowed_roles, resource, method):
        users = app.data.driver.db['auth']
        lookup = {'token': token}
        user = users.find_one(lookup)
        if user :
        	if user['role'] in allowed_roles:
        		return user
        return False


def add_token(documents):
    for document in documents:
        payload = {'login': document['login']}
        document["token"] = jwt.encode(payload, 'jemix')


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def name_file(filename,src):
    return 'app\\img\\' + src +'\\' + str(uuid.uuid1()) + '.' + filename.rsplit('.', 1)[1]



@app.route('/images/user', methods=['POST'])
@crossdomain(origin='*')
def upload_img_user():
    file = request.files['img']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        n = name_file(filename,'user')
        file.save(os.path.join(UPLOAD_FOLDER,n))
    return n

@app.route('/images/doc', methods=['POST'])
@crossdomain(origin='*')
def upload_img_doc():
    file = request.files['img']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        n = name_file(filename,'doc')
        file.save(os.path.join(UPLOAD_FOLDER,n))
    return n

@app.route('/images/cert', methods=['POST'])
@crossdomain(origin='*')
def upload_img_cert():
    file = request.files['img']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        n = name_file(filename,'cert')
        file.save(os.path.join(UPLOAD_FOLDER,n))
    return n

@app.route('/images/edu', methods=['POST'])
@crossdomain(origin='*')
def upload_img_edu():
    file = request.files['img']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        n = name_file(filename,'edu')
        file.save(os.path.join(UPLOAD_FOLDER,n))
    return n



if __name__ == '__main__':
    # app = Eve(auth=RolesAuth)
    app.on_insert_auth += add_token
    app.run(host='0.0.0.0',debug=True)
    # app.run(debug=True)



