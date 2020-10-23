const config = require("./config.js");
fs = require('fs')
path = require('path')
NodeSSH = require('node-ssh')
var Client = require('ssh2').Client;


var ssh = new NodeSSH.NodeSSH();


var hostsBackbone = [];
var hostsCustomer = [];

credentials = [
    { login: "admin", password: "vincenzo120179", port: 22 },
    { login: "admin", password: "sictorpom2010", port: 22 },
    { login: "admin", password: "sictorpom2008", port: 22 },
    { login: "admin", password: "fabiociemme", port: 22 },
    /*{ login: "admin", password: "vincenzo120179", port: 65022 },
    { login: "admin", password: "sictorpom2010", port: 65022 },
    { login: "admin", password: "sictorpom2008", port: 65022 },
    { login: "admin", password: "fabiociemme", port: 65022 },*/
]

module.exports = {
    app: {},
    database: {},

    getAllDevicesFromDb() {
        //var findCredentials=this.findCredentials();
        this.database.entities.deviceBackbone.findAll()
            .then(hsb => {
                hostsBackbone = hsb;
                this.findCredentials();
            });

        this.database.entities.deviceCustomer.findAll()
            .then(function (hsc) {
                hostsCustomer = hsc;
            });
    },
    findCredentials() {
        hostsBackbone.forEach((host) => {
            credentials.forEach(cred => {

                var conn = new Client();
                conn.on('error', error=> {
                    console.log(error);
                });

                conn.on('ready', function () {
                    console.log('Client Ok');
                    console.log(cred);
                    /*conn.exec('ping 127.0.0.1', function (err, stream) {
                        if (err) throw err;
                        stream.on('close', function (code, signal) {
                            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                            conn.end();
                        }).on('data', function (data) {
                            console.log('STDOUT: ' + data);
                        }).stderr.on('data', function (data) {
                            console.log('STDERR: ' + data);
                        });
                    });*/
                });
                
                conn.connect({
                    host: host.ipv4,
                    port: cred.port,
                    username: cred.login,
                    password: cred.password,
                    readyTimeout: 10000,
                    algorithms: {}
                })
            });
        });
    },
    dicoverCredentialsSSH(app, db) {
        this.app = app;
        this.database = db;
        this.getAllDevicesFromDb();
    }
}


/*
                ssh.connect({
                    host: host.ipv4,
                    post: cred.port,
                    username: cred.login,
                    password: cred.password
                }).then(function () {
                    ssh.exec('ping 127.0.0.1', ['--json'], {
                        onStdout(chunk) {
                            console.log('stdoutChunk', chunk.toString('utf8'))
                        },
                        onStderr(chunk) {
                            console.log('stderrChunk', chunk.toString('utf8'))
                        },
                    })
                });
            });
        });*/

/*
hostsCustomer.forEach((host) => {
});*/