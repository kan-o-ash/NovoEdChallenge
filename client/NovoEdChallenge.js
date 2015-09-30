Users = new Mongo.Collection("users");

Template.searchBox.events({
  'keyup #search, click #search-btn': function (evt, templ) {
    if (evt.type == 'click' || evt.keyCode == 13) {
      Session.set('search', false);
      var s = document.getElementById('search').value;

      Meteor.call('getNearby', s, function (err, resp) {
        window.search = resp;
        Session.set('search', true);
      });
    }
  }
});

Template.resultsWrap.helpers({
  results: function () {
    if (Session.get('search')){
      return window.search;
    }
  }
});
