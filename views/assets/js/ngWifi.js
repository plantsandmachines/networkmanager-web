// variable for the scope, so we don't have to hand it to every function
// sorry for any confusions with the jQuery $ variable
var $s;

roboApp.controller('wifiCtrl', ['$scope', '$http', '$sce', function($scope, $http, $sce){
    $s = $scope;
    $s["$http"] = $http;

    $http.get("/networking/status.json").success(function(data){

        // binding the data
        $scope.networkDetails = false;
        $scope.networks = data.accessPoints;
        $scope.interfaces = data.interfaces;
        $scope.connections = data.connections;
        $scope.activeConnection = data.activeConnection;

        $scope.matchedNetworks = findMatchedNetworks(data);

        // adding functions
        $scope.setDetails = setDetails;
        $scope.setConnectionDetails = setConnectionDetails;
        $scope.getSecrets = getSecrets;
        $scope.setMatchingDetails = setMatchingDetails;
        $scope.connectToMatch = connectToMatch;
        $scope.connectToNew = connectToNew;

        $scope.switchState = switchState;

        $scope.isIteratable = isObject;
        $scope.hasChanged = hasChanged;
        $scope.getClasses = getClasses;

        $scope.updateConnection = updateConnection;

    });

}]);

/**
 * pushes a single item of the networks array into networkDetails to display
 * @param network object containing all the network details
 */
function setDetails(network){
    $s.networkDetails = network;
}
function setConnectionDetails(connection){
    $s.connectionDetails = connection;
}


/**
 * Sends an ajax request to the server backend to ask for the connection secrets.
 * On success the secrets get added to the connection.
 * @param connection : one of the connection/ap pairs provided by findMatchedNetworks()
 */
function getSecrets(connection){
    $s["$http"].post('/networking/wifi/getSecrets', connection)
        .success(function(data, status, headers, config){
            console.log(data);
            angular.forEach($s.connections, function(con,index){

               if (con.connection != null  && con.connection.id == connection.connection.id){
                   console.log('attached secrets to ' + con.connection.id);
                   if ( data['802-11-wireless-security'] ){
                       $s.connections[index]['802-11-wireless-security'] = angular.extend({},$s.connections[index]['802-11-wireless-security'], data['802-11-wireless-security']);
                   }
               }
            });
        })
        .error(function(data, status, headers, config){
            console.log("error:",data);
        });
}

/**
 * pushes a single match pair into matchingDetails to display
 * @param match object containing the pair
 */
function setMatchingDetails(match){
    $s.matchingDetails = match;
}

/**
 * finds network accessPoints that have a matching connection saved
 * @param data {Object} the complete wifi.json file
 * @returns {Array} networks found that can be connected to now
 */
function findMatchedNetworks(data){
    var matchedNetworks = [];
    angular.forEach(data.accessPoints, function(ap,index){
        angular.forEach(data.connections, function(con,index){
            if ( con["802-11-wireless"] == null || con["802-11-wireless"]["ssid"] == null)
                return;

            if( ap.Ssid == con["802-11-wireless"].ssid ){
                matchedNetworks.push(
                    { accessPoint: ap
                    , connection: con
                    }
                );
            }
        })
    });
    if ( matchedNetworks.length > 0 ){
        console.log(matchedNetworks);
        return matchedNetworks;
    } else {
        return null; // so that ng-show="matchedNetworks" will hide the relevant parts
    }
}

/**
 * Sends an ajax request to the server backend to tell it
 * that it has to connect to this connection/ap pair via the first found wifi interface.
 * @param accessPoint : one of the connection/ap pairs provided by findMatchedNetworks()
 */
function connectToMatch(accessPoint){
    $s["$http"].post('/networking/wifi/connect', accessPoint)
        .success(function(data, status, headers, config){
            console.log("success:",data);
        })
        .error(function(data, status, headers, config){
            console.log("error:",data);
        });
}


/**
 * Sends an ajax request to the server backend to tell it
 * that it has to connect to this connection/ap pair via the first found wifi interface.
 * @param accessPoint : one of the connection/ap pairs provided by findMatchedNetworks()
 */
function connectToNew(accessPoint){
    console.log( accessPoint.connection)
    $s["$http"].post('/networking/wifi/connectToNew', accessPoint)
        .success(function(data, status, headers, config){
            console.log("success:",data);
        })
        .error(function(data, status, headers, config){
            console.log("error:",data);
        });
}

/**
 * Changes the Interface State/ View
 * @param accessPoint {Object} one of the connection/ap pairs provided by findMatchedNetworks()
 * @param state {String} the state to be
 */
function switchState(accessPoint, state){
    angular.forEach($s.networks,function(ap,i){
        ap.state = 'default';
    });
    accessPoint.state = state;
}


/**
 * returns boolean if object is an object
 * @param object
 * @returns {boolean}
 */
function isObject( object ){
    return (typeof object == "object");
}


/**
 * function to be called when something in a connection has been changed by the user
 * @param connectionDetails {Object} the connection where something has changed
 * @param newChange {String} what part has changed
 */
function hasChanged(connectionDetails, newChange){
    if ( isObject(connectionDetails.angular) ){
        connectionDetails.angular.hasChanged = true;
        if ( isObject(connectionDetails.angular.changes) ){
            connectionDetails.angular.changes.push(newChange);
        }
    } else {
        connectionDetails.angular = {
            hasChanged: true,
            changes: [newChange]
        }
    }
}

/**
 * returns the classes that need to get added to that element
 * @param element {String} name of a parameter of the wifi config
 * @returns {Array} of classes that will be added
 */
function getClasses( element ){
    var classes = [];
    if ( isObject($s.connectionDetails.angular) && isObject($s.connectionDetails.angular.changes) ){
        if ( $s.connectionDetails.angular.changes.indexOf(element) != -1 ){
            classes.push('text-warning');
        }
    }
    return classes;
}


function updateConnection( connection ){
    console.log( connection )
    $s["$http"].post('/networking/wifi/updateConnection', connection)
        .success(function(data, status, headers, config){
            console.log("success:",data);
        })
        .error(function(data, status, headers, config){
            console.log("error:",data);
        });
}