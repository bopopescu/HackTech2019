let DEBUG_MODE = true; 
let DEBUG_LEVEL = 0;
let mode = "text";
let words_found = {}

function getSelectionText() {
    var text = '';
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != 'Control') {
        text = document.selection.createRange().text;
    }
    
    if (text in words_found) {
        document.getElementById("result1").innerHTML = words_found[text];
    }  else {
        if (text.length >= 3 && /[\w']+/.test(text)) {

            url = "/word/" + text; 
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
    
            xhr.setRequestHeader("Content-type", "application/json");
    
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    
                    resp = JSON.parse(xhr.response);
                    S = `${text} - definition:`;
                    for (let i = 0; i < resp.length; i++) {
                        S += "<div>" + resp[i] + "</div>";
                    }
                    words_found[text] = S
                    document.getElementById("result1").innerHTML = S
                }
            }
            xhr.send();
        }
    }    
}       

function showVideo() {
    const constraints = {
        video: true
    };
    
    const video = document.querySelector('video');
    
    function hasGetUserMedia() {
        return !!(navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia);
    }
    
    if (hasGetUserMedia()) {
        navigator.mediaDevices.getUserMedia(constraints).
        then((stream) => {video.srcObject = stream});
    } else {
        console.log("User media not supported");
    }
}

function clearImage() {
    hideImage();
    showText();
}

function tryLogin() {
    let elt1 = document.getElementById("message_one");
    let elt2 = document.getElementById("message_two");

    elt1.innerHTML = "";
    elt2.innerHTML = "";

    let name    = document.getElementById("name");
    let pw      = document.getElementById("password");

    let validLogin = true;

    if (name.value == "") {
        elt1.innerHTML = "Required field";
        validLogin = false;
    }
    if (pw.value == "") {
        elt2.innerHTML = "Required field";
        validLogin = false;
    }

    if (validLogin) {
        login_handle(name.value, pw.value);
    }

}

function failLogin() {
    let resp = document.getElementById("response_msg");
    resp.innerHTML = "Login Failed";
}

function succeedLogin() {
    window.location.href = "/";
}

function tryRegister() {
    let elt1 = document.getElementById("message_one");
    let elt2 = document.getElementById("message_two");
    let elt3 = document.getElementById("message_three");

    elt1.innerHTML = "";
    elt2.innerHTML = "";
    elt3.innerHTML = "";

    let email   = document.getElementById("email");
    let pw      = document.getElementById("password");
    let name    = document.getElementById("name");

    let validReg = true;

    if (name.value == "") {
        elt1.innerHTML = "Required field";
        validReg = false;
    }
    if (pw.value == "") {
        elt2.innerHTML = "Required field";
        validReg = false;
    }
    if (email.value == "") {
        elt3.innerHTML = "Required field"; 
        validReg = false;
    }
    else if (!email.value.includes("@")) {
        elt3.innerHTML = "Invalid email";
        validReg = false;
    }

    if (validReg) {
        register_handle(name.value, pw.value, email.value);
    }
}

function failRegister() {
    let resp = document.getElementById("response_msg");
    resp.innerHTML = "Registration Failed (Try new Email or Username)";
}

function succeedRegister() {
    window.location.href = "/";
}

function loadThePDFBoi() {
   // atob() is used to convert base64 encoded PDF to binary-like data.
// (See also https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/
// Base64_encoding_and_decoding.)
var url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = .9,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
  pageRendering = true;
  // Using promise to fetch the page
  pdfDoc.getPage(num).then(function(page) {
    var viewport = page.getViewport(canvas.width / page.getViewport(1.0).width);
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  // Update page counters
  document.getElementById('page_num').textContent = num;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}
document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}
document.getElementById('next').addEventListener('click', onNextPage);

/**
 * Asynchronously downloads PDF.
 */
pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
  pdfDoc = pdfDoc_;
  document.getElementById('page_count').textContent = pdfDoc.numPages;

  // Initial/first page rendering
  renderPage(pageNum);
});
}

