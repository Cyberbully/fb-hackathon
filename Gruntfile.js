module.exports = function(grunt) {

  //Initializing the configuration object
    grunt.initConfig({

      // Task configuration
    less: {
        development: {
            options: {
              compress: true,  //minifying the result
            },
            files: {
              //compiling frontend.less into frontend.css
              "./public/assets/stylesheets/frontend.css":"./app/assets/stylesheets/frontend.less",
            }
        }
    },
    react: {
        files: {
          expand: true,
          cwd: './app/assets/javascript/',
          src: ['**/*.jsx'],
          dest: './public/assets/javascript',
          ext: '.js'
        }
    },
    watch: {
        js_frontend: {
          files: [
            //watched files
            './app/assets/javascript/app.jsx'
            ],   
          tasks: ['react:files'],     //tasks to run
          options: {
            livereload: true                        //reloads the browser
          }
        },
        less: {
          files: ['./app/assets/stylesheets/*.less'],  //watched files
          tasks: ['less'],                          //tasks to run
          options: {
            livereload: true                        //reloads the browser
          }
        },
      }
    });

  // Plugin loading
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-react');

  // Task definition
  grunt.registerTask('default', ['watch']);

};
