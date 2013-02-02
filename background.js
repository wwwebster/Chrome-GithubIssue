var checking;
var numberOfIssuesLastTime;
var lastNotificationURL;
var ignoreLoginUntilClick = true;


var timeOnLastNotification;

var tabID;


function updateBadge()
{
    $.get("https://github.com/login/oauth/authorize?client_id=be805dc8d38328a7a5f1&redirect_uri=http://ebsters.co.uk/github/loginCallback.php&scope=repo,user,notifications",
          function(data)
          {
          chrome.tabs.remove(tabID);
              checking = false;
              if (data.response == "avBugs")
              {
                var numberOfIssues = data.bugCount;
                chrome.browserAction.setBadgeText({text: ""+numberOfIssues});
              
                if (numberOfIssues > numberOfIssuesLastTime)
                {
                    var bugs = data.bugs;
              
                    for (var i = 0; i < 1; i++)
                    {
                        var bug = bugs[i];
                        var notification = webkitNotifications.createNotification("icon.png", bug.title, bug.body);
                        notification.onclick = function(){chrome.tabs.create({'url': bug.url});};
                        notification.show();
          
                        timeOnLastNotification = bug.time;
                        lastNotificationURL = bug.url;
                    }
                }
                else if (numberOfIssues > 0)
                {
                    lastNotificationURL = data.bugs[0].url;
                }
                numberOfIssuesLastTime = numberOfIssues;
                ignoreLoginUntilClick = false;
              }
          }, "json").fail(function()
                          {
                          ignoreLoginUntilClick = true;
                          });
    
    setTimeout(updateBadge, 10000);
}

function checkLogin()
{
    //Stop multiple checks at once.
    if (checking)
    {
        return;
    }
    checking = true;
    updateBadge();
}


chrome.browserAction.onClicked.addListener(function()
 {
                                           if (ignoreLoginUntilClick)
                                           {
                                           chrome.tabs.create({'url': 'https://github.com/login/oauth/authorize?client_id=be805dc8d38328a7a5f1&redirect_uri=http://ebsters.co.uk/github/loginCallback.php&scope=repo,user,notifications'},
                                                              function(tab){
                                                              tabID = tab.id;
                                                              updateBadge();
                                                              });
                                               return;
                                           }
                                           
                                           if (lastNotificationURL != null)
                                                chrome.tabs.create({'url': lastNotificationURL});
                                           else
                                                chrome.tabs.create({'url': 'http://www.github.com'});
 });



$(document).ready(function() {
                  checkLogin();
                  });
