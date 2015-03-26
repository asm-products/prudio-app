var request  = require('request');
var qs       = require('querystring');
var loopback = require('loopback');

module.exports = function(App) {

	// Hide almost all methods
	// Only because we need it in the lb-services (Angular SDK)

    App.disableRemoteMethod('find', true);
    App.disableRemoteMethod('count', true);
    App.disableRemoteMethod('exists', true);
    App.disableRemoteMethod('create', true);
    App.disableRemoteMethod('upsert', true);
    //App.disableRemoteMethod('findById', true);
    App.disableRemoteMethod('deleteById', true);
    App.disableRemoteMethod('findOne', true);
    App.disableRemoteMethod('updateAll', true);
    App.disableRemoteMethod('prototype.updateAttributes', true);
    App.disableRemoteMethod('prototype.__get__account', true);

    App.validatesUniquenessOf('appId');


    var environment = process.env.NODE_ENV || 'development';
    var baseUrl = 'http://localhost:5000';

    if (environment !== 'development') {
        baseUrl = 'http://chat.prud.io';
    }

    /*
    * Connect method
    *
    */
    App.connect = function(id, next) {

        App.findById(id, function(err, app) {
            if (err) {
                return next(err);
            } else if (!app) {
                return next(new Error('App not found!'));
            }

            var query = {
                appid: app.appId,
                token: app.slackApiToken
            }

            request
                .post({url: baseUrl + '/app/connect?' + qs.stringify(query), json: true}, function (error, response, body) {
                    if (error) {
                        return next(null, false, error);
                    }
                    return next(null, body.success, body.message);
                })
                .on('error', function(err) {
                    console.error(err);
                });
        });
    }

    App.remoteMethod(
        'connect',
        {
            description: "Connect an App",
            accepts: {arg: 'id', type: 'any', required: true, description: 'PersistedModel id'},
            http: {path: '/:id/connect', verb: 'get'},
            returns: [
                {arg: 'success', type: 'boolean'},
                {arg: 'result', type: 'mixed'}
            ]
        }
    );




    /*
    * Disconnect method
    *
    */
    App.disconnect = function(id, next) {

        App.findById(id, function(err, app) {
            if (err) {
                return next(err);
            } else if (!app) {
                return next(new Error('App not found!'));
            }

            var query = {
                appid: app.appId,
                token: app.slackApiToken
            }

            request
                .post({url: baseUrl + '/app/disconnect?' + qs.stringify(query), json: true}, function (error, response, body) {
                    if (error) {
                        return next(null, false, error);
                    }
                    return next(null, body.success, body.message);
                })
                .on('error', function(err) {
                    console.error(err);
                });
        });
    }

    App.remoteMethod(
        'disconnect',
        {
            description: "Connect an App",
            accepts: {arg: 'id', type: 'any', required: true, description: 'PersistedModel id'},
            http: {path: '/:id/disconnect', verb: 'get'},
            returns: [
                {arg: 'success', type: 'boolean'},
                {arg: 'result', type: 'mixed'}
            ]
        }
    );

    App.observe('before save', function beforeSave(ctx, next) {

        var Servers = loopback.getModel('Servers');

        // DO AN ALGORITHM TO SELECT THE SERVER

        // Creates a 32 char random string
        function makeid()
        {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 32; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

        // If instance = new object
        if (ctx.instance) {
            ctx.instance.appId     = makeid();
            ctx.instance.server    = "BURKINA";
            ctx.instance.socketURL = "https://prudio-burkina.herokuapp.com:443";
            ctx.instance.created   = new Date();
            ctx.instance.modified  = new Date();

            // Add server and socketURL
        } else {
            ctx.data.modified = new Date();
        }

        next();
    });

};
