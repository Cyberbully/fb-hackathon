var Router = ReactRouter
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;




var Toolbar = React.createClass({
  render: function() {
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
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
            {/*<li><Link to="app">Home</Link></li>
              <li><Link to="new">New</Link></li>*/}
              <li><Link to="pick">Pick</Link></li>
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
    return {user: {}}
  },
  componentDidMount: function() {
    var self = this;
    ajaxDo('GET', '/details', null,
      function(data) {
        if (data.ok) {
          self.setState({user: data.user});
        } 
      },
      function(xhr, status, error) {
      
      }
    )
  },
  render: function () {
    return (
      <div className="container">
        {/* this is the important part */}
        <RouteHandler user={this.state.user}/>
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
    if(!startDate || !endDate) {
      alert("Pleas enter a time for the start and the end");
      return false;
    }

    var data = {
      event_id: $('#event').val().toString(),
      start_date: moment.utc(startDate).unix().toString(),
      days: $('#days').val(),
      frequency: "60"
    }
    var self = this;
   ajaxDo('POST', '/create', JSON.stringify(data),
    function(data) {
        alert("Done!");
        self.context.router.transitionTo('/pick?event='+data.event_id)
      },
      function(xhr, status, err) {
        console.error(status, err);
      }
    );
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
                      <input type='number' id="days" className="form-control" value="5" />
                    </div>
                  </div>
                </div>
                {/*}<div className="row">
                  <div className='col-sm-12'>
                    <div className="form-group">
                      <label htmlFor="timeslots">Timeslot Duration (minutes)</label>
                      <input type='number' id="timeslots" className="form-control" value="60" disabled/>
                    </div>
                  </div>
                </div>*/}
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
    console.log('start_date: ' + data.event.start_date);
    console.log('start date thru moment.unix: ' + start.format("YYYY MM DD HH"));
    var table = {
      start_hour: 9,
      hours: 8,
      start_day: start,
      entries: data.event.entries,
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
        console.log(data);
      },
      function(xhr, status, error) {
        
      }
    );
  },
  sendData: function(data) {
    var merged = [];
    merged = merged.concat.apply(merged, data);
    console.log(merged);
    {/*ajaxDo('POST', '/event/' + this.state.id + '/preference', JSON.stringify({"preferences":merged}),
          function(data) {
            console.log(data);
          },
          function(xhr, status, error) {
            console.log(error);
          });*/}
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
    this.props.sendData(this.refs['table'].generateData());
  },
  render: function() {
      return (
        <div className="well clearfix">
          <EventPickTable ref="table" table={this.props.table} user={this.props.user} />
          <div className="row">
            <div className="col-sm-12">
              <button className="btn btn-primary pull-right" type="button" onClick={this.onClick}>Save Preferences</button>
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
      for (var i=0;i<=this.props.table.hours;i++) {
        rows.push(<EventPickRow ref={'row' + i} row_index={i} key={i} table={this.props.table} user={this.props.user}/>)
      }

      return (
        <div className="row">
          <div className="col-sm-12">
            <table id="timePicker" className="table table-bordered">
              <thead>
              <EventPickHeaderRow table={this.props.table}/>
              </thead>
              <tbody>
              {rows}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
});


var EventPickHeaderRow = React.createClass({
  render: function() {
    var cells = [];
    for (var i=0;i<=this.props.table.days;i++) {
      var day = this.props.table.start_day;
      var day2 = moment(day).add(i, 'days').format("ddd D MMM YYYY");
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
    for (var i=0;i<=this.props.table.days;i++) {
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
    var i = this.props.day.add(this.props.row_index+this.props.table.start_hour, 'hours').unix();
    console.log(i);
    console.log(this.props.day.format("YYYY MM DD HH"));
    return i;
  },
  render: function() {
    var highlighted = '';
    if(Object.keys(this.props.user).length > 0) {
      var entries = this.props.table.entries[this.props.user.id];
      var thistime = this.props.day.add(this.props.row_index+this.props.table.start_hour, 'hours').format('x');
      if(entries && entries.indexOf(thistime) > -1) {
        highlighted = 'highlighted';
      }
    }
    return <td className={highlighted} id={'cell' + this.props.row_index + 'x' + this.props.index}>{this.props.row_index + this.props.table.start_hour}</td>
  }});




var Dashboard = React.createClass({
  render: function () {
    return (
      <div>
        <Toolbar user={this.props.user}/>
        <div className="content">
          <Messages/>
        </div>
      </div>
    );
  }
});

var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="new" app={App} handler={New}/>
    <Route name="pick" app={App} handler={Pick}/>
    <DefaultRoute handler={Dashboard}/>
  </Route>
);
//

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});




