(function () {

    var freesound = function () {        
        var authHeader = '';
        var clientId = '';
        var clientSecret = '';
        var host = 'freesound.org';

        var uris = {
            base : 'https://'+host+'/apiv2',
            textSearch : '/search/text/',
            contentSearch: '/search/content/',
            combinedSearch : '/sounds/search/combined/',
            sound : '/sounds/<sound_id>/',
            soundAnalysis : '/sounds/<sound_id>/analysis/',
            similarSounds : '/sounds/<sound_id>/similar/',
            comments : '/sounds/<sound_id>/comments/',
            download : '/sounds/<sound_id>/download/',
            upload : '/sounds/upload/',
            describe : '/sounds/<sound_id>/describe/',
            pending : '/sounds/pending_uploads/',
            bookmark : '/sounds/<sound_id>/bookmark/',
            rate : '/sounds/<sound_id>/rate/',
            comment : '/sounds/<sound_id>/comment/',
            authorize : '/oauth2/authorize/',
            logout : '/api-auth/logout/',
            logoutAuthorize : '/oauth2/logout_and_authorize/',
            me : '/me/',
            user : '/users/<username>/',
            userSounds : '/users/<username>/sounds/',
            userPacks : '/users/<username>/packs/',
            userBookmarkCategories : '/users/<username>/bookmark_categories/',
            userBookmarkCategorySounds : '/users/<username>/bookmark_categories/<category_id>/sounds/',
            pack : '/packs/<pack_id>/',
            packSounds : '/packs/<pack_id>/sounds/',
            packDownload : '/packs/<pack_id>/download/'            
        };
        
        var makeUri = function (uri, args){
            for (var a in args) {uri = uri.replace(/<[\w_]+>/, args[a]);}
            return uris.base+uri;
        };

        var makeRequest = function (uri, success, error, params, wrapper, method, data, content_type){
            if(method===undefined) method='GET';
            if(!error)error = function(e){console.log(e)};
            params = params || {};
            params['format'] = 'json';
            //params['api_key'] = '4287f0bacdcc492a8fae27fc3b228aaf';
            var fs = this;
            var parse_response = function (response){
                var data = eval("(" + response + ")");
                success(wrapper?wrapper(data):data);
            };                      
            var paramStr = "";
            for(var p in params){paramStr = paramStr+"&"+p+"="+params[p];}
            if (paramStr){
                uri = uri +"?"+ paramStr;
            }
            
            if (typeof module !== 'undefined'){ // node.js
                var http = require("http");
                var options = {
                    host: host,
                    path: uri.substring(uri.indexOf("/",8),uri.length), // first '/' after 'http://'
                    port: '443',
                    method: method,
                    headers: {'Authorization': authHeader},
                    withCredentials:false,
                };
                console.log( 'http options:', options )
                var req = http.request(options,function(res){
                    res.setEncoding('utf8');            
                    res.on('data', function (data){ 
                        if([200,201,202].indexOf(res.statusCode)>=0)
                            success(wrapper?wrapper(data):data);
                        else   
                            error(data);
                    });                    
                });                
                req.on('error', error).end();
            }
            else{ // browser
                var xhr;
                try {xhr = new XMLHttpRequest();}
                catch (e) {xhr = new ActiveXObject('Microsoft.XMLHTTP');}

                xhr.onreadystatechange = function(){
                    if (xhr.readyState === 4 && [200,201,202].indexOf(xhr.status)>=0){
                        var data = eval("(" + xhr.responseText + ")");
                        if(success) success(wrapper?wrapper(data):data);
                    }
                    else if (xhr.readyState === 4 && xhr.status !== 200){
                        if(error) error(xhr.statusText);
                    }
                };
                console.log( method, uri )
                xhr.open(method, uri);
                xhr.setRequestHeader('Authorization',authHeader);
                if(content_type!==undefined)
                    xhr.setRequestHeader('Content-Type',content_type);
                xhr.send(data);
            }
    };
    var checkOauth = function(){
        if(authHeader.indexOf("Bearer")==-1)
            throw("Oauth authentication required");
    };
        
    var makeFD = function(obj,fd){
        if(!fd)
            fd = new FormData(); 
        for (var prop in obj){
            fd.append(prop,obj[prop])
        }
        return fd;
    };
    
    var search = function(options, uri, success, error,wrapper){  
        if(options.analysis_file){ 
                makeRequest(makeUri(uri), success,error,null, wrapper, 'POST',makeFD(options));
        }
        else{
                makeRequest(makeUri(uri), success,error,options, wrapper);
        }    
    };
        
    var Collection = function (jsonObject){
        var nextOrPrev = function (which,success,error){
            makeRequest(which,success,error,{}, Collection);
        };        
        jsonObject.nextPage = function (success,error){
            nextOrPrev(jsonObject.next,success,error);
        };
        jsonObject.previousPage = function (success,error){
            nextOrPrev(jsonObject.previous,success,error);
        };
        jsonObject.getItem = function (idx){
            return jsonObject.results[idx];
        }
        
        return jsonObject;
    };  
        
    var SoundCollection = function(jsonObject){
        var collection = Collection(jsonObject);
        collection.getSound = function (idx){
            return new SoundObject(collection.results[idx]);
        };
        return collection;
    };
    
    var PackCollection = function(jsonObject){
        var collection = Collection(jsonObject);
        collection.getPack = function (idx){
            return new PackObject(collection.results[idx]);
        };   
        return collection;
    };
        
    var SoundObject = function (jsonObject){ 
        jsonObject.getAnalysis = function(filter, success, error, showAll){
            var params = {all: showAll?1:0};
            makeRequest(makeUri(uris.soundAnalysis,[jsonObject.id,filter?filter:""]),success,error);
        };

        jsonObject.getSimilar = function (success, error, params){
            makeRequest(makeUri(uris.similarSounds,[jsonObject.id]),success,error, params,SoundCollection);
        };
 
       jsonObject.getComments = function (success, error){
            makeRequest(makeUri(uris.comments,[jsonObject.id]),success,error,{},Collection);
       };

       jsonObject.download = function (targetWindow){// can be window, new, or iframe
            checkOauth();
            var uri = makeUri(uris.download,[jsonObject.id]);
            targetWindow.location = uri;
       };
       
	jsonObject.comment = function (commentStr, success, error){
            checkOauth();
            var data = new FormData();
            data.append('comment', comment);
            var uri = makeUri(uris.comment,[jsonObject.id]);
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };

        jsonObject.rate = function (rating, success, error){
            checkOauth();
            var data = new FormData();
            data.append('rating', rating);
            var uri = makeUri(uris.rate,[jsonObject.id]);
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };

        jsonObject.bookmark = function (name, category,success, error){
            checkOauth();
            var data = new FormData();
            data.append('name', name);
            if(category)
                data.append("category",category);
            var uri = makeUri(uris.bookmark,[jsonObject.id]);            
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };
        
        jsonObject.edit = function (description,success, error){
            checkOauth();
            var data = makeFD(description);
            var uri = makeUri(uris.edit,[jsonObject.id]);
            makeRequest(uri, success, error, {}, null, 'POST', data);
        };        

        return jsonObject;
    };
    var UserObject = function(jsonObject){
        jsonObject.sounds = function (success, error, params){
            var uri = makeUri(uris.userSounds,[jsonObject.username]);
            makeRequest(uri, success, error,params,SoundCollection);            
        };

        jsonObject.packs = function (success, error){
            var uri = makeUri(uris.userPacks,[jsonObject.username]);
            makeRequest(uri, success, error,{},PackCollection);                    
        };

        jsonObject.bookmarkCategories = function (success, error){
            var uri = makeUri(uris.userBookmarkCategories,[jsonObject.username]);
            makeRequest(uri, success, error);                    
        };

        jsonObject.bookmarkCategorySounds = function (success, error,params){
            var uri = makeUri(uris.userBookmarkCategorySounds,[jsonObject.username]);
            makeRequest(uri, success, error,params);                    
        };

        return jsonObject;
    };
        
    var PackObject = function(jsonObject){
        jsonObject.sounds = function (success, error){
            var uri = makeUri(uris.packSounds,[jsonObject.id]);
            makeRequest(uri, success, error,{},SoundCollection);            
        };
        
        jsonObject.download = function (targetWindow){// can be current or new window, or iframe
            checkOauth();
            var uri = makeUri(uris.packDownload,[jsonObject.id]);
            targetWindow.location = uri;
        };                
        return jsonObject;
    };
                
    return {
            // authentication
            setToken: function (token, type) {
                authHeader = (type==='oauth' ? 'Bearer ':'Token ')+token;
            },
            setClientSecrets: function(id,secret){
                clientId = id;
                clientSecret = secret;
            },

            postAccessCode: function(code, success, error){
                var post_url = uris.base+"/oauth2/access_token/"
                var data = new FormData();
                data.append('client_id',clientId);
                data.append('client_secret',clientSecret);
                data.append('code',code);
                data.append('grant_type','authorization_code');
                                
                if (!success){
                    success = function(result){
                        setToken(result.access_token,'oauth');                        
                    }
                }
                makeRequest(post_url, success, error, {}, null, 'POST', data);
            },
            textSearch: function(query, options, success, error){                
                options = options || {};
                options.query = query ? query : " ";
                search(options,uris.textSearch,success,error,SoundCollection);
            },                    
            contentSearch: function(options, success, error){
                if(!(options.target || options.analysis_file))
                   throw("Missing target or analysis_file");
                search(options,uris.contentSearch,success,error,SoundCollection);
            },
            combinedSearch:function(options, success, error){
               if(!(options.target || options.analysis_file || options.query))
                   throw("Missing query, target or analysis_file");
                search(options,uris.contentSearch,success,error);
            },
            getSound: function(soundId,success, error){
                makeRequest(makeUri(uris.sound, [soundId]), success,error,{}, SoundObject);
            },

            upload: function(audiofile,filename, description, success,error){
                checkOauth();
                var fd = new FormData();
                fd.append('audiofile', audiofile,filename);                    
                if(description){                    
                    fd = makeFD(description,fd);
                }
                makeRequest(makeUri(uris.upload), success, error, {}, null, 'POST', fd);
            },
            describe: function(upload_filename , description, license, tags, success,error){
                checkOauth();                
                var fd = makeFD(description);
                makeRequest(makeUri(uris.upload), success, error, {}, null, 'POST', fd);
            },

            getPendingSounds: function(success,error){
                checkOauth();
                makeRequest(makeUri(uris.pending), success,error,{});
            },

            // user resources
            me: function(success,error){
                checkOauth();
                makeRequest(makeUri(uris.me), success,error);
            },

            getLoginURL: function(){
                    if(clientId===undefined) throw "client_id was not set"
                    var login_url = makeUri(uris.authorize);
                    login_url += "?client_id="+clientId+"&response_type=code";
                    return login_url;
            },
            getLogoutURL: function(){
                var logout_url = makeUri(uris.logoutAuthorize);
                logout_url += "?client_id="+clientId+"&response_type=code";
                
                return logout_url;
            },

            getUser: function(username, success,error){
                makeRequest(makeUri(uris.user, [username]), success,error,{}, UserObject);
            },
        
            getPack: function(packId,success,error){                
                makeRequest(makeUri(uris.pack, [packId]), success,error,{}, PackObject);            
            }        
        }    
    };

    // compatible with CommonJS (node), AMD (requireJS) failing back to browser global 
    // working with node requires web-audio-api module
    if (typeof module !== 'undefined') {module.exports = freesound(); }
    else if (typeof define === 'function' && typeof define.amd === 'object') { define("freesound", [], freesound); }
    else {this.freesound = freesound(); }
}());
