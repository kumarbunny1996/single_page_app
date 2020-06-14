//global variable

var searchInput;
var successMsg;
var errorMsg;


//this gets content from file
function getContent(fragmentId, callback) {

    //creating Xhr Object to asynchronously request
    var xhr = new XMLHttpRequest();

    //creating connection to file
    xhr.open('GET', fragmentId + '.html', true);

    //this gets the content from the given path
    xhr.onload = function() {
        if (this.status == 200) {
            callback(this.responseText);
        }
    };

    //sending the request to server
    xhr.send();
}

//main function to navigate links
const navigate = function() {
    //hash used to get the links
    console.log(location.hash);

    //substr method deletes the # symbol in fragments
    var fragmentId = location.hash.substr(1);

    // display the output to browser
    getContent(fragmentId, (content) => {
        document.getElementById('content').innerHTML = content;
        if (fragmentId === 'add') {
            Events.addEvent();
            getInputEvents();
        }
        if (fragmentId === 'friends') {
            UI.displayFriends();
        }
        if (fragmentId === 'home') {
            Events.searchEvent();
            Events.searchInputEvent();
        }
        if (document.querySelector('.pop-container')) {
            const popBox = document.querySelector('.pop-container');
            document.body.removeChild(popBox);
        }
        if (document.querySelector('.clearDiv')) {
            const clearDiv = document.querySelector('.clearDiv');
            document.body.removeChild(clearDiv);
        }
        if (document.querySelector('.no-friends')) {
            const noFriendsDiv = document.querySelector('.no-friends');
            document.body.removeChild(noFriendsDiv);
        }

    });


};
navigate();

//keeping  home as default page
if (!location.hash) {
    location.hash = '#home';
}

//event listener for changing fragmentId in url
window.addEventListener('hashchange', navigate);


//this sends data to the server 
const addFriend = function(e) {

    //event listener to button
    console.log('button is clicked');
    e.preventDefault();
    validateFunc();
};
//Check the inputs and set the pattern
function getInputEvents() {
    const name = document.getElementById('name');
    const age = document.getElementById('age');
    const email = document.getElementById('email');
    const group = document.getElementById('group');

    name.addEventListener('keyup', (e) => checkName(e.target.value));
    age.addEventListener('keyup', (e) => checkAge(e.target.value));
    email.addEventListener('keyup', (e) => checkEmail(e.target.value));
    group.addEventListener('keyup', (e) => checkGroup(e.target.value));
}

