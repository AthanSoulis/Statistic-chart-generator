//This variable holds the Library state across the execution of the Chart Formation
var libraryType;
var port = "8080";
var domainName = "localhost";
var protocol = "http";

var domainLink = protocol+"://"+domainName+":"+port;
const DEBUGMODE = true;

function fetchChart(jsonData){
    $.getJSON(jsonData, handleAdminSideData)
    .done()
    .fail(()=>{console.log("Failed");})
    .always();
}

//Function for loading(= appending to the head) a JS file
function loadJS(url, afterLoadCallback){
    
    var fileref=document.createElement('script');
    var firstHeadTaginDOM = document.getElementsByTagName('head')[0];
    var callback = ()=>{
        if(DEBUGMODE)
            console.log("Library "+document.getElementsByTagName('head')[0].lastChild.getAttribute("src")+" about to be loaded!");
        afterLoadCallback();
    };

    fileref.onload = callback;
    fileref.onreadystatechange = callback;
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", url);
    
    firstHeadTaginDOM.appendChild(fileref);        
}

function getCompatibleGoogleChartsType(originalChartType)
{
    if(originalChartType === 'treemap')
        return 'TreeMap';

    return originalChartType;
}

//Callback that handles the data sent from the Admin part of the app
function handleAdminSideData(dataJSONobj)
{   
    // dataJSONobj holds the option-ready version of the JSON that will be passed to the Chart library,
    // along with the queries that must be passed to ChartDataFormatter and eventually to DBAccess
    if(DEBUGMODE)
        console.log("Admin data JSON", dataJSONobj);

    switch(dataJSONobj.library){
    case "GoogleCharts":
    {
        loadJS("https://www.gstatic.com/charts/loader.js",                 
        function(){            
            google.charts.load('current', {packages: ['corechart','treemap']});
            google.charts.setOnLoadCallback(function(){
                libraryType = dataJSONobj.library;
                
                var RequestInfoObj = new Object();
                //Pass the Chart library to ChartDataFormatter
                RequestInfoObj.library = dataJSONobj.library;
                RequestInfoObj.orderBy = dataJSONobj.orderBy;
                
                //Create ChartInfo Object Array
                RequestInfoObj.chartsInfo = [];
                //Create ChartInfo and pass the Chart data queries to ChartDataFormatter
                //along with the requested Chart type
                RequestInfoObj.chartsInfo = dataJSONobj.chartDescription.queriesInfo;

                passToChartDataFormatter(dataJSONobj,RequestInfoObj,
                            domainLink+"/chart");
            });            
        });
        break;
    }
    case "eCharts":
    {
        loadJS("https://cdn.bootcss.com/echarts/4.0.4/echarts-en.min.js",
        function(){

            //Hold the Library state
            libraryType = dataJSONobj.library;
            console.log("dataJSONobj: ", dataJSONobj);
            console.log("LibraryType: ", libraryType);

            var RequestInfoObj = new Object();
            //Pass the Chart library to ChartDataFormatter
            RequestInfoObj.library = dataJSONobj.library;
            RequestInfoObj.orderBy = dataJSONobj.orderBy;
            
            //Create ChartInfo Object Array
            RequestInfoObj.chartsInfo = [];

            //Create ChartInfo and pass the Chart data queries to ChartDataFormatter
            //along with the requested Chart type
            for (let index = 0; index < dataJSONobj.chartDescription.queries.length; index++) {
                
                var element = dataJSONobj.chartDescription.queries[index];
                var ChartInfoObj = new Object();

                if(element.type === undefined)
                    ChartInfoObj.type = dataJSONobj.chartDescription.series[index].type;
                else
                    ChartInfoObj.type = element.type;

                if(element.name === undefined)
                    ChartInfoObj.name = null;
                else
                    ChartInfoObj.name = element.name;

                ChartInfoObj.query = element.query;
                RequestInfoObj.chartsInfo.push(ChartInfoObj);   
            }

            passToChartDataFormatter(dataJSONobj,RequestInfoObj,domainLink+"/chart");
        });
        break;
    }
    case "HighCharts":
    {
                
        //Dynamically add JS library
        loadJS("//code.highcharts.com/highcharts.js",
        () => loadJS("//code.highcharts.com/highcharts-more.js",
        () => loadJS("//code.highcharts.com/modules/heatmap.js",
        () => loadJS("//code.highcharts.com/modules/treemap.js",
        () => loadJS("//code.highcharts.com/modules/drilldown.js",
        () => loadJS("//code.highcharts.com/modules/no-data-to-display.js",
        () => loadJS("//code.highcharts.com/highcharts-3d.js",
        () => loadJS("//code.highcharts.com/modules/exporting.js",
        () => loadJS("//code.highcharts.com/modules/offline-exporting.js",
        () => loadJS("//code.highcharts.com/modules/export-data.js",
        
        function(){ 
            //Hold the Library state
            libraryType = dataJSONobj.library;

            var RequestInfoObj = new Object();
            //Pass the Chart library to ChartDataFormatter
            RequestInfoObj.library = dataJSONobj.library;
            RequestInfoObj.orderBy = dataJSONobj.orderBy;
            //Pass the Chart type to ChartDataFormatter
            var defaultType = dataJSONobj.chartDescription.chart.type;
            //Create ChartInfo Object Array
            RequestInfoObj.chartsInfo = [];

            //Create ChartInfo and pass the Chart data queries to ChartDataFormatter
            //along with the requested Chart type
            dataJSONobj.chartDescription.queries.
            forEach(element => {
                var ChartInfoObj = new Object();

                if(element.type === undefined)
                    ChartInfoObj.type = defaultType;
                else
                    ChartInfoObj.type = element.type;

                if(element.name === undefined)
                    ChartInfoObj.name = null;
                else
                    ChartInfoObj.name = element.name;

                ChartInfoObj.query = element.query;
                RequestInfoObj.chartsInfo.push(ChartInfoObj);
            });

            passToChartDataFormatter(dataJSONobj,RequestInfoObj,
                        domainLink+"/chart");
        }
            
        ))))))))));
        
        break;
    }
    case "HighMaps":
    {
        loadJS("//code.highcharts.com/maps/highmaps.js",
        () => loadJS("//code.highcharts.com/modules/exporting.js",
        () => loadJS("//code.highcharts.com/modules/offline-exporting.js",
        () => loadJS("//code.highcharts.com/modules/export-data.js",
        function () {
            console.log("Incoming JSON",dataJSONobj);
            
            //Hold the Library state
            libraryType = dataJSONobj.library;

            var RequestInfoObj = new Object();
            //Pass the Chart library to ChartDataFormatter
            RequestInfoObj.library = dataJSONobj.library;
            //Create ChartInfo Object Array
            RequestInfoObj.chartsInfo = [];

            //Create ChartInfo and pass the Chart data queries to ChartDataFormatter
            dataJSONobj.mapDescription.queries.
            forEach(element => {
                var ChartInfoObj = new Object();

                if(element.name === undefined)
                    ChartInfoObj.name = null;
                else
                    ChartInfoObj.name = element.name;

                ChartInfoObj.query = element.query;
                RequestInfoObj.chartsInfo.push(ChartInfoObj);
            });
            passToChartDataFormatter(dataJSONobj,RequestInfoObj,
                domainLink+"/chart");
        }))));

        break;
    }
    default:
        if(DEBUGMODE)
            console.log("Unsupported Library: "+ dataJSONobj.library);
    }
}

