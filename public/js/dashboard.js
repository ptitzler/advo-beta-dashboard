console.log("hello");

var line1 = null;
var line2 = null;

var app = new Vue({
  el: '#wrapper',
  data: {
    latestReport: {
      funnel: {
        users: 0,
        baskets: 0,
        orders:0
      },
      conversion: 0,
      lastHour: {
        sumItems:0,
        sumOrders: 0
      }
    }
  },
  mounted: function() {
    // on startup
    var smoothie = new SmoothieChart({maxValue:100000,minValue:0, millisPerPixel:1000});
    smoothie.streamTo(document.getElementById("trend1"));
    line1 = new TimeSeries({lineWidth:2.7});
    smoothie.addTimeSeries(line1, { strokeStyle:'rgb(92, 184, 92)', lineWidth:3 });
    var smoothie2 = new SmoothieChart({maxValue:100,minValue:0, millisPerPixel:1000});
    smoothie2.streamTo(document.getElementById("trend2"));
    line2 = new TimeSeries({lineWidth:2.7});
    smoothie2.addTimeSeries(line2, { strokeStyle:'rgb(217, 83, 79)', lineWidth:3 });
  },
  methods: {
    report: function(data) {
      console.log('report', data);
      app.latestReport = data;
      if ( app.latestReport.funnel.baskets > 0) {
        app.conversion = Math.round(100 * app.latestReport.funnel.orders / app.latestReport.funnel.baskets)
      }
      funnelChart();
      line1.append(new Date().getTime(), app.latestReport.lastHour.sumOrders);
      line2.append(new Date().getTime(), app.conversion);
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
socket.on('report', function (data) {
  app.report(data);
});