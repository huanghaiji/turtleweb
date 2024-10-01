require(['echarts'], function (echarts) {
    var option = {
        legend: {
            tooltip: {
                show: true,
                enterable: true
            }
        },
        tooltip: {
            trigger: 'axis',
            triggerOn: 'click',
            enterable: true,
            axisPointer: {
                type: 'cross'
            },
            formatter: function () {
                return '<button onclick="console.log(\'click\');window.ecClickSetOptionAxisChart.setOption({tooltip: {}});">click me</button>';
            }
        }
    };
    var baseTop = 90;
    var height = 150;
    var gap = 50;
    makeCategoryGrid(option, {
        grid: { top: baseTop, height: height },
        yAxis: {
            name: 'click show tip',
            tooltip: {
                show: true
            }
        }
    });
    baseTop += height + gap;

    var chart = createChart('click-setOption1', echarts, option, baseTop);
    window.ecClickSetOptionAxisChart = chart;
})

require([
    'echarts'
], function (echarts) {
    function genOption() {
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            xAxis: {},
            yAxis: {},
            series: [{
                type: 'scatter',
                data: [
                    [Math.random(), Math.random() * 100],
                    [Math.random(), Math.random() * 100],
                    [Math.random(), Math.random() * 100]
                ]
            }]
        };
    }

    var chart = echarts.init(document.getElementById('setOption2'));
    chart.setOption(genOption());

    setTimeout(function () {
        chart.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: 0
        });

        setTimeout(function () {
            // chart.clear();
            chart.dispose();

            chart = echarts.init(document.getElementById('setOption2'));

            chart.setOption(genOption());
        }, 2000)
    }, 100);
});

require(['echarts'], function (echarts) {
    var colors = ['red', 'blue'];
    var option = {
        color: colors,
        "tooltip": {
            "show": true
        },
        "xAxis": {
            "type": "category",
            "data": ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        "yAxis": {
        },
        "series": [{
            "data": [820, 932, 901, 934, 1290, 1330, 1320],
            "type": 'bar'
        }, {
            "data": [620, 532, 501, 734, 1090, 1130, 1220],
            "type": 'bar'
        }]
    };

    var myChart = testHelper.create(echarts, 'setOption3', {
        title: 'Click the blue bar, should no error throw',
        option: option
    });

    myChart.on('click', function (params) {
        myChart.clear();
        myChart.setOption({
            "tooltip": {
                "show": true
            },
            "xAxis": {
                "type": "category",
                "data": ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            "yAxis": {
            },
            "series": [{
                "data": [820, 932, 901, 934, 1290, 1330, 1320],
                "type": 'bar'
            }]
        });
    });
});
