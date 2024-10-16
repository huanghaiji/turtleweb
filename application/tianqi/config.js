
(function () {

    var params = {};
    var parts = location.search.slice(1).split('&');
    for (var i = 0; i < parts.length; ++i) {
        var kv = parts[i].split('=');
        params[kv[0]] = kv[1];
    }
    // Set default renderer in dev mode from hash.
    if (params.__RENDERER__) {
        window.__ECHARTS__DEFAULT__RENDERER__ = params.__RENDERER__;
    }
    if (params.__COARSE__POINTER__) {
        switch (params.__COARSE__POINTER__) {
            case 'true':
                window.__ECHARTS__COARSE__POINTER__ = true;
                break;

            case 'false':
                window.__ECHARTS__COARSE__POINTER__ = false;
                break;

            default:
                window.__ECHARTS__COARSE__POINTER__ = 'auto';
                break;
        }
    }
    if (params.__USE_DIRTY_RECT__) {
        window.__ECHARTS__DEFAULT__USE_DIRTY_RECT__ = params.__USE_DIRTY_RECT__ === 'true';
    }

    // Set echarts source code.
    var ecDistPath;
    if (params.__ECDIST__ && !params.__CASE_FRAME__) {
        ecDistPath = ({
            'webpack-req-ec': '../../echarts-boilerplate/echarts-webpack/dist/webpack-req-ec',
            'webpack-req-eclibec': '../../echarts-boilerplate/echarts-webpack/dist/webpack-req-eclibec',
            'webpackold-req-ec': '../../echarts-boilerplate/echarts-webpackold/dist/webpackold-req-ec',
            'webpackold-req-eclibec': '../../echarts-boilerplate/echarts-webpackold/dist/webpackold-req-eclibec'
        })[params.__ECDIST__];
        if (!ecDistPath) {
            // Version number
            ecDistPath = 'runTest/tmp/__version__/' + params.__ECDIST__ + '/echarts';
        }
    }
    if (!ecDistPath) {
        ecDistPath = './../../runtime/echarts';
    }

    console.info("require>>>", require);
    if (typeof require !== 'undefined') {
        console.info("require>>>config", require);
        require.config({
            paths: {
                'echarts': ecDistPath,
                'zrender': 'node_modules/zrender/dist/zrender',
                'ecStat': 'lib/ecStat.min',
                'ecSimpleTransform': 'lib/ecSimpleTransform',
                'ecSimpleOptionPlayer': 'lib/ecSimpleOptionPlayer',
                // 'ecStat': 'http://localhost:8001/echarts/echarts-stat/dist/ecStat',
                'geoJson': '../geoData/geoJson',
                'theme': '../theme',
                'data': 'data',
                'map': 'data/map',
                'i18n': '../i18n',
                'extension': '../dist/extension',
                'ssrClient': '../ssr/client/dist/index.js'
            }
        });
    }

    // Not let scrollbar affect page size.
    // It will AFFECT interaction in the automatic testing.
    if (typeof MutationObserver !== 'undefined') {
        // Must be set as soon as possible(before chart is created)
        var observer = new MutationObserver(function() {
            if (document.body) {
                document.body.style.cssText = 'overflow:overlay!important';
                observer.disconnect();
            }
        });
        observer.observe(document.documentElement, {childList: true});
    };
})();