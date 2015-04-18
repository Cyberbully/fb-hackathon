var Router = ReactRouter
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var Toolbar = React.createClass({displayName: "Toolbar",
  render: function() {
    var existing_events;

    if (Object.keys(this.props.user).length != 0) {
      existing_events = this.props.user.existing_events.map(function(event, index) {
        return React.createElement("li", {key: index}, React.createElement("a", {href: "#pick?event=" + event.id}, event.name));
      });
    }

    return (

      React.createElement("div", {className: "navbar navbar-blue navbar-fixed-top"}, 
        React.createElement("div", {className: "container-fluid"}, 
          React.createElement("div", {className: "navbar-header"}, 
            React.createElement("button", {type: "button", className: "navbar-toggle collapsed", "data-toggle": "collapse", "data-target": "#navbar", "aria-expanded": "false", "aria-controls": "navbar"}, 
              React.createElement("span", {className: "sr-only"}, "Toggle navigation"), 
              React.createElement("span", {className: "icon-bar"}), 
              React.createElement("span", {className: "icon-bar"}), 
              React.createElement("span", {className: "icon-bar"})
            ), 
            React.createElement("a", {href: "javascript: void(0)", className: "navbar-brand"}, "Time for Hoh Won")
          ), 
          React.createElement("div", {id: "navbar", className: "navbar-collapse collapse"}, 
            React.createElement("ul", {className: "nav navbar-nav"}, 
              React.createElement("li", null, React.createElement("a", {href: "#"}, "New Event")), 
              React.createElement("li", {class: "dropdown"}, 
                React.createElement("a", {href: "#/", className: "dropdown-toggle", "data-toggle": "dropdown", role: "button"}, "Your Events ", React.createElement("span", {className: "caret"})), 
                React.createElement("ul", {className: "dropdown-menu", role: "menu"}, 
                  existing_events
                )
              )
            ), 

            React.createElement("ul", {className: "nav navbar-nav navbar-right"}, 
              React.createElement("li", null, React.createElement("a", {href: ""}, React.createElement("img", {src: this.props.user.profile}), " ", this.props.user.name))
            )
          )
        )
      )
    );
  }
});


var Messages = React.createClass({displayName: "Messages",
  render: function() {
    return (React.createElement("div", null));
  }
});

var App = React.createClass({displayName: "App",
  getInitialState: function() {
    return {user: {}, loading: true}
  },
  componentDidMount: function() {
    var self = this;
    ajaxDo('GET', '/details', null,
      function(data) {
        if (data.ok) {
          self.setState({user: data.user});
        }
        self.setState({loading:false})
      },
      function(xhr, status, error) {
      
      }
    )
  },
  render: function () {
    
    if (this.state.loading) {
      var h = 'hide';
      var c = 'vertical-center' 
    } else {
      var c = 'hide';
    }

    return (
      React.createElement("div", null, 
        React.createElement("div", {id: "loader", className: c}, 
          React.createElement("img", {id: "loaderimg", src: "assets/image/loader.gif"})
        ), 
        React.createElement("div", {className: h}, 
          React.createElement("div", {className: "container"}, 
            React.createElement(RouteHandler, {user: this.state.user})
          )
        )
      )
    );
  }
});

var New = React.createClass({displayName: "New",
  getInitialState: function() {
    return{show: true}
  },
  hideForm: function() {
    this.setState({show: false})
  }, 
  render: function() {
    var eventForm = React.createElement("div", null, "Thanks for creating this event!");
    if (this.state.show) {
      eventForm = React.createElement(NewEventForm, {hideForm: this.hideForm, user: this.props.user});
    }

    return (
      React.createElement("div", null, 
      React.createElement(Toolbar, {user: this.props.user}), 
        React.createElement("div", {className: "content"}, 
          React.createElement(Messages, null), 

          eventForm
        )
      ));
  }
})

function ajaxDo(method, endpoint, data, success, error) {
  $.ajax({
    url: "http://fb.jcaw.me/api" + endpoint,
    dataType: 'json',
    type: method,
    data: data,
    success: success.bind(this),
    error: error.bind(this)
  });
}


