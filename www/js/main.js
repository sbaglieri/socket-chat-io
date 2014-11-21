var $messageList = $('#messages');

var app = {
    messages: [],
    processing: false,
    init: function (isWeb) {

        if (localStorage.getItem("socketIoChatUserName")) {
            app.userName = localStorage.getItem("socketIoChatUserName");
        } else {
            app.setUsername();
        }


        //if (app.userName !== null && app.userName !== "") {
        if (!isWeb) {
            document.addEventListener('deviceready', this.connectSocket());
        } else {
            this.connectSocket();
        }
//        } else {
//            app.setUsername();
//        }

    },
    setUsername: function () {
        do {
            app.userName = prompt("Please enter your name");
        } while (app.userName === null || app.userName === "");

        localStorage.setItem("socketIoChatUserName", app.userName);
    },
    connectSocket: function () {

        app.sendNotification("Conectando...");

        var socket = io('http://baglieri.com.ar:3000/', {'sync disconnect on unload': true});

        socket.emit('username', app.userName);

        app.loadSocketEvents(socket);
    },
    loadSocketEvents: function (socket) {

        $('form').submit(function (event) {
            socket.emit('chat message', $('#m').val());
            $('#m').val('');
            return false;
        });

        $('#menu').click(function () {
            app.setUsername();
        });

        socket.on('chat message', function (msg) {
            app.setMessage(msg);
            socket.emit('username', app.userName);
        });
        socket.on('connected', function (id) {
            app.id = id;
            app.sendNotification('Conectado');
        });

        socket.on('message', function (msg) {
            app.sendNotification(msg);
        });
        socket.on('disconnect', function (msg) {
            app.sendNotification(msg);
        });
        socket.on('error', function (err) {
            if (err.description)
                $('#messages').append($('<li>').text(err.description));
            $('#messages').append($('<li>').text(err));
        });

    },
    sendNotification: function (msg) {
        app.sendMessage($('<div class="notification">').text(msg));
    },
    setMessage: function (msg) {
        app.messages.push(msg);
        if (!app.processing)
            app.showSocketMessages();
    },
    showSocketMessages: function () {
        var msg = app.messages.shift();
        app.processing = true;
        if (msg) {

            if (msg.id === app.id) {
                var li = $('<div>').append($('<span class="bubble">').text(app.getTime() + " " + msg.user + ": " + msg.msg));
            } else {
                var li = $('<div style="text-align: right;">').append($('<span class="otherbubble">').text(msg.user + ": " + msg.msg + " " + app.getTime()));
            }

            $('#messages').append(li.hide().fadeIn('slow', function () {
                $("body").animate({scrollTop: $('#messages').height() - 200}, 400, function () {
                    app.showSocketMessages();
                });
            }));
        }
        else {
            app.processing = false;
        }
    },
    sendMessage: function (element) {
        $messageList.append(element.hide().fadeIn('slow', function () {
            $("body").animate({scrollTop: $messageList.height() - 200}, 400, function () {
                app.showSocketMessages();
            });
        }));
    },
    getTime: function () {
        var d = new Date(); // for now
        var now = d.getHours(); // => 9
        now += ":" + d.getMinutes(); // =>  30
        now += ":" + d.getSeconds(); // => 51
        return now;
    }

}

if (isApp) {
    app.init(false);
} else {
    app.init(true);
}

