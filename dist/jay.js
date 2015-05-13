
// if J is not set in index.html, set it here.
if(typeof J === "undefined") {
  var J = {}
}

// hello hello, facebook connect and #_=_
if (window.location.hash && window.location.hash == '#_=_') {
  window.location.hash = '/';
}

if (typeof fbAppId != "undefined") {

  // Get FB SDK
  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/all.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  // If FB SDK is loaded:
  window.fbAsyncInit = function() {

    // Initialise FB
    FB.init({
      appId      : fbAppId,
      xfbml      : true,
      version    : 'v2.2',
      status     : true
    });

    checkIn();
  }
}

function checkIn() {
  // See if user is logged in
  FB.getLoginStatus(function(response){
    if (response.status === 'connected') { // Logged into your app and Facebook
      J.userId = response.authResponse.userID;
      var access_token = response.authResponse.accessToken;
      ajax_send(access_token);
    } else if (response.status === 'not_authorized') { // The person is logged into Facebook, but not your app.
      console.log('Please log ' + 'into this app.');
      J.userId = false;
    } else { // Not logged into Facebook or app or something else
      console.log('Please log ' + 'into Facebook.');
      J.userId = false;
    }
  });

  // send access_token
  function ajax_send(access_token) {
    var ajax_object = {};

    ajax_object.access_token = access_token;
    ajax_object.type = "short";
    $.ajax({
        data: JSON.stringify(ajax_object),
        type: 'POST',
        url: "/auth/fb",
        dataType: 'jsonp',
        jsonp: "callback",
        success: function(data) {
          if (data.error == true) {
            J.token = false;
          }
          if (data.error == false) {
            J.token = data.token;
          }
        }
    });
  }
}

// shortcut for console.log
function cl(data) {
  console.log(data);
}

// shortcut for console.error
function ce(data) {
  console.error(data);
}

function getBlobURL(input) {
  var file = input[0].files[0];
  var blob = URL.createObjectURL(file);
  if(blob) {
    return blob;
  } else {
    return false;
  }
}

function detectFileUpload(){ // from: http://viljamis.com/blog/2012/file-upload-support-on-mobile/
  var isFileInputSupported = (function () {
    // Handle devices which falsely report support
    if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
     return false;
    }
    // Create test element
    var el = document.createElement("input");
    el.type = "file";
    return !el.disabled;
  })();

  if (isFileInputSupported) {
      return true;
    } else { // the browser does not support file="input"
      return false;
  }
}

// detect if the client can handle cache
function canCache(){
  if (navigator.userAgent.match(/(Windows Phone)/)) { // For a start, WinPhone can't handle it's cache
    return false;
  } else {
    return true;
  }
}

function resetForm(formName) {
  // set normal form members
  $("#"+formName+" input").each(function( one ) {
    var type = $(this).attr("type");
    if(type === "text") {
      $(this).val('');
    }
    if(type === "checkbox") {
      $(this).removeAttr('checked');
    }
    if(type === "radio") {
      $(this).removeAttr('checked');
    }
    if(type === "file") {
      $(this).replaceWith($(this).clone(true));
    }
  });
  // clear textareas
  $("#"+formName+" textarea").each(function( one ) {
    $(this).val('');
  });
}

// write to alert
function a(message) {
  // find if alert exists and if it does, remove it.
  var elem = document.getElementById("alert");
  if(elem != null) {
    var elemParent = elem.parentNode;
    elemParent.removeChild("alert");
  }
  // create the alert HTML
  var extra = '<div id="alert" style="z-index: 10;"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><div id="alertMessage" class="alert alert-black alert-dismissible" role="alert">'+message+'</div></div>';
  // add html to beginning of app
  var app = document.getElementById('app');
  app.innerHTML = extra + app.innerHTML;
}

function isUser (isLoggedIn, notLoggedIn) {
  // if it's a user
  if(J.userId != undefined && J.userId != false) {
    //isLoggedIn();
    isLoggedIn();
    // if it's not a user or we are not sure yet
  } else {
    var i = 0;
    var getStatus = setInterval(function(){
      // is not a user
      if(J.userId === false) {
        notLoggedIn();
        clearInterval(getStatus);
      }
      // is a user or not sure yet
      else {
        // is a user
        if(J.userId != undefined) {
          isLoggedIn();
          clearInterval(getStatus);
        } else {
          // FB is not yet available
          if(i === 40) { // turn off the search after 40 times
            notLoggedIn();
            a('Unable to authenticate. Refresh page to try again');
            clearInterval(getStatus);
          }
          i++;
        }
      }
    }, 200); // Ping every 200 ms
  }
}