//regex
let nameRe = /^[a-zA-Z\s]{2,15}$/; //name
let ageRe = /^[0-9]{1,2}$/; //age
let emailRe = /^([a-zA-Z0-9_\-\.\#\$\%\&\*\^\!]+)@([a-zA-Z0-9_\-\.]+)\.([a-z]{2,5})$/;
let groupRe = /^[a-zA-Z\-\s]{2,25}$/;

function checkName(value) {
    let div = document.querySelector('#invalid-name');
    let name = value;
    console.log(value);
    //console.log(e.target);
    if (!nameRe.test(name)) {
        div.style.display = 'block';

    } else {
        div.style.display = 'none';
    }
}

function checkAge(value) {
    let div = document.querySelector('#invalid-age');
    //let size = document.querySelector('#age').getAttribute('size');
    let age = value;
    console.log(value);
    if (!ageRe.test(age)) {
        div.style.display = 'block';
    } else {
        div.style.display = 'none';

    }
}

function checkEmail(value) {
    let div = document.querySelector('#invalid-email');
    let email = value;
    if (!emailRe.test(email)) {
        div.style.display = 'block';

    } else {
        div.style.display = 'none';
    }
}

function checkGroup(value) {
    let div = document.querySelector('#invalid-group');
    let group = value;
    if (!groupRe.test(group)) {
        div.style.display = 'block';

    } else {
        div.style.display = 'none';
    }
}

//check the input data
function validateFunc() {
    const name = document.getElementById('name').value.toLowerCase();
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value;
    const group = document.getElementById('group').value;

    if (!nameRe.test(name) || !ageRe.test(age) || !emailRe.test(email) || !groupRe.test(group)) {

        const msg = document.getElementById('messages');
        while (msg.firstChild) {
            msg.removeChild(msg.firstChild)
        }
        let p = document.createElement('p');
        p.innerHTML = "please fill correct values";
        msg.appendChild(p);
        msg.style.display = 'block';
        //sets time to display the msg
        setTimeout(() => msg.style.display = 'none', 3000);
    } else {

        addFriendRequest();
    }
}

//posting data to server
function addFriendRequest() {
    //creating xhr object
    const xhr = new XMLHttpRequest();

    //open the request
    xhr.open('POST', '/api/add', true);

    //response handler
    xhr.onload = function() {
        if (this.status == 200) {
            let responseObject = null;
            try {
                responseObject = JSON.parse(this.responseText);
            } catch (e) {
                console.error('this could not parse');
            }
            handleResponse(responseObject);
        }
    };

    //binding the input values in object to server
    const name = document.getElementById('name').value.toLowerCase();
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value;
    const group = document.getElementById('group').value;

    //instantiating the object
    const data = new Data(name, age, email, group);
    console.log(data);

    //this sets the content-type of data to server
    xhr.setRequestHeader('Content-type', 'application/json');

    //sending request to server
    xhr.send(JSON.stringify(data));
}

// handling the response from server
function handleResponse(responseObject) {
    if (responseObject.ok) {
        //friend data from server response
        let friendsData = responseObject.myFriend;
        successMsg = responseObject.msg;
        errorMsg = responseObject.msg;
        //storing the data to local
        Store.addData(friendsData);

        //redirect to friends page
        location.hash = '#friends';
    } else {
        errorFunc(responseObject);
    }
}

//error function
function errorFunc(object) {
    let responseObject = object;
    const msg = document.getElementById('messages');
    //if any child then removes that child
    while (msg.firstChild) {
        msg.removeChild(msg.firstChild)
    }
    // responseObject.errors.forEach(error => {
    //     let li = document.createElement('p');
    //     li.innerHTML = error.message;
    //     msg.appendChild(li);
    // });

    //showing the errors to client
    let errors = responseObject.errors;
    for (i = 0; i < errors.length; i++) {
        let p = document.createElement('p');
        p.innerHTML = errors[i].message;
        msg.appendChild(p);
    }
    msg.style.display = 'block';
    //sets time to display the msg
    setTimeout(() => msg.style.display = 'none', 3000);
}

//represent the data to create objects
class Data {
    constructor(name, age, email, group) {
        this.name = name;
        this.age = age;
        this.email = email;
        this.group = group;
    }
}

function checkSuccessMsg() {
    //check the messages
    if (successMsg === 'undefined') return;
    if (successMsg) {
        UI.showMsg(successMsg);
        successMsg = "";
    }
}

function checkErrorMsg() {
    //check the error msg
    if (errorMsg === 'undefined') return;
    if (errorMsg) {
        UI.showMsg(errorMsg);
        errorMsg = "";
    }
}
//info about no friends available

function infoFriends() {
    const noFriendsDiv = document.createElement('div');
    noFriendsDiv.className = 'no-friends';
    noFriendsDiv.innerHTML = `
            <h3 id="info-friends">No friends available!<br>if your interested in adding this friend to friends list,then click this<span class="add" id="add">ADD</span>or <span class="close" id="close">CLOSE</span></h3>
        `;
    document.body.appendChild(noFriendsDiv);
}

function searchFilter(dataList) {
    let friendsData = dataList.filter(friendData => {
        let friendName = friendData.name.substr(0, 3);
        return friendName === searchInput;
    });
    return friendsData;
}

//filter the data with searchInput
function filterFriendsData(dataList) {
    let friendsData = searchFilter(dataList);

    if (friendsData.length === 0) {
        while (document.querySelector('.no-friends')) {
            const noFriendsDiv = document.querySelector('.no-friends');
            document.body.removeChild(noFriendsDiv);
        }
        infoFriends();
        Events.navigateToAdd();
        Events.navigateToFriends();

    } else {
        if (document.querySelector('.no-friends')) {
            const noFriendsDiv = document.querySelector('.no-friends');
            document.body.removeChild(noFriendsDiv);
        }
        friendsData.forEach(friendData => {
            UI.friendsDOM(friendData);
        });
        clearElement();
        Events.clearSearchEvent();
    }
}
//check the search input value and display

function checksFriendsList(dataList) {
    // check search input and display
    if (searchInput) {
        filterFriendsData(dataList);
    } else {
        dataList.forEach(friendData => {
            UI.friendsDOM(friendData);
        });
    }
}
//display the data (ui)
class UI {
    static displayFriends() {

        //getData method returns datalist with promise
        const display = Store.getData();
        //creating dom with data
        display
            .then(dataList => {
                checkSuccessMsg();
                checkErrorMsg();
                checksFriendsList(dataList);
                Events.removeEvent();
                Events.editEvent();
            });
    }

    //adding the data to friends html
    static friendsDOM(friendData) {
        const container = document.querySelector('.grid-container');
        const user = document.createElement('div');
        user.className = 'user-detail';
        user.id = friendData._id;
        user.innerHTML =
            `<div class="imgBox">
                   <img src="/images/pexels-photo-573299.jpeg" alt="image">
                </div>
                <div class="details">
                    <h3>${friendData.name}</h3>
                    <h4>${friendData.age}</h4>
                    <h3>${friendData.group}</h3>
                    <input type="submit" id="remove-btn" value="remove" data-id=${friendData._id} action="delete">
                    <input type="submit" id="edit-btn" value="edit" data-id=${friendData._id} action="edit">
                </div>`;
        container.appendChild(user);
    }

    //updating friendsDom
    static updateFriendsDom(updateData) {
            if (updateData.friend) {
                const updateFriend = document.getElementById(updateData.friend._id);
                updateFriend.innerHTML =
                    `<div class="imgBox">
                   <img src="/images/pexels-photo-573299.jpeg" alt="image">
                </div>
                <div class="details">
                    <h3>${updateData.friend.name}</h3>
                    <h4>${updateData.friend.age}</h4>
                    <h3>${updateData.friend.group}</h3>
                    <input type="submit" id="remove-btn" value="remove" data-id=${updateData.friend._id} action="delete">
                    <input type="submit" id="edit-btn" value="edit" data-id=${updateData.friend._id} action="edit">
                </div>`
            }
        }
        //deletes the dom
    static deleteFriendDom(element) {
            //event target el is == remove btn
            if (element.getAttribute('action')) {
                element.parentElement.parentElement.remove();
            }
        }
        // edit friend dom
    static displayEditFriend(editId) {
        Store.getData()
            .then(dataList => {
                let friend = dataList.find(friendData => {
                    return friendData._id === editId;
                });
                editFriendDom(friend);
                getInputEvents();
                Events.updateEvent();
                Events.closeEvent();
            })
            .catch(e => console.log(e));
    }

    //showing messages to client
    static showMsg(successMsg, errorMsg) {
        const div = document.querySelector('#message-details');
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        const msg = document.createElement('p');
        div.appendChild(msg);
        msg.className = 'messages';
        if (successMsg) {
            msg.innerHTML = successMsg;
            div.style.display = 'block';
        } else {
            msg.innerHTML = errorMsg;
            div.style.display = 'block';
        }
        //time to display
        setTimeout(() => div.style.display = 'none', 2000);
        successMsg = "";
    }
}
//local storage used to store the data
class Store {
    static getData() {
            return new Promise((resolve) => {
                let dataList = [];

                //checking the storage
                if (localStorage.getItem('friendsData') === null) {
                    //gets data from server
                    getFriendsData().then(friendsData => {
                        dataList = friendsData;
                        //stores the data to local
                        localStorage.setItem('friendsData', JSON.stringify(dataList));
                        resolve(dataList);
                    }).catch(error => console.log(error));
                } else {
                    //gets data from local store
                    dataList = JSON.parse(localStorage.getItem('friendsData'));
                    resolve(dataList);
                }
            });
        }
        //updating data to storage
    static addData(friendsData) {
            //gets datalist 
            Store.getData().then(dataList => {
                //updating the data to local
                dataList.unshift(friendsData);
                localStorage.setItem('friendsData', JSON.stringify(dataList));
            }).catch(error => console.log(error));
        }
        // updating the local storage after deleting
    static removeData(friendId) {
            //gets data list
            Store.getData()
                .then(dataList => {
                    let index = dataList.findIndex(friendData => {
                        return friendData._id === friendId;
                    });
                    dataList.splice(index, 1);
                    localStorage.setItem('friendsData', JSON.stringify(dataList));
                }).catch(error => console.log(error));
        }
        //updating the store
    static updateStore(updateData, updateId) {
            Store.getData().then(dataList => {
                let index = dataList.findIndex(friendData => friendData._id === updateId);
                dataList.splice(index, 1, updateData.friend);
                localStorage.setItem('friendsData', JSON.stringify(dataList));
            });
        }
        //search data
        // static searchStore(friends) {
        //     localStorage.setItem('friendsData', JSON.stringify(friends));

    // }

}

//getting friendsData from server
function getFriendsData() {
    //creating promise object
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/friends', true);

        //response handler
        xhr.onload = function() {
            if (this.status == 200) {
                //success
                resolve(JSON.parse(this.responseText));
            } else {
                //failure
                reject(this.statusText);
            }
        };
        //error handler
        xhr.onerror = function() {
            reject(this.statusText);
        };
        xhr.send();
    });
}

