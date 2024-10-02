function qurGet(url, success, error) {
    let exist = filterToolInserJscodes.find((value) => { return url.indexOf(value) != -1 })
    if (exist) {
        success && success('');
        return;
    }
    url.lastIndexOf(/[?](0,1)version/) === -1 && (url = url + "?version=" + Math.random().toString(36).substring(2));
    var xtp = new XMLHttpRequest();
    //--异步时，才有效
    xtp.onprogress = function (e) {
        e = e || event;
        console.info(url + " re " + e.loaded + "  of  " + e.total + " bytes");
    };
    xtp.onreadystatechange = function () {
        if (xtp.readyState === 4) {
            if (xtp.status === 200) {
                success && success(xtp.responseText);
            } else {
                error && error(xtp.status + "-" + xtp.responseText);
            }
            return;
        }
        if (xtp.readyState === 0) {
            xtp.timeout = 30 * 1000;
        }
    };
    xtp.open("GET", url, true);
    xtp.send();
    return xtp;
}

/**
 * 计算一个hashCode
 */
function hashcodeValue() {
    function simpleHash(input) {
        let hash = 0;
        if (input.length === 0) return hash;
        for (let i = 0; i < input.length; i++) {
            let char = input.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    function generateUUID(timestamp, randomNum) {
        let uuid = (timestamp * 10000_0000_0000_0000_0).toString(36) + randomNum.toString(36);
        return uuid;
    }
    // 使用函数
    let timestamp = Date.now();
    let randomNumber = Math.random();
    let combinedString = timestamp + '' + randomNumber;
    let uuid = generateUUID(timestamp, randomNumber);
    let hashValue = (uuid + randomNumber + timestamp + Math.abs(simpleHash(combinedString))).replaceAll(".", "_").toString(16);
    return hashValue;
}

function aircraftOnRemove(element, apiName) {
    let lit = (element || document).querySelectorAll('[aircraftApiName]');
    lit.forEach((v) => {
        if (v['attributes']['aircraftApiName']['value'] == apiName) {
            v.remove()
        }
    })
    //回收
    let api = undefined;
    Object.keys(window).forEach((key) => {
        if (key.startsWith("___aircraft___20241001")) {
            let handlers = window[key]?.handlers;
            if (handlers && handlers[apiName]) {
                api = handlers[apiName].api;
                delete handlers[apiName];
                if (Object.keys(handlers).length == 0) {
                    delete window[key];
                    delete window[key.substring('___aircraft___20241001'.length)]
                }
            }
        }
    })
    api?.['destory']?.();
}

function aircraftIsApiNameEmpty(element, apiName) {
    let lit = element.querySelectorAll('[aircraftApiName]');
    for (let i = 0, v;
        (v = lit[i]); i++) {
        if (v['attributes']['aircraftApiName']['value'] == apiName) {
            return false;
        }
    }
    return true;
}

function Aircraft(apiName, element,addmode) {
    let api = {
        apiName: apiName,
        id: hashcodeValue(),
        global: undefined
    };
    let params = {};
    let jsUris = [];
    let docmap = new Map();
    let codeControll = new Map();
    let replacepath = '';

    const breakCode = 'breakCode';
    const runCodesOffJsOpt = 'runCodesOffJs';
    const aircraftApiName = 'aircraftApiName';
    const events = {
        onjsclick: 'onclick'
    };
    const attributes = {
        jsid: 'id'
    };

    jsUris.codes = []

    function buildParamsKey() {
        return Object.keys(params).join(',')
    }

    function buildParamsVlaue() {
        return Object.values(params)
    }

    function loadingAppend(global, path) {
        return new Promise((resolve, reject) => {
            replacepath = path.substring(0, path.lastIndexOf("/") + 1)
            qurGet(path, (codes) => {
                didAppend(global, codes, replacepath)
                resolve(codes)
            }, (error) => {
                reject(error)
            })
        })
    }

    function didAppend(global, codes, replacePath) {
        let div;
        if (typeof codes === "string") {
            div = document.createElement('div');
            codes = didReplacePath(codes, replacePath)
            div.innerHTML = codes;
        } else {
            div = codes;
        }
        api.global =  global;
        api.global.window = window;
        didCodeNodes(element, div, undefined, undefined, addmode);
        docmap.clear();
        codeControll.clear();
        params = {};
    }

    function didFunction(element, block, paramsKey, paramsVaue, useResult, _arguments_) {
        if (paramsKey) {
            let f = new Function(
                `return function(
					${_arguments_ ? 'arguments,' : ''}
					api,
					global,
					${paramsKey}
					){
                        const window = api.global;
                        const self = api.global;
						${useResult ? 'return ' : ''}${block}
					}`
            )()
            return _arguments_ ? f.call(element, _arguments_, api, api.global, ...paramsVaue) :
                f.call(element, api, api.global, ...paramsVaue);
        } else {
            let f = new Function(
                `return function(
						${_arguments_ ? 'arguments,' : ''}
						api,
						global
						){
                            const window = api.global;
                             const self = api.global;
							${useResult ? 'return ' : ''}${block}
						}`
            )()
            return _arguments_ ? f.call(element, _arguments_, api, api.global) :
                f.call(element, api, api.global);
        }
    }

    function didFunctionContent(textContent, element, paramsKey, paramsVaue, objStartStr, objEndStr, fieldsymbols) {
        let bi = textContent.indexOf(objStartStr);
        let ei = textContent.lastIndexOf(objEndStr);
        if (bi < ei && bi != -1 && ei != -1) {
            let block = textContent.substring(bi + objStartStr.length, ei);
            if (fieldsymbols) {
                block = block.replaceAll(fieldsymbols, '.');
            }
            return textContent.substring(0, bi) +
                didFunction(element,
                    block,
                    paramsKey,
                    paramsVaue,
                    true) +
                textContent.substring(ei + objEndStr.length);
        }
    }

    function didReplacePath(str, path) {
        if (!path) {
            return str;
        }
        return str.replaceAll(/[^.]{1}[.][/]/g, (text) => {
            return text[0] + path
        })
    }

    function proxy(target, key, api) {
        if (target['___aircraft___20241001' + key] && target['___aircraft___20241001' + key].handlers[api.apiName]) {
            return;
        }
        if (!target[key]) {
            let handler = {
                get: (targetp, prop) => {
                    let keys = Object.keys(handlers);
                    let hk = keys.find((kn) => { return handlers[kn].is() })
                    return hk ? handlers[hk].get(targetp, prop): target[prop];
                }
            }
            target['___aircraft___20241001' + key] = { handlers: {} };
            //------------------
            //api.global[key].toString()，NOT；
            //
            if (typeof api.global[key] === 'function' || typeof api.global[key] === 'object') {
                target[key] = new Proxy(api.global[key], handler);
            }
        }

        let handlers = target['___aircraft___20241001'+key].handlers;
        let targetp = api.global[key];
        let sl = this;
        let handler = {
            is: () => {
                return new Function('handler','return this == handler.api').call(sl, handler);
            },
            get: (_o, prop) => {
                return targetp[prop];
            }
        }
        handler.api = api;
        handlers[api.apiName] = handler;
    }

    //编译解释执行代码；
    function shiftNext() {
        jsUris.shift();
        if (jsUris.length != 0) {
            jsUris[0]();
            return;
        }
        didFunction(element,
            globalScriptExcel(),
            undefined,
            undefined,
            false);
    }
    //执行代码；
    function globalScriptExcel() {
        return `(api.global[api.id]=function(){${jsUris.codes.join(';')};})();
                    (delete api.global[api.id]);`;
    }
    //初始化global全局变量；
    function initGlobalConfigre() {
        Object.keys(api.global).forEach((key) => {
            if (key !== api.id && key !== 'window') {
                proxy.call(api,api.global.window, key,api);
            }
            console.info(key, api.global);
        })
    }
    //组合代码；
    function loaderjscode(mode, jsbody) {
        if (mode === 'local') {
            let exist = filterToolInserJscodes.find((value) => { return jsbody.indexOf(value) != -1 })
            if (exist) {
                return
            }
        }
        let empty = jsUris.length == 0;
        if (mode === 'www') {
            jsUris.push(() => {
                qurGet(jsbody, (contentjs) => {
                    jsUris.codes.push('api.initGlobalConfigre();');
                    jsUris.codes.push(didReplacePath(contentjs, replacepath));
                    shiftNext();
                }, (e) => {
                    let jsurif = jsUris[0];
                    if (jsurif) {
                        let catchNum = jsurif.num = (jsurif.num || 0) + 1;
                        catchNum < 3 && jsurif?.();
                    } else {
                        alert('脚本下载尝试次数超限，下载失败,' + e);
                        jsUris.clear();
                    }
                });
            });
        } else if (mode === 'local') {
            jsUris.push(() => {
                jsUris.codes.push('api.initGlobalConfigre()');
                jsUris.codes.push(jsbody);
                shiftNext();
            });
        }
        empty && (jsUris[0]?.());
    }

    function addmodeOpt(element,newNode,opt) {
        if (opt === 'shift') {
            element.parentNode.insertBefore(newNode, element);
        } else {
            element.appendChild(newNode);
        }
    }
    /**
     * 引擎层面应用格式为: <dom onjs=''/>
     */
    function didCodeNodes(element, codes, paramsKey, paramsVaue, opt) {
        docmap.set(element, codes);

        if (codes) {
            //运行element相关的js代码
            if (opt != runCodesOffJsOpt) {
                let block = (codes.attributes?.['onjs']?.value);
                if (block) {
                    element.removeAttribute('onjs');
                    didFunction(element, block, paramsKey, paramsVaue);
                }
            }

            if (opt != runCodesOffJsOpt) {
                Object.keys(events).forEach((key) => {
                    let block = (codes.attributes?.[key]?.value);
                    if (block) {
                        element.removeAttribute(key);
                        element[events[key]] = function () {
                            didFunction(element, block, paramsKey, paramsVaue, false, arguments);
                        }
                    }
                })
                Object.keys(attributes).forEach((key) => {
                    if (element.attributes[key]) {
                        let dkey = attributes[key];
                        let block = (codes.attributes?.[dkey]?.value);
                        block && element.setAttribute(dkey, didFunctionContent(block, element, paramsKey, paramsVaue, '__', '__', '_'));
                    }
                });
            }

            for (let i = 0, codeNode, newNode; (codeNode = codes.childNodes[i]); i++) {
                let name = codeNode.nodeName;
                if (name === 'SCRIPT') {
                    if (codeNode.src) {
                        loaderjscode('www', codeNode.src);
                        continue;
                    }
                    let mode = codeNode.attributes['mode']
                    if (mode?.value == 'onjs') {
                        block = codeNode.textContent;
                        didFunction(element, block, paramsKey, paramsVaue);
                        continue;
                    }
                    if (mode?.value == 'on') {
                        let f = document.createElement('script')
                        f.textContent = `(function(){${codeNode.textContent}})();`;
                        f.setAttribute(aircraftApiName, apiName);
                        addmodeOpt(element, f, opt);
                        continue;
                    }
                    if (mode?.value == 'gone') {
                        continue;
                    }
                    if (mode?.value.startsWith('param')) {
                        continue;
                    }
                    loaderjscode('local', codeNode.textContent);
                    continue;
                }
                let tagName = codeNode.tagName;
                if (tagName) {
                    if (tagName !== 'NOSCRIPT') {
                        let block = (codeNode.attributes?.['onjscreate']?.value);
                        let iscreate = !block? true: didFunction(element, block, paramsKey, paramsVaue, true);
                        if (iscreate) {
                            newNode = codeNode.cloneNode();
                            newNode.setAttribute(aircraftApiName, apiName);
                            addmodeOpt(element, newNode, opt);
                            didCodeNodes(newNode, codeNode, paramsKey, paramsVaue);
                        }
                    } else {
                        let noscriptId = codeNode.attributes['id'].value;
                        api['#' + noscriptId] = codeNode.textContent;
                    }
                } else {
                    newNode = codeNode.cloneNode();
                    addmodeOpt(element, newNode, opt)
                    let textContent = codeNode.textContent;
                    let bi = textContent.indexOf('{{');
                    let ei = textContent.lastIndexOf('}}');
                    if (bi < ei && bi != -1 && ei != -1) {
                        newNode.textContent = didFunctionContent(newNode.textContent, newNode, paramsKey, paramsVaue, '{{', '}}');
                    }
                }
                let cmd = codeControll.get(codes);
                if (cmd === breakCode) {
                    break;
                }
            }

        }

        codeControll.delete(codes);
        docmap.delete(element, codes);
    }

    /**
     * 使用层面应用格式为: api.foreach( this, gloabl, [],'defineKey')
     */
    function foreach(element, arr, paramName) {
        let codeNode = docmap.get(element)

        params[paramName] = undefined
        let paramsKey = buildParamsKey()
        for (let i = 0, item;
            (item = arr[i]) != undefined; i++) {
            params[paramName] = item;
            didCodeNodes(element, codeNode, paramsKey, buildParamsVlaue(), runCodesOffJsOpt)
        }

        codeControll.set(codeNode, breakCode)
        delete params[paramName]
    }

    function parsefiledcode(code) {
        return didFunctionContent(code, element, 'api,global', [api, api.global], '__', '__', '_');
    }

    function configreApiName(element) {
        element.setAttribute(aircraftApiName, apiName);
        return api;
    }

    function set(key, value) {
        api[key] = value;
        return api;
    }

    api.didAppend = didAppend;
    api.loadingAppend = loadingAppend;
    api.foreach = foreach;
    api.parsefiledcode = parsefiledcode;
    api.initGlobalConfigre = initGlobalConfigre;
    api.configreApiName = configreApiName;
    api.set = set;
    return api;
}


const filterToolInserJscodes = ['livereload.js?', 'class reloadPlugin', '/framework/apivm.js', '/framework/aircraft.js']


/**
 * only main
 * */
const page = {};