function loadPage() {
    hideImage();
    // showVideo();

    $('#textArea').on('keyup keydown', updateCount);
    document.getElementById("textArea").value = getSavedValue("textArea");

    function updateCount() {
        $('#characters').text($(this).val().length);
        $('#words').text($(this).val().split(' ').length);
        saveValue(this);
    }

    $('#submitBtn').on('click', getResult); 

    function getResult() {
        sendText();
    }
}

function hideImage() {
    if (document.getElementById("imgDisplay").style.display != "none") {
        document.getElementById("submitBtn").innerHTML = "Upload Text";
        document.getElementById("toHide1").style.display = "inline";
        document.getElementById("toHide2").style.display = "inline";
        $("#fileSelect").val("");
        document.getElementById("imgDisplay").style.display = "none"; 
    }
}

function showImage() {
    document.getElementById("toHide1").style.display = "inline";
    document.getElementById("toHide2").style.display = "inline";
    document.getElementById("submitBtn").innerHTML = "Upload Image"
    document.getElementById("imgDisplay").style.display = "inline-block"; 
}

function showText() {
    if (document.getElementById("textArea").style.display != "inline-block") {
        document.getElementById("textArea").style.display = "inline-block";
        document.getElementById("characters").style.display = "inline-block"; 
        document.getElementById("words").style.display = "inline-block"; 
    }
}

function saveValue(e) {
    var id = e.id;
    var val = e.value;
    localStorage.setItem(id, val);
}

function getSavedValue(v) {
    if (!localStorage.getItem(v)) {
        return "Input Here";
    }
    return localStorage.getItem(v);
}

function hideText() {
    document.getElementById("textArea").style.display = "none"; 
    document.getElementById("characters").style.display = "none"; 
    document.getElementById("words").style.display = "none"; 
    document.getElementById("toHide2").style.display = "none"; 
    document.getElementById("toHide1").style.display = "none"; 
}

function getPDF() {
    if (mode !== "text") {
        result = convertToBase64();
            
        url = "/toPDF"
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        xhr.setRequestHeader("Content-type", "application/json");

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                console.log(xhr.response);
            }
        }
        
        var data = JSON.stringify({"img": JSON.stringify(result)});
        
        xhr.send(data);
    }
}

function sendText() {
    if (mode === "text") {
        let textArea = document.getElementById("textArea");
        
        url = "/text"
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        xhr.setRequestHeader("Content-type", "application/json");
        
        var data = JSON.stringify({"text": textArea.value});
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                document.getElementById("mainContent").innerHTML = xhr.response;
               
            }
        }

        xhr.send(data);
    
        
    } else {
        uploadImage();
    }
}

function loadResultImage(result) {

}

function login_handle(name, pw) {
    url = "/login_attempt"
    var xhr = new XMLHttpRequest();
    xhr.open("POST",url,true);

    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            console.log(xhr.response);
            if (xhr.response == "Succeed") {
                succeedLogin();
            }
            else {
                failLogin();
            }
        }
    }

    var data = JSON.stringify({"name":name, "pass":pw});

    console.log(data);

    xhr.send(data);
}

function createProfile() {
    pic = document.getElementById("mycanvas");
    ctx = pic.getContext('2d');
    info = pic.getAttribute("data");
    for (let i = 0; i < info.length; i++) {
        if (info[i] == 0) {
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(3*i % 50, i*3 / 50, 3, 3);
        } 
        if (info[i] == 1) {
            ctx.fillStyle = "#00FF00";
            ctx.fillRect(3*i % 50, i*3 / 50, 3, 3);
        } 
        if (info[i] == 2) {
            ctx.fillStyle = "#0000FF";
            ctx.fillRect(3*i % 50, i*3 / 50, 3, 3);
        } 
    }
}

function register_handle(name, pw, email) {
    url = "/register_attempt"
    var xhr = new XMLHttpRequest();
    xhr.open("POST",url,true);

    xhr.setRequestHeader("Content-type", "application/json");
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.response == "Succeed") {
                succeedRegister();
            }
            else {
                failRegister();
            }
        }
    }

    var data = JSON.stringify({"name":name, "pass":pw, "email":email});

    xhr.send(data);
}

