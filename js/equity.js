$(function () {
  function deferSetup(fn) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(fn);
    } else {
      setTimeout(fn, 1);
    }
  }
  var queryParams = new URLSearchParams(location.search);
  var theme = queryParams.get("theme");
  var platform = document.body.getAttribute('data-platform');
  var numOfShares=JSON.parse($("#num_of_shares").text());
  var ttmEps=JSON.parse($("#ttm_eps").text());
  var companySlug = JSON.parse($("#company_url").text());
  var companyName = JSON.parse($("#company_name").text());
  var w52High = parseFloat(JSON.parse($("#w52_high").text()));
  var w52Low = parseFloat(JSON.parse($("#w52_low").text()));
  var chartColor = "#0059c1";
  var yearTab = $("#innertab .innertab__tab--is-active").attr("yearTab");
  try {
    var growthVal = JSON.parse($(`#growth_${yearTab}`).text());
  } catch (e) {}
  if (yearTab == "1m") {
    selectedTab = 1;
  } else if (yearTab == "ytd") {
    selectedTab = 0;
  } else {
    selectedTab = 2;
  }

  liveLatestPrice();

  // custom code for tabs
  $("#insight_tabs li:first-child").find("a").addClass("active");
  $("#insight_tabs li a").on("click", function (e) {
    var clickedItem = $(this).data("id");
    $("#insight_tabs a").removeClass("active");
    $(this).addClass("active");
    $(".insight_content .insight_tab_content").addClass("hidden");
    $(".insight_content .insight_tab_content#" + clickedItem).removeClass(
      "hidden"
    );
    footerUpdate(clickedItem);
    if (clickedItem === "revenue_mix") {
      loadGoogleCharts(drawChart);
    }
  });
  $(".insight_subtab a").on("click", function (e) {
    if (
      $(this).attr("data") != "most-bought" &&
      $(this).attr("data") != "most-watchlisted" &&
      $(this).attr("data") != "most-sip"
    ) {
      if ($(this).attr("data") == "news") {
        $(".footer_sec .main_logo, .footer_sec .view_detail").hide();
      } else {
        $(".footer_sec .main_logo").show();
      }
    }
  });
  // news collapse — non-critical, deferred per FRONTEND.md C13
  var maxStoryLength;
  if ($(window).width() <= 768) {
    maxStoryLength = 600;
  }
  else {
    maxStoryLength = 1300;
  }
  deferSetup(function () {
  $(".news-detail").hide();
  $("#news .news-content").on("click", function () {
    if ($(this).hasClass("open")) {
      $(this).removeClass("open");
      $(this).parents(".news-wrapper").find(".news-detail").hide();
      $(this)
        .parents(".news-wrapper")
        .find(".news-read-more svg")
        .css("transform", "rotate(0deg)");
      $(this).parents(".news-wrapper").find(".sub-title").show();
    } else {
      $(this)
        .parents(".news-wrapper")
        .find(".news-read-more svg")
        .css("transform", "rotate(-90deg)");
      $(this).parents(".news-wrapper").find(".news-detail").show();
      $(this).addClass("open");
      $(this).parents(".news-wrapper").find(".sub-title").hide();
      $(this).parents(".news-wrapper").find(".tr-contactinfo, .tr-signoff, .tr-desktop-part, .tr-advisory, title").remove();
      var newsStory = $(this)
        .parents(".news-wrapper")
        .find(".news-story")
        .html();
      var newsStoryLength = newsStory.length;
      if (newsStoryLength > maxStoryLength) {
        var newStr = newsStory
          .substring(0, maxStoryLength)
          .replaceAll("**", "<span class='bullet-point'></span>").replaceAll("<p><br></p>", "");
          $(".bullet-point").parents("p").addClass("bullet-list-item");
        $(this).parents(".news-wrapper").find(".news-story").show();
        $(this).parents(".news-wrapper").find(".news-story").html(newStr);
        var fullStory = $(this)
          .parents(".news-wrapper")
          .find(".full-story")
          .html();

        $(this)
          .parents(".news-wrapper")
          .find(".full-story")
          .html(
            fullStory.replaceAll("**", "<span class='bullet-point'></span>").replaceAll("<p><br></p>", "")
          );
          $(".bullet-point").parents("p").addClass("bullet-list-item");
        $(this).parents(".news-wrapper").find(".full-story").hide();
        $(this)
          .parents(".news-wrapper")
          .find(".news-story")
          .append(
            '<a href="javascript:void(0);" class="news-description-link read-more"> ...Read More</a>'
          );
        $(this).parents(".news-wrapper").find(".read-less").remove();
        $(this).parents(".news-wrapper").find(".news-story .read-more").prev('p').addClass('inline-item')
        $(this).parents(".news-wrapper").find('.tr-link').attr("target", "_blank");
      } else {
        $(this).parents(".news-wrapper").find(".full-story").hide();
        $(this)
          .parents(".news-wrapper")
          .find(".news-story")
          .html(
            newsStory.replaceAll("**", "<span class='bullet-point'></span>").replaceAll("<p><br></p>", "")
          );
          $(".bullet-point").parents("p").addClass("bullet-list-item");
          $(this).parents(".news-wrapper").find('.tr-link').attr("target", "_blank");
      }
    }
  });

  // news read more/less
  $("body").on("click", "#news .read-more", function () {
    $(this).parents(".news-wrapper").find(".news-story").hide();
    $(this).parents(".news-wrapper").find(".full-story").show();
    $(this)
      .parents(".news-wrapper")
      .find(".news-detail")
      .append(
        '<br/> <a href="javascript:void(0);" class="news-description-link read-less">Read Less</a>'
      );
    $(this).remove();
  });
  $("body").on("click", "#news .read-less", function () {
    $(this).parents(".news-wrapper").find(".news-story").show();
    $(this).parents(".news-wrapper").find(".full-story").hide();

    $(this)
      .parents(".news-wrapper")
      .find(".news-story")
      .append(
        '<a href="javascript:void(0);" class="news-description-link read-more"> ...Read More</a>'
      );
    $(this).remove();
  });
  }); // end deferSetup (news handlers)

  // financials yearly/quarterly toggle — deferred per FRONTEND.md C13
  deferSetup(function () {
    $("#results .quarters .quarterly").on("click", function () {
      $(this).addClass("active");
      $("#results .quarters .yearly").removeClass("active");
      $("#results .column_chart_wrapper #quarterly").removeClass("hidden");
      $("#results .column_chart_wrapper #yearly").addClass("hidden");
    });
    $("#results .quarters .yearly").on("click", function () {
      $(this).addClass("active");
      $("#results .quarters .quarterly").removeClass("active");
      $("#results .column_chart_wrapper #yearly").removeClass("hidden");
      $("#results .column_chart_wrapper #quarterly").addClass("hidden");
    });
  });

  //  revenue mix — Google Charts loads lazily on first tab open (FRONTEND.md C5)
  var googleChartsLoaded = false;
  var googleChartsLoading = false;
  var googleChartsCallbacks = [];
  var chartsDrawn = false;
  function loadGoogleCharts(callback) {
    if (googleChartsLoaded) {
      callback();
      return;
    }
    googleChartsCallbacks.push(callback);
    if (googleChartsLoading) return;
    googleChartsLoading = true;
    var s = document.createElement("script");
    s.src = "https://b2b.tijorifinance.com/static/javascript/vendor/gstatic/charts/loader.js";
    s.async = true;
    s.onload = function () {
      google.charts.load("current", { packages: ["corechart"] });
      google.charts.setOnLoadCallback(function () {
        googleChartsLoaded = true;
        googleChartsCallbacks.forEach(function (cb) { cb(); });
        googleChartsCallbacks = [];
      });
    };
    document.head.appendChild(s);
  }

  function drawChart() {
    if (chartsDrawn) return;
    var chartDataProduct = JSON.parse($("#pieChartProductData").text() || "null");
    var chartDataLocation = JSON.parse($("#pieChartLocationData").text() || "null");
    if (!chartDataProduct && !chartDataLocation) return;
    chartsDrawn = true;

    var chartHeight = 260;
    var chartWidth = 300;
    if ($(window).width() <= 768) {
      chartWidth = 250;
      chartHeight = 250;
    }
    if ($(window).width() <= 500) {
      chartHeight = 210;
    }
    var options = {
      title: "",
      pieSliceText: "none",
      pieSliceBorderColor: "transparent",
      width: chartWidth,
      height: chartHeight,
      chartArea: { width: "100%", height: "90%", left: -10 },
      legend: "none",
      titlePosition: "none",
      pieHole: 0.65,
      fontSize: "9",
      backgroundColor: { fill: "transparent" },
      colors: [
        "#0059c1",
        "#688ed9",
        "#9bb3e5",
        "#007bb6",
        "#008f7a",
        "#41ac9c",
        "#7fc7bc",
        "#aa95db",
        "#734fc3",
        "#F7DA74",
        "#9CEAED",
        "#9CD3A3",
        "#CE5E5A",
      ],
      tooltip: { isHtml: true, text: "value" },
    };

    if (chartDataProduct) {
      var dataTableProduct = new google.visualization.DataTable();
      dataTableProduct.addColumn("string", "value");
      dataTableProduct.addColumn("number", "percentage");
      for (var i = 0; i < chartDataProduct.length; i++) {
        dataTableProduct.addRow(chartDataProduct[i]);
      }
      var productChart = new google.visualization.PieChart(
        document.getElementById("piechartProduct")
      );
      productChart.draw(dataTableProduct, options);
      google.visualization.events.addListener(productChart, "onmouseover", function (e) {
        $("#product .inner_text").css("opacity", 0);
      });
      google.visualization.events.addListener(productChart, "onmouseout", function (e) {
        $("#product .inner_text").css("opacity", 1);
      });
      google.visualization.events.addListener(productChart, "select", function (e) {
        productChart.setSelection(null);
      });
    }

    if (chartDataLocation) {
      var dataTableLocation = new google.visualization.DataTable();
      dataTableLocation.addColumn("string", "value");
      dataTableLocation.addColumn("number", "percentage");
      for (var i = 0; i < chartDataLocation.length; i++) {
        dataTableLocation.addRow(chartDataLocation[i]);
      }
      var locationChart = new google.visualization.PieChart(
        document.getElementById("piechartLocation")
      );
      locationChart.draw(dataTableLocation, options);
      google.visualization.events.addListener(locationChart, "onmouseover", function (e) {
        $("#location .inner_text").css("opacity", 0);
      });
      google.visualization.events.addListener(locationChart, "onmouseout", function (e) {
        $("#location .inner_text").css("opacity", 1);
      });
      google.visualization.events.addListener(locationChart, "select", function (e) {
        locationChart.setSelection(null);
      });
    }
  }
  // overview tab get height of sections
  if ($(window).width() <= 768) {
    var upperSecHeight = $("#overview .sec-1").height() + 60;
    var priceChartHeightMobile =
      $(".z_widget_content").height() - upperSecHeight;
    if (priceChartHeightMobile > 300) {
      priceChartHeightMobile = 300;
    }
    if (priceChartHeightMobile < 150) {
      priceChartHeightMobile = 150;
    }
  }
  // for comma formatted highchart tootltip values
  var highchartsConfigured = false;
  function configureHighcharts() {
    if (highchartsConfigured) return;
    highchartsConfigured = true;
    Highcharts.setOptions({
      accessibility: { enabled: false },
      lang: {
        thousandsSep: ",",
        shortMonths: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
      time: {
        timezoneOffset: -5.5 * 60,
      },
    });
  }
  configureHighcharts();

  // price-chart
  var hasOverview = JSON.parse($("#hasOverview").text())
  var priceChartData = JSON.parse($("#priceChartData").text()) || [];
  var indexChartData = JSON.parse($("#indexChartData").text()) || [];
  var indexName = $("#price-chart").attr("index-name");
  var accordChartData = JSON.parse($("#accordChartData").text()) || [];
  var accordName = $("#price-chart").attr("accord-name");
  var volumeChartData = JSON.parse($("#volumeChartData").text()) || [];
  var delvPerc = JSON.parse($("#delvPerc").text());
  var volumeChartDataWeekly = JSON.parse($("#weekly_volume").text()) || [];
  var delvPercWeekly = JSON.parse($("#weekly_delv_perc").text());
  var volumeChartDataMonthly = JSON.parse($("#monthly_volume").text()) || [];
  var delvPercMonthly = JSON.parse($("#monthly_delv_perc").text()) || [];


  var volumeChartDataWeeklyTim = volumeChartDataWeekly.map((a) => a[0]);
  var priceChartDataWeekly = priceChartData.filter(function (a) {
    return volumeChartDataWeeklyTim.includes(a[0]);
  });

  var volumeChartDataMonthlyTim = volumeChartDataMonthly.map((a) => a[0]);
  var priceChartDataMonthly = priceChartData.filter(function (a) {
    return volumeChartDataMonthlyTim.includes(a[0]);
  });

  if(indexChartData != 0){
    var indexChartDataWeekly = indexChartData.filter(function (a) {
      return volumeChartDataWeeklyTim.includes(a[0]);
    });
    
    var indexChartDataMonthly = indexChartData.filter(function (a) {
      return volumeChartDataMonthlyTim.includes(a[0]);
    });
}

  var accordChartDataWeekly = accordChartData.filter(function (a) {
    return volumeChartDataWeeklyTim.includes(a[0]);
  });
  var accordChartDataMonthly = accordChartData.filter(function (a) {
    return volumeChartDataMonthlyTim.includes(a[0]);
  });

  var priceChartDataNew;
  var indexChartDataNew;
  var accordChartDataNew;

  updateIpoLabel();
  if(hasOverview){
  var priceChart = $("#price-chart").highcharts({
    navigator: { enabled: false },
    title: "",
    credits: { enabled: false },
    legend: {
      enabled: false,
    },
    time: {
      timezoneOffset: -5.5 * 60,
    },
    rangeSelector: {
      verticalAlign: "top",
      selected: selectedTab,
      enabled: true,
      inputEnabled: true,
      allButtonsEnabled: true,
      dropdown: false,
      buttons: [
        {
          type: "ytd",
          text: "ytd",
          dataGrouping: {
            units: [["day", [1]]],
          },
        },
        {
          type: "month",
          count: 1,
          text: "1m",
          dataGrouping: {
            units: [["day", [1]]],
          },
        },
        {
          type: "year",
          count: 1,
          text: "1y",
          dataGrouping: {
            units: [["day", [1]]],
          },
        },
        {
          type: "year",
          count: 3,
          text: "3y",
          dataGrouping: {
            units: [["week", [1]]],
          },
        },
        {
          type: "year",
          count: 5,
          text: "5y",
          dataGrouping: {
            units: [["month", [1]]],
          },
        },
      ],
    },

    xAxis: {
      type: "datetime",
      lineColor: "#e1e1e1",
      crosshair: {
        width: 1,
        color: "rgba(0,0,0,0.1)",
        dashStyle: "solid",
      },
      labels: {
        reserveSpace: true,
        formatter: function () {
          var time = new Highcharts.Time({
            timezoneOffset: -5.5 * 60,
          });
          if (yearTab == "1m") {
            return time.dateFormat("%e %b'%y", this.value);
          }
          return time.dateFormat("%b'%y", this.value);
        },
        style: {
          fontSize: "12px",
          color: "rgba(119, 117, 117, 0.80)",
          fontWeight: "500",
        },
      },

      startOnTick: false,
      tickPositioner: function () {
        var xMin = this.min;
        var xMax = this.max;
        var noofMonths = Math.floor((xMax - xMin) / (1000 * 60 * 60 * 24 * 30));
        var xData = this.series[0].processedXData;
        var positions = [];
        if (yearTab == "1m") {
          //1M
          xData.forEach(function (ts) {
            var dt = new Date(ts);
            if (dt.getDay() === 1) positions.push(ts);
          });
          return positions;
        }
        var labelMonths = [0, 3, 6, 9];
        if (noofMonths > 12) {
          labelMonths = [0];
        }
        if (noofMonths < 12) {
          labelMonths = new Array(12).fill(0).map(function (v, idx) {
            return idx;
          });
        }
        var prevts = 0;
        xData.forEach(function (ts) {
          var dt = new Date(ts);
          if (!prevts) {
            if (labelMonths.includes(dt.getMonth())) {
              positions.push(ts);
            }
          } else {
            var prevdt = new Date(prevts);
            if (
              prevdt.getMonth() !== dt.getMonth() &&
              labelMonths.includes(dt.getMonth())
            ) {
              positions.push(ts);
            }
          }
          prevts = ts;
        });
        return positions;
      },
      tickColor: ["dark", "black"].includes(theme) ? "#444" : "#ccd6eb",
      ordinal: true,
    },
    yAxis: [
      {
        // { primary y axis
        labels: {
          x: 20,
          formatter: function () {
            return this.value + "%";
          },
          style: {
            fontSize: "12px",
            color: "rgba(119, 117, 117, 0.80)",
            fontWeight: "500",
          },
        },
        title: {
          text: "Gain (%)",
          style: {
            fontSize: "12px",
          },
          align: "high",
          offset: 0,
          rotation: 0,
          y: -20,
          x: -48,
          reserveSpace: false,
        },
        opposite: true,
        minPadding: 0,
        maxPadding: 0,
        offset: -12,
      },
      {
        // Secondary yAxis for Volume
        title: {
          text: "Volume",
        },
        visible: false,
      },
      {
        // third yAxis for Delivery
        title: {
          text: "Delivery",
        },
        visible: false,
      },
    ],
    chart: {
      type: "line",
      height: 215,
      padding: 0,
      spacing: [0, -10, 0, 0],
      offset: 0,
      marginTop: 20,
      spacingTop: 0,
      backgroundColor: "transparent",
      events: {
        load: function () {
          var chartHeight = this.chartHeight;
          var labelHeight = $(".ipo-label").outerHeight() || 26;
          var bottomOffset = $(window).width() < 720 ? 37 : 40;
          var lineHeight = chartHeight - labelHeight - bottomOffset;
          $(".ipo-label").css("--ipo-line-height", lineHeight + "px");
        },
        // hiding delivery change series on resize also
        redraw: function (e) {
          if (priceChart) {
            priceChart.series[2].group.hide();
          }
        },
      },
    },
    tooltip: {
      split: false,
      shared: true,
      borderWidth: 0,
      padding: 0,
      outside: false,
      useHTML: true,
      shape: "rectangle",
      shadow: false,
      backgroundColor: ["dark", "black"].includes(theme) ? "#444" : "#fff",
      formatter: function () {
        var time = new Highcharts.Time({
          timezoneOffset: -5.5 * 60,
        });
        var xAxis = this.points[0].series.xAxis;
        var xMin = xAxis.min;
        var xMax = xAxis.max;
        var noofMonths = Math.floor((xMax - xMin) / (1000 * 60 * 60 * 24 * 30));
        var date = time.dateFormat("%e %b, %Y", this.x);
        var items = this.points.map(function (point, idx) {
          var name = point.series.name;
          var color = point.color;
          var value = point.y.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          });
          if (name == "Total Volume") {
            if (point.y >= 1000 || point.y < -1000) {
              var volumeValue = point.y / 1000;
              value = volumeValue.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              });
              value = value + "K";
            }
          }
          if (name == "Delivery %") {
            value = value + "%";
          } else {
            var perc = point.point.change;
            if (perc) {
              perc = perc.toLocaleString("en-IN", { maximumFractionDigits: 2 });
            }
          }
          var $name = `<div class="name"><span style="color:${color}">●</span>${name}</div>`;
          var $value = `<div ><b class="value">${value}</b><b class="perc">${
            perc ? `( ${perc}% )` : ""
          }</b></div>`;
          return `<li>${$name}${$value}</li>`;
        });
        var list = `<ul>${items.join("")}</ul>`;
        return `<div class="price_chart__tooltip"><p class="date">${date}</p>${list}</div>`;
      },
      distance: 16,
    },
    series: [
      {
        checkbox: { checked: true },
        data: priceChartData,
        color: chartColor,
        name: companyName,
      },
      {
        checkbox: { checked: true },
        data: volumeChartData,
        name: "Total Volume",
        type: "column",
        maxPointWidth: 10,
        minPointWidth: 2,
        color: ["dark", "black"].includes(theme) ? "#535f77" : "#bed3fd",
        yAxis: 1,
        compare: "none",
        borderWidth: 0,
      },
      {
        checkbox: { checked: true },
        data: delvPerc,
        name: "Delivery %",
        yAxis: 2,
        color: ["dark", "black"].includes(theme) ? "#535f77" : "#bed3fd",
      },
      {
        checkbox: { checked: false },
        data: indexChartData,
        color: "#3BB87A",
        name: indexName,
        visible: false,
      },
      {
        checkbox: { checked: false },
        data: accordChartData,
        color: "#ffcb48",
        name: accordName,
        visible: false,
      },
    ],
    plotOptions: {
      series: {
        marker: { enabled: false, symbol: "circle", radius: 3 },
        compare: "percent",
        states: {
          hover: {
            lineWidthPlus: 0,
            halo: { opacity: 0.1 },
          },
        },
      },
      column: {
        pointPadding: 0.3,
        groupPadding: 0,
        borderWidth: 0,
        pointRange: 0,
        pointPlacement: 'on'
      }
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 768,
          },

          chartOptions: {
            yAxis: [
              {
                title: {
                  margin: 5,
                },
              },
              {
                // second yAxis for Volume
                visible: false,
              },
              {
                // third yAxis for Delivery
                visible: false,
              },
            ],
            chart: {
              height: priceChartHeightMobile,
            },
          },
        },
      ],
    },
  });

  // chart checkboxes
  var tjiCheckBox =
    $("#overview .innertab-wrapper input[name='tji-checkbox']").attr("id") ||
    "0";
  var accordCheckBox =
    $("#overview .innertab-wrapper input[name='accord-checkbox']").attr("id") ||
    "0";
  var checkboxes = ["overviewCheck", "", "", tjiCheckBox, accordCheckBox];
  var priceChart = $("#price-chart").highcharts();
  checkBoxCount();
  $(checkboxes).each(function (i, elem) {
    var checkbox = document.getElementById(elem);
    $(checkbox).on("change", function () {
      priceChart.series[i].update({
        showInLegend: priceChart.series[i].legendItem ? false : true,
      });
      priceChart.series[i].setVisible();
      checkBoxCount();
      updateIpoLabel();
    });
  });
  }

  function checkBoxCount() {
    var numberOfChecked = $(".innertab-wrapper input:checkbox:checked").length;
    // if one Price chart checkboxes is enabled change the Yaxis unit
    if (numberOfChecked == 0) {
      priceChart.series[0].update({
        compare: "none", // Update the series to set comparison mode to 'none'
      });
      // show volume yaxis
      priceChart.yAxis[1].update({
        labels: {
          enabled: true,
        },
        title: {
          text: "Volume",
        },
      });

      // show volume column chart
      priceChart.series[1].setVisible(true);
      priceChart.update({
        chart: {
          type: "area",
        },
        yAxis: {
          labels: {
            formatter: function () {
              return this.value;
            },
            style: {
              fontSize: "12px",
              color: "rgba(119, 117, 117, 0.80)",
              fontWeight: "500",
            },
          },
          title: {
            text: "Price (₹)",
          },
        },
        plotOptions: {
          series: {
            tooltip: {
              pointFormatter: function () {
                if ($(window).width() <= 768) {
                  return (
                    '<span style="color:' +
                    this.color +
                    '">●</span> ' +
                    this.series.name +
                    ":<br/> &nbsp; &nbsp;<b>" +
                    Highcharts.numberFormat(this.y, 0)
                  );
                } else {
                  return (
                    '<span style="color:' +
                    this.color +
                    '">●</span> ' +
                    this.series.name +
                    ":<b>" +
                    Highcharts.numberFormat(this.y, 0)
                  );
                }
              },
            },
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, "rgba(0, 89, 193, 0.25)"],
                [1, "rgba(0, 89, 193, 0.01)"],
              ],
            },
          },
          area: {
            threshold: null,
          },
        },
      });
      priceChart.series[2].update({
        enableMouseTracking: true,
      });
    } else {
      priceChart.yAxis[0].setCompare("percent");
      // remove volume yaxis
      priceChart.yAxis[1].update({
        labels: {
          enabled: false,
        },
        title: {
          text: null,
        },
      });
      // remove volume column chart
      priceChart.series[1].setVisible(false, false);

      priceChart.update({
        chart: {
          type: "line",
        },
        yAxis: {
          labels: {
            formatter: function () {
              return this.value + "%";
            },
          },
          title: {
            text: "Gain (%)",
          },
        },
        plotOptions: {
          series: {
            tooltip: {
              pointFormatter: function () {
                if ($(window).width() <= 768) {
                  return (
                    '<span style="color:' +
                    this.color +
                    '">●</span> ' +
                    this.series.name +
                    ":<br/> &nbsp; &nbsp;<b>" +
                    Highcharts.numberFormat(this.y, 0) +
                    "</b> (" +
                    this.change.toFixed(2) +
                    "%)"
                  );
                } else {
                  return (
                    '<span style="color:' +
                    this.color +
                    '">●</span> ' +
                    this.series.name +
                    ":<b>" +
                    Highcharts.numberFormat(this.y, 0) +
                    "</b> (" +
                    this.change.toFixed(2) +
                    "%)"
                  );
                }
              },
            },
          },
        },
      });
      //hiding delivery change tooltip
      priceChart.series[2].update({
        enableMouseTracking: false,
      });
    }
    // delivery change
    priceChart.series[2].update({
      marker: {
        enabled: false,
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    });
    priceChart.series[2].group.hide();
  }

  function updateIpoLabel() {
    if (!priceChartData.length) return;
    if($(".innertab-wrapper input:checkbox:checked").length){
      $(".ipo-label").css("display", "none"); 
      return;     
    }
    var ipoTimestamp = priceChartData[0][0];
    var currentTimestamp = priceChartData[priceChartData.length - 1][0];
    var rangeStart;
    if (yearTab == "ytd") {
      var d = new Date(currentTimestamp);
      rangeStart = new Date(d.getFullYear(), 0, 1).getTime();
    } else if (yearTab == "1m") {
      rangeStart = currentTimestamp - (30 * 24 * 60 * 60 * 1000);
    } else if (yearTab == "1y") {
      rangeStart = currentTimestamp - (365 * 24 * 60 * 60 * 1000);
    } else if (yearTab == "3y") {
      rangeStart = currentTimestamp - (3 * 365 * 24 * 60 * 60 * 1000);
    } else if (yearTab == "5y") {
      rangeStart = currentTimestamp - (5 * 365 * 24 * 60 * 60 * 1000);
    } else {
      rangeStart = null;
    }
    if (rangeStart !== null && ipoTimestamp >= rangeStart) {
      $(".ipo-label").css("display", "inline-block");
    } else {
      $(".ipo-label").css("display", "none");
    }
  }

  // inner tab click function
  $(".innertab__tab").on("click", function () {
    yearTab = $(this).attr("yearTab");
    // update the sector growth value on Price chart year tab click
    growthVal = JSON.parse($(`#growth_${yearTab}`).text());
    if (growthVal) {
      $(".growth").html(growthVal + "<small>% </small>");
      $(".growth_yr").html("(" + yearTab + ")");
    } else {
      $(".growth").html("");
      $(".growth_yr").html("");
    }

    priceChart.rangeSelector.buttons.forEach(function (
      item,
      itemcoount,
      textStr
    ) {
      if (item.textStr == yearTab) {
        // condition to check chart data for different year tabs
        if (yearTab == "3y") {
          var volumeChartDataNew = volumeChartDataWeekly;
          var delvPercNew = delvPercWeekly;
          priceChartDataNew = priceChartDataWeekly;
          indexChartDataNew = indexChartDataWeekly;
          accordChartDataNew = accordChartDataWeekly;
        } else if (yearTab == "5y") {
          var volumeChartDataNew = volumeChartDataMonthly;
          var delvPercNew = delvPercMonthly;
          priceChartDataNew = priceChartDataMonthly;
          indexChartDataNew = indexChartDataMonthly;
          accordChartDataNew = accordChartDataMonthly;
        } else {
          var volumeChartDataNew = volumeChartData;
          var delvPercNew = delvPerc;
          priceChartDataNew = priceChartData;
          indexChartDataNew = indexChartData;
          accordChartDataNew = accordChartData;
        }
        // updating pricechart data point for price, volume, delivery, accord, and TJI
        priceChart.series[0].update(
          {
            data: priceChartDataNew,
          },
          true
        );
        priceChart.series[1].update(
          {
            data: volumeChartDataNew,
          },
          true
        );
        priceChart.series[2].update(
          {
            data: delvPercNew,
          },
          true
        );
        priceChart.series[3].update(
          {
            data: indexChartDataNew,
          },
          true
        );
        priceChart.series[4].update(
          {
            data: accordChartDataNew,
          },
          true
        );
        priceChart.rangeSelector.clickButton(itemcoount);
      }
    });
    $(this)
      .parent()
      .find(".innertab__tab--is-active")
      .removeClass("innertab__tab--is-active");
    $(this).addClass("innertab__tab--is-active");
    // update xAxis labels for 1M and 6M
    if (yearTab == "1m" || yearTab == "6m") {
      priceChart.update({ xAxis: { labels: { format: "{value:%e. %b}" } } });
    } else {
      priceChart.update({ xAxis: { labels: { format: "{value:%b '%y}" } } });
    }
    if (growthVal < 0) {
      $(".growth").addClass("negative");
    } else {
      $(".growth").removeClass("negative");
    }
    priceChart.series[2].group.hide();
    updateIpoLabel();
  });

  //updating growth value on page load
  if (growthVal) {
    $(".growth").html(growthVal + "<small>% </small>");
    $(".growth_yr").html("(" + yearTab + ")");
    if (growthVal < 0) {
      $(".growth").addClass("negative");
    } else {
      $(".growth").removeClass("negative");
    }
  }

  // revenue mix historic/latest tab
  $(".rmix_bottom_menu").on("click", ".menu_item", function () {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    var activeMenu = $(this).text();
    if (activeMenu == "Historic") {
      $(this)
        .parents(".insight_subtab_content")
        .find(".rmix_main_wrapper")
        .addClass("hidden");
      $(this)
        .parents(".insight_subtab_content")
        .find(".historic-chart-wrapper")
        .removeClass("hidden");
    } else {
      $(this)
        .parents(".insight_subtab_content")
        .find(".rmix_main_wrapper")
        .removeClass("hidden");
      $(this)
        .parents(".insight_subtab_content")
        .find(".historic-chart-wrapper")
        .addClass("hidden");
    }
  });

  // historic chart
  var historicChartData = $("#historicChartProductData").text();
  var historicChartLocationData = $("#historicChartLocationData").text();
  historicChart = Highcharts.chart("historic-chart-product", {
    title: "",
    navigator: { enabled: false },
    credits: { enabled: false },
    legend: {
      enabled: false,
    },
    style: {
      fontFamily: "Inter,sans-serif",
    },
    xAxis: {
      type: "datetime",
      crosshair: {
        width: 1,
        color: "gray",
        dashStyle: "shortdot",
      },
      area: {
        visible: true,
      },
      lang: {
        thousandsSep: ",",
      },
      labels: {
        format: "{value:%b '%y}",
        style: {
          fontSize: "10px",
        },
      },
      tickColor: ["dark", "black"].includes(theme) ? "#444" : "#ccd6eb",
    },
    yAxis: {
      labels: {
        format: "{value} km",
      },
      plotLines: [
        {
          value: 0,
          width: 2,
          color: "silver",
        },
      ],
    },
    plotOptions: {
      series: {
        fillOpacity: 1,
        connectNulls: true,
        showInNavigator: false,
        marker: {
          enabled: true,
          radius: 2,
          symbol: "circle",
        },
      },
    },
    tooltip: {
      useHTML: true,
      xDateFormat: "%b %Y",
      pointFormatter: function () {
        yy = Math.round(this.y * 100) / 100;
        if (this.change) {
          change = Math.round(this.change * 100) / 100;
          a =
            '<span style="color:' +
            this.color +
            '">●</span> <div class="tooltip-name">' +
            this.series.name +
            "</div>:<b>" +
            yy +
            "</b> (" +
            change +
            "%)";
        } else {
          a =
            '<span style="color:' +
            this.color +
            '">●</span> <div class="tooltip-name">' +
            this.series.name +
            "</div>:<b>" +
            yy +
            "%</b>";
        }
        return '<div class="tooltip-wrapper">' + a + "</div>";
      },
      split: true,
      outside: true,
      hideDelay: 0,
      borderWidth: 0,
      backgroundColor: ["dark", "black"].includes(theme) ? "#1f1f1f" : "#fff",
      style: {
        color: ["dark", "black"].includes(theme) ? "#C7C7C7" : "#000",
      },
    },
    colors: [
      "#0059c1",
      "#688ed9",
      "#9bb3e5",
      "#007bb6",
      "#008f7a",
      "#41ac9c",
      "#7fc7bc",
      "#4a78bb",
      "#01a77a",
      "#F7DA74",
      "#9CEAED",
      "#9CD3A3",
      "#CE5E5A",
    ],
    chart: {
      spacing: [0, 0, 0, 0],
      height: 210,
      animation: false,
      marginTop: 10,
      backgroundColor: "transparent",
    },
    yAxis: [
      {
        opposite: true,
        offset: 0,
        tickWidth: 0,
        tickLength: 0,
        lineWidth: 0,
        title: {
          text: null,
        },
        min: 0,
        max: 100,
        tickInterval: 25,
        labels: {
          formatter: function () {
            return this.value + "%";
          },
          style: {
            fontSize: "8px",
          },
        },
      },
    ],
  });

  historicChartLocation = Highcharts.chart("historic-chart-location", {
    title: "",
    navigator: { enabled: false },
    credits: { enabled: false },
    legend: {
      enabled: false,
    },
    style: {
      fontFamily: "Inter,sans-serif",
    },
    xAxis: {
      type: "datetime",
      crosshair: {
        width: 1,
        color: "gray",
        dashStyle: "shortdot",
      },
      area: {
        visible: true,
      },
      lang: {
        thousandsSep: ",",
      },
      labels: {
        format: "{value:%b '%y}",
        style: {
          fontSize: "10px",
        },
      },
      tickColor: ["dark", "black"].includes(theme) ? "#444" : "#ccd6eb",
    },
    yAxis: {
      labels: {
        format: "{value} km",
      },
      plotLines: [
        {
          value: 0,
          width: 2,
          color: "silver",
        },
      ],
    },
    plotOptions: {
      series: {
        fillOpacity: 1,
        connectNulls: true,
        showInNavigator: false,
        marker: {
          enabled: true,
          radius: 2,
          symbol: "circle",
        },
      },
    },
    tooltip: {
      useHTML: true,
      xDateFormat: "%b %Y",
      pointFormatter: function () {
        yy = Math.round(this.y * 100) / 100;
        if (this.change) {
          change = Math.round(this.change * 100) / 100;
          a =
            '<span style="color:' +
            this.color +
            '">●</span> <div class="tooltip-name">' +
            this.series.name +
            "</div>:<b>" +
            yy +
            "</b> (" +
            change +
            "%)";
        } else {
          a =
            '<span style="color:' +
            this.color +
            '">●</span> <div class="tooltip-name">' +
            this.series.name +
            "</div>:<b>" +
            yy +
            "%</b>";
        }
        return '<div class="tooltip-wrapper">' + a + "</div>";
      },
      split: true,
      outside: true,
      hideDelay: 0,
      borderWidth: 0,
      backgroundColor: ["dark", "black"].includes(theme) ? "#1f1f1f" : "#fff",
      style: {
        color: ["dark", "black"].includes(theme) ? "#C7C7C7" : "#000",
      },
    },
    colors: [
      "#0059c1",
      "#688ed9",
      "#9bb3e5",
      "#007bb6",
      "#008f7a",
      "#41ac9c",
      "#7fc7bc",
      "#4a78bb",
      "#01a77a",
      "#F7DA74",
      "#9CEAED",
      "#9CD3A3",
      "#CE5E5A",
    ],
    chart: {
      spacing: [0, 0, 0, 0],
      height: 210,
      animation: false,
      marginTop: 10,
      backgroundColor: "transparent",
    },
    yAxis: [
      {
        opposite: true,
        offset: 0,
        tickWidth: 0,
        tickLength: 0,
        lineWidth: 0,
        title: {
          text: null,
        },
        min: 0,
        max: 100,
        tickInterval: 25,
        labels: {
          formatter: function () {
            return this.value + "%";
          },
          style: {
            fontSize: "8px",
          },
        },
      },
    ],
  });

  // historic chart data
  $.each(JSON.parse(historicChartLocationData), function (key, value) {
    historicChartLocation.addSeries({
      name: value[0],
      data: value[1],
      type: "line",
    });
  });

  $.each(JSON.parse(historicChartData), function (key, value) {
    historicChart.addSeries({
      name: value[0],
      data: value[1],
      type: "line",
    });
  });

  // adding custom legend for historic chart
  $(historicChart.series).each(function (i, series) {
    $(
      '<li class="historic-legend-item list-unstyled" title="' +
        series.name +
        '"> <span class="legend_square" aria-hidden="true" style="background-color:' +
        series.color +
        ';"></span>' +
        series.name +
        "</li>"
    ).appendTo("#historic-chart-wrapper-product .custom-historic-legends");
  });

  // adding custom legend for historic chart
  $(historicChartLocation.series).each(function (i, series) {
    $(
      '<li class="historic-legend-item list-unstyled" title="' +
        series.name +
        '"> <span class="legend_square" aria-hidden="true" style="background-color:' +
        series.color +
        ';"></span>' +
        series.name +
        "</li>"
    ).appendTo("#historic-chart-wrapper-location .custom-historic-legends");
  });

  // custom code for subtabs
  $(".insight_subtab li:first-child").find("a").addClass("active");
  $(".insight_subtab a").on("click", function (e) {
    var clickedItem = $(this).attr("data");
    $(".insight_subtab a").removeClass("active");
    $(this).addClass("active");
    $(".insight_content .insight_subtab_content").addClass("hidden");
    $(".insight_content .insight_subtab_content#" + clickedItem).removeClass(
      "hidden"
    );
    var shareholdingsUrl = platform === 'web' ? 
      `https://www.tijorifinance.com/in/kite/login/?plan=free&redirect_to_page=https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2Fshareholding%2F&gcid=ZKiteFin&utm_source=KITEZ&utm_campaign=ZKiteFin` : 
      `kite://handshake?api_key=bs0qa76wo6muszlw&redirect_param=params%3D%7B%27plan%27%3A%20%27free%27%2C%20%27plan_type%27%3A%20None%2C%20%27redirect_to_tl%27%3A%20None%2C%20%27redirect_to_page%27%3A%20%27https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2Fshareholding%2F%27%2C%20%27section_name%27%3A%20None%7D%26action%3Dlogin`;

    var peersUrl = platform === 'web' ? 
      `https://www.tijorifinance.com/in/kite/login/?plan=free&redirect_to_page=https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2F&gcid=ZKiteFin&utm_source=KITEZ&utm_campaign=ZKiteFin&section_name=competitors` : 
      `kite://handshake?api_key=bs0qa76wo6muszlw&redirect_param=params%3D%7B%27plan%27%3A%20%27free%27%2C%20%27plan_type%27%3A%20None%2C%20%27redirect_to_tl%27%3A%20None%2C%20%27redirect_to_page%27%3A%20%27https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2F%27%2C%20%27section_name%27%3A%20%27competitors%27%7D%26action%3Dlogin`;

    var resultsUrl = platform === 'web' ? 
      `https://www.tijorifinance.com/in/kite/login/?plan=free&redirect_to_page=https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2Ffinancials%2F&gcid=ZKiteFin&utm_source=KITEZ&utm_campaign=ZKiteFin&section_name=quarterly_results` : 
      `kite://handshake?api_key=bs0qa76wo6muszlw&redirect_param=params%3D%7B%27plan%27%3A%20%27free%27%2C%20%27plan_type%27%3A%20None%2C%20%27redirect_to_tl%27%3A%20None%2C%20%27redirect_to_page%27%3A%20%27https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2Ffinancials%2F%27%2C%20%27section_name%27%3A%20%27quarterly_results%27%7D%26action%3Dlogin`;

    if (clickedItem == "shareholdings") {
      $(".view_detail a")
        .html(
          "View more info <img src='https://b2b.tijorifinance.com/static/images/zerodha/arrow-circle-left.png' alt='' width='20' height='20' loading='lazy' decoding='async'>"
        )
        .attr("href", shareholdingsUrl);
    }
    if (clickedItem == "peers") {
      $(".view_detail a")
        .html(
          "View more info <img src='https://b2b.tijorifinance.com/static/images/zerodha/arrow-circle-left.png' alt='' width='20' height='20' loading='lazy' decoding='async'>"
        )
        .attr("href", peersUrl);
    }
    if (clickedItem == "results") {
      $(".view_detail a")
        .html(
          "View more info <img src='https://b2b.tijorifinance.com/static/images/zerodha/arrow-circle-left.png' alt='' width='20' height='20' loading='lazy' decoding='async'>"
        )
        .attr("href", resultsUrl);
    }
  });

  $("#insight_tabs a").on("click", function (e) {
    var clickedTab = $(this).data("id");
    $(`#${clickedTab} .insight_subtab li:first-child a`).click();
  });

  // making corporate actions tab active if #corporate-actions is passed to the url
  var hash = window.location.hash;
  if (hash == "#corporate-actions") {
    $("#insight_tabs a[data-id='events']").click();
  }

  var quarterlyData = JSON.parse($("#quarterlyData").text());
  var yearlyData = JSON.parse($("#yearlyData").text());
  var revenueData = [];
  var profitData = [];
  var endDate = [];

  var revenueDataYearly = [];
  var profitDataYearly = [];
  var debtDataYearly = [];
  var endDateYearly = [];
  var showDebtLegend = true;
  var showRevenueLegend = true;

  $(quarterlyData).each(function (i, value) {
    revenueData.push(value.revenue);
    profitData.push(value.profit);
    endDate.push(value.date_end);
  });

  $(yearlyData).each(function (i, value) {
    revenueDataYearly.push(value.net_sales);
    profitDataYearly.push(value.consolidated_netprofit);
    debtDataYearly.push(value.debt);
    endDateYearly.push(value.year_end);
  });
  if (
    revenueDataYearly[0] === null &&
    revenueDataYearly[1] === null &&
    revenueDataYearly[2] === null
  ) {
    showRevenueLegend = false;
  } else {
    showRevenueLegend = true;
  }

  if (
    debtDataYearly[0] === null &&
    debtDataYearly[1] === null &&
    debtDataYearly[2] === null
  ) {
    showDebtLegend = false;
  } else {
    showDebtLegend = true;
  }

  if (quarterlyData) {
    //   financials results chart
    Highcharts.chart("quarterly_chart", {
      title: "",
      navigator: { enabled: false },
      rangeSelector: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      scrollbar: {
        enabled: false,
      },
      chart: {
        type: "column",
        height: "250",
        marginTop: 60,
        marginLeft: 0,
        marginRight: 0,
        backgroundColor: "transparent",
      },

      xAxis: {
        crosshair: false,
        categories: endDate,
        labels: {
          y: 30,
        },
      },
      yAxis: {
        lineWidth: 1,
        title: "",
        labels: {
          enabled: false,
          visible: false,
        },
        gridLineWidth: 0,
      },
      colors: ["#3BB87A", "#0059c1"],
      tooltip: {
        enabled: false,
      },
      legend: {
        symbolHeight: 14,
        symbolWidth: 14,
        symbolRadius: 3,
        align: "right",
        verticalAlign: "top",
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          states: {
            inactive: {
              enabled: false,
            },
          },
        },
        series: {
          pointWidth: 39,
        },
      },
      series: [
        {
          name: "Revenue (Cr)",
          data: revenueData,
          dataLabels: {
            enabled: true,
            crop: false,
            overflow: "none",
            formatter: function () {
              if (this.y > 100 || this.y < -100) {
                return this.y.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                });
              } else {
                return this.y.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                });
              }
            },
            style: {
              textOutline: "none",
            },
          },
        },
        {
          name: "Profit (Cr)",
          data: profitData,
          dataLabels: {
            enabled: true,
            crop: false,
            overflow: "none",
            formatter: function () {
              if (this.y > 100 || this.y < -100) {
                return this.y.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                });
              } else {
                return this.y.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                });
              }
            },
            style: {
              textOutline: "none",
            },
          },
        },
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 540,
            },
            chartOptions: {
              chart: {
                marginLeft: -10,
                marginRight: -10,
              },
              legend: {
                align: "center",
                verticalAlign: "bottom",
                layout: "horizontal",
                itemMarginBottom: 0,
                itemMarginTop: 0,
                symbolHeight: 10,
                symbolWidth: 10,
              },
              yAxis: {
                lineWidth: 0,
              },
              plotOptions: {
                column: {
                  pointWidth: 14,
                },
              },
            },
          },
        ],
      },
    });
    if (profitData[0] < 0 || profitData[1] < 0 || profitData[2] < 0) {
      var quarterChart = $("#quarterly_chart").highcharts();
      quarterChart.update({ xAxis: { offset: 15 } });
    }
  }

  try{
    if (yearlyData) {
      Highcharts.chart("yearly_chart", {
        title: "",
        navigator: { enabled: false },
        rangeSelector: {
          enabled: false,
        },
        credits: {
          enabled: false,
        },
        scrollbar: {
          enabled: false,
        },
        chart: {
          type: "column",
          height: "250",
          marginTop: 60,
          marginLeft: 0,
          marginRight: 0,
          backgroundColor: "transparent",
        },

        xAxis: {
          crosshair: false,
          categories: endDateYearly,
          labels: {
            y: 30,
          },
        },
        yAxis: {
          lineWidth: 1,
          title: "",
          labels: {
            enabled: false,
          },
          gridLineWidth: 0,
          visible: false,
        },
        colors: ["#3BB87A", "#0059c1", "#ffcb48"],
        tooltip: {
          enabled: false,
        },
        legend: {
          symbolHeight: 14,
          symbolWidth: 14,
          symbolRadius: 3,
          align: "right",
          verticalAlign: "top",
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
            states: {
              inactive: {
                enabled: false,
              },
            },
          },
        },
        series: [
          {
            name: "Revenue (Cr)",
            data: revenueDataYearly,
            showInLegend: showRevenueLegend,
            dataLabels: {
              enabled: true,
              crop: false,
              overflow: "none",
              formatter: function () {
                if (this.y > 100 || this.y < -100) {
                  return this.y.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  });
                } else {
                  return this.y.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  });
                }
              },
              style: {
                textOutline: "none",
              },
            },
          },
          {
            name: "Profit (Cr)",
            data: profitDataYearly,
            dataLabels: {
              enabled: true,
              crop: false,
              overflow: "none",
              formatter: function () {
                if (this.y > 100 || this.y < -100) {
                  return this.y.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  });
                } else {
                  return this.y.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  });
                }
              },
              style: {
                textOutline: "none",
              },
            },
          },
          {
            name: "Debt (Cr)",
            data: debtDataYearly,
            showInLegend: showDebtLegend,
            dataLabels: {
              enabled: true,
              crop: false,
              overflow: "none",
              formatter: function () {
                if (this.y > 100 || this.y < -100) {
                  return this.y.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  });
                } else {
                  return this.y.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  });
                }
              },
              style: {
                textOutline: "none",
              },
            },
          },
        ],
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 540,
              },
              chartOptions: {
                chart: {
                  marginLeft: -10,
                  marginRight: -10,
                },
                legend: {
                  align: "center",
                  verticalAlign: "bottom",
                  layout: "horizontal",
                  itemMarginBottom: 0,
                  itemMarginTop: 0,
                  symbolHeight: 10,
                  symbolWidth: 10,
                },
                yAxis: {
                  lineWidth: 0,
                },
                plotOptions: {
                  column: {
                    pointWidth: 14,
                  },
                },
              },
            },
          ],
        },
      });

      if (
        profitDataYearly[0] < 0 ||
        profitDataYearly[1] < 0 ||
        profitDataYearly[2] < 0
      ) {
        var yearChart = $("#yearly_chart").highcharts();
        yearChart.update({ xAxis: { offset: 15 } });
      }
    }
  }
  catch (error) {}
  if ($(window).width() < 540) {
    $("#swipe-tab-content").swipe({
      //Generic swipe handler for all directions
      swipe: function (
        event,
        direction,
        distance,
        duration,
        fingerCount,
        fingerData
      ) {
        // prevent swipe if swiped inside these containers
        if (
          $(event.target).parents(".historic-chart-wrapper").length ||
          $(event.target).parents(".highcharts-container ").length ||  $(event.target).parents("#news table").length
        ) {
          return;
        }

        try {
          historicChart.pointer.reset();
          historicChartLocation.pointer.reset();
        } catch (error) {}

        var nextItem;
        if (direction == "left") {
          if ($("#insight_tabs li a.active").parents("li").next().length) {
            nextItem = $("#insight_tabs li a.active")
              .parents("li")
              .next()
              .find("a");
            onScrollActiveTab(nextItem);
          } else {
            return false;
          }
        }
        if (direction == "right") {
          if ($("#insight_tabs li a.active").parents("li").prev().length) {
            nextItem = $("#insight_tabs li a.active")
              .parents("li")
              .prev()
              .find("a");
            onScrollActiveTab(nextItem);
          } else {
            return false;
          }
        }
      },
      allowPageScroll: "vertical",
    });
  }

  function onScrollActiveTab(nextItem) {
    $(".z_widget_wrapper #insight_tabs li a").removeClass("active");
    nextItem.addClass("active");
    var clickedItem = nextItem.data("id");

    $(".insight_content .insight_tab_content").addClass("hidden");
    $(".insight_content .insight_tab_content#" + clickedItem).removeClass(
      "hidden"
    );

    var clickedTab = $(nextItem).data("id");
    if (clickedTab == "events") {
      $(`#${clickedTab} .insight_subtab li a[data='corporateActions']`).click();
    } else {
      $(`#${clickedTab} .insight_subtab li:first-child a`).click();
    }

    footerUpdate(clickedItem);
  }

  // small case show-more/show less
  $(".show-button.show-more").on("click", function () {
    $(this).addClass("hidden");
    $(".show-button.show-less").removeClass("hidden");
    $(".smallcase-stocks a").removeClass("hidden");
  });
  $(".show-button.show-less").on("click", function () {
    $(this).addClass("hidden");
    $(".show-button.show-more").removeClass("hidden");
    $(".smallcase-stocks a.collapse-item").addClass("hidden");
  });

  function formatRoundoff(value) {
    if (value > 100) {
      return Math.round(value).toLocaleString("en-IN");
    }
    return value.toFixed(2);
  }

  // function to get live price data from zerodha
  function liveLatestPrice() {
    var pmOrigins = [];
    try {
      pmOrigins = JSON.parse($("#pm_origins").text());
      if (pmOrigins) {
        pmOrigins = pmOrigins.split(",");
      }
    } catch (error) {
      console.log(error);
    }
    $(window).on("message", function (e) {
      if (!pmOrigins || pmOrigins.includes(e.originalEvent.origin)) {
        try {
          var price = parseFloat(e.originalEvent.data.last_price);
          if (isNaN(price)) return;
          $(".ltp_value .value").text(price.toFixed(2));
          if(ttmEps && !isNaN(Number(ttmEps)) && Number(ttmEps)>0){
            let pe=price.toFixed(2)/ttmEps;
            if(pe > 100){
              $(".pe_value").text(`${Number(pe.toFixed(0)).toLocaleString("en-IN")}`);
            }
            else{
              $(".pe_value").text(`${Number(pe.toFixed(2)).toLocaleString("en-IN")}`);
            }
          }

          if(numOfShares && !isNaN(Number(numOfShares))){
            let mcapCr=price.toFixed(2)*numOfShares/10000000;
            if(mcapCr>100){
              $(".mcap_value").text(`₹${Number(mcapCr.toFixed(0)).toLocaleString("en-IN")} Cr.`);
            }
            else{
              $(".mcap_value").text(`₹${Number(mcapCr.toFixed(2)).toLocaleString("en-IN")} Cr.`);
            }
          }

          if (price > w52High) {
            w52High = price;
            $(".overview_slider_val.high .val").text(formatRoundoff(w52High));
          }
          if (price < w52Low) {
            w52Low = price;
            $(".overview_slider_val.low .val").text(formatRoundoff(w52Low));
          }
          var range = w52High - w52Low;
          var left = range > 0 ? ((price - w52Low) / range) * 100 : 50;
          left = Math.min(Math.max(left, 0), 100);
          $(".overview_slider_scale .overview_slider_val").css("left", left + "%");
        } catch (error) {}
      }
    });
  }

  // function to update footer section on tab click
  function footerUpdate(clickedItem) {
    let financialsUrl = platform === 'web' ?
      `https://www.tijorifinance.com/in/kite/login/?plan=free&redirect_to_page=https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2F&gcid=ZKiteFin&utm_source=KITEZ&utm_campaign=ZKiteFin&section_name=quarterly_results` :
      `kite://handshake?api_key=bs0qa76wo6muszlw&redirect_param=params%3D%7B%27plan%27%3A%20%27free%27%2C%20%27plan_type%27%3A%20None%2C%20%27redirect_to_tl%27%3A%20None%2C%20%27redirect_to_page%27%3A%20%27https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2Ffinancials%2F%27%2C%20%27section_name%27%3A%20%27quarterly_results%27%7D%26action%3Dlogin`;

    let revenueMixUrl = platform === 'web' ?
      `https://www.tijorifinance.com/in/kite/login/?plan=free&redirect_to_page=https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2F&gcid=ZkiteRmix&utm_source=KITEZ&utm_campaign=ZkiteRmix&section_name=revenuemix` :
      `kite://handshake?api_key=bs0qa76wo6muszlw&redirect_param=params%3D%7B%27plan%27%3A%20%27free%27%2C%20%27plan_type%27%3A%20None%2C%20%27redirect_to_tl%27%3A%20None%2C%20%27redirect_to_page%27%3A%20%27https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2F%27%2C%20%27section_name%27%3A%20%27revenuemix%27%7D%26action%3Dlogin`;

    let overviewUrl = platform === 'web' ?
      `https://www.tijorifinance.com/in/kite/login/?plan=free&redirect_to_page=https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2F&gcid=Zkiteoverview&utm_source=KITEZ&utm_campaign=Zkiteoverview` :
      `kite://handshake?api_key=bs0qa76wo6muszlw&redirect_param=params%3D%7B%27plan%27%3A%20%27free%27%2C%20%27plan_type%27%3A%20None%2C%20%27redirect_to_tl%27%3A%20None%2C%20%27redirect_to_page%27%3A%20%27https%3A%2F%2Fwww.tijorifinance.com%2Fcompany%2F${companySlug}%2F%27%2C%20%27section_name%27%3A%20None%7D%26action%3Dlogin`;
    
    if (clickedItem == "financials") {
      $(".view_detail a")
        .html(
          "View more info <img src='https://b2b.tijorifinance.com/static/images/zerodha/arrow-circle-left.png' alt='' width='20' height='20' loading='lazy' decoding='async'>"
        )
        .attr("href", financialsUrl);
    }
    if (clickedItem == "revenue_mix") {
      $(".view_detail a")
        .html(
          "View Business Breakdown <img src='https://b2b.tijorifinance.com/static/images/zerodha/arrow-circle-left.png' alt='' width='20' height='20' loading='lazy' decoding='async'>"
        )
        .attr("href", revenueMixUrl);
    }
    if (clickedItem == "overview") {
      $(".view_detail a")
        .html(
          "View more info <img src='https://b2b.tijorifinance.com/static/images/zerodha/arrow-circle-left.png' alt='' width='20' height='20' loading='lazy' decoding='async'>"
        )
        .attr("href", overviewUrl);
    }
    if (clickedItem == "events") {
      $(".view_detail a").html("");
    }
    if (clickedItem == "smallcase") {
      // hide complete footer section for smallcase
      $(".footer_sec .main_logo, .footer_sec .view_detail").hide();
      $(".footer_sec .smallcase_logo").show();
    } else {
      $(".footer_sec .main_logo, .footer_sec .view_detail").show();
      $(".footer_sec .smallcase_logo").hide();
    }
  }

  //shareholdings format shareholders row
  function format(data) {
    if (Math.abs(data) >= 1e7) {
      return `${(data / 1e7).toFixed(2)}Cr`;
    }
    if (Math.abs(data) >= 1e5) {
      return `${(data / 1e5).toFixed(2)}L`;
    }
    return data.toLocaleString("en-IN");
  }

  if ($(window).innerWidth() <= 440) {
    var $tr = $("#shareholdings table tr[data-row='no-of-shareholders']");
    var $td1 = $tr.find("td:nth-of-type(2)");
    var $td2 = $tr.find("td:nth-of-type(3)");
    $td1.empty();
    $td1.append(`<span>${format(parseInt($td1.data("raw")))}</span>`);
    $td2.empty();
    $td2.append(`<span>${format(parseInt($td2.data("raw")))}</span>`);
  }
  // read-more/less, evoting click — deferred per FRONTEND.md C13
  deferSetup(function () {
    // overview read more/less
    $(".overview_description-link.read-more").click(function () {
      $(".overview_description.short_description").hide();
      $(".overview_description.detailed_description").show();
    });
    $(".overview_description-link.read-less").click(function () {
      $(".overview_description.detailed_description").hide();
      $(".overview_description.short_description").show();
    });
    // evoting button click
    $(".evoting_link").on("click", function (e) {
      if (platform == "web") {
        window.parent.postMessage({ "type": "evoting.open" }, "*");
      } else {
        location.href = "kite://evoting";
      }
    });
    // event read more/less
    $(".description-link.read-more").click(function () {
      $(this).parents(".event_item").find(".short_description").hide();
      $(this).parents(".event_item").find(".detailed_description").show();
    });
    $(".description-link.read-less").click(function () {
      $(this).parents(".event_item").find(".short_description").show();
      $(this).parents(".event_item").find(".detailed_description").hide();
    });
  });
});