var NewEventForm = React.createClass({displayName: "NewEventForm",
  contextTypes: {
    router: React.PropTypes.func
  },
  onClick: function() {

    var startDate = $('#startTimePicker').data("DateTimePicker").date();
    var endDate = $('#days').val();
    var startTime = $('#beginTimePicker').data("DateTimePicker").date();

    if (!startDate || !endDate) {
      alert("Please enter a time for the start and the end");
      return false;
    }

    var data = {
      event_id: $('#event').val().toString(),
      start_date: moment(startDate).unix().toString(),
      start_time: moment(startTime).unix().toString(),
      end_time: $('#hours').val().toString(),
      days: $('#days').val(),
      frequency: "60"
    }
    var self = this;
    ajaxDo('POST', '/create', JSON.stringify(data),
        function(data) {
            self.context.router.transitionTo('/pick?event='+data.event_id)
        },
        function(xhr, status, err) {
            console.error(status, err);
        }
    );
  },
  componentDidMount: function() {
    $('#startTimePicker').datetimepicker({
      defaultDate: new Date(),
      format: 'DD/MM/YYYY'
    });
    $('#beginTimePicker').datetimepicker({
      defaultDate: new Date(1970, 0, 0, 9, 0, 0, 0),
      format: 'LT'
    });
  },
  render: function () {
    var events;
    
    if (Object.keys(this.props.user).length != 0) {
      events = this.props.user.events.map(function(event, index) {
        return React.createElement("option", {key: index, value: event.id}, event.name);
      });
    }
    return (
      React.createElement("div", null, 
        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-md-6 col-md-offset-3 col-sm-12"}, 
            React.createElement("div", {className: "well"}, 
              React.createElement("div", {className: "row"}, 
                React.createElement("div", {className: "col-sm-12"}, 

                  React.createElement("h2", {id: "pickh2"}, "New Event")
                  )
                  ), 
                  React.createElement("hr", {id: "pickHr"}), 

              React.createElement("div", {className: "row"}, 
                React.createElement("div", {className: "col-sm-12"}, 
                    React.createElement("div", {className: "form-group"}, 
                      React.createElement("label", {htmlFor: "exampleInputEmail1"}, "Event"), 
                      React.createElement("select", {id: "event", className: "form-control"}, 
                      events
                      )
                    )
                )
              ), 
                React.createElement("div", {className: "row"}, 

                  React.createElement("div", {className: "col-md-8 col-sm-12"}, 
                    React.createElement("div", {className: "form-group"}, 
                      React.createElement("label", {htmlFor: "startTime"}, "Start Date"), 
                      React.createElement("div", {className: "input-group date", id: "startTimePicker"}, 
                        React.createElement("input", {type: "text", id: "startTime", className: "form-control"}), 
                        React.createElement("span", {className: "input-group-addon"}, 
                          React.createElement("span", {className: "glyphicon glyphicon-calendar"})
                        )
                      )
                    )
                  ), 

                  React.createElement("div", {className: "col-md-4 col-sm-12"}, 
                    React.createElement("div", {className: "form-group"}, 
                      React.createElement("label", {htmlFor: "days"}, "Days"), 
                      React.createElement("input", {type: "number", id: "days", className: "form-control", defaultValue: "5"})
                    )
                  )
                ), 
                
                React.createElement("div", {className: "row"}, 
                  React.createElement("div", {className: "col-md-8 col-sm-12"}, 
                    React.createElement("div", {className: "form-group"}, 
                      React.createElement("label", {htmlFor: "beginTime"}, "Start Time"), 
                      React.createElement("div", {className: "input-group date", id: "beginTimePicker"}, 
                        React.createElement("input", {type: "text", id: "beginTime", className: "form-control"}), 
                        React.createElement("span", {className: "input-group-addon"}, 
                          React.createElement("span", {className: "glyphicon glyphicon-calendar"})
                        )

                      )
                    )
                  ), 

                  React.createElement("div", {className: "col-md-4 col-sm-12"}, 
                    React.createElement("div", {className: "form-group"}, 
                      React.createElement("label", {htmlFor: "hours"}, "Hours"), 
                      React.createElement("input", {type: "number", id: "hours", className: "form-control", defaultValue: "8"})
                    )
                  )
                ), 

                React.createElement("div", {className: "row"}, 
                  React.createElement("div", {className: "col-sm-12"}, 
                  React.createElement("button", {className: "btn btn-primary pull-right", type: "button", onClick: this.onClick}, "Create Event")
                  )
                )
              )
            )
          )
      )
    );
  }
});

