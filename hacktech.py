import logging, time
from flask import Flask, render_template, request
import database
import json
import OCR 
from database import db_session, init_db
from models import User, Annotation
from flask_login import LoginManager

app = Flask(__name__)
login = LoginManager(app)

init_db()

@login.user_loader
def load_user(id):
    return User.query.get(int(id))


''' ======= DB HANDLER ======= ''' 

def createUser(email, name, password):
    u = User(name, email)
    u.set_password(password) 
    db_session.commit()

def updatePw(username, password):
    pass 

def _addAnnotation(sentence, annotation, user, prevSentence = None, nextSentence = None):
    a = Annotation(sentence, annotation, user, prevSentence, nextSentence)
    db_session.add(a)
    db_session.commit()

def _getAnnotations(sentence, prevSentence = None, nextSentence = None):
    if prevSentence and nextSentence:
        return list(Annotation.query.filter(Annotation.sentence == sentence, Annotation.prevSentence == prevSentence, Annotation.nextSentence == nextSentence))
    elif prevSentence:
        return list(Annotation.query.filter(Annotation.sentence == sentence, Annotation.prevSentence == prevSentence))
    elif nextSentence:
        return list(Annotation.query.filter(Annotation.sentence == sentence, Annotation.nextSentence == nextSentence))
    else:
        return list(Annotation.query.filter(Annotation.sentence == sentence))

def _addRating(annotationID, rating):
    Annotation.query.filter(Annotation.id == annotationID).first().addRating(rating)

''' ======= DB HANDLER END ======= '''

def isValid(requirements, request):
    for req in requirements:
        if req not in request:
            return False
    return True

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

@app.route('/login_request', methods=["POST"])
def login():
    pass

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/result')
def displayResults():
    return render_template("results.html")

@app.route('/register')
def displayRegister():
    return render_template("register.html")

@app.route('/login')
def displayLoginScreen():
    return render_template("login.html")

@app.route('/img', methods=["POST"])
def getSimplifiedFromImage():
    '''
    Take image in the form of a JSON
    object, returns the simplfied text  
    '''
    result = request.get_json()
    
    requires = ["img"]
    if isValid(requires, result): 
        info = result["img"]
        if info[1:21] == "data:application/pdf":
            type = "PDF"
        else:
            type = "IMG"

        base64Image = info[23:]

        if type == "PDF":
            text = OCR.process_PDF(base64Image)
        elif type == "IMG":
            text = OCR.process_IMG(base64Image)
        
        print(text)
    else:
        logging.info("Invalid request.")

    return "OK"

@app.route('/text', methods=["POST"])
def getSimplifiedFromText():
    '''
    Take text in the form of a JSON 
    object, returns the simplified text
    '''
    result = request.get_json()
    requires = ["text"]
    if isValid(requires, result): 
        text = result['text']
        return "hello world"
    else:
        logging.info("Invalid request: " + request + " at " + time.time()) 
        return "not a valid request"

@app.route('/annotate', methods=["POST"])
def annotate():
    '''
    Adds annotation for a specific sentence
    '''
    result = request.get_json()
    requires = ["sentence", "annotation", "user"]
    if isValid(requires, result):
        prevSentence = None if 'prevSentence' not in results else results['prevSentence']
        nextSentence = None if 'nextSentence' not in results else results['nextSentence']
        _addAnnotation(results['sentence'], results['annotation'], prevSentence, nextSentence)
    else:
        logging.info("Invalid request: " + request + " at " + time.time())
        return "Not a valid annotation request"

@app.route('/getAnnotaions', methods=['POST'])
def getAnnotations():
    result = request.get_json()
    requires = ["sentence"]
    if isValid(requires, result):
        prevSentence = None if 'prevSentence' not in results else results['prevSentence']
        nextSentence = None if 'nextSentence' not in results else results['nextSentence']
        return _getAnnotations(result['sentence'], prevSentence, nextSentence)
    else:
        logging.info("Invalid request " + request + " at " + time.time())
        return "Not a valud getAnnotation request"


if __name__ == "__main__":
    app.run(host='0.0.0.0')
    
    
