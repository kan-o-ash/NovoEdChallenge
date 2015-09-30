# NovoEdChallenge

This project was created for NovoEd: https://novoed.com.

## Tools used
Meteor: https://www.meteor.com/  
Google Geocoding API  
Bootstrap

## Setup
1) Clone this repo  
2) Add your Geocoding API key to both files under the server directory, or modify this to use environment variables (recommended)  
3) Add a 2dsphere index to the users collection as below.
```
db.users.createIndex({'geo_ind':'2dsphere'})
```
