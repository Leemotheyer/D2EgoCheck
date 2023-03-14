var apiKey = "8277ba23a9f74fcd89b8e92467609e75";
var quickUser = "";

async function searchFireteam() {
    var accountID = await searchAccountID();
    var fireteam = await getFireteam(accountID);

    //make an array of all each fireteam member with their membership id and membership type from getMembershipType


    //build json object for each fireteam member including their name, account id, membership type, and all character ids
    var fireteamInfo = [];
    for (var i = 0; i < fireteam.length; i++) {
        var memberID = fireteam[i].membershipId;
        var membershipType = await getMembershipType(memberID);
        var memberInfo = [memberID, membershipType];
        var memberName = await getDisplayName(memberInfo);
        var memberCharacterIDs = await getCharacterID(memberInfo);
        var raids = await countRaids(memberInfo);
        fireteamInfo.push({
            "name": memberName,
            "accountID": memberID,
            "membershipType": membershipType,
            "characterIDs": memberCharacterIDs,
            "raids": raids,
        });        
    }
    console.log(fireteamInfo);
    return fireteamInfo;
}

//a function to run getAccountID and then getRaidClears
async function countRaids(account) {
    var raids = await getRaidClears(account);
    var RaidClears = await removeIncompleteRaids(raids);
    console.log(RaidClears.length + " raid clears");
    var eachRaid = await sortRaidClears(RaidClears);

    var kf = eachRaid.kf.length + eachRaid.kfM.length;
    var vow = eachRaid.vow.length + eachRaid.vowM.length;
    var vog = eachRaid.vog.length + eachRaid.vogM.length;
    var dsc = eachRaid.dsc.length;
    var gos = eachRaid.gos.length;
    var lw = eachRaid.lw.length;
    var ron = eachRaid.ron.length + eachRaid.ronM.length;
    //put all the raid clears into an json with keys
    var raidClears = {
        "kf": kf,
        "vow": vow,
        "vog": vog,
        "dsc": dsc,
        "gos": gos,
        "lw": lw,
        "ron": ron,
    }
    console.log(raidClears);
    return raidClears;
}

//async function and use bungie api to get account id from player name input from search-bar
async function searchAccountID() {
  var player = document.getElementById("search-bar").value;
    //error handling for empty search bar
    if (player == "") {
        alert("Please enter a player name");
        showLoading();
        return;
    }
    else{
        var newName = player.replace(/#/, '%23');
        var url = "https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/all/" + newName + "/";
        console.log(url);
        var response = await fetch(url, {
            method: "GET",
            headers: {
            "X-API-Key": apiKey
            }
        });
        var data = await response.json();
        console.log(data);
        //error handling for player not found
        if (data.ErrorCode == 217) {
            alert(data.Message);
            showLoading();
            return;
        }
        //check is data.response is empty
        else if(data.Response.length == 0) {
            alert("Player not found");
            showLoading();
            return;
        }
        else {
            var accountID = data.Response[0].membershipId;
            var membershipType = data.Response[0].membershipType;
            //return the values
            return [accountID, membershipType];
        }
    }
}

//async function to get each character id from account id
async function getCharacterID(accountID) {
    var url = "https://www.bungie.net/Platform/Destiny2/" + accountID[1] + "/Account/" + accountID[0] + "/Stats/?groups=102";
    var response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": apiKey
        }
    });
    var data = await response.json();
    var characterIDJson = data.Response.characters;
    //put character id's into an array
    var characterID = [];
    for (var i in characterIDJson) {
        characterID.push(characterIDJson[i].characterId);
    }
    return characterID;
}

//async function to get raid a account has been in and loop for each character and loop for each page until failure then combine all the data into one array
async function getRaidClears(accountID) {
    var characterID = await getCharacterID(accountID);
    var raidClears = [];
    for (var i = 0; i < characterID.length; i++) {
        var page = 0;
        while (true) {
            var url = "https://www.bungie.net/Platform/Destiny2/" + accountID[1] + "/Account/" + accountID[0] + "/Character/" + characterID[i] + "/Stats/Activities/?mode=4&count=250&page=" + page;
            console.log(url);
            var response = await fetch(url, {
                method: "GET",
                headers: {
                    "X-API-Key": apiKey
                }
            });
            var data = await response.json();
            //if undefined break the loop
            if (data.Response.activities == undefined) {
                break;
            }
            var activities = data.Response.activities;             
            console.log(activities);
            raidClears.push(activities);
            page++;
        }
    }
    console.log(raidClears);
    return raidClears;
}

