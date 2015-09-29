Users = new Mongo.Collection("users");
// var Future = Npm.require( 'fibers/future' ); 
var geo = new GeoCoder({
    httpAdapter: "https",
    apiKey: 'AIzaSyC0ogySyajOLH3D3Sxtbt5iZxBrslANHE0'
  });

function addGeo(obj, cbk) {

  // don't spam the google api
  Meteor.setTimeout( function (){
    var result = geo.geocode(obj.loc_text)
    if (result.length >= 1) {
      obj.loc_geo = result[0];
      cbk(0, obj);
    }
    else {
      cbk(0, null);
    }
  }, 200);

  return;
}

function populateLearners() {
  // inserts the mock learner data into a Mongo collection.
  
  // open CSV file and parse into a JS object
  var loc_text = Assets.getText("learner-loc.csv");
  var csvParseSync = Meteor.wrapAsync(CSVParse);
  var arr;
  try {
    arr = csvParseSync(loc_text, {columns: ['f_name','l_name','loc_text']});
  } catch (error) {
    throw new Meteor.Error('csv-parse-fail', error.message);
  }

  // insert all into the Users collection
  arr.forEach( function (cur, i) {
    var sync  = Meteor.wrapAsync(addGeo);
    var result = sync(cur);
    if (result) {
      Users.insert(result);
    }
    else {
      warn = "WARNING: Learner " + cur['f_name'] + " " + cur['l_name'] + "'s location could not be geocoded.";
      console.log(warn);
    }
  })

}

Meteor.startup(function () {
  // Run only first time the server runs
  if (Users.find().count() == 0 ) {
      populateLearners();
  }
});
