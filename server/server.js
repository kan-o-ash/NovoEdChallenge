Users = new Mongo.Collection("users");

var geo = new GeoCoder({
    httpAdapter: "https",
    apiKey: ''
  });

function addGeo(obj, cbk) {

  // don't spam the google api
  Meteor.setTimeout( function (){
    var result = geo.geocode(obj.loc_text)
    if (result.length >= 1) {
      // currently only taking the first result
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
      Users.insert(cur);
      warn = "WARNING: " + cur['f_name'] + " " + cur['l_name'] + "'s location could not be geocoded.";
      console.log(warn);
    }
  });
}

function addGeoJson() {
  // Adds a geoJSON object to each user, required to create a 2dsphere index on the collection.
  // NOTE: Must create a 2dsphere index on the database afterward.

  var all_users = Users.find();

  all_users.forEach(function (user) {
    if ('loc_geo' in user) {
      lon = user['loc_geo']['longitude'];
      lat = user['loc_geo']['latitude'];
      point = { type: "Point", coordinates: [lon, lat] };

      Users.update(user._id, {$set: {'geo_ind': point}});
    }
  });
}

Meteor.startup(function () {
  // Run only first time the server runs
  if (Users.find().count() == 0 ) {
    populateLearners();
  }

  // Create a geoindex if one doesn't exist
  if (!('geo_ind' in Users.findOne())) {
    addGeoJson();
  }

});
