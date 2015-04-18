var App = React.createClass({displayName: "App",
    render: function() {
      return React.createElement("div", null, "Hello World");
    }
});
React.render(React.createElement(App, null), document.getElementById('container'));
//