//Post the admin-side json to the ChartDataFormatter
function passToChartDataFormatter(dataJSONobj,ChartDataFormatterReadyJSONobj,ChartDataFormatterUrl)
{
    if(DEBUGMODE) {
        console.log("Passing to CDF: ", ChartDataFormatterReadyJSONobj);
    }
    
    $.ajax(
    {url: this.ChartDataFormatterUrl,
    type: "POST",
    dataType: "json",
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(ChartDataFormatterReadyJSONobj),
    cache: false,
    success: function(data){ handleChartDataFormatterResponse(data,dataJSONobj,ChartDataFormatterReadyJSONobj) },
    error: function( jqXHR, textStatus, errorThrown) { 

        $('#loader').hide();
        if (jqXHR.status === 0) {
            $('#errorSpan').show().html('Not connected.\nPlease verify your network connection.');
        } else if (jqXHR.status == 404) {
            $('#errorSpan').show().html('The requested page not found.\nPlease try again or <a href="https://www.openaire.eu/support/helpdesk">contact us</a>, if the problem persists.');
        } else if (jqXHR.status == 500) {
            $('#errorSpan').show().html('Internal Server Error.\nPlease try again or <a href="https://www.openaire.eu/support/helpdesk">contact us</a>, if the problem persists.');
        } else if (jqXHR.status == 422) {
            $('#errorSpan').show().html('Unable to fetch data from the database.\nPlease try again or <a href="https://www.openaire.eu/support/helpdesk">contact us</a>, if the problem persists.');
        } else if (jqXHR.status == 504) {
            $('#errorSpan').show().html('Server took unusually too long to respond.\nPlease try again or <a href="https://www.openaire.eu/support/helpdesk">contact us</a>, if the problem persists.');
        }
        else {
            $('#errorSpan').show().html('An unexpected error has occurred [' + jqXHR.status + '].\nPlease try again or <a href="https://www.openaire.eu/support/helpdesk">contact us</a>, if the problem persists.');
        }

     }
    }).done()
    .fail() 
    .always();
}