function route(crossroads) {
  //setup hasher
  // hasher let's you know when route is changed
  function parseHash(newHash, oldHash){
    crossroads.parse(newHash);
  }
  hasher.initialized.add(parseHash); //parse initial hash
  hasher.changed.add(parseHash); //parse hash changes
  hasher.init(); //start listening for history change
}

function prepareForm(formName) {

  var checkboxes = [];
//cl("a")
  // added progress bar
  $("body").append('<div style="position: absolute; color: #fff; padding-top: 15px; bottom: 20px; height: 50px; background: #000; opacity: 0.3; width: 0%; text-align: center" id="progress">Upload in progress: <span id="processPercent">45%</span></div>');


  var fd = new FormData();
  var titles = {};
  //$("#"+formName+":submit").attr("disabled", "disabled");
  formName = $("#"+formName);
  // go through form and get data
  formName.find("input, textarea").each(function(){
    var t = $(this);

    // handle input type text, file, submit differently;
    switch(t.attr("type")) {
    case "text":
    fd.append(t.attr("id"), t.val()); // add the value of the input
    titles[t.attr("id")] = $("label[for='"+this.id+"']").text(); // at the label to titles array
    break;

    case "textarea":
    fd.append(t.attr("id"), t.val()); // add the value of the input
    titles[t.attr("id")] = $("label[for='"+this.id+"']").text(); // at the label to titles array
    break;

    case "hidden":
      if (t.attr("name") === "userId") {
        fd.append(t.attr("name"), t.attr("value")); // add the value of the input
        titles[t.attr("name")] = t.attr("value"); // at the label to titles array
      }
    break;

    case "file":
    fd.append(t.attr("id"), $(this)[0].files[0]); // add the value of the input
    titles[t.attr("id")] = $("label[for='"+this.id+"']").text(); // at the label to titles array
    break;

    case "checkbox":
    case "radio":
      if(t.prop("checked")) {
        if(typeof window[t.attr("name") + "_meta"] === "undefined") { // if array does not exist, create it
          window[t.attr("name") + "_meta"] = {};
        }
        if(typeof window[t.attr("name") + "_data"] === "undefined") { // if array does not exist, create it
          window[t.attr("name") + "_data"] = [];
        }

        window[t.attr("name") + "_meta"][t.attr("value")] = t.parent().text();
        window[t.attr("name") + "_data"].push(t.val());
      }
      if($.inArray(t.attr("name"), checkboxes) == "-1") { // if array name not there yet, add it to checkboxes array
        checkboxes.push(t.attr("name"));
      }
      break;

      case "submit":
      break;

      default:
      // if it's a textarea
      if (t.prop('tagName') === "TEXTAREA") {
        fd.append(t.attr("id"), t.val()); // add the value of the input
        titles[t.attr("id")] = $("label[for='"+this.id+"']").text(); // at the label to titles array
      }
      break;
    }
  });

  // gather all checboxes to formData
  for (var i = 0; i < checkboxes.length+1; i++) {
    var inputId = checkboxes[i];
    if(inputId) {
      var metaData = window[checkboxes[i]+"_meta"];
      var theData = window[checkboxes[i]+"_data"];
      metaData = JSON.stringify(metaData);
      fd.append(inputId+"_meta", metaData); // add the value of the input
      fd.append(inputId, theData); // add the value of the input
      titles[inputId] = $("label[for='"+inputId+"']").text(); // at the label to titles array
      if(window[inputId]) window[inputId].length = 0;
    }
  }
  checkboxes.length = 0;

  titles = JSON.stringify(titles);
  fd.append("titles", titles); // add titles to fd
  //$("#"+formName+":submit").removeAttr('disabled');
  return fd;
}

// define save();
function save(table, formName) {

  fd = prepareForm(formName);

  return post(table, fd).then(function(data){
    return data;
  });
}

function update(table, id, formName) {

  fd = prepareForm(formName);

  return put(table, id, fd).then(function(data) {
    return data;
  });
}


