




function ChatController($scope) {
    var socket = io.connect();
    var seriesOptions = [],
    seriesCounter = 0;
    var chart;
    createChart();

    $scope.stocks = [];
    console.log($scope.stocks)
    
    $scope.stock = '';
    
    socket.on('connect', function () {
        console.log('stocks' + $scope.stocks)
        $.each($scope.stocks, function(i, item) {
            addStock(item);
        });
    });
    
    socket.on('stock', function (stock) {
        addStock(stock);
    });
    
    socket.on('deleteStock', function (stock) {
        deleteStock(stock);
    });
    
    $scope.send = function send() {
        if ($scope.stocks.filter(function(e) { return e.code == $scope.stock.toUpperCase(); }).length == 0) {
            const stockName = $scope.stock.toUpperCase();
            console.log('Sending stock:', stockName);
            const site = 'https://www.quandl.com/api/v3/datasets/WIKI/'+$scope.stock+'/metadata.json?api_key=A-MudQvM2MVxvp7Tsm7M';
            $.getJSON(site, function (data) {
                var stockData = {
                  name: data.dataset.name.substr(0, data.dataset.name.indexOf('(')).trim(),
                  code: stockName
                };
                socket.emit('stock', stockData);
                $( ".errors" ).text("");
            }).fail(function() {
                $( ".errors" ).text("Uh oh! That stock code is invalid.");
            });
    
            $scope.stock = '';
            
        } else {
            $( ".errors" ).text("Whoops! That stock code is already on the graph!");
        };

    };
    
    $scope.sendDelete = function sendDelete(stock) {
      console.log('Deleting stock:', stock);
      socket.emit('deleteStock', stock);

    };
    
    function addStock(stock) {
        $scope.stocks.push(stock);
        $scope.$apply();
        console.log('adding stock to graph: ' + stock.code)
        const yearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0,10);
        const site = 'https://www.quandl.com/api/v3/datasets/WIKI/' + stock.code + '/data.json?start_date=' + yearAgo + '&column_index=4&order=asc&api_key=A-MudQvM2MVxvp7Tsm7M'
        console.log(site);
        $.getJSON(site, function (data) {
            if (data.hasOwnProperty('dataset_data')) {
                var stockData = [];
                $.each(data.dataset_data.data, function(i, item) {
                    stockData.push([
                        new Date(item[0]).getTime(),
                        item[1]
                        ]);
                });
                console.log(stockData)
                chart.addSeries({
                    id: stock.code,
                    name: stock.code,
                    data: stockData
                });     
            }
            
        });
    }
    
    function deleteStock(stock) {
        chart.get(stock).remove();	
        $scope.stocks = $.grep($scope.stocks, function(e){ 
             return e.code != stock; 
        });
        $scope.$apply();
    }
    

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
            }
        });
    }
    
    // $.each($scope.stocks, function (i, name) {
    
    //     $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=' + name.toLowerCase() + '-c.json&callback=?',    function (data) {
    
    //         seriesOptions[i] = {
    //             name: name,
    //             data: data
    //         };
    
    //         // As we're loading the data asynchronously, we don't know what order it will arrive. So
    //         // we keep a counter and create the chart when all the data is loaded.
    //         seriesCounter += 1;
    
    //         if (seriesCounter === $scope.stocks.length) {
    //             createChart();
    //         }
    //     });
    // });
    
    
    
}