var Pick = React.createClass({displayName: "Pick",
  contextTypes: {
    router: React.PropTypes.func
  },
  generateData: function() {
    var data = this.state.data;
    var start = moment.unix(data.event.start_date);
    var table = {
      start_hour: moment.unix(data.event.start_time).get('hour'),
      hours: parseInt(data.event.end_time),
      start_day: start,
      entries: data.event.entries,
      name: data.event.name,
      event_id: data.event.event_id,
      owner: data.event.owner,
      cover: data.event.cover,
      location: data.location,
      id_to_name: data.event.id_to_name,
      days: parseInt(data.event.days)
    };
    this.setState({table:table})

  },
  componentDidMount: function() {
    var id = this.context.router.getCurrentQuery().event;
    this.setState({id:id});
    var self = this;
    ajaxDo('GET', '/event/' + id, null,
      function(data) {
        self.setState({data:data});
        self.generateData();
      },
      function(xhr, status, error) {
        
      }
    );
  },
  sendData: function(data) {
    var merged = [];
    merged = merged.concat.apply(merged, data);
    ajaxDo('POST', '/event/' + this.state.id + '/preference', JSON.stringify({"preferences":merged}),
          function(data) {
            $("#saveTable").html("Save Preferences").attr('disabled', false);
          },
          function(xhr, status, error) {
            console.log(error);
          });
  },
  getInitialState: function() {
    return {table: {}, show: true};
  },
  render: function () {
    return (
      React.createElement("div", null, 
        React.createElement(Toolbar, {user: this.props.user}), 
        React.createElement("div", {className: "content"}, 
        React.createElement(Messages, null), 
        React.createElement(EventPickBox, {sendData: this.sendData, table: this.state.table, user: this.props.user})
        )
      )
    );
  }
});

var EventPickBox = React.createClass({displayName: "EventPickBox",
  onClick: function() {
    $("#saveTable").attr('disabled', true).html("Saving");
    this.props.sendData(this.refs['table'].generateData());
  },
  render: function() {
      return (
        React.createElement("div", {className: "well clearfix"}, 
          React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: "col-sm-12"}, 
              React.createElement("h2", null, React.createElement("a", {href: "https://www.facebook.com/events/" + this.props.table.event_id, target: "_blank"}, this.props.table.name), " ", React.createElement("small", null, "by ", this.props.table.owner))
            )
          ), 
          React.createElement("hr", {id: "pickHr"}), 
          React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: "col-sm-12"}, 
              React.createElement(EventPickTable, {ref: "table", table: this.props.table, user: this.props.user}), 
              React.createElement("div", {className: "pull-left", id: "selectText"}, "Select the times that you are available by clicking or dragging on the table."), 
              React.createElement("button", {className: "btn btn-primary pull-right", id: "saveTable", type: "button", onClick: this.onClick}, "Save Preferences")
            )
          )
        )
      );
  }
})


var EventPickTable = React.createClass({displayName: "EventPickTable",
    generateData: function() {
      var data = [];
      for (var item in this.refs) {
        data.push(this.refs[item].generateData());
      }
      return data;
    },
    render: function() {
      var rows = [];
      for (var i=0;i<this.props.table.hours;i++) {
        rows.push(React.createElement(EventPickRow, {ref: 'row' + i, row_index: i, key: i, table: this.props.table, user: this.props.user}))
      }

      return (
            React.createElement("table", {id: "timePicker", className: "table table-bordered"}, 
              React.createElement("thead", null, 
              React.createElement(EventPickHeaderRow, {table: this.props.table})
              ), 
              React.createElement("tbody", null, 
              rows
              )
            )
      );
    }
});


