var freesound = {
    BASE_URI : "http://www.freesound.org/api",
    apiKey : '',
    _URI_SOUND : '/sounds/<sound_id>/',
    _URI_SOUND_ANALYSIS : '/sounds/<sound_id>/analysis/',
    _URI_SOUND_ANALYSIS_FILTER :'/sounds/<sound_id>/analysis/<filter>',
    _URI_SIMILAR_SOUNDS : '/sounds/<sound_id>/similar/',
    _URI_SEARCH : '/sounds/search/',
    _URI_CONTENT_SEARCH : '/sounds/content_search/',
    _URI_GEOTAG : '/sounds/geotag',
    _URI_USER : '/people/<user_name>/',
    _URI_USER_SOUNDS : '/people/<user_name>/sounds/',
    _URI_USER_PACKS : '/people/<user_name>/packs/',
    _URI_USER_BOOKMARKS : '/people/<username>/bookmark_categories',
    _URI_BOOKMARK_CATEGORY_SOUNDS : '/people/<username>/bookmark_categories/<category_id>/sounds',
    _URI_PACK : '/packs/<pack_id>/',
    _URI_PACK_SOUNDS : '/packs/<pack_id>/sounds/',

    _make_uri : function(uri,args){
        for (a in args) {uri = uri.replace(/<[\w_]+>/, args[a])};
        return this.BASE_URI+uri;
    },
    _make_request : function(uri,success,error,params,wrapper){
        var fs = this;

        if(uri.indexOf('?') == -1){ uri = uri+"?" }
        uri = uri+"&api_key="+this.apiKey;
        for(p in params){uri = uri+"&"+p+"="+params[p]};
        var xhr;
        try {xhr = new XMLHttpRequest()}
        catch (e) {xhr = new ActiveXObject('Microsoft.XMLHTTP')};
        xhr.onreadystatechange = function(){
            if (xhr.readyState == 4 && xhr.status == 200){
                var data = eval("(" + xhr.responseText + ")");
                success(wrapper?wrapper(data):data);
            }
            else if (xhr.readyState == 4 && xhr.status != 200){
                error();
            }
        };
        //console.log(uri);
        xhr.open('GET', uri);
        xhr.send(null);
    },
    _make_sound_object: function(snd){ // receives json object already "parsed" (via eval)
        snd.get_analysis = function(showAll, filter, success, error){
            var params = {all: showAll?1:0};
            var base_uri = filter? freesound._URI_SOUND_ANALYSIS_FILTER:freesound._URI_SOUND_ANALYSIS;
            freesound._make_request(freesound._make_uri(base_uri,[snd.id,filter?filter:""]),success,error);
        };
        snd.get_similar_sounds = function(success, error){
            freesound._make_request(freesound._make_uri(freesound._URI_SIMILAR_SOUNDS,[snd.id]),success,error);
        };
        return snd;
    },
    _make_sound_collection_object: function(col){
        var get_next_or_prev = function(which,success,error){
            freesound._make_request(which,success,error,null);
        }
        col.next_page = function(success,error){get_next_or_prev(this.next,success,error)};
        col.previous_page = function(success,error){get_next_or_prev(this.previous,success,error)};
        return col;
    },
    _make_user_object: function(user){ // receives json object already "parsed" (via eval)
        user.get_sounds = function(success, error){
            freesound._make_request(freesound._make_uri(freesound._URI_USER_SOUNDS,[user.username]),success,error);
        };
        user.get_packs = function(success, error){
            freesound._make_request(freesound._make_uri(freesound._URI_USER_PACKS,[user.username]),success,error);
        };
        user.get_bookmark_categories = function(success, error){
            freesound._make_request(freesound._make_uri(freesound._URI_USER_BOOKMARKS,[user.username]),success,error);
        };
        user.get_bookmark_category_sounds = function(ref, success, error){
            freesound._make_request(ref,success,error);
        };
        return user;
    },
    _make_pack_object: function(pack){ // receives json object already "parsed" (via eval)
        pack.get_sounds = function(success, error){
            freesound._make_request(freesound._make_uri(freesound._URI_PACK_SOUNDS,[pack.id]),success,error);
        };
        return pack;
    },
    /************* "Public" interface *****************/
    get_from_ref : function(ref, success,error){
        this._make_request(ref,success,error,{});
    },
    get_sound : function(soundId, success,error){
        this._make_request(this._make_uri(this._URI_SOUND,[soundId]),success,error,{},this._make_sound_object);
    },
    get_user : function(username, success,error){
        this._make_request(this._make_uri(this._URI_USER,[username]),success,error,{},this._make_user_object);
    },
    get_pack : function(packId, success,error){
        this._make_request(this._make_uri(this._URI_PACK,[packId]),success,error,{},this._make_pack_object);
    },
    quick_search : function(query,success,error){
        this.search(query,0,null,null,success,error);
    },
    search: function(query, page, filter, sort, num_results, fields, sounds_per_page, success, error){
        var params = {q:(query ? query : " ")};
        if(page)params.p=page;
        if(filter)params.f = filter;
        if(sort)params.s = sort;
        if(num_results)params.num_results = num_results;
        if(sounds_per_page)params.sounds_per_page = sounds_per_page;
        if(fields)params.fields = fields;
        this._make_request(this._make_uri(this._URI_SEARCH), success,error,params, this._make_sound_collection_object);
    },
    content_based_search: function(target, filter, max_results, fields, page, sounds_per_page, success, error){
        var params = {};
        if(page)params.p=page;
        if(filter)params.f = filter;
        if(target)params.t = target;
        if(max_results)params.max_results = max_results;
        if(sounds_per_page)params.sounds_per_page = sounds_per_page;
        if(fields)params.fields = fields;
        this._make_request(this._make_uri(this._URI_CONTENT_SEARCH), success,error,params, this._make_sound_collection_object);
    },
    geotag: function(min_lat, max_lat, min_lon, max_lon, page, fields, sounds_per_page, success, error){
        var params = {};
        if(min_lat)params.min_lat=min_lat;
        if(max_lat)params.max_lat=max_lat;
        if(min_lon)params.min_lon=min_lon;
        if(max_lon)params.max_lon=max_lon;
        if(page)params.p=page;
        if(sounds_per_page)params.sounds_per_page = sounds_per_page;
        if(fields)params.fields = fields;
        this._make_request(this._make_uri(this._URI_GEOTAG), success,error,params, this._make_sound_collection_object);
    }
};