//remove all incomplete raids from raidClears array
async function removeIncompleteRaids(raidClears) {
    var RaidClears = [];
    for (var i = 0; i < raidClears.length; i++) {
        for (var j = 0; j < raidClears[i].length; j++) {
            if (raidClears[i][j].values.completed.basic.value == 1) {
                if (raidClears[i][j].values.completionReason.basic.value == 0) {
                    RaidClears.push(raidClears[i][j]);
                }
            }
        }
    }
    console.log(RaidClears);
    return RaidClears;
}

//async function to sort the raidClears
async function sortRaidClears(RaidClears) {
    var kf = 1374392663;
    var kf2 = 1063970578;
    var kf3 = 2897223272;
    var kfM = 2964135793;

    var vow = 1441982566;
    var vow2 = 1485585878;
    var vow3 = 3711931140;
    var vowM = 4217492330;

    var vog = 3881495763;
    var vog2 = 3881495763;
    var vog3 = 3881495763;
    var vogM = 1681562271;

    var dsc = 910380154;
    var dsc2 = 3976949817;

    var gos = 2659723068;
    var gos2 = 2497200493;
    var gos3 = 3458480158;
    var gos4 = 3845997235;

    var lw = 2122313384;
    var lw2 = 1661734046;
    var lw3 = 2214608156;
    var lw4 = 2214608157; 
    
    var ron = 2381413764 ;
    var ronM = "not yet";

    //sort raidClears into arrays for each variable
    var kfClears = [];
    var kfMClears = [];
    var vowClears = [];
    var vowMClears = [];
    var vogClears = [];
    var vogMClears = [];
    var dscClears = [];
    var gosClears = [];
    var lwClears = [];
    var ronClears = [];
    var ronMClears = [];

    for (var i = 0; i < RaidClears.length; i++) {
        if (RaidClears[i].activityDetails.referenceId == kf || RaidClears[i].activityDetails.referenceId == kf2 || RaidClears[i].activityDetails.referenceId == kf3) {
            kfClears.push(RaidClears[i]);
        } else if (RaidClears[i].activityDetails.referenceId == kfM) {
            kfMClears.push(RaidClears[i]);
        } else if (RaidClears[i].activityDetails.referenceId == vow || RaidClears[i].activityDetails.referenceId == vow2 || RaidClears[i].activityDetails.referenceId == vow3) {
            vowClears.push(RaidClears[i]);
        } else if (RaidClears[i].activityDetails.referenceId == vowM) {
            vowMClears.push(RaidClears[i]);
        } else if (RaidClears[i].activityDetails.referenceId == vog || RaidClears[i].activityDetails.referenceId == vog2 || RaidClears[i].activityDetails.referenceId == vog3) {
            vogClears.push(RaidClears[i]);
        } else if (RaidClears[i].activityDetails.referenceId == vogM) {
            vogMClears.push(RaidClears[i]);
        } else if (RaidClears[i].activityDetails.referenceId == dsc || RaidClears[i].activityDetails.referenceId == dsc2) {
            dscClears.push(RaidClears[i]);
        } else if (RaidClears[i].activityDetails.referenceId == gos || RaidClears[i].activityDetails.referenceId == gos2 || RaidClears[i].activityDetails.referenceId == gos3 || RaidClears[i].activityDetails.referenceId == gos4) {
            gosClears.push(RaidClears[i]);
        } else if (RaidClears[i].activityDetails.referenceId == lw || RaidClears[i].activityDetails.referenceId == lw2 || RaidClears[i].activityDetails.referenceId == lw3 || RaidClears[i].activityDetails.referenceId == lw4) {
            lwClears.push(RaidClears[i]);
        }
        else if (RaidClears[i].activityDetails.referenceId == ron) {
            ronClears.push(RaidClears[i]);
        }
        else if (RaidClears[i].activityDetails.referenceId == ronM) {
            ronMClears.push(RaidClears[i]);
        }
    }
    //put arrays into one json with name of raid as key
    var eachRaid = {
        "kf": kfClears,
        "kfM": kfMClears,
        "vow": vowClears,
        "vowM": vowMClears,
        "vog": vogClears,
        "vogM": vogMClears,
        "dsc": dscClears,
        "gos": gosClears,
        "lw": lwClears,
        "ron": ronClears,
        "ronM": ronMClears
    };
    return eachRaid;
}