//remove event handler function
const removeFriend = function(e) {
    console.log(e.target);

    //stops the  event bubbling
    e.stopPropagation();

    //gets the friend Id value from remove btn
    let friendId = e.target.getAttribute('data-id');

    //checking element
    if (e.target.getAttribute('action') === 'delete') {

        //calling delete method
        deleteRequest(friendId)
            .then(resultObj => {
                if (resultObj.result.deletedCount === 1) {
                    //remove friend from UI
                    UI.deleteFriendDom(e.target);
                    // removes data from storage
                    Store.removeData(friendId);
                    const successMsg = resultObj.message;
                    UI.showMsg(successMsg);
                } else {
                    let errorMsg = resultObj.message;
                    UI.showMsg(errorMsg);
                }
            }).catch(e => console.log(e));
    }

}

//delete request function
function deleteRequest(friendId) {
    return new Promise(resolve => {
        // sends delete request to server
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (this.status == 200) {
                let resultObj = null;
                try {
                    resultObj = JSON.parse(this.responseText);
                } catch (e) {
                    console.error('this could not parse');
                }
                resolve(resultObj);
            }
        }
        xhr.open('DELETE', `/api/friends/${friendId}`, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send();

    });
}
//friend dom details
function editFriendDom(friend) {
    const popBox = document.createElement('div');
    popBox.className = 'pop-container';
    popBox.innerHTML =
        `<div class="input-container">
             <div id="messages" class="error-messages"></div>
             <h2>Update your friend</h2>
             <label for="name">Name</label>
             <input type="text" id="name" name="name" value="${friend.name}">
             <div id="invalid-name">
                    <h4> name should be between 2 and 15</h4>
             </div>
             <label for="age">Age</label>
             <input type="number" id="age" name="age" value="${friend.age}">
             <div id="invalid-age">
                    <h4>please enter valid age</h4>
             </div>
             <label for="email">Email</label>
             <input type="email" id="email" name="email" value="${friend.email}">
             <div id="invalid-email">
                    <h4>please enter valid email address</h4>
             </div>
             <label for="group">Group</label>
             <input type="text" id="group" name="group" value="${friend.group}">
             <div id="invalid-group">
                    <h5>characters should be between 2 and 20</h5>
             </div>
             <input type="submit" value="update" action="update" update-id=${friend._id} id="update-btn">
             <input type="submit" value="close" action="close" id="close-btn">
            </div>`
    document.body.appendChild(popBox);
}
//edit event handler function
const editFriend = function(e) {
        e.stopPropagation();
        //e.preventDefault();
        let editId = e.target.getAttribute('data-id');
        if (e.target.getAttribute('action') === 'edit') {
            UI.displayEditFriend(editId);
        }
    }
    //checks  the update data
