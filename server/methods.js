// Search by first, last, and location

getLocation = function (location_text) {
  var geo = new GeoCoder({
      httpAdapter: "https",
      apiKey: ''
    });

  return geo.geocode(location_text);
}

filterDuplicates = function (f_name_matches, l_name_matches, loc_matches) {
  var id_arr = [];

  f_name_matches.forEach(function (cur, i){
    id_arr.push(cur._id);
  });
 
  l_name_matches.forEach(function (cur, i){
    if (id_arr.indexOf(cur._id) > -1) {
      l_name_matches.splice(i,1);
    }
    else {
      id_arr.push(cur._id);
    }
  });
  
  loc_matches.forEach(function (cur, i){
    if (id_arr.indexOf(cur._id) > -1) {
      loc_matches.splice(i,1);
    }
  });

  var results = f_name_matches.concat(l_name_matches);
  results = results.concat(loc_matches);
  return results;
}


Meteor.methods({
  getNearby: function (search_text) {
    loc = getLocation(search_text)

    // query on first names
    f_name_matches = Users.find({'f_name': { $regex: search_text}}).fetch();

    // query on last names
    l_name_matches = Users.find({'l_name': { $regex: search_text}}).fetch();
    console.log(l_name_matches);
    if (loc.length >= 1) {
      var loc = [loc[0]['longitude'], loc[0]['latitude']];
      loc_matches = Users.find({
        geo_ind: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: loc
        } } } }, {
          limit:20,
          fields: {
            f_name: 1,
            l_name: 1,
            loc_text: 1
          }
        }).fetch();
    }

    return filterDuplicates(f_name_matches, l_name_matches, loc_matches);
  }
});