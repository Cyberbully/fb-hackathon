var Router = ReactRouter
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var Toolbar = React.createClass({
  render: function() {
    var existing_events;

    if (Object.keys(this.props.user).length != 0) {
      existing_events = this.props.user.existing_events.map(function(event, index) {
        return <li key={index}><a href={"/event/" + event.id}>{event.name}</a></li>;
      });
    }

    return (

      <div className="navbar navbar-blue navbar-fixed-top">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a href="javascript: void(0)" className="navbar-brand">Time for Hoh Won</a>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
              <li><a href='#'>New Event</a></li>
              <li className="dropdown">
                <a href="#/" className="dropdown-toggle" data-toggle="dropdown" role="button">Your Events <span className="caret"></span></a>
                <ul className="dropdown-menu" role="menu">
                  {existing_events}
                </ul>
              </li>
            </ul>

            <ul className="nav navbar-nav navbar-right">
              <li><a href=""><img src={this.props.user.profile} /> {this.props.user.name}</a></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
});


var Messages = React.createClass({
  render: function() {
    return (<div></div>);
  }
});

var App = React.createClass({
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
      <div>
        <div id="loader" className={c}>
          <img id="loaderimg" src="assets/image/loader.gif"/>
        </div>
        <div className={h}>
          <div className="container">
            <RouteHandler user={this.state.user}/>
          </div>
        </div>
      </div>
    );
  }
});

var New = React.createClass({
  getInitialState: function() {
    return{show: true}
  },
  hideForm: function() {
    this.setState({show: false})
  }, 
  render: function() {
    var eventForm = <div>Thanks for creating this event!</div>;
    if (this.state.show) {
      eventForm = <NewEventForm hideForm={this.hideForm} user={this.props.user}/>;
    }

    return (
      <div>
      <Toolbar user={this.props.user}/>
        <div className="content">
          <Messages/>

          {eventForm}
        </div>
      </div>);
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


var NewEventForm = React.createClass({
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
        return <option key={index} value={event.id}>{event.name}</option>;
      });
    }
    return (
      <div>
        <div className="row">
          <div className="col-md-6 col-md-offset-3 col-sm-12">
            <div className="well">
              <div className="row">
                <div className="col-sm-12">

                  <h2 id="pickh2">New Event</h2>
                  </div>
                  </div>
                  <hr id="pickHr"/>

              <div className="row">
                <div className="col-sm-12">
                    <div className="form-group">
                      <label htmlFor="exampleInputEmail1">Event</label>
                      <select id="event" className="form-control">
                      {events}
                      </select>
                    </div>
                </div>
              </div>
                <div className="row">

                  <div className='col-md-8 col-sm-12'>
                    <div className="form-group">
                      <label htmlFor="startTime">Start Date</label>
                      <div className='input-group date' id='startTimePicker'>
                        <input type='text' id="startTime" className="form-control" />
                        <span className="input-group-addon">
                          <span className="glyphicon glyphicon-calendar"></span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='col-md-4 col-sm-12'>
                    <div className="form-group">
                      <label htmlFor="days">Days</label>
                      <input type='number' id="days" className="form-control" defaultValue="5" />
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className='col-md-8 col-sm-12'>
                    <div className="form-group">
                      <label htmlFor="beginTime">Start Time</label>
                      <div className='input-group date' id='beginTimePicker'>
                        <input type='text' id="beginTime" className="form-control" />
                        <span className="input-group-addon">
                          <span className="glyphicon glyphicon-calendar"></span>
                        </span>

                      </div>
                    </div>
                  </div>

                  <div className='col-md-4 col-sm-12'>
                    <div className="form-group">
                      <label htmlFor="hours">Hours</label>
                      <input type='number' id="hours" className="form-control" defaultValue="8" />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-12">
                  <button className="btn btn-primary pull-right" type="button" onClick={this.onClick}>Create Event</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    );
  }
});

var Pick = React.createClass({
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
      <div>
        <Toolbar user={this.props.user}/>
        <div className="content">
        <Messages/>
        <EventPickBox sendData={this.sendData} table={this.state.table} user={this.props.user}/>
        </div>
      </div>
    );
  }
});

var EventPickBox = React.createClass({
  onClick: function() {
    $("#saveTable").attr('disabled', true).html("Saving");
    this.props.sendData(this.refs['table'].generateData());
  },
  render: function() {
      return (
        <div className="well clearfix">
          <div className="row">
            <div className="col-sm-12">
              <h2><a href={"https://www.facebook.com/events/" + this.props.table.event_id} target="_blank">{this.props.table.name}</a> <small>by {this.props.table.owner}</small></h2>
            </div>
          </div>
          <hr id="pickHr"/>
          <div className="row">
            <div className="col-sm-12">
              <EventPickTable ref="table" table={this.props.table} user={this.props.user} />
              <div className="pull-left" id="selectText">Select the times that you are available by clicking or dragging on the table.</div>
              <button className="btn btn-primary pull-right" id="saveTable" type="button" onClick={this.onClick}>Save Preferences</button>
            </div>
          </div>
        </div>
      );
  }
})


var EventPickTable = React.createClass({
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
        rows.push(<EventPickRow ref={'row' + i} row_index={i} key={i} table={this.props.table} user={this.props.user}/>)
      }

      return (
            <table id="timePicker" className="table table-bordered">
              <thead>
              <EventPickHeaderRow table={this.props.table}/>
              </thead>
              <tbody>
              {rows}
              </tbody>
            </table>
      );
    }
});


var EventPickHeaderRow = React.createClass({
  render: function() {
    var cells = [];
    for (var i=0;i<this.props.table.days;i++) {
      var day = this.props.table.start_day;
      var day2 = moment(day).add(i, 'days').format("ddd D MMM");
      cells.push(<th key={i}>{day2}</th>)
    }
    return <tr>{cells}</tr>
  }
})


var EventPickRow = React.createClass({ 
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

      cells.push(<EventPickCell ref={"cell" + i} index={i} row_index={this.props.row_index} day={day2} key={i} table={this.props.table} user={this.props.user} />)
    }
    return <tr>{cells}</tr>
  }
})

var EventPickCell = React.createClass({
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
  return <td className={highlighted} id={'cell' + this.props.row_index + 'x' + this.props.index}>{hour_str}<ColorSquare time={thistime} id_to_name={this.props.table.id_to_name} entries={this.props.table.entries} /></td>
    }
});

var ColorSquare = React.createClass({
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
    return <div role="button" className={classes} data-toggle="popover" data-trigger="hover" title={percentage + '% can make it!'} data-html="true" data-content={attendingUsers}></div>
  }
})


var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="pick" app={App} handler={Pick}/>
    <DefaultRoute handler={New}/>
  </Route>
);
//

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});




