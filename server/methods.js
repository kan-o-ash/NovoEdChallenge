Meteor.methods({
  getNearby: function (location_text) {
    var geo = new GeoCoder({
        httpAdapter: "https",
        apiKey: ''
      });

    var result = geo.geocode(location_text);

    if (result.length >= 1) {
      var loc = [result[0]['longitude'], result[0]['latitude']];
      return Users.find({
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
    else {
      return null
    }
  }
});