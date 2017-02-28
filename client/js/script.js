




function ChatController($scope) {
    var socket = io.connect();
    var seriesOptions = [],
    seriesCounter = 0;
    var chart;

    $scope.stocks = ['MSFT', 'AAPL'];
    console.log($scope.stocks)
    
    $scope.stock = '';
    
    socket.on('connect', function () {
    });
    
    socket.on('stock', function (stock) {
      $scope.stocks.push(stock);
      $scope.$apply();
                chart.addSeries({
                name: stock,
                data: eval(stock)
            });

    });
    
    $scope.send = function send() {
      console.log('Sending stock:', $scope.stock);
      socket.emit('stock', $scope.stock);
      $scope.stock = '';

    };
    

    function createChart() {
    
        chart = Highcharts.stockChart('container', {
    
            rangeSelector: {
                selected: 4
            },
    
            yAxis: {
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
    
            plotOptions: {
                series: {
                    compare: 'percent',
                    showInNavigator: true
                }
            },
    
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2,
                split: true
            },
    
            series: seriesOptions
        });
    }
    
    $.each($scope.stocks, function (i, name) {
    
        $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=' + name.toLowerCase() + '-c.json&callback=?',    function (data) {
    
            seriesOptions[i] = {
                name: name,
                data: data
            };
    
            // As we're loading the data asynchronously, we don't know what order it will arrive. So
            // we keep a counter and create the chart when all the data is loaded.
            seriesCounter += 1;
    
            if (seriesCounter === $scope.stocks.length) {
                createChart();
            }
        });
    });
    
    
    
}
