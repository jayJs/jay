// hello hello, facebook connect and #_=_
if (window.location.hash && window.location.hash == '#_=_') {
  window.location.hash = '/admin';
}

window.fbAsyncInit = function() {

  // test account for jay, works on localhost:5000
  var fbAppId = "756437764450452"

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

// shortcut for console.log
function cl(data) {
  console.log(data);
}

// write to alert
function a(message) {
  document.getElementById('alertMessage').innerHTML = message;
  document.getElementById('alert').classList.remove("hidden");
}

// shortcut for log to #log
function l(data) {
  var log = document.getElementById('log');
  log.innerHTML = log.innerHTML + data+"<br />";
  log.scrollTop = log.scrollHeight;
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
          if(i === 20) { // turn off the search after 20 times
            notLoggedIn();
            a('Unable to authenticate. Refresh page to try again');
            clearInterval(getStatus);
          }
          i++;
        }
      }
    }, 100); // Ping every 100 ms
  }
}

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

$(document).ready(function() {

  // get all tags from HTML
  var allTags = document.body.getElementsByTagName('*');
  var ids = [];
  for (var tg = 0; tg< allTags.length; tg++) {
    var tag = allTags[tg];
    if (tag.id) {
      ids.push(tag.id);
    }
  }

  // assign name = $("#name") & name = $(".name")
  for (var i = 0; i < ids.length; i++) {
    ids[i] = $("#"+ids[i]);
    window[ids[i][0].id] = $("#"+ids[i][0].id);
  }

});
