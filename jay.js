// hello hello, facebook connect and #_=_
if (window.location.hash && window.location.hash == '#_=_') {
  window.location.hash = '/';
}

if (typeof fbAppId != "undefined") {
  window.fbAsyncInit = function() {

    FB.init({
      appId      : fbAppId,
      xfbml      : true,
      version    : 'v2.2',
      status     : true
    });

    FB.getLoginStatus(function(response){
      // FB logged in and this app has permissions
      if (response.status === "connected") {
        window.userId = response.authResponse.userID;
        // not a user or not authenticated with the app
      } else {
        window.userId = false;
        //console.log(response);
      }
    });
  };

  (function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/all.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
}

// shortcut for console.log
function cl(data) {
  console.log(data);
}

// shortcut for console.error
function ce(data) {
  console.error(data);
}

// write to alert
function a(message) {
  // find if alert exists and if it does, remove it.
  var elem = document.getElementById("alert")
  if(elem != null) {
    var elemParent = elem.parentNode;
    elemParent.removeChild("alert");
  }
  // create the alert HTML
  var extra = '<div id="alert" style="z-index: 10;"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><div id="alertMessage" class="alert alert-danger alert-dismissible" role="alert">'+message+'</div></div>';
  // add html to beginning of app
  var app = document.getElementById('app');
  app.innerHTML = extra + app.innerHTML;
}

function isUser (isLoggedIn, notLoggedIn) {
  // if it's a user
  if(window.userId != undefined && window.userId != false) {
    //isLoggedIn();
    isLoggedIn();
    // if it's not a user or we are not sure yet
  } else {
    var i = 0;
    var getStatus = setInterval(function(){
      // is not a user
      if(window.userId === false) {
        notLoggedIn();
        clearInterval(getStatus);
      }
      // is a user or not sure yet
      else {
        // is a user
        if(window.userId != undefined) {
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

// define save();
function save(table, formName) {

  // added progress bar
  $("body").append('<div style="position: absolute; color: #fff; padding-top: 15px; bottom: 20px; height: 50px; background: #000; opacity: 0.3; width: 0%; text-align: center" id="progress">Upload in progress: <span id="processPercent">45%</span></div>');

  var fd = new FormData();
  var titles = {};
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

      case "file":
      fd.append(t.attr("id"), $(this)[0].files[0]); // add the value of the input
      titles[t.attr("id")] = $("label[for='"+this.id+"']").text(); // at the label to titles array
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

  // prevent double submit
  formName.find("input:submit").each(function(){
    $(this).prop('disabled', true);
  });

  // post the contents of the form
  post(table, fd).then(function(data) { //cl(data);
    if(data.objectId != undefined) {
      // add titles to db via put().
      put(table, data.objectId, {titles: titles} ).then(function(data2) { // this is data2, since we use the data from the post()
        window.location = "#/p/" + data.objectId;
      });
    } else {
      cl("error - object not found");
    }

    // make submit active again
    formName.find("input:submit").each(function(){
      $(this).prop('disabled', false);
    });
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
  return $.ajax({
    url: "/api/?table="+table,
    type: 'POST',
    processData: false,
    contentType: false,
    data: data,
    success: function(response){
      if(response.objectId != undefined) {
        cl("post done" - response.objectId);
      } else {
        cl("error - object not saved");
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
function get(table, id) {
  return $.ajax({
    url: "/api/?table="+table+'&id='+id,
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
  data = JSON.stringify(data);
  return $.ajax({
    type: 'PUT',
    url: "/api/?table="+table+'&id='+id+'&data='+data,
    success: function(data){
      return data;
    },
    error: function(error) {
      a(error.responseText);
      cl(error);
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