var EventPickHeaderRow = React.createClass({displayName: "EventPickHeaderRow",
  render: function() {
    var cells = [];
    for (var i=0;i<this.props.table.days;i++) {
      var day = this.props.table.start_day;
      var day2 = moment(day).add(i, 'days').format("ddd D MMM");
      cells.push(React.createElement("th", {key: i}, day2))
    }
    return React.createElement("tr", null, cells)
  }
})


var EventPickRow = React.createClass({displayName: "EventPickRow", 
  generateData: function() {
      var data = [];
      for (var item in this.refs) {
        var item = this.refs[item].generateData();
        if (item) {
        data.push(item);
        }
      }
      return data;
  },
  render: function() {
    var cells = [];
    for (var i=0;i<this.props.table.days;i++) {
      var day = this.props.table.start_day;
      var day2 = moment(day).add(i, 'days');

      cells.push(React.createElement(EventPickCell, {ref: "cell" + i, index: i, row_index: this.props.row_index, day: day2, key: i, table: this.props.table, user: this.props.user}))
    }
    return React.createElement("tr", null, cells)
  }
})

var EventPickCell = React.createClass({displayName: "EventPickCell",
  generateData: function() {
    if(!$('#cell' + this.props.row_index + 'x' + this.props.index).hasClass('highlighted')) {
      return false;
    }
    var i = moment(this.props.day).add(this.props.row_index+this.props.table.start_hour, 'hours').unix();
    return i;
  },
  render: function() {
    var highlighted = '';
    var thistime = moment(this.props.day).add(this.props.row_index+this.props.table.start_hour, 'hours').unix();
    if(Object.keys(this.props.user).length > 0) {
      var entries = this.props.table.entries[this.props.user.id];
      if(entries && entries.indexOf(thistime) > -1) {
        highlighted = 'highlighted';
      }
    }

    var hour = this.props.row_index + this.props.table.start_hour;
    var hour_str;
    if (hour < 12) {
        if (hour == 0) {
            hour = 12;
        }
        hour_str = hour + 'am';
    } else {
        if (hour > 12) {
            hour -= 12;
        }
        hour_str = hour + 'pm';
    }
  return React.createElement("td", {className: highlighted, id: 'cell' + this.props.row_index + 'x' + this.props.index}, hour_str, React.createElement(ColorSquare, {time: thistime, id_to_name: this.props.table.id_to_name, entries: this.props.table.entries}))
    }
});

var ColorSquare = React.createClass({displayName: "ColorSquare",
  componentDidMount: function() {
    $('.colorSquare').popover({
      placement: 'left'
    });
  },
  render: function() {
    var total = 0;
    var picked = 0;
    var attendingUsers = '<ul class="listgroup">';
    var entries = this.props.entries;
    var self = this;
    for (var key in entries) {
      if(entries[key] && entries[key].indexOf(self.props.time) > -1) {
        picked++;
        attendingUsers = attendingUsers + '<li>'+ this.props.id_to_name[key] + '</li>';
      }
      total++;
    }
    
    var percentage = Math.round((picked/total) * 100);
    if (isNaN(percentage)) {
      percentage = 0;
    }
    var classes = "colorSquare pull-right attend_" + percentage;
    if (attendingUsers == '<ul class="listgroup">') {
      attendingUsers = "No one yet :(";
    } else {
      attendingUsers = attendingUsers + '<ul/>';
    }
    return React.createElement("div", {role: "button", className: classes, "data-toggle": "popover", "data-trigger": "hover", title: percentage + '% can make it!', "data-html": "true", "data-content": attendingUsers})
  }
})


var routes = (
  React.createElement(Route, {name: "app", path: "/", handler: App}, 
    React.createElement(Route, {name: "pick", app: App, handler: Pick}), 
    React.createElement(DefaultRoute, {handler: New})
  )
);
//

Router.run(routes, function (Handler) {
  React.render(React.createElement(Handler, null), document.body);
});