function updateValidate(updateId) {
    const name = document.getElementById('name').value.toLowerCase();
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value;
    const group = document.getElementById('group').value;

    if (!nameRe.test(name) || !ageRe.test(age) || !emailRe.test(email) || !groupRe.test(group)) {

        const msg = document.getElementById('messages');
        while (msg.firstChild) {
            msg.removeChild(msg.firstChild)
        }
        let p = document.createElement('p');
        p.innerHTML = "please fill correct values";
        msg.appendChild(p);
        msg.style.display = 'block';
        //sets time to display the msg
        setTimeout(() => msg.style.display = 'none', 3000);
    } else {
        updateRequest(updateId).then(updateObj => {
            let updateData = updateObj;
            if (updateData.friend) {
                UI.updateFriendsDom(updateData);
                Store.updateStore(updateData, updateId);
                const popBox = document.querySelector('.pop-container');
                document.body.removeChild(popBox);
                const successMsg = updateData.successMsg;
                UI.showMsg(successMsg);
            } else {
                errorFunc(updateData);
            }
        });
    }
}
//update event handler function
const updateFriend = function(e) {
        e.stopPropagation();
        console.log(e.target);
        const updateId = document.querySelector('#update-btn').getAttribute('update-id');
        if (e.target.getAttribute('action') === 'update') {
            updateValidate(updateId);

        }

    }
    //put request to server
