# Jay
jQuery MVC framework for rapid building of Single Page Applications. Instant Crossroads JS routing, FB authentication &amp; Animate.CSS

**Instant**  
Authentication via Facebook  
Animate.css - css animations  
Crossroads.js - routing  

**Helpers**  

isUser(isLoggedIn, isNotLoggedIn) - determine, if user is logged in  
in(transition) - show an element (with a possible animate.css transition).  
out(transition) - hide an element (with a possible animate.css transition).  
cl(message) - shortcut for console.log(message);  
l(message) - print message to the #log  
a(message) - print message as an alert to the top of the page for client.  

```
//This is how you usually do it
$("#navigation").out();  

//This is how you can do it in Jay.
navigation.out();
```


**Goals:**  
* High browser compatibility  
* fast project start time  
* fast development time  
* good code maintainability  



**Problem**

I've built more then 10 MVP-s in the past and I'm still maintaining quite a number of them.  
After some time I've found the code getting cluttered, some things not working in some browsers and myself doing the same mistakes over and over again.  

A Single Page App (SPA) architecture relying on a REST API has become my weapon of choice. The jQuery part I did not choose, this is derived from all of the clients who cannot choose their browsers. Nevertheless, a SPA architecture with jQuery can cause quite a lot of stress, especially when I try to add new features later on. To quote a former coworker - this javascript thing can become a flea circus real easy.  

To solve this problem, I'm using a Model-View-Controller-ish framework relying on Crossroads.js routing. The Model contains routes. If a route is matched, a View function is called:

```
// Set up routing
crossroads.addRoute('/', frontView);
crossroads.addRoute('/admin', adminView);

//setup hasher
function parseHash(newHash, oldHash){
  crossroads.parse(newHash);
}
hasher.initialized.add(parseHash); //parse initial hash
hasher.changed.add(parseHash); //parse hash changes
hasher.init(); //start listening for history change

```
The View includes information about what to turn on or off on the page and calls a Controller function.
```
var frontView = function () {
  $("#otherPage").out();
  $("#frontPage").in();
  frontPageFunction();
}
```
A controller function is the best place to keep all the logic functions (like "show a single post" or "show all of the posts") for this route.

```
function frontPageFunction() {
  $.ajax({
    url: "/api/post",
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

    Client side user authentication relies on Facebook. Function isUser() provides the possibility to apply different commands to anonymous or logged-in users. Function isUser() determines that you are logged in before executing the functions. window.userId contains the user Facebook ID.

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
        });  

        ```
        jQuery and Bootstrap do what they usually do, momentJs provides date manipulations, and bower is used for package management. Functions in() and out() turn Bootstrap class "hidden" on and off. Giving it an animation name from animate.css - in("bounceInLeft") will decorate them with a CSS animation.

        ```
        $("#frontPage").out(); // hidden
        $("#otherPage").in(); // shown
        ```
        OR with animate.css animations:
        ```
        $("#frontPage").out(); // hidden
        $("#otherPage").in("fadeInLeft"); // shown with animation fadeInLeft

        ```

        This architecture has two quirks:  
        You have to turn views off after using them, which feels awkward in the beginning. The upside of this is that contemporary apps do not always rely on menus, it's rather a random thing turning other random things on and off. The other quirk is that views have to be defined before the models. I've never tried defining controllers before models.  

        The name J or Jay is a wordplay with the name jQuery.  
        I also like Jay-Z.  


        Goals for January:  

        1. Make Jay installable via bower.  
        It needs to be figured out how to install Jay via bower so that installing all of the dependencies is understandable for all (it currently relies on jquery, bootstrap, crossroads, signals and hasher).  
        2. Break front and backend into independent parts.  
        The current backend would be something like Jay-NodeJs or Jay-Node  
        3. Make a Github organisation that would host Jay & Jay-Node  
        4. Establish a way for CRUD operations.  
        5. Add WYSISWG editor - perhaps this:  
        https://github.com/Voog/wysihtml  
        6. Add Google Analytics and Facebook Like + Twitter Tweet buttons for demo.  











        This is an old readme, waiting to be updated:


        Blank Express + jQuery + Animate.css + Director + Bootstrap + Moment + Gulp (livereload) + Bower + Heroku  
        ===================


        This is a boilerplate for starting a new Single Page Application with the components listed in the header.


        INSTALLATION AND STARTING UP
        ===================  

        (Assuming you have everything else until node installed)  

        Install npm and bower things:  
        ```
        npm install  
        cd public  
        bower install  
        ```  

        Run Gulp:  
        ```
        gulp  
        ```  

        Run the server:  
        ```
        nodemon app.js
        ```  

        Go to: http://localhost:5000/


        INSTALLATION 2  

        I've created a fancy shortcut for .bash_profile.
        It does most of the things from INSTALLATION 1 automatically:  

        ```
        alias initio='git clone git@github.com:martinsookael/tabularasa.git .;git remote remove origin; npm install; cd public; b install;'

        ```

        ABOUT  
        ===================  


        EXPRESS:  
        Sets up a basic http server that serves the index.html file from public folder.  

        GULP:  
        Refreshes the browser every time something is edited in public folder.  

        HEROKU:  
        There is a Heroku specific Procfile present, that starts app.js if uploaded to Heroku.  

        BOWSER  
        is configured to install everything into folder "b"  

        RESPONDJS  
        brings media queries to IE 6-8  

        HTML5SHIV  
        brings HTML5 to IE  

        JQUERY + BOOTSTRAP  
        These guys do what they've always done.  
        As a side note - Bootstrap also does a CSS reset.  

        ANIMATE.CSS  
        Provides simple animations through CSS.

        DIRECTOR
