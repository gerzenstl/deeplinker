(function(window){
    if(!window.utils){
        window.utils = {};
    }
    
    window.utils.forEach = function(arr, callback, context){
        if(!arr || arr.length == 0){return;}
        
        if(context){
            callback = utils.scope(context, callback);
        }
        
        if(callback){
            for(var idx = 0; idx < arr.length; idx++){
                callback(arr[idx],idx,arr);
            }
        }
    }
    
    window.utils.scope = function(context, method){
        if(!context || !method) {return false};
        if(typeof method == "function"){
            return function(){
                method.apply(context,arguments);
            }
        }
        else if(typeof method == "string" && context[method]){
            return function(){
                context[method].apply(context,arguments);
            }
        }
        else return false;
    }
    
    window.utils.indexOf = function(array,value,fromIndex,findLast){
        var step = 1, end = array.length || 0, i = 0;
        if(findLast){
                i = end - 1;
                step = end = -1;
        }
        if(fromIndex != undefined){i = fromIndex;}
        if((findLast && i > end) || i < end) {
                for(; i != end; i += step){
                        if(array[i] == value){return i;}
                }
        }
        return -1;
    }
    
    window.utils.lastIndexOf = function(array,value,fromIndex){
        return utils.indexOf(array, value, fromIndex, true);
    }
})(window);
(function(window){

window.deeplinker =  {
    _routes:{},
    _defaultCallback:null,
    _checkInterval:null,
    _window: null,
    _href:null,
    _updateRate:100,
    
    init: function(routingWindow){
        this._window =routingWindow;
        this._checkInterval = setInterval(_deeplinking_checkHash,this._updateRate);
    },
    
    setDefaultCallback: function(callback){
        this._defaultCallback = callback;
    },
    
    getRoute: function(href){
        if(typeof href == "string"){
            var safeHref = href.split('?',2)[0];
            var hash = safeHref.split('#!',2)[1];
            return hash? hash:false;
        }
        else return false;
    },
    
    getBasePath:function(){
        return  this._window.location.protocol 
                +'//'+this._window.location.hostname 
                + this._window.location.pathname;
    },
    
    route: function(path){
        var unfilteredPathItems = path.split("/");
        var pathItems = [];
        utils.forEach(unfilteredPathItems, function(item){
            if(item != ""){
                pathItems.push(item);
            }
        });
        var routeItem = _deeplinking_tree_run(this._routes, pathItems);
        if(routeItem){
            var routeCallback = routeItem.callback;
            var callbackArgs = _deeplinking_process_arguments(routeItem.args, routeItem.path, pathItems);
            
            var callable = _deeplinking_resolveCallback(routeCallback, callbackArgs);
            if(callable != false){
                try{
                    callable();
                }
                catch(e){
                    console.error(e);
                    return false;
                }
            }
            else{
                return false;
            }
        }
        else {
            return false;
        }

        return true;
    },
    
    addRoute: function (path, callback, args){
        var unfilteredPathItems = path.split("/");
        var pathItems = [];
        utils.forEach(unfilteredPathItems, function(item){
            if(item != ""){
                pathItems.push(item);
            }
        });
        var value = {callback:callback, args:args};
        _deeplinking_tree_set(this._routes, pathItems, value);
    },
    
    removeRoute: function (path){
        var unfilteredPathItems = path.split("/");
        var pathItems = [];
        utils.forEach(unfilteredPathItems, function(item){
            if(item != ""){
                pathItems.push(item);
            }
        });
        _deeplinking_tree_set(this._routes, pathItems, null);
    }
};

function _deeplinking_tree_run(root, path) {
    if(path.length > 0){
        if(typeof root[path[0]] != "undefined"){
            return _deeplinking_tree_run(root[path[0]], path.slice(1));
        }
        else if (typeof root["*"] != "undefined"){
            return _deeplinking_tree_run(root["*"], path.slice(1));
        }
        else return false
    }
    else return root;
}

function _deeplinking_tree_set(root, path, value, originalPath) {
    if(typeof originalPath == "undefined"){
        originalPath = [];
    }
    if(path.length > 1){
        var pathItem = path.shift();
        originalPath.push(pathItem);
        if(pathItem.indexOf(":") > -1){
            pathItem = "*";
        }
        if(typeof root[pathItem] == 'undefined'){
            root[pathItem] = {};
        }
        _deeplinking_tree_set(root[pathItem], path, value, originalPath);
    }
    else {
        originalPath.push(path[0]);
        value.path = originalPath;
        if(path[0].indexOf(":")>-1){
            path[0] = "*";
        }
        root[path[0]] = value;
    }
}

function _deeplinking_process_arguments(declaredArgs, declaredPathItems, pathItems ){
    var args = [];
    utils.forEach(declaredArgs, function (arg){
        if(typeof arg == "string" && arg.indexOf(":") == 0){
            var pathItemIdx = utils.indexOf(declaredPathItems,arg);
            if(pathItemIdx > -1){
                args.push(pathItems[pathItemIdx]);
            }
        }
        else{
            args.push(arg);
        }
    });
    return args;
}

function _deeplinking_checkHash(){
    var oldhref = deeplinker._href;
    var newhref = deeplinker._window.location.href;
    if(oldhref != newhref){
        deeplinker._href = newhref;
        var route = deeplinker.getRoute(newhref);
        if(route){
            deeplinker.route(route);
        }
        else if (deeplinker._defaultCallback){
            deeplinker._defaultCallback();
        }
    }
}

function _deeplinking_resolveCallback(callback, args){
    if(typeof callback == "function"){
        return function(){
            callback.apply(window,args);
        }
    }
    else if (typeof callback == "string"){
        return function(){
            eval(callback);
        }
    }
    else if (typeof callback == "object" && typeof callback.scope != "undefined"){
        return function(){
            callback.scope[callback.method].apply(callback.scope,args);
        }
    }
    else{
        return false;
    }
}

})(window);
(function(window){
    if(!window.utils){
        window.utils = {};
    }
    
    window.utils.forEach = function(arr, callback, context){
        if(!arr || arr.length == 0){return;}
        
        if(context){
            callback = utils.scope(context, callback);
        }
        
        if(callback){
            for(var idx = 0; idx < arr.length; idx++){
                callback(arr[idx],idx,arr);
            }
        }
    }
    
    window.utils.scope = function(context, method){
        if(!context || !method) {return false};
        if(typeof method == "function"){
            return function(){
                method.apply(context,arguments);
            }
        }
        else if(typeof method == "string" && context[method]){
            return function(){
                context[method].apply(context,arguments);
            }
        }
        else return false;
    }
    
    window.utils.indexOf = function(array,value,fromIndex,findLast){
        var step = 1, end = array.length || 0, i = 0;
        if(findLast){
                i = end - 1;
                step = end = -1;
        }
        if(fromIndex != undefined){i = fromIndex;}
        if((findLast && i > end) || i < end) {
                for(; i != end; i += step){
                        if(array[i] == value){return i;}
                }
        }
        return -1;
    }
    
    window.utils.lastIndexOf = function(array,value,fromIndex){
        return utils.indexOf(array, value, fromIndex, true);
    }
})(window);