function convertToBase64() {
    return document.getElementById("imgDisplay").src;
};

function uploadImage() {
    result = convertToBase64();

    url = "/img"
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            window.location.href = "/result";
            loadResultImage(xhr.response);
        }
    }
    
    var data = JSON.stringify({"img": JSON.stringify(result)});
    
    xhr.send(data);
}

function displayAnnotations(annotations) {
    var ann_divs = annotations.map(function(e) {
        s = `
            <div class='annotationModule'> ${e['user']} - ${e['rating']} - ${e['annotation']}
            </div>
            <div class='divider'>
            </div>`;
        return s;
    })
    
    console.log(ann_divs);

    document.getElementById("annotation").innerHTML = ann_divs.join('\n');
}

function getAnnotations(sentence) {
    
    url = "/getAnnotations";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            displayAnnotations(JSON.parse(xhr.response));
        }
    }
    
    var data = JSON.stringify({"sentence":sentence, 'meme':'funny internet memes'});

    xhr.send(data);
}

function annotate(sentence, annotation) {

    url = "/annotate";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.setRequestHeader("Content-type", "application/json");
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            getAnnotations(sentence);
            document.getElementById('alerts').innerHTML = xhr.response;
        }
    }
    
    //var data = {'sentence':sentence, 'annotation':annotation};
    var data = JSON.stringify({"sentence":sentence, "annotation":annotation});

    xhr.send(data);

}

function getRandomTextbook() {
    showImage();
    hideText(); 
    mode = "image"; 
    var preview = document.getElementById("imgDisplay");
    preview.src = "/static/example" + Math.floor((Math.random() * 5))
}

function previewFile(){
    showImage();
    hideText(); 
    mode = "image";
    var preview = document.querySelector('img'); //selects the query named img
    var file    = document.querySelector('input[type=file]').files[0]; //sames as here
    let ext = file.name.split(".").pop();
    
    if (file === undefined) {
        hideImage();
        showText();
    } else if (ext == "pdf") {
        preview.src = "static/pdf_logo.jpeg";
    } else {
        var reader  = new FileReader();

        reader.onloadend = function () {
            preview.src = reader.result;
        }
    
        if (file) {
            reader.readAsDataURL(file); //reads the data as a URL
        } else {
            preview.src = "";
        }
    }   
}

/* Takes a score from 0-5 */
function getStars(score) {
    stars = Math.round((score * 2)) / 2;
    fullStars = Math.floor(stars);
    // Will be 0 or 1
    halfStars = Math.round((score - fullStars) * 2);
    leftOver = 5 - fullStars - halfStars;
    S = "";
    for (let i = 0; i < fullStars; i++) {
        S += "<img src='/static/fullstar.png'></img>"; 
    }
    for (let i = 0; i < halfStars; i++) {
        S += "<img src='/static/halfstar.png'></img>"; 
    }
    for (let i = 0; i < leftOver; i++) {
        S += "<img src='/static/star.png'></img>"; 
    }
}

function debugMessage(message, level) {
    if (DEBUG_MODE && level >= DEBUG_LEVEL) {
        console.log(message);
    }
}
    
function deleteFromFavorites() {
    // Make HTTP request to save to favorites     
    url = "/unfavorite"
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    let info = document.getElementById('ogText').getAttribute('info');

    xhr.setRequestHeader("Content-type", "application/json");
    
    var data = JSON.stringify({"text": info});
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            document.getElementById('alerts').innerHTML = xhr.response;
        }
    }

    xhr.send(data);   
}

function saveToFavorites() {
    // Make HTTP request to save to favorites     
    url = "/favorite"
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    let info = document.getElementById('ogText').getAttribute('info');

    xhr.setRequestHeader("Content-type", "application/json");
    
    var data = JSON.stringify({"text": info});
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            document.getElementById('alerts').innerHTML = xhr.response;
        }
    }

    xhr.send(data);   
}