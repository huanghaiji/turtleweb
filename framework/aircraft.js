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

function queryparent(element, tagname, atrid, atrvalue) {
    tagname = tagname.toLocaleUpperCase();
    for (let p = element.parentElement; p; p = p.parentElement) {
        if (!atrid && p.tagName === tagname) {
            return p;
        }
        if (p.attributes[atrid] === atrvalue) {
            if (p.tagName === tagname) {
                return p;
            }
        }
    }
}

function aircraftOnRemove(element, apiName) {
    let lit = (element || document).querySelectorAll('[aircraftApiName]');
    for (let v of lit) {
        if (v['attributes']['aircraftApiName']?.value == apiName)
            v.remove();
    }
    apis[apiName]?.destory?.();
    delete apis[apiName];
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


const apis = {};
const aircraftHandle = new Map();
function createwindowAircraftPxy(k){
    const aircraftPxy = new Proxy(function () {
        for (let hand of aircraftHandle.get(k)){
            if (hand.isApi()) {
                return hand.do(...arguments);
            }
        }
    }, {
        get: (t, p) => {
            for (let hand of aircraftHandle.get(k)){
                if (hand.isApi()) {
                    let ff = hand.do;
                    let fp = ff[p];
                    return fp;
                }
            }
        }
    });
    return aircraftPxy;
}

function Aircraft(apiName, element, addmode) {
    let api = apis[apiName];
    if (!api) {
        api = apis[apiName] = {
            apiName: apiName,
            id: hashcodeValue(),
            global: {}
        };
    }
    let params = {};
    let jsUris = [];
    let replacepath = '';

    const aircraftApiName = 'aircraftApiName';
    const modespacearray = 'array';
    const modespaceoptforeachgonejs = "foreachgoneis";
    const events = {
        onjsclick: ['onclick', Function],
        onjscolspan: ['colspan', String],
        onjsid: ['id', String],
        onjssrc: ['src', String],
        "onjs-colspan": ['colspan', String],
        "onjs-id": ['id', String],
        "onjs-src": ['src', String],
        "onjs-class":['class',String]
    };

    jsUris.codes = [];


    function configreApiName(element) {
        element.setAttribute(aircraftApiName, apiName);
        return api;
    }

    //传入参数
    function set(key, value) {
        api[key] = value;
        return api;
    }
     //传入参数
    function entitySets(obj) {
        for (let k in obj) {
            api[k] = obj[k];
        }
        return api;
    }

    //序列化参数名
    function buildParamsKey() {
        return Object.keys(params).join(',')
    }
    //序列化参数值
    function buildParamsVlaue() {
        return Object.values(params)
    }

    function loadingAppend( path) {
        return new Promise((resolve, reject) => {
            replacepath = path.substring(0, path.lastIndexOf("/") + 1)
            qurGet(path, (codes) => {
                didAppend(codes, replacepath)
                resolve(codes)
            }, (error) => {
                reject(error)
            })
        })
    }

    function didAppend( codes, replacePath) {
        let div;
        if (typeof codes === "string") {
            div = document.createElement('div');
            codes = didReplacePath(codes, replacePath)
            div.innerHTML = codes;
        } else {
            div = codes;
        }
        api.global.window = window;
        didCodeNodes(element, div, undefined, undefined, addmode);
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
        //try {
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
        //} catch (e) {
        //    console.info('didFunctionContent', e);
        //}
    }

    function didReplacePath(str, path) {
        if (!path) {
            return str;
        }
        return str.replaceAll(/[^.]{1}[.][/]/g, (text) => {
            return text[0] + path
        })
    }

    let proxyglobal = []
    //初始化global全局变量；
    function initGlobalConfigre() {
        Object.keys(api.global).forEach((key) => {
            if (key !== api.id && key !== 'window') {
                if (!window[key]) {
                    window[key] = createwindowAircraftPxy(key);
                }
                if (proxyglobal.indexOf(key) == -1) {
                    proxyglobal.push(key);
                    let hand = {
                        isApi: () => {
                            return api === this;
                        },
                        do: api.global[key]
                    }
                    if (!aircraftHandle.has(key)) {
                        aircraftHandle.set(key,[]);
                    }
                    aircraftHandle.get(key).push(hand);
                }
                //proxyglobal.indexOf(api.global[key]) == -1 && (window[key] = new Proxy(
                //    typeof api.global[key] === 'function' ? function () { } :
                //        Array.isArray(api.global[key]) ? [] : {}, {
                //        get: () => {
                //            if (this == api)
                //                return api.global[key];
                //            return window[key];
                //        },
                //        set: (tot, p, v) => {
                //            if (this == api) {
                //                api.global[key][p] = v;
                //                return;
                //            }
                //            window[key](p, v);
                //        }
                //}));
            }
        });
    }
    //1，编译解释执行代码；2,执行代码
    function shiftNext() {
        jsUris.shift();
        if (jsUris.length != 0) {
            jsUris[0]();
            return;
        }
        didFunction(element,
            `try{
                (function(){${jsUris.codes.join(';')};}).call(api);
            }catch(e){
                console.info('shift code:',e);
            }`,
            undefined,
            undefined,
            false);
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


    //表层模型插入点；
    function addmodeOpt(element, newNode, opt) {
        if (opt === 'shift') {
            element.parentNode.insertBefore(newNode, element);
        } else if (opt == 'unshift') {
            element.parentNode.insertBefore(newNode, element.nextSibling);
        }else {
            element.appendChild(newNode);
        }
    }
    /**
     * 引擎层面应用格式为: <dom onjs=''/>
     */
    function didCodeNodes(element, codes, paramsKey, paramsVaue, runstate) {
        if (codes) {
            didCodeOnjs(element, codes, paramsKey, paramsVaue, runstate);

            //判断当前节点是否为数组模式，则不使用子标签代码；
            if (element.modescope == modespacearray) {
                return;
            }

            didCodeNodesChild(element, codes, paramsKey, paramsVaue, runstate)
        }
    }

    function didCodeOnjs(element, codes, paramsKey, paramsVaue, runstate) {
        !element.basicbuild && (element.basicbuild = codes);
        //不需要执行element的codeNode的子有代码；
        if (runstate !== modespaceoptforeachgonejs) {
            //运行element相关的js代码
            let block = (codes.attributes?.['onjs']?.value);
            if (block) {
                element.removeAttribute('onjs');
                didFunction(element, block, paramsKey, paramsVaue);
            }

            for (let key in events) {
                let block = (codes.attributes?.[key]?.value);
                if (block) {
                    element.removeAttribute(key);
                    if (events[key][1] == Function) {
                        element[events[key][0]] = function () {
                            didFunction(element, block, paramsKey, paramsVaue, false, arguments);
                        };
                    } else {
                        element.setAttribute(events[key][0], didFunction(element,block, paramsKey, paramsVaue, true));
                    }
                }
            }
        }
    }

    function didCodeNodesChild(element, codes, paramsKey, paramsVaue, runstate) {
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
                if (mode?.value == 'gone' ||mode?.value.startsWith('param')) {
                    continue;
                }
                loaderjscode('local', codeNode.textContent);
                continue;
            }
            let tagName = codeNode.tagName;
            if (tagName) {
                if (tagName !== 'NOSCRIPT') {
                    let block = (codeNode.attributes?.['onjsinit']?.value);
                    let iscreate = !block ? true : didFunction(element, block, paramsKey, paramsVaue, true);
                    if (iscreate) {
                        newNode = codeNode.cloneNode();
                        newNode.removeAttribute('onjsinit');
                        newNode.setAttribute(aircraftApiName, apiName);
                        addmodeOpt(element, newNode, runstate);
                        didCodeNodes(newNode, codeNode, paramsKey, paramsVaue);
                    }
                } else {
                    let noscriptId = codeNode.attributes['id'].value;
                    api['#' + noscriptId] = codeNode.textContent;
                }
            } else {
                newNode = codeNode.cloneNode();
                addmodeOpt(element, newNode, runstate);
                let textContent = codeNode.textContent;
                //only {{}} 1step;
                let bi = textContent.indexOf('{{');
                let ei = textContent.lastIndexOf('}}');
                if (bi < ei && bi != -1 && ei != -1) {
                    newNode.textContent = didFunctionContent(newNode.textContent, newNode, paramsKey, paramsVaue, '{{', '}}');
                }
            }
        }
    }

    /**
     * 使用层面应用格式为: api.foreach( this, gloabl, [],'defineKey')
     */
    function foreach(element, arr, paramName, styleid) {
        element.modescope = modespacearray;

        let codes = [element.basicbuild];
        params[paramName] = undefined;
        let paramsKey = buildParamsKey();
        function floop(handle) {
            for (let item of arr) {
                params[paramName] = item;
                handle();
            }
        };
        try {
            if (styleid) {
                codes = codes[0].querySelectorAll(`[styleid=${styleid}]`);
                floop(() => {
                    let pv = buildParamsVlaue();
                    codes.forEach((code) => {
                        let mapelementnode = code.cloneNode();
                        element.appendChild(mapelementnode);
                        didCodeNodes(mapelementnode, code, paramsKey, pv);
                    });
                });
            } else {
                floop(() => {
                    didCodeNodesChild(element, codes[0], paramsKey, buildParamsVlaue());
                })
            }
        } finally {
            delete params[paramName];
        }
    }
    /**
     * 应用层: api.cursor( this, {}, 'objkey','styleid',()=>{return o})
     * */
    function cursor(element, obj, paramName, styleid, windowconsole) {
        if (!styleid) {
            alert('cursor styleid is empty!.');
            return
        }
        //设置此标签为游标模式，其子标签不需要执行。
        element.modescope = modespacearray;
        //查找所有相关的styleid;
        let styleids = [];
        for (let sid of (typeof styleid === 'string' ? [styleid] : styleid)) {
            styleids.push(...element.basicbuild.querySelectorAll(`[styleid=${sid}]`));
        }
        //打开游标，并且获得一个游标结果，并且将产生的一个结果放入paramName中。
        try {
            let oi = Object.keys(obj);
            let oii = 0;
            while (oii < oi.length) {
                let datas = windowconsole.call(element, obj,oi[oii++]);
                let itors = [];
                for (let k in datas) {
                    datas[k]['class'] === 'aircraftItor' && itors.push(datas[k]);
                    datas[k]['cursorelement'] = element;
                }
                if (datas) {
                    params[paramName] = datas;
                    let pk = buildParamsKey();
                    let pv = buildParamsVlaue();
                    for (let code of styleids) {
                        let isnext = true;
                        while (isnext) {
                            isnext = false;
                            let mapelementnode = code.cloneNode();
                            element.appendChild(mapelementnode);
                            didCodeNodes(mapelementnode, code, pk, pv);
                            mapelementnode.modescope = modespacearray;
                            for (let da of itors) {
                                if (da.isNext) {
                                    da.isNext = false;
                                    isnext = true;
                                }
                            }
                        }
                    }
                }
            }
        } finally {
            delete params[paramName];
        }
    }

    function cursoritor(obj) {
        let itor = {};
        let i = 0;
        if (Array.isArray(obj)) {
            itor = {
                has: () => {
                   return i < obj.length;
                },
                peek: () => {
                    return obj[i];
                }
            };
        } else {
            let k = Object.keys(obj);
            itor = {
                has: () => {
                   return i < k.length;
                },
                peek: () => {
                    return obj[k[i]];
                }
            };
        }
        itor.isNext = false;
        itor.next = () => {
            i++;
            itor.isNext = (true && itor.has());
        };
        itor.class = 'aircraftItor';
        return itor;
    }


    api.didAppend = didAppend;
    api.loadingAppend = loadingAppend;
    api.foreach = foreach;
    api.cursor = cursor;
    api.cursoritor = cursoritor;
    api.initGlobalConfigre = initGlobalConfigre;
    api.configreApiName = configreApiName;
    api.set = set;
    api.entitySets = entitySets;
    return api;
}


const filterToolInserJscodes = ['livereload.js?', 'class reloadPlugin', '/framework/apivm.js', '/framework/aircraft.js']

const addmodeShift = 'shift';
const addmodeUnshift = 'unshift';
