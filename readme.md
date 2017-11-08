- Current task
    - give time on todo - Y
    - user authentication! - Y
    - associate every todo with a user - Y
    - close gateways if user is already logged in. - Y
    - heroku and git
    - add currentUser to todo routes so header can access them (for navbar logged in as.., logout, show/hide register and login links) - Y
    - made changes to edit.ejs to propery update todo and display current todo to be edited - Y
    - edit.ejs default values using "selected disabled hidden" attributes in option - Y
    - make sure that To time is less than From time
    - change format from req.body.todo update route to number format in stored todo object - Y
    - Use Date Object - Y
    - Date(year, month, 0) will give number of dates in any given month - Y
        - month is zero-based, days is 1-31. 0 means last day of last month.
        - new Date(2017,9,0) while 9 = august, is actually 2017/08/31.
    - use script to populate date selection using year and month - Y
    - make changes in edit.ejs, schemas/models and routes to accommodate month, year, date - Y
    - overlapping times!!! (and dates, years, months)!!!
    - make changes to new and edit, where default month is current month for new - Y
        - build it so date will always dynamically populate given month
    - flash messages for when username already exists in signup - Y
        - npm install connect-flash
        - use res.locals.error and .success access flash in every template
        - req.flash("error") or "success" before you redirect to page
    - clean up look! (bootstrap 4 beta)
    - make changes in how data is displayed in "/todo"
        - list all years, then choose month, display month as calendar (do all in a single page!)
        - complicated! :(
        - transition to a calendar app??
        - "/" dynamically create calendar using JS?
        - REBUILD NEW AND EDIT EJS!!! Tie-in to index.ejs. That way, users only need to pick from and to hours. select year, month, date in index! total overhaul. :(
        - REBUILD INDEX.EJS!
        - click on date and it shows todo-list (show ejs) for that date. Must pass on completeDate to backend.
        - add a back button when showing specific todos in a single date to last known calendar screen!
        - passed todos ejs variable to todoCalendar.js for use with displaying titles and creating links to show todos in a given date
        - make dates in calendar a certain height. display only first 2-3 items
        - move Add New Todo link only when showing todos in a single date
        - default index page should be current month and year - set completeDate obj values in todoCalendar.js
        - move code out of document-ready function
        - combine functional, oop, and make code more readable (how???)
        - remove arrows for monthlist and year; show year in monthlist.
        - make prev and next button usable with dates, not just month
        - work on add new todo page! remove add new todo and make it appear only in date? month?
    

- Time
    - drop down?
    - interval? Must be to the minute
    - time and tasks are tied together!
    - how to detect overlapping times, and not record them or ask to overwrite them..
- Todo
    - similar to comments
    - associated with a given time
    - use RESTful routes for todo
    - fix the existing routes and pages to reflect association with time

- Future requirements
    - Day/Date/Year
    - login and signup
    - User auth
    - User association with todos
    - Deployment On Heroku


- 09.04.2017
    - npm install mongoose, express, etc.
    - install mongodb
    - check package.json
    - todo model
    - built RESTful routes for todo and created todo/ejs files
    - created seeds file
    - added user model
    - added login and register ejs
    - added authentication
    - added isLoggedIn middleware
    - check package.json
    - passport, passport-local, passport-local-mongoose
    - built in user to todo model
    - built headers and footers
    - added bootstrap
    - included header and footer into todo ejs

    
    
    