function updateRequest(updateId) {
    return new Promise(resolve => {
        // sends delete request to server
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (this.status == 200) {
                let updateObj = null;
                try {
                    updateObj = JSON.parse(this.responseText);
                } catch (e) {
                    console.error('this could not parse');
                }
                resolve(updateObj);
            }
        }
        xhr.open('PUT', `/api/friends/${updateId}`, true);
        //update details to server
        const name = document.getElementById('name').value.toLowerCase();
        const age = document.getElementById('age').value;
        const email = document.getElementById('email').value;
        const group = document.getElementById('group').value;
        const updateObject = {
            name,
            age,
            email,
            group
        }
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(JSON.stringify(updateObject));

    });
}

//closing the form
const closeForm = function(e) {
    console.log(e.target);
    e.stopPropagation();
    if (e.target.getAttribute('action') === 'close') {
        const popBox = document.querySelector('.pop-container');
        document.body.removeChild(popBox);
    }

}

//search event handler function
const searchFriend = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log(e.target);
        searchInput = document.querySelector('#search').value.toLowerCase().substr(0, 3);

        let re = /^[a-zA-Z]{2,25}/;
        let div = document.querySelector('.invalid-search');
        if (!re.test(searchInput)) {
            div.style.display = 'block';
        } else {
            div.style.display = 'none';
            // searchRequest(searchInput).then(friends => {
            //     console.log(friends);
            //     Store.searchStore(friends);
            //     location.hash = "#friends";
            // });
            location.hash = "#friends";
        }

    }
    //check the search value while typing
