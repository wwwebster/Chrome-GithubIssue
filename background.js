
var numberOfIssuesLastTime;
var lastNotificationURL;
var ignoreLoginUntilClick = true;
var tabID;

var githubRequestPage = "https://github.com/login/oauth/authorize?client_id=be805dc8d38328a7a5f1&redirect_uri=http://ebsters.co.uk/github/loginCallback.php&scope=repo,user,notifications"


function parseResponse(data)
{
    //Close the login tab if open
    if (typeof tabID !== 'undefined') chrome.tabs.remove(tabID);
    
    if (data.response == "avBugs")    //Check that this is the right response.
    {
        var numberOfIssues = data.bugCount;
        chrome.browserAction.setBadgeText({text: ""+numberOfIssues});
        
        if (numberOfIssues > numberOfIssuesLastTime)
        {
            var bugs = data.bugs;
            
            //Just show the most recent bug as a notification even if there was more than one
            var bug = bugs[0];
            var notification = webkitNotifications.createNotification("icon.png", bug.title, bug.body);
            notification.onclick = function(){chrome.tabs.create({'url': bug.url});};
            notification.show();
            
            timeOnLastNotification = bug.time;
            lastNotificationURL = bug.url;
        }
        else if (numberOfIssues > 0)
        {
            //Store the most recent URL so that when browser action is clicked, it goes to that bug
            lastNotificationURL = data.bugs[0].url;
        }
        numberOfIssuesLastTime = numberOfIssues;
        ignoreLoginUntilClick = false;
    }
}

function handleFail()
{
    //If the connection failed, attempt to login on next click
    ignoreLoginUntilClick = true;
}


function updateBadge()
{
    var request = $.get(githubRequestPage, parseResponse, "json");
    request.fail(handleFail);
    
    setTimeout(updateBadge, 10000);
}


function handleBrowserActionClick()
{
    if (ignoreLoginUntilClick)
    {
        chrome.tabs.create({'url': githubRequestPage},
                           function(tab)
                           {
                           tabID = tab.id;
                           updateBadge();
                           });
        return;
    }
    
    if (lastNotificationURL != null)
        chrome.tabs.create({'url': lastNotificationURL});
    else
        chrome.tabs.create({'url': 'http://www.github.com'});
}



//Start the listeners
chrome.browserAction.onClicked.addListener(handleBrowserActionClick);
$(document).ready(updateBadge);