function handleChartDataFormatterResponse(responseData, originalDataJSONobj, ChartDataFormatterReadyJSONobj)
{   
    if(DEBUGMODE) console.log("Got from CDF: ", responseData);
    
    
    //Hide children elements of container
    $("#container").children().remove();
    
    switch(libraryType) {
        case "HighCharts":
        {
            var chartJson = convertToValidHighchartJson(responseData, originalDataJSONobj);
            
            Highcharts.setOptions({
                lang: {
                    drillUpText: '<< Back'
                }
            })

            if(DEBUGMODE) {
                console.log("Final formed JSON", chartJson);
            }
            console.log("Drawing HighCharts");
            Highcharts.chart('container',chartJson);
            
            break;
        }
        case "HighMaps":
        {
            loadJS("//code.highcharts.com/mapdata/custom/world-robinson-highres.js",
            () => {
                
                mapJson = originalDataJSONobj.mapDescription;
                
                if(mapJson.zoomTo != null)
                {
                    // Add id to the [iso-a2, value] keys
                    mapJson.series[0].keys.push('id');
                    
                    // Append to the received data the iso-a2 value as id.
                    // mapData is now [iso-a2, value, id]
                    responseData.dataTable.forEach(mapData => {mapData.push(mapData[0]); });

                    // Assign the queried data to the highmaps ready Json
                    mapJson.series[0].data = responseData.dataTable;
                }
                
                if(DEBUGMODE) 
                    console.log("Drawing HighMaps", mapJson);

                var mapChart = Highcharts.mapChart('container',mapJson);
                
                if(mapJson.zoomTo != null && mapJson.zoomTo.destination != null)
                {
                    mapChart.get(mapJson.zoomTo.destination).zoomTo();
                    mapChart.mapZoom(mapJson.zoomTo.zoomValue);
                }
            });


            break;
        }
        case "GoogleCharts":
        {
            var data = fillGoogleChartsDataTable(responseData, originalDataJSONobj);
            if(DEBUGMODE) {
                console.log("Drawing GoogleCharts \nOptions | ChartType | Data", 
                    originalDataJSONobj.chartDescription.options, originalDataJSONobj.chartDescription.chartType, data);
            }
            
            const chartType = getCompatibleGoogleChartsType(originalDataJSONobj.chartDescription.chartType);

            var wrapper = new google.visualization.ChartWrapper({
                    chartType: chartType,
                    dataTable: data,
                    options: originalDataJSONobj.chartDescription.options,
                    containerId: 'container'
                });

            if(originalDataJSONobj.chartDescription.options.exporting) {

                google.visualization.events.addListener(wrapper, 'ready', function () {

                    // Create a DOM element that saves the chart
                    var buttonElement = document.createElement("button");
                    buttonElement.innerHTML = "Download as PNG";
                    buttonElement.style = "margin: auto;"
                    buttonElement.onclick = () => {
                        const element = document.createElement('a');
                        element.setAttribute('href', wrapper.getChart().getImageURI() );
                        element.setAttribute('download', 'chart.png');
                        element.style.display = 'none';
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                    }

                    const container = document.getElementById("container");
                    container.parentNode.insertBefore(buttonElement, container.nextSibling);
                });
            }

            wrapper.draw();
            break;
        }
        case "eCharts":
        {
            var chartJson = convertToValideChartsJson(responseData, originalDataJSONobj,ChartDataFormatterReadyJSONobj);

            if(DEBUGMODE) {
                console.log("chartJson", chartJson);
                console.log("Drawing eCharts");
            }

            var myChart = echarts.init(document.getElementById('container'));
            myChart.setOption(chartJson);

            break;
        }
        default:
            if(DEBUGMODE)
                console.error("How did it end up here: "+ libraryType);

    }

}