const checkSearch = function(e) {
        //console.log(e.type);
        //check the pattern to search value
        let re = /^[a-zA-Z]{1,25}/;
        let div = document.querySelector('.invalid-search');
        console.log(e.target.value);
        if (!re.test(e.target.value)) {
            div.style.display = 'block';
        } else {
            div.style.display = 'none';
        }
    }
    //search request method to server
    // function searchRequest(searchInput) {
    //     return new Promise((resolve, reject) => {
    //         const xhr = new XMLHttpRequest();
    //         xhr.open('GET', `/api/search/${searchInput}`, true);

//         //response handler
//         xhr.onload = function() {
//             if (this.status == 200) {
//                 //success
//                 resolve(JSON.parse(this.responseText));
//             } else {
//                 //failure
//                 reject(this.statusText);
//             }
//         };
//         //error handler
//         xhr.onerror = function() {
//             reject(this.statusText);
//         };
//         xhr.send();
//     });
// }

//clear button element

function clearElement() {
    const clearDiv = document.createElement('div');
    clearDiv.className = "clearDiv";
    clearDiv.innerHTML = `
        <h4 class="info">click the button to clear search history<span id="clearSearch">CLEAR</span></h4 >
    `;
    document.body.appendChild(clearDiv);

}
//clear search event handler
const clearSearchHistory = function() {
    // console.log(e.target);
    if (!searchInput) return;
    Store.getData().then(dataList => {
        if (searchInput) {
            let friendsData = searchFilter(dataList);
            //search data of friends and  removing the dom of  search of friends
            friendsData.forEach(friendData => {
                const container = document.querySelector('.grid-container');
                const user = document.getElementById(friendData._id);
                container.removeChild(user);
            });
            const clearDiv = document.querySelector('.clearDiv');
            document.body.removeChild(clearDiv);
            searchInput = "";
        }
        dataList.forEach(friendData => {
            UI.friendsDOM(friendData);
        });

    });
}


//event handler for addPage

const directToAdd = function() {
    location.hash = "#add";
    searchInput = "";
}

//event handler for addPage
const directToFriends = function(e) {
        console.log(e.target);
        if (!searchInput) return;
        if (searchInput) {
            Store.getData().then(dataList => {
                dataList.forEach(friendData => {
                    UI.friendsDOM(friendData);
                });
                searchInput = "";
                const noFriendDiv = document.querySelector('.no-friends');
                document.body.removeChild(noFriendDiv);
            });
        }
    }
    //event listener methods
class Events {
    //add event
    static addEvent() {
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.addEventListener('click', addFriend);
        }
        //delete event
    static removeEvent() {
            const removeData = document.querySelector('#friends-zone');
            removeData.addEventListener('click', removeFriend);
        }
        //edit event
    static editEvent() {
        const editData = document.querySelector('#friends-zone');
        editData.addEventListener('click', editFriend);
    }
    static updateEvent() {
        const updateData = document.querySelector('#update-btn');
        updateData.addEventListener('click', updateFriend);
    }
    static closeEvent() {
        const closeBtn = document.querySelector('#close-btn');
        closeBtn.addEventListener('click', closeForm);
    }
    static searchEvent() {
        const search = document.querySelector('#search-btn');
        search.addEventListener('click', searchFriend);
    }
    static searchInputEvent() {
        const inputEvent = document.querySelector('#search');
        inputEvent.addEventListener('keypress', checkSearch);
    }
    static clearSearchEvent() {
            const clearSearch = document.querySelector('#clearSearch');
            clearSearch.addEventListener('click', clearSearchHistory);
        }
        //events after search 

    static navigateToAdd() {
        const addPage = document.querySelector('#add');
        addPage.addEventListener('click', directToAdd);
    }

    static navigateToFriends() {
        const friendsPage = document.querySelector('#close');
        friendsPage.addEventListener('click', directToFriends);
    }
}