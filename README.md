
##Goals:  
* High browser compatibility  
* fast project start time  
* fast development time  
* good code maintainability  


##Installation  
```
bower install jay
```  
or download [jQuery](http://jquery.com/download/), [Bootstrap](http://getbootstrap.com/getting-started/#download), [Hasher](https://github.com/millermedeiros/hasher/), [Crossroads](http://millermedeiros.github.io/crossroads.js/) and [Jay](https://github.com/jayJs/jay/archive/master.zip)  
```
// Add CSS to header
<link rel="stylesheet" href="/bower_components/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="/bower_components/bootstrap/dist/css/bootstrap-theme.min.css">
<link rel="stylesheet" href="/bower_components/animate.css/animate.min.css">

// Add javascript right to the end of file before the closing </body> tag
<script src="/bower_components/jquery/dist/jquery.min.js"></script>
<script src="/bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="/bower_components/js-signals/dist/signals.min.js"></script>
<script src="/bower_components/hasher/dist/js/hasher.min.js"></script>
<script src="/bower_components/crossroads/dist/crossroads.min.js"></script>
<script src="/bower_components/jay/jay.js"></script>
```
Put your fbAppId into html head like this
```
<script>
  var fbAppId = "756437764450452"
</script>
```

##jQuery  
Jay is a shorthand for jQuery. You can safely use all of jQuery in Jay.  

##Templating  
Put all design templates into one index.html file and make them invisible.  
Jay relies on Bootstrap class "hidden".
```
<div id="frontPageView" class="hidden"></div>
<div id="otherPageView" class="hidden"></div>
```

##Selectors  
Jay takes every class and id on your index.html and creates a variable with their name.  
```
// Remember when you did:
$("#hello").show();

// how about
hello.show();
```

##in() & out()  
For showing and hiding elements, we have in() & out().
They also take an optional argument for a [animate.css](http://daneden.github.io/animate.css/) animation.
```
$("#hello").in();   // this is exactly the same
hello.in();         // as this

hello.in("bounce")   // comes in with animate.css animation called "bounce"
```
It's basically just a shorthand for adding / removing class "hidden" and optionally adding an animation.  
```
// both do the same thing:
$("#loading").addClass("animated fadeOut").addClass("hidden");
loading.out('fadeOut');
```

##Model: Routing  
To fetch data from URL we use routing from Crossroads JS.  
If a route is matched, a View function is called.
```
// Set routes
crossroads.addRoute('/', frontPageView);
crossroads.addRoute('/admin', adminPageView);

// Start routing
route(crossroads);
```

##Views  
The View includes information about what to turn on or off on the page and calls a Controller function.  
Views have to be declared before Models.  
```
var frontPageView = function () {
  otherPageView.out();
  adminPageView.out();
  frontPage.in();
  frontPageFunction();
}
```
One thing that might struck odd, is that you have to hide old things before you can show new things.  
The upside of this is that contemporary apps do not always rely on menus, it's rather a random thing turning other random things on and off.

**Controllers**  
A controller function is the best place to keep all the logic functions (like "Get latest posts from database") for this route.   This way you can keep your functions available to the relevant scope and all your logic in one place.  

```
function frontPageFunction() {
  $.ajax({
    url: "/api/posts",
    success: function(data){
      // do something with the data
      },  
      fail: function(error) {
        // show an error
      }
    });
  }
```

![is the user logged in?](http://i.imgur.com/rlWjEMH.png)  


##Authentication
**Facebook SDK**  
Jay loads the whole Facebook SDK for you. Currently we use it only for authentication.  

isUser() provides the possibility to apply different commands to anonymous or logged-in users. isUser() determines that you are logged in before executing the functions. window.userId contains the user Facebook ID.

A user is logged in if its logged in to Facebook and a user of a Facebook app.  
(Keep in mind that Facebook apps only work if the Settings -> Site URL matches your URL).  
```
function isLoggedIn() {
  $("#logInBox").hide();
  $("#logOutBox").show();  
  $("#content").append("Your user id is: " + window.userId);
}

function isNotLoggedIn() {
  $("#logOutBox").hide();  
  $("#logInBox").show();
}

isUser(isLoggedIn, isNotLoggedIn);  

```
OR
```

isUser(function() { // logged in users
  $("#logInBox").hide();
  $("#logOutBox").show();  
  $("#content").append("Your user id is: " + window.userId);
  }, function (){ // not logged in users
    $("#logOutBox").hide();  
    $("#logInBox").show();
  }
);  

```

##CRUD REST API
You can seda any data to the data table.  
Every posted entry get's an objectId and if queried returns the same object that was sent to him.
* you can send any data
* the data is not modeled in any way.
* all of the form fields posted will be saved and associated with an objectId.
* if queried, the API returns exactly what was sent to him.
* You can create required fields to front end with libraries like Parsley.


##post(formId,table) - Save data to database.  
formId - id of form, where the data comes (*string*).  
table - name of the table for saving this data (*string*).  

HTML  
```
<form id="addPostForm">
  <p>
    <label for="title">The title</label><br />
    <input id="title" type="text" class="form-control" /><br />
  </p>
  <p>
    <label for="content">Please write something</label><br />
    <textarea id="content" type="text" class="form-control"></textarea><br />
  </p>
  <input id="addPostSubmit" class="btn button" type="submit">
</form>

```
From input or textarea id is saved for key.  
The value user inserts will be saved as value.  
The value of label will be saved to variable *titles* (input and label have to be connected via "for" attribute in label).  

Javascript  
```
addPostForm.on("submit", function() {
  post('addPostForm','Posts');
})

```
On submitting the form "addPostForm" the contents will be saved to table "Posts".  


##get(table,objectId) - get data from database.  
table - name of the table in database (*string*).  
objectId - Id of object in database (*string*).

```
get("Posts", "378QWha5OB").then(function(data) {
  console.log(data);
}
```
would return
```
{
  objectId: "378QWha5OB",
  title: "What the user submitted",
  content: "What the user submitted",
  updatedAt: "2015-01-24T13:53:38.498Z",
  createdAt: "2015-01-24T13:53:37.745Z",
  titles: {
    content: "Please write something",
    title: "The title"
  }
}
```

##put(table, objectId, data)  
table - name of the table in database (*string*).  
objectId - Id of object in database (*string*).  
data - the data to be changed (*object*)  

```
var update = {
  title: "Let me change your title, Sir"
}
put("Posts", "378QWha5OB", update).then(function(data) {
  cl(data.updatedAt);
});
```
Would find objectId "378QWha5OB" and change the value under the key "title" to "Let me change your title, Sir".


##Helpers

##cl(message)  
A shortcut for console.log(message);  
```
console.log(message); // this logs the message to the console
cl(message); // this does exactly the same thing
```

##To put this all into one file
```
$(document).ready(function() {

  // View comes first
  var frontView = function () {
    $("#otherPage, #admin").out();
    $("#frontPage").in();
    frontPageFunction();
  }

  // Then the models
  crossroads.addRoute('/', frontView);
  crossroads.addRoute('/you', otherView);
  crossroads.addRoute('/admin', adminView);

  // start routing
  route(crossroads);

  // and then controllers
  function frontPageFunction() {
    $.ajax({
      url: "/api/posts",
      success: function(data){
        // do something with the data
        },  
      fail: function(error) {
        // show an error
      }
    });
  }
});
```

##Why?  

I've built more then 10 MVP-s in the past and I'm still maintaining quite a number of them.  
After some time I've found the code getting cluttered, some things not working in some browsers and myself doing the same mistakes over and over again.  

A Single Page App (SPA) architecture relying on a REST API has become my weapon of choice. The jQuery part I did not choose, this is derived from all of the clients who cannot choose their browsers. Nevertheless, a SPA architecture with jQuery can cause quite a lot of stress, especially when I try to add new features later on. To quote a former coworker - this javascript thing can become a flea circus real easy.  

The name J or Jay is a wordplay with the name jQuery.  
I also like Jay-Z.  


##Goals for January:  

1. Make Jay installable via bower.  **done**  
It needs to be figured out how to install Jay via bower so that installing all of the dependencies is understandable for all (it currently relies on jquery, bootstrap, crossroads, signals and hasher).  
2. Break front and backend into independent parts.   **done**  
The current backend would be something like Jay-NodeJs or Jay-Node  
3. Make a Github organisation that would host Jay & Jay-Node  **done**
4. Establish a way for CRUD operations.  
5. Add WYSISWG editor - perhaps this:  
https://github.com/Voog/wysihtml  
6. Add Google Analytics and Facebook Like + Twitter Tweet buttons for demo.  

##Licence

The MIT License (MIT)

Copyright (c) 2014 Mark Litwintschik

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