function fillGoogleChartsDataTable(responseData, originJson){

    var data = new google.visualization.DataTable();
    var dataColumns = responseData.columns;
    var columnsType = responseData.columnsType;
    const chartType = originJson.chartDescription.chartType;
    
    // datacolumns has the same size of columnsType PLUS a header column
    if(dataColumns.length > 0 && ( columnsType === null || ((columnsType !== null) && (dataColumns.length === (columnsType.length + 1))))){

        if(columnsType !== null) 
            originJson.chartDescription.options.series = new Array(columnsType.length);

        for(let index = 0; index < dataColumns.length; index++){
            if(index == 0)
            {
                // Column for the name of the Data entry
                data.addColumn('string', dataColumns[index]);

                // Added a column that represents the ID of the parent node in a TreeMap. 
                if(chartType === 'TreeMap')
                    data.addColumn('string', 'Parent')
            }
            else{
                // Column for the value of the Data entry
                data.addColumn('number', dataColumns[index]);
                if(columnsType !== null)
                    originJson.chartDescription.options.series[index-1] = {type: columnsType[index-1]};
            }
        }
        // Added a row for a Root element as a GoogleChart TreeMaps does not have more than one root nodes 
        if(chartType === 'TreeMap')
        {
            rootNode = ['Root', null];
            for (let index = 1; index < dataColumns.length; index++)
                rootNode.push(null);

            responseData.dataTable.forEach(row => { row.splice(1,0,'Root')});
            responseData.dataTable.splice(0,0,rootNode);
        }
        data.addRows(responseData.dataTable);
    }

    return data;
}

