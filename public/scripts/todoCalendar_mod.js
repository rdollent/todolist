(function() {
    "use strict";
    
    const FULL_DATE = {}, // tracks current date, year, month. most important variable. all or most functions depend on this.
        // month object. obj key correspond to month value in JS i.e. month 0 = january.
        MONTH_LIST = Object.freeze({ 
            0: "January", 1: "February", 2: "March", 3: "April",  4: "May", 5: "June",
            6: "July", 7: "August", 8: "September", 9: "October", 10: "November", 11: "December"}),
        // day object. day key correspond to day value in JS i.e. 0 = sunday.
        DAY_LIST = Object.freeze({0: "S", 1: "M", 2: "T", 3: "W", 4: "T", 5: "F", 6: "S"});
        
    // use this as counter for holding prev/next buttons.
    let scrollInterval = null;
    // todos for xmlhttprequest ajax call
    let todos = undefined;
    
    function addEvents() {
        // const hamburger = document.querySelector(".nav-hamburger");
        // added mouseup event listener on whole document when scrolling through dates
        // and months, hovering mouse outside prev and next buttons while holding mousedown
        // and doing mouseup will not stop scrolling through dates/months. need mouseup on whole document
        // to detect mouseup.
        // attach letGo function to these events
        const LET_GO_ARR = Object.freeze(["touchend", "mouseup"]);
        
        // hamburger.addEventListener("click", function() {
        //     // make background blurry/bright/light and immune to pointer events
        //     // select body and all but not nav and all its children
        //     const allDiv = document.querySelectorAll("body > *:not(.nav)");
        //     // you can use forEach on a Nodelist
        //     console.log("hi");
        //     allDiv.forEach(function(elem) {
        //         elem.classList.toggle("select-none");
        //     });
        // });
        
        LET_GO_ARR.forEach(function(e) {
            document.addEventListener(e, function() {
                if(scrollInterval !== null) {
                    letGo();
                }
            });
        });
    }

    
    
    function detectSwipe(start, end) {
        const calendar = getId("calendar");
        const startX = start.x;
        const startY = start.y;
        const endX = end.x;
        const endY = end.y;
            
        // create a triangle.
        // we need 3 points. first point is start(x,y)
        // 2nd point is at end(x,y). connect start(x,y) and end(x,y) to form a line segment
        // to create a 3rd point, we need the y-coordinate of start
        // to maintain height from our start point,
        // and we need the same x-coordinate of our end
        // to mimic where our end x is along the x-axis if we moved in a strictly straight line
        // relative to the x-axis
        // base(x,y).----. start(x,y)
        //          |   /
        //          |  /
        //          | /
        //          |/
        //          .end(x,y)
        // we need the angle between start(x,y) and end(x,y) to be <= 45 degrees to be considered a swipe
        // we also need a minimum number of distance between start(x,y) and base(x,y) to be considered a full swipe
        
        const baseY = startY;
        const baseX = endX;
        
        const base = Math.abs(startX - baseX);
        const height = Math.abs(baseY - endY);
        // hypotenuse is c^2 = b^2 + a^2
        const hypotenuse = Math.sqrt(Math.pow(base,2) + Math.pow(height,2));
        
        // https://www.mathsisfun.com/algebra/trig-finding-angle-right-triangle.html
        // http://www.mathwarehouse.com/trigonometry/inverse-sine-cosine-tangent/inverse-sin-1.php
        // use sine and cosine to find angles! may need to convert radians to degrees, since JS uses radians
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sin
        // convert radians to degrees
        // degrees = radians * (180/pi)
        // right angle/90 degrees always at base(x,y)
        // sin(startAngle) =  height/hypotenuse
        // startAngle = arcsin(height/hypotenuse)
        const startAngle = Math.asin(height/hypotenuse)*(180/Math.PI);
        
        // alert(Math.abs(startX - endX) + " " + calendar.clientWidth);
        // register swipe at at least 25% of screen
        const distancePct = (Math.abs(base) / calendar.clientWidth);
        
        // right-to-left swipe
        const greater = startX > endX;
        // left-to-right swipe
        const less = startX < endX;
        
        // angle of swipe must be less than or equal to 40 degrees
        const angle40 = startAngle <= 40;
        
        // distance travelled of swipe must be greater than or equal to 20% of the screen
        const distance20 = distancePct >= 0.20;
        
        
        if(angle40 && distance20) {
            if(greater) {
                nextMonth();
            } else if(less) {
                prevMonth();
            }
        }
    }
    
    // function to run when page loads
    function runOnPageLoad() {
        makeRequest({index: "getTodo"});
        addEvents();
       
    }
    
    // shorthand to getelementbyid for easier typing. input the id name and get the element with the given id as input.    
    function getId(input) {
        return document.getElementById(input);
    }
    
    // shorthhand to createelement for easier typing. input the kind of element i.e. div, span and get the created element.
    function makeElem(input) {
        const elem = document.createElement(input);
        return elem;
    }
    
    // function that makes xmlhttprequests. called when loading the page, after editing or deleting an existing todo,
    // or after submitting a new todo
    function makeRequest(obj) {
        // obj argument which contains properties like
        // index - tells which kind of todo request is asked (get, update, new)
        // todo._id - each stored todo has a unique id in mongodb (assigned automatically once created)
        const myReq = new XMLHttpRequest(),
            formTodo = getId("formTodo"),
            ind = obj.index;
        let url, fd, todoObj = {}, sendItem, id;
        
        if(obj.todo !== undefined) {
            id = obj.todo._id;
        }
        //GET list of todos
        if(ind === "getTodo") { 
            url = "/todo/user/" + user;
            myReq.open("GET", url);
        }

        // let url = "https://to-do-list-rdollent.c9users.io/todo/" + user;
        // user is passed on through ejs/todo.js route; check <script> in index.ejs and get route in todo.js
        //update edited todo or create new one
        if(ind === "updTodo" || ind === "newTodo") { 
            if(ind === "updTodo") {
                url = "/todo/" + obj.todo._id;
                todoObj["_id"] = obj.todo._id;
            }
            else if(ind === "newTodo") {
                url = "/todo/";
            }
            // FormData does not work on IE!!!!
            // fd = new FormData(obj.form);
            // console.log(fd.entries());
            // // https://stackoverflow.com/questions/25040479/formdata-created-from-an-existing-form-seems-empty-when-i-log-it
            // for(let [key,val] of fd.entries()) {
            //     todoObj[key] = val;
            // }
            
            // take all form data and put it into an object
            fd = formTodo.querySelectorAll("input, textarea, select");
            // for(let i = 0; i < fd.length; i++) {
            //     todoObj[fd[i].name] = fd[i].value;
            // }
            fd.forEach(function(e) {
                todoObj[e.name] = e.value;
            });
            
            
            // false for synchronous behaviour. async will process succeeding functions as ajax call is underway.
            //https://stackoverflow.com/questions/19286301/webkitformboundary-when-parsing-post-using-nodejs
            //https://developer.mozilla.org/en-US/docs/Web/API/FormData/entries
            myReq.open("POST", url);
            sendItem = JSON.stringify(todoObj);
            myReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            
        }
        
        // delete a todo
        else if(ind === "delTodo") {
            url = "/todo/delete/" + id;
            myReq.open("POST", url);
        }
        myReq.onreadystatechange = function() {
            if(myReq.readyState === 4 && myReq.status === 200) {
                if(ind === "getTodo") {
                    todos = JSON.parse(myReq.responseText);
                    getCurrentCalendar();
                    // if(getId("addBtn") === null) {
                    // let add = makeIcon("add");
                    // add.addEventListener("click", function() {
                    //     makeOrEditTodo({index: "newTodo"});
                    //     // this.classList.toggle("no-display");
                    //     clearIcons("edit");
                    // });
                    // } else {
                        // getId("addBtn").classList.toggle("no-display");
                    //}
                    clearIcons("default");
                    makeAddBtn();
                } else if(ind === "updTodo" || ind === "newTodo" || ind === "delTodo") {
                    makeRequest({index: "getTodo"});
                    clearEntries();
                }
                
            }
        };
        myReq.send(sendItem);
        
        setBodyHeight();
    }


    function getCurrentCalendar() {
        if(FULL_DATE.year === undefined) {
            FULL_DATE.year = new Date().getFullYear();
        }
        
        if(FULL_DATE.month === undefined) {
            FULL_DATE.month = new Date().getMonth();
        }
        
        if(FULL_DATE.date === undefined) {
            FULL_DATE.date = new Date().getDate();
        }
        FULL_DATE.maxDates = new Date(FULL_DATE.year, FULL_DATE.month + 1, 0).getDate();
        makeCalendar();
        makeDayAndDate();
        makePeriodSelectBtns();
    }

    // populate Year OR Month list
    // need to start makeList when pressing button to allow functions to run!
    function makeList(input) {
        const main = makeElem("div"),
            calendar = getId("calendar"), //async
            frag = document.createDocumentFragment(); //append generated elems here then to main
        main.id = input + "List";
        let i, start, end, value, clicked;
        if(input === "year") {
            start = 2000, end = 2099, value = function() { return i }, clicked = yearClicked;
        } else if(input === "month") {
            start = 0, end = 11, value = function() { return MONTH_LIST[i] }, clicked = monthClicked;
        }
        for(i = start; i <= end; i++) {
            let div = makeElem("div");
            div.textContent = value();
            if(input === "month") {
                div.classList.toggle("month-list");
                if(div.textContent === MONTH_LIST[FULL_DATE.month]) {
                    div.selected = true;
                }
            } else if(input === "year") {
                div.classList.toggle("year-list");
                if(div.textContent === String(FULL_DATE.year)) {
                    div.selected = true;
                }
            }
            div.setAttribute("data-" + input, i);
            div.addEventListener("click", clicked);
            div.addEventListener("mousedown", function() {
                removeColour();
                putColour(this);
            });
            div.addEventListener("touchstart", function() {
                removeColour();
                putColour(this);
            });

            frag.appendChild(div);
        }
        main.appendChild(frag);
        calendar.appendChild(main);
    }
    
    function makeYearHeader() {
        const yearTitle = makeElem("div"),
            calendar = getId("calendar");
        yearTitle.id = "yearTitle";
        yearTitle.textContent = FULL_DATE.year;
        calendar.appendChild(yearTitle);
    }
    
    function yearClicked() {
        const yearList = getId("yearList"),
            monthList = getId("monthList"),
            periodSelect = getId("periodSelect"),
            yearTitle = getId("yearTitle"),
            indexContainer = document.querySelector(".index-container"),
            years = Array.from(document.querySelectorAll(".year-list")),
            modContent = document.querySelector(".mod-content");
            // selectedYear = event.target.options[event.target.options.selectedIndex].textContent;

        FULL_DATE.year = parseInt(this.textContent, 10);
        yearList.classList.toggle("no-display");
        if(monthList && yearTitle) {
            monthList.classList.toggle("no-display");
            yearTitle.classList.toggle("no-display");
            // change the displayed year in the Year Header
            yearTitle.firstChild.textContent = FULL_DATE.year;
        }
        if(periodSelect) {
            // periodSelect.classList.toggle("no-display");
            periodSelect.dataset.period = "month";
            // periodSelect.textContent = "view_module";
            periodSelect.textContent = "arrow_back";
        }
        indexContainer.classList.toggle("max-height");

        selectCurrent("month");
        
    }
    
    function monthClicked() {
        // const monthList = getId("monthList"),
        //     yearTitle = getId("yearTitle"),
        //     addBtn = getId("addBtn");
            // selectedMonth = event.target.options[event.target.options.selectedIndex].dataset.month;
            const indexContainer = document.querySelector(".index-container"),
                modContent = document.querySelector(".mod-content"),
                buttonPane = document.querySelector(".button-pane");
        indexContainer.classList.toggle("max-height");
        modContent.classList.toggle("no-display");
        buttonPane.classList.toggle("no-display");
        getId("monthList").classList.toggle("no-display");
        getId("yearTitle").classList.toggle("no-display");
        // getId("addBtn").classList.toggle("no-display");
        clearIcons("default");
        // makeAddBtn();
        FULL_DATE.month = parseInt(this.dataset.month, 10);
        FULL_DATE.maxDates = new Date(FULL_DATE.year, FULL_DATE.month + 1, 0).getDate();
        getId("periodSelect").dataset.period = "calendar";
        getId("periodSelect").textContent = "arrow_back";
        makeCalendar();
        makeDayAndDate();
        makePeriodSelectBtns();
        makeAddBtn();
    }
    
    function makeCalendar() {
        const calendar = getId("calendar"),
            container = makeElem("div"),
            titleHeader = makeTitleHeader();
        let coordStart, coordEnd;
        container.id = "container";
        while(calendar.lastChild) {
            calendar.removeChild(calendar.lastChild);
        }
        calendar.appendChild(container);
        container.appendChild(titleHeader);
        makeBtns();
        
        
        // https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
        container.addEventListener("touchstart", function(event) {
            // event.preventDefault();
            // no preventdefault as it will stop any eventlisteners
            coordStart = { x: event.changedTouches[0].clientX , y: event.changedTouches[0].clientY };
        });
        
        container.addEventListener("touchend", function(event) {
            // event.preventDefault();
            //add preventdefault to stop selecting dates when touchend fires
            coordEnd = { x: event.changedTouches[0].clientX , y: event.changedTouches[0].clientY };
            detectSwipe(coordStart, coordEnd);
        });
        
    }
    function makeTitleHeader() {
        const span = makeElem("span"),
            titleHeader = makeElem("div");
        span.id = "tblHeader";
        titleHeader.id = "title";
        span.textContent = MONTH_LIST[FULL_DATE.month] + " " + FULL_DATE.year;
        titleHeader.appendChild(span);
        return titleHeader;
    }
    
    function makeDayHeader() {
        const trDays = makeElem("tr");
        trDays.classList.toggle("row");
        // populate table with day headers
        for(let i = 0; i <= 6; i++) {
            const th = makeElem("th");
            th.classList.toggle("col");
            // DAY_LIST is global variable
            th.textContent = DAY_LIST[i];
            trDays.appendChild(th);
        }
        return trDays;
    }
    
    function makeTbl() {
        const tbl = makeElem("table"),
            colgrp = makeElem("colgroup"),
            trDays = makeDayHeader();
        tbl.id = "tbl";
        colgrp.span = 7;
        tbl.appendChild(colgrp);
        tbl.appendChild(trDays);
        return tbl;
    }
    
    // get todos variable pass on from ejs
    function getTodosMonth(todosArr) {
        return todosArr.filter(function(todo) {
            return (todo.year === FULL_DATE.year && todo.month === FULL_DATE.month);
        });
    }

    function makeDayAndDate() {
        const tbl = makeTbl(),
            container = getId("container"),
            tblHeader = getId("tblHeader"),
            maxDate = FULL_DATE.maxDates;

        if(getId("tbl")) {
            container.removeChild(getId("tbl"));
        }
        
        // if tblHeader exists, change month and year
        // if(tblHeader) {
            tblHeader.firstChild.textContent = MONTH_LIST[FULL_DATE.month] + " " + FULL_DATE.year;
        // }

        FULL_DATE.firstDay = new Date(FULL_DATE.year, FULL_DATE.month, 1).getDay();

        // populate table with dates
        let dates = 1;
        while(dates  <= maxDate) {
            let tr = makeElem("tr");
            tr.classList.toggle("row");
            let days = 0; //represents days of the week
            while(days <= 6) {
                let td = makeElem("td"),
                a = makeElem("a");
                a.classList.toggle("calendar-dates");
                td.classList.toggle("col");
                
                if(dates === 1 && days !== FULL_DATE.firstDay) {
                    dates--; // cancels out dates++ at 
                    // td.classList.add("no-select");
                } else if(dates > 0 && dates <= FULL_DATE.maxDates) {
                    a.textContent = dates;
                    a.dataset.date = dates;
                    td.addEventListener("click", function() { 
                    selectDate(this.querySelector("a"));
                    clearIcons("all");
                    makeAddBtn();
                });
                }
                dates++;
                days++;
                td.appendChild(a);
                tr.appendChild(td);
            }
            tbl.appendChild(tr);
        }
    container.appendChild(tbl);
    populateCalendarWithDots();
    selectDate();
    
    
    }
    
    function selectDate(elem) {
        if(elem === undefined || elem === null) {
            // use array methods on a nodelist
            // https://stackoverflow.com/questions/3871547/js-iterating-over-result-of-getelementsbyclassname-using-array-foreach
            const dates = document.getElementsByClassName("calendar-dates"),
                 obj = Array.from(dates).filter(function(d) {
                     return parseInt(d.dataset.date, 10) === FULL_DATE.date || parseInt(d.dataset.date, 10) === FULL_DATE.maxDates;

                    });
            elem = obj[0];
        }

        showTodos(elem);
        removeColour();
        putColour(elem);
    }
    
    function populateCalendarWithDots() {
        const todosMonth = getTodosMonth(todos),
            calendarDates = Array.from(document.querySelectorAll(".calendar-dates")),
            todoIcon = makeElem("div"),
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
            // https://stackoverflow.com/questions/11115998/is-there-a-way-to-add-remove-several-classes-in-one-single-instruction-with-clas
            todoIconStr = "<i class='material-icons icon-dots visible'>brightness_1</i>",
            // place indicator if date has a todo
            // map produces a new array, where obj is each elem in todosMonth array, and returns obj.date for each obj.
            todosDateAll = todosMonth.map(obj => obj.date);
            
            // get only unique dates. es6 method.
            // todosDate = new Set(todosDateAll);

        todoIcon.classList.add("icon-tiny");
        // use curly braces in arrow functions to prevent returning a value.
        // note: Arrow functions do not have a 'return' keyword
        [1, 2, 3].forEach(() => { todoIcon.insertAdjacentHTML("beforeend", todoIconStr) });
        // todoIcon = "<i class='icon-tiny material-icons icon-white icon-dots'>arrow_drop_down</i>";

        // go through dates, look at where there is a todo
        // do not use innerHTML as it will remove any event listeners
        // use insertAdjacentHTML https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
        calendarDates.forEach( date => {
            // dates in calendar are string, dates in todosDate are numbers
            const dateInt = parseInt(date.textContent, 10);
            
            // if(date.textContent) {
                // if child already exists in DOM, appendChild removes node from its initial position
                // and moves it to the current position. Use cloneNode to append the same element over and over
                // to different parents.
            date.parentNode.appendChild(todoIcon.cloneNode(true));
                
            // }
            // if(todosDate.has(parseInt(date.textContent))) {
            // }
            // if date exists in todosDateAll (dates that have todos)
            if(todosDateAll.indexOf(dateInt) > -1) {
                // # of times the current date appears in todosDateAll is how many todos there are in a date
                const todoNum = todosDateAll.filter( b => b === dateInt).length,
                // capture all dots
                currDate = date.parentNode.querySelectorAll(".icon-dots");

                if(todoNum < 4) {
                    // only show 1 dot if there are less than 4 todos
                    currDate[0].classList.toggle("visible");
                } else if(todoNum >= 4 && todoNum <= 7) {
                    // 2 dots between 4 and 7 todos
                    currDate[0].classList.toggle("visible");
                    currDate[1].classList.toggle("visible");
                } else if(todoNum >= 8) {
                    // 3 doys for more than 8 todos on a date
                    currDate[0].classList.toggle("visible");
                    currDate[1].classList.toggle("visible");
                    currDate[2].classList.toggle("visible");
                }
                // use array filter to count how many todos in any given date!
                // date.nextElementSibling.classList.toggle("visible");
            }
        });
    }

    function makeBtns() {
        const prevImg = makeElem("i"),
            nextImg = makeElem("i"),
            btnsArr = [prevImg, nextImg],
            eventsArr = ["mousedown", "touchstart"],
            modContent = document.querySelector(".mod-content"),
            container = getId("container");

        btnsArr.forEach(function(btn) {
            btn.classList.toggle("material-icons");
            btn.classList.toggle("prev-next-icon");
            if(btn === prevImg) {
                btn.textContent = "navigate_before";
                btn.id = "prevBtn";
                btn.addEventListener("mousedown", prevMonth);
            } else if(btn === nextImg) {
                btn.textContent = "navigate_next";
                btn.id = "nextBtn";
                btn.addEventListener("mousedown", nextMonth);
            }
        });

        eventsArr.forEach(function(btnEvent) {
            btnsArr.forEach(function(btn) {
                // btn.addEventListener(btnEvent, clearEntries);
                // add event holdThis function for mouseup and mousedown, hold button to scroll through date/month
                btn.addEventListener(btnEvent, holdThis);
                btn.addEventListener(btnEvent, function() {
                    
                    const formTodoDiv = getId("formTodoDiv");
                    resetTodosHeight(modContent);
                    setTodosHeight(formTodoDiv);
                });
            });
            
        });
        
        container.insertBefore(prevImg, container.children.namedItem("title"));
        container.insertBefore(nextImg, container.children.namedItem("title").nextSibling);

    }
    
    // hold prev and next buttons to scroll through months/dates
    function holdThis() {
        const clickedElem = this;
        // clearEntries();
        scrollInterval = setInterval(function() {
            if(clickedElem.id === "nextBtn") {
                return nextMonth();
            } else if(clickedElem.id === "prevBtn") {
                return prevMonth();
            }
        }, 300); 
    }
    
    function letGo() {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
    
    function prevMonth() {
        if(FULL_DATE.month === 0) {
            FULL_DATE.year = FULL_DATE.year - 1;
            FULL_DATE.month = 11;
            FULL_DATE.maxDates = new Date(FULL_DATE.year, 0, 0).getDate();
        } else {
            FULL_DATE.month = FULL_DATE.month - 1;
            FULL_DATE.maxDates = new Date(FULL_DATE.year, FULL_DATE.month + 1, 0).getDate();
        }
        makeDayAndDate();
    }
    
    function nextMonth() {
        if(FULL_DATE.month === 11) {
            FULL_DATE.year = FULL_DATE.year + 1;
            FULL_DATE.month = 0;
            FULL_DATE.maxDates = new Date(FULL_DATE.year, 1, 0).getDate();
        } else {
            FULL_DATE.month = FULL_DATE.month + 1;
            FULL_DATE.maxDates = new Date(FULL_DATE.year, FULL_DATE.month + 1, 0).getDate();
        }
        makeDayAndDate();
    }

    // clear todo entries on date Level
    function clearEntries() {
        const modContent = document.querySelector(".mod-content");
        while(modContent.lastChild) {
            modContent.removeChild(modContent.lastChild);
        }
    }
    
    function showTodos(clickedElem) {
        const fragTodos = document.createDocumentFragment(), //append generated elems here first
            todosMonth = getTodosMonth(todos),
            modContent = document.querySelector(".mod-content"),
            entries = makeElem("div"),
            showTodoDiv = makeElem("div");
        let todosTodayTemp = [],
            todosToday = [];
        
        clearIcons("default");
        if(getId("formTodo")) {
            makeAddBtn();
        }
        
        // reset modContent height
        clearEntries();
        resetTodosHeight(modContent);
        // console.log(clickedElem);
        // console.log(this.textContent);
        // clicking date on calendar, get date for FULL_DATE.date,
        // otherwise, FULL_DATE.date is taken using prevDate and nextDate functions.
        if(clickedElem) {
            FULL_DATE.date = parseInt(clickedElem.dataset.date, 10);
        }

        todosTodayTemp = todosMonth.filter((todo) => todo.date === FULL_DATE.date);
        
        todosToday = todosTodayTemp.sort(compareTimes);

        
        showTodoDiv.id = "showTodoDiv";
        entries.id = "entries";

        //please see
        //https://stackoverflow.com/questions/48100598/parameter-not-being-passed-on-addeventlistener-on-ie11/48101139#48101139
        for(let i = 0, s = todosToday.length; i < s; i++) {
            const a = makeElem("a"),
                spanHour = makeElem("span"),
                spanTodo = makeElem("span");
            //todosToday[i] won't be passed through a.addEventListener because of scope
            //attach todo in element "a" and access it as its property.
            a.todo = todosToday[i];
            a.classList.toggle("single-entry");
            spanTodo.classList.toggle("col-todos");
            spanHour.classList.toggle("col-hours");
            
            // a.setAttribute("href", "/todo/" + todosToday[i]._id);
            a.addEventListener("click", function() {
                resetTodosHeight(modContent);
                showFoundTodo(a.todo);
                });
            spanHour.textContent = todosToday[i].frmHr + ":" + todosToday[i].frmMin + " - " +
                            todosToday[i].toHr + ":" + todosToday[i].toMin;
            spanTodo.textContent = todosToday[i].title;
            a.appendChild(spanHour);
            a.appendChild(spanTodo);
            fragTodos.appendChild(a);
        }
        if(todosToday.length === 0) {
            const noEntries = makeElem("div");
            noEntries.classList.add("no-entries");
            noEntries.textContent = "No entries. Click the button below to add todos!";
            fragTodos.appendChild(noEntries);
        }
        entries.appendChild(fragTodos);
        showTodoDiv.appendChild(entries);
        modContent.appendChild(showTodoDiv);

        if(todosToday.length > 0) {
            setTodosHeight();
            modContent.classList.add("overflow");
        }
        
    }
    
    function resetTodosHeight(el) {
        el.style.setProperty("height", "auto");
    }
    
    function setTodosHeight(x) {
        
        if(window.innerWidth < 1280) {
          const container = document.querySelector(".index-container"),
            nav = document.querySelector(".nav"),
            buttonPane = document.querySelector(".button-pane"),
            containerHeight = window.getComputedStyle(container).height, //string
            navHeight = window.getComputedStyle(nav).height, //string
            btnPaneHeight = window.getComputedStyle(buttonPane).height, //string
            todosDateHeight = window.innerHeight - (parseInt(containerHeight, 10) + parseInt(navHeight, 10) + parseInt(btnPaneHeight, 10) + 10), //20px is margin-top of index-container
            modContent = document.querySelector(".mod-content");
            // elem = getId(x);
            modContent.style.setProperty("height", todosDateHeight + "px");
            // modContent.classList.add("overflow");
            if(x) {
                x.style.setProperty("height", modContent.scrollHeight + "px");
            }  
        }
    }
    // use to sort todosToday array (of objects)
    function compareTimes(a,b) {
        if(parseInt(a.frmHr + a.frmMin, 10) < parseInt(b.frmHr + b.frmMin, 10)) {
            return - 1;
        } else if(parseInt(a.frmHr + a.frmMin, 10) > parseInt(b.frmHr + b.frmMin, 10)) {
            return 1;
        }
        // if a.frmHr and b.frmHr are equal
        return 0;
    }
    
    function makePeriodSelectBtns() {
        const periodSelect = getId("periodSelect");
        periodSelect.textContent = "arrow_back";
        periodSelect.dataset.period = "calendar";
        periodSelect.addEventListener("click", switchPeriod);
    }
    
    function switchPeriod() {
        const monthList = getId("monthList"),
            yearList = getId("yearList"),
            calendar = getId("calendar"),
            yearTitle = getId("yearTitle"),
            indexContainer = document.querySelector(".index-container"),
            modContent = document.querySelector(".mod-content"),
            buttonPane = document.querySelector(".button-pane"),
            state = this.dataset.period;
        
        if(state === "month") {
            monthList.classList.toggle("no-display");
            yearTitle.classList.toggle("no-display");
            if(yearList) {
                yearList.classList.toggle("no-display");
            } else {
                makeList("year");
            }
            // this.classList.toggle("no-display");
            this.textContent = "date_range";
            indexContainer.classList.toggle("max-height");
        }
        else if(state === "calendar") {
            // note: if I try to put container in variable, it won't work.
            // see https://stackoverflow.com/questions/42956884/failed-to-execute-removechild-on-node
            calendar.removeChild(getId("container"));
            clearEntries();
            resetTodosHeight(modContent);
            if(monthList && yearTitle) {
                monthList.classList.toggle("no-display");
                yearTitle.classList.toggle("no-display");
                yearTitle.firstChild.textContent = FULL_DATE.year;
            } else {
                makeYearHeader();
                makeList("month");
            }
            this.dataset.period = "month";
            // this.textContent = "view_module";
            // getId("addBtn").classList.toggle("no-display");
            clearIcons("all");
            // make index-container full height
            indexContainer.classList.toggle("max-height");
            modContent.classList.toggle("no-display");
            buttonPane.classList.toggle("no-display");
            
        }

        selectCurrent(state);
    }
    
    function selectCurrent(state) {
        const years = Array.from(document.querySelectorAll(".year-list")),
            months = Array.from(document.querySelectorAll(".month-list")),
            y = years.filter((y) => parseInt(y.textContent, 10) === FULL_DATE.year ),
            m = months.filter((m) => m.textContent === MONTH_LIST[FULL_DATE.month]);
        
        if(state === "calendar") {
            m[0].classList.add("selected-date");
        } else if(state === "month") {
            y[0].classList.add("selected-date");
        }
    }
    
    function removeColour() {
        // let selectedDate = document.getElementsByClassName("selected-date")[0];
        const selectedDate = document.querySelectorAll(".selected-date");

        if(selectedDate) {
            selectedDate.forEach( (date) => { date.classList.toggle("selected-date") });
        }
        
    }  
    
    function putColour(elem) {
        if(elem.classList.contains("calendar-dates")) {
            elem.parentNode.classList.toggle("selected-date");
        } else if (elem.classList.contains("month-list") || elem.classList.contains("year-list")) {
            elem.classList.toggle("selected-date");
        }
        
    }

    function showFoundTodo(todo) {
        // console.log(todo);
        const modContent = document.querySelector(".mod-content"),
            // form = makeElem("form"),
            // btnDel = makeElem("i"),
            // btnEdit = makeElem("i"),
            // btnBack = makeElem("i"),
            showFoundTodoDiv = makeElem("div"),
            showArr = ["time", "title", "description"],
            // btnArr = ["delete", "edit", "arrow_back"],
            frag = document.createDocumentFragment(),
            // addBtn = getId("addBtn"),
            span = makeElem("span");
        
        
        clearIcons("default");
        clearEntries();
        
        // if(!addBtn.classList.contains("no-display")) {
        //     addBtn.classList.toggle("no-display");
        // }
        

        
        showArr.forEach(function(t) {
            const x = makeElem("div");
            if(t === "time") {
                const icon = makeElem("i");
                span.textContent = todo.frmHr + ":" + todo.frmMin + " - " + todo.toHr + ":" + todo.toMin;
                icon.classList.toggle("material-icons");
                icon.textContent = "access_time";
                x.appendChild(icon);
                x.appendChild(span);
                x.classList.toggle("todo-show-time");

            } else {
                x.textContent = todo[t];
                x.classList.toggle("todo-show-content");
                (t==="title" ? x.classList.toggle("content-title") : x.classList.toggle("content-desc"));
            }
            frag.appendChild(x);
        });
        // id
        showFoundTodoDiv.id = "showFoundTodoDiv";
        // class
        modContent.classList.remove("overflow");
        
        showFoundTodoDiv.appendChild(frag);
        modContent.appendChild(showFoundTodoDiv);
        
        clearIcons("all");
        makeTodoBtns(todo);
    }
    
    function makeOrEditTodo(obj) {
        if(getId("showTodoDiv")) {
            const showTodoDiv = getId("showTodoDiv");
                // modContent = document.querySelector(".mod-content");
            showTodoDiv.classList.toggle("no-display");
            // modContent.classList.remove("overflow");
        }
        if(getId("formTodoDiv")) {
            const formTodoDiv = getId("formTodoDiv");
            formTodoDiv.parentNode.removeChild(formTodoDiv);
        }
        
        // clearIcons("edit");
        // declare all variables. cant declare inside if since let and const are block-scoped
        const
        // for edit and create
            task = obj.index,
            todo = obj.todo,
            modContent = document.querySelector(".mod-content"),
             // make elements
            formTodoDiv = makeElem("div"),
            form = makeElem("form"),
            submitForm = makeElem("input"),
            // iconContBack = makeIcon(btnBack),
            // iconContSub = makeIcon(btnSubmit),
            // btnPane = document.getElementsByClassName("button-pane")[0],
            objInput = {
                makeInput: function(x) {
                    let input;
                    if(x === "title") {
                        input = makeElem("input");
                        input.type = ("text");
                        input.setAttribute("maxlength", 15);
                        input.setAttribute("size", 15);
                    } else if(x === "description") {
                        input = makeElem("textarea");
                        input.setAttribute("maxlength", 140);
                    }
                    input.required = "required";
                    
                    input.name = x;
                    // assign id as formTitle or formDescription
                    input.id = "form" + x.charAt(0).toUpperCase() + x.slice(1);
                    if(task === "updTodo") {
                        input.value = todo[x];
                    } else if(task === "newTodo") {
                        input.placeholder = x;
                    }
                    return input;
                }
            },
       
            title = objInput.makeInput("title"),
            desc = objInput.makeInput("description"),
			dateDiv = makeElem("div"),
			timeDiv = makeElem("div"),
			titleDiv = makeElem("div"),
			iconDate = makeElem("i"),
			iconTime = makeElem("i"),
			iconTitle = makeElem("i"),
			iconDesc = makeElem("i");
			
		iconDate.classList.add("material-icons");
		iconDate.classList.add("icon-date");
		iconTime.classList.add("material-icons");
		iconTime.classList.add("icon-time");
		iconTitle.classList.add("material-icons");
		iconTitle.classList.add("icon-title");
		iconDesc.classList.add("material-icons");
		
		iconDate.textContent = "date_range";
		iconTime.textContent = "access_time";
		iconTitle.textContent = "title";
		iconDesc.textContent = "description";
		dateDiv.appendChild(iconDate);
		timeDiv.appendChild(iconTime);
		titleDiv.appendChild(iconTitle);

        // variables for options
        
        // const cases = {
        //     date: () => {
        //         start = 1;
        //         end = FULL_DATE.maxDates;
        //         selectName = "date";
        //         selectId = "formDate";
        //     },
        //     month: () => {
        //         start = 0;
        //         end = 11;
        //         selectName = "month";
        //         selectId = "formMonth";
        //     },
        //     year: () => {
        //         start = 2000;
        //         end = 2099;
        //         selectName = "year";
        //         selectId = "formYear";
        //     },
        //     frmHr: () => {
        //         start = 0;
        //         end = 23;
        //         selectName = "frmHr";
        //         selectId = "formFrmHr";
        //     },
        //     frmMin: () => {
        //         start = 0;
        //         end = 59;
        //         selectName = "frmMin";
        //         selectId = "formFrmMin";    
        //     },
        //     toHr: () => {
        //         start = 0;
        //         end = 23;
        //         selectName = "toHr";
        //         selectId = "formToHr"; 
        //     },
        //     toMin: () => {
        //         start = 0;
        //         end = 59;
        //         selectName = "toMin";
        //         selectId = "formToMin";
        //     },
        //     generate: (input) => {
        //         //wrong
        //         this[input]();
        //     }
            
        // };
        
        
        ///////////////////////////////////////////////////////////////////////////
        let todoArr = [0,1,2,3,4,5,6], start = 0, end = 0, selectName = "", selectId = "", showFoundTodoDiv;
        
        if(task === "updTodo") {
            todoArr = [todo.date, todo.month, todo.year, todo.frmHr, todo.frmMin, todo.toHr, todo.toMin];
        }

        for(let i = 0, s = todoArr.length; i < s; i++) {
            let select = makeElem("select");
            switch(i) {
				case 0: // todo.date
                    start = 1;
                    end = FULL_DATE.maxDates;
                    selectName = "date";
                    selectId = "formDate";
                    break;
                case 1: // todo.month
                    start = 0;
                    end = 11;
                    selectName = "month";
                    selectId = "formMonth";
                    break;
                case 2: // todo.year
                    start = 2000;
                    end = 2099;
                    selectName = "year";
                    selectId = "formYear";
                    break;
                case 3: // todo.frmHr
                    start = 0;
                    end = 23;
                    selectName = "frmHr";
                    selectId = "formFrmHr";
                    break;
                case 4: // todo.frmMin
                    start = 0;
                    end = 59;
                    selectName = "frmMin";
                    selectId = "formFrmMin";
                    break;
                case 5: // todo.toHr
                    start = 0;
                    end = 23;
                    selectName = "toHr";
                    selectId = "formToHr";
                    break;
                case 6: // todo.toMin
                    start = 0;
                    end = 59;
                    selectName = "toMin";
                    selectId = "formToMin";
                    break;
            }
            // assign names and ids
            select.setAttribute("name", selectName);
            select.classList.add("form-select");
            select.id = selectId;
            
            for(let j = start; j <= end; j++) {
                let optns = makeElem("option");
                // convert month number to name
                if(selectId === "formMonth") {
                    optns.textContent = MONTH_LIST[j];
                } else if(selectId === "formYear" || selectId === "formDate") {
                    optns.textContent = j;
                // hours and minutes, convert j from for loop to "00" format in option boxes
                } else { 
                    if(j < 10) {
                        optns.textContent = "0" + j;
                    } else {
                        optns.textContent = String(j);
                    }
                }
                // set default values
                // for month, check if month names match
                if(selectId === "formMonth") {
                    if(task === "updTodo" && optns.textContent === MONTH_LIST[todoArr[1]]) {
                        optns.selected = true;
                    } else if(task === "newTodo" && optns.textContent === MONTH_LIST[FULL_DATE.month]) {
                        optns.selected = true;
                    }
                } else if(task === "updTodo" && optns.textContent === String(todoArr[i])){
                    optns.selected = true;
                } else if(task === "newTodo") {
                    if(selectId === "formYear" && optns.textContent === String(FULL_DATE.year)) {
                        optns.selected = true;
                    } else if(selectId === "formDate" && optns.textContent === String(FULL_DATE.date)) {
                        optns.selected = true;
                    } else if(selectId === "formFrmHr" || selectId === "formFrmMin" || selectId === "formToHr" || selectId === "formToMin") {
                        if(optns.textContent === "00") {
                            optns.selected = true;
                        }
                    }
                }
                select.appendChild(optns);
            }

            if(selectId === "formYear" || selectId === "formMonth" || selectId === "formDate") {
                dateDiv.appendChild(select);
                form.appendChild(dateDiv);

            } else if(selectId === "formFrmHr" || selectId === "formFrmMin" || selectId === "formToHr" || selectId === "formToMin"){
				timeDiv.appendChild(select);
                form.appendChild(timeDiv);
            }
            
            // add events
            if(selectId === "formYear" || selectId === "formMonth") {
                select.addEventListener("change", checkOptions);
            } else if(selectId !== "formYear" || selectId !== "formMonth") {
                select.addEventListener("change", removeWarning);
            }                
            
        }
        
        ///////////////////////////////////////////////////////////////////////////////////////
        
        // ids, classes, attributes, textContent
        formTodoDiv.id = "formTodoDiv";
        // btnSubmit.id = "btnSubmit";
        form.id = "formTodo";
        submitForm.setAttribute("type", "submit");
        submitForm.id = "submitForm";
        
        // // create span for "From" and "To";
        // const spanFrom = makeElem("span");
        // const spanTo = makeElem("span");
        // const formTodo = getId("formTodo");
        // spanFrom.textContent = "From:";
        // spanTo.textContent = "To:";

        // timeDiv.insertBefore(spanFrom, timeDiv.firstChild.nextSibling);
        // timeDiv.insertBefore(spanTo, timeDiv.lastChild.previousSibling);
        
        // formTodo.insertBefore(iconTitle, formTodo.firstChild);
        
        // hide submit button (check button is a label)
        submitForm.classList.add("no-display");
        
        if(getId("showFoundTodoDiv")) {
             showFoundTodoDiv = getId("showFoundTodoDiv");
             showFoundTodoDiv.classList.toggle("no-display");
        }
        
        // btnBack.textContent = "arrow_back";
        // btnSubmit.textContent = "check";
        
        makeFormBtns(obj);
        
        // events
        //update todo xmlhttprequest
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            validateForm({index: task, form: this, todo: todo, event: event});
        });
        
        // classes
        title.classList.add("form-select");
        titleDiv.classList.add("form-title");
		desc.classList.add("form-desc");
		dateDiv.classList.add("form-date");
		timeDiv.classList.add("form-time");

        titleDiv.appendChild(title);
        form.insertBefore(desc, form.firstChild);
        form.insertBefore(titleDiv, form.firstChild);
        // form.appendChild(btnSubmit);
        // form.appendChild(btnBack);
        form.appendChild(submitForm);
        formTodoDiv.appendChild(form);
        // formTodoDiv.appendChild(btnBack);
        modContent.appendChild(formTodoDiv);
        
        // create span for "From" and "To";
        const spanFrom = makeElem("span");
        const spanTo = makeElem("span");
        const formTime = document.querySelector(".form-time");
        spanFrom.textContent = "From:";
        spanTo.textContent = "To:";

        formTime.insertBefore(spanFrom, getId("formFrmHr"));
        formTime.insertBefore(spanTo, getId("formToHr"));
        
        
        resetTodosHeight(modContent);
        setTodosHeight(formTodoDiv);
    }
    
    // function to capture all values in edit mode and check against them
    function checkOptions() {
        // get elements
        const year = getId("formYear").value,
            monthName = getId("formMonth").value,
            date = getId("formDate").value, //for default value
            formDate = getId("formDate"),
            month = convertMonth(monthName),
            oldCount = formDate.childElementCount,
            newCount = new Date(year, month + 1, 0).getDate();


        // check if same number of dates
        if(oldCount < newCount) {
            for(let i = oldCount + 1; i <= newCount; i++) {
                let optns = makeElem("option");
                optns.textContent = i;
                formDate.appendChild(optns);
            }
        }
        if(oldCount > newCount) {
            while(formDate.childElementCount > newCount) {
                formDate.removeChild(formDate.lastElementChild);
            }
            // if the default selected date to be edited is higher than the max dates of new month
            if(date > newCount) {
                formDate.lastChild.selected = true;
            }
        }
    }
    
    function convertMonth(input) {
        if(typeof input === "string") {
            for(let i = 0, s = Object.keys(MONTH_LIST).length; i < s; i++) {
                if(MONTH_LIST[i] === input) {
                    return i;
                }
            }
        } else if(typeof input === "number") {
            return MONTH_LIST[input];
        }
    }
    
    function validateForm(obj) {
        const frmHr = getId("formFrmHr"),
            frmMin = getId("formFrmMin"),
            toHr = getId("formToHr"),
            toMin = getId("formToMin"),
            title = document.querySelector(".form-select").value.length,
            hrGreat = parseInt(frmHr.value, 10) > parseInt(toHr.value, 10),
            hrEqual = parseInt(frmHr.value, 10) === parseInt(toHr.value, 10),
            minGreat = parseInt(frmMin.value, 10) > parseInt(toMin.value, 10);
        let pass = true;
        if(hrGreat) {
            obj.event.preventDefault();
            toHr.classList.add("warning");
            frmHr.classList.add("warning");
            pass = false;
        } else if(hrEqual && minGreat) {
            obj.event.preventDefault();
            toMin.classList.add("warning");
            frmMin.classList.add("warning");
            pass = false;
        }
        if(title < 1) {
            // obj.event.preventDefault();
            pass = false;
        }
        if(pass === true) {
            clearIcons("all");
            makeRequest({index: obj.index, form: obj.form, todo: obj.todo});
        }
    }
    
    function removeWarning() {
        const frmHr = getId("formFrmHr"),
            frmMin = getId("formFrmMin"),
            toHr = getId("formToHr"),
            toMin = getId("formToMin");
        [frmHr, frmMin, toHr, toMin].forEach(function(option) {
            if(option.classList.contains("warning")) {
                option.classList.remove("warning");
            }
            
        });
    }
    
    
    function makeIcon(btn) {
        // const btnPane = document.getElementsByClassName("button-pane")[0];
        const btnPane = document.querySelector(".button-pane");
        let icon = makeElem("i");
        icon.textContent = btn;
        icon.classList.toggle("material-icons");
        icon.classList.toggle("btn-pane-icons");
        icon.classList.toggle(btn + "-pos");
        icon.id = btn + "Btn";
        if(btn === "delete") {
            let form = makeElem("form");
            form.id = icon.id;
            icon.id = "";
            form.appendChild(icon);
            btnPane.appendChild(form);
        } else if(btn === "check") {
            // submit has to be inside form;
            // made label that connects to an input submit type inside the form. That way, button can be in button pane as a label
            // and still work as submit inside a form. Then hide the submit button.
            let label = makeElem("label");
            label.id = icon.id;
            icon.id = "";
            label.setAttribute("for", "submitForm");
            label.appendChild(icon);
            btnPane.appendChild(label);
        } else {
            // use clonenode to avoid replacing icon?
            btnPane.appendChild(icon);    
        }

        return icon;
    }
    
    function makeTodoBtns(todo) {
        const btnArr = ["delete", "edit", "arrow_back"],
            // addBtn = getId("addBtn"),
            modContent = document.querySelector(".mod-content");
            
        // if(getId("editBtn") === null && getId("deleteBtn") === null && getId("arrow_backBtn") === null) {
        btnArr.forEach(function(btn) {
            let icon = makeIcon(btn);

            if(btn === "edit") {
                icon.addEventListener("click", function() {
                    getId("editBtn").classList.toggle("no-display");
                    getId("deleteBtn").classList.toggle("no-display");
                    getId("arrow_backBtn").classList.toggle("no-display");
                    resetTodosHeight(modContent);
                    makeOrEditTodo({index: "updTodo", todo: todo});
                });
                // frag.appendChild(icon);
            } else if(btn === "delete") {
                icon.addEventListener("click", function(event) {
                    event.preventDefault();
                    // create warning before deleting todo
                    if(window.confirm("Delete todo?")) {
                        clearIcons("all");
                        makeRequest({index: "delTodo", todo: todo}); //xmlhttprequest
                    }
                    
                });

            } else if(btn === "arrow_back") {

                icon.addEventListener("click", function() {
                    clearIcons("all");
                    // addBtn.classList.toggle("no-display");
                    makeAddBtn();
                    showTodos(); //if not using anonym function, clickedElem parametre in showTodos will be the event (mouseclick)
                    
                });
                // frag.appendChild(iconCont);
            }
        });

    }
    
    
    // clear form icon so attached events can be refreshed and can properly edit/delete todos with the right todo._id
    // fxn decides which buttons show up in button pane
    // different modes or states
    
    // when do buttons change?
    // 1. new/edit form 2. back 3. show todo 4. default 5. none
    // button ids
    // addBtn, deleteBtn, editBtn, arrow_backBtn, checkBtn, formBackBtn
    function clearIcons(state) {
        
        // store in btnArr those icons that should only be visible in the given mode
        let btnArr = [getId("addBtn"), getId("deleteBtn"), getId("editBtn"), getId("arrow_backBtn"), getId("checkBtn"), getId("formBackBtn"), getId("undoBtn")],
        
        // iconRemain = [getId("addBtn"), getId("deleteBtn"), getId("editBtn"), getId("arrow_backBtn"), getId("checkBtn"), getId("formBackBtn")];
        
            iconRemain = [];
            // btnPane = document.getElementsByClassName("button-pane")[0];
        
        if(state === "default") {
            iconRemain = [getId("addBtn")];

        } else if(state === "form") {
            iconRemain = [getId("checkBtn"), getId("formBackBtn"), getId("undoBtn")];
            
        } else if(state === "showTodo") {
            iconRemain = [getId("deleteBtn"), getId("editBtn"), getId("arrow_backBtn")];
        } else if(state == "all") {
            iconRemain = [];
        }
        
        btnArr.forEach(function(btn) {
            if(iconRemain.indexOf(btn) < 0 && btn !== null) {
                btn.parentNode.removeChild(btn);
            }
        });
        
        // if(btnPane.children.length > 0) {
        //     for(let i = 0; i < btnPane.children.length; i++) {
        //         if(btnArr.includes(btnPane.children[i].id) === false) {
        //             btnPane.children[i].classList.toggle("no-display");
        //         }
        //     }    
        // }
        
        
        
        
        
    }
    
    function makeAddBtn() {
        let add = makeIcon("add");
        add.addEventListener("click", function() {
            makeOrEditTodo({index: "newTodo"});
            // this.classList.toggle("no-display");
            clearIcons("form");
        });
    }
    
    function makeFormBtns(obj) {
        // create icons
        // if(getId("formBackBtn") === null && getId("checkBtn") === null) {
        const btnBack = makeIcon("arrow_back"),
            btnSubmit = makeIcon("check"),
            btnUndo = makeIcon("undo"),
            modContent = document.querySelector(".mod-content"),
            showFoundTodoDiv = getId("showFoundTodoDiv");
        btnBack.id = "formBackBtn";
        btnBack.addEventListener("click", function() {
            modContent.removeChild(getId("formTodoDiv"));
            if(getId("showFoundTodoDiv")) {
                showFoundTodoDiv.classList.toggle("no-display");
                getId("editBtn").classList.toggle("no-display");
                getId("deleteBtn").classList.toggle("no-display");
                getId("arrow_backBtn").classList.toggle("no-display");
                clearIcons("showTodo");
            }
            if(obj.index === "newTodo") {
                // getId("addBtn").classList.toggle("no-display");
                if(getId("showTodoDiv")) {
                    let showTodoDiv = getId("showTodoDiv");
                    showTodoDiv.classList.toggle("no-display");
                }
                clearIcons("all");
                makeAddBtn();
            }
            
            
            
        });
        // since btnSubmit is label, it does not submit the form when event is attached.
        // needs form.addeventlistener on submit.
        btnSubmit.addEventListener("click", function(event) {
            // event.preventDefault();
            validateForm({index: obj.index, form: getId("formTodo"), todo: obj.todo, event: event});
            // this.classList.toggle("no-display");
            // getId("formBackBtn").classList.toggle("no-display");
            // getId("checkBtn").classList.toggle("no-display");
            // clearIcons("all");
        });
        // } else {
        //     getId("formBackBtn").classList.toggle("no-display");
        //     getId("checkBtn").classList.toggle("no-display");
        // }
        
        btnUndo.addEventListener("click", function() {
            resetForm(obj);
        });
    }
    
    function resetForm(obj) {
        const orig = obj.todo,
            ind = obj.index;
        if(ind === "updTodo") {
            getId("formTitle").value = orig.title;
            getId("formDescription").value = orig.description;
            getId("formFrmHr").value = orig.frmHr;
            getId("formFrmMin").value = orig.frmMin;
            getId("formToHr").value = orig.toHr;
            getId("formToMin").value = orig.toMin;
            getId("formDate").value = orig.date;
            getId("formMonth").value = MONTH_LIST[orig.month];
            getId("formYear").value = orig.year;
        } else if(ind === "newTodo") {
            getId("formTitle").value = getId("formDescription").value = "";
            getId("formFrmHr").value = getId("formFrmMin").value = getId("formToHr").value = getId("formToMin").value = "00";
            getId("formDate").value = FULL_DATE.date;
            getId("formMonth").value = MONTH_LIST[FULL_DATE.month];
            getId("formYear").value = FULL_DATE.year;
        }
        
        
    }
    
    function setBodyHeight() {
        const nav = document.querySelector(".nav"),
            buttonPane = document.querySelector(".button-pane"),
            navHeight = window.getComputedStyle(nav).height, //string
            btnPaneHeight = window.getComputedStyle(buttonPane).height, //string
            bodyHeight = window.innerHeight - (parseInt(navHeight, 10) + parseInt(btnPaneHeight, 10));
            
        document.body.style.setProperty("height", bodyHeight + "px");

        
    }
    
    // function clearBtnPane() {
    //     // note: use getElementsByClassName when using a live collection.
    //     // https://stackoverflow.com/questions/14377590/queryselector-and-queryselectorall-vs-getelementsbyclassname-and-getelementbyid
    //     // A variable generated with querySelectorAll will contain the elements that fulfilled the selector at the moment the method was called.
    //     // A variable generated with getElementsByClassName will contain the elements that fulfilled the selector when it is used (that may be different from the moment the method was called).
        
    //     // let btnPane = document.getElementsByClassName("button-pane")[0];
    //     let btnPane = document.querySelector(".button-pane");
        
    //     while(btnPane.lastChild) {
    //         btnPane.removeChild(btnPane.lastChild);
    //     }
    // }

    
runOnPageLoad();

})();




