// Initial array of gif
// global var
var gifList = ["Trending", "the office", "motivation", "the it crowd", "laugh"];
var gifLimitPerCall = 10;
var gifFavList;
var queryURL;

$(document).ready(function() {
  //loads the favlist from local storage, make sure this is first step because there are other functions that depends on the data of this list
  getFav();

  addFavGiftoDiv();

  // Calling the renderButtons function to display the intial buttons
  renderButtons(gifList);

  //add topic button
  $(".add-topic").on("click", function(e) {
    e.preventDefault();
    // This line grabs the input from the textbox
    var gifTopic = $(".topic-input")
      .val()
      .trim();
    //making sure the user didn't submit an empty string
    if (gifTopic !== "") {
      //adding the new gif Topic to the gif array
      gifList.push(gifTopic);
      // Deleting the buttons prior to adding new topics
      // (this is necessary otherwise you will have repeat buttons)
      $(".buttons-view").empty();
      // Calling renderButtons which handles the processing of our gif array
      renderButtons(gifList);
      //clears the topic text box
      $(".topic-input").val("");
    }
  });

  //stores the fav Gifs
  $(document).on("click", ".saveFav", toggleFav);
  // Generic function for displaying the movieInfo
  $(document).on("click", ".gifTopic", displayGifInfo);
  //click on the gif to play the gif
  $(document).on("click", ".gifResult", playGif);
  //removes a gif from the fav section
  $(document).on("click", ".removeFavBtn", rmFav);
  //one-click downloads the corresponding gif
  $(document).on("click", ".downloadGif", function() {
    downloadResource($(this).attr("data-download-link"), "myGif");
  });
});

// Function for dumping the JSON content for each button into the div
function displayGifInfo() {
  //get the data name of the button
  var gifTopic = $(this).attr("data-name");
  getGif(gifTopic);
}

//toggles between the gif and the still when user clicks on the gif
function playGif() {
  var gifStill = $(this).attr("data-gif-still");
  var gif = $(this).attr("data-gif");

  if ($(this).attr("src") !== gifStill) {
    $(this).attr("src", gifStill);
  } else {
    $(this).attr("src", gif);
  }
}

//function for calling the GIPHY API to get the appropriate gifs based on the gifTopic
function getGif(gifTopic) {
  if (gifTopic !== "Trending") {
    //create the queryURL using the gifTopic
    queryURL =
      "https://api.giphy.com/v1/gifs/search?q=" +
      gifTopic +
      "&api_key=kGOO42dDHjBstMYP3bEXkTG3g9nUihvo&limit=" +
      gifLimitPerCall;
  } else {
    queryURL =
      "https://api.giphy.com/v1/gifs/trending?api_key=kGOO42dDHjBstMYP3bEXkTG3g9nUihvo";
  }
  //ajax call using the queryURL
  $.ajax({
    method: "GET",
    url: queryURL
  }).then(function(response) {
    console.log(response);
    makeGifHTML(response.data);
    refreshFavStatus();
  });
}

function addFavGiftoDiv() {
  //iterate through the id in the fav list
  for (var i = 0; i < gifFavList.length; i++) {
    //call the gitGifbyID function to call the Giphy API with the id
    getGifbyID(gifFavList[i]);
  }
}

function getGifbyID(gifID) {
  //if we search using the ID, the response returns an object
  queryURL =
    "https://api.giphy.com/v1/gifs/" +
    gifID +
    "?api_key=kGOO42dDHjBstMYP3bEXkTG3g9nUihvo";
  //ajax call using the queryURL
  $.ajax({
    method: "GET",
    url: queryURL
  }).then(function(response) {
    console.log(response);
    makeFavGifHTML(response);
  });
}

function makeFavGifHTML(responseObj) {
  var gifDiv = $("<div>");
  gifDiv.addClass("col-sm-6 col-md-4 col-xl-2 favGifObj");
  gifDiv.attr("data-gif-id", responseObj.data.id);
  var gifRating = $("<h4>");
  //save the id of the gif for the removeFavFromDiv function
  gifRating.html("Rated: " + responseObj.data.rating);
  var gifPreview = $("<img>");
  gifPreview.addClass("gifResult");
  //store the still and gif in two data properties, toggle between them when clicking on the gif
  gifPreview.attr(
    "data-gif-still",
    responseObj.data.images.fixed_width_still.url
  );
  gifPreview.attr("data-gif", responseObj.data.images.fixed_width.url);
  gifPreview.attr("src", responseObj.data.images.fixed_width_still.url);
  var downloadBtn = $("<a>");
  // downloadBtn.attr("type", "button")
  downloadBtn.addClass("btn btn-info col-12 downloadGif");
  downloadBtn.attr(
    "data-download-link",
    responseObj.data.images.fixed_width.url
  );
  // downloadBtn.attr("download", "myGif");
  // downloadBtn.attr("target", "_blank");
  downloadBtn.html("Download");
  var downloadIcon = $("<i>");
  downloadIcon.addClass("fa fa-download");
  var removeBtn = $("<button>");
  removeBtn.addClass("btn btn-danger col-12 removeFavBtn");
  removeBtn.html("Remove");
  var hr = $("<hr>");
  $(".favGif").prepend(
    gifDiv.append(
      gifRating,
      gifPreview,
      downloadBtn.prepend(downloadIcon),
      removeBtn,
      hr
    )
  );
}