function convertToValidHighchartJson(responseData, originJson){

    var convertedJson = originJson.chartDescription;
    var seriesLength = Object.keys(responseData.series).length;

    if(convertedJson.series == null || convertedJson.series.length != seriesLength)
        convertedJson.series = new Array( seriesLength );

    for (let index = 0; index < seriesLength; index++){
        var seriesInstance = new Object();
	
        // Propagate if this data series will be stacking
        if(convertedJson.series[index] != null && convertedJson.series[index].stacking != null)
            seriesInstance.stacking = convertedJson.series[index].stacking;

        // Pass the data series name to the response data object
        if(responseData.dataSeriesNames !== null)
            seriesInstance.name = responseData.dataSeriesNames[index];
        
        // Pass the data series type to the response data object
        if(responseData.dataSeriesTypes !== null)
            seriesInstance.type = responseData.dataSeriesTypes[index];
        
        // Pass the data series color to the response data object
        if(seriesLength === Object.keys(originJson.chartDescription.queries).length) {
            if (originJson.chartDescription.queries[index].color)
                seriesInstance.color = originJson.chartDescription.queries[index].color;
        }

        if(seriesInstance.type == "treemap")
        {
            seriesInstance.data = [];
            for (let dataIndex = 0; dataIndex < responseData.series[index].data.length; dataIndex++) {

                var dataValue = responseData.series[index].data[dataIndex]
                var dataName = responseData.xAxis_categories[dataIndex];

                seriesInstance.data.push({ name: dataName, value: dataValue, colorValue: dataValue });
            }
        }
        else
        {
            seriesInstance.data = responseData.series[index].data;

            if(convertedJson.xAxis === undefined)
                convertedJson.xAxis = {};    
            convertedJson.xAxis.categories = responseData.xAxis_categories;
        }

        convertedJson.series[index] = seriesInstance;       
    }

    if(responseData.drilldown !== null){
        convertedJson.drilldown = new Object();
        convertedJson.drilldown.series = new Array( Object.keys(responseData.drilldown).length );

        for (let index = 0; index < Object.keys(responseData.drilldown).length; index++){
        
            convertedJson.drilldown.series[index] = new Object();
            convertedJson.drilldown.series[index].data = responseData.drilldown[index].data;
            convertedJson.drilldown.series[index].id = responseData.series[0].data[index].drilldown;
            convertedJson.drilldown.series[index].name = responseData.series[0].data[index].drilldown;
            // ! Hardcoded Selection that a drilldown is always a pie !
            // As of now drilldown is ONLY used in a pie-graph of a single series with a second group by
            convertedJson.drilldown.series[index].type = "pie";
        }
    }

    return convertedJson;
}

function convertToValideChartsJson(responseData, originJson, ChartDataFormatterReadyJSONobj) {

    console.log("ChartDataFormatterReadyJSONobj", ChartDataFormatterReadyJSONobj);
    console.log("OriginJson.chartDescription", originJson.chartDescription);

    var convertedJson = originJson.chartDescription;
    if (convertedJson.series == null)
        convertedJson.series = new Array( Object.keys(responseData.series).length );

    for (let index = 0; index < Object.keys(responseData.series).length; index++){
        if(convertedJson.series[index] == null)
            convertedJson.series[index] = new Object();
        
        var seriesInstance = convertedJson.series[index];

        if(responseData.dataSeriesNames !== null)
            seriesInstance.name = responseData.dataSeriesNames[index];

        if(seriesInstance.type == "treemap")
        {
            seriesInstance.data = [];
            for (let dataIndex = 0; dataIndex < responseData.series[index].data.length; dataIndex++) {

                var dataValue = responseData.series[index].data[dataIndex]
                var dataName = responseData.xAxis_categories[dataIndex];

                seriesInstance.data.push({ name: dataName, value: dataValue });
            }
        }
        else
            seriesInstance.data = responseData.series[index].data;

        if(Object.keys(responseData.series).length === Object.keys(originJson.chartDescription.queries).length)
            //TODO if (originJson.chartDescription.queries[index].color)
            seriesInstance.color = originJson.chartDescription.queries[index].color;

        convertedJson.series[index] = seriesInstance;
    }

    // in eCharts a column chart is a bar chart and a bar chart is a bar chart with the categories on yAxis
    if(convertedJson.series[0].type === 'bar') {
        convertedJson.yAxis = {data: responseData.xAxis_categories};
    } //remove xAxis and yAxis on pie and treemaps
    else if(convertedJson.series[0].type === 'pie' || convertedJson.series[0].type === 'treemap') {
        convertedJson.xAxis = null;
        convertedJson.yAxis = null;
    } else
        convertedJson.xAxis = {data: responseData.xAxis_categories};

    console.log("convertedJson", convertedJson);

    return convertedJson;
}