// handle info coming from upload progress
function progressHandlingFunction(e){
  if(e.lengthComputable){
    var percent= e.loaded/e.total*100;
    $("#progress").css("width", percent+"%");
    $("#processPercent").empty().append(percent+"%");
    if(percent === 100) {
      $("#progress").css("width", "0%");
    }
  }
}

// define post()
function post(table, data) {
  // perhaps we should wait here if access_token does not exist yet?

  if(J.host) {
    var url = J.host + "/api/j/?table="+table+"&token="+J.token+"&user="+J.userId+"&type=short";
  } else {
    var url = "/api/j/?table="+table+"&token="+J.token+"&user="+J.userId+"&type=short";
  }

  return $.ajax({
    url: url,
    type: 'POST',
    processData: false,
    contentType: false,
    data: data,
    dataType: 'jsonp',
    jsonp: "callback",
    success: function(response){
      if(response.objectId != undefined) {
        cl("post done" - response.objectId);
      } else {
        cl("error - object not saved");
        cl(response);
      }
      return response;
    },
    xhr: function() {  // Custom XMLHttpRequest
      var myXhr = $.ajaxSettings.xhr();
      if(myXhr.upload){ // Check if upload property exists
        myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // For handling the progress of the upload
      }
      return myXhr;
    },
    error: function(error) {
      a(error.responseText);
      ce(error);
      return error;
    }
  });
}


// define get()
function get(table, limit, id) {

  if(J.host) {
    var url = J.host + "/api/j/?table="+table+'&id='+id+'&limit='+limit;
  } else {
    var url = "/api/j/?table="+table+'&id='+id+'&limit='+limit;
  }

  return $.ajax({
    url: url,
    cache: canCache(),
    dataType: 'jsonp',
    jsonp: "callback",
    type: 'GET',
    success: function(data){
      return data;
    },
    error: function(error) {
      a(error.responseText);
      ce(error);
      return error;
    }
  });
}

// define put()
function put(table, id, data) {

  if(J.host) {
    var url = J.host + "/api/j/?table="+table+'&id='+id+'&data='+data;
  } else {
    var url = "/api/j/?table="+table+'&id='+id+'&data='+data;
  }

  return $.ajax({
    type: 'PUT',
    url: url,
    processData: false,
    contentType: false,
    data: data,
    dataType: 'jsonp',
    jsonp: "callback",
    success: function(data){
      return data;
    },
    error: function(error) {
      cl("siin")
      a(error.responseText);
      cl(error);
      return error;
    }
  });
}

function query(table, limit, key, value, order) {
  if(J.host) {
    var url = J.host + "/api/j/query/?table="+table+'&key='+key+'&value='+value+'&limit='+limit+'&order='+order;
  } else {
    var url = "/api/j/query/?table="+table+'&key='+key+'&value='+value+'&limit='+limit+'&order='+order;
  }

  return $.ajax({
    url: url,
    cache: canCache(),
    dataType: 'jsonp',
    jsonp: "callback",
    type: 'GET',
    success: function(data){
      return data;
    },
    error: function(error) {
      a(error.responseText);
      ce(error);
      return error;
    }
  });
}

(function ( $ ) {

  $.fn.out = function(transition) {
    return this.each(function() {
      var elem = $( this );
      if (transition === undefined) {
        elem.addClass("hidden");
      } else {
        elem.addClass("animated " + transition).addClass("hidden");
        elem.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
          elem.removeClass("animated " + transition);
        });
        //setTimeout(function(){ elem.removeClass("animated " + transition) }, 2000);
      }
      return this;
    });
  }

  $.fn.in = function(transition) {
    return this.each(function() {
      var elem = $( this );
      if (transition === undefined) {
        elem.removeClass("hidden");
      } else {
        elem.addClass("animated " + transition).removeClass("hidden");
        elem.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
          elem.removeClass("animated " + transition);
        });
        //setTimeout(function(){ elem.removeClass("animated " + transition) }, 2000);
      }
      return this;
    });
  }

  // get all tags from HTML and assign foo = $("#foo") & bar = $(".bar")
  var allTags = document.body.getElementsByTagName('*');
  for (var tg = 0; tg< allTags.length; tg++) {
    var tag = allTags[tg];
    if (tag.id && tag.id != "fb-root" && tag.id != "fb_xdm_frame_http" && tag.id != "fb_xdm_frame_http" && tag.id != "facebook-jssdk") {
      window[tag.id] = $("#"+tag.id);
    }
  }

}( jQuery ));