//function to render the gifs on the screen using the API response
function makeGifHTML(responseArr) {
  for (var i = 0; i < responseArr.length; i++) {
    var gifDiv = $("<div>");
    gifDiv.addClass("col-sm-6 col-md-4 col-xl-2 gifObj");
    var gifRating = $("<h4>");
    gifRating.html("Rated: " + responseArr[i].rating);
    var gifPreview = $("<img>");
    gifPreview.addClass("gifResult");
    //store the still and gif in two data properties, toggle between them when clicking on the gif
    gifPreview.attr(
      "data-gif-still",
      responseArr[i].images.fixed_width_still.url
    );
    gifPreview.attr("data-gif", responseArr[i].images.fixed_width.url);
    gifPreview.attr("src", responseArr[i].images.fixed_width_still.url);
    var fav = $("<i>");
    fav.addClass("fas fa-star col-12 saveFav");
    fav.attr("data-gif-id", responseArr[i].id);
    if (checkFavStatus(responseArr[i].id)) {
      fav.css("color", "yellowgreen");
    }
    var downloadBtn = $("<a>");
    // downloadBtn.attr("type", "button")
    downloadBtn.addClass("btn btn-info col-12 downloadGif");
    downloadBtn.attr(
      "data-download-link",
      responseArr[i].images.fixed_width.url
    );
    // downloadBtn.attr("download", "myGif");
    // downloadBtn.attr("target", "_blank");
    downloadBtn.html("Download");
    var downloadIcon = $("<i>");
    downloadIcon.addClass("fa fa-download");
    var hr = $("<hr>");
    $(".gif-section").prepend(
      gifDiv.append(
        gifRating,
        gifPreview,
        fav,
        downloadBtn.prepend(downloadIcon),
        hr
      )
    );
  }
}

// Function for rendering the gif topic buttons
function renderButtons(arr) {
  // Looping through the given
  for (var i = 0; i < arr.length; i++) {
    // Then dynamicaly generating buttons for each items in the array
    var btn = $("<button>");
    btn.addClass("btn btn-success gifTopic");
    btn.attr("id", arr[i].replace(/\s+/g, ""));
    // Adding a data-attribute
    btn.attr("data-name", arr[i]);
    // Providing the initial button text
    btn.text(arr[i]);
    // Adding the button to the buttons-view div
    $(".buttons-view").append(btn);
  }
}

function checkFavStatus(gifID) {
  //checks the newly generated gif id with the fav list, if id is in the list, fill in the star indicating it is faved
  if (gifFavList.indexOf(gifID) !== -1) {
    return true;
  }
}

function refreshFavStatus() {
  $(".saveFav").each(function(index, element) {
    var gifID = $(element).attr("data-gif-id");
    if (gifFavList.indexOf(gifID) !== -1) {
      //if the id exists in the fav array
      $(element).css("color", "yellowgreen");
    } else {
      //if the id doesn't exist in the fav array, remove the color of the star
      $(element).css("color", "");
    }
  });
}

function rmFav() {
  var gifID = $(this)
    .parent(".favGifObj")
    .attr("data-gif-id");
  // console.log(gifID)
  //removes the whole div of the gif
  $(this)
    .parent(".favGifObj")
    .remove();
  //update the fav list
  //update the localstorage
  removeFav(gifID);
  //refresh the star status on the same gifs on the page
  refreshFavStatus();
}

//this method is used for when user clicks on the star on the list of fav page, there's a remove button under the gifs in the fav section
function removeFavFromDiv(favID) {
  //$( "p" ).parent( ".selected" ).css( "background", "yellow" );
  $(".favGifObj").each(function(index, element) {
    var gifID = $(element).attr("data-gif-id");
    if (gifID === favID) {
      //if the id matches
      $(element).remove();
    }
  });
}

function toggleFav() {
  var gifID = $(this).attr("data-gif-id");
  //store the value if the fav List doesn't already contain the id
  if (gifFavList.indexOf(gifID) === -1) {
    //add color to the star
    $(this).css("color", "yellowgreen");
    //store the id in local storage
    storeFav(gifID);
    //add the fav to the fav Div
    getGifbyID(gifID);
  } else {
    //remove color from star
    $(this).css("color", "");
    //remove the id in local storage
    removeFav(gifID);
    //remove the gif from the fav section
    removeFavFromDiv(gifID);
  }
  refreshFavStatus();
}

function getFav() {
  //clears the fav list variable
  gifFavList = [];
  //use JSON.parse to get the favGif value back as an array
  var storageList = JSON.parse(localStorage.getItem("favGif"));
  //make sure the favGif exists in local storage, usually it will not if user first uses the site
  if (storageList !== null) {
    //assign the value back to gifFavList for this session
    gifFavList = storageList.slice();
  }
}

function removeFav(fav) {
  //removes the id element from the array
  gifFavList.splice(gifFavList.indexOf(fav), 1);
  //store the fav list into the long term local storage
  setStorage(gifFavList);
}

function storeFav(fav) {
  //stores the fav in the fav list
  gifFavList.push(fav);
  //store the fav list into the long term local storage
  setStorage(gifFavList);
}

function setStorage(arr) {
  //turn the array into JSON to store it as an array in the key localStorage key value pair
  json_data = JSON.stringify(arr);
  localStorage.setItem("favGif", json_data);
}

function forceDownload(blob, filename) {
  var a = document.createElement("a");
  a.download = filename;
  a.href = blob;
  a.click();
}

// Current blob size limit is around 500MB for browsers
// use this to convert the external link as a blob for force client side download
function downloadResource(url, filename) {
  if (!filename)
    filename = url
      .split("\\")
      .pop()
      .split("/")
      .pop();
  fetch(url, {
    headers: new Headers({
      Origin: location.origin
    }),
    mode: "cors"
  })
    .then(response => response.blob())
    .then(blob => {
      let blobUrl = window.URL.createObjectURL(blob);
      forceDownload(blobUrl, filename);
    })
    .catch(e => console.error(e));
}
