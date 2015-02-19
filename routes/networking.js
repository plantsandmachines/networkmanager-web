module.exports = function (app) {


  /**
   * ROUTING
   */

  /**
   * network overview page
   */
  app.get('/', function(req, res){
    res.render('wifi')
  });

  /**
   * json file containing all the relevant info
   */
  app.get('/networking/status.json', function (req, res) {
    app.networkManager.getStatus(function(err,status){
      if ( err ){
        res.send(err);
        console.error(err);
      } else {
        res.json(status);
      }
    });
  });

  /**
   * post route to connect to a wifi network
   */
  app.post('/networking/wifi/connect', function(req, res){
    //console.log('networking','wifi connect got called to ' + req.body.connection.connection.id);
    console.log('networking',req.body);
    app.networkManager.connectToMatch(req.body, function(err, data){
      if ( err ){
        console.log('networking',"error: "+ err);
        return res.send(err);
      }

      console.log('networking',JSON.stringify(data));
      res.json(data);
    });
  });


  /**
   * post route to connect to a new wifi network
   */
  app.post('/networking/wifi/connectToNew', function(req, res){
    //console.log('networking','wifi connect got called to ' + req.body.connection.connection.id);
    console.log('networking',req.body);
    app.networkManager.connectToNewNetwork(req.body, function(err, data){
      if ( err ){
        console.log('networking',"error: "+ err);
        return res.send(err);
      }

      console.log('networking',JSON.stringify(data));
      res.json(data);
    });
  });



  /**
   * post route to get the secrets of a to a wifi connection
   */
  app.post('/networking/wifi/getSecrets', function(req, res){
    console.log('networking','handing out secrets of connection ' + req.body.connection.id);
    app.networkManager.getConnectionSecrets(req.body, function(err, data){
      if ( err ){
        console.log('networking',"error: "+ err);
        return res.send(err);
      }

      console.log('networking',JSON.stringify(data));
      res.json(data);
    });
  });

  /**
   * post route to update an existing connection
   */
  app.post('/networking/wifi/updateConnection', function(req, res){
    console.log('networking','updating connection ' + req.body.connection.id);
    app.networkManager.updateConnection(req.body, function(err, data){
      if ( err ){
        console.log('networking',"error: "+ err);
        return res.send(err);
      }

      console.log('networking',JSON.stringify(data));
      res.json(data);
    });
  });


  /**
   * bindings of networkManager to faye
   */
  app.networkManager.registerStateChangedListener(stateChangedListener);
  app.networkManager.registerWifiStateChangedListener(stateChangedListener)

  /**
   * function to be called on networkManager state changes
   * will hand the data forward via faye to /networking/stateChanged and /asciiBot/messages
   * @param state String describing the state
   * @param code Integer enumeration of the state ( see https://developer.gnome.org/NetworkManager/0.9/spec.html#org.freedesktop.NetworkManager)
   */
  function stateChangedListener(state, code){
    console.log("networking"," changed: "+state);
    app.faye.publish('/networking/stateChanged', {state: state, code: code});
    app.faye.publish('/asciiBot/messages',{message: "Señjor NetworkManager tells me: "+state});
  }
};


