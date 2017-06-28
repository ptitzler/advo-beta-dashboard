console.log("hello");

var line1 = null;

var app = new Vue({
  el: '#wrapper',
  data: {
    latest: {
      numReadings: 0,
      temperature: 0
    },
    latestReport: {
      funnel: {
        users: 0,
        baskets: 0,
        orders:0
      },
      lastHour: {
        sumItems:0,
        sumOrders: 0
      }
    }
  },
  mounted: function() {
    // on startup
    var smoothie = new SmoothieChart({maxValue:10000,minValue:0, millisPerPixel:1000});
    smoothie.streamTo(document.getElementById("trend"));
    line1 = new TimeSeries({lineWidth:2.7});
    smoothie.addTimeSeries(line1);
  },
  methods: {
    news: function(data) {
      console.log('news', data);
      app.latest = data;
      //line1.append(data.ts, data.temperature);
    },
    report: function(data) {
      console.log('report', data);
      app.latestReport = data;
      funnelChart();
      line1.append(new Date().getTime(), app.latestReport.lastHour.sumOrders);

    }
  }
});

var funnelChart = function() {
  const funneldata = [
      ['Users', app.latestReport.funnel.users],
      ['Baskets', app.latestReport.funnel.baskets],
      ['Orders', app.latestReport.funnel.orders]
  ];
  
  const options = {
      block: {
        dynamicHeight: true,
        minHeight: 15,
        fill: {
          type: 'gradient'
        }
      },
      curve: {
        enabled: true
      }
  };
  const chart = new D3Funnel('#funnel');
  chart.draw(funneldata, options);
};

var socket = io.connect(window.location.origin);
socket.on('news', function (data) {
  app.news(data);
});
socket.on('report', function (data) {
  app.report(data);
});