//async function to get current fireteam members of a account using components=1000
async function getFireteam(accountID) {
    var url = "https://www.bungie.net/Platform/Destiny2/" + accountID[1] + "/Profile/" + accountID[0] + "/?components=1000";
    var response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": apiKey
        }
    });
    var data = await response.json();
    //try catch
    try {
        var fireteamMembers = data.Response.profileTransitoryData.data.partyMembers;
    } catch (err) {
        alert("Player not online");
        showLoading();
    }
    return fireteamMembers;
}

//async function to turn given id to display name
async function getDisplayName(memberInfo) {

    // //get last platform used
    // var url = "https:/www.bungie.net/Platform/User/GetSanitizedPlatformDisplayNames/" + membID;
    // var response = await fetch(url, {
    //     method: "GET",
    //     headers: {
    //         "X-API-Key": apiKey
    //     }
    // });
    // var data = await response.json();
    // console.log(data);
    // //return Steamid, if fail return EgsId, if fail return Xuid
    // if (data.Response.SteamId != undefined) {
    //     var displayName = data.Response.SteamId;
    // } else if (data.Response.EgsId != undefined) {
    //     var displayName = data.Response.EgsId;
    // } else if (data.Response.Xuid != undefined) {
    //     var displayName = data.Response.Xuid;
    // } else if (data.Response.Psnid != undefined) {
    //     var displayName = data.Response.Psnid;
    // } else {
    //     var displayName = "Error could not get name";
    // }
    // return displayName;

    //get profile
    var url = "https://www.bungie.net/Platform/Destiny2/" + memberInfo[1] + "/Profile/" + memberInfo[0] + "/?components=100";
    var response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": apiKey
        }
    });
    var data = await response.json();
    var displayName = data.Response.profile.data.userInfo.bungieGlobalDisplayName;
    return displayName;
}

//async function to get membership type from membership id
async function getMembershipType(id) {
    var url = "https://www.bungie.net/Platform/User/GetMembershipsById/" + id + "/0/";
    console.log(url);
    var response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": apiKey
        }
    });
    var data = await response.json();
    //check key if membershipid matches with id and if not try the next key
    for (var i = 0; i < data.Response.destinyMemberships.length; i++) {
        if (data.Response.destinyMemberships[i].membershipId == id) {
            var membershipType = data.Response.destinyMemberships[i].membershipType;
            return membershipType;
        }
    }
}

async function buildTable() {
    var raidList = ["ron", "kf", "vow", "vog", "dsc", "gos", "lw"];
    showLoading();
    fireteamInfo = await searchFireteam();
    //make a table with the raid names as headers
    var table = document.getElementById("raidTable");
    var row = table.insertRow(0);
    var cell = row.insertCell(0);
    cell.innerHTML = "EgoCheck";
    for (i = 0; i < raidList.length; i++) {
        var cell = row.insertCell(i + 1);
        cell.innerHTML = raidList[i];
    }
    //make a row for each fireteam member
    for (i = 0; i < fireteamInfo.length; i++) {
        var row = table.insertRow(i + 1);
        var cell = row.insertCell(0);
        cell.innerHTML = fireteamInfo[i].name;

        //generating and adding raid.report links
        if (fireteamInfo[i].membershipType == 1) {
            var platform = "xb";
        } else if (fireteamInfo[i].membershipType == 2) {
            var platform = "ps";
        } else if (fireteamInfo[i].membershipType == 3) {
            var platform = "pc";
        }
        //add attributes to the element so it is clickable and opens a link
       cell.setAttribute("onclick", "window.open('https://raid.report/" + platform + "/" + fireteamInfo[i].accountID + "')");
        cell.setAttribute("style", "cursor: pointer;");

        for (j = 0; j < raidList.length; j++) {
            var cell = row.insertCell(j + 1);
            cell.innerHTML = fireteamInfo[i].raids[raidList[j]];
        }
    
    }
    showLoading();
}

async function showLoading() {
    var x = document.getElementById("loading");
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
}

//check if quickUser is empty and if not show quickLoad button
if (quickUser != "") {
    document.getElementById("quickLoad").style.display = "block";
    //set text of quickLoad button to quickUser
    document.getElementById("quickLoad").innerHTML = "Search: " + quickUser;
}
async function searchMe() {
    document.getElementById("search-bar").value = quickUser;
    buildTable